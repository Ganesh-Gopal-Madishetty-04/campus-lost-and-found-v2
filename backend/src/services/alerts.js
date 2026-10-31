const db = require('../db/database');
const { scorePair } = require('./matching');
const { sendEmail } = require('./email');

const THRESHOLD = 45; // keep in step with routes/matches.js
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS match_alerts (
    lost_id INTEGER NOT NULL REFERENCES reports(id),
    found_id INTEGER NOT NULL REFERENCES reports(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lost_id, found_id)
  );
`);

// Save an in-app notification and send (print) the email
function notify(userId, type, subject, message) {
  db.prepare('INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)')
    .run(userId, type, message);

  const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(userId);
  if (!user) return;

  sendEmail({
    to: user.email,
    subject,
    text: `Hi ${user.name},\n\n${message}\n\nOpen the app: ${APP_URL}\n`,
  }).catch((err) => console.error('Email failed:', err.message));
}

// Alerts must never break the request that triggered them
function safe(fn) {
  return (...args) => {
    try {
      fn(...args);
    } catch (err) {
      console.error('Alert error:', err.message);
    }
  };
}

const onNewReport = safe((reportId) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
  if (!report) return;

  const oppositeType = report.type === 'lost' ? 'found' : 'lost';
  const candidates = db
    .prepare("SELECT * FROM reports WHERE type = ? AND status = 'open' AND user_id != ? LIMIT 500")
    .all(oppositeType, report.user_id);

  let count = 0;
  for (const other of candidates) {
    const lost = report.type === 'lost' ? report : other;
    const found = report.type === 'found' ? report : other;
    const { score } = scorePair(lost, found);
    if (score < THRESHOLD) continue;

    // each lost/found pair is alerted only once
    const added = db
      .prepare('INSERT OR IGNORE INTO match_alerts (lost_id, found_id) VALUES (?, ?)')
      .run(lost.id, found.id);
    if (added.changes === 0) continue;

    count++;
    notify(
      other.user_id,
      'match',
      'A possible match for your report',
      `A new ${report.type} report ("${report.title}") might match your ${other.type} report "${other.title}" (match score ${score}/100).`
    );
  }

  if (count > 0) {
    notify(
      report.user_id,
      'match',
      'Possible matches for your report',
      `We found ${count} possible match${count > 1 ? 'es' : ''} for your ${report.type} report "${report.title}".`
    );
  }
});

const onNewClaim = safe((claimId) => {
  const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(claimId);
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(claim.report_id);
  const claimant = db.prepare('SELECT name FROM users WHERE id = ?').get(claim.claimant_id);

  notify(
    report.user_id,
    'claim',
    'Someone claimed your item',
    `${claimant.name} sent a claim on your report "${report.title}". Review it and approve or reject it.`
  );
});

const onClaimDecided = safe((claimId) => {
  const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(claimId);
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(claim.report_id);

  const approved = claim.status === 'approved';
  notify(
    claim.claimant_id,
    'claim_decision',
    approved ? 'Your claim was approved' : 'Your claim was rejected',
    approved
      ? `Your claim on "${report.title}" was approved. Open the app to see the contact details.`
      : `Your claim on "${report.title}" was not approved.`
  );
});

module.exports = { onNewReport, onNewClaim, onClaimDecided };
