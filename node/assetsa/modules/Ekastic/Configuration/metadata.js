export async function metadata(data) {
  try {
    const metadata = await NXUI.Storage().models("Office").tablesShow();
    console.log(metadata);

    // Try to get data from database first
    const setdata = await NXUI.Storage().models("Office").tablesMeta();

    // Also try to get from IndexedDB storage, with fallback handling
    let indexedDBData = null;
    try {
      indexedDBData = await NXUI.ref.get("bucketsStore", "metadata");
    } catch (indexedDBError) {
      console.warn(
        "Could not get data from bucketsStore (this is normal if store doesn't exist):",
        indexedDBError
      );
      // IndexedDB storage is optional - continue with database storage
    }
    // Inisialisasi selectedData dengan data yang sudah tersimpan
    selectedData =
      setdata && setdata?.data?.store ? [...setdata?.data?.store] : [];

    // Pastikan selectedData adalah array yang valid
    if (!Array.isArray(selectedData)) {
      selectedData = [];
    }

    console.log("Initialized selectedData:", selectedData);

    let template = "";

    // Pastikan metadata.data ada sebelum melakukan iterasi
    if (metadata && metadata.data) {
      const exclude = [
        "nexa_metadata",
        "nexa_office",
        "nexa_office_files",
        "controllers",
        "visitors_page",
      ];

      // Handle both array and object data structures
      const dataEntries = Array.isArray(metadata.data)
        ? metadata.data.map((value, index) => [index, value])
        : Object.entries(metadata.data);

      dataEntries.forEach(([index, row]) => {
        // Cek apakah item ini sudah dipilih sebelumnya
        const isSelected =
          setdata &&
          setdata?.data?.store &&
          setdata?.data?.store.some(
            (item) => item.name === row && item.index === parseInt(index)
          );

        // Hanya tampilkan jika tidak ada dalam exclude list
        if (!exclude.includes(row)) {
          template += ` 
                  <div class="pt-10px">
                  <div class="nx-checkbox-item" style="display: flex; align-items: center; justify-content: space-between;">
                  <div class="nx-checkbox-item">
                  <input type="checkbox" 
                         name="selectedVariables" 
                         class="single-select-checkbox"
                         id="var_create_${row}${index}"
                         ${isSelected ? "checked" : ""}
                         onclick="getBycheckbox('${index}','${row}');">
                  <label for="var_create_${row}${index}">
                    <span class="nx-checkmark"></span>
                   ${row}
                  </label>
                 </div>
                
                </div>
                </div>
            `;
        }
      });
    } else {
      // Jika tidak ada data metadata, tampilkan pesan
      template = '<p class="text-muted">Tidak ada metadata yang tersedia</p>';
    }
    // Inisialisasi dengan auto mode (tanpa parameter store)
    const Public = NEXA.tabel?.submenu || [];

    // Pastikan checkbox tersinkronisasi setelah DOM dimuat
    setTimeout(() => {
      syncCheckboxesWithSelectedData();
    }, 100);

    return `
  <div class="nx-row">
    <div class="nx-col-6">
    <h3 class="bold">Metadata Privat</h3>
   <div class="nx-scroll" style="height:500px; padding-right:10px">
      ${template}
    </div>
    </div>
    <div class="nx-col-6">
    <h3 class="bold pl-10px">Metadata Public</h3>
    <div class="nx-scroll" style="height:500px;">
      <div id="selected-items-public" class="pl-10px">
        ${
          selectedData.length > 0
            ? selectedData
                .map(
                  (item) => `
                <div class="pt-10px">
                  <div class="nx-checkbox-item" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                      <input type="checkbox" 
                             name="selectedVariables" 
                             class="single-select-checkbox"
                             id="public_${item.name}${item.index}"
                             checked
                             disabled>
                      <label for="public_${item.name}${item.index}" style="margin: 0; margin-left: 8px;">
                        <span class="nx-checkmark"></span>
                        <a style="color:#000"onclick="updateAlisTabel('${item.index}','${item.alis}','${item.name}');" href="javascript:void(0);">${item.alis}</a>
                      </label>
                    </div>
                      <a href="javascript:void(0);" onclick="removeSelectedItem('${item.name}', '${item.index}')" title="Hapus item" style="color:#ccc" >
                        <span class="material-symbols-outlined">delete_sweep</span>
                     </a>
                  </div>
                </div>`
                )
                .join("")
            : '<p class="text-muted">Belum ada item yang dipilih</p>'
        }
      </div>
    </div>
    </div>
  </div>
  `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    // Return fallback UI jika terjadi error
    return `
      <div class="nx-row">
        <div class="nx-col-12">
          <div class="alert alert-danger">
            <h4>Error Loading Metadata</h4>
            <p>Gagal memuat metadata. Silakan coba lagi.</p>
            <p><small>Error: ${error.message}</small></p>
          </div>
        </div>
      </div>
    `;
  }
}
// Array to store selected data persistently
let selectedData = [];

