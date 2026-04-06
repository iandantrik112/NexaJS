
export async function setFailed(data) {
  try {
  const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    console.log('storage:', storage.applications);
    const app=storage.applications;
// Menggunakan directAnalysis dengan analysisConfig untuk ANALISIS DATA
const analysisConfig = {
    where: "petani.row = '1'",     // Filter hanya status aktif
    group: "petani.status",  // Group by untuk analisis
    alias: "petani.status AS label",  // Override alias: ganti nama status menjadi label
    countAlias: "val",  // Ganti nama "total" menjadi "data"
    limit: false,  // false = tidak ada limit, akan menganalisis semua data
    showSql: true                         // Tampilkan SQL query
};

const dataTabel = await NXUI.Storage().models("Office").directAnalysis(app, analysisConfig);
console.log('dataTabel (directAnalysis):', dataTabel);
    // nestedAnalysis
    //Generate and return HTML
    return `<div class="nx-scroll" style="height: 600px;">
     
    </div>`;
    
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return `
      <div class="alert alert-danger text-center">
        <h5>❌ Initialization Failed</h5>
        <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
      </div>
    `;
  }
}
