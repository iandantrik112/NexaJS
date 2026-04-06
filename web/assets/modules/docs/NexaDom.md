# NexaDom - Dokumentasi

## Daftar isi

- [Deskripsi](#nexadom-deskripsi)
- [Fitur utama](#nexadom-fitur)
- [Instalasi & penggunaan](#nexadom-instalasi)
- [Konfigurasi options](#nexadom-konfigurasi)
  - [Spinner loading (NexaSpinner)](#nexadom-spinner)
  - [Sumber data: `storage` (NexaModels)](#nexadom-storage)
  - [Struktur `config` (queryConfig)](#nexadom-queryconfig)
- [Methods API](#nexadom-methods)
- [Contoh lanjutan (search, filter, custom loader)](#nexadom-contoh-lanjutan)
- [StorageData & StorageModelData](#nexadom-storage-loaders)
- [Catatan penting (detail)](#nexadom-catatan-detail)
- [Error handling](#nexadom-error)
- [Lifecycle](#nexadom-lifecycle)
- [Best practices](#nexadom-best)
- [Route & fragmen HTML: `NXUI.html` + `hydrate` (NexaForge)](#nexadom-route-html-hydrate)
- [Referensi NexaForge — fitur di `Dom/NexaForge.js`](#nexadom-nexaforge-ref)

---

<a id="nexadom-deskripsi"></a>

## 📋 Deskripsi

`NexaDom` adalah kelas JavaScript yang menyediakan komponen pagination fleksibel untuk menampilkan data dengan berbagai fitur seperti pencarian, filter, sorting, dan navigasi halaman. Komponen ini dirancang untuk digunakan di berbagai file dan dapat diintegrasikan dengan sistem storage yang ada.

<a id="nexadom-fitur"></a>

## ✨ Fitur Utama

- ✅ **Pagination** - Navigasi halaman dengan kontrol First, Prev, Next, Last
- ✅ **Pencarian (Search)** - Pencarian real-time dengan debounce (300ms)
- ✅ **Filter** - Filter data berdasarkan field tertentu
- ✅ **Sorting** - Sort data ascending/descending dengan toggle
- ✅ **Items Per Page** - Konfigurasi jumlah item per halaman (disimpan di localStorage)
- ✅ **State Management** - Menyimpan state halaman di localStorage
- ✅ **Custom Render** - Template rendering kustom untuk data
- ✅ **Auto Setup** - Setup otomatis untuk search dan sort listeners
- ✅ **Loading States** - Indikator loading saat data dimuat (Bootstrap di pagination jika spinner nonaktif)
- ✅ **Spinner (NexaSpinner)** - Indikator loading opsional (`NXUI.spinner` / `NexaSpinner.js`) saat init, ganti halaman, pencarian, sort, filter, items per halaman, refresh, dan load awal
- ✅ **Error Handling** - Penanganan error yang baik
- ✅ **Auto Numbering** - Penomoran otomatis dengan property `no` pada setiap item
- ✅ **Sumber data `storage` (opsional)** - Query builder tabel SQL lewat `NXUI.Storage().model("tabel")` (NexaModels), dengan hook `where` / `join` lewat `storage.query`

<a id="nexadom-instalasi"></a>

## 🚀 Instalasi & Penggunaan

### Import

```javascript
const dataDom = new NXUI.NexaDom({ ... });
```

### Penggunaan Dasar (Tanpa Render Function)

```javascript
// ✅ Query Configuration
const app = {
    alias: [
        "user.status AS status",
        "user.nama AS nama", 
        "user.jabatan AS jabatan",
        "user.avatar AS avatar",
        "user.id AS id"
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
            keyTarget: ""
        }
    },
    access: "public"
};

// ✅ Inisialisasi NexaDom
const dataDom = new NXUI.NexaDom({
    container: '#dataContainer',
    pagination: '#itempagination',
    sortOrder: 'ASC',
    sortBy: 'id',
    paginationinfo: "#info",
    searchElement: "#itemsearch",
    searchFields: ['nama'],
    order: 5,
    config: app  // ✅ Pass config object
});

// ✅ Akses data langsung via response property
let template = "";
dataDom.response.forEach((user) => {
    template += `
        <div class="user-item">
            <h3>${user.nama}</h3>
            <p>Jabatan: ${user.jabatan}</p>
        </div>
    `;
});

// ✅ Return template dengan HTML structure
return `
    <input type="search" id="itemsearch" class="form-control">
    <div id="dataContainer">
        ${template}
    </div>
    <div id="itempagination"></div>
    <div id="info"></div>
`;
```

### Penggunaan dengan Render Function (Optional)

```javascript
const dataDom = new NXUI.NexaDom({
    container: '#dataContainer',
    pagination: '#pagination',
    order: 10,
    config: {
        alias: ['user.nama AS nama', 'user.email AS email'],
        aliasNames: ['nama', 'email'],
        tabelName: ['user'],
        operasi: { user: 'SELECT' }
    },
    render: (dataArray) => {
        // ✅ dataArray sudah include property 'no' untuk nomor urut
        return dataArray.map(item => `
            <div>
                <span>${item.no}</span>
                <span>${item.nama}</span>
                <span>${item.email}</span>
            </div>
        `).join('');
    }
});
```

<a id="nexadom-konfigurasi"></a>

## ⚙️ Konfigurasi Options

### Constructor Options

| Parameter | Tipe | Default | Deskripsi |
|-----------|------|---------|-----------|
| `pagination` / `elementBy` | string | `'#pagination'` | Selector untuk container pagination |
| `container` | string | `'#dataContainer'` | Selector untuk container data |
| `paginationinfo` | string | `null` | Selector untuk menampilkan info pagination |
| `searchElement` | string | `null` | Selector untuk input search |
| `sortClickElement` / `sortCklik` | string | `null` | Selector untuk tombol toggle sort |
| `render` | function | `null` | Function untuk render template custom, menerima `dataArray` |
| `itemsPerPage` / `order` | number | `10` | Jumlah item per halaman |
| `maxVisiblePages` | number | `5` | Maksimal halaman yang ditampilkan di pagination |
| `dataLoader` | function | `StorageData` | Function untuk load data |
| `onPageChange` | function | `null` | Callback saat halaman berubah `(currentPage, data)` |
| `onAfterRender` | function | `null` | Callback setelah render selesai `(data, container)` |
| `searchKeyword` | string | `''` | Keyword pencarian awal |
| `searchFields` | array | `[]` | Array field yang akan di-search |
| `filterValue` | string | `''` | Nilai filter |
| `filterField` | string | `''` | Field untuk filter |
| `sortBy` | string | `'id'` | Field untuk sorting |
| `sortOrder` | string | `'DESC'` | Urutan sorting ('ASC' atau 'DESC') |
| `showFirstLast` | boolean | `true` | Tampilkan tombol First/Last |
| `showPrevNext` | boolean | `true` | Tampilkan tombol Prev/Next |
| `showInfo` | boolean | `true` | Tampilkan info pagination |
| `config` | object | `{}` | Konfigurasi query untuk dataLoader default `StorageData` (disimpan sebagai queryConfig) |
| `storage` | object | — | Alternatif sumber data: query builder SQL / NexaModels — lihat [Sumber data: opsi `storage`](#nexadom-storage) |
| `spinner` | object \| `false` | lihat [Spinner](#nexadom-spinner) | Loading indicator NexaSpinner; `false` sama dengan menonaktifkan |

**Catatan Penting:**
- Gunakan `config` (bukan `queryConfig`) saat inisialisasi
- Gunakan `order` (bukan `itemsPerPage`) untuk jumlah item per halaman
- `render` function adalah **optional** - bisa akses data langsung via `dataDom.response`
- Jika tidak menggunakan `render`, akses data via `dataDom.response` setelah instance dibuat
- `render` function akan menerima array data yang sudah include property `no` untuk nomor urut
- **`storage`** dan **`config`** (untuk `StorageData` / Office) adalah dua jalur berbeda — pilih salah satu sesuai backend: tabel SQL langsung vs `executeOperation` Office

<a id="nexadom-spinner"></a>

### Spinner loading (`spinner` / NexaSpinner)

NexaDom dapat menampilkan **loading indicator** lewat **`NexaSpinner.js`** (di bundle global sebagai **`NXUI.spinner`**). Implementasi memakai **depth counter** sehingga beberapa operasi async bersarang tidak menutup spinner terlalu cepat.

**Default (jika `spinner` tidak diisi):**

| Properti | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `enabled` | boolean | `true` | Aktif/nonaktif spinner NexaDom |
| `centerScreen` | boolean | `true` | `true` → overlay layar penuh; `false` → spinner **inline** di dalam `container` |
| `type` | string | `'overlay'` | `'overlay'` \| `'inline'` \| `'button'` — jika `centerScreen: true`, biasanya dipakai `overlay`; jika `centerScreen: false` dan Anda set `overlay`, NexaDom memakai **`inline`** di container |
| `size` | string | `'medium'` | `'small'` \| `'medium'` \| `'large'` |
| `color` | string | `'#007bff'` | Warna arc spinner |
| `position` | string | `'center'` | Untuk `inline`: `'center'` \| `'top'` \| `'bottom'` |
| `message` | string | `''` | Teks opsional di bawah spinner |

**Menonaktifkan:** set `spinner: false` atau `spinner: { enabled: false }`. Jika NexaSpinner **nonaktif**, saat `state.loading` pagination tetap bisa menampilkan **Bootstrap `spinner-border`** di area pagination (perilaku lama).

**Kapan spinner ditampilkan:** `init()`, `goToPage()` (klik pagination), `updateSearch()` → `init`, `performSearch`, `updateFilter`, `updateSort()` → `init`, `updateItemsPerPage`, sort listener (`sortClickElement`), `refresh()` (jika `showLoading === true` — jika spinner aktif memakai NexaSpinner; jika tidak, tetap `showRefreshLoading()` di container), `loadRealDataAndUpdate()` (load awal dari constructor + path async/await). **destroy()** memanggil `destroy()` pada instance spinner internal.

**Referensi kode:** `assets/modules/Dom/NexaSpinner.js`, contoh konfigurasi: `templates/exsampel.js`.

**Contoh:**

```javascript
new NXUI.NexaDom({
  container: "#exsampel-data",
  pagination: "#exsampel-pagination",
  // …
  spinner: {
    enabled: true,
    centerScreen: true,
    type: "overlay",
    size: "medium",
    color: "#CB2F2F",
    position: "center",
    message: "",
  },
});
```

**Kontrol manual (lanjutan):** instance memiliki `showSpinner()` dan `hideSpinner()` — biasanya tidak perlu dipanggil dari luar; gunakan untuk alur kustom.

<a id="nexadom-storage"></a>

### Sumber data: opsi `storage` (NexaModels / tabel SQL)

Tanpa `Office.executeOperation`, Anda bisa memuat baris dari **tabel SQL** memakai query builder **`NXUI.Storage().model(namaTabel)`** (sama seperti di **NexaModels.md** — beda dari **`models("NamaClassPhp")`**).

Saat **`storage.model`** (string) diisi, NexaDom memakai dataLoader internal **`storageModelStorageData`** (tersedia juga di global sebagai **`NXUI.StorageModelData`**).

| Properti di `storage` | Tipe | Deskripsi |
|----------------------|------|-----------|
| **`model`** | `string` | **Wajib** — nama tabel SQL. |
| **`select`** | `string` \| `array` | Opsional — default `"*"`. Setara argumen `.select()` NexaModels. |
| **`query`** | `(q) => q` | Opsional — tambahkan kondisi **tetap** pada builder `q`: misalnya `where`, `join`, `whereNotNull`. Dipanggil **setelah** `select`, **sebelum** filter pencarian NexaDom (`searchKeyword` / `searchFields`) dan **sebelum** `orderBy` dari `sortBy` / `sortOrder`. Dipakai konsisten untuk **count** total dan **data** per halaman. |

**Urutan kondisi di query:** `model` → `select` → **`query(q)`** → (jika ada keyword) pencarian **LIKE** pada `searchFields` — jika lebih dari satu field, kondisi digabung dengan **OR** dalam **satu grup** (supaya aman bersama kondisi dasar dari `query`, misalnya `WHERE id IS NOT NULL AND (title LIKE … OR slug LIKE …)`) → `filter` NexaDom jika ada → `orderBy` → `count` / `get` dengan `limit` & `offset`.

**Contoh:**

```javascript
new NXUI.NexaDom({
  container: "#exsampel-data",
  pagination: "#exsampel-pagination",
  paginationinfo: "#exsampel-info",
  searchElement: "#exsampel-search",
  sortClickElement: "#exsampel-sort",
  order: 5,
  sortBy: "title",
  sortOrder: "ASC",
  searchFields: ["title", "slug"],
  storage: {
    model: "demo",
    // select: ["id", "title", "slug", "deskripsi", "images"],
    query: (q) => q.whereNotNull("id"),
    // query: (q) => q.where("status", "=", 1).leftJoin("lain", "demo.id", "=", "lain.demo_id"),
  },
  render: (dataArray) => { /* … */ },
});
```

<a id="nexadom-queryconfig"></a>

### Config Structure (queryConfig)

#### Struktur Sederhana
```javascript
{
    alias: ['user.nama AS nama', 'user.email AS email'],  // Array alias untuk SELECT
    aliasNames: ['nama', 'email'],                        // Nama alias
    tabelName: ['user'],                                  // Nama tabel
    where: false,                                         // Kondisi WHERE (string atau false)
    group: false,                                         // GROUP BY clause
    order: false,                                         // ORDER BY clause (akan di-override jika sorting aktif)
    operasi: { user: 'SELECT' },                          // Operasi sederhana
    access: 'public',                                     // Access level
    subquery: '',                                         // Subquery jika ada
    subnested: ''                                         // Subnested query jika ada
}
```

#### Struktur Lengkap (dengan operasi detail)
```javascript
{
    alias: [
        "user.status AS status",
        "user.nama AS nama", 
        "user.jabatan AS jabatan",
        "user.id AS id"
    ],
    aliasNames: ["status", "nama", "jabatan", "id"],
    tabelName: ["user"],
    where: false,
    group: false,
    order: false,
    operasi: {
        user: {
            type: "single",           // Type operasi
            index: "",                // Index
            aliasIndex: "user",      // Alias index
            keyIndex: 261760199266386, // Key index
            target: "",               // Target
            condition: "",            // Condition
            aliasTarget: "",          // Alias target
            keyTarget: ""             // Key target
        }
    },
    access: "public",
    id: data.id  // Optional: ID untuk operasi tertentu
}
```

<a id="nexadom-methods"></a>

## 📚 Methods API

### Static Methods

#### `NexaDom.create(options)`
Membuat instance NexaDom dan melakukan inisialisasi secara async.

**Parameters:**
- `options` (object): Konfigurasi options

**Returns:** Promise<NexaDom>

**Example:**
```javascript
const pagination = await NexaDom.create({
    container: '#dataContainer',
    pagination: '#pagination',
    order: 20
});
```

**Catatan:** Biasanya lebih mudah menggunakan `new NexaDom()` langsung karena constructor sudah memanggil `loadRealDataAndUpdate()` secara non-blocking.

### Instance Methods

#### `init()`
Inisialisasi pagination, load data, dan setup event listeners.

**Returns:** Promise<void>

#### `loadData()`
Load data dari dataLoader dengan parameter saat ini.

**Returns:** Promise<void>

#### `goToPage(page)`
Navigasi ke halaman tertentu.

**Parameters:**
- `page` (number): Nomor halaman yang dituju

**Returns:** Promise<void>

**Example:**
```javascript
await dataDom.goToPage(3);
```

#### `updateSearch(searchKeyword, searchFields)`
Update parameter pencarian dan reload data.

**Parameters:**
- `searchKeyword` (string): Keyword pencarian
- `searchFields` (array): Array field yang akan di-search

**Returns:** Promise<void>

**Example:**
```javascript
await dataDom.updateSearch('john', ['nama', 'email']);
```

#### `updateFilter(filterValue, filterField)`
Update parameter filter dan reload data.

**Parameters:**
- `filterValue` (string): Nilai filter
- `filterField` (string): Field untuk filter

**Returns:** Promise<void>

**Example:**
```javascript
await dataDom.updateFilter('active', 'status');
```

#### `updateSort(sortBy, sortOrder)`
Update parameter sorting dan reload data.

**Parameters:**
- `sortBy` (string): Field untuk sorting
- `sortOrder` (string): 'ASC' atau 'DESC'

**Returns:** Promise<void>

**Example:**
```javascript
await dataDom.updateSort('nama', 'ASC');
```

#### `updateItemsPerPage(itemsPerPage)`
Update jumlah item per halaman dan reload data.

**Parameters:**
- `itemsPerPage` (number): Jumlah item per halaman

**Returns:** Promise<void>

**Example:**
```javascript
await dataDom.updateItemsPerPage(25);
```

#### `refresh(showLoading)`
Refresh data pada halaman saat ini.

**Parameters:**
- `showLoading` (boolean): Tampilkan loading indicator (default: true)

**Returns:** Promise<void>

**Example:**
```javascript
await dataDom.refresh();
```

#### `getState()`
Mendapatkan state saat ini.

**Returns:** object

**Example:**
```javascript
const state = dataDom.getState();
// { currentPage: 1, totalCount: 100, totalPages: 10, data: [...], loading: false }
```

#### `getData()`
Mendapatkan data saat ini.

**Returns:** array

**Example:**
```javascript
const data = dataDom.getData();
```

#### `savePageState(page)`
Menyimpan halaman ke localStorage.

**Parameters:**
- `page` (number): Nomor halaman

**Returns:** void

#### `destroy()`
Menghancurkan instance dan membersihkan event listeners (termasuk instance NexaSpinner internal jika ada).

**Returns:** void

**Example:**
```javascript
dataDom.destroy();
```

#### `showSpinner()` / `hideSpinner()`
Menampilkan atau menyembunyikan spinner Nexa sesuai `config.spinner` (hanya jika `enabled !== false`). Dipanggil otomatis oleh operasi load; bisa dipakai manual untuk alur kustom.

**Returns:** void

## 💡 Contoh Penggunaan

Pola **tanpa `render`** dan **dengan `render`** sudah ada di [Instalasi & Penggunaan](#nexadom-instalasi) (subbagian *Penggunaan Dasar* dan *Penggunaan dengan Render Function*). Bagian ini hanya contoh lanjutan.

<a id="nexadom-contoh-lanjutan"></a>

### Contoh 1: Search dan Sort

```javascript
const dataDom = new NXUI.NexaDom({
    container: '#dataContainer',
    pagination: '#pagination',
    paginationinfo: '#paginationInfo',
    searchElement: '#searchInput',
    sortClickElement: '#sortButton',
    order: 20,
    searchFields: ['nama', 'email'],
    sortBy: 'nama',
    sortOrder: 'ASC',
    config: {
        alias: ['user.nama AS nama', 'user.email AS email'],
        aliasNames: ['nama', 'email'],
        tabelName: ['user'],
        operasi: { user: 'SELECT' }
    },
    render: (dataArray) => {
        return dataArray.map(item => `
            <div class="card">
                <div>No: ${item.no}</div>
                <div>Nama: ${item.nama}</div>
                <div>Email: ${item.email}</div>
            </div>
        `).join('');
    },
    onPageChange: (page, data) => {
        console.log('Page changed to:', page);
    },
    onAfterRender: (data, container) => {
        console.log('Data rendered:', data);
        // Initialize other components here
    }
});
```

### Contoh 2: Filter

```javascript
// Setup pagination
const dataDom = new NXUI.NexaDom({
    container: '#dataContainer',
    pagination: '#pagination',
    order: 15,
    config: {
        alias: ['user.nama AS nama', 'user.status AS status'],
        aliasNames: ['nama', 'status'],
        tabelName: ['user'],
        operasi: { user: 'SELECT' }
    },
    render: (dataArray) => {
        return dataArray.map(item => `<div>${item.nama} - ${item.status}</div>`).join('');
    }
});

// Apply filter via event listener
const filterSelect = document.getElementById('statusFilter');
filterSelect.addEventListener('change', async (e) => {
    await dataDom.updateFilter(e.target.value || '', e.target.value ? 'status' : '');
});
```

### Contoh 3: Custom DataLoader

```javascript
async function customDataLoader(limit, offset, searchKeyword, searchFields, filterValue, filterField, sortBy, sortOrder, queryConfig) {
    // Custom logic untuk load data
    const response = await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify({
            limit,
            offset,
            search: searchKeyword,
            sortBy,
            sortOrder
        })
    });
    const data = await response.json();
    
    return {
        totalCount: data.total,
        response: data.items
    };
}

const dataDom = new NXUI.NexaDom({
    container: '#dataContainer',
    pagination: '#pagination',
    dataLoader: customDataLoader,
    render: (dataArray) => {
        return dataArray.map(item => `<div>${item.name}</div>`).join('');
    }
});
```

<a id="nexadom-storage-loaders"></a>

## 🔧 StorageData Function

`StorageData` adalah function default yang digunakan sebagai dataLoader **bila Anda memakai `config`** (alias / operasi / Office). Function ini menggunakan `NXUI.Storage().models("Office").executeOperation(...)` untuk mengambil data.

**⚠️ Catatan:** Function ini hardcoded ke model "Office". Untuk model lain, gunakan custom `dataLoader`, atau gunakan opsi **`storage`** (query builder tabel — lihat [Sumber data: opsi `storage`](#nexadom-storage)).

### Signature

```javascript
async function StorageData(
    limit = 10,
    offset = 0,
    searchKeyword = '',
    searchFields = [],
    filterValue = '',
    filterField = '',
    sortBy = 'id',
    sortOrder = 'DESC',
    queryConfig = {}
)
```

### Returns

```javascript
{
    totalCount: number,  // Total jumlah data
    response: array      // Array data
}
```

### Requirements

- `queryConfig.alias` - Array alias untuk SELECT (required)
- `queryConfig.operasi` - Object operasi untuk setiap tabel (required)

### Error Handling

Jika error, function akan mengembalikan:
```javascript
{
    totalCount: 0,
    response: []
}
```

## 🔧 StorageModelData (`storage.model`)

Loader **`storageModelStorageData`** dipakai otomatis ketika **`storage.model`** diisi. Ekspor modul juga sebagai **`StorageModelData`** (alias **`NXUI.StorageModelData`**).

**Signature** sama dengan `StorageData` (parameter `limit`, `offset`, `searchKeyword`, `searchFields`, `filterValue`, `filterField`, `sortBy`, `sortOrder`, `queryConfig`). Di `queryConfig` internal terdapat **`storageModelTable`**, **`storageModelSelect`**, dan **`storageModelQueryHook`** yang diset dari objek `storage`.

**Returns:** `{ totalCount, response }` — sama seperti `StorageData`.

**Referensi:** **NexaModels.md** (`NXUI.Storage().model("tabel")`), contoh template **`templates/exsampel.js`**. Detail perilaku umum (nomor urut, `response`, callback) ada di [Catatan penting](#nexadom-catatan-detail).

<a id="nexadom-catatan-detail"></a>

## 📝 Catatan Penting

### 1. Nomor Urut Otomatis (`no` property)
Setiap item data akan otomatis mendapatkan property `no` yang berisi nomor urut. Nomor urut ini akan disesuaikan berdasarkan:
- **Tanpa sorting aktif** (sortBy='id' dan belum pernah klik sort): Nomor urut normal (1, 2, 3, ...)
- **Dengan sorting ASC**: Nomor urut dari awal dataset (1, 2, 3, ...)
- **Dengan sorting DESC**: Nomor urut dari akhir dataset (totalCount, totalCount-1, ...)

**Contoh penggunaan di render:**
```javascript
render: (dataArray) => {
    return dataArray.map(item => `
        <div>
            <span>No: ${item.no}</span>
            <span>${item.nama}</span>
        </div>
    `).join('');
}
```

### 2. localStorage Persistence
- Halaman saat ini disimpan di localStorage dengan key: `NexaDom_page_{paginationSelector}`
- Items per page disimpan dengan key: `nexa_tabel_items_per_page_{containerSelector}`
- State akan di-restore saat instance dibuat kembali
- Halaman 1 tidak disimpan (akan dihapus dari localStorage)

### 3. Auto Setup
Setelah inisialisasi, NexaDom akan otomatis:
- Setup search listener jika `searchElement` disediakan (debounce 300ms)
- Setup sort click listener jika `sortClickElement` disediakan
- Update data container saat halaman berubah
- Update pagination info jika `paginationinfo` disediakan
- Load data awal via `loadRealDataAndUpdate()` (non-blocking)

### 4. Global State
NexaDom menyimpan state global di `window.NXUI.currentState`:
```javascript
{
    totalCount: number,
    currentPage: number,
    totalPages: number,
    dataLength: number,
    lastUpdated: string
}
```

Juga menyimpan page info di `window.NXUI.pageInfo`:
```javascript
{
    page: number,
    total: number
}
```

### 5. Callbacks
- `onPageChange(currentPage, data)` - Dipanggil saat halaman berubah
- `onAfterRender(data, container)` - Dipanggil setelah data di-render ke DOM (dengan delay 50-100ms untuk ensure DOM ready)

### 6. Integration dengan EkasticTabel
NexaDom terintegrasi dengan EkasticTabel:
- Otomatis update column widths setelah render (via `window.currentEkasticTabel.loadColumnWidths()`)
- Update inline table data saat data berubah (via `window.currentEkasticTabel.updateInlineTableData()`)
- Clear filter cache saat refresh (via `window.currentEkasticTabel.filterCache`)

### 7. Instance Access
Instance NexaDom disimpan di container element:
```javascript
const container = document.querySelector('#dataContainer');
const instance = container._NexaDomInstance;
```

### 8. Response Property
Instance memiliki property `response` yang berisi data terakhir. **Ini adalah cara utama untuk akses data jika tidak menggunakan render function:**

```javascript
const dataDom = new NXUI.NexaDom({ ... });

// ✅ Akses data langsung
dataDom.response.forEach((item) => {
    console.log(item.nama, item.email);
});

// ✅ Buat template manual
let template = "";
dataDom.response.forEach((item) => {
    template += `<div>${item.nama}</div>`;
});

// ✅ Data akan otomatis update saat pagination/search/filter berubah
```

<a id="nexadom-error"></a>

## 🐛 Error Handling

NexaDom menangani error dengan baik:
- Menampilkan error message di container pagination
- Mengembalikan empty array jika dataLoader error
- Validasi halaman tidak melebihi total pages (auto correct ke halaman terakhir)
- Try-catch di semua async operations

<a id="nexadom-lifecycle"></a>

## 🔄 Lifecycle

1. **Constructor** - Setup configuration dan state, load data awal (non-blocking)
2. **loadRealDataAndUpdate()** - Load data awal dan update UI (dipanggil di constructor); menampilkan spinner Nexa jika `spinner.enabled`
3. **autoSetup()** - Setup search, sort listeners, dan override goToPage
4. **init()** - Inisialisasi lengkap (blocking, dipanggil oleh create() atau manual)
5. **loadData()** - Load data dari dataLoader
6. **updateDataContainer()** - Update container dengan data (menambahkan property `no`)
7. **render()** - Render pagination ke DOM
8. **renderPaginationInfo()** - Update info pagination
9. **attachEventListeners()** - Setup event listeners untuk pagination

<a id="nexadom-best"></a>

## 🎯 Best Practices

1. **Gunakan `config` bukan `queryConfig`** saat inisialisasi
2. **Gunakan `order` bukan `itemsPerPage`** untuk jumlah item per halaman
3. **Pilih salah satu: `render` function ATAU akses langsung via `dataDom.response`**
   - Jika menggunakan `render`: Data akan otomatis di-render ke container
   - Jika tidak menggunakan `render`: Akses data via `dataDom.response` dan buat template manual
4. **Gunakan `onAfterRender`** untuk inisialisasi komponen lain setelah data di-render
5. **Gunakan `updateFilter`** untuk filter, bukan langsung modify config
6. **Gunakan `updateSearch`** untuk search, bukan langsung modify config
7. **Gunakan `updateSort`** untuk sorting, bukan langsung modify config
8. **Access instance via container** jika perlu: `container._NexaDomInstance`
9. **Data akan otomatis update** - `dataDom.response` akan selalu berisi data terbaru setelah pagination/search/filter
10. **Struktur operasi** - Gunakan struktur lengkap jika perlu kontrol lebih detail, atau struktur sederhana untuk penggunaan umum
11. **Tabel SQL vs Office** — Untuk `SELECT` dari tabel lewat query builder, gunakan **`storage: { model, select?, query? }`**; untuk skema `alias` / `operasi` / `executeOperation`, gunakan **`config`**
12. **`storage.query`** — Letakkan **hanya** kondisi yang sama untuk semua request (count + halaman); variasi pencarian dari `searchElement` tetap lewat **`searchFields`** / **`updateSearch`**
13. **Spinner** — Untuk UX loading yang konsisten, gunakan **`spinner`** (NexaSpinner); nonaktifkan untuk halaman ringan atau bila Anda punya indikator global sendiri

<a id="nexadom-route-html-hydrate"></a>

## Route & fragmen HTML: `NXUI.html` + `hydrate` (NexaForge)

Pola ini memuat file HTML statis dari folder **`appRoot`** (mis. `templates/`) lewat **GET**, mengisi placeholder `{title}`, `{description}`, lalu mengikat **list template** `NexaForge` (`{user.nama}`, dll.) setelah konten masuk ke DOM. Cocok untuk handler route terdaftar.

### Prasyarat

- Di **`App.js`**, `appRoot` menentukan subfolder file fragmen (mis. `appRoot: 'templates'` → permintaan **`GET …/{appRoot}/{nama}.html`**).
- File HTML di folder itu boleh memakai `{title}` / `{description}` untuk variabel dari argumen kedua `NXUI.html`, dan blok list dengan atribut **`NexaForge`** + **`id`** untuk `hydrate`.

### Alur di handler route

1. Panggil **`NXUI.html('namaFile', { title, description, … })`** — tanpa ekstensi `.html`; folder mengikuti `appRoot` jika argumen ketiga (folder) tidak diisi.
2. Periksa **`result.success`** dan **`result.content`**; bila gagal, hentikan atau tampilkan error.
3. Set **`container.innerHTML = result.content`**.
4. Siapkan data array per extractor (mis. **`user`**: daftar `{ nama, email, … }`).
5. Jika ada, panggil **`result.hydrate(container, { user: users })`** — nama key (`user`) harus sama dengan nilai atribut **`NexaForge="user"`** di markup.

**Alternatif — data dari tabel (NexaModels / SQL):** alih-alih array statis, setelah langkah 3 panggil **`await NXUI.NexaForgeView.hydrateStorage(container, { storage: { model, query? }, … })`** — pola `storage` sama seperti **`new NexaDom({ storage: … })`**; detail dan opsi **`mapRow`** ada di **`docs/NexaForge.md`** (*Sumber data: storage*).

### Contoh fragmen HTML

Path mengikuti **`{appRoot}`** + nama argumen pertama **`NXUI.html`** (tanpa ekstensi **`.html`**).

- **`{title}`** / **`{description}`** — diganti dari objek kedua `NXUI.html` sebelum `innerHTML`.
- **Satu baris list** di dalam elemen dengan **`id`** + **`NexaForge="user"`** — menjadi template per item; field memakai **`{user.nama}`**, **`{user.email}`** (sama extractor `user` dengan data `hydrate(container, { user: [...] })`).

```html
<section class="exam-sheet">
  <h2>{title}</h2>
  <p class="exam-lead">{description}</p>
  <div class="exam-user-list">
    <div id="daftar-user" NexaForge="user">
      <div class="baris">
        <span>{user.nama}</span><span aria-hidden="true">—</span><span>{user.email}</span>
      </div>
    </div>
  </div>
</section>
```

Anda boleh menambahkan **`<style>`** di atas fragmen (seperti di proyek) untuk tampilan kartu / tipografi; yang wajib untuk alur di atas hanya struktur **`id`**, **`NexaForge`**, dan placeholder.

### Cuplikan handler route — `NXUI.html` + `innerHTML`

Panggil **`NXUI.html('namaFile', …)`** (contoh di bawah: **`'exam'`**), substitusi dari **`routeMeta`**, lalu pasang ke **`container`**:

```javascript
try {
  const result = await NXUI.html("exam", {
    title: routeMeta.title || "Contact",
    description: routeMeta.description || "",
  });

  if (!result.success || result.content == null) {
    console.error("[contact] html gagal:", result.error);
    return;
  }

  container.innerHTML = result.content;
```

Setelah itu, lanjutkan dengan **`result.hydrate(container, lists)`** atau **`await NXUI.NexaForgeView.hydrateStorage(container, { … })`** sesuai sumber data (array statis vs storage/SQL) — lihat **`docs/NexaForge.md`**.

### Contoh kelanjutan: `result.hydrate` dengan data statis (array)

Jika fragmen memakai **`NexaForge="user"`** dan Anda punya array di memori, setelah **`innerHTML`** bisa memanggil **`result.hydrate(container, { user: users })`**:

```javascript
try {
  const result = await NXUI.html("exam", {
    title: routeMeta.title || "Contact",
    description: routeMeta.description || "",
  });

  if (!result.success || result.content == null) {
    console.error("[route] html gagal:", result.error);
    return;
  }

  container.innerHTML = result.content;

  const users = [
    { nama: "Rina Wijaya", email: "rina@example.com" },
    { nama: "Budi Santoso", email: "budi@example.com" },
  ];

  if (typeof result.hydrate === "function") {
    result.hydrate(container, { user: users });
  }
} catch (error) {
  console.error("[route] html() throw:", error);
}
```

### Catatan

- **`hydrate`** memakai **`NXUI.NexaForgeView.hydrate`** (kelas `NexaForge`): elemen target harus punya **`id`** unik dan atribut **`NexaForge`** / `nexaforge` / `data-nexa-forge` (atau legacy **`NexaHtml`** / `nexahtml` / `data-nexa-html`).
- Placeholder list di fragmen memakai bentuk **`{user.nama}`**, **`{user.email}`** (bukan `{{…}}` untuk field meta; substitusi meta dari objek kedua memakai **`{kunci}`**).
- Argumen ketiga `NXUI.html(..., folder)` hanya perlu jika file berada di luar `appRoot`.

<a id="nexadom-nexaforge-ref"></a>

### Referensi NexaForge — fitur di `assets/modules/Dom/NexaForge.js`

Ringkasan fitur kelas **`NexaForge`** (global **`NXUI.NexaForgeView`**) dan modul terkait. Detail perilaku ada di kode sumber.

#### Akses dari NXUI

| Simbol | Arti |
|--------|------|
| `NXUI.NexaForgeView` | Kelas `NexaForge` |
| `NXUI.html(...)` | Factory di `Nexa.js`: muat fragmen file statis + substitusi `{kunci}`; hasil sukses menyertakan **`hydrate`** |

#### Metode statis (`NexaForge.*`)

| API | Fungsi |
|-----|--------|
| **`NexaForge.SENSITIVE_FIELDS`** | Daftar nama field yang disamarkan di output (password, token, dll.) |
| **`addSensitiveFields` / `removeSensitiveFields`** | Tambah / hapus pola field sensitif |
| **`getNexaForgeAttr(el)`** | Baca `NexaForge` \| `nexaforge` \| `data-nexa-forge` dan legacy `NexaHtml` \| `nexahtml` \| `data-nexa-html` |
| **`hydrate(root, lists)`** | Cari elemen dengan atribut di atas + **`id`**, lalu `new NexaForge({ elementById, ...lists })` |

#### Opsi constructor `new NexaForge(options)`

| Opsi | Keterangan |
|------|------------|
| **`elementById`** | **Wajib** — `id` elemen penampung template list di DOM |
| Data awal | Objek dengan array di key **extractor** (sama dengan `NexaForge="..."`), atau `{ data: [...] }`, atau array di argumen yang dinormalisasi ke extractor |
| **`order`** | Ukuran halaman / item per halaman (dipakai bersama pagination) |
| **`search`** + **`searchableFields`** | `id` input pencarian + daftar field string yang dicari |
| **`pagination`** | `id` elemen UI pagination (tombol halaman) |
| **`filter`** + **`filterBy`** | `id` select filter + nama field |
| **`sortOrder`** + **`sortBy`** | Urutan awal data |
| **`hideSensitiveFields`** | Default `true` — sembunyikan field sensitif saat render |
| **`endpoint`** | Objek endpoint HTTP (`url`, `method`, `headers`, `timeout`, `retryAttempts`, `retryDelay`) untuk **mode API** (`setApi`, dll.) |
| **`templateSelector`** | Selector elemen template (default `[data-template="list"]`) |

#### Render template (internal: `NexaDomextractor`)

- String template di-render ke HTML dengan placeholder **`{extractor.field}`**, path bersarang, **filter** (`|`), dan ekspresi kondisional yang didukung mesin di **`render()`**.
- Menggunakan **`NexaFilter`**; konteks pagination diset lewat **`setPaginationInfo`**.
- Di lingkungan ada binding **`NEXA.url`**, **`NEXA.controllers.*`** (mis. `page_home`, `projectAssets`) untuk placeholder global di template.

#### Instance — data & daftar

| Anggota | Peran |
|---------|--------|
| **`data`** | Getter/setter data terstruktur per extractor |
| **`filter`** | Instance **`NexaFilter`** |
| **`renderData`**, **`curPage`**, **`updatePaginationUI`** | Render ulang / halaman |
| **`Element(callback)`** | Callback dengan data terfilter halaman ini |
| **`addData`**, **`Reload`**, **`setData`** | Menambah data, mengganti data, set array penuh |
| **`getCurrentData`** | Data + ringkasan pagination |
| **`setupRefreshButton`** | Tombol refresh terkonfigurasi |
| **`sort(order, sortBy)`** | Urutkan ulang |
| **`getID`**, **`updateById`**, **`updateData`**, **`deleteById`** | Akses / ubah / hapus baris menurut **`id`** |
| **`filterKey`** | Set filter aktif per field |
| **`destroy`** | Cleanup listener / sumber daya |
| **`recover`** | Pulihkan data dari salinan awal |
| **`compileTemplate`**, **`parse`**, **`sanitize`** | Utilitas string / fragment DOM |

#### Field sensitif (instance)

| API | Fungsi |
|-----|--------|
| **`setSensitiveFieldsVisibility`** / **`getSensitiveFieldsVisibility`** | Aktif/nonaktif penyamaran + baca status |
| **`getSensitiveFields`** | Salinan daftar field sensitif saat ini |

#### Mode API (jika **`endpoint`** di `options`)

| API | Fungsi |
|-----|--------|
| **`setApi(requestData?, options?)`** | Fetch JSON; dukungan array di `data`, `rows`, `items`, atau array langsung |
| **`refreshApi`**, **`retry`** | Muat ulang / ulang request terakhir |
| **`updateEndpoint`**, **`getEndpoint`** | Ubah / baca konfigurasi endpoint |
| **`getApiState`**, **`getLastApiResponse`**, **`setRequestData`** | Status dan data request/response |
| **`setApiMode`**, **`isApiMode`** | Aktif/nonaktif mode API |
| **`setLoadingMessage`** | Teks pada blok loading bawaan |
| **`setTimeout`**, **`setRetryConfig`** | Timeout HTTP dan kebijakan retry |

Event dokumen: **`nexadom:dataLoaded`**, **`nexadom:dataError`** (detail menyertakan `domId`, `elementId`, dll.).

#### Event lain (mode list)

| Event | Konteks |
|-------|---------|
| **`dataReloaded`**, **`dataReloadError`** | Setelah **`addData`** / operasi reload |
| **`dataDeleted`** | Setelah **`deleteById`** sukses |

#### Modul `NexaDomextractor` (file yang sama)

Kelas terpisah yang memakai **`NexaFilter`** dan mengimplementasikan **`render(template, data, element)`** untuk mengubah string template menjadi HTML. Dipakai **internal** oleh `NexaForge`, bukan titik masuk aplikasi utama.

#### Integrasi dengan `hydrate`

- **`hydrate`** mengembalikan **`NexaForge[]`**. Simpan elemen array jika Anda perlu memanggil **`setApi`**, **`addData`**, **`sort`**, dll. setelah halaman dimuat.
- Search, pagination, dan filter hanya berjalan jika elemen dengan **`id`** yang disebut di **`options`** ada di DOM (bisa didefinisikan di fragmen HTML yang sama atau ditambahkan setelah `innerHTML`).

## 📄 License

Internal use only.
