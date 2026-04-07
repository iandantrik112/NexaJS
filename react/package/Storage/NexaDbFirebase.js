// Conditional import untuk NexaFirebase
let NexaFirestore = null;
let FirebaseConfig = null;
let nexaFirebase = null;
let FirebaseLoaded = false;
let FirebaseLoadPromise = null;

async function loadFirebase() {
  if (FirebaseLoaded) return { NexaFirestore, FirebaseConfig, nexaFirebase };
  
  if (FirebaseLoadPromise) {
    return FirebaseLoadPromise;
  }
  
  FirebaseLoadPromise = (async () => {
    try {
      // Try dynamic import (ES6 modules)
      try {
        const module = await import('../NexaFirebase.js');
        NexaFirestore = module.NexaFirestore || module.default?.NexaFirestore;
        FirebaseConfig = module.FirebaseConfig || module.default?.FirebaseConfig;
        nexaFirebase = module.nexaFirebase || module.default?.nexaFirebase;
        FirebaseLoaded = true;
        console.log('✅ NexaFirebase loaded');
        return { NexaFirestore, FirebaseConfig, nexaFirebase };
      } catch (importError) {
        // Fallback to require (CommonJS)
        if (typeof require !== 'undefined') {
          try {
            const module = require('../NexaFirebase.js');
            NexaFirestore = module.NexaFirestore || module.default?.NexaFirestore;
            FirebaseConfig = module.FirebaseConfig || module.default?.FirebaseConfig;
            nexaFirebase = module.nexaFirebase || module.default?.nexaFirebase;
            FirebaseLoaded = true;
            console.log('✅ NexaFirebase loaded (CommonJS)');
            return { NexaFirestore, FirebaseConfig, nexaFirebase };
          } catch (requireError) {
            console.warn('⚠️ NexaFirebase not available (require):', requireError.message);
            return { NexaFirestore: null, FirebaseConfig: null, nexaFirebase: null };
          }
        } else {
          console.warn('⚠️ NexaFirebase not available (import):', importError.message);
          return { NexaFirestore: null, FirebaseConfig: null, nexaFirebase: null };
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load NexaFirebase:', error.message);
      return { NexaFirestore: null, FirebaseConfig: null, nexaFirebase: null };
    }
  })();
  
  return FirebaseLoadPromise;
}

/**
 * ============================================
 * 🔥 NEXADBFIREBASE - FIREBASE REALTIME DATABASE MANAGER
 * ============================================
 * 
 * NexaDbFirebase - Firebase Realtime Database Manager
 * Menggunakan Firebase Realtime Database sebagai backend storage dengan enkripsi otomatis
 * Mengikuti pola yang sama dengan NexaDbJson dan NexaDbSqlite
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
 *    // atau
 *    await NexaDbFirebase.del("users", "1");
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
 * 6. INISIALISASI MANUAL (Opsional - jika ingin custom Firebase config):
 *    await NexaDbFirebase.init(customFirebaseConfig);
 *    // Setelah init, bisa gunakan set, get, getAll, delete langsung
 * 
 * 7. UTILITY:
 *    // Info storage
 *    const info = NexaDbFirebase.getInfo();
 *    console.log(info.availableStores, info.firebaseConfig);
 * 
 *    // Reset database
 *    await NexaDbFirebase.resetDatabase();
 * 
 * 8. REAL-TIME WATCHING:
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
export const NexaDbFirebase = {
  firebaseInstances: new Map(), // Map storeName -> NexaFirestore instance
  stores: new Set(), // Track all requested stores
  observers: new Map(), // Real-time observers
  pollingIntervals: new Map(), // Polling intervals
  firebaseConfig: null, // Firebase configuration
  initialized: false, // Flag untuk track initialization
  
  // ============================================
  // 🔐 ENCRYPTION CONFIGURATION (AUTO ENABLED)
  // ============================================
  encryptionEnabled: true, // 🔐 ENABLED BY DEFAULT - Auto encrypt semua data
  encryptionSecretKey: "nexaui2025", // Default secret key
  encryptor: null, // NexaEncrypt instance (will be auto-loaded)
  encryptedFields: new Set(), // Track which fields are encrypted
  fieldsToSkip: new Set(["id", "createdAt", "updatedAt", "key"]), // Fields that won't be encrypted
  encryptionInitialized: false, // Flag untuk track initialization
  autoMode: false, // Auto-create stores mode

  /**
   * Helper: Get Firebase instance for store
   * Auto-create instance jika belum ada
   */
  _getFirebaseInstance: async function (storeName) {
    if (!this.firebaseInstances.has(storeName)) {
      try {
        // Try to load Firebase if not already loaded
        if (!NexaFirestore || !nexaFirebase) {
          const firebaseModule = await loadFirebase();
          NexaFirestore = firebaseModule.NexaFirestore;
          nexaFirebase = firebaseModule.nexaFirebase;
          FirebaseConfig = firebaseModule.FirebaseConfig;
        }
        
        if (!NexaFirestore || !nexaFirebase) {
          throw new Error("NexaFirebase is not available. Please ensure NexaFirebase.js is properly imported.");
        }
        
        // Use nexaFirebase to get/create instance (singleton pattern)
        const instance = nexaFirebase(storeName);
        
        // Initialize if not already initialized
        if (!instance.initialized) {
          await instance.init();
        }
        
        this.firebaseInstances.set(storeName, instance);
        this.stores.add(storeName);
      } catch (error) {
        console.error(`Error creating Firebase instance for store "${storeName}":`, error);
        throw error;
      }
    }
    return this.firebaseInstances.get(storeName);
  },

  /**
   * Auto-initialize encryption (called automatically)
   */
  _autoInitEncryption: async function () {
    if (this.encryptionInitialized) {
      return true;
    }

    if (!this.encryptionEnabled) {
      return false;
    }

    try {
      let NexaEncrypt;
      try {
        const module = await import("./NexaEncrypt.js");
        NexaEncrypt = module.default || module.NexaEncrypt;
      } catch (importError) {
        try {
          const module = await import("../NexaEncrypt.js");
          NexaEncrypt = module.default || module.NexaEncrypt;
        } catch (importError2) {
          console.warn("⚠️ NexaEncrypt tidak ditemukan. Encryption disabled. Data akan tersimpan tanpa enkripsi.");
          this.encryptionEnabled = false;
          this.encryptionInitialized = true;
          return false;
        }
      }

      this.encryptor = new NexaEncrypt(this.encryptionSecretKey);
      this.encryptionInitialized = true;
      
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to initialize encryption:", error);
      this.encryptionEnabled = false;
      this.encryptionInitialized = true;
      return false;
    }
  },

  /**
   * Setup enkripsi (OPTIONAL - hanya jika ingin custom key)
   */
  setupEncryption: async function (secretKey = "nexaui2025", fieldsToSkip = ["id", "createdAt", "updatedAt", "key"]) {
    try {
      let NexaEncrypt;
      try {
        NexaEncrypt = (await import("./NexaEncrypt.js")).default || (await import("./NexaEncrypt.js")).NexaEncrypt;
      } catch (importError) {
        try {
          NexaEncrypt = (await import("../NexaEncrypt.js")).default || (await import("../NexaEncrypt.js")).NexaEncrypt;
        } catch (importError2) {
          console.warn("⚠️ NexaEncrypt tidak ditemukan. Pastikan NexaEncrypt.js tersedia.");
          this.encryptionEnabled = false;
          return false;
        }
      }

      this.encryptor = new NexaEncrypt(secretKey);
      this.encryptionSecretKey = secretKey;
      this.encryptionEnabled = true;
      this.fieldsToSkip = new Set(fieldsToSkip);
      this.encryptionInitialized = true;

      console.log("✅ Encryption enabled dengan secret key:", secretKey);
      return true;
    } catch (error) {
      console.error("❌ Error setting up encryption:", error);
      this.encryptionEnabled = false;
      return false;
    }
  },

  /**
   * Disable enkripsi
   */
  disableEncryption: function () {
    this.encryptionEnabled = false;
    this.encryptor = null;
    this.encryptionSecretKey = null;
    this.encryptedFields.clear();
    console.log("🔓 Encryption disabled");
  },

  /**
   * Encrypt data fields (kecuali metadata)
   */
  encryptDataFields: async function (data) {
    if (!this.encryptionInitialized) {
      await this._autoInitEncryption();
    }

    if (!this.encryptionEnabled || !this.encryptor) {
      return data;
    }

    try {
      const encrypted = JSON.parse(JSON.stringify(data));

      for (const key in encrypted) {
        if (!this.fieldsToSkip.has(key) && encrypted[key] !== null && encrypted[key] !== undefined) {
          try {
            if (typeof encrypted[key] === "object") {
              encrypted[key] = this.encryptor.obfuscateJson(encrypted[key]);
            } else {
              encrypted[key] = this.encryptor.obfuscateJson(String(encrypted[key]));
            }
            this.encryptedFields.add(key);
          } catch (error) {
            console.warn(`⚠️ Failed to encrypt field "${key}":`, error);
          }
        }
      }

      encrypted._encrypted = true;
      return encrypted;
    } catch (error) {
      console.error("❌ Encryption error:", error);
      return data;
    }
  },

  /**
   * Decrypt data fields
   */
  decryptDataFields: async function (data) {
    if (!this.encryptionInitialized) {
      await this._autoInitEncryption();
    }

    if (!this.encryptionEnabled || !this.encryptor) {
      return data;
    }

    // Jika tidak ada flag _encrypted, data tidak terenkripsi
    if (!data || !data._encrypted) {
      return data;
    }

    try {
      const decrypted = JSON.parse(JSON.stringify(data));

      // Decrypt semua field kecuali yang ada di fieldsToSkip
      // Jangan hanya decrypt field yang ada di encryptedFields (karena Set global bisa tidak akurat)
      for (const key in decrypted) {
        // Skip field yang tidak perlu didekripsi
        if (this.fieldsToSkip.has(key) || key === '_encrypted') {
          continue;
        }
        
        // Decrypt field jika tidak null/undefined
        if (decrypted[key] !== null && decrypted[key] !== undefined) {
          try {
            decrypted[key] = this.encryptor.deobfuscateJson(decrypted[key]);
          } catch (error) {
            // Jika dekripsi gagal, mungkin field tidak terenkripsi atau format berbeda
            // Coba parse sebagai JSON jika memungkinkan
            try {
              if (typeof decrypted[key] === 'string' && decrypted[key].trim().startsWith('{')) {
                decrypted[key] = JSON.parse(decrypted[key]);
              }
            } catch (parseError) {
              // Jika parse juga gagal, biarkan value as is
              console.warn(`⚠️ [NexaDbFirebase] Failed to decrypt field "${key}", keeping original value`);
            }
          }
        }
      }

      delete decrypted._encrypted;
      return decrypted;
    } catch (error) {
      console.error("❌ [NexaDbFirebase] Decryption error:", error.message);
      return data;
    }
  },

  /**
   * Initialize Firebase
   */
  init: function (firebaseConfig = null) {
    return new Promise(async (resolve, reject) => {
      try {
        // Try to load Firebase if not already loaded
        if (!NexaFirestore || !nexaFirebase) {
          const firebaseModule = await loadFirebase();
          NexaFirestore = firebaseModule.NexaFirestore;
          nexaFirebase = firebaseModule.nexaFirebase;
          FirebaseConfig = firebaseModule.FirebaseConfig;
        }
        
        if (!NexaFirestore || !nexaFirebase) {
          throw new Error("NexaFirebase is not available. Please ensure NexaFirebase.js is properly imported.");
        }

        this.firebaseConfig = firebaseConfig || FirebaseConfig;
        this.autoMode = true;
        this.initialized = true;
        
        if (!this.stores) {
          this.stores = new Set();
        }

        resolve({
          set: (storeName, data) => this.set(storeName, data),
          get: (storeName, key) => this.get(storeName, key),
          getAll: (storeName) => this.getAll(storeName),
          delete: (storeName, key) => this.delete(storeName, key),
          updateFields: (storeName, id, fieldUpdates) => this.updateFields(storeName, id, fieldUpdates),
          updateField: (storeName, id, fieldName, fieldValue) => this.updateField(storeName, id, fieldName, fieldValue),
          search: (storeName, query, fields = []) => this.search(storeName, query, fields),
          getLatest: (storeName, count = 1) => this.getLatest(storeName, count),
          getOldest: (storeName, count = 1) => this.getOldest(storeName, count),
          getInfo: () => this.getInfo(),
          hasStore: (storeName) => this.hasStore(storeName),
          listStores: () => this.listStores(),
          resetDatabase: () => this.resetDatabase(),
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * ============================================
   * 📝 SET - Menyimpan Data (Auto-initialize)
   * ============================================
   * Penggunaan mudah: await NexaDbFirebase.set("users", { id: "1", name: "John" })
   */
  set: function (storeName, data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Auto-initialize jika belum di-initialize
        if (!this.initialized) {
          // Load Firebase config
          if (!FirebaseConfig) {
            const firebaseModule = await loadFirebase();
            FirebaseConfig = firebaseModule.FirebaseConfig;
          }
          this.firebaseConfig = FirebaseConfig;
          this.autoMode = true;
          this.initialized = true;
          if (!this.stores) {
            this.stores = new Set();
          }
        }

        // Validate data has id - data.id digunakan sebagai key (konsisten dengan NexaDBLite.js)
        if (!data || !data.id) {
          reject(new Error("Data must have an 'id' field"));
          return;
        }

        // Tambahkan timestamp otomatis jika belum ada
        const dataWithTimestamp = {
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Track store
        this.stores.add(storeName);

        // Get Firebase instance
        const firebaseInstance = await this._getFirebaseInstance(storeName);

        // 🔐 Encrypt data jika encryption enabled (OTOMATIS)
        let dataToSave;
        try {
          dataToSave = await this.encryptDataFields(dataWithTimestamp);
        } catch (error) {
          console.error("Encryption error:", error);
          // Fallback: save without encryption
          dataToSave = dataWithTimestamp;
        }

        // Save to Firebase - data.id digunakan sebagai key (konsisten dengan NexaDBLite.js)
        await firebaseInstance.history({ [data.id]: dataToSave });

        // Notify observers dengan data yang sudah di-decrypt
        const decryptedData = await this.decryptDataFields(dataToSave);
        this.notifyObservers(storeName, decryptedData, "update");

        resolve(data.id);
      } catch (error) {
        console.error(`Error setting data in store "${storeName}":`, error);
        reject(error);
      }
    });
  },

  /**
   * ============================================
   * 📖 GET - Mengambil Data (Auto-initialize)
   * ============================================
   * Penggunaan mudah: const user = await NexaDbFirebase.get("users", "1")
   */
  get: function (storeName, key) {
    return new Promise(async (resolve, reject) => {
      try {
        // Auto-initialize jika belum di-initialize
        if (!this.initialized) {
          // Load Firebase config
          if (!FirebaseConfig) {
            const firebaseModule = await loadFirebase();
            FirebaseConfig = firebaseModule.FirebaseConfig;
          }
          this.firebaseConfig = FirebaseConfig;
          this.autoMode = true;
          this.initialized = true;
          if (!this.stores) {
            this.stores = new Set();
          }
        }

        // Validate key - jika key tidak ada atau undefined, return null
        if (key === undefined || key === null || key === "") {
          console.warn(`Key is ${key === undefined ? 'undefined' : key === null ? 'null' : 'empty'} for store "${storeName}", returning null`);
          resolve(null);
          return;
        }

        // Track store
        this.stores.add(storeName);

        // Get Firebase instance
        const firebaseInstance = await this._getFirebaseInstance(storeName);

        // Get from Firebase
        const encryptedData = await firebaseInstance.get(key);

        if (!encryptedData) {
          resolve(null);
          return;
        }

        try {
          // 🔐 Decrypt data jika encryption enabled (OTOMATIS)
          if (encryptedData) {
            try {
              // Cek apakah data terenkripsi (punya flag _encrypted)
              if (encryptedData._encrypted) {
                const decryptedData = await this.decryptDataFields(encryptedData);
                resolve(decryptedData);
              } else {
                // Data tidak terenkripsi, return langsung
                resolve(encryptedData);
              }
            } catch (decryptError) {
              console.warn(`⚠️ [NexaDbFirebase] Decryption error for store "${storeName}":`, decryptError.message);
              // Jika dekripsi gagal, coba return data as is (mungkin tidak terenkripsi)
              resolve(encryptedData);
            }
          } else {
            resolve(null);
          }
        } catch (parseError) {
          console.warn(`⚠️ [NexaDbFirebase] Error parsing data from store "${storeName}":`, parseError.message);
          resolve(null);
        }
      } catch (error) {
        // Handle error gracefully - return null instead of reject
        console.warn(`Error accessing store "${storeName}":`, error.message);
        resolve(null);
      }
    });
  },

  /**
   * ============================================
   * 📚 GETALL - Mengambil Semua Data (Auto-initialize)
   * ============================================
   * Penggunaan mudah: const users = await NexaDbFirebase.getAll("users")
   */
  getAll: function (storeName) {
    return new Promise(async (resolve, reject) => {
      try {
        // Auto-initialize jika belum di-initialize
        if (!this.initialized) {
          // Load Firebase config
          if (!FirebaseConfig) {
            const firebaseModule = await loadFirebase();
            FirebaseConfig = firebaseModule.FirebaseConfig;
          }
          this.firebaseConfig = FirebaseConfig;
          this.autoMode = true;
          this.initialized = true;
          if (!this.stores) {
            this.stores = new Set();
          }
        }

        // Track store
        this.stores.add(storeName);

        // Get Firebase instance
        const firebaseInstance = await this._getFirebaseInstance(storeName);

        // Get all from Firebase
        const allDataArray = await firebaseInstance.getAll();
        
        // Parse and decrypt all items
        const allData = [];
        for (const item of allDataArray) {
          if (item) {
            try {
              // Extract key from item - item.id digunakan sebagai key (konsisten dengan NexaDBLite.js)
              const itemKey = item.key || item.id;
              const itemData = { ...item, id: itemKey };
              
              // 🔐 Decrypt data jika encryption enabled (OTOMATIS)
              // Cek apakah data terenkripsi (punya flag _encrypted)
              if (itemData._encrypted) {
                const decryptedData = await this.decryptDataFields(itemData);
                allData.push(decryptedData);
              } else {
                // Data tidak terenkripsi, push langsung
                allData.push(itemData);
              }
            } catch (error) {
              const itemKey = item.key || item.id || 'unknown';
              console.warn(`⚠️ [NexaDbFirebase] Error parsing/decrypting item from key "${itemKey}":`, error.message);
            }
          }
        }

        resolve({ data: allData });
      } catch (error) {
        console.error(`Error accessing store "${storeName}":`, error);
        resolve({ data: [] }); // Return empty instead of reject for compatibility
      }
    });
  },

  /**
   * ============================================
   * 🗑️ DELETE - Menghapus Data (Auto-initialize)
   * ============================================
   * Penggunaan mudah: await NexaDbFirebase.delete("users", "1")
   */
  delete: function (storeName, key) {
    return new Promise(async (resolve, reject) => {
      try {
        // Auto-initialize jika belum di-initialize
        if (!this.initialized) {
          // Load Firebase config
          if (!FirebaseConfig) {
            const firebaseModule = await loadFirebase();
            FirebaseConfig = firebaseModule.FirebaseConfig;
          }
          this.firebaseConfig = FirebaseConfig;
          this.autoMode = true;
          this.initialized = true;
          if (!this.stores) {
            this.stores = new Set();
          }
        }

        // Validate key
        if (key === undefined || key === null || key === "") {
          resolve(false);
          return;
        }

        // Track store
        this.stores.add(storeName);

        // Get Firebase instance
        const firebaseInstance = await this._getFirebaseInstance(storeName);

        // Delete from Firebase
        await firebaseInstance.del(key);

        // Notify observers
        this.notifyObservers(storeName, { id: key }, "delete");
        resolve(true);
      } catch (error) {
        console.error(`Error deleting from store "${storeName}":`, error);
        resolve(false);
      }
    });
  },

  /**
   * Shortcut: Delete data (alias untuk delete)
   */
  del: function (storeName, key) {
    return this.delete(storeName, key);
  },

  /**
   * ============================================
   * 🔔 OBSERVER PATTERN
   * ============================================
   */
  notifyObservers: function (storeName, data, changeType = "update") {
    if (!this.observers.has(storeName)) return;

    this.observers.get(storeName).forEach((observer, watchId) => {
      try {
        observer.callback({
          storeName,
          data,
          changeType,
          timestamp: new Date().toISOString(),
          watchId,
        });
      } catch (error) {
        console.error(`Observer error for ${storeName}:`, error);
      }
    });
  },

  watch: function (storeName, callback, options = {}) {
    const watchId = `${storeName}_${Date.now()}_${Math.random()}`;

    if (!this.observers.has(storeName)) {
      this.observers.set(storeName, new Map());
    }

    this.observers.get(storeName).set(watchId, {
      callback,
      options: {
        immediate: false,
        ...options,
      },
    });

    // Also set up Firebase real-time listener
    this._getFirebaseInstance(storeName).then((firebaseInstance) => {
      // Use Firebase red() method for real-time updates
      const unsubscribe = firebaseInstance.red((data) => {
        // Convert Firebase data format to our format
        const allData = Array.isArray(data) ? data : Object.values(data || {});
        callback({
          storeName,
          data: allData,
          changeType: "update",
          timestamp: new Date().toISOString(),
          watchId,
        });
      }, options.interval || 3000);

      // Store unsubscribe function
      if (!this.pollingIntervals.has(storeName)) {
        this.pollingIntervals.set(storeName, new Map());
      }
      this.pollingIntervals.get(storeName).set(watchId, unsubscribe);
    });

    return () => this.unwatch(storeName, watchId);
  },

  unwatch: function (storeName, watchId) {
    // Unsubscribe from Firebase
    if (this.pollingIntervals.has(storeName)) {
      const unsubscribe = this.pollingIntervals.get(storeName).get(watchId);
      if (unsubscribe) {
        unsubscribe();
      }
      this.pollingIntervals.get(storeName).delete(watchId);
      
      if (this.pollingIntervals.get(storeName).size === 0) {
        this.pollingIntervals.delete(storeName);
      }
    }

    // Remove observer
    if (this.observers.has(storeName)) {
      this.observers.get(storeName).delete(watchId);

      if (this.observers.get(storeName).size === 0) {
        this.observers.delete(storeName);
      }
    }
  },

  /**
   * ============================================
   * 🔧 UTILITY METHODS
   * ============================================
   */
  getInfo: function () {
    return {
      isInitialized: this.initialized,
      availableStores: Array.from(this.stores),
      requestedStores: Array.from(this.stores),
      firebaseConfig: this.firebaseConfig ? "Configured" : "Not configured",
    };
  },

  hasStore: function (storeName) {
    return this.stores.has(storeName);
  },

  listStores: function () {
    return Array.from(this.stores);
  },

  resetDatabase: function () {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.initialized) {
          resolve();
          return;
        }

        const storeNames = Array.from(this.stores);

        // Delete all data from all stores
        for (const storeName of storeNames) {
          try {
            const firebaseInstance = await this._getFirebaseInstance(storeName);
            const allData = await firebaseInstance.getAll();
            
            // Delete each item
            for (const item of allData) {
              const key = item.key || item.id;
              if (key) {
                await firebaseInstance.del(key);
              }
            }
          } catch (error) {
            console.warn(`Error resetting store "${storeName}":`, error);
          }
        }

        this.stores.clear();
        this.firebaseInstances.clear();
        this.initialized = false;

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * ============================================
   * 📊 DATA ACCESS METHODS
   * ============================================
   */
  getLatest: function (storeName, count = 1) {
    return new Promise(async (resolve, reject) => {
      try {
        const allDataResult = await this.getAll(storeName);
        const allData = allDataResult.data || [];

        if (allData.length === 0) {
          resolve({
            data: count === 1 ? null : [],
            total: 0,
            requested: count,
          });
          return;
        }

        // Sort berdasarkan updatedAt atau createdAt (terbaru dulu)
        const sortedData = allData.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });

        const result = count === 1 ? sortedData[0] : sortedData.slice(0, count);
        resolve({
          data: result,
          total: allData.length,
          requested: count,
        });
      } catch (error) {
        console.error(`Error getting latest data from store "${storeName}":`, error);
        resolve({
          data: count === 1 ? null : [],
          total: 0,
          requested: count,
        });
      }
    });
  },

  getOldest: function (storeName, count = 1) {
    return new Promise(async (resolve, reject) => {
      try {
        const allDataResult = await this.getAll(storeName);
        const allData = allDataResult.data || [];

        if (allData.length === 0) {
          resolve({
            data: count === 1 ? null : [],
            total: 0,
            requested: count,
          });
          return;
        }

        // Sort berdasarkan updatedAt atau createdAt (terlama dulu)
        const sortedData = allData.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateA - dateB;
        });

        const result = count === 1 ? sortedData[0] : sortedData.slice(0, count);
        resolve({
          data: result,
          total: allData.length,
          requested: count,
        });
      } catch (error) {
        console.error(`Error getting oldest data from store "${storeName}":`, error);
        resolve({
          data: count === 1 ? null : [],
          total: 0,
          requested: count,
        });
      }
    });
  },

  search: function (storeName, query, fields = []) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!query || query.trim() === "") {
          resolve({ data: [], total: 0, query });
          return;
        }

        const allDataResult = await this.getAll(storeName);
        const allData = allDataResult.data || [];
        const searchTerm = query.toLowerCase();

        const filteredData = allData.filter((item) => {
          if (fields.length === 0) {
            return JSON.stringify(item).toLowerCase().includes(searchTerm);
          }

          return fields.some((field) => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchTerm);
          });
        });

        // Sort berdasarkan relevance dan tanggal
        const sortedData = filteredData.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });

        resolve({
          data: sortedData,
          total: allData.length,
          found: sortedData.length,
          query,
          searchFields: fields,
        });
      } catch (error) {
        console.error(`Error searching in store "${storeName}":`, error);
        resolve({
          data: [],
          total: 0,
          found: 0,
          query,
          searchFields: fields,
        });
      }
    });
  },

  /**
   * ============================================
   * 🔧 PARTIAL UPDATE METHODS
   * ============================================
   */
  updateFields: function (storeName, id, fieldUpdates) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get existing data
        const existingData = await this.get(storeName, id);
        if (!existingData) {
          reject(new Error(`Data with ID "${id}" not found in store "${storeName}"`));
          return;
        }

        // Merge with new fields
        const updatedData = {
          ...existingData,
          ...fieldUpdates,
          updatedAt: new Date().toISOString(),
        };

        // Save updated data
        await this.set(storeName, updatedData);
        resolve(updatedData);
      } catch (error) {
        console.error(`❌ Failed to update fields in store "${storeName}":`, error);
        reject(error);
      }
    });
  },

  updateField: function (storeName, id, fieldName, fieldValue) {
    return this.updateFields(storeName, id, { [fieldName]: fieldValue });
  },
};

// Default export for compatibility
export default NexaDbFirebase;

