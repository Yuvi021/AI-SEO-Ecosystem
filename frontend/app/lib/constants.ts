export const AGENTS = [
  {
    id: 'crawl',
    name: 'Crawl Agent',
    description: 'Extracts HTML, metadata, headings, links',
  },
  {
    id: 'keyword',
    name: 'Keyword Intelligence',
    description: 'Detects missing keywords and suggests terms',
  },
  {
    id: 'content',
    name: 'Content Optimization',
    description: 'Analyzes readability and structure',
  },
  {
    id: 'schema',
    name: 'Schema Agent',
    description: 'Generates and validates structured data',
  },
  {
    id: 'technical',
    name: 'Technical SEO',
    description: 'Checks Core Web Vitals and performance',
  },
  {
    id: 'meta',
    name: 'Meta Tags',
    description: 'Generates optimized meta titles and descriptions',
  },
  {
    id: 'image',
    name: 'Image Intelligence',
    description: 'Analyzes alt text and image optimization',
  },
  {
    id: 'validation',
    name: 'Validation',
    description: 'Ensures output quality and SEO compliance',
  },
  {
    id: 'report',
    name: 'Report Generation',
    description: 'Generates comprehensive HTML reports',
  },
];

// Backend API URL - change this if your backend runs on a different port
// For production, set NEXT_PUBLIC_API_URL environment variable
export const API_URL = 
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api')
    : 'http://localhost:3001/api';

