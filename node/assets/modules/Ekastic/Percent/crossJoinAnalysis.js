export async function crossJoinAnalysis(data) {
  try {
    const dataform = await NXUI.ref.get(data.store, data.id);

    if (dataform.type == "join") {
      const allowed = dataform.percent.variables;

      // Filter fields
      const filteredData = {
        ...dataform.joinSDK,
        fields: dataform.joinSDK.fields.filter((f) =>
          allowed.includes(f.fieldKey)
        ),
        fieldAliasList: dataform.joinSDK.fieldAliasList.filter((alias) =>
          allowed.includes(alias)
        ),
      };

      const response = await NXUI.Storage()
        .models("Office")
        .crossJoinAnalysis(filteredData);

      const originalData = response.data;

      const result = response.data.response.map(({ label, total }) => ({
        label,
        total,
      }));
      return result;
    }

    return []; // Return empty array if not join type
  } catch (error) {
    return []; // Return empty array as fallback
  }
}
