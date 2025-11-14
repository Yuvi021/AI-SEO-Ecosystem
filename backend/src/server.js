import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AgentManager } from './core/AgentManager.js';
import { apiRoutes } from './routes/api.js';
import { connectToMongo, disconnectMongo, getMongoStatus } from './db/mongo.js';
import { authRoutes } from './routes/auth.js';
import { initCloudinary } from './utils/cloudinary.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// const allowedOrigins = ['https://aiseoecosystem.netlify.app','http://localhost:3000'];
const allowedOrigins = ['*'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cache-Control','X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Initialize Agent Manager
const agentManager = new AgentManager();

// API Routes
app.use('/api', apiRoutes(agentManager));
app.use('/api/auth', authRoutes());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agents: agentManager.getAgentStatus(),
    mongo: getMongoStatus(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI SEO Ecosystem Server running on ${PORT}`);
  console.log(`📊 Health check: ${PORT}/health`);

  // Initialize MongoDB connection (non-blocking)
  connectToMongo().catch((err) => {
    console.error('MongoDB initialization error:', err?.message || err);
  });

  // Initialize Cloudinary (non-blocking)
  try {
    initCloudinary();
  } catch (e) {
    console.error('Cloudinary init error:', e?.message || e);
  }
});

// Graceful shutdown
const shutdown = async () => {
  await disconnectMongo();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { app, agentManager };

