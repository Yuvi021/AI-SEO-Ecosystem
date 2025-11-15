'use client';

import Script from 'next/script';

export default function HomeSchema() {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ai-seo-ecosystem.com';

  const schemas = {
    // Organization Schema
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AI SEO Ecosystem',
      description: 'AI-powered multi-agent SEO analysis platform',
      url: siteUrl,
      logo: `${siteUrl}/logo.svg`,
      foundingDate: '2024',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        availableLanguage: ['English'],
      },
    },

    // WebApplication Schema
    webApplication: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'AI SEO Ecosystem',
      description:
        'Harness the power of 9 specialized AI agents to analyze websites, optimize content, and deliver actionable SEO insights in real-time.',
      url: siteUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'AI-Powered SEO Analysis',
        'Keyword Research',
        'Content Optimization',
        'Technical SEO Audit',
        'Schema Markup Generation',
        'Meta Tags Optimization',
        'Blog Content Generation',
        'Real-time Progress Tracking',
        'Comprehensive SEO Reports',
      ],
      screenshot: `${siteUrl}/og-image.png`,
    },

    // SoftwareApplication Schema
    softwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AI SEO Ecosystem',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
    },

    // Service Schema
    service: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'SEO Analysis',
      provider: {
        '@type': 'Organization',
        name: 'AI SEO Ecosystem',
      },
      areaServed: 'Worldwide',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'SEO Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Website SEO Analysis',
              description: 'Comprehensive SEO analysis with 9 AI agents',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Keyword Research',
              description: 'AI-powered keyword research and analysis',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Blog Content Generation',
              description: 'SEO-optimized blog post generation',
            },
          },
        ],
      },
    },

    // FAQ Schema
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does the AI SEO analysis work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our platform uses 10 specialized AI agents that work together to analyze your website. Each agent focuses on a specific aspect of SEO, from technical performance to content optimization, providing comprehensive insights.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I analyze multiple websites?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, you can analyze unlimited websites. Simply enter the URL or sitemap for each website you want to analyze.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does an analysis take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Analysis time varies depending on the size of your website and which agents you select. Most single-page analyses complete in under 2 minutes, while full sitemap analyses may take 5-15 minutes.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need technical knowledge to use this?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No technical knowledge required. Our platform is designed to be user-friendly, providing clear, actionable insights that anyone can understand and implement.',
          },
        },
        {
          '@type': 'Question',
          name: 'What makes this different from other SEO tools?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our platform uses multiple specialized AI agents that work in parallel, providing real-time analysis and comprehensive insights. You can also select which agents to run, giving you full control over the analysis process.',
          },
        },
      ],
    },

    // BreadcrumbList Schema
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
      ],
    },
  };

  return (
    <>
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.organization) }}
      />
      <Script
        id="schema-web-application"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.webApplication) }}
      />
      <Script
        id="schema-software-application"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.softwareApplication) }}
      />
      <Script
        id="schema-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.service) }}
      />
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }}
      />
    </>
  );
}
