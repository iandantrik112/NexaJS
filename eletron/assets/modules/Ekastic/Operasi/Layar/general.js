import { 
  extractSQLMetadata,
  convertApplicationsToSQL,
  parseSQLToLayarApplications
} from "./maxQuery.js";
import { refreshLayar} from "../index.js";

export async function opLayar(data) {
  try {
     const Sdk = new NXUI.Buckets(data.id);
       const storage = await Sdk.storage();
       console.log('storage:', storage.layar);
  setTimeout(async () => {
       try {
         await tabelEdit(Sdk);
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
         console.error("❌ Error initializing drag and drop:", error);
       }
     }, 100);


   const variabel=storage?.layar?.data || [];
   const jumlahVariabel = variabel.length;
   const failed= storage?.layar?.value ? `value="${ storage?.layar?.value}"` :'';





    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
    return `

   
<div id="hendelLayar">
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
                return `
      <tr>
      <td  class="text">
       <span class="material-symbols-outlined nx-icon-md">database</span>
     </td>
     <td>
       <span id="${item}" type="text" class="editable" data-min-length="2" name="handler">${row.action}</span>
     </td>
     <td>${row.className}</td>
     <td>
      <span id="${item}" type="text" class="editable" data-min-length="2" name="label">${row.label}</span>
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
        </div>
    `;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return `
        <div class="alert alert-danger text-center">
            <h5>❌ Initialization Failed</h5>
            <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
        </div>
    `;
  }
}


export async function addtagss(changeData,Sdk) {
  try {
    const storage = await Sdk.storage();

    // Ambil storage terlebih dahulu
    // const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
     const applications =storage.applications;
     const applicationsc = convertApplicationsToSQL(storage.applications || {});
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
        // Normalisasi key: ganti spasi dengan underscore dan buat huruf kecil
        const normalizedKey = String(key).replace(/\s+/g, '_').toLowerCase();
        
        // Jika key sudah ada di action lama, gunakan data lama sebagai base
        const existingData = oldaction[normalizedKey] || oldaction[key];
        const currentDate = new Date().toISOString();
        
        obj[normalizedKey] = existingData ? {
          ...existingData,
          action: normalizedKey,
          id: index + 1,
          // Pastikan ada tanggal pembuatan, jika belum ada tambahkan
          createdAt: existingData.createdAt || existingData.date || currentDate,
          date: existingData.date || existingData.createdAt || currentDate
        } : { 
          action: normalizedKey,
          label: key, // Label tetap menggunakan key asli
          danger: false,
          className: storage.className,
          key: storage.key,
          class: normalizedKey,
          handler:'#',
          applications:applications,
          icon: 'database', 
          children: false,
          id: index + 1,
          createdAt: currentDate,
          date: currentDate
        };
        return obj;
      }, {});

      // Ambil semua keys dari result (semua action yang ada)
      const allKeys = Object.keys(result).filter(key => 
        !['metadata', 'data', 'value'].includes(key)
      );

      // Update metadata.array dengan normalized keys
      const normalizedMetadata = {
        ...changeData,
        array: allKeys // Gunakan normalized keys
      };
      
      // Buat object action baru dengan data dan value yang benar
      const updatedaction = {
        ...result,
        metadata: normalizedMetadata,
        data: allKeys, // Gunakan semua keys dari result (sudah dinormalisasi)
        value: allKeys.join('|'), // Buat value dari semua keys (sudah dinormalisasi)
      };
        await Sdk.upIndex({
          layar:updatedaction
        });
       await refreshLayar(storage)
  } catch (error) {
    throw error;
  }
};



export function generateMainMenu(actionData, allKeys, existingMainMenu = []) {
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

nx.deleteObjAction = async function (objkey, id) {
  try {
         const Sdk = new NXUI.Buckets(id);
        const storage = await Sdk.storage();

    if (!storage || !storage.layar) {
      return;
    }
    // Clone storage untuk menghindari mutasi langsung
    const updatedStorage = JSON.parse(JSON.stringify(storage));
    
    const action = updatedStorage.layar;
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
      
      // Update metadata.tags juga
      if (action.metadata.tags && Array.isArray(action.metadata.tags)) {
        action.metadata.tags = action.metadata.tags.filter(tag => tag.failed !== objkey);
      }
    }
    
    // Update layar di storage
    updatedStorage.layar = action;
    
    // Hapus key dari handler juga jika ada
    if (updatedStorage?.handler?.[objkey]) {
      delete updatedStorage.handler[objkey];
    }
    
    // Generate main_menu setelah menghapus action, pertahankan children yang sudah ada
    const existingMainMenu = updatedStorage.main_menu || [];
    updatedStorage.main_menu = generateMainMenu(action, updatedData, existingMainMenu);
    
    // Buat object layar yang sudah dibersihkan (hanya property yang ada di data array)
    const cleanedLayar = {
      metadata: action.metadata,
      data: action.data,
      value: action.value
    };
    
    // Tambahkan hanya property yang ada di data array
    updatedData.forEach(key => {
      if (action[key]) {
        cleanedLayar[key] = action[key];
      }
    });
    
    // Simpan kembali ke storage dengan data yang sudah dibersihkan
    await Sdk.upIndex({
      layar: cleanedLayar
    });
    
    // Ambil storage yang sudah di-update
    let finalStorage = await Sdk.storage();
    
    // Pastikan property yang tidak ada di data array benar-benar dihapus
    // HANYA di dalam layar, jangan sentuh variabel lain di storage
    if (finalStorage && finalStorage.layar) {
      // Buat copy dari layar untuk modifikasi
      const layarToClean = { ...finalStorage.layar };
      const validKeys = ['metadata', 'data', 'value', ...updatedData];
      const allLayarKeys = Object.keys(layarToClean);
      
      // Hapus property yang tidak valid HANYA dari layar
      allLayarKeys.forEach(key => {
        if (!validKeys.includes(key)) {
          delete layarToClean[key];
        }
      });
      
      // Simpan HANYA layar yang sudah dibersihkan, tidak menyentuh property lain di storage
      await NXUI.ref.mergeData("nexaStore", id, { layar: layarToClean });
      
      // Ambil lagi untuk verifikasi
      finalStorage = await Sdk.storage();
    }
    
    // Refresh layar untuk update tampilan
    await refreshLayar(finalStorage);
    

  } catch (error) {
    console.error('❌ Error deleting item:', error);
    throw error;
  }
};



export async function tabelEdit(Sdk) {
  try {

    const storage = await Sdk.storage();

    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        // Ambil storage terbaru
        const currentStorage = await Sdk.storage();
        
        if (!currentStorage || !currentStorage.layar) {
          return;
        }

        // Clone layar untuk modifikasi
        const updatedLayar = { ...currentStorage.layar };
        
        // Update field dengan nilai baru berdasarkan fieldName
        // variable adalah key dari item (misalnya "home", "user", dll)
        if (!updatedLayar[variable]) {
          updatedLayar[variable] = {};
        }
        updatedLayar[variable][fieldName] = newValue;
        
        // Clone handler untuk modifikasi
        const updatedHandler = currentStorage.handler ? { ...currentStorage.handler } : {};
        
        // Update handler juga agar sinkron dengan perubahan label/icon
        if (updatedHandler[variable]) {
          updatedHandler[variable] = {
            ...updatedHandler[variable],
            ...updatedLayar[variable]
          };
        }
        
        // Ambil semua keys dari layar (kecuali metadata, data, value)
        const allKeys = updatedLayar.data || Object.keys(updatedLayar).filter(key => 
          !['metadata', 'data', 'value'].includes(key)
        );
        
        // Update main_menu setelah update, pertahankan children yang sudah ada
        const existingMainMenu = currentStorage.main_menu || [];
        const updatedMainMenu = generateMainMenu(updatedLayar, allKeys, existingMainMenu);
        
        // Simpan perubahan ke storage
        const dataToSave = {
          layar: updatedLayar,
          main_menu: updatedMainMenu
        };
        
        // Tambahkan handler jika ada perubahan
        if (Object.keys(updatedHandler).length > 0) {
          dataToSave.handler = updatedHandler;
        }
        
        await NXUI.ref.mergeData("nexaStore", storage.id, dataToSave);
        
        // Refresh tampilan
        await refreshLayar(await Sdk.storage());
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
  }
}


