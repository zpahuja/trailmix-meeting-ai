#!/usr/bin/env node

/**
 * Yutori API Diagnostics
 * Tests various authentication methods and endpoints
 */

const https = require('https');

const API_KEY = 'yt_OBX6WEG1djjjqJb8VD_8lAem5vASpj-_dP27Y7TMr64';

function log(msg, color = '') {
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color] || ''}${msg}${colors.reset}`);
}

function makeRequest(options) {
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    req.on('error', error => resolve({ error: error.message }));
    req.end();
  });
}

async function testEndpoint(name, options) {
  console.log(`\n${'─'.repeat(60)}`);
  log(`Testing: ${name}`, 'blue');
  console.log(`Method: ${options.method}`);
  console.log(`URL: https://${options.hostname}${options.path}`);
  console.log(`Headers:`, JSON.stringify(options.headers, null, 2));

  const result = await makeRequest(options);

  if (result.error) {
    log(`❌ Network Error: ${result.error}`, 'red');
    return false;
  }

  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.data, null, 2));

  if (result.status >= 200 && result.status < 300) {
    log('✅ Success!', 'green');
    return true;
  } else if (result.status === 401) {
    log('❌ 401 Unauthorized - API key is invalid', 'red');
    return false;
  } else if (result.status === 403) {
    log('❌ 403 Forbidden - No permission or wrong endpoint', 'red');
    return false;
  } else if (result.status === 404) {
    log('❌ 404 Not Found - Endpoint does not exist', 'red');
    return false;
  } else {
    log(`❌ Error ${result.status}`, 'red');
    return false;
  }
}

async function main() {
  console.clear();
  log('\n🔍 YUTORI API DIAGNOSTICS\n', 'blue');
  log(`API Key: ${API_KEY.substring(0, 15)}...`, 'yellow');

  const tests = [
    {
      name: 'Test 1: Bearer Token (Standard)',
      options: {
        hostname: 'api.yutori.com',
        path: '/scouts',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    },
    {
      name: 'Test 2: API Key Header',
      options: {
        hostname: 'api.yutori.com',
        path: '/scouts',
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY
        }
      }
    },
    {
      name: 'Test 3: Alternative Base URL',
      options: {
        hostname: 'yutori.com',
        path: '/api/scouts',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    },
    {
      name: 'Test 4: Health Check / Root',
      options: {
        hostname: 'api.yutori.com',
        path: '/',
        method: 'GET',
        headers: {}
      }
    },
    {
      name: 'Test 5: API Version Check',
      options: {
        hostname: 'api.yutori.com',
        path: '/v1/scouts',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    }
  ];

  let successCount = 0;

  for (const test of tests) {
    const success = await testEndpoint(test.name, test.options);
    if (success) successCount++;
  }

  console.log(`\n${'='.repeat(60)}`);
  log(`\nResults: ${successCount}/${tests.length} tests passed`, successCount > 0 ? 'green' : 'red');

  if (successCount === 0) {
    log('\n⚠️  Recommendations:', 'yellow');
    log('1. Verify your API key at: https://yutori.com/settings', 'yellow');
    log('2. Check API documentation: https://docs.yutori.com', 'yellow');
    log('3. Ensure your account has active subscription', 'yellow');
    log('4. Contact Yutori support for API access', 'yellow');
  }
}

main();
