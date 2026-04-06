export async function setDb(data) {

  const dname = NEXA?.apiBase || "NexaStoreDB";
  let base64 = btoa(unescape(encodeURIComponent(dname)));
  // hapus semua "=" di akhir Base64
  base64 = base64.replace(/=/g, "");
  const dbName = "nexaui-" + base64;
  const request = indexedDB.open(dbName);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const db = event.target.result;
      console.log('db:', db);
      // Membuat HTML untuk menampilkan daftar tabel
      let tableList = '<div class="database-tables">';
      tableList += '<table class="nx-table nx-table-bordered">';
      tableList += "<thead>";
      tableList += "<tr>";
      tableList += `<th style="width:30px" >No</th>`;
      tableList += "<th>Nama Tabel</th>";
      tableList += "<th>Jumlah Data</th>";
      tableList += `<th style="width:30px" >Aksi</th>`;
      tableList += "</tr>";
      tableList += "</thead>";
      tableList += "<tbody>";

      // Fungsi untuk menghitung jumlah data di setiap tabel
      const countPromises = [];
      const tableNames = [];

      // db.objectStoreNames adalah DOMStringList (mirip array)
      for (let i = 0; i < db.objectStoreNames.length; i++) {
        const tableName = db.objectStoreNames[i];
        tableNames.push(tableName);

        // Membuat promise untuk menghitung data di setiap tabel
        const countPromise = new Promise((resolveCount) => {
          const transaction = db.transaction([tableName], "readonly");
          const objectStore = transaction.objectStore(tableName);
          const countRequest = objectStore.count();

          countRequest.onsuccess = function () {
            resolveCount({
              name: tableName,
              count: countRequest.result,
            });
          };

          countRequest.onerror = function () {
            resolveCount({
              name: tableName,
              count: "Error",
            });
          };
        });

        countPromises.push(countPromise);
      }

      // Menunggu semua count selesai
      Promise.all(countPromises).then((results) => {
        results.forEach((result, index) => {
          // Define icons for each table
          const tableIcons = {
            activityLogs: "history",
            bucketsStore: "inventory",
            fileContents: "description",
            fileSettings: "settings",
            folderStructure: "folder",
            metadata: "info",
            nexaStore: "store",
            presentations: "slideshow",
            recycleBin: "delete",
          };

          const icon = tableIcons[result.name] || "table_chart";

          tableList += "<tr>";
          tableList += `<td class="text-center">${index + 1}</td>`;
          tableList += `<td><span class="material-symbols-outlined" style="color:#6c757d !important;margin-right: 8px; vertical-align: middle;">${icon}</span><strong>${result.name}</strong></td>`;
          tableList += `<td><span class="count">${result.count} data</span></td>`;
          tableList += `<td>
             <a href="javascript:void(0);"
                     onclick="clearTableData('${result.name}')"
                     title="Hapus semua data dari tabel ${result.name}">
              <span class="material-symbols-outlined" style="color:#6c757d !important; margin-right: 8px; vertical-align: middle;">delete</span>
             </a>
           </td>`;
          tableList += "</tr>";
        });

        tableList += "</tbody>";
        tableList += "</table>";
        tableList += "</div>";

        resolve(tableList);
      });
    };

    request.onerror = function (event) {
      console.error("Gagal membuka database:", event.target.error);
      reject(
        `<div class="error">Gagal membuka database: ${event.target.error}</div>`
      );
    };
  });
}
