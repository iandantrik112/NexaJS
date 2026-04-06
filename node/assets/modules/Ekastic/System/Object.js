export async function createObject(data = null, modalId) {
  const nexaUI = NexaUI();
 console.log('label:', data, modalId);
  if (!data || !data.label || !data.key) {
    return;
  }

  const tabelName = data.label.toLowerCase();

  // First API call
  let data2 = await nexaUI
    .Storage()
    .models("Office")
    .tabelVariables(data.key, tabelName);
    console.log('label:', data2);

  // If API returns wrong data, try alternative approach
  if (data2.data && Object.keys(data2.data).length === 1) {
    const singleKey = Object.keys(data2.data)[0];
    const singleData = data2.data[singleKey];

    if (singleData.key != data.key || singleData.table_name !== tabelName) {
      try {
        const data3 = await nexaStoreInstance.nexaUI
          .Storage()
          .models("Office")
          .tabelVariables(data.key, data.label); // Use original label

        if (data3.data && Object.keys(data3.data).length > 0) {
          const newKey = Object.keys(data3.data)[0];
          const newData = data3.data[newKey];

          if (
            newData.key == data.key ||
            newData.table_name === data.label.toLowerCase()
          ) {
            Object.assign(data2, data3); // Replace the response
          }
        }
      } catch (retryError) {
        // Retry attempt failed
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
        key.toLowerCase() === data.label.toLowerCase() ||
        key.toLowerCase() === tabelName ||
        data2.data[key].key == data.key
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

  // Update variables
  variables = variablesWithoutId;

  // Filter tambahan untuk checkbox (hilangkan 'id' dan 'userid')
  const excludedFields = [ "userid"];
  const filteredVariables = variables.filter(
    (variable) => !excludedFields.includes(variable.toLowerCase())
  );

  const natVariabel = {
    table_name: tableData.table_name,
    key: tableData.key,
    label: data.label,
    modalId: "createModal_" + tableData.key + "_" + data.label,
    original_data_key: data.key,
    original_data_label: data.label,
    variables: variables, // semua variabel dengan 'id' terakhir
    variablesOri: variables, // semua variabel dengan 'id' terakhir
    variables_count: variables.length,
    variables_filtered: filteredVariables, // tanpa id & userid
    variables_checkbox: filteredVariables.slice(0, 5), // 5 pertama pre-selected
    variables_filtered_count: filteredVariables.length,
  };

  return natVariabel;
}
