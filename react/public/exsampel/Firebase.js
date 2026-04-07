import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Buttons,
  useState,
  useEffect,
  NexaFirestore,
  firebaseData,
  nexaFirebase,
  initNexaFirebase,
  FirebaseConfig,
  Alert,
} from "NexaUI";

// ==========================================
// CONTOH PENGGUNAAN NEXAFIREBASE REACT NATIVE REST API
// ==========================================

// 1. Initialize Firebase dengan config otomatis dari config.js (CARA TERMUDAH)
const initializeNxFirebase = async () => {
  try {
    // Menggunakan initNexaFirebase - auto config + React Native ready
    const usersCRUD = await initNexaFirebase("users");
    console.log(
      "✅ NexaFirebase REST API initialized successfully for React Native!"
    );
    console.log("🌐 Platform:", usersCRUD.getPlatformInfo());

    // Test connection
    const connectionTest = await usersCRUD.testConnection();
    console.log("🔗 Connection test:", connectionTest);

    return usersCRUD;
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    throw error;
  }
};

// 2. Cara alternatif - Manual initialization
const manualInitExample = async () => {
  try {
    // Menggunakan nexaFirebase dengan auto config
    const productsCRUD = nexaFirebase("products");
    await productsCRUD.initializeForRN();
    console.log("✅ Products CRUD ready!");

    // Test write permission
    await productsCRUD.testWritePermission();

    return productsCRUD;
  } catch (error) {
    console.error("❌ Manual init error:", error);
    throw error;
  }
};

// 3. CRUD Operations Examples dengan REST API
const crudExamples = async () => {
  try {
    // Initialize Firebase untuk CRUD operations
    const dataCRUD = await initNexaFirebase("testData");

    // ===== CREATE DATA =====
    console.log("🔥 Testing CREATE operations...");

    // Add data dengan key manual
    await dataCRUD.add({
      user1: {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        active: true,
      },
    });
    console.log("✅ User1 created successfully");

    // Add data dengan auto-generated key
    const autoKeyResult = await dataCRUD.addWithAutoKey({
      name: "Jane Smith",
      email: "jane@example.com",
      age: 25,
      active: true,
    });
    console.log("✅ Auto-key user created:", autoKeyResult.key);

    // ===== READ DATA =====
    console.log("📖 Testing READ operations...");

    // Get single data
    const userData = await dataCRUD.get("user1");
    console.log("📊 User1 data:", userData);

    // Get all data
    const allData = await dataCRUD.getAll();
    console.log("📊 All data count:", allData.length);

    // ===== UPDATE DATA =====
    console.log("🔄 Testing UPDATE operations...");

    // Update dengan history tracking
    await dataCRUD.history({
      user1: {
        name: "John Doe Updated",
        email: "john@example.com",
        age: 31,
        active: true,
        lastLogin: new Date().toISOString(),
      },
    });
    console.log("✅ User1 updated with history");

    // Update by field (tanpa perlu key)
    await dataCRUD.updateByField("email", "jane@example.com", {
      status: "premium",
      updatedBy: "admin",
    });
    console.log("✅ Updated user by email field");

    // ===== SEARCH DATA =====
    console.log("🔍 Testing SEARCH operations...");

    // Search by field
    const activeUsers = await dataCRUD.search("active", true);
    console.log("🔍 Active users found:", activeUsers.length);

    // Find and update dengan multiple criteria
    await dataCRUD.findAndUpdate(
      { name: "John Doe Updated", active: true },
      { lastActivity: new Date().toISOString() }
    );
    console.log("✅ Found and updated user");

    // ===== COUNT & EXISTS =====
    const totalCount = await dataCRUD.count();
    const user1Exists = await dataCRUD.exists("user1");
    console.log("📊 Total records:", totalCount);
    console.log("❓ User1 exists:", user1Exists);

    return { userData, allData, activeUsers, totalCount };
  } catch (error) {
    console.error("❌ CRUD error:", error);
    throw error;
  }
};

// 4. Offline Support Examples (React Native AsyncStorage)
const offlineExamples = async () => {
  try {
    // Initialize Firebase untuk offline operations
    const offlineCRUD = await initNexaFirebase("offlineData");

    console.log("📱 Testing OFFLINE support...");

    // ===== OFFLINE ADD =====
    // Add data dengan offline fallback
    await offlineCRUD.addOffline(
      {
        offline1: {
          name: "Offline User",
          email: "offline@example.com",
          savedAt: new Date().toISOString(),
        },
      },
      true
    ); // Enable offline mode
    console.log("✅ Data saved with offline support");

    // ===== LOCAL STORAGE OPERATIONS =====
    // Save to local storage
    await offlineCRUD.saveToLocal("localKey1", {
      message: "This is stored locally",
      timestamp: Date.now(),
    });
    console.log("✅ Data saved to AsyncStorage");

    // Get from local storage
    const localData = await offlineCRUD.getFromLocal("localKey1");
    console.log("📱 Local data retrieved:", localData);

    // ===== OFFLINE READ =====
    // Get data dengan offline fallback
    const offlineUserData = await offlineCRUD.getOffline("offline1");
    console.log("📊 Offline user data:", offlineUserData);

    // ===== CONNECTIVITY CHECK =====
    const isOnline = await offlineCRUD.checkConnectivity();
    console.log("🌐 Network status:", isOnline ? "Online" : "Offline");

    // ===== SYNC WITH FIREBASE =====
    if (isOnline) {
      const syncResult = await offlineCRUD.syncWithFirebase();
      console.log("🔄 Sync result:", syncResult);
    }

    return { localData, offlineUserData, isOnline };
  } catch (error) {
    console.error("❌ Offline operations error:", error);
    throw error;
  }
};

