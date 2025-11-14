const CONFIG = {

  // Set to true for production
  IS_PRODUCTION: true,
  
  // Production API URL (used when IS_PRODUCTION is true)
  PRODUCTION_API_URL: 'https://ai-seo-ecosystem.onrender.com/api'
};

// Export config
if (typeof window !== 'undefined') {
  window.EXTENSION_CONFIG = CONFIG;
}

