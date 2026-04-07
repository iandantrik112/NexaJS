# NexaGlobal Documentation

## Overview

NexaGlobal adalah sistem manajemen data global yang terintegrasi dengan NexaUI. Kelas ini menyediakan cara yang mudah dan powerful untuk mengelola data, state, dan interaksi dalam aplikasi web.

## Features

- ✅ **Dynamic Data Storage** - Simpan dan ambil data dengan mudah
- ✅ **Array Management** - Kelola array data dengan method khusus
- ✅ **Object Management** - Set dan get property object
- ✅ **Element Data Extraction** - Ambil data dari HTML elements
- ✅ **Smart Method Patterns** - Auto-routing untuk method calls
- ✅ **Auto-Sync to Window** - Data otomatis tersedia di window global
- ✅ **Form Data Handling** - Ambil data form dengan mudah
- ✅ **JSON Parsing** - Auto-parse data attributes dari HTML

## Installation

NexaGlobal sudah terintegrasi dengan NexaUI dan tersedia secara otomatis:

```javascript
// Akses melalui nx
const globalInstance = nx.global;

// Atau langsung
const globalInstance = new NexaGlobal();
```

## Basic Usage

### 1. Data Storage

#### Menyimpan Data

```javascript
// Simpan data sederhana
nx.global.setData("userName", "John Doe");
nx.global.setData("userAge", 25);

// Simpan object kompleks
nx.global.setData("userProfile", {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  preferences: {
    theme: "dark",
    language: "id",
  },
});
```

#### Mengambil Data

```javascript
// Ambil data
const userName = nx.global.getData("userName");
const userProfile = nx.global.getData("userProfile");

// Tampilkan semua data
nx.global.showAllData();
```

### 2. Array Management

```javascript
// Tambah item ke array
nx.global.addToArray("shoppingCart", { id: 1, name: "Laptop", price: 1000 });
nx.global.addToArray("shoppingCart", { id: 2, name: "Mouse", price: 50 });

// Tampilkan array
const cart = nx.global.getData("shoppingCart");
nx.global.showArray(cart);

// Hapus item dari array
nx.global.removeFromArray("shoppingCart", 0); // Hapus index 0
```

### 3. Object Management

```javascript
// Set property object
nx.global.setObjectProperty("userProfile", "phone", "08123456789");
nx.global.setObjectProperty("userProfile", "address", "Jakarta, Indonesia");

// Get property object
const phone = nx.global.getObjectProperty("userProfile", "phone");
const address = nx.global.getObjectProperty("userProfile", "address");

// Tampilkan object
nx.global.showObject(nx.global.getData("userProfile"));
```

## Advanced Features

### 1. Element Data Extraction

#### Ambil Data dari HTML Element

```html
<!-- HTML Element -->
<div
  id="userCard"
  data-user-id="123"
  data-user-name="John Doe"
  data-user-email="john@example.com"
  data-user-settings='{"theme":"dark","lang":"id"}'
  class="card"
>
  User Information
</div>
```

```javascript
// Ambil data element
const elementData = nx.global.getElementData("userCard");
console.log(elementData);
// Output:
// {
//     id: "userCard",
//     class: "card",
//     dataUserId: 123,
//     dataUserName: "John Doe",
//     dataUserEmail: "john@example.com",
//     dataUserSettings: { theme: "dark", lang: "id" }
// }

// Ambil data dengan raw format (tidak di-clean)
const rawData = nx.global.getElementData("userCard", false);
```

#### Ambil Data dari Form

```html
<form id="userForm">
  <input name="name" value="John Doe" />
  <input name="email" value="john@example.com" />
  <input name="age" value="25" />
</form>
```

```javascript
// Ambil data form
const formData = nx.global.getFormData("userForm");
console.log(formData);
// Output: { name: "John Doe", email: "john@example.com", age: "25" }
```

### 2. Smart Method Patterns

NexaGlobal mendukung smart method patterns untuk auto-routing:

