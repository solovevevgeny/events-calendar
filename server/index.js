import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'calendar.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const init = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      eventDate TEXT NOT NULL,
      title TEXT NOT NULL,
      distance REAL NOT NULL,
      plannedFinishTime TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )


  `);

  await run(`
    CREATE TABLE IF NOT EXISTS titles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    )
  `);


 
};

const validateEvent = (body) => {
  const errors = [];
  const fullName = String(body.fullName || '').trim();
  const eventDate = String(body.eventDate || '').trim();
  const title = String(body.title || '').trim();
  const plannedFinishTime = String(body.plannedFinishTime || '').trim();
  const distance = Number(body.distance);

  if (!fullName) errors.push('fullName');
  if (!eventDate) errors.push('eventDate');
  if (!title) errors.push('title');
  if (!plannedFinishTime) errors.push('plannedFinishTime');
  if (!Number.isFinite(distance) || distance < 0) errors.push('distance');

  return {
    errors,
    value: {
      fullName,
      eventDate,
      title,
      distance,
      plannedFinishTime,
    },
  };
};

const validateTitle = (body) => {
  const errors = [];
  const fullName = String(body.fullName || '').trim();
  const title = String(body.title || '').trim();

  if (!title) errors.push('title');

  return {
    errors,
    value: {
      title,
    },
  };
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/events', async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, fullName, eventDate, title, distance, plannedFinishTime, createdAt
       FROM events
       ORDER BY eventDate ASC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'db_error' });
  }
});

app.get('/api/titles', async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, title
       FROM titles
       ORDER BY id ASC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'db_error' });
  }
});



app.post('/api/events', async (req, res) => {
  try {
    const { errors, value } = validateEvent(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'validation_error', fields: errors });
    }

    const result = await run(
      `INSERT INTO events (fullName, eventDate, title, distance, plannedFinishTime)
       VALUES (?, ?, ?, ?, ?)`
      ,
      [
        value.fullName,
        value.eventDate,
        value.title,
        value.distance,
        value.plannedFinishTime,
      ]
    );

    const row = await get(
      `SELECT id, fullName, eventDate, title, distance, plannedFinishTime, createdAt
       FROM events
       WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: 'db_error' });
  }
});

//
app.post('/api/titles', async (req, res) => {
  try {
    const { errors, value } = validateTitle(req.body);

    console.log(value);

    if (errors.length) {
      return res.status(400).json({ error: 'validation_error', fields: errors });
    }

    const result = await run(
      `INSERT INTO titles (title)
       VALUES (?)`
      ,
      [
        value.title,
      ]
    );

    const row = await get(
      `SELECT id, title
       FROM titles
       WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: 'db_error' });
  }
});



app.put('/api/events/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'invalid_id' });
    }

    const { errors, value } = validateEvent(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'validation_error', fields: errors });
    }

    const existing = await get('SELECT id FROM events WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'not_found' });
    }

    await run(
      `UPDATE events
       SET fullName = ?, eventDate = ?, title = ?, distance = ?, plannedFinishTime = ?
       WHERE id = ?`,
      [
        value.fullName,
        value.eventDate,
        value.title,
        value.distance,
        value.plannedFinishTime,
        id,
      ]
    );

    const row = await get(
      `SELECT id, fullName, eventDate, title, distance, plannedFinishTime, createdAt
       FROM events
       WHERE id = ?`,
      [id]
    );

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'db_error' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'invalid_id' });
    }

    const existing = await get('SELECT id FROM events WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'not_found' });
    }

    await run('DELETE FROM events WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'db_error' });
  }
});

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to init database', err);
    process.exit(1);
  });
