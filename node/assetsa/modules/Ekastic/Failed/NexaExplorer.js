/**
 * NexaExplorer - Windows 11 File Explorer Component
 * Modern file explorer dengan styling Windows 11
 */
import * as Icons from './Icon.js'
import { formID } from "./data.js";
import { metaInstal,instalasi } from "./instal/index.js";
import { NexaXlsx } from "./Office/Xlsx/NexaXlsx.js";
import { NexaPptx } from "./Office/Pptx/NexaPptx.js";
import { NexaText } from "./Office/Txt/NexaText.js";
import { OfficeTextRenderer } from "./Office/OfficeTextRenderer.js";
import { OfficeSpreadsheetRenderer } from "./Office/OfficeSpreadsheetRenderer.js";
import { OfficePresentationRenderer } from "./Office/OfficePresentationRenderer.js";
import { EkasticTabel } from "../../../Tabel/EkasticTabel.js";
import { PicturesView } from "./pictures/PicturesView.js";
import { MusicView } from "./music/MusicView.js";
import { VideosView } from "./videos/VideosView.js";
import { ProgramFilesView } from "./programfiles/ProgramFilesView.js";
import { SharedFilesView } from "./sharedfiles/SharedFilesView.js";
import { SystemData,user } from "./System/SystemData.js";
export class NexaExplorer {

  constructor(options = {}) {
    this.container = document.querySelector(options.container || '#nxepo-explorer-content');
    this.sidebar = document.querySelector(options.sidebar || '.nxepo-sidebar');
    this.breadcrumb = document.querySelector(options.breadcrumb || '#nxepo-breadcrumb-container');
    this.searchButton = document.querySelector(options.searchButton || '#nxepo-search');
    this.settingsButton = document.querySelector(options.settingsButton || '#nxepo-settings');
    this.sidebarToggle = document.querySelector(options.sidebarToggle || '#nxepo-sidebarSet');

    this.currentPath = ['My Files'];
    this.searchActive = false;
    this.sidebarVisible = false;
    this.files = [];
    this.selectedFiles = new Set();
    this.viewMode = 'medium'; // 'extra-large', 'large', 'medium', 'small', 'list', 'details', 'tiles', 'content'
    this.clipboard = null; // 'copy' or 'cut'
    this.clipboardFiles = new Set(); // Store file names
    this.clipboardFilesInfo = new Map(); // Store file info: { name, type, path }
    this.clipboardSourcePath = null; // Store source path for copy/cut operations
    this.clipboardSharedData = null; // Store decodedData from Shared Files (bucketsStore and fileContents)
    this.currentFile = null;
    this.isMaximized = false;
    this.isRecycleBinView = false; // Track if currently viewing recycle bin
    this.hasRestoredState = false; // Track if state has been restored from IndexedDB
    
    // Multiple tabs support
    this.tabs = []; // Array of { id, name, file, path, content }
    this.activeTabId = null; // ID of currently active tab
    this.folderViewState = { path: ['My Files'], files: [] }; // Store folder view state when opening files
    
    // IndexedDB reference - will be initialized
    this.db = null;
    
    // Cached icons - will be loaded from IndexedDB or server
    this.cachedIcons = null;

    this.height=null;
    this.packages=[]; // Array untuk menyimpan packages data
    
    // Initialize view modules
    this.picturesView = new PicturesView(this);
    this.musicView = new MusicView(this);
    this.videosView = new VideosView(this);
    this.programFilesView = new ProgramFilesView(this);
    this.sharedFilesView = new SharedFilesView(this);
    
    this.init();
    // setPckg() akan dipanggil di init() dengan await
  }
  
  async initDatabase() {
    try {
      // Wait for NXUI.ref to be available
      if (typeof NXUI === 'undefined' || !NXUI || !NXUI.ref) {
        // Retry after a short delay
        await new Promise(resolve => setTimeout(resolve, 100));
        if (typeof NXUI === 'undefined' || !NXUI || !NXUI.ref) {
          return false;
        }
      }
      
      this.db = NXUI.ref;
      
      // Initialize storageManager untuk digunakan oleh Office documents (NexaPptx, dll)
      // storageManager menggunakan database yang sama dengan NXUI.ref
      this.storageManager = {
        db: NXUI.ref,
        initDatabase: async () => {
          return NXUI.ref;
        }
      };
      
      // Load cached icons first
      await this.loadCachedIcons();
      
      // Initialize default folder structure if empty
      await this.initializeDefaultStructure();
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Initialize IndexedDB connection
  async initDimensi() {
      const dimensi = new NXUI.NexaDimensi();
      this.height = dimensi.height("#nexa_app", 238, 'vh');
  }

  async setPckg() {
    const complexQuery = await new NXUI.NexaModels()
      .Storage("controllers")
      .select(["*"])
      //.select(["userid AS role", "label", "status"])
      .where("userid",NEXA.userId)
      .where("categori", "Accses")
      .get();

    // Konversi data array menjadi array of objects dengan semua data lengkap
    const result = [];
    
    // Validasi: pastikan complexQuery.data ada dan merupakan array
    if (complexQuery && complexQuery.data && Array.isArray(complexQuery.data)) {
      complexQuery.data.forEach((item) => {
        // Hanya tambahkan jika status = 1
        if (item.status === "1") {
          result.push({
            // Simpan semua data lengkap dari database terlebih dahulu
            ...item,
            // Override dengan data untuk sidebar navigation (jika berbeda)
            id: item.appid || item.id,
            icon: item.appicon ?? item.icon ?? "inventory_2",
            label: item.appname ?? item.label,
            iconType: item.iconType || 'material',
            path: ['Local Disk', item.label], 
            color: item.color || '#ffa726'
          });
        }
      });
    }
    
    // { icon: 'apps', iconType: 'material', label: 'Program Files', path: ['Local Disk', 'Program Files'], color: '#ffa726' },
    this.packages = result;
    return result;
  }




  // Load icons from cache or server
  // Method: Pada pertama kali load, semua icon dari Icon.js akan disimpan ke IndexedDB
  // Pada load berikutnya, icon akan diambil dari IndexedDB (internal user storage)
  async loadCachedIcons() {
    try {
      if (!this.db) {
        // If db not ready, use Icons directly
        this.cachedIcons = Icons;
        return;
      }

      // Try to load from cache (internal user storage)
      const cached = await this.db.get('bucketsStore', 'icon');
      
      if (cached && cached.data) {
        // Use cached icons from internal storage
        this.cachedIcons = cached.data;
        return;
      }

      // If not in cache, load from server (Icon.js) and save to internal storage
      this.cachedIcons = Icons;
      
      // Save ALL icons to internal user storage (IndexedDB)
      try {
        await this.db.set('bucketsStore', {
          id: 'icon',
          data: Icons, // Semua icon dari Icon.js disimpan di sini
          timestamp: new Date().toISOString(),
          version: '1.0',
          iconCount: Object.keys(Icons).length
        });
      } catch (saveError) {
        // Continue with Icons even if save fails
      }
    } catch (error) {
      // Fallback to direct Icons import
      this.cachedIcons = Icons;
    }
  }

  // Get icon from cache (with fallback to Icons)
  getIcon(iconName) {
    // If cache not loaded yet, use Icons directly
    if (!this.cachedIcons) {
      return Icons[iconName];
    }
    
    // Try to get from cache
    if (this.cachedIcons[iconName]) {
      return this.cachedIcons[iconName];
    }
    
    // Fallback to direct Icons if not in cache
    return Icons[iconName];
  }

  // Delete all fileContents entries with matching fileName+fileType
  // This is needed because IndexedDB index 'fileNameType' requires unique combination
  // Parameter filePath is optional - if provided, will delete that specific entry first
  async deleteAllConflictingFileContents(fileName, fileType, filePath = null) {
    try {
      if (!this.db) return;
      
      // Delete by filePath first if provided
      if (filePath) {
        try {
          await this.db.delete('fileContents', filePath);
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (e) {
          // Ignore if doesn't exist
        }
      }
      
      // Get all fileContents dan hapus konflik - lakukan beberapa kali untuk memastikan
      let allDeleted = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!allDeleted && attempts < maxAttempts) {
        attempts++;
        try {
          const allFileContents = await this.db.getAll('fileContents');
          
          // Handle different response structures
          let fileContentsArray = [];
          if (allFileContents) {
            if (Array.isArray(allFileContents)) {
              fileContentsArray = allFileContents;
            } else if (allFileContents.data && Array.isArray(allFileContents.data)) {
              fileContentsArray = allFileContents.data;
            }
          }
          
          // Find ALL entries with matching fileName+fileType
          const conflicts = fileContentsArray.filter(content => 
            content && content.fileName === fileName && content.fileType === fileType
          );
          
          if (conflicts.length === 0) {
            allDeleted = true;
            break; // No conflicts found, we're done
          }
          
          // Delete ALL matching entries - optimized untuk performa
          if (conflicts.length > 0) {
            // Delete semua konflik sekaligus (parallel) untuk performa lebih baik
            const deletePromises = conflicts.map(conflict => 
              this.db.delete('fileContents', conflict.fileId).catch(() => {
                // Silently ignore - item might already be deleted
              })
            );
            
            // Wait for all deletions to complete
            await Promise.all(deletePromises);
            await new Promise(resolve => setTimeout(resolve, 200)); // Delay minimal untuk IndexedDB commit
          }
          
          // Verifikasi ulang setelah delete (hanya jika masih ada attempts tersisa)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`Error in deleteAllConflictingFileContents attempt ${attempts}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in deleteAllConflictingFileContents:', error);
      // Continue anyway - try to delete by filePath if provided
      if (filePath) {
        try {
          await this.db.delete('fileContents', filePath);
        } catch (e) {
          // Ignore
        }
      }
    }
  }

  // Initialize default folder structure if database is empty
  async initializeDefaultStructure() {
    try {
      const allItems = await this.db.getAll('folderStructure');
      
      if (!allItems || allItems.data.length === 0) {
        // Create root "My Files"
        await this.saveFolderItem({
          id: 'My Files',
          path: 'My Files',
          parentPath: '',
          name: 'My Files',
          type: 'root',
          modified: new Date().toISOString().split('T')[0]
        });

        // Create default folders
        const defaultFolders = [
          { name: 'Documents', parent: 'My Files' },
          // { name: 'Downloads', parent: 'My Files' },
          { name: 'Pictures', parent: 'My Files' },
          { name: 'Videos', parent: 'My Files' },
          { name: 'Desktop', parent: 'My Files' }
        ];

        for (const folder of defaultFolders) {
          const path = `${folder.parent}/${folder.name}`;
          await this.saveFolderItem({
            id: path,
            path: path,
            parentPath: folder.parent,
            name: folder.name,
            type: 'folder',
            modified: new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (error) {
    }
  }

  // Convert path array to string path
  // Generate unique key from file path using hash
  generateFileKey(filePath) {
    if (!filePath) return null;
    
    // Simple hash function to convert path to unique key
    let hash = 0;
    const str = String(filePath);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to positive number and base36 for shorter key
    const positiveHash = Math.abs(hash).toString(36);
    
    // Add prefix to make it more unique and identifiable
    return `file_${positiveHash}`;
  }
  
  // Expose generateFileKey to window for global functions
  static generateFileKeyStatic(filePath) {
    if (!filePath) return null;
    let hash = 0;
    const str = String(filePath);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `file_${Math.abs(hash).toString(36)}`;
  }
  
  pathToString(pathArray) {
    return pathArray.join('/');
  }

  // Convert string path to array
  pathToArray(pathString) {
    return pathString.split('/').filter(p => p);
  }

  // Save folder/file item to IndexedDB
  async saveFolderItem(item) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      // Ensure name is always set correctly (don't let spread operator override it)
      const itemToSave = {
        ...item,
        id: item.id || item.path,
        path: item.path,
        parentPath: item.parentPath || '',
        name: item.name, // Ensure name is explicitly set
        type: item.type || 'file',
        size: item.size || '0 KB',
        modified: item.modified || new Date().toISOString().split('T')[0]
      };
      
      await this.db.set('folderStructure', itemToSave);
      
      // Small delay to ensure write is committed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify it was saved
      const verify = await this.db.get('folderStructure', itemToSave.id || itemToSave.path);
      if (!verify) {
        throw new Error(`Failed to save item: ${itemToSave.path}`);
      }
      
      // Log activity
      await this.logActivity('create', item.path, item.type);
    } catch (error) {
      throw error;
    }
  }

  // Delete folder/file item from IndexedDB
  async deleteFolderItem(path) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      // Get item first
      const item = await this.db.get('folderStructure', path);
      if (!item) return;
      
      // Move to recycle bin
      await this.db.set('recycleBin', {
        id: `recycle_${Date.now()}_${path}`,
        originalPath: path,
        originalName: item.name,
        itemType: item.type,
        deletedDate: new Date().toISOString(),
        originalData: item
      });
      
      // Delete from folderStructure
      await this.db.delete('folderStructure', path);
      
      // Delete all children if folder
      if (item.type === 'folder') {
        const allItems = await this.db.getAll('folderStructure');
        const children = allItems.data.filter(i => i.parentPath === path);
        for (const child of children) {
          await this.deleteFolderItem(child.path);
        }
      }
      
      // Log activity
      await this.logActivity('delete', path, item.type);
    } catch (error) {
      throw error;
    }
  }

  // Get folder items by parent path
  async getFolderItems(parentPath) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      const allItems = await this.db.getAll('folderStructure');
      if (!allItems || !allItems.data) {
        return [];
      }
      
      const items = allItems.data.filter(item => {
        return item.parentPath === parentPath;
      });
      
      if (items.length === 0) {
        // Debug: show what parentPaths exist
        const uniqueParentPaths = [...new Set(allItems.data.map(i => i.parentPath))];
      }
      
      return items.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size || '-',
        modified: item.modified || '2024-01-01',
        path: item.path,
        data: item
      }));
    } catch (error) {
      return [];
    }
  }

