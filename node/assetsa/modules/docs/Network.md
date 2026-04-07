# NexaNetwork Documentation

## Overview

**NexaNetwork** adalah modul JavaScript untuk monitoring status koneksi internet, kecepatan jaringan, stabilitas koneksi, dan analisis detail jaringan real-time. Modul ini membantu aplikasi merespons perubahan kualitas jaringan dengan cerdas.

### Fitur Utama

- ✅ **Real-time Monitoring** - Monitoring status online/offline berkelanjutan
- ✅ **Connection Type Detection** - Deteksi jenis koneksi (4G, 3G, 2G, slow-2G)
- ✅ **Speed Estimation** - Estimasi kecepatan koneksi berdasarkan effective type
- ✅ **Stability Analysis** - Analisis stabilitas koneksi (Stabil, Cukup Stabil, Tidak Stabil)
- ✅ **History Tracking** - Menyimpan history perubahan koneksi (50 entri terakhir)
- ✅ **Event Callbacks** - Callback untuk perubahan status, kualitas, dan data monitoring
- ✅ **Data Saver Detection** - Mendeteksi mode penghematan data di device
- ✅ **Detailed Reports** - Report lengkap stabilitas koneksi dan uptime

---

## Instalasi

### Import Module

```javascript
import { NexaNetwork } from "./assets/modules/Network/NexaNetwork.js";

// Inisialisasi
const network = new NexaNetwork();
```

### CDN (jika tersedia)

```html
<script src="https://cdn.nexa.local/NexaNetwork.js"></script>
<script>
  const network = new NexaNetwork();
</script>
```

---

## Usage / Penggunaan

### Basic Usage

```javascript
const network = new NexaNetwork();

// Cek apakah online
if (network.status()) {
  console.log("✅ Device online");
} else {
  console.log("❌ Device offline");
}

// Dapatkan info koneksi saat ini
const connectionInfo = network.getConnectionInfo();
console.log(connectionInfo);
// Output:
// {
//   online: true,
//   type: '4g',
//   speed: '> 1.5 Mbps',
//   downlink: '10 Mbps',
//   rtt: '50 ms',
//   dataSaver: 'Tidak Aktif'
// }
```

### Event: Status Change (Online/Offline)

Dipicu saat status berubah dari online ke offline atau sebaliknya.

```javascript
const network = new NexaNetwork();

// Saat status berubah (hanya setelah initialized = 3 detik)
network.onStatusChange = (isOnline, connectionInfo, userTriggered) => {
  if (isOnline) {
    console.log("🟢 Kembali Online!");
    console.log("Koneksi:", connectionInfo.type);

    // Refresh data, sync, etc
    syncData();
  } else {
    console.log("🔴 Internet Offline");

    // Show offline UI
    showOfflineMessage();
  }
};

function syncData() {
  console.log("Syncing data...");
}

function showOfflineMessage() {
  alert("Koneksi internet terputus. Mode offline aktif.");
}
```

### Event: Quality Change

Dipicu saat kualitas jaringan berubah (Baik → Sedang → Buruk, dst).

```javascript
const network = new NexaNetwork();

// Saat kualitas koneksi berubah
network.onQualityChange = (quality, stabilityStatus, userTriggered) => {
  console.log(`Kualitas: ${quality}, Status Stabilitas: ${stabilityStatus}`);

  switch (quality) {
    case "Baik":
      console.log("🟢 Jaringan bagus - streaming video 4K OK");
      loadHighQualityAssets();
      break;
    case "Sedang":
      console.log("🟡 Jaringan sedang - gunakan video HD");
      loadMediumQualityAssets();
      break;
    case "Buruk":
      console.log("🔴 Jaringan buruk - mode hemat data");
      loadLowQualityAssets();
      break;
  }
};

function loadHighQualityAssets() {
  /* ... */
}
function loadMediumQualityAssets() {
  /* ... */
}
function loadLowQualityAssets() {
  /* ... */
}
```

### Event: Status Data (untuk tabel)

Dipicu setiap 10 detik untuk update tabel monitoring.

