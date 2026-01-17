// Yutori API Test Application
const API_BASE = 'https://api.yutori.com';

// State
let currentScoutId = null;
let currentResults = [];

// DOM Elements
const elements = {
    apiKey: document.getElementById('apiKey'),
    searchQuery: document.getElementById('searchQuery'),
    startResearchBtn: document.getElementById('startResearchBtn'),
    clearBtn: document.getElementById('clearBtn'),
    statusSection: document.getElementById('statusSection'),
    statusBadge: document.getElementById('statusBadge'),
    statusMessage: document.getElementById('statusMessage'),
    statusMeta: document.getElementById('statusMeta'),
    progressFill: document.getElementById('progressFill'),
    resultsSection: document.getElementById('resultsSection'),
    resultsGrid: document.getElementById('resultsGrid'),
    resultCount: document.getElementById('resultCount'),
    generateEmailBtn: document.getElementById('generateEmailBtn'),
    emailSection: document.getElementById('emailSection'),
    emailContent: document.getElementById('emailContent'),
    copyEmailBtn: document.getElementById('copyEmailBtn'),
    recipientName: document.getElementById('recipientName'),
    senderName: document.getElementById('senderName'),
    companyName: document.getElementById('companyName'),
    debugSection: document.getElementById('debugSection'),
    debugContent: document.getElementById('debugContent'),
    debugLog: document.getElementById('debugLog'),
    toggleDebugBtn: document.getElementById('toggleDebugBtn'),
    alertContainer: document.getElementById('alertContainer')
};

// ===== Alert System =====
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    alert.innerHTML = `
        <span style="font-size: 20px;">${icon}</span>
        <span>${message}</span>
    `;

    elements.alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// ===== Debug Logger =====
function logDebug(title, data, type = 'response') {
    const debugItem = document.createElement('div');
    debugItem.className = 'debug-item';

    const timestamp = new Date().toLocaleTimeString();

    debugItem.innerHTML = `
        <div class="debug-item-header">
            <span class="debug-item-title">${title}</span>
            <span class="debug-item-time">${timestamp}</span>
        </div>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    `;

    elements.debugLog.insertBefore(debugItem, elements.debugLog.firstChild);
}

// ===== Status Updates =====
function updateStatus(message, badge = 'active', meta = '') {
    elements.statusMessage.textContent = message;
    elements.statusBadge.textContent = badge;
    elements.statusBadge.className = `status-badge ${badge.toLowerCase()}`;
    elements.statusMeta.textContent = meta;
}

// ===== API Functions =====
async function createScout(apiKey, query) {
    const url = `${API_BASE}/scouts`;
    const body = {
        query: query,
        filters: {
            categories: ['procurement', 'contracts', 'funding', 'fundraising']
        }
    };

    logDebug('📤 Create Scout Request', { url, body });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    logDebug('📥 Create Scout Response', data);

    if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
}

async function getScoutDetails(apiKey, scoutId) {
    const url = `${API_BASE}/scouts/${scoutId}`;

    logDebug('📤 Get Scout Details Request', { url, scoutId });

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    const data = await response.json();
    logDebug('📥 Get Scout Details Response', data);

    if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
}

