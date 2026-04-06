# Terminal Nexa — pintasan keyboard & perintah proyek

Dokumentasi navigasi input, riwayat perintah, serta perintah `**start**`, `**dev**`, `**stop**`, `**restart**`, `**instal**`, `**modules**`, dan `**npm instal**` 

## Riwayat perintah (↑ mundur, ↓ maju)

Setelah Anda menjalankan perintah (Enter), teks tersebut **disimpan di riwayat sesi** (memori halaman; tidak otomatis tersimpan ke disk setelah refresh).


| Tombol             | Fungsi                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **↑** (Arrow Up)   | Pindah ke perintah **sebelumnya** yang pernah diketik (mundur dalam riwayat).            |
| **↓** (Arrow Down) | Pindah ke perintah **berikutnya**; di ujung bawah riwayat, baris input dikosongkan lagi. |


**Catatan:**

- Riwayat hanya aktif pada baris input biasa (prompt `NEXA$` atau path `...>`). Saat mode **terisolasi** (misalnya prompt rahasia atau alur khusus), navigasi ↑/↓ bisa tidak dipakai agar tidak mengganggu.
- Riwayat diisi setiap kali baris perintah dikirim dengan Enter (termasuk perintah yang salah / *Command Not found*).

## Pelengkapan perintah (Tab)


| Tombol  | Fungsi                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tab** | Jika ada **satu** perintah yang cocok dengan awalan yang diketik, nama perintah dilengkapi. Jika ada **beberapa** kecocokan, daftar singkat ditampilkan. |


## Kontrol lain di area terminal


| Kombinasi  | Fungsi                                                   |
| ---------- | -------------------------------------------------------- |
| **Ctrl+C** | Menghentikan eksekusi / alur saat ini (`stop`).          |
| **Ctrl+R** | Mengosongkan isi terminal (layar) dan menghentikan alur. |


## Jendela terminal (modal)

Jika terminal dibuka sebagai modal (bukan halaman penuh):


| Kombinasi                        | Fungsi         |
| -------------------------------- | -------------- |
| **Ctrl+Z** atau **Ctrl+Shift+Z** | Buka terminal  |
| **Ctrl+Shift+X**                 | Tutup terminal |


Ketik `**shortcuts`** untuk daftar ringkas pintasan dan beberapa perintah yang sering dipakai.

---

## Navigasi folder (`cd`, `home`, `pwd`, `ls`)


| Perintah                             | Fungsi                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `**cd D:\path**`                     | Set **cwd** (direktori aktif virtual) untuk prompt path dan perintah proyek.  |
| `**cd ~`** / `**cd @**` / `**home**` | Reset prompt ke `**NEXA$**` (tanpa cwd).                                      |
| `**pwd**`                            | Menampilkan cwd saat ini.                                                     |
| `**ls**`                             | Di Electron dengan cwd: daftar isi folder cwd di disk; lainnya daftar contoh. |


---

## Port default proyek (bukan port Nexa)

Prompt `**start**` dan `**dev**` memakai **port default** agar tidak bentrok dengan URL Nexa di bilah alamat:

- Jika origin lokal (`127.0.0.1`, `localhost`, `::1`): **port Nexa + 100** (dibatasi sampai 65535; jika bentrok, disesuaikan).
- Selain itu: **4000**.

Anda selalu bisa mengisi port manual di prompt, atau memakai `**dev 5500`** untuk melewati prompt.

---

## Perintah `start`

Gunakan setelah `**cd**` ke folder proyek.

### `start dev`

**Sama persis dengan `dev`** — alur “tanpa wajib `.htaccess`”: mendeteksi folder (Electron-only, `server.js`, atau static), lalu menjalankan mode yang sesuai (termasuk `**npm run dev**` untuk proyek yang hanya punya `**electron.js**` tanpa `**server.js**`).

### `start` (tanpa argumen) di folder **hanya Electron**

