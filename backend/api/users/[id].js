// api/users/[id].js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import { verifyJWT, roleGuard } from '../../lib/middleware/verifyJWT.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = req.query.id || req.url.split('/').pop();

  if (!userId || userId === 'undefined') {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  // Apply verifyJWT first
  verifyJWT(req, res, async () => {
    // Then ensure the user is an admin
    roleGuard('admin')(req, res, async () => {
      const db = getDB();

      if (req.method === 'PUT') {
        try {
          const { name, role, is_active, password } = req.body;
          const updateData = {};

          if (name) updateData.name = name;
          if (role) {
            const validRoles = ['admin', 'examiner', 'student', 'invigilator'];
            if (!validRoles.includes(role)) {
              return res.status(400).json({ success: false, message: 'Invalid role specified' });
            }
            updateData.role = role;
          }
          if (is_active !== undefined) updateData.is_active = is_active;
          
          if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password_hash = await bcrypt.hash(password, salt);
          }

          if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
          }

          const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
          );

          if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }

          return res.status(200).json({
            success: true,
            message: 'User updated successfully'
          });
        } catch (error) {
          console.error('Error updating user:', error);
          return res.status(500).json({ success: false, message: 'Server error updating user' });
        }
      }

      if (req.method === 'DELETE') {
        try {
          // Check if user exists
          const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }

          // Prevent admin from deleting themselves
          if (user._id.toString() === req.user.id) {
            return res.status(403).json({ success: false, message: 'Cannot delete your own account' });
          }

          const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
          
          if (result.deletedCount === 1) {
            // Option to also delete exams/attempts tied to user (cascade), but currently keeping it simple.
            return res.status(200).json({ success: true, message: 'User deleted successfully' });
          } else {
             return res.status(404).json({ success: false, message: 'User not found' });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          return res.status(500).json({ success: false, message: 'Server error deleting user' });
        }
      }

      return res.status(405).json({ success: false, message: 'Method not allowed' });
    });
  });
}
