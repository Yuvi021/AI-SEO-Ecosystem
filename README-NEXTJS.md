# Next.js Frontend Setup

This project now includes a modern Next.js frontend for the AI SEO Ecosystem.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install both backend and frontend dependencies including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### 2. Start the Backend Server

In one terminal:

```bash
npm start
```

The backend will run on `http://localhost:3000`

### 3. Start the Next.js Frontend

In another terminal:

```bash
npm run frontend
```

The frontend will run on `http://localhost:3000` (Next.js will automatically use port 3000, but if it's taken, it will use 3001)

**Note**: Since the backend is on port 3000, Next.js will detect the conflict and run on port 3001. The frontend is configured to connect to `http://localhost:3000/api` for the backend API.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   │   ├── AgentSelection.tsx
│   │   ├── ProgressSection.tsx
│   │   └── ResultsSection.tsx
│   ├── lib/                # Utilities and constants
│   │   └── constants.ts
│   ├── globals.css         # Global styles with Tailwind
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── src/                    # Backend server
│   ├── agents/            # SEO agents
│   ├── core/              # Agent manager
│   ├── routes/            # API routes
│   └── server.js          # Express server
├── public/                # Static files (old frontend, can be removed)
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎨 Features

### Modern UI with Tailwind CSS
- Responsive design
- Beautiful gradient backgrounds
- Smooth animations
- Professional card layouts

### Real-time Streaming
- Server-Sent Events (SSE) for live updates
- Progress bar with percentage
- Real-time log entries
- Agent status updates

### Agent Selection
- Checkbox interface for selecting agents
- All agents selected by default
- Crawl agent is required and cannot be deselected
- Select All / Deselect All buttons

### Results Display
- Expandable result cards
- Organized by URL (for sitemap analysis)
- JSON formatted output
- Color-coded status indicators

## 🔧 Configuration

### Backend API URL

The frontend connects to the backend API. By default, it uses:
- `http://localhost:3000/api`

To change this, update `app/lib/constants.ts`:

```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

Or set the environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api npm run frontend
```

### Port Configuration

If you want to run Next.js on a different port:

```bash
PORT=3001 npm run frontend
```

## 📦 Build for Production

### Build the Next.js App

```bash
npm run frontend:build
```

### Start Production Server

```bash
npm run frontend:start
```

## 🧪 Testing

1. **Start Backend**: `npm start` (in terminal 1)
2. **Start Frontend**: `npm run frontend` (in terminal 2)
3. **Open Browser**: `http://localhost:3000` (or 3001 if 3000 is taken)

### Test Scenarios

1. **Single URL**: Enter `https://example.com` and click "Start Analysis"
2. **Sitemap**: Enter `https://example.com/sitemap.xml` and click "Start Analysis"
3. **Selective Agents**: Uncheck some agents and run analysis
4. **Watch Progress**: See real-time updates in the progress section

## 🐛 Troubleshooting

### Port Conflicts

If port 3000 is already in use:
- Backend will fail to start - stop the process using port 3000
- Next.js will automatically use port 3001

### CORS Issues

The backend has CORS enabled. If you see CORS errors:
- Check that the backend is running
- Verify the API URL in `app/lib/constants.ts`

### EventSource Connection Issues

If streaming doesn't work:
- Check browser console for errors
- Verify backend is running on port 3000
- Check Network tab for `/api/analyze-stream` request

## 🎯 Next Steps

- [ ] Add authentication
- [ ] Add result export functionality
- [ ] Add result history
- [ ] Add charts and visualizations
- [ ] Add dark mode
- [ ] Add result filtering and search

## 📝 Notes

- The old `public/` folder (HTML/CSS/JS frontend) can be kept for reference or removed
- Both frontends can coexist - they serve the same backend API
- Next.js uses the App Router (app directory) for modern React patterns

