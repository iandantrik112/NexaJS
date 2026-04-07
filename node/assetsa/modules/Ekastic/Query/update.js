import { metaIndex, metaField } from "../Metadata/Field.js";
export async function updateForm(data = null) {
  try {
    const dataform = await NXUI.ref.get(data.store, data.id);
    console.log(dataform);
    // Generate modal ID if not present
    let modalId = dataform.modalid;
    if (!modalId) {
      // Generate modal ID based on table name or ID
      const safeTableId = dataform.tableName || dataform.id || "unknown";
      modalId = safeTableId + "_modal_update";
    }

    const field = await metaField(dataform.tableKey, dataform.tableName);
    const fieldVariables = field.data[dataform.tableName].variables;

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
                 id="var_update_${variable}"
                 ${isDefaultSelected ? "checked" : ""}>
          <label for="var_update_${variable}">
            <span class="nx-checkmark"></span>
            ${variable}
          </label>
        </div>
      `;
        })
        .join("");
    };

    // Use fieldVariables (from metadata) for checkboxes
    // Sort variables to move certain fields to the end
    const sortVariables = (variables) => {
      const priorityFields = ["id", "userid", "row"];
      const sorted = variables.sort((a, b) => {
        const aIndex = priorityFields.indexOf(a);
        const bIndex = priorityFields.indexOf(b);

        // If both are in priority fields, maintain original order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // If only 'a' is in priority fields, move it to end
        if (aIndex !== -1) return 1;
        // If only 'b' is in priority fields, move it to end
        if (bIndex !== -1) return -1;
        // If neither are in priority fields, maintain original order
        return 0;
      });
      return sorted;
    };

    const allVariables = sortVariables(fieldVariables || []);
    // Use dataform.variables as default selected (previously selected variables)
    const defaultSelectedVars = dataform.variables || [];

    const variablesCheckboxHTML = generateVariablesCheckboxHTML(
      allVariables,
      defaultSelectedVars
    );

    NXUI.modalHTML({
      elementById: modalId,
      styleClass: "w-500px",
      label: `Update ${dataform.label}`,
      getFormBy: ["name"], //
      setDataBy: dataform,
      getValidationBy: ["name"],
      minimize: true,
      onclick: {
        title: "Simpan",
        cancel: "Batalkan",
        send: "saveUpdateFomTabeldx",
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
                     <input id="tabelCalss_update" name="tabelCalss" type="text" class="form-nexa-control" value="${
                       dataform.className
                     }" />
                    <input type="hidden" id="tabelKey_update" class="form-nexa-control" value="${
                      dataform.tableKey
                    }">
                    <input type="hidden" id="table_name_update" class="form-nexa-control" value="${
                      dataform.tableName
                    }">
                  </div>
                </div>
                <div class="nx-col-6">
                  <div class="form-nexa-group">
                    <label>Type Builder</label>
                    <select id="type_update" name="type" class="form-nexa-control" onchange="window.handleTypeChange('${modalId}', this.value)">
                      <option value="${dataform.type}">Type ${
        dataform.type
      }</option>
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
                <!-- Variables for ${dataform.label} (${
        dataform.variables_checkbox ? dataform.variables_checkbox.length : 0
      } default selected) -->
                <div class="nx-checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; align-items: start;">
                  ${variablesCheckboxHTML}
                </div>
              </div>
            </div>
        `,
    });

    // Store dataform.variables in modal for later use
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.setAttribute(
        "data-original-variables",
        JSON.stringify(dataform.variables || [])
      );
    }

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

    // Ensure dataform has the modalId for the calling function
    dataform.modalid = modalId;
    return dataform;
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
    // Get the original dataform.variables from modal attribute
    let dataformVariables = [];
    try {
      const originalVars = modal.getAttribute("data-original-variables");
      if (originalVars) {
        dataformVariables = JSON.parse(originalVars);
      }
    } catch (e) {
      // Could not parse original variables
    }

    // Only uncheck checkboxes that were NOT in the original dataform.variables
    const allCheckboxes = modal.querySelectorAll(
      'input[name="selectedVariables"]'
    );

    allCheckboxes.forEach((checkbox) => {
      // Only uncheck if this variable was NOT in the original dataform.variables
      if (!dataformVariables.includes(checkbox.value)) {
        checkbox.checked = false;
      }
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

  const searchInput = modal.querySelector("#searchFormVariablesInput_update");
  if (searchInput) {
    searchInput.value = "";
    nx.filterVariablesUpdate(modalId, "");
  }
};

// Handle type change event - simple function
nx.saveUpdateFomTabeldx = async function (modalId, data, tabel) {
  const processedData = {
    ...data,
    selectedVariables: data.selectedVariables
      ? data.selectedVariables
          .split(",")
          .map((variable) => variable.trim())
          .filter((v) => v)
      : [],
  };
  // Convert selectedVariables from string to array
  const processedDataBaru = {
    selectedVariables: data.selectedVariables
      ? data.selectedVariables
          .split(",")
          .map((variable) => variable.trim())
          .filter((v) => v)
      : [],
  };
  const variables = processedDataBaru.selectedVariables;
  const generate = generateExtract(variables, tabel.form);
  const makeDir = {
    form: generate,
    variables: variables,
    variablesOrigin:variables,
  };
  await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);
  NXUI.nexaModal.close(modalId);
};

export function generateExtract(variables, cek) {
  const timestamp = new Date().toISOString(); // waktu sekarang
  const extrak = {};
  variables.forEach((name) => {
    // Jika field sudah ada di cek, gunakan data yang sudah ada
    if (cek[name]) {
      extrak[name] = cek[name];
    } else {
      // Jika belum ada, buat field baru dengan default values
      extrak[name] = {
        type: "text",
        icons: "attach_file",
        columnWidth: "nx-col-12",
        name: name,
        label: name,
        failed: name,
        fieldAlias: name,
        placeholder: name,
        validation: "2",
        timestamp: timestamp,
        control: "",
        value: false,
        hidden: false,
        readonly: false,
        tabel: false,
        condition: false,
        modal: false,
        search: false,
        filtering: false,
        inline: false,
      };
    }
  });

  return extrak;
}
