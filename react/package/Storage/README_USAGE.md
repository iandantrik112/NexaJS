# 📱 Cara Menggunakan nexaDb di React Native

## 🚀 Instalasi

Pastikan sudah install `@react-native-async-storage/async-storage`:

```bash
npm install @react-native-async-storage/async-storage
# atau
yarn add @react-native-async-storage/async-storage
```

## ✨ Auto-Initialization

**`nexaDb` sudah di-initialize otomatis saat aplikasi dimulai!** Tidak perlu memanggil `install()` atau `init()` secara manual. Langsung bisa digunakan.

## 📖 Cara Penggunaan

### 1. **Menggunakan nexaDb (Recommended - Paling Mudah)**

#### Import

```javascript
import { nexaDb } from 'NexaUI';
// atau
import { nexaDb } from './package';
```

#### CRUD Operations (Langsung Pakai, Tidak Perlu Init!)

```javascript
// ✅ SET - Simpan data (auto encrypt, auto create store)
await nexaDb.set("users", {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  password: "secret123" // Akan di-encrypt otomatis
});

// ✅ GET - Ambil data (auto decrypt)
const user = await nexaDb.get("users", "user123");
console.log(user); 
// { id: "user123", name: "John Doe", email: "john@example.com", password: "secret123" }

// ✅ GET ALL - Ambil semua data
const allUsers = await nexaDb.getAll("users");
console.log(allUsers.data); // Array of all users

// ✅ UPDATE - Update data
await nexaDb.updateFields("users", "user123", {
  name: "John Updated",
  email: "john.updated@example.com"
});

// ✅ UPDATE SINGLE FIELD
await nexaDb.updateField("users", "user123", "name", "John Updated");

// ✅ DELETE - Hapus data
await nexaDb.delete("users", "user123");
```

#### Query & Search Operations

```javascript
// 🔍 SEARCH - Cari data
const results = await nexaDb.search("users", "john", ["name", "email"]);
console.log(results.data); // Array of matching users

// 📊 GET LATEST - Data terbaru
const latestUser = await nexaDb.getLatest("users", 1);
const latestUsers = await nexaDb.getLatest("users", 10); // 10 terbaru

// 📊 GET OLDEST - Data terlama
const oldestUsers = await nexaDb.getOldest("users", 5);

// 📋 LIST STORES - Lihat semua tabel/store
const tables = nexaDb.listStores();
console.log(tables); // ['nexaStore', 'bucketsStore', 'users', ...]

// 🔍 CHECK STORE - Cek apakah store ada
const hasUsers = nexaDb.hasStore("users");
console.log(hasUsers); // true atau false

// 📊 GET INFO - Info lengkap database
const info = nexaDb.getInfo();
console.log(info);
// {
//   dbName: 'NexaStoreDB',
//   version: 9,
//   isInitialized: true,
//   availableStores: ['nexaStore', 'bucketsStore', ...],
//   requestedStores: ['nexaStore', 'bucketsStore', ...]
// }
```

#### Advanced Operations (Menggunakan IndexedDBManager)

```javascript
// Akses ke IndexedDBManager untuk method advanced
const db = await nexaDb.ready(); // Ensure database ready
// atau langsung
const db = nexaDb.db;

// 📅 GET BY DATE RANGE
const recentUsers = await db.getByDateRangeAuto(
  "users",
  "2024-01-01",
  "2024-12-31"
);

// 🔄 DUPLICATE
await db.duplicateAuto("users", "user123", "user456", {
  modifications: { name: "Copied User" }
});

// 🎯 UPDATE NESTED FIELD
await db.updateNestedFieldAuto("users", "user123", "profile.bio", "New bio text");

// 🗑️ REMOVE FIELDS
await db.removeFieldsAuto("users", "user123", ["tempData", "cache"]);

// 👀 WATCH - Monitor perubahan data (Real-time)
const unwatch = db.watchAuto("users", (change) => {
  console.log("Data changed:", change);
  // change = { storeName, data, changeType, timestamp }
});

// Stop watching
unwatch();

// 🔄 REFRESH TABLE
await db.refreshTableAuto("users");

// 📤 EXPORT
const exportData = await db.export(["users", "products"]);
console.log(exportData.data); // JSON data

// 📥 IMPORT
await db.import(exportData.data, {
  overwrite: true,
  onProgress: ({ completed, total }) => {
    console.log(`Progress: ${completed}/${total}`);
  }
});
```

#### Mengakses NexaDb Instance