```javascript
// Jika ada element dengan ID pattern: btn_variableName_index
// Dan ada function dengan nama: onPress, handleClick, processElement, dll
// Maka akan otomatis dipanggil dengan data yang tepat

// Contoh element
// <button id="btn_user_1" data-user-id="123">Edit User</button>

// Function yang akan dipanggil otomatis
function onPress(userId, elementData) {
  console.log("User ID:", userId); // "user"
  console.log("Element Data:", elementData); // Data dari element
}
```

### 3. Auto-Sync to Window

Data yang disimpan di `nx.global` otomatis tersedia di `window`:

```javascript
// Set data di nx.global
nx.global.setData("appConfig", { theme: "dark" });

// Otomatis tersedia di window
console.log(window.appConfig); // { theme: 'dark' }

// Set function di nx
nx.myFunction = function () {
  return "Hello World";
};

// Otomatis tersedia di window
console.log(window.myFunction()); // 'Hello World'
```

## API Reference

### Data Storage Methods

#### `setData(key, value)`

Menyimpan data dengan key tertentu.

**Parameters:**

- `key` (string): Key untuk data
- `value` (any): Data yang akan disimpan

**Returns:** `this` (untuk chaining)

**Example:**

```javascript
nx.global.setData("user", { name: "John" });
```

#### `getData(key)`

Mengambil data berdasarkan key.

**Parameters:**

- `key` (string): Key data yang akan diambil

**Returns:** Data yang tersimpan atau `undefined`

**Example:**

```javascript
const user = nx.global.getData("user");
```

### Array Methods

#### `addToArray(key, item)`

Menambahkan item ke array.

**Parameters:**

- `key` (string): Key array
- `item` (any): Item yang akan ditambahkan

**Returns:** `this` (untuk chaining)

**Example:**

```javascript
nx.global.addToArray("items", { id: 1, name: "Item 1" });
```

#### `removeFromArray(key, index)`

Menghapus item dari array berdasarkan index.

**Parameters:**

- `key` (string): Key array
- `index` (number): Index item yang akan dihapus

**Returns:** `this` (untuk chaining)

**Example:**

```javascript
nx.global.removeFromArray("items", 0);
```

#### `showArray(arr)`

Menampilkan array di console dengan format yang rapi.

**Parameters:**

- `arr` (array): Array yang akan ditampilkan

**Returns:** Array yang ditampilkan

**Example:**

```javascript
nx.global.showArray([1, 2, 3]);
```

### Object Methods

#### `setObjectProperty(key, property, value)`

Mengatur property object.

**Parameters:**

- `key` (string): Key object
- `property` (string): Nama property
- `value` (any): Nilai property

**Returns:** `this` (untuk chaining)

**Example:**

```javascript
nx.global.setObjectProperty("user", "email", "john@example.com");
```

#### `getObjectProperty(key, property)`

Mengambil property object.

**Parameters:**

- `key` (string): Key object
- `property` (string): Nama property

**Returns:** Nilai property atau `undefined`

**Example:**

```javascript
const email = nx.global.getObjectProperty("user", "email");
```

#### `showObject(obj)`

Menampilkan object di console dengan format yang rapi.

**Parameters:**

- `obj` (object): Object yang akan ditampilkan

**Returns:** Object yang ditampilkan

**Example:**

```javascript
nx.global.showObject({ name: "John", age: 25 });
```

### Element Data Methods

#### `getElementData(elementId, cleanData = true)`

Mengambil data dari HTML element.

**Parameters:**

- `elementId` (string): ID element
- `cleanData` (boolean): Apakah data akan di-clean (default: true)

**Returns:** Object berisi data element atau `null`

**Example:**

```javascript
const elementData = nx.global.getElementData("myElement");
```

#### `getFormData(formId)`

Mengambil data dari form.

**Parameters:**

- `formId` (string): ID form

**Returns:** Object berisi data form atau `null`

**Example:**

```javascript
const formData = nx.global.getFormData("myForm");
```

### Utility Methods

#### `showAllData()`

Menampilkan semua data yang tersimpan.

**Returns:** Object berisi semua data

**Example:**

```javascript
const allData = nx.global.showAllData();
```

#### `clearData(key)`

Menghapus data berdasarkan key atau semua data.

**Parameters:**

