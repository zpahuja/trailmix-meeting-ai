#!/usr/bin/env node

/**
 * Get Scout Details by ID
 * Usage: node get-scout.js [scout_id]
 */

const https = require('https');

const API_KEY = 'yt_OBX6WEG1djjjqJb8VD_8lAem5vASpj-_dP27Y7TMr64';
const SCOUT_ID = process.argv[2] || '39f18984-e7b5-46d0-86e3-4b800098f90d';

// Colors
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

function makeRequest(options) {
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

    req.end();
  });
}

async function getScoutDetails(scoutId) {
  console.clear();
  log('\n🔍 YUTORI API - GET SCOUT DETAILS\n', 'bright');

  const options = {
    hostname: 'api.yutori.com',
    port: 443,
    path: `/scouts/${scoutId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json'
    }
  };

  log('Request Details:', 'blue');
  console.log(`  Method: ${options.method}`);
  console.log(`  URL: https://${options.hostname}${options.path}`);
  console.log(`  Scout ID: ${scoutId}`);
  console.log(`  API Key: ${API_KEY.substring(0, 15)}...`);

  log('\n⏳ Fetching scout details...', 'yellow');

  try {
    const response = await makeRequest(options);

    log('\nResponse:', 'cyan');
    console.log(`  Status: ${response.status}`);

    if (response.status >= 200 && response.status < 300) {
      log('\n✅ SUCCESS!\n', 'green');

      const data = response.data;

      // Display scout information
      log('═'.repeat(60), 'bright');
      log('SCOUT INFORMATION', 'bright');
      log('═'.repeat(60), 'bright');

      console.log(`\nScout ID: ${data.scout_id || scoutId}`);
      console.log(`Status: ${data.status}`);
      console.log(`Query: ${data.query || 'N/A'}`);
      console.log(`Created: ${data.created_at || 'N/A'}`);
      console.log(`Updated: ${data.updated_at || 'N/A'}`);

      if (data.metadata) {
        console.log(`\nMetadata:`);
        console.log(JSON.stringify(data.metadata, null, 2));
      }

      // Display results
      if (data.results && data.results.length > 0) {
        log(`\n${'═'.repeat(60)}`, 'bright');
        log(`RESULTS (${data.results.length} found)`, 'bright');
        log(`${'═'.repeat(60)}`, 'bright');

        data.results.forEach((result, index) => {
          console.log(`\n${colors.bright}${index + 1}. ${result.title || 'Untitled'}${colors.reset}`);

          if (result.description) {
            const desc = result.description.substring(0, 200);
            console.log(`   ${desc}${result.description.length > 200 ? '...' : ''}`);
          }

          if (result.amount || result.contract_value) {
            log(`   💰 ${result.amount || result.contract_value}`, 'cyan');
          }

          if (result.deadline) {
            log(`   📅 ${result.deadline}`, 'cyan');
          }

          if (result.source) {
            log(`   📍 ${result.source}`, 'cyan');
          }

          if (result.url) {
            log(`   🔗 ${result.url}`, 'blue');
          }
        });

        // Generate email preview
        log(`\n${'═'.repeat(60)}`, 'bright');
        log('EMAIL PREVIEW', 'bright');
        log(`${'═'.repeat(60)}`, 'bright');

        console.log(generateEmail(data.results));

      } else if (data.status === 'pending') {
        log('\n⏳ Scout is still processing. Results not yet available.', 'yellow');
        log('   Try again in a few moments.', 'yellow');
      } else {
        log('\n📭 No results found for this scout.', 'yellow');
      }

      // Full JSON response
      log(`\n${'═'.repeat(60)}`, 'bright');
      log('FULL JSON RESPONSE', 'bright');
      log(`${'═'.repeat(60)}`, 'bright');
      console.log(JSON.stringify(response.data, null, 2));

    } else if (response.status === 404) {
      log(`\n❌ Scout not found (404)`, 'red');
      log(`   Scout ID: ${scoutId}`, 'red');
      log(`   This scout may not exist or has been deleted.`, 'yellow');
    } else if (response.status === 403) {
      log(`\n❌ Forbidden (403)`, 'red');
      log(`   Your API key may not have permission to access this scout.`, 'yellow');
    } else if (response.status === 401) {
      log(`\n❌ Unauthorized (401)`, 'red');
      log(`   Your API key is invalid or expired.`, 'yellow');
    } else {
      log(`\n❌ Error ${response.status}`, 'red');
      console.log(`Response:`, JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    log(`\n❌ Network Error: ${error.message}`, 'red');
  }

  console.log('\n');
}

function generateEmail(results, maxResults = 5) {
  if (!results || results.length === 0) {
    return 'No results available.';
  }

  let email = `Hi there,\n\n`;
  email += `I wanted to share some interesting B2G procurement opportunities I found:\n\n`;

  results.slice(0, maxResults).forEach((result, index) => {
    email += `${index + 1}. ${result.title || 'Opportunity'}\n`;
    if (result.description) {
      email += `   ${result.description.substring(0, 150)}...\n`;
    }
    if (result.amount || result.contract_value) {
      email += `   Value: ${result.amount || result.contract_value}\n`;
    }
    if (result.url) {
      email += `   Link: ${result.url}\n`;
    }
    email += `\n`;
  });

  email += `Let me know if any of these look interesting!\n\n`;
  email += `Best regards`;

  return email;
}

// Run
getScoutDetails(SCOUT_ID);
