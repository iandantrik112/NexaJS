@echo off
REM Script batch interaktif untuk Windows - bisa dijalankan dengan double-click
REM Memiliki 2 pilihan: menu lengkap atau hanya port

REM Ubah direktori kerja ke root project (parent dari folder scripts)
cd /d "%~dp0.."

title Update App Config
color 0A
cls

echo.
echo ========================================
echo  Update App Config - app.json and package.json
echo ========================================
echo.
echo Pilih menu:
echo.
echo   1. Menu Lengkap (name, slug, version, android package, port, package name, sync)
echo   2. Hanya Port (mengubah port di scripts start dan web)
echo.
echo.
set /p MENU_CHOICE="Masukkan pilihan (1 atau 2): "

if "%MENU_CHOICE%"=="1" goto MENU_LENGKAP
if "%MENU_CHOICE%"=="2" goto MENU_PORT
echo.
echo ERROR: Pilihan tidak valid!
echo.
pause
exit /b 1

:MENU_LENGKAP
echo.
echo ========================================
echo  Menu Lengkap
echo ========================================
echo.
echo Script ini akan membantu Anda mengubah:
echo   - app.json: name, slug, version, android.package
echo   - package.json: name, version, port (semua scripts yang mengandung --port)
echo.
echo Tekan Enter untuk skip field yang tidak ingin diubah
echo.

REM Baca input dari user
set /p INPUT_NAME="Masukkan Name baru (atau Enter untuk skip): "
set /p INPUT_SLUG="Masukkan Slug baru (atau Enter untuk skip): "
set /p INPUT_VERSION="Masukkan Version baru (atau Enter untuk skip): "
set /p INPUT_ANDROID_PACKAGE="Masukkan Android Package baru (contoh: com.example.app, atau Enter untuk skip): "
set /p INPUT_PORT="Masukkan Port baru (atau Enter untuk skip): "
set /p INPUT_PACKAGE_NAME="Masukkan Package Name baru (atau Enter untuk skip): "
set /p INPUT_SYNC="Sinkronkan version ke package.json? (y/n, default: n): "

echo.
echo Memproses...

REM Inisialisasi semua variabel
set "NAME_ARG="
set "SLUG_ARG="
set "VERSION_ARG="
set "ANDROID_PACKAGE_ARG="
set "PORT_ARG="
set "PACKAGE_NAME_ARG="
set "SYNC_ARG="

if not "%INPUT_NAME%"=="" set "NAME_ARG=--name %INPUT_NAME%"
if not "%INPUT_SLUG%"=="" set "SLUG_ARG=--slug %INPUT_SLUG%"
if not "%INPUT_VERSION%"=="" set "VERSION_ARG=--version %INPUT_VERSION%"
if not "%INPUT_ANDROID_PACKAGE%"=="" set "ANDROID_PACKAGE_ARG=--android-package %INPUT_ANDROID_PACKAGE%"
if not "%INPUT_PORT%"=="" set "PORT_ARG=--port %INPUT_PORT%"
if not "%INPUT_PACKAGE_NAME%"=="" set "PACKAGE_NAME_ARG=--package-name %INPUT_PACKAGE_NAME%"
if /i "%INPUT_SYNC%"=="y" set "SYNC_ARG=--sync-package"

REM Cek apakah ada minimal satu parameter
if "%NAME_ARG%"=="" if "%SLUG_ARG%"=="" if "%VERSION_ARG%"=="" if "%ANDROID_PACKAGE_ARG%"=="" if "%PORT_ARG%"=="" if "%PACKAGE_NAME_ARG%"=="" (
    echo.
    echo ERROR: Tidak ada perubahan yang dimasukkan!
    echo Silakan jalankan lagi dan masukkan minimal satu nilai.
    echo.
    pause
    exit /b 1
)
goto EXECUTE

:MENU_PORT
echo.
echo ========================================
echo  Menu Port
echo ========================================
echo.
echo Script ini akan mengubah port di semua package.json scripts yang mengandung --port:
echo   - Script "start": expo start --port [PORT]
echo   - Script "start:clear": expo start --port [PORT] --clear
echo   - Script "start:show": ... expo start --port [PORT]
echo   - Script "start:tunnel": expo start --tunnel --port [PORT]
echo   - Script "start:lan": expo start --lan --port [PORT]
echo   - Script "web": expo start --web --host --port [PORT]
echo   - Dan semua script lainnya yang mengandung --port
echo.
set /p INPUT_PORT="Masukkan Port baru: "

if "%INPUT_PORT%"=="" (
    echo.
    echo ERROR: Port harus diisi!
    echo.
    pause
    exit /b 1
)

echo.
echo Memproses...

REM Inisialisasi semua variabel (hanya PORT_ARG yang akan digunakan)
set "NAME_ARG="
set "SLUG_ARG="
set "VERSION_ARG="
set "ANDROID_PACKAGE_ARG="
set "PORT_ARG=--port %INPUT_PORT%"
set "PACKAGE_NAME_ARG="
set "SYNC_ARG="
goto EXECUTE

:EXECUTE

echo.
echo Menjalankan update...
echo.

node scripts\update-app-config.js %NAME_ARG% %SLUG_ARG% %VERSION_ARG% %ANDROID_PACKAGE_ARG% %PORT_ARG% %PACKAGE_NAME_ARG% %SYNC_ARG%

if errorlevel 1 (
    echo.
    echo ERROR: Script gagal dijalankan!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Selesai!
echo ========================================
echo.
pause

