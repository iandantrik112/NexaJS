// Function to generate SQL standard arithmetic alias
function generateSQLArithmeticAlias(item, aliasName) {
  const { field, operation, value, field2 } = item;

  // Map operations to SQL operators
  const operatorMap = {
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    MODULO: "%",
    POWER: "^",
  };

  // For operations that need special handling
  switch (operation) {
    case "SQRT":
      return `SQRT(${field}) AS ${aliasName}`;
    case "ROUND":
      return `ROUND(${field}) AS ${aliasName}`;
    case "CEIL":
      return `CEIL(${field}) AS ${aliasName}`;
    case "FLOOR":
      return `FLOOR(${field}) AS ${aliasName}`;
    case "PERCENTAGE":
      return `(${field} * 100) AS ${aliasName}`;
    case "RATIO":
      if (field2) {
        return `(${field} / ${field2}) AS ${aliasName}`;
      } else if (value) {
        return `(${field} / ${value}) AS ${aliasName}`;
      }
      return `${field} AS ${aliasName}`;
    case "RANDOM":
      return `RAND(${field}) AS ${aliasName}`;
    case "COMPLEX":
      return `${field} AS ${aliasName}`;
    default:
      // For basic arithmetic operations
      if (operatorMap[operation]) {
        const operator = operatorMap[operation];
        if (field2) {
          return `(${field} ${operator} ${field2}) AS ${aliasName}`;
        } else if (value) {
          return `(${field} ${operator} ${value}) AS ${aliasName}`;
        }
      }
      // Fallback
      return `${field} AS ${aliasName}`;
  }
}

export async function Save(id, data, tabel) {
  try {
    console.log("input:", id, data, tabel);

    // Ambil data lama dari storage
    const dataform = await NXUI.ref.get(tabel.store, tabel.id);
    const oldOrder = dataform?.arithmetic || []; // perbaiki typo 'oredrBy'
    const alias = dataform.buckets?.join?.alias || [];
    console.log("Available aliases:", alias);

    // pastikan oldOrder berupa array
    const mergedOrder = Array.isArray(oldOrder) ? [...oldOrder] : [];

    // pastikan data input berupa array of object
    const newItems = Array.isArray(data) ? data : [data];

    newItems.forEach((newItem) => {
      // Filter out empty optionfield
      const cleanItem = { ...newItem };
      if (
        cleanItem.optionfield === "" ||
        cleanItem.optionfield === null ||
        cleanItem.optionfield === undefined
      ) {
        delete cleanItem.optionfield;
      }

      // Generate alias if not provided for arithmetic operations
      if (!cleanItem.alias && cleanItem.field && cleanItem.operation) {
        // First, check if there's a matching alias in the existing buckets.join.alias
        const existingAlias = alias.find((aliasItem) => {
          // Extract field part from "Field AS alias" format
          const fieldPart = aliasItem.split(" AS ")[0].trim();
          return fieldPart === cleanItem.field;
        });

        console.log(`Searching for arithmetic field: ${cleanItem.field}`);
        console.log(`Found existing alias: ${existingAlias}`);

        if (existingAlias) {
          // Use the existing alias format but with SQL standard arithmetic format
          const aliasPart = existingAlias.split(" AS ")[1].trim();
          cleanItem.alias = generateSQLArithmeticAlias(cleanItem, aliasPart);
          console.log(`Generated arithmetic alias: ${cleanItem.alias}`);
        } else {
          // Generate automatic alias if no existing alias found
          const fieldParts = cleanItem.field.split(".");
          const fieldName = fieldParts[fieldParts.length - 1];
          cleanItem.alias = generateSQLArithmeticAlias(cleanItem, fieldName);
          console.log(
            `Generated automatic arithmetic alias: ${cleanItem.alias}`
          );
        }
      }

      // Skip item jika field kosong atau tidak ada
      if (
        !cleanItem.field ||
        cleanItem.field.trim() === "" ||
        cleanItem.field === null ||
        cleanItem.field === undefined
      ) {
        console.log("⚠️ Skipping item with empty field:", cleanItem);
        return; // Skip item ini
      }

      const index = mergedOrder.findIndex(
        (item) => item.field === cleanItem.field
      );

      if (index !== -1) {
        // Jika field sama → replace direction
        mergedOrder[index] = { ...mergedOrder[index], ...cleanItem };
      } else {
        // Jika field baru → push ke array
        mergedOrder.push(cleanItem);
      }
    });

    // Filter out any remaining empty items before saving
    const validItems = mergedOrder.filter(
      (item) =>
        item.field &&
        item.field.trim() !== "" &&
        item.field !== null &&
        item.field !== undefined
    );

    // Siapkan data untuk merge
    const makeDir = { arithmetic: validItems };

    // Simpan ke storage
    await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

    // Tutup modal
    NXUI.nexaModal.close(id);

    console.log("✅ Save berhasil:", validItems);
  } catch (error) {
    console.error("❌ Save gagal:", error);
  }
}
