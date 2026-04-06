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
           <h3 class="bold fs-20px">Metadata ${storage.className}</h3>  
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
              <strong>Access ${
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
          content: [await propertiesTable(Sdk), await Failed(Sdk)],
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

export async function propertiesTable(Sdk) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("tabel");
  console.log(storage);
  let tabelHtml = `
<table class="nx-table nx-table-sm mb-3">
  <thead>
    <tr>
      <th class="w-30px text-center">Icons</th>
      <th>Failed</th>
      <th>Label</th>
      <th>Filter</th>
      <th>Inline</th>
      <th>Dialog</th>
      <th>Hidden</th>
    </tr>
  </thead>
  <tbody>
    ${
      checkedItems
        ? (
            await Promise.all(
              checkedItems.map(
                async (item, index) => `
      <tr>
      <td  class="text-center">
       <span class="material-symbols-outlined nx-icon-md">${getIconByType(
         item.type
       )}</span>
     </td>
     <td>
     ${
           item.failedtabel
         }
     </td>
        <td>
         <div id="${
           item.name
         }" type="text" class="editable" data-min-length="5" name="placeholder">${
                  item.placeholder
                }</div>

       </td>
        <td>
                  <div class="nx-switch-grid">
                    <div class="nx-switch-item">
                      <input class="${
                        item.name
                      }" name="filtering" type="checkbox" id="filtering_${
                  item.name
                }${index}"
                       ${item.filtering ? "checked" : ""}
                      />
                      <label for="filtering_${item.name}${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>
              </td>

 
        
             <td>
                  <div class="nx-switch-grid">
                    <div class="nx-switch-item">
                      <input class="${
                        item.name
                      }" name="inline" type="checkbox" id="inline_${
                  item.name
                }${index}"
                       ${item.inline ? "checked" : ""}
                      />
                      <label for="inline_${item.name}${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>
              </td>
        
             <td>
                  <div class="nx-switch-grid">
                    <div class="nx-switch-item">
                      <input class="${
                        item.name
                      }" name="modal" type="checkbox" id="modal_${
                  item.name
                }${index}"
                       ${item.modal ? "checked" : ""}
                      />
                      <label for="modal_${item.name}${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>
              </td>
            <td>
                  <div class="nx-switch-grid">
                    <div class="nx-switch-item">
                      <input class="${
                        item.name
                      }" name="hidden" type="checkbox" id="hidden_${
                  item.name
                }${index}"
                       ${item.hidden ? "checked" : ""}
                      />
                      <label for="hidden_${item.name}${index}">
                        <span class="nx-switch"></span>
                      </label>
                    </div>
                  </div>
              </td>


      </tr>
    `
              )
            )
          ).join("")
        : "<tr><td>-</td><td>No data selected</td></tr>"
    }
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

export async function Failed(Sdk) {
  const storage = await Sdk.storage();
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
    const searchResult = row.failedtabel;
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
  const storage = await store.storage();
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
      await renderingTabel(storage);
    }
  );

  // Aktifkan editing
  nexaField.initElements();
}
export async function renderingTabel(store) {
  await NXUI.NexaRender.refresh(store, setTabelNav, {
    containerSelector: ["#renderTabelNav"],
  });

  await setApplications(store);
}

export async function setApplications(store) {
  const Sdk = new NXUI.Buckets(store.id);
  const checkedItems = await Sdk.getFields("tabel");
  const getFailid = checkedItems.map((item) => item.failed);
  const fullData = store.buckets.applications;

  const filteredData = filtersetApplicationsByArray(fullData, getFailid, store);

  // search
  const checkesearch = await Sdk.getFields("search");
  const SearchData = filtersetApplicationsBySearch(
    store.variablesOrigin,
    checkesearch
  );

  // filtering
  const checkeFilter = await Sdk.getFields("filtering");
  const FilterData = await filtersetApplicationsByFilter(Sdk, checkeFilter);

  const checkeModal = await Sdk.getFields("modal");
  const modalData = await filtersetApplicationsByFilter(Sdk, checkeModal);
  await Sdk.upIndex({
    modal: modalData,
    // type:"join", // ← Parameter baru untuk access control
    search: SearchData,
    filtering: FilterData,
    applications: filteredData,
  });
}

export function filtersetApplicationsByArray(data, fieldsToKeep, store) {
  const filteredAlias = data.alias.filter((alias) => {
    const fieldName = alias.split(" AS ")[1];
    return fieldsToKeep.includes(fieldName);
  });

  const filteredAliasNames = data.aliasNames.filter((name) =>
    fieldsToKeep.includes(name)
  );
  return {
    ...data,
    access: store.access ?? "public", // ← Parameter baru untuk access control

    alias: filteredAlias,
    aliasNames: filteredAliasNames,
  };
}

export async function filtersetApplicationsByFilter(Sdk, fieldsToKeep) {
  if (!fieldsToKeep || typeof fieldsToKeep !== "object") return {};
  // If fieldsToKeep is an array, convert to object with field name as key
  const items = Array.isArray(fieldsToKeep)
    ? fieldsToKeep.reduce((acc, item) => {
        if (item && item.failedtabel) {
          acc[item.failedtabel.split(".")[1]] = item;
        }
        return acc;
      }, {})
    : fieldsToKeep;

  const entries = await Promise.all(
    Object.values(items).map(async (value) => {
      const [table, field] = value.failedtabel.split(".");
      const setKeyTabel = await Sdk.metaIndex(table);
      return [
        field,
        {
          alias: field,
          failedtabel: value.failedtabel,
          tabel: table,
          getid: table + ".id",
          key: Number(setKeyTabel.key),
        },
      ];
    })
  );
  return Object.fromEntries(entries);
}

export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}

export function filtersetApplicationsBySearch(fields, fieldsToKeep) {
  if (!Array.isArray(fieldsToKeep)) {
    return fields || [];
  }
  const allowed = fieldsToKeep.map((item) => item.name);
  const filtered = fields.filter((f) =>
    allowed.some((a) => f.endsWith(`.${a}`))
  );
  return filtered;
}

export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();
    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();
      if (
        ["inline", "filtering", "modal", "hidden"].includes(element?.name)
       ) {
        await store.upField({
          [element.class]: {
            [element.name]: element.checked,
          },
        });
        // if (element?.name == "hidden") {
        //   await store.upField({
        //     [element.class]: { type: element.checked ? "hidden" : "text" },
        //   });
        // }
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

        } else {
          await store.upField({
            [element.name]: {
              tabel: element.checked,
            },
          });
        }
      }
      await renderingTabel(storage);
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
// upBucket
