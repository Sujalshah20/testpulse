# OEPP Deployment Checklist

## Pre-Deployment ✅

### Code Preparation
- [ ] All API endpoints tested locally
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend runs without errors (`npm start`)
- [ ] No hardcoded secrets in code
- [ ] `.gitignore` excludes `.env` file

### Database (Supabase)
- [ ] Created Supabase project
- [ ] Ran `schema.sql` - all 6 tables created
- [ ] Verified tables have data (test insert)
- [ ] Copied Project URL
- [ ] Copied Service Role Key (NOT anon key)
- [ ] Tested DB connection locally

### Cache (Upstash Redis)
- [ ] Created Upstash database
- [ ] Copied REST URL
- [ ] Copied REST Token
- [ ] Tested Redis connection locally

### Secrets Generated
- [ ] JWT_SECRET (32+ random characters)
- [ ] JWT_REFRESH_SECRET (32+ random characters)

### GitHub Repository
- [ ] Created GitHub repo
- [ ] Pushed all code to main branch
- [ ] No `.env` file in repo

---

## Render Deployment Steps

### Backend Deployment

1. **Create Web Service**
   - [ ] Go to render.com → New Web Service
   - [ ] Connect GitHub repo
   - [ ] Service name: `oepp-backend`
   - [ ] Region: Oregon (or nearest)
   - [ ] Build command: `npm install && cd backend && npm install`
   - [ ] Start command: `cd backend && npm start`
   - [ ] Instance: Free tier

2. **Add Environment Variables**
   - [ ] SUPABASE_URL
   - [ ] SUPABASE_SERVICE_ROLE_KEY
   - [ ] UPSTASH_REDIS_REST_URL
   - [ ] UPSTASH_REDIS_REST_TOKEN
   - [ ] JWT_SECRET (create new secure value)
   - [ ] JWT_REFRESH_SECRET (create new secure value)
   - [ ] JWT_EXPIRES_IN = 15m
   - [ ] JWT_REFRESH_EXPIRES_IN = 7d
   - [ ] NODE_ENV = production
   - [ ] PORT = 5000
   - [ ] CLIENT_URL = https://oepp-frontend.onrender.com

3. **Deploy**
   - [ ] Click Create Web Service
   - [ ] Wait 2-3 minutes for deployment
   - [ ] Check deployment logs for errors
   - [ ] Copy backend URL (e.g., https://oepp-backend.onrender.com)
   - [ ] Test health endpoint: `https://oepp-backend.onrender.com/api/health`

### Frontend Deployment

1. **Create Static Site**
   - [ ] Go to render.com → New Static Site
   - [ ] Connect GitHub repo
   - [ ] Site name: `oepp-frontend`
   - [ ] Build command: `cd frontend && npm install && npm run build`
   - [ ] Publish directory: `frontend/dist`

2. **Add Environment Variables**
   - [ ] VITE_API_BASE_URL = https://oepp-backend.onrender.com/api

3. **Deploy**
   - [ ] Click Create Static Site
   - [ ] Wait 1-2 minutes for deployment
   - [ ] Get frontend URL (e.g., https://oepp-frontend.onrender.com)
   - [ ] Verify build logs – no errors

---

## Post-Deployment Testing

### Basic Checks
- [ ] Frontend UI loads without errors
- [ ] No console errors in browser DevTools
- [ ] Backend health check responds: `curl https://oepp-backend.onrender.com/api/health`

### Feature Testing
- [ ] User registration works
- [ ] User login works
- [ ] Can view exam list
- [ ] Can attempt exam
- [ ] Auto-save works (check network tab every 30s)
- [ ] Can submit exam
- [ ] Can view results
- [ ] Admin can create questions
- [ ] Admin can publish exams

### Edge Cases
- [ ] Multiple attempts blocked (duplicate guard)
- [ ] Rate limiting on login (5 attempts/15 min)
- [ ] Exam window validation (can't start before/after)
- [ ] Timer countdown works
- [ ] Auto-submit when timer expires
- [ ] Score calculation correct

---

## Monitoring & Troubleshooting

### If Backend Won't Deploy
1. Check build logs in Render dashboard
2. Verify all env vars set
3. Ensure `backend/package.json` has `"start"` script
4. Check `backend/dev-server.js` for syntax errors
5. Verify Supabase/Redis URLs are correct

### If Frontend Won't Deploy
1. Check build logs in Render dashboard
2. Ensure Vite build succeeds locally: `npm run build`
3. Verify build directory is `frontend/dist`
4. Check for hardcoded localhost URLs in code
5. Set VITE_API_BASE_URL env var before deployment

### If Features Don't Work
1. Open browser DevTools → Network tab
2. Check API response status codes
3. Look for CORS errors
4. Check backend logs: Render → Service → Logs
5. Verify env vars are correct

### Checking Logs
- **Backend logs**: Render → oepp-backend → Logs
- **Frontend build logs**: Render → oepp-frontend → Logs
- **Browser console**: DevTools → Console
- **Network requests**: DevTools → Network

---

## Production Best Practices

- [ ] Enable auto-redeploys on main branch push
- [ ] Set up database backups (Supabase native backup)
- [ ] Monitor performance metrics (Render dashboard)
- [ ] Set up error tracking (optional: Sentry)
- [ ] Use strong JWT secrets (32+ chars)
- [ ] Rotate JWT secrets every 6 months
- [ ] Update dependencies monthly
- [ ] Monitor Redis usage (Upstash dashboard)

---

## Maintenance

### Weekly
- [ ] Check backend/frontend health
- [ ] Review error logs
- [ ] Monitor database size growth

### Monthly
- [ ] Update npm packages: `npm audit fix`
- [ ] Review security settings
- [ ] Test backup restoration

### Quarterly
- [ ] Full security audit
- [ ] Load testing (simulated users)
- [ ] Database optimization

---

## Rollback Plan (if deployment fails)

1. Go to Render → Service → Deployment history
2. Find last successful deployment
3. Click "Redeploy" on that version
4. Verify rollback completed successfully

---

**Estimated Deployment Time: 15-20 minutes**

For detailed deployment guide, see README.md → "Deploy to Render" section.
