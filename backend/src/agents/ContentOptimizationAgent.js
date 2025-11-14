import { openAIService } from '../utils/openaiService.js';

export class ContentOptimizationAgent {
  constructor() {
    this.name = 'ContentOptimizationAgent';
    this.status = 'ready';
  }

  async optimize(crawlData, keywordAnalysis) {
    try {
      this.status = 'optimizing';
      
      // Require OpenAI - no fallback
      if (!openAIService.isAvailable()) {
        throw new Error('OpenRouter API key is required for content optimization. Please set OPENROUTER_API_KEY environment variable.');
      }

      // AI-powered optimization only
      const aiOptimization = await this.performAIOptimization(crawlData, keywordAnalysis);

      // Extract readability metrics from AI analysis
      const readability = this.extractReadabilityFromAI(aiOptimization, crawlData);
      const structure = this.extractStructureFromAI(aiOptimization, crawlData);
      const keywordPlacement = this.extractKeywordPlacementFromAI(aiOptimization, crawlData, keywordAnalysis);

      const internalLinking = this.analyzeInternalLinking(crawlData);
      
      const optimization = {
        readability: readability,
        structure: structure,
        keywordPlacement: keywordPlacement,
        internalLinking: internalLinking,
        aiSuggestions: aiOptimization.suggestions || null,
        contentQuality: aiOptimization.quality || null,
        engagementTips: aiOptimization.engagementTips || [],
        readabilityImprovements: aiOptimization.readabilityImprovements || [],
        structureRecommendations: aiOptimization.structureRecommendations || [],
        recommendations: this.generateRecommendations(
          { readability, structure, keywordPlacement, internalLinking }, 
          crawlData, 
          keywordAnalysis,
          aiOptimization
        )
      };

      this.status = 'ready';
      return optimization;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Content optimization failed: ${error.message}`);
    }
  }

  extractReadabilityFromAI(aiOptimization, crawlData) {
    // Use AI analysis for readability, fallback to basic calculation only for metrics
    const text = crawlData.content.text;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = crawlData.content.paragraphs;
    const avgSentenceLength = words.length / sentences.length || 0;
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length || 0;
    const avgWordsPerSentence = words.length / sentences.length || 0;
    const avgSyllablesPerWord = this.estimateSyllables(words.join(' '));
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    return {
      wordCount: crawlData.content.wordCount,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgParagraphLength: avgParagraphLength.toFixed(1),
      fleschScore: fleschScore.toFixed(1),
      readability: fleschScore >= 60 ? 'good' : fleschScore >= 30 ? 'fair' : 'difficult',
      score: fleschScore,
      aiImprovements: aiOptimization.readabilityImprovements || []
    };
  }

  extractStructureFromAI(aiOptimization, crawlData) {
    const structure = {
      hasH1: crawlData.headings.h1.length > 0,
      h1Count: crawlData.headings.h1.length,
      h2Count: crawlData.headings.h2.length,
      h3Count: crawlData.headings.h3.length,
      headingHierarchy: true,
      issues: []
    };

    // Use AI recommendations for structure issues
    if (aiOptimization.structureRecommendations && aiOptimization.structureRecommendations.length > 0) {
      structure.issues = aiOptimization.structureRecommendations;
    } else {
      // Basic checks only if AI didn't provide recommendations
      if (structure.h1Count === 0) {
        structure.issues.push('Missing H1 tag');
        structure.headingHierarchy = false;
      }
      if (structure.h1Count > 1) {
        structure.issues.push('Multiple H1 tags found (should have only one)');
        structure.headingHierarchy = false;
      }
    }

    return structure;
  }

  extractKeywordPlacementFromAI(aiOptimization, crawlData, keywordAnalysis) {
    if (!keywordAnalysis?.primaryKeywords?.length) {
      return { score: 0, issues: ['No keywords to analyze'] };
    }

    const primaryKeyword = keywordAnalysis.primaryKeywords[0]?.word || '';
    const text = crawlData.content.text.toLowerCase();
    const firstParagraph = crawlData.content.paragraphs[0]?.toLowerCase() || '';
    
    const placement = {
      inTitle: crawlData.title.toLowerCase().includes(primaryKeyword),
      inFirstParagraph: firstParagraph.includes(primaryKeyword),
      inH1: crawlData.headings.h1.some(h => h.toLowerCase().includes(primaryKeyword)),
      inH2: crawlData.headings.h2.some(h => h.toLowerCase().includes(primaryKeyword)),
      inMetaDescription: (crawlData.meta.description || '').toLowerCase().includes(primaryKeyword),
      frequency: (text.match(new RegExp(primaryKeyword, 'gi')) || []).length
    };

    const score = Object.values(placement).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
    const issues = [];

    if (!placement.inTitle) issues.push('Primary keyword not in title');
    if (!placement.inFirstParagraph) issues.push('Primary keyword not in first paragraph');
    if (!placement.inH1 && !placement.inH2) issues.push('Primary keyword not in headings');
    if (placement.frequency < 3) issues.push('Primary keyword used too infrequently');

    return { score, issues };
  }

  async performAIOptimization(crawlData, keywordAnalysis) {
    const primaryKeyword = keywordAnalysis?.primaryKeywords?.[0]?.word || '';
    const contentPreview = crawlData.content.text.substring(0, 3000);
    
    const prompt = `Analyze and optimize this webpage content for SEO:

TITLE: ${crawlData.title}
PRIMARY KEYWORD: ${primaryKeyword}
CONTENT: ${contentPreview}
HEADINGS: ${JSON.stringify(crawlData.headings)}
WORD COUNT: ${crawlData.content.wordCount}

Provide comprehensive content optimization analysis:

1. Content Quality Assessment (score 0-100)
2. Specific readability improvements
3. Structure recommendations (heading hierarchy, paragraph breaks)
4. Engagement enhancement tips
5. Keyword placement optimization suggestions
6. Content gaps and expansion opportunities

Format as JSON:
{
  "quality": {"score": 85, "strengths": [], "weaknesses": []},
  "readabilityImprovements": ["improvement 1", "improvement 2"],
  "structureRecommendations": ["recommendation 1"],
  "engagementTips": ["tip 1", "tip 2"],
  "suggestions": {
    "intro": "suggested intro paragraph",
    "conclusion": "suggested conclusion",
    "headings": ["suggested H2", "suggested H2"]
  },
  "contentGaps": [{"gap": "missing topic", "priority": "high/medium/low"}]
}`;

    const aiResponse = await openAIService.generateJSON(
      prompt,
      {
        quality: { score: 0, strengths: [], weaknesses: [] },
        readabilityImprovements: [],
        structureRecommendations: [],
        engagementTips: [],
        suggestions: { intro: '', conclusion: '', headings: [] },
        contentGaps: []
      },
      {
        temperature: 0.6,
        maxTokens: 2500,
      }
    );

    return aiResponse;
  }

  analyzeReadability(crawlData) {
    const text = crawlData.content.text;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = crawlData.content.paragraphs;

    // Average sentence length
    const avgSentenceLength = words.length / sentences.length || 0;
    
    // Average paragraph length
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length || 0;

    // Flesch Reading Ease approximation
    const avgWordsPerSentence = words.length / sentences.length || 0;
    const avgSyllablesPerWord = this.estimateSyllables(words.join(' '));
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    return {
      wordCount: crawlData.content.wordCount,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgParagraphLength: avgParagraphLength.toFixed(1),
      fleschScore: fleschScore.toFixed(1),
      readability: fleschScore >= 60 ? 'good' : fleschScore >= 30 ? 'fair' : 'difficult',
      score: fleschScore
    };
  }

  estimateSyllables(text) {
    // Simple syllable estimation
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;
    
    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length <= 3) {
        totalSyllables += 1;
      } else {
        totalSyllables += word.match(/[aeiouy]+/g)?.length || 1;
      }
    });

    return totalSyllables / words.length || 1;
  }

  analyzeStructure(crawlData) {
    const structure = {
      hasH1: crawlData.headings.h1.length > 0,
      h1Count: crawlData.headings.h1.length,
      h2Count: crawlData.headings.h2.length,
      h3Count: crawlData.headings.h3.length,
      headingHierarchy: true,
      issues: []
    };

    // Check heading hierarchy
    if (structure.h1Count === 0) {
      structure.issues.push('Missing H1 tag');
      structure.headingHierarchy = false;
    }
    if (structure.h1Count > 1) {
      structure.issues.push('Multiple H1 tags found (should have only one)');
      structure.headingHierarchy = false;
    }
    if (structure.h2Count === 0 && structure.h3Count > 0) {
      structure.issues.push('H3 tags used without H2 tags');
      structure.headingHierarchy = false;
    }

    return structure;
  }

  analyzeKeywordPlacement(crawlData, keywordAnalysis) {
    if (!keywordAnalysis?.primaryKeywords?.length) {
      return { score: 0, issues: ['No keywords to analyze'] };
    }

    const primaryKeyword = keywordAnalysis.primaryKeywords[0]?.word || '';
    const text = crawlData.content.text.toLowerCase();
    const firstParagraph = crawlData.content.paragraphs[0]?.toLowerCase() || '';
    
    const placement = {
      inTitle: crawlData.title.toLowerCase().includes(primaryKeyword),
      inFirstParagraph: firstParagraph.includes(primaryKeyword),
      inH1: crawlData.headings.h1.some(h => h.toLowerCase().includes(primaryKeyword)),
      inH2: crawlData.headings.h2.some(h => h.toLowerCase().includes(primaryKeyword)),
      inMetaDescription: (crawlData.meta.description || '').toLowerCase().includes(primaryKeyword),
      frequency: (text.match(new RegExp(primaryKeyword, 'gi')) || []).length
    };

    placement.score = [
      placement.inTitle,
      placement.inFirstParagraph,
      placement.inH1,
      placement.inMetaDescription
    ].filter(Boolean).length;

    placement.issues = [];
    if (!placement.inTitle) placement.issues.push('Primary keyword not in title');
    if (!placement.inFirstParagraph) placement.issues.push('Primary keyword not in first paragraph');
    if (!placement.inH1) placement.issues.push('Primary keyword not in H1');

    return placement;
  }

  analyzeInternalLinking(crawlData) {
    const internalLinks = crawlData.links.internal;
    const wordCount = crawlData.content.wordCount;
    
    return {
      count: internalLinks.length,
      anchorTexts: internalLinks.map(link => link.text).filter(t => t.length > 0),
      linksPerWord: wordCount > 0 ? (internalLinks.length / wordCount * 100).toFixed(2) : 0,
      recommendation: internalLinks.length < 3 ? 'increase' : 'adequate'
    };
  }

  generateRecommendations(optimization, crawlData, keywordAnalysis, aiOptimization) {
    const recommendations = [];

    // AI-powered recommendations
    if (aiOptimization?.contentGaps && aiOptimization.contentGaps.length > 0) {
      const highPriorityGaps = aiOptimization.contentGaps.filter(g => g.priority === 'high');
      if (highPriorityGaps.length > 0) {
        recommendations.push({
          type: 'content_gap',
          priority: 'high',
          message: `AI-identified content gaps: ${highPriorityGaps.map(g => g.gap).slice(0, 2).join(', ')}`,
          impact: 'Addresses missing topics for comprehensive coverage'
        });
      }
    }

    if (aiOptimization?.readabilityImprovements && aiOptimization.readabilityImprovements.length > 0) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        message: `AI suggestions: ${aiOptimization.readabilityImprovements[0]}`,
        impact: 'Improved user engagement and readability scores'
      });
    }

    // Basic recommendations
    if (optimization.readability?.score < 30) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        message: 'Content is difficult to read. Simplify sentences and use shorter words.',
        impact: 'Better user engagement and SEO performance'
      });
    }

    if (!optimization.structure?.hasH1) {
      recommendations.push({
        type: 'structure',
        priority: 'critical',
        message: 'Add an H1 tag with primary keyword',
        impact: 'Essential for SEO and page structure'
      });
    }

    if (optimization.structure?.h1Count > 1) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        message: 'Remove duplicate H1 tags. Only one H1 per page is recommended.',
        impact: 'Better SEO structure and clarity'
      });
    }

    if (optimization.keywordPlacement?.score < 3) {
      recommendations.push({
        type: 'keyword_placement',
        priority: 'high',
        message: 'Improve primary keyword placement in title, H1, and first paragraph',
        impact: 'Better keyword relevance and rankings'
      });
    }

    if (optimization.internalLinking?.recommendation === 'increase') {
      recommendations.push({
        type: 'internal_linking',
        priority: 'medium',
        message: 'Add more internal links to improve site structure and navigation',
        impact: 'Better crawlability and user navigation'
      });
    }

    if (aiOptimization?.engagementTips && aiOptimization.engagementTips.length > 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: `Engagement tip: ${aiOptimization.engagementTips[0]}`,
        impact: 'Improved user engagement and time on page'
      });
    }

    return recommendations;
  }

  async execute(crawlData, keywordAnalysis) {
    return await this.optimize(crawlData, keywordAnalysis);
  }
}
