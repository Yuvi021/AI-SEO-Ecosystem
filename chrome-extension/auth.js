// Authentication utility for Chrome Extension
// API URL - supports both development and production
// Configuration is loaded from config.js (loaded before this file)

// Get API URL from config or default
const API_URL = (() => {
  // Check if config is available (from config.js)
  if (typeof window !== 'undefined' && window.EXTENSION_CONFIG) {
    const config = window.EXTENSION_CONFIG;
    if (config.IS_PRODUCTION) {
      return config.PRODUCTION_API_URL || 'https://ai-seo-ecosystem.onrender.com/api';
    } else {
      return config.API_URL || 'http://localhost:3001/api';
    }
  }
  
  // Fallback to production for safety
  return 'https://ai-seo-ecosystem.onrender.com/api';
})();

// Helper function to get API URL (can be extended to read from storage)
function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiUrl', 'isProduction'], (result) => {
      // Priority: 1. Config file, 2. Storage, 3. Fallback
      let apiUrl = null;
      let isProduction = null;
      
      // Check config first (highest priority)
      if (typeof window !== 'undefined' && window.EXTENSION_CONFIG) {
        const config = window.EXTENSION_CONFIG;
        isProduction = result.isProduction !== undefined ? result.isProduction : config.IS_PRODUCTION;
        console.log('📋 Config found - IS_PRODUCTION:', isProduction);
        
        if (isProduction) {
          apiUrl = config.PRODUCTION_API_URL || 'https://ai-seo-ecosystem.onrender.com/api';
        } else {
          apiUrl = config.API_URL || 'http://localhost:3001/api';
        }
        console.log('🌐 Using API URL from config:', apiUrl);
        resolve(apiUrl);
        return;
      }
      
      // Fallback to storage if config not available
      if (result.apiUrl) {
        console.log('🌐 Using API URL from storage:', result.apiUrl);
        resolve(result.apiUrl);
        return;
      }
      
      // Final fallback
      console.log('🌐 Using fallback API URL:', API_URL);
      resolve(API_URL);
    });
  });
}

// Get auth token from storage
async function getAuthToken() {
  const result = await chrome.storage.local.get(['authToken']);
  return result.authToken || null;
}

// Get user data from storage
async function getUser() {
  const result = await chrome.storage.local.get(['user']);
  return result.user ? JSON.parse(result.user) : null;
}

// Save auth token and user data
async function saveAuth(token, user) {
  await chrome.storage.local.set({
    authToken: token,
    user: JSON.stringify(user)
  });
}

// Clear auth data
async function clearAuth() {
  await chrome.storage.local.remove(['authToken', 'user']);
}

