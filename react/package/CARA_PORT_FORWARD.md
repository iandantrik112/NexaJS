# Cara Setup Port Forwarding untuk Expo Go

## Masalah
Error: "Network request failed" - request tidak bisa mengakses `localhost`

## Solusi: Port Forwarding dengan ADB

### Langkah 1: Install Android SDK Platform Tools

Jika belum punya ADB:

1. Download: https://developer.android.com/studio/releases/platform-toolshttps://developer.android.com/studio/releases/platform-tools
2. Extract ke folder (misalnya `C:\platform-tools`)
3. Atau install Android Studio (sudah include ADB)

### Langkah 2: Aktifkan USB Debugging di Android

1. Settings > About phone
2. Tap "Build number" 7 kali
3. Settings > Developer options
4. Aktifkan "USB debugging"
5. Hubungkan device via USB
6. Pilih "Allow USB debugging"

### Langkah 3: Setup Port Forwarding

**Opsi A: Gunakan script (jika ADB sudah di PATH)**
- Double-click `PORT_FORWARD.bat`

**Opsi B: Manual (jika ADB tidak di PATH)**

Cari lokasi ADB:
- `C:\Users\[YourName]\AppData\Local\Android\Sdk\platform-tools\adb.exe`
- Atau `C:\platform-tools\adb.exe` (jika download manual)

Jalankan di PowerShell/CMD:
```bash
# Ganti path sesuai lokasi ADB Anda
C:\Users\ianob\AppData\Local\Android\Sdk\platform-tools\adb.exe reverse tcp:80 tcp:80

# Verifikasi
C:\Users\ianob\AppData\Local\Android\Sdk\platform-tools\adb.exe reverse --list
```

Harus muncul:
```
tcp:80 tcp:80
```

### Langkah 4: Test Koneksi

1. Buka browser di Android device
2. Akses: `http://localhost/dev/api/oauth/signin`
3. Jika bisa diakses → port forwarding berhasil ✅
4. Jika tidak bisa → cek:
   - Device terhubung via USB?
   - USB debugging aktif?
   - Server berjalan di komputer?

### Langkah 5: Reload Aplikasi

1. Tekan `r` di terminal Metro
2. Atau shake device > Reload
3. Coba login lagi

## Troubleshooting

### ADB tidak ditemukan
- Install Android Studio, atau
- Download Android SDK Platform Tools manual

### Port forwarding tidak bekerja
```bash
# Restart ADB
adb kill-server
adb start-server
adb reverse tcp:80 tcp:80
```

### Device tidak terdeteksi
```bash
adb devices
```
Jika muncul "unauthorized", cek device dan pilih "Allow USB debugging"

### Port forwarding hilang
- Port forwarding hanya aktif selama USB terhubung
- Jika disconnect, jalankan `adb reverse tcp:80 tcp:80` lagi

