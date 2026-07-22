const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, t.code AS truck_code FROM alerts a
    JOIN trucks t ON t.id = a.truck_id
    WHERE a.company_id = ?
    ORDER BY a.resolved ASC, a.created_at DESC
  `).all(req.user.companyId);
  res.json(rows.map(r => ({
    id: r.id, truckCode: r.truck_code, type: r.type, severity: r.severity,
    message: r.message, location: r.location, createdAt: r.created_at, resolved: !!r.resolved,
  })));
});

router.patch('/:id/resolve', (req, res) => {
  const a = db.prepare('SELECT * FROM alerts WHERE id = ? AND company_id = ?').get(req.params.id, req.user.companyId);
  if (!a) return res.status(404).json({ error: 'Alerta no encontrada.' });
  db.prepare('UPDATE alerts SET resolved = 1 WHERE id = ?').run(a.id);
  res.json({ ok: true });
});

module.exports = router;
