/**
 * WHERE Clause Builder
 * Membuat interface untuk mengatur WHERE clause pada view
 */

// Import renderTabelView dari index.js
import { renderTabelView } from './index.js';

nx.settingsQuery = async function (tabel) {
    const metadata = await NXUI.ref.get("tabelStore", tabel) || {};
    const modalID = "query_" + tabel;
    const LayarcodeEditor = "LayarcodeEditor_" + tabel;
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-700px",
      minimize: true,
      label: `Group By Field ${tabel}`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      // Select: ["#groupbySelect"],
      getValidationBy: ["name"], // ✅ Standard validation approach
      setDataBy: metadata, // ✅ Standard validation approach
      onclick:false,
      content:` <div class="nx-card NexaCmirror-editorContainer" style="opacity: 0; visibility: hidden;">
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
         <textarea id="${LayarcodeEditor}">${metadata?.query.view || ''}</textarea>
     </div>
  </div`,
    });
    NXUI.nexaModal.open(modalID);
    NXUI.id("body_"+modalID).setStyle("padding", "0px")

      await NXUI.NexaCmirror.loadDependencies();
      
      // Siapkan config dengan variabel SQL
      const editorConfig = {
        mode: 'sql', // Mode: 'htmlmixed', 'javascript', 'css', 'sql', 'json', dll
        height: '100%',
        title: "Layar",
        save: 'layarbtnSave',   // ID tombol save (akan di-setup otomatis)
        copy: 'btnFormat',   // ID tombol copy (akan di-setup otomatis)
        format:true,   // merapikan kode otomatis
        notification:false,
        fontSize:"13px",
        status:true, // true = aktif editor tampil tombol save dan  copy false = hide tombol save dan copy
        // Variabel untuk SQL autocomplete
        // sqlTables: sqlMetadata?.tables || [],        // Daftar nama tabel
          sqlColumns: metadata?.failedAS || [],      // Daftar nama kolom
        // sqlTableColumnsMap: sqlMetadata?.tableColumnsMap || {}, // Map tabel ke kolom
         sqlFullAliases: metadata?.failedAS || [], // Format lengkap: "table.column AS alias"
        onSave:async function(Code) {  
          try {
            // Ambil metadata untuk tabel ini
            const metadata = await NXUI.ref.get("tabelStore", tabel) || {};
            
            // Simpan query custom ke metadata
            const updatedMetadata = {
              ...metadata,
              id: tabel,
              query: {
                view: Code.trim(), // Simpan query custom yang diubah user
                custom: true // Flag untuk menandai ini adalah query custom
              },
              updatedAt: new Date().toISOString()
            };
            
            // Update metadata
            await NXUI.ref.mergeData("tabelStore", tabel, updatedMetadata, {
              deepMerge: true,
              createIfNotExists: true
            });
            
            // Langsung buat/update view dengan query custom
            try {
              const dataTabel = await NXUI.Storage().models("Office").buckTabelView(updatedMetadata);
              
              if (dataTabel.data && dataTabel.data.success) {
                // Update metadata dengan hasil dari server
                const finalMetadata = {
                  ...updatedMetadata,
                  query: {
                    view: dataTabel.data.results.query,
                    sql: dataTabel.data.results.sql,
                    custom: true
                  },
                  connection: dataTabel.data.success
                };
                
                await NXUI.ref.mergeData("tabelStore", tabel, finalMetadata, {
                  deepMerge: true,
                  createIfNotExists: true
                });
              }
            } catch (viewError) {
              console.error('❌ Error creating view with custom query:', viewError);
              // Tetap simpan query custom meskipun view creation gagal
            }
            
            // Tutup modal
            NXUI.nexaModal.close(modalID);
            
            // Refresh view
            await renderTabelView();
            
          } catch (error) {
            console.error('❌ Error saving SQL query:', error);
            throw error;
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
        const editor = new NXUI.NexaCmirror(LayarcodeEditor, editorConfig);
      
      // Export ke global scope jika diperlukan
         window.editor = editor;
}