# OpenAI Integration Setup Guide

## Overview

The backend now uses OpenAI models to enhance all SEO agents with advanced AI-powered analysis. This provides more accurate, intelligent, and actionable SEO insights.

## 🚀 Quick Setup

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure Backend

1. Navigate to `backend` directory
2. Create a `.env` file:
   ```bash
   cd backend
   touch .env
   ```

3. Add your API key:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   PORT=3001
   ```

### 3. Install Dependencies

```bash
cd backend
npm install
```

This will install the `openai` package.

### 4. Start the Server

```bash
npm start
```

## 🤖 AI-Enhanced Agents

### KeywordIntelligenceAgent
**AI Features:**
- Semantic keyword analysis
- Search intent detection (informational, commercial, navigational, transactional)
- Competitive keyword opportunities
- Keyword gap analysis with reasoning
- Long-tail keyword suggestions based on content context

**Prompting Strategy:**
- Uses GPT-4 for comprehensive keyword analysis
- Analyzes content context for semantic understanding
- Provides data-driven keyword opportunities

### ContentOptimizationAgent
**AI Features:**
- Content quality scoring (0-100)
- Specific readability improvements
- Engagement enhancement tips
- Content gap identification
- Structure recommendations
- Suggested intro/conclusion paragraphs

**Prompting Strategy:**
- Deep content analysis with quality metrics
- Actionable improvement suggestions
- Context-aware recommendations

### MetaTagAgent
**AI Features:**
- AI-generated optimized titles (50-60 chars)
- AI-generated meta descriptions (150-160 chars)
- CTR-optimized content
- Unique, non-duplicate generation
- Keyword-rich but natural language

**Prompting Strategy:**
- Focuses on click-through rate optimization
- Natural keyword integration
- Compelling, engaging copy

### SchemaAgent
**AI Features:**
- Intelligent schema type detection
- Content-aware schema generation
- Complete Schema.org compliant markup
- Appropriate schema selection based on page type

**Prompting Strategy:**
- Analyzes page content to determine schema types
- Generates complete, valid JSON-LD
- Includes all relevant properties

### ImageIntelligenceAgent
**AI Features:**
- Context-aware alt text generation
- SEO-optimized descriptions
- Keyword-rich but natural alt text
- Accessibility-compliant suggestions

**Prompting Strategy:**
- Uses page context for accurate descriptions
- Balances SEO and accessibility
- Natural language descriptions

### ValidationAgent
**AI Features:**
- Comprehensive quality scoring
- AI-identified critical issues
- Specific fix recommendations
- Quality assessment with strengths/weaknesses

**Prompting Strategy:**
- Thorough quality auditing
- Actionable feedback
- Priority-based recommendations

### TechnicalSEOAgent
**AI Features:**
- Advanced technical recommendations
- Performance optimization strategies
- Detailed fix instructions
- Impact assessment

**Prompting Strategy:**
- Technical SEO expertise
- Specific, actionable fixes
- Detailed implementation guidance

## 📊 Model Configuration

### Default Model
- **Model**: `gpt-4-turbo-preview`
- **Temperature**: Varies by agent (0.3-0.8)
- **Max Tokens**: 500-3000 depending on task

### Customization

You can customize the model in `backend/src/utils/openaiService.js`:

```javascript
const {
  model = 'gpt-4-turbo-preview',  // Change default model
  temperature = 0.7,
  maxTokens = 1000,
} = options;
```

Or set environment variable:
```
OPENAI_MODEL=gpt-4-turbo-preview
```

## 💰 Cost Considerations

### Estimated Costs (GPT-4 Turbo)
- **Keyword Analysis**: ~$0.01-0.03 per analysis
- **Content Optimization**: ~$0.02-0.05 per analysis
- **Meta Tags**: ~$0.01-0.02 per analysis
- **Schema Generation**: ~$0.02-0.04 per analysis
- **Image Alt Text**: ~$0.001-0.005 per image
- **Validation**: ~$0.02-0.04 per analysis

**Total per full analysis**: ~$0.10-0.20 (depending on content size)

### Cost Optimization Tips

1. **Use GPT-3.5-turbo** for less critical tasks:
   - Edit `openaiService.js` to use `gpt-3.5-turbo` for specific agents
   - Costs ~10x less than GPT-4

2. **Limit content preview size**:
   - Agents analyze first 1000-3000 characters
   - Adjust in agent files if needed

3. **Cache results**:
   - Implement caching for repeated analyses
   - Reduces API calls

## 🔄 Fallback Behavior

If OpenAI API key is **not configured** or API calls **fail**:
- Agents automatically fallback to basic algorithms
- All functionality remains available
- Results are still accurate, just less AI-enhanced
- No errors thrown, graceful degradation

## 🧪 Testing

### Test with API Key

```bash
# Set API key
export OPENAI_API_KEY=sk-your-key

# Start server
npm start

# Test analysis
curl "http://localhost:3001/api/analyze-stream?url=https://example.com&agents=keyword,meta"
```

### Test without API Key

```bash
# Don't set API key
npm start

# Agents will use basic algorithms
# All features still work
```

## 🔒 Security

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use environment variables** in production
3. **Rotate API keys** regularly
4. **Monitor usage** on OpenAI dashboard
5. **Set usage limits** on OpenAI account

## 📈 Performance

- **AI calls are async** - Don't block other agents
- **Parallel processing** - Multiple agents can use AI simultaneously
- **Error handling** - Graceful fallback on failures
- **Caching** - Consider implementing result caching

## 🐛 Troubleshooting

### "OpenAI API key not configured"
- Check `.env` file exists in `backend/` directory
- Verify `OPENAI_API_KEY` is set correctly
- Restart server after adding key

### "OpenAI API call failed"
- Check API key is valid
- Verify you have credits on OpenAI account
- Check rate limits
- Review error message in server logs

### High costs
- Switch to GPT-3.5-turbo for some agents
- Reduce content preview sizes
- Implement caching
- Monitor usage on OpenAI dashboard

## 📝 Example Usage

```javascript
// Agents automatically use AI if available
const results = await agentManager.processURL('https://example.com', {
  selectedAgents: ['keyword', 'content', 'meta'],
  onProgress: (data) => console.log(data)
});

// Results include AI-enhanced insights
console.log(results.keyword.semanticKeywords);  // AI-generated
console.log(results.meta.title.optimized);      // AI-optimized
console.log(results.content.aiSuggestions);     // AI recommendations
```

## 🎯 Best Practices

1. **Start with GPT-4** for best results
2. **Monitor costs** regularly
3. **Use caching** for repeated analyses
4. **Implement rate limiting** for production
5. **Test fallback behavior** without API key
6. **Review AI suggestions** before implementing

---

**Note**: AI features are optional but highly recommended for the best SEO analysis results!

