/**
 * Class untuk menangani proses instalasi package
 * Digunakan untuk install package dari NexaStore
 */
export class NexaInstallUI {
  constructor() {
    // Inisialisasi class jika diperlukan
  }

  /**
   * Menampilkan modal untuk instalasi package
   * @param {string} packageId - ID dari package yang akan diinstall
   * @param {string} version - Version dari package
   */
  async showInstallModal(packageId, type='Tabel') {
     const metadataform = await NXUI.ref.get(
    "bucketsStore",
    "version"
  );
       const nexaStore = await NXUI.ref.get("nexaStore", packageId);
       const version=metadataform.version;

        const modalID = "installui_" + packageId;
        NXUI.modalHTML({
          elementById: modalID,
          styleClass: "w-500px",
          minimize: true,
          label: `Install Packages`,
          setDataBy: {
            id: packageId,
            version: version,
            type: type,
            storage: nexaStore,
          },
          onclick: {
            title: "Install",
            cancel: "Cancel",
            send: "renderInstal", // ✅ Use namespaced function name
          },
          content: `  
          <div class="nx-row">
          <div class="nx-col-12">

          <div class="nx-media">
            <span class="material-symbols-outlined" style="font-size: 64px; color: #0168fa;">deployed_code_update</span>
            <div class="nx-media-body" style="padding-left: 10px;">
              <h5>Data ${type}</h5>
              Package <b>${nexaStore.label}</b> belum tersedia dalam perangkat anda. Silahkan klik tombol Install untuk menggunakan fitur aplikasi ini.
              <div id="progresInstall"></div>
            </div>
          </div>

          
          </div>
          </div>
          `,
        });
        NXUI.nexaModal.open(modalID);
    
     
  
  }