// Fungsi untuk sinkronisasi checkbox dengan selectedData
function syncCheckboxesWithSelectedData() {
  // Ensure selectedData is properly initialized
  if (!selectedData || !Array.isArray(selectedData)) {
    console.warn(
      "selectedData is not properly initialized in syncCheckboxesWithSelectedData, initializing as empty array"
    );
    selectedData = [];
  }

  console.log("Syncing checkboxes with selectedData:", selectedData);

  // Uncheck semua checkbox terlebih dahulu
  const allCheckboxes = document.querySelectorAll(
    'input[name="selectedVariables"]'
  );
  allCheckboxes.forEach((checkbox) => {
    if (!checkbox.disabled) {
      checkbox.checked = false;
    }
  });

  // Check checkbox yang ada di selectedData
  selectedData.forEach((item) => {
    const checkbox = document.getElementById(
      `var_create_${item.name}${item.index}`
    );
    if (checkbox) {
      checkbox.checked = true;
      console.log("Checked checkbox for:", item.name);
    } else {
      console.warn("Checkbox not found for:", item.name, item.index);
    }
  });
}

nx.updateAlisTabel = async function (id, alis, name) {
  // const setdata = await NXUI.ref.get("bucketsStore", "metadata");
  // console.log(setdata?.data?.store);
  // console.log(id, name)

  const modalID = "alias_" + name + id;
  NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: `Alias Tabel Name `,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    // Select: ["#groupbySelect"],
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy: {
      id: id,
      name: name,
    }, // ✅ Standard validation approach
    onclick: {
      title: "Save Alias Tabel",
      cancel: "Cancel",
      send: "saveAliasByValue", // ✅ Use namespaced function name
    },
    content: `
    <div class="nx-row">
      <div class="nx-col-4">
        <div class="form-nexa-group">
          <label>Tabel Key</label>
          <input type="text"class="form-nexa-control"  value="${id}"/>
        </div>
      </div>
      <div class="nx-col-8">
        <div class="form-nexa-group">
          <label>Tabel Name</label>
          <input type="text"class="form-nexa-control"  value="${name}"/>
        </div>
      </div>
      <div class="nx-col-12">
        <div class="form-nexa-group">
          <label>Alis Name Tabel </label>
          <input type="text" name="alis"class="form-nexa-control" value="${alis}" />
        </div>
      </div>
    </div>

    `,
  });
  NXUI.nexaModal.open(modalID);
};

