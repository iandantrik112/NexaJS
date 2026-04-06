// Function to generate individual WHERE condition
function generateSingleCondition(field, operator, value) {
  // Handle different operators
  switch (operator) {
    case "=":
    case "!=":
    case "<>":
    case ">":
    case "<":
    case ">=":
    case "<=":
      // For string values, add quotes
      if (typeof value === "string") {
        return `${field} ${operator} '${value}'`;
      } else {
        return `${field} ${operator} ${value}`;
      }

    case "LIKE":
    case "NOT LIKE":
      return `${field} ${operator} '${value}'`;

    case "IN":
    case "NOT IN":
      if (Array.isArray(value)) {
        const valueList = value
          .map((v) => (typeof v === "string" ? `'${v}'` : v))
          .join(", ");
        return `${field} ${operator} (${valueList})`;
      } else {
        return `${field} ${operator} ('${value}')`;
      }

    case "IS NULL":
      return `${field} IS NULL`;

    case "IS NOT NULL":
      return `${field} IS NOT NULL`;

    case "BETWEEN":
      if (Array.isArray(value) && value.length === 2) {
        const val1 = typeof value[0] === "string" ? `'${value[0]}'` : value[0];
        const val2 = typeof value[1] === "string" ? `'${value[1]}'` : value[1];
        return `${field} BETWEEN ${val1} AND ${val2}`;
      }
      return `${field} BETWEEN ${value}`;

    default:
      // Fallback for unknown operators
      if (typeof value === "string") {
        return `${field} ${operator} '${value}'`;
      } else {
        return `${field} ${operator} ${value}`;
      }
  }
}

// Function to generate complete WHERE SQL condition for all conditions
function generateWhereSQLCondition(conditions) {
  if (!conditions || conditions.length === 0) {
    return "";
  }

  const whereClauses = conditions.map((item) => {
    return generateSingleCondition(item.field, item.operator, item.value);
  });

  return `WHERE ${whereClauses.join(" AND ")}`;
}

export async function SaveJoinCustom(id, data, tabel,custom) {
  try {
    // Ambil data lama dari storage
    const dataform = await NXUI.ref.get(tabel.store, tabel.id);
    const oldWhereData = dataform[custom]?.where || [];
    // Handle both old array format and new object format
    let existingConditions = [];
    if (Array.isArray(oldWhereData)) {
      // Old format: [{field: "field1", operator: "=", value: "val1"}]
      existingConditions = oldWhereData.map((item) => ({
        field: item.field,
        operator: item.operator,
        value: item.value,
      }));
    } else if (oldWhereData && oldWhereData.conditions) {
      // New format: {conditions: [...], alias: "WHERE ..."}
      existingConditions = oldWhereData.conditions || [];
    }


    // Pastikan data array of object
    const newItems = Array.isArray(data) ? data : [data];

    // Process new items
    const processedConditions = newItems
      .map((newItemRaw) => {
        // Skip empty items
        if (!newItemRaw.field || !newItemRaw.operator) {
          return null;
        }

        // Normalisasi field: ganti "-" dengan "."
        const normalizedField = newItemRaw.field.replace(/-/g, ".");

        // Create clean item without optionselectField
        const { optionselectField, ...cleanItemRaw } = newItemRaw;

        return {
          field: normalizedField,
          operator: cleanItemRaw.operator,
          value: cleanItemRaw.value,
        };
      })
      .filter((item) => item !== null);

    // Merge with existing conditions (handle duplicates)
    const existingFieldOperators = existingConditions.map(
      (item) => `${item.field}_${item.operator}`
    );

    processedConditions.forEach((newCondition) => {
      const conditionKey = `${newCondition.field}_${newCondition.operator}`;
      const existingIndex = existingFieldOperators.indexOf(conditionKey);

      if (existingIndex !== -1) {
        // Handle special cases for IN/NOT IN
        const existing = existingConditions[existingIndex];
        if (
          ["IN", "NOT IN"].includes(existing.operator) &&
          existing.operator === newCondition.operator &&
          Array.isArray(existing.value) &&
          Array.isArray(newCondition.value)
        ) {
          // Gabungkan array tanpa duplikat
          const mergedValues = [
            ...new Set([...existing.value, ...newCondition.value]),
          ];
          existingConditions[existingIndex].value = mergedValues;
        } else {
          // Replace existing condition
          existingConditions[existingIndex] = newCondition;
        }
      } else {
        // Add new condition
        existingConditions.push(newCondition);
        existingFieldOperators.push(conditionKey);
      }
    });

    // Generate single WHERE SQL condition for all conditions
    const whereAlias = generateWhereSQLCondition(existingConditions);
  
   const makeDir = {
      [custom]: {
        ...dataform[custom],
        where: {
          conditions: existingConditions,
          alias: whereAlias,
        }
      },
    };
    // Simpan ke storage
    await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

    NXUI.nexaModal.close(id);
 
  } catch (error) {
    console.error("❌ Save gagal:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      id: id,
      data: data,
      tabel: tabel,
    });
  }
}
