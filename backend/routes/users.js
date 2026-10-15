const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const wrap = require('../utils/wrap');
const audit = require('../utils/audit');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// any logged-in user: used by the Doctors page and the appointment dropdown
router.get('/doctors', wrap(async (req, res) => {
  const [rows] = await db.query("SELECT id, name, email FROM users WHERE role='doctor' ORDER BY name");
  res.json(rows);
}));

router.get('/', authorize('admin'), wrap(async (req, res) => {
  const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
  res.json(rows);
}));

router.post('/', authorize('admin'), wrap(async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields are required' });
  if (!['admin', 'doctor', 'receptionist'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const [exists] = await db.query('SELECT id FROM users WHERE email=?', [email]);
  if (exists.length) return res.status(409).json({ error: 'Email already in use' });
  const hash = await bcrypt.hash(password, 10);
  const [r] = await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
    [name, email, hash, role]);
  await audit(req.user.id, 'CREATE', 'user', r.insertId);
  res.status(201).json({ id: r.insertId });
}));

router.delete('/:id', authorize('admin'), wrap(async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'You cannot delete yourself' });
  const [r] = await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'User not found' });
  await audit(req.user.id, 'DELETE', 'user', req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;