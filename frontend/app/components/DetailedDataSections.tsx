'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DetailedDataSectionsProps {
  results: Record<string, Record<string, any>>;
}

export default function DetailedDataSections({ results }: DetailedDataSectionsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Extract data from results
  const extractedData: any = {};
  
  Object.entries(results).forEach(([urlKey, agentResults]) => {
    Object.entries(agentResults).forEach(([agentId, result]) => {
      if (!extractedData[agentId]) {
        extractedData[agentId] = result;
      }
    });
  });

  const keywordData = extractedData.keyword;
  const schemaData = extractedData.schema;
  const metaData = extractedData.meta;
  const imageData = extractedData.image;
  const technicalData = extractedData.technical;
  const contentData = extractedData.content;
  const validationData = extractedData.validation;
  const reportData = extractedData.report;

  return (
    <div className="space-y-6">
      {/* Keyword Analysis Details */}
      {keywordData && (
        <DetailedKeywordSection 
          data={keywordData} 
          isExpanded={expandedSections.has('keyword')}
          onToggle={() => toggleSection('keyword')}
        />
      )}

      {/* Schema Markup Details */}
      {schemaData && (
        <DetailedSchemaSection 
          data={schemaData} 
          isExpanded={expandedSections.has('schema')}
          onToggle={() => toggleSection('schema')}
        />
      )}

      {/* Meta Tags Details */}
      {metaData && (
        <DetailedMetaSection 
          data={metaData} 
          isExpanded={expandedSections.has('meta')}
          onToggle={() => toggleSection('meta')}
        />
      )}

      {/* Content Optimization Details */}
      {contentData && (
        <DetailedContentSection 
          data={contentData} 
          isExpanded={expandedSections.has('content')}
          onToggle={() => toggleSection('content')}
        />
      )}

      {/* Image Optimization Details */}
      {imageData && (
        <DetailedImageSection 
          data={imageData} 
          isExpanded={expandedSections.has('image')}
          onToggle={() => toggleSection('image')}
        />
      )}

      {/* Technical SEO Details */}
      {technicalData && (
        <DetailedTechnicalSection 
          data={technicalData} 
          isExpanded={expandedSections.has('technical')}
          onToggle={() => toggleSection('technical')}
        />
      )}

      {/* Validation & Quality Check Details */}
      {validationData && (
        <DetailedValidationSection 
          data={validationData} 
          isExpanded={expandedSections.has('validation')}
          onToggle={() => toggleSection('validation')}
        />
      )}

      {/* Report Generation Details */}
      {reportData && (
        <DetailedReportSection 
          data={reportData} 
          isExpanded={expandedSections.has('report')}
          onToggle={() => toggleSection('report')}
        />
      )}
    </div>
  );
}

