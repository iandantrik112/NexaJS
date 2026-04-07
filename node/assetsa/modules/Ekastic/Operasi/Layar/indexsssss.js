
export async function opLayar(data) {
  try {
     const Sdk = new NXUI.Buckets(data.id);
       const storage = await Sdk.storage();
       console.log('storage layar:', storage?.layar);
  const dimensi = new NXUI.NexaDimensi();
  const height = dimensi.height("#nexa_app", 220, 'vh');
    NXUI.FormIndexData = Sdk;

    setTimeout(async () => {
      try {
         await tabelEdit(Sdk);
         await setCheckbox(Sdk);
         new NXUI.NexaTags({
          targetId: ["action"],
          hideValue: ["addaction"],
          data: false,  // Mode bebas input (bisa menulis tag baru)
          validasi: [20],
          onChange: async (changeData) => {
           await addtagss(changeData,Sdk)
          }
        });
  } catch (error) {
  }



  console.log('label:', storage.layar);
   const variabel=storage?.layar?.data || [];
   const jumlahVariabel = variabel.length;
   const failed= storage?.layar?.value ? `value="${ storage?.layar?.value}"` :'';
console.log('label:', failed);
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
                 const row = storage?.layar[item];
                console.log('itemitemitemitemitem:', item);
                return `
      <tr>
      <td  class="text">
       <a onclick="addIconAction('${row.id}','${row.id}');" href="javascript:void(0);">
       <span class="material-symbols-outlined nx-icon-md">${row.icon}</span>
       </a>

     </td>
     <td>
       <span id="${item}" type="text" class="editable" data-min-length="2" name="handler">${row.action}</span>
     </td>
     <td>${row.id}</td>
     <td>
      <span id="${row.id}" type="text" class="editable" data-min-length="2" name="label"${row.id}</span>

     <td class="text-center">
    
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


  return tabelHtml;
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

export async function addtagss(changeData,Sdk) {
  try {
    const storage = await Sdk.storage();
    // Ambil storage terlebih dahulu
    // const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    
    // Jika storage null, buat object kosong
      // Ambil keys lama dari action yang sudah ada di IndexedDB
      const oldaction = storage?.layar || {};
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
          query:false,
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
      console.log('label:', updatedaction);
                await Sdk.upIndex({
                  layar: {
                    ...updatedaction
                  }
                });
      // Update storage dengan action baru
      // const updatedStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
      
      // // Hapus keys yang tidak diperlukan dari storage.action sebelum update
      // if (keysToDelete.length > 0) {
      //   keysToDelete.forEach(keyToDelete => {
      //     if (updatedStorage?.action?.[keyToDelete]) {
      //       delete updatedStorage.action[keyToDelete];
      //     }
      //     // Hapus dari handler juga jika ada
      //     if (updatedStorage?.handler?.[keyToDelete]) {
      //       delete updatedStorage.handler[keyToDelete];
      //     }
      //   });
      // }
      
      // // Update action dengan data baru
      // updatedStorage.action = updatedaction;
      
      // // Update array dan value di root level agar sinkron dengan action.data dan action.value
      // updatedStorage.array = allKeys;
      // updatedStorage.value = allKeys.join('|');
      
      // // Generate main_menu dari action data, pertahankan children yang sudah ada
      // const existingMainMenu = updatedStorage.main_menu || [];
      // updatedStorage.main_menu = generateMainMenu(updatedStorage.action, allKeys, existingMainMenu);
      
      // await renderingaActionNavigation(updatedStorage);
      // // Simpan menggunakan mergeData
      // await NXUI.ref.mergeData("bucketsStore", "Navigation", updatedStorage);
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