```javascript
const network = new NXUI.Network();

// Update tabel status real-time
network.onStatusData = (tableData) => {
  console.table(tableData);
  // tableData format:
  // [
  //   { label: 'Status', value: 'Online' },
  //   { label: 'Jenis Koneksi', value: '4g' },
  //   { label: 'Kecepatan', value: '> 1.5 Mbps' },
  //   { label: 'Downlink', value: '10 Mbps' },
  //   { label: 'RTT', value: '50 ms' },
  //   { label: 'Stabilitas', value: 'Stabil' },
  //   { label: 'Kualitas', value: 'Baik' },
  //   { label: 'Waktu Check', value: '14:30:45' }
  // ]

  updateTableUI(tableData);
};

function updateTableUI(data) {
  const table = document.getElementById("network-status-table");
  table.innerHTML = data
    .map((d) => `<tr><td>${d.label}</td><td>${d.value}</td></tr>`)
    .join("");
}
```

---

## API Reference

### Constructor

```javascript
const network = new NexaNetwork();
```

Otomatis inisialisasi monitoring dan event listeners. `isInitialized` menjadi `true` setelah 3 detik.

### Methods

#### `status()`

Cek apakah device online atau offline.

```javascript
const isOnline = network.status(); // true atau false
```

#### `getConnectionInfo()`

Dapatkan informasi koneksi saat ini.

```javascript
const info = network.getConnectionInfo();
// Returns:
// {
//   online: boolean,
//   type: string,           // '4g', '3g', '2g', 'slow-2g', 'unknown'
//   speed: string,          // '> 1.5 Mbps', 'unknown', dll
//   downlink: string,       // 'X Mbps' atau 'unknown'
//   rtt: string,            // 'X ms' atau 'unknown'
//   saveData: boolean,
//   dataSaver: string       // 'Aktif' atau 'Tidak Aktif'
// }
```

#### `getDetailedInfo()`

Dapatkan info koneksi + analisis stabilitas.

```javascript
const detailed = network.getDetailedInfo();
// Returns:
// {
//   online: true,
//   type: '4g',
//   speed: '> 1.5 Mbps',
//   downlink: '10 Mbps',
//   rtt: '50 ms',
//   stability: {
//     status: 'Stabil',
//     quality: 'Baik'
//   }
// }
```

#### `getHistory()`

Dapatkan history perubahan koneksi (max 50 entri).

```javascript
const history = network.getHistory();
// Returns: Array of connection snapshots dengan timestamp
// [
//   { timestamp: Date, online: true, type: '4g', speed: '...', ... },
//   { timestamp: Date, online: true, type: '4g', speed: '...', ... },
//   ...
// ]
```

#### `getStabilityReport()`

Dapatkan report lengkap stabilitas koneksi.

```javascript
const report = network.getStabilityReport();
// Returns:
// {
//   total: 50,                    // Total checks
//   uptime: '98%',                // Persentase online
//   types: ['4g', '3g'],          // Jenis koneksi yang terdeteksi
//   stability: 'Stabil',          // Status stabilitas
//   quality: 'Baik'               // Kualitas koneksi
// }
```

#### `compareConnections(old, current)`

Bandingkan dua status koneksi (internal, bisa digunakan eksternal).

```javascript
const old = { online: true, type: "4g", speed: "> 1.5 Mbps" };
const current = { online: true, type: "3g", speed: "700 Kbps - 1.5 Mbps" };

const comparison = network.compareConnections(old, current);
// Returns:
// {
//   hasChanges: true,
//   message: 'Koneksi: 4g → 3g, Kecepatan: > 1.5 Mbps → 700 Kbps - 1.5 Mbps'
// }
```

#### `analyzeStability()`

Analisis stabilitas koneksi berdasarkan history (internal).

```javascript
const stability = network.analyzeStability();
// Returns:
// {
//   status: 'Stabil',     // 'Stabil', 'Cukup Stabil', 'Tidak Stabil', 'Sangat Buruk'
//   quality: 'Baik'       // 'Baik', 'Sedang', 'Buruk', 'Sangat Buruk'
// }
```

### Properties

| Property          | Type     | Description                                 |
| ----------------- | -------- | ------------------------------------------- |
| `online`          | boolean  | Status online/offline saat ini              |
| `history`         | Array    | History perubahan koneksi (max 50)          |
| `lastCheck`       | Object   | Data check terakhir                         |
| `isInitialized`   | boolean  | Flag inisialisasi selesai (true setelah 3s) |
| `onStatusChange`  | Function | Callback saat status berubah                |
| `onQualityChange` | Function | Callback saat kualitas berubah              |
| `onStatusData`    | Function | Callback untuk update tabel (setiap 10s)    |

