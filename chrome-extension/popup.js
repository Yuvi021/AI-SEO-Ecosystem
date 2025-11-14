// API_URL is defined in auth.js (loaded first)

// Initialize immediately - show auth by default
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  // Show auth form by default
  const authContainer = document.getElementById('authContainer');
  const appContainer = document.getElementById('appContainer');
  if (authContainer) {
    authContainer.classList.remove('hidden');
    console.log('Auth container shown');
  }
  if (appContainer) {
    appContainer.classList.remove('show');
  }
  
  // Initialize async
  (async () => {
    try {
      console.log('Starting initialization...');
      
      // Wait for authUtils to be available
      let retries = 0;
      while (!window.authUtils && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
      }
      
      if (!window.authUtils) {
        console.error('authUtils not available after retries');
        return;
      }
      
      console.log('authUtils available');

    // UI Elements
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authError = document.getElementById('authError');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const viewReportBtn = document.getElementById('viewReportBtn');
    const statusDiv = document.getElementById('status');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreValue = document.getElementById('scoreValue');
    const scoreStatus = document.getElementById('scoreStatus');
    const urlDisplay = document.getElementById('urlDisplay');
    const recommendationsDiv = document.getElementById('recommendations');
    const recommendationsList = document.getElementById('recommendationsList');

    // Check if elements exist
    if (!authContainer || !appContainer) {
      console.error('Required elements not found');
      return;
    }

    // Check authentication status
    const authenticated = await window.authUtils.isAuthenticated();
    
    if (authenticated) {
      showApp();
    } else {
      showAuth();
    }

  // Tab switching
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    hideError();
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    hideError();
  });

  // Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Login form submitted');
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Attempting login for:', email);
    hideError();
    
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    
    try {
      // Show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';
      
      // Don't clear fields yet
      const result = await window.authUtils.login(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, showing app');
        // Clear fields only on success
        emailInput.value = '';
        passwordInput.value = '';
        showApp();
      } else {
        console.error('Login failed:', result.error);
        showError(result.error || 'Login failed');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        // Keep password field for retry, but don't clear it
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'An error occurred during login');
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
    
    return false;
  });

  // Signup form submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Signup form submitted');
    
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    hideError();
    
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    
    try {
      // Show loading state
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing up...';
      
      const result = await window.authUtils.signup(email, password);
      console.log('Signup result:', result);
      
      if (result.success) {
        console.log('Signup successful, showing app');
        // Clear fields only on success
        emailInput.value = '';
        passwordInput.value = '';
        showApp();
      } else {
        console.error('Signup failed:', result.error);
        showError(result.error || 'Signup failed');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (error) {
      console.error('Signup error:', error);
      showError(error.message || 'An error occurred during signup');
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
    
    return false;
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    await window.authUtils.logout();
    showAuth();
    // Clear forms
    loginForm.reset();
    signupForm.reset();
  });

  // Show auth UI
  function showAuth() {
    console.log('Showing auth UI');
    if (authContainer) {
      authContainer.classList.remove('hidden');
      authContainer.style.display = 'block';
    }
    if (appContainer) {
      appContainer.classList.remove('show');
      appContainer.style.display = 'none';
    }
  }

  // Show app UI
  async function showApp() {
    console.log('Showing app UI');
    if (authContainer) {
      authContainer.classList.add('hidden');
      authContainer.style.display = 'none';
    }
    if (appContainer) {
      appContainer.classList.add('show');
      appContainer.style.display = 'block';
    }
    
    // Load user info
    const user = await window.authUtils.getUser();
    if (user && userEmail) {
      userEmail.textContent = user.email;
      if (userInfo) userInfo.classList.add('show');
    }
    
    // Initialize app
    await initializeApp();
  }

  // Initialize main app (only once)
  let appInitialized = false;
  async function initializeApp() {
    if (appInitialized) return;
    appInitialized = true;
    
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
      await handleAnalyze(currentUrl);
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
          url: `https://ai-seo-ecosystem.onrender.com/api/analyze?url=${encodeURIComponent(currentUrl)}`
        });
      }
    });

    // Check backend connection on load
    const isConnected = await checkBackendConnection();
    if (!isConnected) {
      statusDiv.style.display = 'block';
      statusDiv.className = 'status error';
      statusDiv.textContent = '⚠️ Backend not connected. Please start the backend server.';
      analyzeBtn.disabled = true;
    }
  }
  
  // Reset initialization flag when showing auth
  const originalShowAuth = showAuth;
  showAuth = function() {
    appInitialized = false;
    originalShowAuth();
  };

  // Handle analyze with auth token
  async function handleAnalyze(currentUrl) {
    const analyzeBtnEl = document.getElementById('analyzeBtn');
    try {
      analyzeBtnEl.disabled = true;
      statusDiv.style.display = 'block';
      statusDiv.className = 'status loading';
      statusDiv.textContent = 'Analyzing page...';
      scoreDisplay.style.display = 'none';
      recommendationsDiv.style.display = 'none';

      // Use apiRequest which includes auth token
      const response = await window.authUtils.apiRequest('/analyze', {
        method: 'POST',
        body: JSON.stringify({ 
          url: currentUrl,
          options: {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
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
      
      // If unauthorized, show login again
      if (error.message.includes('Session expired') || error.message.includes('401')) {
        await window.authUtils.logout();
        showAuth();
        showError('Session expired. Please login again.');
      }
    } finally {
      const analyzeBtnEl = document.getElementById('analyzeBtn');
      analyzeBtnEl.disabled = false;
    }
  }

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

  // Error handling
  function showError(message) {
    console.log('Showing error:', message);
    if (authError) {
      authError.textContent = message;
      authError.classList.add('show');
      // Scroll to error
      authError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      console.error('authError element not found');
      alert(message); // Fallback alert
    }
  }

  function hideError() {
    if (authError) {
      authError.classList.remove('show');
      authError.textContent = '';
    }
  }

  // Check backend connection
  async function checkBackendConnection() {
    try {
      // Use the API URL from auth.js
      const apiUrl = window.authUtils && (await chrome.storage.local.get(['apiUrl'])).apiUrl || 'https://ai-seo-ecosystem.onrender.com/api';
      const baseUrl = apiUrl.replace('/api', '');
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('Backend connection check failed:', error);
    }
    return false;
  }
  
    } catch (error) {
      console.error('Popup initialization error:', error);
      console.error(error.stack);
    }
  })();
});
