import { renderinguiNested } from "./index.js";

export async function Nestedform(Sdk,variabel) {
  try {
     // console.log('data:', data);
     // const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

    const fields = await Sdk.Fields();
    const  checkedItems = await Sdk.getFields("nested") || [];
  
    const actichecked = storage.handler?.[variabel]?.origin || [];
    console.log('actichecked:', actichecked);

      let itemHtml = "";
  if (fields && fields.length > 0) {
    for (const row of fields) {
      const failedName =row.name;
      // Skip field dengan key 'id'
      if (failedName === 'id') continue;
      
      const checkedAttr = actichecked.includes(failedName) ? "checked" : "";
      itemHtml += `
        <div class="nx-switch-grid">
          <div class="nx-switch-item mb-10px pl-10px">
            <input class="nested" name="${failedName}" type="checkbox" id="public_${failedName}"${checkedAttr}/>
            <label for="public_${failedName}">
              <span class="nx-switch"></span>
              ${row.failedtabel}
            </label>
          </div>
        </div>
      `;
    }
  }
      setTimeout(async () => {
       try {
         await setNestedCheckbox(Sdk,variabel);
       } catch (error) {
         console.error("❌ Error initializing drag and drop:", error);
       }
     }, 100);
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
// Flag untuk mencegah multiple callback checkbox
let checkboxCallbackActive = false;

export async function setNestedCheckbox(store,variabel) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      // Mencegah multiple callback bersamaan
      if (checkboxCallbackActive) {
        console.log("⏸️ Skip checkbox callback: Already processing...");
        return;
      }

      try {
        checkboxCallbackActive = true;
        const storage = await store.storage();
        // Handle checkbox kondisi field
        console.log('label:', element);
        await store.upField({
           [element.name]: {
             nested: element.checked,
           },
         });
        const  checkedItems = await store.getFields("nested") || [];
        const result = [...checkedItems.map(item => item.name), 'id'];
        const result2 = [...checkedItems.map(item => item.name)];
        await store.upIndex({
           handler: {
             [variabel]: {
               length:result2.length,
               origin:result2,
               data:result,
             
             },
           },
         });
        // Delay sedikit sebelum re-render untuk mencegah race condition
        await new Promise(resolve => setTimeout(resolve, 50));
        const finalStorage = await store.storage();
        await renderinguiNested(finalStorage);
      } catch (error) {
        console.error("❌ Error in setNestedCheckbox callback:", error);
      } finally {
        // Reset flag setelah selesai
        setTimeout(() => {
          checkboxCallbackActive = false;
        }, 200);
      }
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    checkboxCallbackActive = false;
  }
}
