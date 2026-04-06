
export async function setInsert(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
      const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 210, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Insert</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setTabelNav">
         <div class="nx-row" id="nxdrop"></div>
      </div>
    `
    );

    setTimeout(async () => {
      try {
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaDrag({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        const template = render.Container({
          container: "#nxdrop",
          content: [await Aplikasi(Sdk,height), await Guide(height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
         await setCheckbox(Sdk);
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function Aplikasi(Sdk,height) {
     const storage = await Sdk.storage();
     const fields = await Sdk.Fields();
    const  checkedItems = await Sdk.getFields("insert") || [];
    console.log('label:', checkedItems);
    const result = [...checkedItems.map(item => item.name), 'id'];
console.log('result:', result);
 
const filteredStorage = NXUI.NexaFormKey.include(storage, result);
console.log('label:', filteredStorage);

  let itemHtml = "";
  if (fields && fields.length > 0) {
    for (const row of fields) {
      const failedName = row.fieldAlias ?? row.name;
      // Skip field dengan key 'id'
      if (failedName === 'id') continue;
      
      const checkedAttr = row?.insert ? "checked" : "";
      itemHtml += `
        <div class="nx-switch-grid">
          <div class="nx-switch-item mb-10px pl-10px">
            <input class="insert" name="${failedName}" type="checkbox" id="public_${failedName}"${checkedAttr}/>
            <label for="public_${failedName}">
              <span class="nx-switch"></span>
              ${row.failedtabel}
            </label>
          </div>
        </div>
      `;
    }
  }

  return {
    title: "Properti",
    col: "nx-col-8",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${
      checkedItems.length || "0"
    } Field dipilih dari ${fields?.length || "0"} field</small>`,
    html: itemHtml,
  };
}

export async function Guide(height) {
  return {
    title: "Panduan",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Pilih field yang akan muncul 
    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Konfigurasi Field Insert</strong>
              <p class="mb-2">Lihat tabel "Properti" untuk melihat semua field yang tersedia. Aktifkan checkbox pada field yang ingin ditampilkan di form Insert.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Aktifkan/Nonaktifkan Field</strong>
              <p class="mb-2">Gunakan switch/checkbox di setiap field untuk:<br>
              • <strong>Aktifkan:</strong> Field akan muncul di form Insert<br>
              • <strong>Nonaktifkan:</strong> Field tidak akan ditampilkan di form Insert<br>
              • Field dengan key 'id' secara otomatis tidak ditampilkan</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Auto Save</strong>
              <p class="mb-2">Perubahan konfigurasi akan otomatis tersimpan saat Anda:<br>
              • Mengaktifkan atau menonaktifkan checkbox field<br>
              • Konfigurasi langsung terupdate ke storage<br>
              • Index insert akan otomatis diperbarui</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Field yang Direkomendasikan</strong>
              <p class="mb-2">• Pilih field yang relevan untuk form insert<br>
              • Hindari field sistem yang tidak perlu diisi user<br>
              • Field dengan tipe auto-increment biasanya tidak perlu dimasukkan</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}
export async function rendering(store) {
  // Ambil data storage terbaru
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, setTabelNav, {
    containerSelector: ["#setTabelNav"],
  });
}

export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();
      console.log('label:', element);
      // Handle checkbox kondisi field
        // if (true) {}
           await store.upField({
             [element.name]: {
               insert: element.checked,
             },
           });

    const  checkedItems = await store.getFields("insert") || [];
    const result = [...checkedItems.map(item => item.name)];
          await store.upIndex({
           insert:result,
         });
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}
