import { Storage, NexaDBLite } from "NexaUI";
import { DataHelper } from "./DataHelper";
import { PaginationHelper } from "./pagination";
import { StorageData, withTerritory } from "./NexaDom";

// Helper functions - langsung menggunakan NexaDBLite tanpa fallback
const safeSet = async (storeName, data) => {
  return await NexaDBLite.set(storeName, data);
};

const safeGet = async (storeName, key) => {
  return await NexaDBLite.get(storeName, key);
};

const safeGetAll = async (storeName) => {
  return await NexaDBLite.getAll(storeName);
};

const safeDelete = async (storeName, key) => {
  return await NexaDBLite.delete(storeName, key);
};

/**
 * DataManager Class
 * 
 * Class untuk menangani semua logika bisnis data management
 * User hanya perlu fokus pada pengembangan UI
 * 
 * @example
 * const dataManager = new DataManager({
 *   pkg: { token: 'xxx' },
 *   userData: { user_id: 1 },
 *   limit: 5
 * });
 * 
 * // Fetch data
 * await dataManager.fetchData(1, 'search term');
 * 
 * // Get data
 * const data = dataManager.getData();
 * const fields = dataManager.getFields();
 * 
 * // Actions
 * await dataManager.deleteItem(itemId);
 * dataManager.setSearchKeyword('keyword');
 * dataManager.setPage(2);
 */
export class DataManager {
  constructor(config = {}) {
    this.pkg = config.pkg || null;
    this.userData = config.userData || null;
    this.limit = config.limit || 5;
    
    // State
    this.rawData = null;
    this.fetching = false;
    this.getFailed = [];
    this.column = [];
    this.processedForm = null;
    this.dataInfo = {
      count: 0,
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      success: false
    };
    this.currentPage = 1;
    this.searchKeyword = '';
    this.searchFields = [];
    this.cellUpdate = null;
    this.cellDelete = null;
    this.cellApproval = null;
    
    // Cache configuration
    this.cacheEnabled = config.cacheEnabled !== false; // Default: enabled
    this.cacheStoreName = `dataCache_${this.pkg?.token || 'default'}`;
    this.cacheExpiry = config.cacheExpiry || 5 * 60 * 1000; // 5 minutes default
    this.isOffline = false;
    
    // Callbacks
    this.onDataChange = config.onDataChange || null;
    this.onFetchingChange = config.onFetchingChange || null;
    this.onError = config.onError || null;
    this.onOfflineStatusChange = config.onOfflineStatusChange || null;
  }

  /**
   * Set callback untuk data change
   */
  setOnDataChange(callback) {
    this.onDataChange = callback;
  }

  /**
   * Set callback untuk fetching state change
   */
  setOnFetchingChange(callback) {
    this.onFetchingChange = callback;
  }

  /**
   * Set callback untuk error handling
   */
  setOnError(callback) {
    this.onError = callback;
  }

