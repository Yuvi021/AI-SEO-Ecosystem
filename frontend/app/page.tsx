'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './components/ThemeToggle';
import Image from 'next/image';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import YouTubeModal from './components/YouTubeModal';
import HomeSchema from './components/HomeSchema';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // Get YouTube URL from environment variable
  const youtubeUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_YOUTUBE_DEMO_URL || 'https://youtu.be/5OSCU9UTFzA')
    : 'https://youtu.be/5OSCU9UTFzA';

  const features = [
    {
      icon: '🕷️',
      title: 'Crawl Agent',
      description: 'The foundation of our analysis system',
      details: 'Extracts and analyzes HTML structure, metadata tags, heading hierarchy (H1-H6), internal and external links, sitemap parsing, and page structure. Identifies missing elements, broken links, and structural issues that impact SEO performance.',
      checks: ['HTML Structure', 'Metadata Tags', 'Heading Hierarchy', 'Link Analysis', 'Sitemap Parsing'],
      gradient: 'from-cyan-400 to-blue-600',
    },
    {
      icon: '🔑',
      title: 'Keyword Intelligence',
      description: 'AI-powered keyword detection and optimization',
      details: 'Uses advanced AI to detect primary and secondary keywords, identify missing keyword opportunities, suggest long-tail variations, analyze keyword density, and recommend semantic keywords. Provides competitive keyword insights and search intent analysis.',
      checks: ['Keyword Detection', 'Missing Keywords', 'Long-tail Suggestions', 'Keyword Density', 'Search Intent'],
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      icon: '📝',
      title: 'Content Optimization',
      description: 'Enhance readability and content quality',
      details: 'Analyzes content readability scores (Flesch-Kincaid), sentence structure, paragraph length, keyword placement, content uniqueness, word count optimization, and provides AI-powered suggestions for improving content quality and SEO performance.',
      checks: ['Readability Score', 'Content Structure', 'Keyword Placement', 'Uniqueness Check', 'Word Count'],
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: '📋',
      title: 'Schema Agent',
      description: 'Structured data generation and validation',
      details: 'Detects existing schema markup, generates missing structured data (JSON-LD), validates schema compliance, suggests appropriate schema types (Article, Product, FAQ, etc.), and ensures rich snippet eligibility for better search result appearance.',
      checks: ['Schema Detection', 'JSON-LD Generation', 'Schema Validation', 'Rich Snippets', 'Schema Types'],
      gradient: 'from-indigo-500 to-blue-600',
    },
    {
      icon: '⚙️',
      title: 'Technical SEO',
      description: 'Core Web Vitals and performance analysis',
      details: 'Comprehensive technical analysis including Core Web Vitals (LCP, FID, CLS), mobile responsiveness, page speed, HTTPS security, robots.txt validation, XML sitemap checks, canonical tags, and overall technical health scoring.',
      checks: ['Core Web Vitals', 'Mobile-Friendliness', 'Page Speed', 'HTTPS Security', 'Technical Health'],
      gradient: 'from-cyan-500 to-teal-600',
    },
    {
      icon: '🏷️',
      title: 'Meta Tags',
      description: 'Optimized meta titles and descriptions',
      details: 'Generates SEO-optimized meta titles (30-60 characters) and descriptions (120-160 characters), checks for keyword inclusion, analyzes click-through potential, validates length requirements, and provides multiple optimization suggestions for better search visibility.',
      checks: ['Meta Title Optimization', 'Meta Description', 'Keyword Inclusion', 'Length Validation', 'CTR Optimization'],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🖼️',
      title: 'Image Intelligence',
      description: 'Image optimization and alt text analysis',
      details: 'Scans all images for missing alt text, analyzes image file names, checks image sizes and formats, suggests optimization opportunities, validates image accessibility compliance, and provides recommendations for better image SEO.',
      checks: ['Alt Text Analysis', 'Image Optimization', 'File Size Check', 'Format Validation', 'Accessibility'],
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: '✅',
      title: 'Validation Agent',
      description: 'Quality assurance and SEO compliance',
      details: 'Validates overall SEO compliance, checks content quality, ensures uniqueness, verifies technical requirements, cross-validates agent findings, and provides a comprehensive quality score with actionable improvement recommendations.',
      checks: ['SEO Compliance', 'Content Quality', 'Uniqueness Check', 'Technical Validation', 'Quality Score'],
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: '📊',
      title: 'Report Generation',
      description: 'Comprehensive analysis reports',
      details: 'Compiles all agent findings into detailed HTML and PDF reports, generates Lighthouse scores, creates visual dashboards, provides prioritized recommendations, tracks version history, and delivers actionable insights in an easy-to-understand format.',
      checks: ['HTML Reports', 'PDF Generation', 'Lighthouse Scores', 'Visual Dashboards', 'Version History'],
      gradient: 'from-blue-600 to-indigo-700',
    },
  ];

  const benefits = [
    {
      icon: '⚡',
      title: 'Real-Time Analysis',
      description: 'Watch your SEO analysis happen in real-time with live progress updates',
    },
    {
      icon: '🎯',
      title: 'Selective Agents',
      description: 'Choose exactly which AI agents to run for customized analysis',
    },
    {
      icon: '🗺️',
      title: 'Sitemap Support',
      description: 'Analyze entire websites or single pages with intelligent sitemap parsing',
    },
    {
      icon: '📈',
      title: 'Actionable Insights',
      description: 'Get detailed AI-powered recommendations to improve your SEO performance',
    },
  ];

  const useCases = [
    {
      title: 'E-commerce Websites',
      description: 'Optimize product pages, improve search rankings, and increase organic traffic',
      icon: '🛒',
    },
    {
      title: 'Content Marketing',
      description: 'Enhance blog posts and articles with AI-powered SEO recommendations',
      icon: '📝',
    },
    {
      title: 'Corporate Websites',
      description: 'Improve visibility and ensure your business website ranks higher',
      icon: '🏢',
    },
    {
      title: 'SaaS Platforms',
      description: 'Optimize landing pages and documentation for better search performance',
      icon: '💻',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'This platform transformed our SEO strategy. The AI agents provide insights we never would have found manually.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'SEO Specialist',
      company: 'Digital Agency',
      content: 'The real-time analysis and comprehensive reports save us hours of work. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Manager',
      company: 'StartupXYZ',
      content: 'Best SEO tool we\'ve used. The keyword intelligence and content optimization features are outstanding.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'How does the AI SEO analysis work?',
      answer: 'Our platform uses 10 specialized AI agents that work together to analyze your website. Each agent focuses on a specific aspect of SEO, from technical performance to content optimization, providing comprehensive insights.',
    },
    {
      question: 'Can I analyze multiple websites?',
      answer: 'Yes, you can analyze unlimited websites. Simply enter the URL or sitemap for each website you want to analyze.',
    },
    {
      question: 'How long does an analysis take?',
      answer: 'Analysis time varies depending on the size of your website and which agents you select. Most single-page analyses complete in under 2 minutes, while full sitemap analyses may take 5-15 minutes.',
    },
    {
      question: 'Do I need technical knowledge to use this?',
      answer: 'No technical knowledge required. Our platform is designed to be user-friendly, providing clear, actionable insights that anyone can understand and implement.',
    },
    {
      question: 'What makes this different from other SEO tools?',
      answer: 'Our platform uses multiple specialized AI agents that work in parallel, providing real-time analysis and comprehensive insights. You can also select which agents to run, giving you full control over the analysis process.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We take data security seriously and follow industry best practices to protect your information. All analyses are processed securely and your data is never shared with third parties.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white  dark:bg-gray-900 transition-colors duration-300">
      {/* JSON-LD Schema */}
      <HomeSchema />
      
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
              ease: "easeInOut",
            }}
            style={{ left: "10%", top: "20%" }}
          />
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
              delay: 2,
            }}
            style={{ right: "10%", bottom: "20%" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full border border-cyan-200 dark:border-cyan-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                🤖 AI-Powered SEO Analysis Platform
              </span>
            </motion.div>
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                Intelligent SEO
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Analysis Platform
              </span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Harness the power of{" "}
              <span className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                9 specialized AI agents
              </span>{" "}
              working in harmony to analyze websites, optimize content, and
              deliver actionable SEO insights in real-time.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/analyze"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  Start Analyzing
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </Link>
              </motion.div>
              <motion.button
                onClick={() => setIsVideoModalOpen(true)}
                className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 rounded-xl font-semibold text-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[
              {
                number: "9",
                label: "AI Agents",
                icon: "🤖",
                description: "Specialized agents working in harmony",
              },
              {
                number: "100%",
                label: "Real-Time",
                icon: "⚡",
                description: "Live progress tracking and updates",
              },
              {
                number: "∞",
                label: "Unlimited",
                icon: "🚀",
                description: "Analyze as many sites as you need",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border-2 border-cyan-100 dark:border-cyan-900/50 shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <motion.div
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Detailed Agent Descriptions */}
      <section className="py-20 bg-white dark:bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Powerful{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                AI Agents
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our 9 specialized AI agents work in parallel to provide
              comprehensive, real-time SEO analysis. Each agent focuses on a
              specific aspect of SEO, ensuring nothing is missed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-3">
                  {feature.description}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {feature.details}
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    What It Checks:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.checks.map((check, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-md border border-cyan-200 dark:border-cyan-800"
                      >
                        {check}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Agents Work Together */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-950/30 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              How Our{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                Agents Work Together
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI agents operate in a coordinated workflow, sharing insights
              and building upon each other's findings to deliver comprehensive
              analysis.
            </p>
          </motion.div>

          <div className="relative">
            {/* Workflow Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                {
                  phase: "Discovery",
                  agents: ["Crawl Agent"],
                  gradient: "from-cyan-500 to-cyan-700",
                },
                {
                  phase: "Analysis",
                  agents: ["Keyword", "Content", "Technical"],
                  gradient: "from-blue-500 to-blue-700",
                },
                {
                  phase: "Optimization",
                  agents: ["Meta Tags", "Schema", "Image"],
                  gradient: "from-purple-500 to-purple-700",
                },
                {
                  phase: "Reporting",
                  agents: ["Validation", "Report"],
                  gradient: "from-indigo-500 to-indigo-700",
                },
              ].map((phase, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <div
                    className={`bg-gradient-to-br ${phase.gradient} p-6 rounded-2xl shadow-lg text-white`}
                  >
                    <div className="text-3xl mb-3 font-bold">
                      Phase {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">
                      {phase.phase}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {phase.agents.map((agent, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          {agent} Agent
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <motion.svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </motion.svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Detailed Workflow */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 border-2 border-cyan-100 dark:border-cyan-900/50 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                The Complete Analysis Workflow
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Crawl & Discovery",
                    description:
                      "The Crawl Agent starts by extracting all HTML content, metadata, headings, and links. This foundational data is shared with all other agents.",
                    icon: "🕷️",
                  },
                  {
                    step: 2,
                    title: "Parallel Analysis",
                    description:
                      "Keyword, Content, and Technical agents analyze simultaneously, each focusing on their domain while sharing relevant findings.",
                    icon: "⚡",
                  },
                  {
                    step: 3,
                    title: "Optimization Suggestions",
                    description:
                      "Meta Tags, Schema, and Image agents generate optimization recommendations based on the analysis from previous agents.",
                    icon: "✨",
                  },
                  {
                    step: 4,
                    title: "Validation & Reporting",
                    description:
                      "The Validation agent cross-checks all findings, and the Report agent compiles everything into comprehensive, actionable reports.",
                    icon: "📊",
                  },
                ].map((workflow, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {workflow.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{workflow.icon}</span>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {workflow.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {workflow.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              How It{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple, fast, and powerful SEO analysis in three easy steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter URL",
                description:
                  "Provide a website URL or sitemap URL to analyze. Our system automatically detects and parses sitemaps for comprehensive site-wide analysis.",
                icon: "🔗",
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                step: "02",
                title: "Select AI Agents",
                description:
                  "Choose which AI agents to run for your analysis. Select all for comprehensive analysis or pick specific agents for targeted insights.",
                icon: "🤖",
                gradient: "from-blue-500 to-purple-600",
              },
              {
                step: "03",
                title: "Get Results",
                description:
                  "Watch real-time progress as agents work in parallel. Receive detailed insights, actionable recommendations, and comprehensive reports.",
                icon: "📊",
                gradient: "from-purple-500 to-pink-600",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.step}
                </motion.div>
                <motion.div
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                Our Platform
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for comprehensive AI-powered SEO analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-xl transition-all text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about our platform
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-cyan-300 dark:hover:border-cyan-700 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.span
                    className="text-cyan-600 dark:text-cyan-400 text-2xl font-bold flex-shrink-0"
                    animate={{ rotate: openFaq === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    +
                  </motion.span>
                </button>
                {openFaq === index && (
                  <motion.div
                    className="px-6 py-4 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            className="p-12 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Ready to Improve Your SEO?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Start analyzing your website today and get AI-powered actionable
              insights from 9 specialized agents
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/analyze"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all"
                >
                  Start Free Analysis
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