Jika di **cwd** ada `**electron.js`** dan **tidak** ada `**server.js`**, `**start**` memakai **jalur singkat**: menjalankan `**npm run dev`** (setara perilaku dev untuk kasus itu), dengan pesan ringkas. Log proses tampil di konsol Electron (mis. awalan `[nexa-npm-dev]`).

### Alur `start` umum (setelah pengecekan di atas)

1. Memanggil Electron untuk mengecek `**.htaccess**` di **cwd**.
2. **Jika ada `.htaccess`** — mode “proyek Apache-style”: diminta **port** (Enter = default di atas), `**startStaticServe`** melayani folder di `**127.0.0.1:<port>**`, browser dibuka ke URL itu.
3. **Jika tidak ada `.htaccess`** — dibaca isi folder:
  - Ada `**server.js**` — mode **Node**: `node server.js` dengan `**PORT`** = port pilihan; browser ke URL lokal proyek (bukan halaman Nexa).
  - Ada `**electron.js**` saja — sudah ditangani **jalur singkat** di atas (return lebih awal).
  - **Tidak ada** ketiganya (`.htaccess`, `server.js`, `electron.js`) — pesan **“Server tidak ditemukan”** dan saran memakai `**dev [port]`** untuk folder statis tanpa penanda itu.

### `start <url>`

Contoh: `**start http://127.0.0.1:3007**` — lewati prompt port; URL dipakai untuk membuka browser dan, bila URL HTTP lokal ke `127.0.0.1` / `localhost`, memicu server internal lewat `**startStaticServe**` sesuai root folder.

---

## Perintah `dev`

- `**dev**` = `**start dev**` (satu implementasi bersama di renderer).
- `**dev [port]**` — port opsional; jika tidak diberikan, prompt memakai **port default proyek** (lihat bagian di atas).

Perilaku menurut isi folder:


| Isi cwd (ringkas)               | Perilaku utama                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `electron.js` tanpa `server.js` | `**npm run dev`** (aplikasi desktop Electron folder itu)                                                    |
| `server.js`                     | Static serve / `**node server.js**` sesuai implementasi main (mode `node`), lalu buka browser ke URL proyek |
| Folder statis / campuran        | Express static di proses Electron + buka browser                                                            |


Tidak perlu menjalankan `http-server` manual untuk kasus yang ditangani Nexa; aturan `**.htaccess**` tidak dipakai di cabang `**dev**` (beda dengan `**start**` yang pertama-tama mengecek `.htaccess`).

---

## Perintah `instal` dan `install`

Menyalin **isi penuh** subfolder `**web`**, `**node**`, atau `**eletron**` dari repositori **NexaJS** (arsip ZIP GitHub) ke **cwd** (bukan subfolder baru di dalam cwd).


| Contoh                                       | Arti                                                     |
| -------------------------------------------- | -------------------------------------------------------- |
| `**instal web`**                             | Paket **web**, branch **main** (terbaru default).        |
| `**instal web@v1.0.0`**                      | Paket **web**, tag `**v1.0.0`**.                         |
| `**instal node**`                            | Paket **node**.                                          |
| `**instal electron`** / `**instal eletron**` | Paket **eletron** di repo (nama folder repo: `eletron`). |


- `**install`** — alias ejaan Inggris, perilaku sama dengan `**instal**`.
- Wajib `**cd**` ke folder tujuan; berkas dengan nama sama di cwd akan tertimpa.
- Saat unduhan/ekstraksi berjalan, tampil **progres visual** (komponen `**NexaNpm`**: bar, spinner, fase teks). **Tidak menampilkan URL** di UI progres.
- Setelah sukses: pesan hijau mis. **“Sukses menginstal NexaJS untuk …”** (tanpa baris “Sumber” / URL).
- Baris progres dihapus dari DOM setelah selesai agar **tidak meninggalkan baris kosong** di riwayat.

---

## Perintah `modules`

Hanya memperbarui `**assets/modules`** proyek Anda dari jalur `**{web\|node\|eletron}/assets/modules**` di arsip NexaJS yang sama.


