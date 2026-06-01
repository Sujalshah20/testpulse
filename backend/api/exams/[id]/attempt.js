// api/exams/[id]/attempt.js
import { getDB, ObjectId } from '../../../lib/mongodb.js';
import { verifyJWT } from '../../../lib/middleware/verifyJWT.js';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({
    success: false, message: 'Method not allowed'
  });

  await verifyJWT(req, res, async () => {
    try {
      const db = getDB();
      const examId = req.query.id;
      const studentId = req.user.id;

      let examOid;
      try {
        examOid = new ObjectId(examId);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid exam ID' });
      }

      // 1. Check exam exists and is live
      const exam = await db.collection('exams').findOne(
        { _id: examOid },
        {
          projection: {
            status: 1,
            start_time: 1,
            end_time: 1,
            duration_mins: 1,
            randomize: 1,
            subject_id: 1,
            num_questions: 1
          }
        }
      );

      if (!exam || exam.status !== 'live') {
        return res.status(403).json({
          success: false, message: 'Exam is not available'
        });
      }

      const now = new Date();
      if (now < new Date(exam.start_time) || now > new Date(exam.end_time)) {
        return res.status(403).json({
          success: false, message: 'Exam window is closed'
        });
      }

      // 2. DUPLICATE GUARD — check existing attempt
      const existing = await db.collection('exam_attempts').findOne({
        exam_id: examOid,
        student_id: ObjectId.createFromHexString(studentId)
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          code: 'DUPLICATE_ATTEMPT',
          message: 'You have already attempted this exam'
        });
      }

      // 3. Create attempt
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const cleanIp = ip.split(',')[0].trim();

      const attemptResult = await db.collection('exam_attempts').insertOne({
        exam_id: examOid,
        student_id: ObjectId.createFromHexString(studentId),
        ip_address: cleanIp,
        status: 'in_progress',
        started_at: new Date(),
        total_score: null,
        submitted_at: null
      });

      const attemptId = attemptResult.insertedId;

      // 4. Fetch questions (strip correct_answer for student security)
      const questions = await db.collection('questions')
        .find(
          { subject_id: exam.subject_id },
          { projection: { body: 1, type: 1, options: 1, marks: 1, difficulty: 1 } }
        )
        .toArray();

      // Pre-initialize performance records for all questions
      if (questions && questions.length > 0) {
        const performanceRows = questions.map(q => ({
          attempt_id: attemptId,
          question_id: q._id,
          given_answer: null,
          is_correct: null,
          marks_obtained: 0.00,
          time_spent_sec: 0
        }));

        await db.collection('performance_records').insertMany(performanceRows);
      }

      // Shuffle if randomized
      const shuffledQuestions = exam.randomize
        ? questions.slice().sort(() => Math.random() - 0.5)
        : questions;

      // Apply question limit (num_questions) if configured
      const limitRaw = exam.num_questions;
      const limit = limitRaw === null || limitRaw === undefined || limitRaw === ''
        ? null
        : parseInt(limitRaw, 10);

      const finalQuestions = (limit && Number.isFinite(limit) && limit > 0)
        ? shuffledQuestions.slice(0, limit)
        : shuffledQuestions;

      const responseAttempt = {
        _id: attemptId,
        id: attemptId.toString(),
        exam_id: examOid.toString(),
        student_id: studentId,
        status: 'in_progress',
        started_at: new Date()
      };

      return res.status(201).json({
        success: true,
        data: {
          attempt: responseAttempt,
          questions: finalQuestions.map(q => ({
            id: q._id.toString(),
            body: q.body,
            type: q.type,
            options: q.options,
            marks: q.marks,
            difficulty: q.difficulty
          })),
          timeLimit: exam.duration_mins * 60
        }
      });

    } catch (err) {
      console.error('Attempt initialization error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
}