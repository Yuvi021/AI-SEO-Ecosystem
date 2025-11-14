import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI SEO Ecosystem - Multi-Agent Analysis',
  description: 'Comprehensive SEO optimization platform powered by AI agents. Analyze websites and sitemaps with real-time progress tracking.',
  keywords: ['SEO', 'AI', 'Website Analysis', 'SEO Optimization', 'Multi-Agent'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
