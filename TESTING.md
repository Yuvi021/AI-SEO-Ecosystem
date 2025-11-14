# Testing Guide - Multi-Agent SEO Analysis with Streaming

## Quick Start

### 1. Start the Server

Open a terminal in the project directory and run:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 2. Open the Frontend

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the "AI SEO Ecosystem" interface with:
- URL input field
- Agent selection checkboxes
- Start Analysis button

## Testing Scenarios

### Test 1: Single URL Analysis

1. **Enter a single website URL** in the input field:
   ```
   https://example.com
   ```
   or
   ```
   https://www.bitontree.com
   ```

2. **Select agents** you want to run (all are selected by default):
   - Uncheck some agents to test selective execution
   - At minimum, keep "Crawl Agent" checked (it's required)

3. **Click "Start Analysis"**

4. **What to expect:**
   - Progress bar will show percentage
   - Real-time log entries showing:
     - "Starting crawl..."
     - "Crawl completed"
     - "Starting keyword..."
     - "Starting technical..."
     - etc.
   - Results will appear as each agent completes
   - Each result card shows the agent name and JSON output

### Test 2: Sitemap URL Analysis

1. **Enter a sitemap URL** in the input field:
   ```
   https://example.com/sitemap.xml
   ```
   or
   ```
   https://www.bitontree.com/sitemap.xml
   ```

2. **Select agents** (you can select all or specific ones)

3. **Click "Start Analysis"**

4. **What to expect:**
   - First log: "Parsing sitemap..."
   - Then: "Sitemap parsed: Found X URL(s) to analyze"
   - Progress will show processing of each URL
   - Results will be organized by URL
   - Each URL will have its own set of agent results

### Test 3: Selective Agent Execution

1. **Enter a URL** (single or sitemap)

2. **Uncheck most agents**, leaving only:
   - ✅ Crawl Agent (required)
   - ✅ Keyword Intelligence
   - ✅ Technical SEO

3. **Click "Start Analysis"**

4. **What to expect:**
   - Only selected agents will run
   - Log will show only those agents starting/completing
   - Results section will only show results from selected agents

### Test 4: Error Handling

1. **Enter an invalid URL**:
   ```
   https://this-does-not-exist-12345.com
   ```

2. **Click "Start Analysis"**

3. **What to expect:**
   - Error message in the log
   - Progress stops
   - Error status shown

## What to Look For

### ✅ Success Indicators

- **Progress bar** animates smoothly from 0% to 100%
- **Real-time log** shows agent start/complete messages
- **Results cards** appear as agents complete
- **JSON output** is properly formatted in result cards
- **Multiple URLs** from sitemap are processed sequentially
- **Agent selection** works - only selected agents run

### ⚠️ Common Issues

1. **Server not running**: Make sure `npm start` is running
2. **CORS errors**: Server should have CORS enabled (already configured)
3. **No results**: Check browser console for errors
4. **Streaming stops**: Check server logs for errors

## Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: For any JavaScript errors
- **Network tab**: 
  - Look for `/api/analyze-stream` request
  - Should show "EventStream" type
  - Should have status 200

## Server Logs

Watch the terminal where the server is running:
- Should show agent execution logs
- Any errors will appear here
- Task IDs are logged for debugging

## Example Test URLs

### Single URLs:
- `https://example.com`
- `https://www.bitontree.com`
- `https://www.google.com`

### Sitemap URLs:
- `https://example.com/sitemap.xml`
- `https://www.bitontree.com/sitemap.xml`
- `https://www.sitemaps.org/sitemap.xml`

## Troubleshooting

### Issue: "Connection error. Retrying..."
- **Solution**: Check if server is running on port 3000
- **Solution**: Check browser console for CORS errors

### Issue: No progress updates
- **Solution**: Check Network tab - is the EventStream connection established?
- **Solution**: Check server logs for errors

### Issue: Agents not running
- **Solution**: Make sure at least "Crawl Agent" is selected
- **Solution**: Check server logs for agent errors

### Issue: Sitemap parsing fails
- **Solution**: Verify the sitemap URL is accessible
- **Solution**: Check if sitemap format is valid XML

## API Testing (Optional)

You can also test the API directly using curl:

```bash
# Test streaming endpoint
curl -N "http://localhost:3000/api/analyze-stream?url=https://example.com&agents=crawl,keyword,technical"
```

The `-N` flag disables buffering so you can see the stream in real-time.