| Contoh                   | Tujuan di disk                                                  |
| ------------------------ | --------------------------------------------------------------- |
| `**modules web**`        | `**cwd/assets/modules**` ← isi `**web/assets/modules**` (main). |
| `**modules web@v1.0.0**` | Sama, dari tag yang diminta.                                    |
| `**modules node**`       | Dari `**node/assets/modules**`.                                 |
| `**modules electron**`   | Dari `**eletron/assets/modules**`.                              |


Folder `**assets/modules**` dibuat jika belum ada; isi disalin rekursif (merge / timpa nama sama). Progres UI memakai prefiks `**modules:**` dan fase yang menyesuaikan `**assets/modules**`.

---

## Perintah `npm instal` dan `npm install`

Menjalankan `**npm install**` sekali di **cwd** (mengisi `**node_modules`** dari `**package.json**`).

- Bentuk yang didukung: `**npm instal**` atau `**npm install**` (subperintah wajib: `instal` / `install`).
- Membutuhkan `**package.json**` di cwd.
- Progres visual `**NexaNpm**` (prefiks `**npm:**`); detail log npm di **konsol Electron** dengan awalan `**[nexa-npm-install]`**.
- Sukses: pesan hijau mis. **“npm install selesai.”**
- Baris progres dihapus setelah selesai (tanpa baris kosong).

**Urutan tipikal** setelah `**instal node`** / `**instal electron**`: `**npm instal**`, lalu `**start**` / `**dev**` jika relevan.

---

## Progres UI 

- Dipakai untuk `**instal**`, `**modules**`, dan `**npm instal**`.
- Stylesheet `**npm.css**` dimuat lewat `**NXUI.NexaStylesheet.Dom**` bila tersedia.
- Interval animasi dihentikan lewat `**destroy()**` setelah operasi selesai.

---

## `stop` dan `restart`


| Perintah           | Fungsi                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `**stop**`         | Menghentikan **semua** server static / proses terkait yang dikelola terminal (sesuai `**stopStaticServe`** di main).          |
| `**stop 4000**`    | Hanya menghentikan server di **port 4000**.                                                                                   |
| `**stop npm`**     | Menghentikan `**npm run dev**` yang terikat **folder cwd** saat ini (henti per-root proyek).                                  |
| `**restart`**      | Meminta **port**, lalu **stop + start** ulang untuk server di port itu (root dari server yang jalan atau **cwd** jika perlu). |
| `**restart 4000`** | Restart langsung di port **4000**.                                                                                            |


---

## Perintah lain (ringkas)


| Perintah                   | Fungsi                                         |
| -------------------------- | ---------------------------------------------- |
| `**help`**                 | Daftar perintah dan deskripsi singkat.         |
| `**clear**` / `**cls**`    | Kosongkan isi layar terminal.                  |
| `**date**`                 | Waktu saat ini.                                |
| `**whoami**`               | Nama pengguna baris perintah.                  |
| `**login**` / `**logout**` | Alur autentikasi (sesuai integrasi aplikasi).  |
| `**user**`                 | Informasi akses pengguna (jika data tersedia). |


---

## Hubungan Express, Electron, dan browser

- **Express** di aplikasi Nexa/Electron dijalankan dari `**index.js`** root (static, SPA, API) — ini **terpisah** dari server “folder proyek” yang Anda hidupkan lewat `**start` / `dev`**.
- `**config.js**` mengatur URL / port **aplikasi Nexa**; jangan menyamakan port itu dengan **port proyek** di terminal kecuali Anda sengaja mengatur demikian.
- File `**.htaccess`** menandai proyek yang biasa di-serve **Apache**; di stack Node, aturan setara biasanya di `**index.js`** / middleware.
- Untuk melihat **Nexa** di browser: jalankan `**npm start`** atau `**node index.js**` dari root Nexa, lalu buka URL di `**config.js**`.

---



