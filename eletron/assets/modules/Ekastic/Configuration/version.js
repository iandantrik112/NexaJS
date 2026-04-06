export async  function allVersion() {
const dataInstall = await new NXUI.NexaModels()
   .Storage("nexa_office")
   .select(["data_key AS version","created_at","user_id","status","description","data_value AS packages","id"])
   .where("data_type", 'System')
   // .limit(2)
   .orderBy('id', "DESC")
   .get();
   return dataInstall.data;
}
export async function lastVersion() {
const dataInstall = await new NXUI.NexaModels()
   .Storage("nexa_office")
   .select(["data_key AS updateVersion","created_at","description"])
   .where("data_type", 'System')
   .orderBy('id', "DESC")
   .first();
   return dataInstall.data;
}
export async  function tabelVersion() {
   const data=await allVersion();
   return  data;
}

export async  function packaceVersion(version) {
const dataInstall = await new NXUI.NexaModels()
   .Storage("nexa_office")
   .select(["data_value"])
   .where("data_type", 'System')
   .where('data_key', version)
   .first();
  const dStotage = JSON.parse(dataInstall.data.data_value);
  const packages = dStotage[version].application;
  // const packagesArray = packagesData[version]?.application || [];
  return  packages;
}