```javascript
// Akses ke instance NexaDb untuk method khusus
const nexaDbInstance = nexaDb.instance;

// Get activity logs
const logs = await nexaDbInstance.getActivityLogs(100); // Get 100 latest logs

// Get all file contents
const files = await nexaDbInstance.getAllFileContents();

// Get all file settings
const settings = await nexaDbInstance.getAllFileSettings();

// Get recycle bin items
const deletedItems = await nexaDbInstance.getRecycleBinItems();
```

---

### 2. **Menggunakan IndexedDBManager (Advanced - Direct Access)**

Jika perlu kontrol lebih detail:

```javascript
import { IndexedDBManager } from 'NexaUI';

// Initialize database
const db = await IndexedDBManager.init("MyAppDB", 1);

// Gunakan seperti biasa
await db.set("users", { id: "1", name: "John" });
const user = await db.get("users", "1");
```

---

## 📝 Contoh Lengkap React Native Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { nexaDb } from 'NexaUI';

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [dbInfo, setDbInfo] = useState(null);

  useEffect(() => {
    loadUsers();
    loadDatabaseInfo();
    
    // Watch for changes (Real-time updates)
    const db = nexaDb.db;
    const unwatch = db.watchAuto("users", (change) => {
      console.log("Users changed:", change);
      loadUsers();
    });

    return () => unwatch(); // Cleanup
  }, []);

  const loadDatabaseInfo = () => {
    const info = nexaDb.getInfo();
    setDbInfo(info);
    console.log("Database Info:", info);
    console.log("Available Tables:", nexaDb.listStores());
  };

  const loadUsers = async () => {
    try {
      const result = await nexaDb.getAll("users");
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const addUser = async () => {
    try {
      const newUser = {
        id: `user_${Date.now()}`,
        name: `User ${users.length + 1}`,
        email: `user${users.length + 1}@example.com`,
        createdAt: new Date().toISOString()
      };

      await nexaDb.set("users", newUser);
      await loadUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await nexaDb.delete("users", userId);
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const searchUsers = async (query) => {
    try {
      const results = await nexaDb.search("users", query, ["name", "email"]);
      setUsers(results.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Users List</Text>
      
      {dbInfo && (
        <Text style={{ marginBottom: 10 }}>
          Database: {dbInfo.dbName} (v{dbInfo.version}) - {dbInfo.availableStores.length} tables
        </Text>
      )}
      
      <Button title="Add User" onPress={addUser} />
      
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
            <Text>{item.email}</Text>
            <Button
              title="Delete"
              onPress={() => deleteUser(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}
```

---

## 🔐 Fitur Enkripsi Otomatis

**Enkripsi sudah ENABLED secara default!** Semua data akan di-encrypt otomatis kecuali:
- `id`
- `createdAt`
- `updatedAt`

```javascript
// Data akan di-encrypt otomatis saat save
await nexaDb.set("users", {
  id: "user1", // Tidak di-encrypt
  name: "John", // Di-encrypt
  email: "john@example.com", // Di-encrypt
  password: "secret123", // Di-encrypt
  createdAt: new Date().toISOString() // Tidak di-encrypt
});

// Data akan di-decrypt otomatis saat read
const user = await nexaDb.get("users", "user1");
// Semua field sudah ter-decrypt otomatis
```

### Setup Encryption Custom (Optional)

```javascript
import { IndexedDBManager } from 'NexaUI';

// 🔐 Setup encryption dengan custom key
await IndexedDBManager.setupEncryption("mySecretKey2025", [
  "id",
  "createdAt",
  "updatedAt"
]);

// 🔓 Disable encryption (tidak recommended)
IndexedDBManager.disableEncryption();
```

---

## 🎯 Best Practices

### 1. **Gunakan nexaDb (Auto-Initialized)**
```javascript
// ✅ Recommended - Paling mudah
import { nexaDb } from 'NexaUI';
await nexaDb.set("users", data);
const user = await nexaDb.get("users", "1");

// ❌ Tidak perlu manual init
// const db = await IndexedDBManager.init("MyAppDB", 1);
```

### 2. **Store Dibuat Otomatis**
```javascript
// ✅ Store akan dibuat otomatis saat pertama kali digunakan
await nexaDb.set("newStore", { id: "1", data: "test" });
// Store "newStore" akan dibuat otomatis
```

### 3. **Handle Errors**
```javascript
try {
  await nexaDb.set("users", userData);
} catch (error) {
  console.error("Error saving user:", error);
}
```

### 4. **Gunakan Watch untuk Real-time Updates**
```javascript
useEffect(() => {
  const db = nexaDb.db;
  const unwatch = db.watchAuto("users", (change) => {
    // Update UI ketika data berubah
    loadUsers();
  });
  
  return () => unwatch(); // Cleanup
}, []);
```

### 5. **Batch Operations untuk Performance**
```javascript
// Untuk banyak data, gunakan batchUpdate
const db = nexaDb.db;
await db.batchUpdateAuto("users", usersArray, {
  clearFirst: false,
  onProgress: ({ completed, total }) => {
    console.log(`Progress: ${completed}/${total}`);
  }
});
```

---

## 📚 API Reference

### nexaDb Methods (Auto-Initialized)

| Method | Description | Example |
|--------|-------------|---------|
| `set(storeName, data)` | Save data (auto encrypt) | `await nexaDb.set("users", {id: "1", name: "John"})` |
| `get(storeName, key)` | Get data (auto decrypt) | `await nexaDb.get("users", "1")` |
| `getAll(storeName)` | Get all data | `await nexaDb.getAll("users")` |
| `delete(storeName, key)` | Delete data | `await nexaDb.delete("users", "1")` |
| `updateFields(storeName, id, fields)` | Update specific fields | `await nexaDb.updateFields("users", "1", {name: "Jane"})` |
| `updateField(storeName, id, fieldName, value)` | Update single field | `await nexaDb.updateField("users", "1", "name", "Jane")` |
| `search(storeName, query, fields?)` | Search data | `await nexaDb.search("users", "john", ["name"])` |
| `getLatest(storeName, count)` | Get latest records | `await nexaDb.getLatest("users", 10)` |
| `getOldest(storeName, count)` | Get oldest records | `await nexaDb.getOldest("users", 5)` |
| `listStores()` | List all stores/tables | `nexaDb.listStores()` |
| `hasStore(storeName)` | Check if store exists | `nexaDb.hasStore("users")` |
| `getInfo()` | Get database info | `nexaDb.getInfo()` |
| `ready()` | Ensure database ready | `await nexaDb.ready()` |
| `db` | Access IndexedDBManager | `nexaDb.db.setAuto(...)` |
| `instance` | Access NexaDb instance | `nexaDb.instance.getActivityLogs()` |

### IndexedDBManager Methods (Advanced)

| Method | Description |
|--------|-------------|
| `init(dbName, version, storeNames?)` | Initialize database |
| `setAuto(storeName, data)` | Save data (auto create store) |
| `getAuto(storeName, key)` | Get data |
| `getAllAuto(storeName)` | Get all data |
| `updateFieldsAuto(storeName, id, fields)` | Update fields |
| `searchAuto(storeName, query, fields?)` | Search data |
| `watchAuto(storeName, callback)` | Watch for changes |
| `export(storeNames?)` | Export data |
| `import(data, options)` | Import data |

### NexaDb Instance Methods

| Method | Description |
|--------|-------------|
| `getActivityLogs(limit)` | Get activity logs |
| `getAllFileContents()` | Get all file contents |
| `getAllFileSettings()` | Get all file settings |
| `getRecycleBinItems()` | Get recycle bin items |

---

## ⚠️ Catatan Penting

1. **Auto-Initialization**: `nexaDb` sudah di-initialize otomatis, tidak perlu `install()` atau `init()`
2. **Enkripsi Default**: Semua data di-encrypt otomatis dengan key `"nexaui2025"`
3. **Auto Store Creation**: Store akan dibuat otomatis saat pertama kali digunakan
4. **React Native Only**: Kode ini khusus untuk React Native, tidak untuk web browser
5. **AsyncStorage**: Menggunakan AsyncStorage sebagai backend storage
6. **No BroadcastChannel**: Cross-tab sync tidak tersedia di React Native

---

## 🐛 Troubleshooting

### Error: "Database not initialized"
```javascript
// Pastikan menggunakan nexaDb yang sudah auto-initialize
import { nexaDb } from 'NexaUI';
// Langsung bisa pakai, tidak perlu init
await nexaDb.set("users", data);
```

### Data tidak ter-decrypt
```javascript
// Pastikan encryption sudah initialized (sudah otomatis)
// Jika perlu custom key:
import { IndexedDBManager } from 'NexaUI';
await IndexedDBManager.setupEncryption("yourSecretKey");
```

### Store tidak ditemukan
```javascript
// Store akan dibuat otomatis saat pertama kali digunakan
await nexaDb.set("newStore", { id: "1", data: "test" });
// Store "newStore" akan dibuat otomatis
```

### Cara melihat daftar tabel
```javascript
// List semua tabel/store
const tables = nexaDb.listStores();
console.log(tables); // ['nexaStore', 'bucketsStore', 'users', ...]

// Atau menggunakan getInfo()
const info = nexaDb.getInfo();
console.log(info.availableStores); // Array of store names
```

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository atau hubungi developer.
