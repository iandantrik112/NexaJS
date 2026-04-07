# 📱 NEXAUI APPLICATION - FITUR & KEUNGGULAN

## 📋 DAFTAR ISI
1. [Overview](#overview)
2. [Struktur Folder](#struktur-folder)
3. [Fitur Utama](#fitur-utama)
4. [Keunggulan](#keunggulan)
5. [Cara Penggunaan](#cara-penggunaan)

---

## 🎯 OVERVIEW

**NexaUI Application** adalah sistem aplikasi dinamis yang memungkinkan developer membuat aplikasi CRUD (Create, Read, Update, Delete) tanpa perlu menulis kode dari awal. Sistem ini menggunakan konfigurasi berbasis JSON untuk mendefinisikan form, tabel, dan logika bisnis.

### Konsep Utama
- **Configuration-Driven**: Semua form dan tabel didefinisikan melalui konfigurasi JSON
- **Auto-Generated UI**: Form dan tabel di-generate otomatis dari konfigurasi
- **Offline-First**: Dukungan penuh untuk mode offline dengan caching dan queue system
- **Zero-Boilerplate**: Developer hanya perlu fokus pada konfigurasi, bukan kode

---

## 📁 STRUKTUR FOLDER

```
application/
├── package.js          # Main component dengan tab navigation
├── page.js             # Page wrapper
├── tabs/               # Tab components
│   ├── Data.js        # Data listing dengan pagination & search
│   ├── DataDev.js     # Data listing (development version)
│   ├── Form.js        # Dynamic form dengan wizard mode
│   └── Informasi.js   # Information tab
└── helper/             # Helper classes & utilities
    ├── DataManager.js      # Business logic untuk data management
    ├── DataHelper.js       # Helper untuk processing field & column
    ├── FromHelper.js        # Helper untuk rendering form fields
    ├── FromHelperStandar.js # Standard form helper
    ├── NexaDom.js          # Domain helper (territory, access control)
    ├── NexaFlag.js         # Flag field (cascading dropdown: Kabupaten/Kecamatan/Desa)
    ├── NexaSearch.js        # Search field dengan autocomplete
    ├── NexaType.js         # File type component
    ├── NexaApproval.js     # Approval field component dengan history
    ├── pagination.js        # Pagination helper
    └── PaginationComponent.js # Pagination UI component
```

---

## 🚀 FITUR UTAMA

### 1. **Tab Navigation System** (`package.js`)

#### Fitur:
- **3 Tab Utama**: Dataset, Formulir, Informasi
- **Dynamic Tab Switching**: Switch antar tab dengan smooth transition
- **State Management**: Maintain state antar tab
- **Edit Mode Integration**: Switch dari Data tab ke Form tab dengan data edit

#### Keunggulan:
✅ **User-Friendly**: Interface yang intuitif dengan tab navigation  
✅ **Seamless Integration**: Data dan Form terintegrasi dengan baik  
✅ **State Persistence**: State terjaga saat switch tab  

---

### 2. **Data Management** (`tabs/Data.js` & `DataManager.js`)

#### Fitur:

##### A. **DataManager Class** - Business Logic Layer
- **Offline-First Strategy**: 
  - Load dari cache dulu (instant display)
  - Fetch dari server di background
  - Auto-update cache dengan data terbaru
- **Caching System**:
  - Auto-cache semua query ke `NexaDBLite`
  - Cache expiry: 5 menit (configurable)
  - Cache key berdasarkan `page` dan `searchTerm`
- **Pagination**:
  - Server-side pagination
  - Dynamic page calculation
  - Page validation
- **Search**:
  - Multi-field search
  - Auto-detect searchable fields dari `aliasNames`
  - Search dengan debounce
- **Access Control**:
  - Update access control
  - Delete access control
  - Territory-based filtering (Kecamatan/Desa)
- **Error Handling**:
  - Graceful error handling
  - Fallback ke cache jika error
  - Offline detection

##### B. **Data Tab** - UI Layer
- **Data Listing**:
  - Card-based layout dengan border yang rapi
  - Expandable items dengan chevron icon (jika field > 2)
  - Field-based display
  - Header dengan main field (nama/title/name)
  - Collapsible field list
- **Search Bar**:
  - Real-time search
  - Clear search button
  - Search indicator
- **Pagination**:
  - Compact pagination
  - Page navigation
  - "Lihat Berikutnya" button
- **Actions**:
  - Refresh button untuk manual data refresh
  - Edit button (switch ke Form tab)
  - Delete button (dengan confirmation)
  - Access control-based visibility
  - Toggle pagination visibility
  - Toggle data header visibility

#### Keunggulan:
✅ **Instant Display**: Data tampil segera dari cache  
✅ **Offline Support**: Tetap berfungsi tanpa internet  
✅ **Auto-Sync**: Data di-update otomatis di background  
✅ **Better UX**: Tidak perlu menunggu loading lama  
✅ **Scalable**: Mendukung data besar dengan pagination  
✅ **Flexible Search**: Multi-field search yang powerful  

---

### 3. **Dynamic Form System** (`tabs/Form.js` & `FromHelper.js`)

#### Fitur:

##### A. **Form Rendering**
- **Auto-Generated Fields**: 
  - Text input
  - Textarea
  - Select/Dropdown
  - Date picker
  - File upload
  - Switch/Toggle
  - Flag field (cascading dropdown)
  - Search field (autocomplete)
- **Wizard Mode**:
  - Auto-activate jika field > 5
  - 5 fields per step
  - Progress indicator
  - Navigation buttons (Sebelumnya/Selanjutnya)
- **Validation**:
  - Client-side validation
  - Server-side validation
  - Real-time error display
  - Field-level error messages

##### B. **Offline-First Form Submission**
- **Auto-Save Draft**:
  - Auto-save setiap 2 detik
  - Load draft saat form dibuka
  - Draft expiry: 24 jam
- **Offline Queue**:
  - Simpan submission yang gagal ke queue
  - Auto-retry ketika online
  - Retry hingga 5 kali
  - Manual retry button
- **Network Detection**:
  - Auto-detect network error
  - Offline indicator
  - Pending submissions indicator

##### C. **Form Modes**
- **Insert Mode**: 
  - Create new record
  - Skip ID field
  - Auto-add userid
- **Update Mode**:
  - Edit existing record
  - Pre-fill form dengan data
  - Skip hidden fields
  - Include ID untuk update

#### Keunggulan:
✅ **Zero Configuration**: Form di-generate otomatis dari config  
✅ **Wizard Mode**: Form panjang jadi lebih user-friendly  
✅ **Draft Auto-Save**: Tidak kehilangan data saat keluar aplikasi  
✅ **Offline Submission**: Bisa submit meski offline  
✅ **Auto-Retry**: Data terkirim otomatis ketika online  
✅ **Smart Validation**: Client & server validation  

---

### 4. **Helper Components**

#### A. **NexaFlag** (`helper/NexaFlag.js`)
- **Cascading Dropdown**: Kabupaten → Kecamatan → Desa
- **Flexible Layout**: Full width atau Grid layout
- **Auto-Fetch**: Fetch data dari API `/flag` endpoint
- **Value Handling**: Support string atau object value

**Keunggulan:**
✅ **User-Friendly**: Dropdown yang intuitif  
✅ **Data Consistency**: Data wilayah ter-standardisasi  
✅ **Flexible**: Bisa hanya Kabupaten+Kecamatan atau lengkap  

#### B. **NexaSearch** (`helper/NexaSearch.js`)
- **Autocomplete Search**: Search dengan suggestions
- **Debounce**: 300ms debounce untuk performa
- **Target Mapping**: Auto-fill field lain berdasarkan selection
- **Hidden Value**: Support hidden field untuk ID

**Keunggulan:**
✅ **Fast Search**: Autocomplete yang cepat  
✅ **Smart Mapping**: Auto-fill related fields  
✅ **Better UX**: Tidak perlu input manual  

#### C. **NexaType** (`helper/NexaType.js`)
- **File Upload**: Support berbagai file types
- **Image Preview**: Preview untuk image files
- **File Info**: Display file name, size, type

**Keunggulan:**
✅ **Multi-Format**: Support berbagai file types  
✅ **Preview**: Preview sebelum upload  
✅ **User-Friendly**: Info file yang jelas  

#### D. **PaginationComponent** (`helper/PaginationComponent.js`)
- **Compact Mode**: Pagination yang compact
- **Page Navigation**: Previous, Next, Page numbers
- **Info Display**: Total count, current page

**Keunggulan:**
✅ **Space Efficient**: Compact design  
✅ **Easy Navigation**: Mudah navigate antar page  
✅ **Info Rich**: Informasi pagination yang jelas  

#### E. **NexaApproval** (`helper/NexaApproval.js`)
- **Approval Field Component**: 
  - Switch untuk approve/reject
  - Access control-based display
  - Read-only mode untuk user tanpa akses
- **Approval History**:
  - Modal untuk menampilkan history approval
  - Clickable status untuk melihat history
  - Scrollable history list
  - Menampilkan status, tanggal, approved_by, dan catatan
- **Rejection Modal**:
  - Modal untuk input alasan penolakan
  - Validasi minimal 5 karakter
  - Auto-save rejection reason
- **Auto-Update**:
  - Update record utama dengan status approval
  - Simpan history ke tabel Approval terpisah
  - Local state update tanpa auto-refresh

**Keunggulan:**
✅ **Access Control**: User dengan akses bisa approve/reject  
✅ **History Tracking**: Semua approval tercatat dengan lengkap  
✅ **User-Friendly**: Interface yang intuitif dengan modal  
✅ **Offline Support**: History bisa dilihat meski offline  
✅ **Non-Blocking**: Update record utama tidak terblokir jika history gagal  

---

### 5. **Data Processing** (`helper/DataHelper.js`)

#### Fitur:
- **Field Processing**: 
  - Process field configuration
  - Generate column list
  - Generate form structure
- **Type Detection**: 
  - Auto-detect field type
  - Map ke React Native components
- **Validation Rules**: 
  - Extract validation rules
  - Generate validation schema

**Keunggulan:**
✅ **Auto-Processing**: Process config otomatis  
✅ **Type Safety**: Type detection yang akurat  
✅ **Flexible**: Support berbagai field types  

---

### 6. **Domain Logic** (`helper/NexaDom.js`)

#### Fitur:
- **Territory Filtering**: 
  - Filter berdasarkan Kecamatan
  - Filter berdasarkan Desa
  - Auto-apply territory filter
- **Access Control**:
  - Public/Private access
  - Update access control
  - Delete access control
  - Add access control
  - Approval access control

**Keunggulan:**
✅ **Security**: Access control yang ketat  
✅ **Territory-Based**: Filter data berdasarkan wilayah  
✅ **Flexible**: Support berbagai access level  

---

### 7. **Approval System** (`helper/NexaApproval.js` & `tabs/Data.js`)

#### Fitur:

##### A. **Approval Field Component**
- **Switch-Based Approval**:
  - Toggle switch untuk approve/reject
  - Visual feedback dengan loading state
  - Status display (Disetujui/Ditolak)
- **Access Control**:
  - User dengan akses (`cellApproval === 1`): Bisa approve/reject dengan switch
  - User tanpa akses (`cellApproval === 0`): Hanya melihat status (read-only)
- **Rejection Handling**:
  - Modal untuk input alasan penolakan (jika `approdialog: true`)
  - Validasi minimal 5 karakter
  - Auto-save rejection reason ke record

##### B. **Approval History**
- **History Modal**:
  - Clickable status untuk membuka modal history
  - Scrollable list untuk history yang banyak
  - Menampilkan: status, tanggal, approved_by, catatan
- **History API**:
  - Endpoint `/approvalData` untuk fetch history
  - Filter berdasarkan `record_id`
  - Support untuk semua user (dengan/tanpa akses approval)

##### C. **Data Synchronization**
- **Local State Update**:
  - Update local state tanpa auto-refresh
  - User tidak kehilangan konteks data yang sedang diverifikasi
  - Manual refresh button untuk sync dengan server
- **History Saving**:
  - Simpan history ke tabel Approval terpisah (key: 276136656376989)
  - Non-blocking: Update record utama tidak terblokir jika history gagal
  - Auto insert/update berdasarkan `record_id` dan `userid`

##### D. **Form Integration**
- **Approval Field Exclusion**:
  - Field dengan `type: "approval"` tidak ditampilkan di form
  - Tidak ikut dalam wizard calculation
  - Tidak ikut dalam client-side validation
  - Tidak ikut dalam server-side validation
  - Approval hanya bekerja di Data tab

#### Keunggulan:
✅ **Access Control**: Hanya user dengan akses yang bisa approve/reject  
✅ **History Tracking**: Semua approval tercatat dengan lengkap  
✅ **User-Friendly**: Interface yang intuitif dengan modal dan switch  
✅ **Non-Blocking**: Update record utama tidak terblokir  
✅ **Flexible**: Support untuk berbagai skenario approval  
✅ **Consistent**: Format data sesuai dengan web version  

---

## 💎 KEUNGGULAN UTAMA

### 1. **Offline-First Architecture** 🚀
- ✅ **Data Caching**: Semua data di-cache ke `NexaDBLite`
- ✅ **Instant Display**: Data tampil segera dari cache
- ✅ **Background Sync**: Update data di background
- ✅ **Queue System**: Form submission queue untuk offline
- ✅ **Auto-Retry**: Auto-retry ketika online kembali

**Manfaat:**
- User experience yang lebih baik (tidak perlu menunggu loading)
- Tetap berfungsi tanpa internet
- Data tidak hilang saat offline

### 2. **Configuration-Driven Development** ⚙️
- ✅ **Zero Boilerplate**: Tidak perlu menulis kode berulang
- ✅ **JSON Configuration**: Semua didefinisikan via JSON
- ✅ **Auto-Generated UI**: Form dan tabel di-generate otomatis
- ✅ **Dynamic Fields**: Field types yang fleksibel

**Manfaat:**
- Development lebih cepat
- Maintenance lebih mudah
- Konsistensi UI/UX

### 3. **Smart Form System** 📝
- ✅ **Wizard Mode**: Form panjang jadi lebih user-friendly
- ✅ **Auto-Save Draft**: Tidak kehilangan data
- ✅ **Offline Submission**: Submit meski offline
- ✅ **Smart Validation**: Client & server validation

**Manfaat:**
- User experience yang lebih baik
- Data tidak hilang
- Form yang user-friendly

### 4. **Powerful Data Management** 📊
- ✅ **Server-Side Pagination**: Support data besar
- ✅ **Multi-Field Search**: Search yang powerful
- ✅ **Access Control**: Security yang ketat
- ✅ **Territory Filtering**: Filter berdasarkan wilayah
- ✅ **Approval System**: Approval workflow dengan history tracking
- ✅ **Manual Refresh**: Refresh button untuk sync data
- ✅ **Expandable Cards**: Collapsible field list dengan chevron

**Manfaat:**
- Scalable untuk data besar
- Search yang efisien
- Security yang baik
- Approval workflow yang terintegrasi
- UI yang lebih interaktif

### 5. **Rich Field Types** 🎨
- ✅ **Flag Field**: Cascading dropdown (Kabupaten/Kecamatan/Desa)
- ✅ **Search Field**: Autocomplete dengan suggestions
- ✅ **File Upload**: Support berbagai file types
- ✅ **Switch/Toggle**: Boolean input
- ✅ **Approval Field**: Switch untuk approve/reject dengan history tracking

**Manfaat:**
- Field types yang lengkap
- User experience yang baik
- Data input yang akurat
- Approval workflow yang terintegrasi

### 6. **Performance Optimization** ⚡
- ✅ **Caching**: Reduce server calls
- ✅ **Debounce**: Search dengan debounce
- ✅ **Lazy Loading**: Load data on demand
- ✅ **Optimized Rendering**: Efficient re-rendering

**Manfaat:**
- Aplikasi lebih cepat
- Menghemat bandwidth
- Battery efficient

---

## 📖 CARA PENGGUNAAN

### 1. **Setup DataManager**

```javascript
import { DataManager } from './helper/DataManager';

const dataManager = new DataManager({
  pkg: { token: 'your-package-token' },
  userData: { user_id: 1 },
  limit: 5,
  cacheEnabled: true, // Default: true
  cacheExpiry: 5 * 60 * 1000 // 5 menit
});

// Setup callbacks
dataManager.setOnDataChange((result) => {
  if (result.fromCache) {
    console.log('📦 Data dari cache');
  } else {
    console.log('🌐 Data fresh dari server');
  }
  
  if (result.isOffline) {
    console.log('⚠️ Mode offline');
  }
  
  // Update UI dengan result.data
  setData(result.data);
  setFields(result.fields);
  setColumns(result.columns);
});

// Fetch data
await dataManager.fetchData(1, 'search term');
```

### 2. **Setup Form dengan Offline Support**

Form sudah otomatis support offline! Tidak perlu setup tambahan.

**Fitur yang otomatis aktif:**
- ✅ Auto-save draft setiap 2 detik
- ✅ Load draft saat form dibuka
- ✅ Offline queue untuk submission
- ✅ Auto-retry ketika online

### 3. **Custom Field Types**

#### Flag Field (Cascading Dropdown)
```javascript
// Di form config, set type: 'flag'
{
  name: 'desa',
  type: 'flag',
  fieldName: 'desa' // atau 'kecamatan' untuk hanya Kabupaten+Kecamatan
}
```

#### Search Field (Autocomplete)
```javascript
// Di form config, set type: 'search'
{
  name: 'nama',
  type: 'search',
  search: {
    access: 'public',
    metadata: 1,
    field: 'nama',
    label: 'Nama',
    value: 'id',
    where: {
      field: 'status',
      value: 'active'
    },
    hiddenvalue: 'id_nama' // Hidden field untuk ID
  }
}
```

#### Approval Field
```javascript
// Di form config, set type: 'approval'
// Field ini hanya akan muncul di Data tab, tidak di Form tab
{
  name: 'slug',
  type: 'approval',
  label: 'Approval Status',
  receive: 'Permohonan diterima', // Text untuk approved
  reject: 'Permohonan ditolak',    // Text untuk rejected
  approdialog: true,                // Tampilkan modal untuk alasan penolakan
  key: 279283707314106              // Key untuk table_name di history
}

// Access control di assets.approval[className]
// 0 = no access (hanya lihat status)
// 1 = has access (bisa approve/reject)
```

**Fitur Approval:**
- ✅ Switch untuk approve/reject
- ✅ Modal untuk input alasan penolakan (jika `approdialog: true`)
- ✅ History approval dengan modal
- ✅ Access control-based display
- ✅ Auto-save ke record utama dan tabel Approval

---

## 🎯 KESIMPULAN

**NexaUI Application** adalah solusi lengkap untuk membuat aplikasi CRUD dinamis dengan:

1. ✅ **Offline-First**: Caching & queue system
2. ✅ **Configuration-Driven**: Zero boilerplate code
3. ✅ **Smart Forms**: Wizard mode, auto-save, offline submission
4. ✅ **Powerful Data Management**: Pagination, search, access control
5. ✅ **Rich Components**: Flag field, search field, file upload
6. ✅ **Performance Optimized**: Caching, debounce, lazy loading

**Total Fitur:**
- 📊 3 Tab System (Data, Form, Informasi)
- 🔄 Offline-First dengan Caching
- 📝 Dynamic Form dengan Wizard Mode
- 🔍 Multi-Field Search
- 📄 Server-Side Pagination
- 🔐 Access Control & Territory Filtering
- 💾 Auto-Save Draft
- 📤 Offline Queue System
- 🔄 Auto-Retry Mechanism
- 🎨 Rich Field Types (Flag, Search, File, Switch, Approval, dll)
- ✅ Approval System dengan History Tracking
- 🔄 Manual Refresh Button
- 📋 Expandable Data Cards dengan Chevron
- 🎯 Improved UI dengan Border Alignment

---

**Dibuat dengan ❤️ untuk memudahkan development aplikasi React Native**

