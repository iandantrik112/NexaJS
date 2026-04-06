# NexaFilter (`NXUI.Filter` / `NXUI.NexaFilter`)

Utilitas **format string** dan **template ringan**: filter berantai (`|`), placeholder `{field|filter:args}`, **ternary**, dan **`{switch}`**. Implementasi: `assets/modules/Dom/NexaFilter.js`; ekspor global: `NXUI.NexaFilter` dan alias **`NXUI.Filter`** (`Nexa.js`).

---

## Daftar isi

- [Cuplikan dari demo (`templates/filter.js`)](#cuplikan-dari-demo-templatesfilterjs)
- [Method inti](#method-inti)
- [Sintaks `processTemplate`](#sintaks-processtemplate)
- [Ternary & switch](#ternary--switch)
- [Daftar filter di `Filter()` (ringkas)](#daftar-filter-di-filter-ringkas)
- [Keamanan (XSS)](#keamanan-xss)
- [Lihat juga](#lihat-juga)

---

## Cuplikan dari demo (`templates/filter.js`)

Demo route **`/filter`** memuat instance, objek **`data`**, tabel hasil **`F.Filter(...)`**, lalu beberapa string template yang diproses dengan **`processTemplate`** dan disisipkan lewat **`innerHTML`** pada `#nexa-filter-processed-mount`.

### Inisiasi & data

```javascript
const F = new NXUI.Filter();

const data = {
  name: "nexa pengguna",
  amount: 9876543.2,
  desc: "Teks panjang untuk truncate dan demonstrasi slug dari judul yang ada spasi.",
  isoDate: "2026-04-04T10:30:00.000Z",
  status: "active",
  tags: ["satu", "dua", "tiga"],
  qty: 12,
  htmlSnippet: "<b>tebal</b> dan <i>miring</i>",
  bytes: 1536000,
  phoneRaw: "081234567890",
  emptyLabel: "",
  score: 0.875,
};
```

### `Filter()` langsung + `parseFilters`

Di demo, banyak baris dibangun sebagai `[label, F.Filter(...)]` lalu di-render ke tabel (nilai sel di-escape untuk tampilan aman). Contoh pola:

```javascript
F.Filter("Hello", "upper", []);
F.Filter(50000, "currency", ["IDR"]);
F.Filter(data.desc, "truncate", ["40"]);
F.Filter(data.isoDate, "indonesian_date", []);
JSON.stringify(F.parseFilters("lower|truncate:8"));
// [{"name":"lower","args":[]},{"name":"truncate","args":["8"]}]
```

### `processTemplate` — placeholder, ternary, switch

String template utama (disederhanakan tanpa atribut `style` panjang) sesuai demo:

```javascript
const templateBlock = `
  <p><strong>Nama:</strong> {name|capitalize}</p>
  <p><strong>Harga:</strong> {amount|decimal_to_rupiah}</p>
  <p><strong>Ringkas:</strong> {desc|truncate:55}</p>
  <p><strong>Slug:</strong> {name|slug}</p>
  <p><strong>Tanggal:</strong> {isoDate|indonesian_date}</p>
  <p><strong>Tag:</strong> {tags|join: · }</p>
  <p><strong>Status (badge):</strong> {status|badge}</p>

  <p>{status === 'active' ? 'Kondisi: aktif' : 'Kondisi: non-aktif'}</p>
  <p>{qty > 10 ? 'Stok cukup' : 'Stok tipis'}</p>

  {switch status}
  {case 'active'}<span>Aktif</span>{/case}
  {case 'pending'}Menunggu{/case}
  {default}Status lain{/default}
  {/switch}
`;

const rendered = F.processTemplate(templateBlock, data);
```

### Rantai filter + keluaran HTML (`nl2br`, `icon`)

```javascript
const chainTpl =
  "<p><strong>Rantai:</strong> {name|lower|truncate:12}</p>";
const chainOut = F.processTemplate(chainTpl, data);

const htmlTpl = `
  <p><strong>nl2br:</strong> {staticLines|nl2br}</p>
  <p><strong>icon:</strong> {staticIcon|icon:home,20px}</p>
`;
const htmlData = {
  ...data,
  staticLines: "Baris satu\nBaris dua",
  staticIcon: "home",
};
const htmlOut = F.processTemplate(htmlTpl, htmlData);

// Cuplikan demo: gabung ke satu mount (hanya untuk data statis / terpercaya)
mount.innerHTML = rendered + chainOut + htmlOut;
```

### Kerangka route

```javascript
export async function filter(page, route) {
  route.register(page, async (routeName, container, routeMeta, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    if (!NXUI?.Filter) return;

    const F = new NXUI.Filter();
    // … data, directRows / templateBlock, lalu:
    const mount = container.querySelector("#nexa-filter-processed-mount");
    if (mount) mount.innerHTML = rendered + chainOut + htmlOut;
  });
}
```

**Catatan:** demo **tidak** memanggil semua cabang `Filter()` di `NexaFilter.js`; lihat `switch (filterName)` di file sumber untuk daftar lengkap.

---

## Method inti

| Method | Keterangan |
|--------|------------|
| **`Filter(value, filterName, args?)`** | Satu filter; nama **case-insensitive**; **`args`** array string. Method memakai **huruf F besar**. |
| **`parseFilters(filterString)`** | Memecah `a|b:1,2|c` → `[{ name, args }, …]`. Pemisah antar-filter: **`|`**; argumen: **`nama:arg1,arg2`** (satu `:` pertama memisahkan nama filter dari argumen). |
| **`processTemplate(template, data)`** | Urutan: **ternary** → **switch** → placeholder `{…}`. Path data: **titik** (`user.email`). |
| **`processTernary` / `processSwitch`** | Dipanggil dari `processTemplate`; bisa dipakai terpisah. |

---

## Sintaks `processTemplate`

- **`{field}`** — nilai `data.field` (nested: `{user.email}`).
- **`{field|f1|f2:arg1,arg2}`** — filter dari kiri ke kanan; argumen dipisah **koma** setelah **`:`** pertama pada nama filter yang berargumen.

Placeholder yang mengandung `?`, `===`, `>`, dll. dilewati oleh pengganti placeholder biasa (agar tidak bentrok dengan ternary).

---

## Ternary & switch

**Ternary** (contoh): `{status === 'active' ? 'Aktif' : 'Tidak'}` — lihat regex di `processTernary` di `NexaFilter.js`.

**Switch:**

```text
{switch namaField}
{case 'a'} isi A {/case}
{default} lainnya {/default}
{/switch}
```

---

## Daftar filter di `Filter()` (ringkas)

Nama mengikuti **`filterName.toLowerCase()`**. Kelompok: teks (`upper`, `lower`, `slug`, `truncate`, `nl2br`, …), angka (`currency`, `decimal_to_rupiah`, `number_format`, …), tanggal (`date`, `indonesian_date`, `time_ago`, …), array (`join`, `split`, `first`, `last`, `length`), encoding (`escape`, `json_encode`, `base64_encode`, …), util (`phone`, `mask`, `badge`, `icon`, …). **`md5`** saat ini **placeholder** (mengembalikan input). Nama tidak dikenal: nilai dikembalikan apa adanya.

---

## Keamanan (XSS)

Filter seperti **`badge`**, **`nl2br`**, **`ellipsis`**, **`icon`** mengeluarkan **HTML**. Jangan set hasil `processTemplate` ke **`innerHTML`** jika `data` berisi input pengguna tanpa sanitasi.

---

## Lihat juga

- `templates/filter.js` — demo interaktif route **`/filter`**
- `assets/modules/Nexa.js` — **`Filter`** / **`NexaFilter`**
