// Helper script untuk menampilkan Expo URL secara permanen
const { exec } = require('child_process');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const metroPort = 8081; // Default Expo Metro port
const webPort = 9002; // Web server port
const expoUrl = `exp://${ip}:${metroPort}`;
const httpUrl = `http://${ip}:${metroPort}/_expo/loading`;
const webUrl = `http://${ip}:${webPort}`;

console.log('\n');
console.log('═══════════════════════════════════════════════════════');
console.log('📱 EXPO CONNECTION INFO');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('🌐 Expo URL (untuk Expo Go app):');
console.log(`   ${expoUrl}`);
console.log('');
console.log('🔗 HTTP URL (untuk browser):');
console.log(`   ${httpUrl}`);
console.log('');
console.log('🌍 Web URL:');
console.log(`   ${webUrl}`);
console.log('');
console.log('📋 Cara menggunakan:');
console.log('   1. Copy URL: ' + expoUrl);
console.log('   2. Buka Expo Go app di HP');
console.log('   3. Pilih "Enter URL manually"');
console.log('   4. Paste URL yang sudah di-copy');
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('💡 Tips:');
console.log('   - Pastikan HP dan komputer di WiFi yang sama');
console.log('   - Jika tidak bisa connect, cek firewall Windows');
console.log('   - Port yang digunakan: ' + metroPort + ' (Metro), ' + webPort + ' (Web)');
console.log('');
console.log('═══════════════════════════════════════════════════════\n');

