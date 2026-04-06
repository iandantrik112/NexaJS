'use strict';
/**
 * Entry Electron di akar proyek — memuat proses utama dari folder electron/ (dev)
 * atau resources/electron/ (installer). Isi aplikasi di app.asar (Express di index.js lewat require).
 */
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

/**
 * Mode unpackaged: pakai userData di dalam repo (bukan %APPDATA% default).
 * Tanpa ini, dua instance Electron dengan appId sama (Nexa + npm run dev) bentrok:
 * cache/quota DB terkunci → error "Unable to move the cache" dan tampilan tidak ikut reload.
 */
if (!app.isPackaged) {
  const devUserData = path.join(__dirname, '.electron-userdata-dev');
  try {
    fs.mkdirSync(devUserData, { recursive: true });
  } catch (_) {
    /* abaikan */
  }
  app.setPath('userData', devUserData);
}

const electronDir = app.isPackaged
  ? path.join(process.resourcesPath, 'electron')
  : path.join(__dirname, 'electron');
const extMain = path.join(electronDir, 'main.js');

if (!fs.existsSync(extMain)) {
  app.whenReady().then(() => {
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'EletronNexa',
      'Berkas utama tidak ditemukan:\n' + extMain
    );
    app.quit();
  });
} else {
  require(extMain);
}
