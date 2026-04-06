export async function setFailed(data) {
  try {
     console.log('data:', data);
     const Sdk = new NXUI.Buckets(data.id);
     const storage = await Sdk.storage();
     console.log('label:', storage);
     console.log('storage.form:', storage?.form);
     console.log('storage.form type:', typeof storage?.form);
     console.log('is array?', Array.isArray(storage?.form));

   // ✅ Convert storage.form object to array and map
   const formData = storage?.form;
   let formArray = [];
console.log('Daftar key:', Object.keys(formData));
   if (formData) {
     // If it's already an array, use it directly
     if (Array.isArray(formData)) {
       formArray = formData;
     } 
     // If it's an object, convert to array using Object.values()
     else if (typeof formData === 'object') {
       formArray = Object.values(formData);
     }
   }
  
  const result = formArray.map(item => ({
     failed: item.name,
     }));

  const result2 = formArray
     .filter(item => item.type === 'slug')
     .map(item => ({
      ...item.slug,
     }));
  const failed= result2[0]?.failed?.value ? `value="${result2[0]?.failed?.value}"` :'';
  const variabel= result2[0]?.variabel?.value ? `value="${result2[0]?.variabel?.value}"` :'';

   setTimeout(async () => {
      try {
        // Single instance untuk multiple tags
        // Contoh dengan data: false untuk mode bebas input
        new NXUI.NexaTags({
          targetId: ["tags","tags2"],
          data: result,  // Mode bebas input (bisa menulis tag baru)
          validasi: [1,2],
          onChange: (data) => {
            console.log(`📝 [${data.name}] Tags berubah:`, data);
          }
        });



      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
    return `
<div class="form-nexa-group">
  <label>Tang Seaceh</label>
  <input type="text" id="tags" ${failed} class="form-nexa-control" name="failed" placeholder="Ketik tag baru dan tekan Enter..." />
</div>

<div class="form-nexa-group">
  <label>Tang Seaceh</label>
  <input type="text" id="tags2" ${variabel}class="form-nexa-control" name="variabel" placeholder="Cari dan pilih dari database..." />
</div> 
<button onclick="addtags('${data.id}')" class="nx-btn">Save</button>

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
window.addtags = async function (id) {
  const Sdk = new NXUI.Buckets(id);
     const storage = await Sdk.storage();
     console.log('label:', storage);
  // Panggil static method dari NexaTags untuk mengambil semua tags
  const result = NXUI.NexaTags.getAllTags();
  console.log('label:', result.failed?.value);
  console.log({
          [result.failed?.value]: {
            slug:result,
          },
        });
        await Sdk.upField({
            [result.failed?.value]: {
              slug:result,
            },
          });


  console.log("📦 Semua tags berdasarkan name:", result);
  return result;
};
