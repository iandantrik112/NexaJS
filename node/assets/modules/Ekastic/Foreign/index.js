import { getIconByType } from "../Icon/index.js";

export async function setforeignTable(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const allAlias = storage.buckets.allAlias.map(item => item.replace(/\s+AS\s+\w+$/i, ''));
    NXUI.AliasIdkey=data.id;
        const dimensi = new NXUI.NexaDimensi();
    const height = dimensi.height("#nexa_app", 210, 'vh');
    NXUI.Alias=allAlias;
    const wrapper = NXUI.createElement(
      "div",
      `
  <div class="nx-card-header">
   <h3 class="bold fs-20px">Operasi Foreign</h3>  
 </div>

      <div id="setforeignTable">
         <div class="nx-row" id="nxdrop"></div>
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
          content: [await Fitur(Sdk,height), await Konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
      } catch (error) {
        // Error initializing drag and drop
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    // Manual mode initialization failed
  }
}

export async function Fitur(Sdk,height) {
const checkedItems = await Sdk.getFields("condition");

// Ambil hanya item yang memiliki foreign
const hasForeign = checkedItems.filter(item => item?.foreign);

// Ambil hanya bagian foreign-nya
const foreignOnly = hasForeign.map(item => item?.foreign);

  return {
    title: "Foreign",
    col: "nx-col-9",
    footer: "nx-col-6",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    html: `
<table class="nx-table">
  <thead>
    <tr>
      <th>Icon</th>
      <th>Type</th>
      <th>Failed</th>
      <th>Alis</th>
      <th>Foreign</th>
      <th class="tx-right">Action</th>
    </tr>
  </thead>
  <tbody>
       ${
      Array.isArray(checkedItems)
        ? checkedItems
            .map(
              (item, index) => `
    <tr>
      <td>  <span class="material-symbols-outlined nx-icon-md">${getIconByType(
         item.type,item.icons)}</span></td>
      <td>${item.type}</td>
      <td>${item.failed}</td>
      <td>${item.fieldAlias}</td>
      <td>${item?.foreign?.failed ||"Null"}</td>
 
      
      <td class="tx-right">
         <a href="javascript:void(0);" onclick="addforeign('${item.key}','${item.fieldAlias}','${item.failedtabel}')" style="color:#ccc" >
          <span class="material-symbols-outlined nx-icon-md">settings</span>
        </a>
       <a href="javascript:void(0);" onclick="deleteforeign('${item.key}','${item.fieldAlias}','${item.failedtabel}')" style="color:#ccc" >
          <span class="material-symbols-outlined nx-icon-md">delete</span>
        </a>
      </td>
    </tr>`
            )
            .join("")
        : ""
  }

  </tbody>
</table>

      `,
  };
}

export async function Konfigurasi(data,height) {
  return {
    title: "Konfigurasi",
    col: "nx-col-3",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `        
     <small>
       <strong>💡 Tips:</strong> Atur relasi <em>Foreign</em> per kolom 
      
     </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>1. Pilih Kolom</strong>
              <p class="mb-1">Di tabel <em>Foreign</em> kiri, tentukan kolom yang ingin diberi relasi.</p>
            </div>
          </div>
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>2. Buka Pengaturan</strong>
              <p class="mb-1">Klik ikon <strong>settings</strong> pada baris kolom tersebut untuk membuka modal.</p>
            </div>
          </div>
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>3. Pilih Field Tujuan</strong>
              <p class="mb-1">Pada modal, pilih <em>field</em> tujuan yang akan menjadi referensi <em>foreign</em>.</p>
            </div>
          </div>
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>4. Simpan Relasi</strong>
              <p class="mb-1">Tekan <strong>Save Foreign</strong> untuk menyimpan. Tampilan akan direfresh otomatis.</p>
            </div>
          </div>
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>5. Terapkan ke Bucket/Query</strong>
              <p class="mb-1">Jika diperlukan, klik <strong>Update Bucket</strong> untuk menerapkan perubahan ke konfigurasi query.</p>
            </div>
          </div>
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>6. Hapus Relasi Foreign</strong>
              <p class="mb-1">Klik ikon <strong>delete</strong> pada baris kolom untuk menghapus relasi foreign yang sudah diset.</p>
            </div>
          </div>
        </div>
        
        <div class="nx-card-content p-10px" style="margin-top: 20px;">
          <h4 class="mb-2">❓ Apa itu Foreign?</h4>
          <div class="nx-info-box">
            <div class="nx-info-item">
              <span class="material-symbols-outlined nx-icon-sm">link</span>
              <div>
                <strong>Relasi Antar Tabel</strong>
                <p class="mb-1">Menghubungkan kolom saat ini ke kolom lain (referensi) untuk kebutuhan join/lookup.</p>
              </div>
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
  await NXUI.NexaRender.refresh(store, setforeignTable, {
    containerSelector: ["#setforeignTable"],
  });
}

window.addforeign = async function (key,failed,failedtabel) {
const modalId = failed + '_' + key;
let allAlias = NXUI.Alias;

const prefix = failedtabel.split('.')[0];

const result = allAlias
  .filter(item => item.startsWith(prefix + '.'))
  .map(item => item.replace(prefix + '.', ''));
   let templateField=''
   result.forEach((item, index) => {
      templateField += `
        <option value="${item}">${item}</option>
      `;
    });






    NXUI.modalHTML({
    elementById: modalId,
    styleClass: "w-400px",
    minimize: true,
    label: `Foreign By Field ${failed}`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    // Select: ["#groupbySelect"], 
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy:{
      key:key,
      failed:failed,
    }, // ✅ Standard validation approach
    onclick: {
      title: "Save Foreign",
      cancel: "Cancel",
      send: "saveForeignValue", // ✅ Use namespaced function name
    },
    content:`
<div class="form-nexa-group">
  <select name="failed"class="form-nexa-control">
      <option value="">Select Failed</option>
   ${templateField}
  </select>
</div>`,
  });
  NXUI.nexaModal.open(modalId);












};

window.saveForeignValue = async function (modalid,data,setDataBy) {
 const Sdk = new NXUI.Buckets(NXUI.AliasIdkey);

     await Sdk.upField({
       [setDataBy.failed]:{
           foreign:{
            key:setDataBy.key,
            failed:[data.failed],
           }
         },
     });
         const storage = await Sdk.storage();
await rendering(storage)
NXUI.nexaModal.close(modalid);
}
window.deleteforeign = async function (key,fieldAlias,failedtabel) {
   const Sdk = new NXUI.Buckets(NXUI.AliasIdkey);

       await Sdk.upField({
         [fieldAlias]:{
             foreign:false
           },
       });
           const storage = await Sdk.storage();
  await rendering(storage)
// NXUI.nexaModal.close(modalid);
}


