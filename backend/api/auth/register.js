// api/auth/register.js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({
    success: false, message: 'Method not allowed'
  });

  try {
    const { name, email, password, role } = req.body;
    const db = getDB();

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Role check
    const validRoles = ['admin', 'examiner', 'student', 'invigilator'];
    const chosenRole = role || 'student';
    if (!validRoles.includes(chosenRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check if email already exists
    const existingUser = await db.collection('users').findOne(
      { email: email.toLowerCase() },
      { projection: { _id: 1 } }
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save user to database
    const userUuid = new ObjectId();
    const result = await db.collection('users').insertOne({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: chosenRole,
      is_active: true,
      uuid: userUuid,
      created_at: new Date()
    });

    const newUser = {
      _id: result.insertedId,
      id: result.insertedId.toString(),
      uuid: userUuid.toString(),
      name,
      email: email.toLowerCase(),
      role: chosenRole
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: newUser
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}