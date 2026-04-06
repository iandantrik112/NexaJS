/**
 * FormKey - Utility class untuk memfilter form berdasarkan keys
 * 
 * @example
 * // Hanya menampilkan keys yang ada di includeKeys
 * const filtered = FormKey.include(storage, ['title', 'slug', 'keywords']);
 * 
 * @example
 * // Mengecualikan keys yang ada di excludeKeys
 * const filtered = FormKey.exclude(storage, ['title', 'slug', 'keywords']);
 * 
 * @example
 * // Menggunakan instance
 * const formKey = new FormKey(storage);
 * const filtered = formKey.filterInclude(['title', 'slug']);
 */
export class FormKey {
  /**
   * Constructor
   * @param {Object} storage - Storage object yang berisi form
   */
  constructor(storage) {
    this.storage = storage || {};
    this.originalForm = storage?.form || {};
  }

  /**
   * Memfilter form - hanya menampilkan keys yang ada di includeKeys
   * @param {Array<string>} includeKeys - Array of keys yang ingin ditampilkan
   * @returns {Object} Storage object dengan form yang sudah difilter
   */
  filterInclude(includeKeys = []) {
    const filteredForm = {};
    
    if (!Array.isArray(includeKeys) || includeKeys.length === 0) {
      return { ...this.storage, form: {} };
    }

    if (this.originalForm && typeof this.originalForm === 'object') {
      Object.keys(this.originalForm).forEach(key => {
        if (includeKeys.includes(key)) {
          filteredForm[key] = this.originalForm[key];
        }
      });
    }

    return {
      ...this.storage,
      form: filteredForm
    };
  }

  /**
   * Memfilter form - mengecualikan keys yang ada di excludeKeys
   * @param {Array<string>} excludeKeys - Array of keys yang ingin dikecualikan
   * @returns {Object} Storage object dengan form yang sudah difilter
   */
  filterExclude(excludeKeys = []) {
    const filteredForm = {};
    
    if (!Array.isArray(excludeKeys) || excludeKeys.length === 0) {
      return { ...this.storage, form: this.originalForm };
    }

    if (this.originalForm && typeof this.originalForm === 'object') {
      Object.keys(this.originalForm).forEach(key => {
        if (!excludeKeys.includes(key)) {
          filteredForm[key] = this.originalForm[key];
        }
      });
    }

    return {
      ...this.storage,
      form: filteredForm
    };
  }

  /**
   * Static method - Hanya menampilkan keys yang ada di includeKeys
   * @param {Object} storage - Storage object yang berisi form
   * @param {Array<string>} includeKeys - Array of keys yang ingin ditampilkan
   * @returns {Object} Storage object dengan form yang sudah difilter
   */
  static include(storage, includeKeys = []) {
    const formKey = new FormKey(storage);
    return formKey.filterInclude(includeKeys);
  }

  /**
   * Static method - Mengecualikan keys yang ada di excludeKeys
   * @param {Object} storage - Storage object yang berisi form
   * @param {Array<string>} excludeKeys - Array of keys yang ingin dikecualikan
   * @returns {Object} Storage object dengan form yang sudah difilter
   */
  static exclude(storage, excludeKeys = []) {
    const formKey = new FormKey(storage);
    return formKey.filterExclude(excludeKeys);
  }

  /**
   * Mendapatkan filtered form saja (tanpa storage object lengkap)
   * @param {Array<string>} includeKeys - Array of keys yang ingin ditampilkan
   * @returns {Object} Filtered form object
   */
  getFormInclude(includeKeys = []) {
    const filtered = this.filterInclude(includeKeys);
    return filtered.form || {};
  }

  /**
   * Mendapatkan filtered form saja (tanpa storage object lengkap) - exclude mode
   * @param {Array<string>} excludeKeys - Array of keys yang ingin dikecualikan
   * @returns {Object} Filtered form object
   */
  getFormExclude(excludeKeys = []) {
    const filtered = this.filterExclude(excludeKeys);
    return filtered.form || {};
  }
}

export default FormKey;

// Hanya menampilkan keys tertentu
// const filtered = FormKey.include(storage, ['title', 'slug', 'keywords']);

// // Mengecualikan keys tertentu
// const filtered = FormKey.exclude(storage, ['images', 'status']);

// const formKey = new FormKey(storage);
// const filtered = formKey.filterInclude(['title', 'slug']);
// // atau
// const filtered = formKey.filterExclude(['images']);

// import { FormKey } from './FormKey.js';

// // Method 1: Static include
// const filtered = FormKey.include(storage, ['title', 'slug', 'keywords']);

// // Method 2: Static exclude
// const filtered = FormKey.exclude(storage, ['images', 'status']);

// // Method 3: Instance
// const formKey = new FormKey(storage);
// const filtered = formKey.filterInclude(['title']);