async function pollScoutResults(apiKey, scoutId, maxAttempts = 30, intervalMs = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
        const attempt = i + 1;
        updateStatus(
            `Polling for results...`,
            'Active',
            `Attempt ${attempt}/${maxAttempts} - Checking every 2 seconds`
        );

        const details = await getScoutDetails(apiKey, scoutId);

        if (details.status === 'completed') {
            updateStatus('Research completed!', 'Completed', `Found ${details.results?.length || 0} results`);
            return details;
        }

        if (details.status === 'failed') {
            throw new Error('Scout research failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Research timed out after ${maxAttempts * intervalMs / 1000} seconds`);
}

// ===== Results Display =====
function displayResults(results) {
    elements.resultsGrid.innerHTML = '';

    if (!results || results.length === 0) {
        elements.resultsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No results found</div>
            </div>
        `;
        elements.resultCount.textContent = '0 results';
        return;
    }

    elements.resultCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;

    results.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';

        let metaHtml = '';
        const metaItems = [];

        if (result.amount || result.contract_value) {
            metaItems.push(`<span>💰 ${result.amount || result.contract_value}</span>`);
        }
        if (result.deadline) {
            metaItems.push(`<span>📅 ${result.deadline}</span>`);
        }
        if (result.location) {
            metaItems.push(`<span>📍 ${result.location}</span>`);
        }

        if (metaItems.length > 0) {
            metaHtml = `<div class="result-meta">${metaItems.join('')}</div>`;
        }

        card.innerHTML = `
            <div class="result-title">${result.title || 'Untitled Opportunity'}</div>
            ${result.description ? `<div class="result-description">${result.description}</div>` : ''}
            ${metaHtml}
            ${result.url ? `<a href="${result.url}" target="_blank" class="result-link">Read more →</a>` : ''}
        `;

        elements.resultsGrid.appendChild(card);
    });
}

// ===== Email Generation =====
function generateEmail(results, options) {
    const { recipientName = 'there', senderName = '', companyName = '' } = options;

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
            email += `   Link: ${result.url}\n`;
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

// ===== Event Handlers =====
elements.startResearchBtn.addEventListener('click', async () => {
    const apiKey = elements.apiKey.value.trim();
    const query = elements.searchQuery.value.trim();

    if (!apiKey) {
        showAlert('Please enter your Yutori API key', 'error');
        return;
    }

    if (!query) {
        showAlert('Please enter a search query', 'error');
        return;
    }

    // Reset UI
    elements.startResearchBtn.disabled = true;
    elements.startResearchBtn.innerHTML = '<div class="spinner"></div><span>Researching...</span>';
    elements.statusSection.classList.remove('hidden');
    elements.resultsSection.classList.add('hidden');
    elements.emailSection.classList.add('hidden');
    elements.progressFill.classList.add('animated');

    try {
        // Step 1: Create scout
        updateStatus('Creating research scout...', 'Active', 'Initializing API request...');
        const scoutData = await createScout(apiKey, query);
        currentScoutId = scoutData.scout_id;

        showAlert(`Scout created successfully! ID: ${currentScoutId}`, 'success');

        // Step 2: Poll for results
        updateStatus('Waiting for results...', 'Active', 'This may take 30-60 seconds');
        const results = await pollScoutResults(apiKey, currentScoutId);

        currentResults = results.results || [];

        // Display results
        elements.progressFill.classList.remove('animated');
        elements.progressFill.style.width = '100%';
        elements.statusSection.classList.add('hidden');
        elements.resultsSection.classList.remove('hidden');
        displayResults(currentResults);

        showAlert(`Research completed! Found ${currentResults.length} results.`, 'success');

    } catch (error) {
        console.error('Research error:', error);
        showAlert(error.message, 'error');

        updateStatus('Research failed', 'Failed', error.message);
        elements.progressFill.classList.remove('animated');

    } finally {
        elements.startResearchBtn.disabled = false;
        elements.startResearchBtn.innerHTML = '<span class="icon">🚀</span><span>Start Research</span>';
    }
});

elements.generateEmailBtn.addEventListener('click', () => {
    if (currentResults.length === 0) {
        showAlert('No research results available to generate email', 'error');
        return;
    }

    const email = generateEmail(currentResults, {
        recipientName: elements.recipientName.value || 'there',
        senderName: elements.senderName.value || '',
        companyName: elements.companyName.value || ''
    });

    elements.emailContent.value = email;
    elements.emailSection.classList.remove('hidden');
    elements.emailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    showAlert('Email generated successfully!', 'success');
});

elements.copyEmailBtn.addEventListener('click', () => {
    elements.emailContent.select();
    document.execCommand('copy');

    elements.copyEmailBtn.innerHTML = '<span class="icon">✅</span><span>Copied!</span>';
    setTimeout(() => {
        elements.copyEmailBtn.innerHTML = '<span class="icon">📋</span><span>Copy to Clipboard</span>';
    }, 2000);

    showAlert('Email copied to clipboard!', 'success');
});

elements.clearBtn.addEventListener('click', () => {
    elements.resultsSection.classList.add('hidden');
    elements.emailSection.classList.add('hidden');
    elements.statusSection.classList.add('hidden');
    elements.debugLog.innerHTML = '';
    currentResults = [];
    currentScoutId = null;
    elements.progressFill.style.width = '0%';

    showAlert('Results cleared', 'info');
});

elements.toggleDebugBtn.addEventListener('click', () => {
    elements.debugContent.classList.toggle('hidden');
});

// Initialize
console.log('Yutori API Test Suite initialized');
showAlert('Ready to start research!', 'info');
