import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AgentManager } from './core/AgentManager.js';
import { apiRoutes } from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Agent Manager
const agentManager = new AgentManager();

// API Routes
app.use('/api', apiRoutes(agentManager));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', agents: agentManager.getAgentStatus() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI SEO Ecosystem Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export { app, agentManager };

