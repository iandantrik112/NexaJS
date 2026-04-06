export async function initStorage(data) {
   const Sdk = new NXUI.Buckets(data.id);

	 const database =data.settings?.storage === "database" && data.settings?.storage ? "checked" : "";
	 const indexedDB =data.settings?.storage === "indexedDB" && data.settings?.storage ? "checked" : "";
	 const firebase =data.settings?.storage === "firebase" && data.settings?.storage ? "checked" : "";
    setTimeout(async () => {
      try {
      await stgCheckbox(Sdk)
  } catch (error) {
  }
})


 return `
<div class="nx-row">
    <div class="nx-col-4">

 <div class="grid-item">
      <div class="grid-icon">
        <span class="material-symbols-outlined">storage</span>
      </div>
      <div class="grid-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="grid-title">SQL Database</h3>
          <div class="nx-switch-item">
            <input type="checkbox" id="switch1"name="database"  ${database}/>
            <label for="switch1">
              <span class="nx-switch"></span>
            </label>
          </div>
        </div>
        <p class="grid-description">Database relasional untuk menyimpan data terstruktur dengan transaksi ACID</p>
      </div>
    </div>
    </div>
    <div class="nx-col-4">
 <div class="grid-item">
      <div class="grid-icon">
        <span class="material-symbols-outlined">database</span>
      </div>
      <div class="grid-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="grid-title">IndexedDB</h3>
          <div class="nx-switch-item">
            <input type="checkbox" id="switch2"name="indexedDB" ${indexedDB} />
            <label for="switch2">
              <span class="nx-switch"></span>
            </label>
          </div>
        </div>
        <p class="grid-description">Database client-side untuk menyimpan data terstruktur dengan kapasitas besar</p>
      </div>
    </div>
    </div>
        <div class="nx-col-4">
 <div class="grid-item">
      <div class="grid-icon">
        <span class="material-symbols-outlined">cloud</span>
      </div>
      <div class="grid-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="grid-title">Firebase</h3>
          <div class="nx-switch-item">
            <input type="checkbox" id="switch3" name="firebase" ${firebase} />
            <label for="switch3">
              <span class="nx-switch"></span>
            </label>
          </div>
        </div>
        <p class="grid-description">Database cloud real-time untuk aplikasi modern dengan skalabilitas tinggi</p>
      </div>
    </div>
    </div>
</div>
`;
}

export async function stgCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();
    
    // Tambahkan event listener untuk memastikan hanya satu checkbox yang bisa dipilih
    setTimeout(() => {
      const checkboxes = document.querySelectorAll('input[name="database"], input[name="indexedDB"], input[name="firebase"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          if (this.checked) {
            // Uncheck semua checkbox lainnya
            checkboxes.forEach(otherCheckbox => {
              if (otherCheckbox !== this) {
                otherCheckbox.checked = false;
              }
            });
          }
        });
      });
    }, 100);
    
    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
    
      
         const data = await store.upSettings({
           storage: element.name,
         });
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();

    // Inisialisasi fungsi pencarian
    // await initSearchFunctionality();
  } catch (error) {
  }
}