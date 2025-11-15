'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: 'ease',
  speed: 500
});

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept all link clicks
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href) {
        const currentUrl = window.location.href;
        const targetUrl = anchor.href;
        
        // Check if it's an internal navigation (not external link)
        if (targetUrl.startsWith(window.location.origin) && targetUrl !== currentUrl) {
          NProgress.start();
        }
      }
    };

    // Listen to all clicks on the document
    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      NProgress.done();
    };
  }, []);

  return null;
}
