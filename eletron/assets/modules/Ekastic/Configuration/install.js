export async function setInstall(data) {
  const complexQuery = await new NXUI.NexaModels()
    .Storage("controllers")
    .select(["userid AS role", "label", "status"])
    .where("categori", "Accses")
    .get();
  console.log(complexQuery.data);

  // Konversi data array menjadi object berdasarkan userid
  const result = {};
  complexQuery.data.forEach((item) => {
    // Hanya tambahkan jika status = 1
    if (item.status === "1") {
      if (!result[item.role]) {
        result[item.role] = [];
      }
      result[item.role].push(item.label);
    }
  });

  return result;
}
