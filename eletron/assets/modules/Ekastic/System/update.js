import { upObject } from "./ObjectUp.js";
export async function updateTabel(action = null) {
  try {
    const result = await NXUI.ref.get(action.store, action.id);
    const data = await upObject(result, result.variable);
    const modalId = result.modalid;
    // Generate checkbox HTML for variables using NexaUI checkbox classes
    const generateVariablesCheckboxHTML = (variables, defaultSelectedVars) => {
      return variables
        .map((variable, index) => {
          // Check if this variable is in the default selected list
          const isDefaultSelected = defaultSelectedVars.includes(variable);
          return `
        <div class="nx-checkbox-item">
          <input type="checkbox" 
                 name="selectedVariables" 
                 class="single-select-checkbox"
                 value="${variable}" 
                   id="var_update_${variable}${modalId}${index}"
             
                 ${isDefaultSelected ? "checked" : ""}>
          <label for="var_update_${variable}${modalId}${index}">
            <span class="nx-checkmark"></span>
            ${variable}
          </label>
        </div>
      `;
        })
        .join("");
    };

    // Use ALL original variables (including id, userid) - let user choose everything
    const allVariables = data.variables || [];
    const variablesCheckboxHTML = generateVariablesCheckboxHTML(
      allVariables,
      data.variables_checkbox
    );

    NXUI.modalHTML({
      elementById: modalId,
      styleClass: "w-500px",
      label: `Update ${result.label}`,
      getFormBy: ["name"], //
      setDataBy: result,
      getValidationBy: ["name"],
      minimize: true,
      onclick: {
        title: "Simpan",
        cancel: "Batalkan",
        send: "saveUpdateTabel",
        validation: {
          selectedVariables: 1,
        },
      },
      content: `              
            <div class="form-group">
            <div class="nx-row">
                <div class="nx-col-6">
                  <div class="form-nexa-group">
                    <label>Class Table Name</label>
                     <input id="tabelCalss_update" name="tabelCalss" type="text" class="form-nexa-control" value="${result.className}" />
                    <input type="hidden" id="tabelKey_update" class="form-nexa-control" value="${result.tableKey}">
                    <input type="hidden" id="table_name_update" class="form-nexa-control" value="${result.tableName}">
                  </div>
                </div>
                <div class="nx-col-6">
                  <div class="form-nexa-group">
                    <label>Type Builder</label>
                    <select id="type_update" name="type" class="form-nexa-control" onchange="window.handleTypeChange('${modalId}', this.value)">
                      <option value="${result.type}">Type ${result.type}</option>
                    </select>
                  </div>
                </div>
                <div class="nx-col-12">
                  <div class="form-nexa-input-group">
                    <div class="form-nexa-input-group-text">
                      <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
                    </div>
                    <input type="text" 
                           id="searchFormVariablesInput_update" 
                           class="form-nexa-control" 
                           placeholder="Search variables... (Ctrl+F)" >
                      <div class="form-nexa-input-group-text">
                                               <button type="button" 
                                class="nx-btn-secondary" 
                                style="background: none; border: none; padding: 4px; color: #6c757d;"
                                onclick="window.clearVariablesFilterUpdate('${modalId}')">
                          <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
                        </button>
                     </div>
                  </div>
                   <small class="text-muted search-help-text">Type to filter variables by name</small>
                </div>


              <div class="nx-col-12" style="height:30px; ">
              <div class="checkbox-controls mb-2 tx-right">
                <button type="button" class="nx-btn-primary custom-size-sm" onclick="window.selectAllVariablesUpdate('${modalId}')">Select All</button>
                <button type="button" class="nx-btn-secondary custom-size-sm" onclick="window.selectNoneVariablesUpdate('${modalId}')">Select None</button>
              </div>
              </div>
            </div>
              <div class="variables-container" style=" max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                <!-- Variables for ${data.original_data_label} (${data.variables_checkbox.length} default selected) -->
                <div class="nx-checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; align-items: start;">
                  ${variablesCheckboxHTML}
                </div>
              </div>
            </div>
        `,
    });
    // Setup save function

    // Setup search functionality after modal is opened
    setTimeout(() => {
      const modal = document.getElementById(modalId);
      if (modal) {
        const searchInput = modal.querySelector(
          "#searchFormVariablesInput_update"
        );
        if (searchInput) {
          // Real-time search on input
          searchInput.addEventListener("input", function (e) {
            nx.filterVariablesUpdate(modalId, e.target.value);
          });

          // Keyboard shortcuts
          searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
              nx.clearVariablesFilterUpdate(modalId);
            }
          });

          // Focus search input with Ctrl+F
          document.addEventListener("keydown", function (e) {
            if (e.ctrlKey && e.key === "f" && modal.style.display !== "none") {
              e.preventDefault();
              searchInput.focus();
            }
          });
        }
      }
    }, 100);

    return result;
  } catch (error) {
    console.error("❌ Error in newTabel:", error);
    return { success: false, action: "newTabel", error: error.message };
  }
}

