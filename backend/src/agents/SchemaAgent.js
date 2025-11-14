import { openAIService } from '../utils/openaiService.js';

export class SchemaAgent {
  constructor() {
    this.name = 'SchemaAgent';
    this.status = 'ready';
  }

  async analyze(crawlData) {
    try {
      this.status = 'analyzing';
      
      const analysis = {
        existing: crawlData.schema || [],
        detected: this.detectSchemaTypes(crawlData.schema),
        recommendations: [],
        generated: null,
        aiGenerated: null
      };

      // Basic schema generation
      const basicSchemas = this.generateRecommendedSchema(crawlData);

      // AI-powered schema generation if available
      if (openAIService.isAvailable()) {
        try {
          const aiSchemas = await this.performAISchemaGeneration(crawlData);
          analysis.aiGenerated = aiSchemas;
        } catch (error) {
          console.warn('AI schema generation failed, using basic schema:', error.message);
        }
      }

      analysis.generated = analysis.aiGenerated || basicSchemas;
      analysis.recommendations = this.generateSchemaRecommendations(crawlData, analysis.generated);

      this.status = 'ready';
      return analysis;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Schema analysis failed: ${error.message}`);
    }
  }

  async performAISchemaGeneration(crawlData) {
    const pageType = this.detectPageType(crawlData);
    const contentPreview = crawlData.content.text.substring(0, 1500);
    const baseUrl = new URL(crawlData.url).origin;
    const domainName = baseUrl.replace('https://', '').replace('http://', '').split('/')[0];

    const prompt = `Generate comprehensive Schema.org JSON-LD structured data for this webpage:

URL: ${crawlData.url}
TITLE: ${crawlData.title}
DESCRIPTION: ${crawlData.meta.description || 'N/A'}
CONTENT TYPE: ${pageType}
CONTENT PREVIEW: ${contentPreview}
HEADINGS: ${JSON.stringify(crawlData.headings)}
DOMAIN: ${domainName}
PUBLISHED: ${crawlData.timestamp}

Generate appropriate Schema.org JSON-LD markup. Based on the page type "${pageType}", include:

1. WebPage schema (always required)
2. Appropriate specific schema (Article, Product, Organization, etc.)
3. BreadcrumbList if URL has depth
4. All required and recommended properties
5. Valid JSON-LD format with @context and @type

Requirements:
- Use valid Schema.org vocabulary
- Include all relevant properties
- Ensure proper nesting and structure
- Use correct data types
- Include organization/publisher information
- Add author information if article/blog

Return as JSON array of schema objects:
[
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    ...
  },
  {
    "@context": "https://schema.org",
    "@type": "Article/Product/etc",
    ...
  }
]`;

    const aiResponse = await openAIService.generateJSON(
      prompt,
      [],
      {
        temperature: 0.3,
        maxTokens: 3000,
        systemPrompt: 'You are an expert in Schema.org structured data. Generate valid, complete JSON-LD markup following Schema.org specifications. Always return an array of schema objects.'
      }
    );

    // Ensure it's an array
    return Array.isArray(aiResponse) ? aiResponse : [aiResponse];
  }

  detectSchemaTypes(schemas) {
    const types = [];
    
    schemas.forEach(schema => {
      if (schema['@type']) {
        types.push(schema['@type']);
      } else if (schema['@context']) {
        if (Array.isArray(schema)) {
          schema.forEach(s => {
            if (s['@type']) types.push(s['@type']);
          });
        }
      }
    });

    return [...new Set(types)];
  }

  generateSchemaRecommendations(crawlData, generatedSchemas) {
    const recommendations = [];
    const detectedTypes = this.detectSchemaTypes(crawlData.schema);
    const generatedTypes = this.detectSchemaTypes(generatedSchemas);
    const pageType = this.detectPageType(crawlData);

    if (crawlData.schema.length === 0) {
      recommendations.push({
        type: 'missing_schema',
        priority: 'high',
        message: 'No structured data found. Add schema markup to improve rich snippets.',
        impact: 'Better search result appearance and CTR'
      });
    }

    if (pageType === 'article' && !detectedTypes.includes('Article') && !generatedTypes.includes('Article')) {
      recommendations.push({
        type: 'article_schema',
        priority: 'medium',
        message: 'Add Article schema markup for better article visibility',
        impact: 'Rich snippets in search results'
      });
    }

    if (pageType === 'product' && !detectedTypes.includes('Product') && !generatedTypes.includes('Product')) {
      recommendations.push({
        type: 'product_schema',
        priority: 'high',
        message: 'Add Product schema markup for e-commerce pages',
        impact: 'Product rich results and better visibility'
      });
    }

    if (!detectedTypes.includes('BreadcrumbList') && !generatedTypes.includes('BreadcrumbList') && crawlData.url.split('/').length > 3) {
      recommendations.push({
        type: 'breadcrumb_schema',
        priority: 'medium',
        message: 'Add BreadcrumbList schema for better navigation',
        impact: 'Breadcrumb display in search results'
      });
    }

    if (!detectedTypes.includes('Organization') && !detectedTypes.includes('Person') && !generatedTypes.includes('Organization')) {
      recommendations.push({
        type: 'organization_schema',
        priority: 'low',
        message: 'Consider adding Organization or Person schema',
        impact: 'Knowledge graph eligibility'
      });
    }

    if (generatedSchemas && generatedSchemas.length > 0) {
      recommendations.push({
        type: 'schema_generated',
        priority: 'info',
        message: `AI-generated ${generatedSchemas.length} schema markup(s) ready to implement`,
        impact: 'Comprehensive structured data for better SEO'
      });
    }

    return recommendations;
  }

  detectPageType(crawlData) {
    const url = crawlData.url.toLowerCase();
    const title = crawlData.title.toLowerCase();
    const content = crawlData.content.text.toLowerCase();

    if (url.includes('/product/') || url.includes('/shop/') || url.includes('/buy/') || title.includes('buy') || title.includes('price') || title.includes('$')) {
      return 'product';
    }
    if (url.includes('/blog/') || url.includes('/article/') || url.includes('/post/') || content.includes('published') || content.includes('author') || content.includes('by ')) {
      return 'article';
    }
    if (url.includes('/about') || title.includes('about') || title.includes('team')) {
      return 'about';
    }
    if (url.includes('/contact') || title.includes('contact')) {
      return 'contact';
    }
    if (url.includes('/service') || title.includes('service')) {
      return 'service';
    }
    
    return 'page';
  }

  generateRecommendedSchema(crawlData) {
    const schemas = [];
    const baseUrl = new URL(crawlData.url).origin;
    const domainName = baseUrl.replace('https://', '').replace('http://', '').split('/')[0];

    // Generate basic WebPage schema
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: crawlData.title,
      description: crawlData.meta.description || '',
      url: crawlData.url,
      inLanguage: crawlData.html.lang || 'en',
      datePublished: crawlData.timestamp,
      dateModified: crawlData.timestamp,
      publisher: {
        '@type': 'Organization',
        name: domainName,
        url: baseUrl
      }
    };

    schemas.push(webPageSchema);

    // Generate BreadcrumbList if URL has depth
    if (crawlData.url.split('/').length > 3) {
      const pathParts = crawlData.url.replace(baseUrl, '').split('/').filter(p => p);
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: pathParts.map((part, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
          item: baseUrl + '/' + pathParts.slice(0, index + 1).join('/')
        }))
      };
      schemas.push(breadcrumbSchema);
    }

    // Generate Article schema if blog/article
    if (this.detectPageType(crawlData) === 'article') {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: crawlData.headings.h1[0] || crawlData.title,
        description: crawlData.meta.description || '',
        image: crawlData.meta.og?.image || crawlData.images[0]?.src || '',
        datePublished: crawlData.timestamp,
        dateModified: crawlData.timestamp,
        author: {
          '@type': 'Person',
          name: 'Author Name'
        },
        publisher: {
          '@type': 'Organization',
          name: domainName,
          url: baseUrl
        }
      };
      schemas.push(articleSchema);
    }

    return schemas;
  }

  async execute(crawlData) {
    return await this.analyze(crawlData);
  }
}
