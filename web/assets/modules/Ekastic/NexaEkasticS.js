/**
 * NexaStore.js - Clean Version - Only getMenuStructure Related Code
 * Cleaned version that only contains code related to getMenuStructure functionality
 */
import { createnew } from "./System/index.js";
import { setDeleteTable } from "./System/delete.js";
import { updateTabel } from "./System/update.js";
import { updateForm } from "./Query/update.js";
import { setProperties } from "./System/Properties.js";
import { setApplications } from "./Applications/index.js";
import { setSystemInit } from "./Configuration/system.js";
// import { setViewForm } from "./Form/View.js";
import { formSDKStuktur } from "./Form/index.js";
// import { setViewJoin } from "./Join/View.js";
// import { joinStuktur } from "./Join/Stuktur.js";
// import { updateJoin } from "./Join/update.js";

import { setSortable } from "./Sortable/index.js";
import { setPackage } from "./Package/index.js";
import { setAccses } from "./Accses/index.js";
import { setSearch } from "./Search/index.js";
import { setModal } from "./Modal/index.js";
import { setTabelNav } from "./Metadata/index.js";
import { setSelect } from "./Select/index.js";
import { setFailed } from "./Failed/index.js";
import { setUpload } from "./Upload/index.js";
import { setApproval } from "./Approval/index.js";
import { setKeyPackages } from "./Upgrade/index.js";

// Plugin
import { iniChart } from "./Chart/index.js";
import { initQuery } from "./Query/index.js";
import { iniPercent } from "./Percent/index.js";
import { setConfiguration } from "./Configuration/index.js";


export class NexaEkastic {
  constructor(options = {}) {
    try {
      this.nexaUI = NexaUI();

      if (!this.nexaUI) {
        console.error("Failed to initialize NexaUI instance");
      }
    } catch (error) {
      console.error("Error initializing NexaUI:", error);
      this.nexaUI = null;
    }
    this.dbNamekey = "NexaStoreDB";
    this.dbVersionkey = 7; // Updated to match existing database version
    this.storedTables = []; // Initialize as empty array
    this.dataLoadPromise = null; // Track loading state
    // ✅ Initialize database reference dan simpan di NXUI
    this.initializeDatabase();
    // Setup global functions immediately when instance is created
    NexaEkastic.setupGlobalFunctions();

    // Load data in constructor and track the promise
    this.dataLoadPromise = this.loadStoredData().then((dataset) => {
      this.storedTables = dataset;
      // Trigger refresh if needed
      this.onDataLoaded();
      return dataset;
    });

    // Create proxy to handle missing methods
    return new Proxy(this, {
      get(target, prop, receiver) {
        // If property exists, return it
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        // If it's a function call and looks like an action, create a fallback
        // 🔧 FIX: Exclude standard actions yang sudah ada method-nya
        if (
          typeof prop === "string" &&
          prop.startsWith("settings") &&
          prop !== "settings" &&
          ![
            "settingsTable",
            "settingsForm",
            "settingsCount",
            "settingsGroup",
            "settingsView",
            "settingsJoin",
            "infoTable",
          ].includes(prop)
        ) {
          return async function (data = null) {
            return {
              success: true,
              action: prop,
              data,
              message: `Action ${prop} handled by proxy fallback`,
            };
          };
        }

        // For other properties, return undefined (normal behavior)
        return undefined;
      },
    });
  }

