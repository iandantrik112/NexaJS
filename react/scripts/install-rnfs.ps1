# ============================================
# 📦 Install expo-file-system - PowerShell Script
# ============================================
# Script untuk install expo-file-system menggunakan expo CLI
# 
# Cara penggunaan:
#   1. Buka PowerShell di folder project
#   2. Jalankan: .\scripts\install-rnfs.ps1
#   3. Atau: powershell -ExecutionPolicy Bypass -File .\scripts\install-rnfs.ps1
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📦 Installing expo-file-system..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm tidak ditemukan. Pastikan Node.js sudah terinstall." -ForegroundColor Red
    exit 1
}

# Check if expo CLI is available
try {
    $expoVersion = npx expo --version
    Write-Host "✅ Expo CLI version: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Expo CLI tidak ditemukan, akan menggunakan npm install" -ForegroundColor Yellow
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json tidak ditemukan. Pastikan Anda berada di root project." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Installing expo-file-system..." -ForegroundColor Yellow

# Install expo-file-system
try {
    # Try using expo install first (recommended for Expo projects)
    try {
        npx expo install expo-file-system
        Write-Host "✅ Menggunakan expo install (recommended)" -ForegroundColor Green
    } catch {
        # Fallback to npm install
        Write-Host "⚠️  Fallback ke npm install..." -ForegroundColor Yellow
        npm install expo-file-system
    }
    
    Write-Host ""
    Write-Host "✅ expo-file-system berhasil diinstall!" -ForegroundColor Green
    Write-Host ""
    
    # Check if installation was successful
    if (Test-Path "node_modules\expo-file-system") {
        Write-Host "✅ Package terverifikasi di node_modules/expo-file-system" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Package mungkin belum terinstall dengan benar." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "1. Rebuild aplikasi setelah install" -ForegroundColor White
    Write-Host "2. NexaDBJson.js siap digunakan!" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error saat install expo-file-system:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Coba jalankan manual:" -ForegroundColor Yellow
    Write-Host "  npx expo install expo-file-system" -ForegroundColor White
    Write-Host "  atau" -ForegroundColor White
    Write-Host "  npm install expo-file-system" -ForegroundColor White
    exit 1
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Selesai!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

