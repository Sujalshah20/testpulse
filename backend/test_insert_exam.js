import dotenv from 'dotenv';
dotenv.config();

async function testPost() {
  // 1. Get an access token by logging in (assume test user exists or we can get user)
  // Let's just create a test user or bypass JWT for local script?
  // Easier to just hit Supabase directly to simulate what the backend does
  
  import { createClient } from '@supabase/supabase-js';
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Get a valid user ID
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    console.log('No users found in DB');
    return;
  }
  const userId = users[0].id;
  
  // Try inserting an exam exactly as the backend does
  const insertPayload = {
    title: 'Test Exam',
    subject_id: 1, // We know this exists
    created_by: userId,
    start_time: '2026-05-28T10:00:00Z',
    end_time: '2026-05-28T12:00:00Z',
    duration_mins: 60,
    total_marks: 100,
    passing_marks: 40,
    negative_marks: 0.00,
    status: 'draft',
    randomize: true
  };
  
  console.log('Attempting to insert:', insertPayload);
  const { data, error } = await supabase.from('exams').insert(insertPayload).select().single();
  
  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Success:', data);
  }
}

testPost();
