const CONFIG = {
  // Set to false for local development, true for production
  IS_PRODUCTION: false,
  
  // Development API URL (used when IS_PRODUCTION is false)
  API_URL: 'http://localhost:3001/api',
  
  // Production API URL (used when IS_PRODUCTION is true)
  PRODUCTION_API_URL: 'https://ai-seo-ecosystem.onrender.com/api'
};

// Export config
if (typeof window !== 'undefined') {
  window.EXTENSION_CONFIG = CONFIG;
}

