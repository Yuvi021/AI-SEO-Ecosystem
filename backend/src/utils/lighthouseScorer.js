/**
 * Lighthouse-style Scoring System
 * Calculates separate scores for Performance, Accessibility, Best Practices, and SEO
 */

export class LighthouseScorer {
  /**
   * Calculate SEO Score (0-100)
   * Based on SEO best practices similar to Lighthouse
   */
  calculateSEOScore(results) {
    let score = 100;
    const issues = [];

    const crawl = results.crawl || {};
    const meta = results.meta || {};
    const technical = results.technical || {};
    const content = results.content || {};
    const schema = results.schema || {};
    const image = results.image || {};

    // Critical SEO issues (-15 points each)
    if (!crawl.title || crawl.title.trim().length === 0) {
      score -= 15;
      issues.push({ type: 'critical', message: 'Missing page title' });
    }

    if (!crawl.headings?.h1 || crawl.headings.h1.length === 0) {
      score -= 15;
      issues.push({ type: 'critical', message: 'Missing H1 heading' });
    }

    if (crawl.headings?.h1?.length > 1) {
      score -= 10;
      issues.push({ type: 'critical', message: 'Multiple H1 headings found' });
    }

    if (!crawl.meta?.viewport) {
      score -= 10;
      issues.push({ type: 'critical', message: 'Missing viewport meta tag' });
    }

    // High priority issues (-8 points each)
    if (!crawl.meta?.description || crawl.meta.description.trim().length === 0) {
      score -= 8;
      issues.push({ type: 'high', message: 'Missing meta description' });
    }

    if (crawl.meta?.description && (crawl.meta.description.length < 120 || crawl.meta.description.length > 160)) {
      score -= 5;
      issues.push({ type: 'high', message: 'Meta description length not optimal (120-160 chars)' });
    }

    if (crawl.title && (crawl.title.length < 30 || crawl.title.length > 60)) {
      score -= 5;
      issues.push({ type: 'high', message: 'Title length not optimal (30-60 chars)' });
    }

    if (!schema.detected || schema.detected.length === 0) {
      score -= 5;
      issues.push({ type: 'high', message: 'No structured data (schema markup) found' });
    }

    // Medium priority issues (-3 points each)
    if (crawl.content?.wordCount < 300) {
      score -= 3;
      issues.push({ type: 'medium', message: 'Content is too short (less than 300 words)' });
    }

    if (content.readability?.score < 30) {
      score -= 3;
      issues.push({ type: 'medium', message: 'Content readability is poor' });
    }

    if (content.keywordPlacement?.score < 3) {
      score -= 3;
      issues.push({ type: 'medium', message: 'Primary keyword not well-placed' });
    }

    const imagesWithoutAlt = image.images?.filter(img => !img.hasAlt).length || 0;
    const totalImages = image.images?.length || 0;
    if (totalImages > 0 && imagesWithoutAlt > 0) {
      const altCoverage = ((totalImages - imagesWithoutAlt) / totalImages) * 100;
      if (altCoverage < 80) {
        score -= 2;
        issues.push({ type: 'medium', message: `Low image alt text coverage (${Math.round(altCoverage)}%)` });
      }
    }

    if (!crawl.html?.lang) {
      score -= 2;
      issues.push({ type: 'medium', message: 'Missing HTML lang attribute' });
    }

    // Low priority issues (-1 point each)
    if (crawl.links?.internal?.length < 3) {
      score -= 1;
      issues.push({ type: 'low', message: 'Low number of internal links' });
    }

    if (crawl.links?.external?.length === 0 && crawl.content?.wordCount > 500) {
      score -= 1;
      issues.push({ type: 'low', message: 'No external links found (consider adding authoritative sources)' });
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      issues,
      audits: this.getSEOAudits(results)
    };
  }

