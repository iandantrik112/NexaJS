// Function to get GROUP BY descriptions
function getGroupDescription(fields = [], alias = "") {
  if (!fields || fields.length === 0) {
    return "Tidak ada field untuk GROUP BY";
  }

  const fieldNames = fields.map((field) => field.split(".").pop()).join(", ");
  const description = `Mengelompokkan data berdasarkan kombinasi nilai yang sama pada ${fieldNames}. Hasil: ${alias}`;

  return description;
}

export async function FormCustom(tabel, custom,modalid) {
  try {
    let template = "";
    if (tabel.variablesOrigin && Array.isArray(tabel.variablesOrigin)) {
      tabel.variablesOrigin.forEach((row) => {
        template += `<option value="${row}">${row}</option>`;
      });
    }

    // Handle new groupBy structure
    const groupByData = tabel[custom]?.groupBy || {};
    const groupByFields = groupByData.fields || [];
    const groupByAlias = groupByData.alias || "";
    let templateFieldCustom = "";

    // Show single GROUP BY entry with all fields
    if (groupByFields.length > 0) {
      const fieldsDisplay = groupByFields.join(", ");
      templateFieldCustom = `
        <li class="nx-list-item" id="groupByItem" >
          1. ${fieldsDisplay}
          <a class="pull-right" onclick="nx.clearGroupByCustom();" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
          <p class="nx-text-muted">${getGroupDescription(
            groupByFields,
            groupByAlias
          )}</p>
        </li>
      `;
    }

    // Individual field removal (for backward compatibility)
    groupByFields.forEach((field, index) => {
      templateFieldCustom += `
        <li class="nx-list-item" id="wherekey${index}">
          - ${field}
          <a class="pull-right" onclick="nx.removeGroupByFieldCustom(${index});" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
        </li>
      `;
    });

    // Fungsi hapus semua GROUP BY
    nx.clearGroupByCustom = async function () {
      const makeDir = {
        [custom]: {
        ...tabel[custom],
          groupBy:false,
        },
      };
      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

       NXUI.id("groupByItem").remove();
       
        NXUI.nexaModal.close(modalid);
   
    };

    // Fungsi hapus field individual
    nx.removeGroupByFieldCustom = async function (index) {
      // Get current data from store to ensure we have the latest state
      const currentData = await NXUI.ref.get(tabel.store, tabel.id);
      const currentGroupByFields = currentData[custom]?.groupBy?.fields || [];

      const updatedFields = currentGroupByFields.filter((_, i) => i !== index);
      const newAlias =
        updatedFields.length > 0 ? `GROUP BY ${updatedFields.join(", ")}` : "";

      const makeDir = {
        [custom]: {
          ...currentData[custom],
          groupBy: {
            fields: updatedFields,
            alias: newAlias,
          },
        },
      };

      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);
             NXUI.id("wherekey"+index).remove();

   
    };
    return `
      <div class="nx-row" >
        <div class="nx-col-12"id="SearchGroupCustom"></div>
      </div>
      <div class="nx-row">

      <div class="nx-col-12">
        <div class="form-nexa-group">
          <label>Field</label>
          <select class="form-nexa-control"name="groupby"id="groupby">
            <option value="">Select Field</option>
            ${template}
          </select>
        </div>
      </div>
        <div class="nx-col-12"id="groupByContainerCustom">
          <ul class="nx-list-group">
            ${templateFieldCustom}
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("❌ Form initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading form.</div></div>`;
  }
}
