// api/questions/[id].js
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

    roleGuard('admin', 'examiner')(req, res, async () => {
      const questionId = req.query.id;

      let questionOid;
      try {
        questionOid = new ObjectId(questionId);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid question ID' });
      }

      if (req.method === 'GET') {
        try {
          const question = await db.collection('questions').findOne({ _id: questionOid });

          if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
          }

          // Fetch subject info
          let subject = null;
          if (question.subject_id) {
            subject = await db.collection('subjects').findOne(
              { _id: question.subject_id },
              { projection: { name: 1, code: 1 } }
            );
          }

          return res.status(200).json({
            success: true,
            data: {
              id: question._id.toString(),
              subject_id: question.subject_id?.toString(),
              body: question.body,
              type: question.type,
              options: question.options,
              correct_answer: question.correct_answer,
              marks: question.marks,
              difficulty: question.difficulty,
              version: question.version,
              subjects: subject
            }
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }
      }

      else if (req.method === 'PUT') {
        validateQuestion(req, res, async () => {
          try {
            const { subject_id, body, type, options, correct_answer, marks, difficulty, version } = req.body;

            // Fetch original to increment version
            const original = await db.collection('questions').findOne(
              { _id: questionOid },
              { projection: { version: 1 } }
            );

            if (!original) {
              return res.status(404).json({ success: false, message: 'Question not found' });
            }

            const nextVersion = version || (original.version + 1);

            await db.collection('questions').updateOne(
              { _id: questionOid },
              {
                $set: {
                  subject_id: ObjectId.createFromHexString(subject_id),
                  body,
                  type,
                  options: options || null,
                  correct_answer: correct_answer.toString().trim(),
                  marks: parseFloat(marks),
                  difficulty: difficulty || 'medium',
                  version: nextVersion
                }
              }
            );

            const updatedQuestion = await db.collection('questions').findOne({ _id: questionOid });

            return res.status(200).json({
              success: true,
              message: 'Question updated successfully',
              data: {
                id: updatedQuestion._id.toString(),
                subject_id: updatedQuestion.subject_id?.toString(),
                body: updatedQuestion.body,
                type: updatedQuestion.type,
                options: updatedQuestion.options,
                correct_answer: updatedQuestion.correct_answer,
                marks: updatedQuestion.marks,
                difficulty: updatedQuestion.difficulty,
                version: updatedQuestion.version
              }
            });

          } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Server error' });
          }
        });
      }

      else if (req.method === 'DELETE') {
        try {
          const result = await db.collection('questions').deleteOne({ _id: questionOid });

          if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
          }

          return res.status(200).json({
            success: true,
            message: 'Question deleted successfully'
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }
      }

      else {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

    });
  });
}