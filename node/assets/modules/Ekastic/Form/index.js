import { newIcon } from "./newIcon.js";
import { setIconSelector } from "../Icon/Icon.js";

// import { initForm } from "./config.js"; 
export async function formSDKStuktur(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
          const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 230, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="formSDKStuktur">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Form </h3>  
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
          content: [
            await formAccordion(Sdk),
            await settingsTable(Sdk,height),
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
        // Update field dengan nilai baru berdasarkan fieldName
          await store.upField({
            [variable]: {
              [fieldName]: newValue,
            },
          });
         if (["select", "radio","checkbox","switch"].includes(newValue)) {
            await store.upField({
              [variable]: {
                type: newValue,
                select: true,
                search: false,
              },
            });
        } 
         if (["search"].includes(newValue)) {
            await store.upField({
              [variable]: {
                type: newValue,
                search: true,
                select: false,
              },
            });
        } 

         if (["file"].includes(newValue)) {
            await store.upField({
              [variable]: {
                type: 'file',
                upload: true,
                fieldAccept: ".jpg,.png,.pdf,.docx",
                fieldMultiple: false,
                fieldImporting: false,
                fileUploadSize: "5MB",
              },
            });
        } 

        // Re-render form setelah perubahan
        await renderingformSDKStuktur(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}

export async function formAccordion(Sdk) {
  const storage = await Sdk.storage();
  const checkedModelAttr =
    storage.settings.model === "Content" && storage.settings.model
      ? "checked"
      : "";

  // Set atribut checked untuk model Modal berdasarkan pengaturan storage
  const checkedModelModalAttr =
    storage.settings.model === "Modal" && storage.settings.model
      ? "checked"
      : "";

  return {
    title: "Properties",
    col: "nx-col-12",
    footer: false,
    html: `
     <div class="nx-row pt-10px">
      <div class="nx-col-12">
       <div class="nx-switch-grid mb-3 pl-10px">
        <div class="nx-switch-item">
          <input type="checkbox" id="Content" name="model"value="Content" ${checkedModelAttr} />
          <label for="Content">
            <span class="nx-switch"></span>
              <strong>View Content</strong>
          </label>
        </div>
        <div class="nx-switch-item">
          <input type="checkbox" id="Modal" name="model"value="Modal"  ${checkedModelModalAttr}/>
          <label for="Modal">
            <span class="nx-switch"></span>
              <strong>View Modal</strong>
          </label>
        </div>
      </div>
    </div>
    </div>
    `,
  };
}
export async function settingsTable(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("condition");
  let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-3">
  <thead>
    <tr>
      <th class="text-center">Icons</th>
      <th>Type</th>
      <th>Label</th>
      <th>Colom</th>
      <th class="text-center">Validasi</th>
      <th class="text-center">Hidden</th>
      <th class="text-center">Readonly</th>
    </tr>
  </thead>
  <tbody>
    ${
      checkedItems
        ? checkedItems
            .map(
              (item, index) => `

      <tr>
      <td  class="text-center" >
      <a onclick="selectDataTypeIconformSDKStuktur('${item.name}','${storage.id}');" href="javascript:void(0);">
       <span class="material-symbols-outlined nx-icon-md">${newIcon(item.type,item.icons)}</span>
       </a>
     </td>
      <td>
  <div id="${
    item.name
  }"type="select" class="editable" name="type" data-options="${
                item.type
              }|text|hidden|email|password|number|tel|url|search|date|time|textarea|select|radio|checkbox|switch|file|range|color|flag|currency|instansi">${
                item.type
              }</div></td>
        <td> 
         <span id="${
           item.name
         }" type="text" class="editable" data-min-length="5" name="placeholder">${
                item.placeholder
              }</span>
          </td>
        <td>


        <div id="${
          item.name
        }"type="select" class="editable" name="columnWidth" data-options="${
                item.columnWidth
              }|nx-col-12|nx-col-11|nx-col-10|nx-col-9|nx-col-8|nx-col-7|nx-col-6|nx-col-5|nx-col-4|nx-col-3">${
                item.columnWidth
              }</div>

         
       </td>
        <td class="text-center">
         <div id="${
           item.name
         }" type="number" class="editable" data-min-length="1" name="validation">${
                item.validation
              }</div></td>
             <td class="text-center">
             <div class="nx-switch-grid pl-20px">
              <div class="nx-switch-item">
                <input class="${
                  item.name
                }" name="hiddenForm" type="checkbox" id="hiddenForm_${item.name}${index}"${item.hiddenForm ? "checked" : ""}/>
                <label for="hiddenForm_${item.name}${index}">
                  <span class="nx-switch"></span>
                </label>
              </div>
            </div>
            </td>
            <td class="text-center">
                  <div class="nx-switch-grid pl-20px">
                    <div class="nx-switch-item">
                      <input class="${
                        item.name
                      }" name="readonly" type="checkbox" id="readonly_${
                item.name
              }${index}"
                       ${item.readonly ? "checked" : ""}
                      />
                      <label for="readonly_${item.name}${index}">
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
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${checkedItems.length} Failed dari ${storage.priority} tabel</small>`,
    html: `
     <div  style="padding-top:4px">
       ${tabelHtml}
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
      const checkedAttr = row.condition ? "checked" : "";
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


  //
  // height:350px;
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
    <div style="padding-top:20px">
     ${itemHtml}
     </div>
    `,
  };
}

export async function renderingformSDKStuktur(store) {
  await NXUI.NexaRender.refresh(store, formSDKStuktur, {
    containerSelector:"#formSDKStuktur",
  });
}
export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();
      // Handle checkbox kondisi field
      if (element.class == "condition") {
        await store.upField({
          [element.name]: {
            condition: element.checked,
          },
        });

          await renderingformSDKStuktur(storage);
      } else {
        const getaFields = await store.form();

        // Handle checkbox hidden field
        if (element.name == "hiddenForm") {
          if (element.checked) {
            // Set field sebagai hidden dengan icon visibility_off
            await store.upField({
              [element.class]: {
                hiddenForm:element.checked,
                icons: "visibility_off",
              },
            });
          } else {
            // Set field sebagai text dengan icon attach_file
            await store.upField({
              [element.class]: {
                hiddenForm:false,
                icons: "attach_file",
                select:false,
              },
            });
          }
          await renderingformSDKStuktur(storage);
        }
        // Handle checkbox readonly field
        else if (element.name == "readonly") {
          await store.upField({
            [element.class]: {
              [element.name]: element.checked,
            },
          });
          await renderingformSDKStuktur(storage);
        }
        // Handle checkbox model view (Content/Modal)
        else {
          if (element.checked) {
            if (element.id == "Content") {
              // Tampilkan accordion preview untuk Content view
              NXUI.id("accordion" + storage.className).show();
            } else {
              // Sembunyikan accordion preview untuk Modal view
              NXUI.id("accordion" + storage.className).hide();
            }
            // Update pengaturan model
            const data = await store.upSettings({
              model: element.id,
            });
          } else {
            // Reset ke model Default dan sembunyikan accordion
            const data = await store.upSettings({
              model: "Default",
            });
            NXUI.id("accordion" + storage.className).hide();
          }
          await renderingformSDKStuktur(storage);
        }
      }
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


nx.selectDataTypeIconformSDKStuktur =async function (failed,id) {
  return  setIconSelector(failed,id)
};



nx.addIconItemSDKStuktur =async function (icon,variables,id) {
   NXUI.nexaModal.close("iconSelectorModal_"+variables);
     console.log(icon,variables,id)
    const Sdk = new NXUI.Buckets(id);
    const storage = await Sdk.storage();
           await Sdk.upField({
              [variables]: {
                icons: icon,
              },
            });
    await renderingformSDKStuktur(storage);
}
