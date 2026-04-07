// Function to open font style settings modal - List fields
window.openTableFontStyleFilName = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const checkedItems = await Sdk.getFields("tabel") || [];
  const result = checkedItems
    .filter(item => item.name !== 'id') // Filter out field 'id'
    .map(item => ({
      failed: item.name,
      failedAs: item.placeholder,
      fontStyle: item?.fontStyle ?? item?.fontstyle ?? ''
    }));

  const modalID = "tableFontStyleFields_" + token;
  
  const fieldItems = result.map((item, index) => {
    const currentStyle = item.fontStyle ? item.fontStyle : 'none';
    const badgeClass = currentStyle === 'none' ? 'nx-badge' : 'nx-badge nx-primary';
    return `
     <li class="nx-list-item d-flex justify-content-between align-items-center" 
         style="cursor:pointer;" 
         onclick="window.openTableFontStyle('${token}', '${item.failed}', '${item.failedAs.replace(/'/g, "\\'")}')">
       <span>${item.failedAs || item.failed}</span>
       <span class="${badgeClass}">${currentStyle}</span>
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
    label: "Pilih Field Font Style",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  NXUI.id("body_"+modalID).setStyle("padding", "0px");
}

// Function to open font style modal for specific field
window.openTableFontStyle = async function(token, fieldName, fieldLabel) {
  const Sdk = new NXUI.Buckets(token);
  
  // Get current fontStyle for this field
  const checkedItems = await Sdk.getFields("tabel") || [];
  const currentField = checkedItems.find(item => item.name === fieldName);
  const selectedFontStyle = currentField?.fontStyle || currentField?.fontstyle || '';
  
  const modalID = "tableFontStyle_" + token + "_" + fieldName;
  const radioGroupName = `tableFontStyle-${token}-${fieldName}`;
  const switchItems = fontStyle.map((item, index) => {
    const switchId = `switch-style-${token}-${fieldName}-${index}`;
    const isChecked = item.className === selectedFontStyle ? 'checked' : '';
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
    label: "Pengaturan Font Style",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior for font style per field
  setTimeout(async() => {
    await radioGroupForFieldFontStyle(radioGroupName, Sdk, fontStyle, fieldName);
  }, 100);
}

// Function to handle radio group for field-specific fontStyle
export async function radioGroupForFieldFontStyle(radioGroupName, Sdk, dataArray, fieldName) {
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
        
        // Save selected fontStyle to field
        const selectedItem = dataArray[index];
        try {
          // Update field with fontStyle
          await Sdk.upField({
            [fieldName]: {
              fontStyle: selectedItem.className
            },
          });
          
          // Refresh UI tabel setelah setting berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan fontStyle field:', error);
        }
      } else {
        // Handle unchecking - remove the fontStyle
        try {
          await Sdk.upField({
            [fieldName]: {
              fontStyle: ""
            },
          });
          
          // Refresh UI tabel setelah setting dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus fontStyle field:', error);
        }
      }
    });
  });
}

export const fontStyle = [
  {
    className: "normal",
    description: "Normal",
    fontSize: null
  },
  {
    className: "italic",
    description: "Italic",
    fontSize: null
  },
  {
    className: "oblique",
    description: "Oblique",
    fontSize: null
  }
];

