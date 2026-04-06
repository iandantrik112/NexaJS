# NexaField

**NexaField** adalah komponen **inline editing** di browser: elemen tampilan (biasanya `<span>`) diklik, diganti sementara dengan kontrol input yang sesuai, divalidasi, lalu nilai baru bisa dikirim lewat callback `onSave`.

---

## 1. Cara memakai (minimal)

Setelah HTML yang berisi field sudah ada di DOM dan `**Nexa.js` sudah memuat objek global `NXUI`**, buat instance, pasang callback, lalu panggil `initElements()`.

```javascript
const field = new NXUI.Field();

field.onSaveCallback((id, newValue, element, type, fieldName) => {
  // id          → element.id
  // newValue    → string nilai tersimpan
  // element     → node .editable asli
  // type        → atribut type (mis. "text", "select")
  // fieldName   → atribut name
  console.log({ id, newValue, type, fieldName });
  // Kirim ke API, update store, dll.
});

field.initElements(); // default: selector ".editable"
```



**Selector custom** (jika class bukan `.editable`):

```javascript
field.initElements(".my-inline-field");
```

---

## 2. Markup HTML

- Wajib ada class yang cocok dengan selector `initElements` (default: `**editable**`).
- `**id**` disarankan unik (dipakai di callback sebagai `id`).
- `**name**` opsional; dikirim sebagai `fieldName` di callback.
- `**type**` menentukan jenis kontrol saat edit (lihat tabel di bawah). Default: `text`.
- Isi teks elemen = nilai tampilan awal (kecuali `tags` / `tags-input` yang bisa memakai `data-tags`).

```html
<span
  class="editable"
  id="user_email"
  name="email"
  type="email"
  label="Email"
  icon="email"
>user@example.com</span>
```

### Label & ikon (opsional)

