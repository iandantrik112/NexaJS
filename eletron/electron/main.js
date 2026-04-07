/**
 * Entry CommonJS — pola electronv2: Express di index.js (akar proyek), dimuat dengan require() dari app.asar.
 */
const { app, BrowserWindow, dialog, nativeImage, Menu, session } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * APP_ROOT: folder proyek (dev: induk electron/). Terpaket: app.asar (package.json, index.js, node_modules, assets/…).
 * Folder electron/ (main.js, electronShell.js, …) di resources/electron lewat extraResources.
 */
const APP_ROOT = app.isPackaged ? app.getAppPath() : path.join(__dirname, '..');
const ELECTRON_SHELL_JS = path.join(__dirname, 'electronShell.js');

/**
 * Geolocation di Electron memakai webservice Google; tanpa kunci → 403 di DevTools.
 * Prioritas: variabel lingkungan GOOGLE_API_KEY, lalu baris di `.env` di root proyek.
 * @see https://www.electronjs.org/docs/latest/api/environment-variables#google_api_key
 */
function loadGoogleApiKeyForChromium() {
  if (process.env.GOOGLE_API_KEY && String(process.env.GOOGLE_API_KEY).trim()) {
    return;
  }
  try {
    const envPath = path.join(APP_ROOT, '.env');
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const m = t.match(/^GOOGLE_API_KEY\s*=\s*(.*)$/);
      if (!m) continue;
      let v = m[1].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (v) {
        process.env.GOOGLE_API_KEY = v;
        break;
      }
    }
  } catch {
    /* abaikan */
  }
}
loadGoogleApiKeyForChromium();

const allowMultipleInstances = process.env.ELECTRON_SINGLE_INSTANCE !== '1';

/**
 * Hanya panggil setelah `app.whenReady` — `session.defaultSession` tidak tersedia sebelum itu.
 * Geolocation di renderer membutuhkan izin sesi.
 */
function registerSessionPermissionHandlers() {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === 'geolocation') {
      callback(true);
    } else {
      callback(false);
    }
  });
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => permission === 'geolocation');
}

/** Diisi lewat require() di bootstrap — electronShell.js. */
let buildContextMenuTemplate;

/** Default jika `mainWindowLayout` tidak diekspor / tidak lengkap (sumber utama: electronShell.js). */
const DEFAULT_MAIN_WINDOW_LAYOUT = {
  width: 1280,
  height: 800,
  minWidth: 400,
  minHeight: 300,
  /** false = tidak pasang menu klik kanan kustom + cegah menu default Chromium */
  ContextMenu: true,
};

const MAIN_WINDOW_LAYOUT_KEYS = [
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'x',
  'y',
  'center',
  'title',
  'resizable',
  'minimizable',
  'maximizable',
  'closable',
  'fullscreenable',
  'alwaysOnTop',
];

/** Hasil normalisasi terakhir dari bootstrap (mode terpaket). */
let mainWindowLayoutResolved = { ...DEFAULT_MAIN_WINDOW_LAYOUT };

function normalizeMainWindowLayout(mod) {
  const base = { ...DEFAULT_MAIN_WINDOW_LAYOUT };
  const raw = mod?.mainWindowLayout;
  if (!raw || typeof raw !== 'object') return base;
  for (const k of MAIN_WINDOW_LAYOUT_KEYS) {
    if (raw[k] !== undefined) base[k] = raw[k];
  }
  if (raw.ContextMenu !== undefined) {
    base.ContextMenu = Boolean(raw.ContextMenu);
  }
  return base;
}

/**
 * Di development: invalidate require cache agar ubahan electronShell.js terpakai.
 */
function requireElectronShellFresh() {
  if (!app.isPackaged) {
    try {
      delete require.cache[require.resolve(ELECTRON_SHELL_JS)];
    } catch (_) {
      /* abaikan */
    }
  }
  return require(ELECTRON_SHELL_JS);
}

/**
 * Di development: baca ulang electronShell.js agar ubahan ukuran jendela terpakai saat jendela baru dibuat.
 */
async function getMainWindowLayout() {
  if (app.isPackaged) {
    return mainWindowLayoutResolved;
  }
  return normalizeMainWindowLayout(requireElectronShellFresh());
}

/**
 * Di development: require cache dibersihkan saat menu konteks dibuka agar edit shell langsung terasa.
 */
async function getContextMenuBuilder() {
  if (app.isPackaged) {
    return buildContextMenuTemplate;
  }
  return requireElectronShellFresh().buildContextMenuTemplate;
}

