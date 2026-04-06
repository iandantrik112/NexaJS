/**
 * NexaStore System Initialization Module
 *
 * 🎯 FUNGSI UTAMA:
 * - Setup connection antara TreeMenu dan NexaStore
 * - Manajemen auto-refresh UI
 * - Event handling dan callback management
 * - Instance tracking dan cleanup
 *
 * 📋 CARA PENGGUNAAN:
 * import { NexaStoreConnectionManager } from "./System/init.js";
 *
 * // Setup connection
 * const connectionManager = new NexaStoreConnectionManager();
 * connectionManager.setupConnection(treeMenuInstance, nexaStoreInstance);
 *
 * // Cleanup when needed
 * connectionManager.cleanup();
 */

export class NexaStoreConnectionManager {
  constructor() {
    this.isConnected = false;
    this.activeTreeInstance = null;
    this.activeStoreInstance = null;
    this.eventListeners = [];
  }

  /**
   * Setup connection antara TreeMenu dan NexaStore
   * @param {TreeMenu} treeMenuInstance - Instance TreeMenu
   * @param {NexaStore} nexaStoreInstance - Instance NexaStore
   */
  setupConnection(treeMenuInstance, nexaStoreInstance) {
    // Smart connection management: Preserve existing connection if compatible
    if (this.isConnected) {
      // Check if we can reuse existing connection
      if (
        this.activeTreeInstance === treeMenuInstance &&
        this.activeStoreInstance === nexaStoreInstance
      ) {
        // console.log("🔄 Reusing existing compatible connection");
        return this;
      }

      // Only cleanup if instances are different
      // console.log("🔄 Updating connection with new instances");
      this.preserveConnection();
    }

    this.activeTreeInstance = treeMenuInstance;
    this.activeStoreInstance = nexaStoreInstance;

    // Setup auto-refresh callback
    this.setupAutoRefreshCallback();

    // Setup event listeners
    this.setupEventListeners();

    // Track instances globally
    this.trackInstancesGlobally();

    this.isConnected = true;

    return this;
  }

  /**
   * Setup auto-refresh callback untuk UI updates
   */
  setupAutoRefreshCallback() {
    const self = this;

    window.nexaStoreMenuRefreshCallback = (newMenuStructure) => {
      // console.log(`🔄 MENU REFRESH: Menu structure update triggered`);

      try {
        // 🚫 PREVENT AUTO-RESTORE: Mark this as a refresh operation
        let targetInstance = null;

        // Priority 1: Use tracked active instance
        if (self.activeTreeInstance && self.activeTreeInstance.container) {
          targetInstance = self.activeTreeInstance;
        }
        // Priority 2: Use global window reference
        else if (window.nexaTreeInstance && window.nexaTreeInstance.container) {
          targetInstance = window.nexaTreeInstance;
        }

        if (targetInstance) {
          // 🔧 DISABLE AUTO-RESTORE: Set flag before render to prevent restore
          targetInstance._skipNextAutoRestore = true;
        
          targetInstance.render(
            self.extractMenuData(newMenuStructure),
            self.activeStoreInstance
          );
          return;
        }

        // Priority 3: Find by common container IDs
        const refreshed = self.refreshByContainerSearch(newMenuStructure);
        if (!refreshed) {
          self.dispatchRefreshFailedEvent(newMenuStructure);
        }
      } catch (error) {
        self.dispatchRefreshErrorEvent(error, newMenuStructure);
      }
    };
  }

  /**
   * Remove existing event listeners to prevent duplicates
   */
  removeExistingListeners() {
    // Remove our tracked listeners
    this.eventListeners.forEach(({ type, listener }) => {
      document.removeEventListener(type, listener);
    });
    this.eventListeners = [];

    // Clear any existing nexaTreeAction listeners globally
    if (window.nexaTreeActionListeners) {
      window.nexaTreeActionListeners.forEach((listener) => {
        document.removeEventListener("nexaTreeAction", listener);
      });
      window.nexaTreeActionListeners = [];
    }
  }

  /**
   * Setup event listeners untuk nexaTreeAction
   */
  setupEventListeners() {
    const self = this;

    // 🔧 PREVENT DUPLICATE LISTENERS: Remove existing listeners first
    self.removeExistingListeners();

    // Create nexaTreeAction listener
    const nexaTreeActionListener = async (event) => {
      const { action, itemData, itemId } = event.detail;

      try {
        // Forward ke NexaStore instance
        if (
          self.activeStoreInstance &&
          typeof self.activeStoreInstance[action] === "function"
        ) {
          const result = await self.activeStoreInstance[action](itemData);

          // Dispatch success event
          self.dispatchActionCompletedEvent(action, itemData, result);
        } else {
          console.warn(`❌ Method ${action} not found or not function`);
          self.dispatchActionErrorEvent(action, itemData, "Action not found");
        }
      } catch (error) {
        console.error(`❌ Error in ${action}:`, error);
        self.dispatchActionErrorEvent(action, itemData, error.message);
      }
    };

    // Add event listener
    document.addEventListener("nexaTreeAction", nexaTreeActionListener);

    // Track listener for cleanup
    this.eventListeners.push({
      type: "nexaTreeAction",
      listener: nexaTreeActionListener,
    });

    // Track globally to prevent other components from adding duplicates
    if (!window.nexaTreeActionListeners) {
      window.nexaTreeActionListeners = [];
    }
    window.nexaTreeActionListeners.push(nexaTreeActionListener);
  }

