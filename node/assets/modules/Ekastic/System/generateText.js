export async function generateText(modalId) {
  try {
    let storeKey = NXUI.FormIndexData;
    const data = await NXUI.ref.get(storeKey.store, storeKey.id);
    // Format creation date for display
    console.log(data.variables);

    // Get existing form data to preserve it
    const existingForm = data.form || {};
    const newFormFields = generateExtract(data.variables);

    // Merge existing form with new fields (only add new fields, don't overwrite existing ones)
    const mergedForm = { ...existingForm };

    // Only add fields that don't already exist
    Object.keys(newFormFields).forEach((key) => {
      if (!mergedForm.hasOwnProperty(key)) {
        mergedForm[key] = newFormFields[key];
      }
    });

    const metadata = {
      form: mergedForm,
      timestamp: new Date().toISOString(),
    };
    await NXUI.ref.mergeData(storeKey.store, storeKey.id, metadata);
    NXUI.nexaModal.close(modalId);
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
export function generateExtract(variables) {
  const timestamp = new Date().toISOString();
  const extrak = {};

  variables.forEach((name) => {
    let key = name;
    extrak[key] = {
      type: "text",
      icons: "attach_file",
      columnWidth: "nx-col-12",
      failed: name,
      fieldAlias: name,
      name: name,
      label: name,
      placeholder: name,
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
