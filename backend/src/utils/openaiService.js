import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export class OpenAIService {
  constructor() {
    this.client = null;
    this.defaultModel = 'openai/gpt-4o'; // OpenRouter model
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('apiKey', apiKey);
    if (apiKey) {
      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
    } else {
      console.warn('⚠️  OPENROUTER_API_KEY not found. AI features will be limited.');
    }
  }

  isAvailable() {
    return this.client !== null;
  }

  async generateText(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter API key not configured');
    }

    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 80000,
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
      console.error('OpenRouter API Error:', error.message);
      throw new Error(`OpenRouter API call failed: ${error.message}`);
    }
  }

  async generateJSON(prompt, schema, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter API key not configured');
    }

    const {
      model = this.defaultModel,
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
        // Note: Not all OpenRouter models support response_format
        // Remove this line if your model doesn't support it
        // response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content?.trim() || '{}';
      let jsonContent = content;
      
      // Remove markdown code block markers if present
      if (content.includes('```')) {
        // Extract content between ```json and ``` or ``` and ```
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonContent = codeBlockMatch[1].trim();
        } else {
          // Try to remove just the markers
          jsonContent = content.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();
        }
      }

      // Try to find the first valid JSON object or array
      // Track both braces and brackets to handle nested structures
      let startIdx = -1;
      let braceDepth = 0;
      let bracketDepth = 0;
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < jsonContent.length; i++) {
        const char = jsonContent[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            if (startIdx === -1) startIdx = i;
            braceDepth++;
          } else if (char === '}') {
            braceDepth--;
            if (braceDepth === 0 && bracketDepth === 0 && startIdx !== -1) {
              jsonContent = jsonContent.substring(startIdx, i + 1);
              break;
            }
          } else if (char === '[') {
            if (startIdx === -1) startIdx = i;
            bracketDepth++;
          } else if (char === ']') {
            bracketDepth--;
            if (bracketDepth === 0 && braceDepth === 0 && startIdx !== -1) {
              jsonContent = jsonContent.substring(startIdx, i + 1);
              break;
            }
          }
        }
      }

      // Final cleanup
      jsonContent = jsonContent.trim();

      try {
        return JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('JSON Parse Error. Raw content:', content.substring(0, 500));
        console.error('Extracted JSON:', jsonContent.substring(0, 500));
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
    } catch (error) {
      console.error('OpenRouter JSON Generation Error:', error.message);
      throw new Error(`OpenRouter JSON generation failed: ${error.message}`);
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
