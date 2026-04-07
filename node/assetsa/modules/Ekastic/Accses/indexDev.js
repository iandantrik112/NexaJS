import { AccsesTable } from "./Tabel.js";
import { setIconSelector } from "../System/Icon.js";
import { searchKeyword, initSearchAction } from "../Action/config.js";
import dataAccses from "./data.js";
export async function setAccses(data) {
  const dataform = await NXUI.ref.get(data.store, data.id);
  if (!dataform.form) {
    return `
   <div style="padding:30px" class="nx-container">
  <div class="nx-row">
    <div class="nx-col-12">
    <div class="nx-alert nx-alert-danger">
      Query Structure belum tersedia
    </div>
    </div>
  </div>
</div>
`;
  }

  // Inisialisasi tabel
  const accsesTable = new AccsesTable(dataform);
  window.accsesTable = accsesTable; // Global access untuk addStatus function

  // NXUI.id("report-container").setStyle("padding", "10px")
  const wrapper = NXUI.createElement(
    "div",
    `
        <div class="nx-card-header">
     
              <div class="nx-card-title">
               <h5 class="bold">Metadata Accses  ${dataform.className}</h5>
              </div>
              <div class="nx-card-controls align-right">
              <a href="javascript:void(0);"onclick="returnModelNavigation('${
                dataform.id
              }');"><span class="material-symbols-outlined nx-icon-md mr-5px">settings</span></a>
              </div>
         
        </div>


     <div class="nx-row ">
       <div class="nx-col-12">
         <div class="nx-scroll-hidden" style="height:700px;padding-bottom:100px">
          <div class="nx-col-12"><div class="form-nexa-floating"><div class="form-nexa-icon">
            <input type="search" id="nama" name="nama" class="form-nexa-control" placeholder="Cari User Accses">
            <i class="material-symbols-outlined" style="margin: 0px; font-size: 24px;">search</i>
          </div>
          <ul id="suggestions_nama" class="list-group mt-3"></ul>
          <span id="return_nama"></span>
          <div id="tableAccaes${dataform.id}">
           ${accsesTable.generateTableHTML()}
          </div>
       </div>
      </div>
    `
  );

  // Load table data after DOM is ready
  setTimeout(async () => {
    try {
      // Load data tabel awal
      await accsesTable.refreshTable();

      // Pass the retrieved form data to init function
      // await dytabel("tableAccaes" + dataform.id);
      // Set up callback function to handle data updates
      const handleCallbackData = async (data) => {
 
        // const Query= await new NXUI.Models()

        // Buat instance baru untuk setiap operasi
        const checkQuery = new NXUI.NexaModels();
        const insertQuery = new NXUI.NexaModels();
        const avatarset = new NXUI.NexaModels();
        checkQuery
          .Storage("controllers")
          .where("userid", data.id)
          .where("label", dataform.className)
          .then(async (response) => {
            if (response.data && response.data.length > 0) {
              console.log("sudah ada");

              await avatarset
                .Storage("controllers")
                .where("userid", data.id)
                .update({
                  avatar: data.avatar,
                });
            } else {
              insertQuery
                .Storage("controllers")
                .insert({
                  userid: data.id,
                  categori: "Accses",
                  nama: data.nama,
                  status: false,
                  avatar: data.avatar,
                  label: dataform.className,
                })
                .then(async (response) => {
                  console.log("✅ Insert berhasil:", response);

                  // Refresh tabel dengan data terbaru
                  await accsesTable.refreshTable();

                  // Optional: Tampilkan notifikasi sukses
                  if (window.NXUI && window.NXUI.notification) {
                    window.NXUI.notification.success("Data berhasil disimpan!");
                  }
                })
                .catch((error) => {
                  console.error("Insert gagal:", error);
                });
            }
          })
          .catch((error) => {
            console.error("Query gagal:", error);
          });

        window.searchCallbackData = data;
      };

      const redata = await searchKeyword(dataAccses, handleCallbackData);
    } catch (error) {
      console.error("❌ Error rendering form:", error);
    }
  }, 100);

  return wrapper.innerHTML;
}
//

nx.returnModelNavigation = async function (modal) {
  const dataform = await NXUI.ref.get("nexaStore", modal);
  console.log(dataform);
  const modalID = "app_" + modal;
  NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: `Applications`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    // Select: ["#groupbySelect"],
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy: dataform, // ✅ Standard validation approach
    onclick: {
      title: "Save",
      cancel: "Cancel",
      send: "saveGApps", // ✅ Use namespaced function name
    },
    content: `
  <div class="nx-row">
  <div class="nx-col-12">
    <div class="form-nexa-group">
      <label>App Label Name</label>
      <input type="text" class="form-nexa-control" name="name"value="${
        dataform?.applications?.name || dataform.className
      }" />
    </div>
  </div>
  <div class="nx-col-6">
    <div class="form-nexa-group">
      <label>Version</label>
      <input type="text" class="form-nexa-control" name="version"value="${
        dataform?.applications?.version || dataform.version
      }" />
    </div>
  </div>
        <div class="nx-col-6">
          <label for="icons">Icon: </label>
           <div class="form-nexa-input-group">
                           <input name="icons" type="text" id="icons${
                             dataform?.applications?.name
                           }" class="form-nexa-control" 
                     value="${dataform?.applications?.icons || "inventory_2"}" 
                     placeholder="search" readonly style="cursor: pointer;">
              <div class="form-nexa-input-group-text">
                <button type="button" class="nx-btn-info" onclick="openIconSelector('${
                  dataform?.applications?.name || dataform.className
                }', 'text')" 
                       style="background: #17a2b8; color: white; border: none; padding: 4px 8px; border-radius: 4px;">
                 <span class="material-symbols-outlined" style="font-size: 18px;">palette</span>
               </button>
             </div>
           </div>
        </div>
</div>
`,
  });
  NXUI.nexaModal.open(modalID);
};

nx.saveGApps = async function (modal, data, tabel) {
  console.log(data);
  const existingData = {
    applications: data,
  };

  await NXUI.ref.mergeData(tabel.store, tabel.id, existingData);
  NXUI.nexaModal.close(modal);
};
