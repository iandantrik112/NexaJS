export async function Save(id, data, tabel) {
  try {
    // Ambil data lama dari storage
    const dataform = await NXUI.ref.get(tabel.store, tabel.id);
    const oldOrder = dataform?.aggregateType || []; // perbaiki typo 'oredrBy'
    const alias = dataform.buckets?.allAlias || [];
    // pastikan oldOrder berupa array dan filter out empty field
    const filteredOldOrder = Array.isArray(oldOrder)
      ? oldOrder.filter(
          (item) =>
            item.field &&
            item.field !== "" &&
            item.field !== null &&
            item.field !== undefined
        )
      : [];
    const mergedOrder = [...filteredOldOrder];

    // pastikan data input berupa array of object
    const newItems = Array.isArray(data) ? data : [data];

    newItems.forEach((newItem) => {
      // Skip items with empty field
      if (
        newItem.field === "" ||
        newItem.field === null ||
        newItem.field === undefined
      ) {
        return; // Skip this item
      }

      // Filter out empty optionfield
      const cleanItem = { ...newItem };
      if (
        cleanItem.optionfield === "" ||
        cleanItem.optionfield === null ||
        cleanItem.optionfield === undefined
      ) {
        delete cleanItem.optionfield;
      }

      // Generate alias if not provided
      if (!cleanItem.alias && cleanItem.field && cleanItem.type) {
        // First, check if there's a matching alias in the existing buckets.join.alias
        const existingAlias = alias.find((aliasItem) => {
          // Extract field part from "Field AS alias" format
          const fieldPart = aliasItem.split(" AS ")[0].trim();
          return fieldPart === cleanItem.field;
        });

        if (existingAlias) {
          // Use the existing alias format but with the aggregate function
          const aliasPart = existingAlias.split(" AS ")[1].trim();
          cleanItem.alias = `${cleanItem.type}(${cleanItem.field}) AS ${aliasPart}`;
        } else {
          // Generate automatic alias if no existing alias found
          const fieldParts = cleanItem.field.split(".");
          const fieldName = fieldParts[fieldParts.length - 1];
          cleanItem.alias = `${cleanItem.type}(${cleanItem.field}) AS ${fieldName}`;
        }
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

    // Siapkan data untuk merge
    const makeDir = { 
      aggregateType: mergedOrder 
    };

    // Simpan ke storage
    await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

    // Tutup modal
    NXUI.nexaModal.close(id);
  } catch (error) {
    console.error("❌ Save gagal:", error);
  }
}
