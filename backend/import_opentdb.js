import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function decodeHtmlEntities(text) {
  // Simple unescape for OpenTDB HTML entities
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&Eacute;/g, 'É')
    .replace(/&eacute;/g, 'é');
}

async function run() {
  try {
    // 1. Create or get "Mathematics" subject
    let { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('name', 'Mathematics')
      .single();

    if (!subject) {
      console.log('Creating "Mathematics" subject...');
      const { data: newSubject, error: createError } = await supabase
        .from('subjects')
        .insert({ id: 19, name: 'Mathematics', code: 'MATH101', description: 'Mathematics Trivia' })
        .select()
        .single();
        
      if (createError) throw createError;
      subject = newSubject;
    }

    console.log(`Using Subject: ${subject.name} (ID: ${subject.id})`);

    // 2. Fetch questions from OpenTDB
    console.log('Fetching questions from OpenTDB...');
    const response = await fetch('https://opentdb.com/api.php?amount=50&category=19&type=multiple');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const questionsData = data.results;
    
    if (!questionsData || questionsData.length === 0) {
      console.log('No questions found in API response.');
      return;
    }

    console.log(`Fetched ${questionsData.length} questions. Formatting for database...`);

    // 3. Format questions for our database schema
    const formattedQuestions = questionsData.map((q) => {
      // Decode HTML entities commonly found in OpenTDB
      const questionText = decodeHtmlEntities(q.question);
      const correctAnswer = decodeHtmlEntities(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decodeHtmlEntities);
      
      // Combine and shuffle options slightly (or just keep correct at index 0, frontend can shuffle)
      const options = [correctAnswer, ...incorrectAnswers];

      return {
        subject_id: subject.id,
        body: questionText,
        type: 'mcq', // mapping 'multiple' to 'mcq'
        options: options,
        correct_answer: correctAnswer,
        marks: 1.00,
        difficulty: q.difficulty // easy, medium, hard
      };
    });

    // 4. Insert into database
    console.log('Inserting into database...');
    const { data: inserted, error: insertError } = await supabase
      .from('questions')
      .insert(formattedQuestions)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`✅ Successfully imported ${inserted.length} Mathematics questions!`);

  } catch (error) {
    console.error('❌ Error occurred:', error.message);
  }
}

run();
