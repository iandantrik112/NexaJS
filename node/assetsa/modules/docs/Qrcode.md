# NXUI.Qrcode

**NXUI.Qrcode** membuat kode QR di browser sebagai **canvas**, memuat pustaka **[QRious](https://github.com/neocotic/qrious)** secara dinamis (unpkg) jika `QRious` belum tersedia, lalu mengekspos pembaruan teks/warna, logo di tengah, tombol unduh/kustom, dan ekspor PNG.

**API utama:** `new NXUI.Qrcode(containerId, options)` setelah **Nexa.js** memuat objek `NXUI`.

**Impor modul langsung (tanpa Nexa):** named export `Qrcode` dari berkas `./assets/modules/Qrcode/NexaQrcode.js` — kelas yang sama dengan `NXUI.Qrcode`.

Demo interaktif: `templates/qrcode.js` (route `/qrcode` jika sudah diregistrasi).

## Daftar isi

- [1. Prasyarat & alur async](#1-prasyarat--alur-async)
- [2. Cara memakai (minimal)](#2-cara-memakai-minimal)
- [3. Opsi konstruktor](#3-opsi-konstruktor)
- [4. Metode instance](#4-metode-instance)
- [5. Kontrol tombol](#5-kontrol-tombol)
- [6. Logo](#6-logo)
- [7. Metode statis](#7-metode-statis)
  - [`generateToCanvas` (async)](#qrcode-static-canvas-timing)
- [8. Catatan ukuran & QRious](#8-catatan-ukuran--qrious)
- [9. Impor modul langsung](#9-impor-modul-langsung)

---

## 1. Prasyarat & alur async

- Elemen penampung harus **sudah ada di DOM** dan memiliki atribut **`id`** yang sama dengan argumen pertama konstruktor. `document.getElementById(containerId)` harus mengembalikan node; jika tidak, konstruktor keluar lebih awal tanpa inisialisasi.
- Inisialisasi **tidak selesai secara sinkron**: setelah konstruktor, modul memuat QRious lalu memanggil `init()` (wrapper, `generate`, opsional area kontrol). Sebelum QRious siap, kontainer bisa menampilkan teks “Loading QR library…”.
- Perlu **jaringan** (atau QRious sudah di-bundle global) agar skrip dari unpkg dapat dimuat.

```html
<div id="qr-host"></div>
```

```javascript
const qr = new NXUI.Qrcode("qr-host", {
  text: "https://example.com",
  width: 200,
});
// Pembaruan setelah UI siap — mis. respons tombol
qr.updateText("Teks baru");
```

---

## 2. Cara memakai (minimal)

```javascript
const qr = new NXUI.Qrcode("my-qr", {
  text: "Hello World",
  width: 256,
  height: 256,
  showControls: false,
});
```

`init()` mengosongkan isi `#my-qr`, menambahkan `.nexa-qrcode-container`, dan menggambar QR di dalamnya.

---

## 3. Opsi konstruktor

| Opsi | Default | Keterangan |
| ---- | ------- | ---------- |
| `text` | `"Hello World"` | Isi yang di-encode ke QR. |
| `width` | `256` | Diteruskan ke QRious sebagai `size` (lihat [§8](#8-catatan-ukuran--qrious)). |
| `height` | `256` | Disimpan di `options`; implementasi saat ini tidak memakainya untuk ukuran canvas QRious. |
| `colorDark` | `"#000000"` | Warna modul gelap (foreground QRious). |
| `colorLight` | `"#ffffff"` | Warna latar (background QRious). |
| `correctLevel` | `"M"` | Tingkat koreksi error QRious: `"L"`, `"M"`, `"Q"`, `"H"`. Logo di tengah disarankan `"H"`. |
| `debug` | `false` | Disimpan di opsi; tidak memicu perilaku tambahan di kelas ini. |
| `showControls` | `false` | Jika `true`, `init()` membuat `.nexa-qrcode-controls` untuk tombol yang Anda tambahkan. |
| `logo` | `null` | URL gambar atau data URI; digambar di atas canvas setelah QR. |
| `logoSize` | `0.2` | Fraksi lebar canvas (0–1). |
| `logoMargin` | `8` | Margin putih di sekitar area logo (px). |
| `logoRadius` | `8` | Radius sudut latar logo. |

Properti lain pada objek `options` digabung lewat spread ke `this.options`.

---

## 4. Metode instance

| Metode | Keterangan |
| ------ | ----------- |
| `generate(text)` | Menggambar ulang QR dari string non-kosong. Mengembalikan `false` jika teks kosong, library belum ada, atau error. |
| `updateText(newText)` | Menyimpan `options.text` dan memanggil `generate(newText)`. |
| `updateOptions(partial)` | Menggabung `partial` ke `this.options`, lalu `generate(this.options.text)`. |
| `downloadQR()` | Unduh PNG melalui `canvas.toDataURL` + anchor sementara. |
| `getDataURL()` | `data:image/png;base64,...` atau `null` jika tidak ada canvas. |
| `getBlob(callback)` | Memanggil `canvas.toBlob(callback, "image/png")`; mengembalikan `true`/`false` keberhasilan memulai. |
| `clear()` | Mengosongkan isi `qrContainer`, `this.qrcode = null`. |
| `destroy()` | `clear()`, mengosongkan `container`, mengosongkan referensi internal. |

`createWrapper()` memanggil `this.container.innerHTML = ""` — **seluruh isi elemen host dihapus** setiap kali wrapper dibuat (awal `init()`).

---

## 5. Kontrol tombol

Jika `showControls: true`, wadah tombol dibuat di bawah QR. Anda bisa menambahkan tombol secara programatik:

| Metode | Keterangan |
| ------ | ----------- |
| `createDownloadButton(text?, className?)` | Tombol biru default yang memanggil `downloadQR()`. |
| `createCustomButton(text, callback, options?)` | Tombol dengan `className`, `background`, `hoverBackground`, `color`, `padding`, `fontSize`, `borderRadius`. |
| `addButtons(configs[])` | Untuk tiap item: `type: "download"` memakai `createDownloadButton`; selain itu `text`, `callback`, `options`. |
| `clearButtons()` | Mengosongkan `.nexa-qrcode-controls`. |
| `removeButton(className)` | Menghapus tombol pertama yang class-nya cocok dengan `querySelector('.' + className)` — berikan **nama class tanpa titik** (mis. `"download-btn"`). |

Jika `createCustomButton` dipanggil saat `controlsContainer` belum ada, `createControlsContainer()` dipanggil otomatis.

---

## 6. Logo

- `logo` dapat berupa **URL** atau **data URI** (`data:image/png;base64,...`).
- Gambar dimuat async; jika gagal (`onerror`), QR tetap tampil tanpa logo.
- ECC tinggi (`correctLevel: "H"`) membantu ketahanan pembacaan saat bagian tengah tertutup logo.

```javascript
const qr = new NXUI.Qrcode("qr-host", {
  text: "https://example.com",
  width: 220,
  correctLevel: "H",
  logo: "/assets/images/favicon.ico",
  logoSize: 0.22,
  logoMargin: 10,
  logoRadius: 10,
});
```

---

## 7. Metode statis

```javascript
// Mengembalikan instance (init async sama seperti konstruktor)
const instance = NXUI.Qrcode.generateToElement("host-id", "teks", { width: 160 });
```

```javascript
// Promise<HTMLCanvasElement | null> — tunggu init + kemunculan canvas (hingga ~10s)
const canvas = await NXUI.Qrcode.generateToCanvas("teks", {
  width: 140,
  colorDark: "#000",
});
```

<a id="qrcode-static-canvas-timing"></a>

### `generateToCanvas` (async)

Metode ini **async**: menunggu `_initPromise` (setelah `loadQRiousLibrary` + `init`), lalu mem-poll hingga `canvas` ada (memperhitungkan retry internal `generate()` saat QRious belum siap). Batas tunggu sekitar **10 detik**; jika tetap tidak ada canvas, mengembalikan `null`.

---

## 8. Catatan ukuran & QRious

- QRious di dalam `generate()` memakai **`size: this.options.width`** saja; hasilnya **persegi**.
- Properti `height` tetap ada di `options` untuk konsistensi API / kemungkinan pengembangan ke depan, tetapi **tidak mengubah ukuran gambar** pada versi ini.

---

## 9. Impor modul langsung

```javascript
import { Qrcode } from "./assets/modules/Qrcode/NexaQrcode.js";

const qr = new Qrcode("qr-host", { text: "Hi", width: 200 });
```

Tidak ada `export default`; gunakan named export `Qrcode` (di aplikasi Nexa, pakai `NXUI.Qrcode` setelah memuat Nexa.js).

```javascript
const qr = new NXUI.Qrcode("qr-host", { text: "Hi", width: 200 });
```
