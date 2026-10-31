const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { scorePair } = require('../services/matching');

const router = express.Router();

const THRESHOLD = 45; // minimum score to count as a possible match
const MAX_RESULTS = 10;

router.get('/reports/:id/matches', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the reporter can see matches' });
  }

  // Open reports of the opposite type, from other people. No emails are selected.
  const oppositeType = report.type === 'lost' ? 'found' : 'lost';
  const candidates = db
    .prepare(
      `SELECT r.id, r.type, r.title, r.category, r.description, r.location_text,
              r.event_date, r.image_path, r.status, r.created_at,
              u.name AS reporter_name
       FROM reports r
       JOIN users u ON u.id = r.user_id
       WHERE r.type = ? AND r.status = 'open' AND r.user_id != ?
       ORDER BY r.created_at DESC
       LIMIT 500`
    )
    .all(oppositeType, report.user_id);

  const matches = candidates
    .map((c) => {
      const { score, reasons } =
        report.type === 'lost' ? scorePair(report, c) : scorePair(c, report);
      return { score, reasons, report: c };
    })
    .filter((m) => m.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  res.json({ matches });
});

module.exports = router;
