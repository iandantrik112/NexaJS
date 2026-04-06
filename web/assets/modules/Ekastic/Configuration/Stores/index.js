// import { NexaStorageManager } from "./ObjectStores.js";
export async function setStores(data) {
  return `
<div>
  <a href="javascript:void(0);" onclick="installDB();">installDB</a> | 
  <a href="javascript:void(0);" onclick="forceDeleteDB();" style="color: red;">Force Delete DB</a>
</div>

	`;
}

nx.installDB = async function () {
  console.log("🚀 Starting database installation...");

  try {
    // Pertama coba tutup semua koneksi
    await forceCloseConnections();

    // Kemudian coba hapus database
    await clearAllTabelAlternative();

    console.log("✅ Database installation completed successfully!");
  } catch (error) {
    console.error("❌ Installation failed:", error);
    throw error;
  }
};

// Fungsi untuk memaksa hapus database (lebih agresif)
nx.forceDeleteDB = async function () {
  const dbName = "NexaStoreDB";
  console.log("💥 Force deleting database...");

  try {
    // Tutup semua koneksi terlebih dahulu
    await forceCloseConnections();

    // Tunggu sebentar
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Coba hapus dengan metode yang berbeda
    const result = await new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);

      deleteRequest.onsuccess = function () {
        console.log("🔥 Database berhasil dihapus dengan paksa!");
        resolve(true);
      };

      deleteRequest.onerror = function (event) {
        console.error("❌ Gagal menghapus database:", event.target.error);
        reject(event.target.error);
      };

      deleteRequest.onblocked = function () {
        console.warn("⚠️ Database masih terblokir, mencoba metode lain...");

        // Coba buka database dengan versi yang sangat tinggi untuk memaksa upgrade
        setTimeout(async () => {
          try {
            await clearAllTabel(); // Fallback ke metode lama
            resolve(true);
          } catch (error) {
            reject(error);
          }
        }, 1000);
      };
    });

    return result;
  } catch (error) {
    console.error("❌ Force delete failed:", error);
    throw error;
  }
};

export async function clearAllTabel() {
  const dbName = "NexaStoreDB";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, Date.now()); // pakai versi baru agar trigger onupgradeneeded

    request.onupgradeneeded = function (event) {
      const db = event.target.result;

      // Ambil semua tabel yang ada sekarang
      const storeNames = Array.from(db.objectStoreNames);

      // Hapus satu per satu tabelnya
      storeNames.forEach((storeName) => {
        db.deleteObjectStore(storeName);
        console.log(`🗑️ Tabel "${storeName}" berhasil dihapus.`);
      });

      console.log(`🔥 Semua tabel di database "${dbName}" sudah dihapus.`);
    };

    request.onsuccess = function () {
      console.log(`✅ Upgrade database "${dbName}" selesai.`);
      resolve(true);
    };

    request.onerror = function (event) {
      console.error("❌ Gagal membuka database:", event.target.error);
      reject(event.target.error);
    };
  });
}

// Alternatif: Hapus seluruh database dengan retry logic
export async function clearAllTabelAlternative() {
  const dbName = "NexaStoreDB";
  const maxRetries = 3;
  const retryDelay = 1000; // 1 detik

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(
      `🔄 Attempt ${attempt}/${maxRetries} to delete database "${dbName}"`
    );

    try {
      const result = await new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(dbName);

        deleteRequest.onsuccess = function () {
          console.log(`🔥 Database "${dbName}" berhasil dihapus sepenuhnya.`);
          resolve(true);
        };

        deleteRequest.onerror = function (event) {
          console.error("❌ Gagal menghapus database:", event.target.error);
          reject(event.target.error);
        };

        deleteRequest.onblocked = function () {
          console.warn(
            `⚠️ Database "${dbName}" sedang digunakan (attempt ${attempt})`
          );

          // Tutup semua koneksi yang mungkin terbuka
          setTimeout(() => {
            console.log("🔄 Mencoba menutup koneksi yang terbuka...");

            // Force close any open connections
            if (window.indexedDB && window.indexedDB.databases) {
              window.indexedDB.databases().then((databases) => {
                databases.forEach((db) => {
                  if (db.name === dbName) {
                    console.log(
                      `🔍 Found database: ${db.name}, version: ${db.version}`
                    );
                  }
                });
              });
            }

            // Retry setelah delay
            setTimeout(() => {
              resolve("retry");
            }, retryDelay);
          }, 500);
        };
      });

      if (result === true) {
        return true; // Berhasil dihapus
      } else if (result === "retry" && attempt < maxRetries) {
        console.log(`⏳ Menunggu ${retryDelay}ms sebelum retry...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  // Jika semua retry gagal, fallback ke metode clearAllTabel
  console.warn("⚠️ Semua attempt gagal, fallback ke clearAllTabel()");
  return await clearAllTabel();
}

// Fungsi untuk memaksa tutup semua koneksi database
export async function forceCloseConnections() {
  const dbName = "NexaStoreDB";

  return new Promise((resolve) => {
    // Coba buka database dan langsung tutup
    const request = indexedDB.open(dbName);

    request.onsuccess = function (event) {
      const db = event.target.result;
      console.log("🔒 Menutup koneksi database...");
      db.close();
      resolve(true);
    };

    request.onerror = function () {
      console.log("ℹ️ Database tidak terbuka atau sudah ditutup");
      resolve(true);
    };
  });
}
