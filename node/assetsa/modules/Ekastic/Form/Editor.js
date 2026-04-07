export async function setEditor(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
      const dimensi = new NXUI.NexaDimensi();

  const height = dimensi.height("#nexa_app", 220, 'vh');
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="hendelModalEditor">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Textarea editor and rich</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div  class="pr-10px nx-scroll-hidden"style="height:600px">
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
          </div>
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
          content: [await editorandrich(Sdk,height), await konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
         await tabelEdit(Sdk);


      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function editorandrich(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("textarea");
  const objKey=Object.keys(storage?.form).join('|') + '|';
  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th class="text">Type</th>
      <th>Failed</th>
      <th>Label</th>
      <th>Bubbling</th>
      <th>Limit</th>
      <th>Height</th>
      <th class="text-center"></th>
    </tr>
  </thead>
  <tbody>
    ${
      checkedItems
        ? checkedItems
            .map(
              (item, index) => `

      <tr>
      <td  class="text">
                       <span class="material-symbols-outlined nx-icon-md">${NXUI.getIconByType(item.type)}</span> ${item.type}
        
     </td>
     <td>${item.failedtabel}</td>
     <td>${item.placeholder}</td>

     <td>

  <div id="${
    item.name
  }"type="select" class="editable" name="bubbling" data-options="${objKey}|null">${item?.bubbling || 'null'}</div></td>
        </td> 


     <td>
        <div id="${item.name}" type="number" class="editable" data-min-length="1" name="limit">${item?.limit|| 0}</div>
     </td>
     <td>
        <div id="${item.name}" type="number" class="editable" data-min-length="1" name="height">${item?.height|| 0}</div>
     </td>
     <td class="text-center">
       <a  href="javascript:void(0);" onclick="deleteFaildEditor('${item.name}','${
                storage.id
              }')" title="Hapus item" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">delete</span>
         </a>
     </td>
   

     
      
       </tr>
    `
            )
            .join("")
        : "<tr></tr>"
    }
  </tbody>
</table>

   `;


  return {
    title: "Properti",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${
      checkedItems.length || "0"
    } Failed dari ${storage.priority} tabel</small>`,
    html: `
     <div style="padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}


export async function tabelEdit(store) {
  try {
    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        // Update field dengan nilai baru berdasarkan fieldName
          await store.upField({
            [variable]: {
              [fieldName]: newValue,
            },
          });
        // Re-render form setelah perubahan
        await renderingEditorSelectTags(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error renderingEditor form:", error);
  }
}
export async function konfigurasi(data,height) {
  return {
    title: "Panduan Metadata Editor",
    col: "nx-col-4",
          scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Field Editor Perlu dikonfigurasi

    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Identifikasi Field Editor</strong>
              <p class="mb-2">Lihat tabel "Properti" untuk field textarea/editor yang telah dikonfigurasi. Kolom menampilkan informasi Type, Failed, Label, Bubbling, Limit, dan Option untuk setiap field editor.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Konfigurasi Bubbling</strong>
              <p class="mb-2">Kolom <strong>Bubbling</strong> dapat diedit inline dengan cara:<br>
              • Klik langsung pada nilai Bubbling di tabel<br>
              • Pilih field name dari dropdown yang tersedia<br>
              • Nilai ini menentukan field mana yang akan digunakan untuk bubbling event<br>
              • Pilih "null" untuk menonaktifkan bubbling</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Konfigurasi Limit</strong>
              <p class="mb-2">Kolom <strong>Limit</strong> dapat diedit inline dengan cara:<br>
              • Klik langsung pada nilai Limit di tabel<br>
              • Input angka untuk membatasi panjang karakter<br>
              • Minimum 1 karakter<br>
              • Nilai ini membatasi jumlah karakter yang dapat diinput di editor</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Inline Editing</strong>
              <p class="mb-2">Semua perubahan pada Bubbling dan Limit akan otomatis tersimpan saat Anda:<br>
              • Mengklik di luar elemen yang sedang diedit<br>
              • Menekan Enter setelah mengisi nilai<br>
              • Perubahan langsung terupdate ke storage</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5.Manajemen Field</strong>
              <p class="mb-2">• <span class="material-symbols-outlined nx-icon-sm">delete</span> <strong>Delete:</strong> Hapus field editor yang tidak diperlukan<br>
              • Field yang dihapus akan dikonversi kembali ke type 'text'<br>
              • Konfigurasi editor (bubbling, limit) akan hilang secara permanen</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

export async function renderingEditor(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, hendelModalEditor, {
    containerSelector: ["#hendelModalEditor"],
  });
}

nx.deleteFaildEditor = async function (failed, tabel) {
  const Sdk = new NXUI.Buckets(tabel);
  const storage = await Sdk.storage();
  await Sdk.upField({
    [failed]: {
      textarea:false,
    },
  });
  await renderingEditorSelectTags(storage);
};

export async function renderingEditorSelectTags(store) {
  await NXUI.NexaRender.refresh(store, setEditor, {
    containerSelector: "#hendelModalEditor",
  });
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}
