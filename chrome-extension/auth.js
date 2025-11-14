// Authentication utility for Chrome Extension
// API URL - supports both development and production
// Configuration is loaded from config.js (loaded before this file)

// Get API URL from config or default
const API_URL = (() => {
  // Check if config is available (from config.js)
  if (typeof window !== 'undefined' && window.EXTENSION_CONFIG) {
    const config = window.EXTENSION_CONFIG;
    return config.IS_PRODUCTION ? config.PRODUCTION_API_URL : config.API_URL;
  }
  
  // Fallback to localhost for development
  return 'https://ai-seo-ecosystem.onrender.com/api';
})();

// Helper function to get API URL (can be extended to read from storage)
function getApiUrl() {
  // Check if config is available and use it
  if (typeof window !== 'undefined' && window.EXTENSION_CONFIG) {
    const config = window.EXTENSION_CONFIG;
    return config.IS_PRODUCTION ? config.PRODUCTION_API_URL : config.API_URL;
  }
  return API_URL;
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
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
    const apiUrl = getApiUrl();
    console.log('Login function called with email:', email);
    console.log('API URL:', `${apiUrl}/auth/signin`);
    
    const response = await fetch(`${apiUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Login response status:', response.status);
    
    let data;
    try {
      data = await response.json();
      console.log('Login response data:', data);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return { success: false, error: 'Invalid response from server' };
    }

    if (!response.ok) {
      const errorMsg = data.error || `Login failed (${response.status})`;
      console.error('Login failed:', errorMsg);
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
    const errorMsg = error.message || 'Network error. Please check if backend is running.';
    return { success: false, error: errorMsg };
  }
}

// Signup function
async function signup(email, password) {
  try {
    const apiUrl = getApiUrl();
    console.log('Signup function called with email:', email);
    console.log('API URL:', `${apiUrl}/auth/signup`);
    
    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Signup response status:', response.status);
    
    let data;
    try {
      data = await response.json();
      console.log('Signup response data:', data);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return { success: false, error: 'Invalid response from server' };
    }

    if (!response.ok) {
      const errorMsg = data.error || `Signup failed (${response.status})`;
      console.error('Signup failed:', errorMsg);
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
    const errorMsg = error.message || 'Network error. Please check if backend is running.';
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
  const apiUrl = getApiUrl();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers
  });

  // If unauthorized, clear auth
  if (response.status === 401) {
    await clearAuth();
    throw new Error('Session expired. Please login again.');
  }

  return response;
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
  getApiUrl
};

