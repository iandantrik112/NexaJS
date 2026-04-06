import { getIconByType } from "../Icon/index.js";

// Function to convert file extensions to user-friendly labels
function getFileTypeLabels(extensions) {
  if (!extensions || typeof extensions !== "string") {
    return "Semua file";
  }

  const extensionMap = {
    // Images
    ".jpg": "Gambar",
    ".jpeg": "Gambar",
    ".png": "Gambar",
    ".gif": "Gambar",
    ".webp": "Gambar",
    ".bmp": "Gambar",
    ".svg": "Gambar",

    // Documents
    ".pdf": "PDF",
    ".doc": "Word",
    ".docx": "Word",
    ".xls": "Excel",
    ".xlsx": "Excel",
    ".ppt": "PowerPoint",
    ".pptx": "PowerPoint",
    ".txt": "Text",
    ".rtf": "Text",

    // Data
    ".csv": "CSV",
    ".xml": "XML",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",

    // Archives
    ".zip": "Archive",
    ".rar": "Archive",
    ".7z": "Archive",
    ".tar": "Archive",
    ".gz": "Archive",
  };

  // Split extensions and map to labels
  const extList = extensions.split(",").map((ext) => ext.trim());
  const labels = extList.map(
    (ext) =>
      extensionMap[ext.toLowerCase()] || ext.replace(".", "").toUpperCase()
  );

  // Remove duplicates and join
  const uniqueLabels = [...new Set(labels)];

  if (uniqueLabels.length <= 3) {
    return uniqueLabels.join(", ");
  } else {
    return `${uniqueLabels.slice(0, 2).join(", ")} +${
      uniqueLabels.length - 2
    } lainnya`;
  }
}
export async function setUpload(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
          const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app",140, 'vh');
   
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `

     <div id="hendelUpload">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Upload</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div >
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
          content: [await Failed(Sdk,height), await Konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        await tabelEdit(Sdk);
        await setCheckboxUpload(Sdk);
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function Failed(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("upload");
  console.log('checkedItems:', checkedItems);
  console.log(checkedItems);

  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-1">
  <thead>
    <tr>
      <th class="text">Type</th>
      <th>Failed</th>
      <th>Label</th>
      <th>Accept</th>
      <th>Size</th>
      <th class="text-center">Import</th>
      <th class="text-center">Media</th>
      <th class="text-center">Role</th>
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
       <span class="material-symbols-outlined nx-icon-md">${getIconByType(
         item.type
       )} </span> ${item.type}
     </td>
     <td>${item.name}</td>
     <td>${item.placeholder}</td>
     <td>
       <span class="nx-badge nx-badge-sm nx-badge-outline-primary">
         ${getFileTypeLabels(item.fieldAccept)}
       </span>
     </td>
     <td>
      <span id="${
        item.name
      }" type="text" class="editable" data-min-length="2" name="fileUploadSize">${
                item.fileUploadSize
              }</span>


    </td>
     <td>
        
             <div class="nx-switch-item">
               <input class="${
                 item.name
               }" name="fieldImporting" type="checkbox" id="importing_${
                item.name
              }${index}"${item.fieldImporting ? "checked" : ""}/>
               <label for="importing_${item.name}${index}">
                 <span class="nx-switch"></span>
               </label>
             </div>
          
       </td>

     <td>
     
             <div class="nx-switch-item">
               <input class="${
                 item.name
               }" name="fieldMedia" type="checkbox" id="fieldMedia_${
                item.name
              }${index}"${item.fieldMedia ? "checked" : ""}/>
               <label for="fieldMedia_${item.name}${index}">
                 <span class="nx-switch"></span>
               </label>
             </div>
        
       </td>





     <td class="text-center">
       <a  href="javascript:void(0);" onclick="deleteFaildUpload('${
         item.name
       }','${storage.id}')" title="Hapus item" style="color:#ccc" >
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
    footer: `<small class="text-muted">${checkedItems.length} Failed dari ${storage.priority} tabel</small>`,
    html: `
     <div style="padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}
export async function tabelEdit(store,height) {
  try {
    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        await store.upField({
          [variable]: {
            [fieldName]: newValue,
          },
        });

        // await renderingForm(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}

export async function setCheckboxUpload(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();
      console.log(element);
      if (element.name=="fieldMedia") {
       await store.upField({
          [element.class]: {
            fieldMedia: element.checked,
            fieldAccept: element.checked
              ? ".jpg,.jpeg,.png"
              : ".pdf,.docx,.xls,.xlsx,.csv",
          },
        });
      } else {
       await store.upField({
          [element.class]: {
            fieldImporting: element.checked,
            fieldAccept: element.checked
              ? ".xls,.xlsx,.csv"
              : ".pdf,.docx,.xls,.xlsx,.csv",
          },
        });
      }
           await renderingUpload(storage);
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

export async function Konfigurasi(data,height) {
  return {
    title: "Konfigurasi Upload",
    col: "nx-col-4",
          scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `        
     <small>
       <strong>💡 Tips:</strong> Field upload dapat dikonfigurasi<br>
       <strong>
     </small>`,
    html: `
      <div  style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>1.Identifikasi Field Upload</strong>
              <p class="mb-1">Lihat tabel "Properti" untuk field upload yang perlu dikonfigurasi.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>2.Edit File Size</strong>
              <p class="mb-1">Klik pada kolom "Size" untuk mengedit ukuran maksimal file yang diizinkan.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>3.Toggle Import Mode</strong>
              <p class="mb-1">Aktifkan switch "Import" untuk mengubah mode upload menjadi import data (.xls,.xlsx,.csv).</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>4.File Type Auto-Change</strong>
              <p class="mb-1">Ketika Import aktif, file type otomatis berubah ke Excel/CSV. Jika tidak aktif, default ke gambar/dokumen.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>5.Inline Editing</strong>
              <p class="mb-1">Semua perubahan tersimpan otomatis tanpa perlu klik tombol save.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>6.Hapus Field Upload</strong>
              <p class="mb-1">Klik tombol delete (🗑️) untuk menghapus field upload yang tidak diperlukan.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

export async function renderingUpload(store) {
  await NXUI.NexaRender.refresh(store, setUpload, {
    containerSelector: ["#hendelUpload"],
  });
}

nx.deleteFaildUpload = async function (failed, tabel) {
  const Sdk = new NXUI.Buckets(tabel);
  const storage = await Sdk.storage();
  await Sdk.upField({
    [failed]: {
      type: "text",
      upload: false,
      fieldAccept: false,
      fieldMultiple: false,
      fieldImporting: false,
      fileUploadSize: false,
    },
  });
  await renderingUpload(storage);
};
