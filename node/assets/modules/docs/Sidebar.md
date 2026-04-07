# NexaSidebar (`NXUI.Sidebar` / `NXUI.NexaSidebar`)

Menu sidebar bertingkat dengan **section** yang bisa dibuka/ditutup, **item aktif** mengikuti URL (opsional), **persist** state buka/tutup ke **localStorage**, dan **penyesuaian** tautan serta label kategori.

- **Sumber:** `assets/modules/Sidebar/NexaSidebar.js`
- **Gaya:** `assets/modules/Sidebar/NexaSidebar.css` (di-bundle lewat `assets/modules/nexa.css` dengan `@import url("./Sidebar/NexaSidebar.css")`; bisa juga dimuat dinamis lewat `initSidebar` / `NexaStylesheet`).
- **Ekspor NexaUI:** `NXUI.NexaSidebar`, alias **`NXUI.Sidebar`**, plus utilitas **`NXUI.initSidebar`**, **`NXUI.getSidebarInstance`**, **`NXUI.updateSidebarPath`**.
- **Alias modul:** `SidebarMenu` (named export, sama dengan `NexaSidebar`).

---

## Format data

Objek **`data`** memetakan **nama kategori** (key string) ke **array item**:

```js
{
  nama_kategori: [
    { name: "Label tampilan", slug: "segment-url" },
    // …
  ],
  kategori_lain: [ /* … */ ],
}
```

- **`name`** — teks yang ditampilkan (di-escape untuk XSS).
- **`slug`** — dipakai **`linkGenerator`** (default: digabung dengan `basePath`) dan pencocokan **item aktif** terhadap `location.pathname`.

Kategori **tanpa item** (array kosong / falsy) dirender sebagai judul statis (`<h3>`), bukan section collapsible.

---

## Opsi konstruktor

| Opsi | Tipe | Default | Keterangan |
|------|------|---------|------------|
| `container` | `HTMLElement` \| `string` | — | **Wajib.** Elemen atau selector query (harus ada di DOM saat konstruktor jalan). |
| `data` | `Object` | — | **Wajib.** Struktur kategori → item (lihat atas). |
| `basePath` | `string` | `'/docs'` | Awalan path untuk **`defaultLinkGenerator`**: `` `${basePath}/${item.slug}` ``. Untuk root SPA sering `''` → hasil `/slug` setelah normalisasi slash. |
| `activeClass` | `string` | `'active-grid'` | Class tambahan pada `<a class="nx-nav-item">` yang aktif. |
| `expandedByDefault` | `string[]` | `[]` | Key kategori yang mulai dalam keadaan **terbuka**. |
| `linkGenerator` | `(item, basePath) => string` | bawaan | Ganti jika Anda butuh URL absolut SPA, query string, atau hindari **`NEXA.url`** (lihat catatan SPA di bawah). |
| `categoryFormatter` | `(key) => string` | bawaan | Label heading kategori dari **key** objek (default: kapital + ganti `_` jadi spasi). |
| `persistState` | `boolean` | `true` | Simpan daftar section terbuka ke **localStorage**. |
| `storageKey` | `string` | `'nexa-sidebar-state'` | Key JSON state; **bedakan per sidebar** jika beberapa instance. |
| `autoDetectActive` | `boolean` | `true` | Setelah load, cocokkan **`currentPath`** dengan tautan/slug untuk menandai aktif dan membuka section terkait. |

**Alur konstruktor:** set `currentPath` dari `window.location.pathname` → muat state tersimpan → **`detectActiveItem()`** (jika `autoDetectActive`).

---

## Generator tautan bawaan dan SPA

**`defaultLinkGenerator`** membentuk path relatif lalu, jika **`window.NEXA.url`** ada dan tautan bukan `http(s)`, menempelkan path ke **base aplikasi/API** tersebut.

Untuk **SPA NexaRoute** (tautan seperti `/beranda`, `/ds/data`), sering **tidak** ingin memakai **`NEXA.url`** agar `href` tetap path situs. Solusi:

- Set **`linkGenerator`** eksplisit, misalnya:

```js
linkGenerator: (item) => `/${String(item.slug).replace(/^\//, "")}`,
```

- Atau pastikan **`NEXA.url`** mengarah ke origin frontend yang sama dengan path route (jarang dipakai untuk menu docs murni).

---

## Method instance

| Method | Keterangan |
|--------|------------|
| `init()` | Memanggil **`render()`** (generate HTML + pasang listener). Kembalikan `this`. |
| `render()` | Isi ulang `container.innerHTML` dari `data` + state expanded/aktif. |
| `toggleSection(categoryKey)` | Buka/tutup satu kategori; simpan state jika `persistState`. |
| `setActiveItem(categoryKey, item)` | Set item aktif, buka kategori, re-render. |
| `updatePath(path)` | Set `currentPath`, reset aktif, **`detectActiveItem()`** (jika diaktifkan), re-render. Penting saat **navigasi SPA** tanpa reload. |
| `updateData(newData)` | Ganti `data`, deteksi aktif, re-render. |
| `expandAll()` / `collapseAll()` | Buka semua kategori / tutup kecuali `expandedByDefault`; simpan state. |
| `destroy()` | Kosongkan **`container.innerHTML`**. Listener lama ikut hilang karena node diganti; tidak ada unregister manual terpisah. |

---

## Utilitas global: `initSidebar`, `getSidebarInstance`, `updateSidebarPath`

Modul menyediakan **`SidebarManager`** (singleton): satu instance sidebar “global” dengan **muat CSS sekali** dan **sinkron path** saat navigasi.

| API | Keterangan |
|-----|------------|
| **`await NXUI.initSidebar(options, maxRetries?, retryDelay?)`** | Memuat CSS (via `NXUI.NexaStylesheet.Dom(['NexaSidebar.css'])` dari konteks modul Sidebar), lalu **`SidebarManager.init(options)`**. Jika container belum ada di DOM, **retry** (default 10 × 200 ms). |
| **`NXUI.getSidebarInstance()`** | Instance `NexaSidebar` aktif di manager, atau `null`. |
| **`NXUI.updateSidebarPath(path)`** | Delegasi ke `sidebarManager.updatePath(path)`. |

**Event yang didengar manager (setelah init berhasil):**

- **`popstate`** — `updatePath(window.location.pathname)`.
- **`nxui:routeChange`** — jika `event.detail.path` ada, `updatePath(detail.path)`.

**Pertimbangan SPA**

- **`initSidebar`** cocok untuk **satu** sidebar persisten (mis. di layout dokumen di luar `#main`).
- Untuk sidebar **hanya di satu route** yang di-render ulang di **`#main`**, lebih aman memakai **`new NXUI.Sidebar(...).init()`** instance **lokal** dan **`destroy()`** saat route dibuang, agar tidak bentrok dengan singleton manager (lihat demo proyek).

---

## Markup & kelas CSS (ringkas)

Elemen **container** sebaiknya memakai kelas **`nx-sidebar`** agar sesuai lebar, border, scroll (lihat **`NexaSidebar.css`**).

Di dalamnya, komponen menghasilkan:

- **`.nx-sidebar-section`** — grup kategori.
- **`.section-header-grid`** — tombol toggle (ikon **Material Symbols** `chevron_right`).
- **`.nx-sidebar-nav`** / **`.collapsed`** — daftar link tersembunyi saat collapsed.
- **`.nx-nav-item`** — tautan; ditambah **`activeClass`** jika aktif.

**Catatan layout:** gaya bawaan **`.nx-sidebar`** memakai **`position: fixed`** (mis. di bawah header global). Jika sidebar ditempatkan **di dalam kontainer route** (`#main`), override CSS (posisi relatif, tinggi auto) seperti di **`templates/sidebar.js`**.

---

## Contoh: instance lokal di route

```js
const data = {
  utama: [
    { name: "Beranda", slug: "beranda" },
    { name: "Grid", slug: "grid" },
  ],
};

const el = document.querySelector("#sidebar-root");

const sb = new NXUI.Sidebar({
  container: el,
  data,
  basePath: "",
  storageKey: "app-sidebar-demo",
  expandedByDefault: ["utama"],
  linkGenerator: (item) => `/${item.slug}`,
});

sb.init();
```

Setelah navigasi programmatic, panggil **`sb.updatePath(location.pathname)`** (atau andalkan **`nxui:routeChange`** jika memakai **`initSidebar`**).

---

## Demo di proyek ini

- **Route:** `/sidebar`
- **Modul:** `templates/sidebar.js` — data demo, **`linkGenerator`** khusus SPA, **`destroy()`** sebelum render ulang route yang sama, override CSS **fixed** untuk sidebar di dalam **`#main`**.

---

## Lihat juga

- `assets/modules/Nexa.js` — pendaftaran `Sidebar`, `initSidebar`, dll.
- `docs/NexaJS.md` — alur route SPA dan event **`nxui:routeChange`**.
