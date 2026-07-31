const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { PLANS, getPlan } = require('../plans');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.user.companyId);
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.userId);
  const activeTrucks = db.prepare("SELECT COUNT(*) c FROM trucks WHERE company_id = ?").get(req.user.companyId).c;
  const maxVehicles = company.plan_max_vehicles || 20;
  const usagePct = maxVehicles ? Math.min(100, Math.round((activeTrucks / maxVehicles) * 100)) : 0;

  res.json({
    company: {
      id: company.id, name: company.name, city: company.city,
      planKey: company.plan_key || 'profesional',
      planName: company.plan_name, planRenewsAt: company.plan_renews_at,
      planUsagePct: usagePct, planMaxVehicles: maxVehicles, activeVehicles: activeTrucks,
    },
    user,
  });
});

router.patch('/company', (req, res) => {
  const { name, city } = req.body || {};
  const fields = [];
  const values = [];
  if (name) { fields.push('name = ?'); values.push(name); }
  if (city) { fields.push('city = ?'); values.push(city); }
  if (fields.length) {
    values.push(req.user.companyId);
    db.prepare(`UPDATE companies SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.user.companyId);
  res.json({ id: company.id, name: company.name, city: company.city });
});

router.get('/plans', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.user.companyId);
  res.json({ plans: PLANS, currentPlanKey: company.plan_key || 'profesional' });
});

router.post('/plan', (req, res) => {
  const { planKey } = req.body || {};
  const plan = getPlan(planKey);
  if (!plan) return res.status(400).json({ error: 'Plan no válido.' });

  const activeTrucks = db.prepare('SELECT COUNT(*) c FROM trucks WHERE company_id = ?').get(req.user.companyId).c;
  if (activeTrucks > plan.maxVehicles) {
    return res.status(400).json({
      error: `Este plan admite hasta ${plan.maxVehicles} camiones y actualmente tienes ${activeTrucks}. Elimina algunos camiones o elige un plan superior.`,
    });
  }

  db.prepare('UPDATE companies SET plan_key = ?, plan_name = ?, plan_max_vehicles = ? WHERE id = ?')
    .run(plan.key, plan.name, plan.maxVehicles, req.user.companyId);

  res.json({ ok: true, planKey: plan.key, planName: plan.name });
});

module.exports = router;
