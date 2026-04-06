import { NexaType } from "./NexaType.js";
export function getIconByType(type, customIcon = null) {
  // Jika ada custom icon dan bukan "attach_file", gunakan custom icon tersebut
  if (customIcon && customIcon !== "attach_file") return customIcon;

  // Mapping tipe field ke Material Icons
  const iconMap = {
    text: "edit_note", // Icon untuk field text biasa
    hidden: "visibility_off", // Icon untuk field hidden
    email: "email", // Icon untuk field email
    password: "lock", // Icon untuk field password
    number: "numbers", // Icon untuk field number
    tel: "phone", // Icon untuk field telepon
    url: "link", // Icon untuk field URL
    search: "search", // Icon untuk field search
    date: "calendar_today", // Icon untuk field date
    "datetime-local": "schedule", // Icon untuk field datetime-local
    time: "access_time", // Icon untuk field time
    textarea: "description", // Icon untuk field textarea
    select: "event_list", // Icon untuk field select
    radio: "radio_button_checked", // Icon untuk field radio
    checkbox: "check_box", // Icon untuk field checkbox
    switch: "split_scene_right", // Icon untuk field switch
    file: "attach_file", // Icon untuk field file
    range: "tune", // Icon untuk field range
    color: "palette", // Icon untuk field color
    flag: "flag", // Icon untuk field flag
    currency: "attach_money", // Icon untuk field currency
  };

  // Kembalikan icon sesuai tipe, atau icon default jika tipe tidak ditemukan
  return iconMap[type] || "help_outline";
}
class recordInline {
  constructor(options = {}) {
    this.config = {
      autoSave: true,
      saveDelay: 500, // Default delay for text/select inputs
      checkboxSaveDelay: 1500, // Longer delay for checkbox inputs to allow multiple selections
      ...options,
    };

    // Track currently editing cells to prevent conflicts
    this.editingCells = new Set();

    // Initialize global function
    this.initGlobalFunction();
  }

  /**
   * Initialize global nexaInlineEdit function
   */
  initGlobalFunction() {
    // Use different function name for STANDALONE tables to avoid conflict with Join
    window.nexaStandaloneInlineEdit = (
      cellElement,
      tableId,
      fieldKey,
      recordId,
      dataIndex
    ) => {
      this.startEdit(cellElement, tableId, fieldKey, recordId, dataIndex);
    };

    // Also create the main nexaInlineEdit function for backward compatibility
    window.nexaInlineEdit = (
      cellElement,
      tableId,
      fieldKey,
      recordId,
      dataIndex
    ) => {
      this.startEdit(cellElement, tableId, fieldKey, recordId, dataIndex);
    };

    // 🔧 NEW: Create router function for Standalone tables
    if (!window.nexaInlineEditRouter) {
      window.nexaInlineEditRouter = (
        cellElement,
        tableId,
        fieldKey,
        recordId,
        dataIndex
      ) => {
        // Check if this is a JOIN table by looking for joinTableConfigs
        if (window.nexaJoinTableConfigs?.[tableId]) {
          // Use JOIN inline edit
          if (window.nexaJoinInlineEdit) {
            window.nexaJoinInlineEdit(
              cellElement,
              tableId,
              fieldKey,
              recordId,
              dataIndex
            );
          }
        } else if (window.nexaTableConfigs?.[tableId]) {
          // Use Standalone inline edit
          if (window.nexaInlineEdit) {
            window.nexaInlineEdit(
              cellElement,
              tableId,
              fieldKey,
              recordId,
              dataIndex
            );
          }
        } else {
          console.warn(
            `⚠️ No table configuration found for tableId: ${tableId}`
          );
        }
      };
    }
  }

  /**
   * Start inline editing for a specific cell
   */
  startEdit(cellElement, tableId, fieldKey, recordId, dataIndex) {
    try {
      const config = window.nexaTableConfigs?.[tableId];
      if (!config) {
        console.error("❌ No table configuration found for tableId:", tableId);
        return;
      }

      // 🔧 NEW: Use new form structure
      const dataform = config.dataform || config.configFrom || null;
      if (!dataform) {
        console.error("❌ No dataform available for inline edit");
        return;
      }

      if (!dataform.form[fieldKey].inline) {
        return;
      }

      // 🔧 NEW: Access form configuration from new structure
      const formConfig = dataform.form || {};
      const formSettings = dataform.settings || {};

      if (!formConfig[fieldKey]) {
        console.error(
          `❌ No form configuration found for field: ${fieldKey} or inline not enabled`
        );
        console.error("Available fields:", Object.keys(formConfig));
        return;
      }

      // Check if cell is already being edited
      const cellKey = `${tableId}-${recordId}-${fieldKey}`;
      if (this.editingCells.has(cellKey)) {
        return;
      }

      // Prevent multiple edits on same cell element
      if (
        cellElement.querySelector(
          "input, select, div[style*='border: 2px solid #007bff']"
        )
      ) {
        return;
      }

      // Mark cell as being edited FIRST to prevent race conditions
      this.editingCells.add(cellKey);

      // Get original data value, not textContent which may be HTML preview
      let currentValue = cellElement.textContent.trim();

      // 🔧 NEW: Get field type from new form structure
      const fieldConfig = formConfig[fieldKey];
      const fieldType = fieldConfig.type || "text";
      // For file type, get original data value instead of textContent
      if (fieldType === "file") {
        const originalDataIndex = config.data?.findIndex(
          (item) => item.id == recordId
        );
        if (originalDataIndex >= 0 && config.data[originalDataIndex]) {
          currentValue =
            config.data[originalDataIndex][fieldKey] || currentValue;
        }
      }

      // 🔧 NEW: Get field options from new structure (if available)
      // Support multiple ways field options might be stored
      let fieldOptions = [];
      if (fieldConfig.options && Array.isArray(fieldConfig.options)) {
        // Transform options from {id, text, value} to {label, value} format
        fieldOptions = fieldConfig.options.map((option) => ({
          label: option.text || option.label || option.value,
          value: option.value || option.id,
          id: option.id,
        }));
      } else if (fieldConfig.select && Array.isArray(fieldConfig.select)) {
        fieldOptions = fieldConfig.select;
      } else if (
        fieldConfig.select &&
        fieldConfig.select.data &&
        Array.isArray(fieldConfig.select.data)
      ) {
        // Handle nested select structure: select.data array
        fieldOptions = fieldConfig.select.data;
      } else if (fieldConfig.choices && Array.isArray(fieldConfig.choices)) {
        fieldOptions = fieldConfig.choices;
      }

      // If no options found but field type suggests it needs options, create defaults
      if (
        fieldOptions.length === 0 &&
        (fieldType === "select" ||
          fieldType === "radio" ||
          fieldType === "checkbox")
      ) {
        // Will be handled in createInputElement with appropriate defaults
      }

      // 🔧 NEW: Get validation from new structure
      // validation: "1" = not required, "2" = required
      const isRequired =
        fieldConfig.validation === "2" || fieldConfig.validation === 2;

      // Store original value, styling, and field metadata for proper restoration
      cellElement.setAttribute("data-original-value", currentValue);
      cellElement.setAttribute(
        "data-original-style",
        cellElement.style.cssText
      );
      cellElement.setAttribute("data-field-type", fieldType);
      cellElement.setAttribute("data-field-key", fieldKey);

      // For file fields, also store the original HTML to restore properly
      if (fieldType === "file") {
        cellElement.setAttribute("data-original-html", cellElement.innerHTML);
      }

      // Create input element based on field type
      const inputElement = this.createInputElement(
        fieldType,
        currentValue,
        fieldOptions,
        isRequired,
        fieldConfig,
        cellElement
      );

      // Replace cell content with input
      cellElement.innerHTML = "";
      cellElement.appendChild(inputElement.container);

      // Apply edit styling
      this.applyEditStyling(cellElement);

      // Focus and select content
      this.focusInput(inputElement.input);

      // Setup event handlers
      this.setupEventHandlers(
        inputElement.input,
        cellElement,
        tableId,
        fieldKey,
        recordId,
        dataIndex,
        fieldType,
        cellKey
      );
    } catch (error) {
      console.error("❌ Error in startEdit:", error);
    }
  }

