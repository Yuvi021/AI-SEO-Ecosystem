# Backend - AI SEO Ecosystem

Backend server for the AI Multi-Agent SEO Ecosystem with OpenAI integration.

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Environment Example

Copy this into `.env` in `backend/` (values are examples/placeholders):

```bash
# Server
PORT=3001

# Auth (JWT)
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d

# MongoDB (optional but recommended)
MONGODB_URI=mongodb://localhost:27017/ai-seo-ecosystem
MONGODB_DB_NAME=ai-seo-ecosystem

# AI (OpenRouter)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o

# Cloudinary (optional for report uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=reports

KEYWORD_DATA_PROVIDER=serpapi

# SerpAPI
SERPAPI_KEY=
```

### Running

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## 🤖 AI-Powered Agents

When `OPENROUTER_API_KEY` is configured, agents provide:

### KeywordIntelligenceAgent
- **AI Features**: Semantic keyword analysis, search intent detection, competitive keywords, keyword gaps

### ContentOptimizationAgent
- **AI Features**: Content quality assessment, readability improvements, engagement tips, content gaps

### MetaTagAgent
- **AI Features**: AI-generated optimized titles and descriptions for maximum CTR

### SchemaAgent
- **AI Features**: Intelligent schema generation based on content type

### ImageIntelligenceAgent
- **AI Features**: Context-aware alt text generation

### ValidationAgent
- **AI Features**: Comprehensive quality validation with AI insights

### TechnicalSEOAgent
- **AI Features**: Advanced technical recommendations

## 📁 Structure

```
backend/
├── src/
│   ├── agents/          # SEO analysis agents (AI-enhanced)
│   ├── core/            # Agent manager
│   ├── routes/          # API routes
│   ├── utils/           # Utilities
│   │   ├── openaiService.js  # OpenRouter integration
│   │   └── sitemapParser.js
│   └── server.js        # Express server
├── reports/             # Generated reports (auto-created)
├── .env                 # Environment variables (create this)
├── .env.example         # Example environment file
└── package.json
```

## 🔌 API Endpoints
### Auth
```
POST /api/auth/signup
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd"
}

POST /api/auth/signin
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd"
}

GET /api/auth/me
Authorization: Bearer <jwt>
```
Responses include a JWT `token` and user details. Use the token in the `Authorization: Bearer <token>` header for protected routes. Passwords are stored as bcrypt hashes in MongoDB.

### JWT
Set the following environment variables for auth tokens:
```
JWT_SECRET=your-strong-secret
JWT_EXPIRES_IN=7d
```

### MongoDB
- Set `MONGODB_URI` to enable persistence. If unset, MongoDB-dependent features are disabled gracefully.

### Cloudinary (optional)
- If configured, generated reports can be uploaded to Cloudinary. Otherwise, reports remain in the local `reports/` directory.
- Required variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Optional: `CLOUDINARY_FOLDER` (default: `reports`).

### Keyword Data Providers (optional)
- Choose one via `KEYWORD_DATA_PROVIDER`: `dataforseo` | `semrush` | `valueserp` | `serpapi`.
- Provide matching credentials (see `.env.example`).

### Analyze URL (Streaming)
```
GET /api/analyze-stream?url=<url>&agents=<agents>&isSitemap=<true|false>
```

### Analyze URL (Standard)
```
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {}
}
```

### Get Agent Status
```
GET /api/agents
```

### Health Check
```
GET /health
```

## 🔧 Configuration

### OpenRouter API Key

The backend requires an OpenRouter API key for AI-powered features. Without it, agents will use basic algorithms.

1. Get API key from: https://openrouter.ai/keys
2. Add to `.env` file:
   ```
   OPENROUTER_API_KEY=or-...
   OPENROUTER_MODEL=openai/gpt-4o
   ```

### Port
Set the `PORT`

## 🧪 Testing

## 💡 AI Features

## 📝 Notes

- AI features gracefully fallback to basic algorithms if API key is missing

## 🗺️ Architecture

```mermaid
flowchart LR
    subgraph Client
      A[Next.js Frontend] -->|SSE / REST| B(API /api)
      X[Chrome Extension] -->|REST| B
    end

    subgraph Backend (Express)
      B --> M[AgentManager]
      M --> C1[CrawlAgent]
      M --> C2[KeywordIntelligenceAgent]
      M --> C3[ContentOptimizationAgent]
      M --> C4[MetaTagAgent]
      M --> C5[SchemaAgent]
      M --> C6[ImageIntelligenceAgent]
      M --> C7[TechnicalSEOAgent]
      M --> C8[ValidationAgent]
      M --> R[ReportAgent]
    end

    subgraph Infra
      DB[(MongoDB)]
      CLD[(Cloudinary)]
      EXT1[(OpenRouter)]
      EXT2[(Keyword Data APIs)]
    end

    B --> DB
    R --> CLD
    M --> EXT1
    C2 --> EXT2
```

## 🌐 Hosting
- Production (current for extension): `https://ai-seo-ecosystem.onrender.com/api` (Render)
- Local development: `http://localhost:3001`