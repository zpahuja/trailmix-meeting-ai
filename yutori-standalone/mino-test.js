#!/usr/bin/env node

/**
 * Mino.ai Streaming Agent Test
 * Tests the Mino.ai API with real-time streaming updates
 */

const axios = require('axios');

const MINO_API_KEY = 'sk-mino-cWSgb9FXhPNiKvUzX-1M-QGt_sFUbV8s';
const SEARCH_QUERY = process.argv[2] || 'cloud security procurement government contract';

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'bright');
  console.log('='.repeat(70));
}

async function testMinoStreaming() {
  console.clear();
  log('\n🤖 MINO.AI STREAMING AGENT TEST', 'bright');
  log('SAM.gov B2G Procurement Research\n', 'cyan');

  logSection('📤 Starting Mino.ai Agent');

  log(`Search Query: "${SEARCH_QUERY}"`, 'blue');
  log('Target: https://sam.gov/search', 'blue');
  log('Goal: Extract contract details with streaming updates\n', 'blue');

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://mino.ai/v1/automation/run-sse',
      headers: {
        'X-API-Key': MINO_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        url: 'https://sam.gov/search',
        goal: `Search for: "${SEARCH_QUERY}" and retrieve contract name, detail URL, size of bid, contact email, deadline, and description for each opportunity`,
        browser_profile: 'lite',
        proxy_config: {
          enabled: true,
          country_code: 'US'
        }
      },
      responseType: 'stream'
    });

    let buffer = '';
    let results = [];
    let runId = null;
    let startTime = Date.now();

    logSection('🔄 Real-time Streaming Updates');

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();

        // Process complete SSE events
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        events.forEach(event => {
          if (!event.trim()) return;

          const lines = event.split('\n');
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

                if (data.type === 'run_started') {
                  runId = data.run_id;
                  log(`[${elapsed}s] 🚀 Agent Started`, 'green');
                  log(`       Run ID: ${runId}`, 'cyan');
                }
                else if (data.type === 'step_update') {
                  const stepInfo = data.step_number && data.total_steps
                    ? ` (${data.step_number}/${data.total_steps})`
                    : '';
                  log(`[${elapsed}s] 📍 ${data.step_description || 'Processing...'}${stepInfo}`, 'blue');
                }
                else if (data.type === 'page_update') {
                  log(`[${elapsed}s] 🌐 Navigating: ${data.url || 'Next page'}`, 'cyan');
                }
                else if (data.type === 'data_extracted') {
                  if (data.extracted_data) {
                    log(`[${elapsed}s] 📊 Data Extracted!`, 'magenta');

                    try {
                      const extracted = typeof data.extracted_data === 'string'
                        ? JSON.parse(data.extracted_data)
                        : data.extracted_data;

                      if (Array.isArray(extracted)) {
                        results = extracted;
                      } else if (extracted.opportunities) {
                        results = extracted.opportunities;
                      } else if (extracted.contracts) {
                        results = extracted.contracts;
                      } else if (extracted.results) {
                        results = extracted.results;
                      }

                      log(`       Found ${results.length} opportunities`, 'magenta');
                    } catch (e) {
                      log(`       Error parsing data: ${e.message}`, 'red');
                    }
                  }
                }
                else if (data.type === 'run_completed') {
                  log(`[${elapsed}s] ✅ Run Completed!`, 'green');
                }
                else if (data.type === 'error') {
                  log(`[${elapsed}s] ❌ Error: ${data.error}`, 'red');
                }
                else if (data.type === 'log') {
                  log(`[${elapsed}s] 📝 ${data.message || 'Log message'}`, 'yellow');
                }

              } catch (e) {
                // Ignore parsing errors for incomplete JSON
              }
            }
          });
        });
      });

      response.data.on('end', () => {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

        logSection('📊 Results');

        if (results.length === 0) {
          log('No results found', 'yellow');
        } else {
          log(`Found ${results.length} procurement opportunities\n`, 'green');

          results.forEach((result, index) => {
            console.log(`${colors.bright}${index + 1}. ${result.name || result.title || 'Untitled'}${colors.reset}`);

            if (result.description) {
              console.log(`   ${result.description.substring(0, 120)}...`);
            }

            if (result.size_of_bid || result.amount) {
              log(`   💰 ${result.size_of_bid || result.amount}`, 'cyan');
            }

            if (result.deadline) {
              log(`   📅 ${result.deadline}`, 'cyan');
            }

            if (result.contact_email) {
              log(`   📧 ${result.contact_email}`, 'cyan');
            }

            if (result.detail_url || result.url) {
              log(`   🔗 ${result.detail_url || result.url}`, 'blue');
            }

            console.log('');
          });
        }

        logSection('✅ Summary');
        log(`Run ID: ${runId}`, 'green');
        log(`Total Results: ${results.length}`, 'green');
        log(`Execution Time: ${totalTime}s`, 'green');
        log(`Source: SAM.gov via Mino.ai`, 'cyan');

        resolve({ results, runId, totalTime });
      });

      response.data.on('error', (error) => {
        log(`\n❌ Stream Error: ${error.message}`, 'red');
        reject(error);
      });
    });

  } catch (error) {
    logSection('❌ ERROR');
    log(error.message, 'red');

    if (error.response) {
      log(`\nStatus: ${error.response.status}`, 'red');
      log(`Response:`, 'red');
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    if (error.message.includes('401') || error.message.includes('403')) {
      log('\n💡 API key may be invalid. Check your Mino.ai account.', 'yellow');
    }

    throw error;
  }
}

// Run the test
if (require.main === module) {
  testMinoStreaming()
    .then(() => {
      log('\n✨ Test completed successfully!\n', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log('\n💥 Test failed!\n', 'red');
      process.exit(1);
    });
}

module.exports = { testMinoStreaming };