/**
 * Satu sumber dengan build.win.icon (package.json) — wajib untuk dev agar title bar & taskbar
 * tidak kembali ke ikon default Electron. Build installer tetap memakai path yang sama.
 */
function resolveWindowIcon() {
  try {
    const pkg = require(path.join(APP_ROOT, 'package.json'));
    const rel = pkg.build && pkg.build.win && pkg.build.win.icon;
    if (rel && typeof rel === 'string') {
      const abs = path.join(APP_ROOT, rel);
      if (fs.existsSync(abs)) {
        return abs;
      }
      console.warn('[Electron] build.win.icon tidak ada di disk — letakkan file di:', abs);
    }
  } catch (e) {
    console.warn('[Electron] Gagal baca package.json untuk icon:', e.message);
  }
  return undefined;
}

let mainWindow = null;

const isDev =
  !app.isPackaged ||
  process.env.NODE_ENV === 'development' ||
  process.env.ELECTRON_DEV === '1';

/**
 * Membersihkan cache HTTP + storage (setara electronv2/main.js).
 */
async function clearAllCache(options = {}) {
  const {
    clearCache = true,
    clearStorage = true,
    storages = [
      'appcache',
      'serviceworkers',
      'cachestorage',
      'filesystem',
      'indexdb',
      'localstorage',
      'shadercache',
      'websql',
    ],
  } = options;

  const results = {
    cache: { success: false, error: null },
    storage: { success: false, error: null, cleared: [] },
  };

  try {
    if (clearCache) {
      try {
        await session.defaultSession.clearCache();
        results.cache.success = true;
        console.log('✅ HTTP cache cleared');
      } catch (error) {
        results.cache.error = error.message;
        console.error('❌ Failed to clear HTTP cache:', error.message);
      }
    }

    if (clearStorage) {
      try {
        await session.defaultSession.clearStorageData({ storages });
        results.storage.success = true;
        results.storage.cleared = storages;
        console.log('✅ Storage data cleared:', storages.join(', '));
      } catch (error) {
        results.storage.error = error.message;
        console.error('❌ Failed to clear storage data:', error.message);
      }
    }

    try {
      await session.defaultSession.clearHostResolverCache();
    } catch (error) {
      console.warn('⚠️ Failed to clear host resolver cache:', error.message);
    }

    return {
      success: results.cache.success || results.storage.success,
      results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
    return {
      success: false,
      error: error.message,
      results,
      timestamp: new Date().toISOString(),
    };
  }
}

const CLEAR_CACHE_STORAGES = [
  'appcache',
  'serviceworkers',
  'cachestorage',
  'filesystem',
  'indexdb',
  'localstorage',
  'shadercache',
  'websql',
];

async function clearCacheAndNotify() {
  try {
    const result = await clearAllCache({
      clearCache: true,
      clearStorage: true,
      storages: CLEAR_CACHE_STORAGES,
    });
    if (result.success) {
      console.log('✅ Cache cleared successfully');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('cache-cleared', {
          success: true,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.error('❌ Failed to clear cache:', result.error);
    }
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
  }
}

function showAboutDialog() {
  let name = 'Eletron';
  let version = '';
  try {
    const pkg = require(path.join(APP_ROOT, 'package.json'));
    name = pkg.productName || pkg.name || name;
    version = pkg.version || '';
  } catch {
    // ignore
  }
  dialog.showMessageBox(mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined, {
    type: 'info',
    title: 'Tentang',
    message: name,
    detail: version ? `Versi ${version}` : undefined,
  });
}

/** Menu klik kanan: template di electronShell.js (mati jika mainWindowLayout.ContextMenu === false). */
function attachPageContextMenu(enabled) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.on('context-menu', async (event, _params) => {
    if (!enabled) {
      event.preventDefault();
      return;
    }
    try {
      const builder = await getContextMenuBuilder();
      const template = builder({
        getMainWindow: () => mainWindow,
        isDev,
        clearCacheAndNotify,
        showAboutDialog,
        contextMenuParams: _params,
      });
      Menu.buildFromTemplate(template).popup({ window: mainWindow });
    } catch (err) {
      console.error('[Electron] Gagal memuat electronShell.js:', err);
    }
  });
}

if (process.env.ELECTRON_DISABLE_GPU !== '0') {
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-sandbox');
  app.disableHardwareAcceleration();
}

// Chromium: matikan cache HTTP disk agar perubahan /templates & /assets langsung terbaca (set ELECTRON_DISABLE_HTTP_CACHE=0 untuk menonaktifkan ini)
if (process.env.ELECTRON_DISABLE_HTTP_CACHE !== '0') {
  app.commandLine.appendSwitch('disable-http-cache');
}

// Windows: ikon taskbar / grouping (selaras appId di electron-builder)
if (process.platform === 'win32') {
  app.setAppUserModelId('com.eletron.nexa');
}

function toLoadUrl(baseUrl) {
  try {
    const u = new URL(baseUrl);
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h === '::1') {
      u.hostname = '127.0.0.1';
    }
    return u.href;
  } catch {
    return baseUrl;
  }
}

function appendInitialPath(baseHref, pathSeg) {
  if (pathSeg == null || pathSeg === '') return baseHref;
  const seg = String(pathSeg).replace(/^\/+|\/+$/g, '');
  if (!seg) return baseHref;
  return String(baseHref).replace(/\/+$/, '') + '/' + seg;
}

async function createWindow(startServer, getServerConfig) {
  await startServer();
  const cfg = getServerConfig();
  let loadUrl = toLoadUrl(cfg.baseUrl);
  loadUrl = appendInitialPath(loadUrl, cfg.electronInitialPath);

  console.log('[Electron] Memuat', loadUrl);

  const iconPath = resolveWindowIcon();
  let windowIcon;
  if (iconPath) {
    try {
      const img = nativeImage.createFromPath(iconPath);
      windowIcon = img.isEmpty() ? iconPath : img;
    } catch (e) {
      console.warn('[Electron] Gagal memuat icon:', e?.message || e);
      windowIcon = iconPath;
    }
  }

  const layout = await getMainWindowLayout();
  const { ContextMenu: contextMenuEnabled = true, ...winLayout } = layout;

  mainWindow = new BrowserWindow({
    ...winLayout,
    show: false,
    ...(windowIcon ? { icon: windowIcon } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      /** window.open + print dari renderer (export PDF) lebih konsisten */
      nativeWindowOpen: true,
    },
  });

  Menu.setApplicationMenu(null);
  attachPageContextMenu(contextMenuEnabled);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (_event, code, desc, url) => {
    console.error('[Electron] did-fail-load', { code, desc, url });
    dialog.showErrorBox(
      'Gagal memuat halaman',
      `${desc}\n${url}\n\nPastikan port di config.js cocok dan tidak dipakai aplikasi lain.`
    );
  });

  try {
    const loadOpts =
      isDev && process.env.ELECTRON_DISABLE_HTTP_CACHE !== '0'
        ? { extraHeaders: 'pragma: no-cache\r\ncache-control: no-cache\r\n' }
        : {};
    await mainWindow.loadURL(loadUrl, loadOpts);
  } catch (err) {
    console.error('[Electron] loadURL', err);
    dialog.showErrorBox('Electron', String(err?.message || err));
    throw err;
  }

  if (process.env.ELECTRON_DEV === '1') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerSingleInstanceHandlers() {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    console.warn(
      '[Electron] Instance lain sudah berjalan — keluar. Set ELECTRON_SINGLE_INSTANCE=0 untuk multi-instance (lihat electron/main.js).'
    );
    app.quit();
    return false;
  }
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  return true;
}

function bootstrap() {
  const shellMod = require(ELECTRON_SHELL_JS);
  buildContextMenuTemplate = shellMod.buildContextMenuTemplate;
  mainWindowLayoutResolved = normalizeMainWindowLayout(shellMod);

  const { startServer, getServerConfig } = require(path.join(APP_ROOT, 'index.js'));

  const run = () => {
    app.whenReady().then(() => {
      registerSessionPermissionHandlers();
      createWindow(startServer, getServerConfig).catch((err) => {
        console.error(err);
        dialog.showErrorBox('Electron', String(err?.message || err));
        app.quit();
      });
    });
  };

  if (allowMultipleInstances) {
    run();
  } else if (registerSingleInstanceHandlers()) {
    run();
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(startServer, getServerConfig).catch(console.error);
    }
  });
}

try {
  bootstrap();
} catch (err) {
  console.error(err);
  const msg = String(err?.message || err);
  app
    .whenReady()
    .then(() => {
      try {
        dialog.showErrorBox('EletronNexa — gagal memulai', msg);
      } catch (_) {
        /* abaikan */
      }
      app.quit();
    })
    .catch(() => process.exit(1));
}
