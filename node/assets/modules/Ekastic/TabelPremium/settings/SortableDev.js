import { ColumnHide } from "./ColumnHide.js";
export async function getSortable(data) {
 return `
   <button type="button" class="nx-btn-primary icon-button" onclick="settingColom('${data.id}')">
          <span class="material-symbols-outlined nx-icon-sm">swap_vert</span>
          <span>Urutan Kolom</span>
        </button>

   <button type="button" class="nx-btn-primary icon-button" onclick="settingColumnHide('${data.id}')">
          <span class="material-symbols-outlined nx-icon-sm">visibility_off</span>
          <span>Sembunyikan Kolom</span>
        </button>
  <br>
  <br>
  <div class="nx-alert nx-alert-info">
Gunakan tombol di atas untuk mengatur pengaturan kolom tabel. Tombol "Urutan Kolom" memungkinkan Anda mengatur urutan kolom dengan menyeret dan melepas item sesuai keinginan. Tombol "Sembunyikan Kolom" memungkinkan Anda menyembunyikan atau menampilkan kolom tertentu. Perubahan akan tersimpan otomatis.
</div>
 `;
}
window.settingColomX  = async function(token) {}
window.settingColom  = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const dataform = await Sdk.storage();
  
  // Generate unique modal ID with timestamp to avoid conflicts
  const modalForm = "sortable_" + token + "_" + Date.now();
  
  // Clean up any existing sortable instance before opening new modal
  const existingContainers = document.querySelectorAll('ul[class*="sortable-list"]');
  existingContainers.forEach(container => {
    if (typeof $ !== "undefined" && $.ui && $.ui.sortable) {
      const $container = $(container);
      if ($container.hasClass("ui-sortable")) {
        $container.sortable("destroy");
      }
    }
  });
  
  NXUI.formModal({
      elementById: modalForm,
      styleClass: "w-500px",
      minimize: true,
      label: `Sortable`,
      floating: false,
      content: await dataSortable(dataform),
    });

      NXUI.nexaModal.open(modalForm);

}






export async function dataSortable(data) {
  // Generate unique ID for sortable list container
  const uniqueListId = "sortable-list-" + data.id + "-" + Date.now();
  
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const dataform = await Sdk.storage();

    let tempalatefield = "";

    // Check if dataform.form exists and convert to array
    if (dataform.form && typeof dataform.form === "object") {
      const formFields = Object.keys(dataform.form);

      const searchResults = await Promise.all(
        formFields.map(async (fieldName, index) => {
          const fieldData = dataform.form[fieldName];
          if (fieldData.tabel) {
            return `
                <li draggable="true" data-index="${index}" class="nx-list-item">
                   <span class="material-symbols-outlined nx-icon-md">edit_note</span>
                  <span class="sortable-item" value="${fieldName}">${
              fieldData.failedtabel
            }</span>
                </li>`;
          }
          return null; // Return null for items that don't meet the condition
        })
      );

      const filteredResults = searchResults.filter((item) => item !== null);
      tempalatefield = filteredResults.join("");
    } else {
      tempalatefield = `<li class="nx-list-item">No form fields available</li>`;
    }
    const formFieldsCount = dataform.form
      ? Object.keys(dataform.form).filter((field) => dataform.form[field].tabel)
          .length
      : 0;
 setTimeout(async() => {
      await settingSortable(Sdk, uniqueListId);
  }, 20);
    return  `   
     <div class="nx-scroll-hidden" style="max-height:448px;padding-top:4px;overflow-y:auto;">
        <ul id="${uniqueListId}" class="sortable-list nx-list-group">
            ${tempalatefield}
        </ul>
       </div>
      `;
  } catch (error) {
    return `
      <div class="nx-scroll-hidden" style="max-height:448px;padding-top:4px;overflow-y:auto;">
        <ul id="${uniqueListId}" class="sortable-list nx-list-group">
          <li class="nx-list-item">Error loading sortable items</li>
        </ul>
      </div>
    `;
  }
}