  /**
   * Helper function untuk strip HTML tags dari text
   */
  stripHtmlTags(html) {
    if (!html || typeof html !== 'string') {
      return html;
    }
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Generate cache key untuk query tertentu
   */
  _getCacheKey(page, searchTerm) {
    const searchHash = searchTerm ? `_${searchTerm.replace(/\s+/g, '_')}` : '';
    return `page_${page}${searchHash}`;
  }

  /**
   * Load data dari cache
   */
  async _loadFromCache(page, searchTerm) {
    if (!this.cacheEnabled || !this.pkg?.token) {
      return null;
    }

    try {
      const cacheKey = this._getCacheKey(page, searchTerm);
      const cachedData = await safeGet(this.cacheStoreName, cacheKey);
      
      if (!cachedData) {
        return null;
      }

      // Cek apakah cache masih valid (belum expired)
      const now = Date.now();
      const cacheAge = now - (cachedData.timestamp || 0);
      
      if (cacheAge > this.cacheExpiry) {
        // Cache expired, hapus
        await safeDelete(this.cacheStoreName, cacheKey);
        return null;
      }

      return cachedData;
    } catch (error) {
      console.warn('⚠️ Error loading from cache:', error);
      return null;
    }
  }

  /**
   * Save data ke cache
   */
  async _saveToCache(page, searchTerm, data, dataInfo) {
    if (!this.cacheEnabled || !this.pkg?.token) {
      return;
    }

    try {
      const cacheKey = this._getCacheKey(page, searchTerm);
      
      // Sederhanakan data untuk menghindari "Property storage exceeds"
      // Limit jumlah item yang di-cache (misalnya max 50 items per page)
      const maxCacheItems = 50;
      const simplifiedData = Array.isArray(data) 
        ? data.slice(0, maxCacheItems) // Hanya cache 50 item pertama
        : data;
      
      // Sederhanakan setiap item jika perlu
      const finalData = Array.isArray(simplifiedData)
        ? simplifiedData.map(item => {
            // Hapus nested objects yang terlalu kompleks
            const simplifiedItem = {};
            for (const key in item) {
              const value = item[key];
              // Skip objects yang terlalu kompleks (misalnya file objects dengan banyak metadata)
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Jika object memiliki banyak keys (>20), sederhanakan
                const keys = Object.keys(value);
                if (keys.length > 20) {
                  // Hanya simpan beberapa key penting
                  simplifiedItem[key] = {
                    id: value.id,
                    name: value.name,
                    // Tambahkan key penting lainnya jika ada
                  };
                } else {
                  simplifiedItem[key] = value;
                }
              } else {
                simplifiedItem[key] = value;
              }
            }
            return simplifiedItem;
          })
        : simplifiedData;
      
      const cacheData = {
        id: cacheKey,
        data: finalData,
        dataInfo: dataInfo,
        timestamp: Date.now(),
        page: page,
        searchTerm: searchTerm,
        cachedAt: new Date().toISOString()
      };

      await safeSet(this.cacheStoreName, cacheData);
    } catch (error) {
      // Jika error karena data terlalu besar, coba dengan data yang lebih sederhana
      if (error.message && error.message.includes('Property storage exceeds')) {
        try {
          const cacheKey = this._getCacheKey(page, searchTerm);
          // Minimal cache - hanya dataInfo dan timestamp
          const minimalCacheData = {
            id: cacheKey,
            data: [], // Kosongkan data untuk menghindari error
            dataInfo: dataInfo,
            timestamp: Date.now(),
            page: page,
            searchTerm: searchTerm,
            cachedAt: new Date().toISOString()
          };
          await safeSet(this.cacheStoreName, minimalCacheData);
        } catch (fallbackError) {
          console.warn('⚠️ Error saving minimal cache:', fallbackError);
        }
      } else {
        console.warn('⚠️ Error saving to cache:', error);
      }
    }
  }

