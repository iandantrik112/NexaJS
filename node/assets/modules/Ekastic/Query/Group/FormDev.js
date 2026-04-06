export async function Form(tabel) {
  try {
    console.log(tabel.type)
    if (tabel.type=="form") {

    } else {
      
    }
    // Pastikan tabel.groupBy selalu array
    const groupByList = Array.isArray(tabel?.groupBy) ? tabel.groupBy : [];

    console.log(tabel.variables)
    let template = "";
    tabel.variables.forEach((row) => {
      template += `<option value="${row.replace("-", ".")}">${row}</option>`;
    });
  let templateField = '';
    groupByList.forEach((row, index) => {
      const no = index + 1; // mulai dari 1
      templateField += `
        <li class="nx-list-item" id="wherekey${index}">
          ${no}. ${row}
          <a class="pull-right" onclick="nx.eletewhereID(${index});" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
        </li>
      `;
    });

    // Fungsi hapus item
    nx.eletewhereID = async function (id) {
      const index = parseInt(id, 10); // pastikan number
      const filtered = groupByList.filter((_, i) => i !== index);

      console.log("hapus index:", index);
      console.log("data baru:", filtered);

      const makeDir = { groupBy: filtered };
      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang daftar biar nomor & tombol tetap sinkron
      const container = NXUI.id("groupByContainer");
      if (container) {
        container.innerHTML = await Form(tabel.variables, { ...tabel, groupBy: filtered });
      }

      // Opsional: tutup modal jika perlu
      NXUI.nexaModal.close("group_" + tabel.id);
    };
    return `
      <div class="nx-row" id="groupByContainer">

      <div class="nx-col-12">
        <div class="form-nexa-group">
          <label>Field</label>
          <select class="form-nexa-control"name="groupby"id="groupby">
            <option value="">Select Field</option>
            ${template}
          </select>
        </div>
      </div>

        <div class="nx-col-12">
          <ul class="nx-list-group">
            ${templateField}
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("❌ Form initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading form.</div></div>`;
  }
}
