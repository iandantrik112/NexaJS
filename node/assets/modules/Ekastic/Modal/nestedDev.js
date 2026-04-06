/**
 * Helper functions for SearchField and dataform operations
 */

/**
 * Updates dataformStor object with dynamic ID and removes 'id' from variables
 * @param {Object} dataformStor - The dataform storage object (joinSDK or formSDK)
 * @param {string|number} dynamicId - The dynamic ID to set in where condition
 * @returns {Object} Updated dataformStor object
 */
export async function updateDataformStor(dataformStor, dynamicId, dataform,variable) {
  if (!dataformStor) {
    console.warn("dataformStor is null or undefined");
    return dataformStor;
  }

  // Update where condition with dynamic ID
  if (dataformStor.where && dataformStor.where.length > 0) {
    dataformStor.where[0].value = dynamicId;
  } else {
    // Create where condition if it doesn't exist
    dataformStor.where = [
      {
        field: variable,
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

  // Set limit to 1
  dataformStor.limit = 1;
   const tabel = await NXUI.Storage()
   .models("Office")
   .standaloneAt(dataformStor);
   const responseData = tabel.data.response[0];
    // Ambil key variabel pertama (nama)
    const firstKey = Object.keys(responseData)[0]; // "nama"
    const firstValue = responseData[firstKey]; // "hando"

    // Potong nama jika terlalu panjang (maksimal 20 karakter)
    const truncatedValue =
      firstValue && firstValue.length > 20
        ? firstValue.substring(0, 20) + "..."
        : firstValue;

    if (responseData) {
      const modalID = dataform.id + "_" + dynamicId;

      // Buat HTML content untuk menampilkan daftar data
      const contentHTML = Object.entries(responseData)
        .map(([key, value]) => {
          const displayValue = value === null ? "Tidak ada data" : value;
          return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
              <strong class="text-capitalize">${key}:</strong>
              <span class="text-muted">${displayValue}</span>
            </div>
          `;
        })
        .join("");

      NXUI.modalHTML({
        elementById: modalID,
        styleClass: "w-500px",
        minimize: true,
        label: `${truncatedValue}`, // Menggunakan nilai yang sudah dipotong
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
}
