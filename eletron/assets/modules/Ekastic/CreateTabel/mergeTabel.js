
export async function setMergeTabel(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    NXUI.storageDB=storage;
      const dimensi = new NXUI.NexaDimensi();


     const height = dimensi.height("#nexa_app", 220, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Alter Tabel</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setMergeTabel">
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
          content: [await Aplikasi(Sdk,height), await Guide(height)],
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
   
    const storage = await Sdk.storage();

   

     const mergeTabel = await NXUI.ref.getAll("mergeTabel");
       if (mergeTabel?.data.length==0) {
                 const metaData = await Sdk.metaData();
           for (const tabel of  metaData) {
             const metaDataType = await Sdk.metaIndexKeyType(tabel.key);
             await NXUI.ref.set("mergeTabel", {
              id:String(tabel.key),
              ...tabel,
              ...metaDataType
             });
           }

       }




   
  // Daftar tabel sistem yang dilindungi
  const protectedTables = ['wilayah', 'news', 'user', 'demo', 'approval', 'visitors', 'drive'];
  
  const tableRows = mergeTabel.data.map((item, index) => {
    const isProtected = protectedTables.includes(item.table_name);
    const protectedBadge = isProtected ? '<span style="background:#ffc107;color:#000;padding:2px 6px;border-radius:3px;font-size:10px;margin-left:5px;">🔒 SISTEM</span>' : '';
    const deleteButton = isProtected 
      ? `<a href="javascript:void(0);" title="Tabel Sistem (Tidak Dapat Dihapus)" style="color:#999;cursor:not-allowed;" onclick="event.preventDefault();">
           <span class="material-symbols-outlined nx-icon-md">lock</span>
         </a>`
      : `<a href="javascript:void(0);" onclick="deleteMergeTabelTabel('${item.key}','${storage.id}')" title="Delete Tabel">
           <span class="material-symbols-outlined nx-icon-md">delete</span>
         </a>`;
    
    return `
    <tr>
      <td>${index + 1}</td>
      <td>${item.table_name}${protectedBadge}</td>
      <td>${item.key}</td>
      <td>${item.fieldCount}</td>
      <td class="tx-right">
      
         <a  href="javascript:void(0);" onclick="addMergeTabel('${item.key}','${storage.id}')" title="Add Column" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">add</span>
         </a>

         <a  href="javascript:void(0);" onclick="settingsMergeTabelFailed('${item.key}','${storage.id}')" title="Settings" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">settings</span>
         </a>
          
         <a  href="javascript:void(0);" onclick="saveMergeTabel('${item.key}','${storage.id}')" title="Save Changes" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">save</span>
         </a>
       ${deleteButton}

      </td>
    </tr>
  `;
  }).join('');

  return {
    title: "Properti",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `

      <small class="text-muted">${mergeTabel?.data?.length} Tabel View</small>

  <small class="text-muted align-right">
   <button onclick="updateBucketTabel('${storage.id}');" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>




        `,
    html:`
      <table class="nx-table nx-table-sm">
  <thead>
    <tr>
      <th>No</th>
      <th>Tabel</th>
      <th>Key</th>
      <th>Field Count</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${tableRows}
  </tbody>
</table>
      `,
  };
}

nx.updateBucketTabel = async function (id) {
    const Sdk = new NXUI.Buckets(id);
    const storage = await Sdk.storage();
    const metaData = await Sdk.metaData();
    
    for (const tabel of metaData) {
       const metaDataType = await Sdk.metaIndexKeyType(tabel.key);
       const tabelId = String(tabel.key);
       const tableName = tabel.label || tabel.table_name || metaDataType?.table_name || 'unknown';
       
       // Gunakan mergeData agar tidak menghapus variabel yang sudah ada (results, fieldSettings, dll)
       await NXUI.ref.mergeData("mergeTabel", tabelId, {
        id: tabelId,
        ...tabel,
        ...metaDataType
       }, {
         deepMerge: true,
         createIfNotExists: true
       });
    }
    
    // Update storage reference
    NXUI.storageDB = storage;
    
    await renderingMergeTabel();
}
nx.addMergeTabel = async function (tabel, id) {
  const metaData = await NXUI.ref.get("mergeTabel", String(tabel));
  
  // Helper function untuk membuat option
  const createOption = (value, label) => {
    return `<option value="${value}">${label}</option>`;
  };
  
  const modalID = "add_field_" + tabel;
  NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-600px",
    minimize: true,
    label: `Add New Field to ${metaData.table_name}`,
    getFormBy: ["name"],
    getValidationBy: ["name"],
    setDataBy: metaData,
    onclick: {
      title: "Add Field",
      cancel: "Cancel",
      send: "saveAddMergeTabelField",
    },
    content:`
      <div class="nx-row">
        <div class="nx-col-4">
          <div class="form-nexa-group">
            <label>Field Name</label>
            <input type="text" name="field_name" class="form-nexa-control-sm" placeholder="Enter field name" required />
            <input type="hidden" value="${tabel}" name="tabel_key" />
          </div>
        </div>
        <div class="nx-col-3">
          <div class="form-nexa-group">
            <label>Type</label>
            <select name="field_type" class="form-nexa-control-sm">
              ${createOption('VARCHAR', 'VARCHAR - Variable-length string')}
              
              <optgroup label="Numeric">
                ${createOption('INT', 'INT - Integer (4 bytes)')}
                ${createOption('TINYINT', 'TINYINT - Very small integer (1 byte)')}
                ${createOption('SMALLINT', 'SMALLINT - Small integer (2 bytes)')}
                ${createOption('MEDIUMINT', 'MEDIUMINT - Medium integer (3 bytes)')}
                ${createOption('BIGINT', 'BIGINT - Large integer (8 bytes)')}
                ${createOption('DECIMAL', 'DECIMAL - Fixed-point number')}
                ${createOption('NUMERIC', 'NUMERIC - Fixed-point number')}
                ${createOption('FLOAT', 'FLOAT - Floating-point number')}
                ${createOption('DOUBLE', 'DOUBLE - Double-precision float')}
                ${createOption('REAL', 'REAL - Real number')}
              </optgroup>
              
              <optgroup label="String">
                ${createOption('CHAR', 'CHAR - Fixed-length string')}
                ${createOption('TEXT', 'TEXT - Long text')}
                ${createOption('TINYTEXT', 'TINYTEXT - Very small text (255 chars)')}
                ${createOption('MEDIUMTEXT', 'MEDIUMTEXT - Medium text (16MB)')}
                ${createOption('LONGTEXT', 'LONGTEXT - Large text (4GB)')}
              </optgroup>
              
              <optgroup label="Date & Time">
                ${createOption('DATE', 'DATE - Date (YYYY-MM-DD)')}
                ${createOption('TIME', 'TIME - Time (HH:MM:SS)')}
                ${createOption('DATETIME', 'DATETIME - Date and time')}
                ${createOption('TIMESTAMP', 'TIMESTAMP - Timestamp')}
                ${createOption('YEAR', 'YEAR - Year (4 digits)')}
              </optgroup>
              
              <optgroup label="Binary">
                ${createOption('BINARY', 'BINARY - Fixed-length binary')}
                ${createOption('VARBINARY', 'VARBINARY - Variable-length binary')}
                ${createOption('BLOB', 'BLOB - Binary large object')}
                ${createOption('TINYBLOB', 'TINYBLOB - Very small blob')}
                ${createOption('MEDIUMBLOB', 'MEDIUMBLOB - Medium blob')}
                ${createOption('LONGBLOB', 'LONGBLOB - Large blob')}
              </optgroup>
              
              <optgroup label="Other">
                ${createOption('ENUM', 'ENUM - Enumeration')}
                ${createOption('SET', 'SET - Set of values')}
                ${createOption('JSON', 'JSON - JSON data')}
                ${createOption('BOOLEAN', 'BOOLEAN - Boolean (0 or 1)')}
              </optgroup>
            </select>
          </div>
        </div>
        <div class="nx-col-2">
          <div class="form-nexa-group">
            <label>Length</label>
            <input name="field_length" type="number" class="form-nexa-control-sm" value="255" />
          </div>
        </div>
        <div class="nx-col-3">
          <div class="form-nexa-group">
            <label>Default</label>
            <select name="field_default" class="form-nexa-control-sm">
              ${createOption('NULL', 'NULL')}
              ${createOption('NONE', 'None')}
              ${createOption('USER_DEFINED', 'As defined:')}
              ${createOption('CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP')}
            </select>
          </div>
        </div>
      </div>
    `,
  });
  NXUI.nexaModal.open(modalID);
};

