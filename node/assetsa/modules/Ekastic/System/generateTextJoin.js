import { metaIndex } from "../Metadata/Field.js";
export async function generateText(modalId, storeKey) {
  try {
    const data = await NXUI.ref.get(storeKey.store, storeKey.id);
    // Format creation date for display
    console.log(data.variables);

    // Get existing form data to avoid overwriting
    const existingForm = data.form || {};
    const newForm = generateExtract(data.variables);

    // Create a set of current variable names for quick lookup
    const currentVariableNames = new Set(data.variables);

    // Filter existing form to only keep variables that are still in data.variables
    const filteredExistingForm = {};
    Object.keys(existingForm).forEach((key) => {
      // Check if this form field corresponds to a variable that still exists
      const variableName = key.split("-").pop(); // Get the last part after splitting by '-'
      if (
        currentVariableNames.has(variableName) ||
        data.variables.includes(key)
      ) {
        filteredExistingForm[key] = existingForm[key];
      }
    });

    // Merge filtered existing form data with new form data
    const mergedForm = { ...filteredExistingForm, ...newForm };

    const metadata = {
      form: mergedForm,
      timestamp: new Date().toISOString(),
    };
    await NXUI.ref.mergeData(storeKey.store, storeKey.id, metadata);
    // NXUI.nexaModal.close(modalId);
    if (window.nexaStoreInstance) {
      // Reload stored data
      await window.nexaStoreInstance.loadStoredData();

      // Trigger UI refresh
      if (window.nexaStoreInstance.onDataLoaded) {
        window.nexaStoreInstance.onDataLoaded();
      }
    }
  } catch (error) {
    // Delete operation failed
  }
}
export function generateExtract(variables, type, className) {
  const timestamp = new Date().toISOString();
  const extrak = {};

  variables.forEach((name) => {
    let key = name;

    if (type === "join") {
      key = className + "-" + name; // contoh: "petani_nama"
    }
    const datKey = metaIndex(name.split("-")[0]);
    extrak[key] = {
      type: "text",
      icons: "attach_file",
      columnWidth: "nx-col-12",
      name: name,
      failed: name.split("-")[1],
      label: name,
      key: Number(datKey?.key),
      fieldAlias: name.split("-")[1],
      placeholder: name.split("-")[1],
      validation: 2,
      timestamp: timestamp,
      control: "",
      search: false,
      tabel: true,
      condition: false,
      modal: false,
      filtering: false,
      inline: false,
      hidden: false,
      readonly: false,
    };
  });

  return extrak;
}
