import { newLayar} from "./new.js";
export async function setAnalysis(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
      const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 220, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Layar Analysis</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setAnalysis">
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
          content: [await Aplikasi(data,height), await Guide(height)],
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

export async function Aplikasi(Sdk,height) {
  return {
    title: "Properti",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: "nx-col-6",
    html: await newLayar(Sdk),
  };
}

export async function Guide(height) {
  return {
    title: "Panduan",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: "nx-col-6",
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Tambahkan Action Baru</strong>
              <p class="mb-2">Ketik nama action di field input di atas tabel, lalu tekan <strong>Enter</strong>. Action baru akan otomatis ditambahkan ke tabel. Sistem akan membuat query analisis secara otomatis, tidak perlu menulis query manual.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Pilih Type Analisis</strong>
              <p class="mb-2">Klik kolom <strong>Type</strong> untuk memilih jenis analisis:<br>
              • <strong>data:</strong> Analisis data biasa (default)<br>
              • <strong>percent:</strong> Menambahkan field persentase (0-100, 2 desimal)<br>
              • <strong>chart:</strong> Untuk chart, otomatis menggunakan alias "label"<br>
              • <strong>progres:</strong> Menambahkan field progress (0-100, integer) untuk progress bar</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Atur Label</strong>
              <p class="mb-2">Klik kolom <strong>Label</strong> untuk mengubah nama/title action. Label ini akan digunakan untuk menampilkan nama analisis di interface.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Pilih Field Analysis (Tags)</strong>
              <p class="mb-2">Klik kolom <strong>Analysis</strong> untuk memilih field yang akan digunakan untuk GROUP BY. Pilih 1-5 field dari daftar yang tersedia. Field yang dipilih akan digunakan untuk mengelompokkan data dalam analisis.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Enable/Disable Query</strong>
              <p class="mb-2">Gunakan toggle <strong>Query</strong> untuk mengaktifkan atau menonaktifkan query analisis. Jika diaktifkan, sistem akan generate SQL query otomatis berdasarkan konfigurasi yang dipilih.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6. Ubah Icon</strong>
              <p class="mb-2">Klik icon di kolom <strong>Icon</strong> untuk memilih icon yang berbeda. Icon ini akan ditampilkan di menu atau interface untuk identifikasi visual action.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>7. Simpan Konfigurasi</strong>
              <p class="mb-2">Setelah mengatur semua konfigurasi, klik tombol <strong>Save</strong> (ikon save) untuk menyimpan dan generate query analisis. Sistem akan otomatis membuat SQL query berdasarkan:<br>
              • Type yang dipilih<br>
              • Field Analysis (tags) untuk GROUP BY<br>
              • Konfigurasi lainnya</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>8. Hapus Action</strong>
              <p class="mb-2">Klik tombol <strong>Delete</strong> (ikon delete) untuk menghapus action yang tidak diperlukan. Action akan dihapus dari daftar dan query terkait juga akan dihapus.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>9. Sistem Otomatis</strong>
              <p class="mb-2">Sistem akan otomatis:<br>
              • Generate SQL query berdasarkan konfigurasi<br>
              • Menyesuaikan alias untuk GROUP BY<br>
              • Menambahkan COUNT(*) dengan nama sesuai type<br>
              • Menghitung persentase/progress jika type dipilih<br>
              • Filter data dengan kondisi row = '1'</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>10. Hasil Analisis</strong>
              <p class="mb-2">Setelah save, sistem akan menghasilkan data analisis dengan format:<br>
              • Field sesuai GROUP BY (atau "label" jika type chart)<br>
              • Field "total" untuk jumlah data<br>
              • Field "percent" jika type percent<br>
              • Field "progres" jika type progres</p>
            </div>
          </div>
         
        </div>
      </div>
      </div>
    `,
  };
}
export async function refreshLayar(store) {
  // Ambil data storage terbaru
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, setAnalysis, {
    containerSelector: ["#setAnalysis"],
  });
}
