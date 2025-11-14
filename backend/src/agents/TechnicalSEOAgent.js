import { openAIService } from '../utils/openaiService.js';

export class TechnicalSEOAgent {
  constructor() {
    this.name = 'TechnicalSEOAgent';
    this.status = 'ready';
  }

  async analyze(crawlData) {
    try {
      this.status = 'analyzing';
      
      // Basic analysis
      const basicAnalysis = {
        performance: this.analyzePerformance(crawlData),
        mobile: this.analyzeMobile(crawlData),
        accessibility: this.analyzeAccessibility(crawlData),
        security: this.analyzeSecurity(crawlData),
        coreWebVitals: this.estimateCoreWebVitals(crawlData),
        recommendations: []
      };

      // AI-powered technical recommendations if available
      let aiRecommendations = [];
      if (openAIService.isAvailable()) {
        try {
          aiRecommendations = await this.performAITechnicalAnalysis(crawlData, basicAnalysis);
        } catch (error) {
          console.warn('AI technical analysis failed, using basic analysis:', error.message);
        }
      }

      const analysis = {
        ...basicAnalysis,
        aiRecommendations: aiRecommendations,
        recommendations: this.generateRecommendations(basicAnalysis, aiRecommendations)
      };

      this.status = 'ready';
      return analysis;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Technical SEO analysis failed: ${error.message}`);
    }
  }

  async performAITechnicalAnalysis(crawlData, basicAnalysis) {
    const prompt = `Analyze this webpage for technical SEO issues and provide specific recommendations:

URL: ${crawlData.url}
TITLE: ${crawlData.title}
PERFORMANCE ISSUES: ${JSON.stringify(basicAnalysis.performance.issues)}
MOBILE ISSUES: ${JSON.stringify(basicAnalysis.mobile.issues)}
ACCESSIBILITY ISSUES: ${JSON.stringify(basicAnalysis.accessibility.issues)}
SECURITY ISSUES: ${JSON.stringify(basicAnalysis.security.issues)}
IMAGE COUNT: ${crawlData.images.length}
WORD COUNT: ${crawlData.content.wordCount}

Provide advanced technical SEO recommendations including:
1. Performance optimization strategies
2. Mobile optimization improvements
3. Accessibility enhancements
4. Security best practices
5. Core Web Vitals optimization
6. Advanced technical fixes

Format as JSON array:
[
  {
    "type": "performance/mobile/accessibility/security",
    "priority": "critical/high/medium/low",
    "issue": "specific issue description",
    "fix": "detailed fix instructions",
    "impact": "expected improvement"
  }
]`;

    const aiResponse = await openAIService.generateJSON(
      prompt,
      [],
      {
        temperature: 0.4,
        maxTokens: 2000,
        systemPrompt: 'You are an expert technical SEO analyst. Provide specific, actionable technical recommendations with detailed fix instructions.'
      }
    );

    return Array.isArray(aiResponse) ? aiResponse : [];
  }

  analyzePerformance(crawlData) {
    const performance = {
      hasViewport: !!crawlData.meta.viewport,
      hasCharset: !!crawlData.html.charset,
      hasLang: !!crawlData.html.lang,
      imageCount: crawlData.images.length,
      totalImages: crawlData.images.length,
      largeImages: crawlData.images.filter(img => {
        const src = img.src.toLowerCase();
        return src.includes('large') || src.includes('big') || src.includes('full') || src.includes('original');
      }).length,
      issues: []
    };

    if (!performance.hasViewport) {
      performance.issues.push('Missing viewport meta tag');
    }
    if (!performance.hasLang) {
      performance.issues.push('Missing HTML lang attribute');
    }
    if (performance.largeImages > 5) {
      performance.issues.push('Multiple large images detected - may impact performance');
    }

    return performance;
  }

  analyzeMobile(crawlData) {
    const mobile = {
      hasViewport: !!crawlData.meta.viewport,
      viewportContent: crawlData.meta.viewport || '',
      isResponsive: crawlData.meta.viewport?.includes('width=device-width'),
      hasTouchIcon: false,
      issues: []
    };

    if (!mobile.hasViewport) {
      mobile.issues.push('Missing viewport meta tag for mobile optimization');
    } else if (!mobile.isResponsive) {
      mobile.issues.push('Viewport tag does not include width=device-width');
    }

    return mobile;
  }

  analyzeAccessibility(crawlData) {
    const accessibility = {
      imagesWithAlt: crawlData.images.filter(img => img.alt && img.alt.trim().length > 0).length,
      imagesWithoutAlt: crawlData.images.filter(img => !img.alt || img.alt.trim().length === 0).length,
      totalImages: crawlData.images.length,
      altCoverage: 0,
      issues: []
    };

    accessibility.altCoverage = accessibility.totalImages > 0
      ? ((accessibility.imagesWithAlt / accessibility.totalImages) * 100).toFixed(1)
      : 100;

    if (accessibility.imagesWithoutAlt > 0) {
      accessibility.issues.push(`${accessibility.imagesWithoutAlt} images missing alt text`);
    }

    return accessibility;
  }

  analyzeSecurity(crawlData) {
    const url = new URL(crawlData.url);
    return {
      isHTTPS: url.protocol === 'https:',
      hasSecurityHeaders: false,
      issues: url.protocol !== 'https:' ? ['Site is not using HTTPS'] : []
    };
  }

  estimateCoreWebVitals(crawlData) {
    const imageCount = crawlData.images.length;
    const wordCount = crawlData.content.wordCount;
    
    return {
      lcp: {
        estimated: imageCount > 10 ? 'poor' : imageCount > 5 ? 'needs-improvement' : 'good',
        message: imageCount > 10 ? 'High image count may affect LCP' : 'Image count looks good'
      },
      fid: {
        estimated: 'good',
        message: 'No JavaScript analysis performed'
      },
      cls: {
        estimated: 'good',
        message: 'No layout shift analysis performed'
      }
    };
  }

  generateRecommendations(basicAnalysis, aiRecommendations) {
    const recommendations = [];

    // Add AI recommendations first
    if (aiRecommendations && aiRecommendations.length > 0) {
      aiRecommendations.forEach(rec => {
        recommendations.push({
          type: rec.type || 'technical',
          priority: rec.priority || 'medium',
          message: rec.issue || rec.message || '',
          fix: rec.fix || '',
          impact: rec.impact || 'Improved technical SEO',
          aiGenerated: true
        });
      });
    }

    // Basic recommendations
    if (!basicAnalysis.mobile.hasViewport) {
      recommendations.push({
        type: 'mobile',
        priority: 'critical',
        message: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
        impact: 'Essential for mobile SEO and user experience'
      });
    }

    if (!basicAnalysis.security.isHTTPS) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        message: 'Migrate to HTTPS for better security and SEO',
        impact: 'Required for modern SEO and user trust'
      });
    }

    if (basicAnalysis.accessibility.imagesWithoutAlt > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        message: `Add alt text to ${basicAnalysis.accessibility.imagesWithoutAlt} images`,
        impact: 'Better accessibility and image SEO'
      });
    }

    if (!basicAnalysis.performance.hasLang) {
      recommendations.push({
        type: 'technical',
        priority: 'medium',
        message: 'Add lang attribute to HTML tag',
        impact: 'Better language targeting and accessibility'
      });
    }

    if (basicAnalysis.performance.largeImages > 5) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Optimize and compress images to improve page speed',
        impact: 'Better Core Web Vitals and user experience'
      });
    }

    return recommendations;
  }

  async execute(crawlData) {
    return await this.analyze(crawlData);
  }
}