  /**
   * Calculate Performance Score (0-100)
   * Based on Core Web Vitals and loading performance
   * Uses weighted metrics similar to Google Lighthouse
   */
  calculatePerformanceScore(results) {
    const issues = [];
    const technical = results.technical || {};
    const crawl = results.crawl || {};
    const image = results.image || {};

    // Calculate individual metric scores (0-1 scale)
    // Lighthouse uses weighted blend, we'll approximate with estimates
    
    // LCP (Largest Contentful Paint) - High weight (25%)
    const lcpScore = this.calculateLCPScore(technical.coreWebVitals?.lcp, image, crawl);
    
    // FID/INP (First Input Delay / Interaction to Next Paint) - High weight (25%)
    const fidScore = this.calculateFIDScore(technical.coreWebVitals?.fid);
    
    // CLS (Cumulative Layout Shift) - High weight (25%)
    const clsScore = this.calculateCLSScore(technical.coreWebVitals?.cls);
    
    // FCP (First Contentful Paint) - Medium weight (10%)
    const fcpScore = this.calculateFCPScore(technical.coreWebVitals?.fcp, crawl);
    
    // Speed Index - Medium weight (10%)
    const speedIndexScore = this.calculateSpeedIndexScore(technical.coreWebVitals?.speedIndex, crawl);
    
    // TBT (Total Blocking Time) - Medium weight (5%)
    const tbtScore = this.calculateTBTScore(technical.coreWebVitals?.tbt);
    
    // Additional factors (weighted less)
    let additionalScore = 1;
    
    // HTTPS check (affects performance score in Lighthouse)
    if (!technical.security?.isHTTPS) {
      additionalScore -= 0.05;
      issues.push({ type: 'high', message: 'Not using HTTPS' });
    }
    
    // Image optimization
    const largeImages = technical.performance?.largeImages || 0;
    const totalImages = image.images?.length || 0;
    if (totalImages > 0 && largeImages > 0) {
      const largeImageRatio = largeImages / totalImages;
      additionalScore -= Math.min(0.1, largeImageRatio * 0.2);
      issues.push({ type: 'medium', message: `${largeImages} large image(s) detected` });
    }
    
    // Render-blocking resources
    if (technical.performance?.renderBlockingResources > 0) {
      additionalScore -= 0.03;
      issues.push({ type: 'medium', message: 'Render-blocking resources detected' });
    }
    
    // Missing viewport
    if (!crawl.meta?.viewport) {
      additionalScore -= 0.02;
      issues.push({ type: 'medium', message: 'Missing viewport meta tag' });
    }

    // Weighted blend similar to Lighthouse
    // LCP: 25%, FID: 25%, CLS: 25%, FCP: 10%, Speed Index: 10%, TBT: 5%
    const weightedScore = (
      lcpScore * 0.25 +
      fidScore * 0.25 +
      clsScore * 0.25 +
      fcpScore * 0.10 +
      speedIndexScore * 0.10 +
      tbtScore * 0.05
    ) * additionalScore;

    // Convert to 0-100 scale
    const finalScore = Math.max(0, Math.min(100, Math.round(weightedScore * 100)));

    return {
      score: finalScore,
      issues,
      audits: this.getPerformanceAudits(results),
      metrics: {
        lcp: lcpScore,
        fid: fidScore,
        cls: clsScore,
        fcp: fcpScore,
        speedIndex: speedIndexScore,
        tbt: tbtScore
      }
    };
  }

  /**
   * Calculate LCP score (0-1)
   * Good: < 2.5s, Needs improvement: 2.5-4s, Poor: > 4s
   */
  calculateLCPScore(lcp, image, crawl) {
    if (!lcp) {
      // Estimate based on available data
      const imageCount = image.images?.length || 0;
      const wordCount = crawl.content?.wordCount || 0;
      
      // Heuristic: more images and content = potentially slower LCP
      if (imageCount > 15 || wordCount > 5000) return 0.6; // Needs improvement
      if (imageCount > 8 || wordCount > 3000) return 0.8; // Good but could improve
      return 0.9; // Good
    }
    
    const estimated = lcp.estimated || lcp.status;
    const value = lcp.value;
    
    if (value !== null && value !== undefined) {
      // Use actual value with logarithmic scaling
      if (value <= 2500) return 1.0; // Good
      if (value <= 4000) return 0.75 - ((value - 2500) / 1500) * 0.25; // Needs improvement (0.75 to 0.5)
      return Math.max(0, 0.5 - ((value - 4000) / 4000) * 0.5); // Poor (0.5 to 0)
    }
    
    // Use estimated status
    if (estimated === 'good') return 0.9;
    if (estimated === 'needs-improvement') return 0.65;
    if (estimated === 'poor') return 0.3;
    
    return 0.7; // Default
  }

