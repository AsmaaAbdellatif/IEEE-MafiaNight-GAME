/**
 * index.js – Code Wars server entry point.
 *
 * Sets up Express + Socket.io, serves the built React frontend,
 * and supports public tunneling so friends can join via a link.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const registerHandlers = require('./sockets/handlers');
const roomManager = require('./game/RoomManager');
const adminDashboard = require('./admin/dashboard');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// ── Serve the built React frontend ──
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'IEEE Code Wars' });
});

// ── Admin password protection ──
const ADMIN_PASSWORD = 'ieee2026';

function adminAuth(req, res, next) {
  // Check query param ?password= or Authorization header
  const pw = req.query.password || req.headers['x-admin-password'];
  if (pw === ADMIN_PASSWORD) return next();

  // Check if password was submitted via form POST
  if (req.body?.password === ADMIN_PASSWORD) return next();

  // Show login form for HTML requests
  if (req.accepts('html')) {
    return res.status(401).send(`<!DOCTYPE html>
<html><head><title>Admin Login</title>
<style>
  body { font-family: 'Courier New', monospace; background: #0a0e17; color: #c0c0c0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
  .login { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 40px; max-width: 360px; width: 100%; text-align: center; }
  h1 { color: #00ff88; font-size: 1.2rem; margin-bottom: 8px; text-shadow: 0 0 10px rgba(0,255,136,0.3); }
  p { color: #666; font-size: 0.8rem; margin-bottom: 24px; }
  input { width: 100%; padding: 10px 14px; background: #0a0e17; border: 1px solid #1e293b; border-radius: 6px; color: #fff; font-family: inherit; font-size: 1rem; margin-bottom: 16px; text-align: center; letter-spacing: 3px; }
  input:focus { outline: none; border-color: #00ff8866; box-shadow: 0 0 10px rgba(0,255,136,0.15); }
  button { width: 100%; padding: 10px; background: #00ff8822; color: #00ff88; border: 1px solid #00ff8844; border-radius: 6px; font-family: inherit; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
  button:hover { background: #00ff8833; }
  .err { color: #f87171; font-size: 0.8rem; margin-bottom: 12px; }
</style></head><body>
<div class="login">
  <h1>⚔️ Admin Dashboard</h1>
  <p>Enter the admin password to continue</p>
  <form method="GET" action="${req.path}">
    <input type="password" name="password" placeholder="••••••••" autofocus required />
    <button type="submit">Access Dashboard</button>
  </form>
</div></body></html>`);
  }

  // JSON requests get a 401
  res.status(401).json({ error: 'Unauthorized. Provide ?password= query param.' });
}

// Admin dashboard — JSON API
app.get('/api/admin/rooms', adminAuth, (_req, res) => {
  res.json(adminDashboard.getRoomsData(roomManager));
});

// Admin dashboard — HTML page
app.get('/admin', adminAuth, (_req, res) => {
  res.send(adminDashboard.renderPage(roomManager));
});

// SPA fallback – serve index.html for any non-API, non-admin route
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',          // allow all origins (tunnel URLs, local, etc.)
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);
  registerHandlers(io, socket);
});

// Admin action — force-skip current phase
app.post('/api/admin/skip/:code', adminAuth, (req, res) => {
  const room = roomManager.getRoom(req.params.code.toUpperCase());
  if (!room) return res.json({ ok: false, error: 'Room not found' });
  const skipable = ['night', 'sunrise', 'day_discussion', 'day_voting', 'day_defense'];
  if (!skipable.includes(room.phase)) return res.json({ ok: false, error: `Cannot skip phase: ${room.phase}` });
  const broadcast   = (event, data) => io.to(room.id).emit(event, data);
  const sendToPlayer = (pid, event, data) => io.to(pid).emit(event, data);
  room.skipPhase(broadcast, sendToPlayer);
  res.json({ ok: true, newPhase: room.phase });
});

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n⚔️  IEEE Code Wars server running on http://localhost:${PORT}`);
  console.log(`   Local network: http://${getLocalIP()}:${PORT}\n`);

  // ── Auto-start Cloudflare Tunnel (free, no password gate) ──
  try {
    const { exec } = require('child_process');
    const tunnel = exec(`cloudflared tunnel --url http://localhost:${PORT} 2>&1`);
    tunnel.stderr.on('data', (data) => {
      const match = data.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        console.log(`🌐 PUBLIC URL (share with friends!): ${match[0]}\n`);
      }
    });
    tunnel.on('error', () => {
      console.log('💡 Install cloudflared for a public link: brew install cloudflared\n');
    });
  } catch (_) {
    console.log('💡 Install cloudflared for a public link: brew install cloudflared\n');
  }
});

/** Get the machine's local network IP */
function getLocalIP() {
  const { networkInterfaces } = require('os');
  for (const nets of Object.values(networkInterfaces())) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}
