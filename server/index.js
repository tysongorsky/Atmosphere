const express = require('express');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');

const { buildChannelPayload, parseMessage } = require('./protocol');
const { ArtNetController } = require('./artnet');
const { sACNController } = require('./sacn');

const app = express();
const port = process.env.PORT || 3000;
const configPath = path.join(__dirname, '..', 'config.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    const fallback = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.example.json'), 'utf8'));
    return fallback;
  }
}

const config = loadConfig();
const artnet = new ArtNetController(config.artnet || {});
const sacn = new sACNController(config.sacn || {});
const connectedClients = new Set();

app.use(express.json());
app.use('/icons', express.static(path.join(__dirname, '..', 'public', 'icons')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'Neighbourhood Glow',
    uptime: process.uptime(),
    artnet: artnet.status(),
    sacn: sacn.status(),
  });
});

app.get('/api/config', (req, res) => {
  res.json(config);
});

app.post('/api/config', (req, res) => {
  const nextConfig = { ...config, ...req.body };
  config.artnet = { ...config.artnet, ...(req.body.artnet || {}) };
  config.sacn = { ...config.sacn, ...(req.body.sacn || {}) };
  config.lighting = { ...config.lighting, ...(req.body.lighting || {}) };
  res.json({ ok: true, config: nextConfig });
});

app.get('/api/scene/:sceneName', (req, res) => {
  const sceneName = req.params.sceneName;
  const payload = buildChannelPayload({ scene: sceneName, channels: [255, 255, 255, 255] });
  res.json({ ok: true, scene: sceneName, payload });
});

app.post('/api/lighting', (req, res) => {
  const input = req.body || {};
  const payload = buildChannelPayload(input);

  if (artnet.isEnabled()) {
    artnet.sendFrame(payload.channels);
  }

  if (sacn.isEnabled()) {
    sacn.sendFrame(payload.channels);
  }

  broadcast({ type: 'lighting', payload });

  res.json({ ok: true, payload });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/audience', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'audience.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

const server = app.listen(port, () => {
  console.log(`Neighbourhood Glow running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  connectedClients.add(socket);

  socket.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      const normalized = parseMessage(parsed);
      socket.send(JSON.stringify({ type: 'ack', payload: normalized }));
    } catch (error) {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid payload' }));
    }
  });

  socket.on('close', () => {
    connectedClients.delete(socket);
  });
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const client of connectedClients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

module.exports = { app, server, config, broadcast };