nx.settingsMergeTabelFailed = async function (tabel,id) {
   const metaData = await NXUI.ref.get("mergeTabel", String(tabel));

   // Helper function untuk membuat option dengan selected
   const createOption = (value, label, selectedValue) => {
     const selected = value === selectedValue ? 'selected' : '';
     return `<option value="${value}" ${selected}>${label}</option>`;
   };

   // Generate form fields from variables
   const variablesArray = Object.values(metaData.variables || {});
   
   // Filter out excluded fields
   const excludedFields = ['id', 'userid', 'created_at', 'updated_at', 'row'];
   const filteredVariables = variablesArray.filter(field => !excludedFields.includes(field.name));
   
   let template = "";
   
   filteredVariables.forEach((field) => {
     const savedType = field.type ? field.type.toUpperCase() : 'VARCHAR';
     const savedLength = field.length || 25;
     const savedDefault = field.default || 'NULL';
     
     template += `

  <div class="nx-row" id="${field.name}">
  <div class="nx-col-4">
    <div class="form-nexa-group">
      <label>Name</label>
      <input type="text" value="${field.name}" name="field" class="form-nexa-control-sm" readonly />
      <input type="hidden" value="${tabel}" name="key" class="form-nexa-control-sm" readonly />
    </div>
  </div>
  <div class="nx-col-3">
    <div class="form-nexa-group">
      <label>Type</label>
       <select name="${field.name}_type" class="form-nexa-control-sm">
        ${createOption('VARCHAR', 'VARCHAR - Variable-length string', savedType)}
        
        <!-- Numeric Types -->
        <optgroup label="Numeric">
          ${createOption('INT', 'INT - Integer (4 bytes)', savedType)}
          ${createOption('TINYINT', 'TINYINT - Very small integer (1 byte)', savedType)}
          ${createOption('SMALLINT', 'SMALLINT - Small integer (2 bytes)', savedType)}
          ${createOption('MEDIUMINT', 'MEDIUMINT - Medium integer (3 bytes)', savedType)}
          ${createOption('BIGINT', 'BIGINT - Large integer (8 bytes)', savedType)}
          ${createOption('DECIMAL', 'DECIMAL - Fixed-point number', savedType)}
          ${createOption('NUMERIC', 'NUMERIC - Fixed-point number', savedType)}
          ${createOption('FLOAT', 'FLOAT - Floating-point number', savedType)}
          ${createOption('DOUBLE', 'DOUBLE - Double-precision float', savedType)}
          ${createOption('REAL', 'REAL - Real number', savedType)}
        </optgroup>
        
        <!-- String Types -->
        <optgroup label="String">
          ${createOption('CHAR', 'CHAR - Fixed-length string', savedType)}
          ${createOption('TEXT', 'TEXT - Long text', savedType)}
          ${createOption('TINYTEXT', 'TINYTEXT - Very small text (255 chars)', savedType)}
          ${createOption('MEDIUMTEXT', 'MEDIUMTEXT - Medium text (16MB)', savedType)}
          ${createOption('LONGTEXT', 'LONGTEXT - Large text (4GB)', savedType)}
        </optgroup>
        
        <!-- Date and Time Types -->
        <optgroup label="Date & Time">
          ${createOption('DATE', 'DATE - Date (YYYY-MM-DD)', savedType)}
          ${createOption('TIME', 'TIME - Time (HH:MM:SS)', savedType)}
          ${createOption('DATETIME', 'DATETIME - Date and time', savedType)}
          ${createOption('TIMESTAMP', 'TIMESTAMP - Timestamp', savedType)}
          ${createOption('YEAR', 'YEAR - Year (4 digits)', savedType)}
        </optgroup>
        
        <!-- Binary Types -->
        <optgroup label="Binary">
          ${createOption('BINARY', 'BINARY - Fixed-length binary', savedType)}
          ${createOption('VARBINARY', 'VARBINARY - Variable-length binary', savedType)}
          ${createOption('BLOB', 'BLOB - Binary large object', savedType)}
          ${createOption('TINYBLOB', 'TINYBLOB - Very small blob', savedType)}
          ${createOption('MEDIUMBLOB', 'MEDIUMBLOB - Medium blob', savedType)}
          ${createOption('LONGBLOB', 'LONGBLOB - Large blob', savedType)}
        </optgroup>
        
        <!-- Other Types -->
        <optgroup label="Other">
          ${createOption('ENUM', 'ENUM - Enumeration', savedType)}
          ${createOption('SET', 'SET - Set of values', savedType)}
          ${createOption('JSON', 'JSON - JSON data', savedType)}
          ${createOption('BOOLEAN', 'BOOLEAN - Boolean (0 or 1)', savedType)}
        </optgroup>
   
      </select>
    </div>
  </div>
  <div class="nx-col-2">
    <div class="form-nexa-group">
      <label>Len/Val</label>
      <input name="${field.name}_length" type="number" class="form-nexa-control-sm" value="${savedLength}" />
    </div>
  </div>

  <div class="nx-col-2">
    <div class="form-nexa-group">
      <label>Default</label>
       <select name="${field.name}_default" class="form-nexa-control-sm">
        ${createOption('NULL', 'NULL', savedDefault)}
        ${createOption('NONE', 'None', savedDefault)}
        ${createOption('USER_DEFINED', 'As defined:', savedDefault)}
        ${createOption('CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP', savedDefault)}
      </select>
    </div>
  </div>

  <div class="nx-col-1">
    <div class="form-nexa-group ">
      <label></label>
      <div style="padding-top:8px;text-align:right;">
        <a href="javascript:void(0);" onclick="deleteMergeTabelField('${tabel}','${field.name}','${id}')" title="Delete Field" style="color:#ff4444">
          <span class="material-symbols-outlined nx-icon-md">delete</span>
        </a>
      </div>
    </div>
  </div>
  </div>



        `;
   });

   const modalID = "group_" + tabel;
     NXUI.modalHTML({
       elementById: modalID,
       styleClass: "w-600px",
       minimize: true,
       label: `Settings Failed Tabel ${metaData.table_name}`,
       getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
       // Select: ["#groupbySelect"],
       getValidationBy: ["name"], // ✅ Standard validation approach
       setDataBy: tabel, // ✅ Standard validation approach
       onclick: {
         title: "Save View",
         cancel: "Cancel",
         send: "saveSettingsTabelByFailed", // ✅ Use namespaced function name
       },
       content:`
        <div class="nx-row">
          <div class="nx-col-12">
           ${template}
          </div>
          
        </div>
         ` ,
     });
     NXUI.nexaModal.open(modalID);
}
nx.saveSettingsTabelByFailed = async function (modalID, data, tabel) {
     const metaData = await NXUI.ref.get("mergeTabel", String(tabel));
  // Update variables dengan data dari form
  Object.keys(metaData.variables).forEach((fieldName) => {
    const typeKey = `${fieldName}_type`;
    const lengthKey = `${fieldName}_length`;
    const defaultKey = `${fieldName}_default`;
    
    // Update type jika ada di form data
    if (data[typeKey]) {
      metaData.variables[fieldName].type = data[typeKey].toLowerCase();
    }
    
    // Update length jika ada di form data
    if (data[lengthKey]) {
      metaData.variables[fieldName].length = parseInt(data[lengthKey]) || null;
    }
    
    // Update default jika ada di form data
    if (data[defaultKey]) {
      metaData.variables[fieldName].default = data[defaultKey] === 'NULL' ? null : data[defaultKey];
    }
  });
  
  // Save to storage - use metaData.id (string)
  const tabelId = metaData.id;
  await NXUI.ref.mergeData("mergeTabel", tabelId, metaData);
  
  NXUI.nexaModal.close(modalID);
}

