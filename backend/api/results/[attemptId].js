// api/results/[attemptId].js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import { verifyJWT } from '../../lib/middleware/verifyJWT.js';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  await verifyJWT(req, res, async () => {
    try {
      const db = getDB();
      const attemptId = req.query.attemptId;

      let attemptOid;
      try {
        attemptOid = new ObjectId(attemptId);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid attempt ID' });
      }

      // Fetch attempt with exam info using aggregation
      const attemptResult = await db.collection('exam_attempts')
        .aggregate([
          { $match: { _id: attemptOid } },
          {
            $lookup: {
              from: 'exams',
              localField: 'exam_id',
              foreignField: '_id',
              as: 'exam'
            }
          },
          { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'subjects',
              localField: 'exam.subject_id',
              foreignField: '_id',
              as: 'examSubject'
            }
          },
          { $unwind: { path: '$examSubject', preserveNullAndEmptyArrays: true } }
        ])
        .toArray();

      const attempt = attemptResult[0];

      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Result not found' });
      }

      // Students can only see their own results
      if (req.user.role === 'student' && attempt.student_id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      if (attempt.status !== 'submitted' && req.user.role === 'student') {
        return res.status(400).json({ success: false, message: 'Exam not yet submitted' });
      }

      // Fetch detailed performance records with question info using aggregation
      const records = await db.collection('performance_records')
        .aggregate([
          { $match: { attempt_id: attemptOid } },
          {
            $lookup: {
              from: 'questions',
              localField: 'question_id',
              foreignField: '_id',
              as: 'question'
            }
          },
          { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
          { $sort: { question_id: 1 } }
        ])
        .toArray();

      const totalMarks = parseFloat(attempt.exam?.total_marks || 0);
      const passingMarks = parseFloat(attempt.exam?.passing_marks || 0);
      const totalScore = parseFloat(attempt.total_score || 0);

      // Compute statistics
      const totalQuestions = records.length;
      const answered = records.filter(r => r.given_answer !== null && r.given_answer !== '').length;
      const correct = records.filter(r => r.is_correct === true).length;
      const incorrect = records.filter(r => r.is_correct === false).length;
      const unanswered = totalQuestions - answered;
      const totalTimeSec = records.reduce((sum, r) => sum + (r.time_spent_sec || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          attempt: {
            id: attempt._id.toString(),
            examTitle: attempt.exam?.title,
            subjectName: attempt.examSubject?.name,
            subjectCode: attempt.examSubject?.code,
            startedAt: attempt.started_at,
            submittedAt: attempt.submitted_at,
            durationMins: attempt.exam?.duration_mins
          },
          scorecard: {
            totalScore,
            totalMarks,
            passingMarks,
            percentage: totalMarks > 0 ? parseFloat(((totalScore / totalMarks) * 100).toFixed(2)) : 0,
            passed: totalScore >= passingMarks,
            negativeMark: attempt.exam?.negative_marks
          },
          statistics: {
            totalQuestions,
            answered,
            correct,
            incorrect,
            unanswered,
            accuracy: answered > 0 ? parseFloat(((correct / answered) * 100).toFixed(2)) : 0,
            totalTimeSpent: totalTimeSec
          },
          questions: records.map(r => ({
            questionId: r.question_id?.toString(),
            body: r.question?.body,
            type: r.question?.type,
            options: r.question?.options,
            correctAnswer: r.question?.correct_answer,
            givenAnswer: r.given_answer,
            isCorrect: r.is_correct,
            marksObtained: r.marks_obtained,
            maxMarks: r.question?.marks,
            difficulty: r.question?.difficulty,
            timeSpentSec: r.time_spent_sec
          }))
        }
      });

    } catch (err) {
      console.error('Results error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
}