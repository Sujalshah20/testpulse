// api/exams/[id].js
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
    const examId = req.query.id;

    let examOid;
    try {
      examOid = new ObjectId(examId);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid exam ID' });
    }

    if (req.method === 'GET') {
      try {
        const exam = await db.collection('exams').findOne({ _id: examOid });

        if (!exam) {
          return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Fetch subject info
        let subject = null;
        if (exam.subject_id) {
          subject = await db.collection('subjects').findOne(
            { _id: exam.subject_id },
            { projection: { name: 1, code: 1 } }
          );
        }

        const responseExam = {
          id: exam._id.toString(),
          title: exam.title,
          subject_id: exam.subject_id?.toString(),
          created_by: exam.created_by?.toString(),
          start_time: exam.start_time,
          end_time: exam.end_time,
          duration_mins: exam.duration_mins,
          total_marks: exam.total_marks,
          passing_marks: exam.passing_marks,
          negative_marks: exam.negative_marks,
          status: exam.status,
          randomize: exam.randomize,
          final_score: exam.final_score,
          num_questions: exam.num_questions,
          subjects: subject
        };

        return res.status(200).json({ success: true, data: responseExam });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    }

    else if (req.method === 'PUT') {
      roleGuard('admin', 'examiner')(req, res, async () => {
        validateExam(req, res, async () => {
          try {
            const {
              title, subject_id, start_time, end_time, duration_mins,
              total_marks, passing_marks, negative_marks, randomize, status
            } = req.body;

            // Fetch original to verify it exists
            const original = await db.collection('exams').findOne(
              { _id: examOid },
              { projection: { status: 1 } }
            );

            if (!original) {
              return res.status(404).json({ success: false, message: 'Exam not found' });
            }

            const updateData = {
              title,
              subject_id: new ObjectId(subject_id),
              start_time: new Date(start_time),
              end_time: new Date(end_time),
              duration_mins: parseInt(duration_mins),
              total_marks: parseFloat(total_marks),
              passing_marks: parseFloat(passing_marks),
              negative_marks: negative_marks ? parseFloat(negative_marks) : 0.00,
              status: status || original.status,
              randomize: randomize !== undefined ? randomize : true
            };

            await db.collection('exams').updateOne({ _id: examOid }, { $set: updateData });

            const updatedExam = await db.collection('exams').findOne({ _id: examOid });

            return res.status(200).json({
              success: true,
              message: 'Exam updated successfully',
              data: {
                id: updatedExam._id.toString(),
                ...updatedExam
              }
            });

          } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Server error' });
          }
        });
      });
    }

    else if (req.method === 'DELETE') {
      roleGuard('admin', 'examiner')(req, res, async () => {
        try {
          const exam = await db.collection('exams').findOne(
            { _id: examOid },
            { projection: { status: 1, title: 1 } }
          );

          if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
          }

          if (exam.status === 'live') {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete a live exam. Please wait for it to complete first.'
            });
          }

          // Delete exam and cascade attempts
          await db.collection('exams').deleteOne({ _id: examOid });
          await db.collection('exam_attempts').deleteMany({ exam_id: examOid });

          return res.status(200).json({
            success: true,
            message: `Exam "${exam.title}" deleted successfully`
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
}