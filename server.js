const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'codestorm-admin';
const DB = path.join(__dirname, 'data', 'registrations.json');

app.use(cors());
app.use(express.json());

// ---- tiny JSON-file "database" ----
const readDB = () => {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return []; }
};
const writeDB = (rows) => {
  fs.mkdirSync(path.dirname(DB), { recursive: true });
  fs.writeFileSync(DB, JSON.stringify(rows, null, 2));
};

// ---- API ----
app.get('/api/health', (_, res) => res.json({ status: 'ok', event: 'CodeStorm 2026' }));

app.post('/api/register', (req, res) => {
  const { name = '', email = '', phone = '', type = 'Individual', event = 'CODESTORM 2026 Hackathon' } = req.body || {};
  if (name.trim().length < 3) return res.status(400).json({ error: 'Enter a valid name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: 'Enter a valid 10-digit phone' });
  if (!['Individual', 'Team'].includes(type)) return res.status(400).json({ error: 'Invalid participation type' });

  const rows = readDB();
  if (rows.some(r => r.email.toLowerCase() === email.toLowerCase() && r.event === String(event).slice(0,100)))
    return res.status(409).json({ error: 'This email is already registered for this event' });

  rows.push({ id: rows.length + 1, name: name.trim(), email, phone, type, event: String(event).slice(0,100), registeredAt: new Date().toISOString() });
  writeDB(rows);
  res.status(201).json({ message: 'Registration successful! See you at CodeStorm 2026.' });
});

// Organisers only: send header  x-admin-key: <ADMIN_KEY>
app.get('/api/registrations', (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  const rows = readDB();
  res.json({ total: rows.length, registrations: rows });
});

// ---- serve the frontend from the same server ----
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => console.log(`CodeStorm server running at http://localhost:${PORT}`));