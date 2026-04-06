// Function to open font weight settings modal - List fields
window.openTableFontWeightFilName = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const checkedItems = await Sdk.getFields("tabel") || [];
  const result = checkedItems
    .filter(item => item.name !== 'id') // Filter out field 'id'
    .map(item => ({
      failed: item.name,
      failedAs: item.placeholder,
      fontWeight: item?.fontWeight ?? item?.fontweight ?? ''
    }));

  const modalID = "tableFontWeightFields_" + token;
  
  const fieldItems = result.map((item, index) => {
    const currentWeight = item.fontWeight ? item.fontWeight : 'none';
    const badgeClass = currentWeight === 'none' ? 'nx-badge' : 'nx-badge nx-primary';
    return `
     <li class="nx-list-item d-flex justify-content-between align-items-center" 
         style="cursor:pointer;" 
         onclick="window.openTableFontWeight('${token}', '${item.failed}', '${item.failedAs.replace(/'/g, "\\'")}')">
       <span>${item.failedAs || item.failed}</span>
       <span class="${badgeClass}">${currentWeight}</span>
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
    label: "Pilih Field Font Weight",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  NXUI.id("body_"+modalID).setStyle("padding", "0px");
}

// Function to open font weight modal for specific field
window.openTableFontWeight = async function(token, fieldName, fieldLabel) {
  const Sdk = new NXUI.Buckets(token);
  
  // Get current fontWeight for this field
  const checkedItems = await Sdk.getFields("tabel") || [];
  const currentField = checkedItems.find(item => item.name === fieldName);
  const selectedFontWeight = currentField?.fontWeight || currentField?.fontweight || '';
  
  const modalID = "tableFontWeight_" + token + "_" + fieldName;
  const radioGroupName = `tableFontWeight-${token}-${fieldName}`;
  const switchItems = fontWeight.map((item, index) => {
    const switchId = `switch-weight-${token}-${fieldName}-${index}`;
    const isChecked = item.className === selectedFontWeight ? 'checked' : '';
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
  
  const content = `
    ${switchItems}
  `;
  
  NXUI.formModal({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: "Pengaturan Font Weight",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior for font weight per field
  setTimeout(async() => {
    await radioGroupForFieldFontWeight(radioGroupName, Sdk, fontWeight, fieldName);
  }, 100);
}

// Function to handle radio group for field-specific fontWeight
export async function radioGroupForFieldFontWeight(radioGroupName, Sdk, dataArray, fieldName) {
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
        
        // Save selected fontWeight to field
        const selectedItem = dataArray[index];
        try {
          // Update field with fontWeight
          await Sdk.upField({
            [fieldName]: {
              fontWeight: selectedItem.className
            },
          });
          
          // Refresh UI tabel setelah setting berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan fontWeight field:', error);
        }
      } else {
        // Handle unchecking - remove the fontWeight
        try {
          await Sdk.upField({
            [fieldName]: {
              fontWeight: ""
            },
          });
          
          // Refresh UI tabel setelah setting dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus fontWeight field:', error);
        }
      }
    });
  });
}

export const fontWeight = [
  {
    className: "normal",
    description: "Normal (400)",
    fontSize: null
  },
  {
    className: "bold",
    description: "Bold (700)",
    fontSize: null
  },
  {
    className: "lighter",
    description: "Lighter",
    fontSize: null
  },
  {
    className: "300",
    description: "Light (300)",
    fontSize: null
  },
  {
    className: "500",
    description: "Medium (500)",
    fontSize: null
  },
  {
    className: "600",
    description: "Semi Bold (600)",
    fontSize: null
  }
];

