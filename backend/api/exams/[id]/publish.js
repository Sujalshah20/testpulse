// api/exams/[id]/publish.js
import { getDB, ObjectId } from '../../../lib/mongodb.js';
import { verifyJWT, roleGuard } from '../../../lib/middleware/verifyJWT.js';

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
    roleGuard('admin', 'examiner')(req, res, async () => {
      try {
        const db = getDB();
        const examId = req.query.id;

        let examOid;
        try {
          examOid = new ObjectId(examId);
        } catch {
          return res.status(400).json({ success: false, message: 'Invalid exam ID' });
        }

        // 1. Fetch exam status and subject_id
        const exam = await db.collection('exams').findOne(
          { _id: examOid },
          { projection: { status: 1, subject_id: 1, title: 1 } }
        );

        if (!exam) {
          return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        if (exam.status !== 'draft') {
          return res.status(400).json({
            success: false,
            message: `Exam is already in ${exam.status} state`
          });
        }

        // 2. Premium Guard: check if subject has any questions
        const questionCount = await db.collection('questions').countDocuments({
          subject_id: exam.subject_id
        });

        if (questionCount === 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot publish an exam that has no questions in its subject bank. Please add questions first.'
          });
        }

        // 3. Update status to 'live'
        await db.collection('exams').updateOne(
          { _id: examOid },
          { $set: { status: 'live' } }
        );

        const updated = await db.collection('exams').findOne({ _id: examOid });

        return res.status(200).json({
          success: true,
          message: `Exam "${exam.title}" is now LIVE!`,
          data: { id: updated._id.toString(), ...updated }
        });

      } catch (err) {
        console.error('Publish exam error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    });
  });
}