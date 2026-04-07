# NXUI.Svg — komponen SVG (DOM)

Factory **`NXUI.Svg(options)`** membangun ilustrasi SVG di browser / Electron: mengembalikan **satu `HTMLElement`** (wrapper `div.svg-container`) yang berisi elemen `<svg>` hasil parse. Diadaptasi dari pola React Native; di Nexa dipakai sebagai **vanilla DOM**, bukan JSX.

**Lokasi kode**

| Bagian | Path |
|--------|------|
| Factory `Svg` | `assets/modules/Svg/index.js` |
| Koleksi `name` | `assets/modules/Svg/svgContent.js` |
| Asset string per key | `assets/modules/Svg/localImage.js` (`assetsImage`) |
| Ekspor global | `assets/modules/Nexa.js` → `NXUI.Svg`, `NXUI.svgContent` |
| Demo route SPA | `templates/Svg.js` (rute `svg` di `App.js`) |

## Fitur

- **Sumber konten**: `xml` (string), `name` (kunci `svgContent`), atau `source` (string SVG terdaftar di `assetsImage`)
- **Ukuran**: `width` / `height` (default `100`) → di-set sebagai atribut pada elemen `<svg>` (bisa angka atau string, mis. `"100%"`)
- **Aksen warna**: `fill` (atau `color`, deprecated) mengganti literal **`#17B8A6`** di string SVG (pola undraw)
- **Gaya**: `style` pada container, `svgStyle` pada elemen `<svg>`
- **Markup**: `className` pada container; `id`, `class`, `data-*` lewat sisa opsi diterapkan ke **elemen `<svg>`** (bukan ke wrapper)
- **Error**: jika nama / sumber tidak ada atau parse gagal, dikembalikan `div.svg-error` dengan pesan singkat

## Prioritas sumber konten

1. Jika `xml` ada (string non-kosong dipakai sebagai konten), dipakai dulu.
2. Jika belum ada konten dan `name` diisi, dibaca dari **`NXUI.svgContent[name]`**.
3. Jika masih belum ada dan `source` diisi, dibaca dari **`assetsImage.get(source)`** — nilai harus **string** (isi SVG). Daftar key default bisa kosong sampai Anda `register` di `localImage.js`.

## Penggunaan dasar

### 1. Dari koleksi (`name`)

Kunci yang tersedia saat ini: **`forgot`**, **`nexa`**, **`qr`** (lihat `svgContent.js`).

```javascript
const el = NXUI.Svg({
  name: 'forgot',
  width: 200,
  height: 178,
  fill: '#CB2F2F',
  className: 'demo-svg-forgot',
});
document.querySelector('#row').appendChild(el);
```

### 2. Dari string XML (`xml`)

```javascript
const el = NXUI.Svg({
  xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#17B8A6"/></svg>',
  width: 56,
  height: 56,
  id: 'ikon-custom',
});
container.appendChild(el);
```

### 3. `fill` / `color`

Hanya substring **`fill="#17B8A6"`** dan **`fill='#17B8A6'`** di string SVG yang diganti. SVG tanpa warna itu tidak berubah.

```javascript
NXUI.Svg({ name: 'nexa', width: 220, height: 176, fill: '#2563eb' });
```

### 4. Container vs inner SVG

```javascript
NXUI.Svg({
  name: 'qr',
  width: 180,
  height: 110,
  style: { padding: '8px', background: '#f8fafc' },
  svgStyle: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' },
  className: 'kartu-qr',
});
```

### 5. Akses koleksi mentah (`NXUI.svgContent`)

```javascript
const keys = Object.keys(NXUI.svgContent);
// ['forgot', 'nexa', 'qr']

const xmlString = NXUI.svgContent.forgot;
// bisa dipakai sendiri atau lewat NXUI.Svg({ xml: xmlString, ... })
```

### 6. `source` + `assetsImage`

`source` membaca singleton **`assetsImage`** di dalam modul Svg (`localImage.js`). Key harus mengarah ke **string isi SVG** (bukan sekadar path file), biasanya lewat **`register(key, svgString)`** di **`registerDefaultAssets()`** atau kode init Anda di file itu.

