# NexaSortable (`NXUI.Sortable` / `NXUI.NexaSortable`)

Daftar yang bisa **diurutkan ulang** dengan **HTML5 Drag and Drop** (`dragstart` / `drop` / …). Setelah item dipindah, urutan baru dibaca dari DOM, **`data-index`** pada `<li>` diperbarui, lalu dipanggil **callback** opsional dan **`CustomEvent`** di `document`.

- **Sumber:** `assets/modules/Dom/NexaSortable.js`
- **Ekspor NexaUI:** `NXUI.NexaSortable` dan alias **`NXUI.Sortable`** (`Nexa.js`).

---

## Syarat markup

1. **Container** — elemen dengan **`id`** sama dengan opsi **`containerId`** (biasanya `<ul>` atau `<ol>`).
2. **Item** — setiap baris **`li`** harus memiliki **`draggable="true"`**.
3. **Isi nilai urutan** — di dalam tiap `li`, sediakan elemen anak dengan class **`itemClass`** (default **`sortable-item`**).  
   Urutan string diambil dari:
   - atribut **`value`** pada elemen itu jika ada, atau
   - **`textContent`** yang sudah di-**trim** dari elemen tersebut.  
   Jika tidak ada node dengan **`itemClass`**, dipakai **`value`** / teks dari **`li`** itu sendiri.

Contoh minimal:

```html
<ul id="sortable-list">
  <li draggable="true" data-index="0">
    <span class="sortable-item" value="a">Satu</span>
  </li>
  <li draggable="true" data-index="1">
    <span class="sortable-item" value="b">Dua</span>
  </li>
</ul>
```

---

## Opsi konstruktor

| Opsi | Tipe | Default | Keterangan |
|------|------|---------|------------|
| `containerId` | `string` | `'sortable-list'` | **`id`** elemen pembungkus daftar (harus unik di dokumen). |
| `itemClass` | `string` | `'sortable-item'` | Class pada node di dalam `li` yang menyimpan label/`value` urutan. |
| `eventKey` | `string` | `'sortableOrder'` | Awalan nama event: event yang dipancarkan = **`{eventKey}Reordered`**. |
| `logPrefix` | `string` | `'Sortable'` | Awalan teks pada **`console.log`** di `saveNewOrder` / `getCurrentOrder`. |

---

## Alur pemakaian

```js
const s = new NXUI.Sortable({
  containerId: "my-list",
  itemClass: "sortable-item",
  eventKey: "myList",
  logPrefix: "MyList",
});

s.onCallback((newOrder) => {
  // newOrder: string[] sesuai urutan DOM
});

s.initSortable();
```

- **`initSortable()`** — mencari container, mengikat listener ke setiap **`li[draggable="true"]`** di dalamnya, menyimpan **`originalData`**, memanggil **`addStyles()`**.
- **`onCallback(fn)`** — menyimpan fungsi; dipanggil di **`saveNewOrder`** dengan array urutan baru. Mengembalikan **`this`** (bisa di-chain sebelum **`initSortable`**).

---

## Setelah urutan berubah

**`saveNewOrder(newOrder)`** (dipanggil dari **`updateDataIndexes`** setelah **drop** yang valid):

1. Log ke konsol (dengan **`logPrefix`**).
2. Memancarkan di **`document`**:

```js
new CustomEvent(`${eventKey}Reordered`, {
  detail: { newOrder },
});
```

Contoh: `eventKey: 'sortableOrder'` → event **`sortableOrderReordered`**.

3. Memanggil **callback** jika sudah di-set lewat **`onCallback`**.

**`getCurrentOrder()`** — membaca ulang urutan dari DOM (logika sama dengan pemetaan **`newOrder`**), **log** ke konsol, mengembalikan **`string[]`**. Jika container tidak ada, mengembalikan **`[]`**.

---

## Gaya yang disuntikkan (`addStyles`)

Pada **`initSortable()`**, jika belum ada elemen **`#${containerId}-styles`**, sebuah **`<style>`** ditambahkan ke **`document.head`** berisi:

- cursor **`move`** untuk **`.${itemClass}`** dan **`li[draggable="true"]`**
- kelas **`.dragging`** (opacity)
- kelas **`.drag-over`** (latar + border putus-putus)

**Penting:** selector **`li[draggable="true"]`** di CSS dan di **`handleDrop`** (pembersihan kelas **`drag-over`**) bersifat **global** untuk seluruh dokumen, **bukan** dibatasi ke dalam `#containerId`. Jika satu halaman punya beberapa daftar sortable atau `li` lain yang draggable, gaya / pembersihan bisa saling memengaruhi. Untuk isolasi penuh, pertimbangkan fork/CSS tambahan atau satu daftar draggable per halaman.

---

## Method ringkas

| Method | Keterangan |
|--------|------------|
| `initSortable()` | Pasang listener; injeksi style sekali per `containerId`. |
| `onCallback(callback)` | Set callback `(newOrder: string[]) => void`; return `this`. |
| `getCurrentOrder()` | Baca urutan saat ini dari DOM; log + return array. |

Tidak ada **`destroy()`** resmi: memanggil **`initSortable()`** berulang pada DOM yang sama akan **menambah listener ganda** pada `li` yang sama. Untuk SPA, setelah mengganti **`innerHTML`** container, **node lama hilang** sehingga listener ikut terbuang — aman membuat instance baru dan **`initSortable()`** lagi pada markup baru.

---

## Demo di proyek

- **Route:** `/sortable`
- **Modul:** `templates/sortable.js` — daftar contoh, **`eventKey: 'nexaSortableDemo'`** → event **`nexaSortableDemoReordered`**, **`onCallback`** memperbarui tampilan teks urutan.

---

## Lihat juga

- `assets/modules/Nexa.js` — registrasi **`Sortable`** / **`NexaSortable`**.
