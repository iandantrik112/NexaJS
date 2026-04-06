import { getIconByType } from "../Icon/index.js";
export async function setSearch(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
          const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 210, 'vh');
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `

     <div id="hendelModalSelect">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Metadata Search ${storage.className}</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div  class="pr-10px nx-scroll-hidden"style="height:600px">
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
          </div>
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
          content: [await Failed(Sdk,height), await Konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function Failed(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("search");

  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-1">
  <thead>
    <tr>
      <th class="text">Type</th>
      <th>Failed</th>
      <th>Label</th>
      <th>Key</th>
      <th>Data</th>
      <th class="text-center">Settings</th>
    </tr>
  </thead>
  <tbody>
    ${
      checkedItems
        ? checkedItems
            .map(
              (item, index) => `

      <tr>
      <td  class="text">
       <span class="material-symbols-outlined nx-icon-md">${NXUI.getIconByType(
         item.type
       )} </span> ${item.type}
     </td>
     <td>${item.name}</td>
     <td>${item.placeholder}</td>
     <td>${item.search?.nameTabel || "Key"}=${
                item.search?.tabelvalue || "?"
              }</td>
     <td>${item.search?.data || "0"}</td>
     <td class="text-center">
   <a  href="javascript:void(0);" onclick="addNewDatabaseSearch('${
     item.name
   }','${item.type}','${storage.id}')" title="Hapus item" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">settings</span>
         </a>
       <a  href="javascript:void(0);" onclick="deleteFaildSearch('${
         item.name
       }','${storage.id}')" title="Hapus item" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">delete</span>
         </a>
     </td>
   

     
      
       </tr>
    `
            )
            .join("")
        : "<tr></tr>"
    }
  </tbody>
</table>
   `;

 
  return {
    title: "Properti",
    col: "nx-col-8",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${
      checkedItems.length || ""
    } Failed dari ${storage.priority} tabel</small>`,
    html: `
     <div style="padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}

export async function Konfigurasi(data,height) {
  return {
    title: "Konfigurasi Search",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `        
     <small>
       <strong>💡 Tips:</strong> Field dengan status "Failed" 
     </small>`,
    html: `
     <div  style=" padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>1.Identifikasi Field Failed</strong>
              <p class="mb-1">Lihat tabel "Property" untuk field search yang belum dikonfigurasi atau gagal.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>2.Klik Icon Settings</strong>
              <p class="mb-1">Klik tombol settings (⚙️) pada baris field yang ingin dikonfigurasi.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>Pilih Tabel Database</strong>
              <p class="mb-1">Pilih tabel yang akan menjadi sumber data untuk search field.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>3.Konfigurasi Field Mapping</strong>
              <p class="mb-1">Tentukan field untuk "Tabel Text" (label) dan "Tabel Value" (nilai).</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>4.Konfigurasi Where Clause (Opsional)</strong>
              <p class="mb-1">Pilih "Where Field" untuk filter data dan "Where Value" untuk nilai filter yang spesifik.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>5.Set Hidden Target ID</strong>
              <p class="mb-1">Pilih field yang akan menjadi target ID tersembunyi untuk search.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>6.Konfigurasi Access Data</strong>
              <p class="mb-1">Pilih tingkat akses data: "Public" untuk akses umum atau "Private" untuk akses terbatas.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>7.Simpan Konfigurasi</strong>
              <p class="mb-1">Klik "Save Options" untuk menyimpan konfigurasi search field.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>8.Instalasi Component Value (Opsional)</strong>
              <p class="mb-1">Jika ingin hasil search dari target masuk ke dalam inputan form, buka menu "Components" dan instal component Value pada field search yang sudah dikonfigurasi. Component ini akan memetakan hasil search ke field condition yang ditentukan.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>9.Hapus Field Failed</strong>
              <p class="mb-1">Klik tombol delete (🗑️) untuk menghapus field search yang tidak diperlukan dari form.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

export async function rendering(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, hendelModalSelect, {
    containerSelector: ["#hendelModalSelect"],
  });
}

async function loadTableOptions(
  tabelName,
  variable,
  modalId,
  existingData = null
) {
  try {
    const text =
      NEXA.controllers.data.tabel.submenu.find((item) => item.key === tabelName)
        ?.label || "";
    let data2 = await NXUI.Storage()
      .models("Office")
      .tabelVariables(tabelName, "addsearch");
    let template1 = `<option value="${existingData?.tabeltext || ""}">${
      existingData?.tabeltext || "Select Text"
    }</option>`;
    let template2 = ` <option value="${existingData?.wheretext || ""}">${
      existingData?.wheretext || "Select Where"
    }</option>`;
    const tabelJoin = data2.data.addsearch.variables;

    tabelJoin.forEach((row) => {
      template1 += `
              <option value="${row}">${row}</option>
          `;
    });

    tabelJoin.forEach((row) => {
      template2 += `
              <option value="${row}">${row}</option>
          `;
    });

    NXUI.id("nameTabel").val(text);
    NXUI.id("addNewDatabaseSearchTabelText" + modalId).innerHTML = template1;
    NXUI.id("whereText" + modalId).innerHTML = template2;

    // Create template for value field
    let template3 = ` 
      <option value="${existingData?.tabelvalue || ""}">${
       existingData?.tabelvalue || "Select Value"}</option>
     `;
   let template4 = ` <option value="${existingData?.labelvalue || ""}">${
      existingData?.labelvalue || "Select Value"
    }</option>`;


    tabelJoin.forEach((row) => {
      const isValueSelected =
        existingData?.tabelvalue === row ? "selected" : "";
      template3 += `
                <option value="${row}">${row}</option>
            `;
    });

    tabelJoin.forEach((row) => {
      const isValueSelected =
        existingData?.tabelvalue === row ? "selected" : "";
      template4 += `
                <option value="${row}">${row}</option>
            `;
    });


    NXUI.id("addNewDatabaseSearchTabelValue" + modalId).innerHTML = template3;
    NXUI.id("addNewDatabaseSearchLabelValue" + modalId).innerHTML = template4;

    NXUI.id("whereText" + modalId).on("change", async function (e) {
      const tabelCalss = e.target.value;
      const renGroup = await NXUI.Storage()
        .models("Office")
        .setAtGroup(tabelName, tabelCalss, tabelCalss);
      let template4 = `<option value="${existingData?.wherevalue || ""}">${
        existingData?.wherevalue || "Select Value"
      }</option>`;

      // Add null check before calling forEach
      if (renGroup.data && Array.isArray(renGroup.data)) {
        renGroup.data.forEach((row) => {
          template4 += `
                            <option value="${row[tabelCalss]}">${row[tabelCalss]}</option>
                        `;
        });
      }

      NXUI.id("whereValue" + modalId).innerHTML = template4;
    });

    NXUI.id("footer" + modalId).show();
  } catch (error) {
    console.error("Error loading table options:", error);
  }
}
nx.addNewDatabaseSearch = async function (variable, type, id) {
  const Sdk = new NXUI.Buckets(id);
  const storage = await Sdk.storage();
  const existingData = storage.form[variable]?.search;
  console.log('label:', existingData);
  const tabelJoin = NEXA.controllers.data.tabel.submenu || [];
  let template = "";
  let template1 = "";
  let template2 = "";
  let template3 = "";
  // Check if storage.variable exists before calling forEach
  if (storage.variables && Array.isArray(storage.variables)) {
    storage.variables.forEach((row) => {
      const isSelected = existingData?.hiddenvalue === row ? "selected" : "";
      template3 += `<option value="${row}" ${isSelected}>${row}</option>`;
    });
  }

  // Buat option untuk semua metadata
  tabelJoin.forEach((row) => {
    const isSelected = existingData?.tabelName === row.key ? "selected" : "";
    template += `<option value="${row.key}" ${isSelected}>${row.label}</option>`;
  });

  const modalId = "addNewDatabaseSearch" + settoken(variable, id);
  NXUI.modalHTML({
    elementById: modalId,
    styleClass: "w-600px",
    minimize: true,
    label: `Configure Field "${variable}"`,
    setDataBy: Sdk,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    // getValidationBy: ["name"], // ✅ Standard validation approach
    onclick: {
      title: "Save Options",
      cancel: "Cancel",
      send: "saveACIDOptionsValueSearch", // ✅ Use namespaced function name
    },
    content: `
  <div class="nx-row">
    <div class="nx-col-12">
      <input type="hidden" id="nameTabel" name="nameTabel" value="${
        existingData?.nameTabel || ""
      }">
      <input type="hidden" id="variable" name="variable" value="${variable}">
      <input type="hidden" id="type" name="type" value="${type}">
      <div class="form-nexa-group">
        <label>Tabel Name</label>
        <select class="form-nexa-control" name="tabelName" id="addNewDatabaseSearchTabel${modalId}">
          <option value="">Select Tabel</option>
         ${template}
        </select>
      </div>
    </div>
    <div class="nx-col-4">
      <div class="form-nexa-group">
        <label>Tabel Text</label>
        <select class="form-nexa-control"name="tabeltext" id="addNewDatabaseSearchTabelText${modalId}">
         <option value="${existingData?.tabeltext || ""}">${
      existingData?.tabeltext || "Select Text"
    }</option>
        </select>
      </div>
    </div>
    <div class="nx-col-4">
      <div class="form-nexa-group">
        <label>Tabel Value</label>
        <select class="form-nexa-control"name="tabelvalue" id="addNewDatabaseSearchTabelValue${modalId}">
             <option value="${existingData?.tabelvalue || ""}">${
      existingData?.tabelvalue || "Select Value"
    }</option>
        </select>
      </div>
    </div>
    <div class="nx-col-4">
      <div class="form-nexa-group">
        <label>Label Value</label>
        <select class="form-nexa-control"name="labelvalue" id="addNewDatabaseSearchLabelValue${modalId}">
             <option value="${existingData?.labelvalue || ""}">${
      existingData?.labelvalue || "Select Value"
    }</option>
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Where Field</label>
        <select class="form-nexa-control"name="wheretext" id="whereText${modalId}">
        <option value="">Select Where</option>
        <option value="${existingData?.wheretext || ""}">${
      existingData?.wheretext || "Select Where"
    }</option>
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Where Value</label>
        <select class="form-nexa-control"name="wherevalue" id="whereValue${modalId}">
        <option value="${existingData?.wherevalue || ""}">${
      existingData?.wherevalue || "Select Value"
    }</option>
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Hidden Taget ID Value</label>
        <select class="form-nexa-control"name="hiddenvalue" id="addNewHiddendSearchTabelValue${modalId}">
               <option value="${existingData?.hiddenvalue || ""}">${
      existingData?.hiddenvalue || "Select Taget ID"
    }</option>
         ${template3}
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Access Data</label>
        <select class="form-nexa-control"name="access">
               <option value="${existingData?.access || ""}">${
      existingData?.access || "Access Data"
    }</option>

         <option value="public">Public</option>
         <option value="private">Private</option>
        </select>
      </div>
    </div>
  </div>
    `,
  });
  NXUI.nexaModal.open(modalId);
  NXUI.id("footer" + modalId).hide();

  // Load existing data if available
  if (existingData?.tabelName) {
    await loadTableOptions(
      existingData?.tabelName,
      variable,
      modalId,
      existingData
    );
  }

  NXUI.id("addNewDatabaseSearchTabel" + modalId).on(
    "change",
    async function (e) {
      await loadTableOptions(e.target.value, variable, modalId);
    }
  );
};

nx.saveACIDOptionsValueSearch = async function (modalid, data, tabel) {
       const storage = await tabel.storage();
       const renGroup = await NXUI.Storage()
         .models("Office")
         .setAtGroupObj({
           key:{
             [Number(data.tabelName)]:data.variable
           },
           columns:[
             data.tabeltext,
             data.tabelvalue,
           ]
         });
    const result =
      renGroup.data && Array.isArray(renGroup.data)
        ? renGroup.data.map((obj) => {
            const keys = Object.keys(obj);
            return {
              label: obj[keys[0]], // nilai dari key pertama
              key: obj[keys[1]] ?? obj[keys[0]], // nilai dari key kedua
              value: obj[keys[1]] ?? obj[keys[0]], // nilai dari key pertama
            };
          })
        : []; // Return empty array if data is null or not an array
      await tabel.upField({
        [data.variable]: {
          search: {
            data: result.length,
            satatic: false,
            ...data,
          },
        },
      });
    renderingSearch(storage);
    NXUI.nexaModal.close(modalid);
};

nx.deleteFaildSearch = async function (failed, tabel) {
  const Sdk = new NXUI.Buckets(tabel);
  const storage = await Sdk.storage();
  await Sdk.upField({
    [failed]: {
      type: "text",
      search: false,
    },
  });
  await renderingSearch(storage);
};

export async function renderingSearch(store) {
  await NXUI.NexaRender.refresh(store, setSearch, {
    containerSelector: "#hendelModalSelect",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
