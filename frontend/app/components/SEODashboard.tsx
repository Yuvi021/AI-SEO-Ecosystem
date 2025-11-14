'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AGENTS } from '../lib/constants';

interface SEODashboardProps {
  results: Record<string, Record<string, any>>;
  url?: string;
}

// Lighthouse Score Card Component
function LighthouseScoreCard({ title, score, icon, description, color }: {
  title: string;
  score: number;
  icon: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const scoreColor = score >= 90 ? 'text-green-600 dark:text-green-400' :
                     score >= 50 ? 'text-orange-600 dark:text-orange-400' :
                     'text-red-600 dark:text-red-400';
  
  const ringColor = score >= 90 ? 'stroke-green-500' :
                    score >= 50 ? 'stroke-orange-500' :
                    'stroke-red-500';
  
  const bgColor = color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                  color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                  'bg-orange-50 dark:bg-orange-900/20';
  
  const borderColor = color === 'blue' ? 'border-blue-200 dark:border-blue-800' :
                      color === 'green' ? 'border-green-200 dark:border-green-800' :
                      color === 'purple' ? 'border-purple-200 dark:border-purple-800' :
                      'border-orange-200 dark:border-orange-800';

  // Calculate stroke-dasharray for circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bgColor} ${borderColor} rounded-xl p-6 border-2 text-center`}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="transform -rotate-90 w-32 h-32">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={ringColor}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${scoreColor}`}>
                {Math.round(score)}
              </div>
            </div>
          </div>
        </div>
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

const agentIcons: Record<string, string> = {
  crawl: '🕷️',
  keyword: '🔑',
  content: '📝',
  schema: '📋',
  technical: '⚙️',
  meta: '🏷️',
  image: '🖼️',
  validation: '✅',
  report: '📊',
};

export default function SEODashboard({ results, url }: SEODashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

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

  // Extract and normalize URL from results if not provided
  const previewUrl = useMemo(() => {
    const normalizeUrl = (urlString: string | null | undefined): string | null => {
      if (!urlString) return null;
      
      // Remove whitespace
      urlString = urlString.trim();
      
      // If it already has protocol, return as is
      if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
        return urlString;
      }
      
      // If it starts with www., add https://
      if (urlString.startsWith('www.')) {
        return `https://${urlString}`;
      }
      
      // If it looks like a domain (contains .), add https://
      if (urlString.includes('.') && !urlString.includes(' ')) {
        return `https://${urlString}`;
      }
      
      return urlString;
    };

    let extractedUrl: string | null = null;
    
    if (url) {
      extractedUrl = normalizeUrl(url);
    } else {
      // Try to extract URL from results
      const firstResult = Object.values(results)[0];
      if (firstResult) {
        const crawlData = firstResult.crawl;
        if (crawlData?.url) {
          extractedUrl = normalizeUrl(crawlData.url);
        }
        
        if (!extractedUrl) {
          const reportData = firstResult.report;
          if (reportData?.url) {
            extractedUrl = normalizeUrl(reportData.url);
          }
        }
      }
      
      // Try to get URL from results keys
      if (!extractedUrl) {
        const urlKeys = Object.keys(results);
        if (urlKeys.length > 0) {
          extractedUrl = normalizeUrl(urlKeys[0]);
        }
      }
    }
    
    return extractedUrl;
  }, [url, results]);

  // Process all results to create dashboard data
  const dashboardData = useMemo(() => {
    const data: any = {
      overallScore: 0,
      lighthouse: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      },
      agents: [],
      totalIssues: 0,
      totalRecommendations: 0,
      allRecommendations: [],
      priorityBreakdown: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      rawResults: results, // Store raw results for detailed views
    };

    // Process each URL's results
    Object.entries(results).forEach(([urlKey, agentResults]) => {
      // Check if we have a report with recommendations
      if (agentResults.report) {
        const report = agentResults.report;
        if (report.recommendations) {
          report.recommendations.forEach((rec: any) => {
            data.allRecommendations.push(rec);
            if (rec.priority === 'critical') data.priorityBreakdown.critical++;
            else if (rec.priority === 'high') data.priorityBreakdown.high++;
            else if (rec.priority === 'medium') data.priorityBreakdown.medium++;
            else if (rec.priority === 'low') data.priorityBreakdown.low++;
          });
        }
        if (report.score) {
          data.overallScore = report.score;
        }
        // Extract Lighthouse scores
        if (report.lighthouse) {
          data.lighthouse = {
            performance: report.lighthouse.performance?.score || 0,
            accessibility: report.lighthouse.accessibility?.score || 0,
            bestPractices: report.lighthouse.bestPractices?.score || 0,
            seo: report.lighthouse.seo?.score || 0
          };
        }
        // Also check summary for lighthouse scores
        if (report.summary?.lighthouse) {
          data.lighthouse = report.summary.lighthouse;
        }
      }

      Object.entries(agentResults).forEach(([agentId, result]) => {
        // Skip report agent as it's already processed
        if (agentId === 'report') return;
        
        const formatted = result?.formatted || result;
        
        if (formatted?.title) {
          const agentData = {
            id: agentId,
            name: AGENTS.find(a => a.id === agentId)?.name || agentId,
            icon: agentIcons[agentId] || '🔧',
            title: formatted.title,
            description: formatted.description,
            status: formatted.status || 'unknown',
            summary: formatted.summary,
            issues: formatted.issues || [],
            recommendations: formatted.recommendations || [],
            contentExamples: formatted.contentExamples || [],
            rawData: result, // Store complete raw data
            score: calculateAgentScore(formatted),
          };

          data.agents.push(agentData);
          data.totalIssues += agentData.issues.length;
          data.totalRecommendations += agentData.recommendations.length;

          // Count by priority
          if (agentData.status === 'needs_attention') {
            if (agentData.issues.length > 3) data.priorityBreakdown.critical++;
            else if (agentData.issues.length > 1) data.priorityBreakdown.high++;
            else data.priorityBreakdown.medium++;
          }
        }
      });
    });

    // Calculate Lighthouse scores if not available from report
    if (data.lighthouse.performance === 0 && data.lighthouse.accessibility === 0 && 
        data.lighthouse.bestPractices === 0 && data.lighthouse.seo === 0) {
      // Fallback: Calculate from agent results
      data.lighthouse = calculateLighthouseScoresFromResults(results);
    }

    // Calculate overall score as weighted average of Lighthouse scores
    // Similar to Google Lighthouse: equal weighting (25% each) for all four categories
    if (data.lighthouse.performance > 0 || data.lighthouse.accessibility > 0 || 
        data.lighthouse.bestPractices > 0 || data.lighthouse.seo > 0) {
      const performance = data.lighthouse.performance || 0;
      const accessibility = data.lighthouse.accessibility || 0;
      const bestPractices = data.lighthouse.bestPractices || 0;
      const seo = data.lighthouse.seo || 0;
      
      // Equal weighting: 25% each category
      data.overallScore = Math.round((performance + accessibility + bestPractices + seo) / 4);
    } else if (data.agents.length > 0) {
      // Fallback: Simple average of agent scores if Lighthouse scores not available
      const totalScore = data.agents.reduce((sum: number, agent: any) => sum + agent.score, 0);
      data.overallScore = Math.round(totalScore / data.agents.length);
    }

    return data;
  }, [results]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'good') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          ✓ Excellent
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
        ⚠ Needs Improvement
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📊 SEO Improvement Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {url || 'Comprehensive analysis of your website'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`${getScoreBgColor(dashboardData.overallScore)} rounded-xl p-6 text-center min-w-[120px]`}>
                <div className={`text-4xl font-bold ${getScoreColor(dashboardData.overallScore)} mb-1`}>
                  {dashboardData.overallScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Score with Website Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            Performance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Score Gauge */}
            <div className="flex flex-col items-center justify-center">
              <LighthouseScoreCard
                title="Performance"
                score={dashboardData.lighthouse.performance}
                icon="⚡"
                description="Website loading speed and Core Web Vitals"
                color="blue"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center max-w-md">
                Values are estimated and may vary. The performance score is calculated directly from these metrics.
              </p>
              {/* Score Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">0-49</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">50-89</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">90-100</span>
                </div>
              </div>
            </div>
            
            {/* Website Preview */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Website Preview</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Note: Many websites block iframe embedding for security. If preview doesn't load, use "Open in new tab".
                  </p>
                </div>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 whitespace-nowrap ml-4"
                  >
                    <span>Open in new tab</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-white">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 dark:bg-gray-800 flex items-center px-3 gap-2 z-10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-700 rounded px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300 truncate">
                    {previewUrl || 'No URL available'}
                  </div>
                </div>
                <div className="pt-8 h-[500px] overflow-hidden relative bg-gray-50 dark:bg-gray-900">
                  {previewUrl ? (
                    <>
                      {isLoadingPreview && !previewError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-20">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
                          </div>
                        </div>
                      )}
                      {previewError ? (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                          <div className="text-center p-6">
                            <div className="text-5xl mb-4">🔒</div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview Unavailable</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 max-w-sm">
                              {previewError.includes('refused') || previewError.includes('Connection refused') 
                                ? 'The website refused to connect. This usually means it blocks iframe embedding for security reasons (X-Frame-Options or Content-Security-Policy headers).'
                                : previewError.includes('blocks iframe') || previewError.includes('X-Frame')
                                ? 'This website blocks embedding in iframes for security reasons (X-Frame-Options or CSP headers).'
                                : previewError}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 max-w-sm">
                              This is a browser security feature and cannot be bypassed. Click the button below to view the website directly.
                            </p>
                            <a
                              href={previewUrl || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
                            >
                              <span>Open Website in New Tab</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <>
                          <iframe
                            key={previewUrl} // Force re-render on URL change
                            src={previewUrl || undefined}
                            className="w-full h-full border-0"
                            title="Website Preview"
                            referrerPolicy="no-referrer-when-downgrade"
                            loading="lazy"
                            onLoad={(e) => {
                              setIsLoadingPreview(false);
                              const iframe = e.target as HTMLIFrameElement;
                              console.log('🔵 [Preview] Iframe onLoad triggered:', previewUrl);
                              
                              // Check if iframe loaded successfully after a delay
                              setTimeout(() => {
                                try {
                                  // Try to access iframe content (will fail if blocked by X-Frame-Options)
                                  if (iframe.contentWindow && iframe.contentDocument) {
                                    const body = iframe.contentDocument.body;
                                    if (body) {
                                      console.log('✅ [Preview] Content loaded successfully');
                                      // Clear any previous errors
                                      setPreviewError(null);
                                    } else {
                                      console.warn('⚠️ [Preview] No body element found');
                                    }
                                  }
                                } catch (error) {
                                  // Cross-origin or X-Frame-Options block - this is expected for many sites
                                  console.warn('⚠️ [Preview] Cross-origin block (expected for many sites):', error);
                                  // Don't set error immediately - let the browser show what it can
                                }
                              }, 2000);
                            }}
                            onError={(e) => {
                              console.error('❌ [Preview] Iframe onError:', e);
                              setIsLoadingPreview(false);
                              setPreviewError('Failed to load preview - website may block iframe embedding');
                              setShowFallbackMessage(true);
                            }}
                          />
                          {/* Fallback: Show message after loading */}
                          {!isLoadingPreview && !previewError && (
                            <div 
                              className="absolute bottom-4 left-4 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200 z-30 pointer-events-none"
                            >
                              <p className="font-semibold mb-1">💡 Preview Note</p>
                              <p>If you see a blank page or error, the website blocks iframe embedding. Click "Open in new tab" above to view it directly.</p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🌐</div>
                        <p>No URL available for preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lighthouse Scores - Similar to Google Lighthouse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Lighthouse Scores
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Accessibility */}
            <LighthouseScoreCard
              title="Accessibility"
              score={dashboardData.lighthouse.accessibility}
              icon="♿"
              description="WCAG compliance and screen reader support"
              color="green"
            />
            {/* Best Practices */}
            <LighthouseScoreCard
              title="Best Practices"
              score={dashboardData.lighthouse.bestPractices}
              icon="✅"
              description="Security, modern web standards, and best practices"
              color="purple"
            />
            {/* SEO */}
            <LighthouseScoreCard
              title="SEO"
              score={dashboardData.lighthouse.seo}
              icon="🔍"
              description="Search engine optimization and discoverability"
              color="orange"
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agents Analyzed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.agents.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Issues</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dashboardData.totalIssues}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recommendations</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardData.totalRecommendations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High Priority</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dashboardData.priorityBreakdown.critical + dashboardData.priorityBreakdown.high}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.agents.map((agent: any, index: number) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Card Header */}
              <div className={`p-6 ${
                agent.status === 'good' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                      {agent.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                      {getStatusBadge(agent.status)}
                    </div>
                  </div>
                  <div className={`${getScoreBgColor(agent.score)} rounded-lg px-3 py-1`}>
                    <div className={`text-lg font-bold ${getScoreColor(agent.score)}`}>
                      {agent.score}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description}</p>
              </div>

              {/* Score Progress Bar */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Performance Score</span>
                  <span className={`text-xs font-bold ${getScoreColor(agent.score)}`}>{agent.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.score}%` }}
                    transition={{ duration: 1, delay: 0.2 * index }}
                    className={`h-2 rounded-full ${
                      agent.score >= 80 ? 'bg-green-500' : agent.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              {/* Issues & Recommendations */}
              <div className="p-6 space-y-4">
                {agent.issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Issues Found ({agent.issues.length})
                    </h4>
                    <ul className="space-y-1">
                      {agent.issues.slice(0, 3).map((issue: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                      {agent.issues.length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-400">
                          +{agent.issues.length - 3} more issues
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {agent.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      How to Improve ({agent.recommendations.length})
                    </h4>
                    <ul className="space-y-1">
                      {agent.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                      {agent.recommendations.length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-400">
                          +{agent.recommendations.length - 3} more recommendations
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {agent.issues.length === 0 && agent.recommendations.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No issues found! Your {agent.name} is optimized.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Improvement Roadmap */}
        {dashboardData.totalIssues > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <span className="text-3xl">🗺️</span>
              Detailed Improvement Roadmap
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Step-by-step guide to fix each issue and improve your website's SEO performance
            </p>
            <div className="space-y-6">
              {dashboardData.agents
                .filter((agent: any) => agent.status === 'needs_attention')
                .map((agent: any, index: number) => (
                  <div key={agent.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    {/* Agent Header */}
                    <div className={`p-5 ${
                      agent.issues.length > 3 
                        ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b-2 border-red-200 dark:border-red-800' 
                        : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-b-2 border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                            {agent.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{agent.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            agent.issues.length > 3 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {agent.issues.length > 3 ? '🔴 High Priority' : '🟡 Medium Priority'}
                          </span>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {agent.issues.length} issue{agent.issues.length !== 1 ? 's' : ''} found
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Issues and Fixes */}
                    <div className="p-6 space-y-4">
                      {agent.issues.map((issue: string, issueIdx: number) => {
                        const recommendation = agent.recommendations[issueIdx] || agent.recommendations[0] || 'Review and fix this issue';
                        const detailedFix = getDetailedFixInstructions(agent.id, issue, agent.summary);
                        
                        // Find matching content example if available
                        const contentExample = agent.contentExamples?.find((ex: any) => {
                          const issueLower = issue.toLowerCase();
                          const exIssueLower = ex.issue.toLowerCase();
                          const exTypeLower = ex.type?.toLowerCase() || '';
                          
                          // Try multiple matching strategies
                          return (
                            exIssueLower.includes(issueLower.split(' ')[0]) ||
                            issueLower.includes(exTypeLower) ||
                            issueLower.includes(exIssueLower.split(' ')[0]) ||
                            exIssueLower.includes(issueLower) ||
                            // Match by keywords
                            (issueLower.includes('missing') && exIssueLower.includes('missing')) ||
                            (issueLower.includes('too') && exIssueLower.includes('too')) ||
                            (issueLower.includes('poor') && exIssueLower.includes('poor'))
                          );
                        }) || agent.contentExamples?.[issueIdx] || agent.contentExamples?.[0];
                        
                        return (
                          <div key={issueIdx} className="border-l-4 border-cyan-500 bg-gray-50 dark:bg-gray-900/50 rounded-r-lg p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}.{issueIdx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  What's Broken:
                                </h4>
                                <p className="text-gray-800 dark:text-gray-200 mb-3">{issue}</p>
                                
                                {/* Before/After Example */}
                                {contentExample && (
                                  <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                      <span className="text-lg">
                                        {contentExample.type === 'title' || contentExample.type === 'meta' ? '🏷️' :
                                         contentExample.type === 'alt' || contentExample.type === 'image' ? '🖼️' :
                                         contentExample.type === 'schema' ? '📋' :
                                         contentExample.type === 'viewport' || contentExample.type === 'https' || contentExample.type === 'performance' ? '⚙️' :
                                         contentExample.type === 'keyword' ? '🔑' :
                                         contentExample.type === 'heading' ? '📑' : '📝'}
                                      </span>
                                      {contentExample.type === 'title' ? 'Title/Meta Tag Example' :
                                       contentExample.type === 'alt' ? 'Image Alt Text Example' :
                                       contentExample.type === 'schema' ? 'Schema Markup Example' :
                                       contentExample.type === 'viewport' || contentExample.type === 'https' ? 'Technical SEO Example' :
                                       contentExample.type === 'keyword' ? 'Keyword Usage Example' :
                                       'Content Improvement Example'}
                                    </h5>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-red-300 dark:border-red-700">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-red-500 font-bold">✗</span>
                                          <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase">Current (Needs Improvement)</span>
                                        </div>
                                        {(contentExample.before.includes('<') || contentExample.before.includes('{')) ? (
                                          <pre className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
{contentExample.before}
                                          </pre>
                                        ) : (
                                          <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                            "{contentExample.before}"
                                          </p>
                                        )}
                                      </div>
                                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-green-300 dark:border-green-700">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-green-500 font-bold">✓</span>
                                          <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">Suggested (SEO Optimized)</span>
                                        </div>
                                        {(contentExample.after.includes('<') || contentExample.after.includes('{')) ? (
                                          <pre className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
{contentExample.after}
                                          </pre>
                                        ) : (
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            "{contentExample.after}"
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                      <p className="text-xs text-blue-800 dark:text-blue-300">
                                        <strong>Why this helps:</strong> {contentExample.reason}
                                        {contentExample.seoImpact && (
                                          <span className="block mt-1"><strong>SEO Impact:</strong> {contentExample.seoImpact}</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-3 border border-green-200 dark:border-green-800">
                                  <h5 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    How to Fix:
                                  </h5>
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                                    {detailedFix && (
                                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <h6 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Detailed Steps:</h6>
                                        <ul className="space-y-2">
                                          {detailedFix.map((step: string, stepIdx: number) => (
                                            <li key={stepIdx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                              <span className="text-cyan-500 mt-1">→</span>
                                              <span>{step}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Additional Content Examples */}
                      {agent.contentExamples && agent.contentExamples.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-xl">💡</span>
                            More Content Improvement Suggestions
                          </h4>
                          <div className="space-y-4">
                            {agent.contentExamples
                              .filter((ex: any) => !agent.issues.some((issue: string) => 
                                issue.toLowerCase().includes(ex.type) || ex.issue.toLowerCase().includes(issue.toLowerCase().split(' ')[0])
                              ))
                              .map((example: any, exIdx: number) => (
                                <div key={exIdx} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">{example.issue}</h5>
                                  <div className="grid md:grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-gray-800 rounded p-3 border border-red-200 dark:border-red-800">
                                      <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Current:</div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{example.before}"</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-200 dark:border-green-800">
                                      <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Suggested:</div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">"{example.after}"</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    {example.reason} {example.seoImpact && `• ${example.seoImpact}`}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary Metrics */}
                    {agent.summary && typeof agent.summary === 'object' && (
                      <div className="px-6 pb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Current Status:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            {Object.entries(agent.summary).slice(0, 4).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-white dark:bg-gray-800 rounded p-2">
                                <div className="text-gray-500 dark:text-gray-400 capitalize text-[10px] mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {typeof value === 'object' ? JSON.stringify(value).substring(0, 20) + '...' : String(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* All Recommendations */}
        {dashboardData.allRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/50 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              All Improvement Recommendations
            </h2>
            <div className="space-y-4">
              {dashboardData.allRecommendations.map((rec: any, index: number) => {
                const priorityColors = {
                  critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
                  high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
                  medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                  low: 'border-green-500 bg-green-50 dark:bg-green-900/20',
                  info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                };
                const priorityLabels = {
                  critical: '🔴 Critical',
                  high: '🟠 High Priority',
                  medium: '🟡 Medium Priority',
                  low: '🟢 Low Priority',
                  info: 'ℹ️ Information',
                };
                
                return (
                  <div
                    key={index}
                    className={`border-l-4 ${priorityColors[rec.priority as keyof typeof priorityColors] || priorityColors.info} rounded-lg p-5`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {priorityLabels[rec.priority as keyof typeof priorityLabels] || rec.priority}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Issue:</h4>
                        <p className="text-gray-700 dark:text-gray-300">{rec.message}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 mt-3">
                        <h4 className="font-semibold text-cyan-700 dark:text-cyan-400 mb-1">💡 How to Fix:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Impact:</strong> {rec.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 rounded-xl shadow-xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">📈 Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">1. Fix Critical Issues</h3>
              <p className="text-sm text-white/90">
                Address {dashboardData.priorityBreakdown.critical + dashboardData.priorityBreakdown.high} high-priority issues first
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">2. Implement Recommendations</h3>
              <p className="text-sm text-white/90">
                Follow the {dashboardData.totalRecommendations || dashboardData.allRecommendations.length} recommendations to improve your SEO score
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">3. Monitor Progress</h3>
              <p className="text-sm text-white/90">
                Re-run analysis after making changes to track improvements
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper function to calculate agent score
function calculateAgentScore(formatted: any): number {
  let score = 100;
  
  // Deduct points for issues
  if (formatted.issues && formatted.issues.length > 0) {
    score -= formatted.issues.length * 10;
  }
  
  // Adjust based on status
  if (formatted.status === 'needs_attention') {
    score -= 20;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// Helper function to calculate Lighthouse scores from results (fallback)
function calculateLighthouseScoresFromResults(results: Record<string, Record<string, any>>): {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
} {
  let performance = 100;
  let accessibility = 100;
  let bestPractices = 100;
  let seo = 100;

  // Process all agent results
  Object.values(results).forEach((agentResults: any) => {
    // Technical SEO affects Performance, Accessibility, Best Practices
    if (agentResults.technical) {
      const tech = agentResults.technical.formatted || agentResults.technical;
      
      // Performance
      if (!tech.mobile?.hasViewport) performance -= 10;
      if (!tech.security?.isHTTPS) {
        performance -= 10;
        bestPractices -= 20;
      }
      
      // Accessibility
      if (tech.accessibility?.imagesWithoutAlt > 0) {
        accessibility -= Math.min(20, tech.accessibility.imagesWithoutAlt * 5);
      }
    }

    // SEO scoring
    if (agentResults.crawl) {
      const crawl = agentResults.crawl.formatted || agentResults.crawl;
      if (!crawl.title) seo -= 15;
      if (!crawl.headings?.h1 || crawl.headings.h1.length === 0) {
        seo -= 15;
        accessibility -= 10;
      }
      if (crawl.headings?.h1?.length > 1) seo -= 10;
      if (!crawl.meta?.viewport) {
        seo -= 10;
        accessibility -= 10;
      }
      if (!crawl.meta?.description) seo -= 8;
    }

    if (agentResults.meta) {
      const meta = agentResults.meta.formatted || agentResults.meta;
      if (meta.title?.length && (meta.title.length < 30 || meta.title.length > 60)) seo -= 5;
      if (meta.metaDescription?.length && 
          (meta.metaDescription.length < 120 || meta.metaDescription.length > 160)) seo -= 5;
    }

    if (agentResults.schema) {
      const schema = agentResults.schema.formatted || agentResults.schema;
      if (!schema.detected || schema.detected.length === 0) seo -= 5;
    }

    if (agentResults.image) {
      const image = agentResults.image.formatted || agentResults.image;
      const totalImages = image.images?.length || 0;
      const imagesWithoutAlt = image.images?.filter((img: any) => !img.hasAlt).length || 0;
      if (totalImages > 0 && imagesWithoutAlt > 0) {
        const altCoverage = ((totalImages - imagesWithoutAlt) / totalImages) * 100;
        if (altCoverage < 80) {
          seo -= 2;
          accessibility -= Math.min(20, imagesWithoutAlt * 5);
        }
      }
    }
  });

  return {
    performance: Math.max(0, Math.min(100, Math.round(performance))),
    accessibility: Math.max(0, Math.min(100, Math.round(accessibility))),
    bestPractices: Math.max(0, Math.min(100, Math.round(bestPractices))),
    seo: Math.max(0, Math.min(100, Math.round(seo)))
  };
}

// Helper function to get detailed fix instructions based on agent type and issue
function getDetailedFixInstructions(agentId: string, issue: string, summary: any): string[] | null {
  const instructions: Record<string, Record<string, string[]>> = {
    crawl: {
      'Missing page title': [
        'Open your HTML file or CMS editor',
        'Locate the <head> section of your page',
        'Add or update: <title>Your Descriptive Page Title Here</title>',
        'Keep title between 30-60 characters',
        'Include your primary keyword in the title',
        'Make it compelling and descriptive for users'
      ],
      'Low word count': [
        'Aim for at least 300 words of quality content',
        'Add more detailed explanations and information',
        'Include relevant examples, case studies, or tips',
        'Expand on your main topics with subtopics',
        'Add FAQ sections or additional context'
      ],
      'Missing H1 heading': [
        'Add a single H1 heading at the top of your main content',
        'Use: <h1>Your Main Heading</h1>',
        'Include your primary keyword in the H1',
        'Make it descriptive and compelling',
        'Ensure it matches or relates to your page title'
      ],
      'Multiple H1 headings found': [
        'Review your page and find all H1 tags',
        'Keep only ONE H1 heading (the main one)',
        'Convert other H1s to H2 or H3 headings',
        'Maintain proper heading hierarchy: H1 → H2 → H3',
        'Use H2 for main sections, H3 for subsections'
      ]
    },
    keyword: {
      'No primary keywords identified': [
        'Research relevant keywords for your content topic',
        'Use tools like Google Keyword Planner or SEMrush',
        'Identify 3-5 primary keywords related to your page',
        'Naturally incorporate keywords in your content',
        'Place keywords in title, headings, and first paragraph',
        'Aim for 1-2% keyword density (not too much!)'
      ],
      'Missing important keywords': [
        'Review the suggested missing keywords',
        'Check if they are relevant to your content',
        'Naturally integrate them into your existing content',
        'Add them to headings, subheadings, or new paragraphs',
        'Ensure they fit contextually and don\'t feel forced'
      ]
    },
    content: {
      'Content is difficult to read': [
        'Break long sentences into shorter ones (15-20 words)',
        'Replace complex words with simpler alternatives',
        'Use shorter paragraphs (3-4 sentences max)',
        'Add bullet points or numbered lists for clarity',
        'Use subheadings to break up text',
        'Read your content aloud to check flow'
      ],
      'Content readability could be improved': [
        'Simplify technical jargon where possible',
        'Use active voice instead of passive voice',
        'Add transition words between sentences',
        'Include examples to illustrate complex concepts',
        'Use shorter, more common words'
      ],
      'Sentences are too long': [
        'Identify sentences over 20 words',
        'Split them into 2-3 shorter sentences',
        'Use commas, semicolons, or periods appropriately',
        'Remove unnecessary words or phrases',
        'Aim for average sentence length of 15-20 words'
      ],
      'Primary keyword not in title': [
        'Review your page title tag',
        'Identify your primary keyword',
        'Rewrite title to include the keyword naturally',
        'Place keyword near the beginning of the title',
        'Keep title under 60 characters',
        'Example: "Primary Keyword - Additional Info | Brand"'
      ]
    },
    technical: {
      'Missing viewport meta tag': [
        'Open your HTML file or CMS template',
        'Locate the <head> section',
        'Add: <meta name="viewport" content="width=device-width, initial-scale=1">',
        'Place it right after the <head> tag',
        'Test on mobile devices to verify responsiveness'
      ],
      'images missing alt text': [
        'Open your HTML editor or CMS',
        'Find each image tag: <img src="...">',
        'Add alt attribute: <img src="..." alt="Descriptive text here">',
        'Write descriptive alt text (5-125 characters)',
        'Describe what the image shows, not just decorative',
        'Include relevant keywords if appropriate'
      ],
      'Not using HTTPS': [
        'Contact your web hosting provider',
        'Purchase an SSL certificate (many hosts offer free ones)',
        'Install the SSL certificate on your server',
        'Update all internal links to use https://',
        'Set up 301 redirects from http:// to https://',
        'Update your site URL in Google Search Console'
      ],
      'Large Contentful Paint (LCP) may be slow': [
        'Optimize images: compress and use WebP format',
        'Reduce server response time (upgrade hosting if needed)',
        'Remove or defer render-blocking JavaScript',
        'Use a Content Delivery Network (CDN)',
        'Enable browser caching',
        'Minimize CSS and JavaScript files'
      ]
    },
    meta: {
      'Title tag is too short': [
        'Review your current title tag',
        'Expand it to 30-60 characters',
        'Add more descriptive information',
        'Include your primary keyword',
        'Make it compelling for click-through',
        'Example: "Best [Keyword] Guide 2025 - Complete Tutorial"'
      ],
      'Title tag is too long': [
        'Check your title length (should be 30-60 chars)',
        'Remove unnecessary words',
        'Keep the most important keywords',
        'Use a pipe (|) to separate sections',
        'Test how it appears in search results',
        'Aim for 50-55 characters for optimal display'
      ],
      'Primary keyword not in title': [
        'Identify your primary keyword',
        'Rewrite title to include it naturally',
        'Place keyword near the beginning',
        'Keep it readable and compelling',
        'Example: "[Primary Keyword] - [Description] | [Brand]"'
      ],
      'Meta description is too short': [
        'Expand your meta description to 120-160 characters',
        'Add more details about what users will find',
        'Include a call-to-action',
        'Mention key benefits or features',
        'Make it compelling to increase click-through rate'
      ],
      'Meta description is too long': [
        'Shorten to 120-160 characters',
        'Remove unnecessary words',
        'Keep the most important information',
        'End with a call-to-action',
        'Test how it appears in search results'
      ]
    },
    schema: {
      'No structured data (schema markup) found': [
        'Identify what type of content you have (Article, Product, FAQ, etc.)',
        'Visit schema.org to find the appropriate schema type',
        'Use Google\'s Structured Data Markup Helper tool',
        'Add JSON-LD schema to your page\'s <head> section',
        'Validate using Google\'s Rich Results Test',
        'Common schemas: Organization, Article, BreadcrumbList, FAQPage'
      ]
    },
    image: {
      'images missing alt text': [
        'Open your HTML editor or CMS',
        'Find each image without alt text',
        'Add descriptive alt attribute to each image',
        'Write 5-125 characters describing the image',
        'Be specific: "Woman using laptop at coffee shop" not just "laptop"',
        'Include relevant keywords if they fit naturally'
      ],
      'images have poor quality alt text': [
        'Review existing alt text on your images',
        'Ensure each is 5-125 characters long',
        'Make them descriptive and specific',
        'Remove generic text like "image1" or "photo"',
        'Describe what\'s actually in the image',
        'Include context when relevant'
      ]
    },
    validation: {
      'Content quality score is low': [
        'Review all identified issues in this report',
        'Address readability problems first',
        'Improve content structure and organization',
        'Add more valuable, original content',
        'Fix technical SEO issues',
        'Re-run analysis after making changes'
      ],
      'Content may not be unique': [
        'Review your content for duplicate text',
        'Rewrite any copied content in your own words',
        'Add original insights, examples, or analysis',
        'Check for duplicate content across your site',
        'Use tools like Copyscape to check uniqueness',
        'Create original, valuable content for users'
      ]
    }
  };

  // Try to find exact match
  if (instructions[agentId] && instructions[agentId][issue]) {
    return instructions[agentId][issue];
  }

  // Try partial match
  for (const [key, value] of Object.entries(instructions[agentId] || {})) {
    if (issue.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(issue.toLowerCase().split(' ')[0])) {
      return value;
    }
  }

  // Return generic instructions if no match
  return [
    'Review the issue description carefully',
    'Research best practices for this SEO aspect',
    'Make the necessary changes to your website',
    'Test the changes to ensure they work correctly',
    'Re-run the SEO analysis to verify improvements'
  ];
}