nx.saveAliasByValue = async function (modalid, data, tabel) {
  try {
    // ambil data metadata
    const setdata = await NXUI.ref.get("bucketsStore", "metadata");
    // pastikan index sama-sama number
    const targetIndex = Number(tabel.id);

    // Ensure we have valid data to work with
    if (!setdata || !setdata.data || !Array.isArray(setdata.data.store)) {
      console.warn(
        "No valid metadata found in storage, using current selectedData"
      );
      // Use current selectedData if available, otherwise empty array
      if (!selectedData || !Array.isArray(selectedData)) {
        selectedData = [];
      }
    } else {
      // Use data from storage if available
      selectedData = setdata.data.store;
    }

    // Update alias pada selectedData yang ada
    console.log(
      `Updating alias for targetIndex: ${targetIndex}, new alias: ${data.alis}`
    );
    console.log(`Current selectedData:`, selectedData);

    const updatedStore = selectedData.map((item) => {
      if (Number(item.index) === targetIndex) {
        // Hapus spasi dan batasi maksimal 15 karakter
        const processedAlis = data.alis.replace(/\s+/g, "_").substring(0, 15);
        console.log(
          `Found matching item: index ${item.index}, updating alias from "${item.alis}" to "${processedAlis}"`
        );
        return {
          ...item,
          alis: processedAlis, // ganti isi alis dengan data.alias yang sudah diproses
        };
      }
      return item;
    });

    // Update selectedData dengan data yang sudah terupdate
    selectedData = updatedStore;
    console.log(`Updated selectedData:`, selectedData);

    // Save to storage with error handling
    try {
      await NXUI.ref.set("bucketsStore", {
        id: "metadata",
        store: updatedStore,
      });
      console.log(`Saved to storage:`, updatedStore);
    } catch (storageError) {
      console.warn(
        "IndexedDB storage failed in saveAliasByValue (bucketsStore not available):",
        storageError
      );
      // Continue with database update - IndexedDB storage is optional
    }

    // Ensure selectedData is properly initialized before updating display
    if (!selectedData || !Array.isArray(selectedData)) {
      console.warn(
        "selectedData is not properly initialized after update, initializing as empty array"
      );
      selectedData = [];
    }

    // Update tampilan UI
    updateSelectedItemsDisplay();

    // Update ke database
    const Q4 = await new NXUI.Models()
      .Storage("controllers")
      .where("categori", "Metadata")
      .update({
        data: selectedData,
      })
      .then((response) => {
        console.log("Database updated after alias change:", response);
      });

    // Sinkronisasi checkbox setelah update
    setTimeout(() => {
      syncCheckboxesWithSelectedData();
    }, 100);

    NXUI.nexaModal.close(modalid);
  } catch (err) {
    console.error("Error di saveAliasByValue:", err);
  }
};

nx.getBycheckbox = async function (id, name) {
  try {
    // Ensure selectedData is properly initialized
    if (!selectedData || !Array.isArray(selectedData)) {
      selectedData = [];
    }

    const checkbox = document.getElementById(`var_create_${name}${id}`);

    if (checkbox.checked) {
      // Cek apakah item sudah ada di selectedData
      const existingItem = selectedData.find(
        (item) => item.index === parseInt(id) && item.name === name
      );

      if (!existingItem) {
        // Jika item belum ada, tambahkan ke array dengan alias default
        selectedData.push({
          index: parseInt(id),
          name: name,
          alis: name,
        });

      } else {
        console.log("Item already exists in selectedData:", existingItem);
      }
    } else {
      // Jika checkbox di-uncheck, hapus dari array
      const indexToRemove = selectedData.findIndex(
        (item) => item.index === parseInt(id) && item.name === name
      );
      if (indexToRemove !== -1) {
        const removedItem = selectedData.splice(indexToRemove, 1)[0];
        console.log("Removed item from selectedData:", removedItem);
      }
    }

    // Simpan ke storage terlebih dahulu dengan error handling
    try {
      await NXUI.ref.set("bucketsStore", {
        id: "metadata",
        store: selectedData,
      });
    } catch (storageError) {
      console.warn(
        "IndexedDB storage failed (bucketsStore not available):",
        storageError
      );
      // Continue with database update - IndexedDB storage is optional
    }

    // Update tampilan item yang dipilih
    console.log("Updating display with selectedData:", selectedData);
    updateSelectedItemsDisplay();

    // Update ke database
    const Q4 = await new NXUI.Models()
      .Storage("controllers")
      .where("categori", "Metadata")
      .update({
        data: selectedData,
      })
      .then((response) => {
        console.log("Database updated:", response);
      });
  } catch (error) {
    console.error("❌ Create/Update failed:", error);
  }
};

