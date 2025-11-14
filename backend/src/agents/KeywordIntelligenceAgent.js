import { openAIService } from '../utils/openaiService.js';

export class KeywordIntelligenceAgent {
  constructor() {
    this.name = 'KeywordIntelligenceAgent';
    this.status = 'ready';
  }

  async analyze(crawlData) {
    try {
      this.status = 'analyzing';
      
      // Require OpenAI - no fallback
      if (!openAIService.isAvailable()) {
        throw new Error('OpenRouter API key is required for keyword analysis. Please set OPENROUTER_API_KEY environment variable.');
      }

      const text = crawlData.content.text.toLowerCase();
      const title = crawlData.title.toLowerCase();
      const headings = [
        ...crawlData.headings.h1,
        ...crawlData.headings.h2,
        ...crawlData.headings.h3
      ].map(h => h.toLowerCase());

      // AI-powered analysis only
      const aiAnalysis = await this.performAIAnalysis(crawlData, text, title, headings);

      // Calculate keyword density from AI results
      const keywordDensity = this.calculateKeywordDensityFromAI(aiAnalysis, crawlData);

      const analysis = {
        primaryKeywords: aiAnalysis.primaryKeywords || [],
        allKeywords: aiAnalysis.primaryKeywords || [],
        keywordDensity: keywordDensity,
        missingKeywords: aiAnalysis.missingKeywords || [],
        longTailSuggestions: aiAnalysis.longTailSuggestions || [],
        semanticKeywords: aiAnalysis.semanticKeywords || [],
        searchIntent: aiAnalysis.searchIntent || null,
        competitiveKeywords: aiAnalysis.competitiveKeywords || [],
        keywordGaps: aiAnalysis.keywordGaps || [],
        titleKeywordUsage: {
          present: [],
          missing: aiAnalysis.missingKeywords || []
        },
        recommendations: this.generateRecommendations({
          topKeywords: aiAnalysis.primaryKeywords || [],
          missingKeywords: aiAnalysis.missingKeywords || [],
          keywordDensity: keywordDensity,
          titleKeywords: [],
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

  calculateKeywordDensityFromAI(aiAnalysis, crawlData) {
    const density = {};
    const wordCount = crawlData.content.wordCount || 1;
    const text = crawlData.content.text.toLowerCase();

    if (aiAnalysis.primaryKeywords && aiAnalysis.primaryKeywords.length > 0) {
      aiAnalysis.primaryKeywords.forEach(kw => {
        const keyword = typeof kw === 'string' ? kw : kw.word;
        if (keyword) {
          const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
          const matches = text.match(regex);
          const count = matches ? matches.length : 0;
          if (count > 0) {
            density[keyword] = {
              count,
              density: ((count / wordCount) * 100).toFixed(2),
              recommendation: count < 3 ? 'increase' : count > 10 ? 'decrease' : 'optimal'
            };
          }
        }
      });
    }

    return density;
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
