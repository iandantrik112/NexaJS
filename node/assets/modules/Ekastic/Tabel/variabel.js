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
    let templateHtml = "";
    dataform.variables.forEach((data, index) => {
      const row = dataform.form[data];
      const checkedAttr = row.tabel ? "checked" : "";
      console.log(row.tabel);
      templateHtml += `
     <div class="pt-10px">
        <div class="nx-checkbox-item" style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <input type="checkbox" 
                   name="selectedVariables" 
                   class="single-select-checkbox"
                   id="public_${row.name}${index}" 
                   ${checkedAttr}
                   onchange="addToSelectedTabel('${dataform.id}','${row.name}', this.checked, '${dataform.store}')">
            <label for="public_${row.name}${index}" style="margin: 0; margin-left: 8px;">
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
    });
    return `
<div style="padding:10px" class="nx-container">
  <div class="nx-row">
    <div class="nx-col-12">
      ${templateHtml}
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
  try {
    const dataform = await NXUI.ref.get(store, id);

    dataform.form[variable].tabel = e;
    await NXUI.ref.mergeData(store, id, dataform);
  } catch (error) {
    console.error("❌ Error dalam addToSelectedTabel:", error);
  }
};
