
export async function setAction(data) {
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
     <div id="hendelaction">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">action action</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div  class="pr-10px nx-scroll-hidden"style="height:600px">
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
          </div>
      </div>   
    `
    );
   const checkedItems = await Sdk.getFields("action");
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
          content: [await FailedAction(Sdk,height), await konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
         await tabelEdit(Sdk);
          await setCheckbox(Sdk);
         new NXUI.NexaTags({
          targetId: ["action"],
          hideValue: ["addaction"],
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

export async function FailedAction(Sdk,height) {
  const storage = await Sdk.storage();
      console.log('action:', storage.action);

   const variabel=storage?.action?.data || [];
   const jumlahVariabel = variabel.length;
   const failed=storage?.action?.value ? `value="${storage?.action?.value}"` :'';

  let tabelHtml = `

<div class="form-nexa-group">
  <input type="text" id="action" ${failed} class="form-nexa-control" name="action" placeholder="Ketik action action baru dan tekan Enter..." />
</div>

<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th class="text">Icon</th>
      <th>Handler</th>
      <th>action</th>
      <th>Label</th>
      <th class="text-center1">Status Handler</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${
      variabel
        ? variabel
            .map(

              (item, index) => {   
                const row = storage?.action[item];
                const rowhend = storage?.handler?.[item];
                return `
      <tr>
      <td  class="text">
       <a onclick="addIconAction('${item}','${storage.id}');" href="javascript:void(0);">
       <span class="material-symbols-outlined nx-icon-md">${row?.icon}</span>
       </a>

     </td>
     <td>
       <span id="${item}" type="text" class="editable" data-min-length="5" name="handler">${row?.handler || item}</span>
     </td>
     <td>${item}</td>
     <td>
      <span id="${item}" type="text" class="editable" data-min-length="5" name="label">${row?.label || item}</span>
     </td>

           <td class="text-center1">
                  <div class="nx-switch-grid">
                    <div class="nx-switch-item">
                      <input class="${
                        item
                      }" name="handler" type="checkbox" id="handler_${item}${index}"
                       ${rowhend?.status ? "checked" : ""}
                      />
                      <label for="handler_${item}${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>

     </td>
     <td class="text-center">
       <a  href="javascript:void(0);" onclick="deleteObjAction('${item}','${
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
    footer: `<small class="text-muted">${jumlahVariabel || "0"} Variabel action</small>`,
    html: `
     <div style="padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}

export async function konfigurasi(data,height) {
  return {
    title: "Panduan action",
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
              <strong>1. Menambahkan Action Baru</strong>
              <p class="mb-2">• Ketik nama action pada field input dan tekan Enter<br>
              • Action akan otomatis tersimpan <br>
              • Icon default akan otomatis ditambahkan</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Mengubah Icon</strong>
              <p class="mb-2">• Klik pada icon di kolom "Icon" untuk membuka icon selector<br>
              • Pilih icon yang diinginkan<br>
              • Icon akan langsung tersimpan dan terupdate</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Handler Configuration</strong>
              <p class="mb-2">• Handler dikonfigurasi di komponen Handler terpisah<br>
              • Pastikan komponen Handler sudah diinstal terlebih dahulu<br>
              • Lakukan konfigurasi handler di komponen Handler untuk mengatur status action<br>
              • Kolom Handler di tabel ini menampilkan status konfigurasi dari komponen Handler</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Mengedit Label</strong>
              <p class="mb-2">• <strong>Label:</strong> Klik pada teks label untuk mengedit (min. 5 karakter)<br>
              • Tekan Enter atau klik di luar untuk menyimpan perubahan<br>
              • Label yang diubah akan langsung terupdate</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Menghapus Action</strong>
              <p class="mb-2">• Klik tombol <span class="material-symbols-outlined nx-icon-sm">delete</span> di kolom terakhir<br>
              • Action akan dihapus secara permanen<br>
              • Item juga akan dihapus dari array data, value, dan handler</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6. Sinkronisasi Data</strong>
              <p class="mb-2">• Semua perubahan otomatis tersinkronisasi<br>
              • Jika menghapus action dari input field, keys yang tidak ada akan otomatis dibersihkan<br>
              • Handler juga akan ikut terhapus saat action dihapus<br>
              • Data selalu konsisten dan terupdate secara real-time</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>⚠️ Catatan Penting</strong>
              <p class="mb-2">• Hapusan action bersifat permanen dan tidak dapat dibatalkan<br>
              • Pastikan label minimal 5 karakter<br>
              • Install dan konfigurasi Handler di komponen Handler terpisah</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

export async function addtagss(id, changeData) {
  try {
    const Sdk = new NXUI.Buckets(id);
    const storage = await Sdk.storage();
    
    // Ambil keys lama dari action yang sudah ada di IndexedDB
    const oldaction = storage?.action || {};
    const oldKeys = Object.keys(oldaction).filter(key => 
      !['metadata', 'data', 'value'].includes(key)
    );
    
    // Identifikasi keys yang perlu dihapus (keys lama yang tidak ada di array baru)
    const newKeys = changeData.array || [];
    const keysToDelete = oldKeys.filter(key => !newKeys.includes(key));
    
    // Buat result object dengan keys baru
    const result = changeData.array.reduce((obj, key, index) => {
      // Jika key sudah ada di action lama, gunakan data lama sebagai base
      const existingData = oldaction[key];
      obj[key] = existingData ? {
        ...existingData,
        action: key,
        id: index + 1
      } : { 
        action: key,
        label: key,
        danger: false,
        className:storage.className,
        token:storage.id,
        handler:'action',
        icon: 'menu', 
        id: index + 1 
      };
      return obj;
    }, {});

    // Buat object action baru
    const updatedaction = {
      ...result,
      metadata: changeData,
      data: changeData.array,
      value: changeData.value,
    };


    // Update IndexedDB dengan action baru (deep merge akan menggabungkan dengan data lama)
    await Sdk.upIndex({
      action: updatedaction,
    });
    
    // Karena upIndex menggunakan deep merge, keys lama mungkin masih tertinggal
    // Jadi kita perlu menghapus keys yang tidak ada lagi secara eksplisit
    if (keysToDelete.length > 0) {
      // Ambil storage lagi setelah update
      const updatedStorage = await Sdk.storage();
      // Hapus keys yang tidak diperlukan dari action dan handler
      keysToDelete.forEach(keyToDelete => {
        // Hapus dari action
        if (updatedStorage?.action?.[keyToDelete]) {
          delete updatedStorage.action[keyToDelete];
        }
        // Hapus dari handler
        if (updatedStorage?.handler?.[keyToDelete]) {
          delete updatedStorage.handler[keyToDelete];
        }
      });
      
      // Simpan kembali storage yang sudah dibersihkan (action dan handler)
      if (updatedStorage?.store && updatedStorage?.id) {
        await NXUI.ref.mergeData(updatedStorage.store, updatedStorage.id, updatedStorage);
      }
    }
 
    const finalStorage = await Sdk.storage();
    await renderingaAction(finalStorage);
  } catch (error) {
    console.error('❌ Error in addtagss:', error);
    throw error;
  }
};
export async function setCheckbox(Sdk) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await Sdk.storage();
       console.log('class:', element.class);
       console.log('checked:', element.checked);
       console.log('label:', storage.action[element.class]);

              await Sdk.upIndex({
                handler: {
                  [element.class]: {
                    status:element.checked,
                     ...storage.action[element.class]
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
nx.addIconAction = async function (variables, token) {
   return await NXUI.setIconSelector(variables,token,"addIconActionItemDowd")
}
nx.addIconActionItemDowd = async function (variables,iconName,token,modalId) {
     const Sdk = new NXUI.Buckets(token);
       const tabel = await Sdk.storage();
              await Sdk.upNested({
                [variables]: {
                  icon: iconName,
                },
              },'action');

      // Update handler juga agar sinkron dengan perubahan icon
      const updatedStorage = await Sdk.storage();
      if (updatedStorage?.handler?.[variables]) {
        // Update handler dengan data terbaru dari action (termasuk icon baru)
        await Sdk.upIndex({
          handler: {
            [variables]: {
              ...updatedStorage.handler[variables],
              ...updatedStorage.action[variables]
            },
          },
        });
      }

console.log('label:',iconName,variables,token,modalId);
 await renderingaAction(tabel);
 NXUI.nexaModal.close(modalId);
}

nx.deleteObjAction = async function (objkey, storage) {
  try {
    const Sdk = new NXUI.Buckets(storage);
    const tabel = await Sdk.storage();
    
    if (!tabel?.action) {
      console.warn('⚠️ action data tidak ditemukan');
      await renderingaAction(tabel);
      return;
    }

    const action = tabel.action;
    const currentData = action.data || [];
    
    // Hapus key dari array data
    const updatedData = currentData.filter(key => key !== objkey);
    
    // Hapus key dari action object
    if (action[objkey]) {
      delete action[objkey];
    }
    
    // Update value (pipe-separated string) - hapus key yang dihapus
    let updatedValue = action.value || '';
    if (updatedValue) {
      const valueArray = updatedValue.split('|').filter(key => key !== objkey && key.trim() !== '');
      updatedValue = valueArray.join('|');
    }
    
    // Update array data
    action.data = updatedData;
    action.value = updatedValue;
    
    // Update metadata jika ada
    if (action.metadata && action.metadata.array) {
      action.metadata.array = updatedData;
      action.metadata.value = updatedValue;
    }
    
    // Simpan perubahan ke IndexedDB
    await Sdk.upIndex({
      action: action,
    });
    
    // Ambil storage lagi setelah update untuk memastikan konsistensi
    const updatedStorage = await Sdk.storage();
    
    // Pastikan key benar-benar dihapus dari action (jika masih ada karena deep merge)
    if (updatedStorage?.action?.[objkey]) {
      delete updatedStorage.action[objkey];
    }
    
    // Hapus key dari handler juga
    if (updatedStorage?.handler?.[objkey]) {
      delete updatedStorage.handler[objkey];
    }
    
    // Simpan kembali storage yang sudah dibersihkan (action dan handler)
    if (updatedStorage?.store && updatedStorage?.id) {
      await NXUI.ref.mergeData(updatedStorage.store, updatedStorage.id, updatedStorage);
    }
    
    const finalStorage = await Sdk.storage();
    await renderingaAction(finalStorage);
  } catch (error) {
    console.error('❌ Error in deleteObjAction:', error);
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


        // Update field dengan nilai baru berdasarkan fieldName
           await store.upNested({
             [variable]: {
               [fieldName]: newValue,
             },
           },'action');
        
        // Update handler juga agar sinkron dengan perubahan label/icon
        const updatedStorage = await store.storage();
        if (updatedStorage?.handler?.[variable]) {
          // Update handler dengan data terbaru dari action
          await store.upIndex({
            handler: {
              [variable]: {
                ...updatedStorage.handler[variable],
                ...updatedStorage.action[variable]
              },
            },
          });
        }
        
        // Re-render form setelah perubahan
        const finalStorage = await store.storage();
        await renderingaAction(finalStorage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}


export async function renderingaAction(store) {
  await NXUI.NexaRender.refresh(store, setAction, {
    containerSelector: "#hendelaction",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
