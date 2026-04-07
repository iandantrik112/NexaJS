/**
 * ============================================
 * 🔥 NEXADBFIREBASE - CONTOH PENGGUNAAN
 * ============================================
 * 
 * File ini menampilkan contoh penggunaan NexaDbFirebase dengan UI langsung.
 * NexaDbFirebase adalah implementasi Firebase Realtime Database dengan enkripsi otomatis.
 * Tidak perlu membuat script terpisah, langsung gunakan di komponen React.
 * 
 * CARA PENGGUNAAN MUDAH (TIDAK PERLU INIT):
 * 
 * 1. IMPORT NEXADBFIREBASE:
 *    import { NexaDbFirebase } from "NexaUI";
 * 
 * 2. LANGSUNG GUNAKAN (Auto-initialize & Auto-create store):
 *    // Menyimpan data
 *    await NexaDbFirebase.set("users", {
 *      id: "1",
 *      name: "John Doe",
 *      email: "john@example.com"
 *    });
 * 
 *    // Mengambil data
 *    const user = await NexaDbFirebase.get("users", "1");
 * 
 *    // Mengambil semua data
 *    const users = await NexaDbFirebase.getAll("users");
 *    const allUsers = users.data; // Array of data
 * 
 *    // Menghapus data
 *    await NexaDbFirebase.delete("users", "1");
 * 
 * 3. UPDATE DATA:
 *    await NexaDbFirebase.updateFields("users", "1", {
 *      name: "Updated Name",
 *      email: "new@email.com"
 *    });
 * 
 * 4. SEARCH DATA:
 *    const result = await NexaDbFirebase.search("users", "query", ["name", "email"]);
 *    const found = result.data; // Array of matching data
 * 
 * 5. GET LATEST/OLDEST:
 *    // Ambil 5 data terbaru
 *    const latest = await NexaDbFirebase.getLatest("users", 5);
 * 
 *    // Ambil 5 data terlama
 *    const oldest = await NexaDbFirebase.getOldest("users", 5);
 * 
 * 6. UTILITY:
 *    // Info storage
 *    const info = NexaDbFirebase.getInfo();
 *    console.log(info.availableStores, info.firebaseConfig);
 * 
 *    // Reset database
 *    await NexaDbFirebase.resetDatabase();
 * 
 * 7. REAL-TIME WATCHING:
 *    const unsubscribe = NexaDbFirebase.watch("users", (data) => {
 *      console.log("Data updated:", data);
 *    });
 *    // Unsubscribe
 *    unsubscribe();
 * 
 * CATATAN PENTING:
 * - NexaDbFirebase menggunakan Firebase Realtime Database
 * - Memerlukan Firebase configuration (FirebaseConfig dari config.js)
 * - Data otomatis terenkripsi (encryption enabled by default)
 * - Store akan dibuat otomatis saat pertama kali digunakan (auto mode)
 * - Pastikan data memiliki field 'id' sebagai primary key
 * - Real-time updates menggunakan Firebase polling mechanism
 * 
 * ============================================
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "NexaUI";

// Import NexaDbFirebase separately
import { NexaDbFirebase } from "NexaUI";

// Log after import to verify import is correct
// console.log("📦 [NexaDbFirebaseExample] NexaDbFirebase imported:", {
//   type: typeof NexaDbFirebase,
//   hasSet: typeof NexaDbFirebase?.set === 'function',
//   setType: typeof NexaDbFirebase?.set,
//   isObject: typeof NexaDbFirebase === 'object' && NexaDbFirebase !== null
// });


const NexaDbFirebaseExample = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize database
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      // Check if NexaDbFirebase is available
      if (!NexaDbFirebase) {
        throw new Error("NexaDbFirebase is not exported from NexaUI. Check package/index.js");
      }
      
      // Tidak perlu init() karena set, get, getAll sudah auto-initialize
      console.log("🔄 NexaDbFirebase ready (auto-initialize mode)...");
      setDbInitialized(true);
      loadUsers();
      console.log("✅ NexaDbFirebase ready");
    } catch (error) {
      console.error("❌ Failed to initialize NexaDbFirebase:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        NexaDbFirebase: typeof NexaDbFirebase,
      });
      Alert.alert(
        "Database Error", 
        `Failed to initialize database:\n\n${error.message}\n\nMake sure:\n1. NexaFirebase.js is properly configured\n2. Firebase configuration is set up\n3. Firebase Realtime Database is enabled`
      );
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      const result = await NexaDbFirebase.getAll("users");
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Save user
  const saveUser = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      console.log("🔍 [saveUser] START - About to call NexaDbFirebase.set");
      console.log("🔍 [saveUser] NexaDbFirebase:", {
        type: typeof NexaDbFirebase,
        hasSet: typeof NexaDbFirebase?.set === 'function',
        setType: typeof NexaDbFirebase?.set,
        keys: NexaDbFirebase ? Object.keys(NexaDbFirebase).slice(0, 10) : 'null'
      });
      
      const userData = {
        id: formData.id || `user_${Date.now()}`,
        name: formData.name,
        email: formData.email,
      };

      console.log("🔍 [saveUser] Calling NexaDbFirebase.set with:", {
        storeName: "users",
        dataId: userData.id,
        dataName: userData.name
      });

      await NexaDbFirebase.set("users", userData);
      
      console.log("✅ [saveUser] NexaDbFirebase.set completed successfully");
      Alert.alert("Success", "User saved successfully!");
      setFormData({ id: "", name: "", email: "" });
      loadUsers();
    } catch (error) {
      console.error("❌ [saveUser] Error saving user:", error);
      console.error("❌ [saveUser] Error details:", {
        message: error.message,
        stack: error.stack,
        errorType: typeof error,
        errorConstructor: error.constructor?.name
      });
      Alert.alert("Error", `Failed to save user: ${error.message}`);
    }
  };

  // Get user by ID
  const getUser = async (id) => {
    try {
      const user = await NexaDbFirebase.get("users", id);
      if (user) {
        setFormData(user);
        Alert.alert("User Found", `Name: ${user.name}\nEmail: ${user.email}`);
      } else {
        Alert.alert("Not Found", "User not found");
      }
    } catch (error) {
      console.error("Error getting user:", error);
      Alert.alert("Error", "Failed to get user");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await NexaDbFirebase.delete("users", id);
              Alert.alert("Success", "User deleted successfully!");
              loadUsers();
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  // Search users
  const searchUsers = async () => {
    try {
      const result = await NexaDbFirebase.search("users", searchQuery, [
        "name",
        "email",
      ]);
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Get latest users
  const getLatestUsers = async () => {
    try {
      const result = await NexaDbFirebase.getLatest("users", 5);
      if (result.data) {
        const latest = Array.isArray(result.data) ? result.data : [result.data];
        setUsers(latest);
        Alert.alert("Success", `Showing ${latest.length} latest users`);
      }
    } catch (error) {
      console.error("Error getting latest users:", error);
    }
  };

  // Update user
  const updateUser = async () => {
    if (!formData.id) {
      Alert.alert("Error", "Please select a user to update");
      return;
    }

    try {
      await NexaDbFirebase.updateFields("users", formData.id, {
        name: formData.name,
        email: formData.email,
      });
      Alert.alert("Success", "User updated successfully!");
      setFormData({ id: "", name: "", email: "" });
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "Failed to update user");
    }
  };

  // Reset database
  const resetDatabase = async () => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to reset the database? All data will be lost!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await NexaDbFirebase.resetDatabase();
              setUsers([]);
              Alert.alert("Success", "Database reset successfully!");
            } catch (error) {
              console.error("Error resetting database:", error);
              Alert.alert("Error", "Failed to reset database");
            }
          },
        },
      ]
    );
  };

  // Get database info
  const showDatabaseInfo = async () => {
    try {
      const info = NexaDbFirebase.getInfo();
      Alert.alert(
        "Database Info",
        `Initialized: ${info.isInitialized}\nStores: ${info.availableStores.join(", ")}\nConfig: ${info.firebaseConfig}`
      );
    } catch (error) {
      console.error("Error getting database info:", error);
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.createdAt && (
          <Text style={styles.userDate}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => getUser(item.id)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteUser(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!dbInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Initializing database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🔥 NexaDbFirebase Example</Text>
          <Text style={styles.subtitle}>
            Firebase Realtime Database dengan Enkripsi Otomatis
          </Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add/Edit User</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={formData.id ? updateUser : saveUser}
            >
              <Text style={styles.buttonText}>
                {formData.id ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
            {formData.id && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setFormData({ id: "", name: "", email: "" })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Users</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, styles.searchInput]}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={[styles.button, styles.searchButton]}
              onPress={searchUsers}
            >
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.button, styles.actionButtonSmall]}
              onPress={loadUsers}
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.actionButtonSmall]}
              onPress={getLatestUsers}
            >
              <Text style={styles.buttonText}>Latest 5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.actionButtonSmall]}
              onPress={showDatabaseInfo}
            >
              <Text style={styles.buttonText}>Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={resetDatabase}
            >
              <Text style={styles.buttonText}>Reset DB</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Users ({users.length} total)
          </Text>
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>
                Add a user using the form above
              </Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NexaDbFirebaseExample;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#999",
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: "#2196F3",
  },
  dangerButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
  },
  searchRow: {
    flexDirection: "row",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButtonSmall: {
    backgroundColor: "#2196F3",
    flex: 1,
    minWidth: "22%",
  },
  userItem: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: "#999",
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#FF9800",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
  },
});

