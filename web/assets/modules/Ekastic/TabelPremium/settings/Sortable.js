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

    // Treat dataform.column as an array of column names
    if (Array.isArray(dataform.column)) {
      const columnNames = dataform.column;

      const items = columnNames.map((fieldName, index) => {
        return `
                <li draggable="true" data-index="${index}" class="nx-list-item">
                   <span class="material-symbols-outlined nx-icon-md">edit_note</span>
                  <span class="sortable-item" value="${fieldName}">${fieldName}</span>
                </li>`;
      });

      tempalatefield = items.join("");
    } else {
      tempalatefield = `<li class="nx-list-item">No column fields available</li>`;
    }
    const formFieldsCount = Array.isArray(dataform.column) ? dataform.column.length : 0;
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
      console.log('label:', element);
           await Sdk.upIndex({
               column: element,
           });
 
      
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
