# NexaDropdown (`NXUI.Dropdown` / `NXUI.NexaDropdown`)

Komponen dropdown modular: trigger membuka/menutup menu dengan menambah/menghapus class **visible** (default: `show`), menutup saat klik di luar dan tombol **Escape**, serta opsi menutup dropdown lain saat satu dibuka.

- **Sumber:** `assets/modules/Dropdown/NexaDropdown.js`
- **Ekspor NexaUI:** `NXUI.NexaDropdown` dan alias `NXUI.Dropdown` (kelas yang sama).

---

## Prasyarat markup

1. **Trigger** dan **menu** harus bisa di-resolve lewat `id` atau selector CSS.
2. **Menu** perlu styling sendiri: default hanya mengelola class (mis. `display: none` tanpa `show`, `display: block` dengan `show`). Bungkus trigger + menu dalam kontainer `position: relative` jika menu `position: absolute`.
3. Agar **`NexaDropdown.closeAll()`** membersihkan DOM secara konsisten, class menu sebaiknya mengandung substring **`dropdown-menu`** atau **`nav-dropdown-menu`** (selector internal). Jika tidak, instance tetap bisa dibuka/tutup, tetapi cabang `querySelectorAll` di `closeAll` mungkin tidak menyentuh elemen menu Anda (instance lain tetap ditutup lewat `instance.close()`).

---

## Opsi konstruktor

| Opsi | Tipe | Default | Keterangan |
|------|------|---------|------------|
| `triggerId` | `string` | `null` | `id` elemen trigger |
| `menuId` | `string` | `null` | `id` elemen menu |
| `triggerSelector` | `string` | `null` | Alternatif dari `triggerId` |
| `menuSelector` | `string` | `null` | Alternatif dari `menuId` |
| `showClass` | `string` | `'show'` | Class saat menu terbuka |
| `closeOthers` | `boolean` | `true` | Saat membuka, panggil `closeAll` (kecuali instance ini) |
| `closeOnOutsideClick` | `boolean` | `true` | Tutup saat klik di luar trigger dan menu |
| `closeOnEscape` | `boolean` | `true` | Tutup saat `Escape` |
| `autoInit` | `boolean` | `true` | Jika `true`, `init()` dijadwalkan saat konstruktor (langsung atau setelah `DOMContentLoaded`) |
| `onOpen` | `function` | `null` | `(instance) => void` |
| `onClose` | `function` | `null` | `(instance) => void` |

Prioritas resolve elemen: `triggerId` / `menuId` lebih dulu daripada `triggerSelector` / `menuSelector`.

---

## Instance: method

| Method | Keterangan |
|--------|------------|
| `init()` | Pasang listener; cari trigger/menu dari opsi |
| `open()` | Tambah `showClass`, set `isOpen`, panggil `onOpen` |
| `close()` | Hapus `showClass`, set `isOpen`, panggil `onClose` |
| `toggle()` | Sinkron state dengan DOM lalu buka atau tutup |
| `syncState()` | Samakan `isOpen` dengan keberadaan `showClass` di menu |
| `destroy()` | Lepas listener dokumen & trigger, `close()`, hapus dari `NexaDropdown.instances` |

---

## Static API

| Static | Keterangan |
|--------|------------|
| `NexaDropdown.init(configs)` | Satu objek konfigurasi atau array konfigurasi; mengembalikan **satu instance** jika hanya satu, atau **array** instance |
| `NexaDropdown.autoInit(container?)` | Cari `[data-dropdown-trigger]` di `container` (default `document`); nilai atribut = **`id` menu**; trigger **wajib punya `id`**; tiap pasangan dibuat instance dengan `autoInit: false` lalu `init()` |
| `NexaDropdown.closeAll(excludeInstance?)` | Tutup semua instance terdaftar kecuali yang di-exclude; pada node yang class-nya mengandung `dropdown-menu` / `nav-dropdown-menu`, hapus class **`show`** secara hard-coded (bukan `showClass` per instance). Jika memakai `showClass` selain `show`, sesuaikan markup atau jangan mengandalkan cabang DOM ini |
| `NexaDropdown.getInstanceByMenu(menuOrId)` | Cari instance yang `menu`-nya sama dengan elemen atau `getElementById` |

Properti global: **`NexaDropdown.instances`** — array instance aktif (setelah konstruktor, sebelum `destroy`).

---

## Auto-init saat load modul

Di akhir `NexaDropdown.js`, jika `document` ada, **`NexaDropdown.autoInit()`** dipanggil pada `DOMContentLoaded` atau segera. Itu hanya menangkap trigger yang **sudah** ada di halaman saat itu.

**SPA / konten dinamis:** setelah Anda meng-inject HTML (mis. ke `#main`), panggil lagi:

```js
NXUI.NexaDropdown.autoInit(containerElem);
```

atau buat instance manual / `init([...])`. Hindari listener ganda: **panggil `destroy()`** pada instance lama sebelum mengganti markup route yang sama.

---

## Contoh cepat

**Manual (by id):**

```js
const dd = new NXUI.Dropdown({
  triggerId: 'my-dd-btn',
  menuId: 'my-dd-menu',
  onOpen: () => console.log('open'),
  onClose: () => console.log('close'),
});
// dd.destroy() saat tidak dipakai (mis. unmount route)
```

**Banyak sekaligus:**

```js
const list = NXUI.NexaDropdown.init([
  { triggerId: 'btn-a', menuId: 'menu-a' },
  { triggerId: 'btn-b', menuId: 'menu-b' },
]);
// list adalah array jika lebih dari satu config
```

**Markup + `autoInit`:**

```html
<button type="button" id="user-menu-btn" data-dropdown-trigger="user-menu">User</button>
<ul id="user-menu" class="dropdown-menu ...">
  <li><a href="/profil">Profil</a></li>
</ul>
```

```js
NXUI.NexaDropdown.autoInit(document.getElementById('main'));
```

---

## Integrasi routing (NexaRoute)

`NexaRoute` dapat memanggil `getInstanceByMenu` / menutup menu dengan class `show` saat navigasi link di dalam menu. Pastikan menu memakai pola class yang dikenali (mis. `dropdown-menu`).

---

## Gaya siap pakai (opsional)

File **`assets/modules/assets/css/dropdown.css`** berisi kelas **`.nx-dropdown`**, **`.nx-dropdown-btn`**, **`.nx-dropdown-content`** (buka dengan **`.nx-dropdown.active`** pada parent). Itu pola berbeda dari class `show` default `NexaDropdown`; jika memakai file CSS tersebut, set `showClass: 'active'` **pada parent** tidak didukung langsung karena komponen menambah class pada **elemen menu**, bukan wrapper. Untuk `.nx-dropdown`, biasanya menu memakai `.nx-dropdown-content` dan Anda samakan `showClass` dengan class yang dipakai CSS Anda (mis. custom) atau tetap gunakan `show` + override CSS.

`nexa.css` meng-import `dropdown.css` sehingga kelas `.nx-dropdown` tersedia secara global bila bundle dipakai.

---

## Demo di proyek

Route **`/dropdown`** — `templates/dropdown.js`: tiga skenario (instance tunggal, `init` array, `data-dropdown-trigger` + `autoInit(container)`), plus **`destroy`** saat route di-render ulang.
