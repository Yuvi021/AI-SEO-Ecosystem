import OpenAI from 'openai';

export class OpenAIService {
  constructor() {
    this.client = null;
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey: apiKey,
      });
    } else {
      console.warn('⚠️  OPENAI_API_KEY not found. AI features will be limited.');
    }
  }

  isAvailable() {
    return this.client !== null;
  }

  async generateText(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = null,
    } = options;

    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  async generateJSON(prompt, schema, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      model = 'gpt-4-turbo-preview',
      temperature = 0.3,
      systemPrompt = 'You are a JSON generator. Always return valid JSON only, no additional text.',
    } = options;

    try {
      const fullPrompt = `${prompt}\n\nReturn the response as valid JSON matching this structure: ${JSON.stringify(schema, null, 2)}`;

      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: fullPrompt,
        },
      ];

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content?.trim() || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI JSON Generation Error:', error.message);
      throw new Error(`OpenAI JSON generation failed: ${error.message}`);
    }
  }

  async analyzeWithAI(prompt, analysisType, options = {}) {
    const systemPrompts = {
      keyword: `You are an expert SEO keyword analyst. Analyze content and provide:
- Primary keywords with search intent
- Long-tail keyword opportunities
- Semantic keyword variations
- Keyword gaps and opportunities
- Competitive keyword suggestions
Always provide data-driven, actionable insights.`,

      content: `You are an expert SEO content optimizer. Analyze content and provide:
- Readability improvements
- Content structure recommendations
- Keyword placement optimization
- Content quality assessment
- Engagement enhancement suggestions
Focus on actionable, specific recommendations.`,

      meta: `You are an expert SEO meta tag optimizer. Generate:
- Compelling, keyword-rich titles (50-60 chars)
- Engaging meta descriptions (150-160 chars)
- Optimized Open Graph tags
- Unique, non-duplicate content
Ensure all outputs follow SEO best practices and are unique.`,

      schema: `You are an expert in Schema.org structured data. Generate:
- Appropriate schema types for the content
- Valid JSON-LD markup
- Complete schema properties
- SEO-optimized structured data
Always return valid Schema.org compliant JSON-LD.`,

      image: `You are an expert in image SEO and accessibility. Generate:
- Descriptive, keyword-rich alt text (5-125 chars)
- SEO-friendly image descriptions
- Context-aware alt text suggestions
- Accessibility-compliant descriptions
Focus on accuracy, relevance, and SEO value.`,

      validation: `You are an expert SEO quality auditor. Validate:
- Content uniqueness
- SEO compliance
- Quality standards
- Best practice adherence
Provide specific, actionable feedback.`,
    };

    const systemPrompt = systemPrompts[analysisType] || systemPrompts.content;

    return await this.generateText(prompt, {
      ...options,
      systemPrompt,
      temperature: options.temperature || 0.5,
    });
  }
}

export const openAIService = new OpenAIService();

