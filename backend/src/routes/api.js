import express from 'express';
import { SitemapParser } from '../utils/sitemapParser.js';

export function apiRoutes(agentManager) {
  const router = express.Router();
  const sitemapParser = new SitemapParser();

  // Analyze URL endpoint
  router.post('/analyze', async (req, res) => {
    try {
      const { url, options } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const results = await agentManager.processURL(url, options || {});
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Streaming analysis endpoint with SSE
  router.get('/analyze-stream', async (req, res) => {
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

    // Progress callback function
    const sendProgress = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
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
      sendProgress({
        type: 'error',
        message: error.message,
        progress: 0
      });
    } finally {
      res.end();
    }
  });

  // Get agent status
  router.get('/agents', (req, res) => {
    res.json({ agents: agentManager.getAgentStatus() });
  });

  // Run specific agent
  router.post('/agent/:agentName', async (req, res) => {
    try {
      const { agentName } = req.params;
      const result = await agentManager.runAgent(agentName, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

