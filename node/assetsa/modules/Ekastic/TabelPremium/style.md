# Catatan Table Styles - table.css

## 📋 Daftar Style Tabel Yang Tersedia

### 1. **Style Dasar**
- `.nx-table` - Style dasar untuk tabel (border, background, padding)
- `.nx-table-wrapper` - Wrapper untuk tabel dengan border radius
- `table` - Tag HTML untuk tabel standar

### 2. **Varian Ukuran Tabel**
- `.nx-table-compact` - Tabel dengan padding kecil (6px 8px, font 0.8rem)
- `.nx-table-ultra-compact` - Tabel sangat ringkas (4px 6px, font 0.75rem)
- `.nx-table-mini` - Tabel ukuran mini (2px 4px, font 0.7rem)
- `.nx-table-xs` - Extra small (0.125rem 0.25rem)
- `.nx-table-sm` - Small (0.25rem 0.5rem)
- `.nx-table-md` - Medium (0.5rem 0.75rem)
- `.nx-table-lg` - Large (1rem)
- `.nx-table-xl` - Extra large (1.25rem 1.5rem, font 1.1rem)

### 3. **Varian Layout**
- `.nx-table-bordered` - Tabel dengan border di semua sel
- `.nx-table-striped` - Tabel dengan zebra striping (baris ganjil berwarna)
- `.nx-table-hover` - Efek hover pada baris
- `.nx-table-sortable` - Tabel dengan kolom yang bisa disortir
- `.nx-table-selectable` - Tabel dengan checkbox untuk seleksi baris
- `.nx-table-nested` - Tabel dengan nested rows (bisa di-expand)
- `.nx-table-custom` - Tabel custom dengan format khusus (misal: produk dengan gambar)
- `.nx-table-header-primary` - Tabel dengan header berwarna
- `.nx-table-docs` - Tabel untuk dokumentasi (kolom pertama 200px)

### 4. **Style Status Row**
- `.nx-table-success` - Baris dengan background hijau (success)
- `.nx-table-warning` - Baris dengan background kuning (warning)
- `.nx-table-danger` - Baris dengan background merah (danger)

### 5. **Alignment Classes**
- `.text-left`, `.text-center`, `.text-right` - Alignment horizontal
- `.align-top`, `.align-middle`, `.align-bottom` - Alignment vertikal
- `.override-left`, `.override-center`, `.override-right` - Override dengan !important
- `.number-column` - Kolom angka (text-align: right, tabular-nums)
- `.status-column` - Kolom status (text-align: center)
- `.action-column` - Kolom action (text-align: center)

### 6. **Wrapper & Container**
- `.table-container` - Container untuk tabel dengan position relative
- `.table-container-resizable` - Container untuk tabel dengan column resize
- `.nx-table-wrapper` - Wrapper dengan sticky header
- `.optimized-container` - Container untuk tabel optimized (background abu-abu, padding)

### 7. **Style Khusus Report**
- `.nx-table-auto-width` - Tabel dengan width auto
- `.nx-table-fixed` - Tabel dengan table-layout fixed
- `.nx-table-compact-data` - Tabel data compact dengan word-wrap
- `.nx-table-narrow-content` - Konten sempit, max-width 100%
- `.nx-table-data-fit` - Tabel dengan width fit-content
- `.nx-table-center` - Tabel di tengah (margin auto)
- `.nx-table-auto-fit` - Tabel auto-fit width
- `.nx-table-optimized` - Tabel optimized dengan font 0.85rem
- `.stats-table` - Tabel untuk statistics (inline-block, vertical-align top)
- `.small-info-table` - Tabel info kecil (max-width 500px)

### 8. **Style Khusus Report - Column Widths**
- `.nx-table-project-info` - Tabel project info (width auto, max 600px)
  - Kolom pertama: 30%
  - Kolom kedua: 70%
- `.nx-table-stats` - Tabel statistics (width auto, max 400px)
  - Kolom pertama: 70%
  - Kolom kedua: 30%
