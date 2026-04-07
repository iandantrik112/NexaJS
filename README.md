# Terminal Nexa — pintasan keyboard & perintah proyek

Dokumentasi navigasi input, riwayat perintah, serta perintah `**start**`, `**dev**`, `**stop**`, `**servers**`, `**restart**`, `**instal**`, `**modules**`, dan `**npm instal**`. Termasuk deteksi **Expo** (`metro.config.js`), **pratinjau web** di jendela Electron, **tabel ASCII** (`**tabelRaw.js**` untuk `**servers**`), dan **progres UI** (`**NexaNpm.js**` / `**npm.css**`).

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


### Buat folder / file & hapus (`mkdir`, `touch`, `rm`, …)

Membutuhkan **Electron** + `electronAPI.mkdir` / `electronAPI.touchFile` / `electronAPI.removePath`. Tanpa **cwd**, path relatif ditolak — gunakan **`cd`** dulu atau path absolut (mis. `D:\folder`).

| Perintah | Fungsi |
| -------- | ------ |
| `**mkdir** …` | Membuat folder (dan induk bila perlu, seperti `mkdir -p`). Contoh: `mkdir src` atau `mkdir D:\proyek\baru`. |
| `**touch** …` | Membuat **file kosong** (folder induk dibuat bila belum ada). Jika file sudah ada, **memperbarui waktu modifikasi** (bukan folder — jika path itu folder, akan error). |
| `**mkfile** …` | Alias **`touch`**. |
| `**rm** …` | Menghapus **file** atau **folder kosong**. Folder yang masih berisi akan gagal — pakai `**rmr**`. |
| `**rmr** …` | Menghapus **folder beserta isi** (rekursif). Hati-hati: tidak bisa dibatalkan dari terminal. |
| `**del** …` | Alias **`rm`** (penghapusan file / folder kosong). |

Untuk mengisi file dengan **teks tertentu**, gunakan editor atau salin isi dari luar terminal; perintah ini hanya membuat file **kosong** / menyentuh timestamp.

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

**Sama persis dengan `dev`** — alur “tanpa wajib `.htaccess`”: mendeteksi folder (**Expo** / `metro.config.js`, Electron-only, `server.js`, atau static), lalu menjalankan mode yang sesuai (termasuk `**npm run dev**` bila hanya `**electron.js**` tanpa `**server.js**`, dan bukan kasus Expo).

### `start` (tanpa argumen) — jalur singkat **Expo web**

Jika di **cwd** ada `**metro.config.js`** (file) dan **tidak** ada `**server.js**`, `**start**` memakai **jalur singkat**: menjalankan `**npx expo start --web --port …**` (setara `**dev**` untuk kasus itu). **cwd** proyek = folder Metro/Expo (bukan folder instal Nexa). Log di konsol Electron: **`[nexa-expo]`**. URL dev dibuka di **jendela Electron pratinjau** (`**openMobilePreview**`), bukan browser sistem — kecuali pratinjau gagal, lalu fallback **`openExternal`**.

### `start` (tanpa argumen) di folder **hanya Electron**

Jika di **cwd** ada `**electron.js`** dan **tidak** ada `**server.js**`, dan **bukan** kasus Expo di atas, `**start**` memakai **jalur singkat**: `**npm run dev**`. Log: **`[nexa-npm-dev]`** (stdout disanitasi agar konsol Windows tidak berantakan). Proses main menunggu **sinyal siap** di log (mis. `Express server running`, `Electron] Memuat`, Vite/webpack) sebelum menganggap startup selesai — supaya **baris progres terminal** tidak hilang sebelum jendela/server proyek benar-benar jalan.

### Alur `start` umum (setelah pengecekan di atas)

1. Memanggil Electron untuk mengecek `**.htaccess**` di **cwd**.
2. **Jika ada `.htaccess`** — mode “proyek Apache-style”: diminta **port** (Enter = default di atas), `**startStaticServe`** melayani folder di `**127.0.0.1:<port>**`, browser dibuka ke URL itu.
3. **Jika tidak ada `.htaccess`** — dibaca isi folder:
  - Ada `**server.js**` — mode **Node**: `node server.js` dengan `**PORT`** = port pilihan; browser ke URL lokal proyek (bukan halaman Nexa).
  - Ada `**metro.config.js**` (tanpa `server.js`) — mode **Expo web**: `**npx expo start --web**`; main menunggu teks bundel **`Web Bundled`** (atau timeout) sebelum mengakhiri IPC — supaya progres **`start:`** di terminal tidak hilang saat Metro masih mengompilasi.
  - Ada `**electron.js**` saja — sudah ditangani **jalur singkat** di atas (return lebih awal).
  - **Tidak ada** penanda yang dikenali — pesan **“Server tidak ditemukan”** (termasuk `metro.config.js` dalam daftar) dan saran `**dev [port]`** untuk folder statis tanpa penanda itu.

