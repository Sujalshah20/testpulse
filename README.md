# Online Examination Processing Platform (OEPP) 🎓

A complete full-stack examination platform built with **Node.js + Express + PostgreSQL (Supabase) + React**. Features real-time exam management, auto-scoring, duplicate attempt prevention, and complete role-based access control.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available at https://supabase.com)
- Upstash Redis account (free tier available at https://upstash.com)

### Local Development

1. **Clone and Install Dependencies**
```bash
cd OEPP
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

2. **Setup Supabase**
   - Create a new project at https://supabase.com
   - Go to SQL Editor → paste contents of `backend/schema.sql`
   - Create tables by running the SQL

3. **Setup Upstash Redis**
   - Create new database at https://upstash.com
   - Copy REST URL and Token

4. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your Supabase, Redis, and JWT credentials
```

Generate secure JWT secrets:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

5. **Run Development Servers**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
# Proxy to backend at /api
```

6. **Test the Application**
- Open http://localhost:5173
- Create account (any role: student, examiner, admin)
- Login and explore dashboards

---

## 🌐 Deploy to Render

### Step 1: Prepare GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit: OEPP application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/oepp.git
git push -u origin main
```

### Step 2: Create Supabase Project
1. Sign up at https://supabase.com (free tier includes PostgreSQL)
2. Create new project
3. Go to **SQL Editor** → Create new snippet
4. Paste entire contents of `backend/schema.sql`
5. Click **RUN** to create all tables
6. Go to **Settings** → **API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `Project API Key (Service Role)` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Upstash Redis Database
1. Sign up at https://upstash.com (free tier includes Redis)
2. Create new database
3. Go to **Details** tab and copy:
   - `UPSTASH_REDIS_REST_URL` 
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 4: Deploy Backend on Render

1. Go to https://render.com and sign up with GitHub
2. Click **+ New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name:** oepp-backend
   - **Region:** Oregon (or closest to you)
   - **Build Command:** `npm install && cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free (or $7/month paid)
5. Click **Advanced** and add Environment Variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   JWT_SECRET=generate_new_complex_secret
   JWT_REFRESH_SECRET=generate_new_complex_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-frontend-url.onrender.com
   ```
6. Click **Create Web Service**
7. Wait for deployment (2-3 minutes)
8. Copy the **onrender.com URL** (e.g., `https://oepp-backend.onrender.com`)

### Step 5: Deploy Frontend on Render

1. Go to Render → **+ New** → **Static Site**
2. Connect your GitHub repo
3. Configure:
   - **Name:** oepp-frontend
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
4. Click **Create Static Site**
5. After deployment, go to Settings → **Environment Variables**
6. Add: `VITE_API_BASE_URL=https://oepp-backend.onrender.com/api`
7. Redeploy to apply env variable

### Step 6: Update Frontend API Configuration
Edit `frontend/src/client/axios.js`:
```javascript
export default axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Step 7: Test Production Deployment
- Visit your frontend URL
- Create account and login
- All features (exams, scoring, results) should work

---

## 🏗️ Architecture

```
OEPP/
├── backend/                    # Node.js Express API
│   ├── api/                    # Route handlers
│   │   ├── auth/               # Authentication endpoints
│   │   ├── exams/              # Exam management
│   │   ├── questions/          # Question bank
│   │   ├── attempts/           # Exam attempts
│   │   └── results/            # Results & performance
│   ├── lib/                    # Business logic
│   │   ├── middleware/         # JWT, validation
│   │   ├── services/           # Scoring, reporting
│   │   ├── supabase.js         # DB connection
│   │   └── redis.js            # Cache layer
│   ├── schema.sql              # Database DDL
│   └── dev-server.js           # Express app
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/              # Exam room, results, admin
│   │   ├── components/         # Timer, navigator, charts
│   │   ├── context/            # Auth state
│   │   └── client/             # API client
│   └── vite.config.js
│
└── README.md                   # This file
```

---

## 🔐 Security Features

✅ **JWT Authentication** - 15min access + 7-day refresh tokens  
✅ **Duplicate Attempt Guard** - Prevents multiple attempts per student  
✅ **Rate Limiting** - 5 login attempts per 15 minutes  
✅ **Password Hashing** - bcryptjs with salt cost 12  
✅ **Role-Based Access Control** - Student, Examiner, Admin, Invigilator  
✅ **Server-Side Validation** - All inputs validated server-side  
✅ **Parameterized Queries** - Prevents SQL injection  
✅ **Auto-Scoring** - Cannot be manipulated from client  

---

## 📊 Database Schema

### Users Table
- Roles: student, examiner, admin, invigilator
- Password hashed with bcryptjs

### Exams Table
- Status: draft → live → completed
- Auto-completes via cron job at end_time
- Supports randomized question order

### Attempts Table
- Tracks student exam attempts
- Duplicate key prevents multiple attempts
- Timestamps for auto-submit if time expires

### Performance Records
- Per-question answer tracking
- Automatic scoring for MCQ/T&F
- Manual review flag for short answer

### Scoring Logic
- MCQ/T&F: Exact match = full marks, wrong = negative marks
- Short Answer: Flagged for manual review
- Prevents int

ernetwork manipulation

---

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/refresh` - Get new access token
- `POST /api/auth/logout` - Logout (blacklist token)

### Exams
- `GET /api/exams` - List exams (role-aware filtering)
- `POST /api/exams` - Create exam (admin/examiner only)
- `PUT /api/exams/:id` - Update exam
- `POST /api/exams/:id/publish` - Publish exam (draft → live)
- `POST /api/exams/:id/attempt` - Start attempt (with duplicate guard)

### Questions
- `GET /api/questions` - List questions (paginated, filtered)
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question (auto-versions)
- `POST /api/questions/bulk-import` - Import from CSV

### Attempts
- `PUT /api/attempts/:id/autosave` - Save answers (every 30s)
- `POST /api/attempts/:id/submit` - Submit exam (triggers scoring)

### Results
- `GET /api/results/:attemptId` - Get attempt results
- `GET /api/results/performance/:studentId` - Student performance history

---

## 🔧 Available Scripts

### Backend
```bash
npm run dev    # Start dev server on port 5000
npm start      # Production build (as per package.json)
```

### Frontend
```bash
npm run dev        # Start Vite dev server on port 5173
npm run build      # Build for production (dist/)
npm run preview    # Preview production build locally
```

---

## 🔄 Cron Jobs

**Exam Completion Job** (runs every minute)
- Checks exams with status='live' and end_time < NOW()
- Auto-updates status to 'completed'
- Marks in-progress attempts as 'void'

---

## 📝 Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI/UX |
| Styling | Tailwind CSS | Responsive design |
| Client State | React Context | Auth state |
| HTTP Client | Axios | API requests |
| Backend | Node.js + Express | Rest API |
| Database | PostgreSQL (Supabase) | Data persistence |
| Cache | Redis (Upstash) | Sessions, rate limiting |
| Authentication | JWT + bcryptjs | Secure auth |
| Scheduling | node-cron | Auto exam completion |
| Deployment | Render | Serverless hosting |

---

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file – all required keys must be set
- Verify Supabase/Redis URLs are correct
- Ensure `node-cron` is installed: `npm install node-cron`

### Frontend can't reach backend
- Verify backend URL in `.env`/`vite.config.js`
- Check CORS headers in `dev-server.js`
- Ensure `CLIENT_URL` env var matches frontend domain

### Exams not auto-completing
- Cron job runs every minute – check backend logs
- Verify exam `end_time` is in correct ISO format
- Check Supabase queries in `dev-server.js` initExamCompletionCron

### Rate limiting not working
- Redis must be connected (check `.env`)
- Keys stored as `login:{ip_address}` in Redis

---

## 📄 Environment Variables Checklist

- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] JWT_SECRET (32+ chars, random)
- [ ] JWT_REFRESH_SECRET (32+ chars,random)
- [ ] PORT (default: 5000)
- [ ] CLIENT_URL (for CORS)
- [ ] NODE_ENV (development/production)

---

## 📞 Support

For issues or questions:
1. Check API response logs in browser DevTools
2. Review backend console for error messages
3. Verify all `.env` variables are set correctly
4. Check Supabase/Upstash dashboards for connection issues

---

## 📜 License

This project is available for educational and commercial use.

**Built with ❤️ for online examination management**