  /**
   * Initialize database reference and make it globally available
   */
  async initializeDatabase() {
    try {
      // Only NXUI.ref will be set globally to avoid confusion

      // First, try to detect existing database version
      const detectedVersion = await this.detectDatabaseVersion();
      if (detectedVersion && detectedVersion > this.dbVersionkey) {
        console.log(
          "🔄 Auto-updating version from",
          this.dbVersionkey,
          "to",
          detectedVersion
        );
        this.dbVersionkey = detectedVersion;
      }

      // Initialize database reference with required stores
      try {
        NXUI.ref = await NXUI.Storage().indexedDB.init(
          this.dbNamekey,
          this.dbVersionkey,
          ["nexaStore"] // Include required stores
        );
      } catch (versionError) {
        if (
          versionError.name === "VersionError" ||
          versionError.message.includes("version")
        ) {
          // Try to get the actual version and retry
          const actualVersion = await this.detectDatabaseVersion();
          if (actualVersion) {
            this.dbVersionkey = actualVersion;

            // Retry with correct version
            NXUI.ref = await NXUI.Storage().indexedDB.init(
              this.dbNamekey,
              this.dbVersionkey,
              ["nexaStore"]
            );
          } else {
            throw versionError;
          }
        } else {
          throw versionError;
        }
      }
      return NXUI.ref;
    } catch (error) {
      console.error("❌ Failed to initialize database reference:", error);
      NXUI.ref = null;
      return null;
    }
  }