### `start <url>`

Contoh: `**start http://127.0.0.1:3007**` — lewati prompt port; URL dipakai untuk membuka browser dan, bila URL HTTP lokal ke `127.0.0.1` / `localhost`, memicu server internal lewat `**startStaticServe**` sesuai root folder.

---

## Perintah `dev`

- `**dev**` = `**start dev**` (satu implementasi bersama di renderer).
- `**dev [port]**` — port opsional; jika tidak diberikan, prompt memakai **port default proyek** (lihat bagian di atas).

Perilaku menurut isi folder:


| Isi cwd (ringkas)                          | Perilaku utama                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `metro.config.js` tanpa `server.js`        | **Expo web**: `**npx expo start --web**`, pratinjau di jendela Electron; log `[nexa-expo]`                    |
| `electron.js` tanpa `server.js` (bukan RN) | `**npm run dev**` (desktop); tunggu sinyal siap di log sebelum IPC selesai                                   |
| `server.js`                                | Static serve / `**node server.js**` sesuai main (mode `node`), lalu buka browser ke URL proyek               |
| Folder statis / campuran                   | Express static di proses Electron + buka browser                                                            |


Tidak perlu menjalankan `http-server` manual untuk kasus yang ditangani Nexa; aturan `**.htaccess**` tidak dipakai di cabang `**dev**` (beda dengan `**start**` yang pertama-tama mengecek `.htaccess`).

---

## Perintah `instal` dan `install`

Menyalin **isi penuh** subfolder `**web`**, `**node**`, `**eletron**`, atau `**react**` dari repositori **NexaJS** (arsip ZIP GitHub) ke **cwd** (bukan subfolder baru di dalam cwd).


| Contoh                                       | Arti                                                     |
| -------------------------------------------- | -------------------------------------------------------- |
| `**instal web`**                             | Paket **web**, branch **main** (terbaru default).        |
| `**instal web@v1.0.0`**                      | Paket **web**, tag `**v1.0.0`**.                         |
| `**instal node**`                            | Paket **node**.                                          |
| `**instal react**`                           | Paket **react**.                                         |
| `**instal electron`** / `**instal eletron**` | Paket **eletron** di repo (nama folder repo: `eletron`). |


- `**install`** — alias ejaan Inggris, perilaku sama dengan `**instal**`.
- Wajib `**cd**` ke folder tujuan; berkas dengan nama sama di cwd akan tertimpa.
- Saat unduhan/ekstraksi berjalan, tampil **progres visual** (komponen `**NexaNpm`**: bar, spinner, fase teks). **Tidak menampilkan URL** di UI progres.
- Setelah sukses: pesan hijau mis. **“Sukses menginstal NexaJS untuk …”** (tanpa baris “Sumber” / URL).
- Baris progres dihapus dari DOM setelah selesai agar **tidak meninggalkan baris kosong** di riwayat.

---

## Perintah `modules`

Hanya memperbarui `**assets/modules`** proyek Anda dari jalur `**{web\|node\|eletron\|react}/assets/modules**` di arsip NexaJS yang sama.


| Contoh                   | Tujuan di disk                                                  |
| ------------------------ | --------------------------------------------------------------- |
| `**modules web**`        | `**cwd/assets/modules**` ← isi `**web/assets/modules**` (main). |
| `**modules web@v1.0.0**` | Sama, dari tag yang diminta.                                    |
| `**modules node**`       | Dari `**node/assets/modules**`.                                 |
| `**modules react**`      | Dari `**react/assets/modules**`.                                |
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

**Urutan tipikal** setelah `**instal node`** / `**instal react`** / `**instal electron**`: `**npm instal**`, lalu `**start**` / `**dev**` jika relevan.

---

## Progres UI (`NexaNpm.js` + `npm.css`)

### Unduhan & npm install

- Dipakai untuk `**instal**`, `**modules**`, dan `**npm instal**` / `**npm install**`.
- Stylesheet `**npm.css**` dimuat lewat `**NXUI.NexaStylesheet.Dom**` bila tersedia.
- Interval animasi dihentikan lewat `**destroy()**` setelah operasi selesai; baris progres dihapus dari DOM agar **tidak meninggalkan baris kosong** (`**nexaRemoveTerminalProgressRow**`).

### `start` dan `stop` (serta `dev` saat memanggil server)