### Callbacks

#### `onStatusChange(isOnline, connectionInfo, userTriggered)`

- `isOnline`: boolean - Status online/offline baru
- `connectionInfo`: Object - Informasi koneksi terbaru
- `userTriggered`: boolean - Selalu `true` (event user/browser)

#### `onQualityChange(quality, stabilityStatus, userTriggered)`

- `quality`: string - 'Baik', 'Sedang', 'Buruk', 'Sangat Buruk'
- `stabilityStatus`: string - 'Stabil', 'Cukup Stabil', 'Tidak Stabil', 'Sangat Buruk'
- `userTriggered`: boolean - Selalu `true`

#### `onStatusData(tableData)`

- `tableData`: Array<{label, value}> - Data untuk tabel UI

---

## Connection Types

### Effective Type

NexaNetwork mengdeteksi tipe koneksi berdasarkan Browser Network Information API:

| Type      | Kecepatan Estimasi  |
| --------- | ------------------- |
| `slow-2g` | < 50 Kbps           |
| `2g`      | 50-70 Kbps          |
| `3g`      | 700 Kbps - 1.5 Mbps |
| `4g`      | > 1.5 Mbps          |
| `unknown` | Tidak terdeteksi    |

### Stabilitas Measurement

Stabilitas dianalisis berdasarkan 6 check terakhir (~1 menit):

| Kondisi               | Status       | Quality      |
| --------------------- | ------------ | ------------ |
| 100% online, 1 type   | Stabil       | Baik         |
| 80%+ online, ≤2 types | Cukup Stabil | Sedang       |
| 50%+ online           | Tidak Stabil | Buruk        |
| < 50% online          | Sangat Buruk | Sangat Buruk |

---

## Advanced Features

### Automatic Monitoring Interval

```javascript
// Check dilakukan setiap 10 detik
// Check pertama setelah 1 detik inisialisasi
// Initialization selesai setelah 3 detik
```

### History Management

```javascript
const network = new NexaNetwork();

// History otomatis disimpan setiap 10 detik
// Maksimal 50 entri (oldest di-shift otomatis)

// Akses history:
const history = network.getHistory();
console.log(`Total records: ${history.length}`);
console.log(`Oldest: ${history[0].timestamp}`);
console.log(`Newest: ${history[history.length - 1].timestamp}`);
```

### Data Saver Mode Detection

```javascript
const network = new NexaNetwork();
const info = network.getConnectionInfo();

if (info.saveData) {
  console.log("Data Saver mode aktif di device");
  console.log("Disable animations, reduce quality, minimize requests");

  // Adaptive loading strategy
  loadLowBandwidthContent();
}
```

### Real-time Status Updates

```javascript
const network = new NexaNetwork();

// Setiap 10 detik, update otomatis
network.onStatusData = (tableData) => {
  // Render table dengan data terbaru
  renderStatusTable(tableData);
};

// Untuk chart/graph real-time
setInterval(() => {
  const history = network.getHistory();
  const speedHistory = history.map((h) => {
    const speedValue = parseSpeedToNumber(h.speed);
    return { time: h.timestamp, speed: speedValue };
  });
  updateSpeedChart(speedHistory);
}, 10000);

function parseSpeedToNumber(speedStr) {
  // Extract number dari "700 Kbps - 1.5 Mbps", dll
  const match = speedStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
}
```

---

## Use Cases

### 1. Adaptive Streaming

```javascript
const network = new NexaNetwork();

network.onQualityChange = (quality, stability) => {
  const videoPlayer = document.getElementById("video-player");

  switch (quality) {
    case "Baik":
      videoPlayer.src = "video-4k.mp4";
      break;
    case "Sedang":
      videoPlayer.src = "video-hd.mp4";
      break;
    case "Buruk":
      videoPlayer.src = "video-sd.mp4";
      break;
  }
};
```

### 2. Offline Detection & Sync

```javascript
const network = new NexaNetwork();
const pending = [];

network.onStatusChange = (isOnline) => {
  if (isOnline && pending.length > 0) {
    console.log(`Syncing ${pending.length} pending requests...`);
    syncPendingRequests();
  }
};

// Store failed requests
async function makeRequest(url, data) {
  try {
    return await fetch(url, { method: "POST", body: JSON.stringify(data) });
  } catch (e) {
    if (!network.status()) {
      pending.push({ url, data, timestamp: Date.now() });
      console.log("Request pending (offline)");
    }
  }
}
```

