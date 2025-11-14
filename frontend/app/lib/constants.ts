export const AGENTS = [
  {
    id: 'crawl',
    name: 'Crawl Agent',
    description: 'Extracts HTML, metadata, headings, links',
    category: 'core',
  },
  {
    id: 'keyword',
    name: 'Keyword Intelligence',
    description: 'Detects missing keywords and suggests terms',
    category: 'core',
  },
  {
    id: 'keywordResearch',
    name: 'Keyword Research',
    description: 'Advanced keyword research with volume & difficulty',
    category: 'research',
  },
  {
    id: 'serp',
    name: 'SERP Analysis',
    description: 'Analyzes search results and ranking opportunities',
    category: 'research',
  },
  {
    id: 'rankTracking',
    name: 'Rank Tracking',
    description: 'Monitors keyword rankings over time',
    category: 'research',
  },
  {
    id: 'competitor',
    name: 'Competitor Analysis',
    description: 'Analyzes competitor strategies and gaps',
    category: 'research',
  },
  {
    id: 'content',
    name: 'Content Optimization',
    description: 'Analyzes readability and structure',
    category: 'optimization',
  },
  {
    id: 'schema',
    name: 'Schema Agent',
    description: 'Generates and validates structured data',
    category: 'technical',
  },
  {
    id: 'technical',
    name: 'Technical SEO',
    description: 'Checks Core Web Vitals and performance',
    category: 'technical',
  },
  {
    id: 'meta',
    name: 'Meta Tags',
    description: 'Generates optimized meta titles and descriptions',
    category: 'optimization',
  },
  {
    id: 'image',
    name: 'Image Intelligence',
    description: 'Analyzes alt text and image optimization',
    category: 'optimization',
  },
  {
    id: 'validation',
    name: 'Validation',
    description: 'Ensures output quality and SEO compliance',
    category: 'core',
  },
  {
    id: 'report',
    name: 'Report Generation',
    description: 'Generates comprehensive HTML reports',
    category: 'core',
  },
];

export const AGENT_CATEGORIES = {
  core: { name: 'Core Analysis', icon: '🎯', color: 'cyan' },
  research: { name: 'Keyword Research', icon: '🔍', color: 'blue' },
  optimization: { name: 'Optimization', icon: '✨', color: 'purple' },
  technical: { name: 'Technical SEO', icon: '⚙️', color: 'indigo' },
};

// Backend API URL - change this if your backend runs on a different port
// For production, set NEXT_PUBLIC_API_URL environment variable
export const API_URL = 
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api')
    : 'http://localhost:3001/api';