// Fungsi untuk menghapus item yang dipilih
nx.removeSelectedItem = async function (name, index) {
  try {
    // Ensure selectedData is properly initialized
    if (!selectedData || !Array.isArray(selectedData)) {
      selectedData = [];
    }

    // Hapus dari selectedData
    const indexToRemove = selectedData.findIndex(
      (item) => item.index === parseInt(index) && item.name === name
    );
    if (indexToRemove !== -1) {
      const removedItem = selectedData.splice(indexToRemove, 1)[0];
      console.log("Removed item from selectedData:", removedItem);
    }

    // Uncheck checkbox di Metadata Privat
    const checkbox = document.getElementById(`var_create_${name}${index}`);
    if (checkbox) {
      checkbox.checked = false;
      console.log("Unchecked checkbox for:", name);
    }

    // Simpan ke storage terlebih dahulu dengan error handling
    try {
      await NXUI.ref.set("bucketsStore", {
        id: "metadata",
        store: selectedData,
      });
    } catch (storageError) {
      console.warn(
        "IndexedDB storage failed in removeSelectedItem (bucketsStore not available):",
        storageError
      );
      // Continue with database update - IndexedDB storage is optional
    }

    // Update tampilan
    console.log(
      "Removing item, updating display with selectedData:",
      selectedData
    );
    updateSelectedItemsDisplay();
    console.log(selectedData);

    // Update ke database
    const Q4 = await new NXUI.Models()
      .Storage("controllers")
      .where("categori", "Metadata")
      .update({
        data: selectedData,
      })
      .then((response) => {
        console.log("Database updated after removal:", response);
      });
  } catch (error) {
    console.error("❌ Remove failed:", error);
  }
};

// Fungsi untuk memperbarui tampilan item yang dipilih
function updateSelectedItemsDisplay() {
  const container = document.getElementById("selected-items-public");
  console.log("Container found:", container);

  // Add null/undefined check for selectedData
  if (!selectedData || !Array.isArray(selectedData)) {
    console.warn("selectedData is not properly initialized:", selectedData);
    selectedData = [];
  }

  console.log("selectedData length:", selectedData.length);

  if (!container) {
    console.log("Container not found, retrying in 100ms...");
    setTimeout(updateSelectedItemsDisplay, 100);
    return;
  }

  if (selectedData.length > 0) {
    const html = selectedData
      .map(
        (item) => `
      <div class="pt-10px">
        <div class="nx-checkbox-item" style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <input type="checkbox" 
                   name="selectedVariables" 
                   class="single-select-checkbox"
                   id="public_${item.name}${item.index}"
                   checked
                   disabled>
            <label for="public_${item.name}${item.index}" style="margin: 0; margin-left: 8px;">
              <span class="nx-checkmark"></span>
              <a style="color:#000"onclick="updateAlisTabel('${item.index}','${item.alis}','${item.name}');" href="javascript:void(0);">${item.alis}</a>
            </label>
          </div>
          <a href="javascript:void(0);" onclick="removeSelectedItem('${item.name}', '${item.index}')" title="Hapus item" style="color:#ccc" >
            <span class="material-symbols-outlined">delete_sweep</span>
         </a>
        </div>
      </div>
    `
      )
      .join("");

    container.innerHTML = html;
    console.log("Updated container with HTML");
  } else {
    container.innerHTML =
      '<p class="text-muted">Belum ada item yang dipilih</p>';
    console.log("Updated container with empty message");
  }
}
