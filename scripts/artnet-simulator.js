const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dgram = require('node:dgram');
const { WebSocketServer } = require('ws');
const {
  mapDMXToState,
  formatHexColor,
  parseArtDmxPacket,
  parseSacnPacket,
  chooseWinningSource,
  createArtDmxPacket,
  createSacnPacket,
} = require('./lighting');

const APP_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(APP_ROOT, 'public');
const CONFIG_PATH = path.join(APP_ROOT, 'config.json');
const EXAMPLE_CONFIG_PATH = path.join(APP_ROOT, 'config.example.json');

function resolveConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    const raw = fs.readFileSync(EXAMPLE_CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  }
}

const config = resolveConfig();
const serverPort = Number(process.env.PORT || config.port || 3000);
const defaultPin = process.env.ADMIN_PIN || config.adminPin || '8585';
const adminSessions = new Map();
const audienceSockets = new Set();

const state = {
  protocol: 'Art-Net',
  universe: Number(config.artnet?.universe || config.sacn?.universe || 1),
  sourcePriority: Number(config.sacn?.priority || config.artnet?.priority || 100),
  brightness: 180,
  brightnessPercent: 71,
  color: '#f59e0b',
  effect: 'Solid',
  effectCode: 1,
  announcement: config.announcement || 'Welcome to Neighbourhood Glow.',
  videoCue: 0,
  videos: Array.isArray(config.videos) ? config.videos : [],
  lastError: null,
  connectedAudience: 0,
  connected: true,
  lastUpdated: Date.now(),
};

const recentSources = {
  artnet: [],
  sacn: [],
};

function parseCookies(header = '') {
  return header.split(';').reduce((result, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) {
      result[key] = decodeURIComponent(value || '');
    }
    return result;
  }, {});
}

function requireAdmin(req, res, next) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionId = cookies.ng_session;
  if (!sessionId || !adminSessions.has(sessionId)) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  return next();
}

function applyStateFromChannels(channels = []) {
  const mapped = mapDMXToState(channels);
  state.protocol = mapped.protocol || state.protocol;
  state.brightness = mapped.brightness;
  state.brightnessPercent = mapped.brightnessPercent;
  state.color = mapped.color || state.color;
  state.effect = mapped.effect || state.effect;
  state.effectCode = mapped.effectCode ?? state.effectCode;
  state.videoCue = mapped.videoCue ?? state.videoCue;
  state.lastUpdated = Date.now();
  return mapped;
}

function applyWinner(source) {
  if (!source || !source.channels) {
    return;
  }

  const mapped = mapDMXToState(source.channels);
  state.protocol = source.protocol || 'Art-Net';
  state.universe = Number(source.universe || state.universe || 1);
  state.sourcePriority = Number(source.priority ?? state.sourcePriority ?? 100);
  state.brightness = mapped.brightness;
  state.brightnessPercent = mapped.brightnessPercent;
  state.color = formatHexColor(mapped.red, mapped.green, mapped.blue) || state.color;
  state.effect = mapped.effect || 'Solid';
  state.effectCode = mapped.effectCode ?? 1;
  state.videoCue = mapped.videoCue ?? 0;
  state.lastUpdated = Date.now();
  state.connected = true;
  state.lastError = null;
  broadcastState();
}

function broadcastState() {
  const payload = JSON.stringify({
    type: 'state',
    state: {
      ...state,
      connectedAudience: audienceSockets.size,
      videos: state.videos,
    },
  });

  for (const socket of audienceSockets) {
    if (socket.readyState === 1) {
      socket.send(payload);
    }
  }
}

function setLastError(message) {
  state.lastError = message;
  broadcastState();
}

function updateFromPayload(payload = {}) {
  const channels = Array.isArray(payload.channels) ? payload.channels : [0, 0, 0, 0, 0, 0];
  const nextState = mapDMXToState(channels);

  state.protocol = payload.protocol || state.protocol;
  state.universe = Number(payload.universe ?? state.universe ?? 1);
  state.sourcePriority = Number(payload.priority ?? state.sourcePriority ?? 100);
  state.brightness = Number(payload.brightness ?? nextState.brightness ?? 180);
  state.brightnessPercent = Math.round((state.brightness / 255) * 100);
  state.color = payload.color || formatHexColor(nextState.red, nextState.green, nextState.blue);
  state.effect = payload.effectLabel || nextState.effect || 'Solid';
  state.effectCode = Number(payload.effect ?? nextState.effectCode ?? 1);
  state.videoCue = Number(payload.videoCue ?? nextState.videoCue ?? 0);
  state.announcement = payload.announcement || state.announcement;
  state.connected = true;
  state.lastUpdated = Date.now();
  state.lastError = null;
  broadcastState();
}

function handleSourceData(protocol, data) {
  const { channels } = data;
  if (!Array.isArray(channels) || channels.length === 0) {
    return;
  }

  const sourceList = recentSources[protocol] || [];
  const sourceId = `${protocol}:${data.source || 'default'}`;

  const existingIndex = sourceList.findIndex((entry) => entry.sourceId === sourceId);
  if (existingIndex >= 0) {
    sourceList.splice(existingIndex, 1);
  }

  sourceList.push({ ...data, sourceId, ok: true, channels: channels.slice(0, 6) });
  while (sourceList.length > 32) {
    sourceList.shift();
  }

  const winner = chooseWinningSource(sourceList);
  if (winner) {
    applyWinner(winner);
  }
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  req.cookies = parseCookies(req.headers.cookie || '');
  next();
});
app.use(express.static(PUBLIC_DIR));

