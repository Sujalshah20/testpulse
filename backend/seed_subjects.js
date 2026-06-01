import dotenv from 'dotenv';
import { connectToMongoDB, getDB } from './lib/mongodb.js';

dotenv.config();

async function run() {
  try {
    await connectToMongoDB();
    const db = getDB();

    const subjects = [
      { name: 'Computer Science 101', code: 'CS101', description: 'Intro to CS' },
      { name: 'Data Structures', code: 'CS201', description: 'Advanced Data Structures' },
      { name: 'Web Development', code: 'WD101', description: 'Fullstack Web Dev' },
      { name: 'Mathematics', code: 'MATH101', description: 'Mathematics Trivia' }
    ];

    const result = await db.collection('subjects').insertMany(subjects);
    
    console.log('Successfully seeded subjects into MongoDB!');
    console.log('Inserted IDs:', result.insertedIds);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding subjects:', err);
    process.exit(1);
  }
}

run();
