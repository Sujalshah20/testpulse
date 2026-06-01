# OEPP Developer Quick Reference

## 🚀 Quick Start (Copy-Paste Ready)

### 1. Setup Backend
```bash
cd backend
npm install
# Edit .env with your credentials
npm start
# Runs on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Test API
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"Test@123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Test@123"}'

# Health check
curl http://localhost:5000/api/health
```

---

## 📁 Key File Locations

| Purpose | Path |
|---------|------|
| API Routes | `backend/api/` |
| Business Logic | `backend/lib/services/` |
| Database Config | `backend/lib/supabase.js` |
| Redis Config | `backend/lib/redis.js` |
| Middleware | `backend/lib/middleware/` |
| React Pages | `frontend/src/pages/` |
| Components | `frontend/src/components/` |
| API Client | `frontend/src/client/axios.js` |
| Environment Template | `.env.example` |

---

## 🔑 Environment Variables

### Required for Local Development
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
```

### Generate JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔗 API Endpoints (Quick Index)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Exams
- `GET /api/exams`
- `POST /api/exams`
- `POST /api/exams/:id/publish`
- `POST /api/exams/:id/attempt`

### Questions
- `GET /api/questions`
- `POST /api/questions`
- `PUT /api/questions/:id`
- `POST /api/questions/bulk-import`

### Attempts
- `PUT /api/attempts/:id/autosave`
- `POST /api/attempts/:id/submit`

### Results
- `GET /api/results/:attemptId`
- `GET /api/results/performance/:studentId`

---

## 🧠 Scoring Logic

```javascript
// Based on type:
if (type === 'mcq' || type === 'true_false') {
  if (given.trim().toLowerCase() === correct.trim().toLowerCase()) {
    obtained = full_marks;
  } else if (given.trim() !== '') {
    obtained = -negative_marks;
  } else {
    obtained = 0; // Unanswered
  }
}

// Short answer: flagged for manual review
// Total score: sum of all marks_obtained
```

---

## 📊 Database Tables

### users
```sql
id, uuid, name, email, password_hash, role, is_active, created_at
```

### exams
```sql
id, title, subject_id, created_by, start_time, end_time, 
duration_mins, total_marks, passing_marks, negative_marks, 
status ('draft'|'live'|'completed'), randomize
```

### exam_attempts
```sql
id, exam_id, student_id, started_at, submitted_at, 
status ('in_progress'|'submitted'|'void'), 
ip_address, total_score
```

### performance_records
```sql
id, attempt_id, question_id, given_answer, is_correct, 
marks_obtained, time_spent_sec
```

---

## 🛠 Common Tasks

### Add New Exam
```javascript
const response = await api.post('/exams', {
  title: 'Math Final',
  subject_id: 1,
  start_time: '2024-06-01T10:00:00Z',
  end_time: '2024-06-01T11:00:00Z',
  duration_mins: 60,
  total_marks: 100,
  passing_marks: 40
});
```

### Start Exam Attempt
```javascript
const response = await api.post('/exams/1/attempt');
// Returns: { attempt, questions, timeLimit }
```

### Autosave Answers
```javascript
const response = await api.put(`/attempts/${attemptId}/autosave`, {
  answers: [
    { question_id: 1, given_answer: 'A' },
    { question_id: 2, given_answer: 'True' }
  ]
});
```

### Submit Exam
```javascript
const response = await api.post(`/attempts/${attemptId}/submit`, {
  answers: [...]
});
// Returns: { totalScore, passed, percentag}
```

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
cd backend
npm start
# Look for console.log, console.error messages
```

### Check Frontend Logs
```
Open browser DevTools (F12) → Console tab
Network tab to see API requests/responses
```

### Test Database Connection
```javascript
// In any API endpoint:
const { data, error } = await supabase.from('users').select('count');
if (error) console.error(error);
else console.log('DB OK:', data);
```

### Test Redis Connection
```javascript
import redis from './lib/redis.js';
await redis.set('test', 'value');
const val = await redis.get('test');
console.log('Redis OK:', val);
```

---

## 📝 Code Patterns to Follow

### API Response Format
```javascript
return res.status(200).json({
  success: true,
  data: { ... },
  message: 'Operation successful'
});

// Error
return res.status(400).json({
  success: false,
  message: 'Validation failed',
  code: 'VALIDATION_ERROR'
});
```

### Input Validation
```javascript
if (!email || !email.includes('@')) {
  return res.status(400).json({ 
    success: false, message: 'Invalid email' 
  });
}
```

### Database Query
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2')
  .eq('id', id)
  .single();

if (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: 'DB error' });
}
```

### JWT Verification
```javascript
import jwt from 'jsonwebtoken';
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, role, uuid }
```

---

## 🚀 Deployment Commands

### Deploy to Render
1. Push code: `git push origin main`
2. Render auto-deploys from GitHub
3. Check deployment in Render dashboard

### Build Frontend for Production
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Environment Variables for Render
Create in Render dashboard under Service Settings → Environment

---

## 📊 Performance Tips

- Exams table: indexed on `status, start_time`
- Attempts table: indexed on `student_id`
- Use `select()` to return specific columns (not `SELECT *`)
- Batch operations with Promise.all()
- Cache with Redis for frequently accessed data

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'node-cron'` | Missing dependency | `npm install node-cron` |
| `SUPABASE_URL is undefined` | Missing .env | Copy `.env.example` to `.env` |
| `Duplicate attempt` | Student already attempted exam | This is intentional (duplicate guard) |
| `Exam not available` | Status is not 'live' or time window closed | Publish exam first |
| `CORS error in frontend` | Backend URL mismatch | Check `CLIENT_URL` env var |

---

## 📚 External Resources

- **Supabase Docs**: https://supabase.com/docs
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev
- **JWT.io**: https://jwt.io (token debugging)
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 💡 Useful Commands

```bash
# Check npm versions
npm list

# Update all packages
npm update

# Clear npm cache
npm cache clean --force

# Install specific package version
npm install package-name@version

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

**For more details, see README.md or DEPLOYMENT_CHECKLIST.md**
