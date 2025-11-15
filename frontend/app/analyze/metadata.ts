import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Analysis - AI-Powered Website Audit',
  description:
    'Analyze your website with 9 specialized AI agents. Get comprehensive SEO insights including technical SEO, keyword analysis, content optimization, meta tags, schema markup, and more in real-time.',
  keywords: [
    'SEO analysis',
    'website audit',
    'SEO checker',
    'technical SEO',
    'SEO tools',
    'website analyzer',
    'SEO report',
    'AI SEO analysis',
    'sitemap analyzer',
  ],
  openGraph: {
    title: 'SEO Analysis - AI-Powered Website Audit | AI SEO Ecosystem',
    description:
      'Analyze your website with 9 specialized AI agents. Get comprehensive SEO insights in real-time.',
    type: 'website',
    url: 'https://ai-seo-ecosystem.com/analyze',
    images: [
      {
        url: '/og-analyze.png',
        width: 1200,
        height: 630,
        alt: 'AI SEO Analysis Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Analysis - AI-Powered Website Audit',
    description:
      'Analyze your website with 9 specialized AI agents. Get comprehensive SEO insights in real-time.',
    images: ['/og-analyze.png'],
  },
};
