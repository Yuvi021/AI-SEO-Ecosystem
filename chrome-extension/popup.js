// API URL - matches backend server port
const API_URL = 'http://localhost:3001/api';

document.addEventListener('DOMContentLoaded', async () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const viewReportBtn = document.getElementById('viewReportBtn');
  const statusDiv = document.getElementById('status');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreValue = document.getElementById('scoreValue');
  const scoreStatus = document.getElementById('scoreStatus');
  const urlDisplay = document.getElementById('urlDisplay');
  const recommendationsDiv = document.getElementById('recommendations');
  const recommendationsList = document.getElementById('recommendationsList');

  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab.url;
  urlDisplay.textContent = currentUrl;

  // Load cached results if available
  const cached = await chrome.storage.local.get(['lastAnalysis', 'lastUrl']);
  if (cached.lastAnalysis && cached.lastUrl === currentUrl) {
    displayResults(cached.lastAnalysis);
  }

  analyzeBtn.addEventListener('click', async () => {
    try {
      analyzeBtn.disabled = true;
      statusDiv.style.display = 'block';
      statusDiv.className = 'status loading';
      statusDiv.textContent = 'Analyzing page...';
      scoreDisplay.style.display = 'none';
      recommendationsDiv.style.display = 'none';

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: currentUrl })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Cache results
        await chrome.storage.local.set({
          lastAnalysis: data.data,
          lastUrl: currentUrl
        });
        
        displayResults(data.data);
        statusDiv.className = 'status success';
        statusDiv.textContent = 'Analysis complete!';
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      statusDiv.className = 'status error';
      statusDiv.textContent = `Error: ${error.message}`;
    } finally {
      analyzeBtn.disabled = false;
    }
  });

  viewReportBtn.addEventListener('click', async () => {
    // Open full report in new tab
    const cached = await chrome.storage.local.get(['lastAnalysis']);
    if (cached.lastAnalysis) {
      // Create a data URL with the report HTML
      const reportHTML = generateReportHTML(cached.lastAnalysis, currentUrl);
      const blob = new Blob([reportHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      chrome.tabs.create({ url });
    } else {
      // Fallback: open analyze page
      chrome.tabs.create({
        url: `http://localhost:3000/analyze?url=${encodeURIComponent(currentUrl)}`
      });
    }
  });

  function displayResults(results) {
    // Display score
    const score = results.report?.score || results.validation?.quality?.score || 0;
    scoreValue.textContent = score;
    scoreStatus.textContent = getScoreLabel(score);
    scoreDisplay.style.display = 'block';

    // Display recommendations
    const recommendations = aggregateRecommendations(results);
    if (recommendations.length > 0) {
      recommendationsList.innerHTML = '';
      recommendations.slice(0, 10).forEach(rec => {
        const recDiv = document.createElement('div');
        recDiv.className = `recommendation ${rec.priority}`;
        recDiv.innerHTML = `
          <div class="recommendation-title">${rec.message}</div>
          <div class="recommendation-impact">${rec.impact}</div>
        `;
        recommendationsList.appendChild(recDiv);
      });
      recommendationsDiv.style.display = 'block';
    }

    viewReportBtn.style.display = 'block';
  }

  function aggregateRecommendations(results) {
    const recommendations = [];
    
    const sections = [
      results.keyword?.recommendations,
      results.content?.recommendations,
      results.technical?.recommendations,
      results.meta?.recommendations,
      results.schema?.recommendations,
      results.image?.recommendations
    ];

    sections.forEach(section => {
      if (Array.isArray(section)) {
        recommendations.push(...section);
      }
    });

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => 
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    );

    return recommendations;
  }

  function getScoreLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  }

  function generateReportHTML(data, url) {
    const score = data.report?.score || data.validation?.quality?.score || 0;
    const recommendations = aggregateRecommendations(data);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Report - ${url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    h1 { color: #667eea; margin-bottom: 10px; }
    .url { color: #666; margin-bottom: 30px; word-break: break-all; }
    .score-display {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .score { font-size: 72px; font-weight: bold; }
    .recommendations { margin-top: 30px; }
    .recommendation {
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .recommendation.critical { background: #fee; border-color: #dc3545; }
    .recommendation.high { background: #fff3cd; border-color: #fd7e14; }
    .recommendation.medium { background: #fffbf0; border-color: #ffc107; }
    .recommendation.low { background: #d4edda; border-color: #28a745; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 SEO Analysis Report</h1>
    <div class="url">${url}</div>
    <div class="score-display">
      <div style="font-size: 18px; opacity: 0.9;">SEO Score</div>
      <div class="score">${score}</div>
      <div style="font-size: 16px; opacity: 0.9; margin-top: 10px;">${getScoreLabel(score)}</div>
    </div>
    <div class="recommendations">
      <h2>Recommendations</h2>
      ${recommendations.map(rec => `
        <div class="recommendation ${rec.priority}">
          <strong>${rec.message}</strong>
          <div style="margin-top: 5px; font-size: 14px; opacity: 0.8;">${rec.impact || ''}</div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
  }

  // Check backend connection on load
  async function checkBackendConnection() {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/health`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('Backend connection check failed:', error);
    }
    return false;
  }

  // Show connection status
  const isConnected = await checkBackendConnection();
  if (!isConnected) {
    statusDiv.style.display = 'block';
    statusDiv.className = 'status error';
    statusDiv.textContent = '⚠️ Backend not connected. Please start the backend server.';
    analyzeBtn.disabled = true;
  }
});

