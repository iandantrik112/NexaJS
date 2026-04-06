export async function setes(data) {
  const fullData = data.buckets.applications;
   

  // const getFailid = ["nama", "deskripsi","id"];

  // // Filter data berdasarkan getFailid
  // const filteredData = filterFieldsByArray(fullData, getFailid);
  // console.log(filteredData);
  // return filteredData;
}

export function filterFieldsByArray(data, fieldsToKeep) {
  const filteredAlias = data.alias.filter((alias) => {
    // Ekstrak nama field dari alias (misal: "Exsampel.nama AS nama" -> "nama")
    const fieldName = alias.split(" AS ")[1];
    return fieldsToKeep.includes(fieldName);
  });

  const filteredAliasNames = data.aliasNames.filter((name) =>
    fieldsToKeep.includes(name)
  );
  return {
    ...data,
    alias: filteredAlias,
    aliasNames: filteredAliasNames,
  };
}
