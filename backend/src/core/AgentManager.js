import { CrawlAgent } from '../agents/CrawlAgent.js';
import { KeywordIntelligenceAgent } from '../agents/KeywordIntelligenceAgent.js';
import { KeywordResearchAgent } from '../agents/KeywordResearchAgent.js';
import { ContentOptimizationAgent } from '../agents/ContentOptimizationAgent.js';
import { SchemaAgent } from '../agents/SchemaAgent.js';
import { TechnicalSEOAgent } from '../agents/TechnicalSEOAgent.js';
import { MetaTagAgent } from '../agents/MetaTagAgent.js';
import { ImageIntelligenceAgent } from '../agents/ImageIntelligenceAgent.js';
import { ValidationAgent } from '../agents/ValidationAgent.js';
import { ReportAgent } from '../agents/ReportAgent.js';
import { LearningAgent } from '../agents/LearningAgent.js';
import { SERPAnalysisAgent } from '../agents/SERPAnalysisAgent.js';
import { RankTrackingAgent } from '../agents/RankTrackingAgent.js';
import { CompetitorAnalysisAgent } from '../agents/CompetitorAnalysisAgent.js';
import { BlogGeneratorAgent } from '../agents/BlogGeneratorAgent.js';

export class AgentManager {
  constructor() {
    this.agents = {
      crawl: new CrawlAgent(),
      keyword: new KeywordIntelligenceAgent(),
      keywordResearch: new KeywordResearchAgent(),
      content: new ContentOptimizationAgent(),
      schema: new SchemaAgent(),
      technical: new TechnicalSEOAgent(),
      meta: new MetaTagAgent(),
      image: new ImageIntelligenceAgent(),
      validation: new ValidationAgent(),
      report: new ReportAgent(),
      learning: new LearningAgent(),
      serp: new SERPAnalysisAgent(),
      rankTracking: new RankTrackingAgent(),
      competitor: new CompetitorAnalysisAgent(),
      blogGenerator: new BlogGeneratorAgent()
    };
    
    this.taskQueue = [];
    this.activeTasks = new Map();
  }

  async processURL(url, options = {}) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const task = {
      id: taskId,
      url,
      options,
      status: 'pending',
      results: {},
      createdAt: new Date()
    };

    this.activeTasks.set(taskId, task);
    
