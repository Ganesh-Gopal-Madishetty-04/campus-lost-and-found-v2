const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const alerts = require('../services/alerts');

const router = express.Router();

const CATEGORIES = ['bottles_food', 'id_cards', 'electronics', 'study_material', 'sports', 'bags_personal', 'other'];
const TYPES = ['lost', 'found'];
const STATUSES = ['open', 'claimed', 'returned'];

// ---- photo upload setup ----
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_IMAGES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    // random file name, so users can't overwrite files or sneak in odd names
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString('hex') + ALLOWED_IMAGES[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGES[file.mimetype]) cb(null, true);
    else cb(new Error('Only JPG, PNG or WEBP images are allowed'));
  },
});

function handleUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB' : err.message;
      return res.status(400).json({ error: msg });
    }
    next();
  });
}

// Public fields only: the reporter's email is never exposed
const SELECT_REPORT = `
  SELECT r.id, r.user_id, r.type, r.title, r.category, r.description,
         r.location_text, r.event_date, r.image_path, r.status, r.created_at,
         u.name AS reporter_name
  FROM reports r
  JOIN users u ON u.id = r.user_id
`;

// ---- create a report ----
router.post('/', requireAuth, handleUpload, (req, res) => {
  const type = (req.body.type || '').trim();
  const title = (req.body.title || '').trim();
  const category = (req.body.category || '').trim();
  const description = (req.body.description || '').trim();
  const location_text = (req.body.location_text || '').trim();
  const event_date = (req.body.event_date || new Date().toISOString().slice(0, 10)).trim();

  const fail = (msg) => {
    if (req.file) fs.unlink(req.file.path, () => {}); // don't keep the photo of a rejected report
    return res.status(400).json({ error: msg });
  };

  if (!TYPES.includes(type)) return fail('type must be "lost" or "found"');
  if (!title || title.length > 100) return fail('Title is required (max 100 characters)');
  if (!CATEGORIES.includes(category)) return fail('Invalid category');
  if (description.length > 1000) return fail('Description is too long (max 1000 characters)');
  if (location_text.length > 200) return fail('Location is too long (max 200 characters)');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date)) return fail('event_date must look like 2026-10-31');

  const image_path = req.file ? '/uploads/' + req.file.filename : null;

  const result = db
    .prepare(
      `INSERT INTO reports (user_id, type, title, category, description, location_text, event_date, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, type, title, category, description, location_text, event_date, image_path);

  const report = db.prepare(SELECT_REPORT + ' WHERE r.id = ?').get(result.lastInsertRowid);
  alerts.onNewReport(result.lastInsertRowid);
  res.status(201).json({ report });
});

// ---- list / search / filter ----
router.get('/', (req, res) => {
  const { type, category, q, status } = req.query;
  const where = [];
  const params = [];

  if (TYPES.includes(type)) { where.push('r.type = ?'); params.push(type); }
  if (CATEGORIES.includes(category)) { where.push('r.category = ?'); params.push(category); }
  where.push('r.status = ?');
  params.push(STATUSES.includes(status) ? status : 'open');

  if (typeof q === 'string' && q.trim()) {
    const like = `%${q.trim()}%`;
    where.push('(r.title LIKE ? OR r.description LIKE ? OR r.location_text LIKE ?)');
    params.push(like, like, like);
  }

  const rows = db
    .prepare(SELECT_REPORT + ' WHERE ' + where.join(' AND ') + ' ORDER BY r.created_at DESC, r.id DESC LIMIT 50')
    .all(...params);
  res.json({ reports: rows });
});

// ---- my reports (must come BEFORE '/:id') ----
router.get('/mine', requireAuth, (req, res) => {
  const rows = db
    .prepare(SELECT_REPORT + ' WHERE r.user_id = ? ORDER BY r.created_at DESC, r.id DESC')
    .all(req.user.id);
  res.json({ reports: rows });
});

// ---- one report ----
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const report = db.prepare(SELECT_REPORT + ' WHERE r.id = ?').get(id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ report });
});

// ---- update (owner or admin only) ----
router.patch('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const existing = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Report not found' });
  if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only edit your own reports' });
  }

  const title = req.body.title !== undefined ? String(req.body.title).trim() : existing.title;
  const description = req.body.description !== undefined ? String(req.body.description).trim() : existing.description;
  const location_text = req.body.location_text !== undefined ? String(req.body.location_text).trim() : existing.location_text;
  const status = req.body.status !== undefined ? req.body.status : existing.status;

  if (!title || title.length > 100) return res.status(400).json({ error: 'Title is required (max 100 characters)' });
  if (description.length > 1000) return res.status(400).json({ error: 'Description is too long' });
  if (location_text.length > 200) return res.status(400).json({ error: 'Location is too long' });
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  db.prepare('UPDATE reports SET title = ?, description = ?, location_text = ?, status = ? WHERE id = ?')
    .run(title, description, location_text, status, id);

  const report = db.prepare(SELECT_REPORT + ' WHERE r.id = ?').get(id);
  res.json({ report });
});

module.exports = router;
