require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const truckRoutes = require('./routes/trucks');
const historyRoutes = require('./routes/history');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const trackingRoutes = require('./routes/tracking');
const driverRoutes = require('./routes/drivers');
const maintenanceRoutes = require('./routes/maintenance');
const settingsRoutes = require('./routes/settings');
const { startSimulation } = require('./simulate');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'mantatrack-server' }));

app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/settings', settingsRoutes);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`MantaTrack API escuchando en http://localhost:${PORT}`);
  startSimulation(io, 4000);
});