### 3. Network Monitoring Dashboard

```javascript
const network = new NexaNetwork();

// Real-time status monitor
network.onStatusData = (tableData) => {
  updateMonitoringTable(tableData);
};

// Stability report
function displayReport() {
  const report = network.getStabilityReport();
  document.getElementById("uptime").textContent = report.uptime;
  document.getElementById("stability").textContent = report.stability;
  document.getElementById("types").textContent = report.types.join(", ");
}

// Update setiap menit
setInterval(displayReport, 60000);
```

### 4. Bandwidth-aware Loading

```javascript
const network = new NexaNetwork();

async function loadAssets() {
  const info = network.getConnectionInfo();

  const assetConfig = {
    "4g": { images: "hq", fonts: "all", scripts: "all" },
    "3g": { images: "mq", fonts: "core", scripts: "critical" },
    "2g": { images: "lq", fonts: "none", scripts: "critical" },
  };

  const config = assetConfig[info.type] || assetConfig["2g"];
  return await loadWithConfig(config);
}
```

### 5. Error Recovery Strategy

```javascript
const network = new NexaNetwork();

function apiCall(url, options = {}) {
  const retries = options.retries || 3;
  const delay = options.delay || 1000;

  return fetch(url, options).catch(async (error) => {
    if (!network.status()) {
      console.log("Offline - queueing request");
      return queueRequest(url, options);
    }

    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return apiCall(url, { ...options, retries: retries - 1 });
    }

    throw error;
  });
}
```

---

## Browser Compatibility

### Network Information API Support

| Browser    | Support         | Notes             |
| ---------- | --------------- | ----------------- |
| Chrome 61+ | ✅ Full         | Recommended       |
| Edge 79+   | ✅ Full         | Chromium-based    |
| Opera 48+  | ✅ Full         | Chromium-based    |
| Safari     | ⚠️ Limited      | iOS 13+ (partial) |
| Firefox    | ❌ Experimental | Behind flag       |

### Fallback Behavior

```javascript
const network = new NexaNetwork();

// Jika browser tidak support Network Information API:
const info = network.getConnectionInfo();
// {
//   online: true,         // navigator.onLine
//   type: 'unknown',      // Fallback
//   speed: 'unknown',
//   downlink: 'unknown',
//   rtt: 'unknown',
//   dataSaver: 'Tidak Tersedia'
// }
```

---

## Troubleshooting

### "Selalu Unknown"

Penyebab: Browser tidak support Network Information API

**Solusi**:

```javascript
const network = new NexaNetwork();

// Check support
const isSupported = "connection" in navigator;

if (!isSupported) {
  console.warn("Network Information API tidak didukung");
  // Fallback ke navigator.onLine saja
}
```

### Event Callback Tidak Dipicu

**Penyebab**: `isInitialized` masih false (< 3 detik)

**Solusi**:

```javascript
const network = new NexaNetwork();

// Tunggu inisialisasi selesai
await new Promise((r) => {
  const checkReady = setInterval(() => {
    if (network.isInitialized) {
      clearInterval(checkReady);
      r();
    }
  }, 100);
});

// Sekarang callbacks akan dipicu
network.onStatusChange = (isOnline) => {
  console.log("Callback working!");
};
```

### History Terlalu Ringkas

**Penyebab**: History hanya 50 entri terakhir

**Solusi**:

```javascript
// Jika perlu lebih banyak data, export sebelum shift:
const network = new NexaNetwork();
const allTimeHistory = [];

network.onStatusData = () => {
  if (network.history.length >= 45) {
    // Save history sebelum di-shift
    allTimeHistory.push(...network.history);
  }
};

// Akses semua history
console.log(`Total historical records: ${allTimeHistory.length}`);
```

### Downlink/RTT Null

**Penyebab**: Device tidak support metric tersebut

**Solusi**:

```javascript
const network = new NexaNetwork();
const info = network.getConnectionInfo();

const downlink =
  info.downlink !== "unknown"
    ? info.downlink
    : "Tidak tersedia (gunakan effectiveType)";

const rtt =
  info.rtt !== "unknown" ? info.rtt : "Tidak tersedia (gunakan effectiveType)";
```

