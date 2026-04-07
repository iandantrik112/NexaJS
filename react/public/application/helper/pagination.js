/**
 * PaginationHelper - Helper class untuk operasi pagination
 * Digunakan untuk mengelola pagination logic dan perhitungan
 */
export class PaginationHelper {
  /**
   * Menghitung informasi pagination
   * @param {number} currentPage - Halaman saat ini
   * @param {number} totalPages - Total jumlah halaman
   * @param {number} itemsPerPage - Jumlah item per halaman
   * @returns {Object} - Object dengan informasi pagination
   */
  static getPaginationInfo(currentPage, totalPages, itemsPerPage = 5) {
    const page = Math.max(1, Math.min(currentPage, totalPages));
    const startItem = (page - 1) * itemsPerPage + 1;
    const endItem = Math.min(page * itemsPerPage, totalPages * itemsPerPage);

    return {
      currentPage: page,
      totalPages,
      itemsPerPage,
      startItem,
      endItem,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Menghasilkan array page numbers untuk ditampilkan
   * @param {number} currentPage - Halaman saat ini
   * @param {number} totalPages - Total jumlah halaman
   * @param {number} maxVisible - Maksimal halaman yang ditampilkan (default: 5)
   * @returns {Array} - Array of page numbers dengan ellipsis
   */
  static getPageNumbers(currentPage, totalPages, maxVisible = 5) {
    const pages = [];
    
    if (totalPages <= maxVisible + 2) {
      // Jika total halaman sedikit, tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Selalu tampilkan halaman pertama
    if (start > 1) {
      pages.push(1);
    }

    // Tampilkan halaman di tengah
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Hapus halaman terakhir sebelum Next (tidak perlu ditampilkan karena sudah ada tombol Last)

    return pages;
  }

  /**
   * Menghitung offset berdasarkan page dan limit
   * @param {number} page - Halaman yang diinginkan
   * @param {number} limit - Jumlah item per halaman
   * @returns {number} - Offset value
   */
  static getOffset(page, limit) {
    return (page - 1) * limit;
  }

  /**
   * Menghitung page berdasarkan offset dan limit
   * @param {number} offset - Offset value
   * @param {number} limit - Jumlah item per halaman
   * @returns {number} - Page number
   */
  static getPageFromOffset(offset, limit) {
    return Math.floor(offset / limit) + 1;
  }

  /**
   * Validasi dan normalisasi page number
   * @param {number} page - Page number
   * @param {number} totalPages - Total jumlah halaman
   * @returns {number} - Validated page number
   */
  static validatePage(page, totalPages) {
    if (page < 1) return 1;
    if (page > totalPages) return totalPages;
    return page;
  }

  /**
   * Menghasilkan parameter untuk API request
   * @param {number} page - Halaman yang diinginkan
   * @param {number} limit - Jumlah item per halaman
   * @returns {Object} - Object dengan limit dan offset
   */
  static getApiParams(page, limit = 5) {
    const offset = this.getOffset(page, limit);
    return {
      limit,
      offset,
      page,
    };
  }
}

export default PaginationHelper;

