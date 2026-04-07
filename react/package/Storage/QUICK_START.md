# ⚡ Quick Start Guide - IndexDB.js & NexaDb.js

## 🚀 5 Menit Mulai Pakai

### 1. Install Dependencies
```bash
npm install @react-native-async-storage/async-storage
```

### 2. Import & Initialize
```javascript
import { IndexedDBManager } from './package/Storage/IndexDB.js';

// Initialize (Auto Mode - Recommended)
const db = await IndexedDBManager.init("MyAppDB", 1);
```

### 3. Basic Usage
```javascript
// ✅ SAVE
await db.set("users", {
  id: "user1",
  name: "John",
  email: "john@example.com"
});

// ✅ READ
const user = await db.get("users", "user1");

// ✅ READ ALL
const allUsers = await db.getAll("users");

// ✅ UPDATE
await db.updateFields("users", "user1", {
  name: "John Updated"
});

// ✅ DELETE
await db.delete("users", "user1");
```

### 4. Real-time Updates
```javascript
// Watch for changes
const unwatch = db.watch("users", (change) => {
  console.log("Data changed:", change);
  // Update your UI here
});

// Stop watching
unwatch();
```

---

## 📋 Cheat Sheet

| Operation | Code |
|-----------|------|
| **Save** | `await db.set("store", { id: "1", ... })` |
| **Get** | `await db.get("store", "1")` |
| **Get All** | `await db.getAll("store")` |
| **Update** | `await db.updateFields("store", "1", { ... })` |
| **Delete** | `await db.delete("store", "1")` |
| **Search** | `await db.search("store", "query", ["field1"])` |
| **Watch** | `db.watch("store", callback)` |

---

## 🔐 Enkripsi Otomatis

**Sudah ENABLED default!** Semua data di-encrypt otomatis kecuali `id`, `createdAt`, `updatedAt`.

```javascript
// Data di-encrypt otomatis saat save
await db.set("users", {
  id: "user1", // Tidak di-encrypt
  password: "secret123" // Di-encrypt
});

// Data di-decrypt otomatis saat read
const user = await db.get("users", "user1");
// password sudah ter-decrypt
```

---

## 🎯 Contoh React Native Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { IndexedDBManager } from './package/Storage/IndexDB.js';

export default function App() {
  const [db, setDb] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    const database = await IndexedDBManager.init("MyAppDB", 1);
    setDb(database);
    
    // Load data
    const result = await database.get("myStore", "myKey");
    setData(result);
  };

  const saveData = async () => {
    await db.set("myStore", {
      id: "myKey",
      message: "Hello World!"
    });
    
    // Reload
    const result = await db.get("myStore", "myKey");
    setData(result);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>{data?.message || "No data"}</Text>
      <Button title="Save Data" onPress={saveData} />
    </View>
  );
}
```

---

## ⚠️ Important Notes

1. ✅ **Auto Mode**: Store dibuat otomatis, tidak perlu inisialisasi manual
2. ✅ **Auto Encrypt**: Semua data di-encrypt otomatis
3. ✅ **Auto Decrypt**: Data di-decrypt otomatis saat read
4. ⚠️ **React Native Only**: Tidak untuk web browser
5. ⚠️ **AsyncStorage**: Menggunakan AsyncStorage sebagai backend

---

## 📚 More Examples

Lihat file `example_usage.js` untuk contoh lengkap!

