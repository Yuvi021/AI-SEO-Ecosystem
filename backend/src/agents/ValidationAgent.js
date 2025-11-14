import { openAIService } from '../utils/openaiService.js';

export class ValidationAgent {
  constructor() {
    this.name = 'ValidationAgent';
    this.status = 'ready';
  }

  async validate(results) {
    try {
      this.status = 'validating';
      
      // Basic validation
      const basicValidation = {
        uniqueness: this.validateUniqueness(results),
        seoCompliance: this.validateSEOCompliance(results),
        consistency: this.validateConsistency(results),
        quality: this.validateQuality(results),
        overall: 'pass',
        issues: []
      };

      // AI-powered quality validation if available
      let aiValidation = null;
      if (openAIService.isAvailable()) {
        try {
          aiValidation = await this.performAIValidation(results);
        } catch (error) {
          console.warn('AI validation failed, using basic validation:', error.message);
        }
      }

      // Merge validations
      const validation = {
        ...basicValidation,
        aiQuality: aiValidation?.quality || null,
        aiRecommendations: aiValidation?.recommendations || [],
        overall: this.determineOverallStatus(basicValidation, aiValidation),
        issues: [
          ...basicValidation.uniqueness.issues,
          ...basicValidation.seoCompliance.critical,
          ...basicValidation.seoCompliance.warnings,
          ...basicValidation.consistency.issues,
          ...basicValidation.quality.issues,
          ...(aiValidation?.criticalIssues || [])
        ]
      };

      this.status = 'ready';
      return validation;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  async performAIValidation(results) {
    const crawlData = results.crawl || {};
    const keywordAnalysis = results.keyword || {};
    const contentOptimization = results.content || {};
    const metaOptimization = results.meta || {};

    const prompt = `Perform comprehensive SEO quality validation for this webpage analysis:

PAGE DATA:
- URL: ${crawlData.url || 'N/A'}
- Title: ${crawlData.title || 'N/A'}
- Word Count: ${crawlData.content?.wordCount || 0}
- H1 Count: ${crawlData.headings?.h1?.length || 0}

KEYWORD ANALYSIS:
- Primary Keywords: ${JSON.stringify(keywordAnalysis.primaryKeywords || [])}
- Missing Keywords: ${JSON.stringify(keywordAnalysis.missingKeywords || [])}

CONTENT OPTIMIZATION:
- Readability Score: ${contentOptimization.readability?.score || 'N/A'}
- Structure Issues: ${JSON.stringify(contentOptimization.structure?.issues || [])}
- Keyword Placement Score: ${contentOptimization.keywordPlacement?.score || 0}

META OPTIMIZATION:
- Title Length: ${metaOptimization.title?.length || 0}
- Description Length: ${metaOptimization.metaDescription?.length || 0}
- Title Status: ${metaOptimization.title?.status || 'N/A'}
- Description Status: ${metaOptimization.metaDescription?.status || 'N/A'}

Perform comprehensive validation and provide:

1. Overall Quality Score (0-100)
2. Critical Issues (must fix)
3. High Priority Issues (should fix)
4. Quality Assessment
5. Specific Recommendations

Format as JSON:
{
  "quality": {
    "score": 85,
    "grade": "B",
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"]
  },
  "criticalIssues": ["critical issue 1"],
  "recommendations": [
    {"priority": "high/medium/low", "issue": "issue description", "fix": "how to fix"}
  ]
}`;

    const aiResponse = await openAIService.generateJSON(
      prompt,
      {
        quality: { score: 0, grade: '', strengths: [], weaknesses: [] },
        criticalIssues: [],
        recommendations: []
      },
      {
        temperature: 0.3,
        maxTokens: 2000,
        systemPrompt: 'You are an expert SEO quality auditor. Provide thorough, actionable validation with specific recommendations.'
      }
    );

    return aiResponse;
  }

  determineOverallStatus(basicValidation, aiValidation) {
    const hasCritical = basicValidation.seoCompliance.critical.length > 0 || 
                       (aiValidation?.criticalIssues && aiValidation.criticalIssues.length > 0);
    const hasErrors = basicValidation.uniqueness.issues.length > 0 || 
                     basicValidation.consistency.issues.length > 0;
    
    if (hasCritical) {
      return 'fail';
    } else if (hasErrors || basicValidation.seoCompliance.warnings.length > 3) {
      return 'warning';
    } else if (aiValidation?.quality && aiValidation.quality.score < 70) {
      return 'warning';
    }
    return 'pass';
  }

  validateUniqueness(results) {
    const issues = [];
    const checks = {
      metaTitle: true,
      metaDescription: true,
      content: true
    };

    if (results.meta?.title?.optimized) {
      if (!results.meta.title.optimized || results.meta.title.optimized.trim().length === 0) {
        checks.metaTitle = false;
        issues.push('Meta title is empty or not unique');
      }
    }

    if (results.meta?.metaDescription?.optimized) {
      if (!results.meta.metaDescription.optimized || results.meta.metaDescription.optimized.trim().length === 0) {
        checks.metaDescription = false;
        issues.push('Meta description is empty or not unique');
      }
    }

    if (results.crawl?.content?.wordCount < 100) {
      checks.content = false;
      issues.push('Content is too short and may be considered thin content');
    }

    return {
      passed: Object.values(checks).every(v => v),
      checks,
      issues
    };
  }

  validateSEOCompliance(results) {
    const critical = [];
    const warnings = [];

    if (!results.crawl?.title || results.crawl.title.trim().length === 0) {
      critical.push('Missing page title - critical SEO element');
    }

    if (!results.crawl?.headings?.h1 || results.crawl.headings.h1.length === 0) {
      critical.push('Missing H1 tag - critical for SEO structure');
    }

    if (results.crawl?.headings?.h1?.length > 1) {
      critical.push('Multiple H1 tags found - should have only one');
    }

    if (!results.crawl?.html?.lang) {
      warnings.push('Missing HTML lang attribute');
    }

    if (!results.crawl?.meta?.viewport) {
      critical.push('Missing viewport meta tag - required for mobile SEO');
    }

    if (results.crawl?.content?.wordCount < 300) {
      warnings.push('Content is below recommended 300 words');
    }

    if (!results.crawl?.meta?.description || results.crawl.meta.description.trim().length === 0) {
      warnings.push('Missing meta description');
    }

    if (results.crawl?.images?.filter(img => !img.alt).length > 0) {
      warnings.push('Some images are missing alt text');
    }

    if (results.crawl?.links?.internal?.length < 3) {
      warnings.push('Low number of internal links - add more for better site structure');
    }

    return {
      critical,
      warnings,
      passed: critical.length === 0
    };
  }

  validateConsistency(results) {
    const issues = [];
    const checks = {
      keywordConsistency: true,
      titleConsistency: true,
      descriptionConsistency: true
    };

    const primaryKeyword = results.keyword?.primaryKeywords?.[0]?.word;
    if (primaryKeyword) {
      const keyword = primaryKeyword.toLowerCase();
      const title = (results.crawl?.title || '').toLowerCase();
      const h1 = (results.crawl?.headings?.h1?.[0] || '').toLowerCase();
      
      if (!title.includes(keyword) && !h1.includes(keyword)) {
        checks.keywordConsistency = false;
        issues.push('Primary keyword not consistently used in title and H1');
      }
    }

    if (results.meta?.title?.optimized && results.crawl?.title) {
      if (results.meta.title.optimized !== results.crawl.title) {
        checks.titleConsistency = false;
        // This is expected for optimization, not an issue
      }
    }

    return {
      passed: Object.values(checks).every(v => v),
      checks,
      issues: issues.filter(i => i)
    };
  }

  validateQuality(results) {
    const issues = [];
    const quality = {
      score: 100,
      factors: {}
    };

    if (results.meta?.title?.optimized) {
      const titleLen = results.meta.title.optimized.length;
      if (titleLen < 30 || titleLen > 60) {
        quality.score -= 10;
        quality.factors.title = 'Length not optimal (30-60 chars)';
        issues.push('Title length not optimal');
      }
    }

    if (results.meta?.metaDescription?.optimized) {
      const descLen = results.meta.metaDescription.optimized.length;
      if (descLen < 120 || descLen > 160) {
        quality.score -= 10;
        quality.factors.description = 'Length not optimal (120-160 chars)';
        issues.push('Meta description length not optimal');
      }
    }

    if (results.content?.readability?.score < 30) {
      quality.score -= 15;
      quality.factors.readability = 'Poor readability score';
      issues.push('Content readability needs improvement');
    }

    const imageAltCoverage = results.image?.images?.filter(img => img.hasAlt).length / 
                            (results.image?.images?.length || 1) * 100;
    if (imageAltCoverage < 80 && (results.image?.images?.length || 0) > 0) {
      quality.score -= 10;
      quality.factors.images = 'Low alt text coverage';
      issues.push('Many images missing alt text');
    }

    if (results.content?.keywordPlacement?.score < 2) {
      quality.score -= 10;
      quality.factors.keywords = 'Poor keyword placement';
      issues.push('Primary keyword not well-placed in content');
    }

    quality.score = Math.max(0, quality.score);

    return {
      score: quality.score,
      grade: quality.score >= 90 ? 'A' : quality.score >= 75 ? 'B' : quality.score >= 60 ? 'C' : 'D',
      factors: quality.factors,
      issues
    };
  }

  async execute(results) {
    return await this.validate(results);
  }
}