  // Get item by path
  async getItemByPath(path) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      return await this.db.get('folderStructure', path);
    } catch (error) {
      return null;
    }
  }

  // Log activity
  async logActivity(action, path, itemType) {
    try {
      if (!this.db) return;
      
      await this.db.set('activityLogs', {
        id: `log_${Date.now()}_${Math.random()}`,
        action: action,
        path: path,
        itemType: itemType || 'file',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
    }
  }

  async init() {
    // Initialize database first
    await this.initDatabase();
    
    // Initialize dimensions
    await this.initDimensi();
    
    // Load packages data before sidebar update
    await this.setPckg();
    
    // Prevent Ctrl+S globally (before other event listeners)
    this.preventCtrlS();
    
    this.setupEventListeners();
    
    // Load sidebar state first
    await this.loadSidebarState();
    
    // Load view mode from IndexedDB (must be before loadFiles)
    await this.loadViewMode();
    
    // Load saved state (if exists) to restore previous folder/file
    await this.loadState();
    
    // If no saved state, load Home page
    if (!this.hasRestoredState) {
      await this.loadHome();
    }
    
    // Update view menu selection to show active state (after view mode is loaded)
    this.updateViewMenuSelection();
    
    this.setupDragAndDrop();
    this.setupKeyboardShortcuts();
  }
  
  // Prevent Ctrl+S globally
  preventCtrlS() {
    // Prevent at window level with capture phase (runs first)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true); // Use capture phase to intercept early
    
    // Also prevent at document level
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true); // Use capture phase
  }

  setupEventListeners() {
    // Sidebar toggle
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }

    // Search button
    if (this.searchButton) {
      this.searchButton.addEventListener('click', () => this.toggleSearch());
    }

    // Search input
    const searchInput = document.querySelector('#searchInput');
    const searchClear = document.querySelector('#searchClear');
    const searchContainer = document.querySelector('.nxepo-search-container');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.toggleSearch();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.handleSearch('');
      });
    }

    // Navigation buttons
    const backBtn = document.querySelector('.nxepo-btn:nth-child(2)');
    const forwardBtn = document.querySelector('.nxepo-btn:nth-child(3)');
    const upBtn = document.querySelector('.nxepo-btn:nth-child(4)');
    const refreshBtn = document.querySelector('.nxepo-btn:nth-child(5)');

    backBtn?.addEventListener('click', () => this.navigateBack());
    forwardBtn?.addEventListener('click', () => this.navigateForward());
    upBtn?.addEventListener('click', () => this.navigateUp());
    refreshBtn?.addEventListener('click', () => this.refresh());

    // Breadcrumb clicks
    if (this.breadcrumb) {
      this.breadcrumb.addEventListener('click', (e) => {
        const segment = e.target.closest('.nxepo-breadcrumb-segment');
        if (segment) {
          const index = parseInt(segment.dataset.pathIndex);
          this.navigateToIndex(index);
        }
      });
    }

    // Settings buttons
    const settingsExportBtn = document.querySelector('#settingsExportBtn');
    const settingsImportBtn = document.querySelector('#settingsImportBtn');
    const settingsSyncBtn = document.querySelector('#settingsSyncBtn');
    const settingsSyncFromServerBtn = document.querySelector('#settingsSyncFromServerBtn');
    const settingsClearLogsBtn = document.querySelector('#settingsClearLogsBtn');

    settingsExportBtn?.addEventListener('click', () => this.exportData());
    settingsImportBtn?.addEventListener('click', () => this.importData());
    settingsSyncBtn?.addEventListener('click', () => this.syncToServer());
    settingsSyncFromServerBtn?.addEventListener('click', () => this.syncFromServer());
    settingsClearLogsBtn?.addEventListener('click', () => this.clearLogs());

    // Settings modal
    if (this.settingsButton) {
      this.settingsButton.addEventListener('click', () => this.openSettingsModal());
    }

    // Context menu
    if (this.container) {
      this.container.addEventListener('contextmenu', (e) => this.showContextMenu(e));
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nxepo-context-menu')) {
          this.hideContextMenu();
        }
      });
      document.addEventListener('keydown', (e) => {
        // Prevent Ctrl+S
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        if (e.key === 'Escape') {
          this.hideContextMenu();
        }
      });
    }

    // File tab bar buttons
    const fileTabClose = document.querySelector('#nxepo-file-tab-close');
    const fileTabMaximize = document.querySelector('#nxepo-file-tab-maximize');
    
    if (fileTabClose) {
      fileTabClose.addEventListener('click', () => this.closeFileTab());
    }
    
    if (fileTabMaximize) {
      fileTabMaximize.addEventListener('click', () => this.toggleMaximize());
    }

    // View dropdown
    const viewBtn = document.querySelector('#nxepo-view-btn');
    const viewMenu = document.querySelector('#nxepo-view-menu');
    
    if (viewBtn && viewMenu) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleViewMenu();
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nxepo-view-dropdown')) {
          this.hideViewMenu();
        }
      });
      
      // View menu items
      viewMenu.querySelectorAll('.nxepo-view-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const viewMode = item.dataset.view;
          this.setViewMode(viewMode);
          this.hideViewMenu();
        });
      });
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebar) {
      this.sidebar.style.display = this.sidebarVisible ? 'block' : 'none';
    }
    this.updateSidebarNav();
    
    // Save sidebar state
    this.saveSidebarState();
  }
  
  // Save sidebar state to IndexedDB
  async saveSidebarState() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const sidebarState = {
        id: 'sidebarState',
        visible: this.sidebarVisible,
        timestamp: new Date().toISOString()
      };

      await this.db.set('bucketsStore', sidebarState);
    } catch (error) {
    }
  }
  
  // Load sidebar state from IndexedDB
  async loadSidebarState() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const savedSidebarState = await this.db.get('bucketsStore', 'sidebarState');
      
      if (savedSidebarState && savedSidebarState.visible !== undefined) {
        this.sidebarVisible = savedSidebarState.visible;
        
        // Apply sidebar state
        if (this.sidebar) {
          this.sidebar.style.display = this.sidebarVisible ? 'block' : 'none';
        }
        this.updateSidebarNav();
      }
    } catch (error) {
    }
  }

  updateSidebarNav() {
    
    const sidebarNav = document.querySelector('#sidebarNav');
    if (!sidebarNav) return;

    const navItems = [
      { icon: this.getIcon('base64_home_small'), label: 'Home', path: ['Home'], color: '#0078d4' },
      { icon: this.getIcon('base64_mycomputer_small'), label: 'My Files', path: ['My Files'], color: '#616161' },
      { icon: this.getIcon('base64_icon_documents'), label: 'Documents', path: ['My Files', 'Documents'], color: '#1a73e8' },
      { icon: this.getIcon('base64_icon_pictures'), label: 'Pictures', path: ['My Files', 'Pictures'], color: '#9c27b0' },
      { icon: this.getIcon('base64_icon_music'), label: 'Music', path: ['My Files', 'Music'], color: '#f44336' },
      { icon: this.getIcon('base64_icon_videos'), label: 'Videos', path: ['My Files', 'Videos'], color: '#e91e63' },
      { icon: this.getIcon('base64_desktop_small'), label: 'Desktop', path: ['My Files', 'Desktop'], color: '#2196f3' },
      { icon: this.getIcon('base64_mycomputer_small'), label: 'Local Disk', path: ['Lc'], color: '#ff9800', isTree: true, children: [
        ...this.packages,
        { icon: this.getIcon('base64_icon_fileexplorer'), label: 'Program Files', path: ['Local Disk', 'Program Files'], color: '#ffa726' },
        
       
        { icon: this.getIcon('base64_network_small'), label: 'Shared Files', path: ['Local Disk', 'Shared Files'], color: '#ffa726' },
       
        // { icon: 'settings', iconType: 'material', label: 'ProgramData', path: ['Local Disk', 'ProgramData'], color: '#ffa726' },
   
      ]},
      { icon: this.getIcon('base64_icon_recyclebin'), label: 'Recycle Bin', path: ['Recycle Bin'], special: 'recycleBin', color: '#757575' },
    ];

    // Load saved tree expanded state
    this.loadTreeExpandedState().then(treeStates => {
      this.renderSidebarWithTreeState(navItems, treeStates);
    }).catch(error => {
      // Fallback: render with empty tree states (all collapsed)
      this.renderSidebarWithTreeState(navItems, {});
    });
  }

  async renderSidebarWithTreeState(navItems, treeStates = {}) {
    const sidebarNav = document.querySelector('#sidebarNav');
    if (!sidebarNav) return;

    sidebarNav.innerHTML = navItems.map(item => {
      if (item.isTree && item.children) {
        // Get saved expanded state for this tree item
        const pathKey = JSON.stringify(item.path);
        const isExpanded = treeStates[pathKey] === true;
        
        // Tree item with expand/collapse
        return `
          <li class="nxepo-nav-item nxepo-nav-tree" data-path='${pathKey}' data-tree-expanded="${isExpanded}">
            <img src="${item.icon}" alt="${item.label}" style="width: 20px; height: 20px; object-fit: contain; flex-shrink: 0;" />
            <span>${item.label}</span>
            <span class="nxepo-tree-toggle">
              <span class="material-icons nxepo-tree-icon">${isExpanded ? 'expand_more' : 'chevron_right'}</span>
            </span>
          </li>
          <ul class="nxepo-nav-tree-children" style="display: ${isExpanded ? 'block' : 'none'};">
            ${item.children.map(child => {
              const isMaterialIcon = child.iconType === 'material';
              return `
              <li class="nxepo-nav-item nxepo-nav-tree-child" data-path='${JSON.stringify(child.path)}'>
                <span class="nxepo-tree-indent"></span>
                ${isMaterialIcon 
                  ? `<span class="material-symbols-outlined" style="width: 20px; height: 20px; font-size: 20px; color: #566476; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">${child.icon}</span>`
                  : `<img src="${child.icon}" alt="${child.label}" style="width: 20px; height: 20px; object-fit: contain; flex-shrink: 0;" />`}
                <span>${child.label}</span>
              </li>
            `;
            }).join('')}
          </ul>
        `;
      } else {
        // Regular item
        return `
          <li class="nxepo-nav-item" data-path='${JSON.stringify(item.path)}' ${item.special ? `data-special="${item.special}"` : ''}>
            <img src="${item.icon}" alt="${item.label}" style="width: 20px; height: 20px; object-fit: contain; flex-shrink: 0;" />
            <span>${item.label}</span>
          </li>
        `;
      }
    }).join('');

    // Add click handlers for tree toggle
    sidebarNav.querySelectorAll('.nxepo-nav-tree').forEach(treeItem => {
      const toggleBtn = treeItem.querySelector('.nxepo-tree-toggle');
      const childrenContainer = treeItem.nextElementSibling;
      
      if (toggleBtn && childrenContainer) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = treeItem.dataset.treeExpanded === 'true';
          
          if (isExpanded) {
            // Collapse
            treeItem.dataset.treeExpanded = 'false';
            childrenContainer.style.display = 'none';
            const icon = treeItem.querySelector('.nxepo-tree-icon');
            if (icon) icon.textContent = 'chevron_right';
            // Save state
            const pathKey = treeItem.dataset.path;
            this.saveTreeExpandedState(pathKey, false);
          } else {
            // Expand
            treeItem.dataset.treeExpanded = 'true';
            childrenContainer.style.display = 'block';
            const icon = treeItem.querySelector('.nxepo-tree-icon');
            if (icon) icon.textContent = 'expand_more';
            // Save state
            const pathKey = treeItem.dataset.path;
            this.saveTreeExpandedState(pathKey, true);
          }
        });
      }
      
      // Click on tree item itself (not toggle button)
      treeItem.addEventListener('click', (e) => {
        if (e.target.closest('.nxepo-tree-toggle')) return;
        
        const path = JSON.parse(treeItem.dataset.path);
        this.navigateToPath(path);
      });
    });
    
    // Add click handlers for tree children
    sidebarNav.querySelectorAll('.nxepo-nav-tree-child').forEach(item => {
      item.addEventListener('click', () => {
        const path = JSON.parse(item.dataset.path);
        this.navigateToPath(path);
      });
    });
    
    // Add click handlers for regular items
    sidebarNav.querySelectorAll('.nxepo-nav-item:not(.nxepo-nav-tree):not(.nxepo-nav-tree-child)').forEach(item => {
      item.addEventListener('click', () => {
        const path = JSON.parse(item.dataset.path);
        const special = item.dataset.special;
        
        if (special === 'recycleBin') {
          this.loadRecycleBin();
        } else {
          this.navigateToPath(path);
        }
      });
    });
  }

  // Save tree expanded state to IndexedDB
  async saveTreeExpandedState(pathKey, isExpanded) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      // Get existing tree states
      const existingState = await this.db.get('bucketsStore', 'treeExpandedState');
      const treeStates = existingState && existingState.states ? { ...existingState.states } : {};
      
      // Update state for this path
      treeStates[pathKey] = isExpanded;
      
      // Save updated states
      const state = {
        id: 'treeExpandedState',
        states: treeStates,
        timestamp: new Date().toISOString()
      };

      await this.db.set('bucketsStore', state);
    } catch (error) {
    }
  }

  // Load tree expanded state from IndexedDB
  async loadTreeExpandedState() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      if (!this.db) {
        return {};
      }

      const savedState = await this.db.get('bucketsStore', 'treeExpandedState');
      
      if (savedState && savedState.states) {
        return savedState.states;
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }
  
  // Get sidebar icon based on label/name
  getSidebarIcon(label) {
    const iconMap = {
      'Home': 'base64_home_small',
      'My Files': 'base64_mycomputer_small',
      'Explorer': 'base64_mycomputer_small',
      'Documents': 'base64_icon_documents',
      'Downloads': 'base64_downloads_small',
      'Pictures': 'base64_icon_pictures',
      'Music': 'base64_icon_music',
      'Videos': 'base64_icon_videos',
      'Desktop': 'base64_desktop_small',
      'Recycle Bin': 'base64_icon_recyclebin',
      'Local Disk': 'base64_mycomputer_small',
      'Program Files': 'base64_icon_fileexplorer',
      'Users': 'user',
      'ProgramData': 'base64_icon_settings'
    };
    const iconName = iconMap[label] || 'base64_mycomputer_small';
    return this.getIcon(iconName);
  }
  
  // Get sidebar color based on label/name
  getSidebarColor(label) {
    const colorMap = {
      'Home': '#0078d4', // Windows Blue
      'My Files': '#616161', // Grey
      'Documents': '#1a73e8', // Google Docs Blue
      'Downloads': '#0078d4', // Windows Blue
      'Pictures': '#9c27b0', // Purple
      'Music': '#f44336', // Red
      'Videos': '#e91e63', // Pink
      'Desktop': '#2196f3', // Blue
      'Recycle Bin': '#757575' // Grey
    };
    return colorMap[label] || '#616161';
  }

  toggleSearch() {
    this.searchActive = !this.searchActive;
    const searchContainer = document.querySelector('.nxepo-search-container');
    if (searchContainer) {
      searchContainer.style.display = this.searchActive ? 'flex' : 'none';
      if (this.searchActive) {
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
          searchInput.focus();
        }
      }
    }
  }

  handleSearch(query) {
    const searchClear = document.querySelector('#searchClear');
    if (searchClear) {
      searchClear.style.display = query.length > 0 ? 'block' : 'none';
    }

    // Filter files based on search query
    const filtered = this.files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
    this.renderFiles(filtered);
  }

  async navigateToPath(path) {
    if (!path || path.length === 0) return;
    
    // Hide Recycle Bin header if navigating away from Recycle Bin
    const isNavigatingToRecycleBin = path.length === 1 && path[0] === 'Recycle Bin';
    if (!isNavigatingToRecycleBin && this.isRecycleBinView) {
      const recycleBinHeader = document.querySelector('#nxepo-recycle-bin-header');
      if (recycleBinHeader) {
        recycleBinHeader.style.display = 'none';
      }
      // Restore tab bar if there are tabs
      const tabBar = document.querySelector('#nxepo-file-tab-bar');
      if (tabBar && this.tabs.length > 0) {
        tabBar.style.display = 'flex';
        this.updateTabBar();
      }
      this.isRecycleBinView = false;
    }
    
    // Check if navigating to Home - Special content
    if (path.length === 1 && path[0] === 'Home') {
      await this.loadHome();
      this.saveState({ path: path, type: 'home' });
      return;
    }
    
    // Check if navigating to Program Files - Special content
    if (path.length === 2 && (path[0] === 'Local Disk' || path[0] === 'Lc') && path[1] === 'Program Files') {
      await this.loadProgramFiles();
      this.saveState({ path: path, type: 'programFiles' });
      return;
    }
    
    // Check if navigating to Shared Files - Special content
    if (path.length === 2 && (path[0] === 'Local Disk' || path[0] === 'Lc') && path[1] === 'Shared Files') {
      await this.sharedFilesView.load();
      this.saveState({ path: path, type: 'sharedFiles' });
      return;
    }
    
    // Check if navigating to Local Disk - Special system content
    const isLocalDisk = path.length >= 1 && (path[0] === 'Local Disk' || path[0] === 'Lc');
    if (isLocalDisk) {
      // If path has subfolder, show subfolder content
      if (path.length > 1) {
        const subfolderName = path[1];
        await this.loadLocalDiskSubfolder(subfolderName);
      } else {
        // Show main Local Disk content
        this.loadLocalDisk();
      }
      // Save state with original path
      this.saveState({ path: path, type: 'localDisk' });
      return;
    }
    
    // Check if navigating to Pictures - Special content
    if (path.length === 2 && path[0] === 'My Files' && path[1] === 'Pictures') {
      this.loadPictures();
      this.saveState({ path: path, type: 'pictures' });
      return;
    }
    
    // Check if navigating to Music - Special content
    if (path.length === 2 && path[0] === 'My Files' && path[1] === 'Music') {
      this.loadMusic();
      this.saveState({ path: path, type: 'music' });
      return;
    }
    
    // Check if navigating to Videos - Special content
    if (path.length === 2 && path[0] === 'My Files' && path[1] === 'Videos') {
      this.loadVideos();
      this.saveState({ path: path, type: 'videos' });
      return;
    }
    
    // Check if navigating to Recycle Bin
    if (isNavigatingToRecycleBin) {
      this.isRecycleBinView = true;
      await this.loadRecycleBin();
      // Save state
      this.saveState({ path: path, type: 'folder', isRecycleBin: true });
      return;
    }
    
    // Reset recycle bin view flag (for normal folder navigation)
    this.isRecycleBinView = false;
    
    // Save folder view state when navigating (in case user opens files later)
    this.folderViewState = {
      path: [...path],
      files: [] // Will be updated after loadFiles()
    };
    
    // Reset tab bar to normal state (hide or restore normal file tab)
    const tabBar = document.querySelector('#nxepo-file-tab-bar');
    if (tabBar) {
      // If we have tabs, keep them visible (user might want to switch back)
      if (this.tabs.length > 0) {
        // Don't hide tab bar, just update it
        // But clear active tab so folder view is shown
        // User can click tab later to view file
        this.activeTabId = null;
        this.updateTabBar();
      } else {
        // No tabs, hide tab bar
        tabBar.style.display = 'none';
      }
      
      // Restore normal tab bar structure
      const tabInfo = tabBar.querySelector('.nxepo-file-tab-info');
      const tabActions = tabBar.querySelector('.nxepo-file-tab-actions');
      
      if (tabInfo) {
        // Remove Recycle Bin buttons if they exist
        const recycleBinActions = tabInfo.querySelector('.nxepo-recycle-bin-actions');
        if (recycleBinActions) {
          recycleBinActions.remove();
        }
      }
      
      if (tabActions) {
        tabActions.style.display = 'flex';
      }
    }
    this.currentFile = null;
    
    // Show loading state
    if (this.container) {
      this.container.style.opacity = '0.6';
      this.container.style.pointerEvents = 'none';
    }
    
    this.currentPath = path;
    this.updateBreadcrumb();
    
    // Clear selection when navigating
    this.selectedFiles.clear();
    this.updateSelection();
    
    // Reset maximize state
    this.resetViewState();
    
    // Save state
    this.saveState({ path: path, type: 'folder' });
    
    // Load files with slight delay for smooth transition
    setTimeout(async () => {
      await this.loadFiles();
      // Update folder view state after loading
      this.folderViewState.files = [...this.files];
      if (this.container) {
        this.container.style.opacity = '1';
        this.container.style.pointerEvents = 'auto';
      }
    }, 100);
  }

  resetViewState() {
    this.isMaximized = false;
    
    const container = document.querySelector('.nxepo-container');
    
    if (container) {
      container.classList.remove('maximized');
    }
    
    this.updateMaximizeButton();
  }

  // Load Local Disk - Special system content in nxepo-explorer-content
  async loadLocalDisk() {
    if (!this.container) return;
    
    this.currentPath = ['Lc'];
    this.updateBreadcrumb();
    
    // Clear active tab when loading Local Disk
    this.activeTabId = null;
    this.currentFile = null;
    
    // Get icon
    const icon = this.getIcon('base64_mycomputer_small');
    const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
    
    // Get Quick Access items from packages (subfolders in Local Disk)
    const quickAccessItems = [];
    
    // Add packages as quick access items
    if (this.packages && this.packages.length > 0) {
      this.packages.forEach(pkg => {
        const itemName = pkg.label || pkg.appname || pkg.name;
        const itemPath = pkg.path || ['Local Disk', itemName];
        const itemIcon = pkg.icon || 'apps';
        const itemIconType = pkg.iconType || 'material';
        const itemColor = pkg.color || '#ffa726';
        
        quickAccessItems.push({
          name: itemName,
          path: itemPath,
          icon: itemIcon,
          iconType: itemIconType,
          iconKey: pkg.appicon || null,
          color: itemColor
        });
      });
    }
    
    // Add default system folders
    quickAccessItems.push(
      { name: 'Program Files', path: ['Local Disk', 'Program Files'], iconKey: 'base64_icon_fileexplorer', color: '#ffa726' },
      { name: 'Shared Files', path: ['Local Disk', 'Shared Files'], iconKey: 'base64_network_small', color: '#ffa726' },
      { name: 'ProgramData', path: ['Local Disk', 'ProgramData'], icon: 'settings', iconType: 'material', color: '#ffa726' }
    );
    
    // Render Local Disk page (similar to Home but without tabs)
    this.container.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto;">
        <!-- Header -->
        <div class="nxepo-btx" style="display: flex; align-items: center; margin-bottom: 30px; padding: 20px; background: white; ">
          <div style="margin-right: 20px;">
            ${isImageIcon 
              ? `<img src="${icon}" alt="Local Disk" style="width: 64px; height: 64px; object-fit: contain;" />` 
              : `<span class="material-icons" style="font-size: 64px; color: #ff9800;">storage</span>`}
          </div>
          <div>
            <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 500; color: #333;">Local Disk</h1>
            <p style="margin: 0; color: #666; font-size: 14px;">Quick access ke aplikasi dan folder sistem</p>
          </div>
        </div>
        
        <!-- Quick Access Section -->
        <div style="margin-bottom: 30px;">
          <h2 class="nxepo-quik" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500; color: #333;">Quick access</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            ${quickAccessItems.map(item => {
              let itemIcon = null;
              let isItemImageIcon = false;
              
              if (item.iconKey) {
                itemIcon = this.getIcon(item.iconKey);
                isItemImageIcon = typeof itemIcon === 'string' && (itemIcon.startsWith('http') || itemIcon.startsWith('data:'));
              }
              
              if (!itemIcon) {
                itemIcon = item.icon;
              }
              
              return `
                <div class="nxepo-quick-access-item" 
                     data-path="${item.path.join('/')}"
                     style="padding: 16px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="margin-right: 12px;">
                      ${isItemImageIcon 
                        ? `<img src="${itemIcon}" alt="${item.name}" style="width: 32px; height: 32px; object-fit: contain; opacity: 0.65;" />` 
                        : `<span class="material-icons" style="font-size: 32px; color: rgba(27, 46, 75, 0.65);">${itemIcon}</span>`}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 500; color: #333; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                      <div style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Local Disk</div>
                    </div>
                    <span class="material-icons" style="font-size: 18px; color: rgba(27, 46, 75, 0.65);">push_pin</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    
    // Attach event listeners for Quick Access items
    this.container.querySelectorAll('.nxepo-quick-access-item').forEach(item => {
      item.addEventListener('click', () => {
        const pathString = item.dataset.path;
        const pathArray = this.pathToArray(pathString);
        this.navigateToPath(pathArray);
      });
    });
    
    // Store reference to nexaExplorer for onclick handlers
    if (typeof window !== 'undefined') {
      window.nexaExplorer = this;
    }
    
    // Clear files array since this is special content
    this.files = [];
  }

  // Load Local Disk subfolder content - in nxepo-explorer-content
  async loadLocalDiskSubfolder(subfolderName) {
    if (!this.container) return;
    
    // Cari data lengkap dari packages berdasarkan subfolderName
    const packageData = this.packages.find(pkg => 
      pkg.label === subfolderName || 
      pkg.appname === subfolderName || 
      (pkg.path && pkg.path[1] === subfolderName)
    );
    
    // Log data lengkap untuk debugging
 
    // console.log('packageData lengkap:', packageData);
    // console.log('All packages:', this.packages);
    
    // Update current path
    this.currentPath = ['Local Disk', subfolderName];
    this.updateBreadcrumb();
    
    // Get icon (general icon, not specific to subfolder)
    const icon = this.getIcon('base64_mycomputer_small');
    const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
    
    // Get data from nexaStore jika packageData ada
    let dataform = null;
    if (packageData && packageData.id) {
      try {
        dataform = await NXUI.ref.get("nexaStore", packageData.id);
      } catch (error) {
       
      }
    }
    
    // Render general subfolder content inside nxepo-explorer-content
    this.container.innerHTML = `
      <div id="${dataform?.contentID || 'packageData'}"></div>
    `;
    
    // Store reference to nexaExplorer for onclick handlers
    if (typeof window !== 'undefined') {
      window.nexaExplorer = this;
    }
    
    // Initialize EkasticTabel jika dataform ada
    if (dataform && dataform.contentID) {
      try {
        // Pastikan height sudah diinisialisasi
        if (!this.height) {
          await this.initDimensi();
        }
        
        // Inisialisasi EkasticTabel
        const packageInstance = new EkasticTabel(dataform);
        const DomEvent = await packageInstance.init(dataform, this.height);
        NXUI.id(dataform.contentID).html(DomEvent);
      } catch (error) {
        console.error('Error initializing EkasticTabel:', error);
      }
    }
    
    // Clear files array since this is special content
    this.files = [];
  }

  // Load Home - Special content in nxepo-explorer-content
  async loadHome() {
    if (!this.container) return;
    
    this.currentPath = ['Home'];
    this.updateBreadcrumb();
    
    // Clear active tab when loading Home
    this.activeTabId = null;
    this.currentFile = null;
    
    // Get icon
    const icon = this.getIcon('base64_home_small');
    const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
    
    // Get Quick Access folders (pinned folders)
    const quickAccessFolders = [
      { name: 'Local Disk', path: ['Lc'], iconKey: 'base64_mycomputer_small', fallbackIcon: 'computer', color: '#ff9800' },
      { name: 'My Files', path: ['My Files'], iconKey: 'base64_mycomputer_small', fallbackIcon: 'folder', color: '#616161' },
      { name: 'Documents', path: ['My Files', 'Documents'], iconKey: 'base64_icon_documents', fallbackIcon: 'description', color: '#1a73e8' },
      { name: 'Pictures', path: ['My Files', 'Pictures'], iconKey: 'base64_icon_pictures', fallbackIcon: 'image', color: '#9c27b0' },
      { name: 'Music', path: ['My Files', 'Music'], iconKey: 'base64_icon_music', fallbackIcon: 'music_note', color: '#f44336' },
      { name: 'Videos', path: ['My Files', 'Videos'], iconKey: 'base64_icon_videos', fallbackIcon: 'videocam', color: '#e91e63' }
    ];
    
    // Get Recent files from activityLogs
    let recentFiles = [];
    try {
      if (this.db) {
        const allLogs = await this.db.getAll('activityLogs');
        if (allLogs && allLogs.data) {
          // Filter untuk file yang di-open, sort by timestamp desc
          const fileLogs = allLogs.data
            .filter(log => log.action === 'open' && log.itemType === 'file')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10); // Ambil 10 file terakhir
          
          // Get file info untuk setiap log
          for (const log of fileLogs) {
            const fileItem = await this.getItemByPath(log.path);
            if (fileItem) {
              recentFiles.push({
                name: fileItem.name,
                path: log.path,
                modified: log.timestamp,
                type: fileItem.type
              });
            }
          }
        }
      }
    } catch (error) {
      // Continue even if error
    }
    
    // Render Home page
    this.container.innerHTML = `
      <div style="padding: 20px; max-width: 1400px; margin: 0 auto;">
        <!-- Header -->
        <div class="nxepo-btx" style="display: flex; align-items: center; margin-bottom: 30px; padding: 20px; background: white;">
          <div style="margin-right: 20px;">
            ${isImageIcon 
              ? `<img src="${icon}" alt="Home" style="width: 64px; height: 64px; object-fit: contain;" />` 
              : `<span class="material-icons" style="font-size: 64px; color: #0078d4;">home</span>`}
          </div>
          <div>
            <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 500; color: #333;">Home</h1>
            <p style="margin: 0; color: #666; font-size: 14px;">Quick access ke folder dan file yang sering digunakan</p>
          </div>
        </div>
        
        <!-- Quick Access Section -->
        <div style="margin-bottom: 30px;">
          <h2 class="nxepo-quik" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500; color: #333;">Quick access</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            ${quickAccessFolders.map(folder => {
              const folderIcon = this.getIcon(folder.iconKey) || folder.fallbackIcon;
              const isFolderImageIcon = typeof folderIcon === 'string' && (folderIcon.startsWith('http') || folderIcon.startsWith('data:'));
              return `
                <div class="nxepo-quick-access-item" 
                     data-path="${folder.path.join('/')}"
                     style="padding: 16px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="margin-right: 12px;">
                      ${isFolderImageIcon 
                        ? `<img src="${folderIcon}" alt="${folder.name}" style="width: 32px; height: 32px; object-fit: contain;" />` 
                        : `<span class="material-icons" style="font-size: 32px; color: ${folder.color};">${folderIcon}</span>`}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 500; color: #333; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${folder.name}</div>
                      <div style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Stored locally</div>
                    </div>
                    <span class="material-icons" style="font-size: 18px; color: #999;">push_pin</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Tabs Section -->
        <div class="tls" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="display: flex; border-bottom: 1px solid #e0e0e0; padding: 0 20px;">
            <div class="nxepo-home-tab active" data-tab="recent" style="padding: 12px 20px; cursor: pointer; border-bottom: 2px solid #0078d4; color: #0078d4; font-weight: 500; display: flex; align-items: center; gap: 8px;">
              <span class="material-icons" style="font-size: 18px;">schedule</span>
              <span>Recent</span>
            </div>
            <div class="nxepo-home-tab" data-tab="favorites" style="padding: 12px 20px; cursor: pointer; color: #666; display: flex; align-items: center; gap: 8px;">
              <span class="material-icons" style="font-size: 18px;">star</span>
              <span>Favorites</span>
            </div>
            <div class="nxepo-home-tab" data-tab="shared" style="padding: 12px 20px; cursor: pointer; color: #666; display: flex; align-items: center; gap: 8px;">
              <span class="material-icons" style="font-size: 18px;">people</span>
              <span>Shared</span>
            </div>
          </div>
          
          <!-- Recent Tab Content -->
          <div id="nxepo-home-tab-recent" class="nxepo-home-tab-content" style="display: block; padding: 20px;">
            ${recentFiles.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #e0e0e0;">
                    <th style="text-align: left; padding: 12px; font-weight: 500; color: #666; font-size: 14px;">Name</th>
                    <th style="text-align: left; padding: 12px; font-weight: 500; color: #666; font-size: 14px;">Date accessed</th>
                    <th style="text-align: left; padding: 12px; font-weight: 500; color: #666; font-size: 14px;">File location</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentFiles.map(file => {
                    const fileIcon = this.getFileIcon(file.name);
                    const fileColor = this.getFileColor(file.name);
                    const isFileImageIcon = typeof fileIcon === 'string' && (fileIcon.startsWith('http') || fileIcon.startsWith('data:'));
                    const pathArray = this.pathToArray(file.path);
                    const fileName = pathArray.pop();
                    const folderPath = pathArray.join(' > ');
                    const date = new Date(file.modified);
                    const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    
                    return `
                      <tr class="nxepo-recent-file-item" 
                          data-path="${file.path}"
                          style="border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.2s;"
                          onmouseover="this.style.background='#f5f5f5';"
                          onmouseout="this.style.background='';">
                        <td style="padding: 12px; display: flex; align-items: center; gap: 12px;">
                          <div style="color: ${fileColor};">
                            ${isFileImageIcon 
                              ? `<img src="${fileIcon}" alt="${fileName}" style="width: 24px; height: 24px; object-fit: contain;" />` 
                              : `<span class="material-icons" style="font-size: 24px;">${fileIcon}</span>`}
                          </div>
                          <span style="color: #333; font-size: 14px;">${fileName}</span>
                        </td>
                        <td style="padding: 12px; color: #666; font-size: 14px;">${formattedDate} ${formattedTime}</td>
                        <td style="padding: 12px; color: #666; font-size: 14px;">${folderPath || 'My Files'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : `
              <div style="text-align: center; padding: 40px; color: #999;">
                <span class="material-icons" style="font-size: 48px; margin-bottom: 16px; display: block;">schedule</span>
                <p style="margin: 0; font-size: 14px;">No recent files</p>
              </div>
            `}
          </div>
          
          <!-- Favorites Tab Content -->
          <div id="nxepo-home-tab-favorites" class="nxepo-home-tab-content" style="display: none; padding: 20px;">
            <div style="text-align: center; padding: 40px; color: #999;">
              <span class="material-icons" style="font-size: 48px; margin-bottom: 16px; display: block;">star</span>
              <p style="margin: 0; font-size: 14px;">No favorites yet</p>
            </div>
          </div>
          
          <!-- Shared Tab Content -->
          <div id="nxepo-home-tab-shared" class="nxepo-home-tab-content" style="display: none; padding: 20px;">
            <div style="text-align: center; padding: 40px; color: #999;">
              <span class="material-icons" style="font-size: 48px; margin-bottom: 16px; display: block;">people</span>
              <p style="margin: 0; font-size: 14px;">No shared files</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Attach event listeners for Quick Access items
    this.container.querySelectorAll('.nxepo-quick-access-item').forEach(item => {
      item.addEventListener('click', () => {
        const pathString = item.dataset.path;
        const pathArray = this.pathToArray(pathString);
        this.navigateToPath(pathArray);
      });
    });
    
    // Attach event listeners for Recent files
    this.container.querySelectorAll('.nxepo-recent-file-item').forEach(item => {
      item.addEventListener('click', () => {
        const pathString = item.dataset.path;
        const pathArray = this.pathToArray(pathString);
        const fileName = pathArray.pop();
        const folderPath = pathArray;
        
        // Navigate to folder first, then open file
        this.navigateToPath(folderPath).then(() => {
          setTimeout(() => {
            this.openFile(fileName);
          }, 300);
        });
      });
    });
    
    // Attach event listeners for tabs
    this.container.querySelectorAll('.nxepo-home-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        this.container.querySelectorAll('.nxepo-home-tab').forEach(t => {
          t.classList.remove('active');
          t.style.borderBottom = 'none';
          t.style.color = '#666';
        });
        tab.classList.add('active');
        tab.style.borderBottom = '2px solid #0078d4';
        tab.style.color = '#0078d4';
        
        // Show corresponding content
        this.container.querySelectorAll('.nxepo-home-tab-content').forEach(content => {
          content.style.display = 'none';
        });
        const content = this.container.querySelector(`#nxepo-home-tab-${tabName}`);
        if (content) {
          content.style.display = 'block';
        }
      });
    });
    
    // Clear files array since this is special content
    this.files = [];
  }

  // Load Pictures - Special content in nxepo-explorer-content
  async loadPictures() {
    await this.picturesView.load();
  }

  // Load Music - Special content in nxepo-explorer-content
  async loadMusic() {
    await this.musicView.load();
  }

  // Load Videos - Special content in nxepo-explorer-content
  async loadVideos() {
    await this.videosView.load();
  }

  // Load Program Files - Special content in nxepo-explorer-content
  async loadProgramFiles() {
    await this.programFilesView.load();
  }

  navigateToIndex(index) {
    this.currentPath = this.currentPath.slice(0, index + 1);
    this.updateBreadcrumb();
    this.loadFiles(); // Already async
  }

  navigateBack() {
    // Implementation for back navigation
  }

  navigateForward() {
    // Implementation for forward navigation
  }

  navigateUp() {
    if (this.currentPath.length > 1) {
      this.currentPath = this.currentPath.slice(0, -1);
      this.updateBreadcrumb();
      this.loadFiles(); // Already async
    }
  }

  async refresh() {
    await this.loadFiles();
  }

  updateBreadcrumb() {
    if (!this.breadcrumb) return;

    this.breadcrumb.innerHTML = this.currentPath.map((segment, index) => {
      const isLast = index === this.currentPath.length - 1;
      return `
        <span class="nxepo-breadcrumb-segment ${isLast ? 'active' : ''}" data-path-index="${index}">
          ${segment}
        </span>
        ${!isLast ? '<span class="nxepo-breadcrumb-separator"> &gt; </span>' : ''}
      `;
    }).join('');
  }

  async loadFiles() {
    try {
      // Hide Recycle Bin header if visible (when loading normal folder)
      if (this.isRecycleBinView === false) {
        const recycleBinHeader = document.querySelector('#nxepo-recycle-bin-header');
        if (recycleBinHeader) {
          recycleBinHeader.style.display = 'none';
        }
      }
      
      // Clear current file when loading folder view
      this.currentFile = null;
      
      // Clear active tab when loading folder view
      // This ensures folder content is always visible when navigating to folders
      // User can click tab later to view file content
      this.activeTabId = null;

      // Get files based on current path from IndexedDB
      const currentPathString = this.pathToString(this.currentPath);
      
      const folderContents = await this.getFolderItems(currentPathString);
      
      // Sort (folders first, then files, alphabetically)
      this.files = folderContents.sort((a, b) => {
        // Folders first
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        // Then alphabetically
        return a.name.localeCompare(b.name);
      });

      this.renderFiles(this.files);
      
      // Update tab bar to reflect no active tab
      if (this.tabs.length > 0) {
        this.updateTabBar();
      }
    } catch (error) {
      this.files = [];
      this.renderFiles(this.files);
    }
  }

  toggleViewMenu() {
    const viewMenu = document.querySelector('#nxepo-view-menu');
    if (viewMenu) {
      const isVisible = viewMenu.style.display === 'block';
      viewMenu.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        this.updateViewMenuSelection();
      }
    }
  }

  hideViewMenu() {
    const viewMenu = document.querySelector('#nxepo-view-menu');
    if (viewMenu) {
      viewMenu.style.display = 'none';
    }
  }

  updateViewMenuSelection() {
    const viewMenu = document.querySelector('#nxepo-view-menu');
    if (!viewMenu) return;
    
    viewMenu.querySelectorAll('.nxepo-view-menu-item').forEach(item => {
      if (item.dataset.view === this.viewMode) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.updateViewMenuSelection();
    this.renderFiles(this.files);
    
    // Save view mode to IndexedDB
    this.saveViewMode();
  }

  // Save view mode to IndexedDB
  async saveViewMode() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const viewModeState = {
        id: 'viewMode',
        mode: this.viewMode,
        timestamp: new Date().toISOString()
      };

      await this.db.set('bucketsStore', viewModeState);
    } catch (error) {
    }
  }

  // Load view mode from IndexedDB
  async loadViewMode() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const savedViewMode = await this.db.get('bucketsStore', 'viewMode');
      
      if (savedViewMode && savedViewMode.mode) {
        // Validate view mode is valid
        const validModes = ['extra-large', 'large', 'medium', 'small', 'list', 'details', 'tiles', 'content'];
        if (validModes.includes(savedViewMode.mode)) {
          this.viewMode = savedViewMode.mode;
          
          // Update view menu selection immediately
          this.updateViewMenuSelection();
        }
      }
    } catch (error) {
      // Continue with default view mode
    }
  }

  // This method is now replaced by getFolderItems() which uses IndexedDB
  // Keeping for backward compatibility but not used
  getFolderContents(path) {
    // This method is deprecated - use getFolderItems() instead
    return [];
  }

  renderFiles(files) {
    if (!this.container) return;

    // Show empty state if no files
    if (!files || files.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Determine which view to use
    if (['extra-large', 'large', 'medium', 'small', 'tiles'].includes(this.viewMode)) {
      this.renderGridView(files);
    } else if (this.viewMode === 'list' || this.viewMode === 'details') {
      this.renderListView(files);
    } else if (this.viewMode === 'content') {
      this.renderContentView(files);
    } else {
      // Default to medium grid
      this.renderGridView(files);
    }
  }

  renderEmptyState() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="nxepo-empty-state">
        <div class="nxepo-empty-state-icon">
          <span class="material-icons">folder_open</span>
        </div>
        <div class="nxepo-empty-state-text">This folder is empty</div>
        <div class="nxepo-empty-state-hint">Right-click to create a new folder or file</div>
      </div>
    `;
  }

  // Add single item to view without re-rendering all files
  addItemToView(file) {
    if (!this.container) return;

    // If currently showing empty state, remove it
    const emptyState = this.container.querySelector('.nxepo-empty-state');
    if (emptyState) {
      emptyState.remove();
    }

    // Get the appropriate container based on view mode
    let container = null;
    if (['extra-large', 'large', 'medium', 'small', 'tiles'].includes(this.viewMode)) {
      let gridView = this.container.querySelector('.nxepo-grid-view');
      if (!gridView) {
        // Create grid view if it doesn't exist
        const gridSizeClass = `nxepo-grid-view-${this.viewMode}`;
        gridView = document.createElement('div');
        gridView.className = `nxepo-grid-view ${gridSizeClass}`;
        this.container.appendChild(gridView);
      }
      container = gridView;
      
      // Create file item HTML
      const icon = file.type === 'folder' ? this.getIcon('folder') : this.getFileIcon(file.name);
      const color = file.type === 'folder' ? '#ffa726' : this.getFileColor(file.name);
      const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
      
      const itemHTML = `
        <div class="nxepo-file-item" data-name="${file.name}" data-type="${file.type}" draggable="true">
          <div class="nxepo-file-icon" style="color: ${color};">
            ${isImageIcon ? `<img src="${icon}" alt="${file.name}" />` : `<span class="material-icons">${icon}</span>`}
          </div>
          <div class="nxepo-file-name" title="${file.name}">${file.name}</div>
        </div>
      `;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = itemHTML;
      const newItem = tempDiv.firstElementChild;
      container.appendChild(newItem);
      
      // Add event handlers
      this.attachItemEventHandlers(newItem);
      
    } else if (this.viewMode === 'list' || this.viewMode === 'details') {
      let listView = this.container.querySelector('.nxepo-list-view');
      if (!listView) {
        listView = document.createElement('div');
        listView.className = `nxepo-list-view ${this.viewMode === 'details' ? 'nxepo-list-view-details' : ''}`;
        if (this.viewMode === 'details') {
          listView.innerHTML = `
            <div class="nxepo-list-header">
              <div class="nxepo-list-col-name">Name</div>
              <div class="nxepo-list-col-date">Date modified</div>
              <div class="nxepo-list-col-type">Type</div>
              <div class="nxepo-list-col-size">Size</div>
            </div>
          `;
        }
        const listBody = document.createElement('div');
        listBody.className = 'nxepo-list-body';
        listView.appendChild(listBody);
        this.container.appendChild(listView);
      }
      container = listView.querySelector('.nxepo-list-body') || listView;
      
      const icon = file.type === 'folder' ? this.getIcon('folder') : this.getFileIcon(file.name);
      const color = file.type === 'folder' ? '#ffa726' : this.getFileColor(file.name);
      const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
      const showDetails = this.viewMode === 'details';
      
      const itemHTML = `
        <div class="nxepo-list-item" data-name="${file.name}" data-type="${file.type}" draggable="true">
          <div class="nxepo-list-col-name">
            ${isImageIcon ? `<img src="${icon}" alt="${file.name}" class="nxepo-list-icon" style="width: 20px; height: 20px; object-fit: contain; margin-right: 8px;" />` : `<span class="material-icons nxepo-list-icon" style="color: ${color};">${icon}</span>`}
            <span>${file.name}</span>
          </div>
          ${showDetails ? `
          <div class="nxepo-list-col-date">${file.modified}</div>
          <div class="nxepo-list-col-type">${file.type === 'folder' ? 'File folder' : 'File'}</div>
          <div class="nxepo-list-col-size">${file.size}</div>
          ` : ''}
        </div>
      `;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = itemHTML;
      const newItem = tempDiv.firstElementChild;
      container.appendChild(newItem);
      
      // Add event handlers
      this.attachItemEventHandlers(newItem);
      
    } else if (this.viewMode === 'content') {
      let contentView = this.container.querySelector('.nxepo-content-view');
      if (!contentView) {
        contentView = document.createElement('div');
        contentView.className = 'nxepo-content-view';
        this.container.appendChild(contentView);
      }
      container = contentView;
      
      const icon = file.type === 'folder' ? this.getIcon('folder') : this.getFileIcon(file.name);
      const color = file.type === 'folder' ? '#ffa726' : this.getFileColor(file.name);
      const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
      
      const itemHTML = `
        <div class="nxepo-content-item" data-name="${file.name}" data-type="${file.type}" draggable="true">
          <div class="nxepo-content-icon" style="color: ${color};">
            ${isImageIcon ? `<img src="${icon}" alt="${file.name}" style="width: 24px; height: 24px; object-fit: contain;" />` : `<span class="material-icons">${icon}</span>`}
          </div>
          <div class="nxepo-content-info">
            <div class="nxepo-content-name">${file.name}</div>
            <div class="nxepo-content-meta">
              <span>${file.type === 'folder' ? 'File folder' : 'File'}</span>
              ${file.size ? `<span>•</span><span>${file.size}</span>` : ''}
            </div>
          </div>
        </div>
      `;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = itemHTML;
      const newItem = tempDiv.firstElementChild;
      container.appendChild(newItem);
      
      // Add event handlers
      this.attachItemEventHandlers(newItem);
    }
    
    // Add to files array
    this.files.push(file);
  }

  // Remove single item from view without re-rendering all files
  removeItemFromView(fileName) {
    if (!this.container) return;
    
    // Find and remove item from DOM based on view mode
    const item = this.container.querySelector(`[data-name="${fileName}"]`);
    if (item) {
      item.remove();
      
      // Remove from files array
      const fileIndex = this.files.findIndex(f => f.name === fileName);
      if (fileIndex !== -1) {
        this.files.splice(fileIndex, 1);
      }
      
      // If no items left, show empty state
      const remainingItems = this.container.querySelectorAll('.nxepo-file-item, .nxepo-list-item, .nxepo-content-item');
      if (remainingItems.length === 0) {
        this.renderEmptyState();
      }
    }
  }

  // Attach event handlers to a single item
  attachItemEventHandlers(item) {
    // Prevent drag on child elements
    item.querySelectorAll('.nxepo-file-icon, .nxepo-file-name, .nxepo-list-icon, .nxepo-content-icon, img, span').forEach(child => {
      child.setAttribute('draggable', 'false');
      child.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
      });
    });

    item.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey) {
        this.toggleSelection(item.dataset.name);
      } else {
        this.selectFile(item.dataset.name, item.dataset.type);
      }
    });

    item.addEventListener('dblclick', () => {
      if (this.isRecycleBinView) {
        return;
      }
      if (item.dataset.type === 'folder') {
        this.navigateToPath([...this.currentPath, item.dataset.name]);
      } else {
        this.openFile(item.dataset.name);
      }
    });
  }

  renderGridView(files) {
    // Set grid class based on view mode
    const gridSizeClass = `nxepo-grid-view-${this.viewMode}`;
    
    this.container.innerHTML = `
      <div class="nxepo-grid-view ${gridSizeClass}">
        ${files.map(file => {
          const icon = file.type === 'folder' ? this.getIcon('folder') : this.getFileIcon(file.name);
          const color = file.type === 'folder' ? '#ffa726' : this.getFileColor(file.name);
          const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
          return `
          <div class="nxepo-file-item" data-name="${file.name}" data-type="${file.type}" draggable="true">
            <div class="nxepo-file-icon" style="color: ${color};">
              ${isImageIcon ? `<img src="${icon}" alt="${file.name}" />` : `<span class="material-icons">${icon}</span>`}
            </div>
            <div class="nxepo-file-name" title="${file.name}">${file.name}</div>
          </div>
        `;
        }).join('')}
      </div>
    `;

    // Add click handlers
    this.container.querySelectorAll('.nxepo-file-item').forEach(item => {
      // Prevent drag on child elements (icon, text) - only allow on item itself
      item.querySelectorAll('.nxepo-file-icon, .nxepo-file-name, img, span').forEach(child => {
        child.setAttribute('draggable', 'false');
        // Prevent dragstart on child elements
        child.addEventListener('dragstart', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });
      });

      item.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
          this.toggleSelection(item.dataset.name);
        } else {
          this.selectFile(item.dataset.name, item.dataset.type);
        }
      });

      item.addEventListener('dblclick', () => {
        // In Recycle Bin, double-click doesn't open files
        if (this.isRecycleBinView) {
          // Optionally show properties or restore
          return;
        }
        if (item.dataset.type === 'folder') {
          this.navigateToPath([...this.currentPath, item.dataset.name]);
        } else {
          this.openFile(item.dataset.name);
        }
      });
    });
  }

  renderListView(files) {
    const showDetails = this.viewMode === 'details';
    
    this.container.innerHTML = `
      <div class="nxepo-list-view ${showDetails ? 'nxepo-list-view-details' : ''}">
        ${showDetails ? `
        <div class="nxepo-list-header">
          <div class="nxepo-list-col-name">Name</div>
          <div class="nxepo-list-col-date">Date modified</div>
          <div class="nxepo-list-col-type">Type</div>
          <div class="nxepo-list-col-size">Size</div>
        </div>
        ` : ''}
        <div class="nxepo-list-body">
          ${files.map(file => {
            const icon = file.type === 'folder' ? this.getIcon('folder') : this.getFileIcon(file.name);
            const color = file.type === 'folder' ? '#ffa726' : this.getFileColor(file.name);
            const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
            return `
            <div class="nxepo-list-item" data-name="${file.name}" data-type="${file.type}" draggable="true">
              <div class="nxepo-list-col-name">
                ${isImageIcon ? `<img src="${icon}" alt="${file.name}" class="nxepo-list-icon" style="width: 20px; height: 20px; object-fit: contain; margin-right: 8px;" />` : `<span class="material-icons nxepo-list-icon" style="color: ${color};">${icon}</span>`}
                <span>${file.name}</span>
              </div>
              ${showDetails ? `
              <div class="nxepo-list-col-date">${file.modified}</div>
              <div class="nxepo-list-col-type">${file.type === 'folder' ? 'File folder' : 'File'}</div>
              <div class="nxepo-list-col-size">${file.size}</div>
              ` : ''}
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;

    // Add click handlers
    this.container.querySelectorAll('.nxepo-list-item').forEach(item => {
      // Prevent drag on child elements
      item.querySelectorAll('.nxepo-list-col-name, .nxepo-list-icon, img, span').forEach(child => {
        child.setAttribute('draggable', 'false');
        child.addEventListener('dragstart', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });
      });

      item.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
          this.toggleSelection(item.dataset.name);
        } else {
          this.selectFile(item.dataset.name, item.dataset.type);
        }
      });

      item.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        // In Recycle Bin, double-click doesn't open files
        if (this.isRecycleBinView) {
          // Optionally show properties or restore
          return;
        }
        const name = item.dataset.name;
        const type = item.dataset.type;
        
        if (type === 'folder') {
          this.navigateToPath([...this.currentPath, name]);
        } else {
          this.openFile(name);
        }
      });
      
      // Also allow Enter key to open
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.target.closest('input')) {
          e.preventDefault();
          const name = item.dataset.name;
          const type = item.dataset.type;
          
          if (type === 'folder') {
            this.navigateToPath([...this.currentPath, name]);
          } else {
            this.openFile(name);
          }
        }
      });
      
      // Make items focusable for keyboard navigation
      item.setAttribute('tabindex', '0');
    });
  }

  renderContentView(files) {
    this.container.innerHTML = `
      <div class="nxepo-content-view">
        ${files.map(file => {
          const icon = file.type === 'folder' ? this.getIcon('folder') : this.getFileIcon(file.name);
          const color = file.type === 'folder' ? '#ffa726' : this.getFileColor(file.name);
          const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
          return `
          <div class="nxepo-content-item" data-name="${file.name}" data-type="${file.type}" draggable="true">
            <div class="nxepo-content-icon" style="color: ${color};">
              ${isImageIcon ? `<img src="${icon}" alt="${file.name}" style="width: 24px; height: 24px; object-fit: contain;" />` : `<span class="material-icons">${icon}</span>`}
            </div>
            <div class="nxepo-content-info">
              <div class="nxepo-content-name">${file.name}</div>
              <div class="nxepo-content-meta">
                <span>${file.type === 'folder' ? 'File folder' : 'File'}</span>
                <span>•</span>
                <span>${file.modified}</span>
                ${file.type !== 'folder' ? `<span>•</span><span>${file.size}</span>` : ''}
              </div>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;

    // Add click handlers
    this.container.querySelectorAll('.nxepo-content-item').forEach(item => {
      // Prevent drag on child elements
      item.querySelectorAll('.nxepo-content-icon, .nxepo-content-info, .nxepo-content-name, img, span').forEach(child => {
        child.setAttribute('draggable', 'false');
        child.addEventListener('dragstart', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });
      });

      item.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
          this.toggleSelection(item.dataset.name);
        } else {
          this.selectFile(item.dataset.name, item.dataset.type);
        }
      });

      item.addEventListener('dblclick', () => {
        // In Recycle Bin, double-click doesn't open files
        if (this.isRecycleBinView) {
          // Optionally show properties or restore
          return;
        }
        if (item.dataset.type === 'folder') {
          this.navigateToPath([...this.currentPath, item.dataset.name]);
        } else {
          this.openFile(item.dataset.name);
        }
      });
    });
  }

  selectFile(name, type) {
    this.selectedFiles.clear();
    this.selectedFiles.add(name);
    this.updateSelection();
    
    if (type === 'folder') {
      // Could navigate or show preview
    }
  }

  toggleSelection(name) {
    if (this.selectedFiles.has(name)) {
      this.selectedFiles.delete(name);
    } else {
      this.selectedFiles.add(name);
    }
    this.updateSelection();
  }

  updateSelection() {
    // Update visual selection
    this.container.querySelectorAll('.nxepo-file-item, .nxepo-list-item, .nxepo-content-item').forEach(item => {
      if (this.selectedFiles.has(item.dataset.name)) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  async openFile(name, isNewTab = false) {
    if (!name) return;
    
    // Find file info
    const file = this.files.find(f => f.name === name);
    if (!file) {
      return;
    }
    
    // Handle folders - can be opened in tabs
    if (file.type === 'folder') {
      // If opening in new tab, create folder tab
      if (isNewTab) {
        // Save current folder view state
        if (this.tabs.length === 0) {
          this.folderViewState = {
            path: [...this.currentPath],
            files: [...this.files]
          };
        }
        
        // Check if folder is already open in a tab
        const folderPath = [...this.currentPath, name];
        const existingTab = this.tabs.find(tab => 
          tab.isFolder && 
          tab.folderPath && 
          tab.folderPath.join('/') === folderPath.join('/')
        );
        
        if (existingTab) {
          // Folder already open - switch to it
          await this.switchTab(existingTab.id);
          return;
        }
        
        // Create new folder tab
        const tabId = await this.addTab(name, file, false, folderPath); // false = don't activate, pass folderPath
        this.updateTabBar();
        return;
      } else {
        // Regular "Open" - navigate to folder (replace current view)
        this.navigateToPath([...this.currentPath, name]);
        return;
      }
    }
    
    // Check if PDF, Image, Music, or Video - need to check bucketsStore first before opening
    const ext = name.split('.').pop()?.toLowerCase();
    const isPDF = ext === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext);
    const isMusic = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'].includes(ext);
    const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].includes(ext);
    const isOfficeDoc = ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp'].includes(ext);
    
    // Check fileSettings for Office documents (docx, xlsx, pptx, etc.)
    if (isOfficeDoc) {
      const filePathString = this.pathToString([...this.currentPath, name]);
      
      try {
        if (window.NXUI && window.NXUI.ref) {
          // Get file data from bucketsStore to get the id
          const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
          let dataform = [];
          if (Array.isArray(bucketsData)) {
            dataform = bucketsData;
          } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
            dataform = bucketsData.data;
          } else if (bucketsData && bucketsData.id === "fileContents") {
            dataform = bucketsData.data || [];
          }
          
          // Find file data to get its id - PASTIKAN hanya menggunakan fileId (path lengkap)
          const fileData = dataform.find(item => item.fileId === filePathString);
          
          // Check if file already has content (already uploaded)
          const hasContent = fileData && fileData.content && fileData.content.trim() !== '';
          
          if (fileData && fileData.id) {
            // Get fileSettings using data.id as key
            const fileSettings = await window.NXUI.ref.get("fileSettings", fileData.id);
            
            // Only show modal if status is true AND file doesn't have content yet
            if (fileSettings && fileSettings.status === true && !hasContent) {
              // File requires upload - show upload modal
              this.showUploadModal(name, filePathString, false, ext);
              return;
            }
            // If file has content OR status is false, continue to open file normally
          } else {
            // If file not found in bucketsStore, check using generated key
            const fileKey = this.generateFileKey(filePathString);
            const fileSettings = await window.NXUI.ref.get("fileSettings", fileKey);
            
            // Only show modal if status is true (file not in bucketsStore means no content)
            if (fileSettings && fileSettings.status === true) {
              // File requires upload - show upload modal
              this.showUploadModal(name, filePathString, false, ext);
              return;
            }
            // If status is false or no fileSettings, continue to open file normally
          }
        }
      } catch (e) {
        // If error, continue with normal file opening
      }
    }
    
    if (isPDF || isImage || isMusic || isVideo) {
      // Check if content exists in bucketsStore
      let dataform = null;
      try {
        if (window.NXUI && window.NXUI.ref) {
          const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
          // Handle different data formats
          if (Array.isArray(bucketsData)) {
            dataform = bucketsData;
          } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
            dataform = bucketsData.data;
          } else if (bucketsData && bucketsData.id === "fileContents") {
            dataform = bucketsData.data || [];
          }
        }
      } catch (e) {
      }
      
      // Check if file content exists for this specific file
      const filePathString = this.pathToString([...this.currentPath, name]);
      let fileContentExists = false;
      if (dataform && Array.isArray(dataform)) {
        // PASTIKAN hanya menggunakan fileId (path lengkap) untuk menghindari file dengan nama sama di path berbeda
        const matchingItem = dataform.find(item => item.fileId === filePathString);
        // Check if content exists and is not empty
        if (matchingItem) {
          if (isMusic || isVideo) {
            // For Music/Video, check if content (YouTube ID) exists
            fileContentExists = matchingItem.content && matchingItem.content.trim() !== '';
          } else {
            // For PDF/Image, check if content (base64) exists
            fileContentExists = matchingItem.content && matchingItem.content.trim() !== '';
          }
        }
      }
      
      if (!fileContentExists) {
        // Don't open file if content doesn't exist - show appropriate modal
        if (isMusic || isVideo) {
          // Show YouTube link modal for Music/Video
          this.showYouTubeModal(name, filePathString, isVideo);
        } else {
          // Show upload modal for PDF/Image
          this.showUploadModal(name, filePathString, isPDF, ext);
        }
        return;
      }
    }
    
    // Add visual feedback
    const fileItem = this.container.querySelector(`[data-name="${name}"]`);
    if (fileItem) {
      fileItem.style.transform = 'scale(0.95)';
      setTimeout(() => {
        fileItem.style.transform = '';
      }, 200);
    }
    
    // Always save folder view state when opening files (for restore later)
    if (this.tabs.length === 0) {
      this.folderViewState = {
        path: [...this.currentPath],
        files: [...this.files]
      };
    }
    
    // Check if file is already open in a tab
    const existingTab = this.tabs.find(tab => 
      tab.name === name && 
      tab.path.join('/') === [...this.currentPath, name].join('/')
    );
    
    if (existingTab) {
      // File already open - switch to it
      if (isNewTab) {
        // If "Open in new tab" but file already open, just switch to it
        await this.switchTab(existingTab.id);
        return;
      } else {
        // If "Open" and file already open, switch to it
        await this.switchTab(existingTab.id);
        return;
      }
    }
    
    // Create new tab or replace current tab
    if (isNewTab) {
      // "Open in new tab" - Create tab but KEEP folder view visible (don't activate it)
      const tabId = await this.addTab(name, file, false); // false = don't activate
      // Don't load file content immediately - user can click tab later
      // Folder view stays visible
      
      // Ensure folder view is still visible (don't replace with file content)
      // Just update tab bar to show new tab
      this.updateTabBar();
      
      // Verify folder view is still visible
      if (!this.container.innerHTML.includes('nxepo-grid-view') && 
          !this.container.innerHTML.includes('nxepo-list-view') &&
          !this.container.innerHTML.includes('nxepo-content-view')) {
        // Folder view was lost, restore it
        this.restoreFolderView();
      }
      
      // Keep folder view visible - don't switch to tab
      // User can click tab later to view file
      
    } else {
      // "Open" - Create NEW tab and IMMEDIATELY show file content (always create new tab, don't replace)
      // This way user can have multiple files open and switch between them
      const tabId = await this.addTab(name, file, true); // true = activate immediately
      
      // Save state with file info
      this.saveState({ 
        path: this.currentPath, 
        type: 'file', 
        fileName: name,
        fileType: file.type 
      });
      
      // IMMEDIATELY show file content (replaces folder view)
      this.showFileContent(name, file);
    }
    
    // Log activity for file opening
    const filePath = [...this.currentPath, name];
    await this.logActivity('open', this.pathToString(filePath), file.type);
    
    // Dispatch custom event for file opening
    const openEvent = new CustomEvent('fileopen', {
      detail: {
        name: name,
        type: file.type,
        path: filePath,
        file: file,
        isNewTab: isNewTab
      }
    });
    document.dispatchEvent(openEvent);
    
    // You can add your custom file opening logic here
    // For example: open in editor, preview, etc.
    if (typeof this.onFileOpen === 'function') {
      this.onFileOpen(name, file);
    }
  }
  
  // Add new tab
  async addTab(name, file, activate = true, folderPath = null) {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const isFolder = file.type === 'folder';
    
    const tab = {
      id: tabId,
      name: name,
      file: file,
      path: folderPath || [...this.currentPath, name],
      isFolder: isFolder, // Mark if this is a folder tab
      folderPath: folderPath || (isFolder ? [...this.currentPath, name] : null), // Store folder path for folder tabs
      content: null // Will be loaded when tab is active (folder content or file content)
    };
    
    this.tabs.push(tab);
    
    // Only activate if requested (for "Open in new tab", we don't activate)
    if (activate) {
      this.activeTabId = tabId;
    }
    
    // Save tabs state to IndexedDB
    await this.saveTabsState();
    
    this.updateTabBar();
    return tabId;
  }
  
  // Remove tab
  async removeTab(tabId) {
    const tabIndex = this.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    
    this.tabs.splice(tabIndex, 1);
    
    // If closing active tab, switch to another tab or show folder view
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        // Switch to last tab or previous tab
        const newActiveTab = this.tabs[this.tabs.length - 1];
        await this.switchTab(newActiveTab.id);
      } else {
        // No more tabs, show folder view
        this.activeTabId = null;
        this.currentFile = null;
        this.restoreFolderView();
      }
    }
    
    // Save tabs state to IndexedDB (tabs removed)
    await this.saveTabsState();
    
    this.updateTabBar();
  }
  
  // Switch to a tab
  async switchTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    this.activeTabId = tabId;
    
    // Handle folder tabs vs file tabs
    if (tab.isFolder && tab.folderPath) {
      // This is a folder tab - navigate to folder and load its contents
      this.currentFile = null; // No file, it's a folder
      
      // Save tabs state (active tab changed)
      await this.saveTabsState();
      
      // Navigate to folder path
      const folderPath = [...tab.folderPath];
      this.currentPath = folderPath;
      this.updateBreadcrumb();
      
      // Load folder contents
      if (!tab.content) {
        // First time opening this folder tab - load folder contents
        await this.loadFilesForTab(tab);
      } else {
        // Restore saved folder content
        this.container.innerHTML = tab.content;
        // Also restore files array for proper functionality
        if (tab.folderFiles) {
          this.files = [...tab.folderFiles];
        }
      }
      
      // Save state
      this.saveState({ 
        path: folderPath, 
        type: 'folder'
      });
      
    } else {
      // This is a file tab - show file content
      this.currentFile = { name: tab.name, file: tab.file, path: tab.path };
      
      // Save state with file info
      this.saveState({ 
        path: this.currentPath, 
        type: 'file', 
        fileName: tab.name,
        fileType: tab.file.type 
      });
      
      // Save tabs state (active tab changed)
      await this.saveTabsState();
      
      // Load tab content if not loaded
      if (!tab.content) {
        // Load file content (this will replace folder view)
        this.showFileContent(tab.name, tab.file);
      } else {
        // Restore tab content (replaces folder view)
        if (this.container) {
          this.container.innerHTML = tab.content;
          
          // Ensure container is visible
          if (this.container.style.display === 'none') {
            this.container.style.display = 'block';
          }
          
          // Re-initialize Office documents if needed (they require JS initialization)
          const ext = tab.name.split('.').pop()?.toLowerCase();
          const isOfficeDoc = ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp', 'txt'].includes(ext);
          
          if (isOfficeDoc && tab.file && tab.file.id) {
            // Get app explorer settings for file type
            try {
              const appExplorer = await window.NXUI.ref.get("bucketsStore", 'explorer');
              const type = ext;
              const initApp = appExplorer?.data?.[type] || appExplorer?.[type];
              
              // Wait for DOM to be ready
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Re-initialize based on app type
              if (initApp && initApp.app === 'Reactive') {
                const contentElement = document.querySelector(`#${tab.file.id}`);
                const toolbarElement = document.querySelector(`#toolbar-${tab.file.id}`);
                if (contentElement && toolbarElement) {
                  await this.initializeNexaInteract(tab.file);
                }
              } else if (initApp && initApp.app === 'Spreadsheet') {
                const toolbarElement = document.querySelector(`#toolbar-${tab.file.id}`);
                const targetElement = document.querySelector(`#${tab.file.id}`);
                if (toolbarElement && targetElement) {
                  // Ensure height is calculated
                  if (!this.height) {
                    await this.initDimensi();
                  }
                  
                  // Check if already initialized (has instance)
                  if (!tab.xlsxInstance) {
                    // Calculate height - use base height (e.g., 65.47vh) or maximized height
                    let heightToUse = this.height; // Use calculated height (e.g., 65.47vh)
                    
                    if (this.isMaximized) {
                      const toolbarHeight = toolbarElement.offsetHeight || 0;
                      const tabBarHeight = document.querySelector('#nxepo-file-tab-bar')?.offsetHeight || 0;
                      // Increase reserved height to prevent overflow
                      const reservedHeight = toolbarHeight + tabBarHeight + 40; // Increased from 20 to 40
                      
                      // Calculate in vh units for consistency
                      const viewportHeight = window.innerHeight;
                      const availableHeightPx = viewportHeight - reservedHeight;
                      const availableHeightVh = (availableHeightPx / viewportHeight) * 100;
                      heightToUse = `${availableHeightVh.toFixed(2)}vh`;
                    }
                    
                    await this.initializeNexaXlsx(tab.file, heightToUse);
                  } else {
                    // Already initialized, just update height if needed
                    if (this.isMaximized) {
                      const toolbarHeight = toolbarElement.offsetHeight || 0;
                      const tabBarHeight = document.querySelector('#nxepo-file-tab-bar')?.offsetHeight || 0;
                      // Increase reserved height to prevent overflow
                      const reservedHeight = toolbarHeight + tabBarHeight + 40; // Increased from 20 to 40
                      
                      // Calculate in vh units for consistency
                      const viewportHeight = window.innerHeight;
                      const availableHeightPx = viewportHeight - reservedHeight;
                      const availableHeightVh = (availableHeightPx / viewportHeight) * 100;
                      const newHeight = `${availableHeightVh.toFixed(2)}vh`;
                      
                      if (tab.xlsxInstance.height !== newHeight) {
                        tab.xlsxInstance.height = newHeight;
                        const xlsxContainer = document.querySelector(`#${tab.file.id}`);
                        if (xlsxContainer) {
                          const containerElement = xlsxContainer.querySelector('.nexa-xlsx-container');
                          if (containerElement) {
                            containerElement.style.height = newHeight;
                          }
                        }
                      }
                    } else {
                      // Not maximized, use base height
                      const baseHeight = this.height;
                      if (tab.xlsxInstance.height !== baseHeight) {
                        tab.xlsxInstance.height = baseHeight;
                        const xlsxContainer = document.querySelector(`#${tab.file.id}`);
                        if (xlsxContainer) {
                          const containerElement = xlsxContainer.querySelector('.nexa-xlsx-container');
                          if (containerElement) {
                            containerElement.style.height = baseHeight;
                          }
                        }
                      }
                    }
                  }
                }
              } else if (initApp && initApp.app === 'Presentation') {
                const contentElement = document.querySelector(`#${tab.file.id}`);
                const toolbarElement = document.querySelector(`#toolbar-${tab.file.id}`);
                if (contentElement && toolbarElement) {
                  await this.initializeNexaPptx(tab.file, this.height);
                }
              } else if (initApp && initApp.app === 'Text') {
                await this.initializeNexaText(tab.file, this.height);
              }
            } catch (e) {
              // Continue even if initialization fails
            }
          }
        }
      }
      
      // Update file tab bar
      this.showFileTabBar(tab.name, tab.file);
    }
    
    this.updateTabBar();
  }
  
  // Load folder contents for a folder tab
  async loadFilesForTab(tab) {
    try {
      // Get folder items from IndexedDB
      const folderPathString = tab.folderPath.join('/');
      const items = await this.getFolderItems(folderPathString);
      
      // Convert to files format
      this.files = items.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size || '-',
        modified: item.modified || '2024-01-01',
        path: item.path,
        data: item.data
      }));
      
      // Render folder contents based on current view mode
      // Use the same rendering logic as regular navigation
      if (this.viewMode === 'list' || this.viewMode === 'details') {
        this.renderListView(this.files);
      } else if (this.viewMode === 'content' || this.viewMode === 'tiles') {
        this.renderContentView(this.files);
      } else {
        this.renderGridView(this.files);
      }
      
      // Save rendered content to tab
      tab.content = this.container.innerHTML;
      tab.folderFiles = [...this.files];
      
      // Save tabs state
      await this.saveTabsState();
    } catch (error) {
      this.container.innerHTML = `<div class="nxepo-error">Error loading folder: ${error.message}</div>`;
    }
  }
  
  // Restore folder view
  restoreFolderView() {
    if (this.folderViewState.path && this.folderViewState.path.length > 0) {
      this.currentPath = [...this.folderViewState.path];
      this.files = [...this.folderViewState.files];
      this.updateBreadcrumb();
      this.renderFiles(this.files);
    } else {
      // Fallback to current path
      this.loadFiles();
    }
    
    // Hide tab bar
    const tabBar = document.querySelector('#nxepo-file-tab-bar');
    if (tabBar) {
      tabBar.style.display = 'none';
    }
  }
  
  // Update tab bar UI
  updateTabBar() {
    const tabBar = document.querySelector('#nxepo-file-tab-bar');
    if (!tabBar) return;
    
    // If no tabs, hide tab bar and show folder view
    if (this.tabs.length === 0) {
      tabBar.style.display = 'none';
      // Restore folder view if needed
      if (!this.currentFile || !this.activeTabId) {
        this.restoreFolderView();
      }
      return;
    }
    
    // Show tab bar - ALWAYS visible when there are tabs
    tabBar.style.display = 'flex';
    
    // If no active tab, ensure folder view is visible
    if (!this.activeTabId && this.tabs.length > 0) {
      // We have tabs but none are active - show folder view
      if (!this.container.innerHTML.includes('nxepo-grid-view') && 
          !this.container.innerHTML.includes('nxepo-list-view') &&
          !this.container.innerHTML.includes('nxepo-content-view')) {
        // Container doesn't show folder view, restore it
        this.restoreFolderView();
      }
    }
    
    // Hide or remove old single tab info (if exists)
    const tabInfo = tabBar.querySelector('.nxepo-file-tab-info');
    if (tabInfo) {
      tabInfo.style.display = 'none';
    }
    
    // Create tabs container if doesn't exist
    let tabsContainer = tabBar.querySelector('.nxepo-tabs-container');
    if (!tabsContainer) {
      tabsContainer = document.createElement('div');
      tabsContainer.className = 'nxepo-tabs-container';
      tabsContainer.style.cssText = `
        display: flex;
        gap: 4px;
        overflow-x: auto;
        overflow-y: hidden;
        flex: 1;
        padding: 4px;
        min-width: 0;
        scrollbar-width: thin;
      `;
      
      // Insert before tab actions
      const tabActions = tabBar.querySelector('.nxepo-file-tab-actions');
      if (tabActions) {
        tabBar.insertBefore(tabsContainer, tabActions);
      } else {
        tabBar.insertBefore(tabsContainer, tabBar.firstChild);
      }
    }
    
    // Always show tabs container when there are tabs
    tabsContainer.style.display = 'flex';
    tabsContainer.style.visibility = 'visible';
    
    // Clear and rebuild tabs
    tabsContainer.innerHTML = '';
    
    this.tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = `nxepo-tab-item ${tab.id === this.activeTabId ? 'active' : ''}`;
      tabElement.dataset.tabId = tab.id;
      tabElement.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: ${tab.id === this.activeTabId ? '#e3f2fd' : '#f5f5f5'};
        border: 1px solid ${tab.id === this.activeTabId ? '#2196f3' : '#ddd'};
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        min-width: 120px;
        max-width: 200px;
        position: relative;
      `;
      
      // Tab icon - use folder icon for folder tabs, file icon for file tabs
      let icon;
      if (tab.isFolder) {
        // Use folder icon from Icon.js
        icon = this.getIcon('folder');
      } else {
        // Use file icon based on file type
        icon = this.getFileIcon(tab.name);
      }
      
      const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
      const iconHTML = isImageIcon 
        ? `<img src="${icon}" alt="${tab.name}" style="width: 16px; height: 16px; object-fit: contain;" />`
        : `<span class="material-icons" style="font-size: 16px;">${icon || 'description'}</span>`;
      
      // Tab name (truncated)
      const truncatedName = tab.name.length > 15 ? tab.name.substring(0, 12) + '...' : tab.name;
      
      tabElement.innerHTML = `
        ${iconHTML}
        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px;">${truncatedName}</span>
        <button class="nxepo-tab-close" data-tab-id="${tab.id}" style="
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          opacity: 0.6;
        " title="Close tab">
          <span class="material-icons" style="font-size: 16px;">close</span>
        </button>
      `;
      
      // Tab click handler
      tabElement.addEventListener('click', async (e) => {
        if (!e.target.closest('.nxepo-tab-close')) {
          await this.switchTab(tab.id);
        }
      });
      
      // Close button handler
      const closeBtn = tabElement.querySelector('.nxepo-tab-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await this.removeTab(tab.id);
        });
      }
      
      tabsContainer.appendChild(tabElement);
    });
  }

  async showFileContent(name, file) {
    if (!this.container) return;

    const filePathString = this.pathToString([...this.currentPath, name]);
    
    // Get dataform from bucketsStore to get complete file information
    let dataform = null;
    let fileDataFromBuckets = null; // Full file data from bucketsStore
    
    // Always fetch dataform to get complete file information (same as loadFileContent)
    try {
      if (window.NXUI && window.NXUI.ref) {
        const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
        // Handle different data formats
        if (Array.isArray(bucketsData)) {
          dataform = bucketsData;
        } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
          dataform = bucketsData.data;
        } else if (bucketsData && bucketsData.id === "fileContents") {
          dataform = bucketsData.data || [];
        }
        
        // Find complete file data from bucketsStore
        if (dataform && Array.isArray(dataform)) {
          const matchingEntries = dataform.filter(item => 
            item.fileId === filePathString || item.fileName === name
          );
          if (matchingEntries.length > 0) {
            // Get the latest entry (most recent)
            fileDataFromBuckets = matchingEntries.sort((a, b) => {
              const dateA = new Date(a.uploadedAt || a.lastModified || 0);
              const dateB = new Date(b.uploadedAt || b.lastModified || 0);
              return dateB - dateA; // Descending order (newest first)
            })[0];
          }
        }
      }
    } catch (e) {
    }
    
    // Use complete file data from bucketsStore if available, otherwise use file parameter
    const completeFileData = fileDataFromBuckets || file;
    
    // Get app explorer settings for file type
    const appExplorer = await window.NXUI.ref.get("bucketsStore",'explorer');
    const type = name.split('.').pop()?.toLowerCase();
    const initApp = appExplorer?.data?.[type] || appExplorer?.[type];
    
    // Store current file info with complete data
    this.currentFile = { name, file: completeFileData, path: [...this.currentPath, name] };

    // Show file tab bar
    this.showFileTabBar(name, completeFileData);

    // Show loading state
    this.container.innerHTML = `
      <div class="nxepo-file-content-loading">
        <div class="nxepo-file-content-loading-spinner">
          <span class="material-icons">hourglass_empty</span>
        </div>
        <div>Loading file...</div>
      </div>
    `;

    // Load and display file content with complete data
    setTimeout(async () => {
      // Ensure height is initialized
      if (!this.height) {
        await this.initDimensi();
      }
      await this.loadFileContent(name, completeFileData, this.height);
    
      // Wait for DOM to be fully rendered before initializing NexaReactive
      if (initApp && initApp.app === 'Reactive') {
        // Wait for next frame to ensure DOM is ready
        await new Promise(resolve => requestAnimationFrame(() => {
          setTimeout(() => {
            // Verify elements exist before initializing
            const contentElement = document.querySelector(`#${completeFileData.id}`);
            const toolbarElement = document.querySelector(`#toolbar-${completeFileData.id}`);
            
            if (contentElement && toolbarElement) {
              this.initializeNexaInteract(completeFileData);
            }
            resolve();
          }, 100);
        }));
      }
      
      // Wait for DOM to be fully rendered before initializing NexaXlsx
      if (initApp && initApp.app === 'Spreadsheet') {
        // Wait for next frame to ensure DOM is ready
        await new Promise(resolve => requestAnimationFrame(() => {
          setTimeout(async () => {
            // Verify elements exist before initializing
            const toolbarElement = document.querySelector(`#toolbar-${completeFileData.id}`);
            const targetElement = document.querySelector(`#${completeFileData.id}`);
            
            if (toolbarElement && targetElement) {
              // Ensure height is calculated
              if (!this.height) {
                await this.initDimensi();
              }
              
              // Calculate height - use base height (e.g., 65.47vh) or maximized height
              let heightToUse = this.height; // Use calculated height (e.g., 65.47vh)
              
              if (this.isMaximized) {
                const toolbarHeight = toolbarElement.offsetHeight || 0;
                const tabBarHeight = document.querySelector('#nxepo-file-tab-bar')?.offsetHeight || 0;
                // Increase reserved height to prevent overflow
                const reservedHeight = toolbarHeight + tabBarHeight + 40; // Increased from 20 to 40
                
                // Calculate in vh units for consistency
                const viewportHeight = window.innerHeight;
                const availableHeightPx = viewportHeight - reservedHeight;
                const availableHeightVh = (availableHeightPx / viewportHeight) * 100;
                heightToUse = `${availableHeightVh.toFixed(2)}vh`;
              }
              
              await this.initializeNexaXlsx(completeFileData, heightToUse);
            }
            resolve();
          }, 100);
        }));
      }
      if (initApp && initApp.app === 'Presentation') {

        await new Promise(resolve => requestAnimationFrame(() => {
          setTimeout(() => {
            // Verify elements exist before initializing
            const contentElement = document.querySelector(`#${completeFileData.id}`);
            const toolbarElement = document.querySelector(`#toolbar-${completeFileData.id}`);
            
            if (contentElement && toolbarElement) {
              this.initializeNexaPptx(completeFileData, this.height);
            }
            resolve();
          }, 100);
        })); 
      }

      if (initApp && initApp.app === 'Text') {

        await new Promise(resolve => requestAnimationFrame(() => {
          setTimeout(() => {
            // Verify elements exist before initializing

              this.initializeNexaText(completeFileData, this.height);
           
            resolve();
          }, 100);
        })); 
      }

      // Save content to active tab AFTER all initializations are complete
      // Find tab by name and path to ensure we save to correct tab
      let matchingTab = this.tabs.find(t => 
        t.name === name && 
        (t.path.join('/') === [...this.currentPath, name].join('/') || 
         t.file?.id === completeFileData?.id)
      );
      
      // Fallback: use activeTabId if matchingTab not found
      if (!matchingTab && this.activeTabId) {
        matchingTab = this.tabs.find(t => t.id === this.activeTabId);
      }
      
      if (matchingTab && this.container) {
        // Wait a bit more to ensure DOM is fully rendered
        await new Promise(resolve => setTimeout(resolve, 200));
        matchingTab.content = this.container.innerHTML;
        // Also update file data if needed
        if (completeFileData) {
          matchingTab.file = { ...matchingTab.file, ...completeFileData };
        }
      }

    }, 200);
  }
