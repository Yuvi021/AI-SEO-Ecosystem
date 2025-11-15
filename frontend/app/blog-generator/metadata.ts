import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Blog Generator - SEO-Optimized Content Creation',
  description:
    'Generate SEO-optimized blog posts with AI. Create high-quality, engaging content with proper keyword density, readability optimization, heading structure, and comprehensive SEO analysis.',
  keywords: [
    'AI blog generator',
    'content generator',
    'blog writing tool',
    'AI content writer',
    'SEO blog generator',
    'automated content creation',
    'AI writing assistant',
    'blog post generator',
    'content creation tool',
  ],
  openGraph: {
    title: 'AI Blog Generator - SEO-Optimized Content Creation | AI SEO Ecosystem',
    description:
      'Generate SEO-optimized blog posts with AI. Create high-quality, engaging content with comprehensive SEO analysis.',
    type: 'website',
    url: 'https://ai-seo-ecosystem.com/blog-generator',
    images: [
      {
        url: '/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'AI Blog Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Blog Generator - SEO-Optimized Content Creation',
    description:
      'Generate SEO-optimized blog posts with AI. Create high-quality, engaging content.',
    images: ['/og-blog.png'],
  },
};
