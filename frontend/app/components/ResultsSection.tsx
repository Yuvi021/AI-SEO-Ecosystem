'use client';

import { useState } from 'react';
import { AGENTS } from '../lib/constants';

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-orange-100 dark:border-orange-900/50 overflow-hidden transition-colors">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Analysis Results
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{totalResults} result{totalResults !== 1 ? 's' : ''} available</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
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
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-orange-600 dark:text-orange-400 break-all">{url}</span>
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
                      className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-orange-100 dark:border-orange-900/50 overflow-hidden hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => toggleCard(cardId)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-xl">
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
                          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-auto">
                            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                          </div>
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