// Setup global helper functions for this modal
nx.selectAllVariablesUpdate = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    // Get visible checkboxes (not filtered out)
    const allCheckboxes = modal.querySelectorAll(
      'input[name="selectedVariables"]'
    );
    const visibleCheckboxes = Array.from(allCheckboxes).filter((checkbox) => {
      const item = checkbox.closest(".nx-checkbox-item");
      return item && item.style.display !== "none";
    });

    visibleCheckboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
  }
};

nx.selectNoneVariablesUpdate = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    // Get visible checkboxes (not filtered out)
    const allCheckboxes = modal.querySelectorAll(
      'input[name="selectedVariables"]'
    );
    const visibleCheckboxes = Array.from(allCheckboxes).filter((checkbox) => {
      const item = checkbox.closest(".nx-checkbox-item");
      return item && item.style.display !== "none";
    });

    visibleCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }
};

// Setup Variables Filter function
nx.filterVariablesUpdate = function (modalId, searchTerm) {
  const modal = document.getElementById(modalId);
  if (!modal) return 0;

  const checkboxItems = modal.querySelectorAll(".nx-checkbox-item");
  const searchLower = searchTerm.toLowerCase().trim();
  let visibleCount = 0;

  checkboxItems.forEach((item) => {
    const label = item.querySelector("label");
    const text = label ? label.textContent.toLowerCase().trim() : "";

    if (searchLower === "" || text.includes(searchLower)) {
      item.style.display = "block";
      visibleCount++;
    } else {
      item.style.display = "none";
    }
  });

  // Update visible count in search helper text
  const helpText = modal.querySelector(".search-help-text");
  if (helpText) {
    if (searchTerm.trim()) {
      helpText.textContent = `Found ${visibleCount} of ${checkboxItems.length} variables`;
    } else {
      helpText.textContent = "Type to filter variables by name";
    }
  }

  return visibleCount;
};

// Clear search filter
nx.clearVariablesFilterUpdate = function (modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const searchInput = modal.querySelector("#searchFormVariablesInput");
  if (searchInput) {
    searchInput.value = "";
    nx.filterVariablesUpdate(modalId, "");
  }
};

// Handle type change event - simple function
nx.handleTypeChange = function (modalId, selectedType) {
  // Type change handler
};

nx.saveUpdateTabel = async function (modalId, data, action) {
  try {
    const processedData = {
      ...data,
      selectedVariables: data.selectedVariables
        ? data.selectedVariables
            .split(",")
            .map((variable) => variable.trim())
            .filter((v) => v)
        : [],
    };
    const setlabel =
      processedData.tabelCalss
        .replace(/[^a-zA-Z0-9 ]/g, "") // hapus simbol
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()) + // kapital awal tiap kata
      " " +
      processedData.type.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()); // kapital awal type

   
    await NXUI.ref.updateFields(action.store, action.id, {
      className: processedData.tabelCalss,
      label: setlabel,
      variables: processedData.selectedVariables,
      form: generateExtract(processedData.selectedVariables),
      variablesOrigin: processedData.selectedVariables,
    });

    if (window.nexaStoreInstance) {
      // Reload stored data
      await window.nexaStoreInstance.loadStoredData();

      // Trigger UI refresh
      if (window.nexaStoreInstance.onDataLoaded) {
        window.nexaStoreInstance.onDataLoaded();
      }
    }
    NXUI.nexaModal.close(modalId);

    // saveTabel(modalId, data);
    // Setup initial state - disable submit button until correct input
  } catch (error) {
    console.error("Failed to show delete confirmation:", error);
  }
};


export function generateExtract(variables) {
  const timestamp = new Date().toISOString(); // waktu sekarang
  const extrak = {};
  variables.forEach(name => {
    extrak[name] = {
      type: "text",
      icons: "attach_file",
      columnWidth: "nx-col-12",
      name: name,
      label: name,
      placeholder: name,
      validation: "2",
      timestamp: timestamp,
      control:'',
      condition: false,
      filtering: true,
      inline: false
    };
  });
  return extrak;
}