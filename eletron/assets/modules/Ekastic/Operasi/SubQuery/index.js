import { 
  generateSQLWithSubnested,
  generateSQLWithSubnestedAsSubquery,
  generateCombinedSQLWithJoin,
  extractSQLMetadata,
  parseSQLToSubnested,
  updateColumnFromAliasNames
 } from "./maxQuery.js";

export async function subquery(data) {
  try {
     const Sdk = new NXUI.Buckets(data.id);
       const storage = await Sdk.storage();


      // Pastikan storage.applications ada
      if (!storage || !storage.applications) {
        throw new Error('Storage atau applications tidak ditemukan');
      }

      // Generate SQL query dari storage dengan subnested
      const generatedSQL = generateSQLWithSubnested(storage.applications);

      // Alternatif: Generate dengan subquery (jika diperlukan)
     const generatedSQLSubquery = generateSQLWithSubnestedAsSubquery(storage.applications, true);

      // Generate combined SQL dengan JOIN (VIEW - tidak ada hubungan dengan onSave)
      const combinedSQLWithJoin = generateCombinedSQLWithJoin(storage.applications);

      // Ambil query dari subnested operasi jika ada (dengan pengecekan aman)
      // Default: gunakan query subnested sederhana (bukan subquery kompleks)
      let queryAdd = generatedSQL?.subnested || null;
      if (storage.applications?.subnested?.operasi && storage.applications?.subnested?.tabelName) {
        const subnestedTableName = storage.applications.subnested.tabelName[0];
        if (subnestedTableName && storage.applications.subnested.operasi[subnestedTableName]?.query) {
          queryAdd = storage.applications.subnested.operasi[subnestedTableName].query;
        }
      }




      // const dataTabel = await NXUI.Storage().models("Office").executeOperation(storage);
const sqlMetadata = extractSQLMetadata(storage || {});

  setTimeout(async () => {
       try {
      await NXUI.NexaCmirror.loadDependencies();
      
      // Siapkan config dengan variabel SQL
      const editorConfig = {
        mode: 'sql', // Mode: 'htmlmixed', 'javascript', 'css', 'sql', 'json', dll
        height: '100%',
        title: "Subnested",
        save: 'btnSave',   // ID tombol save (akan di-setup otomatis)
        copy: 'btnCopy',   // ID tombol copy (akan di-setup otomatis)
        format:true,   // merapikan kode otomatis
        notification:false,
        fontSize:"14px",
        status:true, // true = aktif editor tampil tombol save dan  copy false = hide tombol save dan copy
        // Variabel untuk SQL autocomplete
        sqlTables: sqlMetadata?.tables || [],        // Daftar nama tabel
        sqlColumns: sqlMetadata?.columns || [],      // Daftar nama kolom
        sqlTableColumnsMap: sqlMetadata?.tableColumnsMap || {}, // Map tabel ke kolom
        sqlFullAliases: sqlMetadata?.fullAliases || [], // Format lengkap: "table.column AS alias"
        onSave:async function(Code) {  
          try {
            // Pastikan storage ada
            if (!storage) {
              console.error('❌ storage tidak ditemukan');
              return;
            }
            
            // Pastikan storage.applications ada
            if (!storage.applications) {
              console.error('❌ storage.applications tidak ditemukan');
              return;
            }
            
            // Parse SQL query dan update struktur subnested
            // Gunakan storage yang sebenarnya, bukan storage hardcoded
            const updatedStorage = parseSQLToSubnested(Code, storage.applications);
            
            // Update operasi subnested dengan pengecekan aman
            if (updatedStorage.subnested && updatedStorage.subnested.tabelName && updatedStorage.subnested.tabelName.length > 0) {
              const subnestedTableName = updatedStorage.subnested.tabelName[0];
              if (!storage.applications.subnested) {
                storage.applications.subnested = {};
              }
              if (!storage.applications.subnested.operasi) {
                storage.applications.subnested.operasi = {};
              }
              if (!storage.applications.subnested.operasi[subnestedTableName]) {
                storage.applications.subnested.operasi[subnestedTableName] = {};
              }
              storage.applications.subnested.operasi[subnestedTableName].type = 'petir';
              storage.applications.subnested.operasi[subnestedTableName].query = Code;
            }
            
            // Update struktur column dengan semua aliasNames dari main dan subnested
            updateColumnFromAliasNames(storage);
         


          
            // finalStorage.applications.operasi[finalStorage.tableName].query = Code;
             await NXUI.ref.set("nexaStore", storage);
             
            // Simpan storage yang sudah di-update - DISABLED
            // await Sdk.save(updatedStorage);
          } catch (error) {
            console.error('❌ Error saving SQL query:', error);
          }
        },
        onCopy: function(Code) {
          // Copy functionality handled by NexaCmirror
        },
        // Semua konfigurasi lain (theme, lineNumbers, dll) sudah di-set default di class
      };
      
      // Inisialisasi CodeMirror dengan konfigurasi sederhana
      // Semua setup (theme, autocomplete, save, copy) sudah di-handle otomatis di dalam class
      const editor = new NXUI.NexaCmirror('codeEditorSubQuery', editorConfig);
      
      // Export ke global scope jika diperlukan
         window.editor = editor;
       } catch (error) {
         console.error("❌ Error initializing drag and drop:", error);
       }
     }, 100);

    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
    return `
 <div class="nx-card NexaCmirror-editorContainer" style="opacity: 0; visibility: hidden;">
  <div class="nx-card-header">
    <h3 class="bold" id="titleEditor">
      <i class="fas fa-code" id="modeIcon"></i>
      <span id="modeText">Nexa Mirror</span>
    </h3>
    <div class="NexaCmirror-editorToolbar">
      <button id="btnFormat" class="NexaCmirror-btn-format" title="Format Code (Ctrl+Shift+F)">
        <span class="material-symbols-outlined">code</span>
      </button>
      <button id="btnCopy" class="NexaCmirror-btn-copy" title="Copy">
        <span class="material-symbols-outlined">content_copy</span>
      </button>
      <button id="btnSave" class="NexaCmirror-btn-save" title="Save">
        <span class="material-symbols-outlined">save</span>
      </button>
    </div>
  </div>
  <div class="nx-card-body" style="padding: 0px;">  
  <div>
<textarea id="codeEditorSubQuery">${queryAdd || generatedSQL?.subnested || ''}</textarea>
  </div>
  </div>
  <div class="nx-card-footer">
    <div class="nx-alert nx-alert-primary">
      <h5 class="bold mb-2"><i class="fas fa-info-circle"></i> Panduan SubQuery Editor</h5>
      <div class="mb-2">
        <strong>Fungsi Utama:</strong>
        <ul class="mb-0 mt-1" style="padding-left: 20px;">
          <li><strong>Editor Subnested Query:</strong> Edit query SQL untuk subnested (query terpisah yang dieksekusi per baris hasil utama)</li>
          <li><strong>Query Terpisah:</strong> Subnested query dieksekusi secara dinamis di server untuk setiap baris hasil query utama</li>
          <li><strong>WHERE Dinamis:</strong> WHERE clause tidak ditampilkan di editor karena ditangani otomatis di server berdasarkan nilai dari query utama</li>
          <li><strong>Update Otomatis:</strong> Menyimpan perubahan ke struktur <code>storage.applications.subnested</code> dan memperbarui array column</li>
        </ul>
      </div>
      <div class="mb-2">
        <strong>Cara Penggunaan:</strong>
        <ul class="mb-0 mt-1" style="padding-left: 20px;">
          <li>Edit query subnested di editor (format: <code>table.column AS alias</code>)</li>
          <li>Hanya tulis SELECT dan FROM clause, jangan tambahkan WHERE karena ditangani dinamis di server</li>
          <li>Gunakan <kbd>Ctrl+Shift+F</kbd> atau tombol Format untuk merapikan kode</li>
          <li>Klik <strong>Save</strong> untuk menyimpan perubahan ke storage</li>
          <li>Alias baru akan otomatis ditambahkan ke <code>storage.column</code> (dengan userid dan id di akhir)</li>
        </ul>
      </div>
      <div class="mb-2">
        <strong>Contoh Query:</strong>
        <pre class="mb-0 mt-1" style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">SELECT user.nama AS nama1, user.jabatan AS jabatan, user.email AS email
FROM user</pre>
      </div>
      <div class="mb-0">
        <strong>Fitur Autocomplete:</strong> Sistem menyediakan autocomplete untuk tabel, kolom, dan alias yang tersedia di storage. Mulai ketik untuk melihat saran.
      </div>
    </div>
  </div>
</div>
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

