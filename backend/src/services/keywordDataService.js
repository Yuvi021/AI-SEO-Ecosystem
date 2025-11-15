import axios from 'axios';

/**
 * Real-time Keyword Data Service
 * Integrates with multiple SEO data providers for actual keyword metrics
 * 
 * Supported APIs:
 * 1. DataForSEO - Comprehensive SEO data (recommended)
 * 2. SEMrush API - Industry standard
 * 3. ValueSERP - Google search data
 * 4. SerpAPI - SERP data
 */
class KeywordDataService {
  constructor() {
    this.provider = process.env.KEYWORD_DATA_PROVIDER || 'serpapi';
    this.config = {
      dataforseo: {
        login: process.env.DATAFORSEO_LOGIN,
        password: process.env.DATAFORSEO_PASSWORD,
        baseUrl: 'https://api.dataforseo.com/v3'
      },
      semrush: {
        apiKey: process.env.SEMRUSH_API_KEY,
        baseUrl: 'https://api.semrush.com'
      },
      valueserp: {
        apiKey: process.env.VALUESERP_API_KEY,
        baseUrl: 'https://api.valueserp.com'
      },
      serpapi: {
        apiKey: process.env.SERPAPI_KEY,
        baseUrl: 'https://serpapi.com'
      }
    };
  }

