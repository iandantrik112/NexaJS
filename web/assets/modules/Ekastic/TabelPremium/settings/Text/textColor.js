// Function to open text color settings modal - List fields
window.openTableColorFilName = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const checkedItems = await Sdk.getFields("tabel") || [];
  const result = checkedItems
    .filter(item => item.name !== 'id') // Filter out field 'id'
    .map(item => ({
      failed: item.name,
      failedAs: item.placeholder,
      color: item?.color ?? ''
    }));

  const modalID = "tableColorFields_" + token;
  
  const fieldItems = result.map((item, index) => {
    const currentColor = item.color ? item.color : 'none';
    const badgeClass = currentColor === 'none' ? 'nx-badge' : 'nx-badge nx-primary';
    const colorDisplay = currentColor !== 'none' ? `<span style="display: inline-block; width: 16px; height: 16px; background-color: ${currentColor}; border: 1px solid #ddd; border-radius: 3px; margin-right: 5px; vertical-align: middle;"></span>${currentColor}` : 'none';
    return `
     <li class="nx-list-item d-flex justify-content-between align-items-center" 
         style="cursor:pointer;" 
         onclick="window.openTableColor('${token}', '${item.failed}', '${item.failedAs.replace(/'/g, "\\'")}')">
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
    label: "Pilih Field Text Color",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  NXUI.id("body_"+modalID).setStyle("padding", "0px");
}

// Function to open text color modal for specific field
window.openTableColor = async function(token, fieldName, fieldLabel) {
  const Sdk = new NXUI.Buckets(token);
  
  // Get current color for this field
  const checkedItems = await Sdk.getFields("tabel") || [];
  const currentField = checkedItems.find(item => item.name === fieldName);
  const selectedColor = currentField?.color || '';
  
  const modalID = "tableColor_" + token + "_" + fieldName;
  const radioGroupName = `tableColor-${token}-${fieldName}`;
  const switchItems = textColors.map((item, index) => {
    const switchId = `switch-color-${token}-${fieldName}-${index}`;
    const isChecked = item.value === selectedColor ? 'checked' : '';
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
    label: "Pengaturan Text Color",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior for text color per field
  setTimeout(async() => {
    await radioGroupForFieldColor(radioGroupName, Sdk, textColors, fieldName);
  }, 100);
}

// Function to handle radio group for field-specific color
export async function radioGroupForFieldColor(radioGroupName, Sdk, dataArray, fieldName) {
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
        
        // Save selected color to field
        const selectedItem = dataArray[index];
        try {
          // Update field with color
          await Sdk.upField({
            [fieldName]: {
              color: selectedItem.value
            },
          });
          
          // Refresh UI tabel setelah setting berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan color field:', error);
        }
      } else {
        // Handle unchecking - remove the color
        try {
          await Sdk.upField({
            [fieldName]: {
              color: ""
            },
          });
          
          // Refresh UI tabel setelah setting dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus color field:', error);
        }
      }
    });
  });
}

export const textColors = [
  {
    value: "#000000",
    description: "Hitam",
    fontSize: null
  },
  {
    value: "#333333",
    description: "Abu-abu Gelap",
    fontSize: null
  },
  {
    value: "#666666",
    description: "Abu-abu",
    fontSize: null
  },
  {
    value: "#999999",
    description: "Abu-abu Terang",
    fontSize: null
  },
  {
    value: "#007bff",
    description: "Biru",
    fontSize: null
  },
  {
    value: "#28a745",
    description: "Hijau",
    fontSize: null
  },
  {
    value: "#ffc107",
    description: "Kuning",
    fontSize: null
  },
  {
    value: "#dc3545",
    description: "Merah",
    fontSize: null
  },
  {
    value: "#6f42c1",
    description: "Ungu",
    fontSize: null
  },
  {
    value: "#fd7e14",
    description: "Jingga",
    fontSize: null
  },
  {
    value: "#20c997",
    description: "Teal",
    fontSize: null
  },
  {
    value: "#17a2b8",
    description: "Cyan",
    fontSize: null
  }
];

