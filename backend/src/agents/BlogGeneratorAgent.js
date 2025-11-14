import { openAIService } from '../utils/openaiService.js';

/**
 * Blog Generator Agent - Generates SEO-optimized blog content
 * Uses AI to create comprehensive, well-structured blog posts
 */
export class BlogGeneratorAgent {
  constructor() {
    this.name = 'BlogGeneratorAgent';
    this.status = 'ready';
  }

  /**
   * Generate blog post with SEO optimization
   */
  async generateBlog(options = {}) {
    try {
      this.status = 'generating';
      
      const {
        topic,
        keywords = [],
        targetLength = 1500,
        tone = 'professional',
        includeIntro = true,
        includeConclusion = true,
        includeFAQ = false,
        targetAudience = 'general',
        background = ''
      } = options;

      if (!topic) {
        throw new Error('Topic is required');
      }

      const result = {
        topic,
        keywords,
        content: {
          title: '',
          metaDescription: '',
          introduction: '',
          body: [],
          conclusion: '',
          faq: []
        },
        seoAnalysis: {
          wordCount: 0,
          keywordDensity: {},
          readabilityScore: 0,
          headingStructure: {},
          recommendations: []
        },
        keywordAnalysis: {
          primaryKeywords: [],
          secondaryKeywords: [],
          relatedKeywords: [],
          missingKeywords: []
        },
        contentQuality: {
          score: 0,
          strengths: [],
          improvements: []
        }
      };

      // Generate blog content using AI
      if (openAIService.isAvailable()) {
        const generatedContent = await this.generateWithAI(options);
        result.content = generatedContent;
      } else {
        // Fallback to template-based generation
        result.content = this.generateTemplate(options);
      }

      // Analyze the generated content
      result.seoAnalysis = this.analyzeSEO(result.content, keywords);
      result.keywordAnalysis = this.analyzeKeywords(result.content, keywords);
      result.contentQuality = this.assessQuality(result.content, options);

      this.status = 'ready';
      return result;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Blog generation failed: ${error.message}`);
    }
  }

  async generateWithAI(options) {
    const {
      topic,
      keywords = [],
      targetLength = 1500,
      tone = 'professional',
      includeIntro = true,
      includeConclusion = true,
      includeFAQ = false,
      targetAudience = 'general',
      background = ''
    } = options;

    const keywordList = keywords.join(', ');
    const backgroundInfo = background ? `\n\nBackground Information:\n${background}` : '';

    const prompt = `Write a comprehensive, SEO-optimized blog post about: "${topic}"

Requirements:
- Target Length: ${targetLength} words
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Primary Keywords: ${keywordList}
- Include engaging introduction: ${includeIntro}
- Include strong conclusion: ${includeConclusion}
- Include FAQ section: ${includeFAQ}${backgroundInfo}

Structure the blog post with:
1. Compelling title (60-70 characters, include primary keyword)
2. Meta description (150-160 characters, include primary keyword)
3. Introduction (hook the reader, explain what they'll learn)
4. Main content sections (3-5 sections with H2 headings)
5. Conclusion (summarize key points, call-to-action)
${includeFAQ ? '6. FAQ section (3-5 common questions)' : ''}

SEO Best Practices:
- Use keywords naturally (don't stuff)
- Include variations and related terms
- Use short paragraphs (2-3 sentences)
- Include bullet points and lists
- Write in active voice
- Use transition words
- Make it scannable

Return as JSON:
{
  "title": "SEO-optimized title",
  "metaDescription": "Compelling meta description",
  "introduction": "Engaging introduction paragraph",
  "body": [
    {
      "heading": "Section heading (H2)",
      "content": "Section content with multiple paragraphs",
      "subsections": [
        {
          "heading": "Subsection heading (H3)",
          "content": "Subsection content"
        }
      ]
    }
  ],
  "conclusion": "Strong conclusion with CTA",
  "faq": [
    {
      "question": "Common question?",
      "answer": "Detailed answer"
    }
  ]
}`;

    try {
      const content = await openAIService.generateJSON(
        prompt,
        {
          title: '',
          metaDescription: '',
          introduction: '',
          body: [],
          conclusion: '',
          faq: []
        },
        {
          temperature: 0.7,
          maxTokens: Math.min(4000, Math.ceil(targetLength * 2))
        }
      );

      return content;
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.generateTemplate(options);
    }
  }

  generateTemplate(options) {
    const { topic, keywords = [], targetLength = 1500 } = options;
    const primaryKeyword = keywords[0] || topic;

    return {
      title: `Complete Guide to ${topic}`,
      metaDescription: `Learn everything about ${topic}. Comprehensive guide with tips, best practices, and expert insights. ${keywords.slice(0, 2).join(', ')}.`,
      introduction: `In this comprehensive guide, we'll explore ${topic} and provide you with actionable insights. Whether you're a beginner or looking to enhance your knowledge, this article covers everything you need to know about ${primaryKeyword}.`,
      body: [
        {
          heading: `What is ${topic}?`,
          content: `${topic} is an important concept that requires understanding. In this section, we'll break down the fundamentals and explain why ${primaryKeyword} matters.`,
          subsections: []
        },
        {
          heading: `Key Benefits of ${topic}`,
          content: `Understanding ${primaryKeyword} offers numerous advantages. Here are the main benefits you should know about.`,
          subsections: []
        },
        {
          heading: `Best Practices for ${topic}`,
          content: `To get the most out of ${primaryKeyword}, follow these proven best practices and strategies.`,
          subsections: []
        }
      ],
      conclusion: `${topic} is essential for success. By following the strategies outlined in this guide, you'll be well-equipped to leverage ${primaryKeyword} effectively. Start implementing these tips today!`,
      faq: []
    };
  }

