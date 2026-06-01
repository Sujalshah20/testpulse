// api/attempts/[id]/autosave.js
import { getDB, ObjectId } from '../../../lib/mongodb.js';
import { verifyJWT } from '../../../lib/middleware/verifyJWT.js';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  await verifyJWT(req, res, async () => {
    try {
      const db = getDB();
      const attemptId = req.query.id;

      let attemptOid;
      try {
        attemptOid = new ObjectId(attemptId);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid attempt ID' });
      }

      // Verify the attempt belongs to the current user and is still in progress
      const attempt = await db.collection('exam_attempts').findOne(
        { _id: attemptOid },
        { projection: { status: 1, student_id: 1 } }
      );

      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }

      if (attempt.student_id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      if (attempt.status !== 'in_progress') {
        return res.status(400).json({ success: false, message: 'Exam already submitted or voided' });
      }

      // answers: [{ question_id, given_answer, time_spent_sec }]
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ success: false, message: 'Answers array is required' });
      }

      // Batch update performance_records using bulkWrite
      const bulkOps = answers.map(({ question_id, given_answer, time_spent_sec }) => ({
        updateOne: {
          filter: {
            attempt_id: attemptOid,
            question_id: new ObjectId(question_id)
          },
          update: {
            $set: {
              given_answer: given_answer !== undefined ? String(given_answer) : null,
              time_spent_sec: time_spent_sec || 0
            }
          }
        }
      }));

      await db.collection('performance_records').bulkWrite(bulkOps);

      return res.status(200).json({
        success: true,
        message: 'Answers saved',
        savedCount: answers.length
      });

    } catch (err) {
      console.error('Autosave error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
}