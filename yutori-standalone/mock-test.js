#!/usr/bin/env node

/**
 * Mock Yutori API Test
 * Simulates successful API responses for testing the UI
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
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

// Mock data
const MOCK_SCOUT_DATA = {
  scout_id: '39f18984-e7b5-46d0-86e3-4b800098f90d',
  status: 'pending',
  query: 'b2g procurement enterprise contract, fundraise news',
  created_at: new Date().toISOString()
};

const MOCK_RESULTS = {
  scout_id: '39f18984-e7b5-46d0-86e3-4b800098f90d',
  status: 'completed',
  query: 'b2g procurement enterprise contract, fundraise news',
  results: [
    {
      title: 'Department of Defense Cloud Security Initiative',
      description: 'The Department of Defense is seeking proposals for a comprehensive cloud security solution to protect sensitive government data. The contract includes infrastructure security, threat monitoring, incident response, and compliance management across multiple classification levels.',
      amount: '$5.2M',
      contract_value: '$5.2M',
      deadline: '2026-02-28',
      location: 'Washington, DC',
      source: 'SAM.gov',
      url: 'https://sam.gov/opportunities/dod-cloud-security-2026'
    },
    {
      title: 'Federal Healthcare IT Modernization Program',
      description: 'The Department of Health and Human Services announces a major initiative to modernize legacy healthcare IT systems. This includes electronic health records integration, telemedicine platforms, data analytics, and cybersecurity improvements for federal healthcare facilities.',
      amount: '$8.7M',
      contract_value: '$8.7M',
      deadline: '2026-03-15',
      location: 'Multiple Locations',
      source: 'FedBizOpps',
      url: 'https://www.fbo.gov/healthcare-it-modernization'
    },
    {
      title: 'NASA Space Technology Research Funding',
      description: 'NASA is offering research grants for advanced space technologies including propulsion systems, life support systems, and autonomous navigation. Funding supports both basic research and technology demonstration projects with potential for near-term space missions.',
      amount: '$3.5M',
      contract_value: '$3.5M',
      deadline: '2026-04-01',
      location: 'Various NASA Centers',
      source: 'Grants.gov',
      url: 'https://grants.gov/nasa-space-tech-2026'
    },
    {
      title: 'State Government Cybersecurity Enhancement Program',
      description: 'Multi-state consortium seeking cybersecurity service providers to enhance state government infrastructure protection. Services include penetration testing, security operations center (SOC) services, incident response, and staff training across participating states.',
      amount: '$2.1M',
      contract_value: '$2.1M',
      deadline: '2026-03-10',
      location: 'Multiple States',
      source: 'NASPO ValuePoint',
      url: 'https://naspo.org/cybersecurity-program-2026'
    },
    {
      title: 'Enterprise AI Series B Funding - TechCorp AI',
      description: 'TechCorp AI announces $45M Series B funding round led by Sequoia Capital. The company specializes in enterprise AI solutions for government contractors, focusing on document automation, contract analysis, and compliance monitoring for federal procurement processes.',
      amount: '$45M',
      contract_value: '$45M',
      deadline: 'N/A',
      location: 'San Francisco, CA',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/techcorp-ai-series-b'
    },
    {
      title: 'Federal Emergency Management Agency (FEMA) Disaster Response Technology',
      description: 'FEMA seeks innovative technology solutions for disaster response coordination. Requirements include real-time communication systems, resource tracking, mobile command centers, and AI-powered situational awareness tools for emergency management.',
      amount: '$4.8M',
      contract_value: '$4.8M',
      deadline: '2026-02-20',
      location: 'Washington, DC',
      source: 'Beta.SAM.gov',
      url: 'https://beta.sam.gov/fema-disaster-tech-2026'
    },
    {
      title: 'Transportation Infrastructure Data Analytics Platform',
      description: 'Department of Transportation initiative to develop a nationwide transportation data analytics platform. The system will integrate data from highways, railways, airports, and ports to optimize infrastructure planning and maintenance scheduling.',
      amount: '$6.9M',
      contract_value: '$6.9M',
      deadline: '2026-03-25',
      location: 'National',
      source: 'FedBizOpps',
      url: 'https://www.fbo.gov/dot-data-platform-2026'
    }
  ],
  metadata: {
    total_results: 7,
    query_time_ms: 1250,
    sources_searched: ['SAM.gov', 'FedBizOpps', 'Grants.gov', 'TechCrunch', 'NASPO']
  },
  created_at: new Date(Date.now() - 60000).toISOString(),
  completed_at: new Date().toISOString()
};

// Simulate create scout
async function mockCreateScout() {
  logSection('📤 STEP 1: Create Scout (MOCK)');

  log('Request:', 'blue');
  console.log('  Query: b2g procurement enterprise contract, fundraise news');
  console.log('  Filters: procurement, contracts, funding, fundraising');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  log('\nResponse:', 'green');
  console.log(JSON.stringify(MOCK_SCOUT_DATA, null, 2));
  log('\n✅ Scout created successfully! (MOCK)', 'green');

  return MOCK_SCOUT_DATA;
}

// Simulate polling
async function mockPollResults() {
  logSection('🔄 STEP 2: Poll for Results (MOCK)');

  log(`Scout ID: ${MOCK_SCOUT_DATA.scout_id}`, 'cyan');

  // Simulate 3 polling attempts
  for (let i = 1; i <= 3; i++) {
    process.stdout.write(`\r  Attempt ${i}/3... `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  log('✅ Completed! (MOCK)', 'green');

  return MOCK_RESULTS;
}

// Display results
function displayResults(results) {
  logSection('📊 STEP 3: Results (MOCK)');

  log(`Found ${results.length} result(s)\n`, 'green');

  results.forEach((result, index) => {
    console.log(`\n${colors.bright}${index + 1}. ${result.title}${colors.reset}`);
    console.log(`   ${result.description.substring(0, 150)}...`);

    if (result.amount) {
      log(`   💰 ${result.amount}`, 'cyan');
    }
    if (result.deadline && result.deadline !== 'N/A') {
      log(`   📅 ${result.deadline}`, 'cyan');
    }
    if (result.location) {
      log(`   📍 ${result.location}`, 'cyan');
    }
    if (result.url) {
      log(`   🔗 ${result.url}`, 'blue');
    }
  });
}

// Generate email
function generateEmail(results) {
  let email = `Hi John,\n\n`;
  email += `I hope this message finds you well. `;
  email += `I wanted to share some interesting insights I've gathered regarding B2G procurement opportunities and recent fundraising news that may be relevant to Acme Corp.\n\n`;
  email += `Key Findings:\n\n`;

  results.slice(0, 5).forEach((result, index) => {
    email += `${index + 1}. ${result.title}\n`;
    if (result.description) {
      email += `   ${result.description.substring(0, 200)}...\n`;
    }
    if (result.url) {
      email += `   ${result.url}\n`;
    }
    if (result.amount) {
      email += `   Value: ${result.amount}\n`;
    }
    if (result.deadline && result.deadline !== 'N/A') {
      email += `   Deadline: ${result.deadline}\n`;
    }
    email += `\n`;
  });

  email += `I believe these opportunities align well with your strategic goals. `;
  email += `Would you be available for a brief call this week to discuss how we might approach these opportunities together?\n\n`;
  email += `Looking forward to hearing from you.\n\n`;
  email += `Best regards,\nJane Smith`;

  return email;
}

function displayEmail(email) {
  logSection('📧 STEP 4: Follow-up Email (MOCK)');
  console.log('\n' + email + '\n');
}

// Main
async function main() {
  console.clear();
  log('\n🔍 MOCK YUTORI API TEST', 'bright');
  log('Using Simulated Data for Testing\n', 'yellow');

  try {
    // Step 1: Create scout
    const scoutData = await mockCreateScout();

    // Step 2: Poll for results
    const results = await mockPollResults();

    // Step 3: Display results
    displayResults(results.results);

    // Step 4: Generate email
    const email = generateEmail(results.results);
    displayEmail(email);

    // Summary
    logSection('✅ SUCCESS (MOCK DATA)');
    log(`Scout ID: ${scoutData.scout_id}`, 'green');
    log(`Results: ${results.results.length}`, 'green');
    log(`Status: ${results.status}`, 'green');
    log(`\nTotal Contract Value: $36.2M+`, 'cyan');

    log('\n💡 Note: This is MOCK data for testing purposes.', 'yellow');
    log('   Once you have a valid API key, use test.js instead.', 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
}

main();

// Export for use in other modules
module.exports = {
  MOCK_SCOUT_DATA,
  MOCK_RESULTS,
  mockCreateScout,
  mockPollResults,
  generateEmail
};
