const path = require('path');
const fs = require('fs');

const usersJsonPath = path.join(__dirname, '..', 'db', 'users.json');

// Load existing users
let usersData = [];

try {
  usersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf-8'));
  console.log('Users loaded:', usersData);
} catch (err) {
  console.error('Failed to load users.json:', err);
}
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite DB
const dbPath = path.join(__dirname, 'db', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to DB', err);
  } else {
    console.log('Connected to DB');
  }
});

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  bytemail TEXT UNIQUE,
  email TEXT,
  password TEXT
)`);

// Generate new UID like UID-000001
function generateUID(callback) {
  db.get(`SELECT uid FROM users ORDER BY uid DESC LIMIT 1`, [], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(null, 'UID-000001');
    let lastNum = parseInt(row.uid.split('-')[1]);
    let newNum = (lastNum + 1).toString().padStart(6, '0');
    callback(null, `UID-${newNum}`);
  });
}

// Sign-up route
app.post('/api/signup', (req, res) => {
  const { bytemail, email, password } = req.body;

  if (!bytemail || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Check if bytemail already exists
  db.get('SELECT * FROM users WHERE bytemail = ?', [bytemail], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (row) {
      return res.json({ success: false, message: 'Bytemail already taken' });
    }

    // Generate UID and insert new user
    generateUID((err, newUID) => {
      if (err) return res.status(500).json({ error: 'UID generation error' });

      db.run(
        'INSERT INTO users (uid, bytemail, email, password) VALUES (?, ?, ?, ?)',
        [newUID, bytemail, email, password],
        (err) => {
          if (err) return res.status(500).json({ error: 'DB insert error' });

          res.json({ success: true, uid: newUID });
        }
      );
    });
  });
});

// Sign-in route
app.post('/api/signin', (req, res) => {
  const { bytemail, password } = req.body;

  if (!bytemail || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  db.get('SELECT * FROM users WHERE bytemail = ? AND password = ?', [bytemail, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (row) {
      res.json({ success: true, uid: row.uid, email: row.email });
    } else {
      res.json({ success: false, message: 'Invalid bytemail or password' });
    }
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
const path = require('path');
const bytemailDBPath = path.join(__dirname, 'db', 'bytemails.db');
const bytemailDB = new sqlite3.Database(bytemailDBPath);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Create emails table if not exists
bytemailDB.run(`
CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_uid TEXT,
  to_address TEXT,
  subject TEXT,
  body TEXT,
  folder TEXT, -- 'Inbox' or 'Sent'
  timestamp TEXT
)`);

// Send email
app.post('/api/send', (req, res) => {
  const { from_uid, to_address, subject, body } = req.body;
  const timestamp = new Date().toISOString();

  if (!from_uid || !to_address || !subject || !body) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Add to sender's Sent folder
  bytemailDB.run(
    `INSERT INTO emails (from_uid, to_address, subject, body, folder, timestamp)
     VALUES (?, ?, ?, ?, 'Sent', ?)`,
    [from_uid, to_address, subject, body, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save email (sent)' });

      // Now add to recipient's Inbox if they exist
      db.get('SELECT * FROM users WHERE bytemail = ?', [to_address], (err, row) => {
        if (row) {
          bytemailDB.run(
            `INSERT INTO emails (from_uid, to_address, subject, body, folder, timestamp)
             VALUES (?, ?, ?, ?, 'Inbox', ?)`,
            [from_uid, to_address, subject, body, timestamp],
            (err) => {
              if (err) return res.status(500).json({ error: 'Failed to deliver email' });
              return res.json({ success: true });
            }
          );
        } else {
          // Recipient doesn't exist — still allow sender's sent mail
          return res.json({ success: true, warning: "Recipient not found" });
        }
      });
    }
  );
});