- `.nx-table-performance` - Tabel performance dengan min-width per kolom
  - `.col-user` - 100px
  - `.col-date` - 90px
  - `.col-total` - 50px (center)
  - `.col-completed` - 60px (center)
  - `.col-progress` - 70px (center)
  - `.col-pending` - 70px (center)
  - `.col-rate` - 70px (center)
  - `.col-assessment` - 100px (center)
- `.nx-table-task-details` - Tabel task details
  - `.col-user` - 100px
  - `.col-activity` - 200px
  - `.col-category` - 130px
  - `.col-status` - 120px
  - `.col-date` - 90px
- `.nx-table-validation` - Tabel validation (width auto, max 700px)
  - `.col-validator` - 20%
  - `.col-review-date` - 20%
  - `.col-task` - 35%
  - `.col-status` - 25%

### 9. **Style Kolom Khusus**
- `.nx-table-numeric` - Kolom numeric (center, tabular-nums, font-weight 500)
- `.nx-table-status` - Kolom status (center, font 0.8rem, font-weight 500)
- `.nx-table-date` - Kolom date (font 0.8rem, color #6c757d)
- `.nx-table-optimized .numeric` - Kolom angka di optimized table (min-width 50px)
- `.nx-table-optimized .status` - Kolom status di optimized table (min-width 80px)
- `.nx-table-optimized .date` - Kolom tanggal di optimized table (min-width 85px)
- `.nx-table-optimized .user` - Kolom user di optimized table (min-width 90px, font-weight 500)
- `.nx-table-optimized .activity` - Kolom activity di optimized table (min-width 180px)
- `.nx-table-optimized .category` - Kolom category di optimized table (min-width 120px)

### 10. **Responsive & Mobile**
- `.nx-table-responsive` - Tabel responsif
- `.nx-table-responsive-mobile` - Font kecil di mobile (0.75rem)
- `.nx-table-auto-small` - Auto kecil di mobile (4px 6px, font 0.75rem)
- `.nx-table-hide-mobile` - Kolom tersembunyi di mobile (hide-mobile class)
- `.nx-table-stack` - Stack layout di mobile (tbody jadi block)
- `.compact-info` - Container info compact (max-width 500px, margin auto)
- `.compact-stats` - Container stats compact (max-width 350px, margin auto)

### 11. **Utility Classes**
- `.nx-table-tight` - Tabel dengan table-layout fixed
- `.nx-table-narrow` - Tabel sempit (width auto, max-width 100%)
- `.nx-table-mono` - Tabel dengan font monospace
- `.nx-table-no-margin` - Margin 0
- `.nx-table-margin-sm` - Margin 0.5rem
- `.nx-table-margin-md` - Margin 1rem
- `.nx-table-margin-lg` - Margin 1.5rem
- `.nx-table-footer` - Footer tabel (width 100%)

### 12. **Pagination**
- `.nx-table-pagination` - Container pagination (flex, center, gap 0.5rem)
- `.nx-pagination-numbers` - Container nomor pagination (flex, gap 0.25rem)

### 13. **Filter**
- `.nx-table-filter` - Container filter (margin-bottom 1rem)
- `.nx-table-filter .nx-input` - Input filter (width 100%, max-width 300px)

### 14. **Special Styles**
- `.nx-table.facebook-style` - Style mirip Facebook:
  - Border none, border-radius 8px
  - Box-shadow halus
  - Header gradient biru (#1877f2 ke #42a5f5)
  - Hover effect halus
  - Font system default

### 15. **Inline Editing Styles**
- `.nexa-inline-cell` - Cell yang bisa diedit inline (transition, cursor pointer)
- `.nexa-inline-cell:hover` - Hover state (background #f8f9fa, border biru)
- `.nexa-inline-cell.editing` - State editing (background kuning #fff3cd, border kuning)
- `.nexa-inline-cell.success` - State sukses (background biru #d1edff, border hijau)
- `.nexa-inline-cell.error` - State error (background merah #f8d7da, border merah)
- `.nexa-inline-input` - Input untuk inline editing
- `.nexa-inline-select` - Select untuk inline editing
- `.nexa-inline-form` - Form untuk inline editing
- `.nexa-inline-checkbox-container` - Container untuk checkbox inline
- `.nexa-inline-radio-container` - Container untuk radio inline
- `.nexa-inline-file-container` - Container untuk file inline
- `.nexa-inline-tooltip` - Tooltip untuk inline editing
- `.nexa-inline-loading` - Loading state untuk inline editing
- `.nexa-inline-spinner` - Spinner untuk loading
- `.nexa-inline-pending` - Pending indicator

### 16. **Column Resize Styles**
- `.table-container-resizable` - Container untuk resizable table (overflow auto, height 100%)
- `.resizable-table` - Tabel dengan table-layout fixed
- `.resizable-column` - Kolom yang bisa diresize (position relative, overflow hidden)
- `.column-resizer` - Resizer handle (position absolute, width 5px, cursor col-resize)
- `.column-resizer:hover` - Hover state (border biru, background rgba)
- `.column-resizer.resizing` - State sedang resize (border biru, background lebih gelap)
- `.no-select` - Prevent text selection during resize

### 17. **Dark Mode Support**
Semua class di atas memiliki dukungan dark mode dengan prefix `body.dark-mode-grid`:
- Background colors: `var(--main-code-bg)`, `var(--bg-primary)`
- Text colors: `var(--text-primary)`, `var(--menu-subtext)`
- Border colors: `var(--border-primary)`
- Hover colors: `var(--menu-hover-bg)`, `var(--aside-active)`

### 18. **Custom Scrollbar**
- `.table-container-resizable::-webkit-scrollbar` - Width & height scrollbar (6px)
- `.table-container-resizable::-webkit-scrollbar-track` - Track background (transparent)
- `.table-container-resizable::-webkit-scrollbar-thumb` - Thumb background (hover: #0168fa)

### 19. **Custom Class Lainnya**
- `.nx-dropdown-content .material-symbols-outlined` - Fix icon size (16px)
- `.nx-dropdown-content a` - Alignment dropdown items (flex, center, gap 8px)
- `.nx-dropdown-btn` - Center align dropdown button

### 20. **Responsive Styles**
- Media query `@media screen and (max-width: 768px)` - Mobile styles
- Media query `@media (max-width: 768px)` - Report table mobile styles

---

## 📝 Total: ~100+ Style Classes Tersedia

**Kategori:**
- ✅ Style Dasar
- ✅ Varian Ukuran (8 ukuran)
- ✅ Varian Layout (10 varian)
- ✅ Status Row (3 status)
- ✅ Alignment (10+ classes)
- ✅ Wrapper & Container (4 container)
- ✅ Style Report (15+ classes)
- ✅ Kolom Khusus (10+ classes)
- ✅ Responsive (6+ classes)
- ✅ Utility (10+ classes)
- ✅ Pagination (1)
- ✅ Filter (1)
- ✅ Special (facebook-style)
- ✅ Inline Editing (15+ classes)
- ✅ Column Resize (5+ classes)
- ✅ Dark Mode (full support)
- ✅ Custom Scrollbar
- ✅ Responsive

---

## 🎯 Cara Penggunaan Umum

```html
<!-- Basic Table -->
<table class="nx-table">
  <thead>...</thead>
  <tbody>...</tbody>
</table>

<!-- Striped & Hover -->
<table class="nx-table nx-table-striped nx-table-hover">
  ...
</table>

<!-- Compact Size -->
<table class="nx-table nx-table-compact">
  ...
</table>

<!-- With Wrapper -->
<div class="nx-table-wrapper">
  <table class="nx-table">
    ...
  </table>
</div>

<!-- Resizable Columns -->
<div class="table-container-resizable">
  <table class="resizable-table">
    ...
  </table>
</div>

<!-- Facebook Style -->
<table class="nx-table facebook-style">
  ...
</table>

<!-- Dark Mode Tabel -->
<table class="nx-table nx-table-striped nx-table-hover">
  ...
</table>
```

---

## 🔗 File Terkait
- `table.css` - Semua style tabel
- `inisiasi.js` - Ekastic initialization
- `NexaTabel.js` - Tabel component
- `recordView.js` - Record view
- `recordUpdate.js` - Record update

---
*Last Updated: 2025*
