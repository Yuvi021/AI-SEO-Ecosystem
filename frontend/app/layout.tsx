import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import './nprogress.css';
import AuthProviderWrapper from './components/AuthProviderWrapper';
import TopLoader from './components/TopLoader';

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-seo-ecosystem.com'),
  title: {
    default: 'AI SEO Ecosystem - Multi-Agent SEO Analysis Platform',
    template: '%s | AI SEO Ecosystem',
  },
  description:
    'Harness the power of 9 specialized AI agents to analyze websites, optimize content, and deliver actionable SEO insights in real-time. Comprehensive SEO analysis with keyword research, content optimization, and technical SEO.',
  keywords: [
    'SEO',
    'AI',
    'Website Analysis',
    'SEO Optimization',
    'Multi-Agent',
    'Keyword Research',
    'Content Optimization',
    'Technical SEO',
    'SEO Tools',
    'AI SEO',
    'SEO Analysis',
    'Website Audit',
    'SEO Report',
    'Meta Tags',
    'Schema Markup',
  ],
  authors: [{ name: 'AI SEO Ecosystem' }],
  creator: 'AI SEO Ecosystem',
  publisher: 'AI SEO Ecosystem',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-seo-ecosystem.com',
    siteName: 'AI SEO Ecosystem',
    title: 'AI SEO Ecosystem - Multi-Agent SEO Analysis Platform',
    description:
      'Harness the power of 9 specialized AI agents to analyze websites, optimize content, and deliver actionable SEO insights in real-time.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI SEO Ecosystem - Multi-Agent SEO Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI SEO Ecosystem - Multi-Agent SEO Analysis Platform',
    description:
      'Harness the power of 9 specialized AI agents to analyze websites, optimize content, and deliver actionable SEO insights in real-time.',
    images: ['/og-image.png'],
    creator: '@aiseoecosystem',
    site: '@aiseoecosystem',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  manifest: '/manifest.json',
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
