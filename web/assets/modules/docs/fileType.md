# NXUI.fileType — preview ikon & gambar per path file

Fungsi **`fileType(filePath, targetSelector)`** di `Dom/NexaType.js` mengisi **satu elemen DOM** (via `document.querySelector`) dengan pratinjau singkat: ikon **Font Awesome** (`fas …`), **`<img>`** untuk tipe gambar, atau ikon PDF yang bisa dibuka di **modal + iframe**. Dipakai untuk daftar unggahan, drive, lampiran, dll.

**Lokasi kode**

| Bagian | Path |
|--------|------|
| Implementasi | `assets/modules/Dom/NexaType.js` |
| Ekspor global | `assets/modules/Nexa.js` → `NXUI.fileType`, `NXUI.NexaType`, alias `NXUI.Type` |
| Ekspor ES module | `import { fileType, NexaType } from '…/Nexa.js'` |
| Demo route SPA | `templates/filetype.js` — rute **`filetype`** (`/filetype`) di `App.js` |

## Prasyarat

1. **`window.NEXA.url`** — basis URL absolut (tanpa slash akhir berlebihan) dipakai untuk:
   - `src` gambar: `NEXA.url + filePath`
   - path PDF ke modal: `NEXA.url + filePath`
   - placeholder tanpa ekstensi: `NEXA.url + '/assets/images/500px.png'` (opsional; file boleh tidak ada)
2. **`window.NXUI`** — untuk **`NXUI.NexaLightbox.initAll('.nexa-lightbox')`** setelah render gambar, dan untuk **`openModalPDF`** → `modalHTML` / `nexaModal` / `id()`.
3. **Font Awesome** (kelas `fas`) — muat lewat `nexa.css` / `all.min.css` di halaman.
4. **Modal Nexa** — stylesheet & skrip modal sudah tersedia jika memakai klik PDF.

## Tanda tangan

```javascript
const info = NXUI.fileType(filePath, targetSelector);
// setara:
const info = NXUI.NexaType.fileType(filePath, targetSelector);
```

| Argumen | Tipe | Keterangan |
|---------|------|------------|
| `filePath` | `string` | Path file; **bukan** URL penuh. Ekstensi diambil dari segmen terakhir (`nama.ext`). Digabung dengan `NEXA.url` untuk URL absolut. Contoh: `'/drive/2025/foto.png'`. |
| `targetSelector` | `string` | Selector CSS yang **unik** di dokumen, disarankan `#id`. Dipakai untuk `querySelector` dan untuk id turunan (PDF, gambar). |

**Nilai balik:** objek info (lihat di bawah) atau **`null`** jika `filePath` / `targetSelector` tidak valid atau elemen target tidak ditemukan.

## Perilaku menurut jenis file

### Tanpa ekstensi (`nama` tanpa titik)

- `innerHTML`: `<img … id="preview-image" … display:none … src="${NEXA.url}/assets/images/500px.png">` (placeholder upload).
- `isText: true`, ikon fallback logika mengarah ke “belum ada file”.

### Gambar (`jpg`, `jpeg`, `png`, `gif`, `webp`, `bmp`, `svg`)

- `innerHTML`: `<img class="nexa-lightbox" id="box_${idSelector}" src="${NEXA.url}${filePath}" …>`.
- Setelah itu dipanggil **`NXUI.NexaLightbox.initAll('.nexa-lightbox')`** (seluruh dokumen) agar klik membuka lightbox.
- Pastikan **`NEXA.url + filePath`** benar-benar bisa di-`GET` (CORS / 404 akan membuat gambar rusak).

### PDF

- `innerHTML`: ikon `fa-file-pdf` dengan `id="fa-icon-pdf-${idSelector}"`, kursor pointer.
- Klik memanggil **`window.openModalPDF(idSelector, pdfPath)`** dengan `pdfPath = NEXA.url + filePath`.
- **`window.openModalPDF`** didefinisikan di akhir `NexaType.js` saat modul dimuat: membuka **`NXUI.modalHTML`** + iframe + **`nexaModal.open`**.

### Lainnya (xlsx, json, zip, …)

- `innerHTML`: satu elemen `<i class="${iconClass}">` dengan warna dari peta `fileColors` (bukan PDF, bukan gambar).
- Perhatikan: beberapa sel non-PDF memakai `id="fa-icon"` — **boleh bentrok** jika banyak kotak dalam satu halaman; untuk produksi pertimbangkan id unik per target.

## Objek kembalian

Jika sukses (elemen terisi):

```ts
{
  fileName: string,      // segmen terakhir path
  extension: string,     // huruf kecil, tanpa titik
  hasExtension: boolean,
  iconClass: string,     // mis. "fas fa-file-pdf"
  iconColor: string,     // hex
  isImage: boolean,
  isPDF: boolean,
  isText: boolean,       // true jika !hasExtension
  targetElement: HTMLElement
}
```

Jika gagal validasi / tidak ada elemen: **`null`**.

Pada **error** di `try` (jarang): target tetap diisi ikon fallback `fas fa-file` dan mengembalikan objek dengan `iconClass: "fas fa-upload"` (lihat kode).

## Pemetaan ekstensi (ringkas)

Ikon dan warna mengikuti objek internal `fileIcons` / `fileColors`. Contoh:

| Kelompok | Ekstensi (contoh) |
|----------|-------------------|
| Gambar | jpg, jpeg, png, gif, webp, bmp, svg |
| Dokumen | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf |
| Data | xml, yaml, yml, json, csv |
| Arsip | zip, rar, 7z, tar, gz |
| Audio | mp3, wav, flac, aac, ogg |
| Video | mp4, avi, mov, wmv, flv, mkv, webm |

Ekstensi tidak terdaftar → ikon **`fas fa-file`**, warna **`#666`**.

## Integrasi NXUI

Setelah `Nexa.js` dimuat:

- **`NXUI.fileType`** — fungsi langsung.
- **`NXUI.NexaType`** — namespace modul (saat ini berisi `fileType`).
- **`NXUI.Type`** — alias `NexaType`.

Dari modul:

```javascript
import NXUI from './assets/modules/Nexa.js';
import { fileType, NexaType } from './assets/modules/Nexa.js';
```

## Contoh minimal

```html
<div id="preview-1"></div>
```

```javascript
NXUI.fileType('/uploads/nota.pdf', '#preview-1');
```

```javascript
NXUI.fileType('/media/thumb.png', '#preview-2');
```

Pastikan **`#preview-1`** sudah ada di DOM **sebelum** `fileType` dipanggil (fungsi tidak membuat wadah).

## Demo di proyek

File **`templates/filetype.js`** mendaftarkan route **`filetype`**. Buka **`/filetype`** dan lihat konsol untuk log objek kembalian tiap contoh path.

## Troubleshooting

| Gejala | Kemungkinan penyebab |
|--------|----------------------|
| Selalu `null` | Selector salah atau elemen belum ada; `filePath` kosong / bukan string. |
| Gambar putus | `NEXA.url` salah atau file tidak ada di `NEXA.url + filePath`. |
| Ikon kosong | Font Awesome belum dimuat (`fas`). |
| PDF tidak buka modal | `NXUI.modalHTML` / `nexaModal` belum siap; cek error konsol. |
| Lightbox tidak jalan | `NexaLightbox` / inisialisasi; panggilan `initAll` global tiap `fileType` — hindari ribuan panggilan berulang di daftar sangat besar (pertimbangkan refactor). |

## Lisensi / catatan

Bagian dari kerangka Nexa / NexaUI. Perluasan ekstensi atau id unik untuk ikon non-PDF dilakukan dengan mengedit **`NexaType.js`**.