  /**
   * Clear all cache untuk store ini
   */
  async clearCache() {
    if (!this.cacheEnabled || !this.pkg?.token) {
      return;
    }

    try {
      const allCache = await safeGetAll(this.cacheStoreName);
      if (allCache?.data && Array.isArray(allCache.data)) {
        for (const item of allCache.data) {
          if (item?.id) {
            await safeDelete(this.cacheStoreName, item.id);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error clearing cache:', error);
    }
  }

  /**
   * Check network status (simple check)
   */
  async _checkNetworkStatus() {
    try {
      // Simple network check - bisa di-improve dengan library network detection
      return true; // Assume online, akan di-handle oleh error catch
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch data dari server dengan offline-first strategy
   * 1. Load dari cache dulu (instant display)
   * 2. Fetch dari server di background
   * 3. Update cache dengan data terbaru
   */
  async fetchData(page = 1, searchTerm = '', forceRefresh = false) {
    if (!this.pkg?.token) return;
    
    try {
      // STEP 0: Load processed fields dulu (dibutuhkan untuk callback)
      let getData = await safeGet("nexaStore", this.pkg.token);
      const processed = DataHelper.getProcessedFields(getData, "tabel");
      this.column = processed.column;
      this.getFailed = processed.fields;
      this.processedForm = processed.form;
      // Log removed for cleaner console output

      // STEP 1: Load dari cache dulu (jika ada dan tidak force refresh)
      if (this.cacheEnabled && !forceRefresh) {
        const cachedData = await this._loadFromCache(page, searchTerm);
        
        if (cachedData) {
          // Tampilkan data dari cache segera (instant)
          this.rawData = cachedData.data || [];
          this.currentPage = cachedData.dataInfo?.currentPage || page;
          this.dataInfo = cachedData.dataInfo || this.dataInfo;
          
          // Trigger callback dengan data dari cache
          if (this.onDataChange) {
            this.onDataChange({
              data: this.rawData,
              fields: this.getFailed,
              columns: this.column,
              form: this.processedForm,
              dataInfo: this.dataInfo,
              access: {
                update: this.cellUpdate,
                delete: this.cellDelete,
                approval: this.cellApproval
              },
              fromCache: true, // Flag untuk UI bahwa ini data dari cache
              cacheAge: Date.now() - cachedData.timestamp
            });
          }
        }
      }

      // STEP 2: Fetch dari server di background
      this.setFetching(true);

      if (getData?.api?.authorization && getData?.api?.endpoind && getData?.applications) {
        const api = new Storage({
          credentials: getData.api.authorization
        });
        
        // Hitung offset dari page dan limit
        const offset = PaginationHelper.getOffset(page, this.limit);
        
        // Ambil searchFields dari aliasNames jika belum di-set
        let fieldsToSearch = this.searchFields;
        if (fieldsToSearch.length === 0 && getData.applications?.aliasNames) {
          fieldsToSearch = getData.applications.aliasNames;
          this.searchFields = fieldsToSearch;
        }
        
        // Set access property if both exist
        if (getData?.applications && getData?.access !== undefined) {
          getData.applications.access = getData.access;
          getData.applications.userid = this.userData?.user_id;
        }

        // Gunakan StorageData untuk membangun query config
        const queryConfig = await StorageData(
          this.limit,
          offset,
          searchTerm,
          fieldsToSearch,
          '',
          '',
          'id',
          'DESC',
          getData.applications
        );
        // Get access control
        const appAssets = await safeGet("bucketsStore", 'assets');
        const updateAccess = appAssets?.assets.upaccess?.[getData.className];
        const deleteAccess = appAssets?.assets.redaccess?.[getData.className];
        const approvalAccess = appAssets?.assets.approval?.[getData.className] ?? 0;
        this.cellUpdate = updateAccess;
        this.cellDelete = deleteAccess;
        this.cellApproval = approvalAccess;

        // Set access
        const access = appAssets?.assets.access?.[getData.className];
        if (access) {
          queryConfig.access = "public";
        }

        // Set territory
        const territory = appAssets?.assets.territory?.[getData.className];
        if (territory && (territory.kecamatan || territory.desa)) {
          withTerritory(queryConfig, territory);
        }

          console.log('label:', getData.api.endpoind, queryConfig);
        // Fetch data dari server
        let response;
        try {
          response = await api.put(getData.api.endpoind, queryConfig);
          this.isOffline = false;
       
          
          // Notify online status
          if (this.onOfflineStatusChange) {
            this.onOfflineStatusChange(false);
          }
        } catch (networkError) {
          // Network error - gunakan cache jika ada
          this.isOffline = true;
          
          if (this.onOfflineStatusChange) {
            this.onOfflineStatusChange(true);
          }

          // Jika tidak ada cache, throw error
          const cachedData = await this._loadFromCache(page, searchTerm);
          if (!cachedData) {
            throw new Error('Tidak ada koneksi internet dan tidak ada data cache tersedia');
          }

          // Gunakan data dari cache
          this.rawData = cachedData.data || [];
          this.currentPage = cachedData.dataInfo?.currentPage || page;
          this.dataInfo = cachedData.dataInfo || this.dataInfo;

          // Trigger callback dengan data dari cache (offline mode)
          if (this.onDataChange) {
            this.onDataChange({
              data: this.rawData,
              fields: this.getFailed,
              columns: this.column,
              form: this.processedForm,
              dataInfo: this.dataInfo,
              access: {
                update: this.cellUpdate,
                delete: this.cellDelete,
                approval: this.cellApproval
              },
              fromCache: true,
              isOffline: true,
              cacheAge: Date.now() - cachedData.timestamp
            });
          }

          return; // Exit early jika offline
        }

        console.log('label:', response);
        // STEP 3: Process response dan update cache
        if (response?.data) {
          const responseData = response.data;
          const dataArray = responseData.response || responseData.data || [];
          
          const totalCount = responseData.totalCount || responseData.total || responseData.total_count || 0;
          
          let totalPages = responseData.totalPages || responseData.total_pages || responseData.last_page || 0;
          if (totalPages === 0 && totalCount > 0) {
            totalPages = Math.ceil(totalCount / this.limit);
          }
          if (totalPages === 0 && dataArray.length > 0) {
            totalPages = 1;
          }
          
          const responseCurrentPage = responseData.currentPage || responseData.current_page || page;
          const validCurrentPage = totalPages > 0 
            ? Math.max(1, Math.min(responseCurrentPage, totalPages))
            : 1;
          
          const count = responseData.count || dataArray.length;
          
          this.rawData = dataArray;
          this.currentPage = validCurrentPage;
          
          this.dataInfo = {
            count: count,
            totalCount: totalCount,
            totalPages: totalPages,
            currentPage: validCurrentPage,
            success: responseData.success !== undefined ? responseData.success : true,
          };

          // Save ke cache untuk penggunaan selanjutnya
          await this._saveToCache(page, searchTerm, this.rawData, this.dataInfo);

          // Trigger callback dengan data terbaru dari server
          if (this.onDataChange) {
            this.onDataChange({
              data: this.rawData,
              fields: this.getFailed,
              columns: this.column,
              form: this.processedForm,
              dataInfo: this.dataInfo,
              access: {
                update: this.cellUpdate,
                delete: this.cellDelete,
                approval: this.cellApproval
              },
              fromCache: false, // Data fresh dari server
              isOffline: false
            });
          }
        }
      }
    } catch (error) {
      // Jika error dan tidak ada cache, coba load dari cache sebagai fallback
      if (this.cacheEnabled) {
        const cachedData = await this._loadFromCache(page, searchTerm);
        if (cachedData) {
          this.rawData = cachedData.data || [];
          this.currentPage = cachedData.dataInfo?.currentPage || page;
          this.dataInfo = cachedData.dataInfo || this.dataInfo;

          if (this.onDataChange) {
            this.onDataChange({
              data: this.rawData,
              fields: this.getFailed,
              columns: this.column,
              form: this.processedForm,
              dataInfo: this.dataInfo,
              access: {
                update: this.cellUpdate,
                delete: this.cellDelete,
                approval: this.cellApproval
              },
              fromCache: true,
              isOffline: true,
              error: error.message
            });
          }
        } else {
          // Tidak ada cache, kirim error
          if (this.onError) {
            this.onError(error);
          }
        }
      } else {
        // Cache disabled, langsung kirim error
        if (this.onError) {
          this.onError(error);
        }
      }
    } finally {
      this.setFetching(false);
    }
  }

  /**
   * Set fetching state
   */
  setFetching(value) {
    this.fetching = value;
    if (this.onFetchingChange) {
      this.onFetchingChange(value);
    }
  }

  /**
   * Set search keyword
   */
  setSearchKeyword(keyword) {
    this.searchKeyword = keyword;
  }

  /**
   * Set current page
   */
  setPage(page) {
    const validatedPage = PaginationHelper.validatePage(page, this.dataInfo.totalPages);
    if (validatedPage !== this.currentPage) {
      this.currentPage = validatedPage;
      this.fetchData(validatedPage, this.searchKeyword);
    }
  }

  /**
   * Search data
   */
  async search(keyword = null) {
    const searchTerm = keyword !== null ? keyword : this.searchKeyword;
    this.currentPage = 1;
    await this.fetchData(1, searchTerm.trim());
  }

  /**
   * Clear search
   */
  async clearSearch() {
    this.searchKeyword = '';
    this.currentPage = 1;
    await this.fetchData(1, '');
  }

  /**
   * Delete item
   */
  async deleteItem(itemId) {
    if (!this.pkg?.token || !itemId) {
      throw new Error('Missing pkg.token or item.id');
    }

    try {
      const getData = await NexaDBLite.get("nexaStore", this.pkg.token);
      
      if (getData?.api?.authorization && getData?.api?.endpoind) {
        const api = new Storage({
          credentials: getData.api.authorization
        });
        
        const response = await api.delete(getData.api.endpoind, { 
          key: getData.key,
          className: getData.className,
          recordId: itemId,
        });
         if (response?.status === 'success' || response?.data) {
             // Refresh data setelah delete
             await this.fetchData(this.currentPage, this.searchKeyword);
             return { success: true, message: 'Data berhasil dihapus' };
        } else {
          return { success: false, message: response?.message || 'Gagal menghapus data' };
        }
      } else {
        throw new Error('API configuration not found');
      }
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Get raw data
   */
  getData() {
    return this.rawData;
  }

  /**
   * Get fields
   */
  getFields() {
    return this.getFailed;
  }

  /**
   * Get columns
   */
  getColumns() {
    return this.column;
  }

  /**
   * Get processed form
   */
  getProcessedForm() {
    return this.processedForm;
  }

  /**
   * Get data info (pagination info)
   */
  getDataInfo() {
    return this.dataInfo;
  }

  /**
   * Get access control
   */
  getAccess() {
    return {
      update: this.cellUpdate,
      delete: this.cellDelete,
      approval: this.cellApproval
    };
  }

  /**
   * Get current page
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * Get search keyword
   */
  getSearchKeyword() {
    return this.searchKeyword;
  }

  /**
   * Get fetching state
   */
  isFetching() {
    return this.fetching;
  }

  /**
   * Refresh data (force refresh dari server)
   */
  async refresh() {
    await this.fetchData(this.currentPage, this.searchKeyword, true);
  }

  /**
   * Sync data - force refresh dan update cache
   */
  async sync() {
    await this.refresh();
  }

  /**
   * Check if currently offline
   */
  isOfflineMode() {
    return this.isOffline;
  }

  /**
   * Enable/disable cache
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
  }

  /**
   * Set cache expiry time (in milliseconds)
   */
  setCacheExpiry(expiry) {
    this.cacheExpiry = expiry;
  }
}

export default DataManager;

