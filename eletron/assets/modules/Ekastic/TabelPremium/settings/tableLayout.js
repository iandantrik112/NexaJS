
export async function infotableSizeTableLayout(data) {
  return `
  <button type="button" class="nx-btn-primary icon-button" onclick="openTableLayoutSettings('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">view_module</span>
    <span>Setting layout</span>
  </button>
  <br>
  <br>
  <div class="nx-alert nx-alert-info">
Pilih style tabel untuk meningkatkan keterbacaan. Zebra striping membuat tabel lebih mudah dibaca dengan baris ganjil berwarna berbeda, sementara hover effect memberikan feedback visual saat kursor berada di atas baris.
</div>
  `
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
  
  // Initialize radio group behavior
  setTimeout(async() => {
    await radioGroup(radioGroupName, Sdk);
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

export function radioGroup(radioGroupName, Sdk) {
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
        
        // Save selected table layout to storage
        const selectedItem = tableSizeVariants[index];
        try {
          await Sdk.upSettings({
            tableLayout: selectedItem.className,
          });
          
          // ✅ Refresh UI tabel setelah layout berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan layout tabel:', error);
        }
      } else {
        // Handle unchecking - remove the layout setting
        try {
          await Sdk.upSettings({
            tableLayout: "", // empty string
          });
          
          // ✅ Refresh UI tabel setelah layout dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus layout tabel:', error);
        }
      }
    });
  });
}