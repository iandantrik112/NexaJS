import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import config from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create Express app
const app = express();

// Baca URL server dari config.js (sama objek dengan yang di-import App.js di browser)
function buildServerConfig() {
  const envPortRaw = process.env.PORT;
  if (envPortRaw != null && String(envPortRaw).trim() !== '') {
    const p = parseInt(String(envPortRaw).trim(), 10);
    if (Number.isFinite(p) && p >= 1 && p <= 65535) {
      // Bind ke 127.0.0.1 (bukan "localhost") agar konsisten di Windows: "localhost" sering ::1-only,
      // sementara Nexa/Electron mengecek kesiapan port lewat IPv4 127.0.0.1.
      return {
        host: '127.0.0.1',
        port: p,
        hostname: 'localhost',
        baseUrl: `http://127.0.0.1:${p}`,
      };
    }
  }
  try {
    const baseUrl = config.baseUrl || config.url;
    if (baseUrl) {
      const u = new URL(baseUrl);
      const port = u.port || (u.protocol === 'https:' ? 443 : 80);
      const hostname = u.hostname;
      const host = (hostname === 'localhost' || hostname === '127.0.0.1') ? 'localhost' : '0.0.0.0';
      return {
        host,
        port: parseInt(port, 10),
        hostname,
        baseUrl,
      };
    }
  } catch (error) {
    console.warn('⚠️ Could not read config.js, using default localhost:3000');
  }
  return {
    host: 'localhost',
    port: 3000,
    hostname: 'localhost',
    baseUrl: 'http://localhost:3000',
  };
}

// Server config will be set when startServer is called
let SERVER_CONFIG = {
  host: 'localhost',
  port: 3000,
  hostname: 'localhost',
  baseUrl: 'http://localhost:3000',
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Keamanan (setara ide .htaccess: bedakan file klien vs server) ---
// App.js / assets dilayani publik; config disuntik lewat HTML (bukan URL /config.js).
// server.js, config.js mentah, package.json, .env, node_modules tidak dilayani publik.
const SENSITIVE_PUBLIC_NAMES = new Set([
  'server.js',
  'index.js',
  'config.js',
  'package.json',
  'package-lock.json',
  '.env',
  '.env.local',
  '.env.production',
]);

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  const seg = req.path.replace(/^\/+/, '').split('/').filter(Boolean);
  const first = (seg[0] || '').toLowerCase();
  if (first === 'node_modules' || seg.some((s) => s.toLowerCase() === 'node_modules')) {
    return res.status(404).end();
  }
  if (SENSITIVE_PUBLIC_NAMES.has(first)) {
    return res.status(404).end();
  }
  next();
});

/**
 * Objek untuk browser: samakan url/urlApi/drive dengan server yang sedang listen
 * (mis. PORT dari Nexa/Electron), bukan hanya isi statis config.js.
 */
function buildClientEndpointPayload() {
  const raw = JSON.parse(JSON.stringify(config));
  const baseUrl = SERVER_CONFIG.baseUrl || raw.url || 'http://127.0.0.1:3000';
  let origin;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    origin = 'http://127.0.0.1:3000';
  }
  raw.url = baseUrl;
  for (const key of ['urlApi', 'drive']) {
    const v = raw[key];
    if (typeof v !== 'string' || !v.startsWith('http')) continue;
    try {
      const u = new URL(v);
      raw[key] = origin + u.pathname + u.search + u.hash;
    } catch {
      /* biarkan */
    }
  }
  return raw;
}

/** HTML SPA: suntik endpoint ke window.__NEXA_ENDPOINT__ agar tidak ada GET /config.js */
async function sendSpaHtml(res) {
  const htmlPath = path.join(__dirname, 'index.html');
  let html = await fs.readFile(htmlPath, 'utf8');
  const payload = JSON.stringify(buildClientEndpointPayload());
  const inject = `<script>window.__NEXA_ENDPOINT__=${payload}</script>`;
  if (!html.includes('</head>')) {
    res.type('html').send(html);
    return;
  }
  html = html.replace('</head>', `${inject}</head>`);
  res.type('html').send(html);
}

app.get(['/', '/index.html'], async (req, res, next) => {
  try {
    await sendSpaHtml(res);
  } catch (err) {
    next(err);
  }
});

// Serve static files dari root directory (index otomatis mati — / pakai sendSpaHtml)
app.use(express.static(path.join(__dirname), { index: false }));

// Serve assets folder dengan path yang benar
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Express server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    serverPort: SERVER_CONFIG.port,
    serverHost: SERVER_CONFIG.hostname,
    baseUrl: SERVER_CONFIG.baseUrl,
  });
});

app.post('/api/message', (req, res) => {
  const { message } = req.body;
  console.log('📨 Received message:', message);
  res.json({
    success: true,
    echo: message,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  res.json({
    success: true,
    user: {
      id: Date.now(),
      name,
      email,
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// SPA fallback
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  sendSpaHtml(res).catch(next);
});

// Port dan baseUrl dari config.js — tidak pindah port otomatis
async function startServer() {
  SERVER_CONFIG = buildServerConfig();

  return new Promise((resolve, reject) => {
    const server = app.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
      console.log(`✅ Express server running on ${SERVER_CONFIG.baseUrl}`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `❌ Port ${SERVER_CONFIG.port} sudah dipakai — tidak mengubah port (harus sama dengan url/baseUrl di config.js: ${SERVER_CONFIG.baseUrl}).`
        );
        console.error('   Tutup proses Node lain di port ini, atau ubah url di config.js.');
        reject(err);
        return;
      }
      reject(err);
    });
  });
}

const isMain =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  startServer().catch(() => {
    process.exitCode = 1;
  });
}

export function getServerConfig() {
  return SERVER_CONFIG;
}

export { app, startServer };
