# AI Multi-Agent SEO Ecosystem

A comprehensive, autonomous SEO optimization platform powered by 10 specialized AI micro-agents. Each agent focuses on a specific aspect of SEO, collaborating to provide unique, actionable recommendations.

## 🏗️ Project Structure

```
├── backend/              # Express.js backend server
│   ├── src/              # Source code
│   │   ├── agents/       # SEO analysis agents
│   │   ├── core/         # Agent manager
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utilities
│   ├── reports/          # Generated reports
│   └── package.json
│
├── frontend/             # Next.js frontend
│   ├── app/              # Next.js app directory
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── package.json
│
└── chrome-extension/     # Chrome extension (optional)
```

## 🚀 Quick Start

### Option 1: Install Everything (Recommended)

```bash
# Install all dependencies
npm run install:all

# Start backend (Terminal 1)
npm run backend

# Start frontend (Terminal 2)
npm run frontend
```

### Option 2: Install Separately

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🌐 Access

- **Frontend**: `http://localhost:3000` (or 3001 if 3000 is taken)
- **Backend API**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/health`

## 🎯 Features

- **10 Specialized Agents**: Crawl, Keyword Intelligence, Content Optimization, Schema, Technical SEO, Meta Tags, Image Intelligence, Validation, Reporting, and Learning
- **Real-Time Analysis**: Streaming progress updates via Server-Sent Events
- **Sitemap Support**: Analyze entire sitemaps or single URLs
- **Agent Selection**: Choose which agents to run
- **Comprehensive Reporting**: Generates beautiful HTML reports with actionable insights
- **Modern UI**: Next.js frontend with Tailwind CSS
- **TypeScript**: Type-safe frontend code

## 📊 API Endpoints

### Streaming Analysis
```
GET /api/analyze-stream?url=<url>&agents=<agents>&isSitemap=<true|false>
```

### Standard Analysis
```
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Agent Status
```
GET /api/agents
```

## 🧪 Testing

1. **Start Backend**: `npm run backend` (or `cd backend && npm start`)
2. **Start Frontend**: `npm run frontend` (or `cd frontend && npm run dev`)
3. **Open Browser**: `http://localhost:3000`
4. **Enter URL**: `https://example.com` or sitemap URL
5. **Select Agents**: Choose which agents to run
6. **Click "Start Analysis"**: Watch real-time progress!

## 📁 Detailed Documentation

- **Backend**: See `backend/README.md`
- **Frontend**: See `frontend/README.md`
- **Testing**: See `TESTING.md`
- **Quick Start**: See `QUICKSTART.md`

## 🔧 Configuration

### Backend Port
Edit `backend/src/server.js` (currently set to 3001):
```javascript
const PORT = process.env.PORT || 3001;
```

### Frontend API URL
Edit `frontend/app/lib/constants.ts` (currently set to 3001):
```typescript
export const API_URL = 'http://localhost:3001/api';
```

## 🎨 Chrome Extension

The Chrome extension is available in the `chrome-extension/` folder. See the main README for setup instructions.

## 📝 Example Usage

### Single URL Analysis
1. Enter: `https://example.com`
2. Select agents (all selected by default)
3. Click "Start Analysis"
4. View results as they stream in

### Sitemap Analysis
1. Enter: `https://example.com/sitemap.xml`
2. Select agents
3. Click "Start Analysis"
4. Watch as each URL is processed

## 🏗️ Architecture

### Processing Pipeline

```
URL Input (Single or Sitemap)
  ↓
Sitemap Parser (if sitemap)
  ↓
Crawl Agent (Data Extraction)
  ↓
Parallel Analysis (Keyword, Technical, Schema, Image)
  ↓
Content & Meta Optimization
  ↓
Validation
  ↓
Report Generation
  ↓
Stream Results to Frontend
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Node.js, Express, Next.js, and AI-powered agents
