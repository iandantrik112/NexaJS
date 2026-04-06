# NXUI.Escpos (NexaEscpos)

**NexaEscpos** membangun **byte mentah ESC/POS** untuk printer thermal (serial/USB/Ethernet lewat driver atau bridge). Modul ini **tidak** memanggil `window.print()` dan **tidak** mengirim data ke perangkat keras — Anda yang meneruskan `Uint8Array` / file ke **WebUSB**, **backend** (Node, Python, dll.), atau aplikasi desktop.

**API utama:** `new NXUI.Escpos()` setelah **Nexa.js** memuat `NXUI`.

**Alias di `NXUI`:** `NXUI.Escpos` (sama dengan `NXUI.NexaEscpos`).

**Berkas sumber:** `assets/modules/Escpos/NexaEscpos.js` · **`window.NexaEscpos`** juga di-set untuk debugging.

Demo interaktif: `templates/escpos.js` (route `/escpos` jika sudah diregistrasi).

## Daftar isi

- [1. Perbedaan dengan NXUI.Prind](#1-perbedaan-dengan-nxuiprind)
- [2. Cara memakai (minimal)](#2-cara-memakai-minimal)
- [3. Metode builder (ringkasan)](#3-metode-builder-ringkasan)
- [4. `raw()` — input byte](#4-raw--input-byte)
- [5. Teks & encoding](#5-teks--encoding)
- [6. QR & CODE128](#6-qr--code128)
- [7. Keluaran & unduhan](#7-keluaran--unduhan)
- [8. Statis `receipt()`](#8-statis-receipt)
- [9. Impor modul](#9-impor-modul)

---

## 1. Perbedaan dengan NXUI.Prind

| | **NXUI.Prind** | **NXUI.Escpos** |
| --- | --- | --- |
| Target | Elemen HTML → dialog cetak browser | Byte perintah printer thermal |
| Saluran | `window.print` / iframe / tab baru | WebUSB, serial, socket, file `.bin` |
| Cocok untuk | Invoice / laporan di kertas A4 | Struk POS, kitchen printer |

Keduanya bisa dipakai bersamaan di satu aplikasi untuk skenario berbeda.

---

## 2. Cara memakai (minimal)

Semua metode builder **mengembalikan `this`** sehingga bisa dirantai.

```javascript
const esc = new NXUI.Escpos();

esc
  .init()
  .align("center")
  .bold(true)
  .text("TOKO")
  .lf()
  .resetModes()
  .text("Item 1")
  .lf()
  .feedLines(3)
  .cut("partial");

const bytes = esc.toUint8Array();
// esc.download("struk.bin");
```

---

## 3. Metode builder (ringkasan)

| Metode | Keterangan |
| ------ | ----------- |
| `clone()` | Salin buffer ke instance baru. |
| `raw(input)` | Lihat [§4](#4-raw--input-byte). |
| `init()` | `ESC @` — inisialisasi umum. |
| `text(s)` | Teks; [§5](#5-teks--encoding). |
| `lf()` | Line feed (`0x0A`). |
| `crlf()` | CR + LF. |
| `feedLines(n)` | `ESC d n` — feed maks. 255 baris. |
| `align(mode)` | `left` \| `center` \| `right` (`ESC a`). |
| `bold(on)` | `ESC E` tebal on/off. |
| `underline(mode)` | `ESC -` — `0` off, `1` / `2` ketebalan. |
| `size(w, h)` | `GS !` — perkalian lebar/tinggi **1–8**. |
| `resetModes()` | `bold(false)`, `underline(0)`, `size(1,1)`. |
| `cut(kind)` | `partial` \| `full` (`GS V`). |
| `cashDrawerPulse(m, t1, t2)` | `ESC p` — pulsa laci (nilai default umum 120/240). |
| `barcode128(data)` | [§6](#6-qr--code128). |
| `qr(data, opt?)` | [§6](#6-qr--code128). |
| `concat(other)` | Gabung instance `NexaEscpos` lain atau `Uint8Array`. |
| `length` (getter) | Jumlah byte saat ini. |

---

## 4. `raw()` — input byte

| Jenis `input` | Perilaku |
| ------------- | -------- |
| `Uint8Array` | Setiap byte ditambahkan. |
| `number[]` | Setiap elemen di-mask `& 0xff`. |
| `string` | Dianggap **hex tanpa spasi** (mis. `"1B40"` → `ESC @`). Panjang ganjil: pasangan terakhir diabaikan aman — hindari string ganjil. |
| `null` / `undefined` | Tidak menambah apa pun. |

---

## 5. Teks & encoding

- `text()` memakai **`TextEncoder`** → **UTF-8**.
- Banyak printer thermal mendukung UTF-8 atau perlu perintah **code page** tambahan; jika karakter rusak, sisipkan byte lewat `raw()` sesuai manual printer Anda (CP437, Windows-1252, dll.).

---

## 6. QR & CODE128

### `qr(data, opt?)`

- `data`: string (di-encode UTF-8).
- `opt.moduleSize`: **1–16** (default `6`) — ukuran modul QR.
- `opt.ecc`: `'L'` \| `'M'` \| `'Q'` \| `'H'` (default `'M'`).
- Urutan perintah mengikuti pola **GS ( k** yang umum pada printer Epson dan banyak **clone**; perilaku bisa berbeda pada firmware non-standar.

### `barcode128(data)`

- Mengirim **`GS k`** dengan mode **73** (CODE128) dan panjang payload (maks. **255** byte; lebih panjang dipotong + peringatan di konsol).
- Isi diambil dari string via UTF-8; untuk barcode murni ASCII biasanya aman.

---

## 7. Keluaran & unduhan

| Metode | Keterangan |
| ------ | ----------- |
| `toUint8Array()` | Salinan buffer sebagai `Uint8Array`. |
| `toArrayBuffer()` | `ArrayBuffer` dari salinan tersebut. |
| `toBlob()` | `Blob` `application/octet-stream`. |
| `download(filename?)` | Memicu unduh (default `escpos.bin`). Hanya bermakna di lingkungan dengan DOM (`document.createElement`). |

---

## 8. Statis `receipt()`

```javascript
const esc = NXUI.Escpos.receipt("Baris 1\nBaris 2\nBaris 3");
esc.feedLines(2).cut("partial");
```

Setara: `init()`, lalu setiap baris dipisah `\n` dengan `lf()` di antaranya, lalu satu `lf()` di akhir.

---

## 9. Impor modul

```javascript
import NexaEscpos from "./assets/modules/Escpos/NexaEscpos.js";
// atau
import { NexaEscpos } from "./assets/modules/Escpos/NexaEscpos.js";

const esc = new NexaEscpos();
```

Setelah Nexa.js dimuat, disarankan memakai **`new NXUI.Escpos()`** agar konsisten dengan modul lain.

```javascript
const esc = new NXUI.Escpos();
```

Ada **`export default`** dan kelas bernama **`NexaEscpos`** — bundler Anda harus mendukung impor named dari berkas yang mengekspor class (seperti di `Nexa.js`).