// 5. Real-time Updates Examples (Polling-based for REST API)
const realtimeExamples = async () => {
  try {
    // Initialize Firebase untuk real-time operations
    const realtimeCRUD = await initNexaFirebase("realtimeData");

    console.log("⚡ Testing REAL-TIME updates...");

    // Add some initial data
    await realtimeCRUD.add({
      rt1: {
        message: "Real-time message 1",
        timestamp: new Date().toISOString(),
        status: "active",
      },
    });

    // ===== REAL-TIME LISTENER =====
    // Setup real-time listener dengan polling (REST API)
    let updateCount = 0;
    const unsubscribe = await realtimeCRUD.red((data) => {
      updateCount++;
      console.log(
        `🔄 Real-time update #${updateCount}:`,
        data.length,
        "records"
      );

      // Process data changes
      data.forEach((item) => {
        if (item.status === "new") {
          console.log("🆕 New item detected:", item.key);
        }
      });
    }, 2000); // Poll every 2 seconds - DAPAT DIOPTIMASI!

    // Simulate data changes untuk testing real-time
    setTimeout(async () => {
      await realtimeCRUD.add({
        rt2: {
          message: "Real-time message 2",
          timestamp: new Date().toISOString(),
          status: "new",
        },
      });
      console.log("➕ Added new real-time data");
    }, 3000);

    // Stop listening after 10 seconds
    setTimeout(() => {
      unsubscribe();
      console.log("⏹️ Real-time listener stopped");
    }, 10000);

    return { updateCount, message: "Real-time listener active for 10 seconds" };
  } catch (error) {
    console.error("❌ Real-time error:", error);
    throw error;
  }
};

// 6. Platform-specific Examples
const platformExamples = async () => {
  try {
    // Initialize Firebase untuk platform-specific features
    const platformCRUD = await initNexaFirebase("platformData");

    console.log("📱 Testing PLATFORM-SPECIFIC features...");

    // ===== PLATFORM DETECTION =====
    const platformInfo = platformCRUD.getPlatformInfo();
    console.log("🔍 Platform info:", platformInfo);

    // Platform-specific operations
    if (platformInfo.isAndroid) {
      console.log("🤖 Running on Android");
      // Android-specific logic
    } else if (platformInfo.isIOS) {
      console.log("🍎 Running on iOS");
      // iOS-specific logic
    } else if (platformInfo.isWeb) {
      console.log("🌐 Running on Web");
      // Web-specific logic
    }

    // ===== CONNECTION ANALYSIS =====
    // Analyze Firebase configuration
    const configAnalysis = NexaFirestore.analyzeConfig(FirebaseConfig);
    console.log("🔧 Config analysis:", configAnalysis);

    // Test write permissions
    const writeTest = await platformCRUD.testWritePermission();
    console.log("✏️ Write permission test:", writeTest);

    return { platformInfo, configAnalysis, writeTest };
  } catch (error) {
    console.error("❌ Platform examples error:", error);
    throw error;
  }
};

// ==========================================
// REACT COMPONENT FOR NAVIGATION
// ==========================================

