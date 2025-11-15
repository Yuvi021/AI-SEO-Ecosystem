import { openAIService } from '../utils/openaiService.js';

export class ContentOptimizationAgent {
  constructor() {
    this.name = 'ContentOptimizationAgent';
    this.status = 'ready';
  }

  async optimize(crawlData, keywordAnalysis) {
    try {
      this.status = 'optimizing';

      // Validate input data
      if (!crawlData || !crawlData.content) {
        throw new Error('Invalid crawl data: content is missing');
      }

      // Calculate readability metrics (always available)
      const readability = this.calculateReadability(crawlData);

      // Analyze content structure
      const structure = this.analyzeStructure(crawlData);

      // Analyze keyword placement
      const keywordPlacement = this.analyzeKeywordPlacement(crawlData, keywordAnalysis);

      // Analyze internal linking
      const internalLinking = this.analyzeInternalLinking(crawlData);

      // Try to get AI-powered suggestions (optional enhancement)
      let aiSuggestions = null;
      let contentQuality = null;
      let engagementTips = [];
      let readabilityImprovements = [];
      let structureRecommendations = [];

      if (openAIService.isAvailable()) {
        try {
          const aiOptimization = await this.getAISuggestions(crawlData, keywordAnalysis);
          aiSuggestions = aiOptimization.suggestions || null;
          contentQuality = aiOptimization.quality || null;
          engagementTips = aiOptimization.engagementTips || [];
          readabilityImprovements = aiOptimization.readabilityImprovements || [];
          structureRecommendations = aiOptimization.structureRecommendations || [];
        } catch (aiError) {
          console.warn('AI optimization failed, using basic analysis:', aiError.message);
          // Continue with basic analysis if AI fails
        }
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        { readability, structure, keywordPlacement, internalLinking },
        crawlData,
        keywordAnalysis,
        {
          aiSuggestions,
          contentQuality,
          engagementTips,
          readabilityImprovements,
          structureRecommendations
        }
      );

      const optimization = {
        readability,
        structure,
        keywordPlacement,
        internalLinking,
        aiSuggestions,
        contentQuality,
        engagementTips,
        readabilityImprovements,
        structureRecommendations,
        recommendations
      };

      this.status = 'ready';
      return optimization;
    } catch (error) {
      this.status = 'error';
      console.error('Content optimization error:', error);
      throw new Error(`Content optimization failed: ${error.message}`);
    }
  }

