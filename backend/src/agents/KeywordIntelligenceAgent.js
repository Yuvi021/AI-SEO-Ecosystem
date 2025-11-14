import { openAIService } from '../utils/openaiService.js';

export class KeywordIntelligenceAgent {
  constructor() {
    this.name = 'KeywordIntelligenceAgent';
    this.status = 'ready';
  }

  async analyze(crawlData) {
    try {
      this.status = 'analyzing';
      
      const text = crawlData.content.text.toLowerCase();
      const title = crawlData.title.toLowerCase();
      const headings = [
        ...crawlData.headings.h1,
        ...crawlData.headings.h2,
        ...crawlData.headings.h3
      ].map(h => h.toLowerCase());

      // Basic keyword extraction (fallback)
      const basicAnalysis = this.performBasicAnalysis(crawlData, text, title, headings);

      // Enhanced AI-powered analysis if available
      let aiAnalysis = null;
      if (openAIService.isAvailable()) {
        try {
          aiAnalysis = await this.performAIAnalysis(crawlData, text, title, headings);
        } catch (error) {
          console.warn('AI analysis failed, using basic analysis:', error.message);
        }
      }

      // Merge AI and basic analysis
      const mergedAnalysis = {
        primaryKeywords: aiAnalysis?.primaryKeywords || basicAnalysis.primaryKeywords,
        allKeywords: aiAnalysis?.allKeywords || basicAnalysis.allKeywords,
        keywordDensity: basicAnalysis.keywordDensity,
        missingKeywords: aiAnalysis?.missingKeywords || basicAnalysis.missingKeywords,
        longTailSuggestions: aiAnalysis?.longTailSuggestions || basicAnalysis.longTailSuggestions,
        semanticKeywords: aiAnalysis?.semanticKeywords || [],
        searchIntent: aiAnalysis?.searchIntent || null,
        competitiveKeywords: aiAnalysis?.competitiveKeywords || [],
        keywordGaps: aiAnalysis?.keywordGaps || [],
        titleKeywordUsage: basicAnalysis.titleKeywordUsage
      };

      const analysis = {
        ...mergedAnalysis,
        recommendations: this.generateRecommendations({
          topKeywords: mergedAnalysis.primaryKeywords,
          missingKeywords: mergedAnalysis.missingKeywords,
          keywordDensity: basicAnalysis.keywordDensity,
          titleKeywords: basicAnalysis.titleKeywords,
          aiInsights: aiAnalysis
        })
      };

      this.status = 'ready';
      return analysis;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Keyword analysis failed: ${error.message}`);
    }
  }

  async performAIAnalysis(crawlData, text, title, headings) {
    const prompt = `Analyze this webpage for SEO keyword opportunities:

TITLE: ${crawlData.title}
URL: ${crawlData.url}
CONTENT PREVIEW: ${text.substring(0, 2000)}
HEADINGS: ${headings.join(', ')}

Provide a comprehensive keyword analysis including:
1. Primary keywords (top 5-10 most relevant)
2. Long-tail keyword opportunities (10-15 suggestions)
3. Semantic keyword variations
4. Missing keywords that should be included
5. Search intent analysis (informational, commercial, navigational, transactional)
6. Competitive keyword opportunities
7. Keyword gaps in the content

Format your response as JSON with this structure:
{
  "primaryKeywords": [{"word": "keyword", "relevance": "high/medium/low", "searchVolume": "estimated"}],
  "longTailSuggestions": ["long tail keyword 1", "long tail keyword 2"],
  "semanticKeywords": ["semantic variation 1", "semantic variation 2"],
  "missingKeywords": ["missing keyword 1", "missing keyword 2"],
  "searchIntent": "informational/commercial/navigational/transactional",
  "competitiveKeywords": ["competitive keyword 1"],
  "keywordGaps": [{"keyword": "gap keyword", "reason": "why it's missing", "priority": "high/medium/low"}]
}`;

    const aiResponse = await openAIService.generateJSON(
      prompt,
      {
        primaryKeywords: [],
        longTailSuggestions: [],
        semanticKeywords: [],
        missingKeywords: [],
        searchIntent: '',
        competitiveKeywords: [],
        keywordGaps: []
      },
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    return aiResponse;
  }

  performBasicAnalysis(crawlData, text, title, headings) {
    // Extract keywords from content
    const words = text.split(/\s+/).filter(w => w.length > 3);
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count, density: (count / words.length * 100).toFixed(2) }));

    // Analyze keyword gaps
    const titleKeywords = this.extractKeywords(title);
    const headingKeywords = this.extractKeywords(headings.join(' '));
    const contentKeywords = this.extractKeywords(text);

    // Find missing keywords in content
    const missingKeywords = titleKeywords.filter(kw => 
      !contentKeywords.includes(kw) && kw.length > 3
    );

    // Generate long-tail keyword suggestions
    const longTailKeywords = this.generateLongTailKeywords(titleKeywords, contentKeywords);

    // Keyword density analysis
    const keywordDensity = this.calculateKeywordDensity(crawlData);

    return {
      primaryKeywords: topKeywords.slice(0, 5),
      allKeywords: topKeywords,
      keywordDensity,
      missingKeywords: missingKeywords.slice(0, 10),
      longTailSuggestions: longTailKeywords.slice(0, 10),
      titleKeywords,
      titleKeywordUsage: {
        present: titleKeywords.filter(kw => contentKeywords.includes(kw)),
        missing: titleKeywords.filter(kw => !contentKeywords.includes(kw))
      }
    };
  }

  extractKeywords(text) {
    // Remove common stop words
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'way', 'use', 'man', 'men', 'any', 'she', 'put', 'say', 'she', 'too', 'use']);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  generateLongTailKeywords(primaryKeywords, contentKeywords) {
    const longTail = [];
    const phrases = primaryKeywords.slice(0, 5);
    
    phrases.forEach(phrase => {
      longTail.push(`${phrase} guide`);
      longTail.push(`best ${phrase}`);
      longTail.push(`${phrase} tips`);
      longTail.push(`how to ${phrase}`);
      longTail.push(`${phrase} examples`);
      longTail.push(`${phrase} benefits`);
    });

    return [...new Set(longTail)];
  }

  calculateKeywordDensity(crawlData) {
    const wordCount = crawlData.content.wordCount;
    if (wordCount === 0) return {};

    const text = crawlData.content.text.toLowerCase();
    const titleWords = crawlData.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const density = {};
    titleWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      if (count > 0) {
        density[word] = {
          count,
          density: ((count / wordCount) * 100).toFixed(2),
          recommendation: count < 3 ? 'increase' : count > 10 ? 'decrease' : 'optimal'
        };
      }
    });

    return density;
  }

  generateRecommendations(data) {
    const recommendations = [];

    if (data.missingKeywords && data.missingKeywords.length > 0) {
      recommendations.push({
        type: 'keyword_gap',
        priority: 'high',
        message: `Add missing keywords: ${data.missingKeywords.slice(0, 3).join(', ')}`,
        impact: 'Improves keyword relevance and search visibility'
      });
    }

    if (data.aiInsights?.keywordGaps && data.aiInsights.keywordGaps.length > 0) {
      const highPriorityGaps = data.aiInsights.keywordGaps.filter(g => g.priority === 'high');
      if (highPriorityGaps.length > 0) {
        recommendations.push({
          type: 'ai_keyword_gap',
          priority: 'high',
          message: `AI-identified keyword gaps: ${highPriorityGaps.map(g => g.keyword).slice(0, 3).join(', ')}`,
          impact: 'Addresses AI-identified opportunities for better rankings',
          reason: highPriorityGaps[0]?.reason
        });
      }
    }

    const lowDensity = Object.entries(data.keywordDensity || {}).filter(
      ([, info]) => info.recommendation === 'increase'
    );

    if (lowDensity.length > 0) {
      recommendations.push({
        type: 'keyword_density',
        priority: 'medium',
        message: `Increase usage of: ${lowDensity.slice(0, 2).map(([kw]) => kw).join(', ')}`,
        impact: 'Better keyword targeting in content'
      });
    }

    if (data.aiInsights?.semanticKeywords && data.aiInsights.semanticKeywords.length > 0) {
      recommendations.push({
        type: 'semantic_keywords',
        priority: 'medium',
        message: `Include semantic variations: ${data.aiInsights.semanticKeywords.slice(0, 3).join(', ')}`,
        impact: 'Improves topical relevance and E-E-A-T signals'
      });
    }

    return recommendations;
  }

  async execute(crawlData) {
    return await this.analyze(crawlData);
  }
}
