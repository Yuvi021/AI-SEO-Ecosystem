import { openAIService } from '../utils/openaiService.js';
import axios from 'axios';

/**
 * SERP Analysis Agent - Analyzes search engine results pages
 * Provides competitive intelligence, ranking opportunities, and SERP features
 */
export class SERPAnalysisAgent {
  constructor() {
    this.name = 'SERPAnalysisAgent';
    this.status = 'ready';
  }

  /**
   * Analyze SERP for given keywords
   */
  async analyze(keywords, options = {}) {
    try {
      this.status = 'analyzing';
      
      const results = {
        keywords: [],
        serpFeatures: [],
        competitorAnalysis: [],
        rankingOpportunities: [],
        contentGaps: [],
        recommendations: []
      };

      // Analyze each keyword
      for (const keyword of keywords.slice(0, 5)) {
        const serpData = await this.analyzeSERPForKeyword(keyword, options);
        results.keywords.push(serpData);
      }

      // Aggregate SERP features
      results.serpFeatures = this.aggregateSERPFeatures(results.keywords);
      
      // Identify ranking opportunities
      results.rankingOpportunities = this.identifyRankingOpportunities(results.keywords);
      
      // Analyze competitors
      results.competitorAnalysis = this.analyzeCompetitors(results.keywords);
      
      // Find content gaps
      results.contentGaps = await this.findContentGaps(results.keywords);
      
      // Generate recommendations
      results.recommendations = this.generateRecommendations(results);

      this.status = 'ready';
      return results;
    } catch (error) {
      this.status = 'error';
      throw new Error(`SERP analysis failed: ${error.message}`);
    }
  }

  async analyzeSERPForKeyword(keyword, options = {}) {
    const serpData = {
      keyword,
      difficulty: 0,
      volume: 0,
      cpc: 0,
      competition: 'unknown',
      serpFeatures: [],
      topResults: [],
      peopleAlsoAsk: [],
      relatedSearches: [],
      intent: 'unknown'
    };

    // Use AI to analyze SERP if available
    if (openAIService.isAvailable()) {
      try {
        const aiAnalysis = await this.performAISERPAnalysis(keyword);
        Object.assign(serpData, aiAnalysis);
      } catch (error) {
        console.warn(`AI SERP analysis failed for "${keyword}":`, error.message);
      }
    }

    // Estimate keyword metrics
    serpData.difficulty = this.estimateKeywordDifficulty(keyword);
    serpData.volume = this.estimateSearchVolume(keyword);
    serpData.intent = this.detectSearchIntent(keyword);

    return serpData;
  }

  async performAISERPAnalysis(keyword) {
    const prompt = `Analyze the search engine results page (SERP) for the keyword: "${keyword}"

Provide detailed analysis including:
1. Keyword difficulty (0-100 scale)
2. Estimated monthly search volume
3. Search intent (informational, commercial, navigational, transactional)
4. Common SERP features (featured snippets, people also ask, local pack, etc.)
5. Top ranking content types (blog posts, product pages, videos, etc.)
6. Related keywords and questions
7. Content angle and format that ranks well
8. Competitive landscape

Format as JSON:
{
  "difficulty": 0-100,
  "volume": estimated number,
  "intent": "informational/commercial/navigational/transactional",
  "serpFeatures": ["featured snippet", "people also ask"],
  "topContentTypes": ["blog post", "product page"],
  "relatedKeywords": ["related keyword 1"],
  "peopleAlsoAsk": ["question 1", "question 2"],
  "contentAngle": "what angle works best",
  "competitiveLevel": "low/medium/high",
  "rankingFactors": ["factor 1", "factor 2"]
}`;

    return await openAIService.generateJSON(
      prompt,
      {
        difficulty: 50,
        volume: 1000,
        intent: 'informational',
        serpFeatures: [],
        topContentTypes: [],
        relatedKeywords: [],
        peopleAlsoAsk: [],
        contentAngle: '',
        competitiveLevel: 'medium',
        rankingFactors: []
      },
      { temperature: 0.7, maxTokens: 1500 }
    );
  }

  estimateKeywordDifficulty(keyword) {
    // Simple heuristic-based estimation
    const wordCount = keyword.split(' ').length;
    let difficulty = 50;

    // Longer keywords are typically easier
    if (wordCount >= 4) difficulty -= 20;
    else if (wordCount === 3) difficulty -= 10;
    else if (wordCount === 1) difficulty += 20;

    // Commercial intent keywords are harder
    if (/buy|purchase|price|cheap|best|review/.test(keyword)) {
      difficulty += 15;
    }

    return Math.max(0, Math.min(100, difficulty));
  }

  estimateSearchVolume(keyword) {
    // Simple estimation based on keyword characteristics
    const wordCount = keyword.split(' ').length;
    let volume = 1000;

    if (wordCount === 1) volume = 10000;
    else if (wordCount === 2) volume = 5000;
    else if (wordCount === 3) volume = 2000;
    else volume = 500;

    // Adjust for commercial intent
    if (/buy|purchase|price/.test(keyword)) {
      volume *= 1.5;
    }

    return Math.round(volume);
  }

