const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/dogs', async (req, res) => {
  try {
    const [rows] = await req.db.execute(`
      SELECT
        d.name AS dog_name,
        d.size,
        u.username AS owner_username, d.owner_id, d.dog_id
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await req.db.execute(`
      SELECT
        wr.request_id,
        d.name AS dog_name,
        wr.requested_time,
        wr.duration_minutes,
        wr.location,
        u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/walkers/summary', async (req, res) => {
  try {
    const [rows] = await req.db.execute(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating), 2) AS average_rating,
        (
          SELECT COUNT(*)
          FROM WalkRequests wr2
          JOIN WalkApplications wa2 ON wr2.request_id = wa2.request_id
          WHERE wr2.status = 'completed'
            AND wa2.status = 'accepted'
            AND wa2.walker_id = u.user_id
        ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mydogs', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ownerId = req.session.user.user_id;

    const [rows] = await req.db.execute(`
      SELECT dog_id, name
      FROM Dogs
      WHERE owner_id = ?
    `, [ownerId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;