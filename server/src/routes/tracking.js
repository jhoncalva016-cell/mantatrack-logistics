const express = require('express');
const db = require('../db');

const router = express.Router();

const STATUS_LABEL = {
  en_ruta: 'En ruta',
  detenido: 'Detenido',
  entregado: 'Entregado',
  desvio: 'Desvío de ruta',
};

// Público: no requiere login. Pensado para compartir con el cliente final.
router.get('/:token', (req, res) => {
  const t = db.prepare('SELECT * FROM trucks WHERE tracking_token = ?').get(req.params.token);
  if (!t) return res.status(404).json({ error: 'Enlace de seguimiento no válido.' });
  const company = db.prepare('SELECT name FROM companies WHERE id = ?').get(t.company_id);
  const driver = t.driver_id ? db.prepare('SELECT name FROM drivers WHERE id = ?').get(t.driver_id) : null;

  res.json({
    companyName: company.name,
    code: t.code,
    driver: driver ? driver.name : '—',
    destination: t.destination,
    eta: t.eta,
    status: t.status,
    statusLabel: STATUS_LABEL[t.status] || t.status,
    lat: t.lat,
    lng: t.lng,
    updatedAt: t.updated_at,
  });
});

module.exports = router;
