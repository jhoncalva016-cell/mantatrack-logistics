const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas.' });

  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(user.company_id);
  const token = jwt.sign(
    { userId: user.id, companyId: user.company_id, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    company: { id: company.id, name: company.name, city: company.city },
  });
});

router.post('/register', (req, res) => {
  const { companyName, name, email, password } = req.body || {};
  if (!companyName || !name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });

  const companyId = db.prepare('INSERT INTO companies (name, city) VALUES (?, ?)')
    .run(companyName, 'Quito, Pichincha').lastInsertRowid;

  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = db.prepare(`INSERT INTO users (company_id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, 'admin')`).run(companyId, name, email.toLowerCase().trim(), passwordHash).lastInsertRowid;

  const token = jwt.sign({ userId, companyId, name, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.status(201).json({
    token,
    user: { id: userId, name, email, role: 'admin' },
    company: { id: companyId, name: companyName, city: 'Quito, Pichincha' },
  });
});

module.exports = router;
