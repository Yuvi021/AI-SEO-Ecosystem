import express from 'express';
import { SitemapParser } from '../utils/sitemapParser.js';
import { requireAuth } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadJsonFile, isCloudinaryReady } from '../utils/cloudinary.js';
import { ensureResultIndexes, getNextVersion, createResultRecord, listResultsByUrl } from '../db/resultRepository.js';

export function apiRoutes(agentManager) {
  const router = express.Router();
  const sitemapParser = new SitemapParser();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const reportsDir = path.join(__dirname, '../../reports');

  // Analyze URL endpoint
  router.post('/analyze', requireAuth, async (req, res) => {
    try {
      const { url, options } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const results = await agentManager.processURL(url, options || {});
      // Attempt Cloudinary upload of the JSON report and record it
      let resultRecord = null;
      try {
        if (results?.report?.files?.json && isCloudinaryReady()) {
          const jsonFilename = results.report.files.json;
          const jsonPath = path.join(reportsDir, jsonFilename);
          const publicId = jsonFilename; // keep identical name as requested

          const uploadRes = await uploadJsonFile(jsonPath, publicId);

          // Save to DB with versioning
          await ensureResultIndexes();
          const userId = req.user?.sub || 'unknown';
          const version = await getNextVersion(userId, url);
          resultRecord = await createResultRecord({
            userId,
            url,
            version,
            cloudinaryUrl: uploadRes.secure_url || uploadRes.url,
          });
        }
      } catch (e) {
        console.error('Report upload/save failed:', e?.message || e);
      }

      res.json({ success: true, data: results, resultRecord });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get results for a given URL (version-wise) for current user
  router.get('/results', requireAuth, async (req, res) => {
    try {
      const { url, order } = req.query;
      if (!url) {
        return res.status(400).json({ error: 'Query param "url" is required' });
      }
      const userId = req.user?.sub;
      const sortOrder = order === 'desc' ? -1 : 1; // default ascending v1..vn
      const items = await listResultsByUrl(userId, url, sortOrder);
      return res.status(200).json({ url, userId, results: items });
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'Failed to fetch results' });
    }
  });

  // Streaming analysis endpoint with SSE
  router.get('/analyze-stream', requireAuth, async (req, res) => {
    const { url, agents, isSitemap } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Parse selected agents
    const selectedAgents = agents ? agents.split(',').filter(Boolean) : [];

    // Track if response is still open
    let isResponseOpen = true;

    // Progress callback function
    const sendProgress = (data) => {
      if (!isResponseOpen || res.writableEnded || res.destroyed) {
        return; // Don't write if response is closed
      }
      
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        // If write fails, mark as closed
        isResponseOpen = false;
        console.warn('Failed to send progress update:', error.message);
      }
    };

    try {
      let urlsToProcess = [url];

      // If it's a sitemap, parse it first
      if (isSitemap === 'true' || sitemapParser.isSitemap(url)) {
        sendProgress({
          type: 'progress',
          message: 'Parsing sitemap...',
          progress: 0
        });

        try {
          const sitemapUrls = await sitemapParser.parseSitemap(url);
          urlsToProcess = sitemapUrls;

          sendProgress({
            type: 'sitemap_parsed',
            message: sitemapUrls.length,
            progress: 5
          });

          if (urlsToProcess.length === 0) {
            sendProgress({
              type: 'error',
              message: 'No URLs found in sitemap',
              progress: 0
            });
            res.end();
            return;
          }
        } catch (error) {
          sendProgress({
            type: 'error',
            message: `Failed to parse sitemap: ${error.message}`,
            progress: 0
          });
          res.end();
          return;
        }
      }

      // Process URLs with streaming
      await agentManager.processURLWithStreaming(urlsToProcess, {
        selectedAgents,
        onProgress: sendProgress
      });

      // Send completion
      sendProgress({
        type: 'complete',
        message: 'Analysis complete!',
        progress: 100
      });

    } catch (error) {
      if (isResponseOpen && !res.writableEnded && !res.destroyed) {
        try {
          sendProgress({
            type: 'error',
            message: error.message,
            progress: 0
          });
        } catch (writeError) {
          console.warn('Failed to send error message:', writeError.message);
        }
      }
    } finally {
      if (isResponseOpen && !res.writableEnded && !res.destroyed) {
        isResponseOpen = false;
        try {
          res.end();
        } catch (endError) {
          console.warn('Failed to end response:', endError.message);
        }
      }
    }
  });

  // Get agent status
  router.get('/agents', (req, res) => {
    res.json({ agents: agentManager.getAgentStatus() });
  });

  // Run specific agent
  router.post('/agent/:agentName', requireAuth, async (req, res) => {
    try {
      const { agentName } = req.params;
      const { url, data } = req.body || {};

      // Accept either a precomputed crawlData as "data" or a URL to crawl first
      let input = data;
      if (!input && url) {
        // Generate crawl data from URL before executing the agent
        const crawlData = await agentManager.agents.crawl.crawl(url);
        input = crawlData;
      }

      if (!input) {
        return res.status(400).json({
          error: 'Provide either "url" to crawl or "data" (crawlData) to run the agent.'
        });
      }

      const result = await agentManager.runAgent(agentName, input);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Keyword Research endpoint
  router.post('/keyword-research', async (req, res) => {
    try {
      const { keywords, options } = req.body;
      
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'Keywords array is required' });
      }

      const result = await agentManager.agents.keywordResearch.research(keywords, options || {});
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // SERP Analysis endpoint
  router.post('/serp-analysis', async (req, res) => {
    try {
      const { keywords, options } = req.body;
      
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'Keywords array is required' });
      }

      const result = await agentManager.agents.serp.analyze(keywords, options || {});
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rank Tracking endpoint
  router.post('/rank-tracking', async (req, res) => {
    try {
      const { url, keywords, options } = req.body;
      
      if (!url || !keywords || !Array.isArray(keywords)) {
        return res.status(400).json({ error: 'URL and keywords array are required' });
      }

      const result = await agentManager.agents.rankTracking.trackRankings(url, keywords, options || {});
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get rank tracking history
  router.get('/rank-tracking/history', async (req, res) => {
    try {
      const { url, days } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const history = await agentManager.agents.rankTracking.getHistoricalData(url, parseInt(days) || 30);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Competitor Analysis endpoint
  router.post('/competitor-analysis', async (req, res) => {
    try {
      const { targetUrl, competitors, keywords } = req.body;
      
      if (!targetUrl || !competitors || !Array.isArray(competitors)) {
        return res.status(400).json({ error: 'Target URL and competitors array are required' });
      }

      const result = await agentManager.agents.competitor.analyze(
        targetUrl, 
        competitors, 
        keywords || []
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Comprehensive SEO Analysis (combines multiple agents)
  router.post('/comprehensive-analysis', async (req, res) => {
    try {
      const { url, keywords, competitors } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const results = {
        url,
        timestamp: new Date().toISOString()
      };

      // Run standard analysis
      results.seoAnalysis = await agentManager.processURL(url);

      // Run keyword research if keywords provided
      if (keywords && Array.isArray(keywords) && keywords.length > 0) {
        results.keywordResearch = await agentManager.agents.keywordResearch.research(keywords);
        results.serpAnalysis = await agentManager.agents.serp.analyze(keywords);
        results.rankTracking = await agentManager.agents.rankTracking.trackRankings(url, keywords);
      }

      // Run competitor analysis if competitors provided
      if (competitors && Array.isArray(competitors) && competitors.length > 0) {
        results.competitorAnalysis = await agentManager.agents.competitor.analyze(
          url, 
          competitors, 
          keywords || []
        );
      }

      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Blog Generator endpoint
  router.post('/generate-blog', async (req, res) => {
    try {
      const {
        topic,
        keywords = [],
        targetLength = 1500,
        tone = 'professional',
        includeIntro = true,
        includeConclusion = true,
        includeFAQ = false,
        targetAudience = 'general',
        background = ''
      } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      const result = await agentManager.agents.blogGenerator.generateBlog({
        topic,
        keywords,
        targetLength,
        tone,
        includeIntro,
        includeConclusion,
        includeFAQ,
        targetAudience,
        background
      });

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

