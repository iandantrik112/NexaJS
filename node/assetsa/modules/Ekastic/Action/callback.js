/**
 * Helper functions for SearchField and dataform operations
 */

/**
 * Updates dataformStor object with dynamic ID and removes 'id' from variables
 * @param {Object} dataformStor - The dataform storage object (joinSDK or formSDK)
 * @param {string|number} dynamicId - The dynamic ID to set in where condition
 * @returns {Object} Updated dataformStor object
 */
export async function updateDatacallback(dataformStor, dynamicId, dataform) {
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
        field: "id",
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

  const result = tabel.data.response[0];

  // Flatten the result to make it easier to access
  const flattenedResult = {};
  if (result) {
    // Copy all properties from result
    Object.keys(result).forEach((key) => {
      flattenedResult[key] = result[key];
    });
    // Add ID to the result for easy access
    flattenedResult.id = dynamicId;
  }
  console.log("Callback result with ID:", flattenedResult);
  return flattenedResult;
}