nx.saveAddMergeTabelField = async function (modalID, data, metaData) {
  const fieldName = data.field_name.trim();
  const tabel = String(data.tabel_key);
  
  // Validasi field name
  if (!fieldName) {
    return;
  }
  
  // Get metadata terbaru
  const currentMetaData = await NXUI.ref.get("mergeTabel", tabel);
  
  // Tambahkan field baru ke variables
  if (!currentMetaData.variables) {
    currentMetaData.variables = {};
  }
  
  currentMetaData.variables[fieldName] = {
    name: fieldName,
    type: data.field_type.toLowerCase(),
    length: parseInt(data.field_length) || null,
    default: data.field_default === 'NULL' ? null : data.field_default,
    nullable: 'YES',
    key_type: '',
    extra: ''
  };
  
  // Update field count
  currentMetaData.fieldCount = Object.keys(currentMetaData.variables).length;
  
  // Save to storage
  const tabelId = currentMetaData.id;
  await NXUI.ref.mergeData("mergeTabel", tabelId, currentMetaData);
  
  // Close modal
  NXUI.nexaModal.close(modalID);
};

nx.saveMergeTabel = async function (tabel,id) {
  const currentMetaData = await NXUI.ref.get("mergeTabel", String(tabel));
  const server={
    tableName:currentMetaData?.table_name,
    variables:currentMetaData?.variables
  }
  
  const alterResult = await NXUI.Storage().models("Office").buckMergeTabel(server);
  
  // Simpan hasil ke metadata
  if (alterResult?.data) {
    currentMetaData.results = alterResult.data.results;
    
    // Save to storage
    const tabelId = currentMetaData.id;
    await NXUI.ref.mergeData("mergeTabel", tabelId, currentMetaData);
  }
}

