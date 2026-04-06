# Nexa Eletron

Aplikasi desktop **Electron** yang menjalankan **Express** sebagai server lokal dan memuat antarmuka **Nexa** (SPA) di jendela Chromium. Cocok untuk pengembangan dan distribusi satu paket: backend ringan + frontend modul `assets/modules` + halaman di `templates/`.

## Arsitektur singkat

| Lapisan | Peran |
|--------|--------|
| **`electron/`** | Modul desktop: **`main.js`** (proses utama), **`preload.js`** (IPC ke renderer), **`csp.js`** (CSP untuk injeksi `server.js`). **`package.json` → `main`** menunjuk ke **`electron.js`** di akar proyek; berkas itu memuat **`electron/main.js`** dari **`electron/`** (dev) atau **`resources/electron/`** (build). |
| **server.js** | Server Express (ESM): static file, injeksi CSP + `window.__NEXA_ENDPOINT__` di awal `<head>`, API contoh, fallback SPA. |
| **`electron/electronShell.js`** | Shell desktop: opsi jendela utama + template menu klik kanan native (satu folder dengan `main.js`). |
| **App.js** | Entry SPA NexaRoute: routing, worker, service worker (opsional). |
| **templates/** | Halaman per rute Nexa. |
| **`electron/components/`** | Handler renderer untuk item menu konteks (ESM); disajikan sebagai **`/nexa-context/*`** lewat **`server.js`**. |

Alur dev: `npm run dev` → Electron menjalankan `server.js` → memuat URL dari `config.js` → renderer mengeksekusi `App.js` dari `index.html`.

## Prasyarat

- **Node.js** (versi yang didukung oleh dependensi proyek; LTS disarankan)
- **npm**

## Instalasi

```bash
npm install
```

## Menjalankan

| Perintah | Keterangan |
|----------|------------|
| `npm run dev` | Electron + **electronmon**: jalankan **sekali**, biarkan proses tetap jalan. Perubahan file disimpan → pemantau memicu reload otomatis (lihat **Hot reload** di bawah). |
| `npm start` | Electron **tanpa** pemantau file — setelah edit, refresh jendela sendiri (F5 / menu konteks **Refresh**). |
| `npm run server` | Hanya server Express (`node server.js`), berguna untuk uji di browser. |
| `npm run stop` | Membebaskan port default script (`kill-port` — sesuaikan port jika berbeda). |
| `npm run build` | Paket installer Windows (NSIS) lewat **electron-builder** → keluaran di folder `dist/`. |
| `npm run pack` | Build tanpa installer (folder `dist` untuk inspeksi). |

### Hot reload (`npm run dev`)

1. **Satu terminal** — setelah `npm run dev`, jangan mengulang `npm start` kecuali Anda menutup app.
2. **Simpan file** (Ctrl+S) — **electronmon** mendeteksi perubahan di proyek (kecuali `node_modules`, `dist`).
3. **File proses utama** (`electron/main.js`, `electron/preload.js`) — aplikasi **restart** penuh.
4. **Halaman & aset** (`templates/`, `assets/`, `electron/components/`, `App.js`, `index.html`, dll.) — isi jendela **reload** (cache HTTP diabaikan).
5. **Logika server** (`server.js`) — proses Express ikut dimuat di proses utama; jika Anda mengubah route/middleware API, **tutup jendela app lalu jalankan lagi** `npm run dev` (atau sentuh `electron/main.js` agar restart penuh).

**Penting:** URL dan port aplikasi harus selaras dengan **`config.js`** (lihat di bawah). Jika port untuk Express sudah dipakai proses lain, server gagal start — hentikan proses tersebut atau ubah URL di konfigurasi.

## Konfigurasi

### `config.js`

- Dipakai oleh **`server.js`** untuk `listen` dan `baseUrl`.
- Ke browser **tidak** di-expose sebagai file `/config.js`; nilai disuntik ke **`window.__NEXA_ENDPOINT__`** saat memuat `index.html`.
- Sesuaikan **`url`** (mis. `http://localhost:3007`) agar sama dengan port yang didengarkan server dan dengan yang dibuka Electron.

### Ikon & build Windows

- **`package.json` → `build.win.icon`**: ikon installer dan sumber ikon jendela di dev (`electron/main.js` membaca path yang sama).
- **`appId`**: `com.eletron.nexa` — dipakai untuk pengelompokan taskbar di Windows (`setAppUserModelId`).

### Variabel lingkungan (opsional)

| Variabel | Arti |
|----------|------|
| `ELECTRON_DEV=1` | Membuka DevTools saat jendela siap. |
| `ELECTRON_SINGLE_INSTANCE=1` | Satu instance; instance kedua memfokuskan jendela. |
| `ELECTRON_DISABLE_GPU=0` | Jangan matikan akselerasi GPU (default: GPU dimatikan lewat switch). |
| `ELECTRON_DISABLE_HTTP_CACHE=0` | Izinkan cache HTTP Chromium (default: cache disk dimatikan untuk dev). |
| `NEXA_DEV_NO_CACHE=0` | Bersama `NODE_ENV=production`, header no-cache untuk `/templates/`, `/assets/`, `/nexa-context/`, `/App.js` bisa dinonaktifkan. |
| `NODE_ENV=production` | Mode produksi untuk server (perilaku cache, dll.). |

## File penting

| File | Fungsi |
|------|--------|
| `electron.js` | Entry Electron di akar proyek; memuat **`electron/main.js`** dari `electron/` (dev) atau **`resources/electron/`** (installer). Build memakai **`asar: true`** ( **`assets/modules`** dll. di dalam **`app.asar`** ). |
| `electron/main.js` | Proses utama: `BrowserWindow`, menu konteks, membersihkan cache session, `require` **`index.js`** (server). |
| `electron/csp.js` | Membangun string CSP; diimpor oleh **`server.js`**. |
| `server.js` | Express: middleware, static root, `/assets`, **`/nexa-context/`** → `electron/components/`, API `/api/*`, blokir **`/electron/`** (keamanan; bukan modul menu). |
| `electron/preload.js` | `contextBridge`: menu konteks (`electronAPI.onContextMenuClick`, dll.). |
| `electron/electronShell.js` | Shell aplikasi: `mainWindowLayout` + `buildContextMenuTemplate` (ESM; di dev dimuat ulang tiap klik kanan / jendela baru). |
| `index.html` | Shell SPA; `<base href="/">`; memuat `Nexa.js` dan `App.js`. |
| `App.js` | `NXUI.Page` — rute, endpoint; import **`/nexa-context/index.js`**; listener IPC menu konteks memanggil **`components(role)`**. |

## Menu konteks & `electron/components`

- Item menu yang mengirim **`context-menu-clicked`** (dari template di **`electron/electronShell.js`**) diterima di **`App.js`** lewat **`window.electronAPI.onContextMenuClick`**.
- **`electron/components/index.js`** memuat dinamis **`./<role>.js`** (mis. `nexaTerminal` → `nexaTerminal.js`); modul di-fetch dari URL **`/nexa-context/`** (bukan path **`/electron/`** mentah).
- Menambah handler: berkas baru di **`electron/components/<role>.js`** mengekspor fungsi bernama sama dengan **`role`**, lalu kirim **`role`** itu dari template menu di **`electron/electronShell.js`**.

## Build & keamanan

- **electron-builder** mengemas **`resources/app.asar`** ( **`assets/modules`**, **`templates`**, **`index.js`**, dll.). Folder proses utama **`electron/`** tetap di **`extraResources`**. Ikona & metadata di **`package.json` → `build`**.
- Pola **`build.files`** mengecualikan banyak file dari paket; pastikan aset yang diperlukan tidak terkecualikan secara tidak sengaja.
- Server menolak melayani nama file sensitif di root URL (mis. `server.js`, `config.js`, `package.json`, `.env`).

## Lisensi

MIT (lihat `package.json`).
