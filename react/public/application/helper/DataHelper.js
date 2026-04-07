/**
 * DataHelper - Helper class untuk operasi data form dan column
 * Digunakan untuk mengelola field form dan pengurutan berdasarkan column
 */
export class DataHelper {
  /**
   * Mengambil field-field dari form data berdasarkan condition
   * @param {Object} data - Data object yang memiliki property form
   * @param {string} condition - Condition untuk filter (default: "tabel")
   * @returns {Array|false} - Array of fields atau false jika tidak ada
   */
  static faild(data, condition = "tabel") {
    if (!data || !data.form) {
      return false;
    }

    const formData = data.form;
    const files = Object.entries(formData)
      .filter(([_, field]) => field[condition]) // ambil yg punya nilai truthy
      .map(([key, field]) => field);

    return files.length > 0 ? files : false;
  }

  /**
   * Memetakan field-field menjadi format yang mudah digunakan
   * @param {Array} failedFields - Array of field objects dari faild()
   * @returns {Array} - Array of mapped fields dengan label dan failed
   */
  static mapFailedFields(failedFields) {
    if (!failedFields || !Array.isArray(failedFields)) {
      return [];
    }

    return failedFields.map(item => ({
      label: item.placeholder || item.name || item.failed,
      failed: item.failed,
      approval: item.approval ?? null
    }));
  }

  /**
   * Mengurutkan field berdasarkan urutan di column
   * @param {Array} mappedFailed - Array of mapped fields
   * @param {Array} column - Array of column names untuk urutan
   * @returns {Array} - Sorted array of fields
   */
  static sortFieldsByColumn(mappedFailed, column) {
    if (!mappedFailed || !Array.isArray(mappedFailed)) {
      return [];
    }

    // Jika column kosong atau tidak ada, return mappedFailed as is
    if (!column || !Array.isArray(column) || column.length === 0) {
      return mappedFailed;
    }

    // Urutkan berdasarkan column
    const sortedFailed = column
      .map(colName => mappedFailed.find(f => f.failed === colName))
      .filter(f => f !== undefined)
      .concat(
        // Tambahkan field yang tidak ada di column di akhir
        mappedFailed.filter(f => !column.includes(f.failed))
      );

    return sortedFailed;
  }

  /**
   * Mengambil dan memproses field dari data dengan pengurutan column
   * @param {Object} data - Data object yang memiliki form dan column
   * @param {string} condition - Condition untuk filter (default: "tabel")
   * @returns {Object} - Object dengan properties: fields, column, form
   */
  static getProcessedFields(data, condition = "tabel") {
    const columnData = data?.column || [];
    const formData = data?.form || {};
    
    // Filter form hanya menampilkan field yang ada di column
    // Dan hanya menampilkan field-field tertentu dari setiap form field
    const filteredForm = {};
    if (columnData.length > 0 && formData) {
      columnData.forEach(colName => {
        if (formData[colName]) {
          const field = formData[colName];
          // Hanya ambil field yang diperlukan
          filteredForm[colName] =field;
        }
      });
    }
    
    // Ambil field-field yang memiliki property condition
    const failedFields = this.faild(data, condition);
    
    if (!failedFields) {
      return {
        fields: [],
        column: columnData,
        form: filteredForm,
      };
    }

    // Map field menjadi format yang mudah digunakan
    const mappedFailed = this.mapFailedFields(failedFields);

    // Urutkan berdasarkan column
    const sortedFailed = this.sortFieldsByColumn(mappedFailed, columnData);

    return {
      fields: sortedFailed,
      column: columnData,
      form: filteredForm,
    };
  }

  /**
   * Mengambil column dari data
   * @param {Object} data - Data object yang memiliki property column
   * @returns {Array} - Array of column names
   */
  static getColumn(data) {
    return data?.column || [];
  }
}

export default DataHelper;

