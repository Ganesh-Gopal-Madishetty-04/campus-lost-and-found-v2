require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Lost & AI Found API is running' });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('Could not start server:', err.message);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
server.on('error', (err) => {
  console.error('Could not start server:', err.message);
  process.exit(1);
});