export async function settingSortable(Sdk, containerId = "sortable-list") {
  try {
    const sortable = new NXUI.Sortable({
      containerId: containerId,
      itemClass: "sortable-item",
      eventKey: "failedDataOrder",
      logPrefix: "Failed Data",
    });
    const data = await Sdk.storage();
    sortable.onCallback(async (element) => {
      // element contains the reordered form field names
      const newFormFieldOrder = element.filter(
        (item) => item && item.trim() !== ""
      );

      // Create reordered form object to match drag & drop order
      const originalForm = data.form;
      const reorderedForm = {};

      // First, add form fields in the new drag & drop order
      newFormFieldOrder.forEach((fieldName) => {
        if (originalForm[fieldName]) {
          reorderedForm[fieldName] = originalForm[fieldName];
        }
      });

      // Then, add remaining form fields that weren't dragged (maintain their original order)
      Object.keys(originalForm).forEach((fieldName) => {
        if (!reorderedForm[fieldName]) {
          reorderedForm[fieldName] = originalForm[fieldName];
        }
      });

      // Create copies of original arrays to preserve all 34 items
      const updatedVariables = [...data.variables];
      const updatedVariablesAlias = [...data.buckets.variablesAlias];
      const updatedVariablesOrigin = [...data.variablesOrigin];

      // Create a mapping of form field positions for reordering
      const formFieldIndices = [];
      const formFieldData = {
        variables: [],
        variablesAlias: [],
        variablesOrigin: [],
      };

      // Collect data for form fields in new order
      newFormFieldOrder.forEach((fieldName) => {
        const fieldIndex = data.variables.indexOf(fieldName);
        if (fieldIndex !== -1) {
          formFieldIndices.push(fieldIndex);
          formFieldData.variables.push(data.variables[fieldIndex]);
          formFieldData.variablesOrigin.push(data.variablesOrigin[fieldIndex]);

          // Find corresponding alias
          const aliasIndex = data.buckets.variablesAlias.findIndex((alias) => {
            if (!alias || typeof alias !== "string") {
              return false;
            }
            const aliasFieldName = alias.split(".").pop();
            return aliasFieldName === fieldName;
          });

          if (aliasIndex !== -1) {
            formFieldData.variablesAlias.push(
              data.buckets.variablesAlias[aliasIndex]
            );
          } else {
            formFieldData.variablesAlias.push(data.variablesOrigin[fieldIndex]);
          }
        }
      });

      // Get original indices in the order they appear in variables array
      const originalIndicesInOrder = [];
      data.variables.forEach((variable, index) => {
        if (newFormFieldOrder.includes(variable)) {
          originalIndicesInOrder.push(index);
        }
      });

      // Update positions: put new order data into original positions
      originalIndicesInOrder.forEach((originalIndex, i) => {
        const newFieldName = newFormFieldOrder[i];
        const newDataIndex = formFieldIndices.findIndex(
          (idx) => data.variables[idx] === newFieldName
        );

        updatedVariables[originalIndex] = formFieldData.variables[newDataIndex];
        updatedVariablesAlias[originalIndex] =
          formFieldData.variablesAlias[newDataIndex];
        updatedVariablesOrigin[originalIndex] =
          formFieldData.variablesOrigin[newDataIndex];
      });

      // Update form object and arrays with new order
      await NXUI.ref.mergeData(data.store, data.id, {
        form: reorderedForm, // ✅ Update form object with new order
        buckets: {
          ...data.buckets,
          variablesAlias: updatedVariablesAlias, // ✅ Update buckets.variablesAlias
        },
        variables: updatedVariables,
        variablesOrigin: updatedVariablesOrigin,
      });

      // Debug: Verify form object order changed
      const verifyData = await NXUI.ref.get(data.store, data.id);
      await Sdk.upBucket();
      
      // ✅ Refresh UI tabel setelah urutan kolom diubah
      if (typeof window.refreshUITable === 'function') {
        await window.refreshUITable();
      }
    });
    sortable.initSortable();
  } catch (error) {
    // Error handling without logging
  }
}
window.settingColumnHide = async function(token) {
  await  ColumnHide(token)
}
