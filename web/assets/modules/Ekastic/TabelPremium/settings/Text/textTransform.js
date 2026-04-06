// Function to open text transform settings modal - List fields
window.opentableTexttransformSettings = async function(token) {
  const Sdk = new NXUI.Buckets(token);
  const checkedItems = await Sdk.getFields("tabel") || [];
  const result = checkedItems
    .filter(item => item.name !== 'id') // Filter out field 'id'
    .map(item => ({
      failed: item.name,
      failedAs: item.placeholder,
      texttransform: item?.texttransform ?? item?.textTransform ?? ''
    }));

  const modalID = "tableTexttransformFields_" + token;
  
  const fieldItems = result.map((item, index) => {
    const currentTransform = item.texttransform ? item.texttransform : 'none';
    const badgeClass = currentTransform === 'none' ? 'nx-badge' : 'nx-badge nx-primary';
    return `
     <li class="nx-list-item d-flex justify-content-between align-items-center" 
         style="cursor:pointer;" 
         onclick="window.openTableTexttransform('${token}', '${item.failed}', '${item.failedAs.replace(/'/g, "\\'")}')">
       <span>${item.failedAs || item.failed}</span>
       <span class="${badgeClass}">${currentTransform}</span>
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
    label: "Pilih Field Text Transform",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  NXUI.id("body_"+modalID).setStyle("padding", "0px");
}

// Function to open text transform modal for specific field
window.openTableTexttransform = async function(token, fieldName, fieldLabel) {
  const Sdk = new NXUI.Buckets(token);
  
  // Get current texttransform for this field
  const checkedItems = await Sdk.getFields("tabel") || [];
  const currentField = checkedItems.find(item => item.name === fieldName);
  const selectedTexttransform = currentField?.texttransform || currentField?.textTransform || '';
  
  const modalID = "tableTexttransform_" + token + "_" + fieldName;
  const radioGroupName = `tableTexttransform-${token}-${fieldName}`;
  const switchItems = tableTexttransform.map((item, index) => {
    const switchId = `switch-transform-${token}-${fieldName}-${index}`;
    const isChecked = item.className === selectedTexttransform ? 'checked' : '';
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
    label: "Pengaturan Text Transform",
    floating: false,
    content: content,
  });
  
  NXUI.nexaModal.open(modalID);
  
  // Initialize radio group behavior for text transform per field
  setTimeout(async() => {
    await radioGroupForFieldTransform(radioGroupName, Sdk, tableTexttransform, fieldName);
  }, 100);
}

// Function to handle radio group for field-specific texttransform
export async function radioGroupForFieldTransform(radioGroupName, Sdk, dataArray, fieldName) {
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
        
        // Save selected texttransform to field
        const selectedItem = dataArray[index];
        try {
          // Update field with texttransform
          await Sdk.upField({
            [fieldName]: {
              texttransform: selectedItem.className
            },
          });
          
          // Refresh UI tabel setelah setting berubah
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menyimpan texttransform field:', error);
        }
      } else {
        // Handle unchecking - remove the texttransform
        try {
          await Sdk.upField({
            [fieldName]: {
              texttransform: ""
            },
          });
          
          // Refresh UI tabel setelah setting dihapus
          if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }
        } catch (error) {
          console.error('Error menghapus texttransform field:', error);
        }
      }
    });
  });
}

export const tableTexttransform = [
  {
    className: "uppercase",
    description: "SEMUA HURUF BESAR",
    fontSize: null
  },
  {
    className: "lowercase",
    description: "semua huruf kecil",
    fontSize: null
  },
  {
    className: "capitalize",
    description: "Huruf Pertama Kapital",
    fontSize: null
  },
  {
    className: "",
    description: "Normal (tanpa transformasi)",
    fontSize: null
  }
];