  /**
   * Get real-time keyword metrics
   */
  async getKeywordMetrics(keywords, location = 'United States', language = 'en') {
    try {
      switch (this.provider) {
        case 'dataforseo':
          return await this.getDataForSEOMetrics(keywords, location, language);
        case 'semrush':
          return await this.getSEMrushMetrics(keywords, location);
        case 'valueserp':
          return await this.getValueSERPMetrics(keywords, location);
        case 'serpapi':
          return await this.getSerpAPIMetrics(keywords, location);
        default:
          throw new Error(`Unknown provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Keyword metrics fetch failed:', error.message);
      throw error;
    }
  }

  /**
   * DataForSEO - Most comprehensive and affordable
   */
  async getDataForSEOMetrics(keywords, location, language) {
    const { login, password, baseUrl } = this.config.dataforseo;
    
    if (!login || !password) {
      throw new Error('DataForSEO credentials not configured');
    }

    const auth = Buffer.from(`${login}:${password}`).toString('base64');
    
    const response = await axios.post(
      `${baseUrl}/keywords_data/google_ads/search_volume/live`,
      [{
        keywords,
        location_name: location,
        language_name: language
      }],
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${response.data.status_message}`);
    }

    return this.parseDataForSEOResponse(response.data.tasks[0].result);
  }

  parseDataForSEOResponse(results) {
    if (!results || !Array.isArray(results)) return [];

    return results.map(item => ({
      keyword: item.keyword,
      volume: item.search_volume || 0,
      cpc: item.cpc || 0,
      competition: this.mapCompetitionLevel(item.competition),
      competitionIndex: item.competition_index || 0,
      difficulty: this.calculateDifficulty(item),
      trend: item.monthly_searches || [],
      lowTopBid: item.low_top_of_page_bid || 0,
      highTopBid: item.high_top_of_page_bid || 0,
      source: 'dataforseo'
    }));
  }

  /**
   * SEMrush API
   */
  async getSEMrushMetrics(keywords, location) {
    const { apiKey, baseUrl } = this.config.semrush;
    
    if (!apiKey) {
      throw new Error('SEMrush API key not configured');
    }

    const database = this.getLocationDatabase(location);
    const results = [];

    for (const keyword of keywords) {
      try {
        const response = await axios.get(`${baseUrl}/`, {
          params: {
            type: 'phrase_all',
            key: apiKey,
            phrase: keyword,
            database,
            export_columns: 'Ph,Nq,Cp,Co,Nr,Td'
          }
        });

        const parsed = this.parseSEMrushResponse(response.data, keyword);
        if (parsed) results.push(parsed);
      } catch (error) {
        console.warn(`SEMrush failed for "${keyword}":`, error.message);
      }
    }

    return results;
  }

  parseSEMrushResponse(data, keyword) {
    const lines = data.trim().split('\n');
    if (lines.length < 2) return null;

    const values = lines[1].split(';');
    
    return {
      keyword: values[0] || keyword,
      volume: parseInt(values[1]) || 0,
      cpc: parseFloat(values[2]) || 0,
      competition: parseFloat(values[3]) || 0,
      competitionIndex: Math.round(parseFloat(values[3]) * 100) || 0,
      results: parseInt(values[4]) || 0,
      difficulty: parseInt(values[5]) || 50,
      trend: [],
      source: 'semrush'
    };
  }

  /**
   * ValueSERP - Google search volume data
   */
  async getValueSERPMetrics(keywords, location) {
    const { apiKey, baseUrl } = this.config.valueserp;
    
    if (!apiKey) {
      throw new Error('ValueSERP API key not configured');
    }

    const results = [];

    for (const keyword of keywords) {
      try {
        const response = await axios.get(`${baseUrl}/search`, {
          params: {
            api_key: apiKey,
            q: keyword,
            location: location,
            google_domain: 'google.com',
            gl: 'us',
            hl: 'en',
            output: 'json'
          }
        });

        const parsed = this.parseValueSERPResponse(response.data, keyword);
        if (parsed) results.push(parsed);
      } catch (error) {
        console.warn(`ValueSERP failed for "${keyword}":`, error.message);
      }
    }

    return results;
  }

  parseValueSERPResponse(data, keyword) {
    return {
      keyword,
      volume: data.search_information?.total_results || 0,
      cpc: 0, // ValueSERP doesn't provide CPC
      competition: 'unknown',
      competitionIndex: 50,
      difficulty: this.estimateDifficultyFromResults(data.search_information?.total_results),
      results: data.search_information?.total_results || 0,
      trend: [],
      relatedSearches: data.related_searches?.map(s => s.query) || [],
      source: 'valueserp'
    };
  }

  /**
   * SerpAPI - Alternative SERP data provider
   */
  async getSerpAPIMetrics(keywords, location) {
    const { apiKey, baseUrl } = this.config.serpapi;
    
    if (!apiKey) {
      throw new Error('SerpAPI key not configured');
    }

    const results = [];

    for (const keyword of keywords) {
      try {
        const response = await axios.get(`${baseUrl}/search`, {
          params: {
            api_key: apiKey,
            q: keyword,
            location,
            engine: 'google',
            google_domain: 'google.com'
          }
        });

        const parsed = this.parseSerpAPIResponse(response.data, keyword);
        if (parsed) results.push(parsed);
      } catch (error) {
        console.warn(`SerpAPI failed for "${keyword}":`, error.message);
      }
}

    return results;
  }

  parseSerpAPIResponse(data, keyword) {
    return {
      keyword,
      volume: data.search_information?.total_results || 0,
      cpc: 0,
      competition: 'unknown',
      competitionIndex: 50,
      difficulty: this.estimateDifficultyFromResults(data.search_information?.total_results),
      results: data.search_information?.total_results || 0,
      trend: [],
      relatedSearches: data.related_searches?.map(s => s.query) || [],
      source: 'serpapi'
    };
  }

  /**
   * Get keyword suggestions (real-time)
   */
  async getKeywordSuggestions(seed, limit = 50) {
    try {
      switch (this.provider) {
        case 'dataforseo':
          return await this.getDataForSEOSuggestions(seed, limit);
        case 'semrush':
          return await this.getSEMrushSuggestions(seed, limit);
        default:
          return await this.getGoogleAutocompleteSuggestions(seed, limit);
      }
    } catch (error) {
      console.error('Keyword suggestions fetch failed:', error.message);
      return [];
    }
  }

  async getDataForSEOSuggestions(seed, limit) {
    const { login, password, baseUrl } = this.config.dataforseo;
    
    if (!login || !password) {
      return [];
    }

    const auth = Buffer.from(`${login}:${password}`).toString('base64');
    
    const response = await axios.post(
      `${baseUrl}/keywords_data/google_ads/keywords_for_keywords/live`,
      [{
        keywords: [seed],
        location_name: 'United States',
        language_name: 'en'
      }],
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status_code !== 20000) {
      return [];
    }

    const results = response.data.tasks[0]?.result || [];
    return results
      .slice(0, limit)
      .map(item => item.keyword)
      .filter(Boolean);
  }

  async getSEMrushSuggestions(seed, limit) {
    const { apiKey, baseUrl } = this.config.semrush;
    
    if (!apiKey) {
      return [];
    }

    const response = await axios.get(`${baseUrl}/`, {
      params: {
        type: 'phrase_related',
        key: apiKey,
        phrase: seed,
        database: 'us',
        export_columns: 'Ph',
        display_limit: limit
      }
    });

    const lines = response.data.trim().split('\n');
    return lines.slice(1).map(line => line.split(';')[0]).filter(Boolean);
  }

  async getGoogleAutocompleteSuggestions(seed, limit) {
    try {
      const response = await axios.get('http://suggestqueries.google.com/complete/search', {
        params: {
          client: 'firefox',
          q: seed
        }
      });

      return response.data[1]?.slice(0, limit) || [];
    } catch (error) {
      console.warn('Google autocomplete failed:', error.message);
      return [];
    }
  }

  /**
   * Helper methods
   */
  mapCompetitionLevel(value) {
    if (typeof value === 'string') return value.toLowerCase();
    if (value < 0.33) return 'low';
    if (value < 0.66) return 'medium';
    return 'high';
  }

  calculateDifficulty(item) {
    // Calculate difficulty based on competition and volume
    const competition = item.competition_index || 50;
    const volume = item.search_volume || 0;
    
    let difficulty = competition;
    
    // High volume increases difficulty
    if (volume > 10000) difficulty += 10;
    else if (volume > 1000) difficulty += 5;
    
    return Math.min(100, Math.max(0, difficulty));
  }

  estimateDifficultyFromResults(results) {
    if (!results) return 50;
    if (results < 1000000) return 20;
    if (results < 10000000) return 40;
    if (results < 100000000) return 60;
    return 80;
  }

  getLocationDatabase(location) {
    const mapping = {
      'United States': 'us',
      'United Kingdom': 'uk',
      'Canada': 'ca',
      'Australia': 'au',
      'Germany': 'de',
      'France': 'fr',
      'Spain': 'es',
      'Italy': 'it'
    };
    return mapping[location] || 'us';
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    const config = this.config[this.provider];
    if (!config) return false;

    switch (this.provider) {
      case 'dataforseo':
        return !!(config.login && config.password);
      case 'semrush':
      case 'valueserp':
      case 'serpapi':
        return !!config.apiKey;
      default:
        return false;
    }
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      configured: this.isConfigured(),
      features: this.getProviderFeatures()
    };
  }

  getProviderFeatures() {
    const features = {
      dataforseo: {
        volume: true,
        cpc: true,
        competition: true,
        difficulty: true,
        trends: true,
        suggestions: true,
        cost: 'low'
      },
      semrush: {
        volume: true,
        cpc: true,
        competition: true,
        difficulty: true,
        trends: false,
        suggestions: true,
        cost: 'high'
      },
      valueserp: {
        volume: false,
        cpc: false,
        competition: false,
        difficulty: false,
        trends: false,
        suggestions: false,
        cost: 'medium'
      },
      serpapi: {
        volume: false,
        cpc: false,
        competition: false,
        difficulty: false,
        trends: false,
        suggestions: false,
        cost: 'medium'
      }
    };

    return features[this.provider] || {};
  }
}

export default new KeywordDataService();
