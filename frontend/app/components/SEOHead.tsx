'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  schema?: any;
}

export default function SEOHead({
  title = 'AI SEO Ecosystem - Multi-Agent SEO Analysis Platform',
  description = 'Harness the power of 9 specialized AI agents to analyze websites, optimize content, and deliver actionable SEO insights in real-time. Comprehensive SEO analysis with keyword research, content optimization, and technical SEO.',
  keywords = ['SEO', 'AI', 'Website Analysis', 'SEO Optimization', 'Multi-Agent', 'Keyword Research', 'Content Optimization', 'Technical SEO', 'SEO Tools', 'AI SEO'],
  ogImage = '/og-image.png',
  ogType = 'website',
  canonicalUrl,
  author = 'AI SEO Ecosystem',
  publishedTime,
  modifiedTime,
  noindex = false,
  schema,
}: SEOHeadProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ai-seo-ecosystem.com';
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  // Default Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI SEO Ecosystem',
    description: 'AI-powered multi-agent SEO analysis platform',
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    sameAs: [
      // Add your social media URLs here
    ],
  };

  // Default WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI SEO Ecosystem',
    description: description,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/analyze?url={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Combine schemas
  const combinedSchema = schema 
    ? { '@graph': [organizationSchema, websiteSchema, schema] }
    : { '@graph': [organizationSchema, websiteSchema] };

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="AI SEO Ecosystem" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@aiseoecosystem" />
      <meta name="twitter:site" content="@aiseoecosystem" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0891b2" />
      <meta name="msapplication-TileColor" content="#0891b2" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
    </>
  );
}
