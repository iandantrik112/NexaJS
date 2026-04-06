
export async function setHandler(data) {
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
     <div id="uiHandler">
        <div class="nx-card-header">
          <h3 class="bold fs-20px">Handler</h3>  
          <div class="nx-card-controls align-right">v.${storage.version}</div>
        </div>
           <div  class="pr-10px nx-scroll-hidden"style="height:600px">
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
          </div>
      </div>   
    `
    );
   const checkedItems = await Sdk.getFields("dropdown");
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
          await setCheckbox(Sdk);



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
      <th class="text-center1">Handler</th>
      <th>action</th>
      <th>Label</th> 
      <th class="text-center1">Status</th>
      <th class="text-center1">Nested</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${
      variabel
        ? variabel
            .map(

              ([key, item], index) => {   
                return `
      <tr>
      <td  class="text">
       <span class="material-symbols-outlined nx-icon-md">${item?.icon || 'menu'}</span>
     </td>
      <td>${item?.handler || key}</td>      
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
                       ${item?.status ? "checked" : ""}
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



     <td class="text-center">
       <a  href="javascript:void(0);" onclick="deleteObj('${key}','${
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
              <strong>2. Mengatur Status</strong>
              <p class="mb-2">• Gunakan toggle/switch di kolom "Status" untuk mengaktifkan atau menonaktifkan action<br>
              • <strong>Checked (ON):</strong> Action aktif dan tersedia<br>
              • <strong>Unchecked (OFF):</strong> Action tidak aktif</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Mengatur Nested</strong>
              <p class="mb-2">• Klik pada kolom "Nested" untuk memilih tipe nested<br>
              • Pilihan: <strong>form</strong> atau <strong>query</strong><br>
              • Setelah memilih tipe, install komponen Nested yang sesuai dengan typenya<br>
              • Nested menentukan bagaimana action diproses<br>
              • Perubahan langsung tersimpan ke handler</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Menghapus dari Handler</strong>
              <p class="mb-2">• Klik tombol <span class="material-symbols-outlined nx-icon-sm">delete</span> di kolom terakhir<br>
              • Item akan dihapus dari handler</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Struktur Data Handler</strong>
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
              <p class="mb-2">• Handler mengatur konfigurasi action<br>
              • Nested hanya menerima hasil dari komponen Handler</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

export async function setCheckbox(Sdk) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await Sdk.storage();
       console.log('class:', element.class);
       console.log('checked:', element.checked);
       console.log('label:', storage.dropdown[element.class]);

             await Sdk.upIndex({
               handler: {
                 [element.class]: {
                   status:element.checked,
                 
                 },
               },
             });



    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

nx.deleteObj = async function (objkey, storage) {
  try {
    const Sdk = new NXUI.Buckets(storage);
    const tabel = await Sdk.storage();
    
    if (!tabel?.handler) {
      console.warn('⚠️ Handler data tidak ditemukan');
      await renderinguiHandler(tabel);
      return;
    }

    // Hapus key hanya dari handler, tidak menghapus dari dropdown
    if (tabel?.handler?.[objkey]) {
      delete tabel.handler[objkey];
    }
    
    // Simpan perubahan handler ke IndexedDB
    await Sdk.upIndex({
      handler: tabel.handler,
    });
    
    // Ambil storage lagi setelah update untuk memastikan konsistensi
    const updatedStorage = await Sdk.storage();
    
    // Pastikan key benar-benar dihapus dari handler (jika masih ada karena deep merge)
    if (updatedStorage?.handler?.[objkey]) {
      delete updatedStorage.handler[objkey];
      
      // Simpan kembali storage yang sudah dibersihkan (hanya handler)
      if (updatedStorage?.store && updatedStorage?.id) {
        await NXUI.ref.mergeData(updatedStorage.store, updatedStorage.id, updatedStorage);
      }
    }
    
    const finalStorage = await Sdk.storage();
    await renderinguiHandler(finalStorage);
  } catch (error) {
    console.error('❌ Error in deleteObj:', error);
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
        await renderinguiHandler(finalStorage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}


export async function renderinguiHandler(store) {
  await NXUI.NexaRender.refresh(store, setHandler, {
    containerSelector: "#uiHandler",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
