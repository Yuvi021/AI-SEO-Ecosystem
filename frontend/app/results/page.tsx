'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { API_URL } from '../lib/constants';
import SEODashboard from '../components/SEODashboard';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '../components/ThemeToggle';

interface ResultItem {
  url: string;
  version: number;
  cloudinaryUrl: string;
  createdAt: string;
}

interface ResultsResponse {
  userId: string;
  results: ResultItem[];
  url?: string;
}

export default function ResultsPage() {
  const { isAuthenticated, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [allUrls, setAllUrls] = useState<string[]>([]); // List of all URLs from initial call
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [urlVersions, setUrlVersions] = useState<ResultItem[]>([]); // Versions for selected URL
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [versionDetails, setVersionDetails] = useState<any>(null);
  const [selectedVersionCloudinaryUrl, setSelectedVersionCloudinaryUrl] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please login to view results');
      setLoading(false);
      return;
    }

    fetchResults();
  }, [isAuthenticated, token]);

  // Initial call: Get all URLs (without url parameter)
  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/results');
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data: ResultsResponse = await response.json();
      
      // Extract unique URLs from results
      const uniqueUrls = Array.from(new Set(data.results.map(item => item.url)));
      setAllUrls(uniqueUrls);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  // Fetch versions for a specific URL
  const fetchUrlVersions = async (url: string) => {
    try {
      setLoadingVersions(true);
      setError('');
      
      const encodedUrl = encodeURIComponent(url);
      const response = await api.get(`/results?url=${encodedUrl}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL versions');
      }

      const data: ResultsResponse = await response.json();
      setUrlVersions(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load URL versions');
    } finally {
      setLoadingVersions(false);
    }
  };

  // Fetch specific version details
  const fetchVersionDetails = async (url: string, version: number) => {
    try {
      setLoadingDetails(true);
      setError('');
      
      const encodedUrl = encodeURIComponent(url);
      const response = await api.get(`/results?url=${encodedUrl}&version=${version}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch version details');
      }

      const data: ResultsResponse = await response.json();
      
      // The API returns metadata, we need to fetch the actual report from Cloudinary
      const versionItem = data.results?.[0];
      if (!versionItem || !versionItem.cloudinaryUrl) {
        throw new Error('Version data not found');
      }

      // Store the cloudinaryUrl for download functionality
      setSelectedVersionCloudinaryUrl(versionItem.cloudinaryUrl);

      // Check if the URL is a PDF or JSON
      const isPdf = versionItem.cloudinaryUrl.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        // If it's a PDF, we can't display it as data
        // Set versionDetails to null so we show the download option only
        setVersionDetails(null);
        setLoadingDetails(false);
        return;
      }

      // Try to fetch JSON data - first try the original URL, then try with .json extension
      let jsonUrl = versionItem.cloudinaryUrl;
      if (!jsonUrl.toLowerCase().endsWith('.json')) {
        // Try to get JSON version by replacing .pdf with .json or appending .json
        jsonUrl = jsonUrl.replace(/\.pdf$/i, '.json');
        if (jsonUrl === versionItem.cloudinaryUrl) {
          // If no .pdf found, try appending .json before any query params
          const urlParts = jsonUrl.split('?');
          jsonUrl = `${urlParts[0]}.json${urlParts[1] ? '?' + urlParts[1] : ''}`;
        }
      }

      // Fetch the actual report data from Cloudinary
      let reportResponse = await fetch(jsonUrl);
      
      // If JSON URL doesn't work, try the original URL
      if (!reportResponse.ok && jsonUrl !== versionItem.cloudinaryUrl) {
        reportResponse = await fetch(versionItem.cloudinaryUrl);
      }
      
      if (!reportResponse.ok) {
        // If it's not a valid JSON response, it might be a PDF
        const contentType = reportResponse.headers.get('content-type') || '';
        if (contentType.includes('pdf') || versionItem.cloudinaryUrl.toLowerCase().includes('.pdf')) {
          setVersionDetails(null);
          setLoadingDetails(false);
          return;
        }
        throw new Error('Failed to fetch report data');
      }

      // Try to parse as JSON
      let reportData;
      try {
        const text = await reportResponse.text();
        reportData = JSON.parse(text);
      } catch (parseError) {
        // If parsing fails, it might be HTML or other format
        console.warn('Failed to parse as JSON, might be HTML or other format');
        setVersionDetails(null);
        setLoadingDetails(false);
        return;
      }
      
      // Transform the report data to match SEODashboard expected format
      const transformedData: Record<string, Record<string, any>> = {};
      
      if (reportData.sections) {
        // Transform sections into the expected format
        const urlKey = reportData.url || url;
        transformedData[urlKey] = {};
        
        // Map each section to its agent name
        Object.entries(reportData.sections).forEach(([sectionName, sectionData]: [string, any]) => {
          if (sectionData) {
            transformedData[urlKey][sectionName] = sectionData;
          }
        });
        
        // Add report data if available
        if (reportData.recommendations || reportData.score || reportData.lighthouse) {
          transformedData[urlKey].report = {
            recommendations: reportData.recommendations,
            score: reportData.score,
            lighthouse: reportData.lighthouse,
            summary: reportData.summary,
            url: reportData.url,
          };
        }
      } else {
        // If data is already in the expected format, use it as is
        transformedData[url] = reportData;
      }
      
      setVersionDetails(transformedData);
    } catch (err: any) {
      console.error('Error fetching version details:', err);
      setError(err.message || 'Failed to load version details');
      setVersionDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleUrlExpansion = async (url: string) => {
    const isCurrentlyExpanded = expandedUrls.has(url);
    
    setExpandedUrls(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyExpanded) {
        newSet.delete(url);
        setSelectedUrl(null);
        setUrlVersions([]);
        setSelectedVersion(null);
        setVersionDetails(null);
        setSelectedVersionCloudinaryUrl(null);
      } else {
        newSet.add(url);
      }
      return newSet;
    });

    // If expanding, fetch versions for this URL
    if (!isCurrentlyExpanded) {
      setSelectedUrl(url);
      await fetchUrlVersions(url);
    }
  };

  const handleVersionClick = async (url: string, version: number) => {
    setSelectedVersion(version);
    setSelectedVersionCloudinaryUrl(null);
    await fetchVersionDetails(url, version);
  };

  const handleDownload = async () => {
    if (!selectedVersionCloudinaryUrl || downloading) return;

    try {
      setDownloading(true);
      setError('');

      // For Cloudinary, we can directly use the URL with fl_attachment parameter
      // Or we can fetch and create a blob download
      let downloadUrl = selectedVersionCloudinaryUrl;
      
      // Determine file extension from URL
      const urlParts = selectedVersionCloudinaryUrl.split('.');
      let extension = 'pdf';
      if (urlParts.length > 1) {
        const lastPart = urlParts[urlParts.length - 1];
        extension = lastPart.split('?')[0].split('/')[0] || 'pdf';
      }
      
      // For PDFs, try direct download with fl_attachment
      if (extension.toLowerCase() === 'pdf' && downloadUrl.includes('cloudinary.com')) {
        // Add fl_attachment parameter to force download
        const separator = downloadUrl.includes('?') ? '&' : '?';
        downloadUrl = `${downloadUrl}${separator}fl_attachment`;
        
        // Try direct download first
        try {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `SEO_Report_${selectedUrl?.replace(/https?:\/\//, '').replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '_') || 'report'}_v${selectedVersion}.pdf`;
          link.target = '_blank';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            setDownloading(false);
          }, 100);
          return;
        } catch (directError) {
          console.warn('Direct download failed, trying blob method:', directError);
        }
      }

      // Fetch the file from Cloudinary
      const response = await fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Ensure extension is valid
      if (!['pdf', 'json', 'html'].includes(extension.toLowerCase())) {
        extension = 'pdf';
      }
      
      // Create a download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.style.display = 'none';
      
      // Generate filename - clean the URL for filename
      const cleanUrl = selectedUrl?.replace(/https?:\/\//, '').replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '_') || 'report';
      const fileName = `SEO_Report_${cleanUrl}_v${selectedVersion}.${extension}`;
      link.download = fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        setDownloading(false);
      }, 200);
      
    } catch (err: any) {
      console.error('Download error:', err);
      
      // Fallback: Open in new tab if download fails
      if (selectedVersionCloudinaryUrl) {
        const fallbackUrl = selectedVersionCloudinaryUrl.includes('?') 
          ? `${selectedVersionCloudinaryUrl}&fl_attachment`
          : `${selectedVersionCloudinaryUrl}?fl_attachment`;
        
        window.open(fallbackUrl, '_blank');
        setDownloading(false);
        return;
      }
      
      setError(err.message || 'Failed to download file. Please try again.');
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please login to view your results</p>
          <Link
            href="/login"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error && allUrls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Results</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchResults}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!allUrls || allUrls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't analyzed any URLs yet. Start by analyzing a website to see results here.
          </p>
          <Link
            href="/analyze"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Start Analysis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
      {/* Navigation Header */}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Results Dashboard</p>
                </div>
              </Link>
            </motion.div>
            <div className="flex items-center gap-4">
              <Link
                href="/analyze"
                className="px-4 py-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors font-medium"
              >
                New Analysis
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                SEO Analysis Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and compare different versions of your SEO analyses
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/analyze"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                New Analysis
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - URLs and Versions */}
          <div className="lg:col-span-1 space-y-4">
            {/* URLs List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                Analyzed URLs ({allUrls.length})
              </h2>
              <div className="space-y-3">
                {allUrls.map((url) => {
                  const isExpanded = expandedUrls.has(url);
                  const isSelected = selectedUrl === url;
                  
                  return (
                    <div
                      key={url}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover:border-cyan-300 dark:hover:border-cyan-700"
                    >
                      {/* URL Header */}
                      <button
                        onClick={() => toggleUrlExpansion(url)}
                        className="w-full p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 hover:from-cyan-100 hover:to-blue-100 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 transition-all text-left"
                        disabled={loadingVersions && isSelected}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {url}
                            </p>
                            {isSelected && urlVersions.length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {urlVersions.length} version{urlVersions.length !== 1 ? 's' : ''}
                              </p>
                            )}
                            {loadingVersions && isSelected && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading versions...</p>
                            )}
                          </div>
                          <motion.svg
                            className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </div>
                      </button>

                      {/* Versions List */}
                      <AnimatePresence>
                        {isExpanded && isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 space-y-2">
                              {loadingVersions ? (
                                <div className="text-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto mb-2"></div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Loading versions...</p>
                                </div>
                              ) : urlVersions.length === 0 ? (
                                <div className="text-center py-4">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">No versions found</p>
                                </div>
                              ) : (
                                urlVersions
                                  .sort((a, b) => b.version - a.version)
                                  .map((versionItem) => (
                                    <motion.button
                                      key={versionItem.version}
                                      onClick={() => handleVersionClick(
                                        versionItem.url,
                                        versionItem.version
                                      )}
                                      className={`w-full p-3 rounded-lg text-left transition-all ${
                                        selectedUrl === versionItem.url && selectedVersion === versionItem.version
                                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                          : 'bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                                      }`}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-semibold">
                                            Version {versionItem.version}
                                          </p>
                                          <p className={`text-xs mt-1 ${
                                            selectedUrl === versionItem.url && selectedVersion === versionItem.version
                                              ? 'text-white/80'
                                              : 'text-gray-500 dark:text-gray-400'
                                          }`}>
                                            {formatDate(versionItem.createdAt)}
                                          </p>
                                        </div>
                                        {selectedUrl === versionItem.url && selectedVersion === versionItem.version && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                          </motion.div>
                                        )}
                                      </div>
                                    </motion.button>
                                  ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Side - Version Details */}
          <div className="lg:col-span-2">
            {loadingDetails ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-12"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading version details...</p>
                </div>
              </motion.div>
            ) : selectedUrl && selectedVersion ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Version Info Header */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Version {selectedVersion} Details
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">{selectedUrl}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(
                          urlVersions.find(v => v.version === selectedVersion)?.createdAt || ''
                        )}
                      </p>
                      {selectedVersionCloudinaryUrl && (
                        <motion.button
                          onClick={handleDownload}
                          disabled={downloading}
                          whileHover={!downloading ? { scale: 1.05 } : {}}
                          whileTap={!downloading ? { scale: 0.95 } : {}}
                          className={`px-4 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm ${
                            downloading ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {downloading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span>Download Report</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show SEO Dashboard if we have data, otherwise show message */}
                {versionDetails ? (
                  <SEODashboard results={versionDetails} url={selectedUrl} />
                ) : (
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-12">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        PDF Report Available
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This version contains a PDF report. Click the download button above to download and view the full report.
                      </p>
                      {selectedVersionCloudinaryUrl && (
                        <motion.button
                          onClick={() => window.open(selectedVersionCloudinaryUrl, '_blank')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>View PDF in New Tab</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-12"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Select a Version
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click on a URL and then select a version to view detailed analysis results
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

