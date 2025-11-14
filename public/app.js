const API_URL = 'http://localhost:3000/api';

// Available agents
const AGENTS = [
    { id: 'crawl', name: 'Crawl Agent', description: 'Extracts HTML, metadata, headings, links' },
    { id: 'keyword', name: 'Keyword Intelligence', description: 'Detects missing keywords and suggests terms' },
    { id: 'content', name: 'Content Optimization', description: 'Analyzes readability and structure' },
    { id: 'schema', name: 'Schema Agent', description: 'Generates and validates structured data' },
    { id: 'technical', name: 'Technical SEO', description: 'Checks Core Web Vitals and performance' },
    { id: 'meta', name: 'Meta Tags', description: 'Generates optimized meta titles and descriptions' },
    { id: 'image', name: 'Image Intelligence', description: 'Analyzes alt text and image optimization' },
    { id: 'validation', name: 'Validation', description: 'Ensures output quality and SEO compliance' },
    { id: 'report', name: 'Report Generation', description: 'Generates comprehensive HTML reports' }
];

let eventSource = null;
let currentTaskId = null;

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    initializeAgentSelection();
    setupEventListeners();
});

function initializeAgentSelection() {
    const agentGrid = document.getElementById('agentGrid');
    agentGrid.innerHTML = '';

    AGENTS.forEach(agent => {
        const checkbox = document.createElement('div');
        checkbox.className = 'agent-checkbox';
        checkbox.innerHTML = `
            <input type="checkbox" id="agent-${agent.id}" value="${agent.id}" checked>
            <label for="agent-${agent.id}">
                <strong>${agent.name}</strong><br>
                <small style="color: #666;">${agent.description}</small>
            </label>
        `;
        agentGrid.appendChild(checkbox);
    });
}

function setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', startAnalysis);
}

function getSelectedAgents() {
    const checkboxes = document.querySelectorAll('.agent-checkbox input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function isSitemapURL(url) {
    return url.toLowerCase().includes('sitemap') || url.toLowerCase().endsWith('.xml');
}

async function startAnalysis() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a URL or sitemap URL');
        return;
    }

    const selectedAgents = getSelectedAgents();
    if (selectedAgents.length === 0) {
        alert('Please select at least one agent');
        return;
    }

    // Disable button
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';

    // Show progress section
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    
    // Clear previous logs
    const streamLog = document.getElementById('streamLog');
    streamLog.innerHTML = '';

    // Determine if it's a sitemap or single URL
    const isSitemap = isSitemapURL(url);

    try {
        // Start streaming analysis
        await startStreamingAnalysis(url, selectedAgents, isSitemap);
    } catch (error) {
        console.error('Analysis error:', error);
        addLogEntry('error', `Error: ${error.message}`);
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Start Analysis';
    }
}

async function startStreamingAnalysis(url, selectedAgents, isSitemap) {
    // Close previous event source if exists
    if (eventSource) {
        eventSource.close();
    }

    // Create new EventSource for Server-Sent Events
    const params = new URLSearchParams({
        url: url,
        agents: selectedAgents.join(','),
        isSitemap: isSitemap
    });

    eventSource = new EventSource(`${API_URL}/analyze-stream?${params}`);

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleStreamEvent(data);
    };

    eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        addLogEntry('error', 'Connection error. Retrying...');
        // EventSource will automatically retry
    };
}

function handleStreamEvent(data) {
    const { type, message, progress, agent, status, result, taskId } = data;

    if (taskId) {
        currentTaskId = taskId;
    }

    switch (type) {
        case 'progress':
            updateProgress(progress, message);
            addLogEntry('info', message);
            break;

        case 'agent_start':
            addLogEntry('info', `🔄 Starting ${agent}...`);
            break;

        case 'agent_complete':
            addLogEntry('success', `✅ ${agent} completed`);
            if (result) {
                // Try to extract URL from the result or use current URL being processed
                const url = result.url || (data.url || null);
                displayAgentResult(agent, result, url);
            }
            break;

        case 'agent_error':
            addLogEntry('error', `❌ ${agent} failed: ${message}`);
            break;

        case 'url_processing':
            addLogEntry('info', `📄 Processing URL: ${message}`);
            break;

        case 'sitemap_parsed':
            addLogEntry('success', `🗺️ Sitemap parsed: Found ${message} URL(s) to analyze`);
            break;

        case 'complete':
            addLogEntry('success', '🎉 Analysis complete!');
            updateProgress(100, 'Analysis complete');
            finalizeAnalysis();
            break;

        case 'error':
            addLogEntry('error', `Error: ${message}`);
            finalizeAnalysis();
            break;
    }
}

function updateProgress(percentage, message) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message || `${percentage}%`;
}

function addLogEntry(type, message) {
    const streamLog = document.getElementById('streamLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span>${message}`;
    
    streamLog.appendChild(entry);
    streamLog.scrollTop = streamLog.scrollHeight;
}

function displayAgentResult(agentName, result, url = null) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Create a unique ID that includes URL if provided
    const cardId = url ? `result-${agentName}-${url}` : `result-${agentName}`;
    
    // Check if result card already exists
    let card = document.getElementById(cardId);
    if (!card) {
        card = document.createElement('div');
        card.id = cardId;
        card.className = 'result-card';
        resultsContainer.appendChild(card);
    }

    const urlDisplay = url ? `<p style="color: #666; font-size: 12px; margin-bottom: 10px;">URL: ${url}</p>` : '';
    
    card.innerHTML = `
        <h4>${getAgentDisplayName(agentName)}</h4>
        ${urlDisplay}
        <span class="status completed">Completed</span>
        <div class="result-content">
            <pre>${JSON.stringify(result, null, 2)}</pre>
        </div>
    `;

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
}

function getAgentDisplayName(agentId) {
    const agent = AGENTS.find(a => a.id === agentId);
    return agent ? agent.name : agentId;
}

function finalizeAnalysis() {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Start Analysis';
}

