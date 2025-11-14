import { openAIService } from '../utils/openaiService.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Rank Tracking Agent - Monitors keyword rankings over time
 * Tracks position changes, visibility trends, and ranking volatility
 */
export class RankTrackingAgent {
  constructor() {
    this.name = 'RankTrackingAgent';
    this.status = 'ready';
    this.dataDir = './data/rankings';
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize rank tracking storage:', error);
    }
  }

  /**
   * Track rankings for keywords
   */
  async trackRankings(url, keywords, options = {}) {
    try {
      this.status = 'tracking';
      
      const trackingData = {
        url,
        timestamp: new Date().toISOString(),
        keywords: [],
        summary: {
          avgPosition: 0,
          improved: 0,
          declined: 0,
          unchanged: 0,
          visibility: 0
        },
        trends: [],
        recommendations: []
      };

      // Track each keyword
      for (const keyword of keywords) {
        const rankData = await this.trackKeyword(url, keyword, options);
        trackingData.keywords.push(rankData);
      }

      // Calculate summary metrics
      trackingData.summary = this.calculateSummary(trackingData.keywords);
      
      // Analyze trends
      trackingData.trends = await this.analyzeTrends(url, trackingData.keywords);
      
      // Generate recommendations
      trackingData.recommendations = this.generateRecommendations(trackingData);

      // Save tracking data
      await this.saveTrackingData(url, trackingData);

      this.status = 'ready';
      return trackingData;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Rank tracking failed: ${error.message}`);
    }
  }

  async trackKeyword(url, keyword, options = {}) {
    const rankData = {
      keyword,
      currentPosition: 0,
      previousPosition: 0,
      change: 0,
      changePercent: 0,
      bestPosition: 0,
      worstPosition: 0,
      avgPosition: 0,
      visibility: 0,
      url: null,
      snippet: null,
      lastUpdated: new Date().toISOString()
    };

    // Get historical data
    const history = await this.getKeywordHistory(url, keyword);
    
    // Simulate current position (in real implementation, would query search engines)
    rankData.currentPosition = await this.getCurrentPosition(url, keyword);
    
    if (history.length > 0) {
      const lastEntry = history[history.length - 1];
      rankData.previousPosition = lastEntry.position;
      rankData.change = rankData.previousPosition - rankData.currentPosition;
      
      if (rankData.previousPosition > 0) {
        rankData.changePercent = ((rankData.change / rankData.previousPosition) * 100).toFixed(1);
      }

      // Calculate historical metrics
      const positions = history.map(h => h.position).filter(p => p > 0);
      if (positions.length > 0) {
        rankData.bestPosition = Math.min(...positions);
        rankData.worstPosition = Math.max(...positions);
        rankData.avgPosition = (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1);
      }
    }

    // Calculate visibility score (based on CTR curve)
    rankData.visibility = this.calculateVisibility(rankData.currentPosition);

    return rankData;
  }

  async getCurrentPosition(url, keyword) {
    // In a real implementation, this would query search engines
    // For now, simulate with AI estimation
    if (openAIService.isAvailable()) {
      try {
        const prompt = `Estimate the likely search ranking position for:
URL: ${url}
Keyword: "${keyword}"

Consider:
- Keyword difficulty
- Domain authority indicators
- Content relevance

Provide a realistic position estimate (1-100) as JSON:
{
  "position": number,
  "confidence": "high/medium/low",
  "reasoning": "brief explanation"
}`;

        const result = await openAIService.generateJSON(
          prompt,
          { position: 50, confidence: 'medium', reasoning: '' },
          { temperature: 0.5, maxTokens: 200 }
        );

        return result.position || Math.floor(Math.random() * 50) + 1;
      } catch (error) {
        console.warn('AI position estimation failed:', error.message);
      }
    }

    // Fallback: random position for demo
    return Math.floor(Math.random() * 50) + 1;
  }

  calculateVisibility(position) {
    // CTR curve approximation
    if (position === 0) return 0;
    if (position === 1) return 100;
    if (position === 2) return 50;
    if (position === 3) return 30;
    if (position <= 10) return Math.max(5, 30 - (position - 3) * 3);
    if (position <= 20) return Math.max(2, 10 - (position - 10) * 0.5);
    return 1;
  }

  async getKeywordHistory(url, keyword) {
    try {
      const filename = this.getFilename(url);
      const filepath = path.join(this.dataDir, filename);
      
      const data = await fs.readFile(filepath, 'utf-8');
      const allData = JSON.parse(data);
      
      // Filter for this keyword
      return allData
        .filter(entry => entry.keywords?.some(k => k.keyword === keyword))
        .map(entry => {
          const kw = entry.keywords.find(k => k.keyword === keyword);
          return {
            timestamp: entry.timestamp,
            position: kw.currentPosition
          };
        });
    } catch (error) {
      return [];
    }
  }

  calculateSummary(keywords) {
    const summary = {
      avgPosition: 0,
      improved: 0,
      declined: 0,
      unchanged: 0,
      visibility: 0,
      topKeywords: [],
      losingKeywords: []
    };

    const validPositions = keywords.filter(k => k.currentPosition > 0);
    
    if (validPositions.length > 0) {
      summary.avgPosition = (
        validPositions.reduce((sum, k) => sum + k.currentPosition, 0) / validPositions.length
      ).toFixed(1);

      summary.visibility = (
        validPositions.reduce((sum, k) => sum + k.visibility, 0) / validPositions.length
      ).toFixed(1);
    }

    keywords.forEach(kw => {
      if (kw.change > 0) summary.improved++;
      else if (kw.change < 0) summary.declined++;
      else summary.unchanged++;

      if (kw.currentPosition > 0 && kw.currentPosition <= 10) {
        summary.topKeywords.push(kw);
      }
      if (kw.change < -5) {
        summary.losingKeywords.push(kw);
      }
    });

    summary.topKeywords.sort((a, b) => a.currentPosition - b.currentPosition);
    summary.losingKeywords.sort((a, b) => a.change - b.change);

    return summary;
  }

  async analyzeTrends(url, keywords) {
    const trends = [];

    // Overall trend
    const improving = keywords.filter(k => k.change > 0).length;
    const declining = keywords.filter(k => k.change < 0).length;
    
    if (improving > declining) {
      trends.push({
        type: 'overall',
        direction: 'up',
        message: `${improving} keywords improved, ${declining} declined`,
        confidence: 'medium'
      });
    } else if (declining > improving) {
      trends.push({
        type: 'overall',
        direction: 'down',
        message: `${declining} keywords declined, ${improving} improved`,
        confidence: 'medium'
      });
    }

    // Volatility analysis
    const volatileKeywords = keywords.filter(k => Math.abs(k.change) > 10);
    if (volatileKeywords.length > keywords.length * 0.3) {
      trends.push({
        type: 'volatility',
        direction: 'high',
        message: `High ranking volatility detected for ${volatileKeywords.length} keywords`,
        confidence: 'high'
      });
    }

    // Top performers
    const topPerformers = keywords.filter(k => k.currentPosition <= 3);
    if (topPerformers.length > 0) {
      trends.push({
        type: 'success',
        direction: 'stable',
        message: `${topPerformers.length} keywords in top 3 positions`,
        confidence: 'high'
      });
    }

    return trends;
  }

  generateRecommendations(trackingData) {
    const recommendations = [];

    // Declining keywords
    if (trackingData.summary.losingKeywords.length > 0) {
      const topLosing = trackingData.summary.losingKeywords[0];
      recommendations.push({
        type: 'ranking_loss',
        priority: 'high',
        message: `"${topLosing.keyword}" dropped ${Math.abs(topLosing.change)} positions`,
        impact: 'Traffic loss',
        action: 'Review and update content, check for technical issues'
      });
    }

    // Low visibility
    if (parseFloat(trackingData.summary.visibility) < 20) {
      recommendations.push({
        type: 'low_visibility',
        priority: 'high',
        message: `Overall visibility is low (${trackingData.summary.visibility}%)`,
        impact: 'Limited organic traffic',
        action: 'Focus on improving rankings for high-volume keywords'
      });
    }

    // Opportunities
    const nearTop10 = trackingData.keywords.filter(k => k.currentPosition > 10 && k.currentPosition <= 15);
    if (nearTop10.length > 0) {
      recommendations.push({
        type: 'opportunity',
        priority: 'medium',
        message: `${nearTop10.length} keywords near page 1 (positions 11-15)`,
        impact: 'Quick wins possible',
        action: 'Optimize these pages to break into top 10'
      });
    }

    // Stable top rankings
    if (trackingData.summary.topKeywords.length > 0) {
      recommendations.push({
        type: 'maintain',
        priority: 'medium',
        message: `${trackingData.summary.topKeywords.length} keywords in top 10`,
        impact: 'Maintain current traffic',
        action: 'Keep content fresh and monitor competitors'
      });
    }

    return recommendations;
  }

  async saveTrackingData(url, data) {
    try {
      const filename = this.getFilename(url);
      const filepath = path.join(this.dataDir, filename);
      
      let history = [];
      try {
        const existing = await fs.readFile(filepath, 'utf-8');
        history = JSON.parse(existing);
      } catch (error) {
        // File doesn't exist yet
      }

      history.push(data);
      
      // Keep last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      history = history.filter(entry => new Date(entry.timestamp) > ninetyDaysAgo);

      await fs.writeFile(filepath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Failed to save tracking data:', error);
    }
  }

  getFilename(url) {
    return url.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
  }

  async getHistoricalData(url, days = 30) {
    try {
      const filename = this.getFilename(url);
      const filepath = path.join(this.dataDir, filename);
      
      const data = await fs.readFile(filepath, 'utf-8');
      const history = JSON.parse(data);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return history.filter(entry => new Date(entry.timestamp) > cutoffDate);
    } catch (error) {
      return [];
    }
  }

  async execute(url, keywords, options = {}) {
    return await this.trackRankings(url, keywords, options);
  }
}
