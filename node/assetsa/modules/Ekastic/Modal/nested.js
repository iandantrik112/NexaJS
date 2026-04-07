/**
 * Helper functions for SearchField and dataform operations
 */

/**
 * Updates dataformStor object with dynamic ID and removes 'id' from variables
 * @param {Object} dataformStor - The dataform storage object (joinSDK or formSDK)
 * @param {string|number} dynamicId - The dynamic ID to set in where condition
 * @returns {Object} Updated dataformStor object
 */
export async function updateDataformStor(id,cellValue, variabl) {
  if (!id) {
    console.warn("dataformStor is null or undefined");
   
  }

     const formData = await NXUI.ref.get("nexaStore", id);
      console.log(formData.modal[variable])
     console.log(id,cellValue, variable)

}
