#!/usr/bin/env node

/**
 * Script untuk mengubah name, slug, dan version di app.json
 * Dapat juga sinkronisasi dengan package.json
 * Usage: node scripts/update-app-config.js --name "NamaBaru" --slug "slug-baru" --version "1.0.1" --sync-package
 * atau: npm run update:app-config -- --name "NamaBaru" --slug "slug-baru" --version "1.0.1" --sync-package
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' && args[i + 1]) {
    config.name = args[i + 1];
    i++;
  } else if (args[i] === '--slug' && args[i + 1]) {
    config.slug = args[i + 1];
    i++;
  } else if (args[i] === '--version' && args[i + 1]) {
    config.version = args[i + 1];
    i++;
  } else if (args[i] === '--package-name' && args[i + 1]) {
    config.packageName = args[i + 1];
    i++;
  } else if (args[i] === '--android-package' && args[i + 1]) {
    config.androidPackage = args[i + 1];
    i++;
  } else if (args[i] === '--port' && args[i + 1]) {
    config.port = args[i + 1];
    i++;
  } else if (args[i] === '--sync-package') {
    config.syncPackage = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node scripts/update-app-config.js [options]

Options:
  --name <value>         Set app name (expo.name di app.json)
  --slug <value>         Set app slug (expo.slug di app.json)
  --version <value>      Set app version (expo.version di app.json)
  --package-name <value> Set package name (name di package.json)
  --android-package <value> Set Android package (expo.android.package di app.json)
  --port <value>         Set port untuk semua scripts yang mengandung --port di package.json
  --sync-package         Sinkronkan version dengan package.json
  --help, -h             Show this help message

Catatan:
  - app.json (expo.name): Nama aplikasi yang ditampilkan di device/user
  - app.json (expo.android.package): Package identifier untuk Android (contoh: com.example.app)
  - package.json (name): Nama package npm untuk development
  - Version sebaiknya sinkron antara app.json dan package.json

Examples:
  # Update app.json saja
  node scripts/update-app-config.js --name "MyApp" --slug "my-app" --version "1.0.1"
  
  # Update app.json dan sinkronkan version ke package.json
  node scripts/update-app-config.js --version "1.0.1" --sync-package
  
  # Update app.json dan package.json sekaligus
  node scripts/update-app-config.js --name "MyApp" --version "1.0.1" --package-name "myapp" --sync-package
  
  # Update Android package name
  node scripts/update-app-config.js --android-package "com.example.myapp"
  
  # Update port di package.json scripts
  node scripts/update-app-config.js --port 8080
  
  # Update semua sekaligus
  node scripts/update-app-config.js --name "MyApp" --version "1.0.1" --android-package "com.example.myapp" --port 8080 --sync-package
    `);
    process.exit(0);
  }
}

// Path ke app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');

// Baca file app.json
let appJson;
try {
  appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
} catch (error) {
  console.error('Error membaca app.json:', error.message);
  process.exit(1);
}

// Validasi struktur
if (!appJson.expo) {
  console.error('Error: Struktur app.json tidak valid. Field "expo" tidak ditemukan.');
  process.exit(1);
}

// Helper function untuk mengkonversi slug menjadi android package format
function slugToAndroidPackage(slug) {
  // Jika slug sudah dalam format package name yang valid (mengandung titik dan dimulai dengan com.)
  // langsung gunakan dengan sedikit normalisasi
  if (slug.includes('.') && slug.toLowerCase().startsWith('com.')) {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '') // Hanya izinkan huruf, angka, dan titik
      .replace(/\.{2,}/g, '.') // Bersihkan titik ganda
      .replace(/^\.+|\.+$/g, ''); // Hapus titik di awal/akhir
  }
  
  // Jika slug belum dalam format package, konversi menjadi format android package: com.slug
  // - Ubah ke lowercase
  // - Ganti hyphen dengan titik
  // - Hapus karakter yang tidak valid untuk package name
  let packageName = slug
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '') // Hanya izinkan huruf, angka, titik, dan hyphen
    .replace(/-/g, '.'); // Ganti hyphen dengan titik
  
  // Hapus titik di awal jika ada
  packageName = packageName.replace(/^\.+/, '');
  
  // Pastikan dimulai dengan com.
  if (!packageName.startsWith('com.')) {
    packageName = 'com.' + packageName;
  }
  
  // Bersihkan titik ganda
  packageName = packageName.replace(/\.{2,}/g, '.');
  
  return packageName;
}

// Update values jika diberikan
let updated = false;
if (config.name) {
  appJson.expo.name = config.name;
  updated = true;
  console.log(`✓ Name diubah menjadi: "${config.name}"`);
}

if (config.slug) {
  appJson.expo.slug = config.slug;
  updated = true;
  console.log(`✓ Slug diubah menjadi: "${config.slug}"`);
  
  // Otomatis buat android package dari slug jika android package tidak diubah secara eksplisit
  if (!config.androidPackage) {
    // Pastikan objek android ada
    if (!appJson.expo.android) {
      appJson.expo.android = {};
    }
    const autoPackage = slugToAndroidPackage(config.slug);
    appJson.expo.android.package = autoPackage;
    updated = true;
    console.log(`✓ Android package otomatis dibuat dari slug: "${autoPackage}"`);
  }
}

if (config.version) {
  appJson.expo.version = config.version;
  updated = true;
  console.log(`✓ Version diubah menjadi: "${config.version}"`);
}

if (config.androidPackage) {
  // Pastikan objek android ada
  if (!appJson.expo.android) {
    appJson.expo.android = {};
  }
  appJson.expo.android.package = config.androidPackage;
  updated = true;
  console.log(`✓ Android package diubah menjadi: "${config.androidPackage}"`);
}

// Cek apakah ada perubahan di package.json (port, packageName, atau version untuk sync)
const hasPackageChanges = config.port || config.packageName || config.version;

if (!updated && !hasPackageChanges) {
  console.log('Tidak ada perubahan. Gunakan --name, --slug, --version, --android-package, atau --port untuk mengubah nilai.');
  console.log('Gunakan --help untuk melihat bantuan.');
  process.exit(0);
}

// Tulis kembali ke file app.json hanya jika ada perubahan
if (updated) {
  try {
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
    console.log('\n✓ app.json berhasil diperbarui!');
    console.log('\nNilai saat ini di app.json:');
    console.log(`  Name: "${appJson.expo.name}"`);
    console.log(`  Slug: "${appJson.expo.slug}"`);
    console.log(`  Version: "${appJson.expo.version}"`);
    if (appJson.expo.android && appJson.expo.android.package) {
      console.log(`  Android Package: "${appJson.expo.android.package}"`);
    }
  } catch (error) {
    console.error('Error menulis app.json:', error.message);
    process.exit(1);
  }
}

// Update package.json jika diperlukan
if (config.version || config.syncPackage || config.packageName || config.port) {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    console.error('Error membaca package.json:', error.message);
    process.exit(1);
  }
  
  // Validasi struktur
  if (!packageJson.scripts) {
    console.error('Error: Struktur package.json tidak valid. Field "scripts" tidak ditemukan.');
    process.exit(1);
  }
  
  let packageUpdated = false;
  
  // Update package name jika diberikan
  if (config.packageName) {
    packageJson.name = config.packageName;
    packageUpdated = true;
    console.log(`\n✓ Package name diubah menjadi: "${config.packageName}"`);
  }
  
  // Sinkronkan version ke package.json (otomatis jika versi diubah, atau jika --sync-package digunakan)
  if (config.version) {
    packageJson.version = config.version;
    packageUpdated = true;
    console.log(`✓ Package version disinkronkan menjadi: "${config.version}"`);
  } else if (config.syncPackage && appJson.expo.version) {
    // Jika hanya --sync-package tanpa --version, gunakan versi dari app.json
    packageJson.version = appJson.expo.version;
    packageUpdated = true;
    console.log(`✓ Package version disinkronkan dari app.json menjadi: "${appJson.expo.version}"`);
  }
  
  // Update port di semua scripts yang mengandung --port
  if (config.port) {
    // Validasi port adalah angka
    const portNum = parseInt(config.port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.error(`Error: Port "${config.port}" tidak valid. Port harus antara 1-65535.`);
      process.exit(1);
    }
    
    // Update semua script yang mengandung --port
    const scriptsToUpdate = Object.keys(packageJson.scripts);
    let updatedScripts = [];
    
    scriptsToUpdate.forEach(scriptName => {
      const scriptValue = packageJson.scripts[scriptName];
      if (scriptValue && scriptValue.includes('--port')) {
        // Replace port yang ada dengan port baru
        const updatedScript = scriptValue.replace(/--port\s+\d+/, `--port ${config.port}`);
        packageJson.scripts[scriptName] = updatedScript;
        updatedScripts.push(scriptName);
        packageUpdated = true;
      }
    });
    
    if (updatedScripts.length > 0) {
      console.log(`\n✓ ${updatedScripts.length} script(s) diupdate dengan port: ${config.port}`);
      updatedScripts.forEach(name => {
        console.log(`  - ${name}: "${packageJson.scripts[name]}"`);
      });
    } else {
      console.log(`\n⚠ Tidak ada script yang mengandung --port ditemukan.`);
    }
  }
  
  if (packageUpdated) {
    try {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
      console.log('\n✓ package.json berhasil diperbarui!');
      console.log('\nNilai saat ini di package.json:');
      console.log(`  Name: "${packageJson.name}"`);
      console.log(`  Version: "${packageJson.version}"`);
      if (config.port) {
        console.log(`\n  Scripts dengan port ${config.port}:`);
        Object.keys(packageJson.scripts).forEach(scriptName => {
          if (packageJson.scripts[scriptName].includes('--port')) {
            console.log(`    - ${scriptName}: "${packageJson.scripts[scriptName]}"`);
          }
        });
      }
    } catch (error) {
      console.error('Error menulis package.json:', error.message);
      process.exit(1);
    }
  }
}

