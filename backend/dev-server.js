// dev-server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

// Import handlers
import healthHandler from './api/health.js';
import registerHandler from './api/auth/register.js';
import loginHandler from './api/auth/login.js';
import logoutHandler from './api/auth/logout.js';
import refreshHandler from './api/auth/refresh.js';
import examsIndexHandler from './api/exams/index.js';
import examsIdHandler from './api/exams/[id].js';
import examsPublishHandler from './api/exams/[id]/publish.js';
import examsAttemptHandler from './api/exams/[id]/attempt.js';
import attemptsAutosaveHandler from './api/attempts/[id]/autosave.js';
import attemptsSubmitHandler from './api/attempts/[id]/submit.js';
import questionsIndexHandler from './api/questions/index.js';
import questionsIdHandler from './api/questions/[id].js';
import questionsBulkImportHandler from './api/questions/bulk-import.js';
import resultsAttemptIdHandler from './api/results/[attemptId].js';
import resultsPerformanceHandler from './api/results/performance/[studentId].js';
import { connectToMongoDB, getDB } from './lib/mongodb.js';

// Environment variable validator
const checkEnv = () => {
  const warnings = [];
  const required = [
    'MONGODB_URI',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  required.forEach(key => {
    const val = process.env[key];
    if (!val) {
      warnings.push(`❌ ${key} is missing.`);
    } else if (val.includes('your-') || val.includes('super-secret') || val.includes('<')) {
      warnings.push(`⚠️ ${key} is still set to the default placeholder: "${val}"`);
    }
  });

  if (warnings.length > 0) {
    console.log('\n================⚠️ CONFIGURATION WARNINGS ⚠️================');
    console.log('Your local environment is not fully configured yet.');
    console.log('Please open the ".env" file in the project root directory');
    console.log('and populate it with your MongoDB Atlas, Redis, and JWT keys:');
    console.log('-----------------------------------------------------------');
    warnings.forEach(w => console.log(w));
    console.log('===========================================================\n');
  } else {
    console.log('✅ Environment configuration loaded successfully.');
  }
};

/**
 * Auto-complete exam cron job
 * Runs every minute to check for exams that have ended
 */
const initExamCompletionCron = () => {
  console.log('🕐 Initializing exam completion cron job (runs every minute)...');

  cron.schedule('* * * * *', async () => {
    try {
      const db = getDB();
      const now = new Date();

      // Find exams that are live but past their end_time
      const examsToComplete = await db.collection('exams')
        .find({ status: 'live', end_time: { $lt: now } })
        .toArray();

      if (!examsToComplete || examsToComplete.length === 0) {
        return;
      }

      const examOids = examsToComplete.map(e => e._id);

      // Update all of them to completed
      await db.collection('exams').updateMany(
        { _id: { $in: examOids } },
        { $set: { status: 'completed' } }
      );

      console.log(`✅ Cron: Auto-completed ${examsToComplete.length} exam(s):`,
        examsToComplete.map(e => e.title).join(', '));

      // Also mark all in-progress attempts for these exams as 'void'
      await db.collection('exam_attempts').updateMany(
        { exam_id: { $in: examOids }, status: 'in_progress' },
        { $set: { status: 'void' } }
      );

      console.log(`✅ Cron: Marked in-progress attempts as void for completed exams`);

    } catch (err) {
      console.error('❌ Cron job error:', err);
    }
  });
};

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Middleware to map Express route parameters to req.query
const emulateVercel = (req, res, next) => {
  req.query = { ...req.query, ...req.params };
  next();
};

// Health Check
app.all('/api/health', healthHandler);

// Auth Endpoints
app.all('/api/auth/register', registerHandler);
app.all('/api/auth/login', loginHandler);
app.all('/api/auth/logout', logoutHandler);
app.all('/api/auth/refresh', refreshHandler);

// Exam Endpoints
app.all('/api/exams', examsIndexHandler);
app.all('/api/exams/:id', emulateVercel, examsIdHandler);
app.all('/api/exams/:id/publish', emulateVercel, examsPublishHandler);
app.all('/api/exams/:id/attempt', emulateVercel, examsAttemptHandler);

// Attempt & Autosave Endpoints
app.all('/api/attempts/:id/autosave', emulateVercel, attemptsAutosaveHandler);
app.all('/api/attempts/:id/submit', emulateVercel, attemptsSubmitHandler);

// Question Endpoints
app.all('/api/questions', questionsIndexHandler);
app.all('/api/questions/bulk-import', questionsBulkImportHandler);
app.all('/api/questions/:id', emulateVercel, questionsIdHandler);

// Results & Performance Endpoints
app.all('/api/results/:attemptId', emulateVercel, resultsAttemptIdHandler);
app.all('/api/results/performance/:studentId', emulateVercel, resultsPerformanceHandler);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB then start server
connectToMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('===========================================================');
      console.log(`🚀 OEPP Backend running on port ${PORT}`);
      console.log(`👉 Vite proxy matches this on http://localhost:5173/api`);
      console.log('===========================================================');
      checkEnv();
      initExamCompletionCron();
    });
  })
  .catch(err => {
    console.error('❌ Failed to start server - MongoDB connection failed:', err);
    process.exit(1);
  });