---

## Performance Tips

1. **Minimize Callbacks**: Jangan lakukan operasi berat di callback
2. **Debounce UI Updates**: Batch updates dengan setTimeout
3. **Memory**: History otomatis limited 50 entri
4. **Check Interval**: 10 detik optimal (tidak beban CPU)
5. **Caching**: Cache connection info untuk avoid repeated checks

---

## Examples

### Example 1: Simple Status Indicator

```javascript
import { NexaNetwork } from "./NexaNetwork.js";

const network = new NexaNetwork();

// HTML element
const statusEl = document.getElementById("status");

network.onStatusChange = (isOnline) => {
  statusEl.innerHTML = isOnline
    ? '<span style="color:green">🟢 Online</span>'
    : '<span style="color:red">🔴 Offline</span>';
};
```

### Example 2: Complete Dashboard

```javascript
const network = new NexaNetwork();

// Table untuk monitoring
network.onStatusData = (tableData) => {
  const tbody = document.querySelector("#network-table tbody");
  tbody.innerHTML = tableData
    .map(
      (row) => `
    <tr>
      <td>${row.label}</td>
      <td><strong>${row.value}</strong></td>
    </tr>
  `,
    )
    .join("");
};

// Quality indicator
network.onQualityChange = (quality, stability) => {
  const indicator = document.getElementById("quality-badge");
  const colorMap = {
    Baik: "green",
    Sedang: "yellow",
    Buruk: "red",
    "Sangat Buruk": "darkred",
  };
  indicator.style.backgroundColor = colorMap[quality];
  indicator.textContent = quality;
};

// Stability report button
document.getElementById("report-btn").addEventListener("click", () => {
  const report = network.getStabilityReport();
  console.table(report);
  alert(`Uptime: ${report.uptime}\nStabilitas: ${report.stability}`);
});
```

### Example 3: Offline-Aware App

```javascript
const network = new NexaNetwork();
let isOfflineMode = false;

network.onStatusChange = (isOnline) => {
  if (isOnline && isOfflineMode) {
    isOfflineMode = false;
    console.log("🔄 Back online - syncing...");
    syncOfflineData();
  } else if (!isOnline) {
    isOfflineMode = true;
    console.log("⚠️ Offline mode activated");
  }
};

function syncOfflineData() {
  const pendingData = localStorage.getItem("pending-requests");
  if (pendingData) {
    const requests = JSON.parse(pendingData);
    Promise.all(requests.map((r) => fetch(r.url, r.options))).then(() => {
      localStorage.removeItem("pending-requests");
      console.log("✅ All offline data synced");
    });
  }
}
```

---

## Testing Checklist

- [ ] Status indicator updates on online/offline
- [ ] Connection type detected correctly
- [ ] Stability analysis works (after multiple checks)
- [ ] History tracking max 50 entries
- [ ] Callbacks only trigger after initialization
- [ ] Status change callback fires correctly
- [ ] Quality change callback fires correctly
- [ ] onStatusData updates every 10 seconds
- [ ] getStabilityReport() returns correct data
- [ ] Fallback works for unsupported browsers
- [ ] Data Saver mode detected
- [ ] RTT/Downlink values (if supported)

---

## API Reference Summary

```javascript
// Initialization
const network = new NexaNetwork();

// Status checking
network.status(); // boolean
network.getConnectionInfo(); // Object
network.getDetailedInfo(); // Object with stability
network.getHistory(); // Array
network.getStabilityReport(); // Object

// Events
network.onStatusChange = (isOnline, info, triggered) => {};
network.onQualityChange = (quality, status, triggered) => {};
network.onStatusData = (tableData) => {};

// Analysis
network.analyzeStability(); // {status, quality}
network.compareConnections(old, current); // {hasChanges, message}
```

---

## References

- [Network Information API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
- [Navigator.onLine (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [Save-Data Header (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Save-Data)

---

## License & Support

NexaNetwork adalah bagian dari **NexaUI Framework**.

**Support & Issues**:

- 📧 Email: support@nexa.local
- 💬 Discord: [NexaUI Community](https://discord.gg/nexa)
- 🐛 GitHub Issues: [Report Bug](https://github.com/nexa/nexaui/issues)

---

**Last Updated**: April 4, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
