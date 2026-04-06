export function FieldOptions(variable, type, data) {
  // Ensure form object exists
  if (!data.form) {
    data.form = {};
  }

  let items = data.form[variable]?.select.data;

  // Handle different data structures
  let optionsList = null;
  let fieldType = "select";
  let timestamp = new Date().toISOString();

  if (items) {
    // Check if items is an array (database select data structure)
    if (Array.isArray(items)) {
      optionsList = items
        .filter(
          (item) => item && (item.label || item.text || item.key || item.value)
        ) // Filter out empty objects
        .map((item) => ({
          text: item.label || item.text || "",
          value: item.key || item.value || "",
        }));
    }
    // Check if items has options property (native select data structure)
    else if (items.options && Array.isArray(items.options)) {
      optionsList = items.options;
      fieldType = items.type || "select";
      timestamp = items.timestamp || timestamp;
    }
    // Check if items is an object with direct options
    else if (items.type) {
      fieldType = items.type;
      timestamp = items.timestamp || timestamp;
      optionsList = items.options || [];
    }
  }

  // If no options found, create default structure
  if (!optionsList) {
    optionsList = [];
    // Set default structure in data.form
    if (!data.form[variable]) {
      data.form[variable] = {};
    }
    // Check if select is boolean true and convert to object
    if (data.form[variable].select === true) {
      data.form[variable].select = {};
    }
    if (
      !data.form[variable].select ||
      typeof data.form[variable].select !== "object"
    ) {
      data.form[variable].select = {};
    }
    data.form[variable].select.data = {
      type: fieldType,
      options: optionsList,
      timestamp: timestamp,
    };
  }

  const modalId = variable + "_" + fieldType;
  let variableName = variable;

  // Fallback: if variable is empty, try to get it from the modal context
  if (!variableName || variableName.trim() === "") {
    // Try to get from URL or other context
    const urlParams = new URLSearchParams(window.location.search);
    const urlVariable = urlParams.get("variable");

    // Try to get from global context
    const globalVariable = window.currentFieldVariable;

    // Try to get from the modal label
    const modalLabel = document.querySelector(".nx-modal-header h3");
    const labelMatch = modalLabel?.textContent?.match(
      /Configure Field "([^"]+)"/
    );

    variableName =
      urlVariable || globalVariable || (labelMatch ? labelMatch[1] : "field");
  }

  const builderType = "form";

  let modalTitle = "";
  let instructionText = "";

  switch (fieldType) {
    case "select":
      modalTitle = "📋 Configure Dropdown Options";
      instructionText = "Configure dropdown options for this field:";
      break;
    case "radio":
      modalTitle = "🔘 Configure Radio Button Options";
      instructionText = "Configure radio button options for this field:";
      break;
    case "checkbox":
      modalTitle = "☑️ Configure Checkbox Options";
      instructionText = "Configure checkbox options for this field:";
      break;
    case "switch":
      modalTitle = "🔄 Configure Switch Toggle Options";
      instructionText = "Configure switch toggle options for this field:";
      break;
  }

  // Generate options HTML
  let optionsHTML = "";

  if (optionsList && optionsList.length > 0) {
    optionsList.forEach((option, index) => {
      const optionText = option.label || option.text || option.value || "";
      const optionValue = option.value || option.text || "";

      optionsHTML += generateOptionRow(
        optionText,
        optionValue,
        index,
        modalId,
        variableName,
        timestamp
      );
    });
  } else {
    // Karena optionsList = null, buat 2 default empty options
    optionsHTML += generateOptionRow(
      "",
      "",
      0,
      modalId,
      variableName,
      timestamp
    );
    optionsHTML += generateOptionRow(
      "",
      "",
      1,
      modalId,
      variableName,
      timestamp
    );
  }

  return `
    <div class="options-container">
      <input type="hidden" id="Field" name="Field" value="${variableName}">
      <input type="hidden" id="timestamp" name="timestamp" value="${timestamp}">
      <div class="modal-header">
        <h4>${modalTitle}</h4>
        <p>${instructionText}</p>
      </div>
      <div class="options-list">
        ${optionsHTML}
      </div>
    </div>
  `;
}

