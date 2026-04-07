/**
 * 📱 Contoh Penggunaan IndexDB.js & NexaDb.js di React Native
 * 
 * File ini berisi contoh-contoh praktis penggunaan database
 */

import { IndexedDBManager } from './IndexDB.js';
import { NexaDb } from './NexaDb.js';

// ============================================
// CONTOH 1: Basic CRUD Operations
// ============================================

export async function basicCRUDExample() {
  // 1. Initialize database
  const db = await IndexedDBManager.init("MyAppDB", 1);

  // 2. SET - Simpan data (auto encrypt)
  await db.set("users", {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    password: "secret123", // Akan di-encrypt otomatis
    age: 30,
    createdAt: new Date().toISOString()
  });

  // 3. GET - Ambil data (auto decrypt)
  const user = await db.get("users", "user1");
  console.log("User:", user);
  // Output: { id: "user1", name: "John Doe", email: "john@example.com", password: "secret123", ... }

  // 4. GET ALL - Ambil semua data
  const allUsers = await db.getAll("users");
  console.log("All users:", allUsers.data);

  // 5. UPDATE - Update data
  await db.updateFields("users", "user1", {
    name: "John Updated",
    email: "john.updated@example.com"
  });

  // 6. DELETE - Hapus data
  await db.delete("users", "user1");
}

// ============================================
// CONTOH 2: Search & Filter
// ============================================

export async function searchExample() {
  const db = await IndexedDBManager.init("MyAppDB", 1);

  // Simpan beberapa data dulu
  await db.set("products", {
    id: "prod1",
    name: "Laptop ASUS",
    category: "Electronics",
    price: 1000
  });

  await db.set("products", {
    id: "prod2",
    name: "iPhone 15",
    category: "Electronics",
    price: 1200
  });

  await db.set("products", {
    id: "prod3",
    name: "Sofa",
    category: "Furniture",
    price: 500
  });

  // SEARCH - Cari di semua field
  const results1 = await db.search("products", "laptop");
  console.log("Search 'laptop':", results1.data);

  // SEARCH - Cari di field tertentu
  const results2 = await db.search("products", "electronics", ["category"]);
  console.log("Search 'electronics' in category:", results2.data);

  // GET LATEST - Ambil data terbaru
  const latest = await db.getLatest("products", 2);
  console.log("Latest 2 products:", latest.data);

  // GET BY DATE RANGE
  const recent = await db.getByDateRange(
    "products",
    "2024-01-01",
    "2024-12-31"
  );
  console.log("Products in date range:", recent.data);
}

// ============================================
// CONTOH 3: Real-time Updates (Observer)
// ============================================

export async function realtimeExample() {
  const db = await IndexedDBManager.init("MyAppDB", 1);

  // WATCH - Monitor perubahan data
  const unwatch = db.watch("users", (change) => {
    console.log("Data changed:", change);
    console.log("Store:", change.storeName);
    console.log("Change type:", change.changeType); // 'add', 'update', 'delete', 'refresh'
    console.log("Data:", change.data);
    console.log("Timestamp:", change.timestamp);
  });

  // Simpan data - akan trigger observer
  await db.set("users", {
    id: "user2",
    name: "Jane Doe",
    email: "jane@example.com"
  });

  // Update data - akan trigger observer
  await db.updateFields("users", "user2", {
    name: "Jane Updated"
  });

  // Stop watching
  unwatch();
}

// ============================================
// CONTOH 4: Batch Operations
// ============================================

export async function batchExample() {
  const db = await IndexedDBManager.init("MyAppDB", 1);

  // BATCH UPDATE - Update banyak data sekaligus
  const users = [
    { id: "user1", name: "User 1", email: "user1@example.com" },
    { id: "user2", name: "User 2", email: "user2@example.com" },
    { id: "user3", name: "User 3", email: "user3@example.com" }
  ];

  await db.batchUpdate("users", users, {
    clearFirst: false, // Jangan hapus data lama
    onProgress: ({ processed, total, percentage }) => {
      console.log(`Progress: ${processed}/${total} (${percentage}%)`);
    }
  });

  // BATCH UPDATE FIELDS - Update field tertentu untuk banyak record
  await db.batchUpdateFields("users", [
    { id: "user1", fields: { status: "active" } },
    { id: "user2", fields: { status: "inactive" } },
    { id: "user3", fields: { status: "active" } }
  ], {
    onProgress: ({ completed, total }) => {
      console.log(`Updated ${completed}/${total} users`);
    }
  });
}

// ============================================
// CONTOH 5: Export & Import
// ============================================

export async function exportImportExample() {
  const db = await IndexedDBManager.init("MyAppDB", 1);

  // Simpan beberapa data
  await db.set("users", { id: "user1", name: "John" });
  await db.set("products", { id: "prod1", name: "Laptop" });

  // EXPORT - Export data ke JSON
  const exportData = await db.export(["users", "products"], {
    includeMetadata: true,
    onProgress: ({ completed, total }) => {
      console.log(`Exporting: ${completed}/${total}`);
    }
  });

  console.log("Exported data:", exportData.data);
  console.log("Size:", exportData.size, "bytes");

  // EXPORT TO FILE - Export ke string JSON
  const fileExport = await db.exportToFile(
    "backup.json",
    ["users", "products"]
  );
  console.log("File data:", fileExport.data); // JSON string

  // IMPORT - Import data dari JSON
  await db.import(exportData.data, {
    overwrite: true,
    onProgress: ({ completed, total }) => {
      console.log(`Importing: ${completed}/${total}`);
    }
  });
}

