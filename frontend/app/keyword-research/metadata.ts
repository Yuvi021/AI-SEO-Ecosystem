import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keyword Research - AI-Powered Keyword Analysis Tool',
  description:
    'Discover high-value keywords with AI-powered research. Get keyword volume, difficulty, search intent, opportunities, trending topics, and content clusters to boost your SEO strategy.',
  keywords: [
    'keyword research',
    'keyword analysis',
    'keyword tool',
    'SEO keywords',
    'keyword planner',
    'keyword difficulty',
    'search volume',
    'keyword opportunities',
    'AI keyword research',
    'keyword clustering',
  ],
  openGraph: {
    title: 'Keyword Research - AI-Powered Keyword Analysis | AI SEO Ecosystem',
    description:
      'Discover high-value keywords with AI-powered research. Get keyword volume, difficulty, and opportunities.',
    type: 'website',
    url: 'https://ai-seo-ecosystem.com/keyword-research',
    images: [
      {
        url: '/og-keyword.png',
        width: 1200,
        height: 630,
        alt: 'AI Keyword Research Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keyword Research - AI-Powered Keyword Analysis',
    description:
      'Discover high-value keywords with AI-powered research. Get keyword volume, difficulty, and opportunities.',
    images: ['/og-keyword.png'],
  },
};
