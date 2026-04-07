# NexaLink (`NXUI.Link` / `LinkDefault` / `NexaLink`)

Modul untuk **mencegah reload penuh** pada tautan di dalam suatu kontainer (**event delegation**), memperbarui URL lewat **`history.pushState`**, mengirim event **`link:navigate`**, dan (lewat **`NexaLinkUI`**) **fetch** halaman same-origin lalu menyisipkan fragmen HTML ke area konten — opsional dengan **spinner** dari `NexaSpinner.js`.

- **Sumber:** `assets/modules/Link/NexaLink.js`
- **Spinner:** `assets/modules/Dom/NexaSpinner.js` (impor langsung di `NexaLink.js`; global juga **`NXUI.spinner`** dari `Nexa.js`).
- **Ekspor modul:** `NexaLink`, `LinkDefault`, `NexaLinkUI`.
- **Global NexaUI:** `NXUI.Link` → kelas **`NexaLinkUI`**; `NXUI.NexaLink` → **`NexaLink`**; `NXUI.LinkDefault` → fungsi **`LinkDefault`**.

---

## Kelas `NexaLink`

Kelas rendah untuk **satu** pasangan `(selector, root)` dan **satu** listener klik di **root** (bubbling). Hanya elemen yang cocok **`element.closest(selector)`** dan merupakan **`HTMLAnchorElement`** yang diproses.

| Method | Keterangan |
|--------|------------|
| `constructor(selector, root?)` | `selector` string CSS (mis. `"a"`, `"summary a"`). `root` = `ParentNode` atau string selector (default `document`). |
| `getBase()` | Menyelesaikan `root` ke node (`querySelector` jika string). |
| `attach(options?)` | Pasang delegation. `options.onNavigate(detail)` dipanggil untuk setiap klik tautan yang lolos filter awal (sebelum `preventDefault`). Mengembalikan `this`. |

### Perilaku klik (ringkas)

- **Diabaikan:** klik non-primer, modifier (Ctrl/Meta/Shift/Alt), `target="_blank"`, `download`, `href` kosong, skema `javascript:` / `mailto:` / `tel:` / `data:`.
- **Tidak di-intersep SPA:** `href` yang **hanya** fragmen lokal (`#id`) — perilaku hash native tetap jalan.
- **Same-origin path:** `preventDefault`, `history.pushState` dengan `pathname + search + hash`, lalu `window.dispatchEvent(new Event("link:navigate"))`.
- **Origin lain:** tidak `preventDefault` (navigasi biasa).

### Root tidak ada

Jika `root` berupa string selector dan `document.querySelector` mengembalikan `null`, atau `selector` kosong / bukan string, **`attach()`** tidak memasang listener dan mengembalikan `this` — tidak ada error di konsol.

### Urutan callback

Untuk tautan yang lolos filter tombol/modifier/`target`/`download`, **`onNavigate(detail)`** dipanggil **dulu** (dengan `NexaLinkNavigateDetail`), lalu barulah aturan berikutnya (mis. abaikan `href` kosong, biarkan `#…` native, atau `pushState` same-origin). Jadi listener global **`nexa:link`** (di `NexaLinkUI`) juga menerima klik yang pada akhirnya tidak di-`preventDefault` (mis. origin asing).

---

## Fungsi `LinkDefault(selector, root?, options?)`

Panggilan singkat: `new NexaLink(selector, root).attach(options)`.

- **Argumen `root`:** urutan sama seperti API utilitas lain — **selector tautan dulu**, **root** kedua (bisa string `#id` atau node).
- **`options.onNavigate(detail)`:** sama seperti di `attach`.

---

## Kelas `NexaLinkUI` (`new NXUI.Link(options?)`)

API berantai untuk menu / dok: **`onClick`**, **`onDefault`**, **`info()`**, **`load(href)`**.

### Konstruktor — `NexaLinkUIOptions`

