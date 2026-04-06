/**
 * chartElements.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

export class chartElements {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;

    // Store global reference for fallback purposes
    window.chartElementsInstance = this;
   
  }
  struktur() {
    return [
      {
        id: "chart-elements",
        icon: "pie-chart",
        text: "Chart Elements",
        action: "chartElements",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "chart-bar",
            icon: "bar-chart-2",
            text: "Bar Chart",
            action: "insertBarChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-line",
            icon: "bar-chart-2",
            text: "Line Chart",
            action: "insertLineChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-pie",
            icon: "bar-chart-2",
            text: "Pie Chart",
            action: "insertPieChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-doughnut",
            icon: "bar-chart-2",
            text: "Doughnut Chart",
            action: "insertDoughnutChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-radar",
            icon: "bar-chart-2",
            text: "Radar Chart",
            action: "insertRadarChart",
            showCondition: "hasNoSelectedText",
          },
        ],
      },
    ];
  }

  /**
   * Context menu: Insert chart element
   */
  contextInsertChart(chartType) {
    try {
      if (!this.interactions.targetElement) {
        console.error("Chart insertion failed: No target element");
        return { success: false, error: "No target element" };
      }

      // Check if Chart.js is available
      if (typeof Chart === "undefined") {
        console.error("Chart insertion failed: Chart.js library not available");
        return {
          success: false,
          error:
            "Chart.js library not available. Please include Chart.js library.",
        };
      }

      // Show chart configuration modal
      console.log(`🎨 Opening chart configuration modal for: ${chartType}`);
      this.showChartConfigModal(chartType);

      return {
        success: true,
        message: `Chart configuration modal opened for ${chartType}`,
      };
    } catch (error) {
      console.error("Chart insertion error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Show chart configuration modal
   */
  showChartConfigModal(chartType) {
    try {
      console.log(`🔧 Setting up chart configuration modal for: ${chartType}`);

      // Create modal ID - make it simpler and more predictable
      const timestamp = Date.now();
      const modalId = `chartModal${timestamp}`;

      console.log(`🆔 Generated modal ID: ${modalId}`);

      // Setup global callback functions FIRST before creating modal
      const callbackResults = this.setupGlobalCallbacks(modalId, chartType);

      // If callback creation failed, don't proceed
      if (callbackResults.preview !== "function") {
        console.error(
          "❌ Failed to create global callbacks, aborting modal creation"
        );
        return;
      }

      // Create and register the NexaUI modal
      this.createChartConfigModal(chartType, modalId);

      // Open the modal after ensuring everything is ready
      setTimeout(() => {
        console.log(`🚀 Opening NexaUI modal: ${modalId}`);

        // Double check function exists before opening modal
        const previewFunctionName = `previewChart_${modalId}`;
        const previewExists = typeof window[previewFunctionName] === "function";

        console.log(`🔍 Final verification before opening modal:`, {
          modalId: modalId,
          previewFunction: previewFunctionName,
          exists: previewExists,
          functionType: typeof window[previewFunctionName],
        });

        if (!previewExists) {
          console.error(`❌ Preview function not found! Recreating...`);
          this.setupGlobalCallbacks(modalId, chartType);
        }

        this.nexaUI.nexaModal.open(modalId);
      }, 500); // Further increased delay to ensure everything is ready
    } catch (error) {
      console.error("❌ Error in showChartConfigModal:", error);
    }
  }

  /**
   * Create chart configuration modal using NexaUI
   */
  createChartConfigModal(chartType, modalId) {
    let modalTitle = "";
    let sampleData = "";

    switch (chartType) {
      case "bar":
        modalTitle = "Insert Bar Chart";
        sampleData = "Sales,Revenue,Profit\n100,200,50\n150,300,75\n120,250,60";
        break;
      case "line":
        modalTitle = "Insert Line Chart";
        sampleData = "Jan,Feb,Mar,Apr\n10,20,15,25\n8,18,12,22";
        break;
      case "pie":
        modalTitle = "Insert Pie Chart";
        sampleData = "Product A,Product B,Product C\n30,45,25";
        break;
      case "doughnut":
        modalTitle = "Insert Doughnut Chart";
        sampleData = "Desktop,Mobile,Tablet\n60,30,10";
        break;
      case "radar":
        modalTitle = "Insert Radar Chart";
        sampleData = "Speed,Quality,Price,Support\n8,9,6,7\n6,8,9,8";
        break;
      default:
        modalTitle = "Insert Chart";
        sampleData = "Label1,Label2,Label3\n10,20,30";
    }

    // Create modal content using NexaUI form standards
    const modalContent = `
      <div class="form-nexa">
        <form id="chartForm-${modalId}">
          <div class="form-nexa-row">
            <div class="form-nx-col-8">
              <div class="form-nexa-floating">
                <input type="text" class="form-nexa-control" id="chartTitle-${modalId}" 
                       value="${
                         chartType.charAt(0).toUpperCase() + chartType.slice(1)
                       } Chart" placeholder=" " required>
                <label for="chartTitle-${modalId}">Chart Title</label>
              </div>
              
              <div class="form-nexa-group">
                <label class="form-nexa-label" for="chartData-${modalId}">Chart Data (CSV Format)</label>
                <textarea class="form-nexa-control" id="chartData-${modalId}" rows="5" 
                          placeholder="Enter data in CSV format...">${sampleData}</textarea>
                <small class="form-text text-muted">
                  First row: Labels, Next rows: Data values. Use comma to separate values.
                </small>
              </div>
              
              <div class="form-nexa-row">
                <div class="form-nx-col-6">
                  <div class="form-nexa-floating">
                    <input type="number" class="form-nexa-control" id="chartWidth-${modalId}" 
                           value="400" min="200" max="1000" placeholder=" ">
                    <label for="chartWidth-${modalId}">Width (px)</label>
                  </div>
                </div>
                <div class="form-nx-col-6">
                  <div class="form-nexa-floating">
                    <input type="number" class="form-nexa-control" id="chartHeight-${modalId}" 
                           value="300" min="150" max="600" placeholder=" ">
                    <label for="chartHeight-${modalId}">Height (px)</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-nx-col-4">
              <div class="form-nexa-group">
                <label class="form-nexa-label">Chart Colors</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                  <input type="color" class="form-nexa-control" value="#FF6384" title="Color 1" style="width: 35px; height: 35px; padding: 2px;">
                  <input type="color" class="form-nexa-control" value="#36A2EB" title="Color 2" style="width: 35px; height: 35px; padding: 2px;">
                  <input type="color" class="form-nexa-control" value="#ffc107" title="Color 3" style="width: 35px; height: 35px; padding: 2px;">
                  <input type="color" class="form-nexa-control" value="#4BC0C0" title="Color 4" style="width: 35px; height: 35px; padding: 2px;">
                  <input type="color" class="form-nexa-control" value="#9966FF" title="Color 5" style="width: 35px; height: 35px; padding: 2px;">
                </div>
              </div>
              
              <div class="form-nexa-group">
                <div class="form-nexa-check">
                  <input type="checkbox" class="form-nexa-check-input" id="showLegend-${modalId}" checked>
                  <label class="form-nexa-check-label" for="showLegend-${modalId}">Show Legend</label>
                </div>
                
                <div class="form-nexa-check">
                  <input type="checkbox" class="form-nexa-check-input" id="enableAnimation-${modalId}" checked>
                  <label class="form-nexa-check-label" for="enableAnimation-${modalId}">Enable Animation</label>
                </div>
                
                <div class="form-nexa-check">
                  <input type="checkbox" class="form-nexa-check-input" id="responsive-${modalId}" checked>
                  <label class="form-nexa-check-label" for="responsive-${modalId}">Responsive</label>
                </div>
              </div>
            </div>
          </div>
          

        </form>
      </div>
    `;

    // Create NexaUI modal
    this.nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "w-800px",
      label: modalTitle,
      onclick: {
        title: "Insert Chart",
        cancel: `cancel`,
        send: `insertChart_${modalId}`,
      },
      content: modalContent,
      footer: `
        <button type="button" class="form-nexa-btn secondary" onclick="if(typeof previewChart_${modalId} === 'function') { previewChart_${modalId}(); } else { console.error('Function previewChart_${modalId} not found!'); }" style="margin-right: 0.5rem;">
          🔍 Preview
        </button>
        <script>
          // Debug script untuk memastikan function ada
          console.log('🔍 Footer script loaded for modal: ${modalId}');
          console.log('🔍 Checking if previewChart_${modalId} exists:', typeof window['previewChart_${modalId}']);
          console.log('🔍 Window keys containing "preview":', Object.keys(window).filter(k => k.includes('preview')));
          
          // Fallback: jika function tidak ditemukan, coba buat ulang
          if (typeof window['previewChart_${modalId}'] !== 'function') {
            console.warn('⚠️ Preview function not found in footer, attempting fallback...');
            // Emergency fallback - cari chartElements instance
            if (window.chartElementsInstance) {
              window['previewChart_${modalId}'] = function() {
                console.log('🔧 Using fallback preview function');
                window.chartElementsInstance.previewChart('${modalId}', '${chartType}');
              };
            }
          }
        </script>
      `,
    });

    console.log(`✅ NexaUI modal created: ${modalId}`);
  }

  /**
   * Setup global callback functions following NexaUI pattern
   */
  setupGlobalCallbacks(modalId, chartType) {
    console.log(`🔧 Setting up global callbacks for modal: ${modalId}`);

    // Store reference to 'this' context for use in global functions
    const self = this;

    // Create function names
    const previewFunctionName = `previewChart_${modalId}`;
    const insertFunctionName = `insertChart_${modalId}`;
    const cancelFunctionName = `cancelChart_${modalId}`;

    console.log(`🏗️ Creating global functions:`, {
      preview: previewFunctionName,
      insert: insertFunctionName,
      cancel: cancelFunctionName,
    });

    // Create global preview function - IMMEDIATELY available
    try {
      window[previewFunctionName] = function () {
        console.log("🔍 Preview button clicked");
        try {
          self.previewChart(modalId, chartType);
        } catch (error) {
          console.error("Error in preview:", error);
        }
      };

      // Test the function immediately
      if (typeof window[previewFunctionName] === "function") {
        console.log(
          `✅ Preview function ${previewFunctionName} created successfully`
        );
      } else {
        console.error(
          `❌ Failed to create preview function ${previewFunctionName}`
        );
      }
    } catch (error) {
      console.error(`❌ Error creating preview function:`, error);
    }

    // Create global insert function for modal onclick.send
    try {
      window[insertFunctionName] = function () {
        console.log("➕ Insert button clicked");
        try {
          self.insertChartFromModal(modalId, chartType);
        } catch (error) {
          console.error("Error in insert:", error);
        }
      };
      console.log(
        `✅ Insert function ${insertFunctionName} created successfully`
      );
    } catch (error) {
      console.error(`❌ Error creating insert function:`, error);
    }

    // Create global cancel function for modal onclick.cancel
    try {
      window[cancelFunctionName] = function () {
        console.log("❌ Cancel button clicked");
        try {
          self.nexaUI.nexaModal.close(modalId);
          self.cleanupGlobalCallbacks(modalId);
        } catch (error) {
          console.error("Error in cancel:", error);
        }
      };
      console.log(
        `✅ Cancel function ${cancelFunctionName} created successfully`
      );
    } catch (error) {
      console.error(`❌ Error creating cancel function:`, error);
    }

    // Final verification - check immediately
    const verificationResults = {
      preview: typeof window[previewFunctionName],
      insert: typeof window[insertFunctionName],
      cancel: typeof window[cancelFunctionName],
    };

    console.log(`✅ Global callbacks setup completed for: ${modalId}`);
    console.log(`🔍 Immediate function verification:`, verificationResults);

    // Force window object refresh (some browsers need this)
    if (typeof window !== "undefined") {
      window[previewFunctionName] = window[previewFunctionName];
    }

    return verificationResults;
  }

  /**
   * Clean up global callback functions
   */
  cleanupGlobalCallbacks(modalId) {
    console.log(`🧹 Cleaning up global callbacks for modal: ${modalId}`);

    // Remove global functions
    if (window[`previewChart_${modalId}`]) {
      delete window[`previewChart_${modalId}`];
    }

    if (window[`insertChart_${modalId}`]) {
      delete window[`insertChart_${modalId}`];
    }

    if (window[`cancelChart_${modalId}`]) {
      delete window[`cancelChart_${modalId}`];
    }

    console.log(`✅ Global callbacks cleaned up for: ${modalId}`);
  }

  /**
   * Preview chart in modal
   */
  previewChart(modalId, chartType) {
    try {
      const config = this.getChartConfigFromModal(modalId, chartType);

      if (!config) {
        console.error("❌ Failed to get chart config for preview");
        return;
      }

      // Create preview area if not exists
      let previewArea = document.getElementById(`preview-${modalId}`);
      if (!previewArea) {
        previewArea = document.createElement("div");
        previewArea.id = `preview-${modalId}`;
        previewArea.innerHTML = `
          <hr>
          <h6 style="margin: 10px 0;">📊 Chart Preview:</h6>
          <div style="max-width: 300px; max-height: 200px; margin: 10px auto; border: 1px solid #ddd; border-radius: 5px; padding: 10px; background: #f9f9f9;">
            <canvas id="previewCanvas-${modalId}"></canvas>
          </div>
        `;

        // Find the modal content area and append preview
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const formElement = modalElement.querySelector(
            `#chartForm-${modalId}`
          );
          if (formElement) {
            formElement.appendChild(previewArea);
          }
        }
      }

      // Create preview chart
      const canvas = document.getElementById(`previewCanvas-${modalId}`);
      if (!canvas) {
        console.error("❌ Preview canvas not found");
        return;
      }

      const ctx = canvas.getContext("2d");

      // Destroy existing chart if any
      if (canvas.chart) {
        canvas.chart.destroy();
      }

      // Create new chart
      canvas.chart = new Chart(ctx, {
        type: chartType,
        data: config.data,
        options: {
          ...config.options,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            ...config.options.plugins,
            legend: {
              display: config.showLegend,
              position: "top",
            },
          },
        },
      });

      console.log("✅ Chart preview created successfully");
    } catch (error) {
      console.error("❌ Error in previewChart:", error);
    }
  }

  /**
   * Insert chart from modal form
   */
  insertChartFromModal(modalId, chartType) {
    try {
      console.log(`📊 Inserting chart from modal: ${chartType}`);
      const config = this.getChartConfigFromModal(modalId, chartType);

      if (!config) {
        console.error("❌ Failed to get chart config from modal");
        return;
      }

      console.log("✅ Chart config retrieved:", config);

      // Close the NexaUI modal
      this.nexaUI.nexaModal.close(modalId);
      console.log("🚪 NexaUI Modal closed");

      // Clean up global functions
      this.cleanupGlobalCallbacks(modalId);
      console.log("🧹 Global callbacks cleaned up");

      // Create and insert the chart
      console.log("🎨 Creating and inserting chart...");
      this.createAndInsertChart(chartType, config);
    } catch (error) {
      console.error("❌ Error in insertChartFromModal:", error);
    }
  }

  /**
   * Get chart configuration from modal form
   */
  getChartConfigFromModal(modalId, chartType = "bar") {
    try {
      const titleInput = document.getElementById(`chartTitle-${modalId}`);
      const dataInput = document.getElementById(`chartData-${modalId}`);
      const widthInput = document.getElementById(`chartWidth-${modalId}`);
      const heightInput = document.getElementById(`chartHeight-${modalId}`);
      const legendCheckbox = document.getElementById(`showLegend-${modalId}`);
      const animationCheckbox = document.getElementById(
        `enableAnimation-${modalId}`
      );
      const responsiveCheckbox = document.getElementById(
        `responsive-${modalId}`
      );

      const title = titleInput ? titleInput.value.trim() : "";
      const csvData = dataInput ? dataInput.value.trim() : "";
      const width = widthInput ? parseInt(widthInput.value) : 400;
      const height = heightInput ? parseInt(heightInput.value) : 300;
      const showLegend = legendCheckbox ? legendCheckbox.checked : true;
      const enableAnimation = animationCheckbox
        ? animationCheckbox.checked
        : true;
      const responsive = responsiveCheckbox ? responsiveCheckbox.checked : true;

      if (!csvData) {
        throw new Error("Chart data is required");
      }

      // Parse CSV data
      const lines = csvData.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        throw new Error(
          "At least 2 rows of data are required (labels + values)"
        );
      }

      // Get colors from color inputs
      const colorInputs = document.querySelectorAll(
        `#${modalId} input[type="color"]`
      );
      const colors = Array.from(colorInputs).map((input) => input.value);

      // Define default colors untuk setiap kategori
      const defaultColors = [
        "#FF6384", // Color 1 - Merah
        "#36A2EB", // Color 2 - Biru
        "#ffc107", // Color 3 - Warning yellow
        "#4BC0C0", // Color 4 - Teal
        "#9966FF", // Color 5 - Purple
        "#FF9F40",
        "#C9CBCF",
        "#FF99CC",
        "#66FF66",
        "#FFB366",
      ];

      let labels, datasets;

      // Logika berbeda untuk pie/doughnut vs bar/line chart
      if (chartType === "pie" || chartType === "doughnut") {
        // Untuk pie/doughnut: header = labels, single data row
        labels = lines[0].split(",").map((label) => label.trim());

        if (lines.length < 2) {
          throw new Error("Pie/Doughnut chart requires labels and data values");
        }

        const values = lines[1]
          .split(",")
          .map((val) => parseFloat(val.trim()) || 0);

        // Generate colors untuk setiap slice
        const backgroundColors = [];
        for (let i = 0; i < labels.length; i++) {
          const sliceColor =
            colors.length > i && colors[i]
              ? colors[i]
              : defaultColors[i % defaultColors.length];
          backgroundColors.push(sliceColor);
        }

        datasets = [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1,
          },
        ];
      } else if (chartType === "radar") {
        // Untuk radar chart: header = axes, setiap baris = dataset
        labels = lines[0].split(",").map((label) => label.trim()); // Speed, Quality, Price, Support

        // Parse data rows - setiap baris adalah satu dataset
        datasets = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((val) => parseFloat(val.trim()) || 0);

          // Tentukan warna untuk dataset ini
          const datasetColor =
            colors.length > i - 1 && colors[i - 1]
              ? colors[i - 1]
              : defaultColors[(i - 1) % defaultColors.length];

          datasets.push({
            label: `Dataset ${i}`, // Dataset 1, Dataset 2, dst
            data: values,
            backgroundColor: datasetColor + "40", // Semi-transparent for radar
            borderColor: datasetColor,
            pointBackgroundColor: datasetColor,
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: datasetColor,
            borderWidth: 2,
          });
        }
      } else {
        // Untuk bar/line: header = categories, multiple data rows
        const categories = lines[0].split(",").map((label) => label.trim());

        // Parse data rows
        const dataRows = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((val) => parseFloat(val.trim()) || 0);
          dataRows.push(values);
        }

        // Generate labels untuk sumbu X (Data Point 1, 2, 3, dst)
        labels = dataRows.map((_, index) => `Data Point ${index + 1}`);

        // Create datasets - satu untuk setiap kategori (Sales, Revenue, Profit)
        datasets = [];

        for (
          let categoryIndex = 0;
          categoryIndex < categories.length;
          categoryIndex++
        ) {
          const categoryName = categories[categoryIndex];

          // Ambil data untuk kategori ini dari semua baris
          const categoryData = dataRows.map((row) => row[categoryIndex] || 0);

          // Tentukan warna untuk kategori ini
          const categoryColor =
            colors.length > categoryIndex && colors[categoryIndex]
              ? colors[categoryIndex]
              : defaultColors[categoryIndex % defaultColors.length];

          datasets.push({
            label: categoryName, // Gunakan nama kategori (Sales, Revenue, Profit)
            data: categoryData,
            backgroundColor: categoryColor,
            borderColor: categoryColor,
            borderWidth: 1,
          });
        }
      }

      return {
        title,
        width,
        height,
        showLegend,
        enableAnimation,
        responsive,
        data: {
          labels,
          datasets,
        },
        options: {
          responsive,
          animation: enableAnimation,
          plugins: {
            title: {
              display: !!title,
              text: title,
            },
            legend: {
              display: showLegend,
            },
          },
        },
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Create and insert chart element
   */
  createAndInsertChart(chartType, config) {
    try {
      console.log(`🏗️ Creating chart container for: ${chartType}`);
      console.log("📐 Chart config:", config);

      // Create chart container
      const container = document.createElement("div");
      container.className = "nexa-chart-container";
      container.style.cssText = `
        position: relative;
        width: ${config.width}px;
        height: ${config.height}px;
        margin: 1rem auto;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        background: white;
      `;
      console.log("📦 Chart container created");

      // Create canvas element
      const canvas = document.createElement("canvas");
      canvas.style.cssText = `
        width: 100%;
        height: 100%;
      `;

      container.appendChild(canvas);
      console.log("🖼️ Canvas element created and added to container");

      // Insert container into target element
      console.log("🎯 Inserting chart at position...");
      this.insertChartAtPosition(container);

      // Initialize Chart.js
      console.log("⚡ Initializing Chart.js...");
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx, {
        type: chartType,
        data: config.data,
        options: config.options,
      });

      console.log("✅ Chart successfully created:", chart);

      const displayName = `${
        chartType.charAt(0).toUpperCase() + chartType.slice(1)
      } Chart`;

      console.log(`🎉 ${displayName} insertion completed!`);
      return { success: true, message: `${displayName} inserted` };
    } catch (error) {
      console.error("❌ Error in createAndInsertChart:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Insert chart element at appropriate position in target element
   */
  insertChartAtPosition(element) {
    try {
      // Get target element from interactions
      const targetElement = this.interactions.targetElement;

      if (!targetElement) {
        console.warn("No target element available for chart insertion");
        // Fallback: append to body
        document.body.appendChild(element);
        return;
      }

      // Simple insertion logic: append to target element
      targetElement.appendChild(element);

      // Scroll into view if needed
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    } catch (error) {
      console.error("Error inserting chart:", error);
      // Ultimate fallback: append to body
      document.body.appendChild(element);
    }
  }

  /**
   * Handle chart action cases
   */
  handleChartActions(actionType) {
    switch (actionType) {
      case "chartElements":
        // Parent menu item - submenu handles the actual actions
        break;
      case "insertBarChart":
        this.contextInsertChart("bar");
        break;
      case "insertLineChart":
        this.contextInsertChart("line");
        break;
      case "insertPieChart":
        this.contextInsertChart("pie");
        break;
      case "insertDoughnutChart":
        this.contextInsertChart("doughnut");
        break;
      case "insertRadarChart":
        this.contextInsertChart("radar");
        break;
      default:
        return false;
    }
    return true;
  }

  /**
   * Generate chart HTML directly from data (without modal)
   * @param {Array} data - Array of objects with {title, total} structure
   * @param {string} chartType - Type of chart: 'bar', 'pie', 'doughnut', 'line'
   * @param {Object} options - Chart options {width, height, title, showLegend}
   * @returns {string} HTML string with chart container and initialization script
   */
  static generateChartHTML(data, chartType = 'bar', options = {}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return '<div class="alert alert-warning">No data available for chart</div>';
    }

    // Default options
    const defaultOptions = {
      width: 800,
      height: 400,
      title: '',
      showLegend: true,
      responsive: true,
      ...options
    };

    // Generate unique ID for this chart
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Default colors
    const defaultColors = [
      "#FF6384", "#36A2EB", "#ffc107", "#4BC0C0", "#9966FF",
      "#FF9F40", "#C9CBCF", "#FF99CC", "#66FF66", "#FFB366",
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
      "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52BE80"
    ];

    // Prepare chart data
    const labels = data.map(item => item.title);
    const values = data.map(item => item.total || 0);
    
    // Generate colors
    const backgroundColors = labels.map((_, index) => 
      defaultColors[index % defaultColors.length]
    );

    // Prepare datasets based on chart type
    let datasets;
    if (chartType === 'pie' || chartType === 'doughnut') {
      datasets = [{
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }];
    } else {
      datasets = [{
        label: 'Total',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }];
    }

    // Chart configuration
    const chartConfig = {
      type: chartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: defaultOptions.responsive,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!defaultOptions.title,
            text: defaultOptions.title
          },
          legend: {
            display: defaultOptions.showLegend,
            position: chartType === 'pie' || chartType === 'doughnut' ? 'right' : 'top'
          }
        },
        scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
          y: {
            beginAtZero: true
          }
        } : undefined
      }
    };

    // Escape config for use in data attribute
    const configJSON = JSON.stringify(chartConfig).replace(/"/g, '&quot;');

    // Generate HTML with data attribute
    const html = `
      <div class="nexa-chart-container" id="chart-container-${chartId}" 
           data-chart-config='${configJSON}'
           style="position: relative; width: ${defaultOptions.width}px; height: ${defaultOptions.height}px; 
                  margin: 1rem auto; padding: 15px; border-radius: 8px; 
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1); background: white;">
        <canvas id="chart-canvas-${chartId}"></canvas>
      </div>
    `;

    return html;
  }

  /**
   * Initialize all charts in the DOM
   * Call this function after HTML is rendered
   */
  static initializeCharts() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js library not loaded');
      return;
    }

    const chartContainers = document.querySelectorAll('.nexa-chart-container[data-chart-config]');
    
    chartContainers.forEach(container => {
      try {
        const canvas = container.querySelector('canvas');
        if (!canvas) {
          console.error('Canvas not found in chart container');
          return;
        }

        // Skip if chart already initialized
        if (canvas.chart) {
          return;
        }

        // Get chart config from data attribute
        const configJSON = container.getAttribute('data-chart-config');
        if (!configJSON) {
          console.error('Chart config not found in data attribute');
          return;
        }

        // Parse config
        const chartConfig = JSON.parse(configJSON.replace(/&quot;/g, '"'));

        // Initialize chart
        const ctx = canvas.getContext('2d');
        canvas.chart = new Chart(ctx, chartConfig);
        
        console.log('✅ Chart initialized:', canvas.id);
      } catch (error) {
        console.error('❌ Error initializing chart:', error);
      }
    });
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = chartElements;
} else if (typeof window !== "undefined") {
  window.chartElements = chartElements;
}

