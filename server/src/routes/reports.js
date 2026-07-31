const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const KIND_TITLE = {
  resumen: 'Resumen de flota',
  rendimiento: 'Rendimiento de camiones',
  combustible: 'Consumo de combustible',
  entregas: 'Entregas realizadas',
};

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM reports WHERE company_id = ? ORDER BY created_at DESC').all(req.user.companyId);
  res.json(rows.map(r => ({
    id: r.id, kind: r.kind, title: KIND_TITLE[r.kind] || r.kind,
    rangeStart: r.range_start, rangeEnd: r.range_end, createdAt: r.created_at,
  })));
});

router.post('/generate', (req, res) => {
  const { kind = 'resumen', rangeStart, rangeEnd } = req.body || {};
  const companyId = req.user.companyId;
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);
  const trucks = db.prepare('SELECT * FROM trucks WHERE company_id = ?').all(companyId);
  const historyIds = trucks.map(t => t.id);
  let history = [];
  if (historyIds.length) {
    history = db.prepare(`SELECT rh.*, t.code truck_code FROM route_history rh
      JOIN trucks t ON t.id = rh.truck_id WHERE rh.truck_id IN (${historyIds.map(() => '?').join(',')})
      ORDER BY rh.date DESC`).all(...historyIds);
  }

  const reportId = db.prepare(`INSERT INTO reports (company_id, kind, range_start, range_end, file_name)
    VALUES (?, ?, ?, ?, ?)`).run(companyId, kind, rangeStart || null, rangeEnd || null, `${kind}.pdf`).lastInsertRowid;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="mantatrack-${kind}-${reportId}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fillColor('#F5A623').rect(50, 45, 8, 24).fill();
  doc.fillColor('#1F2937').fontSize(20).text('CalGuy Track Logistics', 68, 45);
  doc.fillColor('#6B7280').fontSize(10).text(company.name, 68, 68);

  doc.moveDown(2);
  doc.fillColor('#111827').fontSize(16).text(KIND_TITLE[kind] || 'Reporte de flota', { underline: false });
  doc.fillColor('#6B7280').fontSize(10).text(`Rango: ${rangeStart || 'N/D'} a ${rangeEnd || 'N/D'}`);
  doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`);
  doc.moveDown(1);

  const totalDistance = history.reduce((s, r) => s + (r.distance_km || 0), 0);
  const totalDuration = history.reduce((s, r) => s + (r.duration_min || 0), 0);
  const totalFuel = history.reduce((s, r) => s + (r.fuel_gal || 0), 0);

  doc.fillColor('#111827').fontSize(12).text('Resumen de flota', { underline: true });
  doc.fontSize(10).fillColor('#374151');
  doc.text(`Camiones activos: ${trucks.filter(t => t.status !== 'entregado').length} de ${trucks.length}`);
  doc.text(`Distancia total registrada: ${totalDistance.toFixed(0)} km`);
  doc.text(`Tiempo total en ruta: ${(totalDuration / 60).toFixed(1)} h`);
  doc.text(`Combustible consumido: ${totalFuel.toFixed(1)} gal`);
  doc.moveDown(1);

  doc.fontSize(12).fillColor('#111827').text('Estado actual de la flota', { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#374151');
  trucks.forEach(t => {
    doc.text(`${t.code}  |  Estado: ${t.status}  |  Destino: ${t.destination || '—'}  |  Combustible: ${Math.round(t.fuel_pct)}%`);
  });

  if (history.length) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#111827').text('Historial de recorridos', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#374151');
    history.slice(0, 25).forEach(h => {
      doc.text(`${h.date}  ${h.truck_code}  ${h.origin} -> ${h.destination}  ${h.distance_km} km  ${h.duration_min} min  ${h.fuel_gal} gal`);
    });
  }

  doc.moveDown(2);
  doc.fontSize(8).fillColor('#9CA3AF').text('© 2026 CalGuy Track Logistics. Todos los derechos reservados.', { align: 'center' });

  doc.end();
});

module.exports = router;