| Opsi | Tipe | Default | Keterangan |
|------|------|---------|------------|
| `loadContentSelectors` | `string[]` | `["#dokumentasi .nx-doc-content", ".nx-doc-content"]` | Daftar selector dicoba **berurutan** saat **`load()`** pada dokumen hasil parse **dan** dokumen aktif. |
| `loadContentSelector` | `string` | — | Jika diisi, menggantikan array di atas dengan **satu** selector. |
| `spinner` | objek \| `false` \| `null` | — | Lihat bagian **Spinner**; `false` / `null` / `{ enabled: false }` mematikan spinner di `load()`. |

### `onDefault(first, second?)`

Memasang **`NexaLink`** internal dan mengisi **`onNavigate`** agar:

1. Menyimpan klik terakhir ke **`info()`**,
2. Memicu **`CustomEvent("nexa:link", { detail })`**,
3. Memanggil callback **`onClick`** yang didaftarkan lewat **`onClick(fn)`** (atau `onClick` di objek opsi kedua).

**Resolusi argumen (ringkas):**

- Satu argumen, string **`#...`** atau **`....`:** dianggap **root** kontainer; selector tautan default **`"a"`**.
- Satu argumen lain (mis. `"summary a"`): selector tautan; root **`document`**.
- Dua string: jika yang kedua terlihat seperti root (`#` / `.` di awal), dipetakan sebagai **`(selector, root)`** (kompatibel `LinkDefault`); jika yang pertama root-like, **`(root, selector)`**.

Objek kedua (bukan `Element`/`Document`): bisa berisi `selector`, `root`, `onClick` untuk override titik ini saja.

### `onClick(fn)`

Menyimpan callback; idealnya dipanggil **sebelum** **`onDefault(...)`** agar ikut terpasang. Mengembalikan `this`.

### `info()`

Objek **`NexaLinkNavigateDetail`** klik terakhir, atau **`null`** jika belum ada klik.

### `load(href)`

| Aspek | Keterangan |
|-------|------------|
| URL | Hanya **same-origin**; `href` yang hanya `#...` atau invalid → keluar awal (no-op). |
| **Halaman yang sama (hanya beda hash)** | Jika **`pathname` + `search`** URL tujuan **sama persis** dengan **`window.location.pathname` + `window.location.search`**, **tidak ada `fetch`**, spinner **tidak** ditampilkan; hanya **`scrollIntoView({ behavior: "smooth" })`** ke elemen dengan **`id`** dari hash (setelah `decodeURIComponent`). Berguna untuk tautan seperti `/docs/.../nexa-form#fm-config` saat konten sudah di halaman ini — setelah klik, **`NexaLink`** sudah memperbarui URL lewat **`pushState`**. |
| Fetch | `GET` dengan `credentials: "same-origin"`, header `Accept: text/html` — hanya jika path/query **berbeda** dari dokumen saat ini. |
| Konten | Parse HTML; ambil node pertama yang cocok **`loadContentSelectors`** di response dan di **`document`**; salin **`innerHTML`** dari response ke halaman aktif. Jika salah satu node tidak ditemukan, swap konten dilewati (judul/hash scroll tetap dijalankan setelah fetch jika fetch terjadi). |
| Judul | Jika ada `<title>` di response, **`document.title`** diperbarui. |
| Hash | Setelah swap (atau cabang same-page di atas), jika URL punya `#id`, scroll ke elemen tersebut. |
| Spinner | Jika opsi spinner aktif: **`show()`** sebelum fetch, **`destroy()`** di **`finally`** — **hanya** pada jalur yang benar-benar melakukan fetch. |
| Skrip | Konten yang disisipkan lewat **`innerHTML`** **tidak** menjalankan `<script>` — sama seperti perilaku browser standar. |

#### Pola integrasi (mis. `app.js`)

Umumnya: **`onClick`** memanggil **`link.load(info.href)`** setiap klik same-origin yang sudah di-`pushState`. Karena **`load()`** mengenali halaman yang sama, anchor dalam satu dokumen **tidak** memicu fetch berulang.

```javascript
link
  .onClick((info) => {
    if (info.href) {
      link.load(info.href).catch((err) => console.error("Menu fetch:", err));
    }
  })
  .onDefault("#nx-js-doc-menu");
```

Pastikan root **`#nx-js-doc-menu`** (atau selector Anda) **ada** di DOM halaman yang memuat skrip; jika tidak, **`attach`** tidak memasang listener (lihat *Root tidak ada*).