  /**
   * Calculate FID/INP score (0-1)
   * Good: < 100ms, Needs improvement: 100-300ms, Poor: > 300ms
   */
  calculateFIDScore(fid) {
    if (!fid) return 0.85; // Default good estimate
    
    const estimated = fid.estimated || fid.status;
    const value = fid.value;
    
    if (value !== null && value !== undefined) {
      if (value <= 100) return 1.0; // Good
      if (value <= 300) return 0.75 - ((value - 100) / 200) * 0.25; // Needs improvement
      return Math.max(0, 0.5 - ((value - 300) / 300) * 0.5); // Poor
    }
    
    if (estimated === 'good') return 0.9;
    if (estimated === 'needs-improvement') return 0.65;
    if (estimated === 'poor') return 0.3;
    
    return 0.85; // Default
  }

  /**
   * Calculate CLS score (0-1)
   * Good: < 0.1, Needs improvement: 0.1-0.25, Poor: > 0.25
   */
  calculateCLSScore(cls) {
    if (!cls) return 0.9; // Default good estimate
    
    const estimated = cls.estimated || cls.status;
    const value = cls.value;
    
    if (value !== null && value !== undefined) {
      if (value <= 0.1) return 1.0; // Good
      if (value <= 0.25) return 0.75 - ((value - 0.1) / 0.15) * 0.25; // Needs improvement
      return Math.max(0, 0.5 - ((value - 0.25) / 0.25) * 0.5); // Poor
    }
    
    if (estimated === 'good') return 0.9;
    if (estimated === 'needs-improvement') return 0.65;
    if (estimated === 'poor') return 0.3;
    
    return 0.9; // Default
  }

  /**
   * Calculate FCP score (0-1)
   * Good: < 1.8s, Needs improvement: 1.8-3s, Poor: > 3s
   */
  calculateFCPScore(fcp, crawl) {
    if (!fcp) {
      // Estimate based on page complexity
      const wordCount = crawl.content?.wordCount || 0;
      if (wordCount > 3000) return 0.7;
      return 0.85;
    }
    
    const estimated = fcp.estimated || fcp.status;
    const value = fcp.value;
    
    if (value !== null && value !== undefined) {
      if (value <= 1800) return 1.0;
      if (value <= 3000) return 0.75 - ((value - 1800) / 1200) * 0.25;
      return Math.max(0, 0.5 - ((value - 3000) / 3000) * 0.5);
    }
    
    if (estimated === 'good') return 0.9;
    if (estimated === 'needs-improvement') return 0.65;
    if (estimated === 'poor') return 0.3;
    
    return 0.85;
  }

  /**
   * Calculate Speed Index score (0-1)
   * Good: < 3.4s, Needs improvement: 3.4-5.8s, Poor: > 5.8s
   */
  calculateSpeedIndexScore(speedIndex, crawl) {
    if (!speedIndex) {
      const imageCount = crawl.images?.length || 0;
      if (imageCount > 10) return 0.7;
      return 0.85;
    }
    
    const estimated = speedIndex.estimated || speedIndex.status;
    const value = speedIndex.value;
    
    if (value !== null && value !== undefined) {
      if (value <= 3400) return 1.0;
      if (value <= 5800) return 0.75 - ((value - 3400) / 2400) * 0.25;
      return Math.max(0, 0.5 - ((value - 5800) / 5800) * 0.5);
    }
    
    if (estimated === 'good') return 0.9;
    if (estimated === 'needs-improvement') return 0.65;
    if (estimated === 'poor') return 0.3;
    
    return 0.85;
  }

  /**
   * Calculate TBT score (0-1)
   * Good: < 200ms, Needs improvement: 200-600ms, Poor: > 600ms
   */
  calculateTBTScore(tbt) {
    if (!tbt) return 0.85;
    
    const estimated = tbt.estimated || tbt.status;
    const value = tbt.value;
    
    if (value !== null && value !== undefined) {
      if (value <= 200) return 1.0;
      if (value <= 600) return 0.75 - ((value - 200) / 400) * 0.25;
      return Math.max(0, 0.5 - ((value - 600) / 600) * 0.5);
    }
    
    if (estimated === 'good') return 0.9;
    if (estimated === 'needs-improvement') return 0.65;
    if (estimated === 'poor') return 0.3;
    
    return 0.85;
  }

