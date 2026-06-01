-- Online Examination Processing Platform (OEPP) Database Schema
-- Paste and execute this in the Supabase SQL Editor (https://supabase.com)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' 
    CHECK (role IN ('admin','examiner','student','invigilator')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  type VARCHAR(20) NOT NULL 
    CHECK (type IN ('mcq','true_false','short_answer')),
  options JSONB, -- For MCQs: ['Option A', 'Option B', 'Option C', 'Option D']
  correct_answer VARCHAR(500) NOT NULL,
  marks DECIMAL(5,2) DEFAULT 1.00,
  difficulty VARCHAR(10) DEFAULT 'medium'
    CHECK (difficulty IN ('easy','medium','hard')),
  version INT DEFAULT 1
);

-- 4. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_mins INT NOT NULL,
  total_marks DECIMAL(8,2) NOT NULL,
  passing_marks DECIMAL(8,2) NOT NULL,
  negative_marks DECIMAL(5,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft','live','completed')),
  randomize BOOLEAN DEFAULT true,
  final_score DECIMAL(8,2),
  num_questions INT DEFAULT NULL
);

-- 5. EXAM ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS exam_attempts (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'in_progress'
    CHECK (status IN ('in_progress','submitted','void')),
  ip_address VARCHAR(45),
  total_score DECIMAL(8,2),
  UNIQUE(exam_id, student_id)
);

-- 6. PERFORMANCE RECORDS TABLE (Stores actual responses per question per attempt)
CREATE TABLE IF NOT EXISTS performance_records (
  id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  given_answer TEXT,
  is_correct BOOLEAN,
  marks_obtained DECIMAL(5,2) DEFAULT 0.00,
  time_spent_sec INT DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_status ON exams(status, start_time);
CREATE INDEX IF NOT EXISTS idx_attempt_student ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_perf_attempt ON performance_records(attempt_id);

-- Row Level Security (Supabase RLS)
-- We enable RLS on these core tables. Since our backend uses the high-privilege 
-- supabase_service_role key, it automatically bypasses RLS policies to perform secure, 
-- centralized queries. Direct public access from standard anon clients is blocked by default.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_records ENABLE ROW LEVEL SECURITY;
