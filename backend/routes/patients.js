const router = require('express').Router();
const db = require('../config/db');
const wrap = require('../utils/wrap');
const audit = require('../utils/audit');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM patients ORDER BY id DESC');
  res.json(rows);
}));

router.post('/', authorize('admin', 'receptionist'), wrap(async (req, res) => {
  const { name, dob, gender, phone, blood_group, allergies } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
  const [r] = await db.query(
    'INSERT INTO patients (name, dob, gender, phone, blood_group, allergies) VALUES (?,?,?,?,?,?)',
    [name, dob || null, gender || null, phone, blood_group || null, allergies || null]);
  await audit(req.user.id, 'CREATE', 'patient', r.insertId);
  res.status(201).json({ id: r.insertId });
}));

router.put('/:id', authorize('admin', 'receptionist'), wrap(async (req, res) => {
  const { name, dob, gender, phone, blood_group, allergies } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
  const [r] = await db.query(
    'UPDATE patients SET name=?, dob=?, gender=?, phone=?, blood_group=?, allergies=? WHERE id=?',
    [name, dob || null, gender || null, phone, blood_group || null, allergies || null, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Patient not found' });
  await audit(req.user.id, 'UPDATE', 'patient', req.params.id);
  res.json({ message: 'Updated' });
}));

router.delete('/:id', authorize('admin'), wrap(async (req, res) => {
  const [r] = await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Patient not found' });
  await audit(req.user.id, 'DELETE', 'patient', req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;