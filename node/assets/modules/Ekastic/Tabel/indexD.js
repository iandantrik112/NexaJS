import { getIconByType } from "../Icon/index.js";
export async function setTabelNav(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

    const checkedAccess =
      storage.access === "private" && storage.access ? "checked" : "";
    const checkedAccessTable = storage.settings.tablesettings ? "checked" : "";
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="renderTabelNav">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Metadata Tabel ${storage.className}</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
    <div class="nx-row pt-10px">
    <div class="nx-col-12">
       <div class="nx-switch-grid mb-3 pl-10px">
        <div class="nx-switch-item">
          <input class="transaction" type="checkbox" id="tablesettings" name="tablesettings" ${checkedAccessTable}/>
          <label for="tablesettings">
            <span class="nx-switch"></span>
              <strong>Tabel Reactive</strong>
          </label>
        </div>


        <div class="nx-switch-item">
          <input class="transaction" type="checkbox" id="uidaccess" name="access" ${checkedAccess}/>
          <label  for="uidaccess">
            <span class="nx-switch"></span>
              <strong>Tabel Access ${
                storage.access.charAt(0).toUpperCase() + storage.access.slice(1)
              }</strong>
          </label>
        </div>
      </div>
      </div>
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
            await propertiesTable(Sdk, data.id),
            await Failed(Sdk, data.id),
          ],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        await tabelEdit(Sdk);
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

export async function propertiesTable(Sdk, dataId) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("tabel");
  const dataform = await NXUI.ref.get(dataId);
  let tabelView = "";

  const tableItems = await Promise.all(
    storage.variables.map(async (row, index) => {
      if (storage.form[row] && storage.form[row].tabel) {
         // const checkedItems = await Sdk.getFields("tabel");
        const item = storage.form[row];
        const searchResult = await Sdk.searchKeys(row);
        return `
        <tr>
          <td class="text-center">
            <span class="material-symbols-outlined nx-icon-md">${getIconByType(
              item.type
            )}</span>
          </td>
          <td>${item.type}</td>
          <td>${searchResult}</td>
          <td>
            <div id="${
              item.name
            }" type="text" class="editable" data-min-length="5" name="placeholder">
              ${item.placeholder}
            </div>
          </td>
          <td class="align-right">
            <div class="nx-switch-grid pl-20px">
              <div class="nx-switch-item">
                <input class="${
                  item.name
                }" name="inline" type="checkbox" id="inline_${
          item.name
        }${index}" ${item.inline ? "checked" : ""}/>
                <label for="inline_${item.name}${index}">
                  <span class="nx-switch"></span>
                </label>
              </div>
            </div>
          </td>
        </tr>`;
      }
      return null;
    })
  );

  tabelView = tableItems.filter((item) => item !== null).join("");

  let tabelHtml = `
<table class="nx-table nx-table-sm mb-3">
  <thead>
    <tr>
      <th class="w-30px text-center">Icons</th>
      <th>Type</th>
      <th>Failed</th>
      <th>Thead Label</th>
      <th class="align-right">Inline</th>
    </tr>
  </thead>
  <tbody>
   ${tabelView}
  </tbody>
</table>

    `;
  return {
    title: "Properties",
    col: "nx-col-8",
    footer: `
      <small class="text-muted">${checkedItems.length} Failed dari ${storage.priority} tabel</small>
    `,
    html: `
     <div class="nx-scroll-hidden" style="max-height:448px;padding-top:4px">
       ${tabelHtml}
     </div>
    `,
  };
}

export async function Failed(Sdk, dataId) {
  const storage = await Sdk.storage();
  const dataform = await NXUI.ref.get(dataId);
  // Ambil data fields dan items yang sudah dicek
  const fields = await Sdk.Fields();
  const checkedItems = await Sdk.getFields();
  let checkedItemsHtml = "";
  let itemHtml = "";

  // Urutkan fields: yang sudah di-check di atas, yang belum di bawah
  const sortedFields = fields.sort((a, b) => {
    // Jika a.tabel true dan b.tabel false, a di atas (return -1)
    // Jika a.tabel false dan b.tabel true, b di atas (return 1)
    // Jika sama, pertahankan urutan asli (return 0)
    if (a.tabel && !b.tabel) return -1;
    if (!a.tabel && b.tabel) return 1;
    return 0;
  });

  // Generate HTML untuk setiap field dengan checkbox kondisi
  const itemPromises = sortedFields.map(async (row, index) => {
    const checkedAttr = row.tabel ? "checked" : "";
    const failedName = row.fieldAlias ?? row.name;
    const searchResult = await Sdk.searchKeys(row.name);
    return `
        <div class="nx-switch-grid">
          <div class="nx-switch-item mb-10px pl-10px">
            <input class="tabel" name="${failedName}" type="checkbox" id="public_${failedName}${row.index}"${checkedAttr}/>
            <label for="public_${failedName}${row.index}">
              <span class="nx-switch"></span>
             ${searchResult}
            </label>
          </div>
        </div>
    `;
  });

  const itemHtmlArray = await Promise.all(itemPromises);
  itemHtml = itemHtmlArray.join("");

  return {
    title: "Setting Failed",
    col: "nx-col-4",
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
             placeholder="Search Failed">
       <div class="form-nexa-input-group-text">
         <button type="button" 
                 class="nx-btn-secondary" 
                 style="background: none; border: none; padding: 4px; color: #6c757d;">
           <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
         </button>
       </div>
    </div>
    <div class="nx-scroll-hidden" style="height:405px;padding-top:20px">
     ${itemHtml}
     </div>
    `,
  };
}

export async function tabelEdit(store) {
  const nexaField = new NXUI.Field();
  nexaField.onSaveCallback(
    async (variable, newValue, element, type, fieldName) => {
      // Update field dengan nilai baru berdasarkan fieldName
      await store.upField({
        [variable]: {
          [fieldName]: newValue,
        },
      });

      // Re-render form setelah perubahan
      await rendering(store);
    }
  );

  // Aktifkan editing
  nexaField.initElements();
}
export async function renderingTabel(store) {
  await NXUI.NexaRender.refresh(store, setTabelNav, {
    containerSelector: ["#renderTabelNav"],
  });
}
export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();
    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();

      if (element?.name == "inline") {
        await store.upField({
          [element.class]: {
            [element.name]: element.checked,
          },
        });
      } else {
        if (element?.class == "transaction") {
          if (element.name == "access") {
            let setaccess = "";
            if (element.checked) {
              setaccess = "private";
            } else {
              setaccess = "public";
            }
            await store.upIndex({
              access: setaccess,
            });
          } else {
            const data = await store.upSettings({
              tablesettings: element.checked,
            });
          }

          await renderingTabel(storage);
        } else {
          await store.upField({
            [element.name]: {
              tabel: element.checked,
            },
          });

          await renderingTabel(storage);
        }
      }
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();

    // Inisialisasi fungsi pencarian
    await initSearchFunctionality();
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
