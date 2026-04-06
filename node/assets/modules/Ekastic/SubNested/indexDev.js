export async function SubQuery(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
  console.log('label:', storage.applications);
    const applications={
    "access": "public",
    "alias": [
        "demo.nama AS nama",
        "demo.title AS title",
        "demo.slug AS slug",
        "demo.id AS id"
    ],
    "aliasNames": [
        "nama",
        "title",
        "id"
    ],
    "tabelName": [
        "demo"
    ],
    "where": false,
    "group": false,
    "order": false,
    "operasi": {
        "demo": {
            "type": "single",
            "index": "",
            "aliasIndex": "demo",
            "keyIndex": 279283707314106,
            "target": "",
            "condition": "",
            "aliasTarget": "",
            "keyTarget": ""
        }
    },
    "limit":5,
    "offset": 0,
    "subnested": {
          "alias": [
            "controllers.jabatan AS jabatan",
            "controllers.email AS email",
            "controllers.alamat AS alamat",
          ],
          "aliasNames": ["jabatan","email","alamat"],
          "tabelName": ["controllers"],
          "where":"WHERE controllers.id = demo.slug AS slug",
          "group": false,
          "order": false,
          "operasi": {
            "controllers": {
              "type": "single",
              "index": "",
              "aliasIndex": "controllers",
              "keyIndex": 261760199266386,
              "target": "",
              "condition": "",
              "aliasTarget": "",
              "keyTarget": ""
            }
          }
        },
      };


     const dataTabel = await NXUI.Storage().models("Office").executeOperation(applications);
          console.log('dataTabel:', dataTabel);














 const checkedItems = await Sdk.getFields("tabel");
console.log('label:', checkedItems);
  const result = checkedItems.map(item => ({
    failed: item.name,
    failedAs: item.failedAs
  }));
  console.log('label:', result);
    return `
      <h3>Contoh Tabs</h3>
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