- `key` (string, optional): Key yang akan dihapus. Jika tidak ada, hapus semua data

**Returns:** `this` (untuk chaining)

**Example:**

```javascript
nx.global.clearData("user"); // Hapus data user
nx.global.clearData(); // Hapus semua data
```

## Best Practices

### 1. Naming Convention

```javascript
// Gunakan naming yang konsisten
nx.global.setData("user_profile", userData);
nx.global.setData("app_settings", settings);
nx.global.setData("temp_data", tempData);
```

### 2. Data Structure

```javascript
// Struktur data yang baik
nx.global.setData("app_state", {
  user: {
    id: 1,
    name: "John Doe",
    preferences: {
      theme: "dark",
      language: "id",
    },
  },
  ui: {
    currentPage: "dashboard",
    sidebarOpen: true,
  },
  cache: {
    lastUpdate: new Date(),
    version: "1.0.0",
  },
});
```

### 3. Error Handling

```javascript
// Selalu cek data sebelum digunakan
const userData = nx.global.getData("user");
if (userData && userData.name) {
  console.log("Welcome,", userData.name);
} else {
  console.log("User data not found");
}
```

### 4. Cleanup

```javascript
// Bersihkan data yang tidak diperlukan
nx.global.clearData("temp_data");
nx.global.clearData("cache_data");
```

## Integration dengan NexaUI

### 1. Modal Integration

```javascript
// Data untuk modal
nx.global.setData("modal_data", {
  title: "Edit User",
  user: { id: 1, name: "John" },
  onSave: function (data) {
    console.log("Saving:", data);
  },
});

// Buka modal
eventsModal("editUser", nx.global.getData("modal_data"));
```

### 2. Page Integration

```javascript
// Data untuk page
nx.global.setData("page_data", {
  title: "Dashboard",
  stats: { users: 100, orders: 50 },
  onLoad: function () {
    console.log("Page loaded");
  },
});

// Buka page
eventsPage("dashboard", nx.global.getData("page_data"));
```

### 3. Form Integration

```javascript
// Setup form data
nx.global.setData("form_config", {
  fields: ["name", "email", "phone"],
  validation: {
    name: "required",
    email: "email",
  },
  onSubmit: function (data) {
    console.log("Form submitted:", data);
  },
});
```

## Troubleshooting

### Common Issues

#### 1. Data tidak tersimpan

```javascript
// Pastikan menggunakan method yang benar
nx.global.setData("key", "value"); // ✅ Benar
nx.global.data.key = "value"; // ❌ Salah
```

#### 2. Element tidak ditemukan

```javascript
// Pastikan element ada di DOM
const element = document.getElementById("myElement");
if (element) {
  const data = nx.global.getElementData("myElement");
} else {
  console.log("Element not found");
}
```

#### 3. Data hilang setelah refresh

```javascript
// Data di NexaGlobal tidak persistent
// Gunakan localStorage untuk data persistent
localStorage.setItem("persistent_data", JSON.stringify(data));
const persistentData = JSON.parse(localStorage.getItem("persistent_data"));
```

## Examples

### Complete Example

```javascript
// Inisialisasi aplikasi
nx.global.setData("app_config", {
  name: "My App",
  version: "1.0.0",
  theme: "dark",
});

// Simpan data user
nx.global.setData("current_user", {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "admin",
});

// Simpan data cart
nx.global.addToArray("cart", { id: 1, name: "Product 1", price: 100 });
nx.global.addToArray("cart", { id: 2, name: "Product 2", price: 200 });

// Simpan settings
nx.global.setObjectProperty("current_user", "settings", {
  notifications: true,
  language: "id",
  timezone: "Asia/Jakarta",
});

// Ambil data untuk digunakan
const user = nx.global.getData("current_user");
const cart = nx.global.getData("cart");
const settings = nx.global.getObjectProperty("current_user", "settings");

// Tampilkan data
nx.global.showObject(user);
nx.global.showArray(cart);

// Cleanup saat logout
nx.global.clearData("current_user");
nx.global.clearData("cart");
```

## License

NexaGlobal adalah bagian dari NexaUI framework dan mengikuti lisensi yang sama.
