// api/results/performance/[studentId].js
import { verifyJWT } from '../../../lib/middleware/verifyJWT.js';
import { getStudentPerformance } from '../../../lib/services/reportService.js';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  await verifyJWT(req, res, async () => {
    try {
      const studentId = req.query.studentId;
      if (!studentId || !/^[0-9a-fA-F]{24}$/.test(studentId)) {
        return res.status(400).json({ success: false, message: 'Invalid student ID' });
      }

      // Students can only view their own performance
      if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const performance = await getStudentPerformance(studentId);

      if (performance === null) {
        return res.status(500).json({ success: false, message: 'Failed to generate report' });
      }

      return res.status(200).json({
        success: true,
        data: performance
      });

    } catch (err) {
      console.error('Performance report error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
}
