# Cara Menggunakan NexaPrind.js

NexaPrind adalah class JavaScript untuk mencetak elemen HTML tertentu dengan berbagai opsi konfigurasi.

## Metode Dasar

### 1. Cetak berdasarkan ID

```javascript
const NexaPrind= new NXUI.Prind();
// Contoh sederhana
NexaPrind.printById('myElement');

// Dengan opsi
NexaPrind.printById('myElement', {
  title: 'Dokumen Saya',
  paperSize: 'A4',
  orientation: 'portrait'
});
```

### 2. Cetak berdasarkan CSS Selector

```javascript
// Contoh sederhana
NexaPrind.printBySelector('.print-content');

// Dengan opsi
NexaPrind.printBySelector('#content', {
  title: 'Laporan',
  paperSize: 'A4'
});
```

## Contoh HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contoh NexaPrind</title>
</head>
<body>
    <!-- Elemen yang akan dicetak -->
    <div id="printArea">
        <h1>Judul Dokumen</h1>
        <p>Ini adalah konten yang akan dicetak.</p>
        <table>
            <tr>
                <th>Nama</th>
                <th>Email</th>
            </tr>
            <tr>
                <td>John Doe</td>
                <td>john@example.com</td>
            </tr>
        </table>
    </div>

    <!-- Tombol untuk mencetak -->
    <button onclick="cetakDokumen()">Cetak Dokumen</button>

    <script type="module">
        const NexaPrind= new NXUI.Prind();
        window.cetakDokumen = function() {
            NexaPrind.printById('printArea', {
                title: 'Dokumen Saya',
                paperSize: 'A4',
                orientation: 'portrait'
            });
        };
    </script>
</body>
</html>
```

## Opsi Konfigurasi Lengkap

```javascript
NexaPrind.printById('myElement', {
  // Judul dokumen
  title: "Print Document",
  
  // Capture style dinamis dari elemen
  captureDynamicStyles: true,
  
  // Paksa background color/gambar saat print
  forceBackgrounds: true,
  
  // Pertahankan layout asli
  preserveLayout: true,
  
  // Skip resource yang rusak (gambar 404, dll)
  skipBrokenResources: true,
  
  // Gunakan fallback fonts
  useFallbackFonts: true,
  
  // Optimasi performa (batasi jumlah elemen yang diproses)
  optimizePerformance: true,
  
  // Buka di window baru (true) atau window saat ini (false)
  newWindow: false,
  
  // Tutup window otomatis setelah print
  removeAfterPrint: false,
  
  // Array CSS selector untuk mengecualikan dari capture style
  // Contoh: ['.tcx-center', '.tcx-footer', '.no-print']
  styleNot: [],
  
  // Pengaturan kertas
  paperSize: "A4", // A4, A3, A5, Letter, Legal, Custom
  orientation: "portrait", // portrait, landscape
  
  // Ukuran custom (hanya jika paperSize: "Custom")
  customSize: { width: "210mm", height: "297mm" },
  
  // Margin umum (berlaku untuk semua sisi jika tidak ada margin detail)
  margins: "0", // "0", "10", "20mm", atau "none"
  
  // Margin detail per sisi (opsional)
  marginTop: "20", // atau "20mm" atau 20
  marginRight: "15",
  marginBottom: "20",
  marginLeft: "15",
  
  // Pengaturan font
  fontSize: "12pt", // 8pt, 10pt, 12pt, 14pt, 16pt, 18pt, dll
  fontFamily: null, // null = default, atau "Arial, sans-serif"
  lineHeight: "1.2" // 0.8, 0.9, 1.0, 1.1, 1.2, dll
});
```

## Contoh Penggunaan Praktis

### Contoh 1: Cetak Sederhana

```javascript
// Cetak elemen dengan ID "content"
NexaPrind.printById('content');
```

### Contoh 2: Cetak dengan Pengaturan Kertas

```javascript
NexaPrind.printById('laporan', {
  title: 'Laporan Bulanan',
  paperSize: 'A4',
  orientation: 'portrait',
  margins: '20mm'
});
```

### Contoh 3: Cetak Landscape dengan Margin Custom

```javascript
NexaPrind.printById('chart', {
  title: 'Grafik Data',
  paperSize: 'A4',
  orientation: 'landscape',
  marginTop: '15mm',
  marginRight: '10mm',
  marginBottom: '15mm',
  marginLeft: '10mm'
});
```

### Contoh 4: Cetak dengan Font Custom

```javascript
NexaPrind.printById('dokumen', {
  title: 'Dokumen Resmi',
  fontSize: '11pt',
  fontFamily: 'Times New Roman, serif',
  lineHeight: '1.5',
  paperSize: 'A4'
});
```

### Contoh 5: Cetak dengan Style Exclusion

```javascript
// Exclude elemen dengan class tertentu dari style capture
NexaPrind.printById('content', {
  title: 'Dokumen',
  styleNot: ['.tcx-center', '.tcx-footer', '.no-print-style']
});
```

### Contoh 6: Cetak di Window Baru

```javascript
NexaPrind.printById('content', {
  title: 'Preview Print',
  newWindow: true,
  removeAfterPrint: true // Tutup otomatis setelah print
});
```

### Contoh 7: Cetak dengan Ukuran Kertas Custom

```javascript
NexaPrind.printById('content', {
  title: 'Dokumen Custom',
  paperSize: 'Custom',
  customSize: {
    width: '210mm',
    height: '297mm'
  },
  orientation: 'portrait'
});
```

### Contoh 8: Cetak dengan Selector

```javascript
// Cetak elemen pertama yang match selector
NexaPrind.printBySelector('.print-this', {
  title: 'Dokumen',
  paperSize: 'A4'
});

