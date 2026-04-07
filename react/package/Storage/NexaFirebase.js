// Import AsyncStorage as fallback storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Firebase configuration
import { FirebaseConfig } from '../config';

// Note: This is a lightweight version using AsyncStorage as backend
// For full Firebase Realtime Database, install @react-native-firebase packages
// See FIREBASE_SETUP.md for installation instructions

// Firebase Realtime Database Manager for React Native (AsyncStorage Backend)
export const FirebaseRtdb = {
  app: null,
  database: null,
  config: null,
  observers: new Map(), // Real-time observers
  pollingIntervals: new Map(), // Polling intervals
  tabId: null,
  autoMode: false,
  storagePrefix: 'NexaStoreDB:', // Prefix for AsyncStorage keys

  init: function (config = null, options = {}) {
    const { autoMode = true } = options;
    
    // Use config from config.js if none provided
    this.config = config || FirebaseConfig;
    this.autoMode = autoMode;
    
    try {
      // Check if already initialized
      if (this.database) {
        console.log('🔥 FirebaseRtdb already initialized, reusing existing instance');
        return this.createInterface();
      }
      
      // Initialize with AsyncStorage backend
      this.database = true; // Mark as initialized
      this.app = { name: 'FirebaseRtdb', config: this.config };
      
      // Generate unique tab ID for this instance
      this.tabId = this.generateId();
      
      console.log('🔥 FirebaseRtdb initialized successfully with AsyncStorage backend');
      
      // Return interface object
      return this.createInterface();
    } catch (error) {
      console.error('❌ FirebaseRtdb initialization failed:', error);
      throw error;
    }
  },

  // Create the main interface object
  createInterface: function() {
    return {
      // Basic CRUD methods
      set: (storeName, data) => this.set(storeName, data),
      get: (storeName, key) => this.get(storeName, key),
      getAll: (storeName) => this.getAll(storeName),
      delete: (storeName, key) => this.delete(storeName, key),
      duplicate: (storeName, originalId, newId, options = {}) =>
        this.duplicate(storeName, originalId, newId, options),

      // Partial update methods
      removeNestedField: (storeName, id, parentPath, fieldName) =>
        this.removeNestedField(storeName, id, parentPath, fieldName),
      removeFields: (storeName, id, fieldsToRemove) =>
        this.removeFields(storeName, id, fieldsToRemove),
      updateFields: (storeName, id, fieldUpdates) =>
        this.updateFields(storeName, id, fieldUpdates),
      updateField: (storeName, id, fieldName, fieldValue) =>
        this.updateField(storeName, id, fieldName, fieldValue),
      updateNestedField: (storeName, id, fieldPath, newValue) =>
        this.updateNestedField(storeName, id, fieldPath, newValue),
      mergeData: (storeName, id, mergeObject, options = {}) =>
        this.mergeData(storeName, id, mergeObject, options),
      batchUpdateFields: (storeName, updates, options = {}) =>
        this.batchUpdateFields(storeName, updates, options),
      batchRemoveFields: (storeName, fieldsToRemove, options = {}) =>
        this.batchRemoveFields(storeName, fieldsToRemove, options),

      // Data access methods
      getLatest: (storeName, count = 1) => this.getLatest(storeName, count),
      getOldest: (storeName, count = 1) => this.getOldest(storeName, count),
      getByDateRange: (storeName, startDate, endDate) =>
        this.getByDateRange(storeName, startDate, endDate),
      search: (storeName, query, fields = []) =>
        this.search(storeName, query, fields),

      // Get IDs methods
      getIDs: (storeName, options = {}) => this.getIDs(storeName, options),
      getAllIDs: (storeName) => this.getAllIDs(storeName),

      // Real-time methods
      refreshTable: (storeName = null, endpoint = null, options = {}) =>
        this.refreshTable(storeName, endpoint, options),
      watch: (storeName, callback, options = {}) =>
        this.watch(storeName, callback, options),
      setupAutoRefresh: (storeName, config = {}) =>
        this.setupAutoRefresh(storeName, config),
      startPolling: (storeName, endpoint, options = {}) =>
        this.startPolling(storeName, endpoint, options),
      stopPolling: (storeName) => this.stopPolling(storeName),
      batchUpdate: (storeName, dataArray, options = {}) =>
        this.batchUpdate(storeName, dataArray, options),

      // Export/Import methods
      export: (storeNames = null, options = {}) =>
        this.export(storeNames, options),
      import: (importData, options = {}) =>
        this.import(importData, options),
      exportToFile: (filename = null, storeNames = null, options = {}) =>
        this.exportToFile(filename, storeNames, options),
      importFromFile: (file, options = {}) =>
        this.importFromFile(file, options),

      // Utility methods
      getInfo: () => this.getInfo(),
      hasStore: (storeName) => this.hasStore(storeName),
      cleanup: () => this.cleanup(),
      getRealtimeStatus: () => this.getRealtimeStatus(),

      // Simple refresh methods
      refresh: (apiEndpoint = null, options = {}) =>
        this.refresh(apiEndpoint, options),
      stopRefresh: () => this.stopRefresh(),
      forceRefresh: () => this.forceRefresh(),

      // Single store mode untuk semua data dalam satu tempat
      setData: (key, data) => this.set("MyAppData", { id: key, ...data }),
      getData: (key) => this.get("MyAppData", key),
      getAllData: () => this.getAll("MyAppData"),
      deleteData: (key) => this.delete("MyAppData", key),

      // Safe interface
      safe: () => this.createSafeInterface(),

      // Legacy compatibility - Storage API pattern
      Storage: () => ({
        firebase: this,
      }),
    };
  },

  // === BASIC CRUD OPERATIONS ===

  set: function (storeName, data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        // Ensure data has an ID
        if (!data.id) {
          data.id = this.generateId();
        }

        // Add timestamps
        const dataWithTimestamp = {
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to AsyncStorage
        const key = `${this.storagePrefix}${storeName}:${data.id}`;
        await AsyncStorage.setItem(key, JSON.stringify(dataWithTimestamp));

        // Update store index
        await this.updateStoreIndex(storeName, data.id, 'add');

        // Notify observers
        this.notifyObservers(storeName, dataWithTimestamp, "update");

        resolve(data.id);
      } catch (error) {
        console.error(`❌ FirebaseRtdb set error for store "${storeName}":`, error);
        reject(error);
      }
    });
  },

  get: function (storeName, key) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        // Get from AsyncStorage
        const storageKey = `${this.storagePrefix}${storeName}:${key}`;
        const data = await AsyncStorage.getItem(storageKey);

        if (data) {
          resolve(JSON.parse(data));
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error(`❌ FirebaseRtdb get error for store "${storeName}":`, error);
        reject(error);
      }
    });
  },

  getAll: function (storeName) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        // Get all keys from store index
        const ids = await this.getStoreIndex(storeName);
        
        if (ids.length === 0) {
          resolve({ data: [] });
          return;
        }

        // Get all data
        const dataArray = [];
        for (const id of ids) {
          const data = await this.get(storeName, id);
          if (data) {
            dataArray.push(data);
          }
        }

        resolve({ data: dataArray });
      } catch (error) {
        console.error(`❌ FirebaseRtdb getAll error for store "${storeName}":`, error);
        reject(error);
      }
    });
  },

  delete: function (storeName, key) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        // Remove from AsyncStorage
        const storageKey = `${this.storagePrefix}${storeName}:${key}`;
        await AsyncStorage.removeItem(storageKey);

        // Update store index
        await this.updateStoreIndex(storeName, key, 'remove');

        // Notify observers
        this.notifyObservers(storeName, { id: key }, "delete");

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb delete error for store "${storeName}":`, error);
        reject(error);
      }
    });
  },

  // === PARTIAL UPDATE METHODS ===

  updateField: function (storeName, id, fieldName, fieldValue) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        // Get existing data
        const existing = await this.get(storeName, id);
        if (!existing) {
          reject(new Error(`Data with ID ${id} not found`));
          return;
        }

        // Update field
        const updated = {
          ...existing,
          [fieldName]: fieldValue,
          updatedAt: new Date().toISOString()
        };

        // Save back
        await this.set(storeName, updated);

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb updateField error:`, error);
        reject(error);
      }
    });
  },

  updateFields: function (storeName, id, fieldUpdates) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        // Get existing data
        const existing = await this.get(storeName, id);
        if (!existing) {
          reject(new Error(`Data with ID ${id} not found`));
          return;
        }

        // Update fields
        const updated = {
          ...existing,
          ...fieldUpdates,
          updatedAt: new Date().toISOString()
        };

        // Save back
        await this.set(storeName, updated);

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb updateFields error:`, error);
        reject(error);
      }
    });
  },

  updateNestedField: function (storeName, id, fieldPath, newValue) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        // Get existing data
        const existing = await this.get(storeName, id);
        if (!existing) {
          reject(new Error(`Data with ID ${id} not found`));
          return;
        }

        // Set nested field value
        const pathParts = fieldPath.split('/');
        let current = existing;
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = newValue;

        // Update timestamp
        existing.updatedAt = new Date().toISOString();

        // Save back
        await this.set(storeName, existing);

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb updateNestedField error:`, error);
        reject(error);
      }
    });
  },

  removeFields: function (storeName, id, fieldsToRemove) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        const existing = await this.get(storeName, id);
        if (!existing) {
          reject(new Error(`Data with ID ${id} not found`));
          return;
        }

        fieldsToRemove.forEach(field => {
          delete existing[field];
        });
        existing.updatedAt = new Date().toISOString();

        await this.set(storeName, existing);

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb removeFields error:`, error);
        reject(error);
      }
    });
  },

  removeNestedField: function (storeName, id, parentPath, fieldName) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        const existing = await this.get(storeName, id);
        if (!existing) {
          reject(new Error(`Data with ID ${id} not found`));
          return;
        }

        // Navigate to parent and remove field
        const pathParts = parentPath ? parentPath.split('/') : [];
        let current = existing;
        for (const part of pathParts) {
          if (!current[part]) {
            resolve(true); // Field doesn't exist, nothing to remove
            return;
          }
          current = current[part];
        }
        delete current[fieldName];

        existing.updatedAt = new Date().toISOString();
        await this.set(storeName, existing);

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb removeNestedField error:`, error);
        reject(error);
      }
    });
  },

  mergeData: function (storeName, id, mergeObject, options = {}) {
    return this.updateFields(storeName, id, mergeObject);
  },

  batchUpdateFields: function (storeName, updates, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        for (const id of Object.keys(updates)) {
          await this.updateFields(storeName, id, updates[id]);
        }

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb batchUpdateFields error:`, error);
        reject(error);
      }
    });
  },

  batchRemoveFields: function (storeName, fieldsToRemove, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.database) {
          reject(new Error("FirebaseRtdb not initialized"));
          return;
        }

        for (const id of Object.keys(fieldsToRemove)) {
          await this.removeFields(storeName, id, fieldsToRemove[id]);
        }

        resolve(true);
      } catch (error) {
        console.error(`❌ FirebaseRtdb batchRemoveFields error:`, error);
        reject(error);
      }
    });
  },

  // === DUPLICATE METHOD ===

  duplicate: function (storeName, originalId, newId, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get original data
        const originalData = await this.get(storeName, originalId);
        
        if (!originalData) {
          reject(new Error(`Original data with ID ${originalId} not found`));
          return;
        }

        // Create new data with new ID
        const newData = {
          ...originalData,
          id: newId || this.generateId()
        };

        // Remove original timestamps if needed
        if (options.resetTimestamps) {
          delete newData.createdAt;
          delete newData.updatedAt;
        }

        // Set new data
        await this.set(storeName, newData);

        resolve(newData.id);
      } catch (error) {
        console.error(`❌ Firebase duplicate error:`, error);
        reject(error);
      }
    });
  },

  // === DATA ACCESS METHODS ===

  getLatest: function (storeName, count = 1) {
    return new Promise(async (resolve, reject) => {
      try {
        const allData = await this.getAll(storeName);
        const sorted = allData.data.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        resolve(sorted.slice(0, count));
      } catch (error) {
        console.error(`❌ FirebaseRtdb getLatest error:`, error);
        reject(error);
      }
    });
  },

  getOldest: function (storeName, count = 1) {
    return new Promise(async (resolve, reject) => {
      try {
        const allData = await this.getAll(storeName);
        const sorted = allData.data.sort((a, b) => 
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        resolve(sorted.slice(0, count));
      } catch (error) {
        console.error(`❌ FirebaseRtdb getOldest error:`, error);
        reject(error);
      }
    });
  },

  getByDateRange: function (storeName, startDate, endDate) {
    return new Promise(async (resolve, reject) => {
      try {
        const allData = await this.getAll(storeName);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const filtered = allData.data.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= start && createdAt <= end;
        });
        
        resolve(filtered);
      } catch (error) {
        console.error(`❌ FirebaseRtdb getByDateRange error:`, error);
        reject(error);
      }
    });
  },

  search: function (storeName, query, fields = []) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get all data first
        const allData = await this.getAll(storeName);
        
        if (!allData.data || allData.data.length === 0) {
          resolve([]);
          return;
        }

        // Filter data based on query
        const queryLower = query.toLowerCase();
        const results = allData.data.filter(item => {
          if (fields.length === 0) {
            // Search in all fields
            return Object.values(item).some(value => 
              String(value).toLowerCase().includes(queryLower)
            );
          } else {
            // Search in specific fields
            return fields.some(field => 
              String(item[field] || '').toLowerCase().includes(queryLower)
            );
          }
        });

        resolve(results);
      } catch (error) {
        console.error(`❌ Firebase search error:`, error);
        reject(error);
      }
    });
  },

  // === GET IDs METHODS ===

  getAllIDs: function (storeName) {
    return new Promise(async (resolve, reject) => {
      try {
        const ids = await this.getStoreIndex(storeName);
        resolve(ids);
      } catch (error) {
        console.error(`❌ FirebaseRtdb getAllIDs error:`, error);
        reject(error);
      }
    });
  },

  getIDs: function (storeName, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const allIds = await this.getAllIDs(storeName);
        
        // Apply limit if specified
        if (options.limit) {
          resolve(allIds.slice(0, options.limit));
        } else {
          resolve(allIds);
        }
      } catch (error) {
        console.error(`❌ Firebase getIDs error:`, error);
        reject(error);
      }
    });
  },

  // === REAL-TIME METHODS ===

  watch: function (storeName, callback, options = {}) {
    try {
      if (!this.database) {
        throw new Error("FirebaseRtdb not initialized");
      }

      // Store observer for cleanup
      if (!this.observers.has(storeName)) {
        this.observers.set(storeName, []);
      }
      this.observers.get(storeName).push({ callback });

      // Initial data fetch
      this.getAll(storeName).then(data => {
        callback(data);
      });

      // Return unwatch function
      return () => {
        const observers = this.observers.get(storeName) || [];
        const index = observers.findIndex(obs => obs.callback === callback);
        if (index > -1) {
          observers.splice(index, 1);
        }
      };
    } catch (error) {
      console.error(`❌ FirebaseRtdb watch error:`, error);
      throw error;
    }
  },

  setupAutoRefresh: function (storeName, config = {}) {
    // This is a compatibility method for React Native
    // Real-time updates are handled by watch()
    console.warn('setupAutoRefresh is deprecated in React Native. Use watch() instead.');
    return this.watch(storeName, config.callback || (() => {}), config);
  },

  startPolling: function (storeName, endpoint, options = {}) {
    const interval = options.interval || 30000; // Default 30 seconds
    
    const poll = async () => {
      try {
        const data = await this.getAll(storeName);
        if (options.callback) {
          options.callback(data);
        }
      } catch (error) {
        console.error(`❌ Polling error for ${storeName}:`, error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.pollingIntervals.set(storeName, intervalId);

    return intervalId;
  },

  stopPolling: function (storeName) {
    const intervalId = this.pollingIntervals.get(storeName);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(storeName);
    }
  },

  refreshTable: function (storeName = null, endpoint = null, options = {}) {
    // Compatibility method
    if (storeName) {
      return this.getAll(storeName);
    }
    return Promise.resolve({ data: [] });
  },

  batchUpdate: function (storeName, dataArray, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const promises = dataArray.map(data => this.set(storeName, data));
        await Promise.all(promises);
        resolve(true);
      } catch (error) {
        console.error(`❌ Firebase batchUpdate error:`, error);
        reject(error);
      }
    });
  },

  // === EXPORT/IMPORT METHODS ===

  export: function (storeNames = null, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const exportData = {
          version: "1.0",
          timestamp: new Date().toISOString(),
          stores: {}
        };

        if (storeNames === null) {
          // Export all stores
          const snapshot = await this.database.ref('NexaStoreDB').once('value');
          if (snapshot.exists()) {
            exportData.stores = snapshot.val();
          }
        } else {
          // Export specific stores
          const storesToExport = Array.isArray(storeNames) ? storeNames : [storeNames];
          for (const storeName of storesToExport) {
            const data = await this.getAll(storeName);
            exportData.stores[storeName] = data.data;
          }
        }

        resolve(exportData);
      } catch (error) {
        console.error(`❌ Firebase export error:`, error);
        reject(error);
      }
    });
  },

  import: function (importData, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!importData || !importData.stores) {
          reject(new Error("Invalid import data"));
          return;
        }

        const storeNames = Object.keys(importData.stores);
        for (const storeName of storeNames) {
          const storeData = importData.stores[storeName];
          if (Array.isArray(storeData)) {
            await this.batchUpdate(storeName, storeData, options);
          }
        }

        resolve(true);
      } catch (error) {
        console.error(`❌ Firebase import error:`, error);
        reject(error);
      }
    });
  },

  exportToFile: function (filename = null, storeNames = null, options = {}) {
    // This method is not applicable in React Native
    // Data export should be handled differently (e.g., sharing, cloud storage)
    console.warn('exportToFile is not supported in React Native');
    return this.export(storeNames, options);
  },

  importFromFile: function (file, options = {}) {
    // This method is not applicable in React Native
    console.warn('importFromFile is not supported in React Native');
    return Promise.reject(new Error('Not supported in React Native'));
  },

  // === UTILITY METHODS ===

  getInfo: function () {
    return {
      initialized: !!this.database,
      config: this.config,
      observers: this.observers.size,
      polling: this.pollingIntervals.size,
      autoMode: this.autoMode
    };
  },

  hasStore: function (storeName) {
    return new Promise(async (resolve, reject) => {
      try {
        const ids = await this.getStoreIndex(storeName);
        resolve(ids.length > 0);
      } catch (error) {
        console.error(`❌ FirebaseRtdb hasStore error:`, error);
        reject(error);
      }
    });
  },

  cleanup: function () {
    // Stop all polling
    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.pollingIntervals.clear();

    // Clear all observers
    this.observers.clear();

    console.log('🧹 FirebaseRtdb cleanup completed');
  },

  getRealtimeStatus: function () {
    return {
      observers: Array.from(this.observers.keys()),
      polling: Array.from(this.pollingIntervals.keys()),
      observerCount: this.observers.size,
      pollingCount: this.pollingIntervals.size
    };
  },

  refresh: function (apiEndpoint = null, options = {}) {
    // Compatibility method
    console.warn('refresh is deprecated. Use getAll() or watch() instead.');
    return Promise.resolve({ data: [] });
  },

  stopRefresh: function () {
    this.cleanup();
  },

  forceRefresh: function () {
    console.log('🔄 Force refresh requested');
    // In React Native, Firebase already handles real-time updates
    return Promise.resolve(true);
  },

  // === HELPER METHODS ===

  generateId: function () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  notifyObservers: function (storeName, data, action) {
    const observers = this.observers.get(storeName);
    if (observers && observers.length > 0) {
      observers.forEach(obs => {
        if (obs.callback) {
          obs.callback({ data, action });
        }
      });
    }
  },

  // Store index management for AsyncStorage
  async getStoreIndex(storeName) {
    try {
      const indexKey = `${this.storagePrefix}__index__:${storeName}`;
      const index = await AsyncStorage.getItem(indexKey);
      return index ? JSON.parse(index) : [];
    } catch (error) {
      console.error('Error getting store index:', error);
      return [];
    }
  },

  async updateStoreIndex(storeName, id, action) {
    try {
      const indexKey = `${this.storagePrefix}__index__:${storeName}`;
      let index = await this.getStoreIndex(storeName);
      
      if (action === 'add') {
        if (!index.includes(id)) {
          index.push(id);
        }
      } else if (action === 'remove') {
        index = index.filter(item => item !== id);
      }
      
      await AsyncStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('Error updating store index:', error);
    }
  },

  // === SAFE INTERFACE ===

  createSafeInterface: function() {
    const safeWrapper = (fn, methodName) => {
      return async (...args) => {
        try {
          return await fn(...args);
        } catch (error) {
          console.error(`❌ Safe Firebase ${methodName} error:`, error);
          return null;
        }
      };
    };

    const api = this.createInterface();
    const safeApi = {};

    Object.keys(api).forEach(key => {
      if (typeof api[key] === 'function') {
        safeApi[key] = safeWrapper(api[key], key);
      } else {
        safeApi[key] = api[key];
      }
    });

    return safeApi;
  },
};

// Export Firebase configuration for reference
export { FirebaseConfig };

// Default export
export default FirebaseRtdb;