- Baris progres bergaya NexaNpm dengan prefiks **`start:`** atau **`stop:`** (kelas `**.nexa-npm-term-wait**` di `**npm.css**`), spinner + fase teks berganti (ipc → spawn/listen → …).
- Setelah HTML progres ditulis, renderer menunggu **satu frame** (`requestAnimationFrame` ganda, fallback timeout) agar tampilan **sempat muncul** sebelum IPC panjang.
- **Expo web**: proses main menunggu **`Web Bundled`** di stdout Metro (hingga batas waktu) sebelum mengembalikan sukses — sejajar dengan munculnya log bundel di konsol Electron.
- **`npm run dev` (Electron)**: main menunggu pola log siap (mis. **Express server running**, **Electron] Memuat**, Vite/webpack) sebelum mengembalikan sukses — sejajar dengan jendela/server proyek.
- Setelah IPC selesai, baris **`start:`** / **`stop:`** dihapus; muncul pesan sukses / bantuan seperti biasa.

---

## `stop` dan `restart`


| Perintah           | Fungsi                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `**stop**`         | Menghentikan **semua** server static, `**node server.js**` per port, dan **npm run dev / Expo web** yang dilacak Nexa (`**stopStaticServe**`). |
| `**stop 4000**`    | Menghentikan server di **port 4000** dan **Expo web** Nexa di port itu jika ada.                                                |
| `**stop npm`**     | Menghentikan **`npm run dev`** atau **Expo web** Nexa untuk **cwd** (path dinormalisasi di Windows).                          |
| `**restart`**      | Meminta **port**, lalu **stop + start** ulang untuk server di port itu (root dari server yang jalan atau **cwd** jika perlu). |
| `**restart 4000`** | Restart langsung di port **4000**.                                                                                            |

Proses hanya terlacak jika dimulai lewat **`start` / `dev`** di **sesi Nexa yang sama**. Jika `**stop**` tidak menemukan apa pun, coba **`stop npm`** di folder proyek atau **`stop <port>`**. Saat menunggu IPC, tampil progres **`stop:`** (bagian **Progres UI**).

- Pesan **`stop`** (semua) dirangkum singkat, mis. **`Dihentikan · port 3008 · 2 proyek`** — tanpa memuat daftar path panjang; detail folder pakai **`servers`**.
- **`stop npm`**: pesan singkat **`Expo dihentikan`** / **`npm dev dihentikan`** (tanpa baris path).

---

## Perintah `servers`

| Perintah     | Fungsi |
| ------------ | ------ |
| `**servers**` | Menggabungkan **IndexedDB** store **`bucketsServer`** (sama pola persistensi dengan riwayat perintah di **`bucketsCli`**) dan **proses live** dari **Electron** (`**getStaticServeStatus**`). |

- Setiap **`start` / `dev`** yang sukses menulis satu entri ke **`bucketsServer`** (`**NXUI.ref.set**`): jenis (`static`, `node`, `npm-dev`, `expo-web`), port bila ada, root folder, status `running`.
- **`stop`** / **`stop npm`** memperbarui entri yang cocok menjadi `stopped`.
- Kolom status pada tabel: **`jalan`** (proses ada di main), **`tidak jalan`** (IndexedDB masih `running` tapi tidak ada di main — disinkronkan ke `stopped`), **`berhenti`**, atau **`tersimpan`** bila **Electron** tidak tersedia (hanya isi IndexedDB).

### Tampilan tabel (`tabelRaw.js`)

- Output dirender dengan **`createTable`** dari `**tabelRaw.js**`: tabel **ASCII** (border + header) di dalam `**<pre class="command-line-start-help …">**`.
- Kolom: **`#`** (nomor urut), **`Jenis`**, **`Port`** (`—` jika tidak ada, mis. **npm dev**), **`Status`**, **`Folder`** (path root proyek). Path panjang bisa dipotong sesuai opsi `**maxWidth**` di kode.
- Agar **garis tabel sejajar**, baris output **`servers`** memakai **`hideTime()`** (timestamp `[jam:menit:detik]` tidak ditampilkan di baris itu) dan **`block`** pada entry — pola sama seperti **`ls`** / bantuan **`start`** yang memakai tabel atau `**<pre>**` lebar penuh.

Server **Express Nexa** (`index.js`) tidak masuk daftar ini — hanya **proyek folder** dari terminal.

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
- **Expo / React Native (web)** dari terminal Nexa: dev di **localhost**; URL dibuka lewat **`openMobilePreview`** (jendela Electron), fallback **`openExternal`** (browser) jika perlu.

---