// Check if user is authenticated
async function isAuthenticated() {
  const token = await getAuthToken();
  if (!token) return false;
  
  // Verify token is still valid
  try {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

// Login function
async function login(email, password) {
  try {
    const apiUrl = await getApiUrl();
    console.log('🔐 Login function called with email:', email);
    console.log('🌐 API URL being used:', apiUrl);
    console.log('🔗 Full signin URL:', `${apiUrl}/auth/signin`);
    console.log('📋 Config check:', window.EXTENSION_CONFIG ? 'Config loaded' : 'Config NOT loaded');
    
    const response = await fetch(`${apiUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ email, password })
    });

    console.log('Login response status:', response.status);
    console.log('Login response headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      const text = await response.text();
      console.log('Login response text:', text);
      if (text) {
        data = JSON.parse(text);
        console.log('Login response data:', data);
      } else {
        console.warn('Empty response body');
        data = {};
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return { success: false, error: `Invalid response from server (${response.status}). Please check if the backend is running.` };
    }

    if (!response.ok) {
      let errorMsg = data.error || data.message || `Login failed (${response.status} ${response.statusText})`;
      
      // Include details if available (for debugging)
      if (data.details && process.env.NODE_ENV !== 'production') {
        errorMsg += `\n\nDetails: ${JSON.stringify(data.details, null, 2)}`;
      }
      
      console.error('Login failed:', errorMsg);
      console.error('Response data:', data);
      
      // Special handling for different error codes
      if (response.status === 503) {
        return { success: false, error: 'Database unavailable. Please check if MongoDB is configured and running.' };
      }
      if (response.status === 500) {
        // Show the actual error message from server if available
        const serverError = data.error || 'Internal server error';
        return { success: false, error: `Server error: ${serverError}. Please check the backend logs for more details.` };
      }
      if (response.status === 0) {
        return { success: false, error: `Cannot connect to server at ${apiUrl}. Please check if the backend is running and accessible.` };
      }
      return { success: false, error: errorMsg };
    }

    if (data.token && data.user) {
      console.log('Saving auth token and user data');
      await saveAuth(data.token, data.user);
      console.log('Auth saved successfully');
      return { success: true, user: data.user };
    } else {
      console.error('Missing token or user in response');
      return { success: false, error: 'Invalid response from server - missing token or user' };
    }
  } catch (error) {
    console.error('Login exception:', error);
    console.error('Error stack:', error.stack);
    let errorMsg = error.message || 'Network error.';
    const currentApiUrl = await getApiUrl().catch(() => apiUrl);
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('CORS'))) {
      errorMsg = `Cannot connect to server at ${currentApiUrl}. Please check:\n1. The backend server is running\n2. The API URL is correct\n3. CORS is properly configured\n4. Your internet connection is working`;
    }
    return { success: false, error: errorMsg };
  }
}

// Signup function
async function signup(email, password) {
  try {
    const apiUrl = await getApiUrl();
    console.log('Signup function called with email:', email);
    console.log('API URL:', `${apiUrl}/auth/signup`);
    
    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ email, password })
    });

    console.log('Signup response status:', response.status);
    console.log('Signup response headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      const text = await response.text();
      console.log('Signup response text:', text);
      if (text) {
        data = JSON.parse(text);
        console.log('Signup response data:', data);
      } else {
        console.warn('Empty response body');
        data = {};
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return { success: false, error: `Invalid response from server (${response.status}). Please check if the backend is running.` };
    }

    if (!response.ok) {
      let errorMsg = data.error || data.message || `Signup failed (${response.status} ${response.statusText})`;
      
      // Include details if available (for debugging)
      if (data.details && process.env.NODE_ENV !== 'production') {
        errorMsg += `\n\nDetails: ${JSON.stringify(data.details, null, 2)}`;
      }
      
      console.error('Signup failed:', errorMsg);
      console.error('Response data:', data);
      
      // Special handling for different error codes
      if (response.status === 503) {
        return { success: false, error: 'Database unavailable. Please check if MongoDB is configured and running.' };
      }
      if (response.status === 500) {
        // Show the actual error message from server if available
        const serverError = data.error || 'Internal server error';
        return { success: false, error: `Server error: ${serverError}. Please check the backend logs for more details.` };
      }
      if (response.status === 0) {
        return { success: false, error: `Cannot connect to server at ${apiUrl}. Please check if the backend is running and accessible.` };
      }
      return { success: false, error: errorMsg };
    }

    if (data.token && data.user) {
      console.log('Saving auth token and user data');
      await saveAuth(data.token, data.user);
      console.log('Auth saved successfully');
      return { success: true, user: data.user };
    } else {
      console.error('Missing token or user in response');
      return { success: false, error: 'Invalid response from server - missing token or user' };
    }
  } catch (error) {
    console.error('Signup exception:', error);
    console.error('Error stack:', error.stack);
    let errorMsg = error.message || 'Network error.';
    const currentApiUrl = await getApiUrl().catch(() => apiUrl);
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('CORS'))) {
      errorMsg = `Cannot connect to server at ${currentApiUrl}. Please check:\n1. The backend server is running\n2. The API URL is correct\n3. CORS is properly configured\n4. Your internet connection is working`;
    }
    return { success: false, error: errorMsg };
  }
}

// Logout function
async function logout() {
  await clearAuth();
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  const apiUrl = await getApiUrl();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit'
    });

    // If unauthorized, clear auth
    if (response.status === 401) {
      await clearAuth();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    // If it's a network error, provide more helpful message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Cannot connect to server. Please check if ${apiUrl} is accessible.`);
    }
    throw error;
  }
}

// Clear stored API URL settings (useful for debugging)
async function clearApiUrlSettings() {
  await chrome.storage.local.remove(['apiUrl', 'isProduction']);
  console.log('🧹 Cleared stored API URL settings');
}

// Make functions globally available for popup.js
window.authUtils = {
  getAuthToken,
  getUser,
  saveAuth,
  clearAuth,
  isAuthenticated,
  login,
  signup,
  logout,
  apiRequest,
  getApiUrl,
  clearApiUrlSettings
};