const Firebase = () => {
  const [firebaseStatus, setFirebaseStatus] = useState("Not initialized");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [firebaseCRUD, setFirebaseCRUD] = useState(null); // ✅ Singleton instance

  const addResult = (message) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const initializeFirebase = async () => {
    setLoading(true);
    try {
      // ✅ Initialize ONCE dan simpan ke state
      const crudInstance = await initNexaFirebase("testUsers");
      setFirebaseCRUD(crudInstance); // Save instance
      setFirebaseStatus("NexaFirebase REST API initialized successfully!");
      addResult("✅ NexaFirebase REST API initialized for React Native!");
      addResult(
        `🌐 Platform: ${JSON.stringify(crudInstance.getPlatformInfo())}`
      );
      addResult("🎯 Instance saved - ready for efficient operations!");
    } catch (error) {
      setFirebaseStatus(`Error: ${error.message}`);
      addResult(`❌ Initialization error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreate = async () => {
    setLoading(true);
    try {
      const firebaseCRUD = nexaFirebase("testUsers");
      addResult("🔥 Testing CREATE operation...");

      // Add data dengan key manual
      await firebaseCRUD.add({
        user1: {
          name: "John Doe",
          email: "john@example.com",
          age: 30,
          createdAt: new Date().toISOString(),
        },
      });
      addResult("✅ User created successfully!");

      // Add data dengan auto-generated key
      const autoResult = await firebaseCRUD.addWithAutoKey({
        name: "Jane Smith",
        email: "jane@example.com",
        age: 25,
      });
      addResult(`✅ Auto-key user created: ${autoResult.key}`);
    } catch (error) {
      addResult(`❌ Create error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRead = async () => {
    setLoading(true);
    try {
      const firebaseCRUD = nexaFirebase("testUsers");
      addResult("📖 Testing READ operation...");

      // Get single data
      const userData = await firebaseCRUD.get("user1");
      if (userData) {
        addResult(`📊 User1 data: ${JSON.stringify(userData, null, 2)}`);
      } else {
        addResult("❌ User1 not found. Create a user first.");
      }

      // Get all data
      const allUsers = await firebaseCRUD.getAll();
      addResult(`📊 Total users found: ${allUsers.length}`);

      if (allUsers.length > 0) {
        allUsers.forEach((user, index) => {
          addResult(`${index + 1}. ${user.key}: ${user.name} (${user.email})`);
        });
      }
    } catch (error) {
      addResult(`❌ Read error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdate = async () => {
    setLoading(true);
    try {
      const firebaseCRUD = nexaFirebase("testUsers");
      addResult("🔄 Testing UPDATE operation...");

      // Update dengan history tracking
      await firebaseCRUD.history({
        user1: {
          name: "John Doe Updated",
          email: "john.updated@example.com",
          age: 31,
          status: "active",
          lastLogin: new Date().toISOString(),
        },
      });
      addResult("✅ User1 updated with history tracking!");

      // Update by field (tanpa perlu key)
      const searchResult = await firebaseCRUD.search("name", "Jane Smith");
      if (searchResult.length > 0) {
        await firebaseCRUD.updateByField("name", "Jane Smith", {
          status: "premium",
          updatedBy: "admin",
        });
        addResult("✅ Updated Jane Smith by field search!");
      }
    } catch (error) {
      addResult(`❌ Update error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDelete = async () => {
    setLoading(true);
    try {
      const firebaseCRUD = nexaFirebase("testUsers");
      addResult("🗑️ Testing DELETE operation...");

      // Delete specific user
      await firebaseCRUD.del("user1");
      addResult("✅ User1 deleted successfully!");

      // Count remaining records
      const count = await firebaseCRUD.count();
      addResult(`📊 Remaining records: ${count}`);
    } catch (error) {
      addResult(`❌ Delete error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>NexaFirebase REST API Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusText}>{firebaseStatus}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Buttons
          label="Initialize Firebase"
          background="#4285F4"
          txColor="#FFFFFF"
          border={8}
          vertical={12}
          onPress={initializeFirebase}
          loading={loading}
        />

        <Buttons
          label="Test CREATE"
          background="#DB4437"
          txColor="#FFFFFF"
          border={8}
          vertical={12}
          onPress={testCreate}
          loading={loading}
        />

        <Buttons
          label="Test READ"
          background="#F4B400"
          txColor="#FFFFFF"
          border={8}
          vertical={12}
          onPress={testRead}
          loading={loading}
        />

        <Buttons
          label="Test UPDATE"
          background="#9C27B0"
          txColor="#FFFFFF"
          border={8}
          vertical={12}
          onPress={testUpdate}
          loading={loading}
        />

        <Buttons
          label="Test DELETE"
          background="#FF5722"
          txColor="#FFFFFF"
          border={8}
          vertical={12}
          onPress={testDelete}
          loading={loading}
        />

        <Buttons
          label="Clear Results"
          background="#0F9D58"
          txColor="#FFFFFF"
          border={8}
          vertical={12}
          onPress={clearResults}
        />
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {results.length === 0 ? (
          <Text style={styles.noResults}>No results yet</Text>
        ) : (
          results.map((result, index) => (
            <Text key={index} style={styles.resultItem}>
              {result}
            </Text>
          ))
        )}
      </View>

      <View style={styles.configContainer}>
        <Text style={styles.configTitle}>NexaFirebase REST API Config:</Text>
        <Text style={styles.configText}>
          Project ID: {FirebaseConfig.projectId}
        </Text>
        <Text style={styles.configText}>
          Database URL: {FirebaseConfig.databaseURL}
        </Text>
        <Text style={styles.configText}>
          Auth Domain: {FirebaseConfig.authDomain}
        </Text>
        <Text style={styles.note}>
          ✅ Using NexaFirebase REST API for React Native
        </Text>
        <Text style={styles.note}>
          🌐 Cross-platform: iOS, Android, Web compatible
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  statusLabel: {
    fontWeight: "bold",
    marginRight: 8,
  },
  statusText: {
    flex: 1,
    color: "#666",
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  noResults: {
    fontStyle: "italic",
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
  resultItem: {
    padding: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 4,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: "monospace",
  },
  configContainer: {
    padding: 12,
    backgroundColor: "#e8f4fd",
    borderRadius: 8,
    marginBottom: 20,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1976d2",
  },
  configText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  note: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#ff9800",
    marginTop: 8,
  },
});

// Export the React component as default
export default Firebase;

// Also export the utility functions
export {
  initializeNxFirebase,
  manualInitExample,
  crudExamples,
  offlineExamples,
  realtimeExamples,
  platformExamples,
};
