import { getIconByType } from "../Icon/index.js";
export async function setSelect(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="hendelModalSelect">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Metadata Select ${storage.className}</h3>  
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
          content: [await Failed(Sdk), await konfigurasi(Sdk)],
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

export async function Failed(Sdk) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("select");
  console.log(checkedItems);

  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th class="text">Type</th>
      <th>Failed</th>
      <th>Label</th>
      <th>Key</th>
      <th>Data</th>
      <th class="text-center">Option</th>
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
       <span class="material-symbols-outlined nx-icon-md">${getIconByType(
         item.type
       )} </span> ${item.type}
     </td>
     <td>${item.failedtabel}</td>
     <td>${item.placeholder}</td>
     <td>${item.select?.nameTabel || "Key"}=${
                item.select?.tabelvalue || "?"
              }</td>
     <td>${item.select?.data?.length || "0"}</td>
     <td class="text-center">
        <a  href="javascript:void(0);" onclick="addNativSelect('${
          item.name
        }','${item.type}','${
                storage.id
              }')" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">add</span>
         </a>
         <a  href="javascript:void(0);" onclick="addDatabaseSelect('${
          item.name
        }','${item.type}','${
                storage.id
              }')" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">database</span>
         </a>
       <a  href="javascript:void(0);" onclick="deleteFaild('${item.name}','${
                storage.id
              }')" title="Hapus item" style="color:#ccc" >
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

  let dsheight = "";
  if (storage.settings.model == "Content") {
    dsheight = "height:317px;";
  } else {
    dsheight = "height:390px;";
  }

  return {
    title: "Properti",
    col: "nx-col-8",
    footer: `<small class="text-muted">${
      checkedItems.length || "0"
    } Failed dari ${storage.priority} tabel</small>`,
    html: `
     <div class="nx-scroll-hidden" style="${dsheight}padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}

export async function konfigurasi(data) {
  return {
    title: "Konfigurasi Select",
    col: "nx-col-4",
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Field dengan status "Failed" perlu dikonfigurasi agar dapat digunakan dalam form.<br>
     <strong>🗑️ Delete:</strong> Tombol delete akan menghapus field select dari form secara permanen.
    </small>`,
    html: `
     <div class="nx-scroll-hidden" style="height:350px; padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Identifikasi Field Failed</strong>
              <p class="mb-2">Lihat tabel "Properti" untuk field select yang belum dikonfigurasi atau gagal.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Klik Icon Settings</strong>
              <p class="mb-2">Klik tombol settings (⚙️) pada baris field yang ingin dikonfigurasi.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Pilih Tabel Database</strong>
              <p class="mb-2">Pilih tabel yang akan menjadi sumber data untuk select field.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Konfigurasi Field Mapping</strong>
              <p class="mb-2">Tentukan field untuk "Tabel Text" (label) dan "Tabel Value" (nilai).</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5.Simpan Konfigurasi</strong>
              <p class="mb-2">Klik "Save Options" untuk menyimpan konfigurasi select field.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6.Hapus Field Failed</strong>
              <p class="mb-2">Klik tombol delete (🗑️) untuk menghapus field select yang tidak diperlukan dari form.</p>
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
    console.log(text);
    let data2 = await NXUI.Storage()
      .models("Office")
      .tabelVariables(tabelName, "addsearch");
    let template1 = "<option value=''>Select Field</option>";
    const tabelJoin = data2.data.addsearch.variables;
    tabelJoin.forEach((row) => {
      const isTextSelected = existingData?.tabeltext === row ? "selected" : "";
      const isValueSelected =
        existingData?.tabelvalue === row ? "selected" : "";
      template1 += `
              <option value="${row}" ${isTextSelected}>${row}</option>
          `;
    });

    NXUI.id("nameTabel").val(text);
    NXUI.id("addDatabaseSelectTabelText" + modalId).innerHTML = template1;

    // Create template for value field
    let template2 = "<option value=''>Select Field</option>";
    tabelJoin.forEach((row) => {
      const isValueSelected =
        existingData?.tabelvalue === row ? "selected" : "";
      template2 += `
              <option value="${row}" ${isValueSelected}>${row}</option>
          `;
    });
    NXUI.id("addDatabaseSelectTabelValue" + modalId).innerHTML = template2;

    NXUI.id("footer" + modalId).show();
  } catch (error) {
    console.error("Error loading table options:", error);
  }
}
nx.addDatabaseSelect = async function (variable, type, id) {
  const Sdk = new NXUI.Buckets(id);
  const storage = await Sdk.storage();
  const existingData = storage.form[variable]?.select;
  const tabelJoin = NEXA.controllers.data.tabel.submenu || [];
  let template = "";
  let template1 = "";
  let template2 = "";

  // Buat option untuk semua metadata
  tabelJoin.forEach((row) => {
    const isSelected = existingData?.tabelName === row.key ? "selected" : "";
    template += `<option value="${row.key}" ${isSelected}>${row.label}</option>`;
  });

  const modalId = "addDatabaseSelect"+ settoken(variable, id);
  NXUI.modalHTML({
    elementById: modalId,
    styleClass: "w-500px",
    minimize: true,
    label: `Configure Field "${variable}"`,
    setDataBy: Sdk,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    getValidationBy: ["name"], // ✅ Standard validation approach
    onclick: {
      title: "Save Options",
      cancel: "Cancel",
      send: "saveformOptionsValueSelect", // ✅ Use namespaced function name
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
        <select class="form-nexa-control" name="tabelName" id="addDatabaseSelectTabel${modalId}">
          <option value="">Select Tabel</option>
         ${template}
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Tabel Text</label>
        <select class="form-nexa-control"name="tabeltext" id="addDatabaseSelectTabelText${modalId}">
        <option value="">Select Field</option>
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Tabel Value</label>
        <select class="form-nexa-control"name="tabelvalue" id="addDatabaseSelectTabelValue${modalId}">
        <option value="">Select Field</option>
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
      existingData.tabelName,
      variable,
      modalId,
      existingData
    );
  }

  NXUI.id("addDatabaseSelectTabel" + modalId).on("change", async function (e) {
    await loadTableOptions(e.target.value, variable, modalId);
  });
};

nx.deleteFaild = async function (failed, tabel) {
  const Sdk = new NXUI.Buckets(tabel);
  const storage = await Sdk.storage();
  await Sdk.upField({
    [failed]: {
      type: 'text',
      select: false,
    },
  });
  await renderingSelect(storage);
};
nx.addNativSelect = async function (failed, tabel) {
  console.log(failed, tabel)
};


nx.saveformOptionsValueSelect = async function (modalid, data, tabel) {
  const storage = await tabel.storage();
  const renGroup = await NXUI.Storage()
    .models("Office")
    .setAtGroup(Number(data.tabelName), data.variable, [
      data.tabeltext,
      data.tabelvalue,
    ]);
  const result = renGroup.data.map((obj) => {
    const keys = Object.keys(obj);
    return {
      label: obj[keys[0]], // nilai dari key pertama
      key: obj[keys[1]] ?? obj[keys[0]], // nilai dari key kedua
      value: obj[keys[1]] ?? obj[keys[0]], // nilai dari key pertama
    };
  });
  console.log(result);

  await tabel.upField({
    [data.variable]: {
      select: {
        data: result,
        satatic: false,
        ...data,
      },
    },
  });
  renderingSelect(storage);
  NXUI.nexaModal.close(modalid);
};
export async function renderingSelect(store) {
  await NXUI.NexaRender.refresh(store, setSelect, {
    containerSelector: "#hendelModalSelect",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