app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    state: {
      ...state,
      connectedAudience: audienceSockets.size,
      videos: state.videos,
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    protocol: state.protocol,
    connectedAudience: audienceSockets.size,
    state,
  });
});

app.post('/api/lighting', (req, res) => {
  const payload = req.body || {};
  updateFromPayload(payload);
  res.json({ ok: true, state });
});

app.post('/api/admin/login', (req, res) => {
  const pin = String(req.body?.pin || '');
  if (pin !== defaultPin) {
    return res.status(401).json({ success: false, error: 'Invalid administrator PIN.' });
  }

  const sessionId = crypto.randomBytes(18).toString('hex');
  adminSessions.set(sessionId, { createdAt: Date.now() });
  res.cookie('ng_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 4 * 1000,
  });

  return res.json({ success: true, message: 'Authenticated.' });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionId = cookies.ng_session;
  if (sessionId) {
    adminSessions.delete(sessionId);
  }
  res.clearCookie('ng_session');
  return res.json({ success: true });
});

app.get('/api/admin/status', requireAdmin, (req, res) => {
  res.json({
    ok: true,
    state: {
      ...state,
      connectedAudience: audienceSockets.size,
      videos: state.videos,
    },
  });
});

app.post('/api/admin/lighting', requireAdmin, (req, res) => {
  const payload = req.body || {};
  if (payload.blackout) {
    updateFromPayload({ brightness: 0, channels: [0, 0, 0, 0, 0, 0], effect: 0, effectLabel: 'Off', videoCue: 0, announcement: state.announcement });
    return res.json({ ok: true, state });
  }

  updateFromPayload(payload);
  return res.json({ ok: true, state });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

function createHttpServer() {
  const httpServer = app.listen(serverPort, () => {
    console.log(`Neighbourhood Glow listening on http://localhost:${serverPort}`);
  });

  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (socket) => {
    audienceSockets.add(socket);
    socket.send(JSON.stringify({ type: 'state', state: { ...state, connectedAudience: audienceSockets.size, videos: state.videos } }));

    socket.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed && parsed.type === 'hello') {
          socket.send(JSON.stringify({ type: 'hello', ok: true }));
          return;
        }

        if (parsed && parsed.type === 'auth') {
          const valid = String(parsed.pin || '') === defaultPin;
          socket.send(JSON.stringify({ type: 'auth', success: valid }));
          return;
        }

        if (parsed && parsed.type === 'lighting') {
          updateFromPayload(parsed.payload || parsed);
        }
      } catch (error) {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid message payload.' }));
      }
    });

    socket.on('close', () => {
      audienceSockets.delete(socket);
      broadcastState();
    });
  });

  return httpServer;
}

const artnetSocket = dgram.createSocket('udp4');
const sacnSocket = dgram.createSocket('udp4');

artnetSocket.on('error', (error) => {
  console.error('Art-Net socket error:', error.message || error);
  setLastError(`Art-Net socket error: ${error.message || 'Unknown error'}`);
});

sacnSocket.on('error', (error) => {
  console.error('sACN socket error:', error.message || error);
  setLastError(`sACN socket error: ${error.message || 'Unknown error'}`);
});

artnetSocket.on('message', (message, rinfo) => {
  const parsed = parseArtDmxPacket(message, { source: rinfo.address, priority: config.artnet.priority || 50 });
  if (!parsed.ok) {
    state.lastError = `Art-Net rejected: ${parsed.reason}`;
    broadcastState();
    return;
  }

  handleSourceData('artnet', parsed);
});

sacnSocket.on('message', (message, rinfo) => {
  const parsed = parseSacnPacket(message, { source: rinfo.address, sourceName: config.sacn.sourceName || 'Source', priority: config.sacn.priority || 100 });
  if (!parsed.ok) {
    state.lastError = `sACN rejected: ${parsed.reason}`;
    broadcastState();
    return;
  }

  handleSourceData('sacn', parsed);
});

if (config.artnet?.enabled !== false) {
  artnetSocket.bind(config.artnet?.listenPort || 6454, config.artnet?.receiveHost || '0.0.0.0', () => {
    console.log(`Art-Net receiver listening on UDP ${config.artnet?.listenPort || 6454}`);
  });
}

if (config.sacn?.enabled !== false) {
  sacnSocket.bind(config.sacn?.listenPort || 5568, config.sacn?.receiveHost || '0.0.0.0', () => {
    console.log(`sACN receiver listening on UDP ${config.sacn?.listenPort || 5568}`);
  });
}

if (require.main === module) {
  createHttpServer();
}

module.exports = {
  app,
  config,
  state,
  createHttpServer,
  defaultPin,
  resolveConfig,
  parseArtDmxPacket,
  parseSacnPacket,
  createArtDmxPacket,
  createSacnPacket,
  artnetSocket,
  sacnSocket,
};
