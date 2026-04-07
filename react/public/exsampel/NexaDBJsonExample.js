/**
 * ============================================
 * 📦 NEXADBJSON - CONTOH PENGGUNAAN
 * ============================================
 * 
 * File ini menampilkan contoh penggunaan NexaDbJson dengan UI langsung.
 * NexaDbJson menyimpan data JSON langsung ke file di perangkat menggunakan expo-file-system.
 * Tidak bergantung pada database, data disimpan sebagai file JSON.
 * 
 * CARA PENGGUNAAN MUDAH (TIDAK PERLU INIT):
 * 
 * 1. IMPORT NEXADBJSON:
 *    import { NexaDbJson } from "NexaUI";
 * 
 * 2. LANGSUNG GUNAKAN (Auto-initialize & Auto-create file):
 *    // Menyimpan data
 *    await NexaDbJson.set("users", {
 *      id: "1",
 *      name: "John Doe",
 *      email: "john@example.com"
 *    });
 * 
 *    // Mengambil data
 *    const user = await NexaDbJson.get("users", "1");
 * 
 *    // Mengambil semua data
 *    const users = await NexaDbJson.getAll("users");
 *    const allUsers = users.data; // Array of data
 * 
 *    // Menghapus data
 *    await NexaDbJson.delete("users", "1");
 *    // atau
 *    await NexaDbJson.del("users", "1");
 * 
 * 3. UPDATE DATA:
 *    await NexaDbJson.updateFields("users", "1", {
 *      name: "Updated Name",
 *      email: "new@email.com"
 *    });
 * 
 * 4. SEARCH DATA:
 *    const result = await NexaDbJson.search("users", "query", ["name", "email"]);
 *    const found = result.data; // Array of matching data
 * 
 * 5. GET LATEST/OLDEST:
 *    // Ambil 5 data terbaru
 *    const latest = await NexaDbJson.getLatest("users", 5);
 * 
 *    // Ambil 5 data terlama
 *    const oldest = await NexaDbJson.getOldest("users", 5);
 * 
 * 6. INISIALISASI MANUAL (Opsional - jika ingin custom base path):
 *    await NexaDbJson.init("CustomPath");
 *    // Setelah init, bisa gunakan set, get, getAll, delete langsung
 * 
 * 7. UTILITY:
 *    // Info storage
 *    const info = NexaDbJson.getInfo();
 *    console.log(info.basePath, info.availableStores);
 * 
 *    // Reset storage
 *    await NexaDbJson.resetDatabase();
 * 
 * CATATAN PENTING:
 * - NexaDbJson hanya bekerja di native platform (iOS/Android)
 * - Untuk web, gunakan IndexedDBManager
 * - Data disimpan sebagai file JSON di DocumentDirectoryPath/NexaDbJson/
 * - Data otomatis terenkripsi (encryption enabled by default)
 * - File akan dibuat otomatis saat pertama kali digunakan (auto mode)
 * - Pastikan data memiliki field 'id' sebagai primary key
 * - Tidak bergantung pada database, data langsung ke file
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
  Platform,
} from "NexaUI";

// Import NexaDbJson
import { NexaDbJson } from "NexaUI";

const NexaDBJsonExample = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    content: "",
  });
  const [selectedStore, setSelectedStore] = useState("myStore");
  const [searchQuery, setSearchQuery] = useState("");

  // Available stores (bisa custom)
  const availableStores = [
    "myStore",
    "users",
    "products",
    "settings",
    "cache",
    "logs",
  ];

  // Initialize storage
  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      // Check platform - File system only works on native platforms
      if (Platform.OS === 'web') {
        Alert.alert(
          "Not Supported",
          "NexaDbJson only works on native platforms (iOS/Android).\n\nFor web, use IndexedDBManager instead."
        );
        return;
      }

      // Check if NexaDbJson is available
      if (!NexaDbJson) {
        throw new Error("NexaDbJson is not exported from NexaUI. Check package/index.js");
      }
      
      // Tidak perlu init() karena set, get, getAll sudah auto-initialize
      console.log("🔄 NexaDbJson ready (auto-initialize mode)...");
      setDbInitialized(true);
      loadItems();
      console.log("✅ NexaDbJson ready");
    } catch (error) {
      console.error("❌ Failed to initialize NexaDbJson:", error);
      Alert.alert(
        "Storage Error", 
        `Failed to initialize storage:\n\n${error.message}\n\nPlatform: ${Platform.OS}\n\nMake sure:\n1. expo-file-system is installed (expo install expo-file-system)\n2. Running on native platform (iOS/Android)\n3. Rebuild app after installing expo-file-system`
      );
    }
  };

  // Load all items from selected store
  const loadItems = async () => {
    try {
      const result = await NexaDbJson.getAll(selectedStore);
      setItems(result.data || []);
    } catch (error) {
      console.error("Error loading items:", error);
      Alert.alert("Error", "Failed to load items");
    }
  };

  // Save item
  const saveItem = async () => {
    if (!formData.name || !formData.content) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const itemData = {
        id: formData.id || `item_${Date.now()}`,
        name: formData.name,
        content: formData.content,
      };

      await NexaDbJson.set(selectedStore, itemData);
      Alert.alert("Success", "Item saved successfully!");
      setFormData({ id: "", name: "", content: "" });
      loadItems();
    } catch (error) {
      console.error("Error saving item:", error);
      Alert.alert("Error", "Failed to save item");
    }
  };

  // Get item by ID
  const getItem = async (id) => {
    try {
      const item = await NexaDbJson.get(selectedStore, id);
      if (item) {
        setFormData(item);
        Alert.alert("Item Found", `Name: ${item.name}\nContent: ${item.content}`);
      } else {
        Alert.alert("Not Found", "Item not found");
      }
    } catch (error) {
      console.error("Error getting item:", error);
      Alert.alert("Error", "Failed to get item");
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await NexaDbJson.delete(selectedStore, id);
              Alert.alert("Success", "Item deleted successfully!");
              loadItems();
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  // Search items
  const searchItems = async () => {
    try {
      const result = await NexaDbJson.search(selectedStore, searchQuery, [
        "name",
        "content",
      ]);
      setItems(result.data || []);
    } catch (error) {
      console.error("Error searching items:", error);
    }
  };

  // Get latest items
  const getLatestItems = async () => {
    try {
      const result = await NexaDbJson.getLatest(selectedStore, 5);
      if (result.data) {
        const latest = Array.isArray(result.data) ? result.data : [result.data];
        setItems(latest);
        Alert.alert("Success", `Showing ${latest.length} latest items`);
      }
    } catch (error) {
      console.error("Error getting latest items:", error);
    }
  };

  // Update item
  const updateItem = async () => {
    if (!formData.id) {
      Alert.alert("Error", "Please select an item to update");
      return;
    }

    try {
      await NexaDbJson.updateFields(selectedStore, formData.id, {
        name: formData.name,
        content: formData.content,
      });
      Alert.alert("Success", "Item updated successfully!");
      setFormData({ id: "", name: "", content: "" });
      loadItems();
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update item");
    }
  };

  // Get storage info
  const showStorageInfo = async () => {
    try {
      const info = NexaDbJson.getInfo();
      Alert.alert(
        "Storage Info",
        `Base Path: ${info.basePath}\nStores: ${info.availableStores.join(", ")}\nInitialized: ${info.isInitialized ? "Yes" : "No"}`
      );
    } catch (error) {
      console.error("Error getting storage info:", error);
    }
  };

  // Reset storage
  const resetStorage = async () => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to reset the storage? All data will be lost!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await NexaDbJson.resetDatabase();
              setItems([]);
              Alert.alert("Success", "Storage reset successfully!");
            } catch (error) {
              console.error("Error resetting storage:", error);
              Alert.alert("Error", "Failed to reset storage");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemContent}>{item.content}</Text>
        {item.createdAt && (
          <Text style={styles.itemDate}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => getItem(item.id)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteItem(item.id)}
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
          <Text style={styles.loadingText}>Initializing storage...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>📦 NexaDbJson Example</Text>
          <Text style={styles.subtitle}>
            JSON File Storage dengan expo-file-system
          </Text>
        </View>

        {/* Store Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Store</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.storeRow}>
              {availableStores.map((store) => (
                <TouchableOpacity
                  key={store}
                  style={[
                    styles.storeButton,
                    selectedStore === store && styles.storeButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedStore(store);
                    loadItems();
                  }}
                >
                  <Text
                    style={[
                      styles.storeButtonText,
                      selectedStore === store && styles.storeButtonTextActive,
                    ]}
                  >
                    {store}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.currentStore}>
            Current Store: <Text style={styles.currentStoreName}>{selectedStore}</Text>
          </Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add/Edit Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Content"
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={3}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={formData.id ? updateItem : saveItem}
            >
              <Text style={styles.buttonText}>
                {formData.id ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
            {formData.id && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setFormData({ id: "", name: "", content: "" })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Items</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, styles.searchInput]}
              placeholder="Search by name or content..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={[styles.button, styles.searchButton]}
              onPress={searchItems}
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
              onPress={loadItems}
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.actionButtonSmall]}
              onPress={getLatestItems}
            >
              <Text style={styles.buttonText}>Latest 5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.actionButtonSmall]}
              onPress={showStorageInfo}
            >
              <Text style={styles.buttonText}>Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={resetStorage}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Items ({items.length} total) - {selectedStore}
          </Text>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>
                Add an item using the form above
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NexaDBJsonExample;

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
  storeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  storeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  storeButtonActive: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  storeButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  storeButtonTextActive: {
    color: "#fff",
  },
  currentStore: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  currentStoreName: {
    fontWeight: "600",
    color: "#FF9800",
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
  item: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemContent: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: "#999",
  },
  itemActions: {
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

