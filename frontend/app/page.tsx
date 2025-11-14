'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: '🤖',
      title: 'Crawl Agent',
      description: 'Extracts HTML, metadata, headings, and links from any website',
      gradient: 'from-cyan-400 to-blue-600',
    },
    {
      icon: '🧠',
      title: 'Keyword Intelligence',
      description: 'AI-powered keyword detection and long-tail term suggestions',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      icon: '✨',
      title: 'Content Optimization',
      description: 'Analyzes readability, structure, and keyword placement',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      icon: '📊',
      title: 'Schema Agent',
      description: 'Generates and validates structured data (JSON-LD)',
      gradient: 'from-indigo-500 to-blue-600',
    },
    {
      icon: '⚡',
      title: 'Technical SEO',
      description: 'Checks Core Web Vitals, mobile-friendliness, and performance',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: '🏷️',
      title: 'Meta Tags',
      description: 'Generates optimized meta titles and descriptions',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🖼️',
      title: 'Image Intelligence',
      description: 'Analyzes alt text, filenames, and image optimization',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '✅',
      title: 'Validation',
      description: 'Ensures output quality, uniqueness, and SEO compliance',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: '📈',
      title: 'Report Generation',
      description: 'Creates comprehensive HTML reports with actionable insights',
      gradient: 'from-blue-600 to-cyan-600',
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 transition-colors duration-300 relative overflow-hidden">
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

      {/* Navigation */}
      <motion.nav 
        className="relative z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-blue-100/50 dark:border-blue-900/50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                  animate={{ 
                    boxShadow: [
                      "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                      "0 10px 40px -5px rgba(147, 51, 234, 0.4)",
                      "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🤖
                </motion.div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
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
              </motion.div>
              <div>
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  AI SEO Ecosystem
                </motion.span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent AI</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/analyze"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div 
            className="inline-block mb-6 px-4 py-2 bg-cyan-100/80 dark:bg-cyan-900/30 rounded-full border border-cyan-200 dark:border-cyan-800 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <motion.span 
                className="w-2 h-2 bg-cyan-500 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.span>
              AI-Powered SEO Analysis Platform
            </span>
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.span 
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% auto',
              }}
            >
              Intelligent SEO
            </motion.span>
            <br />
            <span className="text-gray-900 dark:text-white">Analysis Platform</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Harness the power of <span className="font-semibold text-cyan-600 dark:text-cyan-400">10 specialized AI agents</span> to analyze websites,
            optimize content, and get actionable SEO insights in real-time.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/analyze"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all flex items-center gap-2"
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
                    ease: "easeInOut"
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </Link>
            </motion.div>
            <motion.button 
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { number: '10', label: 'AI Agents', icon: '🤖' },
            { number: '100%', label: 'Real-Time', icon: '⚡' },
            { number: '∞', label: 'Unlimited', icon: '🚀' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-cyan-100/50 dark:border-cyan-900/50 hover:bg-white/80 dark:hover:bg-gray-800/80 shadow-lg"
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <motion.div 
                className="text-4xl mb-3"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {stat.icon}
              </motion.div>
              <motion.div 
                className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: index * 0.1 + 0.8,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-cyan-50/80 via-blue-50/60 to-purple-50/60 dark:from-gray-800/90 dark:via-blue-950/80 dark:to-purple-950/80 backdrop-blur-sm" style={{ position: 'relative', zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Powerful <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">AI Agents</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our 10 specialized AI agents work together to provide comprehensive SEO analysis
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-cyan-100/50 dark:border-cyan-900/50 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-xl transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg`}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20" style={{ position: 'relative', zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple, fast, and powerful SEO analysis in three easy steps
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                step: '01',
                title: 'Enter URL',
                description: 'Provide a website URL or sitemap URL to analyze',
                icon: '🔗',
              },
              {
                step: '02',
                title: 'Select AI Agents',
                description: 'Choose which AI agents to run for your analysis',
                icon: '🤖',
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Watch real-time progress and receive detailed insights',
                icon: '📊',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-cyan-100/50 dark:border-cyan-900/50 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
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
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-cyan-50/80 via-blue-50/60 to-purple-50/60 dark:from-gray-800/90 dark:via-blue-950/80 dark:to-purple-950/80 backdrop-blur-sm" style={{ position: 'relative', zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">Our Platform</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for comprehensive AI-powered SEO analysis
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-cyan-100/50 dark:border-cyan-900/50 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-xl transition-all text-center"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20" style={{ position: 'relative', zIndex: 10 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="p-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 rounded-3xl border-2 border-cyan-300/50 dark:border-cyan-800/50 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Ready to Improve Your SEO?
            </h2>
            <p className="text-xl text-cyan-50 mb-8">
              Start analyzing your website today and get AI-powered actionable insights
            </p>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/analyze"
                className="inline-block px-8 py-4 bg-white text-cyan-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all"
              >
                Start Free Analysis
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 py-12 border-t border-cyan-100/50 dark:border-cyan-900/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
        style={{ position: 'relative', zIndex: 10 }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center gap-3 mb-4 md:mb-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <span className="text-lg font-semibold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                  AI SEO Ecosystem
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent AI</p>
              </div>
            </motion.div>
            <motion.p 
              className="text-gray-500 dark:text-gray-400 text-sm"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              © 2025 AI SEO Ecosystem. Powered by Multi-Agent Intelligence.
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
