# NexaScroll (`NXUI.Scroll` / `NXUI.NexaScroll`)

Manajemen **posisi scroll** (`scrollTop` / `scrollLeft`) untuk elemen berkelas **`.nx-scroll*`** — menyimpan ke **localStorage** (debounced), memulihkan saat **`init`**, dan mendukung elemen yang ditambahkan dinamis lewat **MutationObserver**.

- **Sumber:** `assets/modules/Dom/NexaScroll.js`
- **Ekspor NexaUI:** `NXUI.NexaScroll` dan alias **`NXUI.Scroll`** (`Nexa.js`).
- **Gaya scrollbar:** `assets/modules/assets/css/scroll.css` (di-import dari `assets/modules/nexa.css`).

---

## Opsi konstruktor

| Opsi | Tipe | Default | Keterangan |
|------|------|---------|------------|
| `storageKey` | `string` | `'nexaScrollPositions'` | Key **satu** JSON objek di `localStorage` yang menyimpan semua posisi per **elementId**. |
| `debounceDelay` | `number` | `100` | Jeda (ms) sebelum menulis ke `localStorage` setelah event `scroll`. |
| `autoInit` | `boolean` | `true` | Jika `true`, **`init()`** dipanggil di akhir konstruktor. Untuk konten route SPA, sering **`autoInit: false`** lalu **`init()`** setelah DOM siap. |

---

## Kelas yang dipindai

**`findScrollElements()`** memakai `document.querySelectorAll` untuk setiap entri berikut (gabungan kelas visual + perilaku scroll):

- `.nx-scroll`, `.nx-scroll-x`
- `.nx-scroll-rounded`, `.nx-scroll-hidden`, `.nx-scroll-autohide`
- `.nx-scroll-table`, `.nx-scroll-smooth`, `.nx-scroll-fade`, `.nx-scroll-shadow`
- `.nx-scroll-thin`, `.nx-scroll-thick`
- `.nx-scroll-primary`

**`.nx-scroll`** — overflow vertikal; **`.nx-scroll-x`** — overflow horizontal (lihat `scroll.css`).

---

## Identitas elemen (`elementId`)

- Jika elemen punya atribut **`id`**, itu dipakai sebagai kunci penyimpanan.
- Jika tidak, dibuat string bentuk `nx-scroll-{classes}-{top}-{left}` dari posisi dan kelas (kurang stabil jika layout berubah).

**Praktik:** beri **`id` unik** pada setiap area scroll yang ingin posisinya diingat.

---

## Alur `init()`

1. **`findScrollElements()`** — isi `Map` internal `scrollElements`.
2. **`restoreScrollPositions()`** — baca `localStorage`, set `scrollTop` / `scrollLeft` (penundaan ~50 ms per elemen).
3. **`attachScrollListeners()`** — pasang `scroll` pada tiap elemen terdaftar.
4. **`observeDOM()`** — satu **`MutationObserver`** pada `document.body` (subtree). Jika ada node baru yang memuat / merupakan elemen scroll, setelah 100 ms dipanggil lagi **`findScrollElements`**, **`restoreScrollPositions`**, **`attachScrollListeners`**.

**Catatan implementasi:** pemanggilan ulang dari observer dapat menambah **listener `scroll` ganda** pada elemen yang sama (tidak menghapus listener lama). Untuk halaman yang sering mengganti DOM besar, pertimbangkan satu instance global atau perbaikan internal (deduplikasi listener / disconnect observer).

**`destroy()`** — mengosongkan timer debounce dan `Map` elemen; **tidak** memutus **`MutationObserver`** yang dibuat di `init()`.

---

## Penyimpanan `localStorage`

Satu string JSON di bawah **`storageKey`**, bentuk:

```json
{
  "id-elemen-a": { "scrollTop": 120, "scrollLeft": 0, "timestamp": 1730000000000 },
  "id-elemen-b": { "scrollTop": 0, "scrollLeft": 40, "timestamp": 1730000001000 }
}
```

---

## Method utama

| Method | Keterangan |
|--------|------------|
| `init()` | Rangkaian find → restore → attach → observe. |
| `findScrollElements()` | Daftarkan ulang elemen dari kelas scroll (menimpa entri `Map` dengan `id` sama). |
| `restoreScrollPositions()` | Terapkan posisi tersimpan ke elemen yang ada di `Map`. |
| `attachScrollListeners()` | Tambah handler `scroll` (debounce → `saveScrollPosition`). |
| `addElement(element, customId?)` | Daftarkan satu elemen manual; opsional **`customId`** sebagai kunci. |
| `removeElement(elementId)` | Hapus dari `Map`, timer terkait, dan entri di JSON `localStorage`. |
| `getScrollPosition(elementId)` | `{ scrollTop, scrollLeft }` atau `null`. |
| `setScrollPosition(elementId, { scrollTop?, scrollLeft? })` | Set DOM lalu **`saveScrollPosition`**. |
| `getElements()` | Array `{ id, element, className, position }`. |
| `getSavedPositions()` | Objek mentah dari `localStorage` (parse aman). |
| `clearSavedPositions()` | **`removeItem(storageKey)`** — menghapus **semua** posisi untuk key ini. |
| `destroy()` | Hapus timer + kosongkan `Map` (observer tetap hidup). |
| `enable()` / `disable()` | Mengatur flag **`on`**; **penyimpanan scroll saat ini tetap memanggil `saveScrollPosition`** dari jalur debounce — jika Anda mengandalkan pemutusan simpan, periksa perilaku di versi NexaScroll Anda atau bungkus sendiri. |

---

## SPA / route dinamis

1. Isi **`innerHTML`** / pasang elemen scroll dulu.
2. Buat **`new NXUI.Scroll({ storageKey: '...', autoInit: false })`** lalu **`init()`** agar tidak memindai dokumen sebelum konten ada.
3. Bedakan **`storageKey`** per aplikasi atau per fitur agar tidak bentrok (mis. demo: `nexa-scroll-demo`).

---

## Contoh singkat

```js
const sc = new NXUI.Scroll({
  storageKey: "myAppScroll",
  debounceDelay: 200,
  autoInit: false,
});

// Pastikan ada elemen dengan class .nx-scroll dan id stabil, lalu:
sc.init();

// Opsional manual:
// sc.addElement(document.querySelector("#panel"), "panel");

const pos = sc.getScrollPosition("panel");
sc.setScrollPosition("panel", { scrollTop: 0 });
```

Markup:

```html
<div id="panel" class="nx-scroll" style="max-height: 200px">
  <!-- konten panjang -->
</div>
```

---

## Demo di proyek

- **Route:** `/scroll`
- **Modul:** `templates/scroll.js` — panel vertikal & horizontal, **`storageKey: 'nexa-scroll-demo'`**, tombol reset **`clearSavedPositions`** dan scroll atas **`setScrollPosition`**.

---

## Lihat juga

- `assets/modules/Nexa.js` — registrasi **`Scroll`** / **`NexaScroll`**.
