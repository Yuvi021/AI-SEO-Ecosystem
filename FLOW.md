# AI SEO Ecosystem - Complete Flow Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Environment Configuration](#environment-configuration)
6. [Complete Application Flow](#complete-application-flow)
7. [Agent Workflow](#agent-workflow)
8. [API Endpoints](#api-endpoints)
9. [Data Flow](#data-flow)
10. [Running the Application](#running-the-application)

---

## 🎯 Project Overview

The **AI SEO Ecosystem** is a full-stack application that uses multiple AI agents to analyze and optimize websites for SEO. It consists of:

- **Frontend**: Next.js 14 application with TypeScript and Tailwind CSS
- **Backend**: Express.js server with multiple specialized SEO agents
- **Communication**: Server-Sent Events (SSE) for real-time progress updates

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │
         │ HTTP/SSE
         │
         ▼
┌─────────────────┐
│   Backend       │
│   (Express.js)  │
│   Port: 3001    │
└────────┬────────┘
         │
         │
         ▼
┌─────────────────┐
│  AI Agents      │
│  (9 Agents)     │
└─────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- Server-Sent Events (SSE) for real-time updates

**Backend:**
- Express.js
- Node.js (ES Modules)
- Multiple AI agents for SEO analysis
- OpenAI integration (optional)

---

## 📁 Project Structure

```
AI-SEO-Ecosystem/
├── frontend/                 # Next.js frontend application
│   ├── app/
│   │   ├── analyze/         # Analysis page
│   │   ├── components/      # React components
│   │   ├── lib/
│   │   │   └── constants.ts # API URL and agent definitions
│   │   └── page.tsx         # Home page
│   ├── .env.local           # Frontend environment variables
│   └── .gitignore
│
├── backend/                 # Express.js backend server
│   ├── src/
│   │   ├── agents/          # Individual AI agents
│   │   ├── core/
│   │   │   └── AgentManager.js  # Orchestrates agents
│   │   ├── routes/
│   │   │   └── api.js       # API endpoints
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Express server
│   ├── reports/             # Generated reports (gitignored)
│   ├── .env                 # Backend environment variables
│   └── .gitignore
│
├── .gitignore               # Root gitignore
└── package.json            # Workspace configuration
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### Step 2: Environment Configuration

#### Frontend Environment (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### Backend Environment (`backend/.env`)
```env
PORT=3001
# OPENAI_API_KEY=your_openai_api_key_here  # Optional
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
npm run backend:dev
# or
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
# or
cd frontend && npm run dev
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

---

## ⚙️ Environment Configuration

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |

**Note**: In Next.js, environment variables exposed to the browser must be prefixed with `NEXT_PUBLIC_`.

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | - |

### How Environment Variables Work

1. **Frontend** reads `NEXT_PUBLIC_API_URL` from `frontend/.env.local`
2. **Backend** reads `PORT` from `backend/.env`
3. The frontend connects to the backend using the configured API URL
4. All `.env` files are gitignored for security

---

## 🔄 Complete Application Flow

### High-Level Flow Diagram

```
User Input (URL)
      │
      ▼
┌─────────────────┐
│  Frontend UI    │
│  (Next.js)      │
└────────┬────────┘
         │
         │ 1. User enters URL
         │ 2. User selects agents
         │ 3. Clicks "Start Analysis"
         │
         ▼
┌─────────────────┐
│  EventSource    │
│  (SSE Client)   │
└────────┬────────┘
         │
         │ GET /api/analyze-stream?url=...&agents=...
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Express.js)   │
└────────┬────────┘
         │
         │ 4. Parse sitemap (if needed)
         │ 5. Initialize AgentManager
         │
         ▼
┌─────────────────┐
│ AgentManager    │
│ (Orchestrator)  │
└────────┬────────┘
         │
         │ 6. Process URLs with selected agents
         │ 7. Stream progress via SSE
         │
         ▼
┌─────────────────┐
│  AI Agents      │
│  (9 Agents)     │
└────────┬────────┘
         │
         │ 8. Execute agents in stages
         │ 9. Return results
         │
         ▼
┌─────────────────┐
│  Results        │
│  (JSON/HTML)    │
└─────────────────┘
```

### Detailed Step-by-Step Flow

#### 1. **User Interaction (Frontend)**

```typescript
// User enters URL in frontend/app/analyze/page.tsx
const handleStartAnalysis = () => {
  // Validate input
  if (!url.trim()) return;
  if (selectedAgents.length === 0) return;
  
  // Create EventSource connection
  const eventSource = new EventSource(
    `${API_URL}/analyze-stream?url=${url}&agents=${selectedAgents.join(',')}`
  );
  
  // Listen for SSE events
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleStreamEvent(data);
  };
};
```

#### 2. **Backend Receives Request**

```javascript
// backend/src/routes/api.js
router.get('/analyze-stream', async (req, res) => {
  const { url, agents, isSitemap } = req.query;
  
  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  
  // Parse sitemap if needed
  if (isSitemap === 'true') {
    const sitemapUrls = await sitemapParser.parseSitemap(url);
    urlsToProcess = sitemapUrls;
  }
  
  // Process with streaming
  await agentManager.processURLWithStreaming(urlsToProcess, {
    selectedAgents: agents.split(','),
    onProgress: (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)
  });
});
```

#### 3. **Agent Manager Orchestration**

```javascript
// backend/src/core/AgentManager.js
async processSingleURLWithAgents(url, selectedAgents, onProgress) {
  // Stage 1: Crawl (required)
  crawlData = await this.agents.crawl.crawl(url);
  
  // Stage 2: Parallel Analysis
  await Promise.all([
    this.agents.keyword.analyze(crawlData),
    this.agents.technical.analyze(crawlData),
    this.agents.schema.analyze(crawlData),
    this.agents.image.analyze(crawlData)
  ]);
  
  // Stage 3: Content & Meta Optimization
  await Promise.all([
    this.agents.content.optimize(crawlData, keywordAnalysis),
    this.agents.meta.optimize(crawlData, keywordAnalysis)
  ]);
  
  // Stage 4: Validation
  await this.agents.validation.validate({...});
  
  // Stage 5: Generate Report
  await this.agents.report.generate(results, url);
}
```

#### 4. **Real-Time Progress Updates**

The backend streams progress updates via Server-Sent Events:

```javascript
// Progress event types
{
  type: 'progress',        // General progress update
  type: 'agent_start',     // Agent started
  type: 'agent_complete',  // Agent completed
  type: 'agent_error',     // Agent error
  type: 'url_processing',  // Processing URL
  type: 'sitemap_parsed',  // Sitemap parsed
  type: 'complete',        // Analysis complete
  type: 'error'            // Error occurred
}
```

#### 5. **Frontend Updates UI**

```typescript
// frontend/app/analyze/page.tsx
const handleStreamEvent = (data: any) => {
  switch (data.type) {
    case 'progress':
      setProgress(data.progress);
      setProgressMessage(data.message);
      break;
    case 'agent_complete':
      setResults(prev => ({
        ...prev,
        [data.url]: {
          ...prev[data.url],
          [data.agent]: data.result
        }
      }));
      break;
    case 'complete':
      setIsAnalyzing(false);
      break;
  }
};
```

---

## 🤖 Agent Workflow

### Available Agents

| Agent ID | Name | Description | Dependencies |
|----------|------|-------------|--------------|
| `crawl` | Crawl Agent | Extracts HTML, metadata, headings, links | None (always required) |
| `keyword` | Keyword Intelligence | Detects missing keywords and suggests terms | crawl |
| `content` | Content Optimization | Analyzes readability and structure | crawl, keyword |
| `schema` | Schema Agent | Generates and validates structured data | crawl |
| `technical` | Technical SEO | Checks Core Web Vitals and performance | crawl |
| `meta` | Meta Tags | Generates optimized meta titles and descriptions | crawl, keyword |
| `image` | Image Intelligence | Analyzes alt text and image optimization | crawl |
| `validation` | Validation | Ensures output quality and SEO compliance | All previous |
| `report` | Report Generation | Generates comprehensive HTML reports | All previous |

### Agent Execution Stages

```
Stage 1: Crawl (Required)
    │
    ├─► CrawlAgent.crawl(url)
    │   └─► Returns: HTML, metadata, headings, links
    │
Stage 2: Parallel Analysis (Independent)
    │
    ├─► KeywordIntelligenceAgent.analyze(crawlData)
    ├─► TechnicalSEOAgent.analyze(crawlData)
    ├─► SchemaAgent.analyze(crawlData)
    └─► ImageIntelligenceAgent.analyze(crawlData)
    │
Stage 3: Optimization (Depends on keyword)
    │
    ├─► ContentOptimizationAgent.optimize(crawlData, keywordAnalysis)
    └─► MetaTagAgent.optimize(crawlData, keywordAnalysis)
    │
Stage 4: Validation (Depends on all previous)
    │
    └─► ValidationAgent.validate({crawl, keyword, content, meta, schema})
    │
Stage 5: Report Generation (Optional)
    │
    └─► ReportAgent.generate(results, url)
    │
Stage 6: Learning (Background, Optional)
    │
    └─► LearningAgent.learn(results)
```

### Agent Dependency Resolution

The `AgentManager` automatically resolves dependencies:

```javascript
// If content or meta is selected, keyword is automatically added
if ((selectedAgents.includes('content') || selectedAgents.includes('meta')) 
    && !selectedAgents.includes('keyword')) {
  selectedAgents.push('keyword');
}

// Crawl is always required
if (!selectedAgents.includes('crawl')) {
  selectedAgents.unshift('crawl');
}
```

---

## 🌐 API Endpoints

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: Set via `NEXT_PUBLIC_API_URL` environment variable

### Endpoints

#### 1. **Streaming Analysis** (SSE)
```
GET /api/analyze-stream
```

**Query Parameters:**
- `url` (required): URL or sitemap URL to analyze
- `agents` (optional): Comma-separated list of agent IDs
- `isSitemap` (optional): "true" if URL is a sitemap

**Response:** Server-Sent Events stream

**Example:**
```javascript
const eventSource = new EventSource(
  'http://localhost:3001/api/analyze-stream?url=https://example.com&agents=crawl,keyword,technical'
);
```

#### 2. **Standard Analysis** (JSON)
```
POST /api/analyze
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "options": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "crawl": {...},
    "keyword": {...},
    "technical": {...},
    ...
  }
}
```

#### 3. **Get Agent Status**
```
GET /api/agents
```

**Response:**
```json
{
  "agents": [
    { "name": "crawl", "status": "ready" },
    { "name": "keyword", "status": "ready" },
    ...
  ]
}
```

#### 4. **Run Specific Agent**
```
POST /api/agent/:agentName
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "data": {...}
}
```

#### 5. **Health Check**
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "agents": [...]
}
```

---

## 📊 Data Flow

### Request Flow

```
Frontend (Next.js)
    │
    │ 1. User submits form
    │    - URL: "https://example.com"
    │    - Agents: ["crawl", "keyword", "technical"]
    │
    ▼
EventSource Connection
    │
    │ 2. GET /api/analyze-stream?url=...&agents=...
    │
    ▼
Backend API Route (api.js)
    │
    │ 3. Parse query parameters
    │ 4. Check if sitemap
    │ 5. Initialize SSE stream
    │
    ▼
AgentManager
    │
    │ 6. processURLWithStreaming()
    │ 7. For each URL:
    │    - processSingleURLWithAgents()
    │
    ▼
Individual Agents
    │
    │ 8. Execute agents in stages
    │ 9. Send progress via onProgress callback
    │
    ▼
SSE Stream
    │
    │ 10. Stream events to frontend
    │     - progress updates
    │     - agent completions
    │     - results
    │
    ▼
Frontend Updates
    │
    │ 11. Update UI in real-time
    │ 12. Display results
    │ 13. Generate reports
```

### Response Flow

```
Agent Results
    │
    │ { agent: "crawl", result: {...} }
    │
    ▼
AgentManager.onProgress()
    │
    │ { type: "agent_complete", agent: "crawl", result: {...} }
    │
    ▼
API Route sendProgress()
    │
    │ res.write(`data: ${JSON.stringify(data)}\n\n`)
    │
    ▼
SSE Stream
    │
    │ Event: data: {"type":"agent_complete",...}
    │
    ▼
Frontend EventSource.onmessage
    │
    │ JSON.parse(event.data)
    │
    ▼
handleStreamEvent()
    │
    │ Update React state
    │ - setProgress()
    │ - setResults()
    │ - setLogEntries()
    │
    ▼
UI Re-renders
    │
    │ Display updated information
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### Production Mode

**Build Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Start Backend:**
```bash
cd backend
npm start
```

### Using Root Scripts

```bash
# Install all dependencies
npm run install:all

# Start backend in dev mode
npm run backend:dev

# Start frontend
npm run frontend

# Build frontend
npm run frontend:build
```

---

## 🔧 Configuration Files

### Frontend Configuration

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**`frontend/next.config.js`**
```javascript
const nextConfig = {
  reactStrictMode: true,
};
```

### Backend Configuration

**`backend/.env`**
```env
PORT=3001
OPENAI_API_KEY=your_key_here  # Optional
```

**`backend/src/server.js`**
```javascript
const PORT = process.env.PORT || 3001;
```

---

## 📝 Key Files Reference

### Frontend
- **`frontend/app/analyze/page.tsx`**: Main analysis page with SSE client
- **`frontend/app/lib/constants.ts`**: API URL and agent definitions
- **`frontend/app/components/`**: React components (AgentSelection, ProgressSection, ResultsSection)

### Backend
- **`backend/src/server.js`**: Express server setup
- **`backend/src/routes/api.js`**: API route handlers
- **`backend/src/core/AgentManager.js`**: Agent orchestration
- **`backend/src/agents/`**: Individual agent implementations

---

## 🐛 Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
   - Verify backend is running on port 3001
   - Check CORS settings in backend

2. **SSE connection fails**
   - Ensure backend is running
   - Check browser console for errors
   - Verify API URL is correct

3. **Agents not executing**
   - Check agent dependencies
   - Verify crawl agent is included (required)
   - Check backend logs for errors

4. **Environment variables not working**
   - Restart Next.js dev server after changing `.env.local`
   - Ensure variables are prefixed with `NEXT_PUBLIC_` for browser access
   - Check file is named `.env.local` (not `.env`)

---

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Documentation**: https://expressjs.com/
- **Server-Sent Events**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

---

## 📄 License

MIT

---

**Last Updated**: 2024

