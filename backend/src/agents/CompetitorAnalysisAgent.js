import { openAIService } from '../utils/openaiService.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Competitor Analysis Agent - Analyzes competitor websites
 * Provides insights on competitor strategies, content gaps, and opportunities
 */
export class CompetitorAnalysisAgent {
  constructor() {
    this.name = 'CompetitorAnalysisAgent';
    this.status = 'ready';
  }

  /**
   * Analyze competitors for a given URL and keywords
   */
  async analyze(targetUrl, competitors, keywords = []) {
    try {
      this.status = 'analyzing';
      
      const analysis = {
        targetUrl,
        competitors: [],
        comparison: {
          contentQuality: {},
          technicalSEO: {},
          keywords: {},
          backlinks: {}
        },
        opportunities: [],
        threats: [],
        recommendations: []
      };

      // Analyze each competitor
      for (const competitorUrl of competitors.slice(0, 5)) {
        const competitorData = await this.analyzeCompetitor(competitorUrl, keywords);
        analysis.competitors.push(competitorData);
      }

      // Compare with target
      analysis.comparison = this.compareWithTarget(analysis.competitors);
      
      // Identify opportunities and threats
      analysis.opportunities = this.identifyOpportunities(analysis.competitors, keywords);
      analysis.threats = this.identifyThreats(analysis.competitors);
      
      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

      this.status = 'ready';
      return analysis;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Competitor analysis failed: ${error.message}`);
    }
  }

  async analyzeCompetitor(url, keywords = []) {
    const competitor = {
      url,
      domain: new URL(url).hostname,
      metrics: {
        domainAuthority: 0,
        pageAuthority: 0,
        backlinks: 0,
        referringDomains: 0
      },
      content: {
        wordCount: 0,
        readabilityScore: 0,
        keywordUsage: {},
        contentTypes: [],
        updateFrequency: 'unknown'
      },
      technical: {
        loadTime: 0,
        mobileOptimized: false,
        https: false,
        structuredData: false
      },
      keywords: {
        ranking: [],
        overlap: [],
        unique: []
      },
      strengths: [],
      weaknesses: []
    };

    try {
      // Fetch competitor page
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Bot/1.0)'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Analyze content
      competitor.content = this.analyzeContent($, keywords);
      
      // Analyze technical aspects
      competitor.technical = this.analyzeTechnical($, response);
      
      // Estimate metrics (in real implementation, would use APIs)
      competitor.metrics = await this.estimateMetrics(url);
      
      // AI-powered competitive intelligence
      if (openAIService.isAvailable()) {
        const aiInsights = await this.performAICompetitorAnalysis(url, competitor);
        competitor.strengths = aiInsights.strengths || [];
        competitor.weaknesses = aiInsights.weaknesses || [];
        competitor.content.contentTypes = aiInsights.contentTypes || [];
      }

    } catch (error) {
      console.warn(`Failed to analyze competitor ${url}:`, error.message);
      competitor.error = error.message;
    }

    return competitor;
  }

  analyzeContent($, keywords) {
    const content = {
      wordCount: 0,
      readabilityScore: 0,
      keywordUsage: {},
      contentTypes: [],
      headings: {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length
      },
      images: $('img').length,
      videos: $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length,
      lists: $('ul, ol').length
    };

    // Extract text content
    const text = $('body').text().toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 3);
    content.wordCount = words.length;

    // Analyze keyword usage
    keywords.forEach(keyword => {
      const kw = keyword.toLowerCase();
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        content.keywordUsage[keyword] = {
          count: matches.length,
          density: ((matches.length / words.length) * 100).toFixed(2)
        };
      }
    });

    // Detect content types
    if (content.images > 5) content.contentTypes.push('image-rich');
    if (content.videos > 0) content.contentTypes.push('video');
    if (content.lists > 3) content.contentTypes.push('listicle');
    if (content.wordCount > 2000) content.contentTypes.push('long-form');
    if ($('table').length > 0) content.contentTypes.push('data-driven');

    return content;
  }

  analyzeTechnical($, response) {
    return {
      loadTime: response.headers['x-response-time'] || 0,
      mobileOptimized: $('meta[name="viewport"]').length > 0,
      https: response.config.url.startsWith('https'),
      structuredData: $('script[type="application/ld+json"]').length > 0,
      canonicalTag: $('link[rel="canonical"]').length > 0,
      metaDescription: $('meta[name="description"]').attr('content')?.length > 0,
      openGraph: $('meta[property^="og:"]').length > 0,
      altTags: $('img[alt]').length / Math.max($('img').length, 1)
    };
  }

  async estimateMetrics(url) {
    // In real implementation, would use APIs like Moz, Ahrefs, etc.
    // For now, provide estimates
    const domain = new URL(url).hostname;
    const domainAge = domain.length; // Rough proxy
    
    return {
      domainAuthority: Math.min(100, 20 + domainAge * 2),
      pageAuthority: Math.min(100, 15 + domainAge * 2),
      backlinks: Math.floor(Math.random() * 10000) + 100,
      referringDomains: Math.floor(Math.random() * 1000) + 50,
      organicTraffic: Math.floor(Math.random() * 100000) + 1000
    };
  }

  async performAICompetitorAnalysis(url, competitorData) {
    const prompt = `Analyze this competitor website:

URL: ${url}
Domain: ${competitorData.domain}
Word Count: ${competitorData.content.wordCount}
Headings: H1(${competitorData.content.headings.h1}), H2(${competitorData.content.headings.h2}), H3(${competitorData.content.headings.h3})
Images: ${competitorData.content.images}
Videos: ${competitorData.content.videos}
Technical: Mobile(${competitorData.technical.mobileOptimized}), HTTPS(${competitorData.technical.https}), Schema(${competitorData.technical.structuredData})

Provide competitive intelligence:
{
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "contentTypes": ["content type 1"],
  "contentStrategy": "description of their strategy",
  "differentiators": ["what makes them unique"],
  "vulnerabilities": ["areas where they can be beaten"]
}`;

    try {
      return await openAIService.generateJSON(
        prompt,
        {
          strengths: [],
          weaknesses: [],
          contentTypes: [],
          contentStrategy: '',
          differentiators: [],
          vulnerabilities: []
        },
        { temperature: 0.7, maxTokens: 1000 }
      );
    } catch (error) {
      console.warn('AI competitor analysis failed:', error.message);
      return {
        strengths: ['Unable to analyze'],
        weaknesses: [],
        contentTypes: []
      };
    }
  }

  compareWithTarget(competitors) {
    const comparison = {
      avgWordCount: 0,
      avgBacklinks: 0,
      avgDomainAuthority: 0,
      commonContentTypes: [],
      technicalFeatures: {}
    };

    if (competitors.length === 0) return comparison;

    // Calculate averages
    comparison.avgWordCount = Math.round(
      competitors.reduce((sum, c) => sum + c.content.wordCount, 0) / competitors.length
    );
    
    comparison.avgBacklinks = Math.round(
      competitors.reduce((sum, c) => sum + c.metrics.backlinks, 0) / competitors.length
    );
    
    comparison.avgDomainAuthority = Math.round(
      competitors.reduce((sum, c) => sum + c.metrics.domainAuthority, 0) / competitors.length
    );

    // Find common content types
    const allContentTypes = competitors.flatMap(c => c.content.contentTypes);
    const typeFrequency = {};
    allContentTypes.forEach(type => {
      typeFrequency[type] = (typeFrequency[type] || 0) + 1;
    });
    
    comparison.commonContentTypes = Object.entries(typeFrequency)
      .filter(([, count]) => count >= competitors.length * 0.5)
      .map(([type]) => type);

    // Technical features comparison
    comparison.technicalFeatures = {
      mobileOptimized: competitors.filter(c => c.technical.mobileOptimized).length,
      https: competitors.filter(c => c.technical.https).length,
      structuredData: competitors.filter(c => c.technical.structuredData).length
    };

    return comparison;
  }

  identifyOpportunities(competitors, keywords) {
    const opportunities = [];

    // Content length opportunity
    const avgWordCount = competitors.reduce((sum, c) => sum + c.content.wordCount, 0) / competitors.length;
    if (avgWordCount < 1500) {
      opportunities.push({
        type: 'content_length',
        priority: 'high',
        message: `Competitors average ${Math.round(avgWordCount)} words - opportunity for comprehensive content`,
        action: 'Create in-depth content (2000+ words)'
      });
    }

    // Keyword gaps
    const competitorKeywords = new Set();
    competitors.forEach(c => {
      Object.keys(c.content.keywordUsage).forEach(kw => competitorKeywords.add(kw));
    });
    
    const unusedKeywords = keywords.filter(kw => !competitorKeywords.has(kw));
    if (unusedKeywords.length > 0) {
      opportunities.push({
        type: 'keyword_gap',
        priority: 'high',
        message: `${unusedKeywords.length} keywords underutilized by competitors`,
        keywords: unusedKeywords.slice(0, 5),
        action: 'Target these keywords for quick wins'
      });
    }

    // Technical gaps
    const withoutSchema = competitors.filter(c => !c.technical.structuredData).length;
    if (withoutSchema > competitors.length * 0.5) {
      opportunities.push({
        type: 'technical',
        priority: 'medium',
        message: `${withoutSchema} competitors lack structured data`,
        action: 'Implement comprehensive schema markup'
      });
    }

    // Content format opportunities
    const withoutVideo = competitors.filter(c => c.content.videos === 0).length;
    if (withoutVideo > competitors.length * 0.7) {
      opportunities.push({
        type: 'content_format',
        priority: 'medium',
        message: 'Most competitors lack video content',
        action: 'Add video content for differentiation'
      });
    }

    return opportunities;
  }

  identifyThreats(competitors) {
    const threats = [];

    // High authority competitors
    const highAuthority = competitors.filter(c => c.metrics.domainAuthority > 70);
    if (highAuthority.length > 0) {
      threats.push({
        type: 'authority',
        severity: 'high',
        message: `${highAuthority.length} high-authority competitors (DA > 70)`,
        competitors: highAuthority.map(c => c.domain)
      });
    }

    // Superior content
    const longFormCompetitors = competitors.filter(c => c.content.wordCount > 3000);
    if (longFormCompetitors.length > competitors.length * 0.5) {
      threats.push({
        type: 'content_quality',
        severity: 'medium',
        message: 'Competitors producing comprehensive long-form content',
        action: 'Match or exceed content depth'
      });
    }

    // Technical superiority
    const technicallyAdvanced = competitors.filter(c => 
      c.technical.structuredData && c.technical.mobileOptimized && c.technical.https
    );
    if (technicallyAdvanced.length > competitors.length * 0.7) {
      threats.push({
        type: 'technical',
        severity: 'medium',
        message: 'Most competitors have strong technical SEO',
        action: 'Ensure technical excellence to compete'
      });
    }

    return threats;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Opportunity-based recommendations
    analysis.opportunities.forEach(opp => {
      if (opp.priority === 'high') {
        recommendations.push({
          type: opp.type,
          priority: 'high',
          message: opp.message,
          action: opp.action,
          impact: 'Competitive advantage'
        });
      }
    });

    // Threat mitigation
    analysis.threats.forEach(threat => {
      if (threat.severity === 'high') {
        recommendations.push({
          type: 'threat_mitigation',
          priority: 'high',
          message: threat.message,
          action: threat.action || 'Develop strategy to compete',
          impact: 'Maintain market position'
        });
      }
    });

    // Content strategy
    if (analysis.comparison.commonContentTypes.length > 0) {
      recommendations.push({
        type: 'content_strategy',
        priority: 'medium',
        message: `Adopt successful content formats: ${analysis.comparison.commonContentTypes.join(', ')}`,
        action: 'Incorporate these formats into content strategy',
        impact: 'Better user engagement'
      });
    }

    return recommendations;
  }

  async execute(targetUrl, competitors, keywords = []) {
    return await this.analyze(targetUrl, competitors, keywords);
  }
}
