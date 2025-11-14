import { openAIService } from '../utils/openaiService.js';

export class TechnicalSEOAgent {
  constructor() {
    this.name = 'TechnicalSEOAgent';
    this.status = 'ready';
  }

  async analyze(crawlData) {
    try {
      this.status = 'analyzing';
      
      // Require OpenAI - no fallback
      if (!openAIService.isAvailable()) {
        throw new Error('OpenRouter API key is required for technical SEO analysis. Please set OPENROUTER_API_KEY environment variable.');
      }

      // AI-powered technical analysis only
      const aiAnalysis = await this.performAITechnicalAnalysis(crawlData);

      // Extract structured data from AI analysis
      const analysis = {
        performance: this.extractPerformanceFromAI(aiAnalysis, crawlData),
        mobile: this.extractMobileFromAI(aiAnalysis, crawlData),
        accessibility: this.extractAccessibilityFromAI(aiAnalysis, crawlData),
        security: this.extractSecurityFromAI(aiAnalysis, crawlData),
        coreWebVitals: this.extractCoreWebVitalsFromAI(aiAnalysis, crawlData),
        aiRecommendations: aiAnalysis,
        recommendations: this.generateRecommendationsFromAI(aiAnalysis)
      };

      this.status = 'ready';
      return analysis;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Technical SEO analysis failed: ${error.message}`);
    }
  }

  extractPerformanceFromAI(aiAnalysis, crawlData) {
    const performanceIssues = aiAnalysis.filter(r => r.type === 'performance').map(r => r.issue);
    return {
      hasViewport: !!crawlData.meta.viewport,
      hasCharset: !!crawlData.html.charset,
      hasLang: !!crawlData.html.lang,
      imageCount: crawlData.images.length,
      totalImages: crawlData.images.length,
      issues: performanceIssues,
      score: performanceIssues.length === 0 ? 'good' : performanceIssues.length <= 2 ? 'fair' : 'poor'
    };
  }

  extractMobileFromAI(aiAnalysis, crawlData) {
    const mobileIssues = aiAnalysis.filter(r => r.type === 'mobile').map(r => r.issue);
    return {
      hasViewport: !!crawlData.meta.viewport,
      isResponsive: !!crawlData.meta.viewport,
      issues: mobileIssues,
      score: mobileIssues.length === 0 ? 'good' : mobileIssues.length <= 1 ? 'fair' : 'poor'
    };
  }

  extractAccessibilityFromAI(aiAnalysis, crawlData) {
    const accessibilityIssues = aiAnalysis.filter(r => r.type === 'accessibility').map(r => r.issue);
    const imagesWithoutAlt = crawlData.images.filter(img => !img.alt || img.alt.trim() === '').length;
    return {
      imagesWithoutAlt: imagesWithoutAlt,
      issues: [...accessibilityIssues, ...(imagesWithoutAlt > 0 ? [`${imagesWithoutAlt} images missing alt text`] : [])],
      score: accessibilityIssues.length === 0 && imagesWithoutAlt === 0 ? 'good' : accessibilityIssues.length <= 2 && imagesWithoutAlt <= 2 ? 'fair' : 'poor'
    };
  }

  extractSecurityFromAI(aiAnalysis, crawlData) {
    const securityIssues = aiAnalysis.filter(r => r.type === 'security').map(r => r.issue);
    const isHTTPS = crawlData.url.startsWith('https://');
    return {
      isHTTPS: isHTTPS,
      issues: [...securityIssues, ...(!isHTTPS ? ['Not using HTTPS'] : [])],
      score: securityIssues.length === 0 && isHTTPS ? 'good' : securityIssues.length <= 1 ? 'fair' : 'poor'
    };
  }

  extractCoreWebVitalsFromAI(aiAnalysis, crawlData) {
    const performanceRecs = aiAnalysis.filter(r => r.type === 'performance');
    return {
      lcp: { status: 'unknown', value: null },
      fid: { status: 'unknown', value: null },
      cls: { status: 'unknown', value: null },
      recommendations: performanceRecs.map(r => r.fix)
    };
  }

  generateRecommendationsFromAI(aiAnalysis) {
    return aiAnalysis.map(rec => ({
      type: rec.type,
      priority: rec.priority,
      message: rec.issue,
      fix: rec.fix,
      impact: rec.impact
    }));
  }

  async performAITechnicalAnalysis(crawlData) {
    const prompt = `Perform comprehensive technical SEO analysis for this webpage:

URL: ${crawlData.url}
TITLE: ${crawlData.title}
META VIEWPORT: ${crawlData.meta.viewport || 'missing'}
META CHARSET: ${crawlData.html.charset || 'missing'}
HTML LANG: ${crawlData.html.lang || 'missing'}
HTTPS: ${crawlData.url.startsWith('https://') ? 'yes' : 'no'}
IMAGE COUNT: ${crawlData.images.length}
IMAGES WITHOUT ALT: ${crawlData.images.filter(img => !img.alt || img.alt.trim() === '').length}
WORD COUNT: ${crawlData.content.wordCount}
HEADINGS: H1=${crawlData.headings.h1.length}, H2=${crawlData.headings.h2.length}, H3=${crawlData.headings.h3.length}

Analyze and provide comprehensive technical SEO recommendations for:
1. Performance optimization (viewport, charset, image optimization, loading speed)
2. Mobile optimization (responsive design, viewport settings)
3. Accessibility (alt text, semantic HTML, ARIA labels)
4. Security (HTTPS, security headers)
5. Core Web Vitals optimization (LCP, FID, CLS)
6. Technical SEO best practices

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
