#!/usr/bin/env node

/**
 * Simple Mino.ai Test (Non-streaming)
 * Uses the regular /run endpoint instead of SSE
 */

const https = require('https');

const MINO_API_KEY = 'sk-mino-cWSgb9FXhPNiKvUzX-1M-QGt_sFUbV8s';
const SEARCH_QUERY = process.argv[2] || 'cloud security government contract';

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

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testMino() {
  console.clear();
  log('\n🤖 MINO.AI SIMPLE TEST', 'bright');
  log('SAM.gov B2G Procurement Research (Non-streaming)\n', 'cyan');

  const body = {
    url: 'https://sam.gov/search',
    goal: `Search for: "${SEARCH_QUERY}" and retrieve contract name, detail URL, size of bid, contact email, deadline, and description for each opportunity`,
    browser_profile: 'lite',
    proxy_config: {
      enabled: true,
      country_code: 'US'
    }
  };

  const options = {
    hostname: 'mino.ai',
    port: 443,
    path: '/v1/automation/run',
    method: 'POST',
    headers: {
      'X-API-Key': MINO_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(body))
    }
  };

  log('Request:', 'blue');
  console.log(`  URL: https://${options.hostname}${options.path}`);
  console.log(`  Search: "${SEARCH_QUERY}"`);
  console.log(`  Target: ${body.url}\n`);

  log('⏳ Sending request... (this may take 30-60 seconds)', 'yellow');

  try {
    const response = await makeRequest(options, body);

    log('\n✅ Response Received!\n', 'green');

    console.log('Status:', response.status);
    console.log('\nFull Response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Try to extract results
    const data = response.data;
    let results = [];

    if (data.extracted_data) {
      if (Array.isArray(data.extracted_data)) {
        results = data.extracted_data;
      } else if (typeof data.extracted_data === 'object') {
        results = data.extracted_data.opportunities ||
                 data.extracted_data.contracts ||
                 data.extracted_data.results ||
                 [];
      }
    } else if (data.results) {
      results = data.results;
    }

    if (results.length > 0) {
      log('\n📊 Extracted Opportunities:', 'bright');
      log(`Found ${results.length} results\n`, 'green');

      results.forEach((result, index) => {
        console.log(`${colors.bright}${index + 1}. ${result.name || result.title || 'Untitled'}${colors.reset}`);
        if (result.description) {
          console.log(`   ${result.description.substring(0, 100)}...`);
        }
        if (result.size_of_bid) log(`   💰 ${result.size_of_bid}`, 'cyan');
        if (result.deadline) log(`   📅 ${result.deadline}`, 'cyan');
        if (result.contact_email) log(`   📧 ${result.contact_email}`, 'cyan');
        if (result.detail_url) log(`   🔗 ${result.detail_url}`, 'blue');
        console.log('');
      });
    } else {
      log('\n⚠️  No results extracted', 'yellow');
      log('The agent may still be processing or found no matches.', 'yellow');
    }

    log('\n✨ Test completed!', 'green');

  } catch (error) {
    log('\n❌ Error:', 'red');
    console.error(error.message);
  }
}

testMino();