  detectSearchIntent(keyword) {
    const kw = keyword.toLowerCase();
    
    if (/how|what|why|when|where|guide|tutorial|learn/.test(kw)) {
      return 'informational';
    }
    if (/buy|purchase|order|shop|price|cheap|discount/.test(kw)) {
      return 'transactional';
    }
    if (/best|top|review|compare|vs/.test(kw)) {
      return 'commercial';
    }
    if (/login|sign in|website|official/.test(kw)) {
      return 'navigational';
    }
    
    return 'informational';
  }

  aggregateSERPFeatures(keywordData) {
    const features = {};
    
    keywordData.forEach(kw => {
      kw.serpFeatures?.forEach(feature => {
        features[feature] = (features[feature] || 0) + 1;
      });
    });

    return Object.entries(features)
      .map(([feature, count]) => ({
        feature,
        frequency: count,
        percentage: ((count / keywordData.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  identifyRankingOpportunities(keywordData) {
    return keywordData
      .filter(kw => kw.difficulty < 40 && kw.volume > 500)
      .map(kw => ({
        keyword: kw.keyword,
        difficulty: kw.difficulty,
        volume: kw.volume,
        intent: kw.intent,
        opportunity: 'high',
        reason: `Low difficulty (${kw.difficulty}) with decent volume (${kw.volume})`
      }))
      .sort((a, b) => b.volume - a.volume);
  }

  analyzeCompetitors(keywordData) {
    const competitors = [];
    
    keywordData.forEach(kw => {
      kw.topResults?.forEach((result, index) => {
        const existing = competitors.find(c => c.domain === result.domain);
        if (existing) {
          existing.rankings.push({ keyword: kw.keyword, position: index + 1 });
          existing.avgPosition = existing.rankings.reduce((sum, r) => sum + r.position, 0) / existing.rankings.length;
        } else {
          competitors.push({
            domain: result.domain,
            rankings: [{ keyword: kw.keyword, position: index + 1 }],
            avgPosition: index + 1,
            strength: result.domainAuthority || 'unknown'
          });
        }
      });
    });

    return competitors
      .sort((a, b) => a.avgPosition - b.avgPosition)
      .slice(0, 10);
  }

  async findContentGaps(keywordData) {
    const gaps = [];
    
    // Collect all PAA questions
    const allQuestions = keywordData.flatMap(kw => kw.peopleAlsoAsk || []);
    const uniqueQuestions = [...new Set(allQuestions)];

    uniqueQuestions.slice(0, 10).forEach(question => {
      gaps.push({
        type: 'question',
        content: question,
        priority: 'medium',
        reason: 'Frequently asked question in SERP'
      });
    });

    // Identify missing content types
    const contentTypes = keywordData.flatMap(kw => kw.topContentTypes || []);
    const typeFrequency = {};
    contentTypes.forEach(type => {
      typeFrequency[type] = (typeFrequency[type] || 0) + 1;
    });

    Object.entries(typeFrequency)
      .filter(([, count]) => count >= 2)
      .forEach(([type]) => {
        gaps.push({
          type: 'content_format',
          content: type,
          priority: 'high',
          reason: `${type} format ranks well for multiple keywords`
        });
      });

    return gaps;
  }

  generateRecommendations(results) {
    const recommendations = [];

    // SERP feature opportunities
    if (results.serpFeatures.length > 0) {
      const topFeature = results.serpFeatures[0];
      recommendations.push({
        type: 'serp_feature',
        priority: 'high',
        message: `Target ${topFeature.feature} - appears in ${topFeature.percentage}% of SERPs`,
        impact: 'Increased visibility and CTR',
        action: `Optimize content structure for ${topFeature.feature}`
      });
    }

    // Low-hanging fruit keywords
    if (results.rankingOpportunities.length > 0) {
      const topOpp = results.rankingOpportunities[0];
      recommendations.push({
        type: 'quick_win',
        priority: 'high',
        message: `Target "${topOpp.keyword}" - low difficulty with ${topOpp.volume} monthly searches`,
        impact: 'Quick ranking gains',
        action: 'Create optimized content targeting this keyword'
      });
    }

    // Content gaps
    if (results.contentGaps.length > 0) {
      const highPriorityGaps = results.contentGaps.filter(g => g.priority === 'high');
      if (highPriorityGaps.length > 0) {
        recommendations.push({
          type: 'content_gap',
          priority: 'medium',
          message: `Address content gaps: ${highPriorityGaps.slice(0, 2).map(g => g.content).join(', ')}`,
          impact: 'Better topical coverage',
          action: 'Create content in these formats/topics'
        });
      }
    }

    // Competitor insights
    if (results.competitorAnalysis.length > 0) {
      const topCompetitor = results.competitorAnalysis[0];
      recommendations.push({
        type: 'competitive',
        priority: 'medium',
        message: `Analyze ${topCompetitor.domain} - ranks for ${topCompetitor.rankings.length} target keywords`,
        impact: 'Learn from successful competitors',
        action: 'Study their content strategy and backlink profile'
      });
    }

    return recommendations;
  }

  async execute(keywords, options = {}) {
    return await this.analyze(keywords, options);
  }
}
