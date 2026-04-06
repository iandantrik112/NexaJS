# Dokumentasi NexaTables

Panduan komponen tabel data di NexaJS: **`NexaTables`** untuk menampilkan array objek (misalnya dari `NXUI.Storage`) dengan **pencarian teks**, **sort kolom**, dan **paginasi**, berlapis styling **`table.css`**. Kode sumber: `assets/modules/Tables/NexaTables.js`, stylesheet: `assets/modules/Tables/table.css`.

**Catatan:** ini **bukan** plugin jQuery DataTables pihak ketiga; perilaku serupa (filter/sort/halaman) diimplementasikan di NexaTables dan memakai kelas CSS proyek (mis. `nx-table`, `nx-table-pagination`).

**Alur belajar:** baca akses API (bagian 1) → opsi konstruktor (bagian 3) → integrasi Storage (bagian 4) → contoh rute (bagian 6).

## Daftar isi

- [1. Akses API](#1-akses-api)
- [2. Stylesheet (ensureTableStylesheet)](#2-stylesheet-ensuretablestylesheet)
- [3. Opsi konstruktor](#3-opsi-konstruktor)
  - [3.1 Contoh opsi export](#31-contoh-opsi-export)
  - [3.2 Column Menu (Column Filter Dropdown)](#32-column-menu-column-filter-dropdown)
  - [3.3 Row Actions (Actions dropdown)](#33-row-actions-actions-dropdown)
  - [3.4 Inline editing (editing + onEdit)](#34-inline-editing-editing--onedit)
    - [Cuplikan `select`](#cuplikan-select)
    - [Cuplikan `search`](#cuplikan-search)
- [4. Data dari NXUI.Storage](#4-data-dari-nxuistorage)
  - [4.1 `fromStorage` — GET / POST / `api`](#41-fromstorage--get--post--api)
  - [4.2 `fromBuckets` — query `app` (alias / join)](#42-frombuckets--query-app-alias--join)
- [5. Metode instance](#5-metode-instance)
  - [5.1 mount](#51-mount)
  - [5.2 fromStorageResponse (static)](#52-fromstorageresponse-static)
  - [5.3 setData](#53-setdata)
  - [5.4 destroy](#54-destroy)
- [6. Contoh referensi di proyek](#6-contoh-referensi-di-proyek)
- [7. Kelas CSS utama (`table.css`)](#7-kelas-css-utama-tablecss)
- [8. Checklist troubleshooting](#8-checklist-troubleshooting)

---

## 1. Akses API

Setelah `assets/modules/Nexa.js` dimuat, komponen tersedia di objek global **`NXUI`**:

| Akses | Keterangan |
| ----- | ---------- |
| `NXUI.NexaTables` | Kelas utama |
| `NXUI.Tables` | Alias ke `NexaTables` |
| `NXUI.ensureTableStylesheet` | Memuat `table.css` sekali |
| `NXUI.rowsFromStorageResponse` | Helper normalisasi respons → array baris |

Import modul (tanpa `NXUI`):

```javascript
import {
  NexaTables,
  ensureTableStylesheet,
  rowsFromStorageResponse,
} from "/assets/modules/Tables/NexaTables.js";
```

---

## 2. Stylesheet (ensureTableStylesheet)

`table.css`, **`assets/modules/assets/css/pagination.css`**, dan **`assets/modules/assets/css/form.css`** direferensikan dengan URL stabil lewat **`import.meta.url`**:

- Tabel: `new URL("./table.css", import.meta.url).href`
- Paginasi (kelas `.pagination`, `.page-item`, `.page-link`): `new URL("../assets/css/pagination.css", import.meta.url).href`
- Form (folder `assets/css`, mis. `.form-nexa-control-sm` pada kotak cari): `new URL("../assets/css/form.css", import.meta.url).href` — dipisah dari `Form/form.css` lewat pengecekan `link[href*="assets/css/form.css"]`
- `ensureTableStylesheet()` menunggu `NXUI.NexaStylesheet.Dom`, lalu memuat hanya file yang belum ada di DOM (masing-masing dideduplikasi lewat `link[href*="…"]`)

Memanggil **`mount()`** pada instance akan otomatis `await ensureTableStylesheet()` terlebih dahulu. Anda juga bisa memanggil manual:

```javascript
await NXUI.ensureTableStylesheet();
```

Modul juga menjalankan prefetch ringan saat dievaluasi (`setTimeout` + `catch` kosong), mirip pola form/modal.

---

## 3. Opsi konstruktor

| Properti | Tipe | Default | Keterangan |
| -------- | ---- | ------- | ---------- |
| `container` | `string` \| `Element` | wajib | Selector CSS atau elemen induk; isinya diganti saat `mount()` |
| `data` | `Array<object>` | `[]` | Baris tabel; setiap baris biasanya objek datar |
| `columns` | `{ key, title? }[]` | otomatis | Jika kosong, kunci kolom diambil dari gabungan kunci objek pada data |
| `pageSize` | `number` | `10` | Baris per halaman (minimum 1) |
| `searchable` | `boolean` | `true` | Kotak pencarian (filter substring pada nilai sel) |
| `sortable` | `boolean` | `true` | Klik header untuk sort; kelas `nx-table-sortable` |
| `tableClass` | `string` | kelas `nx-table`… | Gabungan kelas pada elemen `<table>` |
| `wrapperClass` | `string` | `""` | Opsional pada pembungkus luar |
| `caption` | `string` | `""` | Teks `<caption>` |
| `formatCell` | `(value, key, row) => string` | — | Override render teks sel; harus mengembalikan string yang aman untuk `textContent` |
| `paginationActiveBg` | `string` \| `null` | `null` | Warna latar tombol halaman aktif (`.page-link.active`), mengalahkan `pagination.css` |
| `paginationActiveBorder` | `string` \| `null` | (sama dengan bg jika tidak diisi) | Warna border tombol aktif |
| `paginationActiveColor` | `string` \| `null` | `#ffffff` saat override dipakai | Warna teks tombol aktif |
| `export` | `object` \| `false` | `undefined` | Tombol download (client-side). Opsi: `enabled`, `types` (`csv`/`json`/`xlsx`/`pdf`), `include` (`filtered`/`all`/`page`), `fileName` |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Opsi nilai dropdown "entries per page" |
| `spinner` | `object` \| `false` | `undefined` | Spinner sederhana saat load `storage.model` di `mount()`; shape mirip opsi `spinner` di `NexaDom` (`enabled`, `centerScreen`, `type`, `size`, `color`, `position`, `message`) |
| `columnMenu` | `boolean` | `true` | Menampilkan dropdown menu per kolom (filter `Contains`, sort, dan clear filter) |
| `actions` | `object` \| `false` | `undefined` | Menampilkan dropdown aksi per baris. Opsi: `view`, `add`, `edit`, `delete`, `export`, `import`, `print`, `share` |
| `actionsColumnTitle` | `string` | `"Actions"` | Judul kolom aksi saat `actions` aktif |
| `onAction` | `(action, row) => void` \| `null` | `null` | Callback saat aksi baris diklik (mis. `"edit"`) |
| `editing` | `{ [key: string]: { type, options?, min?, max?, step? } }` | `undefined` | Mengaktifkan **inline editing per kolom** (klik sel → editor muncul). Lihat tipe lengkap di bagian 3.4 |
| `onEdit` | `(key, value, row) => void` \| `null` | `null` | Dipanggil **hanya saat nilai benar-benar berubah** setelah inline edit; cocok untuk kirim update ke server |
| `rowNumberColumn` | `boolean` | `false` | Jika `true`, menambah kolom pertama penomoran (1, 2, … mengikuti halaman aktif dan `pageSize`) |
| `rowNumberColumnTitle` | `string` | `"No."` | Judul header kolom nomor urut |
| `hideColumnKeys` | `string[]` | `[]` | Kunci kolom yang **disembunyikan** di tabel dan file ekspor (nilai tetap ada di objek baris), mis. `['id']` untuk data sensitif |

### 3.1 Contoh opsi export

Cuplikan penggunaan tombol download/export:

```javascript
const t = new NXUI.NexaTables({
  container: "#wrap",
  data: rows,
  caption: "Inventori",
  pageSize: 10,
  export: {
    enabled: true,
    types: ["csv", "json", "xlsx", "pdf"], // default: ["csv"]
    include: "filtered",     // filtered | all | page
    fileName: "Inventori",   // tanpa ekstensi; otomatis diberi tanggal
  },
});
await t.mount();
```

### 3.2 Column Menu (Column Filter Dropdown)

Jika `columnMenu: true` (default), header tabel yang sortable akan menampilkan ikon menu per kolom. Klik ikon tersebut untuk:

- Filter kolom berbasis **Contains** (dengan saran nilai dari data tabel)
- **Sort Ascending** (A–Z / kecil → besar) dan **Sort Descending** (Z–A / besar → kecil)
- **Clear sort** (menghapus sort + filter kolom yang sedang aktif)

**Praktik:** untuk data besar dari API, **batasi jumlah baris** di sisi kode (mis. `.slice(0, 50)`) sebelum memasukkan ke `data` agar tetap responsif di klien.

### 3.3 Row Actions (Actions dropdown)

Jika `actions` diaktifkan (minimal salah satu item `true`), NexaTables akan menambahkan kolom terakhir bernama `actionsColumnTitle` dan menampilkan dropdown aksi per baris.

Item aksi yang tersedia:
- `view`, `add`, `edit`, `delete`
- `export`, `import`
- `print`, `share`

Cara menangani klik:
- Jika Anda mengisi `onAction(actionKey, row)`, callback ini yang dipanggil.
- Jika tidak ada `onAction`, NexaTables akan dispatch event `nexa-table-action` dari container dengan `detail: { action, row }`.

Contoh:

```javascript
const t = new NXUI.NexaTables({
  container: "#wrap",
  data: rows,
  caption: "User",
  actions: { edit: true, delete: true, view: true },
  onAction: (action, row) => {
    console.log("action:", action, "row:", row);
  },
});
await t.mount();
```

### 3.4 Inline editing (editing + onEdit)

NexaTables mendukung **inline editing per kolom**: sel tampil sebagai teks biasa, lalu saat diklik berubah menjadi editor sesuai tipe. Setelah user selesai (Enter / blur / pilih opsi), sel kembali menjadi teks, dan callback **`onEdit`** dipanggil bila nilai berubah.

Properti `editing` berada di level konstruktor:

```javascript
const t = new NXUI.NexaTables({
  container: "#wrap",
  data: [
    {
      id: 1,
      text: "Halo",
      number: 10,
      aktif: true,
      role: "admin",
      notes: "Catatan awal",
      email: "user@example.com",
      tel: "08123456789",
      url: "https://example.com",
      date: "2026-04-03",
      time: "10:30",
      color: "#ff0000",
      level: 50,
    },
  ],
  columns: [
    { key: "id", title: "ID" },
    { key: "text", title: "text" },
    { key: "number", title: "number" },
    { key: "aktif", title: "checkbox" },
    { key: "role", title: "select" },
    { key: "notes", title: "textarea" },
    { key: "email", title: "email" },
    { key: "tel", title: "tel" },
    { key: "url", title: "url" },
    { key: "date", title: "date" },
    { key: "time", title: "time" },
    { key: "color", title: "color" },
    { key: "level", title: "range" },
  ],
  editing: {
    text: { type: "text" },
    number: { type: "number", min: 0, max: 100, step: 1 },
    aktif: { type: "checkbox" },
    role: {
      type: "select",
      options: ["admin", "editor", "viewer"],
    },
    notes: { type: "textarea", rows: 3 },
    email: { type: "email" },
    tel: { type: "tel" },
    url: { type: "url" },
    date: { type: "date" },
    time: { type: "time" },
    color: { type: "color" },
    level: { type: "range", min: 0, max: 100, step: 5 },
  },
  onEdit: (key, value, row) => {
    console.log("NexaTables row edit:", key, value, row);
    // Di sini biasanya Anda kirim PATCH/PUT ke server.
  },
});
await t.mount();
```

#### Tipe editor yang didukung

Untuk setiap kunci di `editing`, Anda dapat memilih salah satu tipe berikut:

- `text`
- `number` (+ `min`, `max`, `step`)
- `checkbox`
- `select` (+ `options: string[] | { value, label? }[]`; otomatis di-upgrade ke **Select2** bila `NXUI.initSelect2` tersedia, dan event `onEdit` juga di-trigger dari `select2:select`)
- `textarea` (+ `rows`)
- `search` — **bukan** `<input type="search">`; memakai **Select2** (`NXUI.initSelect2`) seperti `select`. Opsi default = **nilai unik kolom yang sama** dari `data`; bisa override lewat `options` (sama seperti `select`).
- `email`
- `password`
- `tel`
- `url`
- `date`
- `datetime-local`
- `time`
- `color`
- `range` (+ `min`, `max`, `step`)

**Catatan perilaku penting:**

- Editor **hanya muncul saat sel diklik**, dan hanya untuk kolom yang terdaftar di `editing`.
- `onEdit` dan event DOM `nexa-table-edit` **hanya dipanggil jika nilai baru berbeda** dari nilai awal; klik tanpa perubahan tidak membuat server sibuk.
- Untuk tipe `select` dan `search`, komit dilakukan saat **value berubah**; ketika Select2 aktif, handler tambahan memastikan `onEdit` tetap terpanggil saat user memilih opsi dari dropdown Select2.

#### Cuplikan `select`

`options` wajib diisi. String sederhana atau pasangan `value` / `label` untuk teks berbeda di dropdown:

```javascript
editing: {
  role: {
    type: "select",
    options: ["admin", "editor", "viewer"],
  },
  kategori: {
    type: "select",
    options: [
      { value: "1", label: "Elektronik" },
      { value: "2", label: "Furniture" },
    ],
  },
},
```

Jika jQuery + Select2 + `NXUI.initSelect2` tersedia, elemen `<select>` di-upgrade ke Select2; pemilihan opsi memicu `onEdit` saat nilai berubah.

#### Cuplikan `search`

Bukan `<input type="search">`, melainkan **`<select>` + Select2** seperti `select`. Jika **`options` tidak diisi**, opsi diisi otomatis dari **nilai unik** kolom tersebut di `data`:

```javascript
const rows = [
  { id: 1, tag: "query 1" },
  { id: 2, tag: "query 2" },
];

const t = new NXUI.NexaTables({
  container: "#wrap",
  data: rows,
  columns: [
    { key: "id", title: "ID" },
    { key: "tag", title: "Tag" },
  ],
  editing: {
    // Dropdown berisi "query 1" dan "query 2" (unik dari kolom tag)
    tag: { type: "search" },
  },
  onEdit: (key, value, row) => {
    console.log(key, value, row);
  },
});
await t.mount();
```

Override opsi secara manual (sama bentuknya dengan `select`):

```javascript
editing: {
  tag: {
    type: "search",
    options: ["query 1", "query 2", "lainnya"],
  },
},
```

---

## 4. Data dari NXUI.Storage

Helper mengubah berbagai bentuk respons menjadi **satu array** untuk `data`:

| Input | Hasil |
| ----- | ----- |
| Array | dikembalikan apa adanya |
| `{ data: [...] }` | `data` |
| `{ response: [...] }` | `response` |
| `{ rows: [...] }` | `rows` |
| Lain / null | `[]` |

Contoh:

```javascript
const res = await NXUI.Storage().example().news({ news: 1 });
const rows = NXUI.rowsFromStorageResponse(res);

const t = new NXUI.NexaTables({
  container: "#wrap",
  data: rows,
  caption: "News",
});
await t.mount();
```

Atau satu langkah dengan **factory static**:

```javascript
const t = await NXUI.NexaTables.fromStorageResponse("#wrap", res, {
  caption: "News",
  pageSize: 8,
});
```

### 4.1 fromStorage — GET / POST / api

Memanggil **`NXUI.Storage`** dengan pola yang sama seperti di route (`about.js`, dll.), lalu memasuki **`fromStorageResponse`**:

| `load.method` | Pemanggilan | Catatan |
| ------------- | ----------- | ------- |
| `get` (default) | `Storage().get(load.url \|\| load.path, load.options \|\| load.query)` | Baca data (GET) |
| `post` | `Storage().post(load.path \|\| load.url, load.body, load.fetchOptions)` | Body POST ke path relatif `baseURL` |
| `api` | `Storage().api(load.path \|\| load.apiPath, load.body \|\| load.apiBody)` | POST ke **`baseAPI`** (sama seperti `Storage().api("test", { … })`) |

Opsi **`acceptObjectAsRow`**: jika `true` dan array baris dari respons masih kosong, satu objek di `data` (atau objek respons tunggal) dibungkus menjadi **satu baris** — berguna untuk respons API berbentuk `{ status, data: { … } }`.

```javascript
const t = await NXUI.NexaTables.fromStorage(
  "#wrap",
  { method: "get", url: NEXA.typicode },
  { caption: "Typicode", pageSize: 25 }
);

const t2 = await NXUI.NexaTables.fromStorage(
  "#wrap2",
  {
    method: "api",
    path: "test",
    body: { title: "Halo", slug: "halo" },
    acceptObjectAsRow: true,
  },
  { caption: "API test" }
);
```

**Bandingkan** dengan **`NexaDom`** + `storage: { model, query }` di `templates/exsampel.js`: NexaDom memuat data lewat query builder dan **merender HTML** lewat `render`; NexaTables memakai **array baris** yang sama (setelah GET/POST) dan komponen tabel bawaan.

Contoh dengan spinner saat load model:

```javascript
const t = new NXUI.NexaTables({
  container: "#nx-tables-demo-storage-post",
  storage: {
    model: "demo",
    query: (q) => q.whereNotNull("id"),
  },
  caption: "Storage().model('demo') + query — pola seperti NexaDom",
  pageSize: 1,
  spinner: {
    enabled: true,
    centerScreen: false,
    type: "overlay",
    size: "medium",
    color: "#CB2F2F",
    position: "center",
    message: "Memuat data demo…",
  },
});
await t.mount();
```

### 4.2 fromBuckets — query `app` (alias / join)

Untuk **federated / bucket** dengan objek **`app`** (`alias`, `aliasNames`, `tabelName`, `operasi`, `access`, `id`, …) — pola yang sama seperti pemanggilan `Storage().buckets(app).get({ limit })` di halaman lain — gunakan:

`NexaTables.fromBuckets(container, app, getOptions?, tableOptions?)`

Ini memanggil **`NXUI.Storage().buckets(app).get(getOptions)`**, lalu **`fromStorageResponse`**. Normalisasi baris mengikuti helper yang sama (`response`, `data`, dll.).

**Perbedaan dengan NexaDom (`exsampel.js`):** di sana `config: false` dan **`storage: { model, query }`** memakai **satu model** + fungsi `query(q)` pada builder. Di **`fromBuckets`**, seluruh definisi join/alias ada di objek **`app`**; tidak ada `query: (q) => …` di opsi NexaTables.

```javascript
const app = {
  alias: [
    "user.status AS status",
    "user.nama AS nama",
    "user.jabatan AS jabatan",
    "user.avatar AS avatar",
    "user.id AS id",
  ],
  aliasNames: ["status", "nama", "jabatan", "avatar", "id"],
  tabelName: ["user"],
  where: false,
  group: false,
  order: false,
  operasi: {
    user: {
      type: "single",
      index: "",
      aliasIndex: "user",
      keyIndex: 261760199266386,
      target: "",
      condition: "",
      aliasTarget: "",
      keyTarget: "",
    },
  },
  access: "public",
  id: 1,
};

const t = await NXUI.NexaTables.fromBuckets("#wrap", app, { limit: 50 }, {
  caption: "User (buckets)",
  pageSize: 8,
  columns: [
    { key: "id", title: "ID" },
    { key: "nama", title: "Nama" },
    { key: "status", title: "Status" },
  ],
});
```

Lihat juga **`templates/tables.js`** (bagian demo nomor 4).

---

## 5. Metode instance

### 5.1 mount

Async: memuat stylesheet, mengosongkan `container`, membangun filter (jika `searchable`), `<table>`, thead/tbody, paginasi, lalu mengikat event. **Panggil sekali** setelah konstruktor.

### 5.2 fromStorageResponse (static)

`NexaTables.fromStorageResponse(container, storageResult, options?)` — menggabungkan `rowsFromStorageResponse(storageResult)` + `new NexaTables({ …, data })` + `mount()`. Mengembalikan `Promise<NexaTables>`.

### 5.3 setData

`setData(rows)` mengganti seluruh dataset, mereset sort ke default, halaman ke 0, dan me-render ulang (tanpa membangun ulang DOM luar).

### 5.4 destroy

`destroy()` melepas listener, mengosongkan `container`. Panggil saat navigasi SPA atau sebelum mengganti isi halaman agar tidak menumpuk handler.

---

## 6. Contoh referensi di proyek

| Lokasi | Isi |
| ------ | --- |
| `templates/tables.js` | Rute `/tables`: tabel statis, `fromStorage` (GET typicode), `storage.model` + `query`, **`fromBuckets(app)`** untuk query bucket, lalu `columns` + `formatCell` |
| `templates/about.js` | Contoh `fromStorageResponse` untuk hasil Storage dan query model |

Pastikan di `App.js` array `route` menyertakan string rute yang mengarah ke template tersebut (mis. `'tables'`).

---

## 7. Kelas CSS utama (`table.css`)

Hanya ringkasan; detail ada di file CSS.

- **Dasar:** `.nx-table`, `.nx-table-bordered`, `.nx-table-striped`, `.nx-table-hover`
- **Ukuran:** `.nx-table-compact`, `.nx-table-sm`, `.nx-table-md`, …
- **Komponen NexaTables:** `.nx-table-filter` + `.form-nexa-group.form-nexa-icon`, `.form-nexa-control-sm`, `.nx-table-sortable th.sortable`, `.nx-table-pagination`, `.pagination`
- **Tema / variabel:** `:root` (warna border, teks), mode gelap ada bagian `body.dark-mode-grid …`

Override tampilan: oper opsi `tableClass` / `wrapperClass` pada konstruktor.

---

## 8. Checklist troubleshooting

| Gejala | Yang dicek |
| ------ | ---------- |
| Container kosong / error "tidak ditemukan" | Selector ada di DOM **setelah** `innerHTML`; urutan: isi HTML dulu, baru `new NexaTables({ container: "#id" })` |
| Tanpa gaya | `Nexa.js` sudah load; tunggu `await ensureTableStylesheet()` atau `await mount()` |
| Kolom salah atau kosong | Pastikan objek baris konsisten; set `columns` eksplisit bila kunci antar-baris beda |
| Sort/filter aneh pada objek bersarang | Nilai non-primitif di-stringkan (`JSON.stringify`) untuk pencarian; gunakan `formatCell` untuk tampilan |
| Performa lambat | Kurangi jumlah baris di klien; pertimbangkan paginasi sisi server untuk dataset besar |
| Duplikat event setelah pindah halaman | Panggil `destroy()` pada instance lama di handler route |

---

*Dokumen ini selaras dengan implementasi `NexaTables.js` di repositori proyek; jika API berubah, sesuaikan cuplikan kode di atas dengan sumber aktual.*
