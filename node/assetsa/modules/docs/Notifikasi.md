# Dokumentasi NexaNotif

## Daftar isi

- [Contoh cepat](#contoh-cepat)
- [1. Stylesheet (`ensureNotifStylesheet`)](#1-stylesheet-ensurenotifstylesheet)
- [2. Kontainer DOM](#2-kontainer-dom)
- [3. Instansiasi & `window.nexaNotif`](#3-instansiasi--windownexanotif)
- [4. Opsi konstruktor](#4-opsi-konstruktor)
- [5. Metode utama](#5-metode-utama)
- [6. `show(options)`](#6-showoptions)
- [7. `addNotification` & tipe](#7-addnotification--tipe)
- [8. Struktur HTML & kelas CSS](#8-struktur-html--kelas-css)
- [9. Suara (voice)](#9-suara-voice)
- [10. Referensi di proyek](#10-referensi-di-proyek)

---

Komponen **notifikasi toast** untuk NexaJS: kartu notifikasi di pojok layar (fixed), mendukung tipe `success` / `warning` / `error` / `info`, tombol aksi (Close, OK, Snooze), auto-hide dengan jeda hover, dan opsional **suara** lewat `NXUI.NexaVoice` bila pengaturan sistem mengizinkan.

Setelah `assets/modules/Nexa.js` dimuat, akses global:

| Akses | Keterangan |
| ----- | ---------- |
| `NXUI.NexaNotif` | Kelas konstruktor |
| `NXUI.Notifikasi` | Alias ke `NexaNotif` |

Import modul (tanpa `NXUI`):

```javascript
import {
  NexaNotif,
  ensureNotifStylesheet,
} from "/assets/modules/Notifikasi/NexaNotif.js";
```

## Contoh cepat

### Dengan `NXUI`

```javascript
// Setelah assets/modules/Nexa.js dimuat
const Notif = new NXUI.Notifikasi({ autoHideDelay: 5000 });
window.nexaNotif = Notif; // wajib agar tombol Close/OK/Snooze pada kartu yang dibuat JS berfungsi

// Satu kartu dari tipe + judul kustom
await Notif.show({
  type: "success",
  title: "Tersimpan",
  subtitle: "Data berhasil disimpan.",
});

// Kartu tambahan secara dinamis
Notif.addNotification(
  "Peringatan",
  "Silakan periksa kembali formulir.",
  "warning",
  ["close"],
  true
);

// Hapus semua kartu dan sembunyikan kontainer
Notif.clearAll();
```

### Dengan import modul (tanpa `NXUI` global)

```javascript
import { NexaNotif, ensureNotifStylesheet } from "/assets/modules/Notifikasi/NexaNotif.js";

await ensureNotifStylesheet();

const notif = new NexaNotif({ autoHideDelay: 4000 });
window.nexaNotif = notif;

notif.addNotification("Info", "Pesan singkat.", "info", ["close"], true);
```

---

## 1. Stylesheet (`ensureNotifStylesheet`)

`notifikasi.css` dimuat **sekali** lewat `NXUI.NexaStylesheet.Dom`, dengan URL stabil dari `import.meta.url` (satu folder dengan `NexaNotif.js`).

- Memanggil **`ensureNotifStylesheet()`** secara manual tidak wajib: **`init()`** pada `NexaNotif` sudah memicu pemuatan (`void ensureNotifStylesheet()`).
- Jika Anda perlu memastikan CSS ada sebelum membangun UI lain:

```javascript
await ensureNotifStylesheet();
```

---

## 2. Kontainer DOM

Notifikasi dirender di dalam elemen:

- **`id="notificationContainer"`**
- Kelas: `nx-notif-container` (ditambah `nx-notif-hidden` / `nx-notif-showing` saat disembunyikan / ditampilkan)

Jika elemen dengan id tersebut **belum ada**, `NexaNotif` membuatnya dan menempatkannya ke **`#nexa_app`**, atau jika tidak ada ke **`document.body`**.

Contoh manual (seperti di `NexaNotif.html`):

```html
<div
  class="nx-notif-container nx-notif-hidden"
  id="notificationContainer"
  role="region"
  aria-live="polite"
></div>
```

---

## 3. Instansiasi & `window.nexaNotif`

Kartu yang dibuat lewat **`addNotification`** memakai `onclick="window.nexaNotif.closeNotification(this)"` (dan snooze). Agar tombol itu berfungsi, **set instance global**:

```javascript
const Notif = new NXUI.Notifikasi({ autoHideDelay: 3000 });
window.nexaNotif = Notif;
```

`NexaNotif.js` mendeklarasikan `window.nexaNotif = null`; nilai ini harus diisi setelah instans dibuat (lihat pola di `NexaNotif.html`).

---

## 4. Opsi konstruktor

| Opsi | Tipe | Default | Keterangan |
| ---- | ---- | ------- | ---------- |
| `autoHideDelay` | `number` | `5000` | Durasi (ms) sebelum auto-hide untuk kartu yang memakai timer (bisa dijeda saat hover) |

Contoh:

```javascript
const notif = new NXUI.Notifikasi({ autoHideDelay: 8000 }); // 8 detik
window.nexaNotif = notif;
```

---

## 5. Metode utama

| Metode | Keterangan |
| ------ | ---------- |
| `show(options?)` | Menampilkan kontainer; jika belum ada kartu, membuat satu notifikasi dari `options.type` atau memuat **default** tiga kartu demo. |
| `hide()` | Menyembunyikan kontainer (kelas `nx-notif-hidden`, `display: none`). |
| `addNotification(title, subtitle, type?, actions?, autoHide?, icon?)` | Menambah satu kartu secara dinamis. |
| `addNotificationWithDelay(..., delay)` | Sama seperti `addNotification`, sementara mengganti `autoHideDelay` untuk kartu itu. |
| `clearAll()` | Hapus semua kartu, bersihkan timer, panggil `hide()`. |
| `closeNotification(button)` | Tutup kartu dari elemen tombol (animasi singkat). |
| `closeNotificationDirect(card)` | Tutup kartu tanpa tombol (untuk kartu tanpa aksi). |
| `snoozeNotification(button)` / `unsnoozeNotification(button)` | Alur demo snooze pada kartu tertentu. |
| `setAutoHideDelay(ms)` | Ubah delay default instance. |
| `setVoiceEnabled(enabled)` | Set flag suara (disarankan sinkron dengan `updateVoiceSettings`). |
| `updateVoiceSettings()` | Muat ulang preferensi suara dari `NXUI.ref` (IndexedDB). |
| `speakNotification(title, subtitle)` | Ucapkan subtitle jika voice aktif di sistem. |
| `testVoiceNotification()` | Uji suara (perlu voice aktif di sistem). |
| `onVoiceSettingsChange(enabled)` | Callback gaya integrasi pengaturan sistem. |

Contoh pemanggilan:

```javascript
Notif.hide();
Notif.clearAll();

Notif.addNotificationWithDelay(
  "Cepat",
  "Hilang dalam 1 detik",
  "info",
  ["close"],
  1000
);

Notif.setAutoHideDelay(10000);
```

---

## 6. `show(options)`

| Properti `options` | Tipe | Keterangan |
| ------------------ | ---- | ---------- |
| `type` | `'success'` \| `'warning'` \| `'error'` \| `'info'` | Menentukan judul/subtitle/ikon default jika tidak diisi. |
| `title` | `string` | Judul kartu. |
| `subtitle` | `string` | Teks sekunder. |
| `actions` | `boolean` \| `string[]` | `false` = tanpa tombol; atau array seperti `['close']`, `['ok']`, `['close','snooze']`. Default perilaku tergantung `getDefaultActions(type)`. |
| `autoHide` | `boolean` | Default `true`. `false` = tidak pakai timer auto-hide. |
| `icon` | `string` \| `null` | Nama ikon **Material Symbols** (override nama default per tipe). |

Jika **`show()`** dipanggil saat kontainer **kosong**:

- Dengan **`options.type`**: memanggil `createSingleNotification(options)`.
- Tanpa `type`: memanggil `createDefaultNotifications()` (tiga kartu demo: Coffee Break, Cannot Send Mail, Yippee).

Cuplikan `show`:

```javascript
// Error dengan judul/subtitle kustom
await Notif.show({
  type: "error",
  title: "Gagal menyimpan",
  subtitle: "Periksa koneksi lalu coba lagi.",
});

// Info + ikon Material Symbols kustom (nama glyph)
await Notif.show({
  type: "info",
  title: "Pemberitahuan",
  subtitle: "Ada pembaruan tersedia.",
  icon: "notifications_active",
});

// Tanpa tombol — hanya auto-hide (atau tutup programatis)
await Notif.show({
  type: "success",
  title: "Selesai",
  subtitle: "Tidak ada tombol; kartu akan tertutup otomatis.",
  actions: false,
});

// Kontainer kosong + tanpa type → memuat tiga kartu demo bawaan
await Notif.show();
```

---

## 7. `addNotification` & tipe

Parameter: `addNotification(title, subtitle, type = 'info', actions = ['close'], autoHide = true, icon = null)`.

**`type`** mempengaruhi warna ikon dan ikon default (Material Symbols):

| Tipe | Warna ikon (perkiraan) | Ikon default |
| ---- | ---------------------- | ------------ |
| `success` | hijau | `check_circle` |
| `warning` | oranye | `warning` |
| `error` | merah | `error` |
| `info` | biru | `info` |

**`actions`** — string yang dikenali saat membangun HTML:

- `'close'` — tombol Close (`nx-notif-close-btn`)
- `'ok'` — tombol OK (`nx-notif-ok-btn`, memanggil `closeNotification`)
- `'snooze'` — tombol Snooze (`nx-notif-snooze-btn`)

Auto-hide: jika `autoHide === true`, timer memanggil penutupan; **hover** pada kartu membersihkan timer dan **mouseleave** menjadwalkan ulang. Kartu **tanpa** tombol aksi ditutup lewat `closeNotificationDirect`.

Cuplikan `addNotification`:

```javascript
// Sukses dengan tombol OK saja
Notif.addNotification(
  "Berhasil",
  "Proses selesai.",
  "success",
  ["ok"],
  true
);

// Peringatan + Close + Snooze
Notif.addNotification(
  "Jadwal",
  "Istirahat dalam 5 menit.",
  "info",
  ["close", "snooze"],
  true
);

// Ikon kustom (warna tetap mengikuti `type`)
Notif.addNotification(
  "Upload",
  "File siap.",
  "success",
  ["close"],
  true,
  "cloud_upload"
);

// Tanpa aksi — timer tetap bisa menutup kartu lewat closeNotificationDirect
Notif.addNotification("Hanya teks", "Auto hilang.", "info", [], true);
```

---

## 8. Struktur HTML & kelas CSS

Satu kartu mengikuti struktur berikut (dibangun di JS atau ditulis manual):

```html
<div class="nx-notif-card">
  <div class="nx-notif-icon">…</div>
  <div class="nx-notif-content">
    <div class="nx-notif-title">Judul</div>
    <div class="nx-notif-subtitle">Subjudul</div>
  </div>
  <div class="nx-notif-actions">
    <button class="nx-notif-action-btn nx-notif-close-btn">Close</button>
  </div>
</div>
```

Kelas penting di `notifikasi.css`:

- **Kontainer:** `.nx-notif-container` — fixed kanan atas, kolom vertikal, `z-index` tinggi.
- **Kartu:** `.nx-notif-card`, hover sedikit terangkat.
- **Tombol demo halaman:** `.nx-notif-trigger-btn` (hanya untuk contoh di HTML).

Ikon di `addNotification` memakai **`<span class="material-symbols-outlined">`** — pastikan font Material Symbols sudah dimuat di aplikasi Anda.

---

## 9. Suara (voice)

Jika **`NXUI.NexaVoice`** dan **`NXUI.ref`** tersedia, komponen dapat membaca preferensi **`bucketsStore` / `system`** (field `voice`) dan memanggil **`speakNotification`** dengan isi **subtitle** saat notifikasi ditambahkan.

- `checkVoiceSettings()` / `updateVoiceSettings()` menyelaraskan dengan IndexedDB.
- Tanpa dependensi tersebut, notifikasi visual tetap berjalan; hanya bagian suara yang dilewati.

Memuat ulang preferensi suara dari penyimpanan (setelah pengguna mengubah setelan di aplikasi):

```javascript
await Notif.updateVoiceSettings();
```

---

## 10. Referensi di proyek

| Lokasi | Isi |
| ------ | --- |
| `assets/modules/Notifikasi/NexaNotif.html` | Tombol uji, kontainer, `new NXUI.Notifikasi({ autoHideDelay: 3000 })`, `window.nexaNotif = Notif`, contoh `show` / `addNotificationWithDelay`. |
| `templates/notifikasi.js` | Contoh rute memanggil `NXUI.Notifikasi` dan `show({ type: 'success', … })`. |

Cuplikan pola rute (disederhanakan):

```javascript
const Notif = new NXUI.Notifikasi({ autoHideDelay: 3000 });
window.nexaNotif = Notif;

await Notif.show({
  type: "success",
  title: "Operation Successful",
  subtitle: "Your data has been saved successfully!",
});
```

Sesuaikan path modul dengan struktur server Anda (mis. base URL aset).

---

*Dokumen ini mengacu pada implementasi `NexaNotif.js` dan markup contoh `NexaNotif.html` di repositori; jika API berubah, sesuaikan cuplikan dengan sumber aktual.*
