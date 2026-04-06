// Function to get GROUP BY descriptions
function getGroupDescription(fields = [], alias = "") {
  if (!fields || fields.length === 0) {
    return "Tidak ada field untuk GROUP BY";
  }

  const fieldNames = fields.map((field) => field.split(".").pop()).join(", ");
  const description = `Mengelompokkan data berdasarkan kombinasi nilai yang sama pada ${fieldNames}. Hasil: ${alias}`;

  return description;
}

export async function Form(tabel) {
  try {
    let template = "";
    if (tabel.variablesOrigin && Array.isArray(tabel.variablesOrigin)) {
      tabel.variablesOrigin.forEach((row) => {
        template += `<option value="${row}">${row}</option>`;
      });
    }

    // Handle new groupBy structure
    const groupByData = tabel?.groupBy || {};
    const groupByFields = groupByData.fields || [];
    const groupByAlias = groupByData.alias || "";

    console.log("GroupBy data:", groupByData);

    let templateField = "";

    // Show single GROUP BY entry with all fields
    if (groupByFields.length > 0) {
      const fieldsDisplay = groupByFields.join(", ");
      templateField = `
        <li class="nx-list-item" id="groupByItem">
          1. ${fieldsDisplay}
          <a class="pull-right" onclick="nx.clearGroupBy();" href="javascript:void(0);">
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
      templateField += `
        <li class="nx-list-item" id="wherekey${index}">
          - ${field}
          <a class="pull-right" onclick="removeGroupByField(${index});" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
        </li>
      `;
    });

    // Fungsi hapus semua GROUP BY
    nx.clearGroupBy = async function () {
      const makeDir = { groupBy: { fields: [], alias: "" } };
      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang
      const container = NXUI.id("groupByContainer");
      if (container) {
        container.innerHTML = await Form({
          ...tabel,
          groupBy: { fields: [], alias: "" },
        });
      }
    };

    // Fungsi hapus field individual
    nx.removeGroupByField = async function (index) {
      const updatedFields = groupByFields.filter((_, i) => i !== index);
      const newAlias =
        updatedFields.length > 0 ? `GROUP BY ${updatedFields.join(", ")}` : "";

      const makeDir = {
        groupBy: {
          fields: updatedFields,
          alias: newAlias,
        },
      };

      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang
      const container = NXUI.id("groupByContainer");
      if (container) {
        container.innerHTML = await Form({
          ...tabel,
          groupBy: makeDir.groupBy,
        });
      }
    };
    return `
      <div class="nx-row" id="groupByContainer">

        <div class="nx-col-12"id="SearchGroup"></div>
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
