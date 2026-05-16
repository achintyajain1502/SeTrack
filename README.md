# AtomQuest Goal Setting & Tracking Portal

React frontend with a Node/Express backend API and database persistence.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start backend API + database
npm run server
# API runs at http://localhost:5000

# 3. In another terminal, start React frontend
npm start
# Frontend opens at http://localhost:3000

# 4. Build for production
npm run build
```

## Demo Credentials

| Role | Name | Email | Password | Access |
|---|---|---|---|---|
| Employee | Arjun Sharma | arjun@local.com | employee | My Goals, Check-ins, Dashboard |
| Manager | Priya Menon | priya@local.com | manager | Approvals, Team Goals, Shared Goals |
| Admin | Rahul Gupta | rahul@local.com | admin | All Goals, Audit Log, Reports, Cycles |

#SignUp check Credential
| Role | Name | Email | Password | Access |
|---|---|---|---|---|
| Employee |Rajesh Sharma | rajesh@check.com | employeecheck | My Goals, Check-ins, Dashboard |

## Database

The app saves goals and audit entries through the backend API in `backend/server.js`.

If `MONGODB_URI` is configured, the backend uses MongoDB. If it is not configured, it falls back to a local JSON database at `backend/data/database.json` for development.

Create a `.env` file from `.env.example` to connect MongoDB:

```bash
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=atomquest
```

New goals are saved as draft database records immediately. Users only need total weightage to equal 100% when submitting drafts for manager approval.

## API

```txt
GET  /api/health
GET  /api/database
POST /api/auth/login
PUT  /api/goals
POST /api/audit
POST /api/reset
```

## Vercel Deployment

This repo is configured for a full Vercel deployment:

- React builds to `build/`
- Express API is exposed through `api/index.js`
- `vercel.json` rewrites `/api/*` to the Express function and all other routes to the React app

In Vercel project settings, use:

```txt
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
```

Add these environment variables in Vercel:

```txt
MONGODB_URI=your mongodb://... connection string
MONGODB_DB=atomquest
CLIENT_ORIGIN=https://your-vercel-domain.vercel.app
```

After deployment, verify:

```txt
https://your-vercel-domain.vercel.app/api/health
```

It should return `"database":"mongodb"`.

## Project Structure

```txt
backend/
  server.js       Express API and static build server
  database.js     MongoDB connection with local JSON fallback
  seedData.js     Demo users, goals, and audit seed data

src/
  App.js          Routing and global state
  db.js           Frontend API client
  data.js         Frontend constants and navigation
  components/     Pages and shared UI
```
