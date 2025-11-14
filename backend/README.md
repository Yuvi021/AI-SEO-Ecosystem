# Backend - AI SEO Ecosystem

Backend server for the AI Multi-Agent SEO Ecosystem with OpenAI integration.

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Configuration

1. **Set up OpenAI API Key** (Required for AI features):

   Create a `.env` file in the `backend` directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Get your API key from: https://platform.openai.com/api-keys

   > **Note**: Without an API key, agents will use basic algorithms as fallback.

2. **Optional Environment Variables**:
   ```bash
   PORT=3001
   OPENAI_MODEL=gpt-4-turbo-preview
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/ai-seo-ecosystem
   MONGODB_DB_NAME=ai-seo-ecosystem
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

All agents now use OpenAI for enhanced analysis when API key is configured:

### KeywordIntelligenceAgent
- **AI Features**: Semantic keyword analysis, search intent detection, competitive keywords, keyword gaps
- **Fallback**: Basic frequency analysis

### ContentOptimizationAgent
- **AI Features**: Content quality assessment, readability improvements, engagement tips, content gaps
- **Fallback**: Basic readability and structure analysis

### MetaTagAgent
- **AI Features**: AI-generated optimized titles and descriptions for maximum CTR
- **Fallback**: Rule-based optimization

### SchemaAgent
- **AI Features**: Intelligent schema generation based on content type
- **Fallback**: Template-based schema generation

### ImageIntelligenceAgent
- **AI Features**: Context-aware alt text generation
- **Fallback**: Filename-based alt text suggestions

### ValidationAgent
- **AI Features**: Comprehensive quality validation with AI insights
- **Fallback**: Rule-based validation

### TechnicalSEOAgent
- **AI Features**: Advanced technical recommendations
- **Fallback**: Basic technical checks

## 📁 Structure

```
backend/
├── src/
│   ├── agents/          # SEO analysis agents (AI-enhanced)
│   ├── core/            # Agent manager
│   ├── routes/          # API routes
│   ├── utils/           # Utilities
│   │   ├── openaiService.js  # OpenAI integration
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
  "email": "user@example.com",  // or "emailId"
  "password": "StrongP@ssw0rd"
}

POST /api/auth/signin
Content-Type: application/json
{
  "email": "user@example.com",  // or "emailId"
  "password": "StrongP@ssw0rd"
}

GET /api/auth/me
Authorization: Bearer <jwt>
```
Responses include a JWT `token` and user details. Use the token in the `Authorization: Bearer <token>` header for protected routes. Passwords are stored as bcrypt hashes in MongoDB.

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

### OpenAI API Key

The backend requires an OpenAI API key for AI-powered features. Without it, agents will use basic algorithms.

1. Get API key from: https://platform.openai.com/api-keys
2. Add to `.env` file:
   ```
   OPENAI_API_KEY=sk-...
   ```

### Port
Set the `PORT` environment variable or modify `src/server.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

### CORS
CORS is enabled by default. To configure, edit `src/server.js`.

### JWT
Set the following environment variables for auth tokens:
```
JWT_SECRET=your-strong-secret
JWT_EXPIRES_IN=7d
```

## 📊 Reports

Reports are automatically saved to `backend/reports/` directory in both HTML and JSON formats.

## 🧪 Testing

```bash
npm test
```

## 💡 AI Features

When OpenAI API key is configured, agents provide:

- **Enhanced Keyword Analysis**: Semantic understanding, search intent, competitive keywords
- **AI-Generated Meta Tags**: Optimized titles and descriptions for maximum CTR
- **Intelligent Content Optimization**: AI-powered readability and engagement suggestions
- **Context-Aware Alt Text**: AI-generated descriptive alt text for images
- **Advanced Schema Generation**: Content-aware structured data
- **Comprehensive Validation**: AI-powered quality assessment

## 📝 Notes

- The backend uses ES modules (`type: "module"`)
- All agents are located in `src/agents/`
- The AgentManager coordinates all agent execution
- Streaming is implemented using Server-Sent Events (SSE)
- AI features gracefully fallback to basic algorithms if API key is missing

## ⚠️ Important

- **OpenAI API Costs**: Using AI features will consume OpenAI API credits
- **Rate Limits**: Be aware of OpenAI rate limits for production use
- **API Key Security**: Never commit your `.env` file to version control
