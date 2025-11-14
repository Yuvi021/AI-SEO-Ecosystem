'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
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
      gradient: 'from-orange-400 to-orange-600',
    },
    {
      icon: '🧠',
      title: 'Keyword Intelligence',
      description: 'AI-powered keyword detection and long-tail term suggestions',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: '✨',
      title: 'Content Optimization',
      description: 'Analyzes readability, structure, and keyword placement',
      gradient: 'from-orange-400 to-yellow-500',
    },
    {
      icon: '📊',
      title: 'Schema Agent',
      description: 'Generates and validates structured data (JSON-LD)',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: '⚡',
      title: 'Technical SEO',
      description: 'Checks Core Web Vitals, mobile-friendliness, and performance',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: '🏷️',
      title: 'Meta Tags',
      description: 'Generates optimized meta titles and descriptions',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: '🖼️',
      title: 'Image Intelligence',
      description: 'Analyzes alt text, filenames, and image optimization',
      gradient: 'from-orange-400 to-red-400',
    },
    {
      icon: '✅',
      title: 'Validation',
      description: 'Ensures output quality, uniqueness, and SEO compliance',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: '📈',
      title: 'Report Generation',
      description: 'Creates comprehensive HTML reports with actionable insights',
      gradient: 'from-orange-500 to-red-600',
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
          }}
        ></div>
        <div 
          className="absolute w-96 h-96 bg-orange-300 dark:bg-orange-800/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{
            right: `${mousePosition.x / 25}px`,
            bottom: `${mousePosition.y / 25}px`,
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100 dark:bg-orange-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-100 dark:border-orange-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg animate-pulse-slow">
                  🤖
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                  AI SEO Ecosystem
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/analyze"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-6 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full border border-orange-200 dark:border-orange-800">
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              AI-Powered SEO Analysis Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 dark:from-orange-400 dark:via-orange-500 dark:to-red-500 bg-clip-text text-transparent animate-gradient">
              Intelligent SEO
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Analysis Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Harness the power of <span className="font-semibold text-orange-600 dark:text-orange-400">10 specialized AI agents</span> to analyze websites,
            optimize content, and get actionable SEO insights in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/analyze"
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
            >
              Start Analyzing
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 rounded-xl font-semibold text-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: '10', label: 'AI Agents', icon: '🤖' },
            { number: '100%', label: 'Real-Time', icon: '⚡' },
            { number: '∞', label: 'Unlimited', icon: '🚀' },
          ].map((stat, index) => (
            <div
              key={index}
              className={`text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-orange-100 dark:border-orange-900/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 transition-all duration-500 shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-orange-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Powerful <span className="bg-gradient-to-r from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">AI Agents</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our 10 specialized AI agents work together to provide comprehensive SEO analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-100 dark:border-orange-900/50 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-xl hover:scale-105 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple, fast, and powerful SEO analysis in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <div
                key={index}
                className={`relative p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-100 dark:border-orange-900/50 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-xl transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-600 dark:to-orange-800 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {step.step}
                </div>
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 bg-orange-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose <span className="bg-gradient-to-r from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">Our Platform</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for comprehensive AI-powered SEO analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-100 dark:border-orange-900/50 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-xl hover:scale-105 transition-all text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`p-12 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-3xl border-2 border-orange-300 dark:border-orange-800 shadow-2xl ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Ready to Improve Your SEO?
            </h2>
            <p className="text-xl text-orange-50 mb-8">
              Start analyzing your website today and get AI-powered actionable insights
            </p>
            <Link
              href="/analyze"
              className="inline-block px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Free Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-orange-100 dark:border-orange-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <span className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                  AI SEO Ecosystem
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI</p>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 AI SEO Ecosystem. Powered by Multi-Agent Intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
