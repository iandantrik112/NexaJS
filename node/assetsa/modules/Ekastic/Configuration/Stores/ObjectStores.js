export class NexaStorageManager {
  constructor() {
    this.dbName = "NexaStoreDB";
    this.dbVersion =8; // Incremented version for Presentations store support
    this.nexaUI = NexaUI();
    this.db = null;
    this.userData = NEXA.userId; // Default user ID = 1 untuk backward compatibility
  }
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;

        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion;

        this.createObjectStores(oldVersion);
      };
    });
  }

  /**
   * Ensure all required object stores are ready
   */
  async ensureObjectStoresReady() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const requiredStores = [
      "folderStructure",
      "activityLogs",
      "metadata",
      "recycleBin",
      "fileContents",
      "fileSettings",
      "nexaStore",
      "bucketsStore",
      "presentations",
    ];

    const missingStores = requiredStores.filter(
      (storeName) => !this.db.objectStoreNames.contains(storeName)
    );

    if (missingStores.length > 0) {
      console.warn("Missing object stores detected:", missingStores);
      // Force database upgrade by reopening with higher version
      await this.forceDatabaseUpgrade();

      // Verify stores were created after upgrade
      const stillMissing = requiredStores.filter(
        (storeName) => !this.db.objectStoreNames.contains(storeName)
      );

      if (stillMissing.length > 0) {
        console.error("Failed to create object stores:", stillMissing);
        throw new Error(
          `Failed to create required object stores: ${stillMissing.join(", ")}`
        );
      }

      console.log("✅ All required object stores created successfully");
    }

    return true;
  }

  /**
   * Force database upgrade to ensure all object stores exist
   */
  async forceDatabaseUpgrade() {
    return new Promise((resolve, reject) => {
      // Close current connection
      if (this.db) {
        this.db.close();
      }

      // Reopen with incremented version to trigger upgrade
      const newVersion = this.dbVersion + 1;
      console.log(
        `🔄 Upgrading database from version ${this.dbVersion} to ${newVersion}`
      );

      const request = indexedDB.open(this.dbName, newVersion);

      request.onerror = () => {
        console.error("Database upgrade failed:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.dbVersion = newVersion;
        console.log(
          `✅ Database upgraded successfully to version ${newVersion}`
        );
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log("🔧 Database upgrade needed, creating object stores...");
        this.db = event.target.result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion;

        console.log(
          `Creating object stores for upgrade from ${oldVersion} to ${newVersion}`
        );
        this.createObjectStores(oldVersion);

        // Log created stores
        const createdStores = Array.from(this.db.objectStoreNames);
        console.log("📦 Created object stores:", createdStores);
      };
    });
  }

  createObjectStores(oldVersion = 0) {
    console.log(
      `🏗️ Creating object stores for version upgrade from ${oldVersion}`
    );

    // Store untuk folder structure (version 1)
    if (!this.db.objectStoreNames.contains("folderStructure")) {
      console.log("Creating folderStructure store...");
      const folderStore = this.db.createObjectStore("folderStructure", {
        keyPath: "id",
        autoIncrement: false,
      });
      folderStore.createIndex("path", "path", { unique: false });
      folderStore.createIndex("parentPath", "parentPath", { unique: false });
    }

    // Store untuk activity logs (version 1)
    if (!this.db.objectStoreNames.contains("activityLogs")) {
      console.log("Creating activityLogs store...");
      const activityStore = this.db.createObjectStore("activityLogs", {
        keyPath: "id",
        autoIncrement: true,
      });
      activityStore.createIndex("timestamp", "timestamp", { unique: false });
      activityStore.createIndex("action", "action", { unique: false });
      activityStore.createIndex("path", "path", { unique: false });
    }

    // Store untuk settings dan metadata (version 1)
    if (!this.db.objectStoreNames.contains("metadata")) {
      console.log("Creating metadata store...");
      this.db.createObjectStore("metadata", {
        keyPath: "key",
      });
    }

    // Store untuk Recycle Bin (version 2)
    if (oldVersion < 2 && !this.db.objectStoreNames.contains("recycleBin")) {
      const recycleBinStore = this.db.createObjectStore("recycleBin", {
        keyPath: "id",
        autoIncrement: true,
      });
      recycleBinStore.createIndex("deletedDate", "deletedDate", {
        unique: false,
      });
      recycleBinStore.createIndex("originalPath", "originalPath", {
        unique: false,
      });
      recycleBinStore.createIndex("itemType", "itemType", { unique: false });
    }

    // Store untuk File Contents (version 3)
    if (oldVersion < 3 && !this.db.objectStoreNames.contains("fileContents")) {
      console.log("Creating fileContents store...");
      const fileContentsStore = this.db.createObjectStore("fileContents", {
        keyPath: "fileId", // Menggunakan fileId sebagai key (fileName + fileType)
      });
      fileContentsStore.createIndex("fileName", "fileName", { unique: false });
      fileContentsStore.createIndex("fileType", "fileType", { unique: false });
      fileContentsStore.createIndex("lastModified", "lastModified", {
        unique: false,
      });
      fileContentsStore.createIndex("fileNameType", ["fileName", "fileType"], {
        unique: true,
      });
    }

    // Store untuk File Settings (version 4)
    if (oldVersion < 4 && !this.db.objectStoreNames.contains("fileSettings")) {
      console.log("Creating fileSettings store...");
      const fileSettingsStore = this.db.createObjectStore("fileSettings", {
        keyPath: "id", // Menggunakan id sebagai key (userData_fileName)
      });
      fileSettingsStore.createIndex("fileName", "fileName", { unique: false });
      fileSettingsStore.createIndex("userData", "userData", { unique: false });
      fileSettingsStore.createIndex("savedAt", "savedAt", { unique: false });
    }
    if (oldVersion < 5 && !this.db.objectStoreNames.contains("nexaStore")) {
      const nexaStore = this.db.createObjectStore("nexaStore", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
    // Store untuk NexaStore (version 5)
    if (oldVersion < 6 && !this.db.objectStoreNames.contains("bucketsStore")) {
      const nexaStore = this.db.createObjectStore("bucketsStore", {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    if (oldVersion < 7 && !this.db.objectStoreNames.contains("presentations")) {
      const presentationsStore = this.db.createObjectStore("presentations", {
        keyPath: "id",
        autoIncrement: true,
      });
      // Create indexes for NexaSlideDB compatibility
      presentationsStore.createIndex("fileName", "fileName", { unique: false });
      presentationsStore.createIndex("namePerFile", ["fileName", "name"], {
        unique: true,
      });
      presentationsStore.createIndex("createdAt", "createdAt", {
        unique: false,
      });
      presentationsStore.createIndex("updatedAt", "updatedAt", {
        unique: false,
      });
    }

    // Log final state of object stores
    const finalStores = Array.from(this.db.objectStoreNames);
    console.log(
      "🏁 Object store creation completed. Available stores:",
      finalStores
    );
  }
  async getDB(stores = []) {
    return await this.nexaUI
      .Storage()
      .indexedDB.init(this.dbName, this.dbVersion, stores);
  }
  async folderStructure_user() {
    let latest = null;
    let userData = this.userData; // Default fallback version
    let version = "1.0.0"; // Default fallback version

    try {
      const inDB = await this.nexaUI
        .Storage()
        .indexedDB.init(this.dbName, this.dbVersion, ["metadata"]);

      if (inDB) {
        latest = await inDB.get(
          "metadata",
          "folderStructure_user_" + this.userData
        );
      }
      return latest;
    } catch (dbError) {
      console.error("❌ IndexedDB operation failed:", dbError);
    }
  }

  async saveFolderStructureVersion(structure, version) {
    const userFolderStructure = await this.folderStructure_user();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["metadata"], "readwrite");
      const store = transaction.objectStore("metadata");

      const request = store.put({
        key: `folderStructure_user_${this.userData}`, // User-specific key
        data: structure,
        userData: this.userData,
        version: version || "1.0.0",
        lastModified: new Date().toISOString(),
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async saveFolderStructure(structure) {
    const userFolderStructure = await this.folderStructure_user();
    const inDB = await this.getDB(["metadata"]);
    await inDB.set("metadata", {
      key: `folderStructure_user_${this.userData}`,
      data: structure,
      userData: this.userData,
      version: userFolderStructure?.version || "1.0.0",
      lastModified: new Date().toISOString(),
    });
    return true;
  }

  async saveNavigationState(navigationState) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["metadata"], "readwrite");
      const store = transaction.objectStore("metadata");

      const request = store.put({
        key: `navigationState_user_${this.userData}`, // User-specific key
        data: navigationState,
        userData: this.userData,
        lastModified: new Date().toISOString(),
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async loadFolderStructure() {
    const inDB = await this.getDB(["metadata"]);
    const result = await inDB.get(
      "metadata",
      `folderStructure_user_${this.userData}`
    );
    return result ? result.data : null;
  }

  async loadNavigationState() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["metadata"], "readonly");
      const store = transaction.objectStore("metadata");

      const request = store.get(`navigationState_user_${this.userData}`); // Load user-specific data

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async logActivity(action, path, details = {}) {
    const inDB = await this.getDB(["activityLogs"]);
    const activity = {
      id: Date.now(),
      action,
      path,
      details,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userData: this.userData,
    };
    await inDB.set("activityLogs", activity);
    return activity.id;
  }

  async getActivityLogs(limit = 100) {
    const inDB = await this.getDB(["activityLogs"]);
    const allResult = await inDB.getAll("activityLogs");
    const all = Array.isArray(allResult)
      ? allResult
      : Array.isArray(allResult?.data)
      ? allResult.data
      : [];
    const filtered = all.filter(
      (x) => x.userData === this.userData || !x.userData
    );
    filtered.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return filtered.slice(0, limit);
  }

  async clearOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffISO = cutoffDate.toISOString();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["activityLogs"], "readwrite");
      const store = transaction.objectStore("activityLogs");
      const index = store.index("timestamp");

      const range = IDBKeyRange.upperBound(cutoffISO);
      const request = index.openCursor(range);
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    return this.sessionId;
  }

  // Export/Import functionality moved to ExportDataManager class
  // See Explorer/exportData.js for the new implementation

  // Recycle Bin methods
  async addToRecycleBin(item) {
    return new Promise((resolve, reject) => {
      try {
        // Check if recycleBin object store exists
        if (!this.db.objectStoreNames.contains("recycleBin")) {
          reject(
            new Error(
              "RecycleBin object store not found. Please refresh the page to upgrade the database."
            )
          );
          return;
        }

        const transaction = this.db.transaction(["recycleBin"], "readwrite");
        const store = transaction.objectStore("recycleBin");

        const recycleBinItem = {
          itemName: item.itemName,
          itemData: item.itemData,
          originalPath: item.originalPath,
          deletedDate: new Date().toISOString(),
          itemType: item.itemType,
          sessionId: this.getSessionId(),
          userData: this.userData, // Add user ID to recycle bin items
        };

        const request = store.add(recycleBinItem);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async getRecycleBinItems() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recycleBin"], "readonly");
      const store = transaction.objectStore("recycleBin");
      const index = store.index("deletedDate");

      const request = index.openCursor(null, "prev"); // Latest first
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Filter hanya item dari user yang sedang aktif
          if (
            cursor.value.userData === this.userData ||
            !cursor.value.userData
          ) {
            // Include items without userData for backward compatibility
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async restoreFromRecycleBin(recycleBinId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recycleBin"], "readwrite");
      const store = transaction.objectStore("recycleBin");

      // First get the item
      const getRequest = store.get(recycleBinId);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          // Delete from recycle bin
          const deleteRequest = store.delete(recycleBinId);
          deleteRequest.onsuccess = () => {
            resolve(item);
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          reject(new Error("Item not found in Recycle Bin"));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async emptyRecycleBin() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recycleBin"], "readwrite");
      const store = transaction.objectStore("recycleBin");

      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFromRecycleBin(recycleBinId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recycleBin"], "readwrite");
      const store = transaction.objectStore("recycleBin");

      const request = store.delete(recycleBinId);

      request.onsuccess = () => {
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Method untuk menyimpan file content berdasarkan fileName dan fileType
  async saveFileContent(fileData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["fileContents"], "readwrite");
      const store = transaction.objectStore("fileContents");

      // Normalize fileType to lowercase for consistency
      const normalizedFileType = fileData.fileType
        ? fileData.fileType.toLowerCase()
        : "";

      // Add user ID to file data
      const userFileData = {
        ...fileData,
        fileType: normalizedFileType, // Store normalized extension
        userData: this.userData,
        fileId: `${fileData.fileName}_${normalizedFileType}_user_${this.userData}`, // User-specific fileId
      };
      const request = store.put(userFileData);

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Method untuk memuat file content berdasarkan fileName dan fileType
  async loadFileContent(fileName, fileType) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["fileContents"], "readonly");
      const store = transaction.objectStore("fileContents");
      const fileId = `${fileName}_${fileType}_user_${this.userData}`; // User-specific fileId

      const request = store.get(fileId);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(null); // File tidak ditemukan di IndexedDB
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Method untuk memeriksa apakah file content ada di IndexedDB
  async hasFileContent(fileName, fileType) {
    // Normalize file type to lowercase for consistency
    const normalizedFileType = fileType ? fileType.toLowerCase() : "";
    const fileData = await this.loadFileContent(fileName, normalizedFileType);

    return fileData !== null;
  }

  // Method untuk mengexport semua metadata
  async getAllMetadata() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["metadata"], "readonly");
      const store = transaction.objectStore("metadata");
      const request = store.getAll();

      request.onsuccess = () => {
        // Filter hanya metadata dari user yang sedang aktif
        const userMetadata = request.result.filter(
          (item) =>
            item.key &&
            (item.key.includes(`_user_${this.userData}`) ||
              !item.key.includes("_user_"))
        );
        resolve(userMetadata);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Method untuk mengexport semua file contents
  async getAllFileContents() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["fileContents"], "readonly");
      const store = transaction.objectStore("fileContents");
      const request = store.getAll();

      request.onsuccess = () => {
        // Filter hanya file contents dari user yang sedang aktif
        const userFileContents = request.result.filter(
          (item) => item.userData === this.userData || !item.userData // backward compatibility
        );
        resolve(userFileContents);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveFileSettings(fileName, settings) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["fileSettings"], "readwrite");
      const store = transaction.objectStore("fileSettings");

      const fileSettingsData = {
        id: `${this.userData}_${fileName}`,
        fileName: fileName,
        userData: this.userData,
        settings: settings,
        savedAt: new Date().toISOString(),
      };

      const request = store.put(fileSettingsData);

      request.onsuccess = () => resolve(fileSettingsData);
      request.onerror = () => reject(request.error);
    });
  }

  async loadFileSettings(fileName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["fileSettings"], "readonly");
      const store = transaction.objectStore("fileSettings");
      const request = store.get(`${this.userData}_${fileName}`);

      request.onsuccess = () => {
        let result = request.result ? request.result.settings : null;

        // Migrate old settings structure to new structure
        if (
          result &&
          (result.tabSize !== undefined ||
            result.wordWrap !== undefined ||
            result.showLineNumbers !== undefined)
        ) {
          // Remove old fields and ensure new fields exist
          const migratedResult = {
            readOnly: result.readOnly || false,
            encoding: result.encoding || "UTF-8",
            lineEndings: result.lineEndings || "LF",
            program: result.program || "bantuan",
            deskripsi: result.deskripsi || "",
            visibilityFile: result.visibilityFile || "open",
            statusFile: result.statusFile || "content",
            statusData: result.statusData || "terbuka",
            syntaxHighlight: result.syntaxHighlight || false,
            autoIndent: result.autoIndent || false,
            bracketMatch: result.bracketMatch || false,
            lastModified: new Date().toISOString(),
          };

          // Save the migrated settings back to IndexedDB
          this.saveFileSettings(fileName, migratedResult).catch((error) => {
            console.error(
              `Error saving migrated settings for ${fileName}:`,
              error
            );
          });

          result = migratedResult;
        }

        resolve(result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllFileSettings() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["fileSettings"], "readonly");
      const store = transaction.objectStore("fileSettings");
      const request = store.getAll();

      request.onsuccess = () => {
        // Filter hanya file settings dari user yang sedang aktif
        const userFileSettings = request.result.filter(
          (item) => item.userData === this.userData || !item.userData
        );
        resolve(userFileSettings);
      };
      request.onerror = () => reject(request.error);
    });
  }
}
