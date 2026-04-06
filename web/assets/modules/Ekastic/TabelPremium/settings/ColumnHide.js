
export async function ColumnHide(token) {
    const Sdk = new NXUI.Buckets(token);
  const dataform = await Sdk.storage();

  const checkedItems = await Sdk.getFields("tabel") || [];
  const result = checkedItems.filter(item => item.name !== 'id') // Filter out field 'id'
    .map(item => ({
        failed: item.name,
        label: item.placeholder,
        columnHide: item.columnHide ?? false
    }));


  const switchItems = result.map((item, index) => {
    const switchId = `switch-transform-${token}-${item.failed}-${index}`;
    const isChecked = item.columnHide  ? 'checked' : '';
    return `
     <div style="margin-bottom:10px;">
       <div class="nx-switch-item">
         <input type="checkbox"class="${item.failed}"  name="columnHide" id="${switchId}" ${isChecked} />
         <label for="${switchId}">
           <span class="nx-switch"></span>
           ${item.label}
         </label>
       </div>
     </div>
    `;
  }).join('');
  
  const modalID = "ColumnHide" + token;
  
  NXUI.formModal({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: "Pilih Field Font Style",
    floating: false,
    content: switchItems,
  });

  console.log('label:', dataform);
  NXUI.nexaModal.open(modalID);
  await setCheckbox(Sdk)
}


export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();
    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();
     
      // if (["inline", "filtering", "modal", "hidden"].includes(element?.name)) {
         await store.upField({
           [element.class]: {
             [element.name]: element.checked,
           },
         });
            if (typeof window.refreshUITable === 'function') {
            await window.refreshUITable();
          }

    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();

  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}