import type { Metadata } from 'next';
import './globals.css';
import './nprogress.css';
import AuthProviderWrapper from './components/AuthProviderWrapper';
import TopLoader from './components/TopLoader';

export const metadata: Metadata = {
  title: 'AI SEO Ecosystem - Multi-Agent Analysis',
  description: 'Comprehensive SEO optimization platform powered by AI agents. Analyze websites and sitemaps with real-time progress tracking.',
  keywords: ['SEO', 'AI', 'Website Analysis', 'SEO Optimization', 'Multi-Agent'],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
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
        <TopLoader />
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
