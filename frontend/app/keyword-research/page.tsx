'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { API_URL } from '../lib/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import YouTubeModal from '../components/YouTubeModal';
import ProtectedRoute from '../components/ProtectedRoute';

function KeywordResearchContent() {
  const [keywords, setKeywords] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // Get YouTube URL from environment variable
  const youtubeUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_YOUTUBE_DEMO_URL || 'https://youtu.be/5OSCU9UTFzA')
    : 'https://youtu.be/5OSCU9UTFzA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keywords.trim()) {
      setError('Please enter at least one keyword');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const getToken = localStorage.getItem("authToken")

      const response = await fetch(`${API_URL}/keyword-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` },
        body: JSON.stringify({ keywords: keywordArray }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Keyword Research
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover high-value keywords with AI-powered research
          </p>
          <div className="mt-6">
            <motion.button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 rounded-xl font-semibold text-base hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Enter Seed Keywords (comma-separated)
            </label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., seo tools, keyword research, content optimization"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900/50 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
              rows={3}
              disabled={loading}
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Researching Keywords...
                </span>
              ) : (
                '🔍 Start Research'
              )}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Research Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-cyan-50 dark:bg-gray-800 rounded-xl border border-cyan-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{results.summary.totalKeywords}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Keywords</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{results.summary.opportunities}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Opportunities</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{results.summary.avgDifficulty}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Difficulty</div>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{results.summary.avgVolume.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Volume</div>
                </div>
              </div>
            </div>

            {/* Top Keywords */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Top Keywords</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Keyword</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Volume</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Difficulty</th>
                      {/* <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Intent</th> */}
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Intent</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.keywords.slice(0, 20).map((kw: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{kw.keyword}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{kw.volume.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            kw.difficulty < 30 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            kw.difficulty < 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {Math.round(kw.difficulty)}
                          </span>
                        </td>
                        {/* <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">${kw.cpc}</td> */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                            {kw.intent}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            kw.opportunity === 'high' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            kw.opportunity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}>
                            {kw.opportunity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">💡 Recommendations</h2>
                <div className="space-y-4">
                  {results.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-cyan-50 dark:bg-gray-800 rounded-xl border border-cyan-200 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {rec.type === 'quick_wins' ? '🎯' : rec.type === 'questions' ? '❓' : rec.type === 'content_cluster' ? '📚' : '📈'}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{rec.message}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.action}</p>
                          {rec.keywords && rec.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {rec.keywords.slice(0, 5).map((kw: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Clusters */}
            {results.clusters && results.clusters.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📚 Keyword Clusters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.clusters.map((cluster: any, idx: number) => (
                    <div key={idx} className="p-5 bg-purple-50 dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                          {cluster.topic}
                        </h3>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                          {cluster.keywords.length} keywords
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Volume:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{cluster.totalVolume.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Avg Difficulty:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{cluster.avgDifficulty}</span>
                        </div>
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                          View keywords ({cluster.keywords.length})
                        </summary>
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                          {cluster.keywords.map((kw: any, i: number) => (
                            <div key={i} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between py-1">
                              <span>{kw.keyword}</span>
                              <span className="text-gray-500 dark:text-gray-500">{kw.volume.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Keywords */}
            {results.questions && results.questions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">❓ Question Keywords</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Perfect for FAQ sections and featured snippets
                </p>
                <div className="space-y-3">
                  {results.questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 bg-green-50 dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{q.keyword}</h3>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Volume: <span className="font-medium text-gray-900 dark:text-white">{q.volume.toLocaleString()}</span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Difficulty: <span className="font-medium text-gray-900 dark:text-white">{q.difficulty}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              q.opportunity === 'high' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {q.opportunity} opportunity
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            {results.trending && (results.trending.rising?.length > 0 || results.trending.emerging?.length > 0 || results.trending.declining?.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📈 Trending Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.trending.rising && results.trending.rising.length > 0 && (
                    <div className="p-5 bg-green-50 dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700">
                      <h3 className="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                        <span>📈</span> Rising
                      </h3>
                      <ul className="space-y-2">
                        {results.trending.rising.map((topic: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {results.trending.emerging && results.trending.emerging.length > 0 && (
                    <div className="p-5 bg-blue-50 dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-gray-700">
                      <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <span>🚀</span> Emerging
                      </h3>
                      <ul className="space-y-2">
                        {results.trending.emerging.map((topic: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {results.trending.declining && results.trending.declining.length > 0 && (
                    <div className="p-5 bg-orange-50 dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-gray-700">
                      <h3 className="font-bold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                        <span>📉</span> Declining
                      </h3>
                      <ul className="space-y-2">
                        {results.trending.declining.map((topic: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Topics */}
            {results.relatedTopics && results.relatedTopics.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🔗 Related Topics</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Expand your content strategy with these related topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.relatedTopics.map((topic: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-indigo-50 dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
      
      {/* YouTube Video Modal */}
      <YouTubeModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={youtubeUrl}
      />
    </div>
  );
}

export default function KeywordResearch() {
  return (
    <ProtectedRoute>
      <KeywordResearchContent />
    </ProtectedRoute>
  );
}
