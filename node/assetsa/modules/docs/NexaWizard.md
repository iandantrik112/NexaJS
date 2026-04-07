# Dokumentasi NexaWizard

**NexaWizard** membangun form **bertahap (step-by-step)** dari skema yang sama dengan **NexaFloating**: objek `form`, array `variables`, dan `settings`. Field dibagi ke beberapa langkah; pengguna melalui **Berikutnya** / **Sebelumnya**; di langkah terakhir tombol **Kirim** mengirim data.

---

## Daftar isi

- [1. Ringkasan fitur](#1-ringkasan-fitur)
- [2. Akses API](#2-akses-api)
- [3. Skema `formData` (objek konfigurasi)](#3-skema-formdata-objek-konfigurasi)
- [4. `settings.wizard` — pembagian langkah](#4-settingswizard--pembagian-langkah)
- [5. Opsi konstruktor kedua (`options`)](#5-opsi-konstruktor-kedua-options)
- [6. Alur langkah, Enter, dan validasi](#6-alur-langkah-enter-dan-validasi)
- [7. Submit: event `nexaFormSubmit`, `onSubmit`, dan `send](#7-submit-event-nexaformsubmit-onsubmit-dan-send)`
- [8. Metode penting pada instance](#8-metode-penting-pada-instance)
- [9. Wizard di dalam modal (`NXUI.Modal`)](#9-wizard-di-dalam-modal-nxuimodal)
- [10. CSS dan tombol](#10-css-dan-tombol)
- [11. Contoh minimal](#11-contoh-minimal)
- [12. Troubleshooting singkat](#12-troubleshooting-singkat)

---

## 1. Ringkasan fitur


| Aspek                | Perilaku                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Dasar skema          | Sama dengan NexaFloating: `form`, `variables`, `settings` (lihat juga `docs/form.md` untuk field).                             |
| Langkah              | Otomatis per `fieldsPerStep`, atau eksplisit lewat `settings.wizard.steps`.                                                    |
| Indikator            | Bar progres dengan nomor + judul per langkah (bisa dimatikan dengan `showProgress: false`).                                    |
| Validasi per langkah | Saat **Berikutnya** atau Enter (bukan langkah terakhir), field wajib di langkah aktif divalidasi; error ditampilkan di UI.     |
| Submit               | Langkah terakhir: validasi penuh jika `settings.validation === true`, lalu `CustomEvent` `nexaFormSubmit` + callback opsional. |
| Tombol navigasi      | Kelas Nexa: `nx-btn-secondary-outline is-small` (Sebelumnya), `nx-btn-primary is-small` (Berikutnya / Kirim).                  |


---

## 2. Akses API

Setelah `Nexa.js` dimuat:

```javascript
const w = new NXUI.FormWizard(formData, { mode: "insert", footer: true });
// setara:
const w = new NXUI.NexaWizard(formData, { mode: "insert", footer: true });
```

Import modul langsung (jika perlu):

```javascript
import { NexaWizard } from "/assets/modules/Form/NexaWizard.js";
```

---

## 3. Skema `formData` (objek konfigurasi)

Properti umum (selaras NexaFloating):


| Properti            | Wajib             | Keterangan                                                                         |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `form`              | Ya                | Objek definisi field (`condition`, `type`, `label`, `validation`, dll.).           |
| `variables`         | Sangat disarankan | Urutan nama field yang `condition: true`.                                          |
| `id` atau `modalid` | Disarankan        | Menjadi `id` elemen `<form>`.                                                      |
| `label`             | Opsional          | Judul logika form.                                                                 |
| `settings`          | Opsional          | `floating`, `layout`, `validation`, `**wizard**`, `**onSubmit**`, `**send**`, dll. |


Detail tiap field mengikuti pola yang sama dengan dokumentasi form Nexa (`docs/form.md`, bagian skema field).

---

## 4. `settings.wizard` — pembagian langkah

Konfigurasi bisa di `formData.settings.wizard` atau di `options.wizard` (konstruktor kedua).


| Properti                          | Tipe         | Default                          | Keterangan                                                                                                                                      |
| --------------------------------- | ------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `fieldsPerStep`                   | number       | `2`                              | Jumlah field per langkah jika `**steps**` tidak diisi. Minimal 1.                                                                               |
| `steps`                           | `string[][]` | —                                | Daftar langkah: tiap elemen adalah array **nama field**. Field yang belum masuk `steps` tetap ditampilkan dalam satu langkah tambahan di akhir. |
| `titles`                          | `string[]`   | —                                | Judul tiap langkah pada indikator; jika kurang, dipakai teks `Langkah N`.                                                                       |
| `showProgress`                    | boolean      | `true`                           | Menampilkan bar progres atas form (hanya jika ada lebih dari satu langkah).                                                                     |
| `labels.prev` / `next` / `submit` | string       | Sebelumnya / Berikutnya / Submit | Teks tombol navigasi. Bisa juga `prevLabel`, `nextLabel`, `submitLabel` di objek wizard (alias).                                                |


**Contoh pembagian otomatis** (`fieldsPerStep`):

```javascript
settings: {
  wizard: { fieldsPerStep: 2, titles: ["Data diri", "Kontak", "Lainnya"] },
}
```

**Contoh langkah manual** (`steps`):

```javascript
settings: {
  wizard: {
    steps: [
      ["nama", "email"],
      ["telepon", "kota"],
      ["pesan"],
    ],
    titles: ["Identitas", "Kontak", "Pesan"],
  },
}
```

---

## 5. Opsi konstruktor kedua (`options`)


| Opsi        | Keterangan                                                                      |
| ----------- | ------------------------------------------------------------------------------- |
| `mode`      | Mis. `"insert"` — mempengaruhi penyembunyian field `id`.                        |
| `footer`    | `true` (default): tampilkan bar tombol wizard jika ada lebih dari satu langkah. |
| `value`     | Nilai awal field (objek keyed by field name).                                   |
| `onSubmit`  | Fungsi `(detail) => void` — menimpa `settings.onSubmit` jika disetel di sini.   |
| `send`      | String nama handler global (sama pola resolusi dengan NexaForm).                |
| `setDataBy` | Diserahkan ke handler `send` sebagai argumen ketiga.                            |
| `wizard`    | Objek sama seperti `settings.wizard` (gabungan prioritas di dalam kelas).       |


---

## 6. Alur langkah, Enter, dan validasi

- **Satu langkah saja** — tidak ada bar progres; perilaku mirip form biasa (tanpa tombol prev/next jika `footer` dan multi-step tidak relevan).
- **Beberapa langkah** — hanya panel langkah aktif yang terlihat (kelas `form-nexa-wizard-step active`).
- **Berikutnya** — memanggil validasi hanya untuk field di langkah aktif (`validation === "2"` / `true` / `2`, plus aturan tipe email/number/url jika ada nilai).
- **Enter** pada form — jika belum di langkah terakhir, sama seperti **Berikutnya**; di langkah terakhir memicu submit penuh.
- `**settings.validation`** — jika `true`, pada submit terakhir seluruh form divalidasi seperti NexaFloating (`validateForm`).

---

## 7. Submit: event `nexaFormSubmit`, `onSubmit`, dan `send`

Setelah sukses validasi (langkah terakhir):

1. Event `**nexaFormSubmit**` di-`dispatch` pada `document` dengan `detail` berisi antara lain: `formData`, `formId`, `className`, `tableName`, `tableKey`, `formMeta`.
2. `**invokeSubmitHandlers**` dijalankan:
  - Jika ada `**options.onSubmit**` atau `**settings.onSubmit**` (fungsi), dipanggil dengan `**detail**` yang sama dengan event.
  - Jika tidak, dan ada `**options.send**` atau `**settings.send**` (string), fungsi dicari seperti NexaForm: `window` → `NXUI` → `nx` → `nx._global`, lalu dipanggil `**(formId, formData, setDataBy)**`.

---

## 8. Metode penting pada instance


| Metode                  | Keterangan                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `html()`                | Mengembalikan string HTML form (untuk `innerHTML`); memicu skrip floating label bila perlu.                                                                  |
| `render(container)`     | Menyisipkan node form ke container (append). Listener terpasang pada instance.                                                                               |
| `bindToDom(container)`  | Mencari `#formId` atau `<form>` di dalam `container` dan menyambungkan kembali listener setelah markup disisipkan lewat string (wajib untuk alur **modal**). |
| `getFormData()`         | Mengumpulkan nilai form (async).                                                                                                                             |
| `destroy()` / `reset()` | Pembersihan dan reset form (lihat implementasi di file sumber).                                                                                              |


---

## 9. Wizard di dalam modal (`NXUI.Modal`)

Di `**assets/modules/modal/NexaModalHtml.js`**, body modal dapat diisi dengan `**wizard**` (bukan `**floating**`):

- Dibuat `new NexaWizard(data.wizard, { mode, footer })`, `innerHTML = wizard.html()`, lalu `**wizard.bindToDom(modalBody)**`.
- Jika `**wizard**` ada, **footer modal default** (tombol Simpan + NexaValidation lewat `onclick.send`) **tidak** dibuat — wizard memakai tombol **Kirim** sendiri di dalam form.

Contoh pola pemanggilan:

```javascript
await NXUI.Modal({
  elementById: "setModal_wizard1",
  styleClass: "w-500px",
  minimize: true,
  label: "Judul modal",
  wizard: { id: "form_modal_wizard1", form: { ... }, variables: [ ... ], settings: { ... } },
  mode: "insert",
});
await NXUI.Modal.open("setModal_wizard1");
```

Referensi lengkap: `templates/wizard.js` (`nx.openWizardModalDemo`).

---

## 10. CSS dan tombol

- **Wizard:** `assets/modules/assets/css/form.css` — kelas `form-nexa-wizard`, `form-nexa-wizard-progress`, `form-nexa-wizard-step`, `form-nexa-wizard-buttons`, pesan `.error-message`, state `.form-error` (label tidak memakai warna error; pesan validasi tetap merah).
- **Tombol:** `assets/modules/assets/css/button.css` — `nx-btn-primary`, `nx-btn-secondary-outline`, modifier `is-small`.

Pastikan `button.css` dimuat setelah atau bersama form (mis. di `assets/css/style.css`).

---

## 11. Contoh minimal

**Render di halaman:**

```javascript
const schema = {
  id: "myWizard",
  variables: ["a", "b"],
  form: {
    a: { condition: true, type: "text", label: "A", validation: "2" },
    b: { condition: true, type: "text", label: "B", validation: "2" },
  },
  settings: {
    floating: true,
    validation: true,
    wizard: { fieldsPerStep: 1, titles: ["Langkah 1", "Langkah 2"] },
    onSubmit(detail) {
      console.log(detail.formData);
    },
  },
};

const w = new NXUI.FormWizard(schema, { mode: "insert" });
const mount = document.getElementById("host");
mount.innerHTML = "";
w.render(mount);
```

**Catatan:** `render(container)` meng-append node `<form>` ke `container` (sama seperti pola di `templates/wizard.js`).

---

## 12. Troubleshooting singkat


| Gejala                                      | Yang dicek                                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Klik **Berikutnya** tidak menampilkan error | Pastikan field punya `validation` wajib (`"2"` / `2` / `true`) dan `settings` / skema konsisten.               |
| Wizard di modal tidak merespons             | Pastikan `**bindToDom`** dipanggil setelah HTML masuk DOM (sudah ditangani di `NexaModalHtml` untuk `wizard`). |
| Submit tidak memanggil handler              | Periksa `onSubmit` / `send` dan urutan resolusi fungsi global; cek event `nexaFormSubmit` di DevTools.         |
| ID form bentrok                             | Gunakan `id` unik per halaman (mis. berbeda untuk inline vs modal).                                            |


---

*Dokumen ini selaras dengan perilaku kode di cabang utama proyek; jika API berubah, utamakan komentar JSDoc dan isi file sumber.*