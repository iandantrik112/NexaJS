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
import { setTags } from "./Tags/index.js";
import { setSlug } from "./Form/Slug.js";
import { setKeyup } from "./Form/Keyup.js";
import { setEditor } from "./Form/Editor.js";
import { setInsert } from "./Form/Insert.js";
import { setAction } from "./Action/index.js";


import { setNested } from "./Nested/index.js";
import { setDropdown } from "./Dropdown/index.js";
import { setHandler } from "./Handler/index.js";
import { setRestful } from "./Restful/index.js";

// import { joinStuktur } from "./Join/Stuktur.js";
 import { setforeignTable } from "./Foreign/index.js";
 import { setasfailedData } from "./Alias/index.js";
 import { SubQuery } from "./SubNested/index.js";
 import { setInterface } from "./Interface/index.js";

import { setSortable } from "./Sortable/index.js";
import { setPackage } from "./Package/index.js";
import { setAccses } from "./Accses/index.js";
import { setSearch } from "./Search/index.js";
import { setValue } from "./Search/getValue.js";
import { redOperasi } from "./Operasi/index.js";
import { setAnalysis } from "./Analysis/index.js";
import { setabelView } from "./TabelView/index.js";
import { setCreateTabel } from "./CreateTabel/index.js";
import { setMergeTabel } from "./CreateTabel/mergeTabel.js";

import { setModal } from "./Modal/index.js";
import { setTabelNav } from "./Metadata/index.js";
import { setSelect } from "./Select/index.js";
import { setFailed } from "./Failed/index.js";
import { setUpload } from "./Upload/index.js";
import { setApproval } from "./Approval/index.js";
import { setKeyPackages } from "./Upgrade/index.js";
import { setAvatar } from "./Avatar/index.js";

// Plugin
import { iniChart } from "./Chart/index.js";
import { initQuery } from "./Query/index.js";
import { iniPercent } from "./Percent/index.js";
import { setConfiguration } from "./Configuration/index.js";
import { refNavigation } from "./Navigation/index.js";
import { refSartphone } from "./Sartphone/index.js";


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
    this.init();
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
  async init() {
    try {
       
      return null;
    } catch (error) {
      console.error("❌ Failed to initialize database reference:", error);
      return null;
    }
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
            label: "Apps",
            icon: "smartphone", // Feather Icon: smartphone
            submenu: [
             {
                label: "Screen",
                key: "refScreen",
                action: "newSartphone",
                icon: "credit-card", // Feather Icon: tv
              },
              {
                label: "Component",
                key: "refComponent",
                action: "newSartphone",
                icon: "package", // Feather Icon: package
              },

              // {
              //   label: "Publication",
              //   key: "refDirectory",
              //   action: "newSartphone",
              //   icon: "globe", // Feather Icon: globe
              // },
            ],
          },
          {
            label: "Navigation",
            icon: "navigation", // Feather Icon: navigation
            submenu: [
              {
                label: "Root",
                key: "refMenu",
                action: "newNavigation",
                icon: "menu", // Feather Icon: menu
              },
                {
                label: "Children",
                key: "refChildren",
                action: "newNavigation",
                icon: "folder", // Feather Icon: folder
              },
              {
                label: "Publication",
                key: "refDirectory",
                action: "newNavigation",
                icon: "globe", // Feather Icon: folder
              },
            ],
          },
          {
            label: "Metadata",
            key: "new-tabel",
            icon: "database", // Feather Icons: archive
            submenu: NEXA.tabel.submenu,
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
    async viewSlug(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setSlug(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
    async viewKeyup(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setKeyup(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
    async viewNestedForm(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setNested(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }


    async viewDropdown(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setDropdown(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
    async viewHandler(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setHandler(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }

    async viewRestful(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setRestful(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }







    async viewEditor(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setEditor(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }

    async viewInsert(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setInsert(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }


    async viewAction(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setAction(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }





    async viewTags(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setTags(data);
        return { success: true, action: "setTags", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }


    async asfailedData(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setasfailedData(data);
        return { success: true, action: "viewForm", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }
    async setSubQuery(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await SubQuery(data);
        return { success: true, action: "SubQuery", data: result };
    } catch (error) {
      console.error("❌ Error in viewForm:", error);
      return { success: false, action: "viewForm", error: error.message };
    }
  }

    async viewInterface(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setViewForm
      if (!data || typeof data !== "object") {
        data = { id: null, store: null };
      }
        const result = await setInterface(data);
        return { success: true, action: "SubQuery", data: result };
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
    async viewAvatar(data = null) {
      try {
        // 🔧 FIX: Ensure data is valid before passing to setJoin
        if (!data || typeof data !== "object") {
          console.warn(
            "⚠️ Invalid or null data passed to settingsJoin, using default"
          );
          data = { id: null, store: null };
        }

        const result = await setAvatar(data);
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

  async newNavigation(data = 1) {
    try {
      console.log('label:', data);
      const result = await refNavigation(data);
      return { success: true, action: "newNavigation", data: result };
    } catch (error) {
      console.error("❌ Error in newNavigation:", error);
      return {
        success: false,
        action: "appConfiguration",
        error: error.message,
      };
    }
  }

  async newSartphone(data = 1) {
    try {
      console.log('label:', data);
      const result = await refSartphone(data);
      return { success: true, action: "newNavigation", data: result };
    } catch (error) {
      console.error("❌ Error in newNavigation:", error);
      return {
        success: false,
        action: "appConfiguration",
        error: error.message,
      };
    }
  }



    async foreignTable(data = null) {
    try {
      const result = await setforeignTable(data);
      return { success: true, action: "foreignTable", data: result };
    } catch (error) {
      console.error("❌ Error in setforeignTable:", error);
      return {
        success: false,
        action: "setforeignTable",
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

  async viewValue(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await setValue(data);
      return { success: true, action: "settingsJoin", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }

  async viewOperasi(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await redOperasi(data);
      return { success: true, action: "settingsJoin", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }
 async viewAnalysis(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await setAnalysis(data);
      return { success: true, action: "setAnalysis", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }
   async viewTabelView(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await setabelView(data);
      return { success: true, action: "setAnalysis", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }

 async createTabel(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await setCreateTabel(data);
      return { success: true, action: "createTabel", data: result };
    } catch (error) {
      console.error("❌ Error in settingsJoin:", error);
      return { success: false, action: "settingsJoin", error: error.message };
    }
  }
 async mergeTabel(data = null) {
    try {
      // 🔧 FIX: Ensure data is valid before passing to setJoin
      if (!data || typeof data !== "object") {
        console.warn(
          "⚠️ Invalid or null data passed to settingsJoin, using default"
        );
        data = { id: null, store: null };
      }
      const result = await setMergeTabel(data);
      return { success: true, action: "setMergeTabel", data: result };
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
