import { getIconByType } from "../Icon/index.js";
export async function setSortable(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
          const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 130, 'vh');
   
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="renderTabelNav">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Metadata Sortable ${storage.className}</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
      </div>
    `
    );

    setTimeout(async () => {
      try {
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaDrag({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        const template = render.Container({
          container: "#nxdrop",
          content: [await SortableFailed(Sdk,height), await konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        await settingSortable(Sdk);
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function SortableFailed(Sdk,height) {
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
                 <span class="material-symbols-outlined nx-icon-md">${getIconByType(
                   fieldData.type
                 )}</span>
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
    console.warn(
      "⚠️ dataform.form is not an object or is undefined:",
      dataform.form
    );
    tempalatefield = `<li class="nx-list-item">No form fields available</li>`;
  }
  const formFieldsCount = dataform.form
    ? Object.keys(dataform.form).filter((field) => dataform.form[field].tabel)
        .length
    : 0;

  return {
    title: "Properties",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `
      <small class="text-muted">${formFieldsCount} Form fields dari ${dataform.priority} tabel</small>
    `,
    html: `   
   <div  style="padding-top:4px">
      <ul id="sortable-list" class="sortable-list nx-list-group">
          ${tempalatefield}
      </ul>
     </div>
    `,
  };
}

export async function settingSortable(Sdk,height) {
  try {
    const sortable = new NXUI.Sortable({
      containerId: "sortable-list",
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
        // buckets: {
        //   ...data.buckets,
        //   variablesAlias: updatedVariablesAlias, // ✅ Update buckets.variablesAlias
        // },
        column: element,
        variables: updatedVariables,
        variablesOrigin: updatedVariablesOrigin,
      });

      // Debug: Verify form object order changed
      const verifyData = await NXUI.ref.get(data.store, data.id);
      await Sdk.upBucket();
    });
    sortable.initSortable();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}

export async function konfigurasi(data,height) {
  return {
    title: "Panduan Sortable",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     💡 Tips:</strong> Gunakan drag & drop untuk mengatur 
    </small>`,
    html: `
    <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Lihat Field Properties</strong>
              <p class="mb-2">Panel "Properties" menampilkan field yang sudah dikonfigurasi dan siap digunakan dalam form.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Drag & Drop untuk Mengatur Urutan</strong>
              <p class="mb-2">Seret field di panel "Properties" untuk mengubah urutan tampilan dalam form.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Aktifkan Field dari Items Failed</strong>
              <p class="mb-2">Centang checkbox pada field di panel "Items Failed" untuk mengaktifkannya.</p>
            </div>
          </div>
          
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Urutan Tersimpan Otomatis</strong>
              <p class="mb-2">Perubahan urutan field akan tersimpan secara otomatis ke database.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5.Monitor Status Field</strong>
              <p class="mb-2">Field yang aktif akan muncul di "Properties", yang tidak aktif di "Items Failed".</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

