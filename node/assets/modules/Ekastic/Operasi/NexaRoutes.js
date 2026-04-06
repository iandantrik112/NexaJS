/**
 * Class NexaRoutes - Sistem routing/view dinamis untuk Operasi
 * 
 * Cara penggunaan:
 * 1. Import class: import { NexaRoutes } from "./NexaRoutes.js";
 * 2. Buat instance: const routes = new NexaRoutes(data, containerSelector);
 * 3. Register views: routes.register('viewName', viewFunction);
 * 4. Navigate ke view: routes.switch('viewName');
 * 
 * Contoh:
 * const routes = new NexaRoutes(data, '#nxdrop .nx-col-8');
 * routes.register('complex', opComplex);
 * routes.register('metadata', opMetadata);
 * routes.switch('complex');
 * 
 * Atau dari HTML: onclick="navigate('complex');"
 */
export class NexaRoutes {
  constructor(data, containerSelector = '#nxdrop .nx-col-8', defaultView = 'metadata') {
    this.data = data;
    this.containerSelector = containerSelector;
    this.views = {};
    this.currentView = null;
    this.defaultView = defaultView; // Simpan default view
    
    // Key untuk localStorage berdasarkan data.id agar setiap aplikasi memiliki state sendiri
    this.storageKey = `nexaRoutes_${data?.id || 'default'}_lastView`;
    
    // Simpan instance di global untuk akses dari HTML onclick
    if (typeof window !== 'undefined') {
      window._nexaRoutes = this;
    }
  }

  /**
   * Register view/modul baru
   * @param {string} viewName - Nama view (untuk dipanggil di switch)
   * @param {Function} viewFunction - Function async yang mengembalikan HTML string
   * @returns {boolean} - true jika berhasil, false jika gagal
   */
  register(viewName, viewFunction) {
    if (typeof viewFunction !== 'function') {
      console.error(`❌ View function untuk "${viewName}" harus berupa function`);
      return false;
    }
    
    this.views[viewName] = viewFunction;
    return true;
  }

  /**
   * Register multiple views sekaligus
   * @param {Object} viewsObject - Object berisi { viewName: viewFunction }
   * @returns {boolean} - true jika semua berhasil
   */
  registerMultiple(viewsObject) {
    let allSuccess = true;
    for (const [viewName, viewFunction] of Object.entries(viewsObject)) {
      if (!this.register(viewName, viewFunction)) {
        allSuccess = false;
      }
    }
    return allSuccess;
  }

  /**
   * Switch ke view tertentu
   * @param {string} viewName - Nama view yang ingin ditampilkan
   * @returns {Promise<boolean>} - true jika berhasil, false jika gagal
   */
  async switch(viewName) {
    try {
      const viewFunction = this.views[viewName];
      if (!viewFunction) {
        console.error(`❌ View "${viewName}" tidak ditemukan di registry`);
        return false;
      }

      // Panggil view function dengan data
      const viewHtml = await viewFunction(this.data);
      
      // Cari container untuk menampilkan view
      const container = document.querySelector(this.containerSelector);
      if (!container) {
        console.error(`❌ Container "${this.containerSelector}" tidak ditemukan`);
        return false;
      }

      // Cari card body di dalam container
      const cardBody = container.querySelector('.nx-card-body');
      if (cardBody) {
        cardBody.innerHTML = viewHtml;
      } else {
        // Fallback: cari elemen konten lainnya
        const existingBody = container.querySelector('[class*="body"], div:not(.nx-card-header)');
        if (existingBody) {
          existingBody.innerHTML = viewHtml;
        } else {
          // Jika tidak ada, cari elemen setelah header
          const header = container.querySelector('.nx-card-header');
          if (header && header.nextElementSibling) {
            header.nextElementSibling.innerHTML = viewHtml;
          } else {
            // Fallback terakhir: ganti seluruh konten container (kecuali header)
            const headerHtml = container.querySelector('.nx-card-header')?.outerHTML || '';
            container.innerHTML = headerHtml + viewHtml;
          }
        }
      }

      this.currentView = viewName;
      
      // Simpan state ke localStorage untuk persistensi
      this.saveLastView(viewName);
      
      return true;
    } catch (error) {
      console.error(`❌ Error switching to view "${viewName}":`, error);
      return false;
    }
  }

  /**
   * Kembali ke view default (view awal yang ditampilkan di Aplikasi)
   * @param {string} defaultViewName - Nama view default (optional, akan menggunakan this.defaultView jika tidak diisi)
   * @returns {Promise<boolean>}
   */
  async switchToDefault(defaultViewName = null) {
    const viewToUse = defaultViewName || this.defaultView;
    return await this.switch(viewToUse);
  }
  
  /**
   * Set default view
   * @param {string} viewName - Nama view yang akan menjadi default
   */
  setDefaultView(viewName) {
    this.defaultView = viewName;
  }
  
  /**
   * Get default view name
   * @returns {string}
   */
  getDefaultView() {
    return this.defaultView;
  }

  /**
   * Get current view name
   * @returns {string|null}
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Get list of registered views
   * @returns {Array<string>}
   */
  getRegisteredViews() {
    return Object.keys(this.views);
  }

  /**
   * Check if view is registered
   * @param {string} viewName
   * @returns {boolean}
   */
  hasView(viewName) {
    return viewName in this.views;
  }

  /**
   * Update data yang digunakan untuk view
   * @param {Object} newData
   */
  updateData(newData) {
    this.data = newData;
  }

  /**
   * Get current data
   * @returns {Object}
   */
  getData() {
    return this.data;
  }

  /**
   * Simpan view terakhir ke localStorage
   * @param {string} viewName - Nama view yang disimpan
   */
  saveLastView(viewName) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, viewName);
    } catch (error) {
      console.warn('⚠️ Gagal menyimpan state ke localStorage:', error);
    }
  }

  /**
   * Load view terakhir dari localStorage
   * @returns {string|null} - Nama view terakhir atau null jika tidak ada
   */
  loadLastView() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    try {
      const lastView = localStorage.getItem(this.storageKey);
      return lastView;
    } catch (error) {
      console.warn('⚠️ Gagal memuat state dari localStorage:', error);
      return null;
    }
  }

  /**
   * Hapus state tersimpan (reset ke default)
   */
  clearLastView() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('⚠️ Gagal menghapus state dari localStorage:', error);
    }
  }

  /**
   * Load dan switch ke view terakhir yang tersimpan (jika ada)
   * @returns {Promise<boolean>} - true jika berhasil load, false jika tidak ada state atau gagal
   */
  async loadAndSwitchToLastView() {
    const lastView = this.loadLastView();
    if (!lastView) {
      return false;
    }
    
    // Cek apakah view terakhir masih terdaftar
    if (!this.hasView(lastView)) {
      console.warn(`⚠️ View "${lastView}" tidak ditemukan di registry, menggunakan default`);
      this.clearLastView();
      return false;
    }
    
    // Switch ke view terakhir
    return await this.switch(lastView);
  }

  /**
   * Setup global functions untuk akses dari HTML onclick
   * Membuat window.navigate() dan window.registerView()
   */
  setupGlobalFunctions() {
    if (typeof window === 'undefined') return;

    // Fungsi untuk navigate ke view dari HTML
    window.navigate = (viewName) => {
      return this.switch(viewName);
    };

    // Fungsi untuk register view dari HTML/JS
    window.registerView = (viewName, viewFunction) => {
      return this.register(viewName, viewFunction);
    };

    // Fungsi untuk kembali ke default
    window.goHome = () => {
      return this.switchToDefault();
    };
  }
}