  analyzeSEO(content, keywords) {
    const fullText = this.extractFullText(content);
    const words = fullText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Calculate keyword density
    const keywordDensity = {};
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = fullText.match(regex);
      const count = matches ? matches.length : 0;
      const density = wordCount > 0 ? ((count / wordCount) * 100).toFixed(2) : 0;
      
      keywordDensity[keyword] = {
        count,
        density: parseFloat(density),
        status: this.getKeywordStatus(count, wordCount)
      };
    });

    // Analyze heading structure
    const headingStructure = {
      h1: content.title ? 1 : 0,
      h2: content.body.length,
      h3: content.body.reduce((sum, section) => sum + (section.subsections?.length || 0), 0)
    };

    // Calculate readability score (simplified Flesch Reading Ease)
    const readabilityScore = this.calculateReadability(fullText);

    // Generate recommendations
    const recommendations = this.generateSEORecommendations(
      wordCount,
      keywordDensity,
      headingStructure,
      readabilityScore
    );

    return {
      wordCount,
      keywordDensity,
      readabilityScore,
      headingStructure,
      recommendations
    };
  }

  analyzeKeywords(content, keywords) {
    const fullText = this.extractFullText(content).toLowerCase();
    
    // Identify which keywords are used
    const primaryKeywords = keywords.filter(kw => {
      const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'gi');
      return fullText.match(regex);
    });

    // Find related keywords in content
    const words = fullText.split(/\s+/).filter(w => w.length > 4);
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const relatedKeywords = Object.entries(wordFreq)
      .filter(([word, count]) => count >= 3 && !keywords.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Find missing keywords
    const missingKeywords = keywords.filter(kw => !primaryKeywords.includes(kw));

    return {
      primaryKeywords,
      secondaryKeywords: relatedKeywords.slice(0, 5),
      relatedKeywords: relatedKeywords.slice(5),
      missingKeywords
    };
  }

  assessQuality(content, options) {
    const fullText = this.extractFullText(content);
    const wordCount = fullText.split(/\s+/).length;
    const targetLength = options.targetLength || 1500;

    const strengths = [];
    const improvements = [];
    let score = 70; // Base score

    // Check word count
    if (wordCount >= targetLength * 0.9 && wordCount <= targetLength * 1.2) {
      strengths.push('Appropriate content length');
      score += 10;
    } else if (wordCount < targetLength * 0.7) {
      improvements.push('Content is too short, add more detail');
      score -= 10;
    }

    // Check structure
    if (content.body.length >= 3) {
      strengths.push('Well-structured with multiple sections');
      score += 5;
    } else {
      improvements.push('Add more content sections');
      score -= 5;
    }

    // Check introduction
    if (content.introduction && content.introduction.length > 100) {
      strengths.push('Engaging introduction');
      score += 5;
    } else {
      improvements.push('Expand introduction');
    }

    // Check conclusion
    if (content.conclusion && content.conclusion.length > 80) {
      strengths.push('Strong conclusion');
      score += 5;
    } else {
      improvements.push('Add compelling conclusion');
    }

    // Check FAQ
    if (content.faq && content.faq.length > 0) {
      strengths.push('Includes FAQ section');
      score += 5;
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      improvements
    };
  }

  extractFullText(content) {
    let text = '';
    text += content.title + ' ';
    text += content.metaDescription + ' ';
    text += content.introduction + ' ';
    
    content.body.forEach(section => {
      text += section.heading + ' ';
      text += section.content + ' ';
      if (section.subsections) {
        section.subsections.forEach(sub => {
          text += sub.heading + ' ';
          text += sub.content + ' ';
        });
      }
    });
    
    text += content.conclusion + ' ';
    
    if (content.faq) {
      content.faq.forEach(item => {
        text += item.question + ' ' + item.answer + ' ';
      });
    }
    
    return text;
  }

  getKeywordStatus(count, totalWords) {
    const density = (count / totalWords) * 100;
    if (density < 0.5) return 'too_low';
    if (density > 3) return 'too_high';
    return 'optimal';
  }

  calculateReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  generateSEORecommendations(wordCount, keywordDensity, headingStructure, readabilityScore) {
    const recommendations = [];

    // Word count recommendations
    if (wordCount < 1000) {
      recommendations.push({
        type: 'word_count',
        priority: 'high',
        message: `Content is short (${wordCount} words). Aim for 1500+ words for better SEO.`,
        action: 'Add more detailed sections and examples'
      });
    } else if (wordCount > 3000) {
      recommendations.push({
        type: 'word_count',
        priority: 'low',
        message: `Content is very long (${wordCount} words). Consider breaking into multiple articles.`,
        action: 'Split into a series or add table of contents'
      });
    }

    // Keyword density recommendations
    Object.entries(keywordDensity).forEach(([keyword, data]) => {
      if (data.status === 'too_low') {
        recommendations.push({
          type: 'keyword_density',
          priority: 'high',
          message: `"${keyword}" appears only ${data.count} times (${data.density}%). Increase usage.`,
          action: 'Add keyword naturally in headings and content'
        });
      } else if (data.status === 'too_high') {
        recommendations.push({
          type: 'keyword_density',
          priority: 'medium',
          message: `"${keyword}" appears ${data.count} times (${data.density}%). Risk of keyword stuffing.`,
          action: 'Reduce keyword usage, use variations'
        });
      }
    });

    // Heading structure recommendations
    if (headingStructure.h2 < 3) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        message: `Only ${headingStructure.h2} H2 headings. Add more sections.`,
        action: 'Break content into 4-6 main sections with H2 headings'
      });
    }

    // Readability recommendations
    if (readabilityScore < 50) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        message: `Readability score is low (${readabilityScore}/100). Content is hard to read.`,
        action: 'Use shorter sentences and simpler words'
      });
    } else if (readabilityScore > 80) {
      recommendations.push({
        type: 'readability',
        priority: 'low',
        message: `Excellent readability score (${readabilityScore}/100)!`,
        action: 'Maintain this writing style'
      });
    }

    return recommendations;
  }

  async execute(options) {
    return await this.generateBlog(options);
  }
}
