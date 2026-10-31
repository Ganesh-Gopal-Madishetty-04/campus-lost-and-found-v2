const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ---- submit a claim on a report ----
router.post('/reports/:id/claims', requireAuth, (req, res) => {
  const reportId = Number(req.params.id);
  if (!Number.isInteger(reportId)) return res.status(400).json({ error: 'Invalid id' });

  const message = (req.body.message || '').trim();
  if (!message || message.length > 500) {
    return res.status(400).json({ error: 'Message is required (max 500 characters)' });
  }

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.user_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot claim your own report' });
  }
  if (report.status !== 'open') {
    return res.status(400).json({ error: 'This report is no longer open' });
  }

  const duplicate = db
    .prepare("SELECT id FROM claims WHERE report_id = ? AND claimant_id = ? AND status = 'pending'")
    .get(reportId, req.user.id);
  if (duplicate) {
    return res.status(409).json({ error: 'You already have a pending claim on this report' });
  }

  const result = db
    .prepare('INSERT INTO claims (report_id, claimant_id, message) VALUES (?, ?, ?)')
    .run(reportId, req.user.id, message);

  const claim = db
    .prepare('SELECT id, report_id, message, status, created_at FROM claims WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json({ claim });
});

// ---- claims on a report (report owner or admin only) ----
router.get('/reports/:id/claims', requireAuth, (req, res) => {
  const reportId = Number(req.params.id);
  if (!Number.isInteger(reportId)) return res.status(400).json({ error: 'Invalid id' });

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the reporter can see claims' });
  }

  // The claimant's email is shared only once the owner approves
  const claims = db
    .prepare(
      `SELECT c.id, c.report_id, c.message, c.status, c.created_at,
              u.name AS claimant_name,
              CASE WHEN c.status = 'approved' THEN u.email END AS claimant_email
       FROM claims c
       JOIN users u ON u.id = c.claimant_id
       WHERE c.report_id = ?
       ORDER BY c.created_at DESC, c.id DESC`
    )
    .all(reportId);
  res.json({ claims });
});

// ---- claims I have made (must come BEFORE '/claims/:id') ----
router.get('/claims/mine', requireAuth, (req, res) => {
  // The owner's email is shown only on approved claims
  const claims = db
    .prepare(
      `SELECT c.id, c.report_id, c.message, c.status, c.created_at,
              r.title AS report_title, r.type AS report_type,
              CASE WHEN c.status = 'approved' THEN o.email END AS owner_email
       FROM claims c
       JOIN reports r ON r.id = c.report_id
       JOIN users o ON o.id = r.user_id
       WHERE c.claimant_id = ?
       ORDER BY c.created_at DESC, c.id DESC`
    )
    .all(req.user.id);
  res.json({ claims });
});

// ---- approve or reject (report owner or admin only) ----
router.patch('/claims/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const status = req.body.status;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
  }

  const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(claim.report_id);
  if (report.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the reporter can decide on claims' });
  }
  if (claim.status !== 'pending') {
    return res.status(400).json({ error: 'This claim has already been decided' });
  }
  if (status === 'approved' && report.status !== 'open') {
    return res.status(400).json({ error: 'This report is no longer open' });
  }

  // All changes happen together, or none of them do
  const decide = db.transaction(() => {
    db.prepare('UPDATE claims SET status = ? WHERE id = ?').run(status, id);
    if (status === 'approved') {
      db.prepare("UPDATE claims SET status = 'rejected' WHERE report_id = ? AND id != ? AND status = 'pending'")
        .run(claim.report_id, id);
      db.prepare("UPDATE reports SET status = 'claimed' WHERE id = ?").run(claim.report_id);
    }
  });
  decide();

  const updated = db
    .prepare(
      `SELECT c.id, c.report_id, c.message, c.status, c.created_at,
              u.name AS claimant_name,
              CASE WHEN c.status = 'approved' THEN u.email END AS claimant_email
       FROM claims c JOIN users u ON u.id = c.claimant_id
       WHERE c.id = ?`
    )
    .get(id);
  res.json({ claim: updated });
});

module.exports = router;
