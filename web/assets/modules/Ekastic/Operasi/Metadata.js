

import { maxQuery,extractSQLMetadata,parseSQLToApplications,updateTabelPropertyFromSelect,saveOprasi } from "./maxQuery.js";
export async function opMetadata(data) {
  try {
   const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const applicationsToSQL = await maxQuery(storage);
    const addQue=storage.applications.operasi[storage.tableName]?.query ?? applicationsToSQL;
    const sqlMetadata = extractSQLMetadata(storage);

  setTimeout(async () => {
       try {
      await NXUI.NexaCmirror.loadDependencies();
      
      // Siapkan config dengan variabel SQL
      const editorConfig = {
        mode: 'sql', // Mode: 'htmlmixed', 'javascript', 'css', 'sql', 'json', dll
        title: "Single",
        height: '100%',
        save: 'metabtnSave',   // ID tombol save (akan di-setup otomatis)
        copy: 'metabtnCopy',   // ID tombol copy (akan di-setup otomatis)
        format:true,   // merapikan kode otomatis
        notification:false,
        fontSize:"14px",
        status:true, // true = aktif editor tampil tombol save dan  copy false = hide tombol save dan copy
        // Variabel untuk SQL autocomplete
        sqlTables: sqlMetadata.tables,        // Daftar nama tabel
        sqlColumns: sqlMetadata.columns,      // Daftar nama kolom
        sqlTableColumnsMap: sqlMetadata.tableColumnsMap, // Map tabel ke kolom
        sqlFullAliases: sqlMetadata.fullAliases, // Format lengkap: "table.column AS alias"
        onSave:async function(Code) {  
          const finalStorage = saveOprasi(Code, storage, "single");
          await NXUI.ref.set("nexaStore", finalStorage);
        },
        onCopy: function(Code) {
        },
        // Semua konfigurasi lain (theme, lineNumbers, dll) sudah di-set default di class
      };
      

      // Inisialisasi CodeMirror dengan konfigurasi sederhana
      // Semua setup (theme, autocomplete, save, copy) sudah di-handle otomatis di dalam class
      const editor = new NXUI.NexaCmirror('codeEditorMetadata', editorConfig);
      
      // Export ke global scope jika diperlukan
         window.editor = editor;
       } catch (error) {
       }
     }, 100);

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
      <button id="metabtnCopy" class="NexaCmirror-btn-copy" title="Copy">
        <span class="material-symbols-outlined">content_copy</span>
      </button>
      <button id="metabtnSave" class="NexaCmirror-btn-save" title="Save">
        <span class="material-symbols-outlined">save</span>
      </button>
    </div>
  </div>
  <div class="nx-card-body" style="padding: 0px;">  
  <div>
<textarea id="codeEditorMetadata">${addQue}</textarea>
  </div>
  </div>
  <div class="nx-card-footer">
    <div class="nx-alert nx-alert-primary">
      <h5 class="bold mb-2"><i class="fas fa-info-circle"></i> Panduan Sistem SQL Editor</h5>
      <div class="mb-2">
        <strong>Fungsi Utama:</strong>
        <ul class="mb-0 mt-1" style="padding-left: 20px;">
          <li><strong>Editor SQL Interaktif:</strong> Edit query SQL dengan autocomplete untuk tabel dan kolom</li>
          <li><strong>Konversi Otomatis:</strong> Mengkonversi struktur applications ke SQL dan sebaliknya</li>
          <li><strong>Manajemen Field:</strong> Otomatis menambahkan field baru ke storage saat query diubah</li>
          <li><strong>Sinkronisasi Form:</strong> Update properti tabel di form berdasarkan field di SELECT clause</li>
        </ul>
      </div>
      <div class="mb-2">
        <strong>Cara Penggunaan:</strong>
        <ul class="mb-0 mt-1" style="padding-left: 20px;">
          <li>Edit query SQL langsung di editor (format: <code>table.column AS alias</code>)</li>
          <li>Gunakan <kbd>Ctrl+Shift+F</kbd> atau tombol Format untuk merapikan kode</li>
          <li>Klik <strong>Save</strong> untuk menyimpan perubahan ke storage</li>
          <li>Field baru akan otomatis ditambahkan ke form dan storage</li>
        </ul>
      </div>
      <div class="mb-0">
        <strong>Fitur Autocomplete:</strong> Sistem menyediakan autocomplete untuk tabel, kolom, dan alias yang tersedia di storage. Mulai ketik untuk melihat saran.
      </div>
    </div>
  </div>
</div>
    `;
    
  } catch (error) {
    return `
        <div class="alert alert-danger text-center">
            <h5>❌ Initialization Failed</h5>
            <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
        </div>
    `;
  }
}

