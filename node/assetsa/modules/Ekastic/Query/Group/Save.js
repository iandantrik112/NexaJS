// Function to generate complete GROUP BY SQL condition for all fields
function generateGroupSQLCondition(fields) {
  if (!fields || fields.length === 0) {
    return "";
  }

  // Extract field names from objects or use strings directly
  const fieldNames = fields.map((item) =>
    typeof item === "string" ? item : item.field
  );

  return `GROUP BY ${fieldNames.join(", ")}`;
}

export async function Save(id, data, tabel) {
  try {
    console.log("input:", data.groupby);

    // Ambil data lama
    const dataform = await NXUI.ref.get(tabel.store, tabel.id);
    const oldGroupData = dataform?.groupBy || [];
    const alias = dataform.buckets?.join?.alias || [];
    console.log("Available aliases:", alias);

    // Handle both old array format and new object format
    let existingFields = [];
    if (Array.isArray(oldGroupData)) {
      // Old format: ["field1", "field2"] or [{field: "field1"}, {field: "field2"}]
      existingFields = oldGroupData.map((item) =>
        typeof item === "string" ? item : item.field
      );
    } else if (oldGroupData && oldGroupData.fields) {
      // New format: {fields: ["field1", "field2"], alias: "GROUP BY ..."}
      existingFields = oldGroupData.fields || [];
    }

    console.log("Existing fields:", existingFields);

    // Pastikan data.groupby selalu array
    const newGroupFields = Array.isArray(data.groupby)
      ? data.groupby
      : [data.groupby];

    // Process and normalize fields
    const processedFields = newGroupFields
      .map((field) => {
        // Skip empty fields
        if (!field || field.trim() === "") {
          return null;
        }
        // Normalize field (replace - with .)
        return field.replace(/-/g, ".");
      })
      .filter((field) => field !== null); // Remove null items

    // Merge with existing fields (avoid duplicates)

    const newUniqueFields = processedFields.filter(
      (field) => !existingFields.includes(field)
    );

    // Combine all fields (old + new)
    const allFields = [...existingFields, ...newUniqueFields];

    // Generate single GROUP BY SQL condition for all fields
    const groupByAlias = generateGroupSQLCondition(allFields);
    console.log(`Generated complete GROUP BY SQL: ${groupByAlias}`);

    // Create the final structure with all fields and single alias
    const makeDir = {
      groupBy: {
        fields: allFields,
        alias: groupByAlias,
      },
    };

    console.log("Final groupBy data:", makeDir);

    // Simpan hasil merge
    await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

    NXUI.nexaModal.close(id);
  } catch (error) {
    console.error("❌ Save gagal:", error);
  }
}