// ============================================
// CONTOH 6: Nested Fields & Advanced Updates
// ============================================

export async function nestedFieldsExample() {
  const db = await IndexedDBManager.init("MyAppDB", 1);

  // Simpan data dengan nested object
  await db.set("users", {
    id: "user1",
    name: "John",
    profile: {
      bio: "Software developer",
      avatar: "https://example.com/avatar.jpg",
      settings: {
        theme: "dark",
        notifications: true
      }
    }
  });

  // UPDATE NESTED FIELD - Update field di dalam nested object
  await db.updateNestedField("users", "user1", "profile.bio", "Senior Developer");
  await db.updateNestedField("users", "user1", "profile.settings.theme", "light");

  // MERGE DATA - Deep merge objects
  await db.mergeData("users", "user1", {
    profile: {
      settings: {
        notifications: false
      }
    }
  }, {
    deepMerge: true // Deep merge untuk nested objects
  });

  // REMOVE NESTED FIELD - Hapus field di dalam nested object
  await db.removeNestedField("users", "user1", "profile", "avatar");
}

// ============================================
// CONTOH 7: Menggunakan NexaDb Class
// ============================================

export async function nexaDbExample() {
  const nexaDb = new NexaDb();

  // Install database (create all default stores)
  await nexaDb.install();

  // Get database interface
  const db = await nexaDb.Ref();

  // Sekarang bisa pakai seperti biasa
  await db.set("nexaStore", {
    id: "item1",
    name: "My Item",
    data: { /* ... */ }
  });

  // Get activity logs
  const logs = await nexaDb.getActivityLogs(100);
  console.log("Activity logs:", logs);

  // Get all file contents
  const files = await nexaDb.getAllFileContents();
  console.log("File contents:", files);
}

// ============================================
// CONTOH 8: React Native Component Integration
// ============================================

/*
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput } from 'react-native';
import { IndexedDBManager } from './package/Storage/IndexDB.js';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [db, setDb] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    initializeDatabase();
    return () => {
      // Cleanup observers
      if (db) {
        db.cleanup();
      }
    };
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await IndexedDBManager.init("MyAppDB", 1);
      setDb(database);

      // Load existing users
      await loadUsers();

      // Watch for changes
      database.watch("users", (change) => {
        console.log("Users changed:", change);
        loadUsers();
      });
    } catch (error) {
      console.error("Database init error:", error);
    }
  };

  const loadUsers = async () => {
    if (!db) return;
    try {
      const result = await db.getAll("users");
      setUsers(result.data || []);
    } catch (error) {
      console.error("Load users error:", error);
    }
  };

  const addUser = async () => {
    if (!db || !name || !email) return;
    
    try {
      const newUser = {
        id: `user_${Date.now()}`,
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      };

      await db.set("users", newUser);
      setName('');
      setEmail('');
      await loadUsers();
    } catch (error) {
      console.error("Add user error:", error);
    }
  };

  const deleteUser = async (userId) => {
    if (!db) return;
    try {
      await db.delete("users", userId);
      await loadUsers();
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  const searchUsers = async (query) => {
    if (!db) return;
    try {
      const results = await db.search("users", query, ["name", "email"]);
      setUsers(results.data || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>User Management</Text>
      
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <Button title="Add User" onPress={addUser} />
      
      <TextInput
        placeholder="Search users..."
        onChangeText={searchUsers}
        style={{ borderWidth: 1, padding: 10, marginTop: 20, marginBottom: 10 }}
      />
      
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
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
*/

// ============================================
// CONTOH 9: Setup Custom Encryption
// ============================================

export async function encryptionExample() {
  // Setup encryption dengan custom key
  await IndexedDBManager.setupEncryption("mySecretKey2025", [
    "id",
    "createdAt",
    "updatedAt"
  ]);

  const db = await IndexedDBManager.init("MyAppDB", 1);

  // Data akan di-encrypt dengan key "mySecretKey2025"
  await db.set("users", {
    id: "user1", // Tidak di-encrypt
    name: "John", // Di-encrypt
    email: "john@example.com", // Di-encrypt
    password: "secret123", // Di-encrypt
    createdAt: new Date().toISOString() // Tidak di-encrypt
  });

  // Data akan di-decrypt otomatis saat read
  const user = await db.get("users", "user1");
  console.log("Decrypted user:", user);
}

// ============================================
// CONTOH 10: Database Size Management
// ============================================

export async function sizeManagementExample() {
  const db = await IndexedDBManager.init("MyAppDB", 1);

  // GET DATABASE SIZE
  const dbSize = await db.getDatabaseSize();
  console.log("Database size:", dbSize.totalSizeMB, "MB");
  console.log("Store sizes:", dbSize.storeSizes);

  // GET STORE SIZE
  const storeSize = await db.getStoreSize("users");
  console.log("Users store size:", storeSize.sizeMB, "MB");
  console.log("Total records:", storeSize.totalRecords);

  // CLEANUP BY SIZE - Hapus data lama jika melebihi limit
  await db.cleanupBySize("users", 10); // Max 10MB

  // MONITOR SIZE - Monitor ukuran database secara berkala
  const stopMonitoring = db.monitorSize(30000); // Check setiap 30 detik
  
  // Stop monitoring
  // stopMonitoring();
}

