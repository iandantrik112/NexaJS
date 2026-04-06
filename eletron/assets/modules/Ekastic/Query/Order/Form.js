// Function to get ORDER BY descriptions
function getOrderDescription(fields = [], alias = "") {
  if (!fields || fields.length === 0) {
    return "Tidak ada field untuk ORDER BY";
  }

  const fieldDescriptions = fields
    .map((item) => {
      const fieldName = item.field.split(".").pop();
      const direction =
        item.direction === "DESC"
          ? "terbesar ke terkecil (Z-A, 9-1)"
          : "terkecil ke terbesar (A-Z, 1-9)";
      return `${fieldName} dari ${direction}`;
    })
    .join(", kemudian ");

  const description = `Mengurutkan data berdasarkan ${fieldDescriptions}. Hasil: ${alias}`;

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

    // Handle new orderBy structure
    const orderByData = tabel?.orderBy || {};
    const orderByFields = orderByData.fields || [];
    const orderByAlias = orderByData.alias || "";

    console.log("OrderBy data:", orderByData);

    let templateField = "";

    // Show single ORDER BY entry with all fields
    if (orderByFields.length > 0) {
      const fieldsDisplay = orderByFields
        .map((item) => `${item.field} ${item.direction}`)
        .join(", ");
      templateField = `
        <li class="nx-list-item" id="orderByItem">
          1. ${fieldsDisplay}
          <a class="pull-right" onclick="nx.clearOrderBy();" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
          <p class="nx-text-muted">${getOrderDescription(
            orderByFields,
            orderByAlias
          )}</p>
        </li>
      `;
    }

    // Individual field removal
    orderByFields.forEach((item, index) => {
      templateField += `
        <li class="nx-list-item" id="orderkey${index}" >
          - ${item.field} ${item.direction}
          <a class="pull-right" onclick="removeOrderByField(${index});" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
        </li>
      `;
    });

    // Fungsi hapus semua ORDER BY
    nx.clearOrderBy = async function () {
      const makeDir = { orderBy: { fields: [], alias: "" } };
      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang
      const container = NXUI.id("orderList");
      if (container) {
        container.innerHTML = "";
      }
    };

    // Fungsi hapus field individual
    nx.removeOrderByField = async function (index) {
      const updatedFields = orderByFields.filter((_, i) => i !== index);
      const newAlias =
        updatedFields.length > 0
          ? `ORDER BY ${updatedFields
              .map((item) => `${item.field} ${item.direction}`)
              .join(", ")}`
          : "";

      const makeDir = {
        orderBy: {
          fields: updatedFields,
          alias: newAlias,
        },
      };

      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang
      const container = NXUI.id("orderList");
      if (container) {
        const updatedForm = await Form({
          ...tabel,
          orderBy: makeDir.orderBy,
        });
        // Extract only the orderList content
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = updatedForm;
        const orderListContent = tempDiv.querySelector("#orderList");
        if (orderListContent) {
          container.innerHTML = orderListContent.innerHTML;
        }
      }
    };

    // Ambil direction pertama dari orderBy jika ada, default kosong
    const selectedDirection = orderByFields?.[0]?.direction || "";

    return `
      <div class="nx-container">
        <div class="nx-row">
         <div class="nx-col-12"id="SearchOrder"></div>
          <div class="nx-col-8">
            <div class="form-nexa-group">
              <label>Field</label>
          <select class="form-nexa-control"name="field"id="field">
            <option value="">Select Field</option>
            ${template}
          </select>
            </div>
          </div>
          <div class="nx-col-4">
            <div class="form-nexa-group">
              <label>Direction</label>
              <select class="form-nexa-control" id="direction" name="direction">
                <option value="">Direction</option>
                <option value="DESC" ${
                  selectedDirection === "DESC" ? "selected" : ""
                }>DESC</option>
                <option value="ASC" ${
                  selectedDirection === "ASC" ? "selected" : ""
                }>ASC</option>
              </select>
            </div>
          </div>
          <div class="nx-col-12">
            <ul class="nx-list-group" id="orderList">
              ${templateField}
            </ul>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading orderBy form.</div></div>`;
  }
}
