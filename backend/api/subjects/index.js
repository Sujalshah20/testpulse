// api/subjects/index.js
import { getDB } from '../../lib/mongodb.js';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const db = getDB();
      const subjects = await db.collection('subjects').find({}).toArray();
      
      const formatted = subjects.map(s => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code
      }));

      return res.status(200).json({ success: true, data: formatted });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