    try {
      task.status = 'processing';
      
      // Stage 1: Crawl
      console.log(`[${taskId}] Starting crawl for ${url}`);
      const crawlData = await this.agents.crawl.crawl(url);
      task.results.crawl = crawlData;

      // Stage 2: Parallel Analysis
      console.log(`[${taskId}] Running parallel analysis...`);
      const [keywordAnalysis, technicalAnalysis, schemaAnalysis, imageAnalysis] = await Promise.all([
        this.agents.keyword.analyze(crawlData),
        this.agents.technical.analyze(crawlData),
        this.agents.schema.analyze(crawlData),
        this.agents.image.analyze(crawlData)
      ]);

      task.results.keyword = keywordAnalysis;
      task.results.technical = technicalAnalysis;
      task.results.schema = schemaAnalysis;
      task.results.image = imageAnalysis;

      // Stage 3: Content & Meta Optimization
      console.log(`[${taskId}] Optimizing content and meta tags...`);
      const [contentOptimization, metaOptimization] = await Promise.all([
        this.agents.content.optimize(crawlData, keywordAnalysis),
        this.agents.meta.optimize(crawlData, keywordAnalysis)
      ]);

      task.results.content = contentOptimization;
      task.results.meta = metaOptimization;

      // Stage 4: Validation
      console.log(`[${taskId}] Validating recommendations...`);
      const validation = await this.agents.validation.validate({
        crawl: crawlData,
        keyword: keywordAnalysis,
        content: contentOptimization,
        meta: metaOptimization,
        schema: schemaAnalysis
      });
      task.results.validation = validation;

      // Stage 5: Generate Report
      console.log(`[${taskId}] Generating report...`);
      const report = await this.agents.report.generate(task.results, url);
      task.results.report = report;

      // Stage 6: Learning (update internal knowledge)
      await this.agents.learning.learn(task.results);

      task.status = 'completed';
      task.completedAt = new Date();

      return task.results;
    } catch (error) {
      task.status = 'error';
      task.error = error.message;
      console.error(`[${taskId}] Error:`, error);
      throw error;
    } finally {
      this.activeTasks.set(taskId, task);
    }
  }

  getAgentStatus() {
    return Object.keys(this.agents).map(key => ({
      name: key,
      status: this.agents[key].status || 'ready'
    }));
  }

  getTaskStatus(taskId) {
    return this.activeTasks.get(taskId) || null;
  }

  async runAgent(agentName, data) {
    if (!this.agents[agentName]) {
      throw new Error(`Agent ${agentName} not found`);
    }
    
    const agent = this.agents[agentName];
    return await agent.execute(data);
  }

  /**
   * Process URL(s) with selected agents and streaming progress updates
   * @param {string|string[]} urlOrUrls - Single URL or array of URLs
   * @param {Object} options - Processing options
   * @param {string[]} options.selectedAgents - Array of agent IDs to run
   * @param {Function} options.onProgress - Callback for progress updates
   * @returns {Promise<Object>} Results
   */
  async processURLWithStreaming(urlOrUrls, options = {}) {
    const { selectedAgents = [], onProgress } = options;
    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const allResults = {};
    
    try {
      // Send initial progress
      if (onProgress) {
        onProgress({
          type: 'progress',
          message: `Starting analysis of ${urls.length} URL(s)...`,
          progress: 0,
          taskId
        });
      }

      // Process each URL
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const urlProgress = ((i / urls.length) * 100);
        
        if (onProgress) {
          onProgress({
            type: 'url_processing',
            message: url,
            progress: urlProgress,
            taskId
          });
        }

        const urlResults = await this.processSingleURLWithAgents(
          url,
          selectedAgents,
          (progressData) => {
            if (onProgress) {
              // Adjust progress based on URL position
              const adjustedProgress = urlProgress + (progressData.progress / urls.length);
              onProgress({
                ...progressData,
                url: url,
                progress: adjustedProgress,
                taskId
              });
            }
          }
        );

        allResults[url] = urlResults;
      }

      if (onProgress) {
        onProgress({
          type: 'complete',
          message: 'Analysis complete!',
          progress: 100,
          taskId
        });
      }

      return allResults;
    } catch (error) {
      if (onProgress) {
        onProgress({
          type: 'error',
          message: error.message,
          progress: 0,
          taskId
        });
      }
      throw error;
    }
  }

  /**
   * Process a single URL with selected agents
   * @param {string} url - URL to process
   * @param {string[]} selectedAgents - Array of agent IDs to run
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Results
   */
  async processSingleURLWithAgents(url, selectedAgents, onProgress) {
    const results = {};
    
    // Always need crawl data first
    if (!selectedAgents.includes('crawl')) {
      selectedAgents.unshift('crawl');
    }

    // Content and Meta agents require keyword analysis
    if ((selectedAgents.includes('content') || selectedAgents.includes('meta')) && 
        !selectedAgents.includes('keyword')) {
      selectedAgents.push('keyword');
    }

    let crawlData = null;

    // Stage 1: Crawl (required)
    if (selectedAgents.includes('crawl')) {
      if (onProgress) {
        onProgress({
          type: 'agent_start',
          agent: 'crawl',
          message: 'Crawling website...',
          progress: 10
        });
      }

      try {
        crawlData = await this.agents.crawl.crawl(url);
        results.crawl = crawlData;

        if (onProgress) {
          const formattedResult = this.agents.report?.formatAgentResultForDisplay('crawl', crawlData);
          onProgress({
            type: 'agent_complete',
            agent: 'crawl',
            message: 'Crawl completed',
            progress: 20,
            result: crawlData,
            formatted: formattedResult
          });
        }
      } catch (error) {
        if (onProgress) {
          onProgress({
            type: 'agent_error',
            agent: 'crawl',
            message: error.message,
            progress: 20
          });
        }
        throw error;
      }
    }

    if (!crawlData) {
      throw new Error('Crawl data is required but crawl agent was not executed');
    }

    // Stage 2: Parallel Analysis Agents
    const parallelAgents = ['keyword', 'technical', 'schema', 'image'].filter(a => selectedAgents.includes(a));
    if (parallelAgents.length > 0) {
      if (onProgress) {
        onProgress({
          type: 'progress',
          message: `Running ${parallelAgents.length} analysis agents...`,
          progress: 30
        });
      }

      const parallelPromises = parallelAgents.map(async (agentName) => {
        if (onProgress) {
          onProgress({
            type: 'agent_start',
            agent: agentName,
            message: `Starting ${agentName}...`,
            progress: 30
          });
        }

        try {
          let result;
          const agent = this.agents[agentName];
          
          if (agentName === 'keyword') {
            result = await agent.analyze(crawlData);
          } else if (agentName === 'technical') {
            result = await agent.analyze(crawlData);
          } else if (agentName === 'schema') {
            result = await agent.analyze(crawlData);
          } else if (agentName === 'image') {
            result = await agent.analyze(crawlData);
          }

          results[agentName] = result;

          if (onProgress) {
            const formattedResult = this.agents.report?.formatAgentResultForDisplay(agentName, result);
            onProgress({
              type: 'agent_complete',
              agent: agentName,
              message: `${agentName} completed`,
              progress: 50,
              result,
              formatted: formattedResult
            });
          }
        } catch (error) {
          if (onProgress) {
            try {
              onProgress({
                type: 'agent_error',
                agent: agentName,
                message: error.message,
                progress: 50
              });
            } catch (progressError) {
              // If progress callback fails (stream closed), log and continue
              console.warn(`Failed to send agent error for ${agentName}:`, progressError.message);
            }
          }
          // Log error but don't throw - let other agents continue
          console.error(`Agent ${agentName} failed:`, error.message);
          // Store error in results so we know it failed
          results[agentName] = { error: error.message };
        }
      });

      // Use allSettled to handle errors gracefully - don't fail all agents if one fails
      await Promise.allSettled(parallelPromises);
    }

    // Stage 3: Content & Meta Optimization (depend on keyword)
    const optimizationAgents = [];
    if (selectedAgents.includes('content') && results.keyword) {
      optimizationAgents.push({ name: 'content', method: 'optimize', deps: [crawlData, results.keyword] });
    }
    if (selectedAgents.includes('meta') && results.keyword) {
      optimizationAgents.push({ name: 'meta', method: 'optimize', deps: [crawlData, results.keyword] });
    }

    if (optimizationAgents.length > 0) {
      if (onProgress) {
        onProgress({
          type: 'progress',
          message: 'Optimizing content and meta tags...',
          progress: 60
        });
      }

      const optimizationPromises = optimizationAgents.map(async ({ name, method, deps }) => {
        if (onProgress) {
          onProgress({
            type: 'agent_start',
            agent: name,
            message: `Starting ${name} optimization...`,
            progress: 60
          });
        }

        try {
          const agent = this.agents[name];
          const result = await agent[method](...deps);
          results[name] = result;

          if (onProgress) {
            try {
              // Pass crawlData for content agent to get raw content
              const formattedResult = name === 'content' 
                ? this.agents.report?.formatAgentResultForDisplay(name, result, crawlData)
                : this.agents.report?.formatAgentResultForDisplay(name, result);
              onProgress({
                type: 'agent_complete',
                agent: name,
                message: `${name} completed`,
                progress: 70,
                result,
                formatted: formattedResult
              });
            } catch (progressError) {
              console.warn(`Failed to send progress for ${name}:`, progressError.message);
            }
          }
        } catch (error) {
          if (onProgress) {
            try {
              onProgress({
                type: 'agent_error',
                agent: name,
                message: error.message,
                progress: 70
              });
            } catch (progressError) {
              console.warn(`Failed to send agent error for ${name}:`, progressError.message);
            }
          }
          // Log error but don't throw - let other agents continue
          console.error(`Agent ${name} failed:`, error.message);
          results[name] = { error: error.message };
        }
      });

      // Use allSettled to handle errors gracefully
      await Promise.allSettled(optimizationPromises);
    }

    // Stage 4: Validation
    if (selectedAgents.includes('validation')) {
      if (onProgress) {
        onProgress({
          type: 'agent_start',
          agent: 'validation',
          message: 'Validating recommendations...',
          progress: 75
        });
      }

      try {
        const validation = await this.agents.validation.validate({
          crawl: crawlData,
          keyword: results.keyword,
          content: results.content,
          meta: results.meta,
          schema: results.schema
        });
        results.validation = validation;

        if (onProgress) {
          const formattedResult = this.agents.report?.formatAgentResultForDisplay('validation', validation);
          onProgress({
            type: 'agent_complete',
            agent: 'validation',
            message: 'Validation completed',
            progress: 85,
            result: validation,
            formatted: formattedResult
          });
        }
      } catch (error) {
        if (onProgress) {
          onProgress({
            type: 'agent_error',
            agent: 'validation',
            message: error.message,
            progress: 85
          });
        }
        throw error;
      }
    }

    // Stage 5: Generate Report
    if (selectedAgents.includes('report')) {
      if (onProgress) {
        onProgress({
          type: 'agent_start',
          agent: 'report',
          message: 'Generating report...',
          progress: 85
        });
      }

      try {
        const report = await this.agents.report.generate(results, url);
        results.report = report;

        if (onProgress) {
          onProgress({
            type: 'agent_complete',
            agent: 'report',
            message: 'Report generated',
            progress: 95,
            result: report
          });
        }
      } catch (error) {
        if (onProgress) {
          onProgress({
            type: 'agent_error',
            agent: 'report',
            message: error.message,
            progress: 95
          });
        }
        throw error;
      }
    }

    // Stage 6: Learning (optional, runs in background)
    if (selectedAgents.includes('learning')) {
      try {
        await this.agents.learning.learn(results);
      } catch (error) {
        // Learning errors are non-critical
        console.error('Learning agent error:', error);
      }
    }

    return results;
  }
}

