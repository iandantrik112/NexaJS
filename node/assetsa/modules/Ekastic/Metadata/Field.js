export async function metaField(id, tabel) {
  try {
    const Field = await NXUI.Storage()
      .models("Office")
      .tabelVariables(id, tabel);
    return Field;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    // Return a default structure to prevent undefined errors
    return {
      data: {
        [tabel]: {
          variables: [],
          table_name: tabel,
        },
      },
    };
  }
}

export function metaIndex(name) {
  const tabelJoin = NEXA.controllers.data.tabel.submenu || [];

  const selectedMetadata = tabelJoin.find((item) => item.label === name);
  return selectedMetadata;
}

export async function metaIndexKey(name) {
  const tabelJoin = NEXA.controllers.data.tabel.submenu || [];
  const red = tabelJoin.find((item) => item.key === name);
  const data = await metaField(red.key, red.label);
  return data.data[red.label];
}

export async function metaJoin(dataform) {
  // 1. Cek data yang sudah ada di IndexedDB
  const buckets = await NXUI.ref.get("bucketsStore", dataform.id);
  // 2. Cek dataform.joinTabel apakah ada penambahan tabel baru
  let needsUpdate = false;
  let allFieldData = {};
  let allFieldVariables = [];

  if (buckets) {
    // Data exists in IndexedDB, check if joinTabel has new tables
    const existingTables = Object.keys(buckets.allFieldData || {});
    const currentTables = dataform.joinTabel || [];

    // Check if there are new tables not in IndexedDB
    const newTables = currentTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (newTables.length > 0) {
      needsUpdate = true;
    } else {
      // No new tables, return existing data from IndexedDB
      return {
        allFieldData: buckets.allFieldData,
        allFieldVariables: buckets.allFieldVariables,
      };
    }
  } else {
    // No data in IndexedDB, need to fetch everything
    needsUpdate = true;
  }

  if (needsUpdate) {
    // Get field variables for all tables in joinTabel
    allFieldData = buckets ? { ...buckets.allFieldData } : {};
    allFieldVariables = buckets ? [...buckets.allFieldVariables] : [];

    // Process each table in joinTabel array
    const tablesToProcess = buckets
      ? dataform.joinTabel.filter(
          (table) => !Object.keys(buckets.allFieldData || {}).includes(table)
        )
      : dataform.joinTabel;

    for (const tableName of tablesToProcess) {
      try {
        // Get the correct key for this table using metaIndex
        const tableMetadata = metaIndex(tableName);
        if (!tableMetadata || !tableMetadata.key) {
          console.warn(`No metadata found for table: ${tableName}`);
          continue;
        }

        const tableKey = tableMetadata.key;
        const field = await metaField(tableKey, tableName);

        if (field && field.data && field.data[tableName]) {
          allFieldData[tableName] = field.data[tableName];
          const tableVariables = field.data[tableName].variables || [];
          const tableName_clean = field.data[tableName].table_name;

          // Add table prefix to each variable
          const prefixedVariables = tableVariables.map(
            (variable) => `${tableName_clean}-${variable}`
          );
          allFieldVariables.push(...prefixedVariables);
        } else {
          console.warn(`No field data found for table: ${tableName}`);
        }
      } catch (error) {
        console.warn(`Failed to get field data for table ${tableName}:`, error);
      }
    }

    // Fallback: if no variables found from joinTabel, try the original tableName
    if (allFieldVariables.length === 0 && dataform.tableName) {
      try {
        const field = await metaField(dataform.tableKey, dataform.tableName);
        if (field && field.data && field.data[dataform.tableName]) {
          allFieldData[dataform.tableName] = field.data[dataform.tableName];
          const tableVariables = field.data[dataform.tableName].variables || [];
          const tableName_clean = field.data[dataform.tableName].table_name;
          const prefixedVariables = tableVariables.map(
            (variable) => `${tableName_clean}-${variable}`
          );
          allFieldVariables.push(...prefixedVariables);
        }
      } catch (error) {
        console.warn(`Fallback failed for table ${dataform.tableName}:`, error);
      }
    }

    // Save updated data to IndexedDB
    await NXUI.ref.set("bucketsStore", {
      id: dataform.id,
      allFieldData: allFieldData,
      allFieldVariables: allFieldVariables,
    });
  }

  return {
    allFieldData: allFieldData,
    allFieldVariables: allFieldVariables,
  };
}