// Helper function untuk generate option row
function generateOptionRow(
  optionText,
  optionValue,
  index,
  modalId,
  variableName,
  timestamp
) {
  return `
    <div class="option-row" data-index="${index}" style="display: flex; align-items: center; margin-bottom: 10px; gap: 10px;">
      <div style="flex: 1;">
        <input id="${variableName}_${index}_text" 
               name="${variableName}_${index}_text" 
               type="text" 
               class="form-nexa-control option-text" 
               placeholder="Option Text" 
               value="${optionText}" 
               style="font-size: 14px;"
               oninput="updateOptionsPreview('${variableName}')">
      </div>
      <div style="flex: 1;">
        <input id="${variableName}_${index}_value" 
               name="${variableName}_${index}_value" 
               type="text" 
               class="form-nexa-control option-value" 
               placeholder="Option Value" 
               value="${optionValue}" 
               style="font-size: 14px;"
               oninput="updateOptionsPreview('${variableName}')">
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button type="button" 
                class="option-up" 
                onclick="moveOptionUp(${index}, '${modalId}')" 
                style="background: none; border: none; cursor: pointer; padding: 2px; color: #666;" 
                title="Move Up">
          <span class="material-symbols-outlined" style="font-size: 16px;">keyboard_arrow_up</span>
        </button>
        <button type="button" 
                class="option-down" 
                onclick="moveOptionDown(${index}, '${modalId}')" 
                style="background: none; border: none; cursor: pointer; padding: 2px; color: #666;" 
                title="Move Down">
          <span class="material-symbols-outlined" style="font-size: 16px;">keyboard_arrow_down</span>
        </button>
      </div>
      <div>
        <button type="button" 
                class="option-delete" 
                onclick="removeOption(${index}, '${modalId}')" 
                style="background: none; border: none; cursor: pointer; padding: 5px; color: #dc3545;" 
                title="Delete Option">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </div>
    </div>
  `;
}

// Window functions untuk menangani option operations
nx.addNewOption = function (modalId) {
  const optionsContainer = document.querySelector(".options-list");
  if (!optionsContainer) return;

  const existingRows = optionsContainer.querySelectorAll(".option-row");
  const newIndex = existingRows.length;

  // Get variable name from hidden field
  const fieldInput = document.getElementById("Field");
  const variableName = fieldInput ? fieldInput.value : "field";

  // Get timestamp from hidden field
  const timestampInput = document.getElementById("timestamp");
  const timestamp = timestampInput
    ? timestampInput.value
    : new Date().toISOString();

  // Create new option row
  const newRowHTML = generateOptionRow(
    "",
    "",
    newIndex,
    modalId,
    variableName,
    timestamp
  );
  optionsContainer.insertAdjacentHTML("beforeend", newRowHTML);

  // Update preview display
  nx.updateOptionsPreview(variableName);

  // Focus on the new text input
  const newTextInput = document.getElementById(
    `${variableName}_${newIndex}_text`
  );
  if (newTextInput) newTextInput.focus();
};

nx.removeOption = function (index, modalId) {
  const optionRow = document.querySelector(
    `.option-row[data-index="${index}"]`
  );

  if (optionRow) {
    // Get the variable name before removing
    const fieldInput = document.getElementById("Field");
    const variableName = fieldInput ? fieldInput.value : "field";

    optionRow.remove();

    // Re-index remaining rows
    reindexOptions();

    // Update preview display
    nx.updateOptionsPreview(variableName);
  }
};

nx.moveOptionUp = function (index, modalId) {
  if (index <= 0) return;

  const currentRow = document.querySelector(
    `.option-row[data-index="${index}"]`
  );
  const previousRow = document.querySelector(
    `.option-row[data-index="${index - 1}"]`
  );

  if (currentRow && previousRow) {
    currentRow.parentNode.insertBefore(currentRow, previousRow);
    reindexOptions();

    // Update preview display
    const fieldInput = document.getElementById("Field");
    const variableName = fieldInput ? fieldInput.value : "field";
    nx.updateOptionsPreview(variableName);
  }
};

nx.moveOptionDown = function (index, modalId) {
  const currentRow = document.querySelector(
    `.option-row[data-index="${index}"]`
  );
  const nextRow = document.querySelector(
    `.option-row[data-index="${index + 1}"]`
  );

  if (currentRow && nextRow) {
    currentRow.parentNode.insertBefore(nextRow, currentRow);
    reindexOptions();

    // Update preview display
    const fieldInput = document.getElementById("Field");
    const variableName = fieldInput ? fieldInput.value : "field";
    nx.updateOptionsPreview(variableName);
  }
};

// Helper function untuk re-index options setelah move/delete
function reindexOptions() {
  const optionRows = document.querySelectorAll(".option-row");
  const fieldInput = document.getElementById("Field");
  let variableName = fieldInput ? fieldInput.value : "field";

  // Fallback methods if variable name is empty
  if (!variableName || variableName.trim() === "") {
    variableName = window.currentFieldVariable || "field";
  }

  optionRows.forEach((row, newIndex) => {
    row.setAttribute("data-index", newIndex);

    // Update input IDs dan names
    const textInput = row.querySelector(".option-text");
    const valueInput = row.querySelector(".option-value");
    const upButton = row.querySelector(".option-up");
    const downButton = row.querySelector(".option-down");
    const deleteButton = row.querySelector(".option-delete");

    if (textInput) {
      textInput.id = `${variableName}_${newIndex}_text`;
      textInput.name = `${variableName}_${newIndex}_text`;
    }

    if (valueInput) {
      valueInput.id = `${variableName}_${newIndex}_value`;
      valueInput.name = `${variableName}_${newIndex}_value`;
    }

    // Update button onclick handlers
    if (upButton) {
      upButton.setAttribute("onclick", `window.moveOptionUp(${newIndex}, '')`);
    }

    if (downButton) {
      downButton.setAttribute(
        "onclick",
        `window.moveOptionDown(${newIndex}, '')`
      );
    }

    if (deleteButton) {
      deleteButton.setAttribute(
        "onclick",
        `window.removeOption(${newIndex}, '')`
      );
    }
  });
}

