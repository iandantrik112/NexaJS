/**
 * Express + static SPA — pola sama electronv2 (CommonJS + require dari main).
 * Dipakai: Electron main (app.asar) dan `npm run server` / `node index.js`.
 */
'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const config = require('./config.js');
const { buildContentSecurityPolicy } = require('./electron/csp.js');

const app = express();

function buildServerConfig() {
  try {
    const baseUrl = config.baseUrl || config.url;
    if (baseUrl) {
      const u = new URL(baseUrl);
      const port = u.port || (u.protocol === 'https:' ? 443 : 80);
      const hostname = u.hostname;
      const host = hostname === 'localhost' || hostname === '127.0.0.1' ? '127.0.0.1' : '0.0.0.0';
      const electronInitialPath =
        typeof config.electronInitialPath === 'string' ? config.electronInitialPath.trim() : '/beranda';
      return {
        host,
        port: parseInt(port, 10),
        hostname,
        baseUrl,
        electronInitialPath,
      };
    }
  } catch (error) {
    console.warn('⚠️ Could not read config.js, using default localhost:3000');
  }
  return {
    host: '127.0.0.1',
    port: 3000,
    hostname: 'localhost',
    baseUrl: 'http://localhost:3000',
    electronInitialPath:
      typeof config.electronInitialPath === 'string' ? config.electronInitialPath.trim() : '/beranda',
  };
}

let SERVER_CONFIG = {
  host: 'localhost',
  port: 3000,
  hostname: 'localhost',
  baseUrl: 'http://localhost:3000',
  electronInitialPath: '/beranda',
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const devNoCacheAssets =
  process.env.NODE_ENV !== 'production' && process.env.NEXA_DEV_NO_CACHE !== '0';
app.use((req, res, next) => {
  if (!devNoCacheAssets) {
    return next();
  }
  const p = req.path;
  if (
    p.startsWith('/templates/') ||
    p.startsWith('/assets/') ||
    p.startsWith('/nexa-context/') ||
    p === '/App.js' ||
    p === '/sw.js'
  ) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

const staticOpts = devNoCacheAssets
  ? { index: false, etag: false, lastModified: false, maxAge: 0 }
  : { index: false };

const SENSITIVE_PUBLIC_NAMES = new Set([
  'index.js',
  'server.js',
  'node.js',
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
  if (first === 'electron') {
    return res.status(404).end();
  }
  next();
});

/** Path ke electron/components di dalam app.asar (produksi) atau proyek (dev). */
function resolveElectronComponentsDir() {
  return path.join(__dirname, 'electron', 'components');
}

app.use('/nexa-context', express.static(resolveElectronComponentsDir(), staticOpts));

function escapeHtmlAttrValue(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

async function sendSpaHtml(res) {
  const htmlPath = path.join(__dirname, 'index.html');
  let html = await fs.readFile(htmlPath, 'utf8');
  const payload = JSON.stringify(config);
  const csp = buildContentSecurityPolicy(config);
  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${escapeHtmlAttrValue(csp)}">`;
  const endpointScript = `<script>window.__NEXA_ENDPOINT__=${payload}</script>`;
  const injectHead = `${cspMeta}\n${endpointScript}`;
  if (!html.includes('<head>')) {
    res.type('html').send(html);
    return;
  }
  html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${injectHead}\n`);
  res.type('html').send(html);
}

app.get(['/', '/index.html'], async (req, res, next) => {
  try {
    await sendSpaHtml(res);
  } catch (err) {
    next(err);
  }
});

app.use(express.static(path.join(__dirname), staticOpts));

app.use('/assets', express.static(path.join(__dirname, 'assets'), staticOpts));

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

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  sendSpaHtml(res).catch(next);
});

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

function getServerConfig() {
  return SERVER_CONFIG;
}

if (require.main === module) {
  startServer().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = { app, startServer, getServerConfig };
