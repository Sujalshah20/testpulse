// api/exams/index.js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import { verifyJWT, roleGuard } from '../../lib/middleware/verifyJWT.js';
import { validateExam } from '../../lib/middleware/validate.js';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await verifyJWT(req, res, async () => {
    const db = getDB();

    if (req.method === 'GET') {
      try {
        const { role } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = { };
        if (role === 'student') {
          query.status = { $in: ['live', 'completed'] };
        }

        const exams = await db.collection('exams')
          .find(query)
          .sort({ start_time: 1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await db.collection('exams').countDocuments(query);

        // Fetch subjects separately
        const subjectIds = [...new Set((exams || []).map(e => e.subject_id).filter(Boolean))];
        let subjectsById = {};

        if (subjectIds.length > 0) {
          const subjects = await db.collection('subjects')
            .find({ _id: { $in: subjectIds.map(id => new ObjectId(id)) } })
            .toArray();

          subjectsById = (subjects || []).reduce((acc, s) => {
            acc[s._id.toString()] = { name: s.name, code: s.code };
            return acc;
          }, {});
        }

        const merged = (exams || []).map(exam => ({
          ...exam,
          id: exam._id.toString(),
          subjects: subjectsById[exam.subject_id?.toString()] || null
        }));

        return res.status(200).json({
          success: true,
          data: merged,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        });

      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    }

    else if (req.method === 'POST') {
      roleGuard('admin', 'examiner')(req, res, async () => {
        validateExam(req, res, async () => {
          try {
            const {
              title, subject_id, start_time, end_time, duration_mins,
              total_marks, passing_marks, negative_marks, randomize, num_questions
            } = req.body;

            const result = await db.collection('exams').insertOne({
              title,
              subject_id: new ObjectId(subject_id),
              created_by: new ObjectId(req.user.id),
              start_time: new Date(start_time),
              end_time: new Date(end_time),
              duration_mins: parseInt(duration_mins),
              total_marks: parseFloat(total_marks),
              passing_marks: parseFloat(passing_marks),
              negative_marks: negative_marks ? parseFloat(negative_marks) : 0.00,
              status: 'draft',
              randomize: randomize !== undefined ? randomize : true,
              num_questions: num_questions ? parseInt(num_questions) : null,
              final_score: null,
              created_at: new Date()
            });

            const newExam = {
              _id: result.insertedId,
              id: result.insertedId.toString(),
              title,
              subject_id,
              created_by: req.user.id,
              start_time,
              end_time,
              duration_mins,
              total_marks,
              passing_marks,
              negative_marks,
              status: 'draft',
              randomize,
              num_questions
            };

            return res.status(201).json({
              success: true,
              message: 'Exam created successfully in draft',
              data: newExam
            });

          } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Server error' });
          }
        });
      });
    }

    else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

  });
}