  /**
   * Detect existing database version to avoid version conflicts
   */
  async detectDatabaseVersion() {
    return new Promise((resolve) => {
      try {
        // Open database without specifying version to get current version
        const request = indexedDB.open(this.dbNamekey);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const currentVersion = db.version;
          db.close();
          console.log("version:", currentVersion);
          resolve(currentVersion);
        };

        request.onerror = () => {
          console.log("🔍 No existing database found, using default version");
          resolve(null);
        };
      } catch (error) {
        console.warn("⚠️ Could not detect database version:", error);
        resolve(null);
      }
    });
  }

  /**
   * Get current database information
   */
  getDatabaseInfo() {
    return {
      name: this.dbNamekey,
      version: this.dbVersionkey,
      isConnected: !!NXUI.ref,
      ref: NXUI.ref,
    };
  }

  /**
   * Wait for data to be loaded if not already loaded
   */
  async waitForDataLoad() {
    if (this.dataLoadPromise) {
      await this.dataLoadPromise;
    }
    return this.storedTables;
  }

  /**
   * Main method - Gets the menu structure for Nexa Storage
   */
  getMenuStructure() {
    const storedTablesMenu = this.isStoredDataLoaded()
      ? this.formatStoredTablesForMenu()
      : [];

    const structure = [
      {
        icon: "layers", // Feather Icons: layers
        label: "Nexa Storage",
        key: "nexa-storage-main",
        action: "layoutElements",
        submenu: [
          {
            icon: "archive", // Feather Icons: layers
            label: "Applications",
            key: "nexa-storage-main",
            submenu: [
              {
                label: "Metadata",
                key: "Metadata",
                action:"appConfiguration",
                icon: "hard-drive", // Feather Icons: archive
              },
              {
                label: "Version",
                key: "App",
                action:"appConfiguration",
                icon: "cpu", // Feather Icons: archive
              },
              {
                label: "Database",
                key: "Db",
                action:"appConfiguration",
                icon: "database", // Feather Icons: archive
              },
            ],
          },
          {
            label: "Metadata",
            key: "new-tabel",
            icon: "database", // Feather Icons: archive
            submenu: NEXA.controllers.data.tabel.submenu,
          },

          // Add stored tables if available
          ...storedTablesMenu,
        ],
      },
    ];
    //console.log(NEXA.controllers.data.tabel.submenu)
    return structure;
  }

  /**
   * Format stored tables for menu display
   */
  formatStoredTablesForMenu() {
    try {
      if (
        !this.storedTables ||
        !Array.isArray(this.storedTables) ||
        this.storedTables.length === 0
      ) {
        return [];
      }

      return this.storedTables.map((table) => {
        // Use existing submenu from table data if available
        const submenu = table.submenu || [];

        return {
          label: table.label || table.className || "Unnamed Table",
          key: table.id, // 🔧 FIX: Use unique table.id instead of tableKey to prevent collision
          icon: table.icon || "database", // Feather Icons: database
          tableId: table.id,
          tableKey: table.id, // Keep original tableKey for reference
          submenu: submenu,
          // Remove action if submenu exists
          ...(submenu.length === 0 && { action: "openStoredTable" }),
        };
      });
    } catch (error) {
      console.error("Error formatting stored tables for menu:", error);
      return [];
    }
  }

  /**
   * Check if stored data is loaded and valid
   */
  isStoredDataLoaded() {
    if (!this.storedTables || this.storedTables.length === 0) {
      return false;
    }

    // Check if first item has expected stored table properties
    const firstTable = this.storedTables[0];

    // More flexible check - table is valid if it has id and basic info
    return !!(
      firstTable &&
      firstTable.id &&
      (firstTable.label || firstTable.className || firstTable.tableName)
    );
  }

  /**
   * Called when stored data is loaded
   */
  onDataLoaded() {
    // You can trigger UI refresh here if needed
    if (window.nexaStoreDataLoadedCallback) {
      window.nexaStoreDataLoadedCallback(this.storedTables);
    }

    // Force refresh menu structure
    if (window.nexaStoreMenuRefreshCallback) {
      window.nexaStoreMenuRefreshCallback(this.getMenuStructure());
    }
  }

  /**
   * Wait for data to be loaded and return menu structure
   * This method is still used by external components
   */
  async getMenuStructureWhenReady() {
    await this.waitForDataLoad();
    const structure = this.getMenuStructure();
    return structure;
  }

  /**
   * Load stored data from IndexedDB
   */
  async loadStoredData() {
    try {
      // Check if nexaUI is available
      if (!this.nexaUI) {
        console.error("NexaUI instance not available in loadStoredData");
        this.storedTables = [];
        return [];
      }

      // Use existing NXUI.ref if available, otherwise initialize new one
      let db = NXUI.ref;
      if (!db) {
        db = await this.nexaUI
          .Storage()
          .indexedDB.init(this.dbNamekey, this.dbVersionkey, ["nexaStore"]);

        // Store for future use
        NXUI.ref = db;
      }

      // Get all stored data
      const indexedDBData = await db.getAll("nexaStore");

      // Store data for later use
      this.storedTables = indexedDBData.data || [];

      // Return the data
      return this.storedTables;
    } catch (error) {
      console.error("Failed to load stored data:", error);
      this.storedTables = [];
      return [];
    }
  }

  /**
   * Action handler methods for menu interactions
   */

  // Layout action
  async layoutElements(data = null) {
    return { success: true, action: "layoutElements", data };
  }

  // Table operations
  async openStoredTable(data = null) {
    return { success: true, action: "openStoredTable", data };
  }
  async editTable(data = null) {
    try {
      if (data.type == "join") {
        const result = await updateJoin(data);
        console.log(result.modalid);
        NXUI.nexaModal.open(result.modalid);
        return { success: true, action: "editTable", data: result };
      } else {
        const result = await updateForm(data);
        NXUI.nexaModal.open(result.modalid);
        return { success: true, action: "editTable", data: result };
      }
    } catch (error) {
      console.error("❌ Error in editTable:", error);
      return { success: false, action: "editTable", error: error.message };
    }
  }

  async viewTable(data = null) {
    // Route to specific settings method based on data.type
    if (data && data.type) {
      const settingsMap = {
        form: "viewForm",
        stuktur: "viewStuktur",
        join: "viewJoin",
      };
      const methodName = settingsMap[data.type];
      if (methodName && typeof this[methodName] === "function") {
        return await this[methodName](data);
      }
    }
    return { success: true, action: "viewTable", data };
  }

  // async viewForm(data = null) {
  //   try {
  //     // 🔧 FIX: Ensure data is valid before passing to setViewForm
  //     if (!data || typeof data !== "object") {
  //       console.warn(
  //         "⚠️ Invalid or null data passed to viewForm, using default"
  //       );
  //       data = { id: null, store: null };
  //     }

  //     const result = await setViewForm(data);
  //     return { success: true, action: "viewForm", data: result };
  //   } catch (error) {
  //     console.error("❌ Error in viewForm:", error);
  //     return { success: false, action: "viewForm", error: error.message };
  //   }
  // }
  async viewStuktur(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
      if (data.type == "join") {
        const result = await joinStuktur(data);
        return { success: true, action: "viewJoin", data: result };
      } else {
        const result = await formSDKStuktur(data);
        return { success: true, action: "viewForm", data: result };
      }
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
  async formStuktur(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await formSDKStuktur(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
    async viewSortable(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setSortable(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
  async uploadFile(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setUpload(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
  async viewApproval(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setApproval(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }








  
  async systemInit(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setSystemInit(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }

  async viewSelect(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setSelect(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }




  // async viewJoin(data = null) {
  //   try {
  //     // 🔧 FIX: Ensure data is valid before passing to setViewJoin
  //     if (!data || typeof data !== "object") {
  //       console.warn(
  //         "⚠️ Invalid or null data passed to viewJoin, using default"
  //       );
  //       data = { id: null, store: null };
  //     }

  //     const result = await setViewJoin(data);
  //     return { success: true, action: "viewJoin", data: result };
  //   } catch (error) {
  //     console.error("❌ Error in viewJoin:", error);
  //     return { success: false, action: "viewJoin", error: error.message };
  //   }
  // }

  async settings(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to viewJoin, using default"
        );
        data = { id: null, store: null };
      }

      const result = await setApplications(data);
      return { success: true, action: "viewJoin", data: result };
    } catch (error) {
      console.error("❌ Error in viewJoin:", error);
      return { success: false, action: "viewJoin", error: error.message };
    }




  }

  async viewPackage(data = null) {
     try {
     
       const result = await setPackage(data);
       return { success: true, action: "viewPackage", data: result };
     } catch (error) {
       console.error("❌ Error in settingsForm:", error);
       return { success: false, action: "settingsForm", error: error.message };
     }
  }

  async viewTabelNav(data = null) {
     try {

      const result = await setTabelNav(data);
      return { success: true, action: "settingsTable", data: result };
     } catch (error) {
       console.error("❌ Error in settingsForm:", error);
       return { success: false, action: "settingsForm", error: error.message };
     }
  }
  async usersAccses(data = null) {
    try {
      const result = await setAccses(data);
      return { success: true, action: "settingsTable", data: result };
    } catch (error) {
      console.error("❌ Error in settingsForm:", error);
      return { success: false, action: "settingsForm", error: error.message };
    }
  }

  async settingsCount(data = null) {
    return { success: true, action: "settingsCount", data };
  }

  async settingsGroup(data = null) {
    return { success: true, action: "settingsGroup", data };
  }

  async settingsJoin(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }

      const result = await setJoin(data);
      return { success: true, action: "settingsJoin", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }

    async keyPackages(data = null) {
      try {
        // 🔧 FIX: Ensure data is valid before passing to setJoin
        if (!data || typeof data !== "object") {
          console.warn(
            "⚠️ Invalid or null data passed to settingsJoin, using default"
          );
          data = { id: null, store: null };
        }

        const result = await setKeyPackages(data);
        return { success: true, action: "settingsJoin", data: result };
      } catch (error) {
        console.error("❌ Error in settingsJoin:", error);
        return { success: false, action: "settingsJoin", error: error.message };
      }
    }

  async viewModal(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }

      const result = await setModal(data);
      return { success: true, action: "settingsJoin", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }
  // New Table action

  async appConfiguration(data = null) {
    try {
      const result = await setConfiguration(data);
      return { success: true, action: "appConfiguration", data: result };
    } catch (error) {
      console.error("❌ Error in appConfiguration:", error);
      return {
        success: false,
        action: "appConfiguration",
        error: error.message,
      };
    }
  }

  async appInstal(data = null) {
    console.log(data);
  }

  async setQuery(data = null) {
    try {
      const result = await initQuery(data);
      return { success: true, action: "settingsTable", data: result };
    } catch (error) {
      console.error("❌ Error in settingsForm:", error);
      return { success: false, action: "settingsForm", error: error.message };
    }
  }
  

  async viewChart(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await iniChart(data);
      return { success: true, action: "settingsJoin", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }

  async viewCount(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await iniPercent(data);
      return { success: true, action: "settingsJoin", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }

  async viewSearch(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await setSearch(data);
      return { success: true, action: "settingsJoin", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }
 async permissionsFailed(data = null) {
    try {
       const result = await setFailed(data);
      return { success: true, action: "newTabel", data: result };
    } catch (error) {
      console.error("❌ Error in newTabel:", error);
      return { success: false, action: "newTabel", error: error.message };
    }
  }
  async newTabel(data = null) {
    try {
      const result = await createnew(data);
      NXUI.nexaModal.open(result.modalId);
      return { success: true, action: "newTabel", data: result };
    } catch (error) {
      console.error("❌ Error in newTabel:", error);
      return { success: false, action: "newTabel", error: error.message };
    }
  }

  async deleteTable(data = null) {
    try {
      await setDeleteTable(data);
    } catch (error) {
      console.error("❌ Error in newTabel:", error);
      return { success: false, action: "newTabel", error: error.message };
    }
  }

  async infoTable(data = null) {
    try {
      if (data) {
        await setProperties(data);
        return { success: true, action: "infoTable", data };
      } else {
        return {
          success: false,
          action: "infoTable",
          error: "No data provided",
        };
      }
    } catch (error) {
      console.error("❌ Error in infoTable:", error);
      return { success: false, action: "infoTable", error: error.message };
    }
  }

  /**
   * Handle action calls from submenu
   * This method is crucial for routing actions from the menu to the appropriate methods
   */
  // async handleAction(action, data) {
  //   console.log(
  //     `🎯 NexaStore.handleAction called: action="${action}", data:`,
  //     data
  //   );

  //   switch (action) {
  //     case "layoutElements":
  //       return await this.layoutElements(data);
  //     case "newTabel":
  //       return await this.newTabel(data);
  //     case "openStoredTable":
  //       return await this.openStoredTable(data);
  //     case "editTable":
  //       return await this.editTable(data);
  //     case "viewTable":
  //       return await this.viewTable(data);
  //     case "deleteTable":
  //       return await this.deleteTable(data);
  //     case "settings":
  //       return await this.settings(data);
  //     case "settingsForm":
  //       return await this.settingsForm(data);
  //     case "settingsTable":
  //       return await this.settingsTable(data);
  //     case "settingsChart":
  //       return await this.settingsChart(data);
  //     case "settingsCount":
  //       return await this.settingsCount(data);
  //     case "settingsGroup":
  //       return await this.settingsGroup(data);
  //     case "settingsJoin":
  //       return await this.settingsJoin(data);
  //     case "settingsView":
  //       return await this.settingsView(data);
  //     case "infoTable":
  //       console.log(`🔄 Routing to infoTable with data:`, data);
  //       return await this.infoTable(data);
  //     default:
  //       // Handle data_* actions (e.g., data_table, data_form, data_chart)
  //       if (action.startsWith("data_")) {
  //         console.log(`🔄 Handling data action: ${action}`);
  //         // You can add specific data action handling here if needed
  //         return { success: true, action, data };
  //       }

  //       // Check if method exists directly on the instance
  //       if (typeof this[action] === "function") {
  //         console.log(`🔄 Calling method directly: ${action}`);
  //         return await this[action](data);
  //       } else {
  //         console.warn(`⚠️ Unknown action: ${action}`);
  //         return { success: false, action, error: `Unknown action: ${action}` };
  //       }
  //   }
  // }

  /**
   * Setup global functions (minimal version)
   */
  static setupGlobalFunctions() {
    // Prevent multiple setups
    if (window.nexaStoreGlobalFunctionsSetup) {
      return;
    }
    window.nexaStoreGlobalFunctionsSetup = true;
  }
}
