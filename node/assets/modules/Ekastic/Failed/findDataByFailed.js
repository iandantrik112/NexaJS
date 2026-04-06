

export async function setFailed(data) {
  try {
     console.log('data:', data);
     const Sdk = new NXUI.Buckets(data.id);
     const storage = await Sdk.storage();
  


console.log('label:', storage.layar);
// {
//     "data": [
//         "demo",
//         "exsampel"
//     ],
//     "value": "demo|exsampel",
//     "demo": {
//         "action": "demo",
//         "label": "Demo",
//         "icon": "database",
//         "type": "data",
//         "children": false,
//         "id": 1,
//         "createdAt": "2025-11-08T14:48:47.383Z",
//         "date": "2025-11-08T14:48:47.383Z",
//         "token": "NX_ZXhzYW1wZWxfZGVtb18xXzE3NjI2MTMzMjczODNfMjE3",
//         "query": true
//     },
//     "exsampel": {
//         "action": "exsampel",
//         "label": "Exsampel",
//         "danger": false,
//         "className": "Exsampel",
//         "key": 279283707314106,
//         "class": "exsampel",
//         "handler": "#",
//         "icon": "database",
//         "type": "data",
//         "children": false,
//         "id": 2,
//         "createdAt": "2025-11-08T14:49:34.406Z",
//         "date": "2025-11-08T14:49:34.406Z",
//         "token": "NX_ZXhzYW1wZWxfZXhzYW1wZWxfMl8xNzYyNjEzMzc0NDA2XzM0NA==",
//         "query": true
//     }
// }
console.log('label:', storage.layar.data);
// (2) ['demo', 'exsampel']
    


  const result = storage.layar.data.map(item => {
    const row = storage.layar[item];
    return {
      failed:item,
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

