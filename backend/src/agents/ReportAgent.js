import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ReportAgent {
  constructor() {
    this.name = 'ReportAgent';
    this.status = 'ready';
    this.reportsDir = path.join(__dirname, '../../reports');
  }

  async generate(results, url) {
    try {
      this.status = 'generating';
      
      const report = {
        url,
        timestamp: new Date().toISOString(),
        summary: this.generateSummary(results),
        sections: {
          crawl: results.crawl ? this.formatCrawlResults(results.crawl) : null,
          keyword: results.keyword ? this.formatKeywordResults(results.keyword) : null,
          content: results.content ? this.formatContentResults(results.content) : null,
          technical: results.technical ? this.formatTechnicalResults(results.technical) : null,
          meta: results.meta ? this.formatMetaResults(results.meta) : null,
          schema: results.schema ? this.formatSchemaResults(results.schema) : null,
          image: results.image ? this.formatImageResults(results.image) : null,
          validation: results.validation ? this.formatValidationResults(results.validation) : null
        },
        recommendations: this.aggregateRecommendations(results),
        html: null,
        score: this.calculateOverallScore(results)
      };

      // Generate HTML report
      report.html = this.generateHTMLReport(report);
      
      // Save report
      await this.saveReport(report);

      this.status = 'ready';
      return report;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  generateSummary(results) {
    const summary = {
      overallScore: this.calculateOverallScore(results),
      totalRecommendations: 0,
      criticalIssues: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    };

    const allRecommendations = this.aggregateRecommendations(results);
    summary.totalRecommendations = allRecommendations.length;
    
    allRecommendations.forEach(rec => {
      if (rec.priority === 'critical') summary.criticalIssues++;
      else if (rec.priority === 'high') summary.highPriority++;
      else if (rec.priority === 'medium') summary.mediumPriority++;
      else if (rec.priority === 'low') summary.lowPriority++;
    });

    return summary;
  }

  calculateOverallScore(results) {
    let score = 100;
    
    // Deduct points based on validation issues
    if (results.validation?.quality?.score) {
      score = results.validation.quality.score;
    } else {
      // Manual calculation if validation not available
      if (results.validation?.seoCompliance?.critical?.length) {
        score -= results.validation.seoCompliance.critical.length * 15;
      }
      if (results.validation?.seoCompliance?.warnings?.length) {
        score -= results.validation.seoCompliance.warnings.length * 3;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  aggregateRecommendations(results) {
    const recommendations = [];
    
    const sections = [
      results.keyword?.recommendations,
      results.content?.recommendations,
      results.technical?.recommendations,
      results.meta?.recommendations,
      results.schema?.recommendations,
      results.image?.recommendations
    ];

    sections.forEach(section => {
      if (Array.isArray(section)) {
        recommendations.push(...section);
      }
    });

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => 
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    );

    return recommendations;
  }

  formatCrawlResults(crawl) {
    return {
      url: crawl.url,
      title: crawl.title,
      wordCount: crawl.content.wordCount,
      headings: {
        h1: crawl.headings.h1.length,
        h2: crawl.headings.h2.length,
        h3: crawl.headings.h3.length
      },
      links: {
        internal: crawl.links.internal.length,
        external: crawl.links.external.length,
        total: crawl.links.total
      },
      images: crawl.images.length
    };
  }

  formatKeywordResults(keyword) {
    return {
      primaryKeywords: keyword.primaryKeywords?.slice(0, 5) || [],
      missingKeywords: keyword.missingKeywords?.slice(0, 5) || [],
      longTailSuggestions: keyword.longTailSuggestions?.slice(0, 5) || []
    };
  }

  formatContentResults(content) {
    return {
      readability: content.readability,
      structure: content.structure,
      keywordPlacement: {
        score: content.keywordPlacement?.score || 0,
        issues: content.keywordPlacement?.issues || []
      }
    };
  }

  formatTechnicalResults(technical) {
    return {
      mobile: technical.mobile,
      accessibility: technical.accessibility,
      security: technical.security,
      coreWebVitals: technical.coreWebVitals
    };
  }

  formatMetaResults(meta) {
    return {
      title: meta.title,
      metaDescription: meta.metaDescription,
      ogTags: meta.ogTags
    };
  }

  formatSchemaResults(schema) {
    return {
      existing: schema.detected?.length || 0,
      detected: schema.detected || [],
      recommended: schema.generated?.length || 0
    };
  }

  formatImageResults(image) {
    return {
      total: image.images?.length || 0,
      withAlt: image.images?.filter(img => img.hasAlt).length || 0,
      withoutAlt: image.images?.filter(img => !img.hasAlt).length || 0
    };
  }

  formatValidationResults(validation) {
    return {
      overall: validation.overall,
      quality: validation.quality,
      uniqueness: validation.uniqueness?.passed,
      seoCompliance: validation.seoCompliance?.passed
    };
  }

  generateHTMLReport(report) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Report - ${report.url}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .score {
            font-size: 72px;
            font-weight: bold;
            margin: 20px 0;
        }
        .score-label {
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            font-size: 32px;
            color: #667eea;
            margin-bottom: 10px;
        }
        .summary-card p {
            color: #666;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .recommendation {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .recommendation.critical { border-left-color: #dc3545; }
        .recommendation.high { border-left-color: #fd7e14; }
        .recommendation.medium { border-left-color: #ffc107; }
        .recommendation.low { border-left-color: #28a745; }
        .recommendation h4 {
            margin-bottom: 8px;
            color: #333;
        }
        .recommendation .priority {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .priority.critical { background: #dc3545; color: white; }
        .priority.high { background: #fd7e14; color: white; }
        .priority.medium { background: #ffc107; color: #333; }
        .priority.low { background: #28a745; color: white; }
        .meta-optimization {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .meta-optimization h3 {
            margin-bottom: 15px;
            color: #0066cc;
        }
        .meta-item {
            margin-bottom: 15px;
        }
        .meta-item strong {
            display: block;
            margin-bottom: 5px;
            color: #333;
        }
        .current {
            color: #666;
            font-style: italic;
        }
        .optimized {
            color: #28a745;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
            font-weight: bold;
        }
        .url {
            word-break: break-all;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEO Analysis Report</h1>
            <div class="score">${report.score}</div>
            <div class="score-label">Overall SEO Score</div>
            <div class="url" style="margin-top: 20px; font-size: 14px;">${report.url}</div>
            <div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">Generated: ${new Date(report.timestamp).toLocaleString()}</div>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>${report.summary.totalRecommendations}</h3>
                    <p>Total Recommendations</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.criticalIssues}</h3>
                    <p>Critical Issues</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.highPriority}</h3>
                    <p>High Priority</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.mediumPriority + report.summary.lowPriority}</h3>
                    <p>Other Issues</p>
                </div>
            </div>

            ${this.generateRecommendationsHTML(report.recommendations)}
            
            ${this.generateSectionsHTML(report.sections)}
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  generateRecommendationsHTML(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return '<div class="section"><h2>Recommendations</h2><p>No recommendations at this time.</p></div>';
    }

    let html = '<div class="section"><h2>📋 Recommendations & Action Items</h2>';
    html += '<p style="margin-bottom: 20px; color: #666;">Review the issues below and follow the recommended actions to improve your SEO.</p>';
    
    recommendations.forEach(rec => {
      const priorityLabels = {
        critical: '🔴 Critical',
        high: '🟠 High Priority',
        medium: '🟡 Medium Priority',
        low: '🟢 Low Priority',
        info: 'ℹ️ Information'
      };
      
      html += `
        <div class="recommendation ${rec.priority}">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span class="priority ${rec.priority}">${priorityLabels[rec.priority] || rec.priority}</span>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">Issue:</h4>
              <p style="margin: 0; color: #555;">${rec.message}</p>
            </div>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 3px solid #0ea5e9;">
              <h4 style="margin: 0 0 8px 0; color: #0369a1; font-size: 14px;">💡 How to Fix:</h4>
              <p style="margin: 0; color: #0c4a6e;"><strong>Impact:</strong> ${rec.impact}</p>
            </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  generateSectionsHTML(sections) {
    let html = '<div class="section"><h2>📊 Detailed Analysis by Agent</h2>';
    html += '<p style="margin-bottom: 30px; color: #666;">Each agent analyzed different aspects of your website. Review the findings below.</p>';
    
    // Crawl Analysis
    if (sections.crawl) {
      html += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">🕷️ Page Crawl Analysis</h3>
          <p style="color: #666; margin-bottom: 15px;">Analyzed the structure and content of your webpage.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div><strong>Title:</strong> ${sections.crawl.title || 'Not found'}</div>
            <div><strong>Word Count:</strong> ${sections.crawl.wordCount || 0}</div>
            <div><strong>H1 Headings:</strong> ${sections.crawl.headings?.h1 || 0}</div>
            <div><strong>H2 Headings:</strong> ${sections.crawl.headings?.h2 || 0}</div>
            <div><strong>H3 Headings:</strong> ${sections.crawl.headings?.h3 || 0}</div>
            <div><strong>Internal Links:</strong> ${sections.crawl.links?.internal || 0}</div>
            <div><strong>External Links:</strong> ${sections.crawl.links?.external || 0}</div>
            <div><strong>Images:</strong> ${sections.crawl.images || 0}</div>
          </div>
        </div>
      `;
    }
    
    // Meta Tags
    if (sections.meta) {
      html += this.generateMetaHTML(sections.meta);
    }
    
    // Keyword Analysis
    if (sections.keyword) {
      html += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">🔑 Keyword Analysis</h3>
          <p style="color: #666; margin-bottom: 15px;">Analyzed keywords and their usage in your content.</p>
          <div style="margin-bottom: 15px;">
            <strong>Primary Keywords:</strong>
            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
              ${sections.keyword.primaryKeywords?.map(k => 
                `<span style="background: #e0f2fe; padding: 5px 12px; border-radius: 20px; font-size: 14px;">${k.word} (${k.count}x, ${k.density}%)</span>`
              ).join('') || '<span style="color: #999;">No keywords found</span>'}
            </div>
          </div>
          ${sections.keyword.missingKeywords?.length > 0 ? `
            <div style="margin-top: 15px;">
              <strong>Missing Keywords:</strong>
              <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                ${sections.keyword.missingKeywords.map(k => 
                  `<span style="background: #fee2e2; padding: 5px 12px; border-radius: 20px; font-size: 14px;">${k}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Content Quality
    if (sections.content) {
      const readability = sections.content.readability;
      const readabilityScore = readability?.fleschScore || readability?.score || 0;
      const readabilityLabel = readability?.readability || 'N/A';
      const scoreColor = readabilityScore > 60 ? '#10b981' : readabilityScore > 30 ? '#f59e0b' : '#ef4444';
      
      html += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">📝 Content Quality Analysis</h3>
          <p style="color: #666; margin-bottom: 15px;">Analyzed content quality, readability, and structure.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
              <strong>Readability:</strong> 
              <span style="color: ${scoreColor}; font-weight: bold;">${readabilityLabel}</span>
            </div>
            <div><strong>Readability Score:</strong> ${readabilityScore}</div>
            <div><strong>Word Count:</strong> ${readability?.wordCount || 0}</div>
            <div><strong>Sentence Count:</strong> ${readability?.sentenceCount || 0}</div>
            <div><strong>Avg Sentence Length:</strong> ${readability?.avgSentenceLength || 0} words</div>
          </div>
          ${sections.content.keywordPlacement?.issues?.length > 0 ? `
            <div style="margin-top: 15px; padding: 15px; background: #fee2e2; border-radius: 6px;">
              <strong style="color: #991b1b;">⚠️ Keyword Placement Issues:</strong>
              <ul style="margin: 10px 0 0 20px; color: #7f1d1d;">
                ${sections.content.keywordPlacement.issues.map(issue => `<li>${issue}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Technical SEO
    if (sections.technical) {
      html += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">⚙️ Technical SEO Analysis</h3>
          <p style="color: #666; margin-bottom: 15px;">Analyzed technical aspects: mobile-friendliness, accessibility, security, and performance.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div><strong>Mobile:</strong> ${sections.technical.mobile?.isResponsive ? '✅ Mobile-friendly' : '❌ Not mobile-friendly'}</div>
            <div><strong>HTTPS:</strong> ${sections.technical.security?.isHTTPS ? '✅ Using HTTPS' : '❌ Not using HTTPS'}</div>
            <div><strong>Alt Text Coverage:</strong> ${sections.technical.accessibility?.altCoverage || 0}%</div>
            <div><strong>Images Without Alt:</strong> ${sections.technical.accessibility?.imagesWithoutAlt || 0}</div>
          </div>
        </div>
      `;
    }
    
    // Schema Markup
    if (sections.schema) {
      html += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">📋 Schema Markup Analysis</h3>
          <p style="color: #666; margin-bottom: 15px;">Analyzed structured data and schema markup on your page.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div><strong>Existing Schema:</strong> ${sections.schema.existing || 0}</div>
            <div><strong>Recommended Schema:</strong> ${sections.schema.recommended || 0}</div>
          </div>
        </div>
      `;
    }
    
    // Image Analysis
    if (sections.image) {
      html += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">🖼️ Image Optimization Analysis</h3>
          <p style="color: #666; margin-bottom: 15px;">Analyzed images for SEO, accessibility, and performance.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div><strong>Total Images:</strong> ${sections.image.total || 0}</div>
            <div><strong>With Alt Text:</strong> ${sections.image.withAlt || 0}</div>
            <div><strong>Without Alt Text:</strong> ${sections.image.withoutAlt || 0}</div>
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }

  generateMetaHTML(meta) {
    if (!meta.title && !meta.metaDescription) return '';
    
    return `
      <div class="meta-optimization">
        <h3>Meta Tag Optimization</h3>
        ${meta.title ? `
          <div class="meta-item">
            <strong>Title:</strong>
            <div class="current">Current: ${meta.title.current || 'Missing'}</div>
            <div class="optimized">Optimized: ${meta.title.optimized}</div>
            <div style="margin-top: 5px; font-size: 12px; color: #666;">Length: ${meta.title.length} characters (Optimal: 30-60)</div>
          </div>
        ` : ''}
        ${meta.metaDescription ? `
          <div class="meta-item">
            <strong>Meta Description:</strong>
            <div class="current">Current: ${meta.metaDescription.current || 'Missing'}</div>
            <div class="optimized">Optimized: ${meta.metaDescription.optimized}</div>
            <div style="margin-top: 5px; font-size: 12px; color: #666;">Length: ${meta.metaDescription.length} characters (Optimal: 150-160)</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  async saveReport(report) {
    try {
      // Ensure reports directory exists
      await fs.mkdir(this.reportsDir, { recursive: true });
      
      // Generate filename
      const filename = `report_${Date.now()}_${report.url.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.json`;
      const htmlFilename = filename.replace('.json', '.html');
      
      // Save JSON report
      const jsonPath = path.join(this.reportsDir, filename);
      await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
      
      // Save HTML report
      const htmlPath = path.join(this.reportsDir, htmlFilename);
      await fs.writeFile(htmlPath, report.html);
      
      report.files = {
        json: filename,
        html: htmlFilename
      };
      
      console.log(`Report saved: ${filename}`);
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  // Format agent results for user-friendly display
  formatAgentResultForDisplay(agentId, result, crawlData = null) {
    const formatters = {
      crawl: () => this.formatCrawlForDisplay(result),
      keyword: () => this.formatKeywordForDisplay(result),
      content: () => this.formatContentForDisplay(result, crawlData),
      technical: () => this.formatTechnicalForDisplay(result),
      meta: () => this.formatMetaForDisplay(result),
      schema: () => this.formatSchemaForDisplay(result),
      image: () => this.formatImageForDisplay(result),
      validation: () => this.formatValidationForDisplay(result)
    };

    const formatter = formatters[agentId];
    if (formatter) {
      const formatted = formatter();
      // Normalize examples property name for frontend
      if (formatted.crawlExamples) formatted.contentExamples = formatted.crawlExamples;
      if (formatted.keywordExamples) formatted.contentExamples = [...(formatted.contentExamples || []), ...formatted.keywordExamples];
      if (formatted.technicalExamples) formatted.contentExamples = [...(formatted.contentExamples || []), ...formatted.technicalExamples];
      if (formatted.metaExamples) formatted.contentExamples = [...(formatted.contentExamples || []), ...formatted.metaExamples];
      if (formatted.schemaExamples) formatted.contentExamples = [...(formatted.contentExamples || []), ...formatted.schemaExamples];
      if (formatted.imageExamples) formatted.contentExamples = [...(formatted.contentExamples || []), ...formatted.imageExamples];
      if (formatted.validationExamples) formatted.contentExamples = [...(formatted.contentExamples || []), ...formatted.validationExamples];
      return formatted;
    }

    // Default formatting
    return {
      title: agentId.charAt(0).toUpperCase() + agentId.slice(1) + ' Analysis',
      description: 'Analysis completed',
      summary: 'Review the detailed results below',
      details: result
    };
  }

  formatCrawlForDisplay(crawl) {
    const issues = [];
    const recommendations = [];
    const crawlExamples = [];

    if (!crawl.title) {
      issues.push('Missing page title');
      recommendations.push('Add a descriptive title tag to your page');
      crawlExamples.push({
        type: 'title',
        issue: 'Missing page title tag',
        before: '<head>\n  <!-- No title tag found -->\n</head>',
        after: '<head>\n  <title>Your Descriptive Page Title Here</title>\n</head>',
        reason: 'Title tags are crucial for SEO and appear in search results',
        seoImpact: 'Pages without titles rank poorly and have lower click-through rates'
      });
    }

    if (crawl.content?.wordCount < 300) {
      issues.push('Low word count');
      recommendations.push('Consider adding more content (aim for at least 300 words)');
      crawlExamples.push({
        type: 'content',
        issue: 'Insufficient content depth',
        before: `Current: ${crawl.content?.wordCount || 0} words\n\nYour page has very little content, which limits SEO potential.`,
        after: `Target: 300+ words\n\nAdd detailed explanations, examples, FAQs, or additional context to provide value to readers and search engines.`,
        reason: 'More comprehensive content ranks better and provides better user experience',
        seoImpact: 'Pages with 300+ words typically rank higher than thin content pages'
      });
    }

    if (crawl.headings?.h1?.length === 0) {
      issues.push('Missing H1 heading');
      recommendations.push('Add a single H1 heading to structure your content');
      crawlExamples.push({
        type: 'heading',
        issue: 'No H1 heading found',
        before: '<body>\n  <p>Content starts here...</p>\n</body>',
        after: '<body>\n  <h1>Your Main Page Heading</h1>\n  <p>Content starts here...</p>\n</body>',
        reason: 'H1 headings help search engines understand your page topic',
        seoImpact: 'Pages with H1 tags rank better and have clearer content hierarchy'
      });
    }

    if (crawl.headings?.h1?.length > 1) {
      issues.push('Multiple H1 headings found');
      recommendations.push('Use only one H1 heading per page for better SEO');
      const h1List = crawl.headings.h1.slice(0, 3).map(h => `  <h1>${h}</h1>`).join('\n');
      crawlExamples.push({
        type: 'heading',
        issue: 'Multiple H1 headings detected',
        before: `${h1List}\n\nMultiple H1 tags found on the page.`,
        after: '<h1>Your Single Main Heading</h1>\n<h2>Section Heading</h2>\n<h2>Another Section</h2>\n\nOnly one H1, with H2 for sections.',
        reason: 'One H1 per page creates clear hierarchy and better SEO structure',
        seoImpact: 'Single H1 helps search engines identify the main topic more clearly'
      });
    }

    return {
      title: '🕷️ Page Crawl Analysis',
      description: 'Analyzed the structure and content of your webpage',
      summary: {
        title: crawl.title || 'Not found',
        wordCount: crawl.content?.wordCount || 0,
        headings: {
          h1: crawl.headings?.h1?.length || 0,
          h2: crawl.headings?.h2?.length || 0,
          h3: crawl.headings?.h3?.length || 0
        },
        links: {
          internal: crawl.links?.internal?.length || 0,
          external: crawl.links?.external?.length || 0
        },
        images: crawl.images?.length || 0
      },
      issues: issues.length > 0 ? issues : ['No major issues found'],
      recommendations: recommendations.length > 0 ? recommendations : ['Page structure looks good!'],
      crawlExamples: crawlExamples,
      status: issues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  formatKeywordForDisplay(keyword) {
    const issues = [];
    const recommendations = [];
    const keywordExamples = [];

    if (!keyword.primaryKeywords || keyword.primaryKeywords.length === 0) {
      issues.push('No primary keywords identified');
      recommendations.push('Add relevant keywords to your content to improve SEO');
      keywordExamples.push({
        type: 'keyword',
        issue: 'No primary keywords found in content',
        before: 'Your content doesn\'t focus on specific keywords, making it harder for search engines to understand what your page is about.',
        after: 'Identify 1-2 primary keywords related to your content topic. Naturally include them in:\n- Title tag\n- H1 heading\n- First paragraph\n- Throughout content (1-2% density)',
        reason: 'Primary keywords help search engines understand and rank your content',
        seoImpact: 'Content without clear keywords ranks poorly for specific searches'
      });
    }

    if (keyword.missingKeywords && keyword.missingKeywords.length > 0) {
      issues.push(`Missing ${keyword.missingKeywords.length} important keywords`);
      recommendations.push(`Consider adding these keywords: ${keyword.missingKeywords.slice(0, 3).join(', ')}`);
      const missingList = keyword.missingKeywords.slice(0, 3).join(', ');
      keywordExamples.push({
        type: 'keyword',
        issue: 'Important related keywords missing',
        before: `Your content doesn't mention these relevant keywords: ${missingList}`,
        after: `Naturally incorporate these keywords:\n- "${keyword.missingKeywords[0]}" in headings or subheadings\n- "${keyword.missingKeywords[1] || 'related term'}" in body content\n- Use them contextually, not forced`,
        reason: 'Related keywords help you rank for more search queries',
        seoImpact: 'Including related keywords increases your chances of ranking for long-tail searches'
      });
    }

    // Add keyword density examples if available
    if (keyword.primaryKeywords && keyword.primaryKeywords.length > 0) {
      const topKeyword = keyword.primaryKeywords[0];
      if (parseFloat(topKeyword.density) < 0.5) {
        keywordExamples.push({
          type: 'density',
          issue: 'Primary keyword used too infrequently',
          before: `"${topKeyword.word}" appears only ${topKeyword.count} times (${topKeyword.density}% density)`,
          after: `Increase usage to 1-2% density:\n- Add "${topKeyword.word}" in title\n- Include in H1 and H2 headings\n- Use naturally in first paragraph\n- Mention 2-3 more times in body`,
          reason: 'Optimal keyword density helps search engines understand your focus',
          seoImpact: 'Keywords at 1-2% density signal relevance without keyword stuffing'
        });
      }
    }

    return {
      title: '🔑 Keyword Analysis',
      description: 'Analyzed keywords and their usage in your content',
      summary: {
        primaryKeywords: keyword.primaryKeywords?.slice(0, 5).map(k => ({
          keyword: k.word,
          count: k.count,
          density: k.density + '%'
        })) || [],
        missingKeywords: keyword.missingKeywords?.slice(0, 5) || [],
        suggestions: keyword.longTailSuggestions?.slice(0, 5) || []
      },
      issues: issues.length > 0 ? issues : ['Keywords are well distributed'],
      recommendations: recommendations.length > 0 ? recommendations : ['Your keyword strategy looks good!'],
      keywordExamples: keywordExamples,
      status: issues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  formatContentForDisplay(content, crawlData = null) {
    const issues = [];
    const recommendations = [];
    const contentExamples = []; // Store specific examples with before/after
    const readability = content.readability;

    // Get raw content text from crawlData if available
    const rawContentText = crawlData?.content?.text || content.rawContent || content.contentText || '';

    if (readability) {
      const score = readability.fleschScore || readability.score;
      if (score < 30) {
        issues.push('Content is difficult to read');
        recommendations.push('Simplify sentences, use shorter words, and break up long paragraphs');
        
        // Add specific examples from actual content
        if (rawContentText) {
          const longSentences = this.findLongSentences(rawContentText);
          if (longSentences.length > 0) {
            longSentences.slice(0, 3).forEach(sentence => {
              const improved = this.improveSentence(sentence);
              contentExamples.push({
                type: 'sentence',
                issue: 'Long and complex sentence',
                before: sentence.substring(0, 200) + (sentence.length > 200 ? '...' : ''),
                after: improved,
                reason: 'Shorter sentences improve readability and user engagement',
                seoImpact: 'Better readability = lower bounce rate = higher SEO rankings'
              });
            });
          }
        }
      } else if (score < 60) {
        issues.push('Content readability could be improved');
        recommendations.push('Use simpler language and shorter sentences to improve readability');
      }

      if (readability.avgSentenceLength > 20) {
        issues.push('Sentences are too long');
        recommendations.push('Break long sentences into shorter ones (aim for 15-20 words per sentence)');
      }
    }

    if (content.keywordPlacement?.issues && content.keywordPlacement.issues.length > 0) {
      issues.push(...content.keywordPlacement.issues);
      recommendations.push('Place your primary keyword in the title, first paragraph, and headings');
      
      // Add keyword placement examples
      const title = crawlData?.title || content.title || '';
      const primaryKeyword = content.primaryKeyword || '';
      
      if (title && primaryKeyword && !title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
        const improvedTitle = this.addKeywordToTitle(title, primaryKeyword);
        contentExamples.push({
          type: 'title',
          issue: 'Primary keyword missing in title',
          before: title,
          after: improvedTitle,
          reason: 'Including primary keyword in title improves SEO rankings',
          seoImpact: 'Keywords in title tag are weighted heavily by search engines'
        });
      }
    }

    if (content.structure?.issues && content.structure.issues.length > 0) {
      issues.push(...content.structure.issues);
      recommendations.push('Improve heading hierarchy and content structure');
    }

    // Add AI suggestions if available
    if (content.aiSuggestions) {
      if (content.aiSuggestions.intro) {
        contentExamples.push({
          type: 'intro',
          issue: 'Introduction could be more engaging',
          before: 'Your current introduction may be too generic or not compelling enough',
          after: content.aiSuggestions.intro,
          reason: 'A compelling introduction increases user engagement and time on page',
          seoImpact: 'Higher engagement signals to Google that your content is valuable'
        });
      }
      
      if (content.aiSuggestions.headings && content.aiSuggestions.headings.length > 0) {
        content.aiSuggestions.headings.slice(0, 2).forEach((heading, idx) => {
          contentExamples.push({
            type: 'heading',
            issue: `Suggested H2 heading ${idx + 1}`,
            before: 'Consider adding this heading to improve structure',
            after: heading,
            reason: 'Better heading structure improves content organization and SEO',
            seoImpact: 'Proper heading hierarchy helps search engines understand your content'
          });
        });
      }
    }

    return {
      title: '📝 Content Optimization',
      description: 'Analyzed content quality, readability, and structure',
      summary: {
        readability: readability?.readability || 'N/A',
        score: readability?.fleschScore || readability?.score || 'N/A',
        wordCount: readability?.wordCount || 0,
        sentenceCount: readability?.sentenceCount || 0,
        avgSentenceLength: readability?.avgSentenceLength || 0
      },
      issues: issues.length > 0 ? issues : ['Content structure looks good'],
      recommendations: recommendations.length > 0 ? recommendations : ['Your content is well optimized!'],
      contentExamples: contentExamples, // Add specific examples
      status: issues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  // Helper function to find long sentences
  findLongSentences(text, maxWords = 25) {
    if (!text) return [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences
      .filter(s => s.split(/\s+/).length > maxWords)
      .map(s => s.trim())
      .slice(0, 5);
  }

  // Helper function to improve a sentence
  improveSentence(sentence) {
    // Simple improvement: try to break into shorter sentences
    const words = sentence.split(/\s+/);
    if (words.length <= 20) return sentence;
    
    // Find a good breaking point (around comma, conjunction, etc.)
    const midPoint = Math.floor(words.length / 2);
    let breakPoint = midPoint;
    
    // Look for natural break points
    const breakWords = ['and', 'but', 'or', 'so', 'because', 'although', 'however'];
    for (let i = midPoint - 5; i < midPoint + 5 && i < words.length; i++) {
      if (breakWords.includes(words[i].toLowerCase().replace(/[.,;:!?]/g, ''))) {
        breakPoint = i + 1;
        break;
      }
    }
    
    const firstPart = words.slice(0, breakPoint).join(' ');
    const secondPart = words.slice(breakPoint).join(' ');
    
    // Capitalize second part
    const secondPartCapitalized = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
    
    return `${firstPart}. ${secondPartCapitalized}`;
  }

  // Helper function to add keyword to title
  addKeywordToTitle(title, keyword) {
    if (!keyword) return title;
    const titleLower = title.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    if (titleLower.includes(keywordLower)) return title;
    
    // Try to add keyword naturally
    if (title.length < 40) {
      return `${keyword} - ${title}`;
    } else {
      // Replace a word or add at beginning
      const words = title.split(' ');
      if (words.length > 3) {
        words[0] = keyword;
        return words.join(' ');
      }
      return `${keyword} | ${title}`;
    }
  }

  formatTechnicalForDisplay(technical) {
    const issues = [];
    const recommendations = [];
    const technicalExamples = [];

    // Mobile
    if (!technical.mobile?.hasViewport) {
      issues.push('Missing viewport meta tag');
      recommendations.push('Add: <meta name="viewport" content="width=device-width, initial-scale=1">');
      technicalExamples.push({
        type: 'viewport',
        issue: 'Missing viewport meta tag',
        before: '<head>\n  <title>Your Page</title>\n  <!-- Missing viewport tag -->\n</head>',
        after: '<head>\n  <title>Your Page</title>\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n</head>',
        reason: 'Viewport tag ensures your site displays correctly on mobile devices',
        seoImpact: 'Mobile-friendly sites rank higher in mobile search results (mobile-first indexing)'
      });
    }

    // Accessibility
    if (technical.accessibility?.imagesWithoutAlt > 0) {
      issues.push(`${technical.accessibility.imagesWithoutAlt} images missing alt text`);
      recommendations.push('Add descriptive alt text to all images for accessibility and SEO');
      technicalExamples.push({
        type: 'alt',
        issue: 'Images missing alt text',
        before: '<img src="product.jpg">\n<!-- No alt attribute -->',
        after: '<img src="product.jpg" alt="Blue cotton t-shirt with logo">\n<!-- Descriptive alt text -->',
        reason: 'Alt text helps screen readers and improves image SEO',
        seoImpact: 'Images with alt text can appear in Google Image Search results'
      });
    }

    // Security
    if (!technical.security?.isHTTPS) {
      issues.push('Not using HTTPS');
      recommendations.push('Switch to HTTPS to improve security and SEO rankings');
      technicalExamples.push({
        type: 'https',
        issue: 'Site not using HTTPS',
        before: 'http://yoursite.com\n❌ Not secure\n❌ Browser shows "Not Secure" warning',
        after: 'https://yoursite.com\n✅ Secure\n✅ SSL certificate installed\n✅ Trusted by browsers',
        reason: 'HTTPS encrypts data and is required for modern web standards',
        seoImpact: 'Google gives ranking boost to HTTPS sites and may penalize HTTP sites'
      });
    }

    // Core Web Vitals
    if (technical.coreWebVitals?.lcp?.estimated === 'poor') {
      issues.push('Large Contentful Paint (LCP) may be slow');
      recommendations.push('Optimize images, reduce server response time, and minimize render-blocking resources');
      technicalExamples.push({
        type: 'performance',
        issue: 'Page load speed may be slow',
        before: 'Large unoptimized images\nNo image compression\nNo lazy loading\nSlow server response',
        after: 'Optimize images (WebP format)\nCompress images (reduce file size)\nImplement lazy loading\nUse CDN for faster delivery',
        reason: 'Fast loading pages provide better user experience',
        seoImpact: 'Page speed is a ranking factor - faster pages rank higher'
      });
    }

    return {
      title: '⚙️ Technical SEO',
      description: 'Analyzed technical aspects: mobile-friendliness, accessibility, security, and performance',
      summary: {
        mobile: technical.mobile?.isResponsive ? '✅ Mobile-friendly' : '❌ Not mobile-friendly',
        accessibility: technical.accessibility?.altCoverage 
          ? `✅ ${technical.accessibility.altCoverage}% images have alt text`
          : '❌ Missing alt text on images',
        security: technical.security?.isHTTPS ? '✅ Using HTTPS' : '❌ Not using HTTPS',
        performance: technical.coreWebVitals?.lcp?.estimated || 'N/A'
      },
      issues: issues.length > 0 ? issues : ['Technical SEO looks good'],
      recommendations: recommendations.length > 0 ? recommendations : ['Your technical setup is optimized!'],
      technicalExamples: technicalExamples,
      status: issues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  formatMetaForDisplay(meta) {
    const issues = [];
    const recommendations = [];
    const metaExamples = [];

    // Title
    if (meta.title) {
      if (meta.title.length < 30) {
        issues.push('Title tag is too short');
        recommendations.push('Expand your title to 30-60 characters for better SEO');
        metaExamples.push({
          type: 'title',
          issue: 'Title tag too short',
          before: `<title>${meta.title.current || 'Short Title'}</title>\n(${meta.title.length} characters - too short)`,
          after: `<title>${meta.title.optimized || 'Your Descriptive Title Here - More Details'}</title>\n(50-55 characters - optimal length)`,
          reason: 'Longer titles provide more context and include more keywords',
          seoImpact: 'Titles 30-60 characters display fully in search results and improve CTR'
        });
      } else if (meta.title.length > 60) {
        issues.push('Title tag is too long');
        recommendations.push('Shorten your title to 30-60 characters to avoid truncation in search results');
        metaExamples.push({
          type: 'title',
          issue: 'Title tag too long (will be truncated)',
          before: `<title>${meta.title.current || 'Very Long Title That Gets Cut Off In Search Results'}</title>\n(${meta.title.length} characters - will be truncated)`,
          after: `<title>${meta.title.optimized || 'Shorter, Focused Title'}</title>\n(50-55 characters - displays fully)`,
          reason: 'Titles over 60 characters get cut off in search results with "..."',
          seoImpact: 'Truncated titles reduce click-through rates and may hide important keywords'
        });
      }
      if (!meta.title.includesKeyword) {
        issues.push('Primary keyword not in title');
        recommendations.push('Include your primary keyword in the title tag');
        metaExamples.push({
          type: 'title',
          issue: 'Primary keyword missing in title',
          before: `<title>${meta.title.current || 'Generic Page Title'}</title>\n<!-- Keyword not included -->`,
          after: `<title>${meta.title.optimized || 'Primary Keyword - Descriptive Title'}</title>\n<!-- Keyword included naturally -->`,
          reason: 'Keywords in title tags are heavily weighted by search engines',
          seoImpact: 'Titles with primary keywords rank higher for those search terms'
        });
      }
    }

    // Meta Description
    if (meta.metaDescription) {
      if (meta.metaDescription.length < 120) {
        issues.push('Meta description is too short');
        recommendations.push('Expand your meta description to 120-160 characters');
        metaExamples.push({
          type: 'description',
          issue: 'Meta description too short',
          before: `<meta name="description" content="${meta.metaDescription.current || 'Short desc'}" />\n(${meta.metaDescription.length} characters)`,
          after: `<meta name="description" content="${meta.metaDescription.optimized || 'Detailed description that explains what users will find on this page and encourages clicks'}" />\n(150 characters - optimal)`,
          reason: 'Longer descriptions provide more information and improve click-through rates',
          seoImpact: 'Descriptions 120-160 characters display fully and can improve CTR by 5-15%'
        });
      } else if (meta.metaDescription.length > 160) {
        issues.push('Meta description is too long');
        recommendations.push('Shorten your meta description to 120-160 characters');
        metaExamples.push({
          type: 'description',
          issue: 'Meta description too long (will be truncated)',
          before: `<meta name="description" content="${meta.metaDescription.current || 'Very long description that gets cut off...'}" />\n(${meta.metaDescription.length} characters)`,
          after: `<meta name="description" content="${meta.metaDescription.optimized || 'Concise description that fits perfectly'}" />\n(150 characters - displays fully)`,
          reason: 'Descriptions over 160 characters get truncated in search results',
          seoImpact: 'Truncated descriptions may hide important information and reduce clicks'
        });
      }
      if (!meta.metaDescription.includesKeyword) {
        issues.push('Primary keyword not in meta description');
        recommendations.push('Include your primary keyword in the meta description');
        metaExamples.push({
          type: 'description',
          issue: 'Primary keyword missing in description',
          before: `<meta name="description" content="${meta.metaDescription.current || 'Generic description without keyword'}" />`,
          after: `<meta name="description" content="${meta.metaDescription.optimized || 'Description that naturally includes your primary keyword'}" />`,
          reason: 'Keywords in descriptions help with relevance and may appear in bold in results',
          seoImpact: 'Descriptions with keywords can improve visibility and click-through rates'
        });
      }
    }

    return {
      title: '🏷️ Meta Tags Optimization',
      description: 'Analyzed title tags, meta descriptions, and Open Graph tags',
      summary: {
        title: {
          current: meta.title?.current || 'Not set',
          optimized: meta.title?.optimized || 'N/A',
          length: meta.title?.length || 0,
          status: meta.title?.status || 'unknown'
        },
        description: {
          current: meta.metaDescription?.current || 'Not set',
          optimized: meta.metaDescription?.optimized || 'N/A',
          length: meta.metaDescription?.length || 0,
          status: meta.metaDescription?.status || 'unknown'
        }
      },
      issues: issues.length > 0 ? issues : ['Meta tags are well optimized'],
      recommendations: recommendations.length > 0 ? recommendations : ['Your meta tags look great!'],
      metaExamples: metaExamples,
      status: issues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  formatSchemaForDisplay(schema) {
    const issues = [];
    const recommendations = [];
    const schemaExamples = [];

    if (!schema.detected || schema.detected.length === 0) {
      issues.push('No structured data (schema markup) found');
      recommendations.push('Add schema markup to help search engines understand your content and enable rich snippets');
      schemaExamples.push({
        type: 'schema',
        issue: 'No structured data markup',
        before: '<body>\n  <h1>Your Page</h1>\n  <p>Content here...</p>\n</body>\n<!-- No schema markup -->',
        after: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Your Page Title",\n  "author": {...}\n}\n</script>',
        reason: 'Schema markup helps search engines understand your content structure',
        seoImpact: 'Pages with schema markup can show rich snippets in search results, improving CTR by 30%+'
      });
    }

    if (schema.generated && schema.generated.length > 0) {
      recommendations.push(`AI has generated ${schema.generated.length} schema markup(s) ready to implement`);
      schema.generated.slice(0, 2).forEach((genSchema, idx) => {
        // Convert schema object to string if needed
        const schemaString = typeof genSchema === 'string' 
          ? genSchema 
          : JSON.stringify(genSchema, null, 2);
        const schemaPreview = schemaString.length > 300 
          ? schemaString.substring(0, 300) + '...' 
          : schemaString;
        
        schemaExamples.push({
          type: 'schema',
          issue: `AI-generated schema ${idx + 1} ready to implement`,
          before: '<!-- No schema markup for this content type -->',
          after: `<script type="application/ld+json">\n${schemaPreview}\n</script>`,
          reason: 'This schema markup will help your content appear as rich results',
          seoImpact: 'Rich snippets make your listing stand out and increase click-through rates'
        });
      });
    }

    return {
      title: '📋 Schema Markup',
      description: 'Analyzed structured data and schema markup on your page',
      summary: {
        existing: schema.detected?.length || 0,
        detected: schema.detected || [],
        recommended: schema.generated?.length || 0
      },
      issues: issues.length > 0 ? issues : ['Schema markup found'],
      recommendations: recommendations.length > 0 ? recommendations : ['Your structured data is properly implemented!'],
      schemaExamples: schemaExamples,
      status: schema.detected && schema.detected.length > 0 ? 'good' : 'needs_attention'
    };
  }

  formatImageForDisplay(image) {
    const issues = [];
    const recommendations = [];
    const imageExamples = [];

    if (image.images) {
      const withoutAlt = image.images.filter(img => !img.hasAlt).length;
      if (withoutAlt > 0) {
        issues.push(`${withoutAlt} images missing alt text`);
        recommendations.push('Add descriptive alt text to all images for accessibility and image SEO');
        
        // Get example image without alt
        const exampleImg = image.images.find(img => !img.hasAlt);
        if (exampleImg) {
          const suggestedAlt = exampleImg.suggestions?.alt || this.generateAltFromFilename(exampleImg.src);
          imageExamples.push({
            type: 'alt',
            issue: 'Image missing alt text',
            before: `<img src="${exampleImg.src}">\n<!-- No alt attribute -->`,
            after: `<img src="${exampleImg.src}" alt="${suggestedAlt}">\n<!-- Descriptive alt text added -->`,
            reason: 'Alt text helps screen readers and enables image SEO',
            seoImpact: 'Images with alt text can rank in Google Image Search and improve overall SEO'
          });
        }
      }

      const poorAlt = image.images.filter(img => img.hasAlt && (!img.altText || img.altText.length < 5 || img.altText.length > 125)).length;
      if (poorAlt > 0) {
        issues.push(`${poorAlt} images have poor quality alt text`);
        recommendations.push('Optimize alt text to be 5-125 characters and descriptive');
        
        // Get example with poor alt
        const poorAltImg = image.images.find(img => img.hasAlt && (!img.altText || img.altText.length < 5 || img.altText.length > 125));
        if (poorAltImg) {
          const suggestedAlt = poorAltImg.suggestions?.alt || this.generateAltFromFilename(poorAltImg.src);
          const currentAlt = poorAltImg.alt || 'img' || 'too long alt text that exceeds the recommended character limit and should be shortened';
          imageExamples.push({
            type: 'alt',
            issue: 'Poor quality alt text',
            before: `<img src="${poorAltImg.src}" alt="${currentAlt}" />\n<!-- ${currentAlt.length} characters - ${currentAlt.length < 5 ? 'too short' : 'too long'} -->`,
            after: `<img src="${poorAltImg.src}" alt="${suggestedAlt}" />\n<!-- ${suggestedAlt.length} characters - optimal length -->`,
            reason: 'Good alt text is 5-125 characters and describes the image content',
            seoImpact: 'Well-written alt text improves image SEO and accessibility scores'
          });
        }
      }
    }

    return {
      title: '🖼️ Image Optimization',
      description: 'Analyzed images for SEO, accessibility, and performance',
      summary: {
        total: image.images?.length || 0,
        withAlt: image.images?.filter(img => img.hasAlt).length || 0,
        withoutAlt: image.images?.filter(img => !img.hasAlt).length || 0
      },
      issues: issues.length > 0 ? issues : ['All images have proper alt text'],
      recommendations: recommendations.length > 0 ? recommendations : ['Your images are well optimized!'],
      imageExamples: imageExamples,
      status: issues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  // Helper to generate alt text from filename
  generateAltFromFilename(src) {
    const filename = src.split('/').pop().split('.')[0];
    return filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .substring(0, 125);
  }

  formatValidationForDisplay(validation) {
    const issues = [];
    const recommendations = [];
    const validationExamples = [];

    if (validation.quality) {
      const score = validation.quality.score;
      if (score < 60) {
        issues.push(`Content quality score is low (${score}/100)`);
        recommendations.push('Improve content quality, readability, and structure');
        validationExamples.push({
          type: 'quality',
          issue: 'Low content quality score',
          before: `Current Score: ${score}/100\n\nIssues:\n- Poor readability\n- Weak structure\n- Missing key elements`,
          after: `Target Score: 80+/100\n\nImprovements:\n- Enhance readability (simpler language)\n- Better content structure (clear headings)\n- Add valuable, original content\n- Fix technical SEO issues`,
          reason: 'Higher quality content ranks better and provides better user experience',
          seoImpact: 'Quality score directly impacts search rankings - aim for 80+ for best results'
        });
      } else if (score < 80) {
        issues.push(`Content quality could be improved (${score}/100)`);
        recommendations.push('Enhance content quality and address identified issues');
      }

      if (validation.quality.issues && validation.quality.issues.length > 0) {
        issues.push(...validation.quality.issues);
      }
    }

    if (!validation.uniqueness) {
      issues.push('Content may not be unique');
      recommendations.push('Ensure your content is original and not duplicated from other sources');
      validationExamples.push({
        type: 'uniqueness',
        issue: 'Content may be duplicated',
        before: 'Content appears similar or identical to other pages\nMay be copied from other sources\nLow originality score',
        after: 'Rewrite content in your own words\nAdd original insights and examples\nInclude unique perspectives\nCreate valuable, original content',
        reason: 'Duplicate content can be penalized by search engines',
        seoImpact: 'Unique, original content ranks higher than duplicated content'
      });
    }

    if (!validation.seoCompliance) {
      issues.push('SEO compliance issues detected');
      recommendations.push('Review and fix SEO compliance issues');
      validationExamples.push({
        type: 'compliance',
        issue: 'SEO compliance problems',
        before: 'Missing required SEO elements\nNon-compliant with best practices\nIssues with structure or formatting',
        after: 'Fix all identified SEO issues\nFollow Google\'s guidelines\nEnsure proper structure\nImplement best practices',
        reason: 'SEO compliance ensures your site follows search engine guidelines',
        seoImpact: 'Non-compliant sites may be penalized or rank lower in search results'
      });
    }

    return {
      title: '✅ Validation & Quality Check',
      description: 'Validated overall SEO quality and compliance',
      summary: {
        overall: validation.overall || 'unknown',
        qualityScore: validation.quality?.score || 'N/A',
        grade: validation.quality?.grade || 'N/A',
        uniqueness: validation.uniqueness ? '✅ Unique' : '❌ May not be unique',
        seoCompliance: validation.seoCompliance ? '✅ Compliant' : '❌ Issues found'
      },
      issues: issues.length > 0 ? issues : ['All validations passed'],
      recommendations: recommendations.length > 0 ? recommendations : ['Your content meets quality standards!'],
      validationExamples: validationExamples,
      status: issues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  async execute(results, url) {
    return await this.generate(results, url);
  }
}

