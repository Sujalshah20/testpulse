// api/users/index.js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import { verifyJWT, roleGuard } from '../../lib/middleware/verifyJWT.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Apply verifyJWT first
  verifyJWT(req, res, async () => {
    // Then ensure the user is an admin
    roleGuard('admin')(req, res, async () => {
      const db = getDB();

      if (req.method === 'GET') {
        try {
          const users = await db.collection('users')
            .find({}, { projection: { password_hash: 0 } })
            .sort({ created_at: -1 })
            .toArray();

          const formattedUsers = users.map(user => ({
            ...user,
            id: user._id.toString(),
            uuid: user.uuid?.toString() || user.uuid
          }));

          return res.status(200).json({ success: true, data: formattedUsers });
        } catch (error) {
          console.error('Error fetching users:', error);
          return res.status(500).json({ success: false, message: 'Server error fetching users' });
        }
      }

      if (req.method === 'POST') {
        try {
          const { name, email, password, role } = req.body;

          if (!name || !email || !password || !role) {
            return res.status(400).json({
              success: false,
              message: 'Name, email, password, and role are required'
            });
          }

          const validRoles = ['admin', 'examiner', 'student', 'invigilator'];
          if (!validRoles.includes(role)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid role specified'
            });
          }

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

          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(password, salt);

          const userUuid = new ObjectId();
          const result = await db.collection('users').insertOne({
            name,
            email: email.toLowerCase(),
            password_hash: passwordHash,
            role,
            is_active: true,
            uuid: userUuid,
            created_at: new Date()
          });

          const newUser = {
            id: result.insertedId.toString(),
            uuid: userUuid.toString(),
            name,
            email: email.toLowerCase(),
            role,
            is_active: true
          };

          return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
          });
        } catch (error) {
          console.error('Error creating user:', error);
          return res.status(500).json({ success: false, message: 'Server error creating user' });
        }
      }

      return res.status(405).json({ success: false, message: 'Method not allowed' });
    });
  });
}
