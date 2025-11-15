/**
 * Detailed HTML Report Generator
 * Generates HTML reports matching the DetailedDataSections.tsx component
 */

export class DetailedHtmlGenerator {
  constructor() {
    this.styles = this.getStyles();
  }

  generate(results, url, timestamp) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Report - ${this.escapeHtml(url)}</title>
    ${this.styles}
</head>
<body>
    <div class="container">
        ${this.generateHeader(url, timestamp)}
        <div class="content">
            ${this.generateKeywordSection(results.keyword)}
            ${this.generateSchemaSection(results.schema)}
            ${this.generateMetaSection(results.meta)}
            ${this.generateContentSection(results.content)}
            ${this.generateImageSection(results.image)}
            ${this.generateTechnicalSection(results.technical)}
            ${this.generateValidationSection(results.validation)}
            ${this.generateReportSection(results, url, timestamp)}
        </div>
    </div>
    ${this.getScripts()}
</body>
</html>`;
    return html;
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }

  getStyles() {
    return `<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }
      .header {
        background: white;
        border-radius: 12px;
        padding: 40px;
        text-align: center;
        margin-bottom: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      .header h1 {
        color: #667eea;
        font-size: 36px;
        margin-bottom: 10px;
      }
      .header .url {
        color: #666;
        font-size: 14px;
        word-break: break-all;
        margin-top: 10px;
      }
      .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .section {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border: 2px solid rgba(102, 126, 234, 0.2);
      }
      .section-header {
        padding: 24px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .section-header:hover {
        background: #f9fafb;
      }
      .section-header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .section-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-right: 16px;
      }
      .section-title {
        flex: 1;
      }
      .section-title h3 {
        font-size: 20px;
        color: #111827;
        margin-bottom: 4px;
      }
      .section-title p {
        font-size: 14px;
        color: #6b7280;
      }
      .section-body {
        padding: 24px;
        padding-top: 0;
        display: none;
      }
      .section-body.expanded {
        display: block;
      }
      .card {
        background: #f9fafb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .card h4 {
        font-size: 16px;
        color: #111827;
        margin-bottom: 12px;
      }
      .grid {
        display: grid;
        gap: 12px;
      }
      .grid-2 {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
      .grid-3 {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      .stat-card {
        background: white;
        border-radius: 6px;
        padding: 16px;
        text-align: center;
      }
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .stat-label {
        font-size: 12px;
        color: #6b7280;
      }
      .badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge-green {
        background: #d1fae5;
        color: #065f46;
      }
      .badge-yellow {
        background: #fef3c7;
        color: #92400e;
      }
      .badge-red {
        background: #fee2e2;
        color: #991b1b;
      }
      .badge-blue {
        background: #dbeafe;
        color: #1e40af;
      }
      .badge-purple {
        background: #e9d5ff;
        color: #6b21a8;
      }
      .keyword-tag {
        display: inline-block;
        background: #dbeafe;
        color: #1e40af;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        margin: 4px;
      }
      .code-block {
        background: #1f2937;
        color: #f3f4f6;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
      .btn {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }
      .btn-primary {
        background: #667eea;
        color: white;
      }
      .btn-primary:hover {
        background: #5568d3;
      }
      .toggle-icon {
        transition: transform 0.3s;
      }
      .toggle-icon.expanded {
        transform: rotate(180deg);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }
      th {
        background: #f3f4f6;
        font-weight: 600;
        font-size: 13px;
      }
      td {
        font-size: 14px;
      }
      .alert {
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .alert-info {
        background: #dbeafe;
        border-left: 4px solid #3b82f6;
        color: #1e40af;
      }
      .alert-success {
        background: #d1fae5;
        border-left: 4px solid #10b981;
        color: #065f46;
      }
      .alert-warning {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        color: #92400e;
      }
      .alert-error {
        background: #fee2e2;
        border-left: 4px solid #ef4444;
        color: #991b1b;
      }
    </style>`;
  }

  generateHeader(url, timestamp) {
    return `
      <div class="header">
        <h1>🔍 SEO Analysis Report</h1>
        <div class="url">${this.escapeHtml(url)}</div>
        <div style="margin-top: 10px; color: #9ca3af; font-size: 13px;">
          Generated: ${new Date(timestamp).toLocaleString()}
        </div>
      </div>
    `;
  }

  generateKeywordSection(data) {
    if (!data) return '';
    
    const primaryKeywords = data.primaryKeywords || [];
    const keywordDensity = data.keywordDensity || {};
    const longTailSuggestions = data.longTailSuggestions || [];
    const semanticKeywords = data.semanticKeywords || [];
    const missingKeywords = data.missingKeywords || [];
    const keywordGaps = data.keywordGaps || [];

    return `
      <div class="section" id="keyword-section">
        <div class="section-header" onclick="toggleSection('keyword')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);">
                🔑
              </div>
              <div class="section-title">
                <h3>Keyword Analysis - Complete Details</h3>
                <p>Primary keywords, density, long-tail suggestions & more</p>
              </div>
            </div>
            <svg class="toggle-icon" id="keyword-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="keyword-body">
          ${primaryKeywords.length > 0 ? `
            <div class="card" style="background: linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%); border: 1px solid #06b6d4;">
              <h4>🎯 Primary Keywords Identified</h4>
              <div class="grid grid-2">
                ${primaryKeywords.map(kw => `
                  <div class="stat-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-weight: 600; color: #111827;">${this.escapeHtml(kw.word)}</span>
                      <span class="badge ${kw.relevance === 'high' ? 'badge-green' : kw.relevance === 'medium' ? 'badge-yellow' : 'badge-blue'}">
                        ${kw.relevance}
                      </span>
                    </div>
                    <p style="font-size: 12px; color: #6b7280;">Search Volume: ${kw.searchVolume || 'N/A'}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${Object.keys(keywordDensity).length > 0 ? `
            <div class="card">
              <h4>📊 Keyword Density Analysis</h4>
              ${Object.entries(keywordDensity).map(([keyword, details]) => `
                <div style="background: white; border-left: 4px solid #06b6d4; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #111827;">${this.escapeHtml(keyword)}</span>
                    <span class="badge ${details.recommendation === 'decrease' ? 'badge-red' : details.recommendation === 'increase' ? 'badge-green' : 'badge-blue'}">
                      ${details.recommendation}
                    </span>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                    <div><span style="color: #6b7280;">Count:</span> <strong>${details.count}</strong></div>
                    <div><span style="color: #6b7280;">Density:</span> <strong>${(parseFloat(details.density) * 100).toFixed(2)}%</strong></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${longTailSuggestions.length > 0 ? `
            <div class="card" style="background: linear-gradient(135deg, #fae8ff 0%, #fbcfe8 100%); border: 1px solid #a855f7;">
              <h4>🎯 Long-Tail Keyword Suggestions (${longTailSuggestions.length})</h4>
              <p style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
                These specific phrases can help you rank for more targeted searches with less competition
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${longTailSuggestions.slice(0, 10).map(suggestion => `
                  <span class="keyword-tag" style="background: #fae8ff; color: #7e22ce;">
                    ${this.escapeHtml(suggestion)}
                  </span>
                `).join('')}
              </div>
              ${longTailSuggestions.length > 10 ? `
                <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                  +${longTailSuggestions.length - 10} more suggestions available
                </p>
              ` : ''}
            </div>
          ` : ''}

          ${semanticKeywords.length > 0 ? `
            <div class="card">
              <h4>🔗 Semantic Keywords (Related Terms)</h4>
              <p style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
                Include these related terms to improve topical relevance and E-E-A-T signals
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${semanticKeywords.map(keyword => `
                  <span class="keyword-tag">${this.escapeHtml(keyword)}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${missingKeywords.length > 0 ? `
            <div class="alert alert-error">
              <h4 style="margin-bottom: 8px;">⚠️ Missing Important Keywords</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${missingKeywords.map(keyword => `
                  <span style="background: white; color: #991b1b; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; border: 1px solid #fecaca;">
                    ${this.escapeHtml(keyword)}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${keywordGaps.length > 0 ? `
            <div class="alert alert-warning">
              <h4 style="margin-bottom: 12px;">🔍 Keyword Gap Analysis</h4>
              ${keywordGaps.map(gap => `
                <div style="background: white; border-radius: 6px; padding: 12px; margin-bottom: 8px; border: 1px solid #fde68a;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: #111827;">${this.escapeHtml(gap.keyword)}</span>
                    <span class="badge ${gap.priority === 'high' ? 'badge-red' : gap.priority === 'medium' ? 'badge-yellow' : 'badge-green'}">
                      ${gap.priority}
                    </span>
                  </div>
                  <p style="font-size: 13px; color: #6b7280;">${this.escapeHtml(gap.reason)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateSchemaSection(data) {
    if (!data) return '';
    
    const generated = data.aiGenerated || data.generated || [];
    const existing = data.existing || [];
    const recommendations = data.recommendations || [];

    return `
      <div class="section" id="schema-section">
        <div class="section-header" onclick="toggleSection('schema')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);">
                📋
              </div>
              <div class="section-title">
                <h3>Schema Markup - AI Generated Code</h3>
                <p>Ready-to-use structured data markup for your website</p>
              </div>
            </div>
            <svg class="toggle-icon" id="schema-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="schema-body">

          ${existing.length > 0 ? `
            <div class="card">
              <h4>✅ Existing Schema Found (${existing.length})</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                ${existing.map(schema => `
                  <span class="badge badge-green">${schema['@type'] || schema}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${recommendations.length > 0 ? `
            <div class="alert alert-info">
              <h4 style="margin-bottom: 12px;">💡 Schema Recommendations</h4>
              ${recommendations.map(rec => `
                <div style="background: white; border-radius: 6px; padding: 12px; margin-bottom: 8px; border: 1px solid #93c5fd;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: #111827;">${this.escapeHtml(rec.message)}</span>
                    <span class="badge ${rec.priority === 'high' ? 'badge-red' : rec.priority === 'medium' ? 'badge-yellow' : 'badge-green'}">
                      ${rec.priority}
                    </span>
                  </div>
                  <p style="font-size: 13px; color: #6b7280;">${this.escapeHtml(rec.impact)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateMetaSection(data) {
    if (!data) return '';
    return `
      <div class="section" id="meta-section">
        <div class="section-header" onclick="toggleSection('meta')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);">
                🏷️
              </div>
              <div class="section-title">
                <h3>Meta Tags - AI Optimized</h3>
                <p>Title, description & Open Graph tags with AI suggestions</p>
              </div>
            </div>
            <svg class="toggle-icon" id="meta-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="meta-body">
          ${data.title ? `
            <div class="card" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #3b82f6;">
              <h4>📌 Title Tag Analysis</h4>
              <div style="background: white; border: 2px solid #fecaca; border-radius: 8px; padding: 16px; margin: 12px 0;">
                <div style="display: flex; justify-content: between; margin-bottom: 8px;">
                  <span style="font-size: 12px; font-weight: 600; color: #991b1b;">CURRENT TITLE</span>
                  <span style="font-size: 12px; color: #6b7280;">${data.title.length} characters</span>
                </div>
                <p style="color: #111827; font-weight: 500;">${this.escapeHtml(data.title.current)}</p>
                <div style="margin-top: 8px;">
                  <span class="badge ${data.title.status === 'optimal' ? 'badge-green' : data.title.status === 'too-short' ? 'badge-yellow' : 'badge-red'}">
                    ${data.title.status}
                  </span>
                  ${data.title.includesKeyword ? '<span class="badge badge-green">✓ Includes Keyword</span>' : ''}
                </div>
              </div>
              ${data.title.aiGenerated && data.title.optimized ? `
                <div style="background: white; border: 2px solid #86efac; border-radius: 8px; padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 600; color: #065f46;">✨ AI-OPTIMIZED TITLE</span>
                    <button class="btn btn-primary" onclick="copyToClipboard('title-opt')">Copy</button>
                  </div>
                  <p style="color: #111827; font-weight: 500;" id="title-opt">${this.escapeHtml(data.title.optimized)}</p>
                  ${data.title.suggestions && data.title.suggestions.length > 0 ? `
                    <div style="margin-top: 12px;">
                      ${data.title.suggestions.map(s => `<p style="font-size: 12px; color: #6b7280;">• ${this.escapeHtml(s)}</p>`).join('')}
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${data.metaDescription ? `
            <div class="card" style="background: linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%); border: 1px solid #a855f7;">
              <h4>📝 Meta Description Analysis</h4>
              <div style="background: white; border: 2px solid #fecaca; border-radius: 8px; padding: 16px; margin: 12px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 12px; font-weight: 600; color: #991b1b;">CURRENT DESCRIPTION</span>
                  <span style="font-size: 12px; color: #6b7280;">${data.metaDescription.length} characters</span>
                </div>
                <p style="color: #111827;">${this.escapeHtml(data.metaDescription.current)}</p>
                <div style="margin-top: 8px;">
                  <span class="badge ${data.metaDescription.status === 'optimal' ? 'badge-green' : data.metaDescription.status === 'too-short' ? 'badge-yellow' : 'badge-red'}">
                    ${data.metaDescription.status}
                  </span>
                </div>
              </div>
              ${data.metaDescription.aiGenerated && data.metaDescription.optimized ? `
                <div style="background: white; border: 2px solid #86efac; border-radius: 8px; padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 600; color: #065f46;">✨ AI-OPTIMIZED DESCRIPTION</span>
                    <button class="btn btn-primary" onclick="copyToClipboard('desc-opt')">Copy</button>
                  </div>
                  <p style="color: #111827;" id="desc-opt">${this.escapeHtml(data.metaDescription.optimized)}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${data.ogTags ? `
            <div class="card">
              <h4>🌐 Open Graph Tags (Social Media)</h4>
              ${Object.entries(data.ogTags).map(([key, value]) => `
                <div style="background: #f9fafb; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                  <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px;">og:${key}</div>
                  <p style="font-size: 14px; color: #111827; word-break: break-all;">
                    ${this.escapeHtml(value.current || value.optimized || 'Not set')}
                  </p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateContentSection(data) {
    if (!data) return '';
    const readability = data.readability || {};
    const structure = data.structure || {};
    const aiSuggestions = data.aiSuggestions || {};
    const contentQuality = data.contentQuality || {};

    return `
      <div class="section" id="content-section">
        <div class="section-header" onclick="toggleSection('content')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);">
                📝
              </div>
              <div class="section-title">
                <h3>Content Optimization - AI Analysis</h3>
                <p>Readability, structure, and content quality insights</p>
              </div>
            </div>
            <svg class="toggle-icon" id="content-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="content-body">
          ${readability.fleschScore ? `
            <div class="card" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #3b82f6;">
              <h4>📖 Readability Analysis</h4>
              <div class="grid grid-3" style="margin-bottom: 16px;">
                <div class="stat-card">
                  <div class="stat-label">Word Count</div>
                  <div class="stat-value">${readability.wordCount || 0}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Sentences</div>
                  <div class="stat-value">${readability.sentenceCount || 0}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Avg Sentence</div>
                  <div class="stat-value">${readability.avgSentenceLength || 0}</div>
                </div>
                <div class="stat-card" style="border: 2px solid ${parseFloat(readability.fleschScore) > 60 ? '#10b981' : parseFloat(readability.fleschScore) > 30 ? '#f59e0b' : '#ef4444'};">
                  <div class="stat-label">Flesch Score</div>
                  <div class="stat-value" style="color: ${parseFloat(readability.fleschScore) > 60 ? '#10b981' : parseFloat(readability.fleschScore) > 30 ? '#f59e0b' : '#ef4444'};">${readability.fleschScore}</div>
                </div>
              </div>
              <div class="alert alert-info">
                <strong>Readability Level:</strong> ${readability.readability || 'N/A'}
              </div>
            </div>
          ` : ''}

          ${structure.hasH1 !== undefined ? `
            <div class="card">
              <h4>🏗️ Content Structure</h4>
              <div class="grid grid-2">
                <div class="stat-card">
                  <div class="stat-label">H1 Tags</div>
                  <div class="stat-value">${structure.hasH1 ? `✅ ${structure.h1Count || 1}` : '❌ 0'}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">H2 Tags</div>
                  <div class="stat-value">${structure.h2Count || 0}</div>
                </div>
              </div>
              ${structure.issues && structure.issues.length > 0 ? `
                <div class="alert alert-warning" style="margin-top: 12px;">
                  <strong>Structure Issues:</strong>
                  ${structure.issues.map(issue => `<p style="margin: 4px 0;">⚠️ ${this.escapeHtml(issue)}</p>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${contentQuality.score ? `
            <div class="card" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 1px solid #10b981;">
              <h4>⭐ Content Quality Score: ${contentQuality.score}/100</h4>
              ${contentQuality.strengths && contentQuality.strengths.length > 0 ? `
                <div style="background: white; border-radius: 6px; padding: 12px; margin: 12px 0;">
                  <strong style="color: #065f46;">✅ Strengths:</strong>
                  ${contentQuality.strengths.map(s => `<p style="margin: 4px 0; font-size: 13px;">✓ ${this.escapeHtml(s)}</p>`).join('')}
                </div>
              ` : ''}
              ${contentQuality.weaknesses && contentQuality.weaknesses.length > 0 ? `
                <div style="background: white; border-radius: 6px; padding: 12px;">
                  <strong style="color: #991b1b;">❌ Weaknesses:</strong>
                  ${contentQuality.weaknesses.map(w => `<p style="margin: 4px 0; font-size: 13px;">✗ ${this.escapeHtml(w)}</p>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateImageSection(data) {
    if (!data) return '';
    const images = data.images || [];

    return `
      <div class="section" id="image-section">
        <div class="section-header" onclick="toggleSection('image')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);">
                🖼️
              </div>
              <div class="section-title">
                <h3>Image Optimization - AI Alt Text</h3>
                <p>All images with AI-generated alt text suggestions</p>
              </div>
            </div>
            <svg class="toggle-icon" id="image-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="image-body">
          ${images.length > 0 ? `
            <div class="alert alert-info">
              <h4>Found ${images.length} images on your page</h4>
              <p style="font-size: 13px;">${images.filter(img => img.aiGenerated).length} images have AI-generated alt text suggestions</p>
            </div>
            ${images.map((image, idx) => `
              <div class="card" style="border: 2px solid ${image.altQuality === 'good' ? '#86efac' : image.altQuality === 'poor' ? '#fecaca' : '#fde68a'};">
                <div style="display: flex; gap: 16px;">
                  <div style="flex-shrink: 0; width: 64px; height: 64px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
                    <img src="${this.escapeHtml(image.src)}" alt="${this.escapeHtml(image.alt || '')}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
                  </div>
                  <div style="flex: 1;">
                    <div style="margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 600; color: #6b7280;">Image #${idx + 1}</span>
                      <span class="badge ${image.altQuality === 'good' ? 'badge-green' : image.altQuality === 'poor' ? 'badge-red' : 'badge-yellow'}">
                        ${image.altQuality}
                      </span>
                      ${image.aiGenerated ? '<span class="badge badge-purple">✨ AI Suggestion</span>' : ''}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; word-break: break-all;">
                      ${this.escapeHtml(image.src)}
                    </div>
                    <div style="background: white; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                      <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px;">Current Alt Text:</div>
                      <p style="font-size: 13px; color: ${image.alt ? '#111827' : '#ef4444'};">
                        ${image.alt ? this.escapeHtml(image.alt) : 'Missing!'}
                      </p>
                    </div>
                    ${image.suggestions && image.suggestions.alt ? `
                      <div style="background: #d1fae5; border: 2px solid #86efac; border-radius: 6px; padding: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <div style="font-size: 12px; font-weight: 600; color: #065f46;">✨ AI-Suggested Alt Text:</div>
                          <button class="btn btn-primary" style="font-size: 11px; padding: 4px 8px;" onclick="copyToClipboard('alt-${idx}')">Copy</button>
                        </div>
                        <p style="font-size: 13px; color: #111827;" id="alt-${idx}">${this.escapeHtml(image.suggestions.alt)}</p>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          ` : '<p>No images found on this page.</p>'}
        </div>
      </div>
    `;
  }

  generateTechnicalSection(data) {
    if (!data) return '';
    const mobile = data.mobile || {};
    const accessibility = data.accessibility || {};
    const security = data.security || {};
    const aiRecommendations = data.aiRecommendations || [];

    return `
      <div class="section" id="technical-section">
        <div class="section-header" onclick="toggleSection('technical')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                ⚙️
              </div>
              <div class="section-title">
                <h3>Technical SEO - Detailed Analysis</h3>
                <p>Performance, mobile, accessibility & security</p>
              </div>
            </div>
            <svg class="toggle-icon" id="technical-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="technical-body">
          <div class="card" style="background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%); border: 1px solid #ef4444;">
            <h4>📱 Mobile Friendliness</h4>
            <div class="grid grid-2">
              <div class="stat-card" style="border: 2px solid ${mobile.hasViewport ? '#10b981' : '#ef4444'};">
                <div class="stat-label">Viewport</div>
                <div class="stat-value" style="font-size: 18px;">${mobile.hasViewport ? '✅ Yes' : '❌ No'}</div>
              </div>
              <div class="stat-card" style="border: 2px solid ${mobile.isResponsive ? '#10b981' : '#ef4444'};">
                <div class="stat-label">Responsive</div>
                <div class="stat-value" style="font-size: 18px;">${mobile.isResponsive ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>
            ${mobile.issues && mobile.issues.length > 0 ? `
              <div class="alert alert-warning" style="margin-top: 12px;">
                <strong>Issues:</strong>
                ${mobile.issues.map(issue => `<p style="margin: 4px 0;">• ${this.escapeHtml(issue)}</p>`).join('')}
              </div>
            ` : ''}
          </div>

          ${accessibility.altCoverage !== undefined ? `
            <div class="card">
              <h4>♿ Accessibility</h4>
              <div class="grid grid-2">
                <div class="stat-card" style="border: 2px solid ${accessibility.altCoverage >= 80 ? '#10b981' : accessibility.altCoverage >= 50 ? '#f59e0b' : '#ef4444'};">
                  <div class="stat-label">Alt Text Coverage</div>
                  <div class="stat-value" style="color: ${accessibility.altCoverage >= 80 ? '#10b981' : accessibility.altCoverage >= 50 ? '#f59e0b' : '#ef4444'};">
                    ${accessibility.altCoverage}%
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Images Without Alt</div>
                  <div class="stat-value">${accessibility.imagesWithoutAlt || 0}</div>
                </div>
              </div>
            </div>
          ` : ''}

          ${aiRecommendations.length > 0 ? `
            <div class="alert alert-info">
              <h4 style="margin-bottom: 12px;">✨ AI-Powered Recommendations (${aiRecommendations.length})</h4>
              ${aiRecommendations.map(rec => `
                <div style="background: white; border-radius: 6px; padding: 12px; margin-bottom: 8px; border: 1px solid #93c5fd;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #111827;">${this.escapeHtml(rec.issue)}</span>
                    <span class="badge ${rec.priority === 'critical' ? 'badge-red' : rec.priority === 'high' ? 'badge-yellow' : rec.priority === 'medium' ? 'badge-blue' : 'badge-green'}">
                      ${rec.priority}
                    </span>
                  </div>
                  <div style="background: #eff6ff; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
                    <strong style="font-size: 12px; color: #1e40af;">How to Fix:</strong>
                    <p style="font-size: 13px; color: #1e3a8a; margin-top: 4px;">${this.escapeHtml(rec.fix)}</p>
                  </div>
                  <div style="background: #f0fdf4; border-radius: 4px; padding: 8px;">
                    <strong style="font-size: 12px; color: #065f46;">Impact:</strong>
                    <p style="font-size: 13px; color: #166534; margin-top: 4px;">${this.escapeHtml(rec.impact)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateValidationSection(data) {
    if (!data) return '';
    const quality = data.quality || {};
    const seoCompliance = data.seoCompliance || {};
    const aiRecommendations = data.aiRecommendations || [];

    return `
      <div class="section" id="validation-section">
        <div class="section-header" onclick="toggleSection('validation')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                ✅
              </div>
              <div class="section-title">
                <h3>Validation & Quality Check</h3>
                <p>Overall SEO quality assessment and compliance</p>
              </div>
            </div>
            <svg class="toggle-icon" id="validation-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="validation-body">
          ${quality.score !== undefined ? `
            <div class="card" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #3b82f6;">
              <h4>⭐ Overall Quality Assessment</h4>
              <div class="grid grid-2">
                <div class="stat-card" style="border: 2px solid ${quality.score >= 80 ? '#10b981' : quality.score >= 60 ? '#f59e0b' : '#ef4444'};">
                  <div class="stat-label">Quality Score</div>
                  <div class="stat-value" style="color: ${quality.score >= 80 ? '#10b981' : quality.score >= 60 ? '#f59e0b' : '#ef4444'};">
                    ${quality.score}
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Grade</div>
                  <div class="stat-value" style="color: ${quality.grade === 'A' ? '#10b981' : quality.grade === 'B' ? '#3b82f6' : quality.grade === 'C' ? '#f59e0b' : '#ef4444'};">
                    ${quality.grade || 'N/A'}
                  </div>
                </div>
              </div>
              ${quality.strengths && quality.strengths.length > 0 ? `
                <div class="alert alert-success" style="margin-top: 12px;">
                  <strong>✅ Strengths:</strong>
                  ${quality.strengths.map(s => `<p style="margin: 4px 0;">✓ ${this.escapeHtml(s)}</p>`).join('')}
                </div>
              ` : ''}
              ${quality.weaknesses && quality.weaknesses.length > 0 ? `
                <div class="alert alert-error" style="margin-top: 12px;">
                  <strong>❌ Weaknesses:</strong>
                  ${quality.weaknesses.map(w => `<p style="margin: 4px 0;">✗ ${this.escapeHtml(w)}</p>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${seoCompliance.critical || seoCompliance.warnings ? `
            <div class="card">
              <h4>🔍 SEO Compliance Check</h4>
              ${seoCompliance.critical && seoCompliance.critical.length > 0 ? `
                <div class="alert alert-error">
                  <strong>🚨 Critical Issues:</strong>
                  ${seoCompliance.critical.map(issue => `<p style="margin: 4px 0;">• ${this.escapeHtml(issue)}</p>`).join('')}
                </div>
              ` : ''}
              ${seoCompliance.warnings && seoCompliance.warnings.length > 0 ? `
                <div class="alert alert-warning" style="margin-top: 12px;">
                  <strong>⚠️ Warnings:</strong>
                  ${seoCompliance.warnings.map(warning => `<p style="margin: 4px 0;">• ${this.escapeHtml(warning)}</p>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${aiRecommendations.length > 0 ? `
            <div class="alert alert-info">
              <h4 style="margin-bottom: 12px;">✨ AI-Powered Recommendations (${aiRecommendations.length})</h4>
              ${aiRecommendations.map(rec => `
                <div style="background: white; border-radius: 6px; padding: 12px; margin-bottom: 8px; border: 1px solid #c4b5fd;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #111827;">${this.escapeHtml(rec.issue)}</span>
                    <span class="badge ${rec.priority === 'critical' ? 'badge-red' : rec.priority === 'high' ? 'badge-yellow' : rec.priority === 'medium' ? 'badge-blue' : 'badge-green'}">
                      ${rec.priority}
                    </span>
                  </div>
                  <div style="background: #d1fae5; border-radius: 4px; padding: 8px;">
                    <strong style="font-size: 12px; color: #065f46;">💡 How to Fix:</strong>
                    <p style="font-size: 13px; color: #166534; margin-top: 4px;">${this.escapeHtml(rec.fix)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateReportSection(results, url, timestamp) {
    const summary = results.summary || {};
    const keyFindings = results.keyFindings || [];
    const priorityActions = results.priorityActions || [];

    return `
      <div class="section" id="report-section">
        <div class="section-header" onclick="toggleSection('report')">
          <div class="section-header-content">
            <div style="display: flex; align-items: center;">
              <div class="section-icon" style="background: linear-gradient(135deg, #ec4899 0%, #be123c 100%);">
                📊
              </div>
              <div class="section-title">
                <h3>SEO Report Summary</h3>
                <p>Complete analysis summary and recommendations</p>
              </div>
            </div>
            <svg class="toggle-icon" id="report-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="section-body" id="report-body">
          ${summary.overallScore !== undefined ? `
            <div class="card" style="background: linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%); border: 1px solid #3b82f6;">
              <h4>📋 Report Summary</h4>
              <div class="grid grid-3">
                <div class="stat-card" style="border: 2px solid ${summary.overallScore >= 80 ? '#10b981' : summary.overallScore >= 60 ? '#f59e0b' : '#ef4444'};">
                  <div class="stat-label">Overall Score</div>
                  <div class="stat-value" style="color: ${summary.overallScore >= 80 ? '#10b981' : summary.overallScore >= 60 ? '#f59e0b' : '#ef4444'};">
                    ${summary.overallScore}
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Total Recommendations</div>
                  <div class="stat-value" style="color: #3b82f6;">${summary.totalRecommendations || 0}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Critical Issues</div>
                  <div class="stat-value" style="color: #a855f7;">${summary.criticalIssues || 0}</div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="card">
            <h4>🔗 Report Details</h4>
            <div style="font-size: 14px;">
              <div style="margin-bottom: 8px;">
                <span style="font-weight: 600; color: #6b7280;">URL:</span>
                <span style="color: #111827; word-break: break-all;">${this.escapeHtml(url)}</span>
              </div>
              <div>
                <span style="font-weight: 600; color: #6b7280;">Generated:</span>
                <span style="color: #111827;">${new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>

          ${keyFindings.length > 0 ? `
            <div class="alert alert-success">
              <h4 style="margin-bottom: 12px;">🔍 Key Findings</h4>
              ${keyFindings.map(finding => `
                <div style="background: white; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                  ✓ ${this.escapeHtml(finding)}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${priorityActions.length > 0 ? `
            <div class="alert alert-error">
              <h4 style="margin-bottom: 12px;">🚨 Priority Actions Required</h4>
              ${priorityActions.map(action => `
                <div style="background: white; border-radius: 6px; padding: 12px; margin-bottom: 8px; border-left: 4px solid #ef4444;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: #111827;">${this.escapeHtml(action.title || action)}</span>
                    ${action.priority ? `
                      <span class="badge ${action.priority === 'critical' ? 'badge-red' : action.priority === 'high' ? 'badge-yellow' : 'badge-blue'}">
                        ${action.priority}
                      </span>
                    ` : ''}
                  </div>
                  ${action.description ? `<p style="font-size: 13px; color: #6b7280;">${this.escapeHtml(action.description)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getScripts() {
    return `<script>
      function toggleSection(sectionId) {
        const body = document.getElementById(sectionId + '-body');
        const icon = document.getElementById(sectionId + '-icon');
        if (body && icon) {
          body.classList.toggle('expanded');
          icon.classList.toggle('expanded');
        }
      }

      function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          const text = element.textContent || element.innerText;
          navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        }
      }

      // Expand all sections by default
      document.addEventListener('DOMContentLoaded', function() {
        const sections = ['keyword', 'schema', 'meta', 'content', 'image', 'technical', 'validation', 'report'];
        sections.forEach(sectionId => {
          const body = document.getElementById(sectionId + '-body');
          const icon = document.getElementById(sectionId + '-icon');
          if (body && icon) {
            body.classList.add('expanded');
            icon.classList.add('expanded');
          }
        });
      });
    </script>`;
  }
}