nx.deleteMergeTabelField = async function (tabel, fieldName, id) {
  const tabelId = String(tabel);
  
  // Get current metadata
  const metaData = await NXUI.ref.get("mergeTabel", tabelId);
  
  // Remove field from variables
  if (metaData.variables && metaData.variables[fieldName]) {
    delete metaData.variables[fieldName];
    
    // Update metadata
    await NXUI.ref.mergeData("mergeTabel", tabelId, metaData);
    
    // Refresh modal
    NXUI.id(fieldName).remove();
  }
};

nx.deleteMergeTabelTabel = async function (tabel,id) {
  const tabelId = String(tabel);
  
  // Get metadata
  const currentMetaData = await NXUI.ref.get("mergeTabel", tabelId);
  
  if (!currentMetaData) {
    return;
  }
  
  // Daftar tabel sistem yang tidak boleh dihapus
  const protectedTables = ['wilayah', 'news', 'user', 'demo', 'approval', 'visitors', 'drive'];
  const tableName = currentMetaData?.table_name || currentMetaData?.label;
  
  // Validasi: cek apakah tabel termasuk protected table
  if (protectedTables.includes(tableName)) {
    // Tampilkan notifikasi ke user
    NXUI.nexaModal.alert({
      title: '🚫 Tidak Dapat Menghapus Tabel',
      message: `Tabel <strong>"${tableName}"</strong> adalah tabel sistem dan tidak dapat dihapus.<br><br>Tabel yang dilindungi: ${protectedTables.join(', ')}`,
      type: 'warning'
    });
    
    return;
  }
  
  // Prepare data untuk drop table
  const server = {
    tabelName: tableName
  };
  
  // Call dropbuckMergeTabel API
  const dropResult = await NXUI.Storage().models("Office").dropbuckMergeTabel(server);
  
  if (dropResult?.data?.success) {
    // Hapus dari storage juga
    await NXUI.ref.delete("mergeTabel", tabelId);
    
    // Refresh tampilan dengan renderingMergeTabel
    const Sdk = new NXUI.Buckets(id);
    await renderingMergeTabel(await Sdk.storage());
  }
}
export async function Guide(height) {
  return {
    title: "Panduan Alter Tabel",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Ikuti langkah-langkah secara berurutan .
    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Pilih Tabel yang Akan Di-Merge</strong>
              <p class="mb-2">Lihat daftar tabel di kolom "Properti". Setiap tabel menampilkan:
              <br>• <strong>Table Name:</strong> Nama tabel di database
              <br>• <strong>Field Count:</strong> Jumlah kolom dalam tabel
              <br>• Tombol aksi untuk pengaturan dan operasi</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Lihat & Edit Struktur Field</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">settings</span> untuk melihat dan mengedit field tabel:
              <br>• <strong>Name:</strong> Nama field (read-only)
              <br>• <strong>Type:</strong> Tipe data (VARCHAR, INT, TEXT, DATE, ENUM, dll)
              <br>• <strong>Length:</strong> Panjang maksimal data (untuk VARCHAR, INT, dll)
              <br>• <strong>Default:</strong> Nilai default (NULL, NONE, USER_DEFINED, CURRENT_TIMESTAMP)
              <br>• Field sistem (<code>id</code>, <code>userid</code>, <code>created_at</code>, <code>updated_at</code>, <code>row</code>) tidak ditampilkan</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Hapus Field yang Tidak Diperlukan</strong>
              <p class="mb-2">Di modal Settings:
              <br>• Klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">delete</span> di samping field untuk menghapusnya
              <br>• Field akan dihapus dari metadata dan akan di-DROP saat save
              <br>• <strong>Perhatian:</strong> Penghapusan bersifat permanen!</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Tambah Field Baru</strong>
              <p class="mb-2">Klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">add</span> <strong>"Add Column"</strong> untuk menambah field:
              <br>• <strong>Field Name:</strong> Nama field baru (wajib diisi)
              <br>• <strong>Type:</strong> Pilih tipe data dari dropdown
              <br>• <strong>Length:</strong> Panjang data (default: 255)
              <br>• <strong>Default:</strong> Nilai default untuk field baru
              <br>Field baru akan otomatis muncul di modal Settings</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Simpan Perubahan ke Database</strong>
              <p class="mb-2">Klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">save</span> <strong>"Save"</strong> untuk menerapkan perubahan:
              <br>Sistem akan otomatis menjalankan:
              <br>• <strong>ADD COLUMN</strong> untuk field baru
              <br>• <strong>MODIFY COLUMN</strong> untuk perubahan type/length/default
              <br>• <strong>DROP COLUMN</strong> untuk field yang dihapus
              <br>Hasil perubahan akan disimpan di metadata tabel</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6. Hapus Tabel (Opsional)</strong>
              <p class="mb-2">Klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">delete</span> <strong>"Delete Tabel"</strong> untuk menghapus tabel:
              <br>• Tabel akan di-DROP dari database dengan <code>DROP TABLE IF EXISTS</code>
              <br>• Metadata tabel akan dihapus dari IndexedDB
              <br>• <strong>PERINGATAN:</strong> Tabel dan semua datanya akan hilang permanen!</p>
            </div>
          </div>
          
          <div class="nx-step mb-2" style="background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 3px solid #007bff;">
            <div class="nx-step-content">
              <strong>📌 Tipe Data SQL yang Tersedia:</strong>
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                <li><strong>Numeric:</strong> INT, BIGINT, TINYINT, SMALLINT, MEDIUMINT, DECIMAL, FLOAT, DOUBLE</li>
                <li><strong>String:</strong> VARCHAR, CHAR, TEXT, TINYTEXT, MEDIUMTEXT, LONGTEXT</li>
                <li><strong>Date/Time:</strong> DATE, DATETIME, TIMESTAMP, TIME, YEAR</li>
                <li><strong>Other:</strong> ENUM, SET, JSON, BLOB, BOOLEAN, BINARY</li>
              </ul>
            </div>
          </div>
          
          <div class="nx-step mb-2" style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 3px solid #ffc107;">
            <div class="nx-step-content">
              <strong>⚠️ Catatan Penting:</strong>
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                <li>Field sistem tidak dapat diedit atau dihapus</li>
                <li>Pastikan tipe data dan length sesuai dengan data yang akan disimpan</li>
                <li>ENUM dan SET akan menggunakan nilai default jika diubah</li>
                <li>TIMESTAMP dengan NOT NULL memerlukan default value yang valid</li>
                <li>Backup data penting sebelum menghapus field atau tabel</li>
              </ul>
            </div>
          </div>
        
        </div>
      </div>
      </div>
    `,
  };
}
export async function renderingMergeTabel() {
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(NXUI.storageDB, setMergeTabel, {
    containerSelector: ["#setMergeTabel"],
  });
}
