

export async function setFailed(data) {
  try {
     console.log('data:', data);
     const Sdk = new NXUI.Buckets(data.id);
     const storage = await Sdk.storage();
  const result = storage.layar.data.map(item => {
    const row = storage.layar[item];
    return {
      failed:item,
      status:row.query,
      label: row.label,
      type: row.type,
      applications: row.applications
    };
  });


console.log('result:', result);
// Bagaimana mencari berdasarakan : failed
// Fungsi untuk mencari data berdasarkan failed
const findDataByFailed = (data, failedValue) => {
  return data.find(item => item.failed === failedValue);
};

// Contoh penggunaan
const demoData = findDataByFailed(result, "demo");
console.log('label:', demoData);








    return `
          <div id="aner_${storage.id}"></div>


    `;
    
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

