import { 
  extractSQLMetadata,
  convertApplicationsToSQL,
  parseSQLToLayarApplications
} from "./maxQuery.js";
import { refreshLayar} from "../index.js";

export async function newLayar(data,objkey,naKey,modalID,nameCode) {
  try {

     const Sdk = new NXUI.Buckets(data.id);
       const storage = await Sdk.storage();
       console.log('label:', objkey.applications);
       // Ouput :storage.applications
      // Pastikan storage.applications ada
      if (!storage || !storage.applications) {
        throw new Error('Storage atau applications tidak ditemukan');
      }
 // const dataTabel = await NXUI.Storage().models("Office").executeOperation(storage);
const sqlMetadata = extractSQLMetadata(storage || {});
const sql = convertApplicationsToSQL(objkey.applications || {});
const addQue=objkey.applications.operasi[storage.tableName]?.query ?? sql;

  setTimeout(async () => {
       try {
      await NXUI.NexaCmirror.loadDependencies();
      
      // Siapkan config dengan variabel SQL
      const editorConfig = {
        mode: 'sql', // Mode: 'htmlmixed', 'javascript', 'css', 'sql', 'json', dll
        height: '100%',
        title: "Layar",
        save: 'layarbtnSave',   // ID tombol save (akan di-setup otomatis)
        copy: 'layarbtnCopy',   // ID tombol copy (akan di-setup otomatis)
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
            // Parse SQL query untuk ekstrak alias dan aliasNames (khusus layar)
            const updatedApplications = parseSQLToLayarApplications(Code, storage.applications);
            // Update storage.applications dengan hasil parse (termasuk alias dan aliasNames)
            storage.applications = updatedApplications;
            console.log('label:', updatedApplications);
             updatedApplications.operasi[updatedApplications.tabelName].type = 'layar';
             updatedApplications.operasi[updatedApplications.tabelName].query = Code
           
             await Sdk.upNested({
                [naKey]: {
                  query:Code,
                  applications: updatedApplications,
                },
              },'layar');
             NXUI.nexaModal.close(modalID);
              await refreshLayar(storage)
          } catch (error) {
            console.error('❌ Error saving SQL query:', error);
          }
        },
        onCopy: function(Code) {
          console.log('label:', Code);
          // Copy functionality handled by NexaCmirror
        },
        // Semua konfigurasi lain (theme, lineNumbers, dll) sudah di-set default di class
      };
      
      // Inisialisasi CodeMirror dengan konfigurasi sederhana
      // Semua setup (theme, autocomplete, save, copy) sudah di-handle otomatis di dalam class
        const editor = new NXUI.NexaCmirror('LayarcodeEditor'+nameCode, editorConfig);
      
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
      <i class="fas fa-database" id="modeIcon"></i>
      <span id="modeText">SQL Type Layar</span>
    </h3>
    <div class="NexaCmirror-editorToolbar">
      <button id="btnFormat" class="NexaCmirror-btn-format" title="Format Code (Ctrl+Shift+F)">
        <span class="material-symbols-outlined">code</span>
      </button>
      <button id="layarbtnCopy" class="NexaCmirror-btn-copy" title="Copy">
        <span class="material-symbols-outlined">content_copy</span>
      </button>
      <button id="layarbtnSave" class="NexaCmirror-btn-save" title="Save">
        <span class="material-symbols-outlined">save</span>
      </button>
    </div>
  </div>
  <div class="nx-card-body" style="padding: 0px;">  
     <div>
         <textarea id="LayarcodeEditor${nameCode}">${addQue || ''}</textarea>
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

