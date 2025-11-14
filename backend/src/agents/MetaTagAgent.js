import { openAIService } from '../utils/openaiService.js';

export class MetaTagAgent {
  constructor() {
    this.name = 'MetaTagAgent';
    this.status = 'ready';
    this.generatedTags = new Set();
  }

  async optimize(crawlData, keywordAnalysis) {
    try {
      this.status = 'optimizing';
      
      // Require OpenAI - no fallback
      if (!openAIService.isAvailable()) {
        throw new Error('OpenRouter API key is required for meta tag optimization. Please set OPENROUTER_API_KEY environment variable.');
      }

      const primaryKeyword = keywordAnalysis?.primaryKeywords?.[0]?.word || '';
      const title = crawlData.title || '';
      const currentDescription = crawlData.meta.description || '';

      // AI-powered optimization only
      const aiOptimization = await this.performAIOptimization(
        crawlData, 
        primaryKeyword, 
        title, 
        currentDescription
      );

      const optimization = {
        title: {
          current: title,
          optimized: aiOptimization.title,
          aiGenerated: true,
          length: aiOptimization.title.length,
          status: this.getTitleStatus(aiOptimization.title),
          includesKeyword: primaryKeyword ? aiOptimization.title.toLowerCase().includes(primaryKeyword.toLowerCase()) : null,
          suggestions: ['AI-optimized for maximum CTR', aiOptimization.titleReason || 'Optimized by AI for better search visibility']
        },
        metaDescription: {
          current: currentDescription,
          optimized: aiOptimization.description,
          aiGenerated: true,
          length: aiOptimization.description.length,
          status: this.getDescriptionStatus(aiOptimization.description),
          includesKeyword: primaryKeyword ? aiOptimization.description.toLowerCase().includes(primaryKeyword.toLowerCase()) : null,
          suggestions: ['AI-optimized for engagement', aiOptimization.descriptionReason || 'Optimized by AI to improve click-through rates']
        },
        ogTags: this.optimizeOGTags(crawlData, primaryKeyword),
        recommendations: []
      };

      optimization.recommendations = this.generateRecommendations(optimization, crawlData);

      this.status = 'ready';
      return optimization;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Meta tag optimization failed: ${error.message}`);
    }
  }

  async performAIOptimization(crawlData, primaryKeyword, currentTitle, currentDescription) {
    const contentPreview = crawlData.content.text.substring(0, 1000);
    const headings = [...crawlData.headings.h1, ...crawlData.headings.h2].join(', ');

    const prompt = `Generate optimized SEO meta tags for this webpage:

URL: ${crawlData.url}
CURRENT TITLE: ${currentTitle}
CURRENT DESCRIPTION: ${currentDescription}
PRIMARY KEYWORD: ${primaryKeyword}
CONTENT PREVIEW: ${contentPreview}
HEADINGS: ${headings}

Generate:
1. An optimized title (50-60 characters) that:
   - Includes the primary keyword naturally
   - Is compelling and click-worthy
   - Stands out in search results
   - Is unique and not generic

2. An optimized meta description (150-160 characters) that:
   - Includes the primary keyword naturally
   - Is engaging and encourages clicks
   - Summarizes the page value proposition
   - Includes a subtle call-to-action
   - Is unique and compelling

Requirements:
- Title: 50-60 characters, keyword-rich, compelling
- Description: 150-160 characters, engaging, includes keyword
- Both must be unique and optimized for CTR
- Use natural language, avoid keyword stuffing

Return as JSON:
{
  "title": "optimized title here",
  "description": "optimized description here",
  "titleReason": "why this title is optimized",
  "descriptionReason": "why this description is optimized"
}`;

    const aiResponse = await openAIService.generateJSON(
      prompt,
      {
        title: '',
        description: '',
        titleReason: '',
        descriptionReason: ''
      },
      {
        temperature: 0.8,
        maxTokens: 500,
      }
    );

    // Ensure uniqueness
    if (this.generatedTags.has(aiResponse.title)) {
      aiResponse.title = `${aiResponse.title} | ${new Date().getFullYear()}`;
    }
    if (this.generatedTags.has(aiResponse.description)) {
      aiResponse.description = `${aiResponse.description.substring(0, 150)} ${new Date().getFullYear()}`;
    }

    this.generatedTags.add(aiResponse.title);
    this.generatedTags.add(aiResponse.description);

    // Validate length
    if (aiResponse.title.length > 60) {
      aiResponse.title = aiResponse.title.substring(0, 57) + '...';
    }
    if (aiResponse.description.length > 160) {
      aiResponse.description = aiResponse.description.substring(0, 157) + '...';
    }

    return {
      title: aiResponse.title,
      description: aiResponse.description
    };
  }

  optimizeTitle(currentTitle, primaryKeyword, crawlData) {
    let optimized = currentTitle;

    if (!optimized || optimized.trim().length === 0) {
      optimized = primaryKeyword || crawlData.headings.h1[0] || 'Page Title';
    }

    if (primaryKeyword && !optimized.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      optimized = `${primaryKeyword} | ${optimized}`;
    }

    if (optimized.length > 60) {
      optimized = optimized.substring(0, 57) + '...';
    } else if (optimized.length < 30 && primaryKeyword) {
      optimized = `${primaryKeyword} - ${optimized}`;
    }

    if (this.generatedTags.has(optimized)) {
      optimized = `${optimized} | ${new Date().getFullYear()}`;
    }
    this.generatedTags.add(optimized);

    return {
      optimized,
      suggestions: optimized.length < 30 ? ['Expand title to 30-60 characters'] : []
    };
  }

  optimizeMetaDescription(currentDescription, primaryKeyword, crawlData) {
    let optimized = currentDescription;

    if (!optimized || optimized.trim().length === 0) {
      const firstPara = crawlData.content.paragraphs[0] || '';
      optimized = firstPara.substring(0, 155) || crawlData.content.text.substring(0, 155);
    }

    if (primaryKeyword && !optimized.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      optimized = `${primaryKeyword}. ${optimized}`;
    }

    if (optimized.length > 160) {
      optimized = optimized.substring(0, 157) + '...';
    }

    if (this.generatedTags.has(optimized)) {
      const year = new Date().getFullYear();
      optimized = `${optimized.substring(0, optimized.length - 4)} ${year}`;
    }
    this.generatedTags.add(optimized);

    if (optimized.length < 140 && !optimized.includes('Learn more') && !optimized.includes('Discover')) {
      optimized = `${optimized} Learn more.`;
      if (optimized.length > 160) {
        optimized = optimized.substring(0, 157) + '...';
      }
    }

    return {
      optimized,
      suggestions: optimized.length < 150 ? ['Expand description to 150-160 characters'] : []
    };
  }

  getTitleStatus(title) {
    const len = title.length;
    if (len >= 30 && len <= 60) return 'optimal';
    if (len < 30) return 'too-short';
    return 'too-long';
  }

  getDescriptionStatus(description) {
    const len = description.length;
    if (len >= 150 && len <= 160) return 'optimal';
    if (len < 150) return 'too-short';
    return 'too-long';
  }

  optimizeOGTags(crawlData, primaryKeyword) {
    const ogTags = {
      title: {
        current: crawlData.meta.og?.title || '',
        optimized: crawlData.meta.og?.title || crawlData.title || ''
      },
      description: {
        current: crawlData.meta.og?.description || '',
        optimized: crawlData.meta.og?.description || crawlData.meta.description || ''
      },
      image: {
        current: crawlData.meta.og?.image || '',
        optimized: crawlData.meta.og?.image || crawlData.images[0]?.src || ''
      },
      url: {
        current: crawlData.meta.og?.url || '',
        optimized: crawlData.meta.og?.url || crawlData.url || ''
      }
    };

    if (!ogTags.title.current && primaryKeyword) {
      ogTags.title.optimized = `${primaryKeyword} | ${ogTags.title.optimized}`;
    }

    return ogTags;
  }

  generateRecommendations(optimization, crawlData) {
    const recommendations = [];

    if (optimization.title.status === 'needs-adjustment' || optimization.title.status === 'too-short' || optimization.title.status === 'too-long') {
      recommendations.push({
        type: 'title',
        priority: 'high',
        message: optimization.title.length > 60
          ? 'Title is too long. Reduce to 50-60 characters for optimal display.'
          : 'Title is too short. Expand to 30-60 characters.',
        impact: 'Better search result display and CTR'
      });
    }

    if (!optimization.title.includesKeyword && optimization.title.includesKeyword !== null) {
      recommendations.push({
        type: 'title',
        priority: 'high',
        message: 'Include primary keyword in title for better relevance',
        impact: 'Improved keyword targeting and rankings'
      });
    }

    if (optimization.title.aiGenerated) {
      recommendations.push({
        type: 'title',
        priority: 'info',
        message: 'AI-optimized title generated for maximum CTR',
        impact: 'Higher click-through rates from search results'
      });
    }

    if (!crawlData.meta.description || crawlData.meta.description.trim().length === 0) {
      recommendations.push({
        type: 'meta_description',
        priority: 'critical',
        message: 'Missing meta description. Add one to improve search result appearance.',
        impact: 'Better CTR and search visibility'
      });
    } else if (optimization.metaDescription.status === 'too-short' || optimization.metaDescription.status === 'too-long') {
      recommendations.push({
        type: 'meta_description',
        priority: 'medium',
        message: optimization.metaDescription.length > 160
          ? 'Meta description is too long. Keep between 150-160 characters.'
          : 'Meta description is too short. Expand to 150-160 characters.',
        impact: 'Complete description display in search results'
      });
    }

    if (optimization.metaDescription.aiGenerated) {
      recommendations.push({
        type: 'meta_description',
        priority: 'info',
        message: 'AI-optimized description generated for engagement',
        impact: 'Higher click-through rates and better user engagement'
      });
    }

    if (!crawlData.meta.og?.title) {
      recommendations.push({
        type: 'og_tags',
        priority: 'medium',
        message: 'Add Open Graph title for better social media sharing',
        impact: 'Better appearance when shared on social platforms'
      });
    }

    if (!crawlData.meta.og?.image) {
      recommendations.push({
        type: 'og_tags',
        priority: 'medium',
        message: 'Add Open Graph image for social media previews',
        impact: 'More engaging social media shares'
      });
    }

    return recommendations;
  }

  async execute(crawlData, keywordAnalysis) {
    return await this.optimize(crawlData, keywordAnalysis);
  }
}