Jika ada atribut `**label**` dan/atau `**icon**` (nama [Material Symbols](https://fonts.google.com/icons)), elemen dibungkus `**div.nexa-display-container**` berisi ikon + label + span `.editable`. Font ikon harus sudah di-load di halaman jika ingin ikon tampil.

---

## 3. Tipe field (`type="..."`)


| `type`                                                         | Perilaku ringkas                                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `text`                                                         | `<input type="text">` (default)                                                                       |
| `number`, `email`, `url`, `tel`, `date`, `time`, `password`, … | `<input>` dengan `type` yang sama                                                                     |
| `textarea`                                                     | `<textarea>`                                                                                          |
| `select`                                                       | `<select>`; opsi dari `**data-options**` (pemisah `|`)                                                |
| `tags`                                                         | Multi-select; opsi dari `**data-options**`; nilai disimpan sebagai string dipisah koma; tampilan chip |
| `tags-input`                                                   | Input teks, tag dipisah koma; chip di tampilan                                                        |


**Select2:** untuk `select` dan `tags`, jika tersedia `window.NXUI.initSelect2` dan jQuery, Select2 diinisialisasi pada kontrol tersebut.

### Contoh `select`

```html
<span
  class="editable"
  id="f_kota"
  name="kota"
  type="select"
  label="Kota"
  data-options="Jakarta|Bandung|Surabaya|Medan"
>Bandung</span>
```

Teks tampilan harus cocok dengan salah satu opsi (atau akan ditambahkan sebagai opsi sementara saat edit).

### Contoh `tags`

```html
<span
  class="editable"
  id="f_skills"
  name="skills"
  type="tags"
  label="Skill"
  data-options="JavaScript|TypeScript|PHP|Vue"
  data-tags="JavaScript, TypeScript"
></span>
```

### Contoh `tags-input`

```html
<span
  class="editable"
  id="f_labels"
  name="labels"
  type="tags-input"
  data-tags="urgent, follow-up"
  data-min-tags="1"
  data-max-tags="6"
></span>
```

---

## 4. Validasi (atribut pada elemen `.editable`)

Berlaku untuk semua tipe (sebelum switch per-tipe):


| Atribut                               | Fungsi                        |
| ------------------------------------- | ----------------------------- |
| `required`                            | Tidak boleh kosong            |
| `data-min-length` / `data-max-length` | Panjang string                |
| `data-pattern`                        | Regex (string untuk `RegExp`) |
| `data-pattern-message`                | Pesan jika pola gagal         |


Per tipe:

- `**number`:** `data-min`, `data-max` (nilai numerik).
- `**date`:** `data-min-date`, `data-max-date` (format `YYYY-MM-DD`, dibanding string).
- `**select`:** nilai harus ada di `data-options` (jika opsi tidak kosong).
- `**tags`:** `data-min-tags`, `data-max-tags`; jika ada `data-options`, setiap tag harus termasuk opsi.
- `**tags-input`:** `data-min-tags`, `data-max-tags`, `data-min-tag-length`, `data-max-tag-length` (per tag).

```html
<span
  class="editable"
  id="f_user"
  name="username"
  type="text"
  required
  data-min-length="3"
  data-max-length="20"
>user_demo</span>
```

---

## 5. Status non-edit

- `**disabled**` atau `**readonly**` pada elemen: tidak masuk mode edit; gaya dan `title` disesuaikan.
- Mengubah status lewat JS (by `id`):

```javascript
field.setElementDisabled("f_user", true);
field.setElementReadonly("f_user", true);
```

> **Catatan:** `setElementDisabled` / `setElementReadonly` memperbarui tampilan, tetapi listener klik dari `initElements` tidak dihapus/ditambah ulang otomatis; untuk perilaku penuh setelah render ulang, panggil `initElements` lagi pada container yang baru.

---

## 6. Checkbox & radio

**Tidak didukung** untuk inline edit: `editText` mengabaikan `type="checkbox"` dan `type="radio"`. Elemen tersebut tidak mendapat listener klik edit; tooltip menjelaskan bahwa tipe itu tidak didukung.

Untuk boolean di UI, gunakan misalnya `**select`** dengan `data-options="Ya|Tidak"` atau `**text**` dengan nilai `true` / `false`.

---

## 7. API ringkas (instance)


| Metode                              | Keterangan                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `onSaveCallback(fn)`                | `fn(id, newValue, element, type, fieldName)` dipanggil saat simpan sukses setelah validasi. |
| `initElements(selector?)`           | Mendaftarkan perilaku pada semua elemen yang cocok (default `".editable"`).                 |
| `editText(element)`                 | Membuka edit manual untuk satu node (biasanya tidak perlu jika sudah `initElements`).       |
| `saveCurrentEdit()`                 | Memanggil fungsi save sesi aktif (jika ada).                                                |
| `setElementDisabled(id, disabled?)` | Set atribut `disabled` + gaya.                                                              |
| `setElementReadonly(id, readonly?)` | Set atribut `readonly` + gaya.                                                              |


---

## 8. Referensi demo di proyek

Halaman contoh lengkap ada di `**templates/field.js**`: HTML string berisi banyak `.editable` dengan berbagai `type` dan atribut validasi, lalu:

```javascript
const field = new NXUI.Field();
field.onSaveCallback((variable, newValue, element, type, fieldName) => {
  console.log("[Field save]", { id: variable, fieldName, type, newValue, element });
});
field.initElements();
```

Gunakan itu sebagai blueprint saat menambah field inline di route atau view lain.

---

## 9. Ringkasan alur

1. Render HTML dengan `.editable`, `id`, `type`, dan atribut validasi/opsi sesuai kebutuhan.
2. `new NXUI.Field()` (atau `new NexaField()` jika impor modul) → `onSaveCallback(...)` → `initElements()`.
3. Pengguna mengklik nilai → kontrol input muncul → blur / Enter / perilaku khusus per tipe (mis. `change` pada select) menyelesaikan edit.
4. Jika validasi lolos, DOM kembali ke mode tampilan dan callback `onSave` dijalankan dengan nilai baru.