  /**
   * Create appropriate input element based on field type
   */
  createInputElement(
    fieldType,
    currentValue,
    fieldOptions,
    isRequired,
    fieldConfig = {},
    cellElement = null
  ) {
    const container = document.createElement("div");
    container.style.cssText = "width: 100%; position: relative;";

    let input;
    let checkboxContainer; // Declare outside switch for scope access
    let finalInput; // The actual input element to return

    // 🔧 NEW: Add icon support
    const hasIcon = fieldConfig.icons && fieldConfig.icons.trim() !== "";
    const iconPadding = hasIcon ? "padding-left: 35px;" : "";

    const commonInputStyle = `
      width: 100%; 
      border: 2px solid #007bff; 
      border-radius: 4px; 
      padding: 6px 8px; 
      ${iconPadding}
      font-size: 14px; 
      font-family: inherit;
      outline: none;
      background: #fff;
      box-shadow: 0 0 5px rgba(0,123,255,0.3);
    `;

    // Create icon element if specified
    let iconElement = null;
    if (hasIcon) {
      iconElement = document.createElement("i");
      iconElement.className = "material-icons";
      iconElement.textContent = getIconByType(fieldType, fieldConfig.icons);
      iconElement.style.cssText = `
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: #007bff;
        pointer-events: none;
        z-index: 1;
      `;
    }

    // Helper function to add input with icon
    const addInputWithIcon = (inputElement) => {
      container.appendChild(inputElement);
      if (iconElement) container.appendChild(iconElement);
    };

    switch (fieldType) {
      case "text":
        input = document.createElement("input");
        input.type = "text";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        if (fieldConfig.placeholder)
          input.placeholder = fieldConfig.placeholder;
        addInputWithIcon(input);
        finalInput = input;
        break;

      case "email":
        input = document.createElement("input");
        input.type = "email";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        if (fieldConfig.placeholder)
          input.placeholder = fieldConfig.placeholder;
        addInputWithIcon(input);
        finalInput = input;
        break;

      case "password":
        input = document.createElement("input");
        input.type = "password";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        if (fieldConfig.placeholder)
          input.placeholder = fieldConfig.placeholder;
        addInputWithIcon(input);
        finalInput = input;
        break;
      case "number":
        input = document.createElement("input");
        input.type = "number";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;

        // 🔧 NEW: Add number-specific attributes from field config
        if (fieldConfig.min !== undefined) input.min = fieldConfig.min;
        if (fieldConfig.max !== undefined) input.max = fieldConfig.max;
        if (fieldConfig.step !== undefined) input.step = fieldConfig.step;

        // Add placeholder if available
        if (fieldConfig.placeholder) {
          input.placeholder = fieldConfig.placeholder;
        }

        addInputWithIcon(input);
        finalInput = input;
        break;
      case "currency":
        input = document.createElement("input");
        input.type = "number";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        // 🔧 NEW: Add number-specific attributes from field config
        if (fieldConfig.min !== undefined) input.min = fieldConfig.min;
        if (fieldConfig.max !== undefined) input.max = fieldConfig.max;
        if (fieldConfig.step !== undefined) input.step = fieldConfig.step;
        // Add placeholder if available
        if (fieldConfig.placeholder) {
          input.placeholder = fieldConfig.placeholder;
        }
        addInputWithIcon(input);
        finalInput = input;
        break;

      case "tel":
        input = document.createElement("input");
        input.type = "tel";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        if (fieldConfig.placeholder)
          input.placeholder = fieldConfig.placeholder;
        addInputWithIcon(input);
        finalInput = input;
        break;

      case "url":
        input = document.createElement("input");
        input.type = "url";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        if (fieldConfig.placeholder)
          input.placeholder = fieldConfig.placeholder;
        addInputWithIcon(input);
        finalInput = input;
        break;

      case "date":
        input = document.createElement("input");
        input.type = "date";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        container.appendChild(input);
        finalInput = input;
        break;

      case "datetime-local":
        input = document.createElement("input");
        input.type = "datetime-local";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        container.appendChild(input);
        finalInput = input;
        break;

      case "time":
        input = document.createElement("input");
        input.type = "time";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        container.appendChild(input);
        finalInput = input;
        break;

      case "month":
        input = document.createElement("input");
        input.type = "month";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        container.appendChild(input);
        finalInput = input;
        break;

      case "week":
        input = document.createElement("input");
        input.type = "week";
        input.value = currentValue;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        container.appendChild(input);
        finalInput = input;
        break;

      case "color":
        input = document.createElement("input");
        input.type = "color";
        input.value = currentValue || "#000000";
        input.style.cssText = `
          width: 100%; 
          height: 40px;
          border: 2px solid #007bff; 
          border-radius: 4px; 
          padding: 2px; 
          font-family: inherit;
          outline: none;
          background: #fff;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
          cursor: pointer;
        `;
        container.appendChild(input);
        finalInput = input;
        break;

      case "range":
        input = document.createElement("input");
        input.type = "range";
        input.value = currentValue || "50";
        input.style.cssText = `
          width: 100%; 
          height: 40px;
          border: 2px solid #007bff; 
          border-radius: 4px; 
          padding: 4px; 
          outline: none;
          background: #fff;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
        `;

        // 🔧 NEW: Add range-specific attributes from field config
        if (fieldConfig.min !== undefined) input.min = fieldConfig.min;
        if (fieldConfig.max !== undefined) input.max = fieldConfig.max;
        if (fieldConfig.step !== undefined) input.step = fieldConfig.step;

        // Create value display
        const valueDisplay = document.createElement("div");
        valueDisplay.style.cssText = `
          position: absolute;
          top: -25px;
          right: 0;
          background: #007bff;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        `;
        valueDisplay.textContent = input.value;

        // Update display on input
        input.addEventListener("input", (e) => {
          valueDisplay.textContent = e.target.value;
        });

        container.appendChild(input);
        container.appendChild(valueDisplay);
        finalInput = input;
        break;

      case "textarea":
        input = document.createElement("textarea");
        input.value = currentValue;
        input.style.cssText = `
          ${commonInputStyle}
          resize: vertical;
          min-height: 80px;
        `;
        if (isRequired) input.required = true;
        if (fieldConfig.placeholder)
          input.placeholder = fieldConfig.placeholder;

        // 🔧 NEW: Add textarea-specific attributes from field config
        if (fieldConfig.rows) input.rows = fieldConfig.rows;
        if (fieldConfig.cols) input.cols = fieldConfig.cols;

        addInputWithIcon(input);
        finalInput = input;
        break;

      case "search":
        input = document.createElement("input");
        input.type = "search";
        input.value = currentValue;
        input.id = fieldConfig.failed;
        input.style.cssText = commonInputStyle;
        if (isRequired) input.required = true;
        if (fieldConfig.placeholder)
          input.placeholder = fieldConfig.placeholder;
        addInputWithIcon(input);

        // Add suggestions dropdown container
        const suggestionsDiv = document.createElement("div");
        suggestionsDiv.id = `suggestions_${fieldConfig.failed}`;
        suggestionsDiv.className = "nexa-suggestions-dropdown";
        container.appendChild(suggestionsDiv);

        finalInput = input;
        console.log(fieldConfig);

        setTimeout(async () => {
          await this.contentSearchInput(fieldConfig, fieldConfig.failed);
        }, 0);
        break;
      case "hidden":
        input = document.createElement("input");
        input.type = "hidden";
        input.value = currentValue;
        container.appendChild(input);
        finalInput = input;
        break;

      case "file":
        const fileContainer = document.createElement("div");
        fileContainer.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 2px solid #007bff;
          border-radius: 4px;
          background: #fff;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
          min-height: 60px;
        `;

        // File preview area
        const previewArea = document.createElement("div");
        previewArea.id = `file-preview-area-${Date.now()}`;
        previewArea.style.cssText = `
          width: 50px;
          height: 50px;
          border: 1px solid #ddd;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          cursor: pointer;
          overflow: hidden;
        `;

        // NexaType will populate previewArea directly - no need for manual elements

        // File input (hidden)
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.style.display = "none";
        fileInput.id = `file_inline_${Date.now()}`;

        // File info area
        const fileInfo = document.createElement("div");
        fileInfo.style.cssText = `
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        `;

        const fileTitle = document.createElement("div");
        fileTitle.style.cssText = `
          font-weight: bold;
          font-size: 14px;
          color: #333;
        `;
        fileTitle.textContent = "📁 Select File";

        const fileName = document.createElement("div");
        fileName.style.cssText = `
          font-size: 12px;
          color: #666;
        `;
        fileName.textContent = currentValue || "No file selected";

        const fileSize = document.createElement("div");
        fileSize.style.cssText = `
          font-size: 11px;
          color: #888;
        `;

        fileInfo.appendChild(fileTitle);
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);

        // Change button
        const changeBtn = document.createElement("button");
        changeBtn.type = "button";
        changeBtn.style.cssText = `
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        `;
        changeBtn.textContent = "Browse";

        fileContainer.appendChild(previewArea);
        fileContainer.appendChild(fileInput);
        fileContainer.appendChild(fileInfo);
        fileContainer.appendChild(changeBtn);

        // IMPORTANT: Add fileContainer to container first so previewArea exists in DOM
        container.appendChild(fileContainer);

        // File handling logic
        const handleFileSelect = (file) => {
          if (!file) return;

          fileName.textContent = this.truncateFileName(file.name);
          fileName.title = file.name; // Tooltip with full filename
          fileSize.textContent = this.formatFileSize(file.size);

          // Handle file preview using NexaType for consistency
          if (file.type.startsWith("image/")) {
            // For new image files, show base64 preview
            const reader = new FileReader();
            reader.onload = (e) => {
              previewArea.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;" alt="Preview">`;
            };
            reader.readAsDataURL(file);
          } else {
            // For new document files, use NexaType - SAME PATTERN as existing files
            const tempDiv = document.createElement("div");
            tempDiv.id = `temp-new-file-${Date.now()}`;
            document.body.appendChild(tempDiv);

            try {
              const result = NexaType(file.name, `#${tempDiv.id}`);

              if (result && tempDiv.innerHTML.trim()) {
                // SUCCESS - copy HTML from tempDiv to previewArea
                previewArea.innerHTML = tempDiv.innerHTML;
              } else {
                // FALLBACK
                previewArea.innerHTML =
                  '<i class="fas fa-file" style="font-size: 40px; color: #666; display: flex; align-items: center; justify-content: center; height: 50px; width: 50px;"></i>';
              }
            } catch (error) {
              console.error("❌ [NexaInline] New file NexaType error:", error);
              previewArea.innerHTML =
                '<i class="fas fa-file" style="font-size: 40px; color: #666; display: flex; align-items: center; justify-content: center; height: 50px; width: 50px;"></i>';
            } finally {
              document.body.removeChild(tempDiv);
            }
          }
        };

        // Event listeners
        changeBtn.addEventListener("click", () => fileInput.click());
        previewArea.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          handleFileSelect(file);
        });

        // Set current file if exists
        if (currentValue) {
          const fullFileName = currentValue.split("/").pop() || currentValue;
          fileName.textContent = this.truncateFileName(fullFileName);
          fileName.title = fullFileName; // Tooltip with full filename

          // Use SAME PATTERN as @NexaTabel.js - temporary div + innerHTML
          const tempDiv = document.createElement("div");
          tempDiv.id = `temp-inline-preview-${Date.now()}`;
          document.body.appendChild(tempDiv);

          try {
            const result = NexaType(currentValue, `#${tempDiv.id}`);

            if (result && tempDiv.innerHTML.trim()) {
              // SUCCESS - copy HTML from tempDiv to previewArea
              previewArea.innerHTML = tempDiv.innerHTML;
            } else {
              // FALLBACK
              previewArea.innerHTML =
                '<i class="fas fa-file" style="font-size: 40px; color: #666; display: flex; align-items: center; justify-content: center; height: 50px; width: 50px;"></i>';
            }
          } catch (error) {
            console.error("❌ [NexaInline] NexaType error:", error);
            previewArea.innerHTML =
              '<i class="fas fa-file" style="font-size: 40px; color: #666; display: flex; align-items: center; justify-content: center; height: 50px; width: 50px;"></i>';
          } finally {
            // Clean up temporary element
            document.body.removeChild(tempDiv);
          }
        }

        input = fileContainer;
        finalInput = fileInput; // The actual file input for value extraction
        // container.appendChild(fileContainer); // Already added above
        break;

      case "select":
        input = document.createElement("select");
        input.style.cssText = commonInputStyle;
        input.id = fieldConfig.name + `select_${Date.now()}`;
        input.className = "nexa-inline-select"; // Add class for easy identification

        // Add empty option if not required
        if (!isRequired) {
          const emptyOption = document.createElement("option");
          emptyOption.value = "";
          emptyOption.textContent = "-- Select --";
          input.appendChild(emptyOption);
        }

        // Add field options
        if (fieldOptions && fieldOptions.length > 0) {
          fieldOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === currentValue) {
              optionElement.selected = true;
            }
            input.appendChild(optionElement);
          });
        } else {
          // Add a default option to indicate no options available
          const noOptionsElement = document.createElement("option");
          noOptionsElement.value = "";
          noOptionsElement.textContent = "No options available";
          noOptionsElement.disabled = true;
          input.appendChild(noOptionsElement);
        }

        if (isRequired) input.required = true;
        container.appendChild(input);

        // Initialize Select2 after element is added to DOM
        setTimeout(() => {
          if (NXUI && NXUI.initSelect2) {
            const select2Options = {
              placeholder: fieldConfig.placeholder || "Pilih opsi...",
              searchInputPlaceholder: "Cari opsi...",
              allowClear: !isRequired,
              width: "100%",
            };
            // Initialize Select2 for this specific select element
            NXUI.initSelect2(`#${input.id}`, select2Options);

            // Handle icon support for inline editing
            const select2Container = input.nextElementSibling;
            if (
              select2Container &&
              select2Container.classList.contains("select2-container")
            ) {
              select2Container.classList.add("nexa-select2-container");

              // Check if there's an icon in the cell (only if cellElement is available)
              if (cellElement) {
                const iconElement = cellElement.querySelector(
                  "i, .material-symbols-outlined"
                );
                if (iconElement) {
                  const iconContent =
                    iconElement.textContent ||
                    iconElement.getAttribute("data-icon");
                  if (iconContent) {
                    select2Container.setAttribute("data-icon", iconContent);
                    select2Container.classList.add("has-icon");
                  }
                }
              }
            }
          }
        }, 10); // Small delay to ensure DOM is ready

        finalInput = input;
        break;

      case "checkbox":
        checkboxContainer = document.createElement("div"); // Use existing declaration
        checkboxContainer.style.cssText = `
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px; 
          align-items: center;
          padding: 4px;
          border: 2px solid #007bff;
          border-radius: 4px;
          background: #fff;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
        `;

        const isCurrentChecked = this.parseCheckboxValue(currentValue);

        // Ensure we have options to display
        if (!fieldOptions || fieldOptions.length === 0) {
          // Create a default option based on current value if no options provided
          if (currentValue && currentValue !== "-" && currentValue !== "null") {
            fieldOptions = [{ value: currentValue, label: currentValue }];
          } else {
            fieldOptions = [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ];
          }
        }

        fieldOptions.forEach((option, index) => {
          const label = document.createElement("label");
          label.style.cssText = `
            display: flex; 
            align-items: center; 
            gap: 4px; 
            font-size: 13px; 
            cursor: pointer;
            white-space: nowrap;
            margin-right: 8px;
          `;

          // Add tooltip for first checkbox to explain multiple selection
          if (index === 0) {
            label.title =
              "💡 Multiple selections allowed - Press Enter to save";
          }

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.value = option.value;
          checkbox.name = `checkbox_${fieldType}_${index}`;

          // Improved checked state logic for dynamic data
          let isChecked = false;
          if (Array.isArray(isCurrentChecked)) {
            isChecked = isCurrentChecked.includes(option.value);
          } else if (typeof isCurrentChecked === "boolean") {
            // If it's a boolean, check the first option for true
            isChecked = isCurrentChecked && index === 0;
          } else {
            // String comparison
            isChecked =
              option.value === currentValue ||
              option.value === isCurrentChecked ||
              (currentValue === "1" && option.value === "yes") ||
              (currentValue === "checked" && option.value === "yes") ||
              (currentValue === "true" && option.value === "yes");
          }

          checkbox.checked = isChecked;

          const span = document.createElement("span");
          span.textContent = option.label || option.value; // Fallback to value if no label

          label.appendChild(checkbox);
          label.appendChild(span);
          checkboxContainer.appendChild(label);
        });

        // Add instruction text at bottom of checkbox group
        const instructionText = document.createElement("div");
        instructionText.style.cssText = `
          font-size: 11px;
          color: #6c757d;
          margin-top: 4px;
          font-style: italic;
        `;
        instructionText.textContent =
          "💡 Select multiple • Enter = Save • Esc = Cancel";
        checkboxContainer.appendChild(instructionText);

        input = checkboxContainer; // For event handling reference
        finalInput = checkboxContainer; // Set final input reference for checkbox
        container.appendChild(checkboxContainer);
        break;

      case "radio":
        const radioContainer = document.createElement("div");
        radioContainer.style.cssText = `
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px; 
          align-items: center;
          padding: 4px;
          border: 2px solid #007bff;
          border-radius: 4px;
          background: #fff;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
        `;

        if (!fieldOptions || fieldOptions.length === 0) {
          console.warn(`⚠️ No radio options available for field`);
          fieldOptions = [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ];
        }

        fieldOptions.forEach((option, index) => {
          const label = document.createElement("label");
          label.style.cssText = `
            display: flex; 
            align-items: center; 
            gap: 4px; 
            font-size: 13px; 
            cursor: pointer;
            white-space: nowrap;
            margin-right: 8px;
          `;

          const radio = document.createElement("input");
          radio.type = "radio";
          radio.value = option.value;
          radio.name = `radio_inline_${Date.now()}`; // Unique name for inline editing
          radio.checked = option.value === currentValue;

          const span = document.createElement("span");
          span.textContent = option.label || option.value;

          label.appendChild(radio);
          label.appendChild(span);
          radioContainer.appendChild(label);
        });

        // Add instruction text
        const radioInstructionText = document.createElement("div");
        radioInstructionText.style.cssText = `
          font-size: 11px;
          color: #6c757d;
          margin-top: 4px;
          font-style: italic;
          width: 100%;
        `;
        radioInstructionText.textContent =
          "💡 Select one • Enter = Save • Esc = Cancel";
        radioContainer.appendChild(radioInstructionText);

        input = radioContainer;
        finalInput = radioContainer;
        container.appendChild(radioContainer);
        break;

      case "switch":
        const switchContainer = document.createElement("div");
        switchContainer.style.cssText = `
          display: flex; 
          flex-wrap: wrap; 
          gap: 12px; 
          align-items: center;
          padding: 8px;
          border: 2px solid #007bff;
          border-radius: 4px;
          background: #fff;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
        `;

        if (!fieldOptions || fieldOptions.length === 0) {
          fieldOptions = [
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ];
        }

        fieldOptions.forEach((option, index) => {
          const switchItem = document.createElement("div");
          switchItem.style.cssText = `
            display: flex; 
            align-items: center; 
            gap: 8px;
          `;

          const switchInput = document.createElement("input");
          switchInput.type = "checkbox";
          switchInput.value = option.value;
          switchInput.className = "switch-inline";
          switchInput.checked = option.value === currentValue;
          switchInput.style.cssText = `
            width: 40px;
            height: 20px;
            appearance: none;
            background: #ccc;
            border-radius: 20px;
            position: relative;
            cursor: pointer;
            transition: background 0.3s;
          `;

          // Style the switch when checked
          switchInput.addEventListener("change", function () {
            this.style.background = this.checked ? "#007bff" : "#ccc";
          });

          const label = document.createElement("label");
          label.style.cssText = `
            font-size: 13px;
            cursor: pointer;
          `;
          label.textContent = option.label || option.value;

          switchItem.appendChild(switchInput);
          switchItem.appendChild(label);
          switchContainer.appendChild(switchItem);

          // Initial styling
          switchInput.style.background = switchInput.checked
            ? "#007bff"
            : "#ccc";
        });

        input = switchContainer;
        finalInput = switchContainer;
        container.appendChild(switchContainer);
        break;

      default:
        // Fallback to text input
        return this.createInputElement(
          "text",
          currentValue,
          fieldOptions,
          isRequired,
          fieldConfig,
          cellElement
        );
    }

    // No buttons - use keyboard shortcuts only
    // Enter = Save, Escape = Cancel, Blur = Auto-save

    return {
      container: container,
      input: finalInput, // Use finalInput which is properly set for each case
    };
  }

  async contentSearchInput(config, fieldName) {
    try {
      const inputEl = NXUI.id(fieldName);
      const configEl = config.search;

      // Add CSS styles for suggestions dropdown
      this.addSuggestionsStyles();

      inputEl.on("keyup", async function (e) {
        // Jika input kosong, hapus suggestions
        if (!e.target.value || e.target.value.trim() === "") {
          const suggestionsDiv = document.getElementById(
            `suggestions_${fieldName}`
          );
          if (suggestionsDiv) {
            suggestionsDiv.innerHTML = "";
            suggestionsDiv.style.display = "none";
            suggestionsDiv.classList.remove("nexa-dropdown-above");
            suggestionsDiv.style.maxHeight = "";
          }
          return;
        }

        const searchParams = {
          access: config.search.access ?? null,
          metadata: Number(config.search.tabelName),
          field: config.search.tabeltext,
          label: config.search.tabeltext,
          value: config.search.tabelvalue,
          where: {
            field: config.search.wheretext ?? null,
            value: config.search.wherevalue ?? null,
          },
        };

        const result = await NXUI.Storage()
          .models("Office")
          .searchAt(searchParams, e.target.value);

        // Tampilkan hasil di <div id="suggestions_${fieldName}">
        const suggestionsDiv = document.getElementById(
          `suggestions_${fieldName}`
        );
        if (suggestionsDiv) {
          // Position dropdown to match input field
          const inputElement = inputEl[0] || inputEl;
          // Ensure we have a DOM element
          const domElement =
            inputElement && inputElement.getBoundingClientRect
              ? inputElement
              : document.getElementById(fieldName);
          const inputRect = domElement.getBoundingClientRect();

          suggestionsDiv.style.left = inputRect.left + "px";
          suggestionsDiv.style.top = inputRect.bottom + window.scrollY + "px";
          suggestionsDiv.style.width = inputRect.width + "px";

          if (result && Array.isArray(result.data) && result.data.length > 0) {
            // Buat list hasil
            let html = '<ul class="nexa-suggestions-list">';
            result.data.forEach((item) => {
              html += `<li class="nexa-suggestion-item" data-value="${
                item.value
              }" data-id="${item.id}">
              ${item.label || item.value || item.data}</li>`;
            });
            html += "</ul>";
            suggestionsDiv.innerHTML = html;
            suggestionsDiv.style.display = "block";

            // Event klik pada suggestion
            suggestionsDiv
              .querySelectorAll(".nexa-suggestion-item")
              .forEach((li) => {
                li.addEventListener("click", function () {
                  // Set input value to show label, but store actual value
                  const label = this.textContent.trim();
                  const id = this.getAttribute("data-id");
                  const value = this.getAttribute("data-value");
                  if (configEl?.hiddenvalue) {
                    NXUI.id("hidden" + config?.search?.hiddenvalue).val(id);
                  }
                  NXUI.id(fieldName).val(value);
                  suggestionsDiv.innerHTML = "";
                  suggestionsDiv.style.display = "none";
                  suggestionsDiv.classList.remove("nexa-dropdown-above");
                });
              });
          } else {
            suggestionsDiv.innerHTML =
              '<div class="nexa-suggestion-empty">Tidak ada hasil ditemukan</div>';
            suggestionsDiv.style.display = "block";
            // Clear input field when no results found
            NXUI.id(fieldName).val("");
          }
        }
      });
    } catch (error) {
      console.error("❌ Error initializing search input:", error);
    }
  }

  addSuggestionsStyles() {
    // Add CSS styles only once
    if (document.getElementById("nexa-suggestions-styles")) return;

    const style = document.createElement("style");
    style.id = "nexa-suggestions-styles";
    style.textContent = `
      .nexa-search-container {
        position: relative;
      }
      
      .nexa-suggestions-dropdown {
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2147483647 !important;
        display: none;
        max-height: 250px;
        overflow-y: auto;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Modal-specific dropdown positioning */
      .nx-modal .nexa-suggestions-dropdown {
        position: absolute;
        z-index: 2147483647 !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      .nx-modal .nexa-search-container {
        position: relative;
      }
      
      /* Dropdown above input styling */
      .nexa-suggestions-dropdown.nexa-dropdown-above {
        box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
        border-radius: 4px 4px 0 0;
      }
      
      .nexa-suggestions-dropdown.nexa-dropdown-above .nexa-suggestion-item:first-child {
        border-radius: 4px 4px 0 0;
      }
      
      .nexa-suggestions-dropdown.nexa-dropdown-above .nexa-suggestion-item:last-child {
        border-radius: 0 0 0 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      /* Limited height dropdown styling */
      .nexa-suggestions-dropdown[style*="max-height"] {
        border-bottom: 1px solid #ddd;
      }
      
      .nexa-suggestions-dropdown[style*="max-height"] .nexa-suggestion-item:last-child {
        border-bottom: none;
      }
      
      .nexa-suggestions-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .nexa-suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s;
      }
      
      .nexa-suggestion-item:hover {
        background-color: #f5f5f5;
      }
      
      .nexa-suggestion-item:last-child {
        border-bottom: none;
      }
      
      .nexa-suggestion-empty {
        padding: 8px 12px;
        color: #666;
        font-style: italic;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Parse checkbox value from different formats
   */
  parseCheckboxValue(value) {
    // Handle null/empty values
    if (
      !value ||
      value === "-" ||
      value === "null" ||
      value === null ||
      value === undefined
    ) {
      return false;
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      return value;
    }

    // Handle numeric values (1 = true, 0 = false)
    if (typeof value === "number") {
      return value === 1;
    }

    // Handle string values
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase().trim();

      // Handle boolean string representations
      if (
        lowerValue === "true" ||
        lowerValue === "1" ||
        lowerValue === "yes" ||
        lowerValue === "checked"
      ) {
        return true;
      }
      if (
        lowerValue === "false" ||
        lowerValue === "0" ||
        lowerValue === "no" ||
        lowerValue === "unchecked"
      ) {
        return false;
      }

      // Handle comma-separated values (multiple checkboxes)
      if (value.includes(",")) {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      }

      // Return as string for direct comparison
      return value;
    }

    // For any other type, return as-is
    return value;
  }

  /**
   * Apply styling to cell during edit mode
   */
  applyEditStyling(cellElement) {
    // SIMPLE APPROACH: Just add edit styling temporarily
    // The original style is already stored in data-original-style

    // Apply edit styling with minimal changes
    cellElement.style.position = "relative";
    cellElement.style.background = "#f8f9fa";
    cellElement.style.borderRadius = "4px";
    cellElement.style.boxShadow = "0 0 0 2px rgba(0,123,255,0.25)";
  }

  /**
   * Focus input element and select content if applicable
   */
  focusInput(inputElement) {
    if (!inputElement) {
      console.warn("⚠️ No input element provided to focus");
      return;
    }

    // For checkbox containers, focus the first checkbox
    if (inputElement.tagName === "DIV") {
      const firstCheckbox = inputElement.querySelector(
        'input[type="checkbox"]'
      );
      if (firstCheckbox && firstCheckbox.focus) {
        firstCheckbox.focus();

        return;
      }
    }

    // For regular inputs (text, select)
    if (inputElement.focus) {
      inputElement.focus();

      if (inputElement.type === "text" && inputElement.select) {
        inputElement.select();
      }
    } else {
      console.warn("⚠️ Input element does not support focus:", inputElement);
    }
  }

  /**
   * Setup event handlers for save/cancel actions
   */
  setupEventHandlers(
    inputElement,
    cellElement,
    tableId,
    fieldKey,
    recordId,
    dataIndex,
    fieldType,
    cellKey
  ) {
    // Add processing flag to prevent race conditions
    let isProcessing = false;

    const saveEdit = () => {
      if (isProcessing) return;
      isProcessing = true;
      this.saveEdit(
        inputElement,
        cellElement,
        tableId,
        fieldKey,
        recordId,
        dataIndex,
        fieldType,
        cellKey
      ).finally(() => {
        isProcessing = false;
      });
    };

    const cancelEdit = () => {
      if (isProcessing) return;
      isProcessing = true;
      this.cancelEdit(cellElement, cellKey);
      isProcessing = false;
    };

    // Handle different input types
    switch (fieldType) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "currency":
      case "tel":
      case "url":
      case "date":
      case "datetime-local":
      case "time":
      case "month":
      case "week":
      case "textarea":
        // Standard text-based inputs with auto-save
        if (inputElement.addEventListener) {
          inputElement.addEventListener("blur", () => {
            saveEdit();
          });

          inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveEdit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          });
        }
        break;

      case "search":
        // Search input - manual save only (no auto-save)
        if (inputElement.addEventListener) {
          inputElement.addEventListener("input", (e) => {
            // Handle input events for search
          });

          inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              saveEdit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          });
        }
        break;

      case "select":
        // Select elements with Select2 support
        if (inputElement.addEventListener) {
          // Handle native change event
          inputElement.addEventListener("change", () => {
            // Auto-save immediately on select change
            saveEdit();
          });

          // Handle Select2 events if available
          if (window.$ && window.$.fn.select2) {
            $(inputElement).on("select2:select", () => {
              // Auto-save when Select2 option is selected
              saveEdit();
            });

            $(inputElement).on("select2:unselect", () => {
              // Auto-save when Select2 option is unselected
              saveEdit();
            });
          }

          inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveEdit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          });
        }
        break;

      case "color":
      case "range":
        // Color and range inputs
        if (inputElement.addEventListener) {
          inputElement.addEventListener("change", () => {
            // Auto-save on change for color/range
            setTimeout(saveEdit, this.config.saveDelay);
          });

          inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveEdit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          });
        }
        break;

      case "hidden":
        // Hidden inputs don't need events
        break;

      case "file":
        // For file inputs - handle file selection
        const fileInputElement =
          cellElement.querySelector('input[type="file"]');

        if (fileInputElement) {
          fileInputElement.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
              // No auto-save for file - user must press Enter
            }
          });
        }

        // SIMPLE APPROACH: Add ESC/ENTER support directly to the cellElement
        // This ensures it always works regardless of internal structure
        const handleFileKeydown = (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            cancelEdit();
          } else if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            saveEdit();
          }
        };

        // APPROACH: Add document-level ESC listener during file edit mode
        const documentKeyHandler = (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            cancelEdit();
            // Remove this temporary document listener
            document.removeEventListener("keydown", documentKeyHandler);
          } else if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            saveEdit();
            // Remove this temporary document listener
            document.removeEventListener("keydown", documentKeyHandler);
          }
        };

        // Add temporary document listener for this edit session
        document.addEventListener("keydown", documentKeyHandler);

        // Store the handler reference for cleanup
        cellElement._documentKeyHandler = documentKeyHandler;

        break;

      case "checkbox":
        // For checkbox inputs - handle multiple selections differently
        const checkboxes = cellElement.querySelectorAll(
          'input[type="checkbox"]'
        );

        let hasPendingChanges = false; // Track if there are pending changes

        // Show pending changes indicator
        const showPendingIndicator = () => {
          if (!hasPendingChanges) {
            hasPendingChanges = true;
            const container = cellElement.querySelector(
              'div[style*="border: 2px solid #007bff"]'
            );
            if (container) {
              container.style.borderColor = "#ffc107"; // Yellow border for pending
              container.style.boxShadow = "0 0 5px rgba(255,193,7,0.5)";

              // Add pending text
              let pendingIndicator =
                container.querySelector(".pending-indicator");
              if (!pendingIndicator) {
                pendingIndicator = document.createElement("div");
                pendingIndicator.className = "pending-indicator";
                pendingIndicator.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ffc107;
                color: #212529;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
              `;
                pendingIndicator.textContent = "Pending...";
                container.style.position = "relative";
                container.appendChild(pendingIndicator);
              }
            }
          }
        };

        // Hide pending changes indicator
        const hidePendingIndicator = () => {
          hasPendingChanges = false;
          const container = cellElement.querySelector(
            'div[style*="border-color: rgb(255, 193, 7)"]'
          );
          if (container) {
            container.style.borderColor = "#007bff"; // Back to blue border
            container.style.boxShadow = "0 0 5px rgba(0,123,255,0.3)";

            // Remove pending text
            const pendingIndicator =
              container.querySelector(".pending-indicator");
            if (pendingIndicator) {
              pendingIndicator.remove();
            }
          }
        };

        checkboxes.forEach((checkbox, index) => {
          // Handle checkbox change without auto-save
          checkbox.addEventListener("change", (e) => {
            // No auto-save for checkbox - user must press Enter
            // Visual feedback that there are unsaved changes
            showPendingIndicator();
          });

          // Handle keyboard events for each checkbox
          checkbox.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              hidePendingIndicator();
              cancelEdit();
            } else if (e.key === "Enter") {
              // Enter saves immediately
              e.preventDefault();
              hidePendingIndicator();

              saveEdit();
            }
          });

          // No blur auto-save for checkbox - user must press Enter to save
        });
        break;

      case "radio":
        // For radio inputs - single selection
        const radioInputs = cellElement.querySelectorAll('input[type="radio"]');

        radioInputs.forEach((radio, index) => {
          radio.addEventListener("change", (e) => {
            // No auto-save for radio - user must press Enter
          });

          radio.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            } else if (e.key === "Enter") {
              e.preventDefault();

              saveEdit();
            }
          });
        });
        break;

      case "switch":
        // For switch inputs - handle like radio but with switch styling
        const switchInputs = cellElement.querySelectorAll(".switch-inline");

        switchInputs.forEach((switchInput, index) => {
          switchInput.addEventListener("change", (e) => {
            // For switch, uncheck other switches (single selection behavior)
            switchInputs.forEach((otherSwitch) => {
              if (otherSwitch !== e.target) {
                otherSwitch.checked = false;
                otherSwitch.style.background = "#ccc";
              }
            });

            // No auto-save for switch - user must press Enter
          });

          switchInput.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            } else if (e.key === "Enter") {
              e.preventDefault();

              saveEdit();
            }
          });
        });
        break;

      default:
        console.warn(
          `⚠️ No specific event handling for fieldType: ${fieldType}`
        );
    }

    // No button events - using keyboard shortcuts only
    // Enter = Save, Escape = Cancel, Blur = Auto-save
  }

  /**
   * Save the edited value
   */
  async saveEdit(
    inputElement,
    cellElement,
    tableId,
    fieldKey,
    recordId,
    dataIndex,
    fieldType,
    cellKey
  ) {
    try {
      // Check if cell element is still valid and connected to DOM
      if (!cellElement || !cellElement.isConnected) {
        console.warn("⚠️ Cell element is no longer in DOM, skipping save");
        this.editingCells.delete(cellKey);
        return;
      }
      let newValue;

      // Extract value based on field type
      switch (fieldType) {
        case "text":
        case "email":
        case "password":
        case "tel":
        case "url":
        case "search":
        case "hidden":
          newValue = inputElement.value || "";
          break;

        case "number":
        case "currency":
          newValue = inputElement.value ? parseFloat(inputElement.value) : "";
          break;

        case "date":
        case "datetime-local":
        case "time":
        case "month":
        case "week":
          newValue = inputElement.value || "";
          break;

        case "color":
          newValue = inputElement.value || "#000000";
          break;

        case "range":
          newValue = parseFloat(inputElement.value);
          break;

        case "textarea":
          newValue = inputElement.value || "";
          break;

        case "select":
          newValue = inputElement.value || "";
          // Also get the display text
          const selectedOption =
            inputElement.options[inputElement.selectedIndex];
          if (selectedOption) {
          }
          break;

        case "checkbox":
          const checkedBoxes = cellElement.querySelectorAll(
            'input[type="checkbox"]:checked'
          );

          if (checkedBoxes.length === 0) {
            newValue = ""; // or "0", "false", "no" depending on your data format
          } else if (checkedBoxes.length === 1) {
            newValue = checkedBoxes[0].value;
          } else {
            // Multiple checkboxes - join with comma
            const values = Array.from(checkedBoxes).map((cb) => cb.value);
            newValue = values.join(",");
          }
          break;

        case "radio":
          const selectedRadio = cellElement.querySelector(
            'input[type="radio"]:checked'
          );
          newValue = selectedRadio ? selectedRadio.value : "";

          break;

        case "switch":
          const selectedSwitch = cellElement.querySelector(
            ".switch-inline:checked"
          );
          newValue = selectedSwitch ? selectedSwitch.value : "";

          break;

        case "file":
          const fileInputElement =
            cellElement.querySelector('input[type="file"]');
          if (fileInputElement && fileInputElement.files.length > 0) {
            const file = fileInputElement.files[0];
            newValue = file.name; // Store filename, actual file upload would need separate handling

            // Note: For actual file upload, you would typically:
            // 1. Upload file to server first
            // 2. Get back file URL/ID
            // 3. Store that URL/ID as the value
            // For now, we're just storing the filename
          } else {
            newValue = "";
          }
          break;

        default:
          newValue = inputElement.value || "";
      }

      const config = window.nexaTableConfigs?.[tableId];

      // 🔧 NEW: Use new form structure
      const dataform = config.dataform || config.configFrom || null;
      const formConfig = dataform?.form || {};
      const fieldConfig = formConfig[fieldKey] || {};

      // 🔧 NEW: Get field options for display formatting
      let fieldOptions = [];
      if (fieldConfig.options && Array.isArray(fieldConfig.options)) {
        fieldOptions = fieldConfig.options.map((option) => ({
          label: option.text || option.label || option.value,
          value: option.value || option.id,
          id: option.id,
        }));
      }

      // Get original value for comparison
      const originalValue =
        cellElement.getAttribute("data-original-value") || "";

      // Check if there's actually a change
      const hasChanged = this.detectValueChange(
        originalValue,
        newValue,
        fieldType
      );

      if (!hasChanged) {
        // Just restore the cell without saving
        this.cancelEdit(cellElement, cellKey);
        return;
      }

      // 🔧 NEW: Validate required fields using new structure
      const isRequired =
        fieldConfig.validation === "2" || fieldConfig.validation === 2;

      // Fix: Handle different data types for validation
      let isEmpty = false;
      if (typeof newValue === "number") {
        // For numbers, check if it's NaN or 0 (depending on your validation rules)
        isEmpty = isNaN(newValue) || newValue === 0;
      } else if (typeof newValue === "string") {
        // For strings, check if it's empty or just whitespace
        isEmpty = !newValue || newValue.trim() === "";
      } else {
        // For other types (boolean, object, etc.), check if falsy
        isEmpty = !newValue;
      }

      if (isRequired && isEmpty) {
        this.showValidationError(inputElement, cellElement);
        return;
      }

      // Show loading state
      this.showLoadingState(cellElement);

      try {
        // TODO: API call will be implemented later
        // For now, just simulate save with delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const updateKey = {
          id: recordId,
          [fieldKey]: newValue,
        };
        if (recordId) {
          // const response = await NXUI.Storage()
          //   .models("Office")
          //   .setRetUpdate(
          //     Number(NXUI.indexData.key),
          //     NXUI.indexData.id,
          //     updateKey,
          //     recordId
          //   );
          const store= new NXUI.Federated(NXUI.indexData);
          const response= await store.upt(updateKey,recordId)





        }

        // const tabel = await NXUI.Storage()
        // .models("Office")
        // .setRetUpdate(dataform.key, dataform.id, updateKey, recordId);

        // Update cell display with new value
        const displayValue = this.formatDisplayValue(
          newValue,
          fieldType,
          fieldOptions
        );
        cellElement.innerHTML = displayValue;

        // Update data in memory
        if (config.data[dataIndex]) {
          config.data[dataIndex][fieldKey] = newValue;
        }
        if (config.filteredData) {
          const filteredIndex = config.filteredData.findIndex(
            (item) => item.id == recordId
          );
          if (filteredIndex >= 0) {
            config.filteredData[filteredIndex][fieldKey] = newValue;
          }
        }

        // 🔧 NEW: Update tfoot after data change
        this.updateTfootAfterDataChange(tableId, config);

        // Success feedback BEFORE restoring styles
        this.showSuccessFeedback(cellElement);

        // Restore original styling with improved method AFTER success feedback
        const originalStyle =
          cellElement.getAttribute("data-original-style") || "";
        this.restoreOriginalStyling(cellElement, originalStyle);

        // Clean up stored metadata after successful save
        cellElement.removeAttribute("data-original-value");
        cellElement.removeAttribute("data-original-style");
        cellElement.removeAttribute("data-field-type");
        cellElement.removeAttribute("data-field-key");
        if (fieldType === "file") {
          cellElement.removeAttribute("data-original-html");
        }

        // Clean up Select2 if it was initialized
        const currentFieldType = cellElement.getAttribute("data-field-type");
        if (currentFieldType === "select") {
          const selectElement = cellElement.querySelector(
            "select.nexa-inline-select"
          );
          if (selectElement && window.$ && window.$.fn.select2) {
            try {
              // Destroy Select2 instance
              $(selectElement).select2("destroy");
              console.log(
                `🧹 Select2 destroyed after save: #${selectElement.id}`
              );
            } catch (error) {
              console.warn("⚠️ Error destroying Select2 after save:", error);
            }
          }
        }

        // Clean up document listener for file inputs on successful save
        if (currentFieldType === "file" && cellElement._documentKeyHandler) {
          document.removeEventListener(
            "keydown",
            cellElement._documentKeyHandler
          );
          delete cellElement._documentKeyHandler;
          console.log(
            `🧹 [NexaInline] Document key listener cleaned up after save`
          );
        }
      } catch (error) {
        console.error("❌ Error saving inline edit:", error);

        // Show error feedback
        this.showErrorFeedback(cellElement);

        // Revert to original value on error
        setTimeout(() => {
          this.cancelEdit(cellElement, cellKey);
        }, 2000);

        return;
      }
    } catch (error) {
      console.error("❌ Error in saveEdit:", error);

      // Hide any pending indicators on error
      const pendingIndicator = cellElement.querySelector(".pending-indicator");
      if (pendingIndicator) {
        pendingIndicator.remove();
      }
      const container = cellElement.querySelector(
        'div[style*="border-color: rgb(255, 193, 7)"]'
      );
      if (container) {
        container.style.borderColor = "#007bff";
        container.style.boxShadow = "0 0 5px rgba(0,123,255,0.3)";
      }

      this.cancelEdit(cellElement, cellKey);
    } finally {
      // Remove from editing set
      this.editingCells.delete(cellKey);
    }
  }

  /**
   * Cancel edit and restore original value with proper formatting
   */
  cancelEdit(cellElement, cellKey) {
    // Check if cell element is still valid and connected to DOM
    if (!cellElement || !cellElement.isConnected) {
      console.warn("⚠️ Cell element is no longer in DOM, skipping cancel");
      this.editingCells.delete(cellKey);
      return;
    }

    const originalValue = cellElement.getAttribute("data-original-value") || "";
    const originalStyle = cellElement.getAttribute("data-original-style") || "";
    const fieldType = cellElement.getAttribute("data-field-type") || "text";
    const fieldKey = cellElement.getAttribute("data-field-key") || "";

    // Clean up Select2 if it was initialized
    if (fieldType === "select") {
      const selectElement = cellElement.querySelector(
        "select.nexa-inline-select"
      );
      if (selectElement && window.$ && window.$.fn.select2) {
        try {
          // Destroy Select2 instance
          $(selectElement).select2("destroy");
          console.log(`🧹 Select2 destroyed for: #${selectElement.id}`);
        } catch (error) {
          console.warn("⚠️ Error destroying Select2:", error);
        }
      }
    }

    // For file fields, restore proper HTML preview instead of plain text
    if (fieldType === "file") {
      const originalHtml = cellElement.getAttribute("data-original-html");

      if (originalHtml) {
        // Restore exact original HTML preview
        cellElement.innerHTML = originalHtml;
      } else {
        // Fallback: regenerate HTML preview from original value
        const displayValue = this.formatDisplayValue(
          originalValue,
          fieldType,
          []
        );
        cellElement.innerHTML = displayValue;
      }
    } else {
      // For non-file fields, restore text value as before
      cellElement.innerHTML = originalValue;
    }

    // Restore original styling with improved method
    this.restoreOriginalStyling(cellElement, originalStyle);

    // Clean up stored metadata
    cellElement.removeAttribute("data-original-value");
    cellElement.removeAttribute("data-original-style");
    cellElement.removeAttribute("data-field-type");
    cellElement.removeAttribute("data-field-key");
    if (fieldType === "file") {
      cellElement.removeAttribute("data-original-html");
    }

    // Clean up document listener for file inputs
    if (fieldType === "file" && cellElement._documentKeyHandler) {
      document.removeEventListener("keydown", cellElement._documentKeyHandler);
      delete cellElement._documentKeyHandler;
    }

    // Remove from editing set
    this.editingCells.delete(cellKey);

    // 🔧 NEW: Update tfoot after cancel (in case data was partially changed)
    const tableId =
      cellElement.getAttribute("data-table-id") ||
      (window.NXUI?.indexData?.id ? `table_${window.NXUI.indexData.id}` : null);
    if (tableId) {
      const config = window.nexaTableConfigs?.[tableId];
      if (config) {
        this.updateTfootAfterDataChange(tableId, config);
      }
    }
  }

  /**
   * Format display value based on field type
   */
  formatDisplayValue(value, fieldType, fieldOptions = []) {
    if (!value || value === "null" || value === null || value === undefined)
      return "-";

    switch (fieldType) {
      case "text":
      case "email":
      case "password":
      case "tel":
      case "url":
      case "search":
      case "textarea":
      case "hidden":
        return value;

      case "number":
        // Format number with proper display
        if (typeof value === "number") {
          return value.toString();
        }
        return value;

      case "currency":
        // Format currency with proper display
        if (typeof value === "number") {
          // Format as currency with 2 decimal places
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(value);
        }
        return value;

      case "date":
        // Format date for display
        try {
          const date = new Date(value);
          return date.toLocaleDateString();
        } catch {
          return value;
        }

      case "datetime-local":
        try {
          const date = new Date(value);
          return date.toLocaleString();
        } catch {
          return value;
        }

      case "time":
        return value; // Time is already in HH:MM format

      case "month":
        try {
          const [year, month] = value.split("-");
          const date = new Date(year, month - 1);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          });
        } catch {
          return value;
        }

      case "week":
        return value; // Week format: 2023-W52

      case "color":
        // Display color with color preview
        return `<span style="display: inline-flex; align-items: center; gap: 4px;">
                  <span style="width: 16px; height: 16px; background: ${value}; border: 1px solid #ccc; border-radius: 2px;"></span>
                  ${value}
                </span>`;

      case "range":
        // Display range value with unit if available
        const unit = fieldOptions?.unit || "";
        return `${value}${unit}`;

      case "select":
        const option = fieldOptions.find((opt) => opt.value === value);
        const displayText = option ? option.label : value;

        return displayText;

      case "radio":
        // Similar to select - find label from options
        const radioOption = fieldOptions.find((opt) => opt.value === value);
        const radioText = radioOption ? radioOption.label : value;

        return radioText;

      case "switch":
        // Similar to radio - find label from options
        const switchOption = fieldOptions.find((opt) => opt.value === value);
        const switchText = switchOption ? switchOption.label : value;

        return switchText;

      case "file":
        // Display file with icon and name - use enhanced file preview
        if (!value || value === "-") return "-";

        // Validate that this is actually a file path, not checkbox/other data
        const isValidFilePath =
          typeof value === "string" &&
          (value.includes("/") ||
            value.includes(".") ||
            value.startsWith("assets/"));

        if (!isValidFilePath) {
          return value + ".type.text"; // Return as plain text with type indicator if not a valid file path
        }

        // Use global file preview function for consistency with table display
        if (window.nexaCreateFilePreview) {
          return window.nexaCreateFilePreview(
            value,
            value.split("/").pop() || value
          );
        }

        // Fallback - use NexaType via global function (should not reach here normally)
        const tempDiv = document.createElement("div");
        tempDiv.id = `temp-format-display-${Date.now()}`;
        document.body.appendChild(tempDiv);

        try {
          const result = NexaType(value, `#${tempDiv.id}`);
          if (result && tempDiv.innerHTML.trim()) {
            const htmlContent = tempDiv.innerHTML;
            return htmlContent;
          }
        } catch (error) {
          console.error(
            "❌ Error using NexaType in formatDisplayValue:",
            error
          );
        } finally {
          document.body.removeChild(tempDiv);
        }

        // Final fallback if NexaType completely fails
        return `<span style="font-size: 13px;">${value}</span>`;

      case "checkbox":
        // Handle multiple values (comma-separated)
        if (typeof value === "string" && value.includes(",")) {
          const values = value
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
          const labels = values.map((val) => {
            const option = fieldOptions.find((opt) => opt.value === val);
            return option ? option.label : val;
          });
          const result = labels.join(", ");

          return result;
        } else {
          // Single value
          if (fieldOptions && fieldOptions.length > 0) {
            const option = fieldOptions.find((opt) => opt.value === value);
            const result = option ? option.label : value;

            return result;
          } else {
            // No options provided, format based on common patterns
            if (
              value === "1" ||
              value === 1 ||
              value === "true" ||
              value === true ||
              value === "yes"
            ) {
              return "Yes";
            } else if (
              value === "0" ||
              value === 0 ||
              value === "false" ||
              value === false ||
              value === "no"
            ) {
              return "No";
            } else {
              return value;
            }
          }
        }

      default:
        return value;
    }
  }

  /**
   * Show loading state during save
   */
  showLoadingState(cellElement) {
    const loadingDiv = document.createElement("div");
    loadingDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12px;
      color: #007bff;
      z-index: 10;
    `;

    // Create small blue spinner
    const spinner = document.createElement("div");
    spinner.style.cssText = `
      width: 16px;
      height: 16px;
      border: 2px solid #e3f2fd;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: nexaSpinner 0.8s linear infinite;
    `;

    // Add CSS animation for spinner
    if (!document.getElementById("nexa-spinner-style")) {
      const style = document.createElement("style");
      style.id = "nexa-spinner-style";
      style.textContent = `
        @keyframes nexaSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    const text = document.createElement("span");
    text.textContent = "Saving...";

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(text);
    cellElement.style.position = "relative";
    cellElement.appendChild(loadingDiv);
  }

  /**
   * Show success feedback - CLEAN approach
   */
  showSuccessFeedback(cellElement) {
    // CLEAN APPROACH: Use temporary visual feedback that doesn't interfere with restoration

    // Add a temporary success indicator that will be removed by restoreOriginalStyling
    cellElement.style.boxShadow = "0 0 0 2px #28a745";
    cellElement.style.transition = "box-shadow 0.3s ease";

    // Remove the success indicator quickly so it doesn't interfere with restoration
    setTimeout(() => {
      // This will be overridden by restoreOriginalStyling anyway
      cellElement.style.removeProperty("box-shadow");
      cellElement.style.removeProperty("transition");
    }, 300);
  }

  /**
   * Show error feedback
   */
  showErrorFeedback(cellElement) {
    cellElement.style.backgroundColor = "#f8d7da";
    cellElement.style.borderColor = "#dc3545";
    cellElement.innerHTML = "❌ Save failed - will revert";
  }

  /**
   * Show validation error with red border and shake effect
   */
  showValidationError(inputElement, cellElement) {
    // Add validation error styling to input
    if (inputElement) {
      // Handle different input types
      if (inputElement.tagName === "DIV") {
        // For checkbox, radio, switch containers
        inputElement.style.borderColor = "#dc3545";
        inputElement.style.boxShadow = "0 0 5px rgba(220,53,69,0.5)";
      } else {
        // For regular inputs
        inputElement.style.borderColor = "#dc3545";
        inputElement.style.boxShadow = "0 0 5px rgba(220,53,69,0.5)";
      }
    }

    // Add shake animation to cell
    cellElement.style.animation = "nexaValidationShake 0.5s ease-in-out";

    // Add CSS animation for shake effect
    if (!document.getElementById("nexa-validation-style")) {
      const style = document.createElement("style");
      style.id = "nexa-validation-style";
      style.textContent = `
        @keyframes nexaValidationShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Remove shake animation after it completes
    setTimeout(() => {
      cellElement.style.animation = "";
    }, 500);

    // Auto-remove error state when user starts typing
    this.setupValidationClearance(inputElement);
  }

  /**
   * Detect if value has actually changed based on field type
   */
  detectValueChange(originalValue, newValue, fieldType) {
    // Normalize values for comparison
    const normalizeValue = (value) => {
      if (value === null || value === undefined || value === "null") return "";
      return String(value).trim();
    };

    const normalizedOriginal = normalizeValue(originalValue);
    const normalizedNew = normalizeValue(newValue);

    // Special handling for different field types
    switch (fieldType) {
      case "checkbox":
        // For checkbox, handle comma-separated values
        const originalCheckboxValues = normalizedOriginal
          ? normalizedOriginal
              .split(",")
              .map((v) => v.trim())
              .sort()
          : [];
        const newCheckboxValues = normalizedNew
          ? normalizedNew
              .split(",")
              .map((v) => v.trim())
              .sort()
          : [];

        const checkboxChanged =
          JSON.stringify(originalCheckboxValues) !==
          JSON.stringify(newCheckboxValues);

        return checkboxChanged;

      case "number":
      case "range":
        // For numbers, convert to numeric values for comparison
        const originalNum = parseFloat(normalizedOriginal) || 0;
        const newNum = parseFloat(normalizedNew) || 0;
        const numberChanged = originalNum !== newNum;

        return numberChanged;

      case "select":
      case "radio":
      case "switch":
        // For single selections, direct string comparison
        const selectionChanged = normalizedOriginal !== normalizedNew;

        return selectionChanged;

      case "file":
        // For file inputs, any file selection is considered a change
        const fileChanged = newValue !== "" && newValue !== originalValue;

        return fileChanged;

      case "date":
      case "datetime-local":
      case "time":
      case "month":
      case "week":
        // For date inputs, normalize date formats
        const dateChanged = normalizedOriginal !== normalizedNew;

        return dateChanged;

      case "color":
        // For color inputs, normalize hex values (case insensitive)
        const originalColor = normalizedOriginal.toLowerCase();
        const newColor = normalizedNew.toLowerCase();
        const colorChanged = originalColor !== newColor;

        return colorChanged;

      default:
        // For text-based inputs (text, email, password, tel, url, search, textarea)
        const textChanged = normalizedOriginal !== normalizedNew;
        return textChanged;
    }
  }

  /**
   * Setup event listeners to clear validation errors
   */
  setupValidationClearance(inputElement) {
    if (!inputElement) return;

    const clearValidationError = () => {
      if (inputElement.tagName === "DIV") {
        // For containers (checkbox, radio, switch)
        inputElement.style.borderColor = "#007bff";
        inputElement.style.boxShadow = "0 0 5px rgba(0,123,255,0.3)";
      } else {
        // For regular inputs
        inputElement.style.borderColor = "#007bff";
        inputElement.style.boxShadow = "0 0 5px rgba(0,123,255,0.3)";
      }
    };

    // For regular inputs
    if (inputElement.addEventListener) {
      inputElement.addEventListener("input", clearValidationError, {
        once: true,
      });
      inputElement.addEventListener("change", clearValidationError, {
        once: true,
      });
    }

    // For checkbox/radio containers
    if (inputElement.tagName === "DIV") {
      const checkboxes = inputElement.querySelectorAll(
        'input[type="checkbox"], input[type="radio"], .switch-inline'
      );
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", clearValidationError, { once: true });
      });
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Truncate long filenames for better display
   */
  truncateFileName(fileName, maxLength = 25) {
    if (!fileName || fileName.length <= maxLength) {
      return fileName;
    }

    // Get file extension
    const lastDot = fileName.lastIndexOf(".");
    const extension = lastDot > 0 ? fileName.substring(lastDot) : "";
    const nameWithoutExt =
      lastDot > 0 ? fileName.substring(0, lastDot) : fileName;

    // Calculate available space for name (minus extension and "...")
    const availableSpace = maxLength - extension.length - 3;

    if (availableSpace <= 0) {
      return fileName.substring(0, maxLength - 3) + "...";
    }

    // Show first part of name + "..." + extension
    const truncatedName = nameWithoutExt.substring(0, availableSpace);
    return truncatedName + "..." + extension;
  }

  /**
   * Restore original styling to cell element - CLEAN approach
   */
  restoreOriginalStyling(cellElement, originalStyle) {
    try {
      // CLEAN APPROACH: Only restore if there were original inline styles
      if (originalStyle && originalStyle.trim() !== "") {
        // Restore only the original inline styles that existed before edit
        cellElement.style.cssText = originalStyle;
      } else {
        // NO original inline styles - completely clear all inline styles
        // Let the table's CSS classes handle the styling
        cellElement.style.cssText = "";
      }

      // IMPORTANT: Remove any specific edit-mode properties that might still be there
      // This ensures no edit-mode styling remains
      cellElement.style.removeProperty("position");
      cellElement.style.removeProperty("background");
      cellElement.style.removeProperty("background-color");
      cellElement.style.removeProperty("border-radius");
      cellElement.style.removeProperty("box-shadow");
      cellElement.style.removeProperty("border");
      cellElement.style.removeProperty("border-color");
      cellElement.style.removeProperty("border-width");
      cellElement.style.removeProperty("border-style");
      cellElement.style.removeProperty("padding");
      cellElement.style.removeProperty("transition");
    } catch (error) {
      // Last resort: completely clear all inline styles
      cellElement.style.cssText = "";
    }
  }

  /**
   * 🔧 NEW: Update tfoot after data change from inline editing
   */
  updateTfootAfterDataChange(tableId, config) {
    try {
      // Check if tfoot is enabled
      const options = window.NXUI?.indexData?.options || {};
      if (!options.enableTfoot) {
        return;
      }

      // Get current data (use filteredData if available, otherwise use data)
      const currentData = config.filteredData || config.data || [];
      const variables = config.dataform?.variables || [];

      // Update tfoot using static method
      if (
        typeof window.Tabeltfoott !== "undefined" &&
        window.Tabeltfoott.updateTfootStatic
      ) {
        window.Tabeltfoott.updateTfootStatic(currentData, variables, options);
        console.log("✅ [NexaInline] Tfoot updated after data change");
      } else {
        console.warn("⚠️ [NexaInline] Tabeltfoott not available for update");
      }
    } catch (error) {
      console.error(
        "❌ [NexaInline] Error updating tfoot after data change:",
        error
      );
    }
  }

  /**
   * Cleanup - cancel all active edits
   */
  cleanup() {
    this.editingCells.forEach((cellKey) => {
      // Find and cancel any active edits
    });
    this.editingCells.clear();
  }
}

export { recordInline };

// Auto-initialize if in browser environment
if (typeof window !== "undefined") {
  // Create global instance for Standalone tables
  if (!window.nexaStandaloneInlineInstance) {
    window.nexaStandaloneInlineInstance = new recordInline({
      autoSave: true,
      saveDelay: 300, // Fast save for text/select
      checkboxSaveDelay: 2500, // Allow time for multiple checkbox selections
    });
  }
  /**
   * 🔧 NEW: Helper function to setup table config with new form structure
   *
   * Example usage:
   * const formConfig = {
   *   "nama": {
   *     "type": "text",
   *     "icons": "person",
   *     "placeholder": "Masukkan nama",
   *     "validation": "2"
   *   },
   *   "tanggal_lahir": {
   *     "type": "select",
   *     "icons": "date_range",
   *     "placeholder": "Pilih tanggal",
   *     "validation": "2",
   *     "options": [
   *       {"id": "opt1", "text": "2024", "value": "2024"},
   *       {"id": "opt2", "text": "2025", "value": "2025"}
   *     ]
   *   }
   * };
   *
   * window.setupNexaInlineConfig(tableId, dataform, data);
   */
  window.setupNexaInlineConfig = function (tableId, dataform, data) {
    if (!window.nexaTableConfigs) {
      window.nexaTableConfigs = {};
    }
    window.nexaTableConfigs[tableId] = {
      dataform: dataform,
      data: data,
      filteredData: data, // Initialize with same data
    };
  };

  /**
   * 🔧 NEW: Global function to update tfoot after any data change
   */
  window.updateTfootAfterDataChange = function (tableId = null) {
    try {
      // If no tableId provided, try to get from current context
      if (!tableId) {
        tableId = window.NXUI?.indexData?.id
          ? `table_${window.NXUI.indexData.id}`
          : null;
      }

      if (!tableId) {
        console.warn("⚠️ No tableId provided for tfoot update");
        return;
      }

      const config = window.nexaTableConfigs?.[tableId];
      if (!config) {
        console.warn("⚠️ No table config found for tfoot update:", tableId);
        return;
      }

      // Check if tfoot is enabled
      const options = window.NXUI?.indexData?.options || {};
      if (!options.enableTfoot) {
        return;
      }

      // Get current data
      const currentData = config.filteredData || config.data || [];
      const variables = config.dataform?.variables || [];

      // Update tfoot using static method
      if (
        typeof window.Tabeltfoott !== "undefined" &&
        window.Tabeltfoott.updateTfootStatic
      ) {
        window.Tabeltfoott.updateTfootStatic(currentData, variables, options);
        console.log("✅ [Global] Tfoot updated after data change");
      } else {
        console.warn("⚠️ [Global] Tabeltfoott not available for update");
      }
    } catch (error) {
      console.error(
        "❌ [Global] Error updating tfoot after data change:",
        error
      );
    }
  };
}
// Cache buster: 2025-09-15 17:13:17
