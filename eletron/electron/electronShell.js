/**
 * Shell desktop Electron (CommonJS — sama ide electronv2/main.js + require lokal).
 */
'use strict';

const mainWindowLayout = {
  width: 1280,
  height: 800,
  minWidth: 400,
  minHeight: 300,
  /** false = ukuran tetap; tidak bisa tarik tepi jendela (beda dari maximizable). */
  resizable: true,
  maximizable: true,
  /** true = menu klik kanan kustom (buildContextMenuTemplate). false = dinonaktifkan sepenuhnya. */
  ContextMenu: true,
};

function buildContextMenuTemplate(ctx) {
  const { getMainWindow, isDev, clearCacheAndNotify, showAboutDialog, contextMenuParams } = ctx;

  function zoom(delta) {
    const w = getMainWindow();
    if (!w || w.isDestroyed()) return;
    const z = w.webContents.getZoomLevel();
    w.webContents.setZoomLevel(z + delta);
  }

  const devItems = isDev
    ? [
        { role: 'toggleDevTools', label: 'Developer Tools' },
        {
          label: 'Inspect Element',
          click: (_menuItem, browserWindow) => {
            const w = browserWindow || getMainWindow();
            const wc = w?.webContents;
            if (!wc || wc.isDestroyed()) return;
            try {
              if (!wc.isDevToolsOpened()) wc.openDevTools();
              const p = contextMenuParams;
              if (p && typeof p.x === 'number' && typeof p.y === 'number') {
                wc.inspectElement(p.x, p.y);
              }
            } catch {
              /* ignore */
            }
          },
        },
      ]
    : [];

  return [
    { role: 'reload', label: 'Refresh' },
    ...devItems,
    { type: 'separator' },
    {
      label: 'Bersihkan Cache',
      click: () => clearCacheAndNotify(),
    },
    { role: 'togglefullscreen', label: 'Layar Penuh' },
    { type: 'separator' },
    {
      label: 'halaman',
      accelerator: '',
      click: (_menuItem, browserWindow) => {
        const w = browserWindow || getMainWindow();
        if (!w?.webContents || w.webContents.isDestroyed()) return;
        const itemInfo = {
          label: 'halaman',
          role: 'nexaTerminal',
          accelerator: '',
          timestamp: new Date().toISOString(),
          url: w.webContents.getURL() || 'unknown',
        };
        try {
          w.webContents.send('context-menu-clicked', itemInfo);
        } catch {
          /* ignore */
        }
      },
    },
    {
      label: 'Setting',
      submenu: [
        {
          label: 'Ukuran Normal',
          click: () => {
            const w = getMainWindow();
            if (w && !w.isDestroyed()) w.webContents.setZoomLevel(0);
          },
        },
        { label: 'Perbesar', click: () => zoom(0.5) },
        { label: 'Perkecil', click: () => zoom(-0.5) },
      ],
    },
    {
      label: 'Jendela',
      submenu: [
        { role: 'minimize', label: 'Minimalkan' },
        { role: 'close', label: 'Tutup' },
      ],
    },
    {
      label: 'Bantuan',
      submenu: [{ label: 'Tentang', click: () => showAboutDialog() }],
    },
  ];
}

module.exports = { mainWindowLayout, buildContextMenuTemplate };
