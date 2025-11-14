import axios from 'axios';
import * as cheerio from 'cheerio';

export class SitemapParser {
  /**
   * Parse a sitemap URL and extract all URLs
   * @param {string} sitemapUrl - URL to the sitemap
   * @returns {Promise<string[]>} Array of URLs found in the sitemap
   */
  async parseSitemap(sitemapUrl) {
    try {
      const response = await axios.get(sitemapUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const urls = [];

      // Handle sitemap index (contains multiple sitemaps)
      $('sitemapindex > sitemap > loc').each((i, el) => {
        const sitemapUrl = $(el).text().trim();
        if (sitemapUrl) {
          urls.push(sitemapUrl);
        }
      });

      // Handle regular sitemap (contains URLs)
      $('urlset > url > loc').each((i, el) => {
        const url = $(el).text().trim();
        if (url) {
          urls.push(url);
        }
      });

      // If we found nested sitemaps, parse them recursively
      if (urls.length > 0 && urls.some(url => url.includes('sitemap'))) {
        const allUrls = [];
        for (const url of urls) {
          if (url.includes('sitemap')) {
            // It's a nested sitemap, parse it
            const nestedUrls = await this.parseSitemap(url);
            allUrls.push(...nestedUrls);
          } else {
            allUrls.push(url);
          }
        }
        return allUrls;
      }

      return urls;
    } catch (error) {
      throw new Error(`Failed to parse sitemap: ${error.message}`);
    }
  }

  /**
   * Check if a URL is a sitemap
   * @param {string} url - URL to check
   * @returns {boolean}
   */
  isSitemap(url) {
    return url.toLowerCase().includes('sitemap') || 
           url.toLowerCase().endsWith('.xml') ||
           url.toLowerCase().includes('/sitemap');
  }
}