initializeNexaText(data,height) {
const editor = new NexaText("#"+ data.id, {
          height:height,
          placeholder:`Mulai mengetik   di sini...`,
        onSave: async (saveData) => {
          await this.saveFileContent(data.id, saveData.content, data.id);
        }
});
  }
  async initializeNexaInteract(data) {
       NXUI.dataReactive=data
       const fileId = data.id;
       const editing = new NXUI.Reactive({
         target: "#" + data.id,
         mode: "edit",
         storage: false,
         packages: false,
         toolbar: "#toolbar-" + data.id,
         enableContentEditing: true, // Aktifkan content editing
         autoInit: true,
         fileName:data.fileName,
         // 🔧 KONFIGURASI ELEMENTINTERACTIONS - TAMBAHAN BARU
         enabledIds: ["content_"+data.id], // Enable interactions untuk container utama
         enabledClasses: false, // Enable untuk class Bootstrap/NexaUI
         enableGlobal: false, // Disable global, fokus pada enabled elements saja
        onSave: async (saveData) => {
          // Always pass elementId to ensure we can get content from DOM
          await this.saveFileContent(fileId, saveData.content, data.id || fileId);
        }
      });
      await this.initDimensi();
      
      // Charts akan di-initialize otomatis oleh NexaReactive.js setelah init()
      // Tidak perlu manual initialization di sini
  }

  async initializeNexaPptx(data) {
        NXUI.dataReactive=data
       const fileId = data.id;
    
    const slideShow = new NexaPptx({
      mode: "edit", // Default to edit mode for full functionality
      hideSaveButton: true, // Hide internal save button, use NexaExplorer's save button
      fileName: data.id || data.id,
      target: "#" + data.id,
      storage:data,
      packages: false,
      storageManager: this.storageManager, // Pass the storage manager for database integration
      onSave: async (saveData) => {
        // Always pass elementId to ensure we can get content from DOM
        await this.saveFileContent(fileId, saveData.content, data.id || fileId);
      }
    });
    
    try {
      await slideShow.init();
      // Make slideShow instance available globally
      window.slideShow = slideShow;
      slideShow.render();
      slideShow.rebuildThumbnails();
      slideShow.updateSlideDisplay();
      slideShow.updateNavigation();
    } catch (error) {
    }
  }

  async initializeNexaXlsx(data, height) {
    const packages = await NXUI.ref.get("bucketsStore", "packages");
    const toolbarSelector = "#toolbar-" + data.id;
    const targetSelector = "#" + data.id;
    
    // Verify elements exist before initialization
    const toolbarElement = document.querySelector(toolbarSelector);
    const targetElement = document.querySelector(targetSelector);
    
    if (!toolbarElement) {
      return;
    }
    
    if (!targetElement) {
      return;
    }
    
    // Always recalculate to get latest height from initDimensi
    await this.initDimensi();
    
    // Debug: Log base height after initDimensi
    console.log('initializeNexaXlsx - baseHeight from initDimensi:', this.height);
    
    // Calculate dynamic height - use provided height or calculated height from initDimensi
    let dynamicHeight = height;
    
    // If no height provided, use calculated height (e.g., 65.47vh)
    if (!dynamicHeight) {
      dynamicHeight = this.height; // Use calculated height (e.g., 65.47vh)
      console.log('initializeNexaXlsx - using baseHeight:', dynamicHeight);
    } else {
      console.log('initializeNexaXlsx - using provided height:', dynamicHeight);
    }
    
    // If maximized, calculate based on viewport but maintain vh-based calculation
    if (this.isMaximized) {
      const toolbarHeight = toolbarElement.offsetHeight || 0;
      const tabBarHeight = document.querySelector('#nxepo-file-tab-bar')?.offsetHeight || 0;
      // Increase reserved height significantly to prevent overflow
      const reservedHeight = toolbarHeight + tabBarHeight + 80; // Increased padding to 80px for safety
      
      // Calculate available height in vh units to maintain consistency with base height
      const viewportHeight = window.innerHeight;
      const availableHeightPx = viewportHeight - reservedHeight;
      const availableHeightVh = (availableHeightPx / viewportHeight) * 100;
      
      // Limit maximum height to 75vh to prevent overflow
      const maxHeightVh = 75;
      const calculatedHeightVh = parseFloat(availableHeightVh.toFixed(2));
      const finalHeightVh = Math.min(calculatedHeightVh, maxHeightVh);
      
      dynamicHeight = `${finalHeightVh.toFixed(2)}vh`;
      console.log('initializeNexaXlsx - maximized, calculated height:', dynamicHeight, 'reservedHeight:', reservedHeight, 'maxHeight:', maxHeightVh);
    }
    
    console.log('initializeNexaXlsx - final height:', dynamicHeight, 'isMaximized:', this.isMaximized, 'baseHeight:', this.height);
    
    const Xlsx = new NexaXlsx({
      mode: "edit", // Default to edit mode
      height: dynamicHeight || this.height,
      // excludeToolbar: [        "bold",
      //   "italic",
      //   "underline",
      //   "formatselect",
      //   "bullist",
      //   "numlist",
      //   "alignleft",
      //   "aligncenter",
      //   "alignright",
      //   "alignjustify",
      //   "undo",
      //   "redo"], // Hide save button from toolbar
      toolbar: toolbarSelector,
      storage: false,
      packages: packages,
      hideSaveButton: false,
      hideFilenameInput: true, // Hide filename input - users cannot change the preset filename
      fileName: data.fileName || data.id,
      target: targetSelector,
      rows: 25, // number
      cols: 10, // number
    });
    
    try {
      await Xlsx.init();
      
      // Store Xlsx instance in matching tab for later access (for resize/maximize)
      // Find tab by file name or file id
      const matchingTab = this.tabs.find(t => 
        (t.name === data.fileName || t.name === data.id) &&
        (t.file?.id === data.id || t.file?.fileName === data.fileName)
      );
      
      if (matchingTab) {
        matchingTab.xlsxInstance = Xlsx;
        matchingTab.xlsxData = data;
        // Store baseHeight in tab to avoid recalculation during maximize
        if (!matchingTab.baseHeight) {
          matchingTab.baseHeight = this.height; // Store the base height (e.g., 65.76vh)
        }
      } else if (this.activeTabId) {
        // Fallback: use active tab
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
          activeTab.xlsxInstance = Xlsx;
          activeTab.xlsxData = data;
          // Store baseHeight in tab to avoid recalculation during maximize
          if (!activeTab.baseHeight) {
            activeTab.baseHeight = this.height; // Store the base height (e.g., 65.76vh)
          }
        }
      }
      
      // Also store globally for easy access
      if (data.id) {
        window[`nexaXlsx_${data.id}`] = Xlsx;
      }
    } catch (error) {
    }
  }
  /**
   * Initialize NexaInteract with cleanup of previous instance
   */



  /**
   * Save file content to bucketsStore
   * @param {string} fileId - File ID to save content for
   * @param {string} content - Content to save
   * @param {string} elementId - Optional element ID for content extraction
   * @returns {Promise<boolean>} - Returns true if save successful, false otherwise
   */
  async saveFileContent(fileId, content, elementId = null) {
    try {
      let contentToSave = "";
      
      if (elementId) {
        const contentDivId = `content_${elementId}`;
        
        // ALWAYS try to get content directly from DOM element first (most reliable)
        // Wait a bit to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const domElement = document.querySelector(`#${contentDivId}`);
        if (domElement) {
          // Try multiple extraction methods and use the longest/most complete one
          const extractionMethods = [];
          
          // Method 1: innerHTML (standard method)
          const innerHTMLContent = domElement.innerHTML;
          extractionMethods.push({ method: 'innerHTML', content: innerHTMLContent, length: innerHTMLContent.length });
          
          // Method 2: Serialize children using outerHTML
          if (domElement.children.length > 0) {
            const childrenContent = Array.from(domElement.children)
              .map(child => child.outerHTML)
              .join('');
            extractionMethods.push({ method: 'children-outerHTML', content: childrenContent, length: childrenContent.length });
          }
          
          // Method 3: Get all nodes including text nodes
          if (domElement.childNodes.length > 0) {
            const nodesContent = Array.from(domElement.childNodes)
              .map(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  return node.outerHTML;
                } else if (node.nodeType === Node.TEXT_NODE) {
                  return node.textContent;
                }
                return '';
              })
              .join('');
            extractionMethods.push({ method: 'all-nodes', content: nodesContent, length: nodesContent.length });
          }
          
          // Method 4: XMLSerializer
          if (typeof XMLSerializer !== 'undefined') {
            try {
              const serializer = new XMLSerializer();
              const serializedContent = Array.from(domElement.children)
                .map(child => serializer.serializeToString(child))
                .join('');
              extractionMethods.push({ method: 'XMLSerializer', content: serializedContent, length: serializedContent.length });
            } catch (e) {
              console.warn('⚠️ XMLSerializer failed:', e);
            }
          }
          
          // Compare with provided content parameter
          if (content && content.length > 0) {
            // Try to extract from provided content if it contains the wrapper
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const contentDiv = tempDiv.querySelector(`#${contentDivId}`);
            if (contentDiv) {
              extractionMethods.push({ 
                method: 'provided-content-parsed', 
                content: contentDiv.innerHTML, 
                length: contentDiv.innerHTML.length 
              });
            } else {
              // Use provided content as-is if it doesn't have wrapper
              extractionMethods.push({ 
                method: 'provided-content-direct', 
                content: content, 
                length: content.length 
              });
            }
          }
          
          // Find the method with the longest content (most complete)
          const bestMethod = extractionMethods.reduce((best, current) => 
            current.length > best.length ? current : best
          );
          
          contentToSave = bestMethod.content;
          
        } else {
          // Fallback: Use DOM method to parse the HTML string from parameter
          if (content) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const contentDiv = tempDiv.querySelector(`#${contentDivId}`);
            
            if (contentDiv) {
              // Get all inner HTML including nested divs
              contentToSave = contentDiv.innerHTML;
            } else {
              // If content doesn't contain the wrapper div, use it as-is
              contentToSave = content;
            }
          } else {
            contentToSave = content || "";
          }
        }
      } else {
        // No elementId provided, use content parameter as-is
        contentToSave = content || "";
      }
      
      // Get fileContents from bucketsStore
      const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
      let dataform = bucketsData?.data || [];
      
      // Find entry by id
      const fileIndex = dataform.findIndex(item => item.id === fileId);
      if (fileIndex !== -1) {
        // Update existing entry
        dataform[fileIndex].content = contentToSave;
        dataform[fileIndex].lastModified = new Date().toISOString();
        
        // Save back to bucketsStore
        if (bucketsData && bucketsData.id === "fileContents") {
          bucketsData.data = dataform;
          await window.NXUI.ref.set("bucketsStore", bucketsData);
        } else {
          await window.NXUI.ref.set("bucketsStore", {
            id: "fileContents",
            data: dataform
          });
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving content:', error);
      return false;
    }
  }



  showFileTabBar(name, file) {
    const tabBar = document.querySelector('#nxepo-file-tab-bar');
    if (!tabBar) return;
    
    // If using multiple tabs, just update the tab bar display
    // The updateTabBar() function will handle the tabs UI
    if (this.tabs.length > 0) {
      this.updateTabBar();
      
      // Show tab actions
      const tabActions = tabBar.querySelector('.nxepo-file-tab-actions');
      if (tabActions) {
        tabActions.style.display = 'flex';
      }
      
      // Reset maximize state
      this.isMaximized = false;
      this.updateMaximizeButton();
      return;
    }
    
    // Legacy single tab mode (for backward compatibility)
    const tabName = document.querySelector('#nxepo-file-tab-name');
    const tabIcon = document.querySelector('.nxepo-file-tab-icon');
    const tabInfo = tabBar.querySelector('.nxepo-file-tab-info');
    const tabActions = tabBar.querySelector('.nxepo-file-tab-actions');

    // Restore normal tab bar structure (remove Recycle Bin buttons if present)
    if (tabInfo) {
      const recycleBinActions = tabInfo.querySelector('.nxepo-recycle-bin-actions');
      if (recycleBinActions) {
        recycleBinActions.remove();
      }
      
      // Restore normal tab info structure
      if (!tabName || !tabIcon) {
        tabInfo.innerHTML = `
          <span class="material-icons nxepo-file-tab-icon"></span>
          <span class="nxepo-file-tab-name" id="nxepo-file-tab-name"></span>
        `;
      }
    }
    
    // Show tab actions
    if (tabActions) {
      tabActions.style.display = 'flex';
    }

    // Update tab info
    const updatedTabName = document.querySelector('#nxepo-file-tab-name');
    const updatedTabIcon = document.querySelector('.nxepo-file-tab-icon');
    
    if (updatedTabName) updatedTabName.textContent = name;
    if (updatedTabIcon) {
      const icon = this.getFileIcon(name);
      const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
      if (isImageIcon) {
        updatedTabIcon.innerHTML = `<img src="${icon}" alt="${name}" style="width: 20px; height: 20px; object-fit: contain;" />`;
      } else {
        updatedTabIcon.textContent = icon;
      }
    }

    // Show tab bar
    tabBar.style.display = 'flex';
    
    // Reset maximize state
    this.isMaximized = false;
    this.updateMaximizeButton();
  }

  async closeFileTab() {
    // Close active tab
    if (this.activeTabId) {
      await this.removeTab(this.activeTabId);
    } else {
      // Fallback: clear current file and show folder view
      const tabBar = document.querySelector('#nxepo-file-tab-bar');
      if (tabBar) {
        tabBar.style.display = 'none';
      }
      
      this.currentFile = null;
      this.resetViewState();
      this.loadFiles();
    }
  }

  async toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    this.updateMaximizeButton();
    
    const container = document.querySelector('.nxepo-container');
    
    if (container) {
      if (this.isMaximized) {
        container.classList.add('maximized');
      } else {
        container.classList.remove('maximized');
      }
    }
    
    // Wait a bit for DOM to update after maximize toggle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Update height for active tab if it's an Xlsx file
    if (this.activeTabId) {
      const activeTab = this.tabs.find(t => t.id === this.activeTabId);
      if (activeTab) {
        // Get baseHeight from tab or recalculate if not stored
        // Don't recalculate if already stored in tab to avoid changing baseHeight
        let baseHeight = activeTab.baseHeight;
        
        // Only recalculate if baseHeight not stored in tab
        if (!baseHeight) {
          // Ensure height is calculated first
          if (!this.height) {
            await this.initDimensi();
          }
          baseHeight = this.height;
          activeTab.baseHeight = baseHeight; // Store for future use
          console.log('Maximize toggle - stored baseHeight:', baseHeight);
        }
        
        // Check if it's an Xlsx file
        const ext = activeTab.name.split('.').pop()?.toLowerCase();
        const isXlsx = ext === 'xlsx' || ext === 'xls';
        
        if (isXlsx) {
          // Get file data (use xlsxData if available, otherwise use file)
          const fileData = activeTab.xlsxData || activeTab.file;
          if (!fileData || !fileData.id) {
            return;
          }
          
          const toolbarElement = document.querySelector(`#toolbar-${fileData.id}`);
          const targetElement = document.querySelector(`#${fileData.id}`);
          
          if (!toolbarElement || !targetElement) {
            return;
          }
          
          // Calculate new height based on maximize state
          // Use the stored baseHeight (e.g., 65.76vh) as base, not recalculated height
          let newHeight;
          
          if (this.isMaximized) {
            // Maximized: calculate larger height but limit to reasonable maximum
            const toolbarHeight = toolbarElement.offsetHeight || 0;
            const tabBarHeight = document.querySelector('#nxepo-file-tab-bar')?.offsetHeight || 0;
            // Increase reserved height significantly to prevent overflow
            const reservedHeight = toolbarHeight + tabBarHeight + 80; // Increased padding to 80px for safety
            
            // Calculate available height in vh units to maintain consistency
            const viewportHeight = window.innerHeight;
            const availableHeightPx = viewportHeight - reservedHeight;
            const availableHeightVh = (availableHeightPx / viewportHeight) * 100;
            
            // Limit maximum height to 75vh to prevent overflow
            const maxHeightVh = 75;
            const calculatedHeightVh = parseFloat(availableHeightVh.toFixed(2));
            const finalHeightVh = Math.min(calculatedHeightVh, maxHeightVh);
            
            newHeight = `${finalHeightVh.toFixed(2)}vh`;
          } else {
            // Not maximized: use stored baseHeight
            newHeight = baseHeight; // Use stored baseHeight (e.g., 65.76vh)
          }
          
          console.log('Maximize toggle - new height:', newHeight, 'baseHeight (stored):', baseHeight, 'current this.height:', this.height, 'isMaximized:', this.isMaximized);
          
          // Update NexaXlsx height
          if (activeTab.xlsxInstance) {
            // Update instance height property first
            activeTab.xlsxInstance.height = newHeight;
            
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Update DOM element directly - find all possible containers
            const xlsxContainer = document.querySelector(`#${fileData.id}`);
            if (xlsxContainer) {
              // Update main container
              xlsxContainer.style.height = newHeight;
              
              // Update nexa-xlsx-container
              const containerElement = xlsxContainer.querySelector('.nexa-xlsx-container');
              if (containerElement) {
                containerElement.style.height = newHeight;
                containerElement.style.maxHeight = newHeight;
                containerElement.style.minHeight = newHeight;
                
                // Also update if there's a table container
                const tableContainer = containerElement.querySelector('.nexa-xlsx-table-container');
                if (tableContainer) {
                  tableContainer.style.height = newHeight;
                  tableContainer.style.maxHeight = newHeight;
                }
                
                // Update table wrapper if exists
                const tableWrapper = containerElement.querySelector('.nexa-xlsx-table-wrapper');
                if (tableWrapper) {
                  tableWrapper.style.height = newHeight;
                }
              }
              
              // Also try to find by class directly
              const allXlsxContainers = document.querySelectorAll(`#${fileData.id} .nexa-xlsx-container`);
              allXlsxContainers.forEach(container => {
                container.style.height = newHeight;
                container.style.maxHeight = newHeight;
              });
            }
            
            // Try to call updateHeight method if available
            if (typeof activeTab.xlsxInstance.updateHeight === 'function') {
              activeTab.xlsxInstance.updateHeight(newHeight);
            }
            
            // Try to call resize method if available
            if (typeof activeTab.xlsxInstance.resize === 'function') {
              activeTab.xlsxInstance.resize();
            }
            
            // Trigger resize event if available
            if (typeof activeTab.xlsxInstance.onResize === 'function') {
              activeTab.xlsxInstance.onResize();
            }
            
            // Trigger window resize event to force layout recalculation
            window.dispatchEvent(new Event('resize'));
            
            // Force reflow
            if (xlsxContainer) {
              void xlsxContainer.offsetHeight;
            }
            
            console.log('Maximize toggle - height applied:', newHeight, 'to container:', !!xlsxContainer);
          } else {
            // No instance yet, re-initialize with new height
            await this.initializeNexaXlsx(fileData, newHeight);
          }
        }
      }
    }
  }

  updateMaximizeButton() {
    const maximizeBtn = document.querySelector('#nxepo-file-tab-maximize');
    if (maximizeBtn) {
      const icon = maximizeBtn.querySelector('.material-icons');
      if (icon) {
        icon.textContent = this.isMaximized ? 'fullscreen_exit' : 'fullscreen';
      }
    }
  }

  getFileIcon(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Helper function to get icon with fallback
    const getIconWithFallback = (iconName, fallback) => {
      const icon = this.getIcon(iconName);
      return icon || fallback;
    };
    
    const iconMap = {
      // Office Documents
      'txt': getIconWithFallback('txt', 'description'),
      'docx': getIconWithFallback('word', 'description'),
      'doc': 'description',
      'xlsx': getIconWithFallback('excel', 'table_chart'),
      'xls': 'table_chart',
      'pptx': getIconWithFallback('powerpoint', 'slideshow'),
      'ppt': 'slideshow',
      'pdf': getIconWithFallback('pdf', 'picture_as_pdf'),
      // Images - use base64_icon_pictures from Icon.js with fallback to 'image'
      'jpg': getIconWithFallback('base64_icon_pictures', 'image'),
      'jpeg': getIconWithFallback('base64_icon_pictures', 'image'),
      'png': getIconWithFallback('base64_icon_pictures', 'image'),
      'gif': getIconWithFallback('base64_icon_pictures', 'image'),
      'svg': getIconWithFallback('base64_icon_pictures', 'image'),
      'webp': getIconWithFallback('base64_icon_pictures', 'image'),
      'bmp': getIconWithFallback('base64_icon_pictures', 'image'),
      'ico': getIconWithFallback('base64_icon_pictures', 'image'),
      // Videos - use base64_icon_videos from Icon.js with fallback to 'movie'
      'mp4': getIconWithFallback('base64_icon_videos', 'movie'),
      'avi': getIconWithFallback('base64_icon_videos', 'movie'),
      'mov': getIconWithFallback('base64_icon_videos', 'movie'),
      'wmv': getIconWithFallback('base64_icon_videos', 'movie'),
      'flv': getIconWithFallback('base64_icon_videos', 'movie'),
      'mkv': getIconWithFallback('base64_icon_videos', 'movie'),
      'webm': getIconWithFallback('base64_icon_videos', 'movie'),
      // Audio - use base64_icon_music from Icon.js with fallback to 'audiotrack'
      'mp3': getIconWithFallback('base64_icon_music', 'audiotrack'),
      'wav': getIconWithFallback('base64_icon_music', 'audiotrack'),
      'flac': getIconWithFallback('base64_icon_music', 'audiotrack'),
      'aac': getIconWithFallback('base64_icon_music', 'audiotrack'),
      'ogg': getIconWithFallback('base64_icon_music', 'audiotrack'),
      'wma': getIconWithFallback('base64_icon_music', 'audiotrack'),
      // Archives
      'zip': 'folder_zip',
      'rar': 'folder_zip',
      '7z': 'folder_zip',
      'tar': 'folder_zip',
      'gz': 'folder_zip',
      // Code
      // 'js': 'code',
      // 'jsx': 'code',
      // 'ts': 'code',
      // 'tsx': 'code',
      // 'html': 'code',
      // 'htm': 'code',
      // 'css': 'code',
      // 'scss': 'code',
      // 'sass': 'code',
      // 'json': 'code',
      // 'xml': 'code',
      // 'md': 'description',
      // 'py': 'code',
      // 'java': 'code',
      // 'cpp': 'code',
      // 'c': 'code',
      // 'php': 'code',
      // 'sql': 'storage',
      // Executables
      // 'exe': 'settings_applications',
      // 'msi': 'install_desktop',
      // 'dmg': 'install_desktop',
      // 'deb': 'install_desktop',
      // 'rpm': 'install_desktop',
      // // Fonts
      // 'ttf': 'font_download',
      // 'otf': 'font_download',
      // 'woff': 'font_download',
      // 'woff2': 'font_download',
      // Default
      'default': 'description'
    };
    return iconMap[ext] || iconMap['default'];
  }

  getFileColor(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const colorMap = {
      'txt': '#1a73e8', // Google Docs Blue
      'docx': '#1a73e8', // Google Docs Blue
      'xlsx': '#0f9d58', // Google Sheets Green
      'pptx': '#fbbc04', // Google Slides Yellow/Amber
      'pdf': '#ea4335', // Google Red/PDF Red
      'md': '#1a73e8', // Google Docs Blue
      'js': '#f7df1e', // JavaScript Yellow
      'html': '#e34c26', // HTML Orange
      'css': '#1572b6', // CSS Blue
      'json': '#000000', // Black
      'jpg': '#ff9800', // Image Orange
      'jpeg': '#ff9800',
      'png': '#ff9800',
      'gif': '#ff9800',
      'svg': '#ff9800',
      'mp4': '#1976d2', // Video Blue
      'mp3': '#1976d2', // Audio Blue
      'zip': '#ff9800', // Archive Orange
      'exe': '#616161' // Gray
    };
    return colorMap[ext] || '#1a73e8';
  }

  async loadFileContent(name, file,height) {
    if (!this.container) return;

    
    const ext = name.split('.').pop()?.toLowerCase();
    const filePathString = this.pathToString([...this.currentPath, name]);
    const filePath = [...this.currentPath, name].join(' > ');
    const icon = this.getFileIcon(name);

    // Check if PDF, Image, Music, or Video - need to check bucketsStore first
    const isPDF = ext === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext);
    const isMusic = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'].includes(ext);
    const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].includes(ext);
    
    // Get dataform from bucketsStore (will be used later for display and size)
    let dataform = null;
    let fileDataFromBuckets = null; // Full file data from bucketsStore
    
    // Always fetch dataform to get complete file information
    try {
      if (window.NXUI && window.NXUI.ref) {
        const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
        // Handle different data formats
        if (Array.isArray(bucketsData)) {
          dataform = bucketsData;
        } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
          dataform = bucketsData.data;
        } else if (bucketsData && bucketsData.id === "fileContents") {
          dataform = bucketsData.data || [];
        }
        
        // Find complete file data from bucketsStore - PASTIKAN hanya menggunakan fileId (path lengkap)
        if (dataform && Array.isArray(dataform)) {
          // Hanya gunakan fileId untuk memastikan file yang tepat berdasarkan path, bukan nama
          const matchingEntry = dataform.find(item => item.fileId === filePathString);
          if (matchingEntry) {
            fileDataFromBuckets = matchingEntry;
          }
        }
      }
    } catch (e) {
    }
    
    // Use complete file data from bucketsStore if available, otherwise use file parameter
    const completeFileData = fileDataFromBuckets || file;
 
    // Check content existence for PDF/Image/Music/Video
    if (isPDF || isImage || isMusic || isVideo) {
      
      // Check if file content exists for this specific file
      // Get the latest entry if multiple exist
      let fileContentExists = false;
      let latestFileEntry = null;
      if (dataform && Array.isArray(dataform)) {
        // PASTIKAN hanya menggunakan fileId (path lengkap) untuk menghindari file dengan nama sama di path berbeda
        const matchingEntry = dataform.find(item => item.fileId === filePathString);
        if (matchingEntry) {
          fileContentExists = true;
          latestFileEntry = matchingEntry;
        }
      }
      
      if (!fileContentExists) {
        // Don't open file if content doesn't exist - show appropriate modal
        if (isMusic || isVideo) {
          // Show YouTube link modal for Music/Video
          this.showYouTubeModal(name, filePathString, isVideo);
        } else {
          // Show upload modal for PDF/Image
          this.showUploadModal(name, filePathString, isPDF, ext);
        }
        return;
      }
    }

    // Try to get file content from IndexedDB
    let fileContent = null;
    try {
      if (this.db) {
        fileContent = await this.db.get('fileContents', filePathString);
      }
    } catch (e) {
      // File content might not exist
    }

    // Render content based on file type
    let content = '';
    
    const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
      // Image preview - check if we have content from bucketsStore
      let imageSrc = '';
      
      // Re-fetch dataform if not already loaded (for cases after save)
      if (!dataform && isImage) {
        try {
          if (window.NXUI && window.NXUI.ref) {
            const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
            if (Array.isArray(bucketsData)) {
              dataform = bucketsData;
            } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
              dataform = bucketsData.data;
            } else if (bucketsData && bucketsData.id === "fileContents") {
              dataform = bucketsData.data || [];
            }
          }
        } catch (e) {
        }
      }
      
      // Get size from bucketsStore if available
      // Use latest entry if multiple exist
      let displaySize = (completeFileData && completeFileData.size) ? this.formatFileSize(completeFileData.size) : (file.size || 'Unknown size');
      if (dataform && Array.isArray(dataform)) {
        // PASTIKAN hanya menggunakan fileId (path lengkap) untuk menghindari file dengan nama sama di path berbeda
        const matchingEntry = dataform.find(item => item.fileId === filePathString);
        if (matchingEntry) {
          const imageData = matchingEntry;
          
          if (imageData) {
            if (imageData.content) {
              // If content is base64 or blob URL
              if (imageData.content.startsWith('data:') || imageData.content.startsWith('blob:')) {
                imageSrc = imageData.content;
              } else if (imageData.content.startsWith('http')) {
                imageSrc = imageData.content;
              }
            }
            // Use size from bucketsStore if available
            if (imageData.size) {
              displaySize = this.formatFileSize(imageData.size);
            }
          }
        }
      }
 
      content = `
        <div class="nxepo-file-content">
          <div class="nxepo-file-content-header">
            <div class="nxepo-file-content-title">
              ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 24px; height: 24px; object-fit: contain; margin-right: 8px;" />` : `<span class="material-icons">${icon}</span>`}
              <span>${name}</span>
            </div>
            <div class="nxepo-file-content-info">
              <span>${filePath}</span>
              <span>•</span>
              <span>${displaySize}</span>
            </div>
          </div>
          <div class="nxepo-file-content-body">
            <div class="nxepo-file-content-image">
              ${imageSrc ? `
                <img src="${imageSrc}" alt="${name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
              ` : `
                <div class="nxepo-file-content-image-placeholder">
                  <span class="material-icons">image</span>
                  <p>Image Preview</p>
                  <p class="nxepo-file-content-image-name">${name}</p>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    } else if (['txt','docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp'].includes(ext)) {
      // ============================================
      // OFFICE DOCUMENTS - Organized by Type
      // ============================================
      
      // Common setup for all office documents
      let displaySize = (completeFileData && completeFileData.size) ? this.formatFileSize(completeFileData.size) : (file.size || 'Unknown size');
      let fileData = null;
      let downloadUrl = null;
      
      // Check bucketsStore for uploaded file - PASTIKAN hanya menggunakan fileId (path lengkap)
      if (dataform && Array.isArray(dataform)) {
        const matchingEntry = dataform.find(item => item.fileId === filePathString);
        if (matchingEntry) {
          fileData = matchingEntry;
          
          if (fileData && fileData.content) {
            if (fileData.content.startsWith('data:')) {
              downloadUrl = fileData.content;
            } else {
              const mimeType = fileData.fileType || 'application/octet-stream';
              downloadUrl = `data:${mimeType};base64,${fileData.content}`;
            }
          }
          
          if (fileData && fileData.size) {
            displaySize = this.formatFileSize(fileData.size);
          }
        }
      }
      
      // Get app settings
      const appSettings = await window.NXUI.ref.get("bucketsStore", 'explorer');
      const fileSettings = appSettings?.data || {};
      const isInstalled = fileSettings[completeFileData.fileType];
      const hasContent = completeFileData.content && completeFileData.content.trim() !== '';
      const showDownload = downloadUrl && (!isInstalled || !hasContent);
      
      // Installation HTML
      let instalasi = '';
      if (!isInstalled) {
        const meta = metaInstal(completeFileData.fileType);
        instalasi = `<div class="nx-row nx-justify-center">
          <div class="nx-col-6 pt-100px tx-center">
            <div class="pt-40px" style="font-size: 17px">
              <h2>Hallo ${NEXA.userSlug} </h2>
              <p>
                Jika Anda baru pertama kali menggunakan sistem ini, silakan klik tombol
                di bawah untuk memulai proses Install ${meta?.titel || 'Applications'} dan mendapatkan akses penuh ke
                semua fitur yang tersedia.
              </p>
              <div id="progressInstall"></div>
            </div>
            <br>
            <button onclick="installApplications('${meta.app}','${completeFileData.fileType}')" class="nx-btn-secondary-outline">INSTALL ${(meta?.titel || 'Applications').toUpperCase()} ${meta?.versi || "v.1.1.3"}</button>
          </div>
        </div>`;
      }
      
      // Common header HTML
      const headerHTML = !isInstalled ? `
        <div class="nxepo-file-content-header">
          <div class="nxepo-file-content-title">
            ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 24px; height: 24px; object-fit: contain; margin-right: 8px;" />` : `<span class="material-icons">${icon}</span>`}
            <span>${name}</span>
          </div>
          <div class="nxepo-file-content-info">
            <span>${filePath}</span>
            <span>•</span>
            <span>${displaySize}</span>
          </div>
        </div>
      ` : '';
      
      // Common toolbar HTML
      const toolbarHTML = isInstalled ? `<div id="toolbar-${file.id}" style="border-bottom: 1px solid #e0e0e0;"></div>` : '';
      
      // Common download section HTML
      const downloadSectionHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; min-height: 400px;">
          <div style="margin-bottom: 24px;">
            ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 64px; height: 64px; object-fit: contain;" />` : `<span class="material-icons" style="font-size: 64px; color: #1a73e8;">${icon || 'description'}</span>`}
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 500;">${name}</h3>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">File siap untuk diunduh</p>
          <a href="${downloadUrl}" download="${name}" style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: #0078d4;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
          " onmouseover="this.style.background='#106ebe'" onmouseout="this.style.background='#0078d4'">
            <span class="material-icons" style="font-size: 20px;">download</span>
            <span>Download File</span>
          </a>
        </div>
      `;
      
      // Common installation section HTML
      const installationSectionHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; min-height: 400px;">
          <div style="margin-bottom: 24px;">
            ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 64px; height: 64px; object-fit: contain;" />` : `<span class="material-icons" style="font-size: 64px; color: #999;">${icon || 'description'}</span>`}
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 500;">${name}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">${instalasi}</p>
        </div>
      `;
      
      // Welcome content for text documents
      const welcomeContentHTML = `
        <h1 style="text-align:center;padding-top:30px;color:#2c3e50;margin-bottom:20px">Hello ${NEXA.userSlug}! 👋</h1> 
        <div style="text-align:center;color:#7f8c8d;line-height:1.6;font-size:16px;max-width:600px;margin:0 auto;padding:0 20px;">
          <p style="margin-bottom:15px;">🎉 <strong>Selamat datang di Nexa Reactive!</strong></p>
          <p style="margin-bottom:20px;">Siap untuk mewujudkan ide-ide kreatif Anda? Mulai menulis dan eksplorasi tanpa batas!</p>
          <div style="background:#ecf0f1;padding:15px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;color:#34495e;"><strong>💡 Tips:</strong> Klik pada area konten untuk mulai menulis dan mengedit</p>
          </div>
        </div>
      `;
      
      // ============================================
      // TYPE-SPECIFIC RENDERING - Menggunakan Renderer Terpisah
      // ============================================
      
      const renderOptions = {
        file,
        completeFileData,
        fileSettings,
        downloadUrl,
        showDownload,
        isInstalled,
        hasContent,
        name,
        filePath,
        displaySize,
        icon,
        isImageIcon,
        height,
        instalasi,
        welcomeContentHTML,
        downloadSectionHTML,
        installationSectionHTML,
        headerHTML,
        toolbarHTML
      };
      
      // TEXT DOCUMENTS (txt, docx, doc, odt)
      if (['txt', 'docx', 'doc', 'odt'].includes(ext)) {
        content = await OfficeTextRenderer.render(renderOptions);
      }
      // SPREADSHEETS (xlsx, xls, ods)
      else if (['xlsx', 'xls', 'ods'].includes(ext)) {
        content = await OfficeSpreadsheetRenderer.render(renderOptions);
      }
      // PRESENTATIONS (pptx, ppt, odp)
      else if (['pptx', 'ppt', 'odp'].includes(ext)) {
        content = await OfficePresentationRenderer.render(renderOptions);
      }
    } else if (['md', 'js', 'html', 'css', 'json', 'pdf'].includes(ext)) {
      // Text/file preview - use content from IndexedDB or default
      let displayContent = '';
      let displaySize = (completeFileData && completeFileData.size) ? this.formatFileSize(completeFileData.size) : (file.size || 'Unknown size');
      
      // For PDF, check bucketsStore first
      // Use matching entry based on fileId (path lengkap)
      if (ext === 'pdf' && dataform && Array.isArray(dataform)) {
        // PASTIKAN hanya menggunakan fileId (path lengkap) untuk menghindari file dengan nama sama di path berbeda
        const matchingEntry = dataform.find(item => item.fileId === filePathString);
        if (matchingEntry) {
          const pdfData = matchingEntry;
          
          if (pdfData) {
            if (pdfData.content) {
              // PDF content from bucketsStore
              displayContent = pdfData.content;
            }
            // Use size from bucketsStore if available
            if (pdfData.size) {
              displaySize = this.formatFileSize(pdfData.size);
            }
          }
        } else if (fileContent && fileContent.content) {
          displayContent = fileContent.content;
        } else {
          displayContent = this.getMockFileContent(name, ext);
        }
      } else if (fileContent && fileContent.content) {
        displayContent = fileContent.content;
      } else {
        displayContent = this.getMockFileContent(name, ext);
      }
      
      content = `
        <div class="nxepo-file-content">
          <div class="nxepo-file-content-header">
            <div class="nxepo-file-content-title">
              ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 24px; height: 24px; object-fit: contain; margin-right: 8px;" />` : `<span class="material-icons">${icon}</span>`}
              <span>${name}</span>
            </div>
            <div class="nxepo-file-content-info">
              <span>${filePath}</span>
              <span>•</span>
              <span>${displaySize}</span>
            </div>
          </div>
          <div class="nxepo-file-content-body" style="padding:0px">
            ${ext === 'pdf' && dataform && Array.isArray(dataform) ? (() => {
              // PASTIKAN hanya menggunakan fileId (path lengkap) untuk menghindari file dengan nama sama di path berbeda
              const pdfData = dataform.find(item => item.fileId === filePathString) || null;
              
              if (pdfData && pdfData.content) {
                // Check if content is base64 or URL
                const pdfSrc = pdfData.content.startsWith('data:') || pdfData.content.startsWith('blob:') || pdfData.content.startsWith('http')
                  ? pdfData.content
                  : `data:application/pdf;base64,${pdfData.content}`;
                return `
                  <div class="nxepo-file-content-pdf">
                    <iframe src="${pdfSrc}" style="width: 100%; height: 100%; min-height: 600px; border: none;"></iframe>
                  </div>
                `;
              }
              return `
                <div class="nxepo-file-content-text">
                  <pre class="nxepo-file-content-code"><code>${this.escapeHtml(displayContent)}</code></pre>
                </div>
              `;
            })() : `
              <div class="nxepo-file-content-text">
                <pre class="nxepo-file-content-code"><code>${this.escapeHtml(displayContent)}</code></pre>
              </div>
            `}
          </div>
        </div>
      `;
    } else if (isMusic || isVideo) {
      // Music/Video preview - check if we have YouTube link from bucketsStore
      let youtubeVideoId = '';
      let youtubeLink = '';
      let displaySize = (completeFileData && completeFileData.size) ? this.formatFileSize(completeFileData.size) : (file.size || 'Unknown size');
      
      // Re-fetch dataform if not already loaded
      if (!dataform && (isMusic || isVideo)) {
        try {
          if (window.NXUI && window.NXUI.ref) {
            const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
            if (Array.isArray(bucketsData)) {
              dataform = bucketsData;
            } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
              dataform = bucketsData.data;
            } else if (bucketsData && bucketsData.id === "fileContents") {
              dataform = bucketsData.data || [];
            }
          }
        } catch (e) {
        }
      }
      
      // Get YouTube metadata from dataform
      let youtubeTitle = '';
      let youtubeThumbnail = '';
      if (dataform && Array.isArray(dataform)) {
        // PASTIKAN hanya menggunakan fileId (path lengkap) untuk menghindari file dengan nama sama di path berbeda
        const matchingEntry = dataform.find(item => item.fileId === filePathString);
        if (matchingEntry) {
          const mediaData = matchingEntry;
          
          if (mediaData) {
            if (mediaData.content) {
              youtubeVideoId = mediaData.content;
            }
            if (mediaData.youtubeLink) {
              youtubeLink = mediaData.youtubeLink;
            }
            if (mediaData.size) {
              displaySize = this.formatFileSize(mediaData.size);
            }
            if (mediaData.youtubeTitle) {
              youtubeTitle = mediaData.youtubeTitle;
            }
            if (mediaData.youtubeThumbnail) {
              youtubeThumbnail = mediaData.youtubeThumbnail;
            }
          }
        }
      }
      
      // Generate YouTube embed URL
      const youtubeEmbedUrl = youtubeVideoId 
        ? `https://www.youtube.com/embed/${youtubeVideoId}`
        : null;
      
      // Use YouTube title if available, otherwise use file name
      const displayTitle = youtubeTitle || name;
      
      content = `
        <div class="nxepo-file-content">
          <div class="nxepo-file-content-header">
            <div class="nxepo-file-content-title">
              ${youtubeThumbnail ? `<img src="${youtubeThumbnail}" alt="${displayTitle}" style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px; margin-right: 8px;" />` : (isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 24px; height: 24px; object-fit: contain; margin-right: 8px;" />` : `<span class="material-icons">${icon}</span>`)}
              <span>${displayTitle}</span>
            </div>
            <div class="nxepo-file-content-info">
              <span>${filePath}</span>
              <span>•</span>
              <span>${displaySize}</span>
            </div>
          </div>
          <div class="nxepo-file-content-body">
            ${youtubeEmbedUrl ? `
              <div style="width: 100%; max-width: 100%; padding: 20px;">
                ${youtubeThumbnail ? `<div style="text-align: center; margin-bottom: 16px;"><img src="${youtubeThumbnail}" alt="${displayTitle}" style="max-width: 300px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" /></div>` : ''}
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000;">
                  <iframe 
                    src="${youtubeEmbedUrl}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen">
                  </iframe>
                </div>
                ${youtubeLink ? `<p style="margin-top: 16px; text-align: center;"><a href="${youtubeLink}" target="_blank" style="color: #0078d4;">Buka di YouTube</a></p>` : ''}
              </div>
            ` : `
              <div class="nxepo-file-content-generic">
                <div class="nxepo-file-content-generic-icon">
                  ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 48px; height: 48px; object-fit: contain;" />` : `<span class="material-icons">${icon}</span>`}
                </div>
                <div class="nxepo-file-content-generic-info">
                  <h3>${name}</h3>
                  <p>File Type: ${ext.toUpperCase() || 'Unknown'}</p>
                  <p>Size: ${displaySize}</p>
                  <p>Path: ${filePath}</p>
                  <p class="nxepo-file-content-generic-hint">YouTube link belum diatur untuk file ini.</p>
                </div>
              </div>
            `}
          </div>
        </div>
      `;
    } else {
      // Generic file preview
      // Get size from bucketsStore if available (for any file type)
      // Use latest entry if multiple exist
      let displaySize = (completeFileData && completeFileData.size) ? this.formatFileSize(completeFileData.size) : (file.size || 'Unknown size');
      if (dataform && Array.isArray(dataform)) {
        // PASTIKAN hanya menggunakan fileId (path lengkap) untuk menghindari file dengan nama sama di path berbeda
        const matchingEntry = dataform.find(item => item.fileId === filePathString);
        if (matchingEntry) {
          const fileData = matchingEntry;
          
          if (fileData && fileData.size) {
            displaySize = this.formatFileSize(fileData.size);
          }
        }
      }
      
      content = `
        <div class="nxepo-file-content">
          <div class="nxepo-file-content-header">
            <div class="nxepo-file-content-title">
              ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 24px; height: 24px; object-fit: contain; margin-right: 8px;" />` : `<span class="material-icons">${icon}</span>`}
              <span>${name}</span>
            </div>
            <div class="nxepo-file-content-info">
              <span>${filePath}</span>
              <span>•</span>
              <span>${displaySize}</span>
            </div>
          </div>
          <div class="nxepo-file-content-body">
            <div class="nxepo-file-content-generic">
              <div class="nxepo-file-content-generic-icon">
                ${isImageIcon ? `<img src="${icon}" alt="${name}" style="width: 48px; height: 48px; object-fit: contain;" />` : `<span class="material-icons">${icon}</span>`}
              </div>
              <div class="nxepo-file-content-generic-info">
                <h3>${name}</h3>
                <p>File Type: ${ext.toUpperCase() || 'Unknown'}</p>
                <p>Size: ${displaySize}</p>
                <p>Path: ${filePath}</p>
                <p class="nxepo-file-content-generic-hint">This file type cannot be previewed in the browser.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = content;
    
    // Note: Content saving is now handled in showFileContent() after all initializations
  }

  getMockFileContent(name, ext) {
    const mockContents = {
      'txt': `This is a text file: ${name}\n\nCreated: ${new Date().toLocaleString()}\n\nYou can edit this file content here.`,
      'md': `# ${name}\n\nThis is a Markdown file.\n\n## Features\n- Preview support\n- Syntax highlighting\n- Easy editing`,
      'js': `// ${name}\n\nfunction example() {\n    console.log('Hello from ${name}');\n    return true;\n}\n\nexample();`,
      'html': `<!DOCTYPE html>\n<html>\n<head>\n    <title>${name}</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>`,
      'css': `/* ${name} */\n\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: Arial, sans-serif;\n}`,
      'json': `{\n    "name": "${name}",\n    "type": "file",\n    "created": "${new Date().toISOString()}"\n}`,
      'docx': `Word Document: ${name}\n\nThis is a Word document. Content will be displayed here.`,
      'xlsx': `Excel Spreadsheet: ${name}\n\nThis is an Excel spreadsheet. Content will be displayed here.`,
      'pptx': `PowerPoint Presentation: ${name}\n\nThis is a PowerPoint presentation. Content will be displayed here.`,
      'pdf': `PDF Document: ${name}\n\nThis is a PDF document. Content will be displayed here.`
    };
    return mockContents[ext] || `Content of ${name}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Show upload modal for PDF, Images, and Office documents
  showUploadModal(fileName, filePathString, isPDF = false, fileExtension = null) {
    if (!window.NXUI || !window.NXUI.modalHTML) {
      return;
    }
  
    const modalID = `type_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const modalIDFile = `type_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Determine accept attribute based on file type
    let acceptValue = 'image/*'; // Default
    if (isPDF) {
      acceptValue = '.pdf';
    } else if (fileExtension) {
      const ext = fileExtension.toLowerCase();
      // Office documents
      if (['docx', 'doc'].includes(ext)) {
        acceptValue = '.doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword';
      } else if (['xlsx', 'xls'].includes(ext)) {
        acceptValue = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
      } else if (['pptx', 'ppt'].includes(ext)) {
        acceptValue = '.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint';
      } else if (['odt'].includes(ext)) {
        acceptValue = '.odt,application/vnd.oasis.opendocument.text';
      } else if (['ods'].includes(ext)) {
        acceptValue = '.ods,application/vnd.oasis.opendocument.spreadsheet';
      } else if (['odp'].includes(ext)) {
        acceptValue = '.odp,application/vnd.oasis.opendocument.presentation';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
        acceptValue = 'image/*';
      }
    }
    
    // Get dataform from bucketsStore
    window.NXUI.ref.get("bucketsStore", "fileContents").then(dataform => {
      // Get file icon based on extension
      const fileIcon = this.getFileIcon(fileName);
      const isImageIcon = typeof fileIcon === 'string' && (fileIcon.startsWith('http') || fileIcon.startsWith('data:'));
      
      // Determine initial preview display
      let previewImageDisplay = 'none';
      let previewIconDisplay = 'none';
      let previewImageSrc = '';
      let previewIconClass = '';
      
      if (isImageIcon) {
        // If icon is base64/image, show image
        previewImageDisplay = 'block';
        previewImageSrc = fileIcon;
      } else {
        // If icon is material icon, show icon
        previewIconDisplay = 'flex';
        previewIconClass = fileIcon || 'description';
      }
      
      NXUI.modalHTML({
        elementById: modalID,
        styleClass: "w-500px",
        minimize: true,
        label: `Uploader`,
        getFormBy: ["name"],
        setDataBy: dataform || [],
        getValidationBy: ["name"],
        onclick: {
          title: "Save File",
          cancel: "Cancel",
          send: "saveFile",
        },
        content: `
          <div class="nx-row">
            <div class="nx-col-12">
              <div class="form-nexa">
                <div class="form-nexa-file-preview" style="display: none;"></div>
                <div class="form-nexa-file-list" style="display: none;"></div>
                <div class="nx-media nx-fileupload" id="fileUpload-${modalIDFile}">
                  <img style="height: 50px; width: 50px; display: ${previewImageDisplay};" src="${previewImageSrc}" alt="preview" class="nx-media-img" id="preview-image-${modalIDFile}">
                  <span id="fa-icon-${modalIDFile}" class="material-icons" style="
                      display: ${previewIconDisplay};
                      height: 50px;
                      width: 50px;
                      font-size: 32px;
                      color: #666;
                      align-items: center;
                      justify-content: center;
                    ">${previewIconClass}</span>
                  <input type="file" id="${modalIDFile}" name="file"  class="form-nexa-file-input" accept="${acceptValue}" />
                  <div class="nx-media-body">
                    <h5>Upload File</h5>
                    <p id="nx-file-type-${modalIDFile}">Pilih file sesuai tipe ${fileExtension || 'yang diizinkan'}</p>
                    <small id="file-name-${modalIDFile}" style="color: #666"></small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      });
      
      NXUI.nexaModal.open(modalID);
      
      // Setup file input change handler to update preview
      setTimeout(() => {
        const fileInput = document.getElementById(modalIDFile);
        const previewImage = document.getElementById(`preview-image-${modalIDFile}`);
        const previewIcon = document.getElementById(`fa-icon-${modalIDFile}`);
        
        if (fileInput) {
          fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
              const selectedFileName = file.name;
              const fileType = file.type;
              const isImageFile = fileType && fileType.startsWith('image/');
              
              if (isImageFile) {
                // If selected file is an image, show actual image preview
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (previewImage) {
                    previewImage.src = event.target.result;
                    previewImage.style.display = 'block';
                  }
                  if (previewIcon) {
                    previewIcon.style.display = 'none';
                  }
                };
                reader.readAsDataURL(file);
              } else {
                // If not an image, show icon based on file extension
                const selectedFileIcon = this.getFileIcon(selectedFileName);
                const selectedIsImageIcon = typeof selectedFileIcon === 'string' && (selectedFileIcon.startsWith('http') || selectedFileIcon.startsWith('data:'));
                
                if (selectedIsImageIcon) {
                  // Show icon image, hide material icon
                  if (previewImage) {
                    previewImage.src = selectedFileIcon;
                    previewImage.style.display = 'block';
                  }
                  if (previewIcon) {
                    previewIcon.style.display = 'none';
                  }
                } else {
                  // Show material icon, hide image
                  if (previewIcon) {
                    previewIcon.textContent = selectedFileIcon || 'description';
                    previewIcon.style.display = 'flex';
                  }
                  if (previewImage) {
                    previewImage.style.display = 'none';
                  }
                }
              }
            }
          });
        }
      }, 100);
      
      // Store file info for saveFile function
      window._currentUploadFile = {
        fileName: fileName,
        filePathString: filePathString,
        modalID: modalID,
        explorer: this
      };
    }).catch(e => {
    });
  }

  // Show YouTube link modal for Music and Video
  showYouTubeModal(fileName, filePathString, isVideo = false) {
    if (!window.NXUI || !window.NXUI.modalHTML) {
      return;
    }

    const modalID = `youtube_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Get dataform from bucketsStore
    window.NXUI.ref.get("bucketsStore", "fileContents").then(dataform => {
      NXUI.modalHTML({
        elementById: modalID,
        styleClass: "w-500px",
        minimize: true,
        label: `${isVideo ? 'Video' : 'Music'} Link`,
        getFormBy: ["name"],
        setDataBy: dataform || [],
        getValidationBy: ["name"],
        onclick: {
          title: "Save Link",
          cancel: "Cancel",
          send: "saveYouTubeLink",
        },
        content: `
          <div class="nx-row">
            <div class="nx-col-12">
              <div class="form-nexa-group">
                <label class="form-nexa-label">YouTube Link</label>
                <input type="text" name="youtubeLink" id="youtubeLink_${modalID}" class="form-nexa-control" placeholder="https://www.youtube.com/watch?v=..." />
                <small class="form-nexa-hint">Masukkan link YouTube untuk ${isVideo ? 'video' : 'musik'}</small>
              </div>
            </div>
          </div>
        `,
      });
      
      NXUI.nexaModal.open(modalID);
      
      // Store file info for saveYouTubeLink function
      window._currentYouTubeFile = {
        fileName: fileName,
        filePathString: filePathString,
        modalID: modalID,
        isVideo: isVideo,
        explorer: this
      };
    }).catch(e => {
    });
  }

  setupDragAndDrop() {
    if (!this.container) return;

    // Track drag state
    this.dragSource = null;
    this.isDraggingInternal = false;

    // Handle drag start on file/folder items (using event delegation)
    this.container.addEventListener('dragstart', (e) => {
      // Find the draggable item (could be child element)
      const fileItem = e.target.closest('[draggable="true"]');
      if (!fileItem) return;
      
      // Get parent item if target is child element
      const parentItem = fileItem.closest('.nxepo-file-item, .nxepo-list-item, .nxepo-content-item');
      const actualItem = parentItem || fileItem;
      
      if (actualItem && actualItem.dataset.name) {
        this.dragSource = {
          name: actualItem.dataset.name,
          type: actualItem.dataset.type,
          path: [...this.currentPath, actualItem.dataset.name]
        };
        this.isDraggingInternal = true;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', actualItem.dataset.name);
        
        // Visual feedback
        actualItem.style.opacity = '0.5';
      }
    });

    this.container.addEventListener('dragend', (e) => {
      // Reset visual feedback
      const fileItem = e.target.closest('.nxepo-file-item, .nxepo-list-item, .nxepo-content-item');
      if (fileItem) {
        fileItem.style.opacity = '';
      }
      this.dragSource = null;
      this.isDraggingInternal = false;
    });

    // Handle dragover on container
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if dragging over a folder item
      const targetItem = e.target.closest('.nxepo-file-item, .nxepo-list-item, .nxepo-content-item');
      if (targetItem && targetItem.dataset.type === 'folder') {
        e.currentTarget.classList.add('drag-over-folder');
        targetItem.classList.add('drag-over-target');
        e.dataTransfer.dropEffect = 'move';
      } else {
      e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'copy';
      }
    });

    this.container.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over', 'drag-over-folder');
      
      // Remove hover effect from all items
      this.container.querySelectorAll('.drag-over-target').forEach(item => {
        item.classList.remove('drag-over-target');
      });
    });

    this.container.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('drag-over', 'drag-over-folder');
      
      // Remove hover effect from all items
      this.container.querySelectorAll('.drag-over-target').forEach(item => {
        item.classList.remove('drag-over-target');
      });

      // Check if dragging internal file/folder
      if (this.isDraggingInternal && this.dragSource) {
        await this.handleInternalDrop(e);
      } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Handle file upload from computer
        await this.handleFileUpload(e.dataTransfer.files);
      }
    });
  }

  // Handle internal drag & drop (moving files/folders within explorer)
  async handleInternalDrop(e) {
    if (!this.dragSource) return;

    const targetItem = e.target.closest('.nxepo-file-item, .nxepo-list-item, .nxepo-content-item');
    const sourcePathString = this.pathToString(this.dragSource.path);
    const sourceItem = await this.getItemByPath(sourcePathString);
    
    if (!sourceItem) {
      return;
    }

    // Determine destination
    let destPath = this.currentPath;
    let destPathString = this.pathToString(destPath);

    // If dropped on a folder, move into that folder
    if (targetItem && targetItem.dataset.type === 'folder') {
      const folderName = targetItem.dataset.name;
      destPath = [...this.currentPath, folderName];
      destPathString = this.pathToString(destPath);
      
      // Verify destination folder exists
      const destFolderExists = await this.getItemByPath(destPathString);
      if (!destFolderExists) {
        
        // Try to create the destination folder
        await this.saveFolderItem({
          id: destPathString,
          path: destPathString,
          parentPath: this.pathToString(this.currentPath),
          name: folderName,
          type: 'folder',
          modified: new Date().toISOString().split('T')[0]
        });
        
        // Verify it was created
        const verifyDestFolder = await this.getItemByPath(destPathString);
        if (!verifyDestFolder) {
          return;
        }
      }
    }

    // Don't move if source and destination are the same
    if (sourcePathString === destPathString) {
      return;
    }

    // Don't move folder into itself or its children
    if (sourceItem.type === 'folder') {
      const destPathStringCheck = this.pathToString(destPath);
      if (destPathStringCheck.startsWith(sourcePathString + '/')) {
        return;
      }
    }

    // Handle duplicate names
    let newName = sourceItem.name;
    let counter = 1;
    let newPath = destPathString ? `${destPathString}/${newName}` : newName;

    while (await this.getItemByPath(newPath)) {
      const nameParts = sourceItem.name.split('.');
      if (nameParts.length > 1 && sourceItem.type === 'file') {
        const ext = nameParts.pop();
        const name = nameParts.join('.');
        newName = `${name} (${counter}).${ext}`;
      } else {
        newName = `${sourceItem.name} (${counter})`;
      }
      newPath = destPathString ? `${destPathString}/${newName}` : newName;
      counter++;
    }

    // IMPORTANT: Save item to destination FIRST
    // CRITICAL: Create new object with ONLY the fields we need
    // Don't spread sourceItem - it contains old path/parentPath that will cause issues
    try {
      // Create clean new object with only necessary fields
      const itemToSave = {
        id: newPath,
        path: newPath,
        parentPath: destPathString,
        name: newName,
        type: sourceItem.type,
        size: sourceItem.size || '0 KB',
        modified: new Date().toISOString().split('T')[0]
      };
      
      // Only copy safe fields from sourceItem (exclude path, parentPath, id, name)
      const safeFields = ['data', 'metadata', 'tags', 'customFields'];
      for (const field of safeFields) {
        if (sourceItem[field] !== undefined) {
          itemToSave[field] = sourceItem[field];
        }
      }
      
      await this.saveFolderItem(itemToSave);
    } catch (saveError) {
      return; // Stop if save failed
    }

    // Wait a bit for IndexedDB to commit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the item was saved correctly
    const verifySaved = await this.getItemByPath(newPath);
    if (!verifySaved) {
      // Try direct DB access
      try {
        const directCheck = await this.db.get('folderStructure', newPath);
        if (!directCheck) {
          return;
        }
      } catch (dbError) {
        return;
      }
    }

    // If it's a folder, recursively move children AFTER parent is created
    if (sourceItem.type === 'folder') {
      await this.moveFolderRecursive(sourcePathString, newPath, sourceItem.name, newName);
      
      // Verify all children were moved
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for recursive move to complete
      const allItems = await this.db.getAll('folderStructure');
      const remainingChildren = allItems.data.filter(item => item.parentPath === sourcePathString);
      if (remainingChildren.length > 0) {
        // Try to move remaining children
        for (const child of remainingChildren) {
          const childNewPath = `${newPath}/${child.name}`;
          
          // CRITICAL: Don't spread child - create clean object
          const childToSave = {
            id: childNewPath,
            path: childNewPath,
            parentPath: newPath,
            name: child.name,
            type: child.type,
            size: child.size || '0 KB',
            modified: child.modified || new Date().toISOString().split('T')[0]
          };
          
          // Only copy safe fields
          const safeFields = ['data', 'metadata', 'tags', 'customFields'];
          for (const field of safeFields) {
            if (child[field] !== undefined) {
              childToSave[field] = child[field];
            }
          }
          
          await this.saveFolderItem(childToSave);
          
          // If it's a folder, recursively move its children too
          if (child.type === 'folder') {
            await this.moveFolderRecursive(child.path, childNewPath, child.name, child.name);
          }
          
          // Move file content (untuk file)
          if (child.type === 'file') {
            try {
              // Update fileContents (IndexedDB)
              const fileContent = await this.db.get('fileContents', child.path);
              if (fileContent) {
                await this.db.delete('fileContents', child.path);
                await this.db.set('fileContents', {
                  ...fileContent,
                  fileId: childNewPath,
                  fileName: child.name
                });
              }
            } catch (e) {
              // File content might not exist
            }
            
            // Update bucketsStore (NXUI.ref) - PASTIKAN path ter-update
            try {
              if (window.NXUI && window.NXUI.ref) {
                const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
                let dataform = [];
                if (Array.isArray(bucketsData)) {
                  dataform = bucketsData;
                } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
                  dataform = bucketsData.data;
                } else if (bucketsData && bucketsData.id === "fileContents") {
                  dataform = bucketsData.data || [];
                }
                
                // Update entries that match old path
                let updated = false;
                const newFileKey = this.generateFileKey(childNewPath);
                dataform = dataform.map(item => {
                  if (item && item.fileId === child.path) {
                    updated = true;
                    return {
                      ...item,
                      id: newFileKey,
                      fileId: childNewPath,
                      fileName: child.name,
                      lastModified: new Date().toISOString()
                    };
                  }
                  return item;
                });
                
                if (updated) {
                  const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
                  if (existingEntry && existingEntry.id === "fileContents") {
                    existingEntry.data = dataform;
                    await window.NXUI.ref.set("bucketsStore", existingEntry);
                  } else {
                    await window.NXUI.ref.set("bucketsStore", {
                      id: "fileContents",
                      data: dataform
                    });
                  }
                }
              }
            } catch (e) {
              console.error('Error updating bucketsStore during move:', e);
            }
          }
          
          await this.db.delete('folderStructure', child.path);
        }
      }
    }

    // Move file content if exists (untuk file, bukan folder)
    if (sourceItem.type === 'file') {
      try {
        // Update fileContents (IndexedDB)
        const fileContent = await this.db.get('fileContents', sourcePathString);
        if (fileContent) {
          await this.db.delete('fileContents', sourcePathString);
          await this.db.set('fileContents', {
            ...fileContent,
            fileId: newPath,
            fileName: newName
          });
        }
      } catch (e) {
        // File content might not exist, that's okay
      }
      
      // Update bucketsStore (NXUI.ref) - PASTIKAN path ter-update
      try {
        if (window.NXUI && window.NXUI.ref) {
          const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
          let dataform = [];
          if (Array.isArray(bucketsData)) {
            dataform = bucketsData;
          } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
            dataform = bucketsData.data;
          } else if (bucketsData && bucketsData.id === "fileContents") {
            dataform = bucketsData.data || [];
          }
          
          // Update entries that match old path
          let updated = false;
          const newFileKey = this.generateFileKey(newPath);
          dataform = dataform.map(item => {
            if (item && item.fileId === sourcePathString) {
              updated = true;
              return {
                ...item,
                id: newFileKey, // Update ID to match new path
                fileId: newPath, // Update fileId dengan path baru
                fileName: newName,
                lastModified: new Date().toISOString()
              };
            }
            return item;
          });
          
          if (updated) {
            const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
            if (existingEntry && existingEntry.id === "fileContents") {
              existingEntry.data = dataform;
              await window.NXUI.ref.set("bucketsStore", existingEntry);
            } else {
              await window.NXUI.ref.set("bucketsStore", {
                id: "fileContents",
                data: dataform
              });
            }
          }
        }
      } catch (e) {
        console.error('Error updating bucketsStore during move:', e);
      }
    }

    // Small delay to ensure all writes are committed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Delete source item AFTER everything is moved and verified
    // Use direct delete (not deleteFolderItem) to avoid recursive deletion of already-moved children
    // This is a MOVE operation, not DELETE, so don't move to recycle bin
    try {
      await this.db.delete('folderStructure', sourcePathString);
    } catch (error) {
    }

    // Log activity
    await this.logActivity('move', sourcePathString, sourceItem.type);

    // Final verification: check if item exists in destination
    const finalCheck = await this.getItemByPath(newPath);

    // Refresh view - navigate to destination folder if we're not already there
    if (destPathString !== this.pathToString(this.currentPath)) {
      // If we moved to a different folder, refresh current view
      await this.refresh();
    } else {
      // If we're in the destination folder, refresh to show the moved item
      await this.refresh();
    }
  }

  // Recursively move folder and all its children
  async moveFolderRecursive(sourcePath, destPath, originalName, newName) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const allItems = await this.db.getAll('folderStructure');
      if (!allItems || !allItems.data) {
        return;
      }

      // Find all children of source folder
      const children = allItems.data.filter(item => item.parentPath === sourcePath);

      for (const child of children) {
        // Build new path correctly
        const childNewPath = destPath ? `${destPath}/${child.name}` : child.name;
        const childNewName = child.name;

        // CRITICAL: Don't spread child - create clean object with correct path
        const childToSave = {
          id: childNewPath,
          path: childNewPath,
          parentPath: destPath,
          name: childNewName,
          type: child.type,
          size: child.size || '0 KB',
          modified: child.modified || new Date().toISOString().split('T')[0]
        };
        
        // Only copy safe fields from child (exclude path, parentPath, id, name)
        const safeFields = ['data', 'metadata', 'tags', 'customFields'];
        for (const field of safeFields) {
          if (child[field] !== undefined) {
            childToSave[field] = child[field];
          }
        }

        // Save child to new location
        await this.saveFolderItem(childToSave);
        
        // Verify it was saved
        await new Promise(resolve => setTimeout(resolve, 50));
        const verifyChild = await this.getItemByPath(childNewPath);
        if (!verifyChild) {
          // Try direct DB check
          const directChild = await this.db.get('folderStructure', childNewPath);
          if (!directChild) {
            continue; // Skip this child
          }
        }

        // Recursively move children if it's a folder
        if (child.type === 'folder') {
          await this.moveFolderRecursive(child.path, childNewPath, child.name, childNewName);
        }

        // Move file content if exists (untuk file)
        if (child.type === 'file') {
          try {
            // Update fileContents (IndexedDB)
            const fileContent = await this.db.get('fileContents', child.path);
            if (fileContent) {
              // Delete old entry
              try {
                await this.db.delete('fileContents', child.path);
              } catch (e) {
                // Might not exist
              }
              
              // Set new entry dengan path baru
              await this.db.set('fileContents', {
                ...fileContent,
                fileId: childNewPath,
                fileName: childNewName
              });
            }
          } catch (e) {
            // File content might not exist, that's okay
          }
          
          // Update bucketsStore (NXUI.ref) - PASTIKAN path ter-update
          try {
            if (window.NXUI && window.NXUI.ref) {
              const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
              let dataform = [];
              if (Array.isArray(bucketsData)) {
                dataform = bucketsData;
              } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
                dataform = bucketsData.data;
              } else if (bucketsData && bucketsData.id === "fileContents") {
                dataform = bucketsData.data || [];
              }
              
              // Update entries that match old path
              let updated = false;
              const newFileKey = this.generateFileKey(childNewPath);
              dataform = dataform.map(item => {
                if (item && item.fileId === child.path) {
                  updated = true;
                  return {
                    ...item,
                    id: newFileKey, // Update ID to match new path
                    fileId: childNewPath, // Update fileId dengan path baru
                    fileName: childNewName,
                    lastModified: new Date().toISOString()
                  };
                }
                return item;
              });
              
              if (updated) {
                const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
                if (existingEntry && existingEntry.id === "fileContents") {
                  existingEntry.data = dataform;
                  await window.NXUI.ref.set("bucketsStore", existingEntry);
                } else {
                  await window.NXUI.ref.set("bucketsStore", {
                    id: "fileContents",
                    data: dataform
                  });
                }
              }
            }
          } catch (e) {
            console.error('Error updating bucketsStore during move:', e);
          }
        }
        
        // Delete source child AFTER everything is moved
        try {
          await this.db.delete('folderStructure', child.path);
        } catch (error) {
        }
      }
      
      // Final verification: check if all children were moved
      const verifyAllItems = await this.db.getAll('folderStructure');
      const remaining = verifyAllItems.data.filter(item => item.parentPath === sourcePath);
    } catch (error) {
    }
  }

  // Handle file upload from computer
  async handleFileUpload(files) {
    if (!this.db) {
      await this.initDatabase();
    }

    const currentPathString = this.pathToString(this.currentPath);
    const uploadedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Generate unique file name
      let fileName = file.name;
      let counter = 1;
      let filePath = currentPathString ? `${currentPathString}/${fileName}` : fileName;

      // Check for duplicate names
      while (await this.getItemByPath(filePath)) {
        const nameParts = file.name.split('.');
        if (nameParts.length > 1) {
          const ext = nameParts.pop();
          const name = nameParts.join('.');
          fileName = `${name} (${counter}).${ext}`;
        } else {
          fileName = `${file.name} (${counter})`;
        }
        filePath = currentPathString ? `${currentPathString}/${fileName}` : fileName;
        counter++;
      }

      // Format file size
      const fileSize = this.formatFileSize(file.size);
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

      // Save file to folderStructure
      await this.saveFolderItem({
        id: filePath,
        path: filePath,
        parentPath: currentPathString,
        name: fileName,
        type: 'file',
        size: fileSize,
        modified: new Date().toISOString().split('T')[0]
      });

      // Read file content
      let fileContent = '';
      try {
        if (file.type.startsWith('text/') || 
            ['txt', 'js', 'html', 'css', 'json', 'md', 'xml', 'csv'].includes(fileExt)) {
          // Read as text for text files
          fileContent = await this.readFileAsText(file);
        } else {
          // Read as base64 for binary files
          fileContent = await this.readFileAsBase64(file);
        }

        // Save file content to IndexedDB
        await this.deleteAllConflictingFileContents(fileName, fileExt, filePath);
        await new Promise(resolve => setTimeout(resolve, 150));

        await this.db.set('fileContents', {
          fileId: filePath,
          fileName: fileName,
          fileType: fileExt,
          content: fileContent,
          contentType: file.type,
          lastModified: new Date().toISOString(),
          originalSize: file.size
        });
      } catch (error) {
        // Still save file entry even if content read fails
      }

      uploadedFiles.push(fileName);
      await this.logActivity('upload', filePath, 'file');
    }

    // Refresh view
    await this.refresh();
  }

  // Helper: Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Helper: Read file as text
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // Helper: Read file as base64
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Check if user is viewing a file in nxepo-file-content-body
      const isFileOpen = this.currentFile !== null || 
                         document.querySelector('.nxepo-file-content-body') !== null;
      
      // If file is open, only allow Escape to close file, disable all other shortcuts
      if (isFileOpen) {
        // Only allow Escape to close file
        if (e.key === 'Escape' && this.currentFile) {
          e.preventDefault();
          this.closeFileTab();
        }
        // Prevent Ctrl+S everywhere (even in inputs) - disable browser save
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
        // Don't handle other shortcuts when file is open
        return;
      }

      // Prevent Ctrl+S everywhere (even in inputs) - disable browser save
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Don't handle shortcuts if user is typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        this.selectAll();
      }

      // Ctrl+X: Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        this.cutFiles();
      }

      // Ctrl+C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        this.copyFiles();
      }

      // Ctrl+V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        this.pasteFiles();
      }

      // Enter: Open selected file/folder
      if (e.key === 'Enter' && this.selectedFiles.size === 1) {
        e.preventDefault();
        const fileName = Array.from(this.selectedFiles)[0];
        const fileItem = this.container.querySelector(`[data-name="${fileName}"]`);
        if (fileItem) {
          const type = fileItem.dataset.type;
          if (type === 'folder') {
            this.navigateToPath([...this.currentPath, fileName]);
          } else {
            this.openFile(fileName);
          }
        }
      }

      // F2: Rename
      if (e.key === 'F2' && this.selectedFiles.size === 1) {
        e.preventDefault();
        const fileName = Array.from(this.selectedFiles)[0];
        const fileItem = this.container.querySelector(`[data-name="${fileName}"]`);
        if (fileItem) {
          this.contextMenuTarget = fileItem;
          this.renameFile(); // Already async compatible
        }
      }

      // Delete: Delete selected
      if (e.key === 'Delete' && this.selectedFiles.size > 0) {
        e.preventDefault();
        this.deleteSelected(); // Already async
      }

      // F5: Refresh
      if (e.key === 'F5') {
        e.preventDefault();
        this.refresh();
      }

      // Escape: Clear selection or hide context menu or go back to folder view
      if (e.key === 'Escape') {
        if (this.currentFile) {
          // If viewing a file, close file tab
          this.closeFileTab();
        } else if (document.querySelector('#nxepo-context-menu.show')) {
          this.hideContextMenu();
        } else {
          this.selectedFiles.clear();
          this.updateSelection();
        }
      }
    });
  }

  async deleteSelected() {
    if (this.selectedFiles.size === 0) return;
    
    // Get current path
    const currentPathString = this.pathToString(this.currentPath);
    
    // Delete each selected file/folder from IndexedDB
    const filesToDelete = Array.from(this.selectedFiles);
    
    for (const fileName of filesToDelete) {
      const itemPath = currentPathString ? `${currentPathString}/${fileName}` : fileName;
      await this.deleteFolderItem(itemPath);
      
      // Remove from view immediately without refresh
      this.removeItemFromView(fileName);
    }
    
    // Clear selection
    this.selectedFiles.clear();
    this.updateSelection();
    
    // No refresh needed - items already removed from DOM
  }

  showContextMenu(e) {
    // Check if user is in Home - don't show context menu (Home is information page only)
    const isHome = this.currentPath && this.currentPath.length === 1 && 
                   this.currentPath[0] === 'Home';
    if (isHome) {
      // Allow default browser context menu in Home area (no custom context menu)
      return;
    }
    
    // Check if user is viewing a file in nxepo-file-content-body
    const isFileOpen = this.currentFile !== null || 
                       document.querySelector('.nxepo-file-content-body') !== null;
    
    // If file is open, don't show context menu (this is file content view, not file explorer)
    if (isFileOpen) {
      // Check if click is inside file content area
      const fileContentArea = e.target.closest('.nxepo-file-content-body, .nxepo-file-content');
      if (fileContentArea) {
        // Allow default browser context menu in file content area
        return;
      }
      // If clicked outside file content area but file is open, prevent context menu
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Check if user is in Local Disk - don't show context menu for system content
    const isLocalDisk = this.currentPath && this.currentPath.length >= 1 && 
                       (this.currentPath[0] === 'Local Disk' || this.currentPath[0] === 'Lc');
    if (isLocalDisk) {
      // Allow default browser context menu in Local Disk area
      return;
    }
    
    // Check if user is in Pictures, Music, or Videos - don't show context menu for special content
    const isSpecialContent = this.currentPath && this.currentPath.length === 2 && 
                             this.currentPath[0] === 'My Files' &&
                             (this.currentPath[1] === 'Pictures' || 
                              this.currentPath[1] === 'Music' || 
                              this.currentPath[1] === 'Videos');
    if (isSpecialContent) {
      // Allow default browser context menu in special content area
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const contextMenu = document.querySelector('#nxepo-context-menu');
    if (!contextMenu) return;

    // Determine if clicked on file/folder or empty space
    const target = e.target.closest('.nxepo-file-item, .nxepo-list-item');
    const isFileClick = target !== null;
    const clickedFile = target ? target.dataset.name : null;

    // Position menu
    const x = e.clientX;
    const y = e.clientY;

    // Store context for actions
    this.contextMenuTarget = target;
    this.contextMenuPosition = { x, y };

    // Update menu items based on context
    this.updateContextMenu(isFileClick, clickedFile);
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';
    contextMenu.classList.add('show');

    // Adjust position if menu goes off screen
    setTimeout(() => {
      const rect = contextMenu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (rect.right > windowWidth) {
        contextMenu.style.left = `${windowWidth - rect.width - 10}px`;
      }
      if (rect.bottom > windowHeight) {
        contextMenu.style.top = `${windowHeight - rect.height - 10}px`;
      }
    }, 0);
  }

  updateContextMenu(isFileClick, clickedFile) {
    const contextMenu = document.querySelector('#nxepo-context-menu');
    if (!contextMenu) return;

    const hasSelection = this.selectedFiles.size > 0;
    // hasClipboard: true jika ada clipboard normal ATAU ada clipboardSharedData (dari Shared Files)
    const hasNormalClipboard = this.clipboard !== null && this.clipboardFiles.size > 0;
    const hasSharedClipboard = this.clipboardSharedData !== null && this.clipboardFiles.size > 0;
    const hasClipboard = hasNormalClipboard || hasSharedClipboard;
    
    // Update context menu based on clipboard state

    // Build menu items
    let menuHTML = '';

    // Check if we're in Recycle Bin view
    if (this.isRecycleBinView) {
      // Recycle Bin specific menu
      if (isFileClick && clickedFile) {
        if (!this.selectedFiles.has(clickedFile)) {
          this.selectFile(clickedFile, this.contextMenuTarget?.dataset.type || 'file');
        }

        menuHTML += `
          <div class="nxepo-context-menu-item" data-action="restore">
            <span class="material-icons" style="color: #4caf50;">restore</span>
            <span>Restore</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="restore">
            <span class="material-icons" style="color: #4caf50;">restore_from_trash</span>
            <span>Restore to original location</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="deletePermanently">
            ${(() => {
              const deleteIcon = this.getIcon('base64_delete');
              const isImageIcon = typeof deleteIcon === 'string' && (deleteIcon.startsWith('http') || deleteIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${deleteIcon}" alt="Delete permanently" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons" style="color: #f44336;">delete_forever</span>`;
            })()}
            <span>Delete permanently</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="settings">
            ${(() => {
              const settingsIcon = this.getIcon('cxt_properties');
              const isImageIcon = typeof settingsIcon === 'string' && (settingsIcon.startsWith('http') || settingsIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${settingsIcon}" alt="Settings" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">settings</span>`;
            })()}
            <span>Settings</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="properties">
            ${(() => {
              const propertiesIcon = this.getIcon('properties');
              const isImageIcon = typeof propertiesIcon === 'string' && (propertiesIcon.startsWith('http') || propertiesIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${propertiesIcon}" alt="Properties" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">info</span>`;
            })()}
            <span>Properties</span>
          </div>
        `;
      } else {
        // Empty space in Recycle Bin
        menuHTML += `
          <div class="nxepo-context-menu-item" data-action="restore">
            <span class="material-icons" style="color: #4caf50;">restore</span>
            <span>Restore selected items</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="emptyRecycleBin">
            ${(() => {
              const deleteIcon = this.getIcon('base64_delete');
              const isImageIcon = typeof deleteIcon === 'string' && (deleteIcon.startsWith('http') || deleteIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${deleteIcon}" alt="Empty Recycle Bin" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons" style="color: #f44336;">delete_sweep</span>`;
            })()}
            <span>Empty Recycle Bin</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="selectAll">
            <span class="material-icons">select_all</span>
            <span>Select all</span>
            <span class="nxepo-context-menu-shortcut">Ctrl+A</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="refresh">
            ${(() => {
              const refreshIcon = this.getIcon('base64_refresh_tiny');
              const isImageIcon = typeof refreshIcon === 'string' && (refreshIcon.startsWith('http') || refreshIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${refreshIcon}" alt="Refresh" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">refresh</span>`;
            })()}
            <span>Refresh</span>
            <span class="nxepo-context-menu-shortcut">F5</span>
          </div>
        `;
      }
    } else {
      // Normal folder view menu
      if (isFileClick && clickedFile) {
        // File/Folder specific menu
        if (!this.selectedFiles.has(clickedFile)) {
          this.selectFile(clickedFile, this.contextMenuTarget?.dataset.type || 'file');
        }

        menuHTML += `
          <div class="nxepo-context-menu-item" data-action="open">
            ${(() => {
              const itemType = this.contextMenuTarget?.dataset.type || 'file';
              let openIcon;
              
              if (itemType === 'folder') {
                openIcon = this.getIcon('folder');
              } else {
                // File - use file icon based on extension
                openIcon = this.getFileIcon(clickedFile);
              }
              
              const isImageIcon = typeof openIcon === 'string' && (openIcon.startsWith('http') || openIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${openIcon}" alt="Open" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">${openIcon || 'open_in_new'}</span>`;
            })()}
            <span>Open</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="openNewTab">
            ${(() => {
              const newTabIcon = this.getIcon('newtab');
              const isImageIcon = typeof newTabIcon === 'string' && (newTabIcon.startsWith('http') || newTabIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${newTabIcon}" alt="Open in new tab" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">add</span>`;
            })()}
            <span>Open in new tab</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="cut">
            ${(() => {
              const cutIcon = this.getIcon('base64_cut');
              const isImageIcon = typeof cutIcon === 'string' && (cutIcon.startsWith('http') || cutIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${cutIcon}" alt="Cut" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">content_cut</span>`;
            })()}
            <span>Cut</span>
            <span class="nxepo-context-menu-shortcut">Ctrl+X</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="copy">
            ${(() => {
              const copyIcon = this.getIcon('base64_copy');
              const isImageIcon = typeof copyIcon === 'string' && (copyIcon.startsWith('http') || copyIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${copyIcon}" alt="Copy" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">content_copy</span>`;
            })()}
            <span>Copy</span>
            <span class="nxepo-context-menu-shortcut">Ctrl+C</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="paste" ${!hasClipboard ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
            ${(() => {
              const pasteIcon = this.getIcon('base64_paste');
              const isImageIcon = typeof pasteIcon === 'string' && (pasteIcon.startsWith('http') || pasteIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${pasteIcon}" alt="Paste" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">content_paste</span>`;
            })()}
            <span>Paste</span>
            <span class="nxepo-context-menu-shortcut">Ctrl+V</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="rename">
            ${(() => {
              const renameIcon = this.getIcon('base64_rename');
              const isImageIcon = typeof renameIcon === 'string' && (renameIcon.startsWith('http') || renameIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${renameIcon}" alt="Rename" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">edit</span>`;
            })()}
            <span>Rename</span>
            <span class="nxepo-context-menu-shortcut">F2</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="delete">
            ${(() => {
              const deleteIcon = this.getIcon('base64_delete');
              const isImageIcon = typeof deleteIcon === 'string' && (deleteIcon.startsWith('http') || deleteIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${deleteIcon}" alt="Delete" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">delete</span>`;
            })()}
            <span>Delete</span>
            <span class="nxepo-context-menu-shortcut">Del</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          ${(() => {
            const itemType = this.contextMenuTarget?.dataset.type || 'file';
            if (itemType === 'folder') {
              return `
                <div class="nxepo-context-menu-item" data-action="share">
                  ${(() => {
                    const shareIcon = this.getIcon('share');
                    const isImageIcon = typeof shareIcon === 'string' && (shareIcon.startsWith('http') || shareIcon.startsWith('data:'));
                    return isImageIcon 
                      ? `<img src="${shareIcon}" alt="share" style="width: 20px; height: 20px; object-fit: contain;" />`
                      : `<span class="material-icons">share</span>`;
                  })()}
                  <span>Shared</span>
                </div>
              `;
            }
            return '';
          })()}
          <div class="nxepo-context-menu-item" data-action="settings">
            ${(() => {
              const settingsIcon = this.getIcon('cxt_properties');
              const isImageIcon = typeof settingsIcon === 'string' && (settingsIcon.startsWith('http') || settingsIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${settingsIcon}" alt="Settings" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">settings</span>`;
            })()}
            <span>Settings</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="properties">
            ${(() => {
              const propertiesIcon = this.getIcon('properties');
              const isImageIcon = typeof propertiesIcon === 'string' && (propertiesIcon.startsWith('http') || propertiesIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${propertiesIcon}" alt="Properties" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">info</span>`;
            })()}
            <span>Properties</span>
          </div>
        `;
      } else {
        // Empty space menu
        menuHTML += `
          <div class="nxepo-context-menu-item" data-action="paste" ${!hasClipboard ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
            ${(() => {
              const pasteIcon = this.getIcon('base64_paste');
              const isImageIcon = typeof pasteIcon === 'string' && (pasteIcon.startsWith('http') || pasteIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${pasteIcon}" alt="Paste" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">content_paste</span>`;
            })()}
            <span>Paste</span>
            <span class="nxepo-context-menu-shortcut">Ctrl+V</span>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="newFolder">
            ${(() => {
              const folderIcon = this.getIcon('base64_icon_fileexplorer');
              const isImageIcon = typeof folderIcon === 'string' && (folderIcon.startsWith('http') || folderIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${folderIcon}" alt="New folder" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">${folderIcon || 'create_new_folder'}</span>`;
            })()}
            <span>New folder</span>
          </div>
          <div class="nxepo-context-menu-item nxepo-context-menu-has-submenu" data-action="newFile">
            ${(() => {
              const fileIcon = this.getIcon('office');
              const isImageIcon = typeof fileIcon === 'string' && (fileIcon.startsWith('http') || fileIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${fileIcon}" alt="New file" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">${fileIcon || 'insert_drive_file'}</span>`;
            })()}
            <span>New file</span>
            <span class="material-icons nxepo-context-menu-arrow">chevron_right</span>
            <div class="nxepo-context-menu-submenu">
              ${(() => {
                // Get icons for each file type
                const getIconHTML = (filename, fallback) => {
                  const icon = this.getFileIcon(filename);
                  const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
                  return isImageIcon 
                    ? `<img src="${icon}" alt="${filename.split('.').pop()}" style="width: 20px; height: 20px; object-fit: contain;" />`
                    : `<span class="material-icons">${icon || fallback}</span>`;
                };
                
                return `
              <div class="nxepo-context-menu-item" data-action="newFile" data-file-type="txt">
                ${getIconHTML('file.txt', 'description')}
                <span>Text File (.txt)</span>
              </div>
              <div class="nxepo-context-menu-item" data-action="newFile" data-file-type="docx">
                ${getIconHTML('file.docx', 'description')}
                <span>Word Document (.docx)</span>
              </div>
              <div class="nxepo-context-menu-item" data-action="newFile" data-file-type="xlsx">
                ${getIconHTML('file.xlsx', 'grid_on')}
                <span>Excel Spreadsheet (.xlsx)</span>
              </div>
              <div class="nxepo-context-menu-item" data-action="newFile" data-file-type="pptx">
                ${getIconHTML('file.pptx', 'slideshow')}
                <span>PowerPoint Presentation (.pptx)</span>
              </div>
              <div class="nxepo-context-menu-item" data-action="newFile" data-file-type="pdf">
                ${getIconHTML('file.pdf', 'picture_as_pdf')}
                <span>PDF Document (.pdf)</span>
              </div>
                `;
              })()}
            </div>
          </div>
          <div class="nxepo-context-menu-item nxepo-context-menu-has-submenu" data-action="newMedia">
            ${(() => {
              const mediaIcon = this.getIcon('base64_icon_pictures');
              const isImageIcon = typeof mediaIcon === 'string' && (mediaIcon.startsWith('http') || mediaIcon.startsWith('data:'));
              const iconHtml = isImageIcon 
                ? `<img src="${mediaIcon}" alt="Media" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">image</span>`;
              return iconHtml;
            })()}
            <span>New Media</span>
            <span class="material-icons nxepo-context-menu-arrow">chevron_right</span>
            <div class="nxepo-context-menu-submenu">
              ${(() => {
                // Get icons for media types
                const getMediaIconHTML = (iconName, fallback) => {
                  const icon = this.getIcon(iconName);
                  const isImageIcon = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'));
                  return isImageIcon 
                    ? `<img src="${icon}" alt="${iconName}" style="width: 20px; height: 20px; object-fit: contain;" />`
                    : `<span class="material-icons">${fallback}</span>`;
                };
                
                return `
              <div class="nxepo-context-menu-item" data-action="newMedia" data-media-type="jpg">
                ${getMediaIconHTML('base64_icon_pictures', 'image')}
                <span>Picture (.jpg)</span>
              </div>
              <div class="nxepo-context-menu-item" data-action="newMedia" data-media-type="mp3">
                ${getMediaIconHTML('base64_icon_music', 'audiotrack')}
                <span>Music (.mp3)</span>
              </div>
              <div class="nxepo-context-menu-item" data-action="newMedia" data-media-type="mp4">
                ${getMediaIconHTML('base64_icon_videos', 'movie')}
                <span>Video (.mp4)</span>
              </div>
                `;
              })()}
            </div>
          </div>
          <div class="nxepo-context-menu-separator"></div>
          <div class="nxepo-context-menu-item" data-action="selectAll">
            <span class="material-icons">select_all</span>
            <span>Select all</span>
            <span class="nxepo-context-menu-shortcut">Ctrl+A</span>
          </div>
          <div class="nxepo-context-menu-item" data-action="refresh">
            ${(() => {
              const refreshIcon = this.getIcon('base64_refresh_tiny');
              const isImageIcon = typeof refreshIcon === 'string' && (refreshIcon.startsWith('http') || refreshIcon.startsWith('data:'));
              return isImageIcon 
                ? `<img src="${refreshIcon}" alt="Refresh" style="width: 20px; height: 20px; object-fit: contain;" />`
                : `<span class="material-icons">refresh</span>`;
            })()}
            <span>Refresh</span>
            <span class="nxepo-context-menu-shortcut">F5</span>
          </div>
        `;
      }
    }

    contextMenu.innerHTML = menuHTML;

    // Add event listeners to menu items
    contextMenu.querySelectorAll('.nxepo-context-menu-item').forEach(item => {
      const hasSubmenu = item.classList.contains('nxepo-context-menu-has-submenu');
      
      if (hasSubmenu) {
        // Handle hover for submenu
        item.addEventListener('mouseenter', (e) => {
          const submenu = item.querySelector('.nxepo-context-menu-submenu');
          if (submenu) {
            this.showSubmenu(item, submenu);
          }
        });
        
        item.addEventListener('mouseleave', (e) => {
          // Delay hide to allow moving to submenu
          setTimeout(() => {
            const submenu = item.querySelector('.nxepo-context-menu-submenu');
            if (submenu && !submenu.matches(':hover') && !item.matches(':hover')) {
              this.hideSubmenu(submenu);
            }
          }, 200);
        });
      } else {
        // Regular click handler
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = item.dataset.action;
          const fileType = item.dataset.fileType;
          const mediaType = item.dataset.mediaType;
          
          if (action === 'newFile' && fileType) {
            this.handleContextMenuAction(action, fileType);
          } else if (action === 'newMedia' && mediaType) {
            this.handleContextMenuAction(action, mediaType);
          } else {
            this.handleContextMenuAction(action);
          }
          this.hideContextMenu();
        });
      }
    });
    
    // Handle submenu hover
    contextMenu.querySelectorAll('.nxepo-context-menu-submenu').forEach(submenu => {
      submenu.addEventListener('mouseenter', () => {
        submenu.style.display = 'block';
      });
      
      submenu.addEventListener('mouseleave', () => {
        this.hideSubmenu(submenu);
      });
    });
  }

  showSubmenu(parentItem, submenu) {
    // Hide other submenus
    document.querySelectorAll('.nxepo-context-menu-submenu').forEach(sm => {
      if (sm !== submenu) {
        sm.style.display = 'none';
      }
    });
    
    // Position and show submenu
    const parentRect = parentItem.getBoundingClientRect();
    const menuRect = parentItem.closest('.nxepo-context-menu').getBoundingClientRect();
    
    submenu.style.display = 'block';
    submenu.style.left = `${parentRect.width}px`;
    submenu.style.top = '0px';
    
    // Adjust if submenu goes off screen
    setTimeout(() => {
      const submenuRect = submenu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      
      if (submenuRect.right > windowWidth) {
        submenu.style.left = `-${submenuRect.width}px`;
      }
    }, 0);
  }

  hideSubmenu(submenu) {
    submenu.style.display = 'none';
  }

  handleContextMenuAction(action, fileType = null) {
    switch (action) {
      case 'open':
        if (this.contextMenuTarget) {
          const type = this.contextMenuTarget.dataset.type;
          const name = this.contextMenuTarget.dataset.name;
          if (type === 'folder') {
            this.navigateToPath([...this.currentPath, name]);
          } else {
            // Open file - replace current tab or open in new tab if no tabs
            this.openFile(name, false);
          }
        }
        break;

      case 'openNewTab':
        if (this.contextMenuTarget) {
          const name = this.contextMenuTarget.dataset.name;
          // Open in new tab - works for both files and folders
          this.openFile(name, true);
        }
        break;

      case 'cut':
        this.cutFiles();
        break;

      case 'copy':
        this.copyFiles();
        break;

      case 'paste':
        this.pasteFiles();
        break;

      case 'rename':
        this.renameFile();
        break;

      case 'delete':
        this.deleteSelected();
        break;

      case 'restore':
        this.restoreFromRecycleBin();
        break;

      case 'deletePermanently':
        this.deletePermanently();
        break;

      case 'emptyRecycleBin':
        this.emptyRecycleBin();
        break;

      case 'settings':
        this.showSettings();
        break;

      case 'properties':
        this.showProperties();
        break;

      case 'share':
        this.showShared();
        break;

      case 'newFolder':
        this.createNewFolder();
        break;

      case 'newFile':
        if (fileType) {
          this.createNewFile(fileType);
        } else if (this.contextMenuTarget) {
          const fileTypeFromTarget = this.contextMenuTarget.dataset.fileType || 'custom';
          this.createNewFile(fileTypeFromTarget);
        }
        break;

      case 'newMedia':
        if (fileType) { // fileType parameter is actually mediaType in this case
          this.createNewFile(fileType);
        } else if (this.contextMenuTarget) {
          const mediaType = this.contextMenuTarget.dataset.mediaType || 'jpg';
          this.createNewFile(mediaType);
        }
        break;

      case 'selectAll':
        this.selectAll();
        break;

      case 'refresh':
        this.refresh();
        break;
    }
  }

  cutFiles() {
    // Clear previous clipboard info
    this.clipboardFiles = new Set();
    this.clipboardFilesInfo = new Map();
    
    // Get selected files or use context menu target
    let filesToCut = [];
    if (this.selectedFiles.size === 0 && this.contextMenuTarget) {
      const name = this.contextMenuTarget.dataset.name;
      const type = this.contextMenuTarget.dataset.type || 'file';
      filesToCut = [{ name, type }];
    } else {
      // Get file info from selected files
      for (const fileName of this.selectedFiles) {
        const fileItem = this.container.querySelector(`[data-name="${fileName}"]`);
        const type = fileItem ? (fileItem.dataset.type || 'file') : 'file';
        filesToCut.push({ name: fileName, type });
      }
    }
    
    if (filesToCut.length === 0) {
      return;
    }
    
    // Store files and their info
    for (const file of filesToCut) {
      this.clipboardFiles.add(file.name);
      this.clipboardFilesInfo.set(file.name, {
        name: file.name,
        type: file.type,
        path: [...this.currentPath, file.name]
      });
    }
    
    // Store source path for cut operation
    this.clipboardSourcePath = [...this.currentPath];
    this.clipboard = 'cut';
    
  }

  copyFiles() {
    // Clear previous clipboard info
    this.clipboardFiles = new Set();
    this.clipboardFilesInfo = new Map();
    
    // Get selected files or use context menu target
    let filesToCopy = [];
    if (this.selectedFiles.size === 0 && this.contextMenuTarget) {
      const name = this.contextMenuTarget.dataset.name;
      const type = this.contextMenuTarget.dataset.type || 'file';
      filesToCopy = [{ name, type }];
    } else {
      // Get file info from selected files
      for (const fileName of this.selectedFiles) {
        const fileItem = this.container.querySelector(`[data-name="${fileName}"]`);
        const type = fileItem ? (fileItem.dataset.type || 'file') : 'file';
        filesToCopy.push({ name: fileName, type });
      }
    }
    
    if (filesToCopy.length === 0) {
      return;
    }
    
    // Store files and their info
    for (const file of filesToCopy) {
      this.clipboardFiles.add(file.name);
      this.clipboardFilesInfo.set(file.name, {
        name: file.name,
        type: file.type,
        path: [...this.currentPath, file.name]
      });
    }
    
    // Store source path for copy operation
    this.clipboardSourcePath = [...this.currentPath];
    this.clipboard = 'copy';
    
  }

  // Copy file from Shared Files View
  async copyFile(fileData) {
    try {
      if (!fileData || !fileData.decodedData) {
        return;
      }

      const decodedData = fileData.decodedData;
      const folder = fileData.data || fileData;
      
      this.clipboard = 'copy';
      const fileName = folder.name || 'Unknown';
      this.clipboardFiles = new Set([fileName]);
      this.clipboardFilesInfo = new Map();
      this.clipboardFilesInfo.set(fileName, {
        name: fileName,
        type: folder.type || 'folder',
        path: folder.path ? folder.path.split('/') : ['Shared Files', fileName]
      });
      this.clipboardSourcePath = null;
      
      this.clipboardSharedData = {
        folder: decodedData.folder,
        bucketsStore: decodedData.bucketsStore,
        fileContents: decodedData.fileContents,
        shareID: fileData.shareID || null
      };
    } catch (error) {
      // Silently handle errors
    }
  }

  // Paste files from Shared Files
  async pasteFromSharedFiles() {
    try {
      if (!this.clipboardSharedData) {
        return;
      }

      const decodedData = this.clipboardSharedData;
      const filesToPaste = Array.from(this.clipboardFiles);
      
      // IMPORTANT: If user right-clicked on a folder, paste INTO that folder
      let destPath = [...this.currentPath];
      if (this.contextMenuTarget && this.contextMenuTarget.dataset.type === 'folder') {
        const folderName = this.contextMenuTarget.dataset.name;
        destPath = [...this.currentPath, folderName];
      }
      
      const destPathString = this.pathToString(destPath);
      
      // Process folder from decodedData.folder - gunakan data asli
      if (decodedData.folder) {
        const folder = decodedData.folder; // Data asli dari decodedData.folder
        const folderName = filesToPaste[0] || folder.name || 'Unknown';
        
        // Handle duplicate names
        let newName = folderName;
        let counter = 1;
        let newPath = destPathString ? `${destPathString}/${newName}` : newName;
        
        while (await this.getItemByPath(newPath)) {
          const nameParts = folderName.split('.');
          if (nameParts.length > 1 && folder.type === 'file') {
            const ext = nameParts.pop();
            const name = nameParts.join('.');
            newName = `${name} (${counter}).${ext}`;
          } else {
            newName = `${folderName} (${counter})`;
          }
          newPath = destPathString ? `${destPathString}/${newName}` : newName;
          counter++;
        }
        
        // Save folder to folderStructure (IndexedDB)
        const itemToSave = {
          id: newPath,
          path: newPath,
          parentPath: destPathString,
          name: newName,
          type: folder.type || 'folder',
          size: folder.size || '0 KB',
          modified: new Date().toISOString().split('T')[0],
          createdAt: folder.createdAt || new Date().toISOString(),
          updatedAt: folder.updatedAt || new Date().toISOString(),
          data: folder.data || []
        };
        
        await this.saveFolderItem(itemToSave);
        
        if (folder.data && Array.isArray(folder.data)) {
          await this.copySharedFolderStructureRecursive(
            folder.data, 
            destPathString ? `${destPathString}/${newName}` : newName,
            folder.path || folder.id, // Original folder path untuk mapping
            decodedData
          );
        }
        
        // bucketsStore sudah diproses di copySharedFolderStructureRecursive untuk setiap file
        // Tidak perlu memproses secara terpisah lagi
      }
      
      // Wait a bit for IndexedDB to commit
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Notify SharedFilesView bahwa paste berhasil (untuk delete shareID di SharedFilesView)
      const shareID = this.clipboardSharedData?.shareID;
      if (shareID && window.sharedFilesViewInstance) {
        // Trigger callback untuk SharedFilesView untuk menghapus shareID
        if (typeof window.sharedFilesViewInstance.onPasteSuccess === 'function') {
          await window.sharedFilesViewInstance.onPasteSuccess(shareID);
        }
      }
      
      // Clear clipboard
      this.clipboard = null;
      this.clipboardFiles.clear();
      this.clipboardFilesInfo.clear();
      this.clipboardSourcePath = null;
      this.clipboardSharedData = null;
      
      // Refresh view
      await this.loadFiles();
      
    } catch (error) {
      console.error('Error in pasteFromSharedFiles:', error);
    }
  }

  async pasteFiles() {
    if (this.clipboardFiles.size === 0) {
      return;
    }
    
    // Check if this is a paste from Shared Files
    if (this.clipboardSharedData) {
      await this.pasteFromSharedFiles();
      return;
    }
    
    if (!this.clipboardSourcePath) {
      return;
    }
    
    const sourcePathString = this.pathToString(this.clipboardSourcePath);
    
    // IMPORTANT: If user right-clicked on a folder, paste INTO that folder
    // Otherwise, paste into current folder
    let destPath = [...this.currentPath];
    if (this.contextMenuTarget && this.contextMenuTarget.dataset.type === 'folder') {
      const folderName = this.contextMenuTarget.dataset.name;
      destPath = [...this.currentPath, folderName];
    }
    
    const destPathString = this.pathToString(destPath);
    
    // Get file types from clipboard info
    const filesWithTypes = Array.from(this.clipboardFilesInfo.values()).map(f => ({
      name: f.name,
      type: f.type
    }));
    
    // Don't paste if source and destination are the same for cut operation
    if (this.clipboard === 'cut' && sourcePathString === destPathString) {
      
      // Show user-friendly message with more details
      if (typeof alert !== 'undefined') {
        const fileCount = this.clipboardFiles.size;
        const fileWord = fileCount === 1 ? 'file' : 'files';
        const message = `Cannot move ${fileCount} ${fileWord} to the same folder.\n\n` +
          `Source: ${sourcePathString}\n` +
          `Destination: ${destPathString}\n\n` +
          `Please navigate to a different folder first, or use Copy instead of Cut.`;
        alert(message);
      }
      
      // Clear clipboard
      this.clipboard = null;
      this.clipboardFiles.clear();
      this.clipboardFilesInfo.clear();
      this.clipboardSourcePath = null;
      
      return;
    }
    
    // For copy operation, allow same folder (will create duplicates)
    // This is already handled by duplicate name checking below
    
    const filesToPaste = Array.from(this.clipboardFiles);
    
    for (const fileName of filesToPaste) {
      const sourceItemPath = sourcePathString ? `${sourcePathString}/${fileName}` : fileName;
      const sourceItem = await this.getItemByPath(sourceItemPath);
      
      if (!sourceItem) {
        continue;
      }
      
      // Handle duplicate names
      // For copy operation in same folder, always create duplicate with counter
      // For cut operation, this should not happen (validated above)
      let newName = fileName;
      let counter = 1;
      let newPath = destPathString ? `${destPathString}/${newName}` : newName;
      
      // Check if file already exists at destination
      const existingItem = await this.getItemByPath(newPath);
      
      while (await this.getItemByPath(newPath)) {
        const nameParts = fileName.split('.');
        if (nameParts.length > 1 && sourceItem.type === 'file') {
          const ext = nameParts.pop();
          const name = nameParts.join('.');
          newName = `${name} (${counter}).${ext}`;
        } else {
          newName = `${fileName} (${counter})`;
        }
        newPath = destPathString ? `${destPathString}/${newName}` : newName;
        counter++;
      }
      
      if (counter > 1) {
      }
      
      // Copy item to destination
      // CRITICAL: Don't spread sourceItem - create clean object with correct path
      const itemToSave = {
        id: newPath,
        path: newPath,
        parentPath: destPathString,
        name: newName,
        type: sourceItem.type,
        size: sourceItem.size || '0 KB',
        modified: new Date().toISOString().split('T')[0]
      };
      
      // Only copy safe fields from sourceItem (exclude path, parentPath, id, name)
      const safeFields = ['data', 'metadata', 'tags', 'customFields'];
      for (const field of safeFields) {
        if (sourceItem[field] !== undefined) {
          itemToSave[field] = sourceItem[field];
        }
      }
      
      // Save item to destination
      try {
        await this.saveFolderItem(itemToSave);
        // Verify item was saved
        const verifyPasted = await this.getItemByPath(newPath);
        if (!verifyPasted) {
          // Try direct DB access
          const directCheck = await this.db.get('folderStructure', newPath);
          if (!directCheck) {
            continue; // Skip to next file
          }
        }
      } catch (saveError) {
        continue; // Skip to next file
      }
      
      // If it's a folder, recursively copy children
      if (sourceItem.type === 'folder') {
        await this.copyFolderRecursive(sourceItemPath, newPath, sourceItem.name, newName);
      }
      
      // Copy file content if exists
      try {
        const fileContent = await this.db.get('fileContents', sourceItemPath);
        if (fileContent) {
          // Delete old entry if exists at new path
          try {
            const existing = await this.db.get('fileContents', newPath);
            if (existing) {
              await this.db.delete('fileContents', newPath);
            }
          } catch (e) {
            // Doesn't exist, that's fine
          }
          
          await this.deleteAllConflictingFileContents(newName, fileContent.fileType || '', newPath);
          await new Promise(resolve => setTimeout(resolve, 150));
          
          await this.db.set('fileContents', {
            ...fileContent,
            fileId: newPath,
            fileName: newName
          });
        }
      } catch (e) {
        // File content might not exist, that's okay
      }
      
      // If cut, remove from source
      if (this.clipboard === 'cut') {
        // Use direct delete for cut operation (not deleteFolderItem to avoid recycle bin)
        try {
          await this.db.delete('folderStructure', sourceItemPath);
          // Also delete file content from source
          try {
            await this.db.delete('fileContents', sourceItemPath);
          } catch (e) {
            // File content might not exist
          }
        } catch (error) {
        }
      }
    }
    
    // Wait a bit for IndexedDB to commit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get all items in destination
    const destItems = await this.getFolderItems(destPathString);
    
    // Clear clipboard after cut operation
    if (this.clipboard === 'cut') {
      // Remove cut files from view (if pasting in different folder)
      if (sourcePathString !== destPathString) {
        for (const fileName of filesToPaste) {
          // Only remove if we're in the source folder
          if (this.pathToString(this.currentPath) === sourcePathString) {
            this.removeItemFromView(fileName);
          }
        }
      }
      
      this.clipboard = null;
      this.clipboardFiles.clear();
      this.clipboardFilesInfo.clear();
      this.clipboardSourcePath = null;
    }
    
    // Add pasted files to view (if pasting in current folder)
    if (this.pathToString(this.currentPath) === destPathString) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Get pasted items and add to view
      const destItems = await this.getFolderItems(destPathString);
      for (const fileName of filesToPaste) {
        // Find the item (might have been renamed with counter)
        const pastedItem = destItems.find(item => {
          const nameMatch = item.name === fileName || 
                           item.name.startsWith(fileName.split('.')[0] + ' (') ||
                           item.name.startsWith(fileName.split('.')[0] + '.');
          return nameMatch;
        });
        
        if (pastedItem) {
          // Check if item already in view
          const existingItem = this.container.querySelector(`[data-name="${pastedItem.name}"]`);
          if (!existingItem) {
            this.addItemToView(pastedItem);
          }
        }
      }
    } else {
      // If pasting in different folder, just wait for IndexedDB to commit
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    // No refresh needed - items already added/removed from DOM
  }

  // Recursively copy folder and all its children
  // Rename folder recursively - update all child items (files and subfolders)
  async renameFolderRecursive(oldFolderPath, newFolderPath) {
    try {
      // Get all items directly from database to ensure we get all children
      const allItems = await this.db.getAll('folderStructure');
      let allItemsArray = [];
      if (allItems && allItems.data && Array.isArray(allItems.data)) {
        allItemsArray = allItems.data;
      } else if (Array.isArray(allItems)) {
        allItemsArray = allItems;
      }
      
      // Filter items that are children of the old folder (direct children)
      const directChildren = allItemsArray.filter(item => 
        item && item.parentPath === oldFolderPath
      );
      
      if (!directChildren || directChildren.length === 0) {
        return; // No child items to update
      }
      
      console.log(`Renaming folder ${oldFolderPath} to ${newFolderPath}, found ${directChildren.length} direct children`);
      
      // Update each child item
      for (const childItem of directChildren) {
        const oldChildPath = childItem.path || childItem.id;
        if (!oldChildPath) {
          console.warn('Skipping child item without path:', childItem);
          continue;
        }
        
        // Calculate new path by replacing old folder path with new folder path
        // Ensure we replace the full path, not just a substring
        const newChildPath = oldChildPath.replace(oldFolderPath, newFolderPath);
        const childName = childItem.name;
        const childType = childItem.type;
        
        console.log(`Updating child: ${oldChildPath} -> ${newChildPath} (${childType})`);
        
        // Update folderStructure
        try {
          // Get full item data first
          const fullChildItem = await this.db.get('folderStructure', oldChildPath);
          if (!fullChildItem) {
            console.warn(`Child item not found in DB: ${oldChildPath}`);
            continue;
          }
          
          // Delete old entry
          await this.db.delete('folderStructure', oldChildPath);
          
          // Create new entry with updated path
          const updatedChildItem = {
            ...fullChildItem,
            id: newChildPath,
            path: newChildPath,
            parentPath: newFolderPath, // Update parent path
            name: childName,
            type: childType
          };
          
          await this.saveFolderItem(updatedChildItem);
          console.log(`Updated folderStructure: ${oldChildPath} -> ${newChildPath}`);
          
          // If child is a folder, recursively update its children
          if (childType === 'folder') {
            await this.renameFolderRecursive(oldChildPath, newChildPath);
          }
          
          // If child is a file, update fileContents and bucketsStore
          if (childType === 'file') {
            // Update fileContents
            try {
              const fileContent = await this.db.get('fileContents', oldChildPath);
              if (fileContent) {
                await this.db.delete('fileContents', oldChildPath);
                await this.db.set('fileContents', {
                  ...fileContent,
                  fileId: newChildPath,
                  fileName: childName
                });
                console.log(`Updated fileContents: ${oldChildPath} -> ${newChildPath}`);
              }
            } catch (e) {
              // File content might not exist
            }
            
            // Update bucketsStore
            try {
              if (window.NXUI && window.NXUI.ref) {
                const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
                let dataform = [];
                if (Array.isArray(bucketsData)) {
                  dataform = bucketsData;
                } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
                  dataform = bucketsData.data;
                } else if (bucketsData && bucketsData.id === "fileContents") {
                  dataform = bucketsData.data || [];
                }
                
                // Update entries that match old path
                let updated = false;
                dataform = dataform.map(item => {
                  if (item && item.fileId === oldChildPath) {
                    updated = true;
                    const newFileKey = this.generateFileKey(newChildPath);
                    return {
                      ...item,
                      id: newFileKey,
                      fileId: newChildPath,
                      fileName: childName,
                      lastModified: new Date().toISOString()
                    };
                  }
                  return item;
                });
                
                if (updated) {
                  const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
                  if (existingEntry && existingEntry.id === "fileContents") {
                    existingEntry.data = dataform;
                    await window.NXUI.ref.set("bucketsStore", existingEntry);
                    console.log(`Updated bucketsStore: ${oldChildPath} -> ${newChildPath}`);
                  } else {
                    await window.NXUI.ref.set("bucketsStore", {
                      id: "fileContents",
                      data: dataform
                    });
                  }
                }
              }
            } catch (e) {
              console.error('Error updating bucketsStore:', e);
            }
          }
        } catch (error) {
          console.error(`Error updating child item ${oldChildPath}:`, error);
          // Continue with next item
        }
      }
      
      console.log(`Finished renaming folder ${oldFolderPath} to ${newFolderPath}`);
    } catch (error) {
      console.error('Error in renameFolderRecursive:', error);
    }
  }

  async copyFolderRecursive(sourcePath, destPath, originalName, newName) {
    try {
      const allItems = await this.db.getAll('folderStructure');
      const children = allItems.data.filter(item => item.parentPath === sourcePath);
      
      for (const child of children) {
        // Build new path correctly
        const childNewPath = destPath ? `${destPath}/${child.name}` : child.name;
        const childNewName = child.name;
        
        // CRITICAL: Don't spread child - create clean object with correct path
        const childToSave = {
          id: childNewPath,
          path: childNewPath,
          parentPath: destPath,
          name: childNewName,
          type: child.type,
          size: child.size || '0 KB',
          modified: child.modified || new Date().toISOString().split('T')[0]
        };
        
        // Only copy safe fields from child (exclude path, parentPath, id, name)
        const safeFields = ['data', 'metadata', 'tags', 'customFields'];
        for (const field of safeFields) {
          if (child[field] !== undefined) {
            childToSave[field] = child[field];
          }
        }
        
        await this.saveFolderItem(childToSave);
        
        // Recursively copy children if folder
        if (child.type === 'folder') {
          await this.copyFolderRecursive(child.path, childNewPath, child.name, childNewName);
        }
        
        // Copy file content
        try {
          const fileContent = await this.db.get('fileContents', child.path);
          if (fileContent) {
            // Delete old entry if exists at new path
            try {
              const existing = await this.db.get('fileContents', childNewPath);
              if (existing) {
                await this.db.delete('fileContents', childNewPath);
              }
            } catch (e) {
              // Doesn't exist, that's fine
            }
            
            await this.db.set('fileContents', {
              ...fileContent,
              fileId: childNewPath,
              fileName: childNewName
            });
          }
        } catch (e) {
          // File content might not exist
        }
      }
    } catch (error) {
    }
  }

  // Copy folder structure from Shared Files recursively
  async copySharedFolderStructureRecursive(items, destParentPath, originalParentPath, decodedData) {
    try {
      if (!items || !Array.isArray(items)) {
        return;
      }
      
      for (const item of items) {
        try {
          if (!item) {
            continue;
          }
          
          const itemData = item.data || item;
          const itemName = itemData.name || item.name;
          const itemType = itemData.type || item.type || 'file';
          const originalItemPath = itemData.path || itemData.id || item.path;
          
          if (!itemName || !originalItemPath) {
            continue;
          }
          
          // Calculate new path - PASTIKAN menggunakan destParentPath yang benar
          const newItemPath = destParentPath ? `${destParentPath}/${itemName}` : itemName;
          
          // Handle duplicate names
          let newItemName = itemName;
          let counter = 1;
          let finalItemPath = newItemPath;
          
          while (await this.getItemByPath(finalItemPath)) {
            const nameParts = itemName.split('.');
            if (nameParts.length > 1 && itemType === 'file') {
              const ext = nameParts.pop();
              const name = nameParts.join('.');
              newItemName = `${name} (${counter}).${ext}`;
            } else {
              newItemName = `${itemName} (${counter})`;
            }
            finalItemPath = destParentPath ? `${destParentPath}/${newItemName}` : newItemName;
            counter++;
          }
          
          // Save item to folderStructure
          // Jika folder, child items bisa ada di:
          // 1. item.data (jika array langsung)
          // 2. item.data.data (jika item.data adalah object dengan property data)
          // 3. item.sub (alternatif struktur)
          // Tentukan child items untuk disimpan
          let childItemsForSave = [];
          if (itemType === 'folder') {
            // Cek item.data jika itu array langsung
            if (item && item.data && Array.isArray(item.data)) {
              childItemsForSave = item.data;
              console.log(`Found childItems in item.data (array): ${childItemsForSave.length} items`);
            }
            // Cek item.data.data jika item.data adalah object
            else if (item && item.data && item.data.data && Array.isArray(item.data.data)) {
              childItemsForSave = item.data.data;
              console.log(`Found childItems in item.data.data: ${childItemsForSave.length} items`);
            }
            // Cek item.sub (alternatif struktur)
            else if (item && item.sub && Array.isArray(item.sub)) {
              childItemsForSave = item.sub;
              console.log(`Found childItems in item.sub: ${childItemsForSave.length} items`);
            }
            // Cek itemData.data sebagai fallback
            else if (itemData && itemData.data && Array.isArray(itemData.data)) {
              childItemsForSave = itemData.data;
              console.log(`Found childItems in itemData.data: ${childItemsForSave.length} items`);
            }
          }
          
          const itemToSave = {
            id: finalItemPath,
            path: finalItemPath,
            parentPath: destParentPath,
            name: newItemName,
            type: itemType,
            size: itemData.size || '0 KB',
            modified: itemData.modified || new Date().toISOString().split('T')[0],
            createdAt: itemData.createdAt || new Date().toISOString(),
            updatedAt: itemData.updatedAt || new Date().toISOString(),
            data: childItemsForSave // Store child data if folder
          };
          
          await this.saveFolderItem(itemToSave);
          console.log(`${itemType} saved to folderStructure:`, newItemName, 'path:', finalItemPath, 'parent:', destParentPath);
          
          // If it's a folder, recursively process its children
          // PASTIKAN: child items diproses dengan destParentPath = finalItemPath (path folder yang baru dibuat)
          // Struktur dari SystemData.js bisa berbeda:
          // 1. item.data adalah array langsung
          // 2. item.data.data adalah array (jika item.data adalah object)
          // 3. item.sub adalah array (alternatif struktur)
          if (itemType === 'folder') {
            // Gunakan childItemsForSave yang sudah ditentukan sebelumnya
            if (childItemsForSave && childItemsForSave.length > 0) {
              console.log(`Recursively processing folder ${newItemName} with ${childItemsForSave.length} children`);
              console.log(`  - destParentPath for children: ${finalItemPath}`);
              console.log(`  - originalParentPath for children: ${originalItemPath}`);
              console.log(`  - childItems structure:`, childItemsForSave.map(c => ({ 
                name: c.data?.name || c.name, 
                type: c.data?.type || c.type,
                hasData: !!c.data,
                hasDataData: !!(c.data?.data),
                isFolder: (c.data?.type || c.type) === 'folder'
              })));
              
              // PASTIKAN: child items diproses dengan destParentPath = finalItemPath
              // childItemsForSave adalah array child items, setiap item punya struktur { data: {...}, name, path, type }
              await this.copySharedFolderStructureRecursive(
                childItemsForSave, // Child items dari folder
                finalItemPath, // PASTIKAN: menggunakan finalItemPath sebagai destParentPath untuk child items
                originalItemPath, // Original path untuk mapping content
                decodedData
              );
            }
          }
          
          // If it's a file, find and save content from fileContents
          // PASTIKAN: file disimpan dengan parentPath = destParentPath (folder induk yang benar)
          if (itemType === 'file') {
            // Find content from decodedData.fileContents berdasarkan originalItemPath
            const fileContentItem = decodedData.fileContents?.find(fc => {
              const fcPath = fc.data?.path || fc.data?.id || fc.path;
              return fcPath === originalItemPath;
            });
            
            if (fileContentItem && fileContentItem.existingContent) {
              const existingContent = fileContentItem.existingContent;
              const fileType = existingContent.fileType || newItemName.split('.').pop() || 'custom';
              
              // Delete old entry if exists
              try {
                const existing = await this.db.get('fileContents', finalItemPath);
                if (existing) {
                  await this.db.delete('fileContents', finalItemPath);
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              } catch (e) {
                // Doesn't exist, that's fine
              }
              
              // Delete ALL conflicting entries dengan fileName+fileType yang sama
              // CRITICAL: Index 'fileNameType' memerlukan unique combination, jadi tidak bisa ada 2 file
              // dengan nama dan tipe yang sama, bahkan di path berbeda
              await this.deleteAllConflictingFileContents(newItemName, fileType, finalItemPath);
              
              // Wait minimal untuk IndexedDB commit setelah delete
              await new Promise(resolve => setTimeout(resolve, 200));
              
              // Verifikasi cepat - hanya 1x untuk memastikan tidak ada konflik tersisa
              try {
                const allFileContents = await this.db.getAll('fileContents');
                let fileContentsArray = [];
                if (allFileContents) {
                  if (Array.isArray(allFileContents)) {
                    fileContentsArray = allFileContents;
                  } else if (allFileContents.data && Array.isArray(allFileContents.data)) {
                    fileContentsArray = allFileContents.data;
                  }
                }
                
                // Cek apakah masih ada konflik (di path manapun)
                const remainingConflicts = fileContentsArray.filter(c => 
                  c && c.fileName === newItemName && c.fileType === fileType && c.fileId !== finalItemPath
                );
                
                // Hanya hapus konflik yang benar-benar berbeda path (bukan file yang baru saja dibuat)
                if (remainingConflicts.length > 0) {
                  const deletePromises = remainingConflicts.map(conflict => {
                    // Verifikasi cepat bahwa file benar-benar ada sebelum delete
                    return this.db.get('fileContents', conflict.fileId).then(exists => {
                      if (exists) {
                        return this.db.delete('fileContents', conflict.fileId).catch(() => {});
                      }
                    }).catch(() => {});
                  });
                  await Promise.all(deletePromises);
                  await new Promise(resolve => setTimeout(resolve, 200)); // Delay minimal
                }
              } catch (e) {
                // Ignore verification errors - proceed with save
              }
              
              // Save to fileContents (IndexedDB)
              try {
                await this.db.set('fileContents', {
                  fileId: finalItemPath,
                  fileName: newItemName,
                  fileType: fileType,
                  content: existingContent.content || '',
                  size: existingContent.size || 0,
                  uploadedAt: existingContent.uploadedAt || null,
                  lastModified: existingContent.lastModified || new Date().toISOString()
                });
              } catch (saveError) {
                if (saveError.name === 'ConstraintError') {
                  // Retry dengan cleanup yang lebih agresif (optimized)
                  try {
                    // Hapus semua konflik lagi
                    await this.deleteAllConflictingFileContents(newItemName, fileType, finalItemPath);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    // Verifikasi cepat dan hapus konflik yang tersisa
                    try {
                      const allFileContents = await this.db.getAll('fileContents');
                      let fileContentsArray = [];
                      if (allFileContents) {
                        if (Array.isArray(allFileContents)) {
                          fileContentsArray = allFileContents;
                        } else if (allFileContents.data && Array.isArray(allFileContents.data)) {
                          fileContentsArray = allFileContents.data;
                        }
                      }
                      
                      const finalConflicts = fileContentsArray.filter(c => 
                        c && c.fileName === newItemName && c.fileType === fileType && c.fileId !== finalItemPath
                      );
                      
                      if (finalConflicts.length > 0) {
                        const deletePromises = finalConflicts.map(conflict => 
                          this.db.delete('fileContents', conflict.fileId).catch(() => {})
                        );
                        await Promise.all(deletePromises);
                        await new Promise(resolve => setTimeout(resolve, 200));
                      }
                    } catch (e) {
                      // Ignore verification errors
                    }
                    
                    // Try save again
                    await this.db.set('fileContents', {
                      fileId: finalItemPath,
                      fileName: newItemName,
                      fileType: fileType,
                      content: existingContent.content || '',
                      size: existingContent.size || 0,
                      uploadedAt: existingContent.uploadedAt || null,
                      lastModified: existingContent.lastModified || new Date().toISOString()
                    });
                  } catch (retryError) {
                    // Skip file if retry fails
                  }
                }
              }
            }
            
            // Also save to bucketsStore if found
            const bucketItem = decodedData.bucketsStore?.find(b => {
              const bPath = b.fileId;
              return bPath === originalItemPath;
            });
            
            if (bucketItem) {
              try {
                // Get existing bucketsStore data
                const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
                let dataform = [];
                
                if (Array.isArray(bucketsData)) {
                  dataform = bucketsData;
                } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
                  dataform = bucketsData.data;
                } else if (bucketsData && bucketsData.id === "fileContents") {
                  dataform = bucketsData.data || [];
                }
                
                const fileKey = this.generateFileKey(finalItemPath);
                const existingIndex = dataform.findIndex(item => 
                  item.fileId === finalItemPath || item.fileName === newItemName
                );
                
                if (existingIndex === -1) {
                  dataform.push({
                    id: fileKey,
                    fileId: finalItemPath,
                    fileName: newItemName,
                    fileType: bucketItem.fileType || newItemName.split('.').pop() || 'application/octet-stream',
                    content: bucketItem.content || '',
                    size: bucketItem.size || 0,
                    uploadedAt: bucketItem.uploadedAt || null,
                    lastModified: bucketItem.lastModified || new Date().toISOString()
                  });
                  console.log('File saved to bucketsStore (NXUI.ref):', newItemName, 'with id:', fileKey);
                } else {
                  dataform[existingIndex] = {
                    id: dataform[existingIndex].id || fileKey,
                    fileId: finalItemPath,
                    fileName: newItemName,
                    fileType: bucketItem.fileType || newItemName.split('.').pop() || 'application/octet-stream',
                    content: bucketItem.content || '',
                    size: bucketItem.size || 0,
                    uploadedAt: bucketItem.uploadedAt || null,
                    lastModified: bucketItem.lastModified || new Date().toISOString()
                  };
                  console.log('File updated in bucketsStore (NXUI.ref):', newItemName);
                }
                
                // Update bucketsStore
                const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
                if (existingEntry && existingEntry.id === "fileContents") {
                  existingEntry.data = dataform;
                  await window.NXUI.ref.set("bucketsStore", existingEntry);
                } else {
                  await window.NXUI.ref.set("bucketsStore", {
                    id: "fileContents",
                    data: dataform
                  });
                }
              } catch (bucketError) {
                console.error('Error saving to bucketsStore:', bucketError);
                // Continue to next item
              }
            }
          }
        } catch (itemError) {
          // Silently continue to next item even if this one fails
          continue;
        }
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  // Get folder by path (for compatibility - now uses IndexedDB)
  async getFolderByPath(path) {
    if (!path || path.length === 0) {
      return null;
    }

    const pathString = this.pathToString(path);
    const items = await this.getFolderItems(pathString);
    
    // Convert to object for compatibility
    const folderObj = {};
    for (const item of items) {
      folderObj[item.name] = item.data || {
        type: item.type,
        size: item.size,
        modified: item.modified,
        path: item.path
      };
    }
    
    return folderObj;
  }

  async renameFile() {
    let targetItem = this.contextMenuTarget;
    
    // If called from F2, find the selected item
    if (!targetItem && this.selectedFiles.size === 1) {
      const fileName = Array.from(this.selectedFiles)[0];
      targetItem = this.container.querySelector(`[data-name="${fileName}"]`);
    }
    
    if (!targetItem) return;
    
    const name = targetItem.dataset.name;
    const type = targetItem.dataset.type;
    
    // Find the name element based on view mode
    let nameElement = null;
    if (targetItem.classList.contains('nxepo-file-item')) {
      // Grid view
      nameElement = targetItem.querySelector('.nxepo-file-name');
    } else if (targetItem.classList.contains('nxepo-list-item')) {
      // List view - find the span inside .nxepo-list-col-name
      const nameCol = targetItem.querySelector('.nxepo-list-col-name');
      if (nameCol) {
        nameElement = nameCol.querySelector('span:last-child');
      }
    } else if (targetItem.classList.contains('nxepo-content-item')) {
      // Content view
      nameElement = targetItem.querySelector('.nxepo-content-name');
    }
    
    if (!nameElement) return;
    
    // Store original name
    const originalName = nameElement.textContent;
    const originalHTML = nameElement.innerHTML;
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalName;
    input.className = 'nxepo-rename-input';
    input.style.cssText = `
      width: 100%;
      padding: 2px 4px;
      border: 2px solid #0078d4;
      border-radius: 2px;
      background: #ffffff;
      font-size: inherit;
      font-family: inherit;
      outline: none;
    `;
    
    // Replace name element with input
    nameElement.style.display = 'none';
    nameElement.parentNode.insertBefore(input, nameElement);
    input.focus();
    
    // Select only filename without extension (like Windows Explorer)
    if (type === 'file' && originalName.includes('.')) {
      const lastDotIndex = originalName.lastIndexOf('.');
      input.setSelectionRange(0, lastDotIndex);
    } else {
      input.select();
    }
    
    // Handle save on Enter or blur
    const saveRename = async () => {
      let newName = input.value.trim();
      
      // If it's a file (not folder), preserve extension if user didn't include it
      if (type === 'file' && originalName.includes('.')) {
        const originalExt = originalName.substring(originalName.lastIndexOf('.'));
        if (!newName.includes('.')) {
          newName = newName + originalExt;
        }
      }
      
      if (newName && newName !== originalName && newName !== '') {
        // Validate name (no invalid characters)
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(newName)) {
          // Show visual feedback - red border
          input.style.borderColor = '#d32f2f';
          input.style.backgroundColor = '#ffebee';
          setTimeout(() => {
            input.style.borderColor = '#0078d4';
            input.style.backgroundColor = '#ffffff';
            input.focus();
            input.select();
          }, 1000);
          return;
        }
        
        // Get current path
        const currentPathString = this.pathToString(this.currentPath);
        const oldPath = currentPathString ? `${currentPathString}/${originalName}` : originalName;
        const newPath = currentPathString ? `${currentPathString}/${newName}` : newName;
        
        // Check for duplicate names
        const existing = await this.getItemByPath(newPath);
        if (existing) {
          // Show visual feedback - red border
          input.style.borderColor = '#d32f2f';
          input.style.backgroundColor = '#ffebee';
          setTimeout(() => {
            input.style.borderColor = '#0078d4';
            input.style.backgroundColor = '#ffffff';
            input.focus();
            input.select();
          }, 1000);
          return;
        }
        
        // Get original item
        const originalItem = await this.getItemByPath(oldPath);
        if (!originalItem) {
          input.remove();
          nameElement.style.display = '';
          return;
        }
        
        // Delete old entry
        await this.db.delete('folderStructure', oldPath);
        
        // Create new entry with new name (make sure name is not overwritten by spread)
        const newItem = {
          ...originalItem,
          id: newPath,
          path: newPath,
          parentPath: originalItem.parentPath || originalItem.parentPath,
          name: newName, // Ensure newName takes precedence
          type: originalItem.type,
          size: originalItem.size || '0 KB',
          modified: new Date().toISOString().split('T')[0]
        };
        
        // Save the new item
        await this.saveFolderItem(newItem);
        
        // Jika ini adalah folder, update semua child items secara rekursif
        if (originalItem.type === 'folder') {
          await this.renameFolderRecursive(oldPath, newPath);
        }
        
        // Update fileContents if exists (untuk file, bukan folder)
        if (originalItem.type === 'file') {
          try {
            const fileContent = await this.db.get('fileContents', oldPath);
            if (fileContent) {
              await this.db.delete('fileContents', oldPath);
              await this.db.set('fileContents', {
                ...fileContent,
                fileId: newPath,
                fileName: newName
              });
            }
          } catch (e) {
            // File content might not exist, that's okay
          }
        }
        
        // Update _currentUploadFile if this file is being uploaded
        if (window._currentUploadFile && 
            (window._currentUploadFile.fileName === originalName || 
             window._currentUploadFile.filePathString === oldPath)) {
          window._currentUploadFile.fileName = newName;
          window._currentUploadFile.filePathString = newPath;
        }
        
        // Update bucketsStore if this file has content there
        try {
          if (window.NXUI && window.NXUI.ref) {
            const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
            let dataform = [];
            if (Array.isArray(bucketsData)) {
              dataform = bucketsData;
            } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
              dataform = bucketsData.data;
            } else if (bucketsData && bucketsData.id === "fileContents") {
              dataform = bucketsData.data || [];
            }
            
            // Update all entries that match old path or old name
            let updated = false;
            const newFileKey = this.generateFileKey(newPath);
            dataform = dataform.map(item => {
              if (item.fileId === oldPath || item.fileName === originalName) {
                updated = true;
                return {
                  ...item,
                  id: newFileKey, // Update ID to match new path (hashed key)
                  fileId: newPath,
                  fileName: newName,
                  lastModified: new Date().toISOString()
                };
              }
              return item;
            });
            
            if (updated) {
              // Update existing entry, don't create new
              const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
              if (existingEntry && existingEntry.id === "fileContents") {
                existingEntry.data = dataform;
                await window.NXUI.ref.set("bucketsStore", existingEntry);
              } else {
                await window.NXUI.ref.set("bucketsStore", {
                  id: "fileContents",
                  data: dataform
                });
              }
            }
          }
        } catch (e) {
        }
        
        // Update selected files
        this.selectedFiles.delete(originalName);
        this.selectedFiles.add(newName);
        
        // Update name in DOM immediately
        nameElement.textContent = newName;
        
        // Update data-name attribute on the item
        if (targetItem) {
          targetItem.dataset.name = newName;
        }
        
        // Remove input and restore element
        input.remove();
        nameElement.style.display = '';
        
        // Update files array to reflect the rename
        const fileIndex = this.files.findIndex(f => f.name === originalName);
        if (fileIndex !== -1) {
          this.files[fileIndex] = {
            ...this.files[fileIndex],
            name: newName,
            path: newPath
          };
        }
        
        // Verify the data was saved correctly (without full refresh)
        try {
          const verifyItem = await this.getItemByPath(newPath);
          if (!verifyItem || verifyItem.name !== newName) {
            // Only refresh if verification failed
            setTimeout(async () => {
              await this.refresh();
              this.selectedFiles.clear();
              this.selectedFiles.add(newName);
              this.updateSelection();
            }, 150);
          }
        } catch (e) {
        }
      } else {
        // Cancel rename - restore original (no change or empty)
        input.remove();
        nameElement.style.display = '';
      }
    };
    
    // Handle cancel on Escape
    const cancelRename = () => {
      input.remove();
      nameElement.style.display = '';
    };
    
    // Event listeners
    let isSaving = false;
    
    const handleBlur = () => {
      // Use setTimeout to allow Enter key to process first
      if (!isSaving) {
        setTimeout(() => {
          if (!isSaving && document.activeElement !== input) {
            isSaving = true;
            saveRename();
          }
        }, 100);
      }
    };
    
    input.addEventListener('blur', handleBlur);
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (!isSaving) {
          isSaving = true;
          input.removeEventListener('blur', handleBlur);
          saveRename();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        input.removeEventListener('blur', handleBlur);
        cancelRename();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (!isSaving) {
          isSaving = true;
          input.removeEventListener('blur', handleBlur);
          saveRename();
        }
      }
    });
    
    // Prevent click events from bubbling
    input.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  async showSettings() {
    if (!this.contextMenuTarget) return;
    
    const name = this.contextMenuTarget.dataset.name;
    const type = this.contextMenuTarget.dataset.type || 'file';
    
    // Get full item information from database
    const currentPathString = this.pathToString(this.currentPath);
    const itemPath = currentPathString ? `${currentPathString}/${name}` : name;
    const item = await this.getItemByPath(itemPath);
    
    // Get file type if it's a file (needed for creating new file entries)
    let fileType = '';
    if (type === 'file' && item) {
      try {
        const fileContent = await this.db.get('fileContents', itemPath);
        if (fileContent) {
          fileType = fileContent.fileType || '';
        }
      } catch (e) {
        // File content might not exist
      }
    }

    // Get data.id and full data from bucketsStore for this file
    let fileDataId = null;
    let fileDataFromBuckets = null;
    try {
      if (window.NXUI && window.NXUI.ref) {
        const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
        
        // Handle different data formats
        let dataform = [];
        if (Array.isArray(bucketsData)) {
          dataform = bucketsData;
        } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
          dataform = bucketsData.data;
        } else if (bucketsData && bucketsData.id === "fileContents") {
          dataform = bucketsData.data || [];
        }
        
        // Find file data to get its id and full data - PASTIKAN hanya menggunakan fileId (path lengkap)
        const fileData = dataform.find(item => item.fileId === itemPath);
        
        if (fileData) {
          // Store full file data
          fileDataFromBuckets = fileData;
          
          if (fileData.id) {
            fileDataId = fileData.id;
          } else {
            // If no id, generate key from path (should not happen if createNewFile works correctly)
            fileDataId = this.generateFileKey(itemPath);
            
            // Also create entry in bucketsStore if it doesn't exist
            if (type === 'file') {
              const fileKey = this.generateFileKey(itemPath);
              const newFileData = {
                id: fileKey,
                fileId: itemPath,
                fileName: name,
                fileType: fileType || 'application/octet-stream',
                content: '',
                size: 0,
                uploadedAt: null,
                lastModified: new Date().toISOString()
              };
              dataform.push(newFileData);
              
              const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
              if (existingEntry && existingEntry.id === "fileContents") {
                existingEntry.data = dataform;
                await window.NXUI.ref.set("bucketsStore", existingEntry);
              } else {
                await window.NXUI.ref.set("bucketsStore", {
                  id: "fileContents",
                  data: dataform
                });
              }
            }
          }
        } else {
          // If not found, generate key from path and create entry if it's a file
          fileDataId = this.generateFileKey(itemPath);
          
          // Create entry in bucketsStore if it's a file (should have been created in createNewFile)
          if (type === 'file') {
            const fileKey = this.generateFileKey(itemPath);
            const newFileData = {
              id: fileKey,
              fileId: itemPath,
              fileName: name,
              fileType: fileType || 'application/octet-stream',
              content: '',
              size: 0,
              uploadedAt: null,
              lastModified: new Date().toISOString()
            };
            dataform.push(newFileData);
            
            const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
            if (existingEntry && existingEntry.id === "fileContents") {
              existingEntry.data = dataform;
              await window.NXUI.ref.set("bucketsStore", existingEntry);
            } else {
              await window.NXUI.ref.set("bucketsStore", {
                id: "fileContents",
                  data: dataform
                });
              }
            fileDataFromBuckets = newFileData;
          }
        }
      }
    } catch (e) {
      // Fallback: generate key from path
      fileDataId = this.generateFileKey(itemPath);
    }
    const modalID = `settings_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    // Get form definition for validation
    const formDefinition = formID();
    
    // Get existing fileSettings data if available
    let fileSettingsData = null;
    if (fileDataId && window.NXUI && window.NXUI.ref) {
      try {
        fileSettingsData = await window.NXUI.ref.get("fileSettings", fileDataId);
      } catch (e) {
      }
    }
    
    // Prepare form data - map fileSettings to form fields
    // Form expects: title, nama, deskripsi, categori, status
    const formData = fileSettingsData ? {
      title: fileSettingsData.title || name,
      nama: fileSettingsData.nama || name,
      deskripsi: fileSettingsData.deskripsi || '',
      categori: fileSettingsData.categori || '',
      status: fileSettingsData.status === true ? "Upload" : (fileSettingsData.status || '')
    } : {
      title: name,
      nama: name,
      deskripsi: '',
      categori: '',
      status: ''
    };
    
    // Store fileDataId in global untuk digunakan di saveSettings
    window._currentFileDataId = fileDataId;
    
    NXUI.formModal({
       elementById: modalID,
       styleClass: "w-500px",
       minimize: true,
       mode: fileSettingsData ? 'update' : undefined, // Set mode to update if settings exist
       value: formData, // Pass form data values
       label: `Settings: ${name}`,
       getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
       getValidationBy: ["name"], // ✅ Standard validation approach
       storage: formDefinition, // ✅ Form definition for validation (not actual data)
       setDataBy: formDefinition, // ✅ Use form definition (we handle save manually in saveSettings)
        onclick: {
          title: "Save Settings",
          cancel: "Cancel",
          send: "saveSettings", // ✅ Use wrapper function yang akan trigger refresh
        },
       floating: formDefinition, // ✅ Form definition
       content: false,
     });

    NXUI.nexaModal.open(modalID);
  }

  async showProperties() {
    if (!this.contextMenuTarget) return;
    
    const name = this.contextMenuTarget.dataset.name;
    const type = this.contextMenuTarget.dataset.type || 'file';
    
    // Get full item information from database
    const currentPathString = this.pathToString(this.currentPath);
    const itemPath = currentPathString ? `${currentPathString}/${name}` : name;
    const item = await this.getItemByPath(itemPath);
    
    // Get file content info if it's a file
    let fileContent = null;
    let fileSize = item?.size || '0 KB';
    let fileType = '';
    
    if (type === 'file' && item) {
      try {
        fileContent = await this.db.get('fileContents', itemPath);
        if (fileContent) {
          fileType = fileContent.fileType || '';
          if (fileContent.size) {
            fileSize = this.formatFileSize(fileContent.size);
          }
        }
      } catch (e) {
        // File content might not exist
      }
    }
    
    // Get folder children count if it's a folder
    let childrenCount = 0;
    if (type === 'folder' && item) {
      try {
        const children = await this.getFolderItems(itemPath);
        childrenCount = children.length;
      } catch (e) {
        // Error getting children
      }
    }
    
    // Prepare properties data
    const fullPath = this.currentPath.join(' > ') + (this.currentPath.length > 0 ? ' > ' + name : name);
    const createdDate = item?.modified || item?.created || new Date().toISOString().split('T')[0];
    const modifiedDate = item?.modified || new Date().toISOString().split('T')[0];
    
    const modalID = `properties_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    // Get icon based on type
    let iconSrc = '';
    let iconDisplay = '';
    if (type === 'folder') {
      const folderIcon = this.getIcon('folder');
      const isImageIcon = typeof folderIcon === 'string' && (folderIcon.startsWith('http') || folderIcon.startsWith('data:'));
      if (isImageIcon) {
        iconSrc = folderIcon;
        iconDisplay = `<img src="${folderIcon}" class="nx-media-img" alt="Folder" />`;
      } else {
        // For material icons, we'll use a wrapper or convert to image
        iconDisplay = `<span class="material-icons nx-media-img" style="display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ffa726;">${folderIcon || 'folder'}</span>`;
      }
    } else {
      const fileIcon = this.getFileIcon(name);
      const isImageIcon = typeof fileIcon === 'string' && (fileIcon.startsWith('http') || fileIcon.startsWith('data:'));
      if (isImageIcon) {
        iconSrc = fileIcon;
        iconDisplay = `<img src="${fileIcon}" class="nx-media-img" alt="${name}" />`;
      } else {
        // For material icons, we'll use a wrapper
        iconDisplay = `<span class="material-icons nx-media-img" style="display: flex; align-items: center; justify-content: center; font-size: 48px; color: #1a73e8;">${fileIcon || 'description'}</span>`;
      }
    }
    
    // Build content HTML - menggunakan nx-media dari Nexa
    const content = `
      <div class="nx-media">
        ${iconDisplay}
        <div class="nx-media-body">
          <h5>${name}</h5>
          <p><strong>Type:</strong> ${type === 'folder' ? 'Folder' : (fileType || 'File')}</p>
          <p><strong>Location:</strong> ${fullPath}</p>
          <p><strong>Size:</strong> ${fileSize}</p>
          ${type === 'folder' ? `<p><strong>Contains:</strong> ${childrenCount} item(s)</p>` : ''}
          <p><strong>Created:</strong> ${createdDate}</p>
          <p><strong>Modified:</strong> ${modifiedDate}</p>
          ${fileContent ? `
            ${fileContent.fileType ? `<p><strong>File Type:</strong> ${fileContent.fileType}</p>` : ''}
            ${fileContent.fileSize ? `<p><strong>File Size:</strong> ${this.formatFileSize(fileContent.fileSize)}</p>` : ''}
          ` : ''}
        </div>
      </div>
    `;
    
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-500px",
      minimize: true,
      label: `Properties: ${name}`,
      getFormBy: [],
      getValidationBy: [],
      setDataBy: {},
      onclick: false,
      content: content
    });
    
    NXUI.nexaModal.open(modalID);
  }

  async showShared() {
    if (!this.contextMenuTarget) return;
     const init = await SystemData(this);
     console.log('init:', init);
     console.log('init:', init.metadata.name);
     const modalID = `modalIDshowShared_${init.metadata.name.replace(/\s+/g, '_')}`;
     const dateUser=await user()


     // Fungsi untuk encode user.id menjadi token
     const encodeUserId = (userId) => {
       const data = JSON.stringify({ userId });
       return btoa(data + '_' + Date.now());
     };
     
     // Generate HTML untuk menampilkan data user
     let userListHTML = '';
     let filteredUsers = [];
     const userListContainerId = `userListContainer_${modalID}`;
     const searchInputId = `itemsearch_${modalID}`;
     const clearButtonId = `clearSearch_${modalID}`;
     
     // Inisialisasi sharedInit object
     if (!NXUI.sharedInit) {
       NXUI.sharedInit = {};
     }
     
     // Fungsi untuk render user list (satu fungsi untuk semua)
     const renderUserList = (users) => {
       if (!users || users.length === 0) {
         return '<div class="alert alert-info">Tidak ada data user yang ditemukan.</div>';
       }
       return users.map(user => {

         // Simpan init data untuk setiap user
         NXUI.sharedInit[user.id] = init;
         const avatarUrl = user.avatar ? `assets/drive/${user.avatar}` : 'assets/drive/avatar/pria.png';
         const check = user[init.key] ? `<span class="material-symbols-outlined" style="font-size: 16px; color: #4caf50; vertical-align: middle; margin-left: 4px;" title="Sudah pernah mengirim">check_circle</span>` : '';
         const userToken = encodeUserId(user.id);
         const statusBadge = '<span onclick="shareWithUser(\'' + userToken + '\')" style="cursor: pointer;"><span class="material-symbols-outlined" style="font-size: 18px; color: #6c757d;">share</span></span>';
         const statusLock = '<span style="cursor: pointer;"><span class="material-symbols-outlined" style="font-size: 18px; color: #6c757d;">lock</span></span>';
         const location = user.kecamatan && user.desa ? `${user.kecamatan}, ${user.desa}` : (user.kecamatan || user.desa || 'Tidak ada lokasi');
         
        return `
     <div class="nx-media mb-3 p-3 border rounded user-item">
      <img src="${NEXA.url}/${avatarUrl}" class="nx-media-img rounded-circle" alt="${user.nama}" style="width:30px; height: 30px; object-fit: cover;" onerror="this.src='assets/uploads/avatar/pria.png'">
      <div class="nx-media-body ms-3" style="flex: 1; min-width: 0;">
        <div class="mb-1" style="display: flex; align-items: center; gap: 8px; overflow: hidden; font-size: 14px; font-weight: 500;">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0;">${user.nama}
            <span id="sharedID_${userToken}">${check}</span>
           </span>

          <span id="lockID_${userToken}"> ${user[init.key] ? statusLock :statusBadge}</span>
        </div>
        <p class="mb-1 text-muted" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><strong>Jabatan:</strong> ${user.jabatan}</p>
        <p class="mb-0 text-muted" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><small><strong>Lokasi:</strong> ${location}</small></p>
        <div id="prores_${userToken}"></div>
      </div>
    </div>`;
       }).join('');
     };
     
     if (dateUser && Array.isArray(dateUser) && dateUser.length > 0) {
       // Filter user yang id-nya tidak sama dengan NEXA.userId
       filteredUsers = dateUser.filter(user => user.id !== NEXA.userId);
       userListHTML = renderUserList(filteredUsers);
     } else {
       userListHTML = '<div class="alert alert-info">Tidak ada data user yang tersedia.</div>';
     }
     
     NXUI.modalHTML({
      elementById:modalID,
      styleClass: "w-400px",
      minimize: true,
      label: `Shared Folder : ${init.metadata.name}`,
      getFormBy: [],
      getValidationBy: [],
      setDataBy:init,
      onclick: false,
      content:`

<div class="form-nexa-input-group">
  <div class="form-nexa-input-group-text">
    <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
  </div>
  <input type="text" 
         id="${searchInputId}" 
         name="searchFormVariablesInput"
         class="form-nexa-control" 
         placeholder="Search User... (Ctrl+F)" 
         >
   <div class="form-nexa-input-group-text">
     <button type="button" 
             id="${clearButtonId}"
             class="nx-btn-secondary" 
             style="background: none; border: none; padding: 4px; color: #6c757d;">
       <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
     </button>
   </div>
</div>
<div style="padding:10px; overflow: visible;">
<div class="nx-media nx-media-top" style="display: flex; align-items: center;">
  <img src="${Icons.folder_desktop}" class="nx-media-img" alt="Media" style="width: 64px; height: 64px; object-fit: contain; display: block; flex-shrink: 0;">
  <div class="nx-media-body" style="flex: 1; margin-left: 15px;">
    <h5>Shared: ${init.metadata.name}</h5>
    <p>Folder ini dibagikan kepada <strong>${filteredUsers.length || 0} pengguna tertentu</strong> yang terdaftar di bawah ini. Berisi <strong>${init.metadata.folder || 0} folder</strong> dan <strong>${init.metadata.file || 0} file</strong>.</p>
  </div>
</div>
</div>
 <div class="nx-scroll" style="height:300px;">
   <div style="padding:10px" id="${userListContainerId}">
      ${userListHTML}
    </div>
    </div>

        `
    });
    
    NXUI.nexaModal.open(modalID);
    NXUI.id("body_"+modalID)
    .setStyle("padding", "0px");

    // Setup search functionality setelah modal dibuka
    setTimeout(() => {
      const searchInput = document.getElementById(searchInputId);
      const clearButton = document.getElementById(clearButtonId);
      const userListContainer = document.getElementById(userListContainerId);
      
      if (searchInput && clearButton && userListContainer) {
        // Fungsi untuk filter user (menggunakan renderUserList yang sudah ada)
        const filterUsers = (searchTerm) => {
          if (!searchTerm || searchTerm.trim() === '') {
            userListContainer.innerHTML = renderUserList(filteredUsers);
            return;
          }
          
          const searchLower = searchTerm.toLowerCase().trim();
          const matchedUsers = filteredUsers.filter(user => {
            const nama = (user.nama || '').toLowerCase();
            const jabatan = (user.jabatan || '').toLowerCase();
            const kecamatan = (user.kecamatan || '').toLowerCase();
            const desa = (user.desa || '').toLowerCase();
            const status = (user.status || '').toLowerCase();
            
            return nama.includes(searchLower) || 
                   jabatan.includes(searchLower) || 
                   kecamatan.includes(searchLower) || 
                   desa.includes(searchLower) ||
                   status.includes(searchLower);
          });
          
          userListContainer.innerHTML = renderUserList(matchedUsers);
        };
        
        // Event listener untuk input search
        searchInput.addEventListener('input', (e) => {
          filterUsers(e.target.value);
        });
        
        // Event listener untuk tombol clear
        clearButton.addEventListener('click', () => {
          searchInput.value = '';
          filterUsers('');
          searchInput.focus();
        });
        
        // Keyboard shortcut Ctrl+F untuk focus ke search
        document.addEventListener('keydown', function handleKeyDown(e) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
          }
        });
        
        // Focus ke search input saat modal dibuka
        searchInput.focus();
      }
    }, 100);
    
  }

  async createNewFolder() {
    // Generate unique folder name
    let folderName = 'New Folder';
    let counter = 1;
    const currentPathString = this.pathToString(this.currentPath);
    
    // Check if folder name already exists, increment if needed
    while (true) {
      const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName;
      const existing = await this.getItemByPath(folderPath);
      if (!existing) break;
      folderName = `New Folder (${counter})`;
      counter++;
    }
    
    const folderPath = currentPathString ? `${currentPathString}/${folderName}` : folderName;
    
    // Create new folder in IndexedDB
    await this.saveFolderItem({
      id: folderPath,
      path: folderPath,
      parentPath: currentPathString,
      name: folderName,
      type: 'folder',
      modified: new Date().toISOString().split('T')[0]
    });
    
    // Get the created folder item
    const newFolder = await this.getItemByPath(folderPath);
    if (newFolder) {
      // Add item to view without re-rendering all files
      this.addItemToView(newFolder);
      
      // Wait a bit for DOM to update, then trigger rename
      setTimeout(() => {
        this.startRenameForItem(folderName);
      }, 100);
    } else {
      // Fallback: if item not found, do full refresh
      await this.refresh();
      setTimeout(() => {
        this.startRenameForItem(folderName);
      }, 100);
    }
  }

  async createNewFile(fileType = 'custom') {
    let defaultName = 'New File';
    let defaultExtension = '';
    
    // Set default name based on file type
    const fileTypeMap = {
      'txt': { name: 'New Text File', ext: '.txt' },
      'docx': { name: 'New Word Document', ext: '.docx' },
      'xlsx': { name: 'New Excel Spreadsheet', ext: '.xlsx' },
      'pptx': { name: 'New PowerPoint Presentation', ext: '.pptx' },
      'pdf': { name: 'New PDF Document', ext: '.pdf' },
      // Media types
      'jpg': { name: 'New Picture', ext: '.jpg' },
      'mp3': { name: 'New Music', ext: '.mp3' },
      'mp4': { name: 'New Video', ext: '.mp4' }
    };
    
    if (fileTypeMap[fileType]) {
      defaultName = fileTypeMap[fileType].name;
      defaultExtension = fileTypeMap[fileType].ext;
    }
    
    // Generate unique file name
    let fileName = defaultName + defaultExtension;
    let counter = 1;
    const currentPathString = this.pathToString(this.currentPath);
    
    // Check if file name already exists, increment if needed
    while (true) {
      const filePath = currentPathString ? `${currentPathString}/${fileName}` : fileName;
      const existing = await this.getItemByPath(filePath);
      if (!existing) break;
      fileName = `${defaultName} (${counter})${defaultExtension}`;
      counter++;
    }
    
    const filePath = currentPathString ? `${currentPathString}/${fileName}` : fileName;
    
    // Create new file in IndexedDB
    await this.saveFolderItem({
      id: filePath,
      path: filePath,
      parentPath: currentPathString,
      name: fileName,
      type: 'file',
      size: '0 KB',
      modified: new Date().toISOString().split('T')[0]
    });
    
    // Small delay to ensure folderItem is committed to IndexedDB
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify that the item was saved
    const verifiedItem = await this.getItemByPath(filePath);
    if (!verifiedItem) {
      // Try to save again
      await this.saveFolderItem({
        id: filePath,
        path: filePath,
        parentPath: currentPathString,
        name: fileName,
        type: 'file',
        size: '0 KB',
        modified: new Date().toISOString().split('T')[0]
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Save empty file content
    if (this.db) {
      try {
        // Check if fileContent already exists and delete it first
        const existingContent = await this.db.get('fileContents', filePath);
        if (existingContent) {
          await this.db.delete('fileContents', filePath);
        }
        
        // Handle unique constraint on fileNameType index
        // CRITICAL: Delete ALL entries with same fileName+fileType BEFORE saving
        // Index 'fileNameType' requires unique combination of fileName + fileType
        // This must be done BEFORE any save attempt to avoid constraint violation
        await this.deleteAllConflictingFileContents(fileName, fileType, filePath);
        
        // Small delay to ensure deletions are committed to index
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Save new file content (after all conflicts are cleared)
        await this.db.set('fileContents', {
          fileId: filePath,
          fileName: fileName,
          fileType: fileType,
          content: '',
          lastModified: new Date().toISOString()
        });
      } catch (error) {
        // If error persists, try aggressive cleanup and retry
        try {
          // Delete ALL conflicting entries (more aggressive, including current filePath)
          await this.deleteAllConflictingFileContents(fileName, fileType, filePath);
          
          // Longer delay to ensure all deletions are committed
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Now try to save again
          await this.db.set('fileContents', {
            fileId: filePath,
            fileName: fileName,
            fileType: fileType,
            content: '',
            lastModified: new Date().toISOString()
          });
        } catch (retryError) {
          // Last resort: try to save with a unique fileName to avoid constraint
          if (retryError.message && retryError.message.includes('fileNameType')) {
            // Extract extension from fileName
            const fileExtension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
            const baseName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
            const uniqueFileName = `${baseName}_${Date.now()}${fileExtension}`;
            try {
              await this.db.set('fileContents', {
                fileId: filePath,
                fileName: uniqueFileName,
                fileType: fileType,
                content: '',
                lastModified: new Date().toISOString()
              });
            } catch (finalError) {
            }
          }
        }
      }
    }
    
    // Create unique ID for this file and save to bucketsStore
    // This ensures every file has a unique ID from the start, even before upload
    try {
      if (window.NXUI && window.NXUI.ref) {
        const fileKey = this.generateFileKey(filePath);
        
        // Get existing bucketsStore data
        const bucketsData = await window.NXUI.ref.get("bucketsStore", "fileContents");
        let dataform = [];
        if (Array.isArray(bucketsData)) {
          dataform = bucketsData;
        } else if (bucketsData && bucketsData.data && Array.isArray(bucketsData.data)) {
          dataform = bucketsData.data;
        } else if (bucketsData && bucketsData.id === "fileContents") {
          dataform = bucketsData.data || [];
        }
        
        // Check if file already exists in bucketsStore
        const existingIndex = dataform.findIndex(item => 
          item.fileId === filePath || item.fileName === fileName
        );
        
        if (existingIndex === -1) {
          // File doesn't exist - create new entry with unique ID
          const fileData = {
            id: fileKey, // Unique hashed key from file path
            fileId: filePath, // Original file path (for lookup)
            fileName: fileName, // Original file name (for lookup)
            fileType: fileType || 'application/octet-stream',
            content: '', // Empty content initially
            size: 0,
            uploadedAt: null, // Not uploaded yet
            lastModified: new Date().toISOString()
          };
          
          // Add new entry
          dataform.push(fileData);
          
          // Update bucketsStore - update existing entry, don't create new
          const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
          if (existingEntry && existingEntry.id === "fileContents") {
            existingEntry.data = dataform;
            await window.NXUI.ref.set("bucketsStore", existingEntry);
          } else {
            await window.NXUI.ref.set("bucketsStore", {
              id: "fileContents",
              data: dataform
            });
          }
        }
      }
    } catch (e) {
    }
    
    // Additional delay to ensure all IndexedDB operations are committed
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Get the created file item
    const newFile = await this.getItemByPath(filePath);
    if (newFile) {
      // Add item to view without re-rendering all files
      this.addItemToView(newFile);
      
      // Wait a bit for DOM to update, then trigger rename
      setTimeout(() => {
        this.startRenameForItem(fileName);
      }, 100);
    } else {
      // Fallback: if item not found, do full refresh
      await this.refresh();
      setTimeout(() => {
        this.startRenameForItem(fileName);
      }, 100);
    }
  }
  
  // Start rename for a specific item (used after creating new folder/file)
  startRenameForItem(itemName) {
    // Find the item element
    const targetItem = this.container.querySelector(`[data-name="${itemName}"]`);
    if (!targetItem) {
      return;
    }
    
    // Set context menu target for rename function
    this.contextMenuTarget = targetItem;
    
    // Select the item
    this.selectedFiles.clear();
    this.selectedFiles.add(itemName);
    this.updateSelection();
    
    // Trigger rename
    this.renameFile();
  }

  // Get current folder items from IndexedDB (returns array, not object)
  async getCurrentFolder() {
    if (!this.currentPath || this.currentPath.length === 0) {
      return null;
    }

    try {
      const currentPathString = this.pathToString(this.currentPath);
      const items = await this.getFolderItems(currentPathString);
      
      // Convert array to object for compatibility with existing code
      const folderObj = {};
      for (const item of items) {
        folderObj[item.name] = item.data || {
          type: item.type,
          size: item.size,
          modified: item.modified,
          path: item.path
        };
      }
      
      return folderObj;
    } catch (error) {
      return null;
    }
  }

  selectAll() {
    this.files.forEach(file => this.selectedFiles.add(file.name));
    this.updateSelection();
  }

  hideContextMenu() {
    const contextMenu = document.querySelector('#nxepo-context-menu');
    if (contextMenu) {
      contextMenu.style.display = 'none';
      contextMenu.classList.remove('show');
    }
    this.contextMenuTarget = null;
  }

  // Settings modal methods
  openSettingsModal() {
    const modal = document.querySelector('#nexaSettingsModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('show');
    }
  }

  closeSettingsModal() {
    const modal = document.querySelector('#nexaSettingsModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
    }
  }

  // Settings actions
  exportData() {
    // Implementation
  }

  importData() {
    // Implementation
  }

  syncToServer() {
    // Implementation
  }

  syncFromServer() {
    // Implementation
  }

  clearLogs() {
    if (confirm('Clear all logs?')) {
      // Implementation
    }
  }

  // ===================================================================
  // RECYCLE BIN FUNCTIONS
  // ===================================================================

  // Load Recycle Bin items
  async loadRecycleBin() {
    try {
      this.isRecycleBinView = true;
      this.currentPath = ['Recycle Bin'];
      this.updateBreadcrumb();
      
      // Clear active tab when loading Recycle Bin
      // This ensures Recycle Bin content is always visible
      // User can click tab later to view file content
      this.activeTabId = null;
      this.currentFile = null;
      
      // Hide tab bar for Recycle Bin (Recycle Bin doesn't use tabs)
      const tabBar = document.querySelector('#nxepo-file-tab-bar');
      if (tabBar) {
        tabBar.style.display = 'none';
      }
      
      // Create Recycle Bin header with action buttons (separate from tab bar)
      // Check if Recycle Bin header already exists
      let recycleBinHeader = document.querySelector('#nxepo-recycle-bin-header');
      if (!recycleBinHeader) {
        // Create Recycle Bin header element
        recycleBinHeader = document.createElement('div');
        recycleBinHeader.id = 'nxepo-recycle-bin-header';
        recycleBinHeader.className = 'nxepo-recycle-bin-header';
        recycleBinHeader.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 20px;
        `;
        
        // Insert before container content
        if (this.container && this.container.parentNode) {
          this.container.parentNode.insertBefore(recycleBinHeader, this.container);
        }
      }
      
      // Show Recycle Bin header
      recycleBinHeader.style.display = 'flex';
      recycleBinHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="material-icons" style="color: #666; font-size: 24px;">delete</span>
          <span style="font-size: 16px; font-weight: 500; color: #333;">Recycle Bin</span>
        </div>
        <div class="nxepo-recycle-bin-actions" style="display: flex; gap: 8px;">
          <button class="nxepo-recycle-bin-btn nxepo-restore-all-btn" id="nxepo-restore-all-btn" title="Restore all items" style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #0078d4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">
            <span class="material-icons" style="font-size: 18px;">restore</span>
            <span>Restore All</span>
          </button>
          <button class="nxepo-recycle-bin-btn nxepo-empty-bin-btn" id="nxepo-empty-bin-btn" title="Empty Recycle Bin" style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #d32f2f;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">
            <span class="material-icons" style="font-size: 18px;">delete_sweep</span>
            <span>Empty Bin</span>
          </button>
        </div>
      `;
      
      // Add event listeners for Recycle Bin buttons
      const restoreAllBtn = document.querySelector('#nxepo-restore-all-btn');
      const emptyBinBtn = document.querySelector('#nxepo-empty-bin-btn');
      
      // Remove old event listeners by cloning and replacing
      if (restoreAllBtn) {
        const newRestoreBtn = restoreAllBtn.cloneNode(true);
        restoreAllBtn.parentNode.replaceChild(newRestoreBtn, restoreAllBtn);
        newRestoreBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await this.restoreAllFromRecycleBin();
        });
      }
      
      if (emptyBinBtn) {
        const newEmptyBtn = emptyBinBtn.cloneNode(true);
        emptyBinBtn.parentNode.replaceChild(newEmptyBtn, emptyBinBtn);
        newEmptyBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await this.emptyRecycleBin();
        });
      }
      
      // Get all items from recycle bin
      if (!this.db) {
        await this.initDatabase();
      }
      
      const allItems = await this.db.getAll('recycleBin');
      const recycleBinItems = allItems.data || [];
      
      // Convert to files format
      this.files = recycleBinItems.map(item => ({
        name: item.originalName || 'Unknown',
        type: item.itemType || 'file',
        size: item.originalData?.size || '-',
        modified: item.deletedDate || new Date().toISOString().split('T')[0],
        path: item.originalPath,
        recycleBinId: item.id,
        originalData: item.originalData,
        deletedDate: item.deletedDate
      })).sort((a, b) => {
        // Folders first, then by deletion date (newest first)
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return new Date(b.deletedDate) - new Date(a.deletedDate);
      });

      this.renderFiles(this.files);
    } catch (error) {
      this.files = [];
      this.renderFiles(this.files);
    }
  }

  // Restore all items from Recycle Bin
  async restoreAllFromRecycleBin() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      const allItems = await this.db.getAll('recycleBin');
      const recycleBinItems = allItems.data || [];
      
      if (recycleBinItems.length === 0) {
        return; // Nothing to restore
      }
      
      // Restore all items
      for (const recycleItem of recycleBinItems) {
        const originalPath = recycleItem.originalPath;
        const originalData = recycleItem.originalData;
        
        // Check if original location still exists
        const pathParts = this.pathToArray(originalPath);
        const parentPath = pathParts.slice(0, -1).join('/');
        const itemName = pathParts[pathParts.length - 1];
        
        // Check if parent exists
        const parentExists = parentPath ? await this.getItemByPath(parentPath) : true;
        if (!parentExists) {
          // If parent doesn't exist, restore to My Files
          const newPath = `My Files/${itemName}`;
          await this.saveFolderItem({
            id: newPath,
            path: newPath,
            parentPath: 'My Files',
            name: itemName,
            type: originalData.type,
            size: originalData.size,
            modified: originalData.modified,
            ...originalData
          });
        } else {
          // Restore to original location
          await this.saveFolderItem({
            id: originalPath,
            path: originalPath,
            parentPath: parentPath,
            name: itemName,
            type: originalData.type,
            size: originalData.size,
            modified: originalData.modified,
            ...originalData
          });
        }
        
        // Restore children if folder
        if (originalData.type === 'folder') {
          await this.restoreFolderRecursive(originalPath, originalData);
        }
        
        // Remove from recycle bin
        await this.db.delete('recycleBin', recycleItem.id);
        
        // Log activity
        await this.logActivity('restore_all', originalPath, originalData.type);
      }
      
      // Clear selection
      this.selectedFiles.clear();
      this.updateSelection();
      
      // Refresh view
      await this.loadRecycleBin();
    } catch (error) {
    }
  }

  // Restore item from Recycle Bin
  async restoreFromRecycleBin() {
    if (this.selectedFiles.size === 0) return;
    
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      const filesToRestore = Array.from(this.selectedFiles);
      
      for (const fileName of filesToRestore) {
        // Find the recycle bin item
        const fileItem = this.files.find(f => f.name === fileName);
        if (!fileItem || !fileItem.recycleBinId) continue;
        
        const recycleItem = await this.db.get('recycleBin', fileItem.recycleBinId);
        if (!recycleItem) continue;
        
        // Restore to original location
        const originalPath = recycleItem.originalPath;
        const originalData = recycleItem.originalData;
        
        // Check if original location still exists
        const pathParts = this.pathToArray(originalPath);
        const parentPath = pathParts.slice(0, -1).join('/');
        const itemName = pathParts[pathParts.length - 1];
        
        // Check if parent exists
        const parentExists = parentPath ? await this.getItemByPath(parentPath) : true;
        if (!parentExists) {
          // If parent doesn't exist, restore to My Files
          const newPath = `My Files/${itemName}`;
          await this.saveFolderItem({
            id: newPath,
            path: newPath,
            parentPath: 'My Files',
            name: itemName,
            type: originalData.type,
            size: originalData.size,
            modified: originalData.modified,
            ...originalData
          });
        } else {
          // Restore to original location
          await this.saveFolderItem({
            id: originalPath,
            path: originalPath,
            parentPath: parentPath,
            name: itemName,
            type: originalData.type,
            size: originalData.size,
            modified: originalData.modified,
            ...originalData
          });
        }
        
        // Restore children if folder
        if (originalData.type === 'folder') {
          await this.restoreFolderRecursive(originalPath, originalData);
        }
        
        // Restore file content if exists
        try {
          const fileContent = await this.db.get('fileContents', originalPath);
          if (fileContent) {
            // File content already restored with folder item
          }
        } catch (e) {
          // File content might not exist
        }
        
        // Remove from recycle bin
        await this.db.delete('recycleBin', fileItem.recycleBinId);
        
        // Log activity
        await this.logActivity('restore', originalPath, originalData.type);
      }
      
      // Clear selection
      this.selectedFiles.clear();
      this.updateSelection();
      
      // Refresh view
      await this.loadRecycleBin();
    } catch (error) {
    }
  }

  // Recursively restore folder and children
  async restoreFolderRecursive(folderPath, folderData) {
    try {
      if (!this.db) return;
      
      const allItems = await this.db.getAll('recycleBin');
      const children = allItems.data.filter(item => {
        const itemPath = this.pathToArray(item.originalPath);
        const parentPath = itemPath.slice(0, -1).join('/');
        return parentPath === folderPath;
      });
      
      for (const child of children) {
        const originalPath = child.originalPath;
        const originalData = child.originalData;
        const pathParts = this.pathToArray(originalPath);
        const itemName = pathParts[pathParts.length - 1];
        const parentPath = pathParts.slice(0, -1).join('/');
        
        // Restore child
        await this.saveFolderItem({
          id: originalPath,
          path: originalPath,
          parentPath: parentPath,
          name: itemName,
          type: originalData.type,
          size: originalData.size,
          modified: originalData.modified,
          ...originalData
        });
        
        // Recursively restore if folder
        if (originalData.type === 'folder') {
          await this.restoreFolderRecursive(originalPath, originalData);
        }
        
        // Remove from recycle bin
        await this.db.delete('recycleBin', child.id);
      }
    } catch (error) {
    }
  }

  // Delete permanently from Recycle Bin
  async deletePermanently() {
    if (this.selectedFiles.size === 0) return;
    
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      const filesToDelete = Array.from(this.selectedFiles);
      
      for (const fileName of filesToDelete) {
        const fileItem = this.files.find(f => f.name === fileName);
        if (!fileItem || !fileItem.recycleBinId) continue;
        
        // Delete from recycle bin (permanent deletion)
        await this.db.delete('recycleBin', fileItem.recycleBinId);
        
        // Also delete file content if exists
        try {
          const originalPath = fileItem.path;
          await this.db.delete('fileContents', originalPath);
        } catch (e) {
          // File content might not exist
        }
        
        // Log activity
        await this.logActivity('delete_permanent', fileItem.path, fileItem.type);
      }
      
      // Clear selection
      this.selectedFiles.clear();
      this.updateSelection();
      
      // Refresh view
      await this.loadRecycleBin();
    } catch (error) {
    }
  }

  // Empty Recycle Bin
  async emptyRecycleBin() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      const allItems = await this.db.getAll('recycleBin');
      const items = allItems.data || [];
      
      // Delete all items from recycle bin
      for (const item of items) {
        await this.db.delete('recycleBin', item.id);
        
        // Also delete file content
        try {
          await this.db.delete('fileContents', item.originalPath);
        } catch (e) {
          // File content might not exist
        }
      }
      
      // Log activity
      await this.logActivity('empty_recycle_bin', 'Recycle Bin', 'folder');
      
      // Refresh view
      await this.loadRecycleBin();
    } catch (error) {
    }
  }

  // ===================================================================
  // STATE MANAGEMENT (PUSH STATE)
  // ===================================================================

  // Save current state to IndexedDB
  async saveState(stateData) {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const state = {
        id: 'pushState',
        path: stateData.path || this.currentPath,
        type: stateData.type || 'folder',
        fileName: stateData.fileName || null,
        fileType: stateData.fileType || null,
        isRecycleBin: stateData.isRecycleBin || false,
        timestamp: new Date().toISOString()
      };

      await this.db.set('bucketsStore', state);
    } catch (error) {
    }
  }

  // Save tabs state to IndexedDB
  async saveTabsState() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      if (!this.db) {
        return;
      }
      
      // Prepare tabs data for saving (remove content to save space, it will be reloaded)
      const tabsData = this.tabs.map(tab => ({
        id: tab.id,
        name: tab.name,
        file: tab.file,
        path: tab.path,
        isFolder: tab.isFolder || false,
        folderPath: tab.folderPath || null
        // Don't save content, it will be reloaded when tab is opened
      }));
      
      const tabsState = {
        id: 'explorerTabs',
        tabs: tabsData,
        activeTabId: this.activeTabId,
        folderViewState: this.folderViewState
      };
      
      await this.db.set('bucketsStore', tabsState);
    } catch (error) {
    }
  }
  
  // Load tabs state from IndexedDB
  async loadTabsState() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }
      
      if (!this.db) {
        return;
      }
      
      const savedTabs = await this.db.get('bucketsStore', 'explorerTabs');
      
      if (!savedTabs || !savedTabs.tabs || !Array.isArray(savedTabs.tabs) || savedTabs.tabs.length === 0) {
        return;
      }
      
      // Restore tabs
      this.tabs = savedTabs.tabs.map(tab => ({
        ...tab,
        isFolder: tab.isFolder || false,
        folderPath: tab.folderPath || null,
        content: null // Content will be loaded when tab is activated
      }));
      
      // Restore active tab ID
      this.activeTabId = savedTabs.activeTabId || null;
      
      // Restore folder view state
      if (savedTabs.folderViewState) {
        this.folderViewState = savedTabs.folderViewState;
      }
      
      // Update tab bar UI
      this.updateTabBar();
      
      // If there's an active tab, restore it
      if (this.activeTabId) {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
          // Restore path based on tab type
          if (activeTab.isFolder && activeTab.folderPath) {
            // Folder tab - use folder path directly
            this.currentPath = [...activeTab.folderPath];
            this.updateBreadcrumb();
          } else if (activeTab.path && activeTab.path.length > 0) {
            // File tab - remove file name, keep folder path
            const folderPath = activeTab.path.slice(0, -1);
            if (folderPath.length > 0) {
              this.currentPath = folderPath;
              this.updateBreadcrumb();
            }
          }
          
          // Switch to active tab (this will load content)
          setTimeout(() => {
            this.switchTab(this.activeTabId);
          }, 200);
        } else {
          // Active tab not found, restore folder view
          if (this.folderViewState.path && this.folderViewState.path.length > 0) {
            this.currentPath = this.folderViewState.path;
            this.updateBreadcrumb();
            await this.loadFiles();
          }
          this.activeTabId = null;
          this.restoreFolderView();
        }
      } else {
        // No active tab, restore folder view
        if (this.folderViewState.path && this.folderViewState.path.length > 0) {
          this.currentPath = this.folderViewState.path;
          this.updateBreadcrumb();
          await this.loadFiles();
        }
        this.restoreFolderView();
      }
    } catch (error) {
    }
  }

  // Load saved state from IndexedDB
  async loadState() {
    try {
      if (!this.db) {
        await this.initDatabase();
      }

      const savedState = await this.db.get('bucketsStore', 'pushState');
      
      // Load tabs state first (before restoring other state)
      await this.loadTabsState();
      
      // If tabs were restored, skip restoring other state (tabs take precedence)
      if (this.tabs.length > 0) {
        this.hasRestoredState = true;
        return savedState;
      }
      
      if (!savedState) {
        this.hasRestoredState = false;
        return;
      }

      this.hasRestoredState = true;

      // Restore path
      if (savedState.path && Array.isArray(savedState.path)) {
        this.currentPath = savedState.path;
      } else if (savedState.path && typeof savedState.path === 'string') {
        this.currentPath = this.pathToArray(savedState.path);
      } else {
        this.currentPath = ['Home'];
      }

      // Update breadcrumb
      this.updateBreadcrumb();

      // Restore view based on type
      if (savedState.isRecycleBin) {
        // Restore Recycle Bin view
        await this.loadRecycleBin();
      } else if (savedState.type === 'home') {
        // Restore Home view
        await this.loadHome();
      } else if (savedState.type === 'localDisk') {
        // Restore Local Disk view
        const path = savedState.path || this.currentPath;
        if (path.length > 1) {
          // Subfolder
          const subfolderName = path[1];
          await this.loadLocalDiskSubfolder(subfolderName);
        } else {
          // Main Local Disk
          this.loadLocalDisk();
        }
      } else if (savedState.type === 'pictures') {
        // Restore Pictures view
        this.loadPictures();
      } else if (savedState.type === 'music') {
        // Restore Music view
        this.loadMusic();
      } else if (savedState.type === 'videos') {
        // Restore Videos view
        this.loadVideos();
      } else if (savedState.type === 'programFiles') {
        // Restore Program Files view
        await this.loadProgramFiles();
      } else if (savedState.type === 'file' && savedState.fileName) {
        // Restore file view
        // First navigate to the folder
        await this.loadFiles();
        
        // Then open the file
        setTimeout(() => {
          this.openFile(savedState.fileName);
        }, 300);
      } else {
        // Restore folder view
        await this.loadFiles();
      }

      return savedState;
    } catch (error) {
      this.hasRestoredState = false;
      return null;
    }
  }
}

// Global function untuk save file dari modal uploader
window.saveFile = async function (modalID, dataentri, id) {
  if (!window._currentUploadFile) {
    return;
  }
  
  const { fileName, filePathString, explorer } = window._currentUploadFile;
  
  // Handle different data formats
  let file = null;
  if (dataentri && dataentri.file) {
    // Check if it's a File object directly
    if (dataentri.file instanceof File) {
      file = dataentri.file;
    }
    // Check if it's nested: { file: { file: File } }
    else if (dataentri.file.file && dataentri.file.file instanceof File) {
      file = dataentri.file.file;
    }
    // Check if it's a FileList
    else if (dataentri.file.files && dataentri.file.files.length > 0) {
      file = dataentri.file.files[0];
    }
    // Check if it's an input element
    else if (dataentri.file instanceof HTMLInputElement && dataentri.file.files && dataentri.file.files.length > 0) {
      file = dataentri.file.files[0];
    }
  }
  
  if (!file) {
    return;
  }
  
  // Convert file to base64
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const base64Content = e.target.result;
      
      // Get current dataform from bucketsStore
      let dataform = await window.NXUI.ref.get("bucketsStore", "fileContents");
      // Handle different data formats
      if (!dataform) {
        dataform = [];
      } else if (!Array.isArray(dataform)) {
        // If it's an object with data property
        if (dataform.data && Array.isArray(dataform.data)) {
          dataform = dataform.data;
        } else {
          dataform = [];
        }
      }
      
      // Check if file already exists (by fileId or fileName)
      const existingIndex = dataform.findIndex(item => 
        item.fileId === filePathString || item.fileName === fileName
      );
      
      let fileData;
      if (existingIndex !== -1) {
        // File already exists - use existing ID and update
        const existingFile = dataform[existingIndex];
        fileData = {
          ...existingFile, // Keep existing ID and all properties
          fileId: filePathString,
          fileName: fileName,
          fileType: file.type || existingFile.fileType || 'application/octet-stream',
          content: base64Content,
          size: file.size,
          lastModified: new Date().toISOString()
        };
        // Update existing entry
        dataform[existingIndex] = fileData;
      } else {
        // File doesn't exist - create new with hashed key
        const fileKey = explorer ? explorer.generateFileKey(filePathString) : (window._generateFileKey ? window._generateFileKey(filePathString) : NexaExplorer.generateFileKeyStatic(filePathString));
        fileData = {
          id: fileKey, // Hashed key from file path
          fileId: filePathString, // Original file path (for lookup)
          fileName: fileName, // Original file name (for lookup)
          fileType: file.type || 'application/octet-stream',
          content: base64Content,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        // Add new entry
        dataform.push(fileData);
      }
      
      // Save to bucketsStore - update existing entry, don't create new
      // Get existing entry first to ensure we update, not create new
      const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
      if (existingEntry && existingEntry.id === "fileContents") {
        // Update existing entry
        existingEntry.data = dataform;
        await window.NXUI.ref.set("bucketsStore", existingEntry);
      } else {
        // Create new entry only if doesn't exist
        await window.NXUI.ref.set("bucketsStore", {
          id: "fileContents",
          data: dataform
        });
      }
      
      // Close modal
      if (window.NXUI && window.NXUI.nexaModal) {
        window.NXUI.nexaModal.close(modalID);
      }
      
      // Reload file content after a short delay to ensure data is saved
      if (explorer) {
        const file = explorer.files.find(f => f.name === fileName);
        if (file) {
          // Small delay to ensure IndexedDB is updated, then open file properly
          setTimeout(async () => {
            // Open file again to trigger proper display
            await explorer.openFile(fileName, false);
          }, 200);
        }
      }
      
      // Clear upload file info
      window._currentUploadFile = null;
      
    } catch (error) {
    }
  };
  
  reader.onerror = function(error) {
  };
  
  reader.readAsDataURL(file);
};

// Global function untuk save YouTube link dari modal
window.saveSettings = async function (modalID, data, id, td) {
  // Use fileDataId from global variable or from td parameter
  const fileDataId = window._currentFileDataId || (td && td.id) || id;
  
  if (!fileDataId) {
    NXUI.nexaModal.close(modalID);
    return;
  }
  
  try {
    await NXUI.ref.set("fileSettings", { 
      id: fileDataId, 
      title: data.title || '', 
      nama: data.nama || '',
      categori: data.categori || '', 
      deskripsi: data.deskripsi || '', 
      status:true,
    });
  } catch (e) {
  }
  
  // Clear the global variable
  window._currentFileDataId = null;
  NXUI.nexaModal.close(modalID);
}


window.saveYouTubeLink = async function (modalID, dataentri, id) {
  if (!window._currentYouTubeFile) {
    return;
  }
  
  const { fileName, filePathString, isVideo, explorer } = window._currentYouTubeFile;
  
  // Get YouTube link from form
  let youtubeLink = '';
  
  // Try to get from dataentri object
  if (dataentri) {
    if (dataentri.youtubeLink) {
      // Direct property
      if (typeof dataentri.youtubeLink === 'string') {
        youtubeLink = dataentri.youtubeLink.trim();
      } else if (dataentri.youtubeLink.value) {
        youtubeLink = dataentri.youtubeLink.value.trim();
      }
    } else if (typeof dataentri === 'string') {
      youtubeLink = dataentri.trim();
    } else if (dataentri.value) {
      youtubeLink = dataentri.value.trim();
    }
  }
  
  // If still empty, try to get from DOM element
  if (!youtubeLink && window._currentYouTubeFile) {
    const inputElement = document.querySelector(`#youtubeLink_${window._currentYouTubeFile.modalID}`);
    if (inputElement && inputElement.value) {
      youtubeLink = inputElement.value.trim();
    }
  }
  
  if (!youtubeLink) {
    return;
  }
  
  // Extract YouTube video ID from various URL formats
  let videoId = '';
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = youtubeLink.match(youtubeRegex);
  if (match && match[1]) {
    videoId = match[1];
  } else {
    // If no match, assume it's already a video ID
    videoId = youtubeLink;
  }
  
  if (!videoId) {
    return;
  }
  
  try {
    // Get YouTube metadata (title and thumbnail)
    let youtubeTitle = '';
    let youtubeThumbnailBase64 = '';
    
    try {
      // Use YouTube oEmbed API to get metadata
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeLink)}&format=json`;
      const response = await fetch(oEmbedUrl);
      if (response.ok) {
        const metadata = await response.json();
        youtubeTitle = metadata.title || '';
        
        // Get thumbnail URL (highest quality)
        const thumbnailUrl = metadata.thumbnail_url || metadata.thumbnail || '';
        if (thumbnailUrl) {
          // Convert thumbnail to base64
          try {
            const thumbnailResponse = await fetch(thumbnailUrl);
            if (thumbnailResponse.ok) {
              const blob = await thumbnailResponse.blob();
              const reader = new FileReader();
              youtubeThumbnailBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
    
    // Get current dataform from bucketsStore
    let dataform = await window.NXUI.ref.get("bucketsStore", "fileContents");
    // Handle different data formats
    if (!dataform) {
      dataform = [];
    } else if (!Array.isArray(dataform)) {
      if (dataform.data && Array.isArray(dataform.data)) {
        dataform = dataform.data;
      } else {
        dataform = [];
      }
    }
    
    // Check if file already exists (by fileId or fileName)
    const existingIndex = dataform.findIndex(item => 
      item.fileId === filePathString || item.fileName === fileName
    );
    
    let fileData;
    if (existingIndex !== -1) {
      // File already exists - use existing ID and update
      const existingFile = dataform[existingIndex];
      fileData = {
        ...existingFile, // Keep existing ID and all properties
        fileId: filePathString,
        fileName: fileName,
        fileType: isVideo ? 'video/youtube' : 'audio/youtube',
        content: videoId, // Store YouTube video ID
        youtubeLink: youtubeLink, // Store original link
        youtubeTitle: youtubeTitle || existingFile.youtubeTitle || '', // Store YouTube title
        youtubeThumbnail: youtubeThumbnailBase64 || existingFile.youtubeThumbnail || '', // Store thumbnail as base64
        lastModified: new Date().toISOString()
      };
      // Update existing entry
      dataform[existingIndex] = fileData;
      } else {
        // File doesn't exist - create new with hashed key
        const fileKey = explorer ? explorer.generateFileKey(filePathString) : (window._generateFileKey ? window._generateFileKey(filePathString) : NexaExplorer.generateFileKeyStatic(filePathString));
        fileData = {
          id: fileKey, // Hashed key from file path
          fileId: filePathString,
          fileName: fileName,
          fileType: isVideo ? 'video/youtube' : 'audio/youtube',
          content: videoId, // Store YouTube video ID
          youtubeLink: youtubeLink, // Store original link
          youtubeTitle: youtubeTitle, // Store YouTube title
          youtubeThumbnail: youtubeThumbnailBase64, // Store thumbnail as base64
          uploadedAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        // Add new entry
        dataform.push(fileData);
      }
    
    // Save to bucketsStore - update existing entry, don't create new
    const existingEntry = await window.NXUI.ref.get("bucketsStore", "fileContents");
    if (existingEntry && existingEntry.id === "fileContents") {
      // Update existing entry
      existingEntry.data = dataform;
      await window.NXUI.ref.set("bucketsStore", existingEntry);
    } else {
      // Create new entry only if doesn't exist
      await window.NXUI.ref.set("bucketsStore", {
        id: "fileContents",
        data: dataform
      });
    }
    
    // Close modal
    if (window.NXUI && window.NXUI.nexaModal) {
      window.NXUI.nexaModal.close(modalID);
    }
    
    // Reload file content after a short delay
    if (explorer) {
      const file = explorer.files.find(f => f.name === fileName);
      if (file) {
        setTimeout(async () => {
          await explorer.openFile(fileName, false);
        }, 200);
      }
    }
    
    // Clear YouTube file info
    window._currentYouTubeFile = null;
    
  } catch (error) {
  }
};

  
window.installApplications = async function (app,type) {
  return await instalasi(app,type)
 
}

window.shareWithUser = async function (token) {
  // Decode token untuk mendapatkan user.id
  try {
    const decoded = atob(token);
    const dataPart = decoded.split('_')[0]; // Ambil data sebelum underscore
    const { userId } = JSON.parse(dataPart);
    const statusLock = '<span style="cursor: pointer;"><span class="material-symbols-outlined" style="font-size: 18px; color: #6c757d;">lock</span></span>';
     NXUI.id("lockID_"+token).innerHTML=statusLock;
    // Ambil data user untuk mendapatkan informasi lengkap
    const dateUser = await user();
    console.log('dateUser:', dateUser);
    console.log('dari:', NEXA.userId);
    // Ambil init data dari sharedInit menggunakan userId sebagai key
    const sharedInit = NXUI.sharedInit || {};
    const initData = sharedInit[userId];
    console.log('Init data:', initData);
    
    // Encode initData ke base64 menggunakan NexaEncrypt agar server dapat menerima
    const encryptor = new NXUI.NexaEncrypt();
    const initDataEncoded = encryptor.encodeJson(initData);
    const checkFinis = `<span class="material-symbols-outlined" style="font-size: 16px; color: #4caf50; vertical-align: middle; margin-left: 4px;" title="Sudah pernah mengirim">check_circle</span>`;
    // Setup progress bar (mengikuti metode ProgramFilesView.js)
    const progressContainer = NXUI.id("prores_"+token) || document.getElementById("prores_"+token);
    let progressBar = null;
    
    if (progressContainer) {
      progressContainer.innerHTML = `
        <div style="width: 100%; height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
          <div id="progress-bar-${token}" style="width: 0%; height: 100%; background: #ffa726; transition: width 0.3s ease; border-radius: 2px;"></div>
        </div>
      `;
      progressBar = document.getElementById(`progress-bar-${token}`);
    }
    
    // Nonaktifkan tombol share
    const shareBtn = NXUI.id("share_btn_"+token) || document.getElementById("share_btn_"+token);
    if (shareBtn && shareBtn.style) {
      shareBtn.style.pointerEvents = 'none';
      shareBtn.style.opacity = '0.5';
      shareBtn.style.cursor = 'not-allowed';
    }
    
    // Update progress dari 0% ke 100% (mengikuti metode ProgramFilesView.js)
    const updateProgress = (percent) => {
      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }
    };
    
    // Progress 0-30%: Persiapan
    updateProgress(0);
    await new Promise(resolve => setTimeout(resolve, 100));
    updateProgress(10);
    await new Promise(resolve => setTimeout(resolve, 100));
    updateProgress(20);
    await new Promise(resolve => setTimeout(resolve, 100));
    updateProgress(30);
    
    // Progress 30-70%: Mengirim data ke server
    let shareWithSever = null;
    
    // Update user settings dengan data yang di-share
    try {
      const userSettings = await window.NXUI.ref.get("bucketsStore", "userControllers");
      if (userSettings && userSettings.data && Array.isArray(userSettings.data)) {
        const userToEdit = userSettings.data.find(u => u.id === userId);
        // Ubah datanya
        if (userToEdit) {
          userToEdit[initData.key] = true;
        }
        await window.NXUI.ref.set("bucketsStore", {
          id: "userControllers",
          data: userSettings.data
        });

        shareWithSever = await NXUI.Storage().models("Office").shareWithuser({
          users:NEXA.userId,
          tousers:userId,
          key:initData.key,
          userData:userToEdit,
          ...initData
        });
      }
    } catch (error) {
      console.warn('Error updating user settings:', error);
    }




    updateProgress(50);
    await new Promise(resolve => setTimeout(resolve, 100));
    updateProgress(60);
    await new Promise(resolve => setTimeout(resolve, 100));
    updateProgress(70);
    
    // Progress 70-90%: Verifikasi
    console.log('success:', shareWithSever?.success);
    updateProgress(80);
    await new Promise(resolve => setTimeout(resolve, 100));
    updateProgress(90);
    
    // Progress 90-100%: Finalisasi
    await new Promise(resolve => setTimeout(resolve, 100));
    updateProgress(100);
    
    // Tampilkan status "Completed" - ubah warna progress bar menjadi hijau (seperti ProgramFilesView.js)
    if (shareWithSever && shareWithSever.success) {
      if (progressBar) {
        progressBar.style.background = '#4caf50';
         NXUI.id("sharedID_"+token).innerHTML=checkFinis;
      }
      
      // Tunggu sebentar sebelum menyembunyikan progress bar (seperti ProgramFilesView.js)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sembunyikan progress bar setelah selesai (menggunakan metode yang sama seperti ProgramFilesView.js)
      const container = NXUI.id("prores_"+token) || document.getElementById("prores_"+token);
      if (container) {
        // Metode 1: Set display none
        if (container.style) {
          container.style.display = 'none';
        }
        // Metode 2: Hapus innerHTML sebagai fallback
        if (container.innerHTML) {
          container.innerHTML = '';
        }
      }
      
      // Aktifkan kembali tombol
      if (shareBtn && shareBtn.style) {
        shareBtn.style.pointerEvents = 'auto';
        shareBtn.style.opacity = '1';
        shareBtn.style.cursor = 'pointer';
      }
    } else {
      // Error dari server
      if (progressBar) {
        progressBar.style.background = '#f44336';
      }
      
      // Aktifkan kembali tombol
      if (shareBtn && shareBtn.style) {
        shareBtn.style.pointerEvents = 'auto';
        shareBtn.style.opacity = '1';
        shareBtn.style.cursor = 'pointer';
      }
    }
    // 'active','inactive','draft','System'


  } catch (error) {
    console.error('Error decoding token:', error);
    
    // Error handling (seperti ProgramFilesView.js)
    const progressBar = document.getElementById(`progress-bar-${token}`);
    const shareBtn = NXUI.id("share_btn_"+token) || document.getElementById("share_btn_"+token);
    
    if (progressBar) {
      progressBar.style.background = '#f44336';
    }
    
    // Aktifkan kembali tombol
    if (shareBtn && shareBtn.style) {
      shareBtn.style.pointerEvents = 'auto';
      shareBtn.style.opacity = '1';
      shareBtn.style.cursor = 'pointer';
    }
    
    return null;
  }
}


