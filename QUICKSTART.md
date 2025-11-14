# 🚀 Quick Start Guide

## Project Structure

The project is now organized into separate `backend` and `frontend` folders:

```
├── backend/          # Express.js backend
├── frontend/         # Next.js frontend
└── chrome-extension/ # Chrome extension (optional)
```

## Installation

### Option 1: Install Everything (Recommended)

```bash
npm run install:all
```

This installs dependencies for both backend and frontend.

### Option 2: Install Separately

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

## Running the Application

You need **two terminals** running simultaneously:

### Terminal 1: Backend Server

**From root directory:**
```bash
npm run backend
```

**Or from backend directory:**
```bash
cd backend
npm start
```

Backend runs on: `http://localhost:3001`

### Terminal 2: Next.js Frontend

**From root directory:**
```bash
npm run frontend
```

**Or from frontend directory:**
```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000` (or automatically switches to 3001 if 3000 is taken)

## Access the Application

Open your browser and go to:
- **Frontend**: `http://localhost:3000` (or `http://localhost:3001` if port 3000 is taken)
- **Backend API**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/health`

## First Test

1. Make sure both servers are running
2. Open `http://localhost:3000` in your browser
3. Enter a URL: `https://example.com`
4. Select agents (all selected by default)
5. Click "Start Analysis"
6. Watch the real-time progress!

## Available Scripts

### Root Level (from project root)

```bash
npm run install:all    # Install all dependencies
npm run backend        # Start backend server
npm run backend:dev    # Start backend in dev mode (with watch)
npm run frontend       # Start frontend dev server
npm run frontend:build # Build frontend for production
npm run frontend:start # Start frontend production server
```

### Backend (from backend/ directory)

```bash
npm start              # Start server
npm run dev            # Start with auto-reload
npm test               # Run tests
```

### Frontend (from frontend/ directory)

```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run linter
```

## Troubleshooting

### Port Already in Use

If you see "Port 3000 is already in use":
- **Backend**: Change port in `backend/src/server.js` (currently set to 3001):
  ```javascript
  const PORT = process.env.PORT || 3001;
  ```
- **Frontend**: Update `frontend/app/lib/constants.ts` if you change backend port:
  ```typescript
  export const API_URL = 'http://localhost:3001/api';
  ```

### Frontend Can't Connect to Backend

- Verify backend is running: `http://localhost:3001/health`
- Check browser console (F12) for errors
- Verify API_URL in `frontend/app/lib/constants.ts` matches backend port

### Module Not Found Errors

Make sure you've installed dependencies:
```bash
npm run install:all
```

Or install separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Project Structure Details

### Backend (`backend/`)
- `src/` - Source code
  - `agents/` - SEO analysis agents
  - `core/` - Agent manager
  - `routes/` - API routes
  - `utils/` - Utilities (sitemap parser)
  - `server.js` - Express server
- `reports/` - Generated reports (auto-created)

### Frontend (`frontend/`)
- `app/` - Next.js app directory
  - `components/` - React components
  - `lib/` - Constants and utilities
  - `page.tsx` - Main page
  - `layout.tsx` - Root layout
- Configuration files (next.config.js, tailwind.config.js, etc.)

## Next Steps

- See `README.md` for full documentation
- See `backend/README.md` for backend details
- See `frontend/README.md` for frontend details
- See `TESTING.md` for testing scenarios
