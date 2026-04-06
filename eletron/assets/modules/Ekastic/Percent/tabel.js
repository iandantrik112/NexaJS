/**
 * Class untuk menampilkan tabel berdasarkan data Chart.js
 * Mendukung data dengan struktur labels dan datasets
 */
export class Tabel {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.options = {
      showHeader: true,
      showFooter: true,
      striped: true,
      hover: true,
      bordered: true,
      responsive: true,
      ...options,
    };
    this.data = null;
    this.ChartData = null;
  }

  /**
   * Initialize chart data
   */
  async initializeChartData() {
    try {
      const baugData = NXUI.PercentData;
      if (baugData && baugData.store && baugData.id) {
        const dataform = await NXUI.ref.get(baugData.store, baugData.id);
        this.ChartData = dataform.percent || { label: "Tabel Persentase" };
      } else {
        this.ChartData = { label: "Tabel Persentase" };
      }
    } catch (error) {
      this.ChartData = { label: "Tabel Persentase" };
    }
  }

  /**
   * Set data untuk tabel
   * @param {Object} data - Data dengan struktur Chart.js (labels, datasets)
   */
  setData(data) {
    this.data = data;
    return this;
  }

  /**
   * Render tabel ke dalam container
   */
  async render() {
    if (!this.data) {
      return;
    }

    if (!this.container) {
      return;
    }

    // Initialize chart data if not already loaded
    if (!this.ChartData) {
      await this.initializeChartData();
    }

    this.container.innerHTML = this.generateTableHTML();
    this.attachEventListeners();

    // Store instance reference for export button access
    const tableContainer = this.container.querySelector(
      "[data-table-container]"
    );
    if (tableContainer) {
      tableContainer.__tabelInstance = this;
    }
  }

  /**
   * Generate HTML untuk tabel
   */
  generateTableHTML() {
    // Handle both direct data structure and Chart.js config structure
    let labels, datasets;

    if (this.data.data && this.data.data.labels && this.data.data.datasets) {
      // Chart.js config structure: { data: { labels: [...], datasets: [...] } }
      labels = this.data.data.labels;
      datasets = this.data.data.datasets;
    } else if (this.data.labels && this.data.datasets) {
      // Direct data structure: { labels: [...], datasets: [...] }
      labels = this.data.labels;
      datasets = this.data.datasets;
    } else {
      return '<div class="alert alert-danger">Data structure tidak valid. Periksa console untuk detail.</div>';
    }

    // Validate that we have the required data
    if (!Array.isArray(labels) || !Array.isArray(datasets)) {
      return '<div class="alert alert-danger">Data tidak valid: labels atau datasets bukan array</div>';
    }

    let html = '<div class="table-responsive">';

    html += `<div class="nx-card">
  <div class="nx-card-header">
    <div class="nx-row">
      <div class="nx-col-6">
        <strong>${this.ChartData?.label || "Tabel Persentase"}</strong>
      </div>
      <div class="nx-col-6 align-right">
        <button class="btn btn-primary" data-export-btn="true" onclick="this.closest('.nx-card').querySelector('[data-table-container]').__tabelInstance?.exportToCSV()" style="padding: 2px 6px; font-size: 11px; line-height: 1.2;">
          <i class="fas fa-download" style="font-size: 10px;"></i> Export
        </button>
      </div>
    </div>
  </div>
  <div class="nx-card-body" style="padding:5px">
    <div data-table-container>
            `;
    html += '<table class="table';

    // Tambahkan class CSS berdasarkan options
    if (this.options.striped) html += " table-striped";
    if (this.options.hover) html += " table-hover";
    if (this.options.bordered) html += " table-bordered";

    html += '">';

    // Header
    if (this.options.showHeader) {
      html += '<thead class="table-dark">';
      html += "<tr>";
      html += "<th style='width:30px'>No</th>";
      html += "<th>Kategori</th>";
      html += "<th>Data</th>";
      html += "<th>Persentase</th>";
      html += "<th>Progress</th>";
      html += "</tr>";
      html += "</thead>";
    }

    // Calculate grand total first for percentage calculations
    let grandTotal = 0;
    labels.forEach((label, index) => {
      let rowTotal = 0;
      datasets.forEach((dataset) => {
        const value = dataset.data[index] || 0;
        rowTotal += value;
      });
      grandTotal += rowTotal;
    });

    // Body
    html += "<tbody>";
    labels.forEach((label, index) => {
      html += "<tr style='width:30px'>";
      html += `<td style="vertical-align: middle; text-align: center;"><strong>${
        index + 1
      }</strong></td>`;
      html += `<td style="vertical-align: middle;"><strong>${label}</strong></td>`;

      let rowTotal = 0;
      datasets.forEach((dataset) => {
        const value = dataset.data[index] || 0;
        rowTotal += value;
      });

      // Calculate percentage
      const percentage = grandTotal > 0 ? (rowTotal / grandTotal) * 100 : 0;
      html += `<td style="vertical-align: middle;"><strong>${this.formatNumber(
        rowTotal
      )}</strong></td>`;
      html += `<td style="vertical-align: middle;"><strong>${this.formatPercentage(
        percentage
      )}</strong></td>`;

      // Progress bar dengan warna sesuai dataset
      const progressBar = this.generateProgressBar(percentage, datasets, index);
      html += `<td style="min-width: 200px; width: 200px; padding: 12px 8px; text-align: center;">${progressBar}</td>`;
      html += "</tr>";
    });
    html += "</tbody>";

    // Footer dengan total
    if (this.options.showFooter) {
      html += '<tfoot class="table-light">';
      html += "<tr>";
      html += `<td style="vertical-align: middle; text-align: center;"><strong>-</strong></td>`;
      html += `<td style="vertical-align: middle;"><strong>Total</strong></td>`;

      let grandTotal = 0;
      datasets.forEach((dataset) => {
        const datasetTotal = dataset.data.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        grandTotal += datasetTotal;
      });

      html += `<td style="vertical-align: middle;"><strong>${this.formatNumber(
        grandTotal
      )}</strong></td>`;
      html += `<td style="vertical-align: middle;"><strong>100%</strong></td>`;
      html += `<td style="min-width: 200px; width: 200px; padding: 12px 8px; text-align: center; vertical-align: middle;"><strong>100%</strong></td>`;
      html += "</tr>";
      html += "</tfoot>";
    }

    html += "</table>";
    html += `</div>`; // Close data-table-container
    html += `
  </div>
</div>`;
    html += "</div>";

    return html;
  }

  /**
   * Format angka dengan separator ribuan
   */
  formatNumber(num) {
    return new Intl.NumberFormat("id-ID").format(num);
  }

  /**
   * Format persentase dengan 2 desimal, kecuali untuk 100%
   */
  formatPercentage(num) {
    return num === 100 ? "100%" : `${num.toFixed(2)}%`;
  }

  /**
   * Generate progress bar dengan warna sesuai dataset menggunakan nx-progress style
   */
  generateProgressBar(percentage, datasets, rowIndex) {
    // Tentukan warna berdasarkan dataset backgroundColor
    let progressColor = "#0078d4"; // default blue

    // Cek apakah ini donut chart (backgroundColor adalah array)
    if (datasets.length > 0 && Array.isArray(datasets[0].backgroundColor)) {
      // Untuk donut chart, gunakan warna dari array backgroundColor berdasarkan rowIndex
      const backgroundColor =
        datasets[0].backgroundColor[rowIndex] ||
        datasets[0].borderColor[rowIndex];

      // Mapping warna Chart.js backgroundColor ke warna progress
      if (
        backgroundColor.includes("#FF6384") ||
        backgroundColor.includes("255, 99, 132") ||
        backgroundColor.includes("rgba(255, 99, 132")
      ) {
        progressColor = "#FF6384"; // Red
      } else if (
        backgroundColor.includes("#36A2EB") ||
        backgroundColor.includes("54, 162, 235") ||
        backgroundColor.includes("rgba(54, 162, 235")
      ) {
        progressColor = "#36A2EB"; // Blue
      } else if (
        backgroundColor.includes("#4BC0C0") ||
        backgroundColor.includes("75, 192, 192") ||
        backgroundColor.includes("rgba(75, 192, 192")
      ) {
        progressColor = "#4BC0C0"; // Teal
      } else if (
        backgroundColor.includes("#FFCE56") ||
        backgroundColor.includes("255, 206, 86") ||
        backgroundColor.includes("rgba(255, 206, 86")
      ) {
        progressColor = "#FFCE56"; // Yellow
      } else if (
        backgroundColor.includes("#9966FF") ||
        backgroundColor.includes("153, 102, 255") ||
        backgroundColor.includes("rgba(153, 102, 255")
      ) {
        progressColor = "#9966FF"; // Purple
      } else if (
        backgroundColor.includes("#4AC26B") ||
        backgroundColor.includes("74, 194, 107") ||
        backgroundColor.includes("rgba(74, 194, 107")
      ) {
        progressColor = "#4AC26B"; // Green
      } else {
        // Untuk warna custom, gunakan warna asli
        progressColor = backgroundColor;
      }
    } else {
      // Untuk chart biasa, cari dataset dengan nilai tertinggi untuk row ini
      let maxValue = 0;
      let maxDataset = null;

      datasets.forEach((dataset) => {
        const value = dataset.data[rowIndex] || 0;
        if (value > maxValue) {
          maxValue = value;
          maxDataset = dataset;
        }
      });

      if (maxDataset) {
        // Prioritaskan backgroundColor, fallback ke borderColor
        const backgroundColor =
          maxDataset.backgroundColor || maxDataset.borderColor;

        // Mapping warna Chart.js backgroundColor ke warna progress
        if (
          backgroundColor.includes("#FF6384") ||
          backgroundColor.includes("255, 99, 132") ||
          backgroundColor.includes("rgba(255, 99, 132")
        ) {
          progressColor = "#FF6384"; // Red
        } else if (
          backgroundColor.includes("#36A2EB") ||
          backgroundColor.includes("54, 162, 235") ||
          backgroundColor.includes("rgba(54, 162, 235")
        ) {
          progressColor = "#36A2EB"; // Blue
        } else if (
          backgroundColor.includes("#4BC0C0") ||
          backgroundColor.includes("75, 192, 192") ||
          backgroundColor.includes("rgba(75, 192, 192")
        ) {
          progressColor = "#4BC0C0"; // Teal
        } else if (
          backgroundColor.includes("#FFCE56") ||
          backgroundColor.includes("255, 206, 86") ||
          backgroundColor.includes("rgba(255, 206, 86")
        ) {
          progressColor = "#FFCE56"; // Yellow
        } else if (
          backgroundColor.includes("#9966FF") ||
          backgroundColor.includes("153, 102, 255") ||
          backgroundColor.includes("rgba(153, 102, 255")
        ) {
          progressColor = "#9966FF"; // Purple
        } else if (
          backgroundColor.includes("#4AC26B") ||
          backgroundColor.includes("74, 194, 107") ||
          backgroundColor.includes("rgba(74, 194, 107")
        ) {
          progressColor = "#4AC26B"; // Green
        } else {
          // Untuk warna custom, gunakan warna asli
          progressColor = backgroundColor;
        }
      }
    }

    return `
      <div class="nx-progress nx-progress-rounded with-shadow" style="height: 15px; width: 100%; margin: 0 auto; display: inline-block; vertical-align: middle;">
        <div class="nx-progress-bar with-label smooth-transition hover-effect" 
             style="width: ${percentage}%; background-color: ${progressColor};" 
             role="progressbar" 
             aria-valuenow="${percentage}" 
             aria-valuemin="0" 
             aria-valuemax="100"
             data-tooltip="${this.formatPercentage(percentage)}">
          ${this.formatPercentage(percentage)}
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Hover effect untuk rows
    const rows = this.container.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        row.style.backgroundColor = "#f8f9fa";
      });
      row.addEventListener("mouseleave", () => {
        row.style.backgroundColor = "";
      });
    });
  }

  /**
   * Update data dan re-render
   */
  updateData(newData) {
    this.setData(newData);
    this.render();
  }

  /**
   * Export data ke CSV
   */
  exportToCSV(filename = "data-tabel.csv") {
    if (!this.data) return;

    // Handle both direct data structure and Chart.js config structure
    let labels, datasets;

    if (this.data.data && this.data.data.labels && this.data.data.datasets) {
      // Chart.js config structure: { data: { labels: [...], datasets: [...] } }
      labels = this.data.data.labels;
      datasets = this.data.data.datasets;
    } else if (this.data.labels && this.data.datasets) {
      // Direct data structure: { labels: [...], datasets: [...] }
      labels = this.data.labels;
      datasets = this.data.datasets;
    } else {
      return;
    }
    // Calculate grand total for percentage
    let grandTotal = 0;
    labels.forEach((label, index) => {
      let rowTotal = 0;
      datasets.forEach((dataset) => {
        const value = dataset.data[index] || 0;
        rowTotal += value;
      });
      grandTotal += rowTotal;
    });

    let csv = "No,Kategori,Total,Persentase,Progress\n";

    // Data rows
    labels.forEach((label, index) => {
      csv += `${index + 1},${label}`;
      let rowTotal = 0;
      datasets.forEach((dataset) => {
        const value = dataset.data[index] || 0;
        rowTotal += value;
      });
      const percentage = grandTotal > 0 ? (rowTotal / grandTotal) * 100 : 0;
      const formattedPercentage =
        percentage === 100 ? "100%" : `${percentage.toFixed(2)}%`;
      const progressValue = `${percentage.toFixed(1)}%`;
      csv += `,${rowTotal},${formattedPercentage},${progressValue}\n`;
    });

    // Download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Tambahkan tombol export (deprecated - tombol sudah terintegrasi dalam HTML)
   */
  addExportButton() {
    // Tombol export sudah terintegrasi dalam card header
  }

  /**
   * Remove existing export button (deprecated - tombol sudah terintegrasi dalam HTML)
   */
  removeExportButton() {
    // Tombol export sudah terintegrasi dalam card header
  }
}

/**
 * Fungsi helper untuk membuat tabel dengan mudah
 * @param {string} containerId - ID container
 * @param {Object} data - Data Chart.js
 * @param {Object} options - Options untuk tabel
 */
export async function createTabel(containerId, data, options = {}) {
  const tabel = new Tabel(containerId, options);
  tabel.setData(data);
  await tabel.render();
  return tabel;
}

// Data contoh untuk testing
export const sampleData = {
  labels: ["Direktur Utama", "Sekertaris Badan Pengawas"],
  datasets: [
    {
      label: "Direktur Utama",
      data: [155, 0],
      fill: true,
      tension: 0.4,
      backgroundColor: "rgba(255, 99, 132, 0.3)",
      borderColor: "#FF6384",
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: "Sekertaris Badan Pengawas",
      data: [0, 2],
      fill: true,
      tension: 0.4,
      backgroundColor: "rgba(54, 162, 235, 0.3)",
      borderColor: "#36A2EB",
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};
