#!/usr/bin/env node

/**
 * Yutori API Test Script (Node.js)
 *
 * This script tests the Yutori API endpoints without CORS restrictions.
 * Run with: node test.js
 */

const https = require('https');

// Configuration
const API_BASE = 'api.yutori.com';
const API_KEY = 'yt_OBX6WEG1djjjqJb8VD_8lAem5vASpj-_dP27Y7TMr64';
const SEARCH_QUERY = 'b2g procurement enterprise contract, fundraise news';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// Make HTTPS request
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Create Scout
async function createScout(query) {
  logSection('📤 STEP 1: Create Scout');

  const body = {
    query: query,
    filters: {
      categories: ['procurement', 'contracts', 'funding', 'fundraising']
    }
  };

  const options = {
    hostname: API_BASE,
    port: 443,
    path: '/scouts',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(body))
    }
  };

  log('Request:', 'blue');
  console.log(`  Method: ${options.method}`);
  console.log(`  URL: https://${options.hostname}${options.path}`);
  console.log(`  Body:`, body);

  try {
    const response = await makeRequest(options, body);

    log('\nResponse:', 'green');
    console.log(`  Status: ${response.status}`);
    console.log(`  Data:`, JSON.stringify(response.data, null, 2));

    if (response.status >= 200 && response.status < 300) {
      log('✅ Scout created successfully!', 'green');
      return response.data;
    } else {
      log(`❌ Failed with status ${response.status}`, 'red');
      throw new Error(JSON.stringify(response.data));
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    throw error;
  }
}

// Get Scout Details
async function getScoutDetails(scoutId) {
  const options = {
    hostname: API_BASE,
    port: 443,
    path: `/scouts/${scoutId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  };

  try {
    const response = await makeRequest(options);

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(JSON.stringify(response.data));
    }
  } catch (error) {
    throw error;
  }
}

// Poll for results
async function pollScoutResults(scoutId, maxAttempts = 30, intervalMs = 2000) {
  logSection('🔄 STEP 2: Poll for Results');

  log(`Scout ID: ${scoutId}`, 'cyan');
  log(`Max attempts: ${maxAttempts} (every ${intervalMs / 1000}s)`, 'cyan');

  for (let i = 0; i < maxAttempts; i++) {
    const attempt = i + 1;
    process.stdout.write(`\r  Attempt ${attempt}/${maxAttempts}... `);

    try {
      const details = await getScoutDetails(scoutId);

      if (details.status === 'completed') {
        log('✅ Completed!', 'green');
        return details;
      }

      if (details.status === 'failed') {
        log('❌ Failed!', 'red');
        throw new Error('Scout research failed');
      }

      // Still pending, wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));

    } catch (error) {
      log(`\n❌ Error: ${error.message}`, 'red');
      throw error;
    }
  }

  log(`\n❌ Timeout after ${maxAttempts * intervalMs / 1000}s`, 'red');
  throw new Error('Research timed out');
}

// Display results
function displayResults(results) {
  logSection('📊 STEP 3: Results');

  if (!results || results.length === 0) {
    log('No results found', 'yellow');
    return;
  }

  log(`Found ${results.length} result(s)\n`, 'green');

  results.forEach((result, index) => {
    console.log(`\n${colors.bright}${index + 1}. ${result.title || 'Untitled'}${colors.reset}`);

    if (result.description) {
      console.log(`   ${result.description.substring(0, 150)}${result.description.length > 150 ? '...' : ''}`);
    }

    if (result.amount || result.contract_value) {
      log(`   💰 ${result.amount || result.contract_value}`, 'cyan');
    }

    if (result.deadline) {
      log(`   📅 ${result.deadline}`, 'cyan');
    }

    if (result.url) {
      log(`   🔗 ${result.url}`, 'blue');
    }
  });
}

// Generate email
function generateEmail(results, options = {}) {
  const {
    recipientName = 'there',
    senderName = '',
    companyName = ''
  } = options;

  if (!results || results.length === 0) {
    return 'No results available to generate email.';
  }

  let email = `Hi ${recipientName},\n\n`;
  email += `I hope this message finds you well. `;
  email += `I wanted to share some interesting insights I've gathered regarding B2G procurement opportunities and recent fundraising news`;
  if (companyName) {
    email += ` that may be relevant to ${companyName}`;
  }
  email += `.\n\n`;
  email += `Key Findings:\n\n`;

  results.slice(0, 5).forEach((result, index) => {
    email += `${index + 1}. ${result.title || 'Opportunity'}\n`;
    if (result.description) {
      const desc = result.description.substring(0, 200);
      email += `   ${desc}${result.description.length > 200 ? '...' : ''}\n`;
    }
    if (result.url) {
      email += `   ${result.url}\n`;
    }
    if (result.amount || result.contract_value) {
      email += `   Value: ${result.amount || result.contract_value}\n`;
    }
    if (result.deadline) {
      email += `   Deadline: ${result.deadline}\n`;
    }
    email += `\n`;
  });

  email += `I believe these opportunities align well with your strategic goals. `;
  email += `Would you be available for a brief call this week to discuss how we might approach these opportunities together?\n\n`;
  email += `Looking forward to hearing from you.\n\n`;
  email += `Best regards`;
  if (senderName) {
    email += `,\n${senderName}`;
  }

  return email;
}

// Display email
function displayEmail(email) {
  logSection('📧 STEP 4: Follow-up Email');
  console.log('\n' + email + '\n');
}

// Main execution
async function main() {
  console.clear();
  log('\n🔍 YUTORI API TEST SCRIPT', 'bright');
  log('Testing B2G Procurement Research\n', 'cyan');

  try {
    // Step 1: Create scout
    const scoutData = await createScout(SEARCH_QUERY);
    const scoutId = scoutData.scout_id;

    // Step 2: Poll for results
    const results = await pollScoutResults(scoutId);

    // Step 3: Display results
    displayResults(results.results);

    // Step 4: Generate email
    const email = generateEmail(results.results, {
      recipientName: 'John',
      senderName: 'Jane Smith',
      companyName: 'Acme Corp'
    });
    displayEmail(email);

    // Summary
    logSection('✅ SUCCESS');
    log(`Scout ID: ${scoutId}`, 'green');
    log(`Results: ${results.results?.length || 0}`, 'green');
    log(`Status: ${results.status}`, 'green');

  } catch (error) {
    logSection('❌ ERROR');
    log(error.message, 'red');

    if (error.message.includes('Forbidden') || error.message.includes('401') || error.message.includes('403')) {
      log('\n💡 Possible issues:', 'yellow');
      log('  1. API key may be invalid or expired', 'yellow');
      log('  2. API key may not have proper permissions', 'yellow');
      log('  3. API endpoint may require different authentication', 'yellow');
      log('\n  Check: https://docs.yutori.com for authentication details', 'cyan');
    }

    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createScout,
  getScoutDetails,
  pollScoutResults,
  generateEmail
};
