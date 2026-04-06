import { setDb } from "./Db.js";
export async function allDb(data) {
  try {
    const wrapper = NXUI.createElement(
      "div",
      `
      <div id="setDbNav">
         <div class="nx-row" id="nxdrop"></div>
      </div>
    `
    );

    setTimeout(async () => {
      try {
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaDrag({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        const template = render.Container({
          container: "#nxdrop",
          content: [await DBIndex(data), await konfigurasi(data)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

// DBIndex function displays database tables management interface
// Shows all IndexedDB object stores with their data counts and delete options
export async function DBIndex(data) {
  const template = await setDb(data);
  return {
    title: "Nexa Storage",
    col: "nx-col-8",
    html: template,
  };
}

export async function konfigurasi(data) {
  return {
    title: "Database Management",
    col: "nx-col-4",
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Kelola tabel database IndexedDB untuk aplikasi NexaUI.<br>
     <strong>🗑️ Delete:</strong> Tombol delete akan menghapus semua data dari tabel yang dipilih.<br>
     <strong>🔄 Refresh:</strong> Setelah operasi, tampilan akan otomatis terupdate.
    </small>`,
    html: `
     <div class="nx-scroll-hidden" style="height:350px; padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Identifikasi Tabel Database</strong>
              <p class="mb-2">Lihat tabel "Nexa Storage" untuk melihat semua tabel IndexedDB yang tersedia. Setiap tabel memiliki icon dan jumlah data yang berbeda.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Jenis Tabel Database</strong>
              <p class="mb-2">Ada beberapa jenis tabel:<br>
              • <span class="material-symbols-outlined nx-icon-sm">store</span> <strong>nexaStore:</strong> Data utama aplikasi<br>
              • <span class="material-symbols-outlined nx-icon-sm">folder</span> <strong>folderStructure:</strong> Struktur folder<br>
              • <span class="material-symbols-outlined nx-icon-sm">description</span> <strong>fileContents:</strong> Konten file<br>
              • <span class="material-symbols-outlined nx-icon-sm">settings</span> <strong>fileSettings:</strong> Pengaturan file</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Manajemen Data Tabel</strong>
              <p class="mb-2">Untuk setiap tabel:<br>
              • Lihat jumlah data yang tersimpan<br>
              • Gunakan tombol delete untuk menghapus semua data<br>
              • Operasi ini akan membersihkan tabel secara permanen</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Keamanan Data</strong>
              <p class="mb-2">Sebelum menghapus data:<br>
              • Pastikan data sudah tidak diperlukan<br>
              • Backup data penting terlebih dahulu<br>
              • Operasi delete tidak dapat dibatalkan</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5.Pemantauan Database</strong>
              <p class="mb-2">• Monitor penggunaan storage IndexedDB<br>
              • Bersihkan data yang tidak diperlukan secara berkala<br>
              • Pastikan aplikasi tetap berjalan optimal</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

export async function rendering(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, allDb, {
    containerSelector: ["#setDbNav"],
  });
}

// Fungsi untuk membersihkan data di tabel tertentu
nx.clearTableData = function (tableName) {
  const dbName = "NexaStoreDB";
  const request = indexedDB.open(dbName);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);

    // Hapus semua data
    const clearRequest = objectStore.clear();

    clearRequest.onsuccess = function () {
      //alert(`Data di tabel "${tableName}" berhasil dihapus!`);
      // Refresh halaman untuk menampilkan data terbaru
      location.reload();
    };

    clearRequest.onerror = function () {
      alert(`Gagal menghapus data dari tabel "${tableName}"`);
    };
  };

  request.onerror = function () {
    alert("Gagal membuka database");
  };
};
