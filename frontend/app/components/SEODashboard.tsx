'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AGENTS } from '../lib/constants';

interface SEODashboardProps {
  results: Record<string, Record<string, any>>;
  url?: string;
  progress?: number;
}

// Lighthouse Score Card Component
function LighthouseScoreCard({ title, score, icon, description, color, progress = 100 }: {
  title: string;
  score: number;
  icon: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  progress?: number;
}) {
  const scoreColor = score >= 90 ? 'text-green-600 dark:text-green-400' :
    score >= 50 ? 'text-orange-600 dark:text-orange-400' :
      'text-red-600 dark:text-red-400';

  const ringColor = score >= 90 ? 'stroke-green-500' :
    score >= 50 ? 'stroke-orange-500' :
      'stroke-red-500';

  const bgColor = color === 'blue' ? 'bg-blue-50 dark:bg-gray-800' :
    color === 'green' ? 'bg-green-50 dark:bg-gray-800' :
      color === 'purple' ? 'bg-purple-50 dark:bg-gray-800' :
        'bg-orange-50 dark:bg-gray-800';

  const borderColor = color === 'blue' ? 'border-blue-200 dark:border-gray-700' :
    color === 'green' ? 'border-green-200 dark:border-gray-700' :
      color === 'purple' ? 'border-purple-200 dark:border-gray-700' :
        'border-orange-200 dark:border-gray-700';

  // Calculate stroke-dasharray for circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = progress >= 100 ? circumference - (score / 100) * circumference : circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bgColor} ${borderColor} rounded-xl p-6 border text-center`}
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
              <div className={`text-3xl font-bold ${progress >= 100 && score > 0 ? scoreColor : 'text-gray-400 dark:text-gray-500'}`}>
                {progress >= 100 && score > 0 ? Math.round(score) : '--'}
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

export default function SEODashboard({ results, url, progress = 100 }: SEODashboardProps) {
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
    if (score >= 80) return 'bg-green-100 dark:bg-gray-700';
    if (score >= 60) return 'bg-yellow-100 dark:bg-gray-700';
    return 'bg-red-100 dark:bg-gray-700';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'good') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-gray-700 text-green-700 dark:text-green-400">
          ✓ Excellent
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-gray-700 text-yellow-700 dark:text-yellow-400">
        ⚠ Needs Improvement
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
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
                {progress >= 100 ? (
                  <>
                    <div className={`text-4xl font-bold ${getScoreColor(dashboardData.overallScore)} mb-1`}>
                      {dashboardData.overallScore}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-400 dark:text-gray-500 mb-1">
                      --
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Score with Website Preview */}
        {/* Lighthouse Scores - Combined Performance & All Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Lighthouse Scores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Performance */}
            <LighthouseScoreCard
              title="Performance"
              score={dashboardData.lighthouse.performance}
              icon="⚡"
              description="Website loading speed and Core Web Vitals"
              color="blue"
              progress={progress}
            />
            {/* Accessibility */}
            <LighthouseScoreCard
              title="Accessibility"
              score={dashboardData.lighthouse.accessibility}
              icon="♿"
              description="WCAG compliance and screen reader support"
              color="green"
              progress={progress}
            />
            {/* Best Practices */}
            <LighthouseScoreCard
              title="Best Practices"
              score={dashboardData.lighthouse.bestPractices}
              icon="✅"
              description="Security, modern web standards, and best practices"
              color="purple"
              progress={progress}
            />
            {/* SEO */}
            <LighthouseScoreCard
              title="SEO"
              score={dashboardData.lighthouse.seo}
              icon="🔍"
              description="Search engine optimization and discoverability"
              color="orange"
              progress={progress}
            />
          </div>

          {/* Score Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">0-49 Poor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-400">50-89 Needs Improvement</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">90-100 Good</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Values are estimated and may vary. Scores are calculated based on Google Lighthouse metrics.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agents Analyzed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.agents.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Issues</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dashboardData.totalIssues}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recommendations</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardData.totalRecommendations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High Priority</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dashboardData.priorityBreakdown.critical + dashboardData.priorityBreakdown.high}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Card Header */}
              <div className={`p-6 ${agent.status === 'good'
                  ? 'bg-green-50 dark:bg-green-900/10'
                  : 'bg-yellow-50 dark:bg-yellow-900/10'
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
                    <div className={`text-lg font-bold ${progress >= 100 ? getScoreColor(agent.score) : 'text-gray-400 dark:text-gray-500'}`}>
                      {progress >= 100 ? agent.score : '--'}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description}</p>
              </div>

              {/* Score Progress Bar */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Performance Score</span>
                  <span className={`text-xs font-bold ${progress >= 100 ? getScoreColor(agent.score) : 'text-gray-400 dark:text-gray-500'}`}>
                    {progress >= 100 ? `${agent.score}/100` : '--/100'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: progress >= 100 ? `${agent.score}%` : '0%' }}
                    transition={{ duration: 1, delay: 0.2 * index }}
                    className={`h-2 rounded-full ${progress >= 100 ? (agent.score >= 80 ? 'bg-green-500' : agent.score >= 60 ? 'bg-yellow-500' : 'bg-red-500') : 'bg-gray-400 dark:bg-gray-500'
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


        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-600 dark:bg-blue-800 rounded-xl shadow-lg border border-blue-700 dark:border-blue-900 p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">📈 Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 dark:bg-white/5 rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold mb-2">1. Fix Critical Issues</h3>
              <p className="text-sm text-white/90">
                Address {dashboardData.priorityBreakdown.critical + dashboardData.priorityBreakdown.high} high-priority issues first
              </p>
            </div>
            <div className="bg-white/10 dark:bg-white/5 rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold mb-2">2. Implement Recommendations</h3>
              <p className="text-sm text-white/90">
                Follow the {dashboardData.totalRecommendations || dashboardData.allRecommendations.length} recommendations to improve your SEO score
              </p>
            </div>
            <div className="bg-white/10 dark:bg-white/5 rounded-lg p-4 border border-white/20">
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

