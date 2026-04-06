// import { metaIndex, metaField, metaJoin } from "../Metadata/Field.js";
export async function setComplex(tabel) {
  try {
    let tempalatefield = "";

    tabel.variablesOrigin.forEach((row, index) => {
      tempalatefield += `
               <div class="nx-col-12">
                 <div class="nx-checkbox-grid">
                   <div class="nx-checkbox-item">
                     <input type="checkbox" id="${row}${index}" name="${row}" value="${row}" class="field-checkbox" onchange="nx.toggleArithmeticForm(this)"/>
                     <label for="${row}${index}">
                       <span class="nx-checkmark"></span>
                       ${row}
                     </label>
                   </div>
                 </div>
               </div>
             `;
    });

    return `
<div class="nx-row">
 <div class="nx-col-12">
    <div class="form-nexa-input-group">
      <div class="form-nexa-input-group-text">
        <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
      </div>
      <input type="text" 
             id="idsearchInput" 
             class="form-nexa-control" 
             placeholder="Cari Field" 
             onkeyup="nx.searchFields(this.value)">
       <div class="form-nexa-input-group-text">
         <button type="button" 
                 class="nx-btn-secondary" 
                 style="background: none; border: none; padding: 4px; color: #6c757d;"
                 onclick="nx.clearSearch()">
           <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
         </button>
       </div>
    </div>
</div>
  <div class="nx-col-12">
    <div class="nx-scroll pl-20px" style="height:300px;">
      <div class="nx-row ">
         ${tempalatefield}
      </div>
    </div>
  </div>
</div>

    `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading arithmetic form.</div></div>`;
  }
}
nx.toggleArithmeticForm = async function (checkbox) {
  try {
    const container = document.getElementById("arithmetic-forms-container");
    const fieldName = checkbox.name;
    const fieldId = `arithmetic-form-${fieldName}`;
    if (checkbox.checked) {
      // Cek apakah form sudah ada
      let existingForm = document.getElementById(fieldId);
      if (!existingForm) {
        // Buat form baru untuk field ini
        const formHtml = `
        <div id="${fieldId}" class="arithmetic-form-item">
          <div class="nx-row">
            <div class="nx-col-6">
              <div class="form-nexa-group">
                <label>Field</label>
                <input type="text" name="field_${fieldName}" id="field_${fieldName}" class="form-nexa-control" value="${fieldName}" readonly />
              </div>
            </div>
            <div class="nx-col-3">
              <div class="form-nexa-group">
                <label>Type</label>
                <select class="form-nexa-control" id="type_${fieldName}" name="type_${fieldName}">
                  <option value="">Arithmetic Operation</option>
                  <option value="ADD">ADD</option>
                  <option value="SUBTRACT">SUBTRACT</option>
                  <option value="MULTIPLY">MULTIPLY</option>
                  <option value="DIVIDE">DIVIDE</option>
                  <option value="MODULO">MODULO</option>
                  <option value="POWER">POWER</option>
                  <option value="SQRT">SQRT</option>
                  <option value="ROUND">ROUND</option>
                  <option value="CEIL">CEIL</option>
                  <option value="FLOOR">FLOOR</option>
                  <option value="PERCENTAGE">PERCENTAGE</option>
                  <option value="RATIO">RATIO</option>
                  <option value="RANDOM">RANDOM</option>
                </select>
              </div>
            </div>
            <div class="nx-col-3">
              <div class="form-nexa-group">
                <label>Priority</label>
                <input type="number" id="priority_${fieldName}" name="priority_${fieldName}" class="form-nexa-control" value="" />
              </div>
            </div>
          </div>
        </div>
      `;

        container.insertAdjacentHTML("beforeend", formHtml);
      }
    } else {
      // Hapus form jika checkbox di-uncheck
      const formToRemove = document.getElementById(fieldId);
      if (formToRemove) {
        formToRemove.remove();
      }
    }
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
  // await Save(id,data,tabel)
};

// Search functionality for field checkboxes
nx.searchFields = function (searchTerm) {
  try {
    const checkboxes = document.querySelectorAll(".field-checkbox");
    const searchTermLower = searchTerm.toLowerCase().trim();

    checkboxes.forEach((checkbox) => {
      const label = checkbox.nextElementSibling;
      const fieldName = label.textContent.trim().toLowerCase();
      const checkboxContainer = checkbox.closest(".nx-col-12");

      if (searchTermLower === "" || fieldName.includes(searchTermLower)) {
        checkboxContainer.style.display = "block";
      } else {
        checkboxContainer.style.display = "none";
      }
    });
  } catch (error) {
    console.error("Search failed:", error);
  }
};

// Clear search functionality
nx.clearSearch = function () {
  try {
    const searchInput = document.getElementById("idsearchInput");
    if (searchInput) {
      searchInput.value = "";
      nx.searchFields(""); // Reset all checkboxes to visible
    }
  } catch (error) {
    console.error("Clear search failed:", error);
  }
};
