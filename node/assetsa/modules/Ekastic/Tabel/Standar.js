
export async function setTabelNav(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    console.log(storage);
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="renderTabelNav">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Metadata Tabel ${storage.className}</h3>  
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
          content: [await settingsTable(Sdk), await Failed(Sdk)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        //await tabelEdit(Sdk);
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

export async function settingsTable(data) {
  return {
    title: "Properties",
    col: "nx-col-8",
    footer: "nx-col-6",
    html: "Ini adalah contoh konten card dasar. Card dapat berisi teks, gambar, dan elemen lainny",
  };
}

export async function Failed(Sdk) {
  const storage = await Sdk.storage();
  // Ambil data fields dan items yang sudah dicek
  const fields = await Sdk.Fields();
  const checkedItems = await Sdk.getFields();
  let checkedItemsHtml = "";
  let itemHtml = "";
  console.log(fields.length);
  // Generate HTML untuk setiap field dengan checkbox kondisi
  fields.forEach((row, index) => {
    const checkedAttr = row.tabel ? "checked" : "";
    const failedName = row.fieldAlias ?? row.name;
    const alaias = storage.variablesOrigin[index];
    itemHtml += `
        <div class="nx-switch-grid">
          <div class="nx-switch-item mb-10px pl-10px">
            <input class="tabel" name="${failedName}" type="checkbox" id="public_${failedName}${row.index}"${checkedAttr}/>
            <label for="public_${failedName}${row.index}">
              <span class="nx-switch"></span>
              ${alaias}
            </label>
          </div>
        </div>

    `;
  });

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
             placeholder="Search Failed... (Ctrl+F)">
       <div class="form-nexa-input-group-text">
         <button type="button" 
                 class="nx-btn-secondary" 
                 style="background: none; border: none; padding: 4px; color: #6c757d;">
           <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
         </button>
       </div>
    </div>
    <div class="nx-scroll-hidden" style="height:450px;padding-top:20px">
     ${itemHtml}
     </div>
    `,
  };
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
      console.log(storage);
      console.log(element);

      await store.upField({
        [element.name]: {
          tabel: element.checked,
        },
      });
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
