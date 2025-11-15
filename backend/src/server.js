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
const allowedOrigins = [
  'https://aiseoecosystem.netlify.app',
  'http://localhost:3000',
  'chrome-extension://nlnpaghkilhbiikaceklcagmddgfbcgi'
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like Postman, curl, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Always allow all chrome-extension origins (check this first)
    if (typeof origin === 'string' && origin.startsWith('chrome-extension://')) {
      console.log(`✅ Allowing chrome-extension origin: ${origin}`);
      return callback(null, true);
    }
    
    // Check allowed origins list
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Allowing origin: ${origin}`);
      return callback(null, true);
    }
    
    // Reject all other origins
    console.log(`❌ Rejecting origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cache-Control','X-Requested-With','Accept','Accept-Language','Cache-Control','Pragma','Priority','Sec-CH-UA','Sec-CH-UA-Mobile','Sec-CH-UA-Platform','Sec-Fetch-Dest','Sec-Fetch-Mode','Sec-Fetch-Site','User-Agent'],
  exposedHeaders: ['Content-Type','Authorization'],
  maxAge: 86400, // 24 hours
};

// Log CORS requests for debugging (before CORS middleware)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    console.log(`🌐 Request from origin: ${origin}, method: ${req.method}, path: ${req.path}`);
  }
  next();
});

// Apply CORS middleware - this handles both regular requests and OPTIONS preflight
app.use(cors(corsOptions));

// Error handler for CORS errors (must be after CORS middleware)
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    console.error(`❌ CORS Error: ${err.message}`);
    const origin = req.headers.origin;
    res.status(403).json({
      error: err.message,
      origin: origin,
      allowedOrigins: allowedOrigins,
      isChromeExtension: origin?.startsWith('chrome-extension://')
    });
    return;
  }
  next(err);
});

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

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  const origin = req.headers.origin;
  res.json({
    message: 'CORS test successful',
    origin: origin,
    isChromeExtension: origin?.startsWith('chrome-extension://'),
    timestamp: new Date().toISOString()
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

