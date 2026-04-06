export async function nestedAnalysis(data) {
  try {
    const dataform = await NXUI.ref.get(data.store, data.id);

    const allowed = dataform.percent.variables;
    const filteredData = {
      ...dataform.formSDK,
      variables: dataform.formSDK.variables.filter((v) => allowed.includes(v)),
    };
    // ambil response dulu
    const response = await NXUI.Storage()
      .models("Office")
      .nestedAnalysis(filteredData);
    // baru mapping ke result
    const result = response.data.response.map(({ label, total }) => ({
      label,
      total,
    }));

    return result;
  } catch (error) {
    return []; // Return empty array as fallback
  }
}
