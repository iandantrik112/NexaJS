# NexaLightbox

Lightbox gambar penuh layar dengan zoom, unduh, dan kontrol keyboard. Class diekspor dari `assets/modules/Lightbox/NexaLightbox.js` dan tersedia di bundel sebagai **`NXUI.Lightbox`** (alias **`NXUI.NexaLightbox`**).

## Fitur singkat

- Buka dengan klik pada gambar pemicu; tutup lewat tombol tutup, klik area gelap di luar gambar, atau tombol **Escape**
- Loading spinner saat gambar dimuat; placeholder jika URL gagal
- Zoom: tombol +/−, reset, **scroll roda** di atas gambar; **seret** gambar saat zoom &gt; 1
- Tombol unduh (nama file dari URL atau `id` elemen)
- Ikon kontrol memakai **Font Awesome 6** (stylesheet di-inject sekali lewat `#nexa-lightbox-styles`)

## HTML minimal

Gunakan `<img>` dengan `src` (atau `data-src` untuk sumber alternatif). Untuk `initAll`, `id` opsional—akan dibuat otomatis bila kosong.

```html
<img
  id="preview-1"
  src="/path/ke/gambar.jpg"
  alt="Deskripsi"
  class="nexa-lightbox"
  style="max-width:300px; cursor:pointer;"
/>
```

Lazy URL (dipilih jika ada):

```html
<img
  id="preview-2"
  data-src="/path/ke/gambar-besar.jpg"
  src="/path/ke/thumb.jpg"
  alt="Thumb"
  class="nexa-lightbox"
/>
```

Selector default `initAll` juga mencakup atribut `data-lightbox`:

```html
<img data-lightbox src="/gambar.jpg" alt="Foto" />
```

## Di aplikasi (NXUI)

Setelah konten halaman (termasuk gambar) ada di DOM, panggil `initAll` sekali—misalnya di callback route:

```javascript
const instances = NXUI.Lightbox.initAll('.nexa-lightbox');
console.log('Lightbox:', instances.length);
```

Selector kustom (default bawaan modul: `'img[data-lightbox], img.nexa-lightbox'`):

```javascript
NXUI.Lightbox.initAll('img.galeri-lightbox');
```

Inisialisasi manual per gambar (harus punya `id` unik):

```javascript
const lb = new NXUI.Lightbox('#preview-1');
// lb.targetId — id elemen pemicu (berguna untuk nama unduhan)
```

## Modul ES langsung (tanpa NXUI)

```html
<script type="module">
  import { NexaLightbox } from '/assets/modules/Lightbox/NexaLightbox.js';

  NexaLightbox.initAll('.nexa-lightbox');
  // atau: new NexaLightbox('#myImg');
</script>
```

## API instance

| Anggota | Keterangan |
|--------|------------|
| `show()` | Membuka lightbox (memuat `src` atau `data-src`) |
| `hide()` | Menutup dan mereset zoom |
| `zoomIn()` / `zoomOut()` | Zoom langkah demi langkah |
| `resetZoom()` | Kembali ke zoom 1 dan posisi tengah |
| `downloadImage()` | Memicu unduhan (bergantung pada kebijakan same-origin / CORS URL) |
| `destroy()` | Menghapus overlay, listener global, dan mengembalikan scroll body |

Properti internal yang sering dipakai: `targetId`, `currentZoom`, `minZoom` (0.5), `maxZoom` (3), `zoomStep` (0.2).

## Cuplikan route (template)

Contoh pola seperti `templates/lightbox.js`:

```javascript
export async function lightbox(page, route) {
  route.register(page, async (routeName, container, routeMeta, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    container.innerHTML = `
      <h1>Judul halaman</h1>
      <img id="a" src="/drive/a.png" alt="A" class="nexa-lightbox" style="max-width:300px" />
      <img id="b" src="/drive/b.png" alt="B" class="nexa-lightbox" style="max-width:300px" />
    `;
    NXUI.Lightbox.initAll('.nexa-lightbox');
  });
}
```

## Perilaku `initAll`

- Elemen yang sudah punya `data-nexa-initialized` dilewati (hindari double init).
- Jika `<img>` tanpa `id`, modul menambahkan `id` acak `nexa-lightbox-xxxxxxxxx`.
- Mengembalikan **array** instance `NexaLightbox`.

## Font Awesome ganda

Modul menyisipkan `@import` Font Awesome ke `#nexa-lightbox-styles`. Jika halaman Anda sudah memuat Font Awesome, stylesheet bisa terunduh dua kali; opsional: hapus `@import` di dalam modul dan andalkan CSS global proyek.

## File terkait

- `assets/modules/Lightbox/NexaLightbox.js` — implementasi
- `assets/modules/Nexa.js` — re-export `Lightbox` / `NexaLightbox`
- `templates/lightbox.js` — contoh penggunaan di route
