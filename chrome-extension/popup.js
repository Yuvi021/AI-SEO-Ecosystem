const API_URL = 'http://localhost:3000/api';

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

  viewReportBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('report.html')
    });
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
});

