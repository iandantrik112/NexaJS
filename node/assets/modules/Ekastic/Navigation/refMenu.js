
export async function newMenu(data) {
  try {
  const  Sdk = await window.NXUI.ref.get("bucketsStore", "Navigation");
  const dimensi = new NXUI.NexaDimensi();
  const height = dimensi.height("#nexa_app", 220, 'vh');
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="hendelactionNavigation">
         <div class="nx-card-header">
             <h3 class="bold fs-20px">Navigation action</h3>  
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
          content: [await FailedAction(height), await konfigurasi(height)],
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
           await addtagss(changeData)
          }
        });



      } catch (error) {
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
  }
}

export async function FailedAction(height) {
        const  storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
  
   const variabel=storage?.action?.data || [];
   const jumlahVariabel = variabel.length;
   const failed=storage?.value ? `value="${storage?.value}"` :'';

  let tabelHtml = `

<div class="form-nexa-group">
  <input type="text" id="action" ${failed} class="form-nexa-control" name="action" placeholder="Ketik action action baru dan tekan Enter..." />
</div>

<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th class="text">Icon</th>
      <th>Action</th>
      <th>ClassName</th>
      <th>Label</th>
      <th class="text-center1">Status</th>
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
       <span id="${item}" type="text" class="editable" data-min-length="2" name="handler">${row?.handler || item}</span>
     </td>
     <td>${item}</td>
     <td>
      <span id="${item}" type="text" class="editable" data-min-length="2" name="label">${row?.label || item}</span>
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

export async function konfigurasi(height) {
  return {
    title: "Panduan Penggunaan",
    col: "nx-col-4",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Semua perubahan otomatis tersimpan secara real-time
    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Menambahkan Action Baru</strong>
              <p class="mb-2">• Ketik nama action pada field input di atas<br>
              • Tekan <kbd>Enter</kbd> untuk menambahkan action<br>
              • Action akan otomatis tersimpan dan muncul di tabel<br>
              • Icon default "<span class="material-symbols-outlined nx-icon-sm" style="vertical-align:middle">menu</span>" akan otomatis ditambahkan</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Mengubah Icon</strong>
              <p class="mb-2">• Klik pada icon di kolom "Icon" di tabel<br>
              • Pilih icon yang diinginkan dari icon selector<br>
              • Icon akan langsung tersimpan dan terupdate di tabel</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Mengedit Handler</strong>
              <p class="mb-2">• Klik pada teks handler di kolom "Handler" untuk mengedit<br>
              • Minimal 5 karakter diperlukan<br>
              • Tekan <kbd>Enter</kbd> atau klik di luar untuk menyimpan<br>
              • Perubahan akan langsung tersimpan</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Mengedit Label</strong>
              <p class="mb-2">• Klik pada teks label di kolom "Label" untuk mengedit<br>
              • Minimal 5 karakter diperlukan<br>
              • Tekan <kbd>Enter</kbd> atau klik di luar untuk menyimpan<br>
              • Label yang diubah akan langsung terupdate</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Mengatur Status Handler</strong>
              <p class="mb-2">• Gunakan toggle switch di kolom "Status Handler"<br>
              • Klik untuk mengaktifkan atau menonaktifkan handler<br>
              • Status akan langsung tersimpan saat diubah</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6. Menghapus Action</strong>
              <p class="mb-2">• Klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align:middle">delete</span> di kolom terakhir<br>
              • Action akan dihapus secara permanen<br>
              • Item juga akan dihapus dari array data dan handler<br>
              • <strong>⚠️ Hapusan bersifat permanen dan tidak dapat dibatalkan</strong></p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>7. Menghapus dari Input Field</strong>
              <p class="mb-2">• Hapus tag dari input field dengan klik tombol <span style="color:#ff4444">×</span><br>
              • Action yang dihapus akan otomatis dihapus dari tabel<br>
              • Data akan langsung tersinkronisasi</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>⚠️ Catatan Penting</strong>
              <p class="mb-2">• Semua perubahan otomatis tersimpan secara real-time<br>
              • Pastikan handler dan label minimal 5 karakter<br>
              • Hapusan action bersifat permanen<br>
              • Data selalu konsisten antara input field dan tabel</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

// Fungsi helper untuk generate main_menu dari action data
// Mempertahankan children yang sudah ada dari main_menu sebelumnya
function generateMainMenu(actionData, allKeys, existingMainMenu = []) {
  if (!actionData || !allKeys || allKeys.length === 0) {
    return existingMainMenu || [];
  }
  
  // Buat map dari existing main_menu berdasarkan class untuk lookup cepat
  const existingMenuMap = {};
  if (existingMainMenu && Array.isArray(existingMainMenu)) {
    existingMainMenu.forEach(menuItem => {
      // Gunakan class sebagai key untuk lookup
      const menuKey = menuItem.class || menuItem.key;
      if (menuKey) {
        existingMenuMap[menuKey] = menuItem;
      }
    });
  }
  
  return allKeys.map(key => {
    const item = actionData[key];
    if (!item) return null;
    
    // Cek apakah item sudah ada di existing main_menu berdasarkan class
    const itemClass = item.className || item.class || key;
    const existingItem = existingMenuMap[itemClass];
    
    // Jika ada href, gunakan href dan label
    if (item.href) {
      return {
        href: item.href,
        label: item.label || key,
        // Sertakan handler dari action data jika ada
        ...(item.handler ? { handler: item.handler } : {}),
        // Pertahankan children jika ada di existing item
        ...(existingItem && existingItem.children ? { children: existingItem.children } : {})
      };
    }
    
    // Default: gunakan class, label, handler, dan children
    // PENTING: Pertahankan children dari existing item jika ada
    const result = {
      class: itemClass,
      label: item.label || key,
      // Sertakan handler dari action data jika ada
      ...(item.handler ? { handler: item.handler } : {}),
      // Jika ada existing item dengan children, pertahankan children-nya
      children: existingItem && existingItem.children !== undefined 
        ? existingItem.children 
        : (item.children !== undefined ? item.children : false)
    };
    
    // Pertahankan semua properti lain dari existing item (key, file, folder, href, action, type, dll)
    if (existingItem) {
      // Copy semua properti dari existing item kecuali class, label, handler, dan children
      // Handler diutamakan dari action data (item.handler)
      Object.keys(existingItem).forEach(prop => {
        if (prop !== 'class' && prop !== 'label' && prop !== 'handler' && prop !== 'children') {
          result[prop] = existingItem[prop];
        }
      });
      
      // Jika existing item punya children, pastikan children juga di-copy
      if (existingItem.children && Array.isArray(existingItem.children) && existingItem.children.length > 0) {
        result.children = existingItem.children;
      }
    }
    
    return result;
  }).filter(item => item !== null);
}

export async function addtagss(changeData) {
  try {
    // Ambil storage terlebih dahulu
    const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    
    // Jika storage null, buat object kosong
    if (!storage) {
      await window.NXUI.ref.set("bucketsStore", {
        id: "Navigation",
        action: {},
        array: [],
        value: ''
      });
      const newStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
      if (!newStorage) {
        throw new Error('Failed to create storage');
      }
      return;
    }
    
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
          className:key,
          class:key,
          handler:'#',
          icon: 'menu', 
          children: false,
          id: index + 1 
        };
        return obj;
      }, {});

      // Ambil semua keys dari result (semua action yang ada)
      const allKeys = Object.keys(result).filter(key => 
        !['metadata', 'data', 'value'].includes(key)
      );

      // Buat object action baru dengan data dan value yang benar
      const updatedaction = {
        ...result,
        metadata: changeData,
        data: allKeys, // Gunakan semua keys dari result, bukan hanya changeData.array
        value: allKeys.join('|'), // Buat value dari semua keys
      };
    
      // Update storage dengan action baru
      const updatedStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
      
      // Hapus keys yang tidak diperlukan dari storage.action sebelum update
      if (keysToDelete.length > 0) {
        keysToDelete.forEach(keyToDelete => {
          if (updatedStorage?.action?.[keyToDelete]) {
            delete updatedStorage.action[keyToDelete];
          }
          // Hapus dari handler juga jika ada
          if (updatedStorage?.handler?.[keyToDelete]) {
            delete updatedStorage.handler[keyToDelete];
          }
        });
      }
      
      // Update action dengan data baru
      updatedStorage.action = updatedaction;
      
      // Update array dan value di root level agar sinkron dengan action.data dan action.value
      updatedStorage.array = allKeys;
      updatedStorage.value = allKeys.join('|');
      
      // Generate main_menu dari action data, pertahankan children yang sudah ada
      const existingMainMenu = updatedStorage.main_menu || [];
      updatedStorage.main_menu = generateMainMenu(updatedStorage.action, allKeys, existingMainMenu);
      
      await renderingaActionNavigation(updatedStorage);
      // Simpan menggunakan mergeData
      await NXUI.ref.mergeData("bucketsStore", "Navigation", updatedStorage);
  } catch (error) {
    throw error;
  }
};
export async function setCheckbox(Sdk) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
  

              const updatedStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
              if (!updatedStorage.handler) {
                updatedStorage.handler = {};
              }
              updatedStorage.handler[element.class] = {
                status: element.checked,
                ...updatedStorage.action[element.class]
              };
              await NXUI.ref.mergeData("bucketsStore", "Navigation", updatedStorage);



    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
  }
}
nx.addIconAction = async function (variables, token) {
   return await NXUI.setIconSelector(variables,token,"addIconActionItemDowd")
}
nx.addIconActionItemDowd = async function (variables,iconName,token,modalId) {
       const tabel = await window.NXUI.ref.get("bucketsStore", "Navigation");
       const updatedStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
       if (!updatedStorage.action) {
         updatedStorage.action = {};
       }
       if (!updatedStorage.action[variables]) {
         updatedStorage.action[variables] = {};
       }
       updatedStorage.action[variables].icon = iconName;
       
       // Update main_menu setelah update icon, pertahankan children yang sudah ada
       const allKeys = updatedStorage.action?.data || Object.keys(updatedStorage.action || {}).filter(key => 
         !['metadata', 'data', 'value'].includes(key)
       );
       const existingMainMenu = updatedStorage.main_menu || [];
       updatedStorage.main_menu = generateMainMenu(updatedStorage.action, allKeys, existingMainMenu);
       
       await NXUI.ref.mergeData("bucketsStore", "Navigation", updatedStorage);

 await renderingaActionNavigation(tabel);
 NXUI.nexaModal.close(modalId);
}

nx.deleteObjAction = async function (objkey, storage) {
  try {
    const updatedStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    
    if (!updatedStorage?.action) {
      return;
    }

    const action = updatedStorage.action;
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
    
    // Update array data dan value di action
    action.data = updatedData;
    action.value = updatedValue;
    
    // Update metadata jika ada
    if (action.metadata && action.metadata.array) {
      action.metadata.array = updatedData;
      action.metadata.value = updatedValue;
    }
    
    // Update action di storage
    updatedStorage.action = action;
    
    // Update array dan value di root level agar sinkron
    updatedStorage.array = updatedData;
    updatedStorage.value = updatedValue;
    
    // Hapus key dari handler juga jika ada
    if (updatedStorage?.handler?.[objkey]) {
      delete updatedStorage.handler[objkey];
    }
    
    // Generate main_menu setelah menghapus action, pertahankan children yang sudah ada
    const existingMainMenu = updatedStorage.main_menu || [];
    updatedStorage.main_menu = generateMainMenu(updatedStorage.action, updatedData, existingMainMenu);
    
    // Simpan menggunakan mergeData
    await NXUI.ref.mergeData("bucketsStore", "Navigation", updatedStorage);
       await renderingaActionNavigation(updatedStorage);
  } catch (error) {
    throw error;
  }
};



export async function tabelEdit(store) {
  try {
    const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {


        // Ambil storage dan update field dengan nilai baru berdasarkan fieldName
        const updatedStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
        if (!updatedStorage.action) {
          updatedStorage.action = {};
        }
        if (!updatedStorage.action[variable]) {
          updatedStorage.action[variable] = {};
        }
        updatedStorage.action[variable][fieldName] = newValue;
        
        // Update handler juga agar sinkron dengan perubahan label/icon
        if (updatedStorage?.handler?.[variable]) {
          // Update handler dengan data terbaru dari action
          updatedStorage.handler[variable] = {
            ...updatedStorage.handler[variable],
            ...updatedStorage.action[variable]
          };
        }
        
        // Update label langsung di main_menu jika fieldName adalah 'label'
        if (fieldName === 'label' && updatedStorage.main_menu) {
          // Fungsi rekursif untuk update label di main_menu
          function updateMainMenuLabel(items, targetClass, newLabel) {
            for (const item of items) {
              if (item.class === targetClass) {
                item.label = newLabel;
                return true;
              }
              if (item.children && Array.isArray(item.children)) {
                if (updateMainMenuLabel(item.children, targetClass, newLabel)) {
                  return true;
                }
              }
            }
            return false;
          }
          
          updateMainMenuLabel(updatedStorage.main_menu, variable, newValue);
        }
        
        // Update main_menu setelah update label/handler, pertahankan children yang sudah ada
        const allKeys = updatedStorage.action?.data || Object.keys(updatedStorage.action || {}).filter(key => 
          !['metadata', 'data', 'value'].includes(key)
        );
        const existingMainMenu = updatedStorage.main_menu || [];
        updatedStorage.main_menu = generateMainMenu(updatedStorage.action, allKeys, existingMainMenu);
        
        // Simpan menggunakan mergeData
        await NXUI.ref.mergeData("bucketsStore", "Navigation", updatedStorage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
  }
}


export async function renderingaActionNavigation(store) {
  await NXUI.NexaRender.refresh(store, newMenu, {
    containerSelector: "#hendelactionNavigation",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}

// newMenu
// navMenu
// navDirectory
// appPublication