### Perbandingan path

Perbandingan memakai string **`pathname` + `search`** apa adanya. Jika server Anda memperlakukan `/foo` dan `/foo/` sebagai halaman sama, pastikan tautan di menu konsisten agar tidak memicu fetch ganda.

---

## Objek `NexaLinkNavigateDetail`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `href` | `string` | Nilai atribut `href` (trim). |
| `element` | `HTMLAnchorElement` | Elemen `<a>` yang menjadi target klik (setelah `closest`). |
| `text` | `string` | `textContent` anchor (trim). |
| `event` | `MouseEvent` | Event klik asli. |

---

## Spinner (`NexaLinkUISpinnerOptions`)

Diteruskan ke **`nexaSpinner()`** (`Dom/NexaSpinner.js`) setelah dinormalisasi.

| Opsi | Default perilaku |
|------|------------------|
| `enabled` | Jika `false`, spinner tidak dipakai. |
| `centerScreen` | Default **`true`**: `target` → **`body`**, `type` default **`overlay`** (jika tidak diisi). |
| `centerScreen: false` | `target` dari **`spinner.target`**, atau **`#dokumentasi`**; `type` default **`inline`**. |
| `target` | Selector container (utama untuk inline). |
| `type` | `overlay` \| `inline` \| `button` |
| `size` | `small` \| `medium` \| `large` |
| `color` | Warna border “top” loader (default spinner biru `#007bff` jika tidak diisi). |
| `position` | `center` \| `top` \| `bottom` (untuk inline). |
| `message` | Teks opsional di bawah loader. |

**Catatan:** spinner **inline** pada elemen yang sama dengan target **`load()`** akan **hilang** saat **`innerHTML`** konten diganti; **`destroy()`** tetap dipanggil untuk membersihkan instance.

---

## Event global

| Event | Kapan | `detail` |
|-------|--------|----------|
| `nexa:link` | Setiap navigasi klik yang memicu pipeline `NexaLinkUI` | Sama dengan `NexaLinkNavigateDetail` |
| `link:navigate` | Setelah `pushState` dari **`NexaLink.attach`** | Event biasa tanpa `detail` kustom |

Aplikasi Anda bisa mendengarkan **`link:navigate`** atau **`nexa:link`** untuk menyelaraskan router SPA (mis. `NexaRoute`) dengan perubahan URL.

**Tombol mundur / maju browser:** `NexaLink` **tidak** mendaftarkan listener **`popstate`**. Setelah navigasi hanya lewat `pushState`, histori berubah tetapi muat ulang konten dari histori menjadi tanggung jawab aplikasi (mis. di `popstate` panggil `load()` dengan `location.href` atau sesuaikan UI).

---

## Contoh

### Menu dok + fetch konten + spinner

```javascript
const link = new NXUI.Link({
  loadContentSelectors: ["#dokumentasi .nx-doc-content", ".nx-doc-content"],
  spinner: {
    enabled: true,
    centerScreen: false,
    target: "#dokumentasi .nx-doc-content",
    type: "inline",
    size: "medium",
    color: "#CB2F2F",
    message: "Memuat…",
  },
});

link
  .onClick((info) => {
    if (info.href) {
      link.load(info.href).catch((err) => console.error("Menu fetch:", err));
    }
  })
  .onDefault("#nx-js-doc-menu");
```

### Hanya intercept tautan (tanpa `NexaLinkUI`)

```javascript
import { LinkDefault } from "./assets/modules/Link/NexaLink.js";

LinkDefault("a", "#sidebar", {
  onNavigate: (d) => console.log(d.href),
});
```

atau global:

```javascript
NXUI.LinkDefault("summary a", "#menu");
```

---

## `attach` ulang / instance

Memanggil **`onDefault`** lagi akan melepas listener lama di base yang sama (internal **`removeEventListener`**) lalu memasang yang baru.

---

## Berkas terkait

- `assets/modules/Nexa.js` — agregasi `Link`, `NexaLink`, `LinkDefault`.
- `assets/modules/Dom/NexaSpinner.js` — implementasi spinner.
