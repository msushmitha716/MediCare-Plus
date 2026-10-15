const router = require('express').Router();
const db = require('../config/db');
const wrap = require('../utils/wrap');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT l.id, l.action, l.entity, l.entity_id, l.created_at, u.name AS user_name
     FROM audit_logs l LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.id DESC LIMIT 200`);
  res.json(rows);
}));

module.exports = router;
