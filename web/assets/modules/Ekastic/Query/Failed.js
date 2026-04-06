
export async function initFailed(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    console.log('storage:', storage);
    console.log('buckets:', storage?.buckets);
    const joinKeyLength = storage?.buckets?.key?.length || 0;
    const isTypeCross = joinKeyLength > 1;
    const isTypeNested = joinKeyLength <= 1;
    const wrapper = NXUI.createElement(
      "div",
      `    <div id="sdkinitFailed">
  <div class="nx-card-header">
   <h3 class="bold fs-20px">Join Tabel</h3>  
 </div>

  
<div class="nx-row" style="padding-left:5px;margin-bottom:20px;margin-top:20px"> 
<div class="nx-switch-grid">
  <div class="nx-switch-item">
    <input type="checkbox" id="switchNested" ${
      isTypeNested ? "checked" : ""
    }  />
    <label for="switchNested">
      <span class="nx-switch"></span>
      Type Nested
    </label>
  </div>
  <div class="nx-switch-item">
    <input type="checkbox" id="switchCross" ${isTypeCross ? "checked" : ""}  />
    <label for="switchCross">
      <span class="nx-switch"></span>
      Type Cross
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
          content: [await Failed(Sdk), await joinFailed(Sdk)],
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

export async function Failed(storage) {
  const data = await storage.storage();

  const joinFailed = data.buckets?.failed?.length || 0;
  const joinKeys = data.buckets?.key || [];
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
          <a href="javascript:void(0);" onclick="deleteJoin('${row}','${data.id}');" class="nx-add-join-btn" title="Add Join">
          <span class="material-symbols-outlined nx-icon-md">delete</span>
        </a>
        </li>
     `;
    }
  });

  return {
    title: "Index Tabel " + data.tableName,
    col: "nx-col-6",
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
         </ul>`,
  };
}

export async function joinFailed(storage) {
  const indexKey = await storage.storage();
  const data = await storage.metaData();
  let tempalatefield = "";

  // Get existing joined keys untuk filter
  const existingJoinedKeys = indexKey.buckets?.key || [];
  data.forEach((row, index) => {
    // Filter: bukan table sendiri DAN belum di-join
    if (
      indexKey.tableName !== row.label &&
      !existingJoinedKeys.includes(row.label)
    ) {
      tempalatefield += `
      <li id="${indexKey.id}" class="nx-list-item d-flex justify-content-between align-items-center">
         <strong><span class="material-symbols-outlined nx-icon-md">join_left</span> ${row.label}</strong>
        <a href="javascript:void(0);" onclick="addJoin('${row.key}','${indexKey.id}','${indexKey.key}');" class="nx-add-join-btn" title="Add Join">
          <span class="material-symbols-outlined nx-icon-md">add</span>
        </a>
      </li>
     `;
    }
  });

  return {
    title: "Target Join " + indexKey.tableName,
    col: "nx-col-6",
  footer: `<small class="text-muted">${data.length} Tabel</small>`,
    html: `
       <div>
    <ul class="nx-list-group nx-scroll-hidden" style="height:400px; padding-top:4px">
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
nx.addJoin = async function (id, key, index) {
  try {
    const Sdk = new NXUI.Buckets(key);

    // Get data with error handling
    const data = await Sdk.metaIndexKey(id);
    if (!data) {
      console.error(`❌ addJoin: Failed to get data for id '${id}'`);
      return;
    }

    const storage = await Sdk.storage();
    if (!storage) {
      console.error(`❌ addJoin: Failed to get storage for key '${key}'`);
      return;
    }

    const data2 = await Sdk.metaIndexKey(index);
    if (!data2) {
      console.error(
        `❌ addJoin: Failed to get data2 for storage.key '${storage.key}'`
      );
      return;
    }

 
    const label1 = storage.tableName;
    const label2 = data.table_name;
    const variables1 = data2.variables || [];
    const variables2 = data.variables || [];

    // kasih prefix ke masing-masing array
    const prefixed1 = variables1.map((v) => `${label1}-${v}`);
    const prefixed2 = variables2.map((v) => `${label2}-${v}`);

    // gabungkan dan handle duplicate field names
    const merged = handleDuplicateFields([...prefixed1, ...prefixed2], [label1, label2]);
    const mergedTabel = [label1, label2]; // Tabel keys yang di-join

    // Metode yang benar untuk merge data tanpa menghapus yang sudah ada
    const currentBuckets = storage.buckets || {};
    const currentJoin = currentBuckets.join || {};

    // Handle existing data structure
    const existingKeys = currentJoin.key || [];
    const existingFailed = currentJoin.failed || [];

    // Merge keys (hindari duplikasi)
    const existingKeySet = new Set(existingKeys);
    const newKeys = mergedTabel.filter((item) => !existingKeySet.has(item));
    const finalKeys = [...existingKeys, ...newKeys];

    // Rebuild all field data from scratch based on current table structure
    // This ensures proper duplicate handling across all joined tables
    const allTableFields = [];
    
    // We already have the data we need from the current join operation
    const currentTableData = new Map();
    currentTableData.set(label1, data2.variables || []); // Main table (demo)
    currentTableData.set(label2, data.variables || []);  // Joined table (user)
    
    // Get metadata for any additional tables that might be in existing joins
    const allMetaData = await Sdk.metaData();
    
    // Collect all fields from all joined tables
    for (const tableKey of finalKeys) {
      try {
        let variables = [];
        
        if (currentTableData.has(tableKey)) {
          // Use data we already have from current join operation
          variables = currentTableData.get(tableKey);
          console.log(`✅ Using existing data for table ${tableKey}: ${variables.length} fields`);
        } else {
          // For other existing joined tables, fetch their data
          const metaEntry = allMetaData.find(t => t.label === tableKey);
          if (metaEntry && metaEntry.key) {
            const tableData = await Sdk.metaIndexKey(metaEntry.key);
            if (tableData && tableData.variables) {
              variables = tableData.variables;
              console.log(`✅ Fetched data for table ${tableKey}: ${variables.length} fields`);
            }
          }
        }
        
        if (variables.length > 0) {
          const prefixedFields = variables.map(v => `${tableKey}-${v}`);
          allTableFields.push(...prefixedFields);
        } else {
          console.warn(`⚠️ No variables found for table ${tableKey}`);
        }
      } catch (error) {
        console.error(`❌ Could not get data for table ${tableKey}:`, error);
      }
    }
    
    console.log(`📊 Total fields collected: ${allTableFields.length}`, allTableFields);
    
    // Apply duplicate handling to all fields
    const finalFailed = handleDuplicateFields(allTableFields, finalKeys);
    
    // Convert finalFailed to different formats
    const variablesAlias = convertToVariablesAlias(finalFailed);
    const variables = convertToVariables(variablesAlias);
    const allAlias = convertToSqlAliases(finalFailed);
    const originalFailed = convertToOriginalFailed(finalFailed);




    await Sdk.upIndex({
      app: "Cross",
      type: "join",
      form: await generateExtract(
        variables,
        storage.form || {},
        variablesAlias || [],
        originalFailed || [],
        key
      ),

      
      variables: variables, // Menyimpan variables yang di-join
      variablesOrigin: variablesAlias, // Menyimpan variablesAlias Alias yang di-join
      buckets: {
          // ...currentBuckets, // Pertahankan buckets lain yang sudah ada
          variables: variables, // Menyimpan variables yang di-join
          variablesAlias: variablesAlias, // Menyimpan variablesAlias Alias yang di-join
          allAlias: allAlias, // Menyimpan tabel Alias yang di-join
          key: finalKeys, // Menyimpan tabel keys yang di-join
          failed: originalFailed, // Menyimpan field nama asli dari faild  variables yang di-join
          failedAlias: finalFailed, // Menyimpan field variables yang di-join
 
      },
    });


    await rendering(storage);
  } catch (error) {
    console.error("❌ Error in addJoin:", error);
  }
};

// Helper function to filter form fields that are still valid
function filterValidFormFields(formData, validVariables) {
  const filteredForm = {};
  
  // Only keep form fields that exist in the current valid variables
  validVariables.forEach(variable => {
    if (formData[variable]) {
      filteredForm[variable] = formData[variable];
    }
  });
  
  console.log(`🔄 Filtered form fields: ${Object.keys(filteredForm).length} out of ${Object.keys(formData).length} fields kept`);
  return filteredForm;
}

// Function untuk menghapus join
nx.deleteJoin = async function (tableKey, bucketKey) {
  try {
    const Sdk = new NXUI.Buckets(bucketKey);
    const storage = await Sdk.storage();

    if (!storage || !storage.buckets) {
      console.log("No bucket data to remove");
      return;
    }
    
    const tableNameToRemove = tableKey; // e.g., "alsintan_per_desa"
    const currentKeys = storage.buckets.key || [];

    // Remove table key (exact match)
    const updatedKeys = currentKeys.filter((key) => key !== tableNameToRemove);
    
 
    // Rebuild all field data from scratch for remaining tables
    const allTableFields = [];
    
    if (updatedKeys.length > 0) {
      // Use existing failed data to rebuild fields for remaining tables
      const currentFailed = storage.buckets.failed || [];
      const tableNameToRemove = tableKey;
      
      // Filter out fields from the removed table
      const prefixToRemove = `${tableNameToRemove}-`;
      const remainingFields = currentFailed.filter(
        (item) => !item.startsWith(prefixToRemove)
      );
      
      allTableFields.push(...remainingFields);
    }
    
  
    // Apply duplicate handling to remaining fields
    const finalFailed = handleDuplicateFields(allTableFields, updatedKeys);
    
    // Convert finalFailed to different formats
    const variablesAlias = convertToVariablesAlias(finalFailed);
    const variables = convertToVariables(variablesAlias);
    const allAlias = convertToSqlAliases(finalFailed);
    const originalFailed = convertToOriginalFailed(finalFailed);
    
    // Tentukan app berdasarkan jumlah keys setelah penghapusan
    const appType = updatedKeys.length <= 1 ? "Nested" : "Cross";
    const systemType = updatedKeys.length <= 1 ? "form" : "join";
    await Sdk.upIndex({
      app: appType,
      type: systemType,
      variables: variables, // Menyimpan variables yang di-join
      variablesOrigin: variablesAlias, // Menyimpan variablesAlias Alias yang di-join
      form: await generateExtract(
        variables,
        filterValidFormFields(storage.form || {}, variables),
        variablesAlias || [],
        originalFailed || [],
        bucketKey
      ),

      buckets: {
        // Don't spread existing buckets to ensure clean state
        key: updatedKeys,
        failed: originalFailed,
        failedAlias: finalFailed,
        variables: variables,
        variablesAlias: variablesAlias,
        allAlias: allAlias,
      },
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
  await NXUI.NexaRender.refresh(store, initFailed, {
    containerSelector: ["#sdkinitFailed"],
  });
}

export async function generateExtract(variables, cek, failed, originalFailed, id) {
  const Sdk = new NXUI.Buckets(id);
  const timestamp = new Date().toISOString(); // waktu sekarang
  const extrak = {};
  
  // Arrays are properly aligned for index-based lookup
  
  // Process all variables with async operations
  await Promise.all(
    variables.map(async (name, index) => {
      const fieldTAbel = failed[index].split(".")[0];
      const fieldNama = failed[index].split(".")[1];
      
      // Get original field name from originalFailed using index-based approach
      // Since the arrays are aligned, we can use the same index
      let originalFieldName = fieldNama; // fallback
      
      if (originalFailed && originalFailed[index]) {
        const originalEntry = originalFailed[index];
        if (originalEntry && originalEntry.includes('-')) {
          const [origTable, origField] = originalEntry.split('-');
          // Verify this is the correct table
          if (origTable === fieldTAbel) {
            originalFieldName = origField;
          }
        }
      }
      
      // Original field name extracted successfully
      
      const setKeyTabel = await Sdk.metaIndex(fieldTAbel);

      // Generate failedAs format: "table.originalField AS processedField"
      const failedAs = `${fieldTAbel}.${originalFieldName} AS ${name}`;
      
      // Jika field sudah ada di cek, gunakan data yang sudah ada tapi update failed property
       if (cek[name]) {
         extrak[name] = {
           ...cek[name],
           failed: originalFieldName, // ✅ Always use the correct original field name
           failedAs: failedAs // ✅ Add SQL alias format
         };
       } else {
        // Jika belum ada, buat field baru dengan default values
        extrak[name] = {
          type: "text",
          icons: "attach_file",
          columnWidth: "nx-col-12",
          name:name,
          label:name,
          failed: originalFieldName,
          failedAs: failedAs, // ✅ Add SQL alias format
          key: Number(setKeyTabel.key),
          failedtabel: failed[index],
          fieldAlias: name,
          placeholder: name,
          validation: 2,
          created_at: timestamp,
          control: "",
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
       }
    })
  );

  return extrak;
}