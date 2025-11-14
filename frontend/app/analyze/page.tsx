'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AgentSelection from '../components/AgentSelection';
import ProgressSection from '../components/ProgressSection';
import ResultsSection from '../components/ResultsSection';
import ThemeToggle from '../components/ThemeToggle';
import { AGENTS, API_URL } from '../lib/constants';

export default function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    AGENTS.map(agent => agent.id)
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [logEntries, setLogEntries] = useState<Array<{
    type: string;
    message: string;
    timestamp: string;
  }>>([]);
  const [results, setResults] = useState<Record<string, any>>({});
  const eventSourceRef = useRef<EventSource | null>(null);

  const isSitemapURL = (url: string) => {
    return url.toLowerCase().includes('sitemap') || 
           url.toLowerCase().endsWith('.xml') ||
           url.toLowerCase().includes('/sitemap');
  };

  const addLogEntry = (type: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogEntries(prev => [...prev, { type, message, timestamp }]);
  };

  const handleStartAnalysis = () => {
    if (!url.trim()) {
      alert('Please enter a URL or sitemap URL');
      return;
    }

    if (selectedAgents.length === 0) {
      alert('Please select at least one agent');
      return;
    }

    // Reset state
    setIsAnalyzing(true);
    setProgress(0);
    setProgressMessage('Initializing...');
    setLogEntries([]);
    setResults({});

    // Close previous connection if exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const isSitemap = isSitemapURL(url);
    const params = new URLSearchParams({
      url: url,
      agents: selectedAgents.join(','),
      isSitemap: isSitemap.toString(),
    });

    // Connect directly to backend API
    const eventSource = new EventSource(
      `${API_URL}/analyze-stream?${params}`
    );

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleStreamEvent(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      addLogEntry('error', 'Connection error. Retrying...');
    };
  };

  const handleStreamEvent = (data: any) => {
    const { type, message, progress, agent, result, taskId } = data;

    switch (type) {
      case 'progress':
        setProgress(progress || 0);
        setProgressMessage(message || '');
        addLogEntry('info', message);
        break;

      case 'agent_start':
        addLogEntry('info', `Starting ${agent}...`);
        break;

      case 'agent_complete':
        addLogEntry('success', `${agent} completed`);
        if (result) {
          const urlKey = result.url || data.url || 'default';
          setResults(prev => ({
            ...prev,
            [urlKey]: {
              ...prev[urlKey],
              [agent]: result,
            },
          }));
        }
        break;

      case 'agent_error':
        addLogEntry('error', `${agent} failed: ${message}`);
        break;

      case 'url_processing':
        addLogEntry('info', `Processing URL: ${message}`);
        break;

      case 'sitemap_parsed':
        addLogEntry('success', `Sitemap parsed: Found ${message} URL(s) to analyze`);
        break;

      case 'complete':
        addLogEntry('success', 'Analysis complete!');
        setProgress(100);
        setProgressMessage('Analysis complete');
        setIsAnalyzing(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        break;

      case 'error':
        addLogEntry('error', `Error: ${message}`);
        setIsAnalyzing(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        break;
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-orange-100/50 dark:border-orange-900/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                🤖
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                  AI SEO Ecosystem
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Analysis Dashboard</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">System Ready</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            SEO Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a URL or sitemap to analyze with AI-powered agents
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* URL Input Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Website URL</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter URL or sitemap to analyze</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      id="urlInput"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com or https://example.com/sitemap.xml"
                      className="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-white rounded-xl focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 text-base transition-all"
                      disabled={isAnalyzing}
                      onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleStartAnalysis()}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    {url && (
                      <button
                        onClick={() => setUrl('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing || !url.trim()}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Start Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Selection Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl">
              <div className="p-6">
                <AgentSelection
                  selectedAgents={selectedAgents}
                  onSelectionChange={setSelectedAgents}
                  disabled={isAnalyzing}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats / Info */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Selected Agents</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {selectedAgents.length}/{AGENTS.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Results</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {Object.keys(results).length > 0 
                      ? Object.values(results).reduce((sum, r) => sum + Object.keys(r).length, 0)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                    isAnalyzing 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}>
                    {isAnalyzing ? 'Analyzing' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-2xl border border-orange-200 dark:border-orange-900/50 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500 dark:bg-orange-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tips</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Enter a single URL or sitemap URL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Select agents based on your needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Watch real-time progress updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {(isAnalyzing || logEntries.length > 0) && (
          <div className="mt-6 animate-fade-in">
            <ProgressSection
              progress={progress}
              progressMessage={progressMessage}
              logEntries={logEntries}
            />
          </div>
        )}

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <div className="mt-6 animate-fade-in">
            <ResultsSection results={results} />
          </div>
        )}

        {/* Empty State */}
        {!isAnalyzing && logEntries.length === 0 && Object.keys(results).length === 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to Analyze</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Enter a website URL or sitemap URL above and select the AI agents you want to run. 
                Get comprehensive SEO insights in real-time.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium">
                  🔍 SEO Analysis
                </span>
                <span className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium">
                  📊 Real-time Progress
                </span>
                <span className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium">
                  📈 Detailed Reports
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">AI SEO Ecosystem</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent Intelligence</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 AI SEO Ecosystem. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
