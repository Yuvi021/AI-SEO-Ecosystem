'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import Image from 'next/image';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: '🤖',
      title: 'Crawl Agent',
      description: 'Extracts HTML, metadata, headings, and links from any website',
    },
    {
      icon: '🧠',
      title: 'Keyword Intelligence',
      description: 'AI-powered keyword detection and long-tail term suggestions',
    },
    {
      icon: '✨',
      title: 'Content Optimization',
      description: 'Analyzes readability, structure, and keyword placement',
    },
    {
      icon: '📊',
      title: 'Schema Agent',
      description: 'Generates and validates structured data (JSON-LD)',
    },
    {
      icon: '⚡',
      title: 'Technical SEO',
      description: 'Checks Core Web Vitals, mobile-friendliness, and performance',
    },
    {
      icon: '🏷️',
      title: 'Meta Tags',
      description: 'Generates optimized meta titles and descriptions',
    },
    {
      icon: '🖼️',
      title: 'Image Intelligence',
      description: 'Analyzes alt text, filenames, and image optimization',
    },
    {
      icon: '✅',
      title: 'Validation',
      description: 'Ensures output quality, uniqueness, and SEO compliance',
    },
    {
      icon: '📈',
      title: 'Report Generation',
      description: 'Creates comprehensive HTML reports with actionable insights',
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-blue-600 p-2">
                <Image src="/logo.svg" alt="AI SEO Ecosystem" width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  AI SEO Ecosystem
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent AI</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Sign Out
                  </button>
                  <Link
                    href="/analyze"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/analyze"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                AI-Powered SEO Analysis Platform
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Intelligent SEO
              <br />
              <span className="text-blue-600 dark:text-blue-400">Analysis Platform</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Harness the power of <span className="font-semibold text-blue-600 dark:text-blue-400">10 specialized AI agents</span> to analyze websites,
              optimize content, and get actionable SEO insights in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/analyze"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Start Analyzing
              </Link>
              <button className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
                className="text-center p-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Powerful <span className="text-blue-600 dark:text-blue-400">AI Agents</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our 10 specialized AI agents work together to provide comprehensive SEO analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl mb-4">
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
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
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
                className="relative p-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                  {step.step}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Perfect For <span className="text-blue-600 dark:text-blue-400">Every Business</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Whether you're running an e-commerce site or a SaaS platform, our tools adapt to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{useCase.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose <span className="text-blue-600 dark:text-blue-400">Our Platform</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for comprehensive AI-powered SEO analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-center"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our <span className="text-blue-600 dark:text-blue-400">Users Say</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Trusted by marketers, SEO specialists, and content managers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Frequently Asked <span className="text-blue-600 dark:text-blue-400">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about our platform
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  <span className="text-blue-600 dark:text-blue-400 text-xl">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to Improve Your SEO?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start analyzing your website today and get AI-powered actionable insights
            </p>
            <Link
              href="/analyze"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-blue-600 p-2">
                <Image src="/logo.svg" alt="AI SEO Ecosystem" width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  AI SEO Ecosystem
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent AI</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-4 text-sm">
                <Link href="/privacy-policy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                © 2025 AI SEO Ecosystem. Powered by Multi-Agent Intelligence.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
