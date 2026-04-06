export class NexaAction {
  constructor(formData, options = {}) {
    console.log(formData.type);
    this.formData = formData || {};

    // Jika formData.type === "join", ganti semua .form menjadi .formJoin
    if (formData.type === "join") {
      this.form = formData.formJoin || {};
      this.formData.form = formData.formJoin || {};
    } else {
      this.form = formData.form || {};
    }

    this.settings = formData.settings || {};

    // Validasi struktur data baru
    if (!this.formData.form || typeof this.formData.form !== "object") {
      throw new Error(
        'NexaFloating: Invalid form data structure. Expected "form" property with field definitions.'
      );
    }

    this.options = {
      footer: true, // Default: tampilkan footer/submit button
      mode: "insert", // Default mode: insert (hide id field), bisa juga 'update'
      ...options, // Merge with user options
    };
    // Ambil ID form dari struktur baru
    this.formId = this.formData.id || this.formData.modalid || "nexaForm";
    this.className = this.formData.className || "Form";
    this.tableName = this.formData.tableName || "Data";
    this.label = this.formData.label || "Form";

    this.init();
  }

  init() {
    this.generateForm();
  }

  generateForm() {
    const formHTML = this.buildFormHTML();
    this.formElement = this.createFormElement(formHTML);
    this.attachEventListeners();
  }

  buildFormHTML() {
    const style = this.getFormStyle();
    const isGrid = this.hasGridColumns();

    const formClass = style.floating
      ? "form-nexa nexa-floating-form"
      : "form-nexa";
    let formHTML = ``;

    // Check if form contains file inputs
    const hasFileInputs = Object.values(this.formData.form || {}).some(
      (field) => field.type === "file"
    );
    const enctype = hasFileInputs ? ' enctype="multipart/form-data"' : "";

    formHTML += `<form id="${this.formId}" class="${formClass}"${enctype}>`;
    if (this.settings.model == "Content") {
      formHTML += `<div class="nx-card-form">
        <div class="nx-card-header bold">
          ${this.settings.formTags || "Header Card"}
        </div>
          <div class="nx-card-body">`;
    }

    if (isGrid) {
      formHTML += `<div class="nx-row">`;
    }

    // Generate form fields menggunakan struktur baru dengan urutan sesuai variables
    const orderedFields = this.getOrderedFields();
    for (const [fieldName, fieldConfig] of orderedFields) {
      // Skip field 'id' jika mode adalah 'insert'
      if (fieldName === "id" && this.options.mode === "insert") {
        continue;
      }

      const fieldHTML = this.generateField(fieldName, fieldConfig);
      formHTML += fieldHTML;
    }

    if (isGrid) {
      formHTML += `</div>`;
    }

    if (this.options.footer) {
      if (this.settings.model == "Content") {
        formHTML += ` 
        </div>
        <div class="nx-card-footer">
          ${this.generateSubmitButton(this.formData)}
        </div>
      </div>`;
      }
    }
    formHTML += `</form>`;
    // this.sendContent(this.formData)
    return formHTML;
  }

  /**
   * Get form style configuration from new structure
   * @returns {Object}
   */
  getFormStyle() {
    const defaultStyle = {
      floating: true,
      size: "form-nexa-control",
      layout: "vertical",
      button: "nx-btn-primary",
      validation: false,
    };

    // Prioritas: assets.style > settings > default
    let style = { ...defaultStyle };

    if (this.formData.assets && this.formData.assets.style) {
      style = { ...style, ...this.formData.assets.style };
    }

    if (this.formData.settings) {
      const settings = this.formData.settings;
      if (settings.floating !== undefined) style.floating = settings.floating;
      if (settings.validation !== undefined)
        style.validation = settings.validation;
      if (settings.buttontype) style.button = settings.buttontype;
      if (settings.layout) style.layout = settings.layout;
      if (settings.size) style.size = settings.size;
    }

    return style;
  }

  /**
   * Check if any field has grid column classes
   * @returns {boolean}
   */
  hasGridColumns() {
    if (!this.formData.form) return false;

    return Object.values(this.formData.form).some(
      (field) => field.columnWidth && field.columnWidth.startsWith("nx-col-")
    );
  }

  /**
   * Get fields ordered according to variables array
   * Filter only fields with inline: true
   * @returns {Array} Array of [fieldName, fieldConfig] tuples in correct order
   */
  getOrderedFields() {
    const formFields = this.formData.form || {};
    const variables = this.formData.variables || [];
    const orderedFields = [];

    // First, add fields in the order specified by variables array (only inline: true)
    variables.forEach((fieldName) => {
      if (formFields[fieldName] && formFields[fieldName].condition === true) {
        // Filter berdasarkan type jika options.type === "search"
        if (
          this.options.type === "search" &&
          formFields[fieldName].type !== "search"
        ) {
          return; // Skip field yang bukan type "search"
        }
        orderedFields.push([fieldName, formFields[fieldName]]);
      }
    });

    // Then, add any remaining fields that are not in variables array (only inline: true)
    Object.entries(formFields).forEach(([fieldName, fieldConfig]) => {
      if (!variables.includes(fieldName) && fieldConfig.condition === true) {
        // Filter berdasarkan type jika options.type === "search"
        if (this.options.type === "search" && fieldConfig.type !== "search") {
          return; // Skip field yang bukan type "search"
        }
        orderedFields.push([fieldName, fieldConfig]);
      }
    });

    return orderedFields;
  }

  generateField(fieldName, fieldConfig) {
    // Skip field jika bukan inline
    if (fieldConfig.condition !== true) {
      return ""; // Jangan tampilkan apapun
    }

    // Filter berdasarkan type jika options.type === "search"
    if (this.options.type === "search" && fieldConfig.type !== "search") {
      return ""; // Hanya tampilkan field dengan type "search"
    }

    // Skip field hidden - tidak perlu ditampilkan secara visual
    if (fieldConfig.type === "hidden") {
      return this.generateHiddenInput(
        fieldName,
        fieldConfig.placeholder || fieldConfig.label || fieldName,
        "",
        false
      );
    }

    const style = this.getFormStyle();
    const placeholder =
      fieldConfig.placeholder || fieldConfig.label || fieldName;
    const icon = fieldConfig.icons;
    const gridClass = fieldConfig.columnWidth;
    const isFloating = style.floating;
    const size = style.size || "form-nexa-control";
    const fieldType = fieldConfig.type || "text";

    let fieldHTML = "";

    if (gridClass) {
      fieldHTML += `<div class="${gridClass}">`;
    }

    // Special handling for checkbox, radio, switch, and file - only use grid, no floating or icon wrapper
    if (
      fieldType === "checkbox" ||
      fieldType === "radio" ||
      fieldType === "switch" ||
      fieldType === "file"
    ) {
      let inputHTML = "";

      if (fieldType === "checkbox") {
        inputHTML = this.generateCheckboxInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      } else if (fieldType === "radio") {
        inputHTML = this.generateRadioInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      } else if (fieldType === "switch") {
        inputHTML = this.generateSwitchInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      } else if (fieldType === "file") {
        inputHTML = this.generateFileInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      }

      fieldHTML += inputHTML;

      if (gridClass) {
        fieldHTML += `</div>`; // Close grid column
      }

      return fieldHTML;
    }

    // Wrapper for floating or regular form (for non-checkbox inputs)
    const wrapperClass = isFloating ? "form-nexa-floating" : "form-nexa-group";
    fieldHTML += `<div class="${wrapperClass}">`;

    // For floating mode, add icon container here
    if (isFloating && icon) {
      fieldHTML += `<div class="form-nexa-icon">`;
    }

    // Generate input based on type
    let inputHTML = "";
    switch (fieldType) {
      case "text":
        inputHTML = this.generateTextInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "email":
        inputHTML = this.generateEmailInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "password":
        inputHTML = this.generatePasswordInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "number":
        inputHTML = this.generateNumberInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "tel":
        inputHTML = this.generateTelInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "url":
        inputHTML = this.generateUrlInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "date":
        inputHTML = this.generateDateInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "datetime-local":
        inputHTML = this.generateDateTimeInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "time":
        inputHTML = this.generateTimeInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "month":
        inputHTML = this.generateMonthInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "week":
        inputHTML = this.generateWeekInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "color":
        inputHTML = this.generateColorInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "range":
        inputHTML = this.generateRangeInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;

      case "textarea":
        inputHTML = this.generateTextareaInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "hidden":
        inputHTML = this.generateHiddenInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "select":
        inputHTML = this.generateSelectInput(
          fieldName,
          placeholder,
          size,
          isFloating,
          fieldConfig
        );
        break;
      case "search":
        inputHTML = this.generateSearchInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      default:
        inputHTML = this.generateTextInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
    }

    // Add label and input with correct structure based on floating mode
    if (isFloating) {
      // Floating labels: input first, then label inside icon container
      if (icon) {
        fieldHTML += inputHTML;
        fieldHTML += `<i class="material-symbols-outlined">${icon}</i>`;
        fieldHTML += `<label for="${fieldName}">${placeholder}</label>`;
        fieldHTML += `</div>`; // Close form-nexa-icon
        if (fieldType == "search") {
          fieldHTML += `
          <ul id="suggestions_${fieldName}" class="list-group mt-3"></ul>
          <span id="return_${fieldName}"></span>
        `;
        }
      } else {
        fieldHTML += inputHTML;
        fieldHTML += `<label for="${fieldName}">${placeholder}</label>`;
        if (fieldType == "search") {
          fieldHTML += `
          <ul id="suggestions_${fieldName}" class="list-group mt-3"></ul>
          <span id="return_${fieldName}"></span>
        `;
        }
      }
    } else {
      // Non-floating: label first, then input (label outside icon container)
      fieldHTML += `<label for="${fieldName}">${placeholder}</label>`;
      if (icon) {
        fieldHTML += `<div class="form-nexa-icon">`;
        fieldHTML += inputHTML;
        fieldHTML += `<i class="material-symbols-outlined">${icon}</i>`;
        fieldHTML += `</div>`; // Close form-nexa-icon
        if (fieldType == "search") {
          fieldHTML += `
            <ul id="suggestions_${fieldName}" class="list-group mt-3"></ul>
            <span id="return_${fieldName}"></span>
        `;
        }
      } else {
        fieldHTML += inputHTML;
      }
    }

    // Add validation error container
    // if (formStyele.validation) {
    //   fieldHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
    // }

    fieldHTML += `</div>`; // Close form-nexa-floating/form-nexa

    if (gridClass) {
      fieldHTML += `</div>`; // Close grid column
    }

    return fieldHTML;
  }

  generateTextInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="text" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateSelectInput(fieldName, placeholder, size, isFloating, fieldConfig) {
    const options = fieldConfig.options || [];
    let selectHTML = `<select id="${fieldName}" name="${fieldName}" class="${size}">`;

    // Always use "Pilihan" as default option text
    selectHTML += `<option value="">Pilihan</option>`;

    if (options && Array.isArray(options)) {
      options.forEach((option) => {
        const value = option.value || option.id;
        const label = option.text || option.label || option.value;
        selectHTML += `<option value="${value}">${label}</option>`;
      });
    }

    selectHTML += `</select>`;
    return selectHTML;
  }

  generateSearchInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="search" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateEmailInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="email" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generatePasswordInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="password" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateNumberInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    const options = this.getOptions(fieldName);
    let attributes = "";

    if (options) {
      if (options.min !== undefined) attributes += ` min="${options.min}"`;
      if (options.max !== undefined) attributes += ` max="${options.max}"`;
      if (options.step !== undefined) attributes += ` step="${options.step}"`;
    }

    return `<input type="number" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr}${attributes} />`;
  }

  generateTelInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="tel" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateUrlInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="url" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateDateInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="date" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateDateTimeInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="datetime-local" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateTimeInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="time" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateMonthInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="month" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateWeekInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="week" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateColorInput(fieldName, placeholder, size, isFloating) {
    return `<input type="color" id="${fieldName}" name="${fieldName}" class="${size}" />`;
  }

  generateRangeInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let attributes = "";

    if (options) {
      if (options.min !== undefined) attributes += ` min="${options.min}"`;
      if (options.max !== undefined) attributes += ` max="${options.max}"`;
      if (options.step !== undefined) attributes += ` step="${options.step}"`;
      if (options.value !== undefined)
        attributes += ` value="${options.value}"`;
    }

    return `<input type="range" id="${fieldName}" name="${fieldName}" class="form-nexa-range"${attributes} />`;
  }

  generateFileInput(fieldName, placeholder, size, isFloating) {
    const fileUploadConfig = this.form?.[fieldName] || {};

    // console.log(`🔍 FileUpload config for ${fieldName}:`, fileUploadConfig);

    // ambil konfigurasi dari data terbaru
    let acceptAttribute = fileUploadConfig.fieldAccept || "";
    let multipleAttribute = fileUploadConfig.fieldMultiple ? "multiple" : "";

    let fileHTML = `
    <div class="nx-media nx-fileupload" id="fileUpload-${fieldName}">
      <img
        style="height: 50px; width: 50px"
        src="${window.NEXA.url}/assets/images/500px.png"
        alt="preview"
        class="nx-media-img"
        id="preview-image"
      />
      <i
        id="fa-icon"
        class="fas fa-file"
        style="
          display: none;
          height: 50px;
          width: 50px;
          font-size: 32px;
          color: #666;
          align-items: center;
          justify-content: center;
        "
      ></i>
      <input
        type="file"
        id="${fieldName}"
        name="${fieldName}" 
        class="form-nexa-file-input"
        accept="${acceptAttribute}" 
        ${multipleAttribute}
        data-max-size="${fileUploadConfig.fileUploadSize || "5MB"}"
        data-max-files="${fileUploadConfig.fieldMultiple ? "5" : "1"}"
      />
      <div class="nx-media-body">
        <h5>${fileUploadConfig.placeholder || placeholder}</h5>
        <p id="nx-file-type">Maksimal ${
          fileUploadConfig.fileUploadSize || "5MB"
        }, tipe: ${acceptAttribute || "semua"}</p>
        <small id="file-name" style="color: #666"></small>
      </div>
    </div>`;

    // jalankan setelah DOM render
    setTimeout(() => {
      this.fileUpload(fileUploadConfig, fieldName);
    }, 0);

    return fileHTML;
  }

  fileUpload(data = {}, fieldName) {
    // ✅ CRITICAL FIX: Add comprehensive null checks
    const forImages = window.NEXA.url + "/assets/images/500px.png";
    const fileInput = document.getElementById(fieldName);
    const previewImage = document.getElementById("preview-image");
    if (previewImage) {
      previewImage.src = forImages;
    }
    const faIcon = document.getElementById("fa-icon");
    const fileName = document.getElementById("file-name");
    const fileTypeDisplay = document.getElementById("nx-file-type");
    const defaultSrc = forImages;

    // ✅ SAFE: Set accept attribute from data parameter with null checks
    if (data && typeof data === "object" && data.accept) {
      if (fileInput) {
        fileInput.setAttribute("accept", data.accept);
        console.log(`✅ Set accept attribute: ${data.accept}`);
      }
      // Display accepted file types
      if (fileTypeDisplay) {
        fileTypeDisplay.textContent = `Type ${data.accept}`;
      }
    } else {
      if (fileTypeDisplay) {
        fileTypeDisplay.textContent = "All file types supported";
      }
      // console.log(`⚠️ No accept attribute specified for ${fieldName}`);
    }

    // ✅ SAFE: Validation function for file types with null checks
    function validateFileType(file) {
      if (
        !data ||
        typeof data !== "object" ||
        !data.accept ||
        typeof data.accept !== "string"
      ) {
        console.log(`✅ File validation: allowing all types (no restrictions)`);
        return true; // Allow all files if no accept specified
      }

      try {
        const allowedExtensions = data.accept
          .split(",")
          .map((ext) => ext.trim().toLowerCase());
        const fileName = file.name.toLowerCase();
        const fileExtension = "." + fileName.split(".").pop();

        const isValid = allowedExtensions.includes(fileExtension);
        console.log(
          `🔍 File validation: ${fileName} -> ${
            isValid ? "VALID" : "INVALID"
          } (allowed: ${data.accept})`
        );
        return isValid;
      } catch (error) {
        console.error(`❌ Error in validateFileType:`, error);
        return true; // Allow file if validation fails
      }
    }
    // File type to FontAwesome icon mapping
    const fileIcons = {
      // Images
      jpg: "fas fa-file-image",
      jpeg: "fas fa-file-image",
      png: "fas fa-file-image",
      gif: "fas fa-file-image",
      webp: "fas fa-file-image",
      bmp: "fas fa-file-image",
      svg: "fas fa-file-image",

      // Documents
      pdf: "fas fa-file-pdf",
      doc: "fas fa-file-word",
      docx: "fas fa-file-word",
      xls: "fas fa-file-excel",
      xlsx: "fas fa-file-excel",
      ppt: "fas fa-file-powerpoint",
      pptx: "fas fa-file-powerpoint",
      txt: "fas fa-file-alt",
      rtf: "fas fa-file-alt",

      // Data & Config
      xml: "fas fa-file-code",
      yaml: "fas fa-file-code",
      yml: "fas fa-file-code",
      json: "fas fa-file-code",
      csv: "fas fa-file-csv",

      // Archives
      zip: "fas fa-file-archive",
      rar: "fas fa-file-archive",
      "7z": "fas fa-file-archive",
      tar: "fas fa-file-archive",
      gz: "fas fa-file-archive",

      // Audio
      mp3: "fas fa-file-audio",
      wav: "fas fa-file-audio",
      flac: "fas fa-file-audio",
      aac: "fas fa-file-audio",
      ogg: "fas fa-file-audio",

      // Video
      mp4: "fas fa-file-video",
      avi: "fas fa-file-video",
      mov: "fas fa-file-video",
      wmv: "fas fa-file-video",
      flv: "fas fa-file-video",
      mkv: "fas fa-file-video",
      webm: "fas fa-file-video",
    };

    // Color mapping for file types
    const fileColors = {
      // Images
      jpg: "#4CAF50",
      jpeg: "#4CAF50",
      png: "#4CAF50",
      gif: "#4CAF50",
      webp: "#4CAF50",
      bmp: "#4CAF50",
      svg: "#4CAF50",

      // Documents
      pdf: "#F44336",
      doc: "#2196F3",
      docx: "#2196F3",
      xls: "#4CAF50",
      xlsx: "#4CAF50",
      ppt: "#FF9800",
      pptx: "#FF9800",
      txt: "#9E9E9E",
      rtf: "#9E9E9E",

      // Data & Config
      xml: "#FF5722",
      yaml: "#FF5722",
      yml: "#FF5722",
      json: "#FFC107",
      csv: "#4CAF50",

      // Archives
      zip: "#795548",
      rar: "#795548",
      "7z": "#795548",
      tar: "#795548",
      gz: "#795548",

      // Audio
      mp3: "#E91E63",
      wav: "#E91E63",
      flac: "#E91E63",
      aac: "#E91E63",
      ogg: "#E91E63",

      // Video
      mp4: "#9C27B0",
      avi: "#9C27B0",
      mov: "#9C27B0",
      wmv: "#9C27B0",
      flv: "#9C27B0",
      mkv: "#9C27B0",
      webm: "#9C27B0",
    };

    function showImage() {
      if (previewImage) {
        previewImage.style.display = "block";
      }
      if (faIcon) {
        faIcon.style.display = "none";
      }
    }

    function showIcon(iconClass, extension) {
      if (previewImage) {
        previewImage.style.display = "none";
      }
      if (faIcon) {
        faIcon.style.display = "flex";
        faIcon.className = iconClass;

        // Apply color based on file type
        const color = fileColors[extension] || "#666";
        faIcon.style.color = color;
      }
    }
    if (!fileInput) {
      console.warn(`File input element with ID "${fieldName}" not found`);
      return;
    }

    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        // ✅ SAFE: Validate file type with better error handling
        if (!validateFileType(file)) {
          // Show error message in nx-file-type
          if (fileTypeDisplay) {
            const acceptTypes = data && data.accept ? data.accept : "specified";
            fileTypeDisplay.textContent = `❌ File type not allowed. Only ${acceptTypes} files are permitted.`;
            fileTypeDisplay.style.color = "#F44336";
          }

          // Reset input
          fileInput.value = "";
          if (fileName) {
            fileName.textContent = "";
          }
          if (previewImage) {
            previewImage.src = defaultSrc;
            previewImage.alt = "Casey Horner";
          }
          showImage();

          // Reset error message after 3 seconds
          setTimeout(() => {
            if (fileTypeDisplay) {
              const acceptTypes =
                data && data.accept ? data.accept : "all types";
              fileTypeDisplay.textContent = `Type ${acceptTypes}`;
              fileTypeDisplay.style.color = "";
            }
          }, 3000);

          return;
        }

        if (fileName) {
          fileName.textContent = file.name;
        }

        // Get file extension
        const extension = file.name.split(".").pop().toLowerCase();

        if (file.type.startsWith("image/")) {
          // Show image preview
          const reader = new FileReader();
          reader.onload = function (e) {
            if (previewImage) {
              previewImage.src = e.target.result;
              previewImage.alt = file.name;
            }
            showImage();
          };
          reader.readAsDataURL(file);
        } else if (fileIcons[extension]) {
          // Show FontAwesome icon
          showIcon(fileIcons[extension], extension);
        } else {
          // Show default file icon
          showIcon("fas fa-file", "default");
        }
      } else {
        // Reset to default
        if (previewImage) {
          previewImage.src = defaultSrc;
          previewImage.alt = "Casey Horner";
        }
        if (fileName) {
          fileName.textContent = "";
        }
        showImage();
      }
    });
    // Click handlers
    if (previewImage) {
      previewImage.addEventListener("click", function () {
        if (fileInput) {
          fileInput.click();
        }
      });
    }

    if (faIcon) {
      faIcon.addEventListener("click", function () {
        if (fileInput) {
          fileInput.click();
        }
      });
    }
  }

  generateCheckboxInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let checkboxHTML = "";

    // Add group label/title outside the grid
    checkboxHTML += `<div class="form-nexa-group-checkbox mb-10px">`;
    checkboxHTML += `<div class="mb-10px">${placeholder}</div>`;
    checkboxHTML += `<div class="nx-checkbox-grid">`;

    if (options && Array.isArray(options)) {
      // Multiple checkboxes for single selection behavior
      options.forEach((option, index) => {
        const checkboxId = `${fieldName}_${index}`;
        checkboxHTML += `<div class="nx-checkbox-item">`;
        checkboxHTML += `<input type="checkbox" id="${checkboxId}" name="${fieldName}" value="${option.value}" data-label="${option.value}" class="single-select-checkbox" />`;
        checkboxHTML += `<label for="${checkboxId}">`;
        checkboxHTML += `<span class="nx-checkmark"></span>`;
        checkboxHTML += `<span class="nx-checkbox-text">${option.text}</span>`;
        checkboxHTML += `</label>`;
        checkboxHTML += `<small id="errors_${checkboxId}" class="error-message"></small>`;
        checkboxHTML += `</div>`;
      });
    } else {
      // Single checkbox (fallback)
      const value = options?.value || fieldName;
      const label = options?.label || placeholder;
      checkboxHTML += `<div class="nx-checkbox-item">`;
      checkboxHTML += `<input type="checkbox" id="${fieldName}" name="${fieldName}" value="${value}" data-label="${value}" />`;
      checkboxHTML += `<label for="${fieldName}">`;
      checkboxHTML += `<span class="nx-checkmark"></span>`;
      checkboxHTML += `<span class="nx-checkbox-text">${placeholder}</span>`;
      checkboxHTML += `</label>`;
      checkboxHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
      checkboxHTML += `</div>`;
    }

    checkboxHTML += `</div>`; // Close nx-checkbox-grid
    checkboxHTML += `</div>`; // Close nx-checkbox-grid
    return checkboxHTML;
  }

  generateRadioInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let radioHTML = "";
    console.log(options);
    // Add group label/title outside the grid
    radioHTML += `<div class="form-nexa-group-checkbox mb-10px">`;
    radioHTML += `<div class="mb-10px">${placeholder}</div>`;
    radioHTML += `<div class="nx-radio-grid">`;

    if (options) {
      options.forEach((option, index) => {
        console.log(option);
        const radioId = `${fieldName}_${index}`;
        radioHTML += `<div class="nx-radio-item">`;
        radioHTML += `<input type="radio" id="${radioId}" name="${fieldName}" value="${option.value}" data-label="${option.value}" />`;
        radioHTML += `<label for="${radioId}">`;
        radioHTML += `<span class="nx-radio-mark"></span>`;
        radioHTML += `<span class="nx-radio-text">${option.text}</span>`;
        radioHTML += `</label>`;
        radioHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
        radioHTML += `</div>`;
      });
    }

    radioHTML += `</div>`; // Close nx-radio-grid
    radioHTML += `</div>`; // Close nx-radio-grid
    return radioHTML;
  }

  generateSwitchInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let switchHTML = "";

    // Add group label/title outside the grid
    switchHTML += `<div class="form-nexa-group-checkbox mb-10px">`;
    switchHTML += `<div class="mb-10px">${placeholder}</div>`;
    switchHTML += `<div class="nx-switch-grid">`;

    if (options && Array.isArray(options)) {
      // Multiple switches for single selection - use radio behavior
      options.forEach((option, index) => {
        const switchId = `${fieldName}_${index}`;
        const isChecked = option.checked ? "checked" : "";
        switchHTML += `<div class="nx-switch-item">`;
        // Use radio type but styled as switch for single selection
        switchHTML += `<input type="checkbox" id="${switchId}" name="${fieldName}" value="${option.value}" data-label="${option.value}" class="single-select-switch" ${isChecked} />`;
        switchHTML += `<label for="${switchId}">`;
        switchHTML += `<span class="nx-switch"></span>`;
        switchHTML += `<span class="nx-switch-text">${option.text}</span>`;
        switchHTML += `</label>`;
        switchHTML += `<small id="errors_${switchId}" class="error-message"></small>`;
        switchHTML += `</div>`;
      });
    } else {
      // Single switch (fallback)
      const value = options?.value || fieldName;
      const label = options?.label || placeholder;
      const isChecked = options?.checked ? "checked" : "";
      switchHTML += `<div class="nx-switch-item">`;
      switchHTML += `<input type="checkbox" id="${fieldName}" name="${fieldName}" value="${value}" data-label="${value}" ${isChecked} />`;
      switchHTML += `<label for="${fieldName}">`;
      switchHTML += `<span class="nx-switch"></span>`;
      switchHTML += `<span class="nx-switch-text">${placeholder}</span>`;
      switchHTML += `</label>`;
      switchHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
      switchHTML += `</div>`;
    }

    switchHTML += `</div>`; // Close nx-switch-grid
    switchHTML += `</div>`; // Close nx-switch-grid
    return switchHTML;
  }

  generateTextareaInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    const options = this.getOptions(fieldName);
    let attributes = "";

    if (options) {
      if (options.rows) attributes += ` rows="${options.rows}"`;
      if (options.cols) attributes += ` cols="${options.cols}"`;
    }

    return `<textarea id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr}${attributes}></textarea>`;
  }

  generateHiddenInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    const value = options?.value || "";
    return `<input type="hidden" id="${fieldName}" name="${fieldName}" value="${value}" />`;
  }

  generateSubmitButton(data) {
    const style = this.getFormStyle();
    const buttonType = style.button || "nx-btn-primary";
    const isGrid = this.hasGridColumns();
    if (!this.options.footer) {
      return "";
    }
    return `
   <div class="nx-content-footer">
     <div class="nx-footer-custom"></div>
        <div class="nx-footer-buttons">
         <button type="button" class="btn btn-secondary">Cancel</button>
         <button type="button" class="${
           this.settings.buttontype || "btn btn-primary"
         }" id="sendContent_${
      data.id
    }" data-original-text="Submit">Submit</button>
       </div>
      </div>
    </div>

    `;
  }

  /**
   * Get field configuration from new structure
   * @param {string} fieldName
   * @returns {Object}
   */
  getFieldConfig(fieldName) {
    if (!this.formData.form || !this.formData.form[fieldName]) {
      return {};
    }
    return this.formData.form[fieldName];
  }

  /**
   * Get placeholder for field
   * @param {string} fieldName
   * @returns {string}
   */
  getPlaceholder(fieldName) {
    const fieldConfig = this.getFieldConfig(fieldName);
    return fieldConfig.placeholder || fieldConfig.label || fieldName;
  }

  /**
   * Get icon for field
   * @param {string} fieldName
   * @returns {string|null}
   */
  getIcon(fieldName) {
    const fieldConfig = this.getFieldConfig(fieldName);
    return fieldConfig.icons || null;
  }

  /**
   * Get options for select/radio/checkbox fields
   * @param {string} fieldName
   * @returns {Array|null}
   */
  getOptions(fieldName) {
    const fieldConfig = this.getFieldConfig(fieldName);
    return fieldConfig.options || null;
  }

  /**
   * Get grid class for field
   * @param {string} fieldName
   * @returns {string|null}
   */
  getGridClass(fieldName) {
    const fieldConfig = this.getFieldConfig(fieldName);
    return fieldConfig.columnWidth || null;
  }

  createFormElement(htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    return tempDiv.firstElementChild;
  }

  attachEventListeners() {
    if (!this.formElement) return;

    // Handle search inputs
    const searchInputs = this.formElement.querySelectorAll(
      ".form-nexa-search-input"
    );
    searchInputs.forEach((input) => {
      this.attachSearchEvents(input);
    });

    // Handle form submission
    this.formElement.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Handle floating labels for all inputs
    const inputs = this.formElement.querySelectorAll(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
    );
    inputs.forEach((input) => {
      this.handleFloatingLabel(input);
    });

    // File upload is now handled directly in generateFileInput with setTimeout

    // Handle range inputs
    const rangeInputs = this.formElement.querySelectorAll(
      'input[type="range"]'
    );
    rangeInputs.forEach((rangeInput) => {
      this.attachRangeEvents(rangeInput);
    });

    // Handle checkbox and radio inputs
    const checkboxInputs = this.formElement.querySelectorAll(
      'input[type="checkbox"], input[type="radio"]'
    );
    checkboxInputs.forEach((input) => {
      this.attachCheckboxRadioEvents(input);
    });

    // Handle single-select behavior for checkboxes and switches
    this.attachSingleSelectBehavior();
  }

  attachSearchEvents(input) {
    const container = input.closest(".form-nexa-search-container");
    const dropdown = container.querySelector(".form-nexa-search-dropdown");
    const items = container.querySelectorAll(".form-nexa-search-item");

    input.addEventListener("focus", () => {
      container.classList.add("active");
    });

    input.addEventListener("blur", (e) => {
      // Delay hiding to allow click on items
      setTimeout(() => {
        container.classList.remove("active");
      }, 200);
    });

    input.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(value) ? "block" : "none";
      });
    });

    items.forEach((item) => {
      item.addEventListener("click", () => {
        input.value = item.textContent;
        input.setAttribute("data-value", item.getAttribute("data-value"));
        container.classList.remove("active");
        this.triggerFloatingLabel(input);
      });
    });
  }

  handleFloatingLabel(element) {
    // Cache label reference for performance
    const label = this.findLabelForElement(element);

    if (!label || label.tagName !== "LABEL") {
      return; // Exit early if no label found
    }

    const updateLabel = () => {
      if (element.value && element.value !== "") {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    };

    const handleFocus = () => {
      label.classList.add("active");
    };

    // Optimized: Only use essential events with cached label
    element.addEventListener("input", updateLabel); // Real-time updates
    element.addEventListener("focus", handleFocus); // Focus handling
    element.addEventListener("blur", updateLabel); // Blur handling

    // Initial check
    updateLabel();
  }

  // Smart label finder for different input structures
  findLabelForElement(element) {
    // Method 1: Standard structure - label is nextElementSibling
    let label = element.nextElementSibling;

    // If next sibling is icon, get the sibling after icon
    if (label && label.tagName === "I") {
      label = label.nextElementSibling;
    }

    // Method 2: If label found and is LABEL, return it
    if (label && label.tagName === "LABEL") {
      return label;
    }

    // Method 3: For search inputs, look for label in parent container
    const isSearchInput = element.closest(".form-nexa-search-container");
    if (isSearchInput) {
      // For search inputs, the label is typically after the entire search structure
      const searchWrapper = element.closest(".form-nexa-search");
      if (searchWrapper && searchWrapper.nextElementSibling) {
        let nextElement = searchWrapper.nextElementSibling;

        // If there's an icon after search wrapper, label is after icon
        if (nextElement && nextElement.tagName === "I") {
          nextElement = nextElement.nextElementSibling;
        }

        if (nextElement && nextElement.tagName === "LABEL") {
          return nextElement;
        }
      }

      // Alternative: look in parent floating container
      const floatingContainer = element.closest(".form-nexa-floating");
      if (floatingContainer) {
        const labelInContainer = floatingContainer.querySelector(
          `label[for="${element.name}"]`
        );
        if (labelInContainer) {
          return labelInContainer;
        }
      }
    }

    // Method 4: Generic fallback - find by 'for' attribute
    const formElement = element.closest("form") || document;
    return (
      formElement.querySelector(`label[for="${element.name}"]`) ||
      formElement.querySelector(`label[for="${element.id}"]`)
    );
  }

  triggerFloatingLabel(input) {
    // Use smart label finder for consistency
    let label = this.findLabelForElement(input);

    if (label && label.tagName === "LABEL") {
      if (input.value && input.value !== "") {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    }
  }

  attachRangeEvents(rangeInput) {
    // Create value display
    const valueDisplay = document.createElement("div");
    valueDisplay.className = "form-nexa-range-value";
    valueDisplay.textContent = rangeInput.value;
    rangeInput.parentNode.insertBefore(valueDisplay, rangeInput.nextSibling);

    rangeInput.addEventListener("input", (e) => {
      valueDisplay.textContent = e.target.value;
    });

    rangeInput.addEventListener("change", (e) => {
      valueDisplay.textContent = e.target.value;
    });
  }

  attachCheckboxRadioEvents(input) {
    // Add change event for data handling
    input.addEventListener("change", (e) => {
      // Trigger custom validation or events
      const event = new CustomEvent("nexaInputChange", {
        detail: {
          name: input.name,
          value: input.type === "checkbox" ? input.checked : input.value,
          type: input.type,
        },
      });
      document.dispatchEvent(event);
    });

    // Ensure proper click handling
    input.addEventListener("click", (e) => {
      // Let the default behavior work
      e.stopPropagation();
    });
  }

  attachSingleSelectBehavior() {
    if (!this.formElement) {
      console.warn("No form element found for single select behavior");
      return;
    }

    // Handle single-select checkboxes
    const singleSelectCheckboxes = this.formElement.querySelectorAll(
      ".single-select-checkbox"
    );

    singleSelectCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          // Uncheck all other checkboxes with the same name
          const sameName = this.formElement.querySelectorAll(
            `input[name="${e.target.name}"].single-select-checkbox`
          );

          sameName.forEach((other) => {
            if (other !== e.target) {
              other.checked = false;
            }
          });
        }
      });
    });

    // Handle single-select switches
    const singleSelectSwitches = this.formElement.querySelectorAll(
      ".single-select-switch"
    );

    singleSelectSwitches.forEach((switchEl) => {
      switchEl.addEventListener("change", (e) => {
        if (e.target.checked) {
          // Uncheck all other switches with the same name
          const sameName = this.formElement.querySelectorAll(
            `input[name="${e.target.name}"].single-select-switch`
          );
        }
      });
    });
  }

  handleSubmit() {
    const formData = this.getFormData();
    const style = this.getFormStyle();

    if (style.validation) {
      const validation = this.validateForm(formData);
      if (!validation.isValid) {
        this.displayErrors(validation.errors);
        return;
      }
    }

    // Clear any existing errors
    this.clearErrors();

    // Trigger custom event dengan metadata form
    const event = new CustomEvent("nexaFormSubmit", {
      detail: {
        formData,
        formId: this.formId,
        className: this.className,
        tableName: this.tableName,
        tableKey: this.formData.tableKey,
        formMeta: {
          id: this.formData.id,
          version: this.formData.version,
          store: this.formData.store,
          label: this.formData.label,
        },
      },
    });
    document.dispatchEvent(event);
  }

  getFormData() {
    const formData = {};
    const inputs = this.formElement.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      if (!input.name) return; // Skip inputs without names

      switch (input.type) {
        case "checkbox":
          // Handle checkboxes
          if (input.checked) {
            // Use label from data-label attribute if available, otherwise use value for checked state
            const value = input.getAttribute("data-label") || input.value;
            console.log(
              `📋 Checkbox processed: name="${input.name}", value="${
                input.value
              }", label="${input.getAttribute("data-label")}", final="${value}"`
            );

            // For single-select checkboxes and switches, store the selected value
            if (
              input.classList.contains("single-select-checkbox") ||
              input.classList.contains("single-select-switch")
            ) {
              formData[input.name] = value;
              console.log(
                `✅ Single-select stored: ${input.name} = "${value}"`
              );
            } else {
              // For regular checkboxes, use boolean or collect multiple values
              if (input.name.endsWith("[]")) {
                const fieldName = input.name.slice(0, -2); // Remove '[]' from name
                if (!formData[fieldName]) {
                  formData[fieldName] = [];
                }
                formData[fieldName].push(value);
              } else {
                formData[input.name] = input.checked;
              }
            }
          }
          break;

        case "radio":
          if (input.checked) {
            // Use label from data-label attribute if available, otherwise use value
            const value = input.getAttribute("data-label") || input.value;
            formData[input.name] = value;
            console.log(
              `📻 Radio processed: name="${input.name}", value="${
                input.value
              }", label="${input.getAttribute("data-label")}", final="${value}"`
            );
          }
          break;

        case "file":
          if (input.files.length > 0) {
            formData[input.name] = input.multiple
              ? Array.from(input.files)
              : input.files[0];
          } else {
            formData[input.name] = null;
          }
          break;

        case "text":
          if (input.classList.contains("form-nexa-search-input")) {
            formData[input.name] = {
              value: input.getAttribute("data-value") || input.value,
              label: input.value,
            };
          } else {
            formData[input.name] = input.value;
          }
          break;

        case "number":
          formData[input.name] = input.value ? parseFloat(input.value) : null;
          break;

        case "range":
          formData[input.name] = parseFloat(input.value);
          break;

        case "color":
          formData[input.name] = input.value;
          break;

        case "date":
        case "datetime-local":
        case "time":
        case "month":
        case "week":
          formData[input.name] = input.value ? new Date(input.value) : null;
          break;

        case "hidden":
          formData[input.name] = input.value;
          break;

        default:
          // Handle select, email, password, tel, url, textarea, etc.
          if (input.tagName.toLowerCase() === "select") {
            // For select elements, try to get the label of selected option
            const selectedOption = input.options[input.selectedIndex];
            const finalValue = selectedOption
              ? selectedOption.text
              : input.value;
            formData[input.name] = finalValue;
            console.log(
              `📝 Select processed: name="${input.name}", selectedValue="${input.value}", selectedText="${selectedOption?.text}", final="${finalValue}"`
            );
          } else {
            formData[input.name] = input.value;
          }
      }
    });

    return formData;
  }

  validateForm(formData) {
    const errors = {};
    let isValid = true;

    // Validasi berdasarkan field configuration dari format baru dengan urutan
    const orderedFields = this.getOrderedFields();
    for (const [fieldName, fieldConfig] of orderedFields) {
      // Skip field 'id' jika mode adalah 'insert'
      if (fieldName === "id" && this.options.mode === "insert") {
        continue;
      }

      // Skip field jika bukan type "search" dan options.type === "search"
      if (this.options.type === "search" && fieldConfig.type !== "search") {
        continue;
      }

      const value = formData[fieldName];
      const validation = fieldConfig.validation;
      const placeholder =
        fieldConfig.placeholder || fieldConfig.label || fieldName;

      // Cek required field (validation = "2" atau validation = true)
      if (validation === "2" || validation === true || validation === 2) {
        if (!value || (typeof value === "object" && !value.value)) {
          errors[fieldName] = `${placeholder} wajib diisi`;
          isValid = false;
        }
      }

      // Validasi tambahan berdasarkan tipe field
      if (value) {
        switch (fieldConfig.type) {
          case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[
                fieldName
              ] = `${placeholder} harus berupa email yang valid`;
              isValid = false;
            }
            break;
          case "number":
            if (isNaN(value)) {
              errors[fieldName] = `${placeholder} harus berupa angka`;
              isValid = false;
            }
            break;
          case "url":
            try {
              new URL(value);
            } catch {
              errors[fieldName] = `${placeholder} harus berupa URL yang valid`;
              isValid = false;
            }
            break;
        }
      }
    }

    return { isValid, errors };
  }

  displayErrors(errors) {
    for (const [fieldName, errorMessage] of Object.entries(errors)) {
      const errorElement = document.getElementById(`errors_${fieldName}`);
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = "block";
      }

      // Add error class to form container
      const input = document.getElementById(fieldName);
      if (input) {
        const formContainer = input.closest(".form-nexa-floating, .form-nexa");
        if (formContainer) {
          formContainer.classList.add("form-error");
        }
      }
    }
  }

  clearErrors() {
    const errorElements = this.formElement.querySelectorAll('[id^="errors_"]');
    errorElements.forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    const formContainers = this.formElement.querySelectorAll(".form-error");
    formContainers.forEach((container) => {
      container.classList.remove("form-error");
    });
  }

  // NOTE: File uploads are now handled by inline scripts in generateFileInput()
  // This method is no longer needed since each field has its own script
  // initializeFileUploads() - REMOVED

  // Public methods
  render(container) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    if (container && this.formElement) {
      container.appendChild(this.formElement);
    }

    return this.formElement;
  }

  destroy() {
    if (this.formElement && this.formElement.parentNode) {
      this.formElement.parentNode.removeChild(this.formElement);
    }
  }

  reset(modalId = null) {
    // If modalId provided, find form inside modal
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Find form inside modal
        const form =
          modal.querySelector("form") || modal.querySelector(`#${this.formId}`);
        if (form && typeof form.reset === "function") {
          form.reset();
          // Reset floating labels in modal
          const activeLabels = modal.querySelectorAll(
            ".form-nexa-floating label.active"
          );
          activeLabels.forEach((label) => label.classList.remove("active"));
          // console.log(
          //   `✅ Reset form and ${activeLabels.length} floating labels in modal: ${modalId}`
          // );
          return;
        }
      }
    }

    // Default reset for this.formElement
    if (this.formElement) {
      this.formElement.reset();
      this.clearErrors();

      // Reset floating labels
      const labels = this.formElement.querySelectorAll("label.active");
      labels.forEach((label) => label.classList.remove("active"));
      //console.log(`✅ Reset form and ${labels.length} floating labels`);
    }
  }

  setData(data) {
    if (!this.formElement) return;

    for (const [fieldName, value] of Object.entries(data)) {
      const input = this.formElement.querySelector(`[name="${fieldName}"]`);
      if (!input) continue;

      switch (input.type) {
        case "checkbox":
          // Handle multiple checkboxes
          const checkboxes = this.formElement.querySelectorAll(
            `[name="${fieldName}"], [name="${fieldName}[]"]`
          );

          if (checkboxes.length > 1 && Array.isArray(value)) {
            // Multiple checkboxes with array values
            checkboxes.forEach((checkbox) => {
              checkbox.checked = value.includes(checkbox.value);
            });
          } else if (checkboxes.length === 1) {
            // Single checkbox
            checkboxes[0].checked = Boolean(value);
          } else {
            // Fallback for single input found
            input.checked = Boolean(value);
          }
          break;

        case "radio":
          const radioButtons = this.formElement.querySelectorAll(
            `[name="${fieldName}"]`
          );
          radioButtons.forEach((radio) => {
            radio.checked = radio.value === value;
          });
          break;

        case "file":
          // File inputs cannot be programmatically set for security reasons
          console.warn(`Cannot set value for file input: ${fieldName}`);
          break;

        case "text":
          if (
            input.classList.contains("form-nexa-search-input") &&
            typeof value === "object"
          ) {
            input.value = value.label || "";
            input.setAttribute("data-value", value.value || "");
          } else {
            input.value = value || "";
          }
          this.triggerFloatingLabel(input);
          break;

        case "number":
        case "range":
          input.value = value !== null && value !== undefined ? value : "";
          this.triggerFloatingLabel(input);
          break;

        case "color":
          input.value = value || "#000000";
          break;

        case "date":
        case "datetime-local":
        case "time":
        case "month":
        case "week":
          if (value instanceof Date) {
            if (input.type === "date") {
              input.value = value.toISOString().split("T")[0];
            } else if (input.type === "datetime-local") {
              input.value = value.toISOString().slice(0, 16);
            } else if (input.type === "time") {
              input.value = value.toTimeString().slice(0, 5);
            } else if (input.type === "month") {
              input.value = value.toISOString().slice(0, 7);
            } else if (input.type === "week") {
              const year = value.getFullYear();
              const week = Math.ceil(
                ((value - new Date(year, 0, 1)) / 86400000 + 1) / 7
              );
              input.value = `${year}-W${week.toString().padStart(2, "0")}`;
            }
          } else if (typeof value === "string") {
            input.value = value;
          }
          this.triggerFloatingLabel(input);
          break;

        default:
          // Handle select, email, password, tel, url, textarea, hidden, etc.
          input.value = value || "";
          this.triggerFloatingLabel(input);
      }
    }
  }

  getData() {
    return this.getFormData();
  }

  /**
   * Set form mode (insert/update)
   * @param {string} mode - 'insert' atau 'update'
   */
  setMode(mode) {
    this.options.mode = mode;

    // Re-generate form jika sudah di-render
    if (this.formElement) {
      this.generateForm();

      // Re-render jika form sudah ada di DOM
      const existingForm = document.getElementById(this.formId);
      if (existingForm && existingForm.parentNode) {
        existingForm.parentNode.replaceChild(this.formElement, existingForm);
        this.attachEventListeners();
      }
    }

    console.log(`🔄 Form mode changed to: ${mode}`);
  }

  /**
   * Get current form mode
   * @returns {string}
   */
  getMode() {
    return this.options.mode;
  }

  /**
   * Get validation configuration for all fields
   * @returns {Object} Object dengan field name sebagai key dan validation level sebagai value
   */
  validasi() {
    const validationConfig = {};

    if (!this.formData.form) {
      return validationConfig;
    }

    // Loop through ordered fields dan ambil validation level
    const orderedFields = this.getOrderedFields();
    for (const [fieldName, fieldConfig] of orderedFields) {
      // Skip field 'id' jika mode adalah 'insert'
      if (fieldName === "id" && this.options.mode === "insert") {
        continue;
      }

      // Skip field jika bukan type "search" dan options.type === "search"
      if (this.options.type === "search" && fieldConfig.type !== "search") {
        continue;
      }

      const validation = fieldConfig.validation;

      // Convert validation ke format yang konsisten
      if (validation === "2" || validation === 2) {
        validationConfig[fieldName] = 2; // Required
      } else if (validation === "1" || validation === 1) {
        validationConfig[fieldName] = 1; // Optional with validation
      } else {
        validationConfig[fieldName] = 0; // No validation
      }
    }

    return validationConfig;
  }

  /**
   * Get validation info for specific field
   * @param {string} fieldName - Nama field
   * @returns {Object} Informasi validasi field
   */
  getFieldValidation(fieldName) {
    const fieldConfig = this.getFieldConfig(fieldName);
    const validation = fieldConfig.validation;

    return {
      fieldName,
      level:
        validation === "2" || validation === 2
          ? 2
          : validation === "1" || validation === 1
          ? 1
          : 0,
      required: validation === "2" || validation === 2,
      label: fieldConfig.label || fieldConfig.placeholder || fieldName,
      type: fieldConfig.type || "text",
    };
  }

  /**
   * Get all validation info with detailed information
   * @returns {Object} Detailed validation information
   */
  getValidationInfo() {
    const validationInfo = {};

    if (!this.formData.form) {
      return validationInfo;
    }

    // Loop through ordered fields
    const orderedFields = this.getOrderedFields();
    for (const [fieldName, fieldConfig] of orderedFields) {
      // Skip field 'id' jika mode adalah 'insert'
      if (fieldName === "id" && this.options.mode === "insert") {
        continue;
      }

      // Skip field jika bukan type "search" dan options.type === "search"
      if (this.options.type === "search" && fieldConfig.type !== "search") {
        continue;
      }

      validationInfo[fieldName] = this.getFieldValidation(fieldName);
    }

    return validationInfo;
  }

  html() {
    const formHTML = this.formElement
      ? this.formElement.outerHTML
      : this.buildFormHTML();

    // Jika floating labels enabled, tambahkan inline JavaScript
    const style = this.getFormStyle();
    if (style.floating) {
      setTimeout(() => {
        this.generateFloatingLabelsScript();
      }, 0);

      return formHTML;
    }

    return formHTML;
  }

  htmlString() {
    return this.buildFormHTML();
  }

  // Generate inline JavaScript untuk floating labels (auto-execute)
  generateFloatingLabelsScript() {
    const formId = this.formId;

    // Wait for DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initFloatingLabels);
    } else {
      initFloatingLabels();
    }

    function initFloatingLabels() {
      // Find the form
      const form =
        document.getElementById(formId) ||
        document.querySelector("form.nexa-floating-form");
      if (!form) {
        console.warn("[NexaFloating] Form not found for floating labels");
        return;
      }

      // Find all inputs that support floating labels
      const inputs = form.querySelectorAll(
        'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
      );

      // Setup floating for each input
      inputs.forEach(function (input, index) {
        setupFloatingForInput(input);
      });
    }

    function setupFloatingForInput(input) {
      // Smart label finder
      function findLabel(input) {
        // Method 1: Find by 'for' attribute
        let label =
          document.querySelector('label[for="' + input.name + '"]') ||
          document.querySelector('label[for="' + input.id + '"]');
        if (label) return label;

        // Method 2: Find in floating container
        const container = input.closest(".form-nexa-floating");
        if (container) {
          label = container.querySelector("label");
          if (label) return label;
        }

        // Method 3: Sibling search
        label = input.nextElementSibling;
        if (label && label.tagName === "I") {
          label = label.nextElementSibling; // Skip icon
        }
        if (label && label.tagName === "LABEL") return label;

        // Method 4: Parent search
        const parent = input.parentElement;
        if (parent) {
          label = parent.querySelector("label");
          if (label) return label;
        }

        return null;
      }

      // Floating handler function
      function handleFloating() {
        const label = findLabel(input);
        if (label && label.tagName === "LABEL") {
          if (input.value && input.value.trim() !== "") {
            label.classList.add("active");
          } else {
            label.classList.remove("active");
          }
        }
      }

      // Focus handler - always activate on focus
      function handleFocus() {
        const label = findLabel(input);
        if (label && label.tagName === "LABEL") {
          label.classList.add("active");
        }
      }

      // Optimized: Only essential events
      input.addEventListener("input", handleFloating);
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleFloating);

      // Initial check
      handleFloating();
    }

    // Add single-select behavior for checkboxes and switches
    function initSingleSelectBehavior() {
      // Handle single-select checkboxes
      const singleSelectCheckboxes = document.querySelectorAll(
        ".single-select-checkbox"
      );

      singleSelectCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", function (e) {
          if (e.target.checked) {
            // Uncheck all other checkboxes with the same name
            const sameName = document.querySelectorAll(
              'input[name="' + e.target.name + '"].single-select-checkbox'
            );

            sameName.forEach(function (other) {
              if (other !== e.target) {
                console.log("Unchecking other checkbox: " + other.id);
                other.checked = false;
              }
            });
          }
        });
      });

      // Handle single-select switches
      const singleSelectSwitches = document.querySelectorAll(
        ".single-select-switch"
      );

      singleSelectSwitches.forEach(function (switchEl) {
        switchEl.addEventListener("change", function (e) {
          if (e.target.checked) {
            // Uncheck all other switches with the same name
            const sameName = document.querySelectorAll(
              'input[name="' + e.target.name + '"].single-select-switch'
            );

            sameName.forEach(function (other) {
              if (other !== e.target) {
                console.log("Unchecking other switch: " + other.id);
                other.checked = false;
              }
            });
          }
        });
      });
    }

    // Initialize everything
    initFloatingLabels();
    initSingleSelectBehavior();
  }

  // Method khusus untuk initialize floating labels setelah HTML di-insert ke DOM
  initializeFloatingLabels(containerSelector) {
    // Find the container
    const container =
      typeof containerSelector === "string"
        ? document.querySelector(containerSelector)
        : containerSelector;

    if (!container) {
      console.error("[DEBUG] Container not found:", containerSelector);
      return;
    }

    // Find the form inside container
    this.formElement =
      container.querySelector(`#${this.formId}`) ||
      container.querySelector("form") ||
      container; // If container is the form itself

    if (!this.formElement) {
      console.error("[DEBUG] Form not found in container");
      return;
    }

    // Attach event listeners for floating labels
    this.attachFloatingLabelEvents();

    // Attach other events
    this.attachEventListeners();

    // Attach single select behavior for HTML mode
    this.attachSingleSelectBehavior();

    return this;
  }

  // Dedicated method for floating label events only
  attachFloatingLabelEvents() {
    if (!this.formElement) return;

    // Handle floating labels for all inputs
    const inputs = this.formElement.querySelectorAll(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
    );

    inputs.forEach((input, index) => {
      this.handleFloatingLabel(input);
    });
  }

  // Quick method untuk manual floating setup (emergency)
  setupFloatingLabelsManual(containerSelector) {
    const container =
      typeof containerSelector === "string"
        ? document.querySelector(containerSelector)
        : containerSelector;

    if (!container) {
      console.error("[DEBUG] Container not found");
      return;
    }

    // Find all inputs in container
    const inputs = container.querySelectorAll(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
    );

    inputs.forEach((input, index) => {
      // Universal floating label handler
      const handleFloating = () => {
        // Find label for this input
        let label = this.findLabelForInput(input);

        if (label && label.tagName === "LABEL") {
          if (input.value && input.value.trim() !== "") {
            label.classList.add("active");
          } else {
            label.classList.remove("active");
          }
        } else {
        }
      };

      // Optimized: Only essential events
      input.addEventListener("input", handleFloating);
      input.addEventListener("focus", handleFloating);
      input.addEventListener("blur", handleFloating);

      // Initial check
      handleFloating();
    });
  }

  // Simplified label finder for manual mode
  findLabelForInput(input) {
    // Method 1: Find by 'for' attribute (most reliable)
    const container = input.closest("form") || document;
    let label =
      container.querySelector(`label[for="${input.name}"]`) ||
      container.querySelector(`label[for="${input.id}"]`);

    if (label) return label;

    // Method 2: Find in same floating container
    const floatingContainer = input.closest(".form-nexa-floating");
    if (floatingContainer) {
      label = floatingContainer.querySelector("label");
      if (label) return label;
    }

    // Method 3: Standard sibling search
    label = input.nextElementSibling;
    if (label && label.tagName === "I") {
      label = label.nextElementSibling; // Skip icon
    }
    if (label && label.tagName === "LABEL") return label;

    // Method 4: Search in parent
    const parent = input.parentElement;
    if (parent) {
      label = parent.querySelector("label");
      if (label) return label;
    }

    return null;
  }

  // Reset all floating labels
  resetFloatingLabels() {
    const allLabels = this.formElement.querySelectorAll(
      ".form-nexa-floating label"
    );
    allLabels.forEach((label) => {
      label.classList.remove("active");
    });
  }

  // Force activate all floating labels (for testing)
  forceActivateAllLabels() {
    const allLabels = this.formElement.querySelectorAll(
      ".form-nexa-floating label"
    );
    allLabels.forEach((label, index) => {
      label.classList.add("active");
    });

    // Test if CSS is applied
    setTimeout(() => {
      allLabels.forEach((label, index) => {
        const styles = window.getComputedStyle(label);
      });
    }, 200);
  }

  // Global debug functions for single select
}
