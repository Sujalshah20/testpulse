import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function testBackendAPI() {
  const token = jwt.sign(
    { id: 11, role: 'admin', uuid: 'some-uuid' }, // using id 11 from the previous test
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const payload = {
    title: 'Test Exam via API',
    subject_id: 1,
    duration_mins: 60,
    total_marks: 100,
    passing_marks: 40,
    negative_marks: 0,
    start_time: '2026-05-28T10:00',
    end_time: '2026-05-28T12:00',
    randomize: true
  };

  try {
    const res = await fetch('http://localhost:3000/api/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testBackendAPI();