// Keyword Analysis Section
function DetailedKeywordSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔑</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Keyword Analysis - Complete Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Primary keywords, density, long-tail suggestions & more</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Primary Keywords */}
          {data.primaryKeywords && data.primaryKeywords.length > 0 && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-5 border border-cyan-200 dark:border-cyan-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🎯</span> Primary Keywords Identified
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.primaryKeywords.map((kw: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{kw.word}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        kw.relevance === 'high' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        kw.relevance === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {kw.relevance}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Search Volume: {kw.searchVolume}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Density */}
          {data.keywordDensity && Object.keys(data.keywordDensity).length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>📊</span> Keyword Density Analysis
              </h4>
              <div className="space-y-3">
                {Object.entries(data.keywordDensity).map(([keyword, details]: [string, any]) => (
                  <div key={keyword} className="border-l-4 border-cyan-500 bg-gray-50 dark:bg-gray-800 rounded-r-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{keyword}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        details.recommendation === 'decrease' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        details.recommendation === 'increase' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {details.recommendation}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Count: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{details.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Density: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(parseFloat(details.density) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Long-tail Suggestions */}
          {data.longTailSuggestions && data.longTailSuggestions.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🎯</span> Long-Tail Keyword Suggestions ({data.longTailSuggestions.length})
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                These specific phrases can help you rank for more targeted searches with less competition
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.longTailSuggestions.slice(0, 10).map((suggestion: string, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-2 text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">→</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
              {data.longTailSuggestions.length > 10 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  +{data.longTailSuggestions.length - 10} more suggestions available
                </p>
              )}
            </div>
          )}

          {/* Semantic Keywords */}
          {data.semanticKeywords && data.semanticKeywords.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🔗</span> Semantic Keywords (Related Terms)
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Include these related terms to improve topical relevance and E-E-A-T signals
              </p>
              <div className="flex flex-wrap gap-2">
                {data.semanticKeywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {data.missingKeywords && data.missingKeywords.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                <span>⚠️</span> Missing Important Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.missingKeywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium border border-red-300 dark:border-red-700">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Gaps */}
          {data.keywordGaps && data.keywordGaps.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-5 border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
                <span>🔍</span> Keyword Gap Analysis
              </h4>
              <div className="space-y-3">
                {data.keywordGaps.map((gap: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-300 dark:border-yellow-700">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{gap.keyword}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        gap.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        gap.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {gap.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{gap.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Schema Markup Section
function DetailedSchemaSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Schema Markup - AI Generated Code</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ready-to-use structured data markup for your website</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* AI Generated Schema */}
          {data.generated && data.generated.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                <span>✨</span> AI-Generated Schema Markup ({data.generated.length})
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Copy and paste these schema markups into your website's &lt;head&gt; section
              </p>
              <div className="space-y-4">
                {data.generated.map((schema: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-300 dark:border-green-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {schema['@type']} Schema
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                          alert('Schema copied to clipboard!');
                        }}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors"
                      >
                        📋 Copy Code
                      </button>
                    </div>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto border border-gray-200 dark:border-gray-700">
                      <code className="text-gray-700 dark:text-gray-300">
{`<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Schema */}
          {data.existing && data.existing.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>✅</span> Existing Schema Found ({data.existing.length})
              </h4>
              <div className="space-y-2">
                {data.existing.map((schema: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{schema['@type']}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schema Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <span>💡</span> Schema Recommendations
              </h4>
              <div className="space-y-3">
                {data.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-300 dark:border-blue-700">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{rec.message}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Meta Tags Section
function DetailedMetaSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-200 dark:from-orange-900/30 dark:to-red-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏷️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Meta Tags - AI Optimized</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Title, description & Open Graph tags with AI suggestions</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Title Tag */}
          {data.title && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📌</span> Title Tag Analysis
              </h4>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-300 dark:border-red-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase">Current Title</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{data.title.length} characters</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{data.title.current}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      data.title.status === 'optimal' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      data.title.status === 'too-short' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {data.title.status}
                    </span>
                    {data.title.includesKeyword && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        ✓ Includes Keyword
                      </span>
                    )}
                  </div>
                </div>
                
                {data.title.aiGenerated && data.title.optimized && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-300 dark:border-green-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase flex items-center gap-1">
                        <span>✨</span> AI-Optimized Title
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(data.title.optimized);
                          alert('Title copied to clipboard!');
                        }}
                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">{data.title.optimized}</p>
                    {data.title.suggestions && data.title.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {data.title.suggestions.map((suggestion: string, idx: number) => (
                          <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">• {suggestion}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meta Description */}
          {data.metaDescription && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📝</span> Meta Description Analysis
              </h4>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-300 dark:border-red-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase">Current Description</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{data.metaDescription.length} characters</span>
                  </div>
                  <p className="text-gray-900 dark:text-white">{data.metaDescription.current}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      data.metaDescription.status === 'optimal' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      data.metaDescription.status === 'too-short' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {data.metaDescription.status}
                    </span>
                  </div>
                </div>
                
                {data.metaDescription.aiGenerated && data.metaDescription.optimized && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-300 dark:border-green-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase flex items-center gap-1">
                        <span>✨</span> AI-Optimized Description
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(data.metaDescription.optimized);
                          alert('Description copied to clipboard!');
                        }}
                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-900 dark:text-white">{data.metaDescription.optimized}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Open Graph Tags */}
          {data.ogTags && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🌐</span> Open Graph Tags (Social Media)
              </h4>
              <div className="space-y-3">
                {Object.entries(data.ogTags).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                      og:{key}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      {value.current || value.optimized || 'Not set'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Image Optimization Section
function DetailedImageSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-200 dark:from-green-900/30 dark:to-teal-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Optimization - AI Alt Text</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">All images with AI-generated alt text suggestions</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Image List */}
          {data.images && data.images.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Found {data.images.length} images on your page
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data.images.filter((img: any) => img.aiGenerated).length} images have AI-generated alt text suggestions
                </p>
              </div>

              {data.images.map((image: any, idx: number) => (
                <div key={idx} className={`rounded-lg p-4 border-2 ${
                  image.altQuality === 'good' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
                  image.altQuality === 'poor' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      <img 
                        src={image.src} 
                        alt={image.alt || 'Image preview'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Image #{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          image.altQuality === 'good' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          image.altQuality === 'poor' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {image.altQuality}
                        </span>
                        {image.aiGenerated && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            ✨ AI Suggestion
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 break-all">
                        {image.src}
                      </div>

                      <div className="space-y-2">
                        <div className="bg-white dark:bg-gray-800 rounded p-2">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Current Alt Text:</div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {image.alt || <span className="text-red-500">Missing!</span>}
                          </p>
                        </div>

                        {image.suggestions?.alt && (
                          <div className="bg-white dark:bg-gray-800 rounded p-2 border-2 border-green-300 dark:border-green-700">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs font-semibold text-green-700 dark:text-green-400">✨ AI-Suggested Alt Text:</div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(image.suggestions.alt);
                                  alert('Alt text copied to clipboard!');
                                }}
                                className="px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">{image.suggestions.alt}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Content Optimization Section
function DetailedContentSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/30 dark:to-orange-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Content Optimization - AI Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Readability, structure, and content quality insights</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Readability Analysis */}
          {data.readability && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>📖</span> Readability Analysis
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Word Count</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{data.readability.wordCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sentences</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{data.readability.sentenceCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Sentence</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{data.readability.avgSentenceLength}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Flesch Score</div>
                  <div className={`text-lg font-bold ${
                    parseFloat(data.readability.fleschScore) > 60 ? 'text-green-600 dark:text-green-400' :
                    parseFloat(data.readability.fleschScore) > 30 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>{data.readability.fleschScore}</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Readability Level:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    data.readability.readability === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    data.readability.readability === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {data.readability.readability}
                  </span>
                </div>
              </div>
              {data.readability.aiImprovements && data.readability.aiImprovements.length > 0 && (
                <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">✨ AI Improvements:</div>
                  <ul className="space-y-1">
                    {data.readability.aiImprovements.map((improvement: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Content Structure */}
          {data.structure && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🏗️</span> Content Structure
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">H1 Tags</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.structure.hasH1 ? `✅ ${data.structure.h1Count}` : '❌ 0'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">H2 Tags</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{data.structure.h2Count || 0}</div>
                </div>
              </div>
              {data.structure.issues && data.structure.issues.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Structure Issues:</div>
                  <ul className="space-y-1">
                    {data.structure.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">⚠️</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* AI Suggestions */}
          {data.aiSuggestions && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>✨</span> AI Content Suggestions
              </h4>
              <div className="space-y-3">
                {data.aiSuggestions.intro && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-300 dark:border-purple-700">
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">Suggested Introduction:</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{data.aiSuggestions.intro}</p>
                  </div>
                )}
                {data.aiSuggestions.conclusion && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-300 dark:border-purple-700">
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">Suggested Conclusion:</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{data.aiSuggestions.conclusion}</p>
                  </div>
                )}
                {data.aiSuggestions.headings && data.aiSuggestions.headings.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-300 dark:border-purple-700">
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">Suggested Headings:</div>
                    <div className="flex flex-wrap gap-2">
                      {data.aiSuggestions.headings.map((heading: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                          {heading}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Quality */}
          {data.contentQuality && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>⭐</span> Content Quality Score: {data.contentQuality.score}/100
              </h4>
              <div className="space-y-3">
                {data.contentQuality.strengths && data.contentQuality.strengths.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">✅ Strengths:</div>
                    <ul className="space-y-1">
                      {data.contentQuality.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.contentQuality.weaknesses && data.contentQuality.weaknesses.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">❌ Weaknesses:</div>
                    <ul className="space-y-1">
                      {data.contentQuality.weaknesses.map((weakness: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✗</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Technical SEO Section
function DetailedTechnicalSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Technical SEO - Detailed Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Performance, mobile, accessibility & security</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Performance */}
          {data.performance && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🚀</span> Performance Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    data.performance.score === 'good' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    data.performance.score === 'fair' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {data.performance.score}
                  </span>
                </div>
                {data.performance.issues && data.performance.issues.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">Issues Found:</div>
                    <ul className="space-y-1">
                      {data.performance.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Friendliness */}
          {data.mobile && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>📱</span> Mobile Friendliness
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Viewport:</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {data.mobile.hasViewport ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Responsive:</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {data.mobile.isResponsive ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </div>
                {data.mobile.issues && data.mobile.issues.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Issues:</div>
                    <ul className="space-y-1">
                      {data.mobile.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {data.aiRecommendations && data.aiRecommendations.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>✨</span> AI-Powered Recommendations ({data.aiRecommendations.length})
              </h4>
              <div className="space-y-3">
                {data.aiRecommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-300 dark:border-purple-700">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{rec.issue}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        rec.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        rec.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-green-700 dark:text-green-400">How to Fix:</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{rec.fix}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">Impact:</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{rec.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}


// Validation & Quality Check Section
function DetailedValidationSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Validation & Quality Check</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall SEO quality assessment and compliance</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Overall Quality Score */}
          {data.quality && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>⭐</span> Overall Quality Assessment
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-4xl font-bold mb-2" style={{
                    color: data.quality.score >= 80 ? '#10b981' : 
                           data.quality.score >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {data.quality.score}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    data.quality.grade === 'A' ? 'text-green-600 dark:text-green-400' :
                    data.quality.grade === 'B' ? 'text-blue-600 dark:text-blue-400' :
                    data.quality.grade === 'C' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {data.quality.grade}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Grade</div>
                </div>
              </div>
              
              {data.quality.strengths && data.quality.strengths.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3 border border-green-200 dark:border-green-800">
                  <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">✅ Strengths:</div>
                  <ul className="space-y-1">
                    {data.quality.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.quality.weaknesses && data.quality.weaknesses.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">❌ Weaknesses:</div>
                  <ul className="space-y-1">
                    {data.quality.weaknesses.map((weakness: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">✗</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SEO Compliance */}
          {data.seoCompliance && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🔍</span> SEO Compliance Check
              </h4>
              <div className="space-y-3">
                {data.seoCompliance.critical && data.seoCompliance.critical.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">🚨 Critical Issues:</div>
                    <ul className="space-y-1">
                      {data.seoCompliance.critical.map((issue: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {data.seoCompliance.warnings && data.seoCompliance.warnings.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                    <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">⚠️ Warnings:</div>
                    <ul className="space-y-1">
                      {data.seoCompliance.warnings.map((warning: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {data.aiRecommendations && data.aiRecommendations.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>✨</span> AI-Powered Recommendations ({data.aiRecommendations.length})
              </h4>
              <div className="space-y-3">
                {data.aiRecommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-300 dark:border-purple-700">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white flex-1">{rec.issue}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 ${
                        rec.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        rec.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-200 dark:border-green-800">
                      <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">💡 How to Fix:</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{rec.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consistency Check */}
          {data.consistency && data.consistency.issues && data.consistency.issues.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-5 border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
                <span>🔄</span> Consistency Issues
              </h4>
              <ul className="space-y-2">
                {data.consistency.issues.map((issue: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">⚠️</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Report Generation Section
function DetailedReportSection({ data, isExpanded, onToggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/30 dark:to-rose-800/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">SEO Report Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete analysis summary and recommendations</p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Report Summary */}
          {data.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📋</span> Report Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold mb-2" style={{
                    color: data.summary.overallScore >= 80 ? '#10b981' : 
                           data.summary.overallScore >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {data.summary.overallScore}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {data.summary.totalRecommendations}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Recommendations</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {data.summary.criticalIssues || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</div>
                </div>
              </div>
            </div>
          )}

          {/* URL & Timestamp */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🔗</span> Report Details
            </h4>
            <div className="space-y-2">
              {data.url && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">URL:</span>
                  <span className="text-sm text-gray-900 dark:text-white break-all">{data.url}</span>
                </div>
              )}
              {data.timestamp && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">Generated:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(data.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Key Findings */}
          {data.keyFindings && data.keyFindings.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🔍</span> Key Findings
              </h4>
              <div className="space-y-2">
                {data.keyFindings.map((finding: string, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Actions */}
          {data.priorityActions && data.priorityActions.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🚨</span> Priority Actions Required
              </h4>
              <div className="space-y-3">
                {data.priorityActions.map((action: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white flex-1">{action.title || action}</span>
                      {action.priority && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 ${
                          action.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          action.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {action.priority}
                        </span>
                      )}
                    </div>
                    {action.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Report Button */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-5 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Export Full Report</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download complete SEO analysis as PDF or JSON</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const jsonStr = JSON.stringify(data, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `seo-report-${Date.now()}.json`;
                    a.click();
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  📄 JSON
                </button>
                <button
                  onClick={() => alert('PDF export coming soon!')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  📑 PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
