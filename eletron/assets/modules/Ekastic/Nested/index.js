import { Nestedform } from "./form.js";

// Flag untuk mencegah infinite loop saat re-render
let isRendering = false;
let currentNexaFieldInstance = null;

export async function setNested(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
      const dimensi = new NXUI.NexaDimensi();
console.log('storage:', storage);
  const height = dimensi.height("#nexa_app", 220, 'vh');
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="uiNested">
        <div class="nx-card-header">
          <h3 class="bold fs-20px">Nested</h3>  
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
        // Cleanup instance lama jika ada
        if (currentNexaFieldInstance) {
          currentNexaFieldInstance = null;
        }

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
          // await setCheckbox(Sdk);



      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function FailedTags(Sdk,height) {
  const storage = await Sdk.storage();
      console.log('handler:', storage.handler);

   // Ambil data lengkap dari handler object untuk ditampilkan di tabel
   const variabel = storage?.handler ? Object.entries(storage.handler) : [];
   const jumlahVariabel = variabel.length;

  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th class="text">Icon</th>
      <th>action</th>
      <th>Label</th> 
      <th class="text-center1">Status</th>
      <th class="text-center1">Type</th>
      <th>Config</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${
      variabel
        ? variabel
            .map(

              ([key, item], index) => {   
                const dataSetting = item?.length ?? null;
                const modalSetting = 'settingObj' + (item?.nested || 'form');
                return `
      <tr>
      <td  class="text">
       <span class="material-symbols-outlined nx-icon-md">${item?.icon || 'menu'}</span>
     </td>    
     <td>${item?.action || key}</td>
     <td>
      <span id="${key}" type="text" class="editable" data-min-length="5" name="label">${item?.label || key}</span>
     </td>

           <td class="text-center1">
                  <div class="nx-switch-grid">
                    <div class="nx-switch-item">
                      <input class="${
                        key
                      }" name="handler" type="checkbox" id="handler_${key}${index}"
                       ${dataSetting ? "checked" : ""}
                      />
                      <label for="handler_${key}${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>

     </td>
 <td>
  <div id="${key}"type="select" class="editable" name="nested" data-options="${item?.nested || 'form'}|form|query">${item?.nested || 'Not'}</div>
        
</td> 
<td>
  ${dataSetting || "Not"}
</td> 

     <td class="text-center">
       <a  href="javascript:void(0);" onclick="nx.${modalSetting}('${key}','${storage.id}','${item?.nested || 'form'}')" title="Hapus item" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">settings</span>
         </a>
     </td>

       </tr>
    `;
            })
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
    footer: `<small class="text-muted">${jumlahVariabel || "0"} Variabel Handler</small>`,
    html: `
     <div style="padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}

export async function konfigurasi(data,height) {
  return {
    title: "Panduan Handler",
    col: "nx-col-4",
          scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Handler mengatur konfigurasi action dari dropdown

    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Mengedit Label</strong>
              <p class="mb-2">• Klik pada teks label di kolom "Label" untuk mengedit<br>
              • Label minimal 5 karakter<br>
              • Tekan Enter atau klik di luar untuk menyimpan perubahan<br>
              • Label akan langsung tersimpan ke handler</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Menghapus dari Handler</strong>
              <p class="mb-2">• Klik tombol <span class="material-symbols-outlined nx-icon-sm">delete</span> di kolom terakhir<br>
              • Item akan dihapus dari handler<br>
              • <strong>Catatan:</strong> Data tetap ada di dropdown, hanya dihapus dari handler<br>
              • Item yang dihapus masih bisa ditambahkan kembali ke handler</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Struktur Data Handler</strong>
              <p class="mb-2">• <strong>Icon:</strong> Icon yang digunakan untuk action (dari dropdown)<br>
              • <strong>Handler:</strong> Tipe handler (biasanya "dropdown")<br>
              • <strong>Action:</strong> Nama action yang digunakan<br>
              • <strong>Label:</strong> Label yang ditampilkan (dapat diedit)<br>
              • <strong>Status:</strong> Menentukan apakah sudah ada hasil settingan atau belum<br>
              • <strong>Nested:</strong> Tipe nested - form atau query</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>⚠️ Catatan Penting</strong>
              <p class="mb-2">• Handler mengatur konfigurasi action dari komponen Handler<br>
              • Nested hanya menerima hasil dari komponen Handler</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}



window.settingObjform = async function (objkey, id ,type) {
  try {
    const Sdk = new NXUI.Buckets(id);
   const classModal = "classModal" + id;
   NXUI.modalHTML({
    elementById: classModal,
    styleClass: "w-400px",
    minimize: true,
    label: `Nested ${objkey}`,
    onclick:false,
    content: await Nestedform(Sdk,objkey) ,
  });
  NXUI.nexaModal.open(classModal);
    } catch (error) {
    console.error('❌ Error in deleteObj:', error);
    throw error;
  }
};

window.settingObjquery  = async function (objkey, id ,type) {
  try {
    const Sdk = new NXUI.Buckets(id);
   const classModal = "classModal" + id;
   NXUI.modalHTML({
    elementById: classModal,
    styleClass: "w-400px",
    minimize: true,
    label: `Nested ${objkey}`,
    onclick:false,
    content: await Nestedform(Sdk,objkey) ,
  });
  NXUI.nexaModal.open(classModal);
    } catch (error) {
    console.error('❌ Error in deleteObj:', error);
    throw error;
  }
};

export async function tabelEdit(store) {
  try {
    // Cleanup instance lama jika ada
    if (currentNexaFieldInstance) {
      currentNexaFieldInstance = null;
    }

    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();
    currentNexaFieldInstance = nexaField;

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        // Mencegah re-render jika sedang dalam proses rendering
        if (isRendering) {
          console.log("⏸️ Skip re-render: Already rendering...");
          return;
        }

        try {
          isRendering = true;
          console.log(variable, newValue, type, fieldName);
          // deskripsi 110 number limit
          console.log({
              [variable]: {
                [fieldName]: newValue,
              },
            },'handler');
          // Update field dengan nilai baru berdasarkan fieldName
          await store.upNested({
             [variable]: {
               [fieldName]: newValue,
             },
           },'handler');
          // Re-render form setelah perubahan
          const finalStorage = await store.storage();
          await renderinguiNested(finalStorage);
        } catch (error) {
          console.error("❌ Error in tabelEdit callback:", error);
        } finally {
          // Reset flag setelah selesai
          setTimeout(() => {
            isRendering = false;
          }, 100);
        }
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
    isRendering = false;
  }
}


export async function renderinguiNested(store) {
  await NXUI.NexaRender.refresh(store, setNested, {
    containerSelector: "#uiNested",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
