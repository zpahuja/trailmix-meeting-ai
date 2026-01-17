const axios = require('axios');
const OpenAI = require('openai');

const MINO_API_BASE = 'https://mino.ai/v1/automation';
const MINO_API_KEY = process.env.MINO_API_KEY || 'sk-mino-cWSgb9FXhPNiKvUzX-1M-QGt_sFUbV8s';

// Lazy-initialize OpenAI client to ensure env vars are loaded
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENROUTER_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('No OpenAI API key found. Please set OPENROUTER_KEY or OPENAI_API_KEY in .env file');
    }

    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://recall.ai",
        "X-Title": "Trailmix Meeting AI"
      }
    });
  }
  return openai;
}

/**
 * Build a detailed goal prompt for Mino.ai based on the user's sector query
 * @param {string} query - The user's search query (e.g., "healthcare AI" or "cybersecurity defense")
 * @returns {string} Detailed goal for the Tinyfish agent
 */
function buildGoalPrompt(query) {
  // Create a comprehensive, sector-specific goal for the agent
  const goal = `
You are searching SAM.gov for B2G (Business-to-Government) procurement opportunities.

USER'S SECTOR/QUERY: "${query}"

TASK:
1. Navigate to https://sam.gov/search
2. Search for opportunities related to: ${query}
3. For EACH opportunity found, extract the following information:
   - Contract/Opportunity Name (required)
   - Detail URL / Link to full posting (required)
   - Contract Value / Size of Bid / Dollar Amount (if available)
   - Contact Email / Point of Contact (if available)
   - Deadline / Response Due Date / Closing Date (if available)
   - Brief Description / Synopsis (if available)
   - Agency Name / Department (if available)
   - NAICS Code (if available)
   - Set-Aside Type (Small Business, etc.) (if available)

4. Return results as a JSON array of opportunities with these fields:
   {
     "name": "string",
     "detail_url": "string",
     "size_of_bid": "string",
     "contact_email": "string",
     "deadline": "string",
     "description": "string",
     "agency": "string",
     "naics_code": "string",
     "set_aside": "string"
   }

5. Try to find at least 5-10 relevant opportunities if available
6. Focus on ACTIVE opportunities (not expired or archived)
7. If the search query is sector-specific (e.g., "healthcare", "cybersecurity"),
   use relevant keywords and filters on SAM.gov

IMPORTANT: Return ONLY opportunities that match the user's sector/query: "${query}"
`.trim();

  return goal;
}

/**
 * Run Mino.ai automation to scrape SAM.gov for B2G procurement opportunities
 * @param {string} query - The search query (user's sector or keywords)
 * @param {Function} progressCallback - Callback for progress updates (streaming)
 * @returns {Promise<{results: Array}>}
 */
