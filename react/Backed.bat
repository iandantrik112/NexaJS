@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   BACKUP SCRIPT - React Native
echo ========================================
echo.

REM Set direktori target backup
set VERSION_DIR=D:\dev2026\version
set SOURCE_DIR=%~dp0
set SOURCE_DIR=%SOURCE_DIR:~0,-1%

REM Ambil versi dari package.json
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" "%SOURCE_DIR%\package.json"') do (
    set VERSION=%%a
    set VERSION=!VERSION:"=!
)

if "%VERSION%"=="" (
    echo ERROR: Tidak dapat membaca versi dari package.json
    goto :end
)

echo Versi saat ini: %VERSION%
echo Source: %SOURCE_DIR%
echo Target folder: %VERSION_DIR%
echo.

REM Set nama file backup dengan prefix
set BACKUP_NAME=apps-%VERSION%.zip
set BACKUP_PATH=%VERSION_DIR%\%BACKUP_NAME%

REM Cek apakah folder version ada, jika tidak buat
if not exist "%VERSION_DIR%" (
    echo Membuat folder version...
    mkdir "%VERSION_DIR%"
    if errorlevel 1 (
        echo ERROR: Gagal membuat folder %VERSION_DIR%
        goto :end
    )
)

REM Cek apakah file backup sudah ada
if exist "%BACKUP_PATH%" (
    echo.
    echo File backup %BACKUP_NAME% sudah ada!
    set /p OVERWRITE="Apakah Anda ingin menimpa file yang ada? (Y/N): "
    if /i not "!OVERWRITE!"=="Y" (
        echo Backup dibatalkan.
        goto :end
    )
    echo Menghapus file lama...
    del "%BACKUP_PATH%"
)

echo.
echo Membuat backup...
echo Mengecualikan: node_modules, android, .expo, .gradle, .vscode
echo Target: %BACKUP_PATH%
echo.
echo Mohon tunggu, proses ini mungkin memakan waktu...
echo.

REM Buat temporary PowerShell script
echo $ErrorActionPreference = 'Stop' > "%TEMP%\backup-script.ps1"
echo try { >> "%TEMP%\backup-script.ps1"
echo     $source = '%SOURCE_DIR%' >> "%TEMP%\backup-script.ps1"
echo     $destination = '%BACKUP_PATH%' >> "%TEMP%\backup-script.ps1"
echo     $exclude = @('node_modules', 'build', '.expo', '.gradle', 'android', '.vscode') >> "%TEMP%\backup-script.ps1"
echo     Write-Host 'Mempersiapkan backup dengan struktur folder...' -ForegroundColor Cyan >> "%TEMP%\backup-script.ps1"
echo     if (Test-Path $destination) { Remove-Item $destination -Force } >> "%TEMP%\backup-script.ps1"
echo     Add-Type -AssemblyName System.IO.Compression >> "%TEMP%\backup-script.ps1"
echo     Add-Type -AssemblyName System.IO.Compression.FileSystem >> "%TEMP%\backup-script.ps1"
echo     $zipArchive = [System.IO.Compression.ZipFile]::Open($destination, 'Create') >> "%TEMP%\backup-script.ps1"
echo     try { >> "%TEMP%\backup-script.ps1"
echo         $allItems = Get-ChildItem -Path $source -Recurse -Force >> "%TEMP%\backup-script.ps1"
echo         $items = $allItems ^| Where-Object { >> "%TEMP%\backup-script.ps1"
echo             $relativePath = $_.FullName.Substring($source.Length + 1) >> "%TEMP%\backup-script.ps1"
echo             $shouldExclude = $false >> "%TEMP%\backup-script.ps1"
echo             foreach ($pattern in $exclude) { >> "%TEMP%\backup-script.ps1"
echo                 if ($relativePath -like "$pattern\*" -or $relativePath -like "*\$pattern\*" -or $relativePath -eq $pattern) { >> "%TEMP%\backup-script.ps1"
echo                     $shouldExclude = $true >> "%TEMP%\backup-script.ps1"
echo                     break >> "%TEMP%\backup-script.ps1"
echo                 } >> "%TEMP%\backup-script.ps1"
echo             } >> "%TEMP%\backup-script.ps1"
echo             -not $shouldExclude >> "%TEMP%\backup-script.ps1"
echo         } >> "%TEMP%\backup-script.ps1"
echo         $files = $items ^| Where-Object { -not $_.PSIsContainer } >> "%TEMP%\backup-script.ps1"
echo         Write-Host "Ditemukan $($files.Count) file" -ForegroundColor Cyan >> "%TEMP%\backup-script.ps1"
echo         Write-Host 'Menambahkan file ke arsip zip...' -ForegroundColor Cyan >> "%TEMP%\backup-script.ps1"
echo         $count = 0 >> "%TEMP%\backup-script.ps1"
echo         foreach ($file in $files) { >> "%TEMP%\backup-script.ps1"
echo             $relativePath = $file.FullName.Substring($source.Length + 1) >> "%TEMP%\backup-script.ps1"
echo             [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $file.FullName, $relativePath, 'Optimal') ^| Out-Null >> "%TEMP%\backup-script.ps1"
echo             $count++ >> "%TEMP%\backup-script.ps1"
echo             if ($count %% 100 -eq 0) { >> "%TEMP%\backup-script.ps1"
echo                 Write-Host "  Progress: $count / $($files.Count) file..." -ForegroundColor Gray >> "%TEMP%\backup-script.ps1"
echo             } >> "%TEMP%\backup-script.ps1"
echo         } >> "%TEMP%\backup-script.ps1"
echo     } finally { >> "%TEMP%\backup-script.ps1"
echo         $zipArchive.Dispose() >> "%TEMP%\backup-script.ps1"
echo     } >> "%TEMP%\backup-script.ps1"
echo     Write-Host 'Backup berhasil dibuat!' -ForegroundColor Green >> "%TEMP%\backup-script.ps1"
echo     exit 0 >> "%TEMP%\backup-script.ps1"
echo } catch { >> "%TEMP%\backup-script.ps1"
echo     Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red >> "%TEMP%\backup-script.ps1"
echo     exit 1 >> "%TEMP%\backup-script.ps1"
echo } >> "%TEMP%\backup-script.ps1"

REM Jalankan PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%TEMP%\backup-script.ps1"
set PS_EXIT_CODE=%ERRORLEVEL%

REM Hapus temporary script
del "%TEMP%\backup-script.ps1" 2>nul

if %PS_EXIT_CODE% EQU 0 (
    echo.
    echo ========================================
    echo   BACKUP SELESAI!
    echo ========================================
    echo File: %BACKUP_PATH%
    if exist "%BACKUP_PATH%" (
        for %%A in ("%BACKUP_PATH%") do (
            set SIZE=%%~zA
            set /a SIZE_MB=!SIZE! / 1048576
            echo Ukuran: !SIZE_MB! MB ^(%%~zA bytes^)
        )
    )
    echo.
) else (
    echo.
    echo ========================================
    echo   BACKUP GAGAL!
    echo ========================================
    echo Periksa pesan error di atas.
    echo.
)

:end
pause

