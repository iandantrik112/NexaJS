// Function to get WHERE descriptions
function getWhereDescription(conditions = [], alias = "") {
  if (!conditions || conditions.length === 0) {
    return "Tidak ada kondisi WHERE";
  }

  const conditionDescriptions = conditions
    .map((item) => {
      const fieldName = item.field.split(".").pop();
      const displayValue = Array.isArray(item.value)
        ? item.value.join(", ")
        : item.value;

      const operatorDescriptions = {
        "=": `${fieldName} sama dengan '${displayValue}'`,
        "!=": `${fieldName} tidak sama dengan '${displayValue}'`,
        "<>": `${fieldName} tidak sama dengan '${displayValue}'`,
        ">": `${fieldName} lebih besar dari '${displayValue}'`,
        "<": `${fieldName} lebih kecil dari '${displayValue}'`,
        ">=": `${fieldName} lebih besar atau sama dengan '${displayValue}'`,
        "<=": `${fieldName} lebih kecil atau sama dengan '${displayValue}'`,
        LIKE: `${fieldName} mengandung pola '${displayValue}'`,
        "NOT LIKE": `${fieldName} tidak mengandung pola '${displayValue}'`,
        IN: `${fieldName} ada dalam daftar (${displayValue})`,
        "NOT IN": `${fieldName} tidak ada dalam daftar (${displayValue})`,
        "IS NULL": `${fieldName} kosong/null`,
        "IS NOT NULL": `${fieldName} tidak kosong/null`,
        BETWEEN: `${fieldName} berada di antara nilai ${displayValue}`,
      };

      return (
        operatorDescriptions[item.operator] ||
        `${fieldName} ${item.operator} '${displayValue}'`
      );
    })
    .join(" DAN ");

  const description = `Mencari data dimana ${conditionDescriptions}. Hasil: ${alias}`;

  return description;
}

export async function FormCustom(tabel, custom) {
  try {
    // const { allFieldData, allFieldVariables } = await metaJoin(tabel);

    let template = "";
    // Add safety check for variablesOrigin
    if (tabel.variablesOrigin && Array.isArray(tabel.variablesOrigin)) {
      tabel.variablesOrigin.forEach((row) => {
        template += `<option value="${row}">${row}</option>`;
      });
    }
    // Handle new where structure
    const whereData = tabel[custom]?.where || {};
    const whereConditions = whereData.conditions || [];
    const whereAlias = whereData.alias || "";

    console.log("Where data:", whereData);

    let templateField = "";

    // Show single WHERE entry with all conditions
    if (whereConditions.length > 0) {
      const conditionsDisplay = whereConditions
        .map((item) => {
          const displayValue = Array.isArray(item.value)
            ? item.value.join(", ")
            : item.value;
          return `${item.field} ${item.operator} ${displayValue}`;
        })
        .join(" AND ");

      templateField = `
        <li class="nx-list-item" id="whereItem">
          1. ${conditionsDisplay}
          <a class="pull-right" onclick="nx.clearWhere();" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
          <p class="nx-text-muted">${getWhereDescription(
            whereConditions,
            whereAlias
          )}</p>
        </li>
      `;
    }

    // Individual condition removal
    whereConditions.forEach((item, index) => {
      const displayValue = Array.isArray(item.value)
        ? item.value.join(", ")
        : item.value;
      templateField += `
        <li class="nx-list-item" id="wherekey${index}">
          - ${item.field} ${item.operator} ${displayValue}
          <a class="pull-right" onclick="removeWhereConditionCustom(${index});" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
        </li>
      `;
    });

    // Fungsi hapus

    // Fungsi hapus
    // Fungsi hapus semua WHERE
    nx.clearWhere = async function () {


    const makeDir = {
        [custom]: {
          ...tabel[custom],
          where: { conditions: [], alias: "" }
        },
      };
      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang
      const container = NXUI.id("whereList");
      if (container) {
        container.innerHTML = "";
      }
    };

    // Fungsi hapus kondisi individual
    nx.removeWhereConditionCustom = async function (index) {
      const updatedConditions = whereConditions.filter((_, i) => i !== index);

      // Generate new alias for remaining conditions
      const newAlias =
        updatedConditions.length > 0
          ? `WHERE ${updatedConditions
              .map((item) => {
                const displayValue = Array.isArray(item.value)
                  ? item.value
                      .map((v) => (typeof v === "string" ? `'${v}'` : v))
                      .join(", ")
                  : typeof item.value === "string"
                  ? `'${item.value}'`
                  : item.value;
                return `${item.field} ${item.operator} ${
                  item.operator.includes("IN")
                    ? `(${displayValue})`
                    : displayValue
                }`;
              })
              .join(" AND ")}`
          : "";

      // const makeDir = {
      //   where: {
      //     conditions: updatedConditions,
      //     alias: newAlias,
      //   },
      // };

      const makeDir = {
        [custom]: {
          ...tabel[custom],
          where: {
            conditions: updatedConditions,
            alias: newAlias,
          },
        },
      };

      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);
      // Render ulang
      const container = NXUI.id("whereList");
      if (container) {
        // Create updated tabel object with the new where data
        const updatedTabel = {
          ...tabel,
          [custom]: {
            ...tabel[custom],
            where: {
              conditions: updatedConditions,
              alias: newAlias,
            },
          },
        };

        const updatedForm = await FormCustom(updatedTabel, custom);
        // Extract only the whereList content
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = updatedForm;
        const whereListContent = tempDiv.querySelector("#whereList");
        if (whereListContent) {
          container.innerHTML = whereListContent.innerHTML;
        }
      }
    };
    // const nameFaild=variables.replace("-", ".");

    return `
    <div class="nx-row">
      <div class="nx-col-12"id="SearchWhere"></div>
      <div class="nx-col-12">
        <div class="form-nexa-group">
          <label>Field</label>
          <select class="form-nexa-control"id="selectField"name="field">
            <option value="">Select Field</option>
            ${template}
          </select>
        </div>
      </div>
      <div class="nx-col-6" id="nxcol6Operator" style="display:none">
        <div class="form-nexa-group">
       <label>Operator</label>
              <select class="form-nexa-control" id="operator" name="operator">
                <option value="">Operator</option>
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value=">">></option>
                <option value="<"><</option>
                <option value=">=">>=</option>
                <option value="<="><=</option>
                <option value="LIKE">LIKE</option>
                <option value="IN">IN</option>
                <option value="BETWEEN">BETWEEN</option>
                <option value="NOT_IN">NOT IN</option>
                <option value="IS NULL">IS NULL</option>
                <option value="IS NOT NULL">IS NOT NULL</option>
              </select>
        </div>
      </div>
      <div class="nx-col-6"id="nxcol6Value" style="display:none">
        <div class="form-nexa-group">
          <label>Value</label>
          <select class="form-nexa-control" id="valuewhere" name="value">
            <option value="">Select Value</option>
          </select>
        </div>
      </div>
           <div class="nx-col-12">
            <ul class="nx-list-group" id="whereList">
              ${templateField}
            </ul>
          </div>





    </div> 
    `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading where form.</div></div>`;
  }
}
