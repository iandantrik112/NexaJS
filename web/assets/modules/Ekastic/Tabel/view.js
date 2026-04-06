// import { Jointabel } from "./Jointabel.js";
export async function setTabelNav(data) {
  try {
    const dataform = await NXUI.ref.get(data.store, data.id);
    if (!dataform.form) {
      return `
         <div style="padding:30px" class="nx-container">
        <div class="nx-row">
          <div class="nx-col-12">
          <div class="nx-alert nx-alert-danger">
            Query Structure belum tersedia
          </div>
          </div>
        </div>
      </div>
      `;
    }
    console.log(dataform);
    console.log(dataform.variables);
    let checkedItemsHtml = "";
    let uncheckedItemsHtml = "";
    const fields = getFields(dataform.form);
    console.log(fields);
    fields.forEach((row, index) => {
      const checkedAttr = row.tabel ? "checked" : "";
      if (row.placeholder !== "id") {
        const itemHtml = `
     <div class="pt-10px">
        <div class="nx-checkbox-item" style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <input type="checkbox" 
                   name="selectedVariables" 
                   class="single-select-checkbox"
                   id="public_${row.name}${row.index}" 
                   ${checkedAttr}
                   onchange="addToSelectedTabel('${dataform.id}','${row.name}', this.checked, '${dataform.store}')">
            <label for="public_${row.name}${row.index}" style="margin: 0; margin-left: 8px;">
              <span class="nx-checkmark"></span>
             ${row.placeholder}
            </label>
          </div>
          <a href="javascript:void(0);" onclick="thedItem('${row.name}', '${index}')" title="Hapus item" style="color:#ccc" >
    <span class="material-symbols-outlined nx-icon-xs">settings</span>
         </a>
        </div>
      </div>
    `;

        // Pisahkan berdasarkan status checked
        if (row.tabel) {
          checkedItemsHtml += itemHtml;
        } else {
          uncheckedItemsHtml += itemHtml;
        }
      }
    });
    return `
<div style="padding:10px" class="nx-container">
  <div class="nx-row">
    <div class="nx-col-6">
      <h6 style="margin-bottom: 15px; color: #28a745;">✓ Terpilih (${
        fields.filter((row) => row.tabel && row.placeholder !== "id").length
      })</h6>
      ${checkedItemsHtml}
    </div>
    <div class="nx-col-6">
      <h6 style="margin-bottom: 15px; color: #6c757d;">○ Belum Dipilih (${
        fields.filter((row) => !row.tabel && row.placeholder !== "id").length
      })</h6>
      ${uncheckedItemsHtml}
    </div>
  </div>
</div>



    `;
  } catch (error) {
    console.error("❌ Save gagal:", error);
  }
}

export function getFields(data) {
  const files = Object.entries(data)
    .filter(([_, field]) => field) // cari field dengan modal true
    .map(([key, field]) => {
      return field;
    });

  return files.length > 0 ? files : false;
}
nx.addToSelectedTabel = async function (id, variable, e, store = "nexaStore") {
  const dataform = await NXUI.ref.get(store, id);
  dataform.form[variable].tabel = e;
  await NXUI.ref.mergeData(store, id, dataform);

  // Refresh tampilan setelah data diupdate
  if (window.refreshTabelDisplay) {
    await window.refreshTabelDisplay({ store: store, id: id });
  }
};

// Fungsi untuk me-refresh tampilan tabel
window.refreshTabelDisplay = async function (data) {
  try {
    const newHtml = await setTabelNav(data);
    // Cari container yang berisi tabel dan update isinya
    const container = document.querySelector(".nx-container");
    if (container) {
      container.innerHTML = newHtml;
    }
  } catch (error) {
    console.error("❌ Refresh tampilan gagal:", error);
  }
};
