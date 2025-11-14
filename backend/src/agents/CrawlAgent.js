import axios from 'axios';
import * as cheerio from 'cheerio';

export class CrawlAgent {
  constructor() {
    this.name = 'CrawlAgent';
    this.status = 'ready';
  }

  async crawl(url) {
    try {
      this.status = 'crawling';
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      const data = {
        url,
        statusCode: response.status,
        title: $('title').text().trim(),
        meta: {
          description: $('meta[name="description"]').attr('content') || '',
          keywords: $('meta[name="keywords"]').attr('content') || '',
          viewport: $('meta[name="viewport"]').attr('content') || '',
          og: {
            title: $('meta[property="og:title"]').attr('content') || '',
            description: $('meta[property="og:description"]').attr('content') || '',
            image: $('meta[property="og:image"]').attr('content') || '',
            url: $('meta[property="og:url"]').attr('content') || ''
          }
        },
        headings: {
          h1: $('h1').map((i, el) => $(el).text().trim()).get(),
          h2: $('h2').map((i, el) => $(el).text().trim()).get(),
          h3: $('h3').map((i, el) => $(el).text().trim()).get()
        },
        links: {
          internal: [],
          external: [],
          total: 0
        },
        images: $('img').map((i, el) => ({
          src: $(el).attr('src') || '',
          alt: $(el).attr('alt') || '',
          title: $(el).attr('title') || ''
        })).get(),
        schema: this.extractSchema($),
        content: {
          text: $('body').text().replace(/\s+/g, ' ').trim(),
          wordCount: 0,
          paragraphs: $('p').map((i, el) => $(el).text().trim()).get()
        },
        html: {
          lang: $('html').attr('lang') || '',
          charset: $('meta[charset]').attr('charset') || 'utf-8',
          doctype: response.data.match(/<!doctype[^>]*>/i)?.[0] || ''
        },
        timestamp: new Date().toISOString()
      };

      // Process links
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        const absoluteUrl = new URL(href, url).href;
        
        if (absoluteUrl.startsWith(url)) {
          data.links.internal.push({
            url: absoluteUrl,
            text: $(el).text().trim(),
            anchor: $(el).attr('href')
          });
        } else {
          data.links.external.push({
            url: absoluteUrl,
            text: $(el).text().trim(),
            anchor: $(el).attr('href')
          });
        }
      });

      data.links.total = data.links.internal.length + data.links.external.length;
      data.content.wordCount = data.content.text.split(/\s+/).filter(w => w.length > 0).length;

      this.status = 'ready';
      return data;
    } catch (error) {
      this.status = 'error';
      throw new Error(`Crawl failed: ${error.message}`);
    }
  }

  extractSchema($) {
    const schemas = [];
    
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        schemas.push(json);
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    return schemas;
  }

  async execute(url) {
    return await this.crawl(url);
  }
}

