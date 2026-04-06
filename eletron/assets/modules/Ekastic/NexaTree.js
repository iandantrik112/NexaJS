export class TreeMenu {
  constructor(containerId, instance) {
    this.nexaUI = NexaUI();
    this.container = document.getElementById(containerId);
    this.storageKey = "nexaTree_expandedItems";
    this.activeMenuKey = "nexaTree_activeMenu";
    this.instance = instance;
    this.expandedItems = this.loadExpandedItems();
    this.activeMenuData = this.loadActiveMenu();

    // Content state tracking
    this.contentState = {
      lastAction: null,
      lastContent: null,
      lastUpdateTime: 0,
      isUpdating: false,
    };

    // Make this instance globally accessible for onclick handlers
    window.nexaTreeInstance = this;

    // Expose method untuk dipanggil dari modal save handlers
    window.clearActiveMenuAfterModalSave = (action) => {
      this.clearActiveMenuAfterModalSave(action);
    };

    // Track instance untuk callback refresh
    TreeMenu.setActiveInstance(this);
  }

  // Helper untuk tracking action (klik & restore)
  logAction(action, type = "CLICK", itemData = null) {
    // Logging disabled for production
  }

  // Helper untuk check action yang tidak perlu disimpan (modal types)
  isModalAction(action) {
    const modalActions = ["logout", "deleteTable", "editTable", "infoTable"];

    // Check exact matches first
    if (modalActions.includes(action)) {
      return true;
    }

    // ONLY settingsForm opens modal, other settings show content
    // settingsJoin, settingsTable, etc return HTML content
    const settingsModalActions = ["settingsForm"];
    if (settingsModalActions.includes(action)) {
      return true;
    }

    return false;
  }

  // Helper untuk check action yang memerlukan content display
  isContentAction(action) {
    const contentActions = [
      "appConfiguration",
      "settingsJoin",
      "settingsTable",
      "viewTable",
      "viewForm",
      "viewJoin",
      "viewChart",
      "viewCount",
      "viewSearch",
    ];

    return contentActions.includes(action);
  }

  // Helper untuk menampilkan konten dinamis dari NexaStore di report-container
  async showContentActionInfo(itemData, priority = "normal") {
    const reportContainer = document.getElementById("report-container");
    if (!reportContainer) return;

    // Action queue: Ensure sequential execution
    return new Promise((resolve, reject) => {
      const executeAction = async () => {
        await this._executeContentAction(itemData, priority, reportContainer);
        resolve();
      };

      // Priority queue: User actions get priority over restore
      if (!this._actionQueue) {
        this._actionQueue = [];
      }

      // Smart queue management: Pause restore actions instead of deleting
      if (priority === "normal") {
        this._actionQueue.forEach((action) => {
          if (action._isRestore) {
            action._paused = true; // Pause instead of delete
          }
        });
      }

      executeAction._isRestore = priority === "restore";
      executeAction._actionName = itemData.action;
      executeAction._priority = priority;

      if (priority === "normal") {
        // User actions go to front
        this._actionQueue.unshift(executeAction);
      } else {
        // Restore actions go to back
        this._actionQueue.push(executeAction);
      }

      this._processActionQueue();
    });
  }

  // Process action queue sequentially with smart management
  async _processActionQueue() {
    if (this._processingQueue) {
      return;
    }

    this._processingQueue = true;

    while (this._actionQueue.length > 0) {
      const action = this._actionQueue.shift();

      // Skip paused restore actions
      if (action._paused && action._isRestore) {
        continue;
      }

      try {
        await action();
      } catch (error) {
        console.error(`Error in action queue:`, error);
      }
    }

    this._processingQueue = false;
  }

  // Actual content action execution
  async _executeContentAction(itemData, priority, reportContainer) {
    // Guard: Only block content for true modal actions
    if (this.isModalAction(itemData.action)) {
      this.clearContentUI("blocked modal action content");
      return;
    }

    // Ensure content actions are properly handled
    if (!this.isContentAction(itemData.action)) {
      // Action not recognized as content action
    }

    // Priority system: Prevent restore content from overriding fresh user clicks
    const now = Date.now();
    if (this._lastContentAction && priority === "restore") {
      const timeDiff = now - this._lastContentAction.timestamp;
      if (timeDiff < 1000) {
        // Reduced to 1 second for better responsiveness
        return;
      }
    }

    // Anti-duplicate: Prevent same action from running too frequently (only for same priority)
    // Skip this check for appConfiguration to allow immediate execution
    if (
      itemData.action !== "appConfiguration" &&
      this._lastContentAction &&
      this._lastContentAction.action === itemData.action &&
      this._lastContentAction.priority === priority &&
      now - this._lastContentAction.timestamp < 500
    ) {
      return;
    }

    // Set protection layers (only for non-appConfiguration actions)
    if (itemData.action !== "appConfiguration") {
      this._contentActionInProgress = true;
      this._currentActiveAction = itemData.action;
    }

    // Track content action for priority system
    this._lastContentAction = {
      action: itemData.action,
      timestamp: now,
      priority: priority,
    };

    // Debounce protection: Set timer to prevent rapid calls (reduced delay)
    // Skip debounce for appConfiguration to allow immediate execution
    if (itemData.action !== "appConfiguration") {
      this._debounceTimer = setTimeout(() => {
        this._debounceTimer = null;
      }, 200);
    }

    try {
      // Clear any existing table state before switching
      // this.clearExistingTableState();

      // Coba dapatkan konten dari NexaStore jika tersedia
      if (
        this.instance &&
        typeof this.instance[itemData.action] === "function"
      ) {
        const result = await this.instance[itemData.action](itemData);

        if (result && result.success && result.data) {
          // Jika result.data adalah HTML string, update dengan smart merging
          if (typeof result.data === "string" && result.data.includes("<")) {
            // Check if content is different before replacing
            const currentContent = reportContainer.innerHTML;
            if (currentContent !== result.data) {
              this.updateContentUI(
                result.data,
                `content action: ${itemData.action}`
              );
            }
            // Clear all protection layers
            this._contentActionInProgress = false;
            this._currentActiveAction = null;
            if (this._debounceTimer) {
              clearTimeout(this._debounceTimer);
              this._debounceTimer = null;
            }
            return;
          }

          // Jika result.data adalah object, preserve UI karena bukan HTML content
          if (typeof result.data === "object") {
            // Clear all protection layers
            this._contentActionInProgress = false;
            this._currentActiveAction = null;
            if (this._debounceTimer) {
              clearTimeout(this._debounceTimer);
              this._debounceTimer = null;
            }
            return;
          }
        }
      }

      // Fallback: preserve UI jika tidak ada konten dinamis
    } catch (error) {
      console.warn(
        `Error getting dynamic content for ${itemData.action}:`,
        error
      );
      // Fallback: preserve UI jika error
    } finally {
      // Always clear all protection layers when done
      this._contentActionInProgress = false;
      this._currentActiveAction = null;
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = null;
      }
    }
  }

  // Helper untuk membersihkan report container (simple version)
  clearContentUI(reason = "modal action") {
    const reportContainer = document.getElementById("report-container");
    if (reportContainer) {
      reportContainer.innerHTML = "";
    }
  }

  // Helper untuk update konten dengan preservasi data yang ada dan state tracking
  updateContentUI(newContent, reason = "content update") {
    const reportContainer = document.getElementById("report-container");
    if (!reportContainer) return;

    // Prevent concurrent updates
    if (this.contentState.isUpdating) {
      return;
    }

    this.contentState.isUpdating = true;
    const now = Date.now();

    try {
      // Preserve existing content jika ada
      const existingContent = reportContainer.innerHTML;

      // Check if this is a duplicate update (same content, recent time)
      if (
        this.contentState.lastContent === newContent &&
        now - this.contentState.lastUpdateTime < 1000
      ) {
        return;
      }

      // Hanya update jika konten baru berbeda dan tidak kosong
      if (
        newContent &&
        newContent !== existingContent &&
        newContent.trim() !== ""
      ) {
        // Check jika konten baru adalah HTML yang valid
        if (typeof newContent === "string" && newContent.includes("<")) {
          reportContainer.innerHTML = newContent;

          // Update content state
          this.contentState.lastAction = reason;
          this.contentState.lastContent = newContent;
          this.contentState.lastUpdateTime = now;
        }
      } else if (!newContent || newContent.trim() === "") {
        // Hanya clear jika memang diperlukan (modal actions)
        if (reason.includes("modal") || reason.includes("clear")) {
          reportContainer.innerHTML = "";

          // Update content state
          this.contentState.lastAction = reason;
          this.contentState.lastContent = "";
          this.contentState.lastUpdateTime = now;
        }
      }
    } finally {
      this.contentState.isUpdating = false;
    }
  }

  loadExpandedItems() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.warn("Error loading expanded items from localStorage:", error);
      return new Set();
    }
  }

  saveExpandedItems() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify([...this.expandedItems])
      );
    } catch (error) {
      console.warn("Error saving expanded items to localStorage:", error);
    }
  }

  loadActiveMenu() {
    try {
      const stored = localStorage.getItem(this.activeMenuKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Error loading active menu from localStorage:", error);
      return null;
    }
  }

  saveActiveMenu(itemData, itemId) {
    try {
      const activeMenuState = {
        itemData: itemData,
        itemId: itemId,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.activeMenuKey, JSON.stringify(activeMenuState));
    } catch (error) {
      console.warn("Error saving active menu to localStorage:", error);
    }
  }

  clearExpandedItems() {
    try {
      localStorage.removeItem(this.storageKey);
      this.expandedItems.clear();
    } catch (error) {
      console.warn("Error clearing expanded items from localStorage:", error);
    }
  }

  clearActiveMenu() {
    try {
      localStorage.removeItem(this.activeMenuKey);
      this.activeMenuData = null;
    } catch (error) {
      console.warn("Error clearing active menu from localStorage:", error);
    }
  }

  /**
   * Manual restore trigger for explicit cases
   */
  manualRestore() {
    this.restoreActiveMenu();
  }

  /**
   * Clear active menu state after modal action completion
   * This prevents old viewTable content from showing after settings save
   */
  clearActiveMenuAfterModalSave(action) {
    if (action && action.startsWith("settings")) {
      this.clearActiveMenu();

      // Complete state reset: Clear all tracking, locks, and queue
      this._lastContentAction = null;
      this._contentActionInProgress = false;
      this._currentActiveAction = null;
      this._lastClickTime = null;
      this._lastClickTarget = null;
      this._actionQueue = [];
      this._processingQueue = false;
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = null;
      }

      // Also remove active UI state
      document
        .querySelectorAll(".nx-tree-label.nx-tree-active")
        .forEach((el) => el.classList.remove("nx-tree-active"));

      // Clear any existing content
      this.clearContentUI("modal save completed");
    }
  }

  async restoreActiveMenu() {
    // Prevent double restore: Check if restore is already in progress
    if (this._isRestoring) {
      return;
    }

    if (!this.activeMenuData || !this.activeMenuData.itemData) {
      return;
    }

    this._isRestoring = true; // Set flag

    try {
      const { itemData, itemId } = this.activeMenuData;
      this.logAction(itemData.action, "RESTORE", itemData);

      // Find the menu element by data attributes
      const menuElement = this.container.querySelector(
        `[data-key="${itemData.key}"][data-action="${itemData.action}"]`
      );

      if (menuElement) {
        // Add active class (ONLY UI restoration)
        document
          .querySelectorAll(".nx-tree-label.nx-tree-active")
          .forEach((el) => el.classList.remove("nx-tree-active"));
        menuElement.classList.add("nx-tree-active");

        // Restore konten UI untuk non-modal actions
        if (!this.isModalAction(itemData.action)) {
          await this.showContentActionInfo(itemData, "restore");
        } else {
          // For modal actions, clear UI instead of showing old content
          this.clearContentUI("modal restore");
        }

        // Dispatch event untuk connection layer jika ada yang listen
        const restoreEvent = new CustomEvent("nexaTreeRestore", {
          detail: {
            action: itemData.action,
            itemData: itemData,
            itemId: itemId,
            restored: true,
          },
        });
        document.dispatchEvent(restoreEvent);
      }
    } catch (error) {
      console.error("Error restoring active menu:", error);
    } finally {
      // Always reset flag even if error occurs
      this._isRestoring = false;
    }
  }

  generateIcon(iconName) {
    // NexaTree hanya menerima dan menampilkan icon yang sudah siap dari NexaStore
    const featherIcon = iconName || "help"; // fallback default

    return `<i class="nx-tree-item-icon" data-feather="${featherIcon}"></i>`;
  }

  // Utility function to truncate text
  truncateText(text, maxLength = 30) {
    if (!text || typeof text !== "string") return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  getExpandIconClass(hasChildren, isExpanded) {
    if (!hasChildren) return "nx-tree-no-children";
    return isExpanded ? "nx-tree-expanded" : "";
  }

  generateTreeItem(item, level = 0) {
    const hasChildren = item.submenu && item.submenu.length > 0;

    // Consistent key processing untuk state management
    const rawKey = item.key || item.label;
    const processedKey = rawKey.toString().replace(/\s+/g, "-");
    const itemId = `tree-item-${processedKey}`;

    // Gunakan processed key yang sama untuk check state
    const isExpanded = this.expandedItems.has(processedKey);

    let html = `
        <li class="nx-tree-item" data-level="${level}">
          <div class="nx-tree-label" data-key="${
            item.key || ""
          }" data-action="${item.action || ""}" data-item='${JSON.stringify(
      item
    ).replace(
      /'/g,
      "&apos;"
    )}' onclick="window.nexaTreeInstance.handleItemClickWrapper(event, '${itemId}', ${hasChildren})" data-processed-key="${processedKey}">
            <span class="nx-tree-expand-icon ${this.getExpandIconClass(
              hasChildren,
              isExpanded
            )}">
              ${hasChildren ? '<i data-feather="chevron-right"></i>' : ""}
            </span>
            ${this.generateIcon(item.icon || "file-text")}
            <span class="nx-tree-item-label" title="${
              item.label
            }">${this.truncateText(item.label, 30)}</span>
          </div>`;

    if (hasChildren) {
      html += `<ul class="nx-tree-submenu ${
        isExpanded ? "nx-tree-expanded" : ""
      }" id="${itemId}-submenu">`;
      item.submenu.forEach((subItem) => {
        html += this.generateTreeItem(subItem, level + 1);
      });
      html += "</ul>";
    }

    html += "</li>";
    return html;
  }

  // Wrapper for onclick handler to handle async function
  handleItemClickWrapper(event, itemId, hasChildren) {
    // Convert parameter to boolean (handle both string and boolean input)
    let hasChildrenBool;
    if (typeof hasChildren === "string") {
      hasChildrenBool = hasChildren === "true";
    } else {
      hasChildrenBool = Boolean(hasChildren);
    }

    this.handleItemClick(event, itemId, hasChildrenBool).catch((error) => {
      console.error("Error in handleItemClick:", error);
    });
  }

  async handleItemClick(event, itemId, hasChildren) {
    event.stopPropagation();

    // Click debouncing: Prevent rapid clicks on same element (reduced delay)
    const clickTarget = event.currentTarget;
    const now = Date.now();

    // Get action from data attributes to check if it's appConfiguration
    const action = event.currentTarget.dataset.action;

    if (
      this._lastClickTime &&
      this._lastClickTarget === clickTarget &&
      action !== "appConfiguration"
    ) {
      const timeDiff = now - this._lastClickTime;
      if (timeDiff < 150) {
        // 150ms debounce (reduced from 300ms) - skip for appConfiguration
        return;
      }
    }

    this._lastClickTime = now;
    this._lastClickTarget = clickTarget;

    const label = event.currentTarget;
    const expandIcon = label.querySelector(".nx-tree-expand-icon");
    const submenu = document.getElementById(`${itemId}-submenu`);

    const processedKeyFromData = label.getAttribute("data-processed-key");
    const keyFromData = label.getAttribute("data-key");

    // Handle action FIRST to preserve expand/collapse
    const key = label.dataset.key;

    // Handle expand/collapse
    if (hasChildren) {
      // Deteksi expand click yang sangat spesifik
      const clickedElement = event.target;

      // Check jika click tepat pada expand icon atau chevron
      const isChevronClick =
        clickedElement.hasAttribute("data-feather") &&
        clickedElement.getAttribute("data-feather") === "chevron-right";

      const isExpandIconContainerClick = clickedElement.classList.contains(
        "nx-tree-expand-icon"
      );

      const isInsideExpandIcon =
        clickedElement.closest(".nx-tree-expand-icon") &&
        !clickedElement.classList.contains("nx-tree-item-label") &&
        !clickedElement.classList.contains("nx-tree-item-icon");

      // Allow expand untuk menu induk yang tidak punya action
      const hasAction = !!label.dataset.action;
      const shouldExpandCollapse =
        isChevronClick ||
        isExpandIconContainerClick ||
        isInsideExpandIcon ||
        !hasAction;

      // Extract processed key consistently
      const processedKey =
        processedKeyFromData || itemId.replace("tree-item-", "");
      const isExpanded = expandIcon.classList.contains("nx-tree-expanded");

      // Only handle expand/collapse untuk expand icon click saja
      if (shouldExpandCollapse) {
        if (isExpanded) {
          // Collapse
          expandIcon.classList.remove("nx-tree-expanded");
          if (submenu) {
            submenu.classList.remove("nx-tree-expanded");
          }
          this.expandedItems.delete(processedKey);
        } else {
          // Expand
          expandIcon.classList.add("nx-tree-expanded");
          if (submenu) {
            submenu.classList.add("nx-tree-expanded");
          }
          this.expandedItems.add(processedKey);
        }
        // Save to localStorage after state change
        this.saveExpandedItems();
      }
    }

    if (action) {
      // Get complete item data from data-item attribute
      let itemData = {};
      try {
        const itemJson = label.dataset.item;
        if (itemJson) {
          itemData = JSON.parse(itemJson.replace(/&apos;/g, "'"));
        }
      } catch (error) {
        console.warn("Error parsing item data:", error);
        // Fallback to basic data
        itemData = {
          key: key,
          action: action,
          label: label.querySelector(".nx-tree-item-label").textContent,
        };
      }

      // Add active state first
      document
        .querySelectorAll(".nx-tree-label.nx-tree-active")
        .forEach((el) => el.classList.remove("nx-tree-active"));
      label.classList.add("nx-tree-active");

      // Save active menu state for restoration after page refresh
      if (action && itemData) {
        this.logAction(action, "CLICK", itemData);

        // Handle saving and content display for different action types
        if (this.isModalAction(action)) {
          // Modal actions: Always clear content and dispatch event
          this.saveActiveMenu(itemData, itemId);
          this.clearContentUI("modal action clicked");
        } else {
          // Content actions: Save state and show content
          this.saveActiveMenu(itemData, itemId);

          // Ensure completion: Wait for content action to fully complete
          try {
            await this.showContentActionInfo(itemData, "normal");
          } catch (error) {
            console.error(`Content action ${action} failed:`, error);
          }
        }
      }

      // Skip dispatching nexaTreeAction for non-modal actions
      // Modal actions membutuhkan event dispatch, content actions sudah dihandle langsung
      if (this.isModalAction(action)) {
        const actionEvent = new CustomEvent("nexaTreeAction", {
          detail: {
            action: action,
            itemData: itemData,
            itemId: itemId,
          },
        });
        document.dispatchEvent(actionEvent);
      }

      // Return default result - actual processing akan dilakukan oleh Connection Manager
      return {
        success: true,
        action: action,
        itemData: itemData,
        message: `Action "${action}" dispatched to Connection Manager`,
      };
    }

    // Return default untuk items tanpa action
    return {
      success: true,
      expanded: hasChildren,
      itemId: itemId,
      message: hasChildren ? "Menu expanded/collapsed" : "Menu item clicked",
    };
  }

  render(data, instance = null) {
    // Update instance if provided
    if (instance) {
      this.instance = instance;
    }

    if (!data || !data.submenu) {
      this.container.innerHTML =
        '<div class="nx-tree-loading">No menu data available</div>';
      return;
    }

    let html = '<ul class="nx-tree-menu">';
    data.submenu.forEach((item) => {
      html += this.generateTreeItem(item);
    });
    html += "</ul>";

    this.container.innerHTML = html;

    // Initialize feather icons with proper timing
    setTimeout(() => {
      if (typeof feather !== "undefined") {
        feather.replace();
      }
    }, 50);

    // Conditional auto-restore: Smart restore logic
    if (this._skipNextAutoRestore) {
      this._skipNextAutoRestore = false; // Reset flag
      return;
    }

    // Only restore on first load and no recent user activity
    if (!this._hasRestoredOnce && !this._lastContentAction) {
      setTimeout(() => {
        this.restoreActiveMenu();
        this._hasRestoredOnce = true;
      }, 100);
    }
  }

  // Helper method to add action listener
  onAction(callback) {
    document.addEventListener("nexaTreeAction", (event) => {
      callback(event.detail);
    });
  }

  // Helper method untuk setup connection ke NexaStore
  static setupNexaStoreConnection(nexaStoreInstance) {
    // Setup callback untuk UI refresh setelah data berubah
    window.nexaStoreMenuRefreshCallback = (newMenuStructure) => {
      // Cari TreeMenu instance yang aktif
      const activeTreeMenuInstance = TreeMenu.getActiveInstance();
      if (activeTreeMenuInstance && activeTreeMenuInstance.container) {
        activeTreeMenuInstance.render(newMenuStructure);
        return;
      }

      // Fallback 1: Gunakan window.nexaTreeInstance jika ada
      if (window.nexaTreeInstance && window.nexaTreeInstance.container) {
        window.nexaTreeInstance.render(newMenuStructure);
        return;
      }

      // Fallback 2: cari berdasarkan container yang umum digunakan

      const commonContainers = [
        "nexaTreeContainer",
        "treeMenuContainer",
        "menuContainer",
        "treeContainer",
      ];

      for (const containerId of commonContainers) {
        const container = document.getElementById(containerId);
        if (container) {
          try {
            const tempInstance = new TreeMenu(containerId);
            tempInstance.render(newMenuStructure);

            return;
          } catch (error) {
            console.warn(`Failed to refresh container ${containerId}:`, error);
          }
        }
      }

      document.dispatchEvent(
        new CustomEvent("nexaTreeMenuRefreshFailed", {
          detail: { newMenuStructure, reason: "No suitable container found" },
        })
      );
    };

    // Event handling is now centralized in init.js Connection Manager
  }

  // Helper method untuk disconnect dari NexaStore
  static disconnectFromNexaStore() {
    // Remove event listeners
    const existingListeners = document.querySelectorAll(
      "[data-nexatree-listener]"
    );
    existingListeners.forEach((listener) => {
      document.removeEventListener("nexaTreeAction", listener);
    });

    // Clear callback
    window.nexaStoreMenuRefreshCallback = null;
  }

  // Static methods untuk mengelola instance aktif (untuk callback refresh)
  static setActiveInstance(instance) {
    TreeMenu._activeInstance = instance;
  }

  static getActiveInstance() {
    return TreeMenu._activeInstance || null;
  }

  static clearActiveInstance() {
    TreeMenu._activeInstance = null;
  }

  // Helper method to remove action listener
  offAction(callback) {
    document.removeEventListener("nexaTreeAction", callback);
  }

  // Helper method to get current instance
  getInstance() {
    return this.instance;
  }

  // Helper method to set instance
  setInstance(instance) {
    this.instance = instance;
  }

  // Helper method to clear all saved state (useful for debugging)
  clearAllSavedState() {
    this.clearExpandedItems();
    this.clearActiveMenu();
  }

  // Helper method to get content state info
  getContentState() {
    return {
      ...this.contentState,
      isUpdating: this.contentState.isUpdating,
      timeSinceLastUpdate: Date.now() - this.contentState.lastUpdateTime,
    };
  }

  // Helper method to reset content state
  resetContentState() {
    this.contentState = {
      lastAction: null,
      lastContent: null,
      lastUpdateTime: 0,
      isUpdating: false,
    };
  }

  // Method untuk force refresh dari menu structure yang baru
  forceRefreshFromMenuStructure(newMenuStructure) {
    this.render(newMenuStructure);
  }

  // Cleanup method saat instance di-destroy
  destroy() {
    // Clear dari active instance tracking jika ini instance yang aktif
    if (TreeMenu.getActiveInstance() === this) {
      TreeMenu.clearActiveInstance();
    }

    // Clear global reference jika ini instance yang di-track
    if (window.nexaTreeInstance === this) {
      window.nexaTreeInstance = null;
    }
  }

  // Helper method to force complete UI cleanup (for stubborn content)
  forceCompleteUICleanup(reason = "manual cleanup") {
    // Clear report container
    this.clearReportContainer(reason, true);

    // Remove any orphaned table elements anywhere in the document
    const allNexaTables = document.querySelectorAll('[data-nexa-table="true"]');
    const allTableInstances = document.querySelectorAll(
      "[data-table-instance]"
    );

    allNexaTables.forEach((table, index) => {
      if (table.parentNode) {
        table.parentNode.removeChild(table);
      }
    });

    allTableInstances.forEach((table, index) => {
      if (table.parentNode) {
        table.parentNode.removeChild(table);
      }
    });

    // Clear any table-related global variables that might be causing issues
    if (window.nexaTableInstances) {
      window.nexaTableInstances = {};
    }
  }

  // Helper method to forcefully clear report container with enhanced debugging
  clearReportContainer(reason = "undefined result", forceDelay = true) {
    const reportContainer = document.getElementById("report-container");
    if (reportContainer) {
      // Enhanced debugging - check what's actually in the container
      const originalLength = reportContainer.innerHTML.length;
      const childCount = reportContainer.children.length;
      const hasNexaTables = reportContainer.querySelectorAll(
        '[data-nexa-table="true"]'
      ).length;
      const hasTableInstances = reportContainer.querySelectorAll(
        "[data-table-instance]"
      ).length;

      // Check if there are recently created tables (within last 2 seconds)
      const recentTables = reportContainer.querySelectorAll(
        '[data-nexa-table="true"][data-table-instance]'
      );
      let hasRecentTables = false;

      recentTables.forEach((table) => {
        const instanceId = table.getAttribute("data-table-instance");
        if (instanceId) {
          // Extract timestamp from instance ID (format: nexa-table-instance-{timestamp})
          const timestampMatch = instanceId.match(/nexa-table-instance-(\d+)/);
          if (timestampMatch) {
            const tableCreatedTime = parseInt(timestampMatch[1]);
            const currentTime = Date.now();
            const ageInSeconds = (currentTime - tableCreatedTime) / 1000;

            if (ageInSeconds < 2) {
              // Less than 2 seconds old
              hasRecentTables = true;
            }
          }
        }
      });

      if (hasRecentTables && reason !== "force_clear") {
        return; // Don't clear if there are recent tables
      }

      // Immediate aggressive clear with multiple approaches
      reportContainer.innerHTML = "";
      reportContainer.textContent = "";

      // Remove all child nodes
      while (reportContainer.firstChild) {
        reportContainer.removeChild(reportContainer.firstChild);
      }

      // Target specific table elements that might be hiding
      const allTables = document.querySelectorAll(
        '#report-container [data-nexa-table="true"], #report-container [data-table-instance], #report-container table'
      );
      allTables.forEach((table) => {
        if (table.parentNode) {
          table.parentNode.removeChild(table);
        }
      });

      // Force clear with delay to handle race conditions
      if (forceDelay) {
        setTimeout(() => {
          const container = document.getElementById("report-container");
          if (container) {
            const currentLength = container.innerHTML.length;
            const currentChildren = container.children.length;

            if (currentLength > 0 || currentChildren > 0) {
              // Aggressive re-clear
              container.innerHTML = "";
              container.textContent = "";
              while (container.firstChild) {
                container.removeChild(container.firstChild);
              }

              // Nuclear option - target everything table-related
              const persistentElements = document.querySelectorAll(
                "#report-container *, [data-nexa-table], [data-table-instance]"
              );
              persistentElements.forEach((el) => {
                if (el.id !== "report-container" && el.parentNode) {
                  el.parentNode.removeChild(el);
                }
              });
            }
          }
        }, 50);

        // Nuclear option
        setTimeout(() => {
          const container = document.getElementById("report-container");
          if (container) {
            const finalLength = container.innerHTML.length;
            const finalChildren = container.children.length;

            if (finalLength > 0 || finalChildren > 0) {
              // Nuclear replacement
              const parent = container.parentNode;
              const newContainer = document.createElement("div");
              newContainer.id = "report-container";
              newContainer.className = container.className;
              parent.replaceChild(newContainer, container);
            }
          }
        }, 200);
      }
    }
  }

  // Helper method to ensure database is ready
  async ensureDatabaseReady() {
    if (!this.instance) {
      throw new Error("Instance not available");
    }

    try {
      // Check if instance has isReady method and call it
      if (
        this.instance.isReady &&
        typeof this.instance.isReady === "function"
      ) {
        await this.instance.isReady();

        return true;
      }

      // If no isReady method, try to access a simple property
      if (this.instance.storage && this.instance.storage.db) {
        return true;
      }
      return false;
    } catch (error) {
      // Try to initialize database
      if (this.instance.init && typeof this.instance.init === "function") {
        await this.instance.init();
        return true;
      }

      throw error;
    }
  }

  // Helper method to preserve existing content in report-container
  preserveReportContainerContent(callback) {
    const reportContainer = document.getElementById("report-container");
    if (!reportContainer) return callback();

    const existingContent = reportContainer.innerHTML;

    // Execute the callback
    const result = callback();

    // If result is a Promise, handle it asynchronously
    if (result && typeof result.then === "function") {
      return result.then((callbackResult) => {
        this.restoreContentIfNeeded(reportContainer, existingContent);
        return callbackResult;
      });
    } else {
      // Synchronous result
      this.restoreContentIfNeeded(reportContainer, existingContent);
      return result;
    }
  }

  // Helper method to restore content if it was replaced
  restoreContentIfNeeded(reportContainer, existingContent) {
    if (!reportContainer || existingContent.trim() === "") return;

    const currentContent = reportContainer.innerHTML;

    // Check if existing content was completely replaced
    if (currentContent && !currentContent.includes(existingContent)) {
      // Find new table elements
      const newTables = reportContainer.querySelectorAll(
        '[data-nexa-table="true"]'
      );
      let newTablesHTML = "";

      newTables.forEach((table) => {
        newTablesHTML += table.outerHTML;
        table.remove();
      });

      // Restore existing content and append new tables
      if (newTablesHTML) {
        reportContainer.innerHTML = existingContent + newTablesHTML;
      } else {
        reportContainer.innerHTML = existingContent;
      }
    }
  }

  // Static method untuk setup connection ke NexaStore
  // REFACTORED: Now uses init.js NexaStoreConnectionManager for better organization
  static setupNexaStoreConnection(nexaStoreInstance) {
    // Try to use init.js connection manager
    if (window.nexaStoreConnectionManager) {
      const activeTreeInstance =
        TreeMenu.getActiveInstance() || window.nexaTreeInstance;
      return window.nexaStoreConnectionManager.setupConnection(
        activeTreeInstance,
        nexaStoreInstance
      );
    }

    // Fallback: Try to import and create connection manager
    import("./System/init.js")
      .then(({ NexaStoreConnectionManager }) => {
        const manager = new NexaStoreConnectionManager();
        const activeTreeInstance =
          TreeMenu.getActiveInstance() || window.nexaTreeInstance;
        return manager.setupConnection(activeTreeInstance, nexaStoreInstance);
      })
      .catch((error) => {
        console.warn(
          "Failed to import init.js, using legacy connection:",
          error
        );
        TreeMenu.legacySetupConnection(nexaStoreInstance);
      });
  }

  // Legacy connection setup (fallback when init.js unavailable)
  static legacySetupConnection(nexaStoreInstance) {
    window.nexaStoreMenuRefreshCallback = (newMenuStructure) => {
      const activeTreeMenuInstance = TreeMenu.getActiveInstance();
      if (activeTreeMenuInstance && activeTreeMenuInstance.container) {
        activeTreeMenuInstance.render(
          newMenuStructure[0] || newMenuStructure,
          nexaStoreInstance
        );
        return;
      }

      if (window.nexaTreeInstance && window.nexaTreeInstance.container) {
        window.nexaTreeInstance.render(
          newMenuStructure[0] || newMenuStructure,
          nexaStoreInstance
        );
        return;
      }
    };
  }

  // Static methods untuk mengelola instance aktif (untuk callback refresh)
  static setActiveInstance(instance) {
    TreeMenu._activeInstance = instance;
  }

  static getActiveInstance() {
    return TreeMenu._activeInstance || null;
  }

  static clearActiveInstance() {
    TreeMenu._activeInstance = null;
  }
}