```javascript
// Konsep di assets/modules/Svg/localImage.js (sesuaikan proyek)
// this.register('logoSvg', '<svg xmlns="http://www.w3.org/2000/svg">...</svg>');
// Lalu dari UI:
NXUI.Svg({ source: 'logoSvg', width: 64, height: 64 });
```

`NXUI` tidak mengekspor `assetsImage` secara default; integrasi dilakukan di sisi modul Svg.

## Bukan konstruktor

Gunakan **panggilan fungsi**, bukan `new`:

```javascript
// Benar
NXUI.Svg({ name: 'nexa', width: 120, height: 120 });

// Salah
// new NXUI.Svg({ ... })
```

## Demo di SPA (NexaRoute)

Halaman **`/svg`** memuat contoh yang sama seperti di `templates/Svg.js`: `forgot` + `fill`, `nexa`, `qr`, dan satu SVG `xml` inline. Pastikan rute `'svg'` terdaftar di `App.js` dan Nexa sudah memuat `NXUI`.

## API Reference

### `NXUI.Svg(options)`

| Opsi | Tipe | Default | Keterangan |
|------|------|---------|------------|
| `xml` | `string` | — | SVG mentah; menang atas `name` / `source` jika terisi |
| `name` | `string` | — | Kunci di `NXUI.svgContent` |
| `source` | `string` | — | Key `assetsImage`; nilai harus string SVG |
| `width` | `number` \| `string` | `100` | Atribut `width` pada `<svg>` |
| `height` | `number` \| `string` | `100` | Atribut `height` pada `<svg>` |
| `fill` | `string` | — | Ganti `fill="#17B8A6"` / `'#17B8A6'` |
| `color` | `string` | — | Alias `fill` (deprecated) |
| `style` | `object` | `{}` | `Object.assign` ke style wrapper |
| `svgStyle` | `object` | `{}` | Style pada node `<svg>` |
| `className` | `string` | `''` | Kelas tambahan pada wrapper (`svg-container`) |
| …props | `object` | — | Kunci `id`, `class`, `data-*` → atribut pada `<svg>` |

**Return:** `HTMLElement` — `.svg-container` berisi `<svg>`, atau `.svg-error` jika gagal.

### `NXUI.svgContent`

Objek string SVG (isi sama dengan export di `svgContent.js`).

### `SvgComponent` (modul saja)

Di `index.js` ada alias **`SvgComponent(props)`** = `Svg(props)` untuk gaya “komponen”. Tidak selalu diekspos di `NXUI`; dari bundel utamanya pakai **`NXUI.Svg`**.

## Menambah SVG baru

1. Tambah konstanta template di **`svgContent.js`** (atau import dari file terpisah).
2. Registrasikan di object **`svgContent`**:

```javascript
export const svgContent = {
  forgot: forgotSvg,
  nexa: nexaSvg,
  qr: qrSvg,
  custom: customSvg,
};
```

Untuk ilustrasi undraw yang ingin di-recolor dengan `fill`, pertahankan warna aksen **`#17B8A6`** pada path yang ingin diganti.

## Tips

### Animasi / event pada node `<svg>`

```javascript
const wrap = NXUI.Svg({ name: 'nexa', width: 160, height: 128 });
const svg = wrap.querySelector('svg');
svg.style.transition = 'transform 0.2s ease';
wrap.addEventListener('mouseenter', () => { svg.style.transform = 'scale(1.05)'; });
wrap.addEventListener('mouseleave', () => { svg.style.transform = 'scale(1)'; });
```

### Responsif

`width` / `height` bisa string CSS pixel atau persen; kombinasikan dengan `style: { maxWidth: '100%' }` pada wrapper bila perlu.

## Troubleshooting

| Gejala | Cek |
|--------|-----|
| `NXUI.Svg` undefined | Pastikan skrip Nexa utama sudah di-load sebelum route/template jalan. |
| “SVG not found” | `console.log(Object.keys(NXUI.svgContent))` — pastikan `name` benar. |
| `fill` tidak mengubah warna | SVG harus memakai literal **`#17B8A6`** pada atribut `fill` yang ingin diganti. |
| `source` error / not found | Key belum terdaftar atau nilainya bukan string SVG penuh. |

## Lisensi

MIT — bagian dari kerangka Nexa / NexaUI.
