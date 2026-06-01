// lib/services/reportService.js
import { getDB, ObjectId } from '../mongodb.js';

export const getStudentPerformance = async (studentId) => {
  const db = getDB();
  const studentOid = new ObjectId(studentId);

  // Fetch all attempts with exam and subject info using aggregation
  const attempts = await db.collection('exam_attempts')
    .aggregate([
      { $match: { student_id: studentOid, status: 'submitted' } },
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
      { $unwind: { path: '$examSubject', preserveNullAndEmptyArrays: true } },
      { $sort: { submitted_at: -1 } }
    ])
    .toArray();

  if (!attempts || attempts.length === 0) {
    return {
      totalExams: 0,
      passed: 0,
      failed: 0,
      averageScore: 0,
      passingRate: 0,
      subjectWise: [],
      recentAttempts: []
    };
  }

  let totalScoreSum = 0;
  let totalMarksSum = 0;
  let passed = 0;
  let failed = 0;
  const subjectMap = {};

  for (const attempt of attempts) {
    const score = parseFloat(attempt.total_score || 0);
    const totalMarks = parseFloat(attempt.exam?.total_marks || 0);
    const passingMarks = parseFloat(attempt.exam?.passing_marks || 0);

    totalScoreSum += score;
    totalMarksSum += totalMarks;

    if (score >= passingMarks) {
      passed++;
    } else {
      failed++;
    }

    // Subject-wise aggregation
    const subjectName = attempt.examSubject?.name || 'Unknown';
    const subjectCode = attempt.examSubject?.code || 'UNK';
    if (!subjectMap[subjectCode]) {
      subjectMap[subjectCode] = {
        name: subjectName,
        code: subjectCode,
        totalAttempts: 0,
        totalScore: 0,
        totalMarks: 0,
        passed: 0
      };
    }
    subjectMap[subjectCode].totalAttempts++;
    subjectMap[subjectCode].totalScore += score;
    subjectMap[subjectCode].totalMarks += totalMarks;
    if (score >= passingMarks) subjectMap[subjectCode].passed++;
  }

  const subjectWise = Object.values(subjectMap).map(s => ({
    ...s,
    averagePercentage: s.totalMarks > 0
      ? parseFloat(((s.totalScore / s.totalMarks) * 100).toFixed(2))
      : 0,
    passingRate: s.totalAttempts > 0
      ? parseFloat(((s.passed / s.totalAttempts) * 100).toFixed(2))
      : 0
  }));

  return {
    totalExams: attempts.length,
    passed,
    failed,
    averageScore: totalMarksSum > 0
      ? parseFloat(((totalScoreSum / totalMarksSum) * 100).toFixed(2))
      : 0,
    passingRate: parseFloat(((passed / attempts.length) * 100).toFixed(2)),
    subjectWise,
    recentAttempts: attempts.slice(0, 10).map(a => ({
      id: a._id.toString(),
      examTitle: a.exam?.title,
      score: a.total_score,
      totalMarks: a.exam?.total_marks,
      passingMarks: a.exam?.passing_marks,
      passed: parseFloat(a.total_score || 0) >= parseFloat(a.exam?.passing_marks || 0),
      submittedAt: a.submitted_at
    }))
  };
};
