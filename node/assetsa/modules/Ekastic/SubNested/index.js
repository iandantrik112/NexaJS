
export async function SubQuery(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    console.log('label:', storage);
      const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 270, 'vh');
    const joinKeyLength = storage?.subnested?.key?.length || 0;
    const isTypeCross = joinKeyLength > 1;
    const isTypeNested = joinKeyLength <= 1;
    const wrapper = NXUI.createElement(
      "div",
      `    <div id="sdkSubNestedquery">
  <div class="nx-card-header">
   <h3 class="bold fs-20px">SubQuery Tabel</h3>  
 </div>

  
<div class="nx-row" style="padding-left:5px;margin-bottom:20px;margin-top:20px"> 
<div class="nx-switch-grid">
  <div class="nx-switch-item">
    <input type="checkbox" id="switchNested"/>
    <label for="switchNested">
      <span class="nx-switch"></span>
      Type Nested
    </label>
  </div>
  <div class="nx-switch-item">
    <input type="checkbox" id="switchCross" checked />
    <label for="switchCross">
      <span class="nx-switch"></span>
      Type SubQuery
    </label>
  </div>
</div>

         </div>
         <div class="nx-row" style="padding-left:5px"id="nxdrop"> </div>
      </div>
    `
    );

    setTimeout(async () => {
      try {
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaDrag({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        const template = render.Container({
          container: "#nxdrop",
          content: [await indexTabel(Sdk,height), await tagetTabel(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();

        // Apply cursor pointer to clickable elements
        setTimeout(() => {
          const container = NXUI.id("nxdrop");
          if (container) {
            // autoApplyCursorPointer(container);
          }
        }, 50);
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

// Fungsi untuk menangani perubahan switch (hanya satu yang bisa aktif)

export async function indexTabel(storage,height) {
  const data = await storage.storage();
  let tempalateallAlias = "";
  // Ambil alias yang sudah dipilih sebelumnya
  const selectedAlias = data.subnested?.alias || [];
  
  // Pastikan allAlias ada dan merupakan array sebelum memanggil forEach
  const allAlias = data.subnested?.allAlias || [];
  
  if (Array.isArray(allAlias) && allAlias.length > 0) {
    allAlias.forEach((row, index) => {
      // Cek apakah alias ini sudah dipilih sebelumnya
      const isChecked = selectedAlias.includes(row);
      
      tempalateallAlias += `
<div class="nx-switch-grid">
  <div class="nx-switch-item" style="margin-bottom:10px">
    <input type="checkbox" 
           id="switch${index}" 
           value="${row}"
           ${isChecked ? 'checked' : ''}
           onchange="setSubNested('','${data.id}');"
           />
    <label for="switch${index}">
      <span class="nx-switch"></span>
      ${row}
    </label>
  </div>
</div>
     `;
    });
  }







  const joinFailed = data.subnested?.failed?.length || 0;
  const joinKeys = data.subnested?.key || [];
  const joinedTablesData = [];
  for (const key of joinKeys) {
    const tableData = storage.metaKeyName(key);
    if (tableData) {
      joinedTablesData.push(tableData);
    }
  }

  let tempalatefield = "";
  joinKeys.forEach((row, index) => {
    if (row !== data.tableName) {
      tempalatefield += `
        <li class="nx-list-item d-flex justify-content-between align-items-center">
         
        <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${row}</strong>
         <span class="align-right">
         <a href="javascript:void(0);" onclick="settingSubNested('${row}','${data.id}');" class="nx-add-join-btn" title="Add Join">
          <span class="material-symbols-outlined nx-icon-md">settings</span>
         </a>

          <a href="javascript:void(0);" onclick="deleteSubNested('${row}','${data.id}');" class="nx-add-join-btn" title="Add Join">
          <span class="material-symbols-outlined nx-icon-md">delete</span>
        </a>
        </span>
        </li>
     `;
    }
  });

  return {
    title: "Index Tabel " + data.tableName,
    col: "nx-col-6",
        scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `
    <small class="text-muted">Target ${Number(
      joinKeys.length - 1
    )} Tabel</small>

  <small class="text-muted align-right">
  ${joinFailed} Failed
</small>

    `,
    html: `
        <ul class="nx-list-group">
         ${
           tempalatefield ||
           `

        <li class="nx-list-item d-flex justify-content-between align-items-center">
         
        <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${data.tableName}</strong>
        </li>
         `
         }
         </ul>

<div style="margin-top:10px">

${tempalateallAlias}
</div>

         `,
  };
}

export async function tagetTabel(storage,height) {
  const indexKey = await storage.storage();
  const data = await storage.metaData();
  let tempalatefield = "";

  // Get existing joined keys untuk filter
  const existingJoinedKeys = indexKey.subnested?.key || [];
  const hasSelectedTable = existingJoinedKeys.length >= 1; // Cek apakah sudah ada 1 tabel yang dipilih
  
  data.forEach((row, index) => {
    // Filter: bukan table sendiri DAN belum di-join
    if (
      indexKey.tableName !== row.label &&
      !existingJoinedKeys.includes(row.label)
    ) {
      // Generate unique ID for each item
      const itemId = `target-item-${row.key}-${indexKey.id}`;
      
      // Jika sudah ada tabel yang dipilih, sembunyikan tombol add
      const addButton = hasSelectedTable 
        ? `<span class="material-symbols-outlined nx-icon-md" style="opacity:0.3;cursor:not-allowed;" title="Hanya boleh memilih 1 tabel">lock</span>`
        : `<a href="javascript:void(0);" 
           id="btn-add-${row.key}-${indexKey.id}"
           onclick="addSubNested('${row.key}','${indexKey.id}','${indexKey.key}','${itemId}');" 
           class="nx-add-join-btn" 
           title="Add Join">
          <span class="material-symbols-outlined nx-icon-md">add</span>
        </a>`;
      
      tempalatefield += `
      <li id="${itemId}" class="nx-list-item d-flex justify-content-between align-items-center">
        
         <strong><span class="material-symbols-outlined nx-icon-md">join_left</span> ${row.label}</strong>
        ${addButton}
      </li>
     `;
    }
  });

  return {
    title: "Target Sub Query ",
    col: "nx-col-6",
            scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
  footer: `<small class="text-muted">${data.length} Tabel</small>`,
    html: `
       <div>
    <ul class="nx-list-group" style="padding-top:4px">
     ${tempalatefield}
     </ul>
     </div>

     `,
  };
}
/**
 * Convert finalFailed format to original field names (before duplicate handling)
 * @param {Array} fields - Array of field names (e.g., ["demo-id-id", "user-id-id2", "demo-nama"])
 * @returns {Array} - Array of original field names (e.g., ["demo-id", "user-id", "demo-nama"])
 */
function convertToOriginalFailed(fields) {
  return fields.map(field => {
    const parts = field.split('-');
    if (parts.length >= 2) {
      const tableName = parts[0];
      const originalField = parts[1];
      // Return the original format: table-field (without duplicate suffixes)
      return `${tableName}-${originalField}`;
    }
    return field; // Fallback for malformed field names
  });
}

/**
 * Convert variablesAlias format to variables format (field names only)
 * @param {Array} variablesAlias - Array of table.field format (e.g., ["demo.id", "user.thumbnails1", "demo.nama"])
 * @returns {Array} - Array of field names only (e.g., ["id", "thumbnails1", "nama"])
 */
function convertToVariables(variablesAlias) {
  return variablesAlias.map(item => {
    const parts = item.split('.');
    if (parts.length >= 2) {
      // Return everything after the first dot (the field name)
      return parts.slice(1).join('.');
    }
    return item; // Fallback for malformed items
  });
}

/**
 * Convert finalFailed format to variablesAlias format (table.field)
 * @param {Array} fields - Array of field names (e.g., ["demo-id-id", "user-thumbnails-thumbnails1", "demo-nama"])
 * @returns {Array} - Array of table.field format (e.g., ["demo.id", "user.thumbnails1", "demo.nama"])
 */
function convertToVariablesAlias(fields) {
  return fields.map(field => {
    const parts = field.split('-');
    if (parts.length >= 2) {
      const tableName = parts[0];
      const originalField = parts[1];
      
      // Check if there's a suffix (like -id, -id1, -thumbnails1)
      if (parts.length > 2) {
        const suffix = parts.slice(2).join('-');
        return `${tableName}.${suffix}`;
      } else {
        return `${tableName}.${originalField}`;
      }
    }
    return field; // Fallback for malformed field names
  });
}

/**
 * Convert finalFailed format to SQL alias format
 * @param {Array} fields - Array of field names (e.g., ["demo-id-id", "user-id-id1", "demo-nama"])
 * @returns {Array} - Array of SQL aliases (e.g., ["demo.id AS id", "user.id AS id1", "demo.nama AS nama"])
 */
function convertToSqlAliases(fields) {
  return fields.map(field => {
    const parts = field.split('-');
    if (parts.length >= 2) {
      const tableName = parts[0];
      const originalField = parts[1];
      
      // Check if there's a suffix (like -id, -id1, -nama1)
      if (parts.length > 2) {
        const suffix = parts.slice(2).join('-');
        return `${tableName}.${originalField} AS ${suffix}`;
      } else {
        return `${tableName}.${originalField} AS ${originalField}`;
      }
    }
    return field; // Fallback for malformed field names
  });
}

/**
 * Extract alias name from SQL alias format (e.g., "user.id AS id1" returns "id1")
 * @param {String} sqlAlias - SQL alias format
 * @returns {String} - Alias name
 */
function extractAliasName(sqlAlias) {
  if (!sqlAlias || typeof sqlAlias !== 'string') return '';
  const parts = sqlAlias.split(' AS ');
  return parts.length > 1 ? parts[1].trim() : '';
}

/**
 * Check if alias conflicts with buckets alias from main table
 * @param {Array} fields - Array of prefixed field names (e.g., ["user-id", "user-nama"])
 * @param {Array} tableKeys - Array of table keys (e.g., ["user"])
 * @param {Array} bucketsAllAlias - Array of SQL aliases from buckets (main table) (e.g., ["demo.id AS id", "demo.nama AS nama"])
 * @returns {Array} - Array with unique field names that don't conflict with buckets
 */
function handleDuplicateFieldsWithBuckets(fields, tableKeys, bucketsAllAlias = []) {
  // Extract alias names from buckets to check for conflicts
  const bucketsAliasNames = new Set();
  bucketsAllAlias.forEach(sqlAlias => {
    const aliasName = extractAliasName(sqlAlias);
    if (aliasName) {
      bucketsAliasNames.add(aliasName);
    }
  });
  
  const baseFieldCounts = {};
  const result = [];
  const aliasNamesUsed = new Set(bucketsAliasNames); // Initialize with buckets aliases
  
  // Count base field occurrences across target tables
  fields.forEach(field => {
    const parts = field.split('-');
    if (parts.length >= 2) {
      const baseField = parts.slice(1).join('-');
      if (!baseFieldCounts[baseField]) {
        baseFieldCounts[baseField] = 0;
      }
      baseFieldCounts[baseField]++;
    }
  });
  
  const fieldUsageCount = {}; // Track usage per field
  
  // Process fields maintaining original order
  fields.forEach(field => {
    const parts = field.split('-');
    if (parts.length >= 2) {
      const tablePrefix = parts[0];
      const baseField = parts.slice(1).join('-');
      
      // Check if this base field conflicts with buckets alias
      const conflictsWithBuckets = bucketsAliasNames.has(baseField);
      
      // Check if this base field appears multiple times in target tables
      const isDuplicateInTarget = baseFieldCounts[baseField] > 1;
      
      let finalAliasName = baseField;
      
      // If conflicts with buckets, always add suffix
      if (conflictsWithBuckets) {
        fieldUsageCount[baseField] = (fieldUsageCount[baseField] || 0) + 1;
        let counter = 1;
        
        // Find unique alias name
        do {
          finalAliasName = `${baseField}${counter}`;
          counter++;
        } while (aliasNamesUsed.has(finalAliasName));
        
        aliasNamesUsed.add(finalAliasName);
        result.push(`${tablePrefix}-${baseField}-${finalAliasName}`);
      } else if (isDuplicateInTarget) {
        // Duplicate in target tables, handle similar to original logic
        fieldUsageCount[baseField] = (fieldUsageCount[baseField] || 0) + 1;
        
        if (fieldUsageCount[baseField] === 1) {
          // First occurrence keeps original name (if not used)
          if (aliasNamesUsed.has(baseField)) {
            let counter = 1;
            do {
              finalAliasName = `${baseField}${counter}`;
              counter++;
            } while (aliasNamesUsed.has(finalAliasName));
            aliasNamesUsed.add(finalAliasName);
          } else {
            finalAliasName = baseField;
            aliasNamesUsed.add(finalAliasName);
          }
          result.push(`${tablePrefix}-${baseField}-${finalAliasName}`);
        } else {
          // Subsequent occurrences get numbered suffix
          let counter = fieldUsageCount[baseField] - 1;
          do {
            finalAliasName = `${baseField}${counter}`;
            counter++;
          } while (aliasNamesUsed.has(finalAliasName));
          aliasNamesUsed.add(finalAliasName);
          result.push(`${tablePrefix}-${baseField}-${finalAliasName}`);
        }
      } else {
        // No conflict, keep original (if not used)
        if (aliasNamesUsed.has(baseField)) {
          // Already used, need suffix
          let counter = 1;
          do {
            finalAliasName = `${baseField}${counter}`;
            counter++;
          } while (aliasNamesUsed.has(finalAliasName));
          aliasNamesUsed.add(finalAliasName);
          result.push(`${tablePrefix}-${baseField}-${finalAliasName}`);
        } else {
          aliasNamesUsed.add(baseField);
          result.push(field);
        }
      }
    } else {
      result.push(field);
    }
  });
  
  return result;
}

/**
 * Handle duplicate field names by adding suffixes
 * @param {Array} fields - Array of prefixed field names (e.g., ["demo-id", "user-id"])
 * @param {Array} tableKeys - Array of table keys (e.g., ["demo", "user"])
 * @returns {Array} - Array with unique field names
 */
function handleDuplicateFields(fields, tableKeys) {
  const fieldsByTable = {};
  const baseFieldCounts = {};
  const result = [];
  
  // Group fields by table and count base field occurrences across different tables
  fields.forEach(field => {
    const parts = field.split('-');
    if (parts.length >= 2) {
      const tablePrefix = parts[0];
      const baseField = parts.slice(1).join('-');
      
      if (!fieldsByTable[tablePrefix]) {
        fieldsByTable[tablePrefix] = [];
      }
      fieldsByTable[tablePrefix].push({ original: field, base: baseField });
      
      // Count how many different tables have this base field
      if (!baseFieldCounts[baseField]) {
        baseFieldCounts[baseField] = new Set();
      }
      baseFieldCounts[baseField].add(tablePrefix);
    }
  });
  
  // Track usage count for numbered suffixes
  const usageCount = {};
  
  // Process fields maintaining original order
  fields.forEach(field => {
    const parts = field.split('-');
    if (parts.length >= 2) {
      const tablePrefix = parts[0];
      const baseField = parts.slice(1).join('-');
      
      // Check if this base field appears in multiple tables
      const tablesWithThisField = baseFieldCounts[baseField];
      if (tablesWithThisField && tablesWithThisField.size > 1) {
        // This is a duplicate across tables
        usageCount[baseField] = (usageCount[baseField] || 0) + 1;
        
        if (usageCount[baseField] === 1) {
          // First occurrence gets the base field name as suffix
          result.push(`${tablePrefix}-${baseField}-${baseField}`);
        } else {
          // Subsequent occurrences get numbered suffix
          result.push(`${tablePrefix}-${baseField}-${baseField}${usageCount[baseField] - 1}`);
        }
      } else {
        // No duplicates across tables, keep original
        result.push(field);
      }
    } else {
      // Fallback for malformed field names
      result.push(field);
    }
  });
  
  return result;
}

// 010TDS001
nx.addSubNested = async function (id, key, index, itemId) {
  try {
    // Disable button dan tampilkan loading untuk mencegah double click
    const btnId = `btn-add-${id}-${key}`;
    const btnElement = document.getElementById(btnId);
    if (btnElement) {
      btnElement.style.pointerEvents = 'none';
      btnElement.style.opacity = '0.5';
      const icon = btnElement.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = 'hourglass_empty';
      }
    }

    const Sdk = new NXUI.Buckets(key);

    // Get data with error handling
    const data = await Sdk.metaIndexKey(id);
    if (!data) {
      console.error(`❌ addSubNested: Failed to get data for id '${id}'`);
      // Re-enable button on error
      if (btnElement) {
        btnElement.style.pointerEvents = 'auto';
        btnElement.style.opacity = '1';
        const icon = btnElement.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'add';
      }
      return;
    }

    const storage = await Sdk.storage();
    if (!storage) {
      console.error(`❌ addSubNested: Failed to get storage for key '${key}'`);
      // Re-enable button on error
      if (btnElement) {
        btnElement.style.pointerEvents = 'auto';
        btnElement.style.opacity = '1';
        const icon = btnElement.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'add';
      }
      return;
    }

    // Validasi: Cek apakah tabel sudah di-join untuk mencegah double target
    const existingJoinedKeys = storage.subnested?.key || [];
    const tableNameToAdd = data.table_name;
    
    // Validasi: Hanya boleh memilih 1 tabel target saja
    if (existingJoinedKeys.length >= 1) {
      alert(`Hanya boleh memilih 1 tabel target. Tabel ${existingJoinedKeys[0]} sudah dipilih.`);
      // Re-enable button
      if (btnElement) {
        btnElement.style.pointerEvents = 'auto';
        btnElement.style.opacity = '1';
        const icon = btnElement.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'add';
      }
      return;
    }
    
    if (existingJoinedKeys.includes(tableNameToAdd)) {
      // Re-enable button
      if (btnElement) {
        btnElement.style.pointerEvents = 'auto';
        btnElement.style.opacity = '1';
        const icon = btnElement.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'add';
      }
      return;
    }

    const data2 = await Sdk.metaIndexKey(index);
    if (!data2) {
      console.error(
        `❌ addSubNested: Failed to get data2 for storage.key '${storage.key}'`
      );
      // Re-enable button on error
      if (btnElement) {
        btnElement.style.pointerEvents = 'auto';
        btnElement.style.opacity = '1';
        const icon = btnElement.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'add';
      }
      return;
    }

 
    const label1 = storage.tableName; // Tabel induk (tidak disimpan)
    const label2 = data.table_name; // Tabel target yang dipilih (hanya ini yang disimpan)
    const variables2 = data.variables || []; // Hanya ambil variables dari tabel target

    // Hanya proses field dari tabel target saja (tidak termasuk tabel induk)
    const prefixed2 = variables2.map((v) => `${label2}-${v}`);

    // Metode yang benar untuk merge data tanpa menghapus yang sudah ada
    const currentSubnested = storage.subnested || {};

    // Handle existing data structure
    // Filter out tabel induk dari existingKeys
    const existingKeys = (currentSubnested.key || []).filter(key => key !== label1);
    
    // Merge keys (hindari duplikasi, dan pastikan tidak ada tabel induk)
    const existingKeySet = new Set(existingKeys);
    const newKeys = [label2].filter((item) => !existingKeySet.has(item) && item !== label1);
    const finalKeys = [...existingKeys, ...newKeys].filter(key => key !== label1); // Pastikan tabel induk tidak ada

    // Rebuild all field data from scratch based on current table structure
    // Hanya dari tabel target saja (tidak termasuk tabel induk)
    const allTableFields = [];
    
    // Get metadata for any additional tables that might be in existing joins
    const allMetaData = await Sdk.metaData();
    
    // Collect all fields only from target tables (exclude main table)
    for (const tableKey of finalKeys) {
      // Skip tabel induk
      if (tableKey === label1) {
        continue;
      }
      
      try {
        let variables = [];
        
        if (tableKey === label2) {
          // Use data from current join operation for target table
          variables = variables2;
        } else {
          // For other existing joined tables (target tables only), fetch their data
          const metaEntry = allMetaData.find(t => t.label === tableKey);
          if (metaEntry && metaEntry.key) {
            const tableData = await Sdk.metaIndexKey(metaEntry.key);
            if (tableData && tableData.variables) {
              variables = tableData.variables;
            }
          }
        }
        
        if (variables.length > 0) {
          const prefixedFields = variables.map(v => `${tableKey}-${v}`);
          allTableFields.push(...prefixedFields);
        }
      } catch (error) {
        console.error(`❌ Could not get data for table ${tableKey}:`, error);
      }
    }
    
    // Jika belum ada field, gunakan field dari tabel target yang baru dipilih
    if (allTableFields.length === 0 && prefixed2.length > 0) {
      allTableFields.push(...prefixed2);
    }
  
    // Ambil buckets.allAlias untuk membandingkan dan menghindari tabrakan alias
    const bucketsAllAlias = storage.buckets?.allAlias || [];
    
    // Apply duplicate handling to all fields with buckets comparison
    // Ini memastikan alias tabel target tidak bertabrakan dengan alias tabel induk di buckets
    const finalFailed = handleDuplicateFieldsWithBuckets(allTableFields, finalKeys, bucketsAllAlias);
    
    // Convert finalFailed to different formats
    const variablesAlias = convertToVariablesAlias(finalFailed);
    const variables = convertToVariables(variablesAlias);
    const allAlias = convertToSqlAliases(finalFailed);
    const originalFailed = convertToOriginalFailed(finalFailed);




    await Sdk.upIndex({
    //   app: "Nested",
    //   type:"single",
    //   subnested:false,
    //   form: false,
      
    //   variables: variables, // Menyimpan variables yang di-join
    //   variablesOrigin: variablesAlias, // Menyimpan variablesAlias Alias yang di-join
       subnested: {
           variables: variables, // Menyimpan variables yang di-join

           operasi: {
               [finalKeys]: {
                   "type": "single",
                   "index": "",
                   "aliasIndex":finalKeys[0],
                   "keyIndex": Number(id),
                   "target": "",
                   "condition": "",
                   "aliasTarget": "",
                   "keyTarget": ""
               }
           },


           variablesAlias: variablesAlias, // Menyimpan variablesAlias Alias yang di-join
           allAlias: allAlias, // Menyimpan tabel Alias yang di-join
           key: finalKeys, // Menyimpan tabel keys yang di-join
           failed: originalFailed, // Menyimpan field nama asli dari faild  variables yang di-join
           failedAlias: finalFailed, // Menyimpan field variables yang di-join
       },
     });


    await rendering(storage);
    
    // Button akan di-re-enable setelah rendering selesai
    // karena list akan di-refresh dan item yang sudah di-join akan hilang
  } catch (error) {
    console.error("❌ Error in addSubNested:", error);
    // Re-enable button on error
    const btnId = `btn-add-${id}-${key}`;
    const btnElement = document.getElementById(btnId);
    if (btnElement) {
      btnElement.style.pointerEvents = 'auto';
      btnElement.style.opacity = '1';
      const icon = btnElement.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'add';
    }
  }
};


// Function untuk menghapus join
window.settingSubNested = async function (tableKey, bucketKey) {
  const Sdk = new NXUI.Buckets(bucketKey);
    const storage = await Sdk.storage();

    // Ambil nilai yang sudah dipilih sebelumnya
    const selectedIndex = storage.subnested?.index || '';
    const selectedTarget = storage.subnested?.target || '';

    let tempalateaIndex = "";
    if (storage.buckets?.allAlias && Array.isArray(storage.buckets.allAlias)) {
      storage.buckets.allAlias.forEach((row, index) => {
        // Cek apakah alias ini sudah dipilih sebelumnya
        const isSelected = row === selectedIndex ? 'selected' : '';
        tempalateaIndex +=`
          <option value="${row}" ${isSelected}>${row}</option>
        `;
      });
    }

   let tempalateaTarget = "";
    if (storage.subnested?.allAlias && Array.isArray(storage.subnested.allAlias)) {
      storage.subnested.allAlias.forEach((row, index) => {
        // Cek apakah alias ini sudah dipilih sebelumnya
        const isSelected = row === selectedTarget ? 'selected' : '';
        tempalateaTarget +=`
          <option value="${row}" ${isSelected}>${row}</option>
        `;
      });
    }






    const modalID="settingSubNested_"+bucketKey;
    NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-500px",
    minimize: true,
    label: `Setting Foreign `,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    // Select: ["#groupbySelect"], 
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy:Sdk, // ✅ Standard validation approach
    onclick: {
      title: "Save Group By",
      cancel: "Cancel",
      send: "saveSettingForeign", // ✅ Use namespaced function name
    },
    content:`
  <div class="nx-row">
    <div class="nx-col-6">
<div class="form-nexa-group">
  <label>Index Tabel</label>
  <select class="form-nexa-control" name="index">
    <option value="">Select Index As</option>
${tempalateaIndex}

  </select>
</div>
    </div>
    <div class="nx-col-6">
<div class="form-nexa-group">
  <label>Taget Tabel</label>
  <select class="form-nexa-control" name="target">
    <option value="">Select Target As</option>
    ${tempalateaTarget}
  </select>
</div>
    </div>
</div>

      `,
  });
  NXUI.nexaModal.open(modalID);





}

window.saveSettingForeign = async function (modalID,data,Sdk) {
    const storage = await Sdk.storage();

    // Update subnested dengan data index dan target yang dipilih
      await Sdk.upIndex({
        subnested: {
          ...storage.subnested,
          index: data.index,
          target: data.target,
        },
      });
      // Gabungkan aliasNames dari applications dan subnested untuk column
      const applicationsAliasNames = storage.applications?.aliasNames || [];
      const subnestedAliasNames = storage.subnested?.aliasNames || [];
      const addFrom = generateExtract(subnestedAliasNames, storage.key, storage.subnested.alias);
      const mergedColumn = [...applicationsAliasNames, ...subnestedAliasNames];
      
      // Ambil form yang sudah ada dan merge dengan form baru agar tidak menghapus data yang sudah ada
      const existingForm = storage.applications?.form || storage.form || {};
      const mergedForm = {
        ...existingForm, // Pertahankan form yang sudah ada
        ...addFrom, // Tambahkan/update dengan form baru dari generateExtract
      };
   
      await Sdk.upIndex({
        column: mergedColumn, // Gabungkan aliasNames dari applications dan subnested
        form: mergedForm, // Merge form yang sudah ada dengan form baru 
        applications: {
          ...storage.applications,
          subnested:{
           alias: storage.subnested.alias,
           aliasNames: storage.subnested.aliasNames,
           tabelName: storage.subnested.key,
           where:`WHERE ${data.target.split(' AS ')[0].trim()} = ${data.index.split(' AS ')[0].trim()}`,
           operasi: storage.subnested.operasi,
           group:false,
           order:false,
          }
        },
      });







 NXUI.nexaModal.close(modalID);
}

export function generateExtract(variables,tabel,setKeyAs) {
    const timestamp = new Date().toISOString(); // waktu sekarang
    const extrak = {};
    
    // Validasi: pastikan variables adalah array
    if (!Array.isArray(variables)) {
      return extrak;
    }
    
    variables.forEach((name, index) => {
      extrak[name] = {
        type: "text",
        icons: "attach_file",
        columnWidth: "nx-col-12",
        name: name,
        key: Number(tabel),
        failedtabel:tabel+"."+name,
        failed: name,
        failedAs: setKeyAs[index], // ✅ Add SQL alias format
        fieldAlias: name,
        placeholder: name,
        validation: "2",
        timestamp: timestamp,
        control:'',
        value: false,
        hidden: false,
        readonly: false,
        tabel: false,
        condition: false,
        modal: false,
        search: false,
        filtering: false,
        inline: false,
        select: false,
      };
    });
    return extrak;
}
window.setSubNested = async function (tableKey, bucketKey) {
  try {
    const Sdk = new NXUI.Buckets(bucketKey);
    const storage = await Sdk.storage();

    if (!storage || !storage.subnested) {
      return;
    }

    // Ambil semua checkbox yang checked dari form indexTabel
    // Hanya checkbox di dalam container #sdkSubNestedquery dan yang memiliki value yang valid
    const selectedFields = [];
    const container = document.getElementById('sdkSubNestedquery');
    
    if (container) {
      const checkboxes = container.querySelectorAll('input[type="checkbox"][id^="switch"]');
      
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked && checkbox.value && checkbox.value.trim() !== '') {
          // Pastikan value bukan "on" (default value untuk checkbox tanpa value)
          if (checkbox.value !== 'on') {
            selectedFields.push(checkbox.value);
          }
        }
      });
    }

    // Validasi: pastikan tidak ada nilai "on" yang ikut terambil
    const filteredFields = selectedFields.filter(field => field !== 'on' && field !== '' && field);

    // Ambil data subnested yang sudah ada
    const currentSubnested = storage.subnested || {};
    
    // Extract alias name dari format SQL alias (bagian setelah AS)
    // Contoh: "user.nama AS nama1" -> "nama1"
    const aliasNames = filteredFields.map(field => {
      // Format: "table.field AS alias"
      // Ambil bagian setelah " AS " (alias name)
      const parts = field.split(' AS ');
      if (parts.length > 1) {
        return parts[1].trim(); // "nama1" (alias name setelah AS)
      }
      // Fallback: jika tidak ada "AS", ambil nama field dari table.field
      if (parts.length > 0) {
        const tableField = parts[0]; // "user.nama"
        const fieldParts = tableField.split('.');
        if (fieldParts.length > 1) {
          return fieldParts[1]; // "nama" (field asli sebagai fallback)
        }
      }
      return '';
    }).filter(name => name !== ''); // Hapus yang kosong
    
    // Update subnested dengan alias yang dipilih (hanya yang valid)
    await Sdk.upIndex({
      subnested: {
        ...currentSubnested,
        alias: filteredFields, // Simpan SQL alias lengkap (contoh: "user.nama AS nama1")
        aliasNames: aliasNames, // Simpan nama field asli saja (contoh: "nama")
      },
    });

    // Refresh tampilan setelah update
    await rendering(storage);
  } catch (error) {
    console.error("❌ Error in setSubNested:", error);
  }
}
window.deleteSubNested = async function (tableKey, bucketKey) {
  try {
    const Sdk = new NXUI.Buckets(bucketKey);
    const storage = await Sdk.storage();

    
      await Sdk.upIndex({
        subnested:false,
    
      });
    
     await rendering(storage);
  } catch (error) {
    console.error("❌ Error removing join:", error);
  }
};
/**
 * Fungsi untuk me-refresh/render ulang form SDK setelah ada perubahan
 * Menggunakan NexaRender untuk update tampilan form dengan data terbaru
 *
 * @param {Object} store - Instance Buckets yang berisi data form terbaru
 * @returns {Promise<void>}
 */
export async function rendering(store) {
  // Ambil data storage terbaru
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, SubQuery, {
    containerSelector: ["#sdkSubNestedquery"],
  });
}
