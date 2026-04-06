import { createObject } from "./Object.js";
import { saveTabel } from "./save.js";
export async function createnew(action = null) {
  const data = await createObject(action);
  console.log('label:', data);
  
  // Check if data is valid before proceeding
  // if (!data || !data.modalId) {
  //   console.error("❌ Error in createnew: createObject returned invalid data", {
  //     action,
  //     data
  //   });
  //   throw new Error("Failed to create object: Invalid data or missing required properties (label, key)");
  // }
  
  const modalId = `${data.modalId}`;
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
                 value="${variable}" 
                 id="var_create_${variable}${modalId}${index}"
                 checked 
                 disabled >
          <label for="var_create_${variable}${modalId}${index}">
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
  const defaultSelectedVars = data.variables_checkbox || [];
  const variablesCheckboxHTML = generateVariablesCheckboxHTML(
    allVariables,
    defaultSelectedVars
  );

  NXUI.modalHTML({
    elementById: modalId,
    styleClass: "w-500px",
    label: `Create New ${data.original_data_label || data.label || 'Table'}`,
    getFormBy: ["name"], //
    setDataBy: data,
    getValidationBy: ["name"],
    minimize: true,
    onclick: {
      title: "Simpan",
      cancel: "Batalkan",
      send: "saveNewTabel",
      validation: {
        selectedVariables: 0,
      },
    },
    content: `              
            <div class="form-group">
            <div class="nx-row">
                <div class="nx-col-6">
                  <div class="form-nexa-group">
                    <label>Class Table Name</label>
                     <input id="tabelCalss_create" name="tabelCalss" type="text" class="form-nexa-control" placeholder="Enter text" />
                  </div>
                </div>
                <div class="nx-col-6">
                  <div class="form-nexa-group">
                    <label>Type Query </label>
                    <select id="type_create" name="type" class="form-nexa-control" onchange="window.handleTypeChange('${modalId}', this.value)">
                      <option value="single">Type Nested</option>

                    </select>
                  </div>
                </div>
               

            </div>
            <br>
              <div class="variables-container" style=" max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                <!-- Variables for ${data.original_data_label || 'Table'} (${defaultSelectedVars.length} default selected) -->
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
        "#searchFormVariablesInput_create"
      );
      if (searchInput) {
        // Real-time search on input
        searchInput.addEventListener("input", function (e) {
          nx.filterVariablesCreate(modalId, e.target.value);
        });

        // Keyboard shortcuts
        searchInput.addEventListener("keydown", function (e) {
          if (e.key === "Escape") {
            nx.clearVariablesFilterCreate(modalId);
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

      // Prevent unchecking of checkboxes
      const checkboxes = modal.querySelectorAll(
        'input[name="selectedVariables"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function (e) {
          if (!e.target.checked) {
            e.preventDefault();
            e.target.checked = true;
          }
        });

        // Also prevent clicking on labels to uncheck
        const label = modal.querySelector(`label[for="${checkbox.id}"]`);
        if (label) {
          label.addEventListener("click", function (e) {
            if (!checkbox.checked) {
              e.preventDefault();
              checkbox.checked = true;
            }
          });
        }
      });
    }
  }, 100);

  return data;
}

// Setup global helper functions for this modal
nx.selectAllVariablesCreate = function (modalId) {
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
      checkbox.disabled = true; // Keep disabled to prevent unchecking
    });
  }
};

nx.selectNoneVariablesCreate = function (modalId) {
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

    // Since we want to prevent unchecking, this function will not uncheck already checked items
    // Only uncheck items that are not already checked
    visibleCheckboxes.forEach((checkbox) => {
      if (!checkbox.checked) {
        checkbox.checked = false;
        checkbox.disabled = false; // Allow unchecked items to remain unchecked
      }
    });
  }
};

// Setup Variables Filter function
nx.filterVariablesCreate = function (modalId, searchTerm) {
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
nx.clearVariablesFilterCreate = function (modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const searchInput = modal.querySelector("#searchFormVariablesInput_create");
  if (searchInput) {
    searchInput.value = "";
    nx.filterVariablesCreate(modalId, "");
  }
};

// Handle type change event - simple function
nx.handleTypeChange = function (modalId, selectedType) {
  // Type change handler
};

nx.saveNewTabel = function (modalId, data, metadata) {
  saveTabel(modalId, data, metadata);
};
