export async function upObject(data = null) {
  const nexaUI = NexaUI();

  if (!data || !data.tableName || !data.tableKey) {
    return;
  }

  const tabelName = data.tableName.toLowerCase();

  // First API call
  let data2 = await nexaUI
    .Storage()
    .models("Office")
    .tabelVariables(data.tableKey, tabelName);

  // If API returns wrong data, try alternative approach
  if (data2.data && Object.keys(data2.data).length === 1) {
    const singleKey = Object.keys(data2.data)[0];
    const singleData = data2.data[singleKey];

    if (
      singleData.tableKey != data.tableKey ||
      singleData.table_name !== tabelName
    ) {
      try {
        const data3 = await nexaStoreInstance.nexaUI
          .Storage()
          .models("Office")
          .tabelVariables(data.tableKey, data.tableName);

        if (data3.data && Object.keys(data3.data).length > 0) {
          const newKey = Object.keys(data3.data)[0];
          const newData = data3.data[newKey];
          if (
            newData.tableKey == data.tableKey ||
            newData.table_name === data.tableName.toLowerCase()
          ) {
            Object.assign(data2, data3);
          }
        }
      } catch (retryError) {
        // Retry failed
      }
    }
  }

  // Extract variables from the API response
  let tableData = null;
  if (data2.data && data2.data[tabelName]) {
    tableData = data2.data[tabelName];
  } else if (data2.data && typeof data2.data === "object") {
    const dataKeys = Object.keys(data2.data);
    for (const key of dataKeys) {
      if (
        key.toLowerCase() === data.tableName.toLowerCase() ||
        key.toLowerCase() === tabelName ||
        data2.data[key].key == data.tableKey
      ) {
        tableData = data2.data[key];
        break;
      }
    }
    if (!tableData && dataKeys.length > 0) {
      tableData = data2.data[dataKeys[0]];
    }
  }

  if (!tableData) {
    return;
  }

  // Salin variables dari tableData
  let variables = tableData.variables || [];

  // Pisahkan 'id' dari variabel lainnya (case-insensitive)
  const variablesWithoutId = variables.filter(item => item.toLowerCase() !== "id");

  // Cek apakah 'id' ada di original variables, jika ada, push ke akhir
  if (variables.some(item => item.toLowerCase() === "id")) {
    variablesWithoutId.push("id");
  }

  variables = variablesWithoutId;

  // Filter tambahan untuk checkbox (hilangkan 'id' dan 'userid')
  const excludedFields = ["userid"];
  const filteredVariables = variables.filter(
    (variable) => !excludedFields.includes(variable.toLowerCase())
  );

  const natVariabel = {
    table_name: tableData.table_name,
    key: tableData.tableKey,
    label: data.tableName,
    original_data_key: data.tableKey,
    original_data_label: data.tableName,
    variables: variables, // semua variabel dengan 'id' di akhir
    variablesOri: variables,
    variables_count: variables.length,
    variables_filtered: filteredVariables, // tanpa id & userid
    variables_checkbox: filteredVariables.slice(0, 5), // 5 pertama pre-selected
    variables_filtered_count: filteredVariables.length,
  };

  return natVariabel;
}
