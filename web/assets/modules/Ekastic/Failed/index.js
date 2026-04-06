
export async function setFailed(data) {
  try {
const dataInstall = await new NXUI.NexaModels()
   .Storage("instansi")
   .select(["nama"])
   .orderBy('id', "DESC")
   .get();

let result = "";

if (typeof dataInstall.data === "string") {
    // Jika masih dalam bentuk string dipisah "|"
    result = dataInstall.data; 
} else {
    // Jika array → gabungkan menjadi string dipisah "|"
    const list = dataInstall.data.map(item => item.nama);
    result = list.join("|");
}

console.log(result);


    return `
<div class="form-nexa-group">
   www
</div>

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