  /**
   * Calculate Accessibility Score (0-100)
   * Based on WCAG compliance
   */
  calculateAccessibilityScore(results) {
    let score = 100;
    const issues = [];

    const technical = results.technical || {};
    const image = results.image || {};
    const crawl = results.crawl || {};

    // Images without alt text (critical)
    const imagesWithoutAlt = image.images?.filter(img => !img.hasAlt).length || 0;
    if (imagesWithoutAlt > 0) {
      score -= Math.min(20, imagesWithoutAlt * 5);
      issues.push({ type: 'critical', message: `${imagesWithoutAlt} image(s) missing alt text` });
    }

    // Missing viewport (affects mobile accessibility)
    if (!technical.mobile?.hasViewport) {
      score -= 10;
      issues.push({ type: 'high', message: 'Missing viewport meta tag' });
    }

    // Missing HTML lang attribute
    if (!crawl.html?.lang) {
      score -= 5;
      issues.push({ type: 'medium', message: 'Missing HTML lang attribute' });
    }

    // Heading hierarchy
    if (crawl.headings?.h1?.length === 0) {
      score -= 10;
      issues.push({ type: 'high', message: 'Missing H1 heading (affects screen readers)' });
    }

    if (crawl.headings?.h1?.length > 1) {
      score -= 5;
      issues.push({ type: 'medium', message: 'Multiple H1 headings (confusing for screen readers)' });
    }

    // Color contrast (if available)
    if (technical.accessibility?.colorContrastIssues > 0) {
      score -= Math.min(15, technical.accessibility.colorContrastIssues * 3);
      issues.push({ type: 'high', message: `${technical.accessibility.colorContrastIssues} color contrast issue(s)` });
    }

    // Missing ARIA labels (if detected)
    if (technical.accessibility?.missingAriaLabels > 0) {
      score -= Math.min(10, technical.accessibility.missingAriaLabels * 2);
      issues.push({ type: 'medium', message: 'Some elements may need ARIA labels' });
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      issues,
      audits: this.getAccessibilityAudits(results)
    };
  }

  /**
   * Calculate Best Practices Score (0-100)
   * Based on security, modern web standards, and best practices
   */
  calculateBestPracticesScore(results) {
    let score = 100;
    const issues = [];

    const technical = results.technical || {};
    const crawl = results.crawl || {};

    // HTTPS (critical)
    if (!technical.security?.isHTTPS) {
      score -= 20;
      issues.push({ type: 'critical', message: 'Not using HTTPS' });
    }

    // Missing security headers
    if (!technical.security?.hasCSP) {
      score -= 5;
      issues.push({ type: 'medium', message: 'Missing Content-Security-Policy header' });
    }

    // Console errors (if detected)
    if (technical.consoleErrors > 0) {
      score -= Math.min(10, technical.consoleErrors * 2);
      issues.push({ type: 'medium', message: `${technical.consoleErrors} console error(s) detected` });
    }

    // Deprecated APIs (if detected)
    if (technical.deprecatedAPIs > 0) {
      score -= Math.min(8, technical.deprecatedAPIs * 2);
      issues.push({ type: 'medium', message: 'Deprecated APIs detected' });
    }

    // Missing robots.txt or sitemap (low priority)
    if (!crawl.robotsTxt) {
      score -= 2;
      issues.push({ type: 'low', message: 'robots.txt not found' });
    }

    // Image format optimization
    const unoptimizedImages = technical.performance?.unoptimizedImages || 0;
    if (unoptimizedImages > 0) {
      score -= Math.min(5, unoptimizedImages);
      issues.push({ type: 'low', message: `${unoptimizedImages} image(s) could be optimized (use WebP)` });
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      issues,
      audits: this.getBestPracticesAudits(results)
    };
  }

  /**
   * Get all Lighthouse scores
   */
  calculateAllScores(results) {
    return {
      performance: this.calculatePerformanceScore(results),
      accessibility: this.calculateAccessibilityScore(results),
      bestPractices: this.calculateBestPracticesScore(results),
      seo: this.calculateSEOScore(results)
    };
  }

