

export async function setFailed(data) {
  try {
     console.log('data:', data);
     const Sdk = new NXUI.Buckets(data.id);
     const storage ={
    "access": "public",
    "alias": [
        "demo.userid AS userid",
        "demo.title AS title",
        "demo.deskripsi AS deskripsi",
        "demo.id AS id"
    ],
    "aliasNames": [
        "userid",
        "title",
        "deskripsi",
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
    "limit": 5,
    "offset": 0,
    "subnested": {
        "alias": [
            "user.nama AS nama1",
            "user.jabatan AS jabatan",
            "visitors.ip_address AS IP"
        ],
        "aliasNames": [
            "nama1",
            "jabatan",
            "IP"
        ],
        "tabelName": [
            "user"
        ],
        "where": "WHERE user.id = demo.userid",
        "operasi": {
            "user": {
                "type": "petir",
                "index": "",
                "aliasIndex": "user",
                "keyIndex": 261760199266386,
                "target": "",
                "condition": "",
                "aliasTarget": "",
                "keyTarget": "",
                "query": "SELECT\n  user.nama AS nama1,\n  user.jabatan AS jabatan,\n  visitors.ip_address AS IP\nFROM user\nINNER JOIN visitors ON user.id = visitors.visitor_id"
            }
        },
        "group": false,
        "order": false
    }
}


console.log('label:', storage);
       const dataTabel = await NXUI.Storage().models("Office").executeOperation(storage);
    console.log('storage:', storage);
    console.log('dataTabel:', dataTabel);

    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
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

