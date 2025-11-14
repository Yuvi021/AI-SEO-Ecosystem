import { openAIService } from '../utils/openaiService.js';

export class ImageIntelligenceAgent {
  constructor() {
    this.name = 'ImageIntelligenceAgent';
    this.status = 'ready';
  }

  async analyze(crawlData) {
    try {
      this.status = 'analyzing';
      
      const analysis = {
        images: [],
        optimization: this.generateOptimizationSuggestions(crawlData.images),
        recommendations: []
      };

      // Analyze each image
      for (let i = 0; i < crawlData.images.length; i++) {
        const img = crawlData.images[i];
        const imageAnalysis = await this.analyzeImage(img, crawlData, i);
        analysis.images.push(imageAnalysis);
      }

      analysis.recommendations = this.generateRecommendations(analysis);

      this.status = 'ready';
      return analysis;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  async analyzeImage(img, crawlData, index) {
    const analysis = {
      index,
      src: img.src,
      alt: img.alt || '',
      title: img.title || '',
      hasAlt: !!(img.alt && img.alt.trim().length > 0),
      hasTitle: !!(img.title && img.title.trim().length > 0),
      altQuality: 'unknown',
      filename: this.extractFilename(img.src),
      filenameOptimized: false,
      suggestions: {
        alt: null,
        filename: null
      },
      aiGenerated: false
    };

    // Analyze alt text quality
    if (analysis.hasAlt) {
      if (analysis.alt.length < 5) {
        analysis.altQuality = 'poor';
      } else if (analysis.alt.length > 125) {
        analysis.altQuality = 'too-long';
      } else {
        analysis.altQuality = 'good';
      }

      const words = analysis.alt.toLowerCase().split(/\s+/);
      if (words.length > 15) {
        analysis.altQuality = 'too-long';
      }
    } else {
      analysis.altQuality = 'missing';
    }

    // Analyze filename
    const filename = analysis.filename.toLowerCase();
    analysis.filenameOptimized = /^[a-z0-9-]+\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    
    if (!analysis.filenameOptimized) {
      analysis.suggestions.filename = this.suggestFilename(img.src);
    }

    // Generate alt text suggestion using OpenAI only
    if (!analysis.hasAlt || analysis.altQuality === 'poor' || analysis.altQuality === 'too-long') {
      if (openAIService.isAvailable()) {
        try {
          const aiAltText = await this.generateAIAltText(img, crawlData);
          analysis.suggestions.alt = aiAltText;
          analysis.aiGenerated = true;
        } catch (error) {
          console.warn(`AI alt text generation failed for image ${index}:`, error.message);
          // Don't use fallback - require OpenAI
          analysis.suggestions.alt = null;
        }
      } else {
        // Require OpenAI - no fallback
        analysis.suggestions.alt = null;
      }
    }

    return analysis;
  }

  async generateAIAltText(img, crawlData) {
    const context = {
      pageTitle: crawlData.title,
      pageContent: crawlData.content.text.substring(0, 500),
      imageUrl: img.src,
      imageFilename: this.extractFilename(img.src),
      currentAlt: img.alt || 'none',
      surroundingText: this.getSurroundingContext(img, crawlData)
    };

    const prompt = `Generate an SEO-optimized, accessible alt text for this image:

PAGE CONTEXT:
- Title: ${context.pageTitle}
- Content: ${context.pageContent}
- Image URL: ${context.imageUrl}
- Filename: ${context.imageFilename}
- Current Alt: ${context.currentAlt}
- Surrounding Context: ${context.surroundingText}

Requirements:
- 5-125 characters (optimal: 10-80)
- Descriptive and specific
- Includes relevant keywords naturally
- Accessible for screen readers
- SEO-friendly
- No keyword stuffing
- Natural language

Generate a single, optimized alt text that:
1. Accurately describes the image
2. Includes relevant keywords from the page context
3. Is concise but descriptive
4. Follows accessibility best practices

Return only the alt text, nothing else.`;

    const altText = await openAIService.generateText(prompt, {
      temperature: 0.5,
      maxTokens: 50,
      systemPrompt: 'You are an expert in image SEO and accessibility. Generate concise, descriptive, keyword-rich alt text that is both SEO-optimized and accessible.'
    });

    // Validate length
    if (altText.length > 125) {
      return altText.substring(0, 122) + '...';
    }
    if (altText.length < 5) {
      return this.generateAltText(img.src, context.imageFilename);
    }

    return altText.trim();
  }

  getSurroundingContext(img, crawlData) {
    // Try to find context around the image in the content
    const imgSrc = img.src.toLowerCase();
    const paragraphs = crawlData.content.paragraphs;
    
    // Find paragraph that might contain image reference
    for (const para of paragraphs) {
      if (para.toLowerCase().includes(imgSrc.split('/').pop().split('.')[0])) {
        return para.substring(0, 200);
      }
    }
    
    return paragraphs[0]?.substring(0, 200) || '';
  }

  extractFilename(url) {
    try {
      const urlObj = new URL(url, 'http://example.com');
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'image';
    } catch {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'image';
    }
  }

  suggestFilename(src) {
    const current = this.extractFilename(src);
    const extension = current.split('.').pop() || 'jpg';
    
    const name = current.replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    
    if (name.length < 3) {
      return `descriptive-image-name.${extension}`;
    }
    
    return `${name}.${extension}`;
  }

  generateAltText(src, filename) {
    const name = filename.replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 5)
      .join(' ');

    if (name.length > 10) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    if (src.includes('logo')) return 'Company logo';
    if (src.includes('hero') || src.includes('banner')) return 'Hero image';
    if (src.includes('product')) return 'Product image';
    if (src.includes('team') || src.includes('person')) return 'Team member photo';
    
    return 'Descriptive image';
  }

  generateOptimizationSuggestions(images) {
    const suggestions = {
      compressCount: 0,
      formatSuggestions: [],
      lazyLoad: images.length > 3
    };

    images.forEach(img => {
      const src = img.src.toLowerCase();
      const extension = src.split('.').pop() || '';

      if (['jpg', 'jpeg', 'png'].includes(extension)) {
        suggestions.formatSuggestions.push({
          src: img.src,
          current: extension,
          suggested: 'webp',
          reason: 'WebP offers better compression with same quality'
        });
      }

      if (src.includes('full') || src.includes('large') || src.includes('original')) {
        suggestions.compressCount++;
      }
    });

    return suggestions;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    const imagesWithoutAlt = analysis.images.filter(img => !img.hasAlt);
    if (imagesWithoutAlt.length > 0) {
      recommendations.push({
        type: 'alt_text',
        priority: 'high',
        message: `${imagesWithoutAlt.length} images missing alt text. Add descriptive alt text for accessibility and SEO.`,
        impact: 'Better accessibility, image search rankings, and SEO'
      });
    }

    const poorAltText = analysis.images.filter(img => img.altQuality === 'poor' || img.altQuality === 'too-long');
    if (poorAltText.length > 0) {
      recommendations.push({
        type: 'alt_text',
        priority: 'medium',
        message: `${poorAltText.length} images have poor quality alt text. Optimize for 5-125 characters.`,
        impact: 'Better image SEO and accessibility'
      });
    }

    const aiGeneratedCount = analysis.images.filter(img => img.aiGenerated).length;
    if (aiGeneratedCount > 0) {
      recommendations.push({
        type: 'ai_alt_text',
        priority: 'info',
        message: `AI-generated alt text suggestions available for ${aiGeneratedCount} image(s)`,
        impact: 'Optimized, keyword-rich alt text for better SEO'
      });
    }

    const badFilenames = analysis.images.filter(img => !img.filenameOptimized);
    if (badFilenames.length > 0) {
      recommendations.push({
        type: 'filename',
        priority: 'low',
        message: `${badFilenames.length} images have non-SEO-friendly filenames. Use descriptive, hyphenated names.`,
        impact: 'Better image search optimization'
      });
    }

    if (analysis.optimization.formatSuggestions.length > 0) {
      recommendations.push({
        type: 'format',
        priority: 'medium',
        message: `Consider converting ${analysis.optimization.formatSuggestions.length} images to WebP format for better performance`,
        impact: 'Reduced file size and faster page loads'
      });
    }

    if (analysis.optimization.lazyLoad) {
      recommendations.push({
        type: 'lazy_load',
        priority: 'medium',
        message: 'Implement lazy loading for images below the fold',
        impact: 'Improved page load performance and Core Web Vitals'
      });
    }

    if (analysis.optimization.compressCount > 0) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        message: `Compress ${analysis.optimization.compressCount} large images to reduce file size`,
        impact: 'Faster page loads and better performance scores'
      });
    }

    return recommendations;
  }

  async execute(crawlData) {
    return await this.analyze(crawlData);
  }
}
