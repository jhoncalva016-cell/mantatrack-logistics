const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT m.*, t.code AS truck_code FROM maintenance m
    JOIN trucks t ON t.id = m.truck_id
    WHERE m.company_id = ?
    ORDER BY m.status ASC, m.scheduled_date ASC
  `).all(req.user.companyId);
  res.json(rows.map((r) => ({
    id: r.id, truckCode: r.truck_code, type: r.type, description: r.description,
    scheduledDate: r.scheduled_date, status: r.status,
  })));
});

router.post('/', (req, res) => {
  const { truckId, type, description, scheduledDate } = req.body || {};
  if (!truckId || !type) return res.status(400).json({ error: 'Camión y tipo de mantenimiento son requeridos.' });
  const truck = db.prepare('SELECT id FROM trucks WHERE id = ? AND company_id = ?').get(truckId, req.user.companyId);
  if (!truck) return res.status(404).json({ error: 'Camión no encontrado.' });
  const id = db.prepare(`INSERT INTO maintenance (company_id, truck_id, type, description, scheduled_date, status)
    VALUES (?, ?, ?, ?, ?, 'pendiente')`).run(req.user.companyId, truckId, type, description || null, scheduledDate || null).lastInsertRowid;
  res.status(201).json({ id });
});

router.patch('/:id/complete', (req, res) => {
  const m = db.prepare('SELECT * FROM maintenance WHERE id = ? AND company_id = ?').get(req.params.id, req.user.companyId);
  if (!m) return res.status(404).json({ error: 'Registro no encontrado.' });
  db.prepare("UPDATE maintenance SET status = 'completado' WHERE id = ?").run(m.id);
  res.json({ ok: true });
});

module.exports = router;
