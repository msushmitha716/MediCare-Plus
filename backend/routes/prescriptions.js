const router = require('express').Router();
const db = require('../config/db');
const wrap = require('../utils/wrap');
const audit = require('../utils/audit');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'doctor'));

router.get('/', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.*, p.name AS patient_name, u.name AS doctor_name
     FROM prescriptions r
     JOIN patients p ON p.id = r.patient_id
     JOIN users u ON u.id = r.doctor_id
     ORDER BY r.id DESC`);
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const { patient_id, medicine, dosage, duration, notes } = req.body || {};
  if (!patient_id || !medicine || !dosage)
    return res.status(400).json({ error: 'patient_id, medicine and dosage are required' });
  const [p] = await db.query('SELECT id FROM patients WHERE id=?', [patient_id]);
  if (!p.length) return res.status(400).json({ error: 'Patient not found' });
  const [r] = await db.query(
    'INSERT INTO prescriptions (patient_id, doctor_id, medicine, dosage, duration, notes) VALUES (?,?,?,?,?,?)',
    [patient_id, req.user.id, medicine, dosage, duration || null, notes || null]);
  await audit(req.user.id, 'CREATE', 'prescription', r.insertId);
  res.status(201).json({ id: r.insertId });
}));

module.exports = router;