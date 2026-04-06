// import { Jointabel } from "./Jointabel.js";
export async function setModal(data) {
  try {
    const dataform = await NXUI.ref.get(data.store, data.id);
    const setType = dataform.type;
    // Jika Type join maka megunakan data dataform.formJoin
    let fields;

      fields = getFields(dataform.form);


    let checkedItemsHtml = "";
    let uncheckedItemsHtml = "";

    fields.forEach((row, index) => {
      const checkedAttr = row.modal ? "checked" : "";
      if (row.placeholder !== "id") {

        const failedName=row.fieldAlias ?? row.name;

        const itemHtml = `
     <div class="pt-10px">
        <div class="nx-checkbox-item" style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <input type="checkbox" 
                   name="selectedVariables" 
                   class="single-select-checkbox"
                   id="public_${failedName}${row.index}" 
                   ${checkedAttr}
                   onchange="addToSelectedTabelmodal('${dataform.id}','${failedName}', this.checked, '${dataform.store}')">
            <label for="public_${failedName}${row.index}" style="margin: 0; margin-left: 8px;">
              <span class="nx-checkmark"></span>
             ${row.placeholder}
            </label>
          </div>
          <a href="javascript:void(0);" onclick="setItemModal('${failedName}', '${dataform.id}')" title="Hapus item" style="color:#ccc" >
    <span class="material-symbols-outlined nx-icon-xs">settings</span>
         </a>
        </div>
      </div>
    `;

        // Pisahkan berdasarkan status checked
        if (row.modal) {
          checkedItemsHtml += itemHtml;
        } else {
          uncheckedItemsHtml += itemHtml;
        }
      }
    });
    return `
<div style="padding:10px" class="nx-container-setModal">
  <div class="nx-row">
    <div class="nx-col-6">
      <h6 style="margin-bottom: 15px; color: #28a745;">✓ Terpilih (${
        fields.filter((row) => row.tabel && row.placeholder !== "id").length
      })</h6>
      ${checkedItemsHtml}
    </div>
    <div class="nx-col-6">
      <h6 style="margin-bottom: 15px; color: #6c757d;">○ Belum Dipilih (${
        fields.filter((row) => !row.tabel && row.placeholder !== "id").length
      })</h6>
      ${uncheckedItemsHtml}
    </div>
  </div>
</div>



    `;
  } catch (error) {
    console.error("❌ Save gagal:", error);
  }
}

export function getFields(data) {
  const files = Object.entries(data)
    .filter(([_, field]) => field) // cari field dengan modal true
    .map(([key, field]) => {
      return field;
    });

  return files.length > 0 ? files : false;
}
nx.addToSelectedTabelmodal = async function (id, variable, e, store = "nexaStore") {
  const dataform = await NXUI.ref.get(store, id);


   // Cek tipe dan update data yang sesuai
   if (dataform.type == "join") {
     if (dataform.formJoin && dataform.formJoin[variable]) {
       dataform.formJoin[variable].modal = e;
     }
   } else {
     if (dataform.form && dataform.form[variable]) {
       dataform.form[variable].modal = e;
     }
   }


   await NXUI.ref.mergeData(store, id, dataform);

   // Refresh tampilan setelah data diupdate
   if (window.refreshTabelDisplaymodal) {
     await window.refreshTabelDisplaymodal({ store: store, id: id });
   }
};

// Fungsi untuk me-refresh tampilan tabel
nx.refreshTabelDisplaymodal = async function (data) {
  try {
    const newHtml = await setModal(data);
    // Cari container yang berisi tabel dan update isinya
    const container = document.querySelector(".nx-container-setModal");
    if (container) {
      container.innerHTML = newHtml;
    }
  } catch (error) {
    console.error("❌ Refresh tampilan gagal:", error);
  }
};


nx.setItemModal =async function (variable, table) {
  const dataform = await NXUI.ref.get("nexaStore", table);
  let data;
  if (dataform?.type=='join') {
     data=dataform.formJoin[variable]
  } else {
     data=dataform.form[variable]
  }
    const store =data;
    const modalID = "setModal_" + variable + data?.name;
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-400px",
      minimize: true,
      label: `Modal ` + data?.placeholder,
      setDataBy: {
        ...data,
        id: table,
      },
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      getValidationBy: ["name"], // ✅ Standard validation approach
      onclick: {
        title: "Save Settings",
        cancel: "Cancel",
        send: "saveGroupByModal", // ✅ Use namespaced function name
      },
      content: `<div class="nx-row">
    <div class="nx-col-8">
     <input name="type"value="${dataform?.type}"type="hidden">
     <input name="variable"value="${variable}"type="hidden">
      <div class="form-nexa-group">
        <label>Status Modal</label>
    <select class="form-nexa-control" name="status">
      <option value="">Select Status</option>
      <option value="preview" ${
        store?.modal?.status === "preview" ? "selected" : ""
      }>Data Preview</option>
      <option value="joinpreview" ${
        store?.modal?.status === "joinpreview" ? "selected" : ""
      }>Data Join Preview</option>
      <option value="update" ${
        store?.modal?.status === "update" ? "selected" : ""
      }>Update Data</option>
      <option value="joinupdate" ${
        store?.modal?.status === "joinupdate" ? "selected" : ""
      }>Update Data Join</option>
    </select>
      </div>
    </div>
    <div class="nx-col-4">
      <div class="form-nexa-group">
        <label>Index Tabel</label>
        <input type="text" class="form-nexa-control" name="index" value="${
          store?.modal?.index || dataform?.key || ""
        }" />
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Style Width</label>
        <input type="text" class="form-nexa-control" name="width" value="${
          store?.modal?.width || "500"
        }" />
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Dimensi</label>
        <input type="text" class="form-nexa-control" name="dimensi" value="${
          store?.modal?.dimensi || "px"
        }" />
      </div>
    </div>
  </div>`,
    });
    NXUI.nexaModal.open(modalID);
};




nx.saveGroupByModal = async function (id, data, table) {
        const dataform = await NXUI.ref.get("nexaStore", table.id);
        if (data.type=='join') {
          dataform.formJoin[data.variable].modal = data;
        } else {
          dataform.form[data.variable].modal = data;

        } 
       await NXUI.ref.mergeData("nexaStore", table.id, dataform);
    // tutup modal
    NXUI.nexaModal.close(id);
};



export function getJoinFileFields(data) {
  const files = Object.entries(data)
    .filter(([_, field]) => field.modal) // cari field dengan modal true
    .map(([key, field]) => {
      return field;
    });

  return files.length > 0 ? files : false;
}