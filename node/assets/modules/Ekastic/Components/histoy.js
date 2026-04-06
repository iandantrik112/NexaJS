/**
 * Browser History Management Module
 * Provides functions to manage and clear browser history
 */

class HistoryManager {
  constructor() {
    this.history = window.history;
    this.location = window.location;
  }

  /**
   * Clear browser history by replacing current state and navigating
   * This method replaces the current history entry
   */
  clearHistory() {
    try {
      // Replace current state with a clean state
      this.history.replaceState(null, "", this.location.href);

      // Clear any stored state
      this.history.pushState(null, "", this.location.href);

      console.log("Browser history cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing browser history:", error);
      return false;
    }
  }

  /**
   * Clear all possible history and data
   * More aggressive approach to clear browser data
   */
  clearAllHistory() {
    try {
      // Clear storage first
      this.clearStorage();

      // Clear cookies (if possible)
      this.clearCookies();

      // Replace current state
      this.history.replaceState(null, "", this.location.href);

      // Try to clear history by navigating to a new state
      this.history.pushState(null, "", this.location.href);
      this.history.replaceState(null, "", this.location.href);

      // Clear any cached data
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }

      console.log("All browser history and data cleared");
      return true;
    } catch (error) {
      console.error("Error clearing all history:", error);
      return false;
    }
  }

  /**
   * Clear cookies (if possible)
   */
  clearCookies() {
    try {
      // Clear cookies by setting them to expire
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      console.log("Cookies cleared");
      return true;
    } catch (error) {
      console.error("Error clearing cookies:", error);
      return false;
    }
  }

  /**
   * Navigate to a new page and clear previous history
   * @param {string} url - The URL to navigate to
   */
  navigateAndClearHistory(url) {
    try {
      // Replace current state and navigate
      this.history.replaceState(null, "", url);
      this.location.replace(url);

      console.log(`Navigated to ${url} and cleared history`);
      return true;
    } catch (error) {
      console.error("Error navigating and clearing history:", error);
      return false;
    }
  }

  /**
   * Clear session storage and local storage
   */
  clearStorage() {
    try {
      // Clear session storage
      if (typeof Storage !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
        console.log("Storage cleared successfully");
      }
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  }

  /**
   * Reset browser state completely
   * Clears history, storage, and reloads page
   */
  resetBrowserState() {
    try {
      // Clear storage first
      this.clearStorage();

      // Clear history
      this.clearHistory();

      // Reload page to ensure clean state
      this.location.reload(true);

      console.log("Browser state reset successfully");
      return true;
    } catch (error) {
      console.error("Error resetting browser state:", error);
      return false;
    }
  }

  /**
   * Clear NexaUI specific data and instances
   * Clears data from init.js and NexaTree.js
   */
  clearNexaUIData() {
    try {
      // Clear NexaTree localStorage data
      localStorage.removeItem("nexaTree_expandedItems");
      localStorage.removeItem("nexaTree_activeMenu");

      // Clear NexaUI related localStorage keys
      const nexaKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("nexa") || key.includes("tree") || key.includes("menu"))
        ) {
          nexaKeys.push(key);
        }
      }
      nexaKeys.forEach((key) => localStorage.removeItem(key));

      // Clear global window references
      if (window.nexaTreeInstance) {
        window.nexaTreeInstance = null;
      }
      if (window.nexaStoreInstance) {
        window.nexaStoreInstance = null;
      }
      if (window.nexaStoreMenuRefreshCallback) {
        window.nexaStoreMenuRefreshCallback = null;
      }
      if (window.nexaStoreConnectionManager) {
        window.nexaStoreConnectionManager = null;
      }
      if (window.clearActiveMenuAfterModalSave) {
        window.clearActiveMenuAfterModalSave = null;
      }

      // Clear static properties if accessible
      if (window.TreeMenu && window.TreeMenu._activeInstance) {
        window.TreeMenu._activeInstance = null;
      }

      // Clear any event listeners
      if (window.nexaTreeActionListeners) {
        window.nexaTreeActionListeners.forEach((listener) => {
          document.removeEventListener("nexaTreeAction", listener);
        });
        window.nexaTreeActionListeners = [];
      }

      console.log("NexaUI data cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing NexaUI data:", error);
      return false;
    }
  }

  /**
   * Complete cleanup: Browser history + NexaUI data
   * This is the main function to use for clearing old data
   */
  clearAllNexaUIData() {
    try {
      // Clear NexaUI specific data first
      this.clearNexaUIData();

      // Clear browser storage
      this.clearStorage();

      // Clear browser history
      this.clearHistory();

      // Clear cookies
      this.clearCookies();

      // Clear cached data
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }

      console.log("All NexaUI data and browser history cleared");
      return true;
    } catch (error) {
      console.error("Error clearing all NexaUI data:", error);
      return false;
    }
  }

  /**
   * Get current history length
   * @returns {number} Number of history entries
   */
  getHistoryLength() {
    return this.history.length;
  }

  /**
   * Go back in history
   * @param {number} steps - Number of steps to go back (default: 1)
   */
  goBack(steps = 1) {
    try {
      this.history.go(-steps);
      console.log(`Went back ${steps} step(s) in history`);
      return true;
    } catch (error) {
      console.error("Error going back in history:", error);
      return false;
    }
  }

  /**
   * Go forward in history
   * @param {number} steps - Number of steps to go forward (default: 1)
   */
  goForward(steps = 1) {
    try {
      this.history.go(steps);
      console.log(`Went forward ${steps} step(s) in history`);
      return true;
    } catch (error) {
      console.error("Error going forward in history:", error);
      return false;
    }
  }
}

// Create global instance
const historyManager = new HistoryManager();

// Export functions for easy use
const clearBrowserHistory = () => historyManager.clearHistory();
const clearAllHistory = () => historyManager.clearAllHistory();
const clearCookies = () => historyManager.clearCookies();
const navigateAndClear = (url) => historyManager.navigateAndClearHistory(url);
const clearStorage = () => historyManager.clearStorage();
const resetBrowser = () => historyManager.resetBrowserState();
const goBack = (steps) => historyManager.goBack(steps);
const goForward = (steps) => historyManager.goForward(steps);
const getHistoryLength = () => historyManager.getHistoryLength();
const clearNexaUIData = () => historyManager.clearNexaUIData();
const clearAllNexaUIData = () => historyManager.clearAllNexaUIData();

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    HistoryManager,
    historyManager,
    clearBrowserHistory,
    clearAllHistory,
    clearCookies,
    navigateAndClear,
    clearStorage,
    resetBrowser,
    goBack,
    goForward,
    getHistoryLength,
    clearNexaUIData,
    clearAllNexaUIData,
  };
}

// Make functions available globally
window.historyManager = historyManager;
window.clearBrowserHistory = clearBrowserHistory;
window.clearAllHistory = clearAllHistory;
window.clearCookies = clearCookies;
window.navigateAndClear = navigateAndClear;
window.clearStorage = clearStorage;
window.resetBrowser = resetBrowser;
window.goBack = goBack;
window.goForward = goForward;
window.getHistoryLength = getHistoryLength;
window.clearNexaUIData = clearNexaUIData;
window.clearAllNexaUIData = clearAllNexaUIData;