// Function untuk update preview display secara real-time
nx.updateOptionsPreview = function (variableName) {
  // Cari preview display element di main UI
  const previewElement = document.getElementById(
    `optionsDisplay_${variableName}`
  );
  if (!previewElement) {
    return;
  }

  // Kumpulkan data options dari modal
  const optionRows = document.querySelectorAll(".option-row");
  const options = [];

  optionRows.forEach((row, index) => {
    const textInput = row.querySelector(".option-text");
    const valueInput = row.querySelector(".option-value");

    if (textInput && valueInput) {
      const text = textInput.value.trim();
      const value = valueInput.value.trim();

      // Hanya tambahkan jika ada text atau value
      if (text || value) {
        options.push({
          id: `${variableName}_${index}`,
          text: text || "Empty Text",
          value: value || "Empty Value",
        });
      }
    }
  });

  // Generate HTML preview seperti di select.js
  let optionsDisplay = "";
  if (options.length > 0) {
    optionsDisplay = options
      .map(
        (option, index) => `
        <div class="option-item" style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-bottom: 1px solid #eee; font-size: 12px;">
          <span style="flex: 1;">
            <strong>${index + 1}. ${option.text}</strong> 
            <span style="color: #666;">(${option.value})</span>
          </span>
          <span style="color: #999; font-size: 10px;">${option.id}</span>
        </div>
      `
      )
      .join("");
  } else {
    optionsDisplay = `
      <div style="padding: 20px; text-align: center; color: #666; font-style: italic;">
        No options configured yet.
      </div>
    `;
  }

  // Update preview display
  previewElement.innerHTML = optionsDisplay;

  // Update counter di button
  const buttonElement = document.getElementById(`options_${variableName}`);
  if (buttonElement) {
    const buttonText =
      options.length > 0 ? "⚙️ Update Options" : "⚙️ Add Options";
    buttonElement.innerHTML = buttonText;
  }

  // Update counter di alert header
  const alertElement = previewElement.closest(".alert");
  if (alertElement) {
    const strongElement = alertElement.querySelector("strong");
    if (strongElement) {
      const fieldType = strongElement.textContent.split(" ")[0]; // Get "select" from "select options (2)"
      strongElement.textContent = `${fieldType} options (${options.length})`;
    }
  }
};

// Make updateOptionsPreview available globally
window.updateOptionsPreview = nx.updateOptionsPreview;

// Function untuk mengkonversi form data ke format yang diinginkan
nx.processFieldOptionsData = function (formData) {
  const result = {
    options: [],
    metaData: {},
  };

  // Extract options dari form data
  const fieldName = formData.Field;
  let index = 0;
  const processedKeys = new Set();

  // Loop untuk mengumpulkan semua options
  while (
    formData[`${fieldName}_${index}_text`] !== undefined ||
    formData[`${fieldName}_${index}_value`] !== undefined
  ) {
    const textKey = `${fieldName}_${index}_text`;
    const valueKey = `${fieldName}_${index}_value`;
    const text = formData[textKey] || "";
    const value = formData[valueKey] || "";

    // Track keys yang sudah diproses
    processedKeys.add(textKey);
    processedKeys.add(valueKey);

    // Hanya tambahkan jika ada text atau value
    if (text.trim() !== "" || value.trim() !== "") {
      result.options.push({
        id: `${fieldName}_${index}`,
        text: text,
        key: value,
        value: text,
      });
    }

    index++;
  }

  // Track keys yang sudah diproses untuk field utama
  processedKeys.add("Field");
  processedKeys.add("timestamp");

  // Simpan data yang belum diproses ke metaData
  Object.keys(formData).forEach((key) => {
    if (!processedKeys.has(key)) {
      result.metaData[key] = formData[key];
    }
  });

  return result;
};

// Function untuk mengkonversi dari format object ke format yang diinginkan
nx.convertFormDataToOptions = function (rawData) {
  return processFieldOptionsData(rawData);
};

// Helper function to generate error HTML when data is not available
function generateErrorHTML(errorMessage, variableName) {
  return `
    <div class="error-container" style="padding: 20px; text-align: center;">
      <div class="alert alert-danger" style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 4px;">
        <h5 style="margin: 0 0 10px 0;">⚠️ Configuration Error</h5>
        <p style="margin: 0 0 10px 0;">${errorMessage}</p>
        <small style="color: #6c757d;">Field: <code>${variableName}</code></small>
      </div>
      <button type="button" onclick="NXUI.nexaModal.close('formOptionsValue${variableName}')" 
              class="btn btn-secondary" style="margin-top: 10px;">
        Close
      </button>
    </div>
  `;
}
