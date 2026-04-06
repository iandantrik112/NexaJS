/**
 * Helper functions for SearchField and dataform operations
 */

/**
 * Updates dataformStor object with dynamic ID and removes 'id' from variables
 * @param {Object} dataformStor - The dataform storage object (joinSDK or formSDK)
 * @param {string|number} dynamicId - The dynamic ID to set in where condition
 * @returns {Object} Updated dataformStor object
 */
export async function updateDataformcrossJoin(dynamicId, dataform) {
  if (!dataform || !dataform.joinSDK) {
    console.warn("dataform or joinSDK is null or undefined");
    return;
  }

  const dataformStor = dataform.joinSDK;
  const dataformLabel = dataform.formJoin;

  // Update where condition with dynamic ID
  if (dataformStor.where && dataformStor.where.length > 0) {
    dataformStor.where[0].value = dynamicId;
  } else {
    // Untuk join, cari field yang tepat untuk ID
    let idField = "id"; // default
    if (dataformStor.fields && dataformStor.fields.length > 0) {
      // Cari field dengan fieldKey "id" atau yang mengandung "id"
      const idFieldObj = dataformStor.fields.find(
        (field) => field.fieldKey === "id" || field.fieldKey.includes("id")
      );
      if (idFieldObj) {
        idField = idFieldObj.fieldName; // Gunakan fieldName yang lengkap
      }
    }

    dataformStor.where = [
      {
        field: idField,
        operator: "=",
        value: dynamicId,
      },
    ];
  }

  // Remove 'id' from variables array
  if (dataformStor.variables) {
    dataformStor.variables = dataformStor.variables.filter(
      (variable) => variable !== "id"
    );
  }

  // Untuk join, tambahkan 'id' ke fieldAliasList jika belum ada
  if (
    dataformStor.fieldAliasList &&
    !dataformStor.fieldAliasList.includes("id")
  ) {
    dataformStor.fieldAliasList.push("id");
  }

  // Set limit to 1
  dataformStor.limit = 1;

  // Validasi struktur data untuk executeOperation
  if (
    !dataformStor.joins ||
    !Array.isArray(dataformStor.joins) ||
    dataformStor.joins.length === 0
  ) {
    console.error("Invalid joins structure for executeOperation");
    return;
  }

  if (
    !dataformStor.fields ||
    !Array.isArray(dataformStor.fields) ||
    dataformStor.fields.length === 0
  ) {
    console.error("Invalid fields structure for executeOperation");
    return;
  }

  // Perbaiki tipe data untuk joins
  dataformStor.joins = dataformStor.joins.map((join) => ({
    ...join,
    sourceKeyIndex: parseInt(join.sourceKeyIndex),
    targetKeyIndex: parseInt(join.targetKeyIndex),
    joinType: join.joinType ? join.joinType.toUpperCase() : "INNER",
  }));

  // Pastikan value dalam where condition adalah string (sesuai dengan JoinTabel.php)
  if (dataformStor.where && dataformStor.where.length > 0) {
    dataformStor.where = dataformStor.where.map((condition) => ({
      ...condition,
      value: String(condition.value),
    }));
  }

  // Pastikan tidak ada field yang null atau undefined
  if (dataformStor.fields) {
    dataformStor.fields = dataformStor.fields.filter(
      (field) =>
        field && field.fieldKey && field.fieldName && field.table && field.alias
    );
  }

  // Pastikan joins array valid
  if (dataformStor.joins) {
    dataformStor.joins = dataformStor.joins.filter(
      (join) =>
        join &&
        join.alias &&
        join.sourceTable &&
        join.targetTable &&
        join.sourceField &&
        join.targetField
    );
  }

  try {
    const tabel = await NXUI.Storage()
      .models("Office")
      .executeOperation(dataformStor);

    // Untuk join operation, data biasanya ada di tabel.data.response[0]
    const responseData = tabel.data?.response?.[0];

    if (responseData) {
      // Ambil key variabel pertama (nama)
      const firstKey = Object.keys(responseData)[0];
      const firstValue = responseData[firstKey];

      // Potong nama jika terlalu panjang (maksimal 20 karakter)
      const truncatedValue =
        firstValue && firstValue.length > 20
          ? firstValue.substring(0, 20) + "..."
          : firstValue;

      const modalID = dataform.id + "_" + dynamicId;

      // Buat HTML content untuk menampilkan daftar data (tidak termasuk 'id')
      const contentHTML = Object.entries(responseData)
        .filter(([key, value]) => key !== "id") // Filter out 'id' field
        .map(([key, value]) => {
          // Ambil label dari dataformLabel berdasarkan key
          const fieldConfig = dataformLabel && dataformLabel[key];
          const displayLabel =
            fieldConfig?.label || fieldConfig?.placeholder || key;
          const displayValue = value === null ? "Tidak ada data" : value;

          return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
              <strong class="text-capitalize">${displayLabel}:</strong>
              <span class="text-muted">${displayValue}</span>
            </div>
          `;
        })
        .join("");

      NXUI.modalHTML({
        elementById: modalID,
        styleClass: "w-500px",
        minimize: true,
        label: `${truncatedValue}`,
        onclick: false,
        content: `
          <div class="p-3">
            <h6 class="mb-3">Detail Data:</h6>
            ${contentHTML}
          </div>
        `,
      });
      NXUI.nexaModal.open(modalID);
    }
  } catch (error) {
    console.error("Error executing join operation:", error);
  }
}
