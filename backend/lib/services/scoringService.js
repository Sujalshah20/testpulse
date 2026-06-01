// lib/services/scoringService.js
import { getDB, ObjectId } from '../mongodb.js';

export const calculateScore = async (attemptId) => {
  const db = getDB();
  const attemptOid = new ObjectId(attemptId);

  // Fetch attempt with exam info
  const attempt = await db.collection('exam_attempts').findOne({ _id: attemptOid });
  if (!attempt) {
    console.error('Attempt not found:', attemptId);
    return 0;
  }

  // Fetch performance records with question info using aggregation
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
      {
        $lookup: {
          from: 'exams',
          localField: 'exam_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } }
    ])
    .toArray();

  if (!records || records.length === 0) {
    console.error('No performance records found for attempt:', attemptId);
    return 0;
  }

  const negativeMark = records[0]?.exam?.negative_marks || 0;
  let totalScore = 0;
  const bulkUpdates = [];

  for (const record of records) {
    const correct = record.question?.correct_answer;
    const given = record.given_answer;
    const marks = parseFloat(record.question?.marks || 0);
    let obtained = 0;
    let isCorrect = null;

    if (record.question?.type !== 'short_answer') {
      if (given && given.trim().toLowerCase() === correct?.trim().toLowerCase()) {
        obtained = marks;
        isCorrect = true;
      } else if (given && given.trim() !== '') {
        obtained = -(parseFloat(negativeMark));
        isCorrect = false;
      }
      totalScore += obtained;
    }

    bulkUpdates.push({
      updateOne: {
        filter: { _id: record._id },
        update: { $set: { is_correct: isCorrect, marks_obtained: obtained } }
      }
    });
  }

  // Batch update performance records
  if (bulkUpdates.length > 0) {
    await db.collection('performance_records').bulkWrite(bulkUpdates);
  }

  // Update attempt total score and status
  await db.collection('exam_attempts').updateOne(
    { _id: attemptOid },
    {
      $set: {
        total_score: totalScore,
        status: 'submitted',
        submitted_at: new Date()
      }
    }
  );

  return totalScore;
};
