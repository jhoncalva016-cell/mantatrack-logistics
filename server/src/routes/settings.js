const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.user.companyId);
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.userId);
  res.json({
    company: {
      id: company.id, name: company.name, city: company.city,
      planName: company.plan_name, planRenewsAt: company.plan_renews_at, planUsagePct: company.plan_usage_pct,
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

module.exports = router;