  /**
   * Track instances globally untuk fallback access
   */
  trackInstancesGlobally() {
    // Track TreeMenu instance
    if (this.activeTreeInstance) {
      window.nexaTreeInstance = this.activeTreeInstance;

      // Set as active instance in TreeMenu class if method exists
      if (
        typeof this.activeTreeInstance.constructor.setActiveInstance ===
        "function"
      ) {
        this.activeTreeInstance.constructor.setActiveInstance(
          this.activeTreeInstance
        );
      }
    }

    // Track NexaStore instance
    if (this.activeStoreInstance) {
      window.nexaStoreInstance = this.activeStoreInstance;
    }
  }

  /**
   * Extract menu data dari structure (handle array atau object)
   */
  extractMenuData(menuStructure) {
    if (Array.isArray(menuStructure)) {
      return menuStructure[0] || menuStructure;
    }
    return menuStructure;
  }

  /**
   * Cari dan refresh berdasarkan container IDs yang umum
   */
  refreshByContainerSearch(newMenuStructure) {
    const commonContainers = [
      "nx-tree-menu-content",
      "nexaTreeContainer",
      "treeMenuContainer",
      "menuContainer",
      "treeContainer",
    ];

    for (const containerId of commonContainers) {
      const container = document.getElementById(containerId);
      if (container) {
        try {
          // Import TreeMenu class dynamically
          import("../NexaTree.js").then(({ TreeMenu }) => {
            const tempInstance = new TreeMenu(containerId);
            tempInstance.render(
              this.extractMenuData(newMenuStructure),
              this.activeStoreInstance
            );
          });
          return true;
        } catch (error) {
          // Silent error handling
        }
      }
    }
    return false;
  }

  /**
   * Dispatch custom events untuk monitoring
   */
  dispatchRefreshFailedEvent(menuStructure) {
    document.dispatchEvent(
      new CustomEvent("nexaStoreRefreshFailed", {
        detail: { menuStructure, reason: "No suitable container found" },
      })
    );
  }

  dispatchRefreshErrorEvent(error, menuStructure) {
    document.dispatchEvent(
      new CustomEvent("nexaStoreRefreshError", {
        detail: { error, menuStructure },
      })
    );
  }

  dispatchActionCompletedEvent(action, itemData, result) {
    document.dispatchEvent(
      new CustomEvent("nexaStoreActionCompleted", {
        detail: { action, itemData, result },
      })
    );
  }

  dispatchActionErrorEvent(action, itemData, error) {
    document.dispatchEvent(
      new CustomEvent("nexaStoreActionError", {
        detail: { action, itemData, error },
      })
    );
  }

  /**
   * Cleanup semua connections dan listeners
   */
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach(({ type, listener }) => {
      document.removeEventListener(type, listener);
    });
    this.eventListeners = [];

    // Clear callbacks
    window.nexaStoreMenuRefreshCallback = null;

    // Clear tracked instances
    this.activeTreeInstance = null;
    this.activeStoreInstance = null;

    // Clear global references (optional)
    if (window.nexaTreeInstance === this.activeTreeInstance) {
      window.nexaTreeInstance = null;
    }

    this.isConnected = false;
  }

  /**
   * Preserve connection dengan smart cleanup
   */
  preserveConnection() {
    console.log("🔄 Preserving connection with smart cleanup");

    // Remove only our tracked listeners, preserve others
    this.eventListeners.forEach(({ type, listener }) => {
      document.removeEventListener(type, listener);
    });
    this.eventListeners = [];

    // Preserve callback but update it
    if (window.nexaStoreMenuRefreshCallback) {
      console.log("⏭️ Preserving existing refresh callback");
    }

    // Preserve global references if they're still valid
    if (window.nexaTreeInstance && window.nexaTreeInstance.container) {
      console.log("⏭️ Preserving global tree instance");
    }

    if (window.nexaStoreInstance) {
      console.log("⏭️ Preserving global store instance");
    }

    // Mark as disconnected temporarily for reconnection
    this.isConnected = false;
  }

  /**
   * Check connection status
   */
  isConnectionActive() {
    return (
      this.isConnected && this.activeTreeInstance && this.activeStoreInstance
    );
  }

  /**
   * Get connection info untuk debugging
   */
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      hasTreeInstance: !!this.activeTreeInstance,
      hasStoreInstance: !!this.activeStoreInstance,
      eventListenerCount: this.eventListeners.length,
      hasRefreshCallback: !!window.nexaStoreMenuRefreshCallback,
    };
  }
}

// Utility functions untuk backwards compatibility
export function setupNexaStoreConnection(treeMenuInstance, nexaStoreInstance) {
  const manager = new NexaStoreConnectionManager();
  return manager.setupConnection(treeMenuInstance, nexaStoreInstance);
}

// Export default manager instance untuk global usage
export const nexaStoreConnectionManager = new NexaStoreConnectionManager();

// Browser global assignment
if (typeof window !== "undefined") {
  window.NexaStoreConnectionManager = NexaStoreConnectionManager;
  window.nexaStoreConnectionManager = nexaStoreConnectionManager;
  window.setupNexaStoreConnection = setupNexaStoreConnection;
}
