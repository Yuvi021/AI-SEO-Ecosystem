'use client';

import { useState } from 'react';
import { AGENTS } from '../lib/constants';

// Component to display formatted agent results
function AgentResultDisplay({ result, agentId }: { result: any; agentId: string }) {
  // Check if we have formatted data
  const formatted = result?.formatted || result;
  
  // If it's already formatted (has title, description, etc.)
  if (formatted?.title && formatted?.description) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {formatted.title}
          </h5>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatted.description}
          </p>
        </div>

        {/* Summary */}
        {formatted.summary && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Summary
            </h6>
            <div className="space-y-2 text-sm">
              {typeof formatted.summary === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(formatted.summary).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium text-right ml-4">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white">{formatted.summary}</p>
              )}
            </div>
          </div>
        )}

        {/* Issues */}
        {formatted.issues && formatted.issues.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <h6 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Issues Found
            </h6>
            <ul className="space-y-2">
              {formatted.issues.map((issue: string, idx: number) => (
                <li key={idx} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {formatted.recommendations && formatted.recommendations.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h6 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Fix
            </h6>
            <ul className="space-y-2">
              {formatted.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status Badge */}
        {formatted.status && (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              formatted.status === 'good' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              {formatted.status === 'good' ? '✓ All Good' : '⚠ Needs Attention'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback to JSON display for unformatted results
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-auto">
      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

interface ResultsSectionProps {
  results: Record<string, Record<string, any>>;
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

export default function ResultsSection({ results }: ResultsSectionProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const getAgentDisplayName = (agentId: string) => {
    const agent = AGENTS.find(a => a.id === agentId);
    return agent ? agent.name : agentId;
  };

  const expandAll = () => {
    const allCardIds = new Set<string>();
    Object.entries(results).forEach(([url, agentResults]) => {
      Object.keys(agentResults).forEach(agentId => {
        allCardIds.add(`${url}-${agentId}`);
      });
    });
    setExpandedCards(allCardIds);
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  const totalResults = Object.values(results).reduce((sum, agentResults) => sum + Object.keys(agentResults).length, 0);

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden transition-colors">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
              <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Analysis Results
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{totalResults} result{totalResults !== 1 ? 's' : ''} available</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {Object.entries(results).map(([url, agentResults]) => (
            <div key={url} className="animate-fade-in">
              {Object.keys(results).length > 1 && (
                <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-cyan-600 dark:text-cyan-400 break-all">{url}</span>
                  </h4>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(agentResults).map(([agentId, result]) => {
                  const cardId = `${url}-${agentId}`;
                  const isExpanded = expandedCards.has(cardId);
                  const icon = agentIcons[agentId] || '🔧';
                  
                  return (
                    <div
                      key={cardId}
                      className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => toggleCard(cardId)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-xl">
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                                {getAgentDisplayName(agentId)}
                              </h4>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Completed
                              </span>
                            </div>
                          </div>
                          <button className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg 
                              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 animate-fade-in">
                          <AgentResultDisplay result={result} agentId={agentId} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
