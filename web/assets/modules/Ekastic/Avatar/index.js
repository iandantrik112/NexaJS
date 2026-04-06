import { getIconByType } from "../Icon/index.js";
// import { setIconSelector } from "../Icon/Icon.js";

// import { initForm } from "./config.js"; 
export async function setAvatar(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
          const dimensi = new NXUI.NexaDimensi();
const height = dimensi.height("#nexa_app", 140, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="renderingFormAvatar">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Avatar</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
          
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
        
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
          content: [
            // await formAccordion(Sdk),
            await settingsAvatar(Sdk,height),
            await Failed(Sdk,height),
          ],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        await tabelEdit(Sdk);
        await setCheckbox(Sdk);

        await initSearchFunctionality();
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}


export async function tabelEdit(store) {
  try {
    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        console.log(variable, newValue);
        // Update field dengan nilai baru berdasarkan fieldName
        //   await store.upField({
        //     [variable]: {
        //       [fieldName]: newValue,
        //     },
        //   });
        //  if (["select", "radio","checkbox","switch"].includes(newValue)) {
        //     await store.upField({
        //       [variable]: {
        //         type: newValue,
        //         select: true,
        //         search: false,
        //       },
        //     });
        // } 
        //  if (["search"].includes(newValue)) {
        //     await store.upField({
        //       [variable]: {
        //         type: newValue,
        //         search: true,
        //         select: false,
        //       },
        //     });
        // } 

        //  if (["file"].includes(newValue)) {
        //     await store.upField({
        //       [variable]: {
        //         type: 'file',
        //         upload: true,
        //         fieldAccept: ".jpg,.png,.pdf,.docx",
        //         fieldMultiple: false,
        //         fieldImporting: false,
        //         fileUploadSize: "5MB",
        //       },
        //     });
        // } 

        // // Re-render form setelah perubahan
        // await renderingFormAvatar(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}


export async function settingsAvatar(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("avatar");
  console.log('checkedItems:', checkedItems);
//   avatarName
// avatarImg
  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-3">
  <thead>
    <tr>
      <th class="text-center1">Icons</th>
      <th>Failed</th>
      <th>Images</th>
      <th>Name</th>


    </tr>
  </thead>
  <tbody>
    ${
      checkedItems
        ? checkedItems
            .map(
              (item, index) => `

      <tr>
      <td  class="text-center1" >
       <span class="material-symbols-outlined nx-icon-md">${getIconByType(item.type,item.icons)}</span>
      </td>

        <td> 
         <span id="${
           item.name
         }" type="text" class="editable" data-min-length="5" name="placeholder">${
                item.placeholder
              }</span>
          </td>

             <td class="text-center1">
                  <div class="nx-switch-grid pl-3px">
                    <div class="nx-switch-item">
                      <input class="${item.name}" name="status"value="images" type="checkbox" id="images${index}" ${item?.avatarImg ? "checked" : ""}/>
                      <label for="images${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>
              </td>
   
             <td class="text-center1">
                  <div class="nx-switch-grid pl-3px">
                    <div class="nx-switch-item">
                      <input class="${item.name}" name="status"value="name" type="checkbox" id="names${index}" ${item?.avatarName ? "checked" : ""}/>
                      <label for="names${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>
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
    id: "Properti",
    title: "Properti",
        scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    col: "nx-col-8",
    footer: `<small class="text-muted">${checkedItems.length|| '0'} Failed dari ${storage.priority} tabel</small>`,
    html: `
     <div>
       ${tabelHtml}

     </div>
<div class="nx-alert nx-alert-primary">
      <h3>Panduan Penggunaan Fitur Avatar</h3>
      <div style="line-height: 1.8;">
        <p><strong>1. Mengaktifkan Avatar untuk Field</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>Pilih field yang ingin diaktifkan fitur avatar dari panel <strong>"Setting Failed"</strong> di sebelah kanan</li>
          <li>Aktifkan toggle switch pada field yang diinginkan</li>
          <li>Field yang aktif akan muncul di tabel <strong>"Properti"</strong></li>
        </ul>
        
        <p><strong>2. Konfigurasi Avatar</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li><strong>Icons:</strong> Klik icon untuk mengubah icon avatar yang ditampilkan</li>
          <li><strong>Failed:</strong> Klik pada teks "Failed" untuk mengedit placeholder/teks yang ditampilkan saat avatar tidak tersedia</li>
          <li><strong>Images:</strong> Aktifkan toggle untuk menampilkan gambar sebagai avatar</li>
          <li><strong>Name:</strong> Aktifkan toggle untuk menampilkan nama/teks sebagai avatar</li>
          <li><strong>Catatan:</strong> Hanya satu opsi (Images atau Name) yang dapat aktif pada satu waktu</li>
        </ul>
        
        <p><strong>3. Pencarian Field</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>Gunakan kotak pencarian di panel "Setting Failed" untuk mencari field secara cepat</li>
          <li>Atau gunakan shortcut keyboard <strong>Ctrl+F</strong> untuk fokus ke kotak pencarian</li>
          <li>Klik tombol clear (X) untuk menghapus filter pencarian</li>
        </ul>
        
        <p><strong>4. Tips</strong></p>
        <ul style="margin-left: 20px;">
          <li>Gunakan <strong>Images</strong> untuk menampilkan foto profil pengguna</li>
          <li>Gunakan <strong>Name</strong> untuk menampilkan inisial atau singkatan nama</li>
          <li>Pastikan placeholder (Failed) diisi dengan teks yang informatif</li>
        </ul>
      </div>
</div>
    `,
  };
}

export async function Failed(Sdk,height) {
  const storage = await Sdk.storage();
  // Ambil data fields dan items yang sudah dicek
  const fields = await Sdk.Fields();
  const checkedItems = await Sdk.getFields();
  let checkedItemsHtml = "";
  let itemHtml = "";
 
  // console.log(fields.length);
  // Generate HTML untuk setiap field dengan checkbox kondisi tanpa for loop
  if (fields && fields.length > 0) {
    for (const row of fields) {
     
      const checkedAttr = row?.avatar ? "checked" : "";
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
  return {
    title: "Setting Failed",
    col: "nx-col-4",
        scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `
      <small class="text-muted">${fields.length} Failed</small>
    `,
    html: `
    <div class="form-nexa-input-group">
      <div class="form-nexa-input-group-text">
        <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
      </div>
      <input type="text" 
             id="searchFormVariablesInput" 
             name="searchFormVariablesInput"
             class="form-nexa-control" 
             placeholder="Search Failed... (Ctrl+F)">
       <div class="form-nexa-input-group-text">
         <button type="button" 
                 class="nx-btn-secondary" 
                 style="background: none; border: none; padding: 4px; color: #6c757d;">
           <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
         </button>
       </div>
    </div>
    <div>
     ${itemHtml}
     </div>
    `,
  };
}

export async function renderingFormAvatar(store) {
  await NXUI.NexaRender.refresh(store, setAvatar, {
    containerSelector:"#renderingFormAvatar",
  });
}
export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();
      if (element.name == "status") {
            if (element.value=='images') {
                 await store.upField({
                   [element.class]: {
                     avatarName:false,
                     avatarStatus:element.value,
                     avatarImg:true,
                   },
                 });
            } else {
                 await store.upField({
                   [element.class]: {
                     avatarName:true,
                      avatarStatus:element.value,
                     avatarImg:false,
                   },
                 });
            }


      } else {
        await store.upField({
           [element.name]: {
             type: "avatar",
             avatar: element.checked,
             tabel: element.checked,
             avatarName:false,
             avatarImg:false,
             icons: "account_circle",
           },
         });
      }
     
      await renderingFormAvatar(storage);

    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

// Fungsi untuk inisialisasi pencarian Failed
export async function initSearchFunctionality() {
  try {
    const searchInput = document.getElementById("searchFormVariablesInput");
    const clearButton = document.querySelector(".nx-btn-secondary");

    if (searchInput) {
      // Event listener untuk pencarian real-time
      searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase().trim();
        filterFailedItems(searchTerm);
      });

      // Event listener untuk keyboard shortcut Ctrl+F
      document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "f") {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    if (clearButton) {
      // Event listener untuk tombol clear
      clearButton.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
          filterFailedItems("");
        }
      });
    }
  } catch (error) {
    console.error("❌ Search functionality initialization failed:", error);
  }
}

// Fungsi untuk memfilter item Failed berdasarkan pencarian
export function filterFailedItems(searchTerm) {
  try {
    const switchItems = document.querySelectorAll(".nx-switch-item");

    switchItems.forEach((item) => {
      const label = item.querySelector("label");
      if (label) {
        const text = label.textContent.toLowerCase();
        const isMatch = text.includes(searchTerm);

        // Tampilkan/sembunyikan item berdasarkan hasil pencarian
        item.style.display = isMatch ? "block" : "none";
      }
    });

    // Update counter jika ada
    updateSearchCounter(searchTerm);
  } catch (error) {
    console.error("❌ Filter failed items error:", error);
  }
}

// Fungsi untuk update counter hasil pencarian
export function updateSearchCounter(searchTerm) {
  try {
    const visibleItems = document.querySelectorAll(
      '.nx-switch-item[style*="block"], .nx-switch-item:not([style*="none"])'
    );
    const totalItems = document.querySelectorAll(".nx-switch-item");

    // Cari elemen counter dan update
    const counterElement = document.querySelector("small.text-muted");
    if (counterElement) {
      if (searchTerm) {
        counterElement.textContent = `${visibleItems.length} dari ${totalItems.length} Failed`;
      } else {
        counterElement.textContent = `${totalItems.length} Failed`;
      }
    }
  } catch (error) {
    console.error("❌ Update search counter error:", error);
  }
}


