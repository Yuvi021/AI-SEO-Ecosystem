'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AgentSelection from '../components/AgentSelection';
import ProgressSection from '../components/ProgressSection';
import ResultsSection from '../components/ResultsSection';
import SEODashboard from '../components/SEODashboard';
import DetailedDataSections from '../components/DetailedDataSections';
import ThemeToggle from '../components/ThemeToggle';
import ProtectedRoute from '../components/ProtectedRoute';
import { AGENTS, API_URL } from '../lib/constants';

function AnalyzePageContent() {
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'detailed' | 'dashboard' | 'combined'>('dashboard');
  const [openAIError, setOpenAIError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    setOpenAIError(null);

    // Close previous connection if exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const isSitemap = isSitemapURL(url);
    const getToken = localStorage.getItem("authToken")
    const params = new URLSearchParams({
      url: url,
      agents: selectedAgents.join(','),
      isSitemap: isSitemap.toString(),
      token: `Bearer ${getToken}`
    });

    // Connect directly to backend API
    const eventSource = new EventSource(
      `${API_URL}/analyze-stream?${params}`,
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
        if (result || data.formatted) {
          const urlKey = result?.url || data.url || 'default';
          setResults(prev => ({
            ...prev,
            [urlKey]: {
              ...prev[urlKey],
              [agent]: {
                ...result,
                formatted: data.formatted
              },
            },
          }));
        }
        break;

      case 'agent_error': {
        const errorMessage = message || 'Unknown error occurred';
        const isOpenAIError = errorMessage.toLowerCase().includes('openai') || 
                              errorMessage.toLowerCase().includes('openrouter') ||
                              errorMessage.toLowerCase().includes('api key') ||
                              errorMessage.toLowerCase().includes('required');
        
        if (isOpenAIError) {
          const errorMsg = `⚠️ ${agent} requires OpenRouter API key: ${errorMessage}`;
          addLogEntry('error', errorMsg);
          setOpenAIError(errorMsg);
        } else {
          addLogEntry('error', `${agent} failed: ${errorMessage}`);
        }
        break;
      }

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

      case 'error': {
        const errorMsg = message || 'An error occurred during analysis';
        const isOpenAIError = errorMsg.toLowerCase().includes('openai') || 
                              errorMsg.toLowerCase().includes('openrouter') ||
                              errorMsg.toLowerCase().includes('api key') ||
                              errorMsg.toLowerCase().includes('required');
        
        if (isOpenAIError) {
          const errorMessage = `⚠️ OpenRouter API key is required. Please set OPENROUTER_API_KEY environment variable on the server.`;
          addLogEntry('error', errorMessage);
          setOpenAIError(errorMessage);
        } else {
          addLogEntry('error', `Error: ${errorMsg}`);
        }
        setIsAnalyzing(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        break;
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 transition-colors duration-300 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
          }}
        ></motion.div>
        <motion.div 
          className="absolute w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{
            right: `${mousePosition.x / 25}px`,
            bottom: `${mousePosition.y / 25}px`,
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        ></motion.div>
      </div>

      {/* AI Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#60a5fa08_1px,transparent_1px),linear-gradient(to_bottom,#60a5fa08_1px,transparent_1px)] pointer-events-none z-0"></div>

      {/* Header */}
      <motion.header 
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-cyan-100/50 dark:border-cyan-900/30 sticky top-0 z-50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                <motion.div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-2"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image src="/logo.svg" alt="AI SEO Ecosystem" width={56} height={56} className="w-full h-full object-contain" />
                </motion.div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                    AI SEO Ecosystem
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Analysis Dashboard</p>
                </div>
              </Link>
            </motion.div>
            <div className="flex items-center gap-4">
              <motion.div 
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">System Ready</span>
              </motion.div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            SEO Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a URL or sitemap to analyze with AI-powered agents
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* URL Input Card */}
            <motion.div 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/30 dark:to-blue-800/30 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </motion.div>
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
                      className="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-white rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 text-base transition-all"
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
                  
                  <motion.button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing || !url.trim()}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: isAnalyzing || !url.trim() ? 1 : 1.02, y: isAnalyzing || !url.trim() ? 0 : -2 }}
                    whileTap={{ scale: isAnalyzing || !url.trim() ? 1 : 0.98 }}
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
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Agent Selection Card */}
            <motion.div 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="p-6">
                <AgentSelection
                  selectedAgents={selectedAgents}
                  onSelectionChange={setSelectedAgents}
                  disabled={isAnalyzing}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Stats / Info */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Selected Agents</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
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
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}>
                    {isAnalyzing ? 'Analyzing' : 'Ready'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div 
              className="bg-gradient-to-br from-cyan-50/80 to-blue-50/60 dark:from-cyan-900/20 dark:to-blue-800/10 rounded-2xl border border-cyan-200 dark:border-cyan-900/50 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-start gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tips</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>Enter a single URL or sitemap URL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>Select agents based on your needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>Watch real-time progress updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* OpenAI Error Banner */}
        {openAIError && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                    OpenRouter API Key Required
                  </h3>
                  <p className="text-red-800 dark:text-red-400 mb-4">
                    {openAIError}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">To fix this:</p>
                    <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Set the <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">OPENROUTER_API_KEY</code> environment variable on your server</li>
                      <li>Restart the backend server</li>
                      <li>Try the analysis again</li>
                    </ol>
                  </div>
                </div>
                <button
                  onClick={() => setOpenAIError(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Section */}
        {(isAnalyzing || logEntries.length > 0) && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProgressSection
              progress={progress}
              progressMessage={progressMessage}
              logEntries={logEntries}
            />
          </motion.div>
        )}

        {/* View Mode Toggle */}
        {Object.keys(results).length > 0 && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">View Report</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose how you want to view your SEO analysis results</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'dashboard'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📊 Dashboard
                  </button>
                  <button
                    onClick={() => setViewMode('combined')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'combined'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    🔍 Complete Data
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'detailed'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📋 Raw Data
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {viewMode === 'dashboard' ? (
              <SEODashboard results={results} url={url} />
            ) : viewMode === 'combined' ? (
              <div className="space-y-6">
                <DetailedDataSections results={results} />
                <SEODashboard results={results} url={url} />
              </div>
            ) : (
              <ResultsSection results={results} />
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!isAnalyzing && logEntries.length === 0 && Object.keys(results).length === 0 && (
          <motion.div 
            className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-12 h-12 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to Analyze</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Enter a website URL or sitemap URL above and select the AI agents you want to run. 
                Get comprehensive SEO insights in real-time.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <motion.span 
                  className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  🔍 SEO Analysis
                </motion.span>
                <motion.span 
                  className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  📊 Real-time Progress
                </motion.span>
                <motion.span 
                  className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  📈 Detailed Reports
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <motion.footer 
        className="mt-16 py-8 border-t border-cyan-100/50 dark:border-cyan-900/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-1.5">
                <Image src="/logo.svg" alt="AI SEO Ecosystem" width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">AI SEO Ecosystem</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent Intelligence</p>
              </div>
            </motion.div>
            <motion.p 
              className="text-xs text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              © 2025 AI SEO Ecosystem. All rights reserved.
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <ProtectedRoute>
      <AnalyzePageContent />
    </ProtectedRoute>
  );
}
