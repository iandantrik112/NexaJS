
export async function setFailed(data) {
  try {
    console.log('data:', data);
    // ✅ Query Configuration - mudah diubah sesuai kebutuhan
    const app = {
        "alias": [
            "user.status AS status",
            "user.nama AS nama", 
            "user.jabatan AS jabatan",
            "user.avatar AS avatar",
            "user.id AS id"
        ],
        "aliasNames": ["status", "nama", "jabatan","avatar", "id"],
        "tabelName": ["user"],
        "where": false,
        "group": false,
        "order": false,
        "operasi": {
            "user": {
                "type": "single",
                "index": "",
                "aliasIndex": "user",
                "keyIndex": 261760199266386,
                "target": "",
                "condition": "",
                "aliasTarget": "",
                "keyTarget": ""
            }
        },
        "access": "public",
        "id": data.id
        subquery: {
          alias: [
            "controllers.id AS id",
            "controllers.categori AS categori",
            "controllers.label AS label",
            "controllers.status AS status",
            "controllers.pintasan AS pintasan",
            "controllers.acdelete AS acdelete",
          ],

          aliasNames: ["userid", "categori", "label"],
          tabelName: ["controllers"],
          where:
            "WHERE controllers.userid = Member.id AS userid AND controllers.label = '" +
            className +
            "'",
          group: false,
          order: false,
          operasi: {
            controllers: {
              type: "single",
              index: "",
              aliasIndex: "controllers",
              keyIndex: 35634900205686,
              target: "",
              condition: "",
              aliasTarget: "",
              keyTarget: "",
            },
          },
        },
      };

    const dataDom = new NXUI.NexaDom({
        container: '#dataContainer',
        pagination: '#itempagination',
        // sortOrder: 'ASC',
        // sortBy: 'id',
        sortClickElement: '#sortBy',  // ✅ Element untuk toggle sort
        paginationinfo: "#info",
        searchElement: "#itemsearch",  // ✅ Element input search
        searchFields: ['nama'],        // ✅ Field yang dicari
        order:5,
        config: app,  // ✅ Pass config object
        // ✅ User menentukan template sendiri
        // render: (dataArray) => {
        //     let template = "";
        //     dataArray.forEach((users) => {
        //         template += `
        //         <div class="user-item">
        //           <img src="${NEXA.url}/assets/drive/${users.avatar}" style="width:40px" alt="">
        //             <h3>${users.no}. ${users.nama}</h3>
        //             <p>Status: ${users.status}</p>
        //             <p>Jabatan: ${users.jabatan}</p>
        //             <p>Avatar:</p>
        //             <p>ID: ${users.id}</p>
        //         </div>
        //         `;
        //     });
        //     return template;
        // }
         render: (dataArray) => {
         const rows = dataArray.map(user => `
             <tr>
                 <td>${user.no}</td>
                 <td>${user.nama}</td>
                 <td>${user.jabatan}</td>
             </tr>
         `).join('');
         return `<table class="table">
           <thead>
    <tr>
      <th>No</th>
      <th>Header 2</th>
      <th>Header 3</th>
    </tr>
  </thead>
         <tbody>${rows}</tbody></table>`;
     }





    });
//     render: (dataArray) => {
//     const rows = dataArray.map(user => `
//         <tr>
//             <td>${user.no}</td>
//             <td>${user.nama}</td>
//             <td>${user.jabatan}</td>
//         </tr>
//     `).join('');
//     return `<table class="table"><tbody>${rows}</tbody></table>`;
// }
    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    return `
    <input type="search" id="itemsearch" class="form-control">
    <a id="sortBy" href="#">sort data</a>
    <div id="dataContainer">
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p>Loading user data...</p>
        </div>
    </div>
    <div id="itempagination"></div>
    <div id="info"></div>
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