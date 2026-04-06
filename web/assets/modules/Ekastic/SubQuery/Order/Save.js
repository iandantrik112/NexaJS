// Function to generate complete ORDER BY SQL condition for all fields
function generateOrderSQLCondition(orderFields) {
  if (!orderFields || orderFields.length === 0) {
    return "";
  }

  const orderClauses = orderFields.map((item) => {
    const field = typeof item === "string" ? item : item.field;
    const direction = item.direction || "ASC";

    // Validate direction
    const validDirections = ["ASC", "DESC"];
    const normalizedDirection = validDirections.includes(
      direction.toUpperCase()
    )
      ? direction.toUpperCase()
      : "ASC";

    return `${field} ${normalizedDirection}`;
  });

  return `ORDER BY ${orderClauses.join(", ")}`;
}

export async function SaveValueCustom(id, data, tabel,custom) {
  try {
    console.log("input:", data);

    // Ambil data lama dari storage
    const dataform = await NXUI.ref.get(tabel.store, tabel.id);
    const oldOrderData = dataform[custom]?.orderBy || [];
    const alias = dataform.buckets?.join?.alias || [];
    console.log("Available aliases:", alias);

    // Handle both old array format and new object format
    let existingFields = [];
    if (Array.isArray(oldOrderData)) {
      // Old format: [{field: "field1", direction: "ASC"}]
      existingFields = oldOrderData.map((item) => ({
        field: typeof item === "string" ? item : item.field,
        direction: item.direction || "ASC",
      }));
    } else if (oldOrderData && oldOrderData.fields) {
      // New format: {fields: [{field: "field1", direction: "ASC"}], alias: "ORDER BY ..."}
      existingFields = oldOrderData.fields || [];
    }

    console.log("Existing order fields:", existingFields);

    // pastikan data input berupa array of object
    const newItems = Array.isArray(data) ? data : [data];

    // Process new items
    const processedFields = newItems
      .map((newItem) => {
        // Skip items with empty field
        if (!newItem.field || newItem.field.trim() === "") {
          return null;
        }

        return {
          field: newItem.field,
          direction: newItem.direction || "ASC",
        };
      })
      .filter((item) => item !== null);

    // Merge with existing fields (avoid duplicates)
    const existingFieldNames = existingFields.map((item) => item.field);
    const newUniqueFields = processedFields.filter(
      (item) => !existingFieldNames.includes(item.field)
    );

    // Combine all fields (old + new)
    const allOrderFields = [...existingFields, ...newUniqueFields];

    // Generate single ORDER BY SQL condition for all fields
    const orderByAlias = generateOrderSQLCondition(allOrderFields);
    console.log(`Generated complete ORDER BY SQL: ${orderByAlias}`);

    // Create the final structure with all fields and single alias
 
    const makeDir = {
      [custom]: {
        ...dataform[custom],
        orderBy: {
          fields: allOrderFields,
          alias: orderByAlias,
        }
      },
    };




    console.log("Final orderBy data:", makeDir);

    // Simpan ke storage
    await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

    // Tutup modal
    NXUI.nexaModal.close(id);

    console.log("✅ Save berhasil:", makeDir);
  } catch (error) {
    console.error("❌ Save gagal:", error);
  }
}
