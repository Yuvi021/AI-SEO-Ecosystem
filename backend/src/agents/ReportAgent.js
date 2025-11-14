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

    let html = '<div class="section"><h2>Recommendations</h2>';
    
    recommendations.forEach(rec => {
      html += `
        <div class="recommendation ${rec.priority}">
            <span class="priority ${rec.priority}">${rec.priority}</span>
            <h4>${rec.message}</h4>
            <p><strong>Impact:</strong> ${rec.impact}</p>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  generateSectionsHTML(sections) {
    let html = '<div class="section"><h2>Detailed Analysis</h2>';
    
    if (sections.meta) {
      html += this.generateMetaHTML(sections.meta);
    }
    
    if (sections.keyword) {
      html += `
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Keyword Analysis</h3>
        <p><strong>Primary Keywords:</strong> ${sections.keyword.primaryKeywords?.map(k => k.word).join(', ') || 'N/A'}</p>
      `;
    }
    
    if (sections.content) {
      html += `
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Content Quality</h3>
        <p><strong>Readability:</strong> ${sections.content.readability?.readability || 'N/A'}</p>
        <p><strong>Word Count:</strong> ${sections.content.readability?.wordCount || 0}</p>
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

  async execute(results, url) {
    return await this.generate(results, url);
  }
}

