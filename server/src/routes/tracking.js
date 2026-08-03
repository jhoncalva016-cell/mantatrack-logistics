const express = require('express');
const db = require('../db');

const router = express.Router();

const STATUS_LABEL = {
  en_ruta: 'En ruta',
  detenido: 'Detenido',
  entregado: 'Entregado',
  desvio: 'Desvío de ruta',
  sin_senal: 'Esperando GPS',
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
    plate: t.plate,
    model: t.model,
    driver: driver ? driver.name : '—',
    destination: t.destination,
    eta: t.eta,
    status: t.status,
    statusLabel: STATUS_LABEL[t.status] || t.status,
    trackingMode: t.tracking_mode || 'simulado',
    lat: t.lat,
    lng: t.lng,
    updatedAt: t.updated_at,
  });
});

// Público: usado por el celular del conductor para enviar su ubicación GPS real.
router.post('/:token/location', (req, res) => {
  const t = db.prepare('SELECT * FROM trucks WHERE tracking_token = ?').get(req.params.token);
  if (!t) return res.status(404).json({ error: 'Enlace no válido.' });
  if (t.tracking_mode !== 'real') {
    return res.status(400).json({ error: 'Este camión no está configurado para rastreo GPS real.' });
  }

  const { lat, lng, speedKmh } = req.body || {};
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Coordenadas inválidas.' });
  }

  const nextStatus = t.status === 'entregado' ? 'entregado' : 'en_ruta';
  db.prepare(`UPDATE trucks SET lat = ?, lng = ?, speed_kmh = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(lat, lng, typeof speedKmh === 'number' ? speedKmh : 0, nextStatus, t.id);

  res.json({ ok: true });
});

module.exports = router;
