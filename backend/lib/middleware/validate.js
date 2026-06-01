// lib/middleware/validate.js

export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  if (next) next();
};

export const validateExam = (req, res, next) => {
  const { title, subject_id, start_time, end_time, duration_mins, total_marks, passing_marks } = req.body;
  
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Title must be at least 3 characters' });
  }
  if (!subject_id || !/^[0-9a-fA-F]{24}$/.test(subject_id)) {
    return res.status(400).json({ success: false, message: 'Valid subject_id is required' });
  }
  if (!start_time || isNaN(Date.parse(start_time))) {
    return res.status(400).json({ success: false, message: 'Valid start_time is required' });
  }
  if (!end_time || isNaN(Date.parse(end_time))) {
    return res.status(400).json({ success: false, message: 'Valid end_time is required' });
  }
  if (new Date(start_time) >= new Date(end_time)) {
    return res.status(400).json({ success: false, message: 'start_time must be before end_time' });
  }
  if (!duration_mins || parseInt(duration_mins) <= 0) {
    return res.status(400).json({ success: false, message: 'duration_mins must be a positive integer' });
  }
  if (!total_marks || parseFloat(total_marks) <= 0) {
    return res.status(400).json({ success: false, message: 'total_marks must be greater than zero' });
  }
  if (!passing_marks || parseFloat(passing_marks) <= 0 || parseFloat(passing_marks) > parseFloat(total_marks)) {
    return res.status(400).json({ success: false, message: 'passing_marks must be between 0 and total_marks' });
  }
  if (next) next();
};

export const validateQuestion = (req, res, next) => {
  const { subject_id, body, type, correct_answer, marks } = req.body;

  if (!subject_id || !/^[0-9a-fA-F]{24}$/.test(subject_id)) {
    return res.status(400).json({ success: false, message: 'Valid subject_id is required' });
  }
  if (!body || body.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Question body cannot be empty' });
  }
  const validTypes = ['mcq', 'true_false', 'short_answer'];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ success: false, message: 'Type must be mcq, true_false, or short_answer' });
  }
  if (correct_answer === undefined || correct_answer === null || correct_answer.toString().trim() === '') {
    return res.status(400).json({ success: false, message: 'correct_answer is required' });
  }
  if (marks !== undefined && isNaN(parseFloat(marks))) {
    return res.status(400).json({ success: false, message: 'marks must be a decimal value' });
  }
  if (next) next();
};
