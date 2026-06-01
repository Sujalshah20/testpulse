// api/questions/bulk-import.js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import { verifyJWT, roleGuard } from '../../lib/middleware/verifyJWT.js';

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
        const { subject, questions } = req.body;
        const db = getDB();

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Questions array is required and must not be empty'
          });
        }

        let subjectId = null;

        // 1. If subject definition is provided, find or create it
        if (subject && subject.name && subject.code) {
          const existingSub = await db.collection('subjects').findOne(
            { code: subject.code.toUpperCase().trim() },
            { projection: { _id: 1 } }
          );

          if (existingSub) {
            subjectId = existingSub._id;
          } else {
            const result = await db.collection('subjects').insertOne({
              name: subject.name.trim(),
              code: subject.code.toUpperCase().trim(),
              created_by: ObjectId.createFromHexString(req.user.id),
              description: subject.description || '',
              is_active: true,
              created_at: new Date()
            });
            subjectId = result.insertedId;
          }
        }

        // 2. Validate and prepare question rows
        const rowsToInsert = [];
        const skipped = [];

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];

          if (!q.body || q.body.trim().length === 0) {
            skipped.push({ index: i, subject_id: q.subject_id ?? null, reason: 'Empty body' });
            continue;
          }

          const validTypes = ['mcq', 'true_false', 'short_answer'];
          if (!q.type || !validTypes.includes(q.type)) {
            skipped.push({ index: i, subject_id: q.subject_id ?? null, reason: `Invalid type: ${q.type}` });
            continue;
          }

          if (q.correct_answer === undefined || q.correct_answer === null || q.correct_answer.toString().trim() === '') {
            skipped.push({ index: i, subject_id: q.subject_id ?? null, reason: 'Missing correct_answer' });
            continue;
          }

          let finalSubjectId;
          if (q.subject_id && /^[0-9a-fA-F]{24}$/.test(String(q.subject_id))) {
            finalSubjectId = ObjectId.createFromHexString(String(q.subject_id));
          } else if (subjectId) {
            finalSubjectId = subjectId; // subjectId is already an ObjectId
          } else {
            skipped.push({ index: i, reason: 'Invalid or missing subject_id' });
            continue;
          }

          rowsToInsert.push({
            subject_id: finalSubjectId,
            body: q.body.trim(),
            type: q.type,
            options: q.options || null,
            correct_answer: q.correct_answer.toString().trim(),
            marks: q.marks ? parseFloat(q.marks) : 1.00,
            difficulty: q.difficulty || 'medium',
            version: 1,
            created_at: new Date()
          });
        }

        if (rowsToInsert.length === 0) {
          return res.status(200).json({
            success: true,
            message: 'No valid questions to import (all rows skipped)',
            insertedCount: 0,
            skippedCount: skipped.length,
            skipped
          });
        }

        // 3. Batch insert questions
        const result = await db.collection('questions').insertMany(rowsToInsert);
        const insertedCount = result.insertedCount;

        return res.status(201).json({
          success: true,
          message: `Successfully imported ${insertedCount} questions`,
          insertedCount,
          skippedCount: skipped.length,
          skipped
        });

      } catch (err) {
        console.error('Bulk import error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    });
  });
}