import { openAIService } from '../utils/openaiService.js';
import keywordDataService from '../services/keywordDataService.js';

/**
 * Advanced Keyword Research Agent
 * Provides comprehensive keyword research including volume, difficulty, trends, and opportunities
 */

export class KeywordResearchAgent {
  constructor() {
    this.name = 'KeywordResearchAgent';
    this.status = 'ready';
    this.useRealTimeData = keywordDataService.isConfigured();
  }

  /**
   * Perform comprehensive keyword research
   */
  async research(seedKeywords, options = {}) {
    try {
      this.status = 'researching';
      
      const research = {
        seedKeywords,
        keywords: [],
        clusters: [],
        questions: [],
        longTail: [],
        trending: [],
        seasonal: [],
        relatedTopics: [],
        summary: {
          totalKeywords: 0,
          avgDifficulty: 0,
          totalVolume: 0,
          opportunities: 0
        },
        recommendations: []
      };

      // Expand seed keywords
      for (const seed of seedKeywords) {
        const expanded = await this.expandKeyword(seed, options);
        research.keywords.push(...expanded);
      }

      // Remove duplicates
      research.keywords = this.deduplicateKeywords(research.keywords);
      
      // Generate keyword clusters
      research.clusters = this.clusterKeywords(research.keywords);
      
      // Extract questions
      research.questions = this.extractQuestions(research.keywords);
      
      // Identify long-tail opportunities
      research.longTail = this.identifyLongTail(research.keywords);
      
      // Analyze trends (if AI available)
      if (openAIService.isAvailable()) {
        research.trending = await this.analyzeTrends(seedKeywords);
        research.seasonal = await this.analyzeSeasonality(seedKeywords);
        research.relatedTopics = await this.findRelatedTopics(seedKeywords);
      }
      
      // Calculate summary
      research.summary = this.calculateSummary(research.keywords);
      
      // Generate recommendations
      research.recommendations = this.generateRecommendations(research);

      this.status = 'ready';
      return research;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Keyword research failed: ${error.message}`);
    }
  }

  async expandKeyword(seed, options = {}) {
    const keywords = [];
    const allKeywords = [seed];
    
    // Get real-time keyword suggestions if available
    if (this.useRealTimeData) {
      try {
        const suggestions = await keywordDataService.getKeywordSuggestions(seed, 30);
        allKeywords.push(...suggestions);
        console.log(`✓ Got ${suggestions.length} real-time suggestions for "${seed}"`);
      } catch (error) {
        console.warn('Real-time suggestions failed, using fallback:', error.message);
      }
    }

    // Generate variations as fallback or supplement
    if (allKeywords.length < 10) {
      const variations = this.generateVariations(seed);
      allKeywords.push(...variations.slice(0, 15));
    }

    // AI-powered expansion
    if (openAIService.isAvailable() && allKeywords.length < 30) {
      try {
        const aiKeywords = await this.performAIExpansion(seed);
        allKeywords.push(...aiKeywords.slice(0, 20));
      } catch (error) {
        console.warn('AI keyword expansion failed:', error.message);
      }
    }

    // Remove duplicates
    const uniqueKeywords = [...new Set(allKeywords)];

    // Get real-time metrics for all keywords
    if (this.useRealTimeData) {
      try {
        const metrics = await keywordDataService.getKeywordMetrics(
          uniqueKeywords.slice(0, 50),
          options.location || 'United States',
          options.language || 'en'
        );
        
        // Convert to our format
        keywords.push(...metrics.map(m => this.convertToKeywordFormat(m)));
        console.log(`✓ Got real-time metrics for ${metrics.length} keywords`);
      } catch (error) {
        console.warn('Real-time metrics failed, using estimates:', error.message);
        // Fallback to estimates
        for (const kw of uniqueKeywords.slice(0, 30)) {
          keywords.push(await this.analyzeKeyword(kw));
        }
      }
    } else {
      // Use estimated data
      for (const kw of uniqueKeywords.slice(0, 30)) {
        keywords.push(await this.analyzeKeyword(kw));
      }
    }

    return keywords;
  }

  convertToKeywordFormat(metric) {
    return {
      keyword: metric.keyword,
      volume: metric.volume,
      difficulty: metric.difficulty || metric.competitionIndex || 50,
      cpc: parseFloat(metric.cpc) || 0,
      competition: metric.competition,
      intent: this.detectIntent(metric.keyword),
      trend: Array.isArray(metric.trend) && metric.trend.length > 0 ? 
        this.analyzeTrendData(metric.trend) : 'stable',
      opportunity: this.calculateOpportunityFromMetrics(metric),
      source: metric.source || 'realtime',
      realTimeData: true
    };
  }

  analyzeTrendData(monthlyData) {
    if (!monthlyData || monthlyData.length < 3) return 'stable';
    
    const recent = monthlyData.slice(-3).map(m => m.search_volume || 0);
    const older = monthlyData.slice(0, 3).map(m => m.search_volume || 0);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.2) return 'rising';
    if (recentAvg < olderAvg * 0.8) return 'declining';
    return 'stable';
  }

  calculateOpportunityFromMetrics(metric) {
    const volume = metric.volume || 0;
    const difficulty = metric.difficulty || metric.competitionIndex || 50;
    
    // Real opportunity score based on actual data
    const score = (volume / 100) * (100 - difficulty) / 100;
    
    if (score > 50) return 'high';
    if (score > 15) return 'medium';
    return 'low';
  }

  async analyzeKeyword(keyword) {
    return {
      keyword,
      volume: this.estimateVolume(keyword),
      difficulty: this.estimateDifficulty(keyword),
      cpc: this.estimateCPC(keyword),
      competition: this.estimateCompetition(keyword),
      intent: this.detectIntent(keyword),
      trend: 'stable',
      opportunity: this.calculateOpportunity(keyword)
    };
  }

  estimateVolume(keyword) {
    const wordCount = keyword.split(' ').length;
    let volume = 1000;

    // Shorter keywords typically have higher volume
    if (wordCount === 1) volume = 50000;
    else if (wordCount === 2) volume = 10000;
    else if (wordCount === 3) volume = 3000;
    else if (wordCount === 4) volume = 1000;
    else volume = 500;

    // Adjust for commercial intent
    if (/buy|purchase|price|cheap|best|review/.test(keyword)) {
      volume *= 0.7;
    }

    // Adjust for question keywords
    if (/how|what|why|when|where/.test(keyword)) {
      volume *= 1.2;
    }

    return Math.round(volume + (Math.random() * volume * 0.3));
  }

  estimateDifficulty(keyword) {
    const wordCount = keyword.split(' ').length;
    let difficulty = 50;

    // Longer keywords are typically easier
    if (wordCount >= 4) difficulty = 25;
    else if (wordCount === 3) difficulty = 35;
    else if (wordCount === 2) difficulty = 55;
    else difficulty = 75;

    // Commercial keywords are harder
    if (/buy|purchase|price|cheap|best/.test(keyword)) {
      difficulty += 15;
    }

    // Question keywords are often easier
    if (/how|what|why/.test(keyword)) {
      difficulty -= 10;
    }

    return Math.max(0, Math.min(100, difficulty + (Math.random() * 10 - 5)));
  }

  estimateCPC(keyword) {
    let cpc = 1.0;

    // Commercial intent increases CPC
    if (/buy|purchase|price/.test(keyword)) cpc = 3.5;
    else if (/best|review|compare/.test(keyword)) cpc = 2.5;
    else if (/how|what|guide/.test(keyword)) cpc = 0.8;

    return (cpc + (Math.random() * cpc * 0.5)).toFixed(2);
  }

  estimateCompetition(keyword) {
    const difficulty = this.estimateDifficulty(keyword);
    if (difficulty < 30) return 'low';
    if (difficulty < 60) return 'medium';
    return 'high';
  }

  detectIntent(keyword) {
    const kw = keyword.toLowerCase();
    
    if (/how|what|why|when|where|guide|tutorial|learn|tips/.test(kw)) {
      return 'informational';
    }
    if (/buy|purchase|order|shop|price|cheap|discount|deal/.test(kw)) {
      return 'transactional';
    }
    if (/best|top|review|compare|vs|versus|alternative/.test(kw)) {
      return 'commercial';
    }
    if (/login|sign in|website|official|near me/.test(kw)) {
      return 'navigational';
    }
    
    return 'informational';
  }

  calculateOpportunity(keyword) {
    const volume = this.estimateVolume(keyword);
    const difficulty = this.estimateDifficulty(keyword);
    
    // Opportunity score: high volume + low difficulty = high opportunity
    const score = (volume / 1000) * (100 - difficulty) / 100;
    
    if (score > 30) return 'high';
    if (score > 10) return 'medium';
    return 'low';
  }

  generateVariations(seed) {
    const variations = [];
    const words = seed.split(' ');
    
    // Modifiers
    const modifiers = {
      prefix: ['best', 'top', 'how to', 'what is', 'guide to', 'tips for', 'free'],
      suffix: ['guide', 'tips', 'tutorial', 'examples', 'tools', 'software', 'online', '2024']
    };

    // Add prefix variations
    modifiers.prefix.forEach(prefix => {
      variations.push(`${prefix} ${seed}`);
    });

    // Add suffix variations
    modifiers.suffix.forEach(suffix => {
      variations.push(`${seed} ${suffix}`);
    });

    // Question variations
    variations.push(`how to ${seed}`);
    variations.push(`what is ${seed}`);
    variations.push(`why ${seed}`);
    variations.push(`when to ${seed}`);

    // Comparison variations
    if (words.length <= 2) {
      variations.push(`${seed} vs`);
      variations.push(`${seed} alternatives`);
      variations.push(`${seed} comparison`);
    }

    return variations;
  }

  async performAIExpansion(seed) {
    const prompt = `Generate keyword variations and related keywords for: "${seed}"

Provide 20 diverse keyword suggestions including:
- Long-tail variations
- Question-based keywords
- Related topics
- Semantic variations
- Commercial intent keywords
- Informational keywords

Return as JSON array:
["keyword 1", "keyword 2", ...]`;

    try {
      const result = await openAIService.generateJSON(
        prompt,
        [],
        { temperature: 0.8, maxTokens: 500 }
      );

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn('AI keyword expansion failed:', error.message);
      return [];
    }
  }

  deduplicateKeywords(keywords) {
    const seen = new Set();
    return keywords.filter(kw => {
      const normalized = kw.keyword.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  clusterKeywords(keywords) {
    const clusters = {};
    
    keywords.forEach(kw => {
      const words = kw.keyword.toLowerCase().split(' ');
      const mainWord = words[0];
      
      if (!clusters[mainWord]) {
        clusters[mainWord] = {
          topic: mainWord,
          keywords: [],
          totalVolume: 0,
          avgDifficulty: 0
        };
      }
      
      clusters[mainWord].keywords.push(kw);
      clusters[mainWord].totalVolume += kw.volume;
    });

    // Calculate averages and sort
    return Object.values(clusters)
      .map(cluster => {
        cluster.avgDifficulty = cluster.keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / cluster.keywords.length;
        return cluster;
      })
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 10);
  }

  extractQuestions(keywords) {
    return keywords
      .filter(kw => /^(how|what|why|when|where|who|which|can|should|will|do|does|is|are)/.test(kw.keyword.toLowerCase()))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20);
  }

  identifyLongTail(keywords) {
    return keywords
      .filter(kw => kw.keyword.split(' ').length >= 4)
      .filter(kw => kw.difficulty < 40)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20);
  }

  async analyzeTrends(seedKeywords) {
    const prompt = `Analyze current trends for these keywords: ${seedKeywords.join(', ')}

Identify:
- Rising trends
- Declining trends
- Seasonal patterns
- Emerging topics

Return as JSON:
{
  "rising": ["trending keyword 1"],
  "declining": ["declining keyword 1"],
  "emerging": ["emerging topic 1"]
}`;

    try {
      return await openAIService.generateJSON(
        prompt,
        { rising: [], declining: [], emerging: [] },
        { temperature: 0.7, maxTokens: 500 }
      );
    } catch (error) {
      return { rising: [], declining: [], emerging: [] };
    }
  }

  async analyzeSeasonality(seedKeywords) {
    const prompt = `Analyze seasonality for: ${seedKeywords.join(', ')}

Identify which months have peak interest.

Return as JSON:
{
  "seasonal": true/false,
  "peakMonths": ["January", "December"],
  "pattern": "description"
}`;

    try {
      return await openAIService.generateJSON(
        prompt,
        { seasonal: false, peakMonths: [], pattern: '' },
        { temperature: 0.5, maxTokens: 300 }
      );
    } catch (error) {
      return { seasonal: false, peakMonths: [], pattern: '' };
    }
  }

  async findRelatedTopics(seedKeywords) {
    const prompt = `Find related topics and subtopics for: ${seedKeywords.join(', ')}

Return as JSON array of topics:
["related topic 1", "related topic 2"]`;

    try {
      const result = await openAIService.generateJSON(
        prompt,
        [],
        { temperature: 0.7, maxTokens: 300 }
      );
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return [];
    }
  }

  calculateSummary(keywords) {
    return {
      totalKeywords: keywords.length,
      avgDifficulty: (keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / keywords.length).toFixed(1),
      totalVolume: keywords.reduce((sum, kw) => sum + kw.volume, 0),
      avgVolume: Math.round(keywords.reduce((sum, kw) => sum + kw.volume, 0) / keywords.length),
      opportunities: keywords.filter(kw => kw.opportunity === 'high').length,
      byIntent: {
        informational: keywords.filter(kw => kw.intent === 'informational').length,
        commercial: keywords.filter(kw => kw.intent === 'commercial').length,
        transactional: keywords.filter(kw => kw.intent === 'transactional').length,
        navigational: keywords.filter(kw => kw.intent === 'navigational').length
      },
      byDifficulty: {
        easy: keywords.filter(kw => kw.difficulty < 30).length,
        medium: keywords.filter(kw => kw.difficulty >= 30 && kw.difficulty < 60).length,
        hard: keywords.filter(kw => kw.difficulty >= 60).length
      }
    };
  }

  generateRecommendations(research) {
    const recommendations = [];

    // High opportunity keywords
    const highOpp = research.keywords.filter(kw => kw.opportunity === 'high').slice(0, 5);
    if (highOpp.length > 0) {
      recommendations.push({
        type: 'quick_wins',
        priority: 'high',
        message: `${highOpp.length} high-opportunity keywords identified`,
        keywords: highOpp.map(kw => kw.keyword),
        action: 'Create content targeting these keywords first'
      });
    }

    // Long-tail opportunities
    if (research.longTail.length > 0) {
      recommendations.push({
        type: 'long_tail',
        priority: 'high',
        message: `${research.longTail.length} long-tail keywords with low competition`,
        action: 'Target long-tail keywords for easier rankings'
      });
    }

    // Question keywords
    if (research.questions.length > 0) {
      recommendations.push({
        type: 'questions',
        priority: 'medium',
        message: `${research.questions.length} question-based keywords found`,
        action: 'Create FAQ content and featured snippet opportunities'
      });
    }

    // Keyword clusters
    if (research.clusters.length > 0) {
      const topCluster = research.clusters[0];
      recommendations.push({
        type: 'content_cluster',
        priority: 'medium',
        message: `Build content cluster around "${topCluster.topic}" (${topCluster.keywords.length} keywords)`,
        action: 'Create pillar page and supporting content'
      });
    }

    // Trending keywords
    if (research.trending?.rising?.length > 0) {
      recommendations.push({
        type: 'trending',
        priority: 'high',
        message: `Capitalize on rising trends: ${research.trending.rising.slice(0, 3).join(', ')}`,
        action: 'Create timely content for trending topics'
      });
    }

    return recommendations;
  }

  async execute(seedKeywords, options = {}) {
    return await this.research(seedKeywords, options);
  }

  /**
   * Get service status and configuration
   */
  getStatus() {
    const providerInfo = keywordDataService.getProviderInfo();
    return {
      agent: this.name,
      status: this.status,
      realTimeData: this.useRealTimeData,
      provider: providerInfo.provider,
      configured: providerInfo.configured,
      features: providerInfo.features
    };
  }
}

export default KeywordResearchAgent;