  calculateReadability(crawlData) {
    const text = crawlData.content.text || '';
    if (!text || text.trim().length === 0) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        avgSentenceLength: 0,
        avgParagraphLength: 0,
        fleschScore: 0,
        readability: 'unknown',
        score: 0
      };
    }

    // Split into sentences (handle multiple punctuation marks)
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Split into words
    const words = text
      .split(/\s+/)
      .map(w => w.replace(/[^\w]/g, ''))
      .filter(w => w.length > 0);

    // Get paragraphs
    const paragraphs = crawlData.content.paragraphs || [];
    const paragraphCount = paragraphs.length || 1;

    // Calculate averages
    const sentenceCount = sentences.length || 1;
    const wordCount = words.length;
    const avgSentenceLength = wordCount / sentenceCount;
    const avgParagraphLength = wordCount / paragraphCount;

    // Calculate Flesch Reading Ease Score
    const avgWordsPerSentence = avgSentenceLength;
    const avgSyllablesPerWord = this.calculateAvgSyllables(words);
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    // Determine readability level
    let readabilityLevel = 'unknown';
    if (fleschScore >= 90) readabilityLevel = 'very_easy';
    else if (fleschScore >= 80) readabilityLevel = 'easy';
    else if (fleschScore >= 70) readabilityLevel = 'fairly_easy';
    else if (fleschScore >= 60) readabilityLevel = 'standard';
    else if (fleschScore >= 50) readabilityLevel = 'fairly_difficult';
    else if (fleschScore >= 30) readabilityLevel = 'difficult';
    else readabilityLevel = 'very_difficult';

    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      avgSentenceLength: parseFloat(avgSentenceLength.toFixed(1)),
      avgParagraphLength: parseFloat(avgParagraphLength.toFixed(1)),
      fleschScore: parseFloat(fleschScore.toFixed(1)),
      readability: readabilityLevel,
      score: parseFloat(fleschScore.toFixed(1))
    };
  }

  calculateAvgSyllables(words) {
    if (!words || words.length === 0) return 1;

    let totalSyllables = 0;
    const syllableCount = (word) => {
      word = word.toLowerCase().replace(/[^a-z]/g, '');
      if (word.length <= 3) return 1;
      
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
      word = word.replace(/^y/, '');
      const matches = word.match(/[aeiouy]{1,2}/g);
      return matches ? matches.length : 1;
    };

    words.forEach(word => {
      totalSyllables += syllableCount(word);
    });

    return totalSyllables / words.length;
  }

  analyzeStructure(crawlData) {
    const headings = crawlData.headings || {};
    const h1Count = (headings.h1 || []).length;
    const h2Count = (headings.h2 || []).length;
    const h3Count = (headings.h3 || []).length;

    const issues = [];
    let headingHierarchy = true;

    // Check for H1
    if (h1Count === 0) {
      issues.push('Missing H1 tag - essential for SEO');
      headingHierarchy = false;
    } else if (h1Count > 1) {
      issues.push(`Multiple H1 tags found (${h1Count}) - should have only one`);
      headingHierarchy = false;
    }

    // Check heading hierarchy
    if (h3Count > 0 && h2Count === 0) {
      issues.push('H3 tags used without H2 tags - breaks heading hierarchy');
      headingHierarchy = false;
    }

    // Check for sufficient headings
    if (h2Count === 0 && h1Count > 0) {
      issues.push('No H2 tags found - consider adding subheadings for better structure');
    }

    // Check heading length
    const allHeadings = [
      ...(headings.h1 || []),
      ...(headings.h2 || []),
      ...(headings.h3 || [])
    ];

    allHeadings.forEach((heading, index) => {
      if (heading.length > 60) {
        issues.push(`Heading ${index + 1} is too long (${heading.length} chars) - keep under 60 characters`);
      }
    });

    return {
      hasH1: h1Count > 0,
      h1Count,
      h2Count,
      h3Count,
      headingHierarchy,
      issues: issues.length > 0 ? issues : []
    };
  }

  analyzeKeywordPlacement(crawlData, keywordAnalysis) {
    if (!keywordAnalysis || !keywordAnalysis.primaryKeywords || keywordAnalysis.primaryKeywords.length === 0) {
      return {
        score: 0,
        issues: ['No primary keywords found for analysis'],
        placements: {}
      };
    }

    const primaryKeyword = keywordAnalysis.primaryKeywords[0].word || '';
    if (!primaryKeyword) {
      return {
        score: 0,
        issues: ['Primary keyword is empty'],
        placements: {}
      };
    }

    const keywordLower = primaryKeyword.toLowerCase();
    const title = (crawlData.title || '').toLowerCase();
    const metaDescription = (crawlData.meta?.description || '').toLowerCase();
    const text = (crawlData.content.text || '').toLowerCase();
    const firstParagraph = (crawlData.content.paragraphs?.[0] || '').toLowerCase();
    
    const headings = crawlData.headings || {};
    const h1Headings = (headings.h1 || []).map(h => h.toLowerCase());
    const h2Headings = (headings.h2 || []).map(h => h.toLowerCase());

    // Check placements
    const placements = {
      inTitle: title.includes(keywordLower),
      inMetaDescription: metaDescription.includes(keywordLower),
      inH1: h1Headings.some(h => h.includes(keywordLower)),
      inH2: h2Headings.some(h => h.includes(keywordLower)),
      inFirstParagraph: firstParagraph.includes(keywordLower),
      frequency: (text.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    };

    // Calculate score (0-5)
    let score = 0;
    const issues = [];

    if (placements.inTitle) score += 1;
    else issues.push('Primary keyword not found in title');

    if (placements.inH1) score += 1;
    else if (placements.inH2) score += 0.5;
    else issues.push('Primary keyword not found in H1 or H2 headings');

    if (placements.inFirstParagraph) score += 1;
    else issues.push('Primary keyword not found in first paragraph');

    if (placements.inMetaDescription) score += 0.5;
    else issues.push('Primary keyword not found in meta description');

    if (placements.frequency >= 3 && placements.frequency <= 10) score += 1.5;
    else if (placements.frequency > 10) {
      score += 1;
      issues.push('Primary keyword may be overused (keyword stuffing risk)');
    } else {
      issues.push(`Primary keyword used only ${placements.frequency} time(s) - aim for 3-10 occurrences`);
    }

    return {
      score: Math.min(5, Math.round(score * 10) / 10),
      issues: issues.length > 0 ? issues : [],
      placements
    };
  }

  analyzeInternalLinking(crawlData) {
    const internalLinks = crawlData.links?.internal || [];
    const wordCount = crawlData.content?.wordCount || 0;

    const linkCount = internalLinks.length;
    const linksPer100Words = wordCount > 0 ? (linkCount / wordCount) * 100 : 0;
    
    const anchorTexts = internalLinks
      .map(link => link.text || link.href)
      .filter(text => text && text.length > 0)
      .slice(0, 10); // Limit to first 10

    let recommendation = 'adequate';
    if (linkCount === 0) {
      recommendation = 'critical';
    } else if (linkCount < 3) {
      recommendation = 'increase';
    } else if (linksPer100Words < 0.5) {
      recommendation = 'increase';
    }

    return {
      count: linkCount,
      linksPer100Words: parseFloat(linksPer100Words.toFixed(2)),
      anchorTexts,
      recommendation
    };
  }

  async getAISuggestions(crawlData, keywordAnalysis) {
    const primaryKeyword = keywordAnalysis?.primaryKeywords?.[0]?.word || 'content';
    const contentPreview = (crawlData.content.text || '').substring(0, 4000);
    const title = crawlData.title || 'Untitled';
    const headings = crawlData.headings || {};

    const prompt = `Analyze and provide optimization suggestions for this webpage content:

TITLE: ${title}
PRIMARY KEYWORD: ${primaryKeyword}
CONTENT PREVIEW: ${contentPreview}
HEADINGS: H1: ${(headings.h1 || []).join(', ')}, H2: ${(headings.h2 || []).slice(0, 5).join(', ')}
WORD COUNT: ${crawlData.content.wordCount || 0}

Provide specific, actionable recommendations in JSON format:
{
  "quality": {
    "score": 85,
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"]
  },
  "readabilityImprovements": ["specific improvement 1", "specific improvement 2"],
  "structureRecommendations": ["structure recommendation 1", "structure recommendation 2"],
  "engagementTips": ["engagement tip 1", "engagement tip 2"],
  "suggestions": {
    "intro": "suggested improved introduction paragraph",
    "conclusion": "suggested conclusion paragraph",
    "headings": ["suggested H2 heading 1", "suggested H2 heading 2"]
  },
  "contentGaps": [
    {"gap": "missing topic description", "priority": "high"}
  ]
}`;

    const schema = {
      quality: { score: 0, strengths: [], weaknesses: [] },
      readabilityImprovements: [],
      structureRecommendations: [],
      engagementTips: [],
      suggestions: { intro: '', conclusion: '', headings: [] },
      contentGaps: []
    };

    try {
      const aiResponse = await openAIService.generateJSON(
        prompt,
        schema,
        {
          temperature: 0.6,
          maxTokens: 2000,
          systemPrompt: 'You are an expert SEO content optimizer. Provide specific, actionable recommendations for improving content quality, readability, structure, and engagement. Focus on practical improvements that can be implemented immediately.'
        }
      );

      return aiResponse;
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      return schema; // Return empty schema on error
    }
  }

  generateRecommendations(optimization, crawlData, keywordAnalysis, aiData) {
    const recommendations = [];

    // Readability recommendations
    if (optimization.readability.score < 30) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        message: 'Content is very difficult to read. Simplify sentences, use shorter words, and break up long paragraphs.',
        impact: 'Improves user engagement and reduces bounce rate'
      });
    } else if (optimization.readability.score < 50) {
      recommendations.push({
        type: 'readability',
        priority: 'medium',
        message: 'Content readability can be improved. Consider shorter sentences and simpler vocabulary.',
        impact: 'Better user experience and engagement'
      });
    }

    // Structure recommendations
    if (!optimization.structure.hasH1) {
      recommendations.push({
        type: 'structure',
        priority: 'critical',
        message: 'Add an H1 tag with your primary keyword. This is essential for SEO.',
        impact: 'Critical for search engine understanding and rankings'
      });
    }

    if (optimization.structure.h1Count > 1) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        message: `Remove duplicate H1 tags. Only one H1 per page is recommended (currently ${optimization.structure.h1Count}).`,
        impact: 'Better SEO structure and clarity'
      });
    }

    if (optimization.structure.h2Count === 0 && optimization.structure.hasH1) {
      recommendations.push({
        type: 'structure',
        priority: 'medium',
        message: 'Add H2 subheadings to organize content and improve readability.',
        impact: 'Better content structure and user experience'
      });
    }

    // Keyword placement recommendations
    if (optimization.keywordPlacement.score < 2) {
      recommendations.push({
        type: 'keyword_placement',
        priority: 'high',
        message: 'Improve primary keyword placement in title, H1, and first paragraph.',
        impact: 'Better keyword relevance and search rankings'
      });
    } else if (optimization.keywordPlacement.score < 3.5) {
      recommendations.push({
        type: 'keyword_placement',
        priority: 'medium',
        message: 'Optimize keyword placement for better SEO performance.',
        impact: 'Improved keyword relevance signals'
      });
    }

    // Internal linking recommendations
    if (optimization.internalLinking.recommendation === 'critical') {
      recommendations.push({
        type: 'internal_linking',
        priority: 'high',
        message: 'Add internal links to improve site structure and help users navigate.',
        impact: 'Better crawlability and user navigation'
      });
    } else if (optimization.internalLinking.recommendation === 'increase') {
      recommendations.push({
        type: 'internal_linking',
        priority: 'medium',
        message: 'Add more internal links to related content (aim for 3-5 links per page).',
        impact: 'Improved site structure and SEO'
      });
    }

    // AI-powered recommendations
    if (aiData.readabilityImprovements && aiData.readabilityImprovements.length > 0) {
      aiData.readabilityImprovements.slice(0, 2).forEach(improvement => {
        recommendations.push({
          type: 'readability',
          priority: 'medium',
          message: `AI suggestion: ${improvement}`,
          impact: 'Improved content quality and readability'
        });
      });
    }

    if (aiData.structureRecommendations && aiData.structureRecommendations.length > 0) {
      aiData.structureRecommendations.slice(0, 2).forEach(rec => {
        recommendations.push({
          type: 'structure',
          priority: 'medium',
          message: `AI suggestion: ${rec}`,
          impact: 'Better content organization'
        });
      });
    }

    if (aiData.engagementTips && aiData.engagementTips.length > 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: `Engagement tip: ${aiData.engagementTips[0]}`,
        impact: 'Improved user engagement and time on page'
      });
    }

    // Content length recommendations
    const wordCount = optimization.readability.wordCount;
    if (wordCount < 300) {
      recommendations.push({
        type: 'content_length',
        priority: 'medium',
        message: 'Content is too short. Aim for at least 300 words for better SEO.',
        impact: 'More comprehensive content ranks better'
      });
    } else if (wordCount > 3000 && optimization.readability.paragraphCount < 10) {
      recommendations.push({
        type: 'content_structure',
        priority: 'low',
        message: 'Consider breaking up long content with more paragraphs and subheadings.',
        impact: 'Better readability and user experience'
      });
    }

    return recommendations.length > 0 ? recommendations : [
      {
        type: 'general',
        priority: 'low',
        message: 'Content optimization looks good! Continue monitoring and improving.',
        impact: 'Maintain quality standards'
      }
    ];
  }

  async execute(crawlData, keywordAnalysis) {
    return await this.optimize(crawlData, keywordAnalysis);
  }
}