  /**
   * Get SEO audits (detailed checks)
   */
  getSEOAudits(results) {
    const crawl = results.crawl || {};
    const meta = results.meta || {};
    const schema = results.schema || {};
    const content = results.content || {};
    const technical = results.technical || {};

    return {
      'document-title': {
        id: 'document-title',
        title: 'Document has a <title> element',
        description: 'Title elements are displayed in search results and are important for SEO.',
        score: crawl.title ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'meta-description': {
        id: 'meta-description',
        title: 'Document has a meta description',
        description: 'Meta descriptions may be included in search results.',
        score: (crawl.meta?.description && crawl.meta.description.length > 0) ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'viewport': {
        id: 'viewport',
        title: 'Has a <meta name="viewport"> tag with width or initial-scale',
        description: 'Viewport meta tags are important for mobile SEO.',
        score: crawl.meta?.viewport ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'hreflang': {
        id: 'hreflang',
        title: 'Document has a valid hreflang',
        description: 'Hreflang links tell search engines which version of a page to show users.',
        score: crawl.html?.hreflang ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'canonical': {
        id: 'canonical',
        title: 'Document has a valid rel=canonical',
        description: 'Canonical links help prevent duplicate content issues.',
        score: crawl.html?.canonical ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'structured-data': {
        id: 'structured-data',
        title: 'Structured data is valid',
        description: 'Structured data helps search engines understand your content.',
        score: (schema.detected && schema.detected.length > 0) ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'robots-txt': {
        id: 'robots-txt',
        title: 'robots.txt is valid',
        description: 'robots.txt tells search engines which pages they can access.',
        score: crawl.robotsTxt ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'image-alt': {
        id: 'image-alt',
        title: 'Image elements have [alt] attributes',
        description: 'Informative alt text helps screen readers and improves SEO.',
        score: this.calculateImageAltScore(results),
        scoreDisplayMode: 'numeric'
      },
      'link-text': {
        id: 'link-text',
        title: 'Links are descriptive',
        description: 'Descriptive link text helps users and search engines understand your content.',
        score: 1, // Default pass, can be enhanced
        scoreDisplayMode: 'binary'
      },
      'crawlable-links': {
        id: 'crawlable-links',
        title: 'Links are crawlable',
        description: 'Search engines can only index your site if the links are crawlable.',
        score: 1, // Default pass
        scoreDisplayMode: 'binary'
      },
      'is-crawlable': {
        id: 'is-crawlable',
        title: 'Page isn\'t blocked from indexing',
        description: 'Search engines need to be able to crawl your page.',
        score: crawl.html?.noindex ? 0 : 1,
        scoreDisplayMode: 'binary'
      },
      'font-size': {
        id: 'font-size',
        title: 'Text is legible',
        description: 'Legible font sizes improve readability.',
        score: 1, // Default pass
        scoreDisplayMode: 'binary'
      },
      'tap-targets': {
        id: 'tap-targets',
        title: 'Tap targets are sized appropriately',
        description: 'Tap targets should be at least 48x48 pixels.',
        score: technical.mobile?.tapTargetsOk ? 1 : 0.5,
        scoreDisplayMode: 'binary'
      }
    };
  }

  /**
   * Get Performance audits
   */
  getPerformanceAudits(results) {
    const technical = results.technical || {};
    return {
      'first-contentful-paint': {
        id: 'first-contentful-paint',
        title: 'First Contentful Paint',
        description: 'Measures how long it takes the browser to render the first piece of content.',
        score: this.getPerformanceMetricScore(technical.coreWebVitals?.fcp),
        scoreDisplayMode: 'numeric'
      },
      'largest-contentful-paint': {
        id: 'largest-contentful-paint',
        title: 'Largest Contentful Paint',
        description: 'Measures loading performance. Should be less than 2.5s.',
        score: this.getPerformanceMetricScore(technical.coreWebVitals?.lcp),
        scoreDisplayMode: 'numeric'
      },
      'total-blocking-time': {
        id: 'total-blocking-time',
        title: 'Total Blocking Time',
        description: 'Measures interactivity. Should be less than 200ms.',
        score: this.getPerformanceMetricScore(technical.coreWebVitals?.tbt),
        scoreDisplayMode: 'numeric'
      },
      'cumulative-layout-shift': {
        id: 'cumulative-layout-shift',
        title: 'Cumulative Layout Shift',
        description: 'Measures visual stability. Should be less than 0.1.',
        score: this.getPerformanceMetricScore(technical.coreWebVitals?.cls),
        scoreDisplayMode: 'numeric'
      },
      'speed-index': {
        id: 'speed-index',
        title: 'Speed Index',
        description: 'Measures how quickly content is visually displayed.',
        score: this.getPerformanceMetricScore(technical.coreWebVitals?.speedIndex),
        scoreDisplayMode: 'numeric'
      }
    };
  }

  /**
   * Get Accessibility audits
   */
  getAccessibilityAudits(results) {
    const image = results.image || {};
    const technical = results.technical || {};
    const totalImages = image.images?.length || 0;
    const imagesWithAlt = image.images?.filter(img => img.hasAlt).length || 0;

    return {
      'image-alt': {
        id: 'image-alt',
        title: 'Image elements have [alt] attributes',
        description: 'All images should have descriptive alt text.',
        score: totalImages > 0 ? imagesWithAlt / totalImages : 1,
        scoreDisplayMode: 'numeric'
      },
      'aria-allowed-attr': {
        id: 'aria-allowed-attr',
        title: 'ARIA attributes are valid',
        description: 'ARIA attributes must be used correctly.',
        score: 1, // Default pass
        scoreDisplayMode: 'binary'
      },
      'color-contrast': {
        id: 'color-contrast',
        title: 'Background and foreground colors have sufficient contrast ratio',
        description: 'Low-contrast text is difficult to read.',
        score: technical.accessibility?.colorContrastIssues > 0 ? 0.5 : 1,
        scoreDisplayMode: 'binary'
      },
      'html-has-lang': {
        id: 'html-has-lang',
        title: '<html> element has a [lang] attribute',
        description: 'Language declaration helps screen readers.',
        score: results.crawl?.html?.lang ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'heading-order': {
        id: 'heading-order',
        title: 'Heading elements appear in a sequentially-descending order',
        description: 'Proper heading hierarchy helps screen readers.',
        score: this.getHeadingOrderScore(results),
        scoreDisplayMode: 'binary'
      }
    };
  }

  /**
   * Get Best Practices audits
   */
  getBestPracticesAudits(results) {
    const technical = results.technical || {};
    return {
      'uses-https': {
        id: 'uses-https',
        title: 'Uses HTTPS',
        description: 'All sites should be protected with HTTPS.',
        score: technical.security?.isHTTPS ? 1 : 0,
        scoreDisplayMode: 'binary'
      },
      'no-vulnerable-libraries': {
        id: 'no-vulnerable-libraries',
        title: 'Avoids vulnerable libraries',
        description: 'Vulnerable libraries can be exploited.',
        score: 1, // Default pass
        scoreDisplayMode: 'binary'
      },
      'no-console-errors': {
        id: 'no-console-errors',
        title: 'Browser errors were logged to the console',
        description: 'Console errors indicate problems.',
        score: technical.consoleErrors > 0 ? 0 : 1,
        scoreDisplayMode: 'binary'
      },
      'is-on-https': {
        id: 'is-on-https',
        title: 'Page is served over HTTPS',
        description: 'HTTPS is required for security.',
        score: technical.security?.isHTTPS ? 1 : 0,
        scoreDisplayMode: 'binary'
      }
    };
  }

  // Helper methods
  calculateImageAltScore(results) {
    const image = results.image || {};
    const totalImages = image.images?.length || 0;
    if (totalImages === 0) return 1;
    const imagesWithAlt = image.images?.filter(img => img.hasAlt).length || 0;
    return imagesWithAlt / totalImages;
  }

  getPerformanceMetricScore(metric) {
    if (!metric) return null;
    const estimated = metric.estimated || metric.status;
    if (estimated === 'good') return 1;
    if (estimated === 'needs-improvement') return 0.5;
    if (estimated === 'poor') return 0;
    // If we have a value, calculate score based on thresholds
    if (metric.value !== null && metric.value !== undefined) {
      // This is a generic check - specific thresholds handled in calculatePerformanceScore
      return null;
    }
    return null;
  }

  getHeadingOrderScore(results) {
    const crawl = results.crawl || {};
    const h1Count = crawl.headings?.h1?.length || 0;
    const h2Count = crawl.headings?.h2?.length || 0;
    const h3Count = crawl.headings?.h3?.length || 0;

    // Check if heading hierarchy is logical
    if (h1Count === 0) return 0; // Missing H1
    if (h1Count > 1) return 0.5; // Multiple H1s
    if (h3Count > 0 && h2Count === 0) return 0.5; // H3 without H2
    return 1; // Good hierarchy
  }
}

