

export async function setFailed(data) {
  try {
     console.log('data:', data);
     const Sdk = new NXUI.Buckets(data.id);
     const storage = await Sdk.storage();
     const fields = await Sdk.Fields();
     await setCheckbox(Sdk);
      let itemHtml = "";
  // console.log(fields.length);
  // Generate HTML untuk setiap field dengan checkbox kondisi tanpa for loop
  if (fields && fields.length > 0) {
    for (const row of fields) {
      const checkedAttr = row?.nested ? "checked" : "";
      const failedName = row.fieldAlias ?? row.name;
      itemHtml += `
        <div class="nx-switch-grid">
          <div class="nx-switch-item mb-10px pl-10px">
            <input class="condition" name="${failedName}" type="checkbox" id="public_${failedName}"${checkedAttr}/>
            <label for="public_${failedName}">
              <span class="nx-switch"></span>
              ${row.failedtabel}
            </label>
          </div>
        </div>
      `;
    }
  }
  
    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
    return `
     <div style="padding-top:20px">
        ${itemHtml}
     </div>


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
export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();
      // Handle checkbox kondisi field
      console.log('label:', element);
        // await store.upField({
        //   [element.name]: {
        //     condition: element.checked,
        //     from: element.checked,
        //   },
        // });

  
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}
