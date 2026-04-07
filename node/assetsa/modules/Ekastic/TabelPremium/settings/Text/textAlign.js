// Function to open text align settings modal - List fields
window.openTableTextalignFilName = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const checkedItems = await Sdk.getFields("tabel") || [];
  const result = checkedItems
    .filter(item => item.name !== 'id') // Filter out field 'id'
    .map(item => ({
      failed: item.name,
      failedAs: item.placeholder,
      textalign: item?.textalign ?? ''
    }));

  const modalID = "tableTextalignFields_" + token;
  
  const fieldItems = result.map((item, index) => {
    const currentAlign = item.textalign ? item.textalign : 'none';
    const badgeClass = currentAlign === 'none' ? 'nx-badge' : 'nx-badge nx-primary';
    return `
     <li class="nx-list-item d-flex justify-content-between align-items-center" 
         style="cursor:pointer;" 
         onclick="window.openTableTextalign('${token}', '${item.failed}', '${item.failedAs.replace(/'/g, "\\'")}')">
       <span>${item.failedAs || item.failed}</span>
       <span class="${badgeClass}">${currentAlign}</span>
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
    label: "Pilih Field Text Align",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  NXUI.id("body_"+modalID).setStyle("padding", "0px");
}

// Function to open text align modal for specific field
window.openTableTextalign = async function(token, fieldName, fieldLabel) {
  const Sdk = new NXUI.Buckets(token);
  
  // Get current textalign for this field
  const checkedItems = await Sdk.getFields("tabel") || [];
  const currentField = checkedItems.find(item => item.name === fieldName);
  const selectedTextalign = currentField?.textalign || '';
  
  const modalID = "tableTextalign_" + token + "_" + fieldName;
  const radioGroupName = `tableTextalign-${token}-${fieldName}`;
  const switchItems = Textalign.map((item, index) => {
    const switchId = `switch-align-${token}-${fieldName}-${index}`;
    const isChecked = item.className === selectedTextalign ? 'checked' : '';
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
    label: "Pengaturan Text Align",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior for text align per field
  setTimeout(async() => {
    await radioGroupForField(radioGroupName, Sdk, Textalign, fieldName);
  }, 100);
}

// Function to handle radio group for field-specific textalign
export async function radioGroupForField(radioGroupName, Sdk, dataArray, fieldName) {
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
        
        // Save selected textalign to field
        const selectedItem = dataArray[index];
        try {
          // Update field with textalign
          await Sdk.upField({
            [fieldName]: {
              textalign: selectedItem.className
            },
          });
          
          // Refresh UI tabel setelah setting berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan textalign field:', error);
        }
      } else {
        // Handle unchecking - remove the textalign
        try {
          await Sdk.upField({
            [fieldName]: {
              textalign: ""
            },
          });
          
          // Refresh UI tabel setelah setting dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus textalign field:', error);
        }
      }
    });
  });
}

export const Textalign = [
  {
    className: "left",
    description: "Rata kiri",
    fontSize: null
  },
  {
    className: "center",
    description: "Rata tengah",
    fontSize: null
  },
  {
    className: "right",
    description: "Rata kanan",
    fontSize: null
  },
  {
    className: "justify",
    description: "Rata kiri-kanan",
    fontSize: null
  }
];