async function researchQuery(query, progressCallback) {
  try {
    progressCallback({
      status: 'starting',
      message: `Initializing Tinyfish agent for sector: "${query}"...`
    });

    // Build detailed goal prompt based on user's query
    const goal = buildGoalPrompt(query);

    const response = await axios({
      method: 'POST',
      url: `${MINO_API_BASE}/run-sse`,
      headers: {
        'X-API-Key': MINO_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        url: 'https://sam.gov/search',
        goal: goal,
        browser_profile: 'lite',
        proxy_config: {
          enabled: true,
          country_code: 'US'
        }
      },
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let buffer = '';
      let results = [];
      let runId = null;

      response.data.on('data', (chunk) => {
        buffer += chunk.toString();

        // Process complete SSE events
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        events.forEach(event => {
          if (!event.trim()) return;

          // Parse SSE format: "data: {...}"
          const lines = event.split('\n');
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));

                // Handle different event types
                if (data.type === 'run_started') {
                  runId = data.run_id;
                  progressCallback({
                    status: 'running',
                    message: `Agent started (Run ID: ${runId})`,
                    runId: runId
                  });
                }
                else if (data.type === 'step_update') {
                  progressCallback({
                    status: 'running',
                    message: data.step_description || 'Processing...',
                    step: data.step_number,
                    totalSteps: data.total_steps
                  });
                }
                else if (data.type === 'page_update') {
                  progressCallback({
                    status: 'running',
                    message: `Navigating: ${data.url || 'Next page'}`,
                    url: data.url
                  });
                }
                else if (data.type === 'data_extracted') {
                  // Data was extracted, might contain results
                  if (data.extracted_data) {
                    progressCallback({
                      status: 'extracting',
                      message: 'Extracting procurement opportunities...'
                    });

                    // Parse extracted data
                    try {
                      const extracted = typeof data.extracted_data === 'string'
                        ? JSON.parse(data.extracted_data)
                        : data.extracted_data;

                      // Handle different data structures
                      if (Array.isArray(extracted)) {
                        results = extracted;
                      } else if (extracted.opportunities) {
                        results = extracted.opportunities;
                      } else if (extracted.contracts) {
                        results = extracted.contracts;
                      } else if (extracted.results) {
                        results = extracted.results;
                      }
                    } catch (e) {
                      console.error('Error parsing extracted data:', e);
                    }
                  }
                }
                else if (data.type === 'run_completed') {
                  progressCallback({
                    status: 'completed',
                    message: `Research completed! Found ${results.length} opportunities.`
                  });
                }
                else if (data.type === 'error') {
                  progressCallback({
                    status: 'error',
                    message: data.error || 'An error occurred'
                  });
                }
                else if (data.type === 'log') {
                  // Agent log message
                  progressCallback({
                    status: 'running',
                    message: data.message || 'Processing...'
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          });
        });
      });

      response.data.on('end', () => {
        // Normalize results to consistent format
        const normalizedResults = results.map(result => normalizeResult(result));

        resolve({
          success: true,
          results: normalizedResults,
          metadata: {
            runId: runId,
            totalResults: normalizedResults.length,
            source: 'SAM.gov via Mino.ai'
          }
        });
      });

      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        reject({
          success: false,
          error: error.message
        });
      });
    });

  } catch (error) {
    console.error('Error running Mino automation:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Normalize result data to consistent format
 * @param {Object} result - Raw result from Mino.ai
 * @returns {Object} Normalized result
 */
function normalizeResult(result) {
  // Handle various possible field names
  const normalized = {
    title: result.name || result.title || result.contract_name || result.opportunity_name || 'Untitled',
    description: result.description || result.details || result.summary || result.synopsis || '',
    url: result.detail_url || result.url || result.link || result.opportunity_url || '',
    amount: result.size_of_bid || result.amount || result.contract_value || result.value || result.dollar_amount || '',
    deadline: result.deadline || result.due_date || result.closing_date || result.response_date || '',
    contact_email: result.contact_email || result.email || result.contact || result.poc_email || '',
    agency: result.agency || result.department || result.agency_name || '',
    naics_code: result.naics_code || result.naics || '',
    set_aside: result.set_aside || result.set_aside_type || '',
    source: 'SAM.gov',
    // Preserve original fields for debugging
    _raw: result
  };

  return normalized;
}

/**
 * Alternative: Run non-streaming automation (simpler but no progress updates)
 * @param {string} query - The search query (user's sector or keywords)
 * @returns {Promise<{results: Array}>}
 */
async function researchQuerySimple(query) {
  try {
    // Use the same detailed goal prompt
    const goal = buildGoalPrompt(query);

    const response = await axios({
      method: 'POST',
      url: `${MINO_API_BASE}/run`,
      headers: {
        'X-API-Key': MINO_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        url: 'https://sam.gov/search',
        goal: goal,
        browser_profile: 'lite',
        proxy_config: {
          enabled: true,
          country_code: 'US'
        }
      },
      timeout: 120000 // 2 minute timeout
    });

    const results = response.data.extracted_data || response.data.results || [];
    const normalizedResults = Array.isArray(results)
      ? results.map(r => normalizeResult(r))
      : [];

    return {
      success: true,
      results: normalizedResults,
      metadata: {
        runId: response.data.run_id,
        totalResults: normalizedResults.length,
        source: 'SAM.gov via Mino.ai'
      }
    };

  } catch (error) {
    console.error('Error running Mino automation:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Generate email follow-up message based on research results
 * @param {Array} results - Research results
 * @param {Object} options - Email generation options
 * @returns {string} Email message
 */
function generateFollowUpEmail(results, options = {}) {
  const {
    recipientName = 'there',
    senderName = '',
    companyName = '',
    includeCallToAction = true
  } = options;

  if (!results || results.length === 0) {
    return 'No results found to generate email.';
  }

  // Build email content
  let email = `Hi ${recipientName},\n\n`;
  email += `I hope this message finds you well. `;
  email += `I wanted to share some interesting insights I've gathered regarding B2G procurement opportunities from SAM.gov`;
  if (companyName) {
    email += ` that may be relevant to ${companyName}`;
  }
  email += `.\n\n`;

  email += `**Key Findings:**\n\n`;

  // Add top results
  results.slice(0, 5).forEach((result, index) => {
    email += `${index + 1}. **${result.title}**\n`;

    if (result.description) {
      const desc = result.description.substring(0, 200);
      email += `   ${desc}${result.description.length > 200 ? '...' : ''}\n`;
    }

    if (result.url) {
      email += `   [View Details](${result.url})\n`;
    }

    if (result.amount) {
      email += `   Contract Value: ${result.amount}\n`;
    }

    if (result.deadline) {
      email += `   Deadline: ${result.deadline}\n`;
    }

    if (result.contact_email) {
      email += `   Contact: ${result.contact_email}\n`;
    }

    email += `\n`;
  });

  if (includeCallToAction) {
    email += `I believe these opportunities align well with your strategic goals. `;
    email += `Would you be available for a brief call this week to discuss how we might approach these opportunities together?\n\n`;
  }

  email += `Looking forward to hearing from you.\n\n`;
  email += `Best regards`;
  if (senderName) {
    email += `,\n${senderName}`;
  }

  return email;
}

/**
 * Generate AI-powered personalized emails for each contact
 * @param {Object} meetingData - Meeting data with participants
 * @param {Object} contact - Individual contact/participant
 * @param {string} emailType - Type of email (followup, reminder, summary, etc.)
 * @returns {Promise<Object>} Generated email with subject and body
 */
async function generateAIEmail(meetingData, contact, emailType = 'followup') {
  const emailTypePrompts = {
    followup: 'a professional follow-up email thanking them for attending and summarizing key points',
    reminder: 'a friendly reminder email about the upcoming meeting',
    summary: 'a comprehensive meeting summary with action items',
    action_items: 'an email focused on their specific action items and deadlines',
    status_update: 'a status update email on project progress since the meeting'
  };

  const prompt = `Generate ${emailTypePrompts[emailType]} for the following meeting and participant:

Meeting Details:
- Title: ${meetingData.title}
- Type: ${meetingData.type}
- Date: ${meetingData.date}
- Time: ${meetingData.time}
- Location: ${meetingData.location}
- Organizer: ${meetingData.organizer}

Participant:
- Name: ${contact.participant_name}
- Email: ${contact.participant_email}
- Role: ${contact.role}
- Attendance: ${contact.attendance_status}

${meetingData.followup ? `Action Items:
- Task: ${meetingData.followup.task_description}
- Assigned to: ${meetingData.followup.assigned_to}
- Due date: ${meetingData.followup.due_date}
- Priority: ${meetingData.followup.priority}
- Status: ${meetingData.followup.status}` : ''}

Generate a professional email with:
1. Subject line (concise, under 60 characters)
2. Personalized greeting using their name
3. Meeting context relevant to their role
4. ${emailType === 'action_items' ? 'Their specific action items with clear deadlines' : 'Key takeaways from the meeting'}
5. Professional closing

Format as JSON:
{
  "subject": "...",
  "body": "..."
}`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "anthropic/claude-3.7-sonnet",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error generating AI email:', error);
    // Fallback to template-based email
    return {
      subject: `${emailType === 'followup' ? 'Follow-up:' : 'Update:'} ${meetingData.title}`,
      body: `Dear ${contact.participant_name},\n\nThank you for ${contact.attendance_status === 'attended' ? 'attending' : 'your interest in'} ${meetingData.title} on ${meetingData.date}.\n\nBest regards,\n${meetingData.organizer}`
    };
  }
}

/**
 * Generate a scheduled email timeline for a contact (5+ emails)
 * @param {Object} meetingData - Meeting data
 * @param {Object} contact - Individual contact/participant
 * @returns {Promise<Array>} Array of scheduled emails with timestamps
 */
async function generateEmailTimeline(meetingData, contact) {
  const timeline = [];
  const meetingDate = new Date(meetingData.date);

  // Email schedule types with relative timing
  const scheduleTypes = [
    { type: 'followup', daysAfter: 0, label: 'Immediate Follow-up' },
    { type: 'action_items', daysAfter: 2, label: '2-Day Check-in' },
    { type: 'status_update', daysAfter: 7, label: '1-Week Progress Update' },
    { type: 'reminder', daysAfter: 12, label: 'Deadline Reminder' },
    { type: 'summary', daysAfter: 14, label: '2-Week Summary' },
    { type: 'followup', daysAfter: 21, label: '3-Week Follow-up' }
  ];

  console.log(`Generating ${scheduleTypes.length} emails for ${contact.participant_name}...`);

  for (const schedule of scheduleTypes) {
    const scheduledDate = new Date(meetingDate);
    scheduledDate.setDate(scheduledDate.getDate() + schedule.daysAfter);

    const email = await generateAIEmail(meetingData, contact, schedule.type);

    timeline.push({
      emailNumber: timeline.length + 1,
      type: schedule.type,
      label: schedule.label,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      daysAfterMeeting: schedule.daysAfter,
      recipient: {
        name: contact.participant_name,
        email: contact.participant_email,
        role: contact.role
      },
      subject: email.subject,
      body: email.body
    });
  }

  return timeline;
}

module.exports = {
  researchQuery,
  researchQuerySimple,
  generateFollowUpEmail,
  buildGoalPrompt,
  normalizeResult,
  generateAIEmail,
  generateEmailTimeline
};
