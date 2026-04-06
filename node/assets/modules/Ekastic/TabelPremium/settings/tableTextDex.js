export async function infotableText(data) {
  return `
  <button type="button" class="nx-btn-primary icon-button" onclick="opentableTexttransformSettings('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">text_fields</span>
    <span>Text Transform</span>
  </button>

 <button type="button" class="nx-btn-primary icon-button" onclick="openTableTextalignFilName('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">format_align_left</span>
    <span>Text Align</span>
  </button>

  <button type="button" class="nx-btn-primary icon-button" onclick="openTableFontWeightFilName('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">format_bold</span>
    <span>Font Weight</span>
  </button>

  <button type="button" class="nx-btn-primary icon-button" onclick="openTableFontStyleFilName('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">format_italic</span>
    <span>Font Style</span>
  </button>

  <button type="button" class="nx-btn-primary icon-button" onclick="openTableColorFilName('${data.id}')">
    <span class="material-symbols-outlined nx-icon-sm">palette</span>
    <span>Text Color</span>
  </button>
  <br>
  <br>
  <div class="nx-alert nx-alert-info">
Atur transformasi dan perataan teks pada tabel sesuai kebutuhan Anda. Transformasi teks memungkinkan mengubah huruf menjadi kapital, kecil, atau hanya kapital di awal kata.
</div>
  `
}

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