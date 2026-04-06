// Function to open background color settings modal - List fields
window.openTableBackgroundColorFilName = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const checkedItems = await Sdk.getFields("tabel") || [];
  const result = checkedItems
    .filter(item => item.name !== 'id') // Filter out field 'id'
    .map(item => ({
      failed: item.name,
      failedAs: item.placeholder,
      backgroundColor: item?.backgroundColor ?? item?.backgroundcolor ?? ''
    }));

  const modalID = "tableBackgroundColorFields_" + token;
  
  const fieldItems = result.map((item, index) => {
    const currentBgColor = item.backgroundColor ? item.backgroundColor : 'none';
    const badgeClass = currentBgColor === 'none' ? 'nx-badge' : 'nx-badge nx-primary';
    const colorDisplay = currentBgColor !== 'none' ? `<span style="display: inline-block; width: 16px; height: 16px; background-color: ${currentBgColor}; border: 1px solid #ddd; border-radius: 3px; margin-right: 5px; vertical-align: middle;"></span>${currentBgColor}` : 'none';
    return `
     <li class="nx-list-item d-flex justify-content-between align-items-center" 
         style="cursor:pointer;" 
         onclick="window.openTableBackgroundColor('${token}', '${item.failed}', '${item.failedAs.replace(/'/g, "\\'")}')">
       <span>${item.failedAs || item.failed}</span>
       <span class="${badgeClass}">${colorDisplay}</span>
     </li>
    `;
  }).join('');
  
  const content = `
    <ul class="nx-list-group">
      ${fieldItems}
    </ul>
  `;
  
  NXUI.formModal({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: "Pilih Field Background Color",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  NXUI.id("body_"+modalID).setStyle("padding", "0px");
}

// Function to open background color modal for specific field
window.openTableBackgroundColor = async function(token, fieldName, fieldLabel) {
  const Sdk = new NXUI.Buckets(token);
  
  // Get current backgroundColor for this field
  const checkedItems = await Sdk.getFields("tabel") || [];
  const currentField = checkedItems.find(item => item.name === fieldName);
  const selectedBackgroundColor = currentField?.backgroundColor || currentField?.backgroundcolor || '';
  
  const modalID = "tableBackgroundColor_" + token + "_" + fieldName;
  const radioGroupName = `tableBackgroundColor-${token}-${fieldName}`;
  const switchItems = backgroundColors.map((item, index) => {
    const switchId = `switch-bgcolor-${token}-${fieldName}-${index}`;
    const isChecked = item.value === selectedBackgroundColor ? 'checked' : '';
    return `
     <div style="margin-bottom:10px;">
       <div class="nx-switch-item">
         <input type="checkbox" name="${radioGroupName}" id="${switchId}" ${isChecked} />
         <label for="${switchId}" style="display: flex; align-items: center; gap: 8px;">
           <span class="nx-switch"></span>
           <span style="display: inline-block; width: 20px; height: 20px; background-color: ${item.value}; border: 1px solid #ddd; border-radius: 3px;"></span>
           <span>${item.description}</span>
         </label>
       </div>
     </div>
    `;
  }).join('');
  
  const content = `
    ${switchItems}
  `;
  
  NXUI.formModal({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: "Pengaturan Background Color",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior for background color per field
  setTimeout(async() => {
    await radioGroupForFieldBackgroundColor(radioGroupName, Sdk, backgroundColors, fieldName);
  }, 100);
}

// Function to handle radio group for field-specific backgroundColor
export async function radioGroupForFieldBackgroundColor(radioGroupName, Sdk, dataArray, fieldName) {
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
        
        // Save selected backgroundColor to field
        const selectedItem = dataArray[index];
        try {
          // Update field with backgroundColor
          await Sdk.upField({
            [fieldName]: {
              backgroundColor: selectedItem.value
            },
          });
          
          // Refresh UI tabel setelah setting berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan backgroundColor field:', error);
        }
      } else {
        // Handle unchecking - remove the backgroundColor
        try {
          await Sdk.upField({
            [fieldName]: {
              backgroundColor: ""
            },
          });
          
          // Refresh UI tabel setelah setting dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus backgroundColor field:', error);
        }
      }
    });
  });
}

export const backgroundColors = [
  {
    value: "transparent",
    description: "Transparan",
    fontSize: null
  },
  {
    value: "#ffffff",
    description: "Putih",
    fontSize: null
  },
  {
    value: "#f8f9fa",
    description: "Abu-abu Terang",
    fontSize: null
  },
  {
    value: "#e9ecef",
    description: "Abu-abu Muda",
    fontSize: null
  },
  {
    value: "#dee2e6",
    description: "Abu-abu",
    fontSize: null
  },
  {
    value: "#cfe2ff",
    description: "Biru Muda",
    fontSize: null
  },
  {
    value: "#d1e7dd",
    description: "Hijau Muda",
    fontSize: null
  },
  {
    value: "#fff3cd",
    description: "Kuning Muda",
    fontSize: null
  },
  {
    value: "#f8d7da",
    description: "Merah Muda",
    fontSize: null
  },
  {
    value: "#e2d9f3",
    description: "Ungu Muda",
    fontSize: null
  },
  {
    value: "#ffedd4",
    description: "Jingga Muda",
    fontSize: null
  },
  {
    value: "#d4edda",
    description: "Teal Muda",
    fontSize: null
  },
  {
    value: "#d1ecf1",
    description: "Cyan Muda",
    fontSize: null
  }
];

