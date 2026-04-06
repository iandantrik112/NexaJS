export async function infotableSize(data) {
  return `


  <button type="button" class="nx-btn-primary icon-button" onclick="openTableSizeSettings('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">aspect_ratio</span>
    <span>Size Tabel</span>
  </button>

 <button type="button" class="nx-btn-primary icon-button" onclick="openTableLayoutSettings('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">view_module</span>
    <span>Setting layout</span>
  </button>
  <br>

  <br>
<div class="nx-alert nx-alert-info">
Pilih ukuran tabel sesuai kebutuhan Anda. Ukuran yang dipilih akan mempengaruhi padding dan font size tabel untuk tampilan yang lebih optimal.
</div>
  `
}

// Function to open table size settings modal
window.openTableSizeSettings = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const dataform = await Sdk.storage();
  const selectedTableSize = dataform.settings?.tableSize;
  
  const modalID = "tableSize_" + token;
  const radioGroupName = `tableSize-${token}`;
  const switchItems = tableSize.map((item, index) => {
    const switchId = `switch-${token}-${index}`;
    const isChecked = item.className === selectedTableSize ? 'checked' : '';
    return `
     <div style="margin-bottom:10px;">
       <div class="nx-switch-item">
         <input type="checkbox" name="${radioGroupName}" id="${switchId}" ${isChecked} />
         <label for="${switchId}">
           <span class="nx-switch"></span>
           ${item.description}
         </label>
       </div>
     </div>
    `;
  }).join('');
  
  NXUI.formModal({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: "Pengaturan Ukuran Tabel",
    floating: false,
    content: switchItems,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior
  setTimeout(async() => {
    await radioGroup(radioGroupName, Sdk, tableSize, 'tableSize');
  }, 100);
}


export const tableSize = [
  {
    className: "nx-table-compact",
    description: "Padat - Tabel dengan padding kecil",
    fontSize: "0.8rem"
  },
  {
    className: "nx-table-ultra-compact",
    description: "Sangat Padat - Tabel sangat ringkas",
    fontSize: "0.75rem"
  },
  {
    className: "nx-table-mini",
    description: "Mini - Ukuran sangat kecil",
    fontSize: "0.7rem"
  },
  {
    className: "nx-table-xs",
    description: "Ekstra Kecil",
    fontSize: null
  },
  {
    className: "nx-table-sm",
    description: "Kecil",
    fontSize: null
  },
  {
    className: "nx-table-md",
    description: "Sedang",
    fontSize: null
  },
  {
    className: "nx-table-lg",
    description: "Besar",
    fontSize: null
  },
  {
    className: "nx-table-xl",
    description: "Ekstra Besar",
    fontSize: "1.1rem"
  }
];

export function radioGroup(radioGroupName, Sdk, dataArray, settingKey) {
  const checkboxes = document.querySelectorAll(`input[name="${radioGroupName}"]`);
  checkboxes.forEach((checkbox, index) => {
    checkbox.addEventListener('change', async (e) => {
      const checkedStatus = e.target.checked;
      
      if (checkedStatus) {
        // Uncheck all other checkboxes in the same group
        checkboxes.forEach(cb => {
          if (cb !== e.target && cb.checked) {
            cb.checked = false;
          }
        });
        
        // Save selected setting to storage
        const selectedItem = dataArray[index];
        try {
          await Sdk.upSettings({
            [settingKey]: selectedItem.className,
          });
          
          // ✅ Refresh UI tabel setelah setting berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan setting tabel:', error);
        }
      } else {
        // Handle unchecking - remove the setting
        try {
          await Sdk.upSettings({
            [settingKey]: "", // empty string
          });
          
          // ✅ Refresh UI tabel setelah setting dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus setting tabel:', error);
        }
      }
    });
  });
}

// Function to open table layout settings modal
window.openTableLayoutSettings = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const dataform = await Sdk.storage();
  const selectedTableLayout = dataform.settings?.tableLayout;
  
  const modalID = "tableLayout_" + token;
  const radioGroupName = `tableLayout-${token}`;
  const switchItems = tableSizeVariants.map((item, index) => {
    const switchId = `switch-layout-${token}-${index}`;
    const isChecked = item.className === selectedTableLayout ? 'checked' : '';
    return `
     <div style="margin-bottom:10px;">
       <div class="nx-switch-item">
         <input type="checkbox" name="${radioGroupName}" id="${switchId}" ${isChecked} />
         <label for="${switchId}">
           <span class="nx-switch"></span>
           ${item.description}
         </label>
       </div>
     </div>
    `;
  }).join('');
  
  NXUI.formModal({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: "Pengaturan Layout Tabel",
    floating: false,
    content: switchItems,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior for layout
  setTimeout(async() => {
    await radioGroup(radioGroupName, Sdk, tableSizeVariants, 'tableLayout');
  }, 100);
}


export const tableSizeVariants = [

  {
    className: "nx-table-striped",
    description: "Tabel dengan zebra striping (baris ganjil berwarna)",
    fontSize: null
  },
  {
    className: "nx-table-hover",
    description: "Efek hover pada baris",
    fontSize: null
  },
];