  /**
   * Menjalankan proses instalasi package
   * @param {string} modalID - ID dari modal instalasi
   * @param {object} data - Data dari modal
   * @param {object} tabel - Data package termasuk version
   */
  async executeInstall(modalID, data, tabel) {

    let nexaStore = tabel.storage;
     await NXUI.ref.mergeData('nexaStore', tabel.id, {packages:tabel.type});
    // Inisialisasi Progress Bar
    const progressContainer = NXUI.id("progresInstall");
    if (!progressContainer) {
      console.error("Progress container not found");
      return;
    }

    // Buat ID unik berdasarkan modalID untuk menghindari konflik
    const uniqueId = modalID.replace(/[^a-zA-Z0-9]/g, '_');
    const progressBarId = `progressBar_${uniqueId}`;
    const progressPercentId = `progressPercent_${uniqueId}`;
    const progressStatusId = `progressStatus_${uniqueId}`;

    progressContainer.innerHTML = `
      <div style="margin-top: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="font-size: 14px; color: #666;">Memproses instalasi...</span>
          <span id="${progressPercentId}" style="font-size: 14px; font-weight: bold; color: #0168fa;">0%</span>
        </div>
        <div style="width: 100%; height: 8px; background-color: #e0e0e0; border-radius: 4px; overflow: hidden;">
          <div id="${progressBarId}" style="width: 0%; height: 100%; background-color: #0168fa; border-radius: 4px; transition: width 0.3s ease;"></div>
        </div>
        <div id="${progressStatusId}" style="margin-top: 8px; font-size: 13px; color: #666;"></div>
      </div>
    `;

    // Tunggu sedikit agar DOM ter-render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Ambil element dengan multiple fallback methods
    let progressBar = document.getElementById(progressBarId) || 
                      progressContainer.querySelector(`#${progressBarId}`) ||
                      progressContainer.querySelector('[id*="progressBar"]');
    
    let progressPercent = document.getElementById(progressPercentId) || 
                          progressContainer.querySelector(`#${progressPercentId}`) ||
                          progressContainer.querySelector('[id*="progressPercent"]');
    
    let progressStatus = document.getElementById(progressStatusId) || 
                         progressContainer.querySelector(`#${progressStatusId}`) ||
                         progressContainer.querySelector('[id*="progressStatus"]');

    // Validasi element
    if (!progressBar || !progressPercent || !progressStatus) {
      console.error("Progress elements not found", {
        progressBar: !!progressBar,
        progressPercent: !!progressPercent,
        progressStatus: !!progressStatus,
        container: !!progressContainer,
        containerHTML: progressContainer.innerHTML.substring(0, 200)
      });
      return;
    }

    // Fungsi untuk update progress dengan re-query elemen jika diperlukan
    const updateProgress = (percent, status) => {
      // Re-query elemen untuk memastikan masih ada
      if (!progressBar || !progressBar.parentElement) {
        progressBar = document.getElementById(progressBarId) || progressContainer.querySelector(`#${progressBarId}`);
      }
      if (!progressPercent || !progressPercent.parentElement) {
        progressPercent = document.getElementById(progressPercentId) || progressContainer.querySelector(`#${progressPercentId}`);
      }
      if (!progressStatus || !progressStatus.parentElement) {
        progressStatus = document.getElementById(progressStatusId) || progressContainer.querySelector(`#${progressStatusId}`);
      }

      if (!progressBar || !progressPercent || !progressStatus) {
        console.error("Progress elements not available during update");
        return;
      }

      try {
        progressBar.style.width = percent + '%';
        progressPercent.textContent = percent + '%';
        if (status) {
          progressStatus.textContent = status;
        }
      } catch (e) {
        console.error("Error updating progress:", e);
      }
    };

    // Simulasi proses instalasi
    try {
      updateProgress(0, 'Memulai instalasi...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(10, 'Mengunduh package...');
      await new Promise(resolve => setTimeout(resolve, 800));

      updateProgress(30, 'Memvalidasi package...');
      await new Promise(resolve => setTimeout(resolve, 600));

      updateProgress(50, 'Mengekstrak file...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateProgress(70, 'Menginstall dependencies...');
      await new Promise(resolve => setTimeout(resolve, 800));

      updateProgress(85, 'Menyimpan konfigurasi...');
      await new Promise(resolve => setTimeout(resolve, 600));

      updateProgress(95, 'Menyelesaikan instalasi...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(100, 'Instalasi berhasil!');
      
      // Tunggu 1 detik sebelum close modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close modal setelah progress 100%
      NXUI.nexaModal.close(modalID);
      
      // Refresh halaman setelah modal ditutup
      // setTimeout(() => {
      //   location.reload();
      // }, 300);

    } catch (error) {
      console.error('Error during installation:', error);
      // Re-query elemen untuk error handling
      const errorProgressBar = document.getElementById(progressBarId) || progressContainer.querySelector(`#${progressBarId}`);
      const errorProgressPercent = document.getElementById(progressPercentId) || progressContainer.querySelector(`#${progressPercentId}`);
      const errorProgressStatus = document.getElementById(progressStatusId) || progressContainer.querySelector(`#${progressStatusId}`);
      
      if (errorProgressBar && errorProgressPercent && errorProgressStatus) {
        try {
          errorProgressBar.style.width = '0%';
          errorProgressPercent.textContent = '0%';
          errorProgressStatus.textContent = 'Instalasi gagal: ' + error.message;
          errorProgressBar.style.backgroundColor = '#f44336';
        } catch (e) {
          progressContainer.innerHTML = `<div style="color: #f44336; margin-top: 15px;">Instalasi gagal: ${error.message}</div>`;
        }
      } else {
        progressContainer.innerHTML = `<div style="color: #f44336; margin-top: 15px;">Instalasi gagal: ${error.message}</div>`;
      }
    }

    console.log('Installation process started:', modalID, data, tabel);
  }

  /**
   * Inisialisasi global function untuk backward compatibility
   * Function ini akan dipanggil secara otomatis untuk mendaftarkan renderInstal ke window
   */
  initGlobalFunction() {
    // Simpan reference ke instance
    const self = this;
    
    // Daftarkan function global untuk backward compatibility
    window.renderInstal = async function(modalID, data, tabel) {
      await self.executeInstall(modalID, data, tabel);
    };
  }
}

// Auto-initialize untuk backward compatibility
// Buat instance global dan inisialisasi function
if (typeof window !== 'undefined') {
  const nexaInstallInstance = new NexaInstallUI();
  nexaInstallInstance.initGlobalFunction();
}

