// api/questions/index.js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import { verifyJWT, roleGuard } from '../../lib/middleware/verifyJWT.js';
import { validateQuestion } from '../../lib/middleware/validate.js';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await verifyJWT(req, res, async () => {
    const db = getDB();

    // Only admins and examiners can access the question bank directly
    roleGuard('admin', 'examiner')(req, res, async () => {

      if (req.method === 'GET') {
        try {
          const { subject_id, page = 1, limit = 20, difficulty } = req.query;
          const skip = (parseInt(page) - 1) * parseInt(limit);

          let query = {};
          if (subject_id) {
            query.subject_id = ObjectId.createFromHexString(subject_id);
          }
          if (difficulty) {
            query.difficulty = difficulty;
          }

          const total = await db.collection('questions').countDocuments(query);

          const questions = await db.collection('questions')
            .aggregate([
              { $match: query },
              {
                $lookup: {
                  from: 'subjects',
                  localField: 'subject_id',
                  foreignField: '_id',
                  as: 'subjects'
                }
              },
              { $unwind: { path: '$subjects', preserveNullAndEmptyArrays: true } },
              { $sort: { _id: -1 } },
              { $skip: skip },
              { $limit: parseInt(limit) }
            ])
            .toArray();

          return res.status(200).json({
            success: true,
            data: questions.map(q => ({
              id: q._id.toString(),
              subject_id: q.subject_id?.toString(),
              body: q.body,
              type: q.type,
              options: q.options,
              correct_answer: q.correct_answer,
              marks: q.marks,
              difficulty: q.difficulty,
              version: q.version,
              subjects: q.subjects ? { name: q.subjects.name, code: q.subjects.code } : null
            })),
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: Math.ceil(total / parseInt(limit))
            }
          });

        } catch (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }
      }

      else if (req.method === 'POST') {
        validateQuestion(req, res, async () => {
          try {
            const { subject_id, body, type, options, correct_answer, marks, difficulty } = req.body;

            const result = await db.collection('questions').insertOne({
              subject_id: ObjectId.createFromHexString(subject_id),
              body,
              type,
              options: options || null,
              correct_answer: correct_answer.toString().trim(),
              marks: marks ? parseFloat(marks) : 1.00,
              difficulty: difficulty || 'medium',
              version: 1,
              created_at: new Date()
            });

            const newQuestion = {
              _id: result.insertedId,
              id: result.insertedId.toString(),
              subject_id,
              body,
              type,
              options,
              correct_answer: correct_answer.toString().trim(),
              marks: parseFloat(marks) || 1.00,
              difficulty: difficulty || 'medium',
              version: 1
            };

            return res.status(201).json({
              success: true,
              message: 'Question created successfully',
              data: newQuestion
            });

          } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Server error' });
          }
        });
      }

      else {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

    });
  });
}