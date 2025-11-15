'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_URL } from '../lib/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [targetLength, setTargetLength] = useState(1500);
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('general');
  const [background, setBackground] = useState('');
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [includeFAQ, setIncludeFAQ] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'seo' | 'keywords'>('preview');

  const toneOptions = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'friendly', label: 'Friendly', icon: '🤝' },
    { value: 'authoritative', label: 'Authoritative', icon: '🎓' },
    { value: 'conversational', label: 'Conversational', icon: '💬' },
  ];

  const audienceOptions = [
    { value: 'general', label: 'General Audience' },
    { value: 'beginners', label: 'Beginners' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'experts', label: 'Experts' },
    { value: 'business', label: 'Business Professionals' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
      
      const response = await fetch(`${API_URL}/generate-blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keywords: keywordArray,
          targetLength,
          tone,
          targetAudience,
          background,
          includeIntro,
          includeConclusion,
          includeFAQ
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        setActiveTab('preview');
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadAsMarkdown = () => {
    if (!results) return;
    
    let markdown = `# ${results.content.title}\n\n`;
    markdown += `${results.content.introduction}\n\n`;
    
    results.content.body.forEach((section: any) => {
      markdown += `## ${section.heading}\n\n`;
      markdown += `${section.content}\n\n`;
      
      if (section.subsections) {
        section.subsections.forEach((sub: any) => {
          markdown += `### ${sub.heading}\n\n`;
          markdown += `${sub.content}\n\n`;
        });
      }
    });
    
    markdown += `## Conclusion\n\n${results.content.conclusion}\n\n`;
    
    if (results.content.faq && results.content.faq.length > 0) {
      markdown += `## FAQ\n\n`;
      results.content.faq.forEach((item: any) => {
        markdown += `**${item.question}**\n\n${item.answer}\n\n`;
      });
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
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
              AI Blog Generator
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Generate SEO-optimized blog posts with AI-powered content analysis
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Blog Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Best AI Tools For Blogging"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900/50 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., ai tools, blogging, content creation"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900/50 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Writing Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-600 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  disabled={loading}
                >
                  {toneOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-600 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  disabled={loading}
                >
                  {audienceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Word Count Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Word Count: {targetLength}
              </label>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={targetLength}
                onChange={(e) => setTargetLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                disabled={loading}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>500</span>
                <span>1500</span>
                <span>3000</span>
              </div>
            </div>

            {/* Background Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Background Information (Optional)
              </label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Any specific facts, statistics, or information to include..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900/50 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeIntro}
                  onChange={(e) => setIncludeIntro(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Introduction</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeConclusion}
                  onChange={(e) => setIncludeConclusion(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Conclusion</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFAQ}
                  onChange={(e) => setIncludeFAQ(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include FAQ Section</span>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Blog Post...
                </span>
              ) : (
                '✨ Generate Blog Post'
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
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => copyToClipboard(JSON.stringify(results.content, null, 2))}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                📋 Copy JSON
              </button>
              <button
                onClick={downloadAsMarkdown}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                ⬇️ Download Markdown
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    📝 Blog Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === 'seo'
                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    📊 SEO Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('keywords')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === 'keywords'
                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    🔑 Keywords
                  </button>
                </div>
              </div>

              <div className="p-8">
                {/* Blog Preview Tab */}
                {activeTab === 'preview' && (
                  <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {results.content.title}
                    </h1>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 not-prose">
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {results.content.metaDescription}
                      </p>
                    </div>

                    {results.content.introduction && (
                      <div className="mb-8">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {results.content.introduction}
                        </ReactMarkdown>
                      </div>
                    )}

                    {results.content.body.map((section: any, idx: number) => (
                      <div key={idx} className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          {section.heading}
                        </h2>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {section.content}
                        </ReactMarkdown>
                        
                        {section.subsections && section.subsections.map((sub: any, subIdx: number) => (
                          <div key={subIdx} className="mt-6 ml-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                              {sub.heading}
                            </h3>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {sub.content}
                            </ReactMarkdown>
                          </div>
                        ))}
                      </div>
                    ))}

                    {results.content.conclusion && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          Conclusion
                        </h2>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {results.content.conclusion}
                        </ReactMarkdown>
                      </div>
                    )}

                    {results.content.faq && results.content.faq.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                          {results.content.faq.map((item: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg not-prose">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {item.question}
                              </h3>
                              <div className="prose dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {item.answer}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SEO Analysis Tab */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    {/* Quality Score */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Content Quality Score</h3>
                        <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                          {results.contentQuality.score}/100
                        </div>
                      </div>
                      
                      {results.contentQuality.strengths.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ Strengths:</h4>
                          <ul className="space-y-1">
                            {results.contentQuality.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm">• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {results.contentQuality.improvements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">⚠️ Improvements:</h4>
                          <ul className="space-y-1">
                            {results.contentQuality.improvements.map((improvement: string, idx: number) => (
                              <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm">• {improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* SEO Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                          {results.seoAnalysis.wordCount}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Word Count</div>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {results.seoAnalysis.readabilityScore}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Readability</div>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {results.seoAnalysis.headingStructure.h2}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">H2 Headings</div>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {results.seoAnalysis.headingStructure.h3}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">H3 Headings</div>
                      </div>
                    </div>

                    {/* Keyword Density */}
                    {Object.keys(results.seoAnalysis.keywordDensity).length > 0 && (
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Keyword Density</h3>
                        <div className="space-y-3">
                          {Object.entries(results.seoAnalysis.keywordDensity).map(([keyword, data]: [string, any]) => (
                            <div key={keyword} className="flex items-center justify-between">
                              <span className="text-gray-700 dark:text-gray-300">{keyword}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {data.count} times ({data.density}%)
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  data.status === 'optimal' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                  data.status === 'too_low' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}>
                                  {data.status === 'optimal' ? 'Optimal' : data.status === 'too_low' ? 'Too Low' : 'Too High'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {results.seoAnalysis.recommendations.length > 0 && (
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">SEO Recommendations</h3>
                        <div className="space-y-3">
                          {results.seoAnalysis.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{rec.message}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.action}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords Tab */}
                {activeTab === 'keywords' && (
                  <div className="space-y-6">
                    {/* Primary Keywords */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Primary Keywords Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {results.keywordAnalysis.primaryKeywords.map((kw: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Keywords */}
                    {results.keywordAnalysis.secondaryKeywords.length > 0 && (
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Secondary Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {results.keywordAnalysis.secondaryKeywords.map((kw: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Keywords */}
                    {results.keywordAnalysis.relatedKeywords.length > 0 && (
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Keywords Found</h3>
                        <div className="flex flex-wrap gap-2">
                          {results.keywordAnalysis.relatedKeywords.map((kw: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Keywords */}
                    {results.keywordAnalysis.missingKeywords.length > 0 && (
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Missing Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {results.keywordAnalysis.missingKeywords.map((kw: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                              ✗ {kw}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          Consider adding these keywords to improve SEO coverage
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