// Atau dengan selector lebih spesifik
NexaPrind.printBySelector('#main-content .article', {
  title: 'Artikel',
  fontSize: '12pt',
  lineHeight: '1.4'
});
```

## Catatan Penting

1. **Table Elements**: NexaPrind secara otomatis mempertahankan styling asli untuk elemen tabel (table, tr, td, th, dll) untuk memastikan layout tabel tidak rusak.
2. **Heading Elements**: Heading (h1-h6) secara default akan menggunakan ukuran font natural mereka dan tidak terpengaruh oleh pengaturan `fontSize` global, kecuali jika dikecualikan melalui `styleNot`.
3. **Style Exclusion**: Gunakan `styleNot` untuk mengecualikan elemen tertentu dari style capture, berguna jika ada elemen yang ingin mempertahankan styling asli mereka.
4. **Performance**: Jika elemen yang akan dicetak sangat besar, pastikan `optimizePerformance: true` (default) untuk membatasi jumlah elemen yang diproses.
5. **Browser Compatibility**: Pastikan browser mendukung ES6 modules jika menggunakan import/export.

## Troubleshooting

### Elemen tidak ditemukan

```javascript
// Pastikan elemen sudah ada di DOM sebelum memanggil print
if (document.getElementById('myElement')) {
  NexaPrind.printById('myElement');
} else {
  console.error('Elemen tidak ditemukan!');
}
```

### Pop-up diblokir

Jika menggunakan `newWindow: true` dan pop-up diblokir, browser akan menampilkan alert. Pastikan browser mengizinkan pop-up untuk domain Anda.

### Styling tidak sesuai

- Pastikan `captureDynamicStyles: true` (default)
- Periksa apakah ada CSS yang conflict
- Gunakan `styleNot` untuk mengecualikan elemen yang bermasalah

## Contoh Lengkap dengan Event Handler

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contoh NexaPrind Lengkap</title>
    <style>
        #printArea {
            padding: 20px;
            background: #f5f5f5;
        }
        .no-print {
            background: yellow;
        }
    </style>
</head>
<body>
    <div id="printArea">
        <h1>Laporan Bulanan</h1>
        <p>Tanggal: <span id="tanggal"></span></p>
        <table border="1" style="width: 100%;">
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Jumlah</th>
            </tr>
            <tr>
                <td>1</td>
                <td>Item A</td>
                <td>100</td>
            </tr>
            <tr>
                <td>2</td>
                <td>Item B</td>
                <td>200</td>
            </tr>
        </table>
    </div>
    
    <div class="no-print">
        <p>Ini tidak akan tercetak</p>
    </div>
    
    <button onclick="cetakLaporan()">Cetak Laporan</button>
    <button onclick="cetakLandscape()">Cetak Landscape</button>
    
    <script type="module">
        const NexaPrind= new NXUI.Prind();
        // Set tanggal
        document.getElementById('tanggal').textContent = new Date().toLocaleDateString('id-ID');
        
        window.cetakLaporan = function() {
            NexaPrind.printById('printArea', {
                title: 'Laporan Bulanan',
                paperSize: 'A4',
                orientation: 'portrait',
                margins: '20mm',
                fontSize: '11pt',
                lineHeight: '1.3'
            });
        };
        
        window.cetakLandscape = function() {
            NexaPrind.printById('printArea', {
                title: 'Laporan Bulanan - Landscape',
                paperSize: 'A4',
                orientation: 'landscape',
                margins: '15mm',
                fontSize: '10pt'
            });
        };
    </script>
</body>
</html>
```

