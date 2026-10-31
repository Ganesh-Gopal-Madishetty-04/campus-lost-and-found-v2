const STOPWORDS = new Set([
  'the', 'and', 'with', 'for', 'was', 'has', 'have', 'had', 'this', 'that', 'from',
  'near', 'lost', 'found', 'item', 'left', 'inside', 'its', 'are', 'not', 'but',
  'you', 'your', 'our', 'his', 'her', 'any', 'one', 'out', 'got', 'see',
]);

// "Black Water-Bottles!" -> Set { 'black', 'water', 'bottle' }
function tokenize(text) {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w)); // bottles -> bottle
  return new Set(words);
}

function shared(a, b) {
  return [...a].filter((w) => b.has(w));
}

function daysBetween(lostDate, foundDate) {
  const ms = Date.parse(foundDate) - Date.parse(lostDate);
  return Math.round(ms / 86400000);
}

// Returns { score, reasons } for one lost report and one found report
function scorePair(lost, found) {
  let score = 0;
  const reasons = [];

  if (lost.category === found.category) {
    score += 40;
    reasons.push('Same category');
  }

  const lostWords = tokenize(lost.title + ' ' + lost.description);
  const foundWords = tokenize(found.title + ' ' + found.description);
  const common = shared(lostWords, foundWords);
  if (common.length > 0) {
    score += Math.min(35, common.length * 12);
    reasons.push('Shared keywords: ' + common.slice(0, 5).join(', '));
  }

  const commonPlace = shared(tokenize(lost.location_text), tokenize(found.location_text));
  if (commonPlace.length > 0) {
    score += Math.min(15, commonPlace.length * 7);
    reasons.push('Similar location: ' + commonPlace.join(', '));
  }

  const diff = daysBetween(lost.event_date, found.event_date);
  if (diff >= 0 && diff <= 14) {
    score += diff <= 3 ? 10 : diff <= 7 ? 7 : 3;
    reasons.push(diff === 0 ? 'Same day' : `Found ${diff} day(s) after it was lost`);
  }

  return { score: Math.min(score, 100), reasons };
}

module.exports = { scorePair, tokenize };
