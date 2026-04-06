import { getIconByType } from "../Icon/index.js";
import { FieldOptions } from "./FieldOptions.js";
export async function setTags(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
      const dimensi = new NXUI.NexaDimensi();

  const height = dimensi.height("#nexa_app", 220, 'vh');
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="hendelModalTags">
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
   const checkedItems = await Sdk.getFields("tags");
console.log('label:', checkedItems[0]?.limit);
  // Ambil semua tags.data dari semua checkedItems dan flatten menjadi satu array
  const result2 = checkedItems
     .filter(item => item?.tags?.data && Array.isArray(item.tags.data))
     .flatMap(item => item.tags.data)
     .map(item => ({
      failed: item.value || item.label,
     }));
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
          content: [await FailedTags(Sdk,height), await konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
         await tabelEdit(Sdk);
        new NXUI.NexaTags({
          targetId: ["tags"],
          data: result2 && result2.length > 0 ? result2 : false,  // Gunakan result2 jika ada data, false jika tidak ada
          validasi: [Number(checkedItems[0]?.limit)],
          onChange: (data) => {
            // Tags changed
          }
        });


      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}
export async function tabelEdit(store) {
  try {
    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        // Update field dengan nilai baru berdasarkan fieldName
          await store.upField({
            [variable]: {
              [fieldName]: newValue,
            },
          });
        // Re-render form setelah perubahan
        await renderingSelectTags(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}
export async function FailedTags(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("tags");
  
  // Cek apakah ada data tags yang sudah dikonfigurasi
  const hasData = checkedItems.some(item => item?.tags?.data && Array.isArray(item.tags.data) && item.tags.data.length > 0);
  const placeholder = hasData 
    ? "Cari tag atau ketik tag baru lalu tekan Enter..." 
    : "Ketik tag baru lalu tekan Enter...";
  
  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th class="text">Type</th>
      <th>Failed</th>
      <th>Label</th>
      <th>Limit</th>
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
     <td>
        <div id="${
           item.name
         }" type="number" class="editable" data-min-length="1" name="limit">${item?.limit|| 0}</div>




     </td>
     <td>${item.tags?.data?.length || "0"}</td>
     <td class="text-center">
        <a  href="javascript:void(0);" onclick="addNativSelectTags('${
          item.name
        }','${item.type}','${storage.id}')" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">add</span>
         </a>



         
         <a  href="javascript:void(0);" onclick="addDatabaseSelectTags('${
           item.name
         }','${item.type}','${storage.id}')" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">database</span>
         </a>
       <a  href="javascript:void(0);" onclick="deleteFaildTags('${item.name}','${
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

  <div style="padding-top: 100px;">
<div class="form-nexa-group">
  <label class="small text-primary"><strong>📝 Tag Selector</strong></label>
  <p class="text-muted small mb-2">Pilih atau buat tag baru. Tag ini akan digunakan untuk semua field select yang telah dikonfigurasi.</p>
  <input type="text" id="tags" class="form-nexa-control" name="failed" placeholder="${placeholder}" />
</div>
</div>








   `;


  return {
    title: "Properti",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${
      checkedItems.length || "0"
    } Failed dari ${storage.priority} tabel</small>`,
    html: `
     <div style="padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}

export async function konfigurasi(data,height) {
  return {
    title: "Panduan Metadata Select",
    col: "nx-col-4",
          scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Field Perlu dikonfigurasi

    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Identifikasi Field Failed</strong>
              <p class="mb-2">Lihat tabel "Properti" untuk field select yang belum dikonfigurasi atau gagal. Kolom "Data" menunjukkan jumlah opsi yang tersedia. Status "Failed" atau "Data: 0" menunjukkan field perlu setup.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Pilih Jenis Konfigurasi</strong>
              <p class="mb-2">Ada 2 opsi konfigurasi:<br>
              • <span class="material-symbols-outlined nx-icon-sm">add</span> <strong>Native:</strong> Input manual option select<br>
              • <span class="material-symbols-outlined nx-icon-sm">database</span> <strong>Database:</strong> Ambil data dari tabel database</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3a.Konfigurasi Native Select</strong>
              <p class="mb-2">Untuk Native Select:<br>
              • Input label dan value untuk setiap option<br>
              • Gunakan tombol "+" untuk menambah option baru<br>
              • Format: Label (tampilan) dan Value (nilai tersimpan)</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3b.Konfigurasi Database Select</strong>
              <p class="mb-2">Untuk Database Select:<br>
              • Pilih tabel dari dropdown metadata<br>
              • Tentukan "Tabel Text" (field untuk label)<br>
              • Tentukan "Tabel Value" (field untuk value)<br>
              • Data akan otomatis ter-load dari database</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Simpan Konfigurasi</strong>
              <p class="mb-2">Klik "Save Options" untuk menyimpan konfigurasi. Field akan otomatis terupdate dan siap digunakan.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5.Tag Selector</strong>
              <p class="mb-2">Di bagian bawah tabel ada input <strong>"Tag Selector"</strong>:<br>
              • <strong>Cari tag:</strong> Ketik untuk mencari tag yang sudah ada<br>
              • <strong>Buat tag baru:</strong> Ketik nama tag baru lalu tekan <strong>Enter</strong><br>
              • Tag yang dipilih/buat akan tersedia untuk semua field select yang sudah dikonfigurasi</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6.Manajemen Field</strong>
              <p class="mb-2">• <span class="material-symbols-outlined nx-icon-sm">delete</span> <strong>Delete:</strong> Hapus field select yang tidak diperlukan<br>
              • Field yang dihapus akan dikonversi ke type 'text'<br>
              • Konfigurasi akan hilang secara permanen</p>
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
  await NXUI.NexaRender.refresh(store, hendelModalTags, {
    containerSelector: ["#hendelModalTags"],
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
    NXUI.id("addDatabaseSelectTagsTabelText" + modalId).innerHTML = template1;

    // Create template for value field
    let template2 = "<option value=''>Select Field</option>";
    tabelJoin.forEach((row) => {
      const isValueSelected =
        existingData?.tabelvalue === row ? "selected" : "";
      template2 += `
              <option value="${row}" ${isValueSelected}>${row}</option>
          `;
    });
    NXUI.id("addDatabaseSelectTagsTabelValue" + modalId).innerHTML = template2;

    NXUI.id("footer" + modalId).show();
  } catch (error) {
    console.error("Error loading table options:", error);
  }
}
nx.addDatabaseSelectTags = async function (variable, type, id) {
  const Sdk = new NXUI.Buckets(id);
  const storage = await Sdk.storage();
  const existingData = storage.form[variable]?.tags;
  const tabelJoin = NEXA.controllers.data.tabel.submenu || [];
  let template = "";
  let template1 = "";
  let template2 = "";

  // Buat option untuk semua metadata
  tabelJoin.forEach((row) => {
    const isSelected = existingData?.tabelName === row.key ? "selected" : "";
    template += `<option value="${row.key}" ${isSelected}>${row.label}</option>`;
  });
  const modalId = "tangs"+variable;
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
      send: "saveformOptionsCastemTags", // ✅ Use namespaced function name
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
        <select class="form-nexa-control" name="tabelName" id="addDatabaseSelectTagsTabel${modalId}">
          <option value="">Select Tabel</option>
         ${template}
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Tabel Text</label>
        <select class="form-nexa-control"name="tabeltext" id="addDatabaseSelectTagsTabelText${modalId}">
        <option value="">Select Field</option>
        </select>
      </div>
    </div>
    <div class="nx-col-6">
      <div class="form-nexa-group">
        <label>Tabel Value</label>
        <select class="form-nexa-control"name="tabelvalue" id="addDatabaseSelectTagsTabelValue${modalId}">
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

  NXUI.id("addDatabaseSelectTagsTabel" + modalId).on("change", async function (e) {
    await loadTableOptions(e.target.value, variable, modalId);
  });
};

nx.deleteFaildTags = async function (failed, tabel) {
  const Sdk = new NXUI.Buckets(tabel);
  const storage = await Sdk.storage();
  await Sdk.upField({
    [failed]: {
      tags: {
        data: 0,
      },
    },
  });
  await renderingSelectTags(storage);
};
nx.addNativSelectTags = async function (variable, type, id) {
  // Set global variable for fallback
  window.currentFieldVariable = variable;

  const Sdk = new NXUI.Buckets(id);
  const storage = await Sdk.storage();
  const randomID = variable + Math.floor(Math.random() * 1000);
  NXUI.modalHTML({
    elementById: randomID,
    styleClass: "w-500px",
    minimize: true,
    label: `Configure Field "${variable}"`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy: {
      variable: variable,
      app: Sdk,
    }, // ✅ Standard validation approach
    onclick: {
      title: "Save Options",
      cancel: "Cancel",
      send: "saveformOptionsValueNativTags", // ✅ Use namespaced function name
    },
    content: await FieldOptions(variable, type, storage),
    footer: `
        <button type="button" onclick="addNewOption('${variable}_${type}')" class="nx-btn-white btn-sm">
          <span class="material-symbols-outlined" style="font-size: 21px; margin: 0px;">add</span>
        </button>
     
    

   `,
  });
  NXUI.nexaModal.open(randomID);

  // FieldOptions(variable, type)
};

nx.saveformOptionsValueNativTags = async function (modalid, data, tabel) {
  const Sdk = tabel.app;
  const storage = await Sdk.storage();

  const result = Object.keys(data)
    .filter((key) => key.includes("_text"))
    .map((key) => {
      const index = key.match(/\d+/)[0]; // ambil angka index (misal 0, 1, 2)
      const variableName = tabel.variable;
      return {
        label: data[`${variableName}_${index}_text`],
        key: data[`${variableName}_${index}_value`],
        value: data[`${variableName}_${index}_value`],
      };
    })
    .filter((option) => option.label && option.label.trim() !== ""); // Filter out empty options
  await Sdk.upField({
    [tabel.variable]: {
      tags: {
        data: result,
      },
    },
  });
  renderingSelectTags(storage);
  NXUI.nexaModal.close(modalid);
};
nx.saveformOptionsCastemTags = async function (modalid, data, tabel) {
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

  await tabel.upField({
    [data.variable]: {
      tags: {
        data: result,
        satatic: false,
        ...data,
      },
    },
  });
  renderingSelectTags(storage);
  NXUI.nexaModal.close(modalid);
};
export async function renderingSelectTags(store) {
  await NXUI.NexaRender.refresh(store, setTags, {
    containerSelector: "#hendelModalTags",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
