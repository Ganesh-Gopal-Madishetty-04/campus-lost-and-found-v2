const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const notifications = db
    .prepare('SELECT id, type, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50')
    .all(req.user.id);
  const unread = notifications.filter((n) => !n.is_read).length;
  res.json({ unread, notifications });
});

router.patch('/:id/read', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const result = db
    .prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
    .run(id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Notification not found' });
  res.json({ ok: true });
});

module.exports = router;
