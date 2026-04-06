export async function setFailed(data) {
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
          targetId: ["dropdown"],
          hideValue: ["action"],
          data: false,  // Mode bebas input (bisa menulis tag baru)
          validasi: [20],
          onChange: async (changeData) => {
           await addtagss(data.id, changeData)
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
export async function addtagss(id, changeData) {
  try {
    const Sdk = new NXUI.Buckets(id);
    const storage = await Sdk.storage();

  
    
    // Log data yang diterima dari onChange
    console.log('Tags data:', changeData);
    console.log('Tags data:', changeData.array);
    const df = ['menu1', 'menu2'];

const result = changeData.array.reduce((obj, key, index) => {
  obj[key] = { id: index + 1 };
  return obj;
}, {});

console.log(result);
  
          await Sdk.upIndex({
            dropdown:{
              ...result,
              metadata:changeData,
              data:changeData.array,
              value:changeData.value,
              // ...changeData.array,
            },
          });
 
      await renderingDropdown(storage);
  } catch (error) {
    console.error('❌ Error in addtagss:', error);
    throw error;
  }
};
export async function tabelEdit(store) {
  try {
    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
   console.log(variable, newValue, type, fieldName);
   // deskripsi 110 number limit
        // console.log({
        //     [variable]: {
        //       [fieldName]: newValue,
        //     },
        //   },'dropdown');
        // Update field dengan nilai baru berdasarkan fieldName
           await store.upNested({
             [variable]: {
               [fieldName]: newValue,
             },
           },'dropdown');
        // Re-render form setelah perubahan
        await renderingDropdown(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}
export async function FailedTags(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("textarea");
      console.log('dropdown:', storage.dropdown);



   const variabel=storage?.dropdown?.data || [];
   const failed=storage?.dropdown?.value ? `value="${storage?.dropdown?.value}"` :'';



  let tabelHtml = `

<div class="form-nexa-group">
  <label>Dropdown Handler</label>
  <input type="text" id="dropdown" ${failed} class="form-nexa-control" name="dropdown" placeholder="Ketik action dropdown baru dan tekan Enter..." />
</div>






<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th class="text">Type</th>
      <th>Failed</th>
      <th>Label</th>
      <th>Limit</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${
      variabel
        ? variabel
            .map(

              (item, index) => {   
                const row = storage?.dropdown[item];
                return `
      <tr>
      <td  class="text">
       ${item}
     </td>
     <td>${item}</td>
     <td>
   <span id="${
           item
         }" type="text" class="editable" data-min-length="5" name="placeholder">${
                row.placeholder || item
              }</span>

     </td>
     <td>
        <div id="${
           item
         }" type="number" class="editable" data-min-length="1" name="limit">${row?.limit || 0}</div>




     </td>
     <td class="text-center">
       <a  href="javascript:void(0);" onclick="deleteFaildTags('${item}','${
                storage.id
              }')" title="Hapus item" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">delete</span>
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
              <strong>2.Manajemen Field</strong>
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
  await renderingDropdown(storage);
};
export async function renderingDropdown(store) {
  await NXUI.NexaRender.refresh(store, setFailed, {
    containerSelector: "#hendelModalTags",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
