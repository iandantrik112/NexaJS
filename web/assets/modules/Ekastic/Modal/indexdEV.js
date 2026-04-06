import { NexaFactory } from "../../Tabel/index.js";
export async function setModal(data) {
  const dataform = await NXUI.ref.get(data.store, data.id);
    const dataformStor = getJoinFileFields(dataform.form);
    console.log(dataformStor)
  if (!dataformStor) {
    return `
   <div style="padding:30px" class="nx-container">
  <div class="nx-row">
    <div class="nx-col-12">
    <div class="nx-alert nx-alert-danger">
      Silahkan lakukan pegaturan Applications
    </div>
    </div>
  </div>
</div>
`;
  }

  NXUI.modalHTMLData = dataformStor;
  let templateField = "";
  dataformStor.forEach((row, index) => {
    const no = index + 1; // mulai dari 1
    templateField += `
        <li class="nx-list-item" id="wherekey${index}">
          <span class="material-symbols-outlined nx-icon-sm">bottom_sheets</span> Modal <strong>${
            row.placeholder
          } </strong> Status :<span class="material-symbols-outlined nx-icon-sm">preview</span> ${
      row?.modal?.status || "View"
    }
          <a class="pull-right" onclick="returnModelsettingsEnabel('${row.name}','${data.id}');" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
          <a class="pull-right"style="margin-right:10px"  onclick="returnModelsettings('${index}','${
      dataform.id
    }');" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">settings</span>
          </a>
        </li>
      `;
  });

  // NXUI.id("report-container").setStyle("padding", "10px")
  const wrapper = NXUI.createElement(
    "div",
    `
            <div class="nx-card-header">
     
              <div class="nx-card-title">
               <h5 class="bold">Metadata Modal  ${dataform.className}</h5>
              </div>
              <div class="nx-card-controls align-right">
              <a href="javascript:void(0);"onclick="returnModelsettings('${dataform.id}');"><span class="material-symbols-outlined nx-icon-md mr-5px">settings</span></a>
              </div>
         
        </div>
     <div class="nx-row pt-20px">
       <div class="nx-col-8">
         <div class="nx-scroll-hidden pl-10px" style="height:700px;padding-bottom:100px">
         ${templateField}
        </div>
        </div>
       <div class="nx-col-4">
        sssssssssssssss
       </div>
      </div>
    `
  );

  return wrapper.innerHTML;
}

export function getJoinFileFields(data) {
  const files = Object.entries(data)
    .filter(([_, field]) => field.modal) // cari field dengan modal true
    .map(([key, field]) => {
      return field;
    });

  return files.length > 0 ? files : false;
}

// Fungsi untuk refresh tampilan modal setelah ada perubahan
async function refreshModalDisplay(tableId) {
  // Ambil data terbaru dari store
  const dataform = await NXUI.ref.get("nexaStore", tableId);
  const dataformStor = getJoinFileFields(dataform.form);

  // Update data yang tersimpan
  NXUI.modalHTMLData = dataformStor;

  // Cari container yang menampilkan list modal
  const container = document.querySelector(".nx-scroll-hidden.pl-10px");
  if (container) {
    // Generate ulang template dengan data terbaru
    let templateField = "";
    dataformStor.forEach((row, index) => {
      const no = index + 1; // mulai dari 1
      templateField += `
          <li class="nx-list-item" id="wherekey${index}">
            <span class="material-symbols-outlined nx-icon-sm">bottom_sheets</span> Modal <strong>${
              row.placeholder
            } </strong> Status :<span class="material-symbols-outlined nx-icon-sm">preview</span> ${
        row?.modal?.status || "View"
      }
            <a class="pull-right" onclick="returnModelsettingsEnabel('${row.name}','${tableId}');" href="javascript:void(0);">
              <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
            </a>
            <a class="pull-right"style="margin-right:10px"  onclick="returnModelsettings('${index}','${
        dataform.id
      }');" href="javascript:void(0);">
              <span class="material-symbols-outlined nx-icon-sm">settings</span>
            </a>
          </li>
        `;
    });

    // Update konten container
    container.innerHTML = templateField;
  }
}

nx.returnModelsettings = function (id, table) {
  let data = NXUI.modalHTMLData;
  const store = data[id];
  const modalID = "setModal_" + id + data[id]?.name;
  NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: `Modal ` + data[id]?.placeholder,
    setDataBy: {
      ...data[id],
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
        store?.modal?.index || store?.key || ""
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
  // ambil data form sesuai table.id
  const dataform = await NXUI.ref.get("nexaStore", table.id);

  // update field modal sesuai table.name
  dataform.form[table.name].modal = data;

  // merge kembali ke store
  await NXUI.ref.mergeData("nexaStore", table.id, dataform);

  // update data yang ditampilkan di modal
  const updatedDataformStor = getJoinFileFields(dataform.form);
  NXUI.modalHTMLData = updatedDataformStor;

  // refresh tampilan modal dengan data terbaru
  await refreshModalDisplay(table.id);

  // tutup modal
  NXUI.nexaModal.close(id);
};


nx.returnModelsettingsEnabel = async function (name, table) {
  const dataform = await NXUI.ref.get("nexaStore", table);
   dataform.form[name].modal = false;
  await NXUI.ref.mergeData("nexaStore", table, dataform);
  const updatedDataformStor = getJoinFileFields(dataform.form);
  await refreshModalDisplay(dataform.id);
}
