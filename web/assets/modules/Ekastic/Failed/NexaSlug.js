
export async function setFailed(data) {
  try {
     console.log('data:', data);
     const Sdk = new NXUI.Buckets(data.id);
     const storage = await Sdk.storage();
     console.log('label:', storage);
     console.log('storage.form:', storage?.form);
     console.log('storage.form type:', typeof storage?.form);
     console.log('is array?', Array.isArray(storage?.form));

  // Initialize NexaSlug otomatis dari storage.form
     NXUI.NexaSlug.fromFormData(storage?.form, { delay: 100 });
    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
    return `
<div class="form-nexa-group">
    <input type="date" name="pubdate"id="pubdate"class="form-nexa-control" placeholder="Enter pubdate" />
</div>
<div class="form-nexa-group">
    <input type="text" name="title" id="title"class="form-nexa-control" placeholder="Enter title" />
</div>

<div class="form-nexa-group">
    <input type="text" name="slug"id="slug"class="form-nexa-control" placeholder="Keyupslug" />
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
