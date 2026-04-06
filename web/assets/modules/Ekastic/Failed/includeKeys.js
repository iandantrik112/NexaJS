

export async function setFailed(data) {
  try {
     console.log('data:', data);
     const Sdk = new NXUI.Buckets(data.id);
     const storage = await Sdk.storage();
    console.log('label:', storage);
    const includeKeys = ['images'];
      const objKey=Object.keys(storage?.form).join('|') + '|';
    // Filter storage.form using FormKey class
    const filteredStorage = NXUI.NexaFormKey.include(storage, includeKeys);
    
    console.log('storage:', filteredStorage.form);
    console.log('storage:', filteredStorage);
     setTimeout(async () => {
       try {
      // Single instance untuk multiple tags
      // Contoh dengan data: false untuk mode bebas input
        await NXUI.NexaForm({
        elementById: "aner_" + storage.id,
        label: ``,
        getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
        getValidationBy: ["name"], // ✅ Standard validation approach
        setDataBy: filteredStorage, // ✅ Standard validation approach
        onclick: {
          title: "Submit",
          cancel: false,
          send: "saveAddForm", // ✅ Use namespaced function name
        },
        floating: filteredStorage,
        content: false,
      });

       } catch (error) {
         console.error("❌ Error initializing drag and drop:", error);
       }
     }, 100);
    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
    return `
          <div id="aner_${storage.id}"></div>


    `;
    
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return `
        <div class="alert alert-danger text-center">
            <h5>❌ Initialization Failed</h5>
            <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
        </div>
    `;
  }
}
