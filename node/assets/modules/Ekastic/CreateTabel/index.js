
export async function setCreateTabel(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const tabel = await Sdk.metaData();

     const metadata = await NXUI.ref.get("createTabel", "metadata");
     console.log('metadata:', metadata);
     if (!metadata?.outputId) {
        const getTabelView = await NXUI.Storage().models("Office").getCreateTabel({
            tabel:true
         });
         console.log('getTabelView:', getTabelView);
         
         // Check if response exists and is an array
         if (getTabelView?.data?.response && Array.isArray(getTabelView.data.response)) {
           for (const tabel of getTabelView.data.response) {
             await NXUI.ref.set("createTabel", tabel);
           }
         } else {
           console.warn('⚠️ No table data found or invalid response format');
         }

     }
     
     // Store bucket ID in metadata for future reference
     if (metadata && !metadata.bucketId) {
         await NXUI.ref.mergeData("createTabel", "metadata", {
             bucketId: data.id
         }, {
             deepMerge: true,
             createIfNotExists: true
         });
     }

     
    const dimensi = new NXUI.NexaDimensi();
   
    const height = dimensi.height("#nexa_app", 220, 'vh');
    
    // Store both Sdk and id for later use
    NXUI.FormIndexData = storage;
    NXUI.SDKData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="setabelView">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Create Tabel</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div  class="pr-10px">
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
          </div>
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
          content: [await FailedTags(Sdk,height), await konfigurasi(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
         await tabelEdit(Sdk);
         new NXUI.NexaTags({
          targetId: ["dropdown"],
          hideValue: ["action"],
          data: false,  // Mode bebas input (bisa menulis tag baru)
          close: false, 
          validasi: [20],
          onChange: async (changeData) => {
           await addtagssJoin(changeData,storage)
          }
        });



      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function FailedTags(Sdk,height) {

  const metadata = await NXUI.ref.get("createTabel", "metadata");
   const variabel=metadata?.array || [];
  console.log('metadata:', variabel?.length);
   const failed=metadata?.value ? `value="${metadata?.value}"` :'';
    // Gunakan NXUI.SDKData yang sudah disimpan, atau Sdk jika tersedia
    const sdkInstance = NXUI.SDKData || Sdk;
    const tabel = await sdkInstance.metaData();
const tabelTangs = tabel.map(item => item.label).join("|");
  let tabelHtml = `

<div class="form-nexa-group">
  <input type="text" id="dropdown" ${failed} class="form-nexa-control" name="dropdown" placeholder="Ketik nama tabel baru dan tekan Enter..." />
</div>
<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th>Tabel</th>
      <th>Index</th>
      <th>Oprasi</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${
      variabel && variabel.length > 0
        ? (await Promise.all(
            variabel.map(async(item, index) => {   
                const row = await NXUI.ref.get("createTabel",item);
              console.log('row:', row);
                const setSave=row?.oprasi ? 'saveConnection':'saveCreateTabel';
                return `
      <tr>
   
     <td>${item}</td>
     <td>
<span 
  class="editable" 
  id="${item}"
  type="tags-input"
  name="tabel"        
  data-min-tags="1"
  data-max-tags="20"
  label="Failed"
  icon="label">
${row?.tabel||'Null'}
</span></td>

     <td>
 <div class="nx-switch-item">
    <input type="checkbox" id="switch2" ${row?.tableCreated ?' checked':''}/>
    <label for="switch2">
      <span class="nx-switch"></span>
    </label>
  </div>

     </td>
     <td class="text-right">

         <a  href="javascript:void(0);" onclick="settingsFailed('${item}')" title="Settings" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">settings</span>
         </a>

          <a  href="javascript:void(0);" onclick="saveCreateTabel('${item}')" title="Save View" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">save</span>
         </a>

          
     
       <a  href="javascript:void(0);" onclick="deleteTabel('${item}')" title="Delete View" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">delete</span>
         </a>
     </td>
       </tr>
    `;
            })
          )).join("")
        : "<tr></tr>"
    }
  </tbody>
</table>
   `;
  return {
    title: "Properti",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `

      <small class="text-muted">${variabel?.length} Tabel View</small>

  <small class="text-muted align-right">
   <button onclick="updateBucketCreateTabel();" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>




        `,
    html: `
     <div style="padding-top:4px">
      ${tabelHtml}
     </div>
    `,
  };
}

export async function konfigurasi(data,height) {
  return {
    title: "Panduan Create Table",
    col: "nx-col-4",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Ikuti langkah-langkah secara berurutan untuk hasil terbaik. Tabel akan otomatis ter-update jika ada perubahan struktur.
    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Buat Tabel Baru</strong>
              <p class="mb-2">Ketik nama tabel di input field dan tekan <strong>Enter</strong>. Tabel akan muncul di daftar "Properti".</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Atur Struktur Tabel</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">settings</span> untuk mengatur field tabel:
              <br>• <strong>Name:</strong> Nama field (contoh: nama_produk, harga)
              <br>• <strong>Type:</strong> Tipe data SQL (VARCHAR, INT, TEXT, DATE, dll)
              <br>• <strong>Length/Values:</strong> Panjang data (untuk VARCHAR, INT, dll)
              <br>• <strong>Default:</strong> Nilai default (NULL, angka, atau teks)
              <br>• Gunakan tombol <strong>+ Add Field</strong> untuk menambah field baru</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Simpan Tabel</strong>
              <p class="mb-2">Klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">save</span> <strong>"Save"</strong> untuk membuat tabel di database. Setiap tabel otomatis memiliki field:
              <br>• <strong>id</strong> (Primary Key, Auto Increment)
              <br>• <strong>userid</strong> (VARCHAR 11)
              <br>• <strong>row</strong> (ENUM '1')
              <br>• <strong>updated_at</strong> (Timestamp, auto update)
              <br>• <strong>created_at</strong> (Timestamp)</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Edit Struktur Tabel (Auto ALTER TABLE)</strong>
              <p class="mb-2">Untuk mengubah struktur tabel yang sudah dibuat:
              <br>1. Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">settings</span> pada tabel
              <br>2. Tambah, ubah, atau hapus field
              <br>3. Klik <strong>Save</strong>
              <br><br>Sistem akan otomatis mendeteksi perubahan dan menjalankan:
              <br>• <strong>ADD COLUMN</strong> untuk field baru
              <br>• <strong>MODIFY COLUMN</strong> untuk perubahan type/length
              <br>• <strong>DROP COLUMN</strong> untuk field yang dihapus</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Hapus Tabel</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">delete</span> untuk menghapus tabel. <strong>Perhatian:</strong> Tabel dan semua datanya akan terhapus permanen dari database!</p>
            </div>
          </div>
          
          <div class="nx-step mb-2" style="background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 3px solid #007bff;">
            <div class="nx-step-content">
              <strong>📌 Tipe Data SQL Umum:</strong>
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                <li><strong>Numeric:</strong> INT, BIGINT, DECIMAL, FLOAT, DOUBLE</li>
                <li><strong>String:</strong> VARCHAR, CHAR, TEXT, MEDIUMTEXT, LONGTEXT</li>
                <li><strong>Date/Time:</strong> DATE, DATETIME, TIMESTAMP, TIME, YEAR</li>
                <li><strong>Other:</strong> ENUM, SET, JSON, BLOB, BOOLEAN</li>
              </ul>
            </div>
          </div>
        
        </div>
      </div>
      </div>
    `,
  };
}

export async function renderCreateTabel() {
  await NXUI.NexaRender.refresh(NXUI.FormIndexData, setCreateTabel, {
    containerSelector: ["#setCreateTabel"],
  });
}

// Export ke window untuk akses dari file lain
if (typeof window !== 'undefined') {
  window.renderCreateTabel = renderCreateTabel;
}
export async function addtagssJoin(changeData,storage) {
  try {
    // Ambil metadata yang sudah ada terlebih dahulu untuk mempertahankan field yang sudah ada
    const existingMetadata = await NXUI.ref.get("createTabel", "metadata") || {};
    
    // CARA MUDAH: Simpan setiap key sebagai record terpisah dengan ID = key itu sendiri
    // Gunakan mergeData untuk setiap key - otomatis create/update (parallel processing)
    // Pastikan data yang sudah ada (seperti oprasi, tabel, dll) tidak terhapus
    await Promise.all(
      changeData.array.map(async key => {
        // Ambil data yang sudah ada untuk mempertahankan field yang sudah ada
        const existingData = await NXUI.ref.get("createTabel", key) || {};
        
        // Merge data baru dengan data yang sudah ada
        return NXUI.ref.mergeData("createTabel", key, {
          ...existingData, // Pertahankan semua field yang sudah ada
          id: key,
          label: key,
          updatedAt: new Date().toISOString()
        }, { 
          deepMerge: true, // Deep merge memastikan field nested yang sudah ada tidak terhapus
          createIfNotExists: true // Otomatis create jika belum ada
        });
      })
    );
    
    // Merge metadata: gabungkan data yang sudah ada dengan data baru
    // Pastikan field yang sudah ada (seperti field dari tabel yang sudah dibuat) tidak terhapus
    // Hanya update field yang ada di changeData, pertahankan field lain yang sudah ada
    
    // Simpan metadata dengan merge yang aman - deepMerge memastikan field yang sudah ada tidak terhapus
    // mergeData akan otomatis merge dengan data yang sudah ada, tidak replace seluruhnya
    await NXUI.ref.mergeData("createTabel", "metadata", {
      id: "metadata",
      ...changeData, // Hanya field yang ada di changeData yang akan di-update
      updatedAt: new Date().toISOString()
    }, { 
      deepMerge: true, // Deep merge memastikan field nested yang sudah ada tidak terhapus
      createIfNotExists: true // Create jika belum ada
    });
    
    await renderCreateTabel();
    // Re-render using stored id

  } catch (error) {
    console.error('❌ Error in addtagssJoin:', error);
    throw error;
  }
};
 
nx.settingsFaildTags = async function (tabel) {
    const metadata = await NXUI.ref.get("createTabel", tabel); 
    console.log('metadata:', metadata);
    const modalID = "settingsFaildTags_" + tabel;
    
    // Extract semua field yang digunakan di oprasi (index dan target)
    const fieldsInOprasi = new Set();
    const oprasi = metadata?.oprasi || [];
    
    oprasi.forEach(operation => {
        // Oprasi format: [{"user": {"type": "inner", "index": "demo.userid", "target": "user.id"}}]
        Object.values(operation).forEach(joinData => {
            const index = joinData.index || '';
            const target = joinData.target || '';
            
            // Tambahkan index dan target ke set (trim untuk exact match)
            if (index) fieldsInOprasi.add(index.trim());
            if (target) fieldsInOprasi.add(target.trim());
        });
    });
    
    // Filter failedAS: hanya tampilkan field yang TIDAK digunakan di oprasi
    const failedAS = metadata?.failedAS || [];
    const availableFields = failedAS.filter(field => {
        const fieldTrimmed = field.trim();
        // Cek apakah field ini digunakan di oprasi (sebagai index atau target)
        // Field format: "demo.userid AS userid " atau "user.id AS id1 "
        // Ambil bagian sebelum "AS" untuk matching
        const fieldBeforeAS = fieldTrimmed.split(' AS ')[0].trim();
        return !fieldsInOprasi.has(fieldBeforeAS);
    });
    
    let templateField = "";

    // Tampilkan hanya field yang tidak digunakan di oprasi
    availableFields.forEach((field, index) => {
      // Gunakan index dari failedAS asli untuk ID yang konsisten
      const originalIndex = failedAS.indexOf(field);
      templateField += `
        <li class="nx-list-item" id="id${originalIndex}">
        ${field}
          <a class="pull-right" onclick="removeGroupByField('${field}','${tabel}','${originalIndex}');" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
          </a>
        </li>
      `;
    });



    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-500px",
      minimize: true,
      label: `Group By Field ${tabel}`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      // Select: ["#groupbySelect"],
      getValidationBy: ["name"], // ✅ Standard validation approach
      setDataBy: metadata, // ✅ Standard validation approach
      onclick:false,
      content:templateField,
    });
    NXUI.nexaModal.open(modalID);
    NXUI.id("body_"+modalID).setStyle("padding", "0px")


}

nx.removeGroupByField = async function (field, tabel, id) {
  const metadata = await NXUI.ref.get("createTabel", tabel);

  const failedAS = metadata?.failedAS || [];

  // Filter hapus field dengan exact match (bukan includes yang bisa match partial)
  // Trim kedua string untuk memastikan perbandingan yang tepat
  const result = failedAS.filter(item => {
    const itemTrimmed = item.trim();
    const fieldTrimmed = field.trim();
    // Exact match untuk menghindari false positive (misalnya "id" tidak menghapus "userid")
    return itemTrimmed !== fieldTrimmed;
  });

  // Simpan kembali metadata yg sudah diperbarui
  await NXUI.ref.mergeData("createTabel", tabel, {
    ...metadata,
    failedAS: result
  }, {
    deepMerge: true,
    createIfNotExists: true
  });

  // Hapus element UI
  NXUI.id("id" + id).remove();
  
  // Refresh view untuk menampilkan perubahan
  await renderCreateTabel();
};

nx.settingsFailed = async function (tabel) {
  const metadata = await NXUI.ref.get("createTabel", tabel);
  console.log('metadata:', metadata?.tableStructure);

  const tabelFailed = metadata.tabel.split(",").map(v => v.trim());
  console.log('Failed:', tabelFailed);
  
  // Buat mapping dari tableStructure untuk akses cepat ke nilai yang sudah disimpan
  const savedStructure = {};
  if (metadata?.tableStructure && Array.isArray(metadata.tableStructure)) {
    metadata.tableStructure.forEach(item => {
      const fieldName = Object.keys(item)[0];
      savedStructure[fieldName] = item[fieldName];
    });
  }
  console.log('Saved Structure:', savedStructure);

  // Helper function untuk membuat option dengan selected
  const createOption = (value, label, selectedValue) => {
    const selected = value === selectedValue ? 'selected' : '';
    return `<option value="${value}" ${selected}>${label}</option>`;
  };

  let template = "";
  if (tabelFailed && Array.isArray(tabelFailed)) {
    tabelFailed.forEach((row) => {
      // Ambil nilai yang sudah disimpan untuk field ini
      const savedData = savedStructure[row] || {};
      const savedType = savedData.type || 'VARCHAR';
      const savedLength = savedData.length || 25;
      const savedDefault = savedData.default || 'NULL';
      
      template += `
  <div class="nx-col-3">
    <div class="form-nexa-group">
      <label>Name Failed</label>
      <input type="text" value="${row}" name="${row}" class="form-nexa-control" readonly />
    </div>
  </div>
  <div class="nx-col-3">
    <div class="form-nexa-group">
      <label>Type</label>
       <select name="${row}_type" class="form-nexa-control">
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
  <div class="nx-col-3">
    <div class="form-nexa-group">
      <label>Length/Values</label>
      <input name="${row}_length" type="number" class="form-nexa-control" value="${savedLength}" />
    </div>
  </div>

  <div class="nx-col-3">
    <div class="form-nexa-group">
      <label>Default</label>
       <select name="${row}_default" class="form-nexa-control">
        ${createOption('NULL', 'NULL', savedDefault)}
        ${createOption('NONE', 'None', savedDefault)}
        ${createOption('USER_DEFINED', 'As defined:', savedDefault)}
        ${createOption('CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP', savedDefault)}
      </select>
    </div>
  </div>



        `;
      });
    }
   const modalID = "group_" + tabel;
     NXUI.modalHTML({
       elementById: modalID,
       styleClass: "w-600px",
       minimize: true,
       label: `Settings Failed ${tabel}`,
       getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
       // Select: ["#groupbySelect"],
       getValidationBy: ["name"], // ✅ Standard validation approach
       setDataBy: metadata, // ✅ Standard validation approach
       onclick: {
         title: "Save View",
         cancel: "Cancel",
         send: "saveTabelByFailed", // ✅ Use namespaced function name
       },
       content:`
        <div class="nx-row">
           ${template}
        </div>
         ` ,
     });
     NXUI.nexaModal.open(modalID);
    

}
 nx.saveTabelByFailed = async function (modalID,data,storage) {
     // Konversi data dari format flat menjadi array of objects yang dikelompokkan per field
     console.log('Original data:', data);
     
     // Kumpulkan semua nama field unik (tanpa suffix _type, _length, _default)
     const fieldNames = new Set();
     
     Object.keys(data).forEach(key => {
       // Cek apakah key memiliki suffix _type, _length, atau _default
       if (key.endsWith('_type') || key.endsWith('_length') || key.endsWith('_default')) {
         // Extract nama field (hapus suffix)
         const fieldName = key.replace(/_type$|_length$|_default$/, '');
         fieldNames.add(fieldName);
       } else {
         // Jika tidak ada suffix, itu adalah nama field itu sendiri
         fieldNames.add(key);
       }
     });
     
     // Konversi Set menjadi Array dan buat object untuk setiap field
     const result = Array.from(fieldNames).map(fieldName => {
       return {
         [fieldName]: {
           type: data[`${fieldName}_type`] || 'VARCHAR',
           length: parseInt(data[`${fieldName}_length`]) || 255,
           default: data[`${fieldName}_default`] || 'NULL'
         }
       };
     });
     
     console.log('Converted result:', result);
     
     // Update metadata dengan struktur tabel SQL
     const updatedMetadata = {
       id: storage.id,
       tableStructure: result,
       updatedAt: new Date().toISOString()
     };

     // Update metadata - mergeData akan create jika tidak ada, update jika sudah ada
     await NXUI.ref.mergeData("createTabel", storage.id, updatedMetadata, {
       deepMerge: true,
       createIfNotExists: true
     });
     
     NXUI.nexaModal.close(modalID);
     await renderCreateTabel();
     
     return result;
 }

 nx.saveCreateTabel  = async function (tabel) {
     try {
         // Ambil metadata terbaru dari IndexedDB
         const metadata = await NXUI.ref.get("createTabel", tabel) || {};
         console.log('saveCreateTabel:', metadata);
         
         // Cek apakah tabel sudah pernah dibuat (ada flag tableCreated)
         const isTableExists = metadata?.tableCreated === true;
         
         if (isTableExists) {
             // Tabel sudah ada, lakukan ALTER TABLE untuk update struktur
             // Bandingkan struktur lama dengan struktur baru
             const oldStructure = metadata?.oldTableStructure || [];
             const newStructure = metadata?.tableStructure || [];
             
             // Jika oldStructure kosong (tabel baru dibuat tapi belum ada oldTableStructure),
             // anggap semua field sebagai field baru
             if (oldStructure.length === 0) {
                 console.log('⚠️ oldTableStructure kosong, akan menambahkan semua field sebagai field baru');
                 // Set oldStructure ke array kosong agar semua field dianggap baru
             }
             
             // Deteksi perubahan
             const changes = detectTableChanges(oldStructure, newStructure);
             
             if (changes.hasChanges) {
                
                 const alterData = {
                     tabelName: metadata?.label,
                     addColumns: changes.addColumns,
                     dropColumns: changes.dropColumns,
                     modifyColumns: changes.modifyColumns
                 };
                 
                 // Panggil ALTER TABLE
                 const alterResult = await NXUI.Storage().models("Office").alterBuckCreateTabel(alterData);
                 console.log('alterResult:', alterResult);
                 
                 if (alterResult.data && alterResult.data.success) {
                     
                     // Update metadata dengan struktur terbaru
                     await NXUI.ref.mergeData("createTabel", tabel, {
                         oldTableStructure: newStructure,
                         results: alterResult.data.results,
                         updatedAt: new Date().toISOString()
                     }, {
                         deepMerge: true,
                         createIfNotExists: true
                     });
                 } else {
                     // Cek apakah error karena tabel tidak ada
                     const error = alterResult.data?.error || '';
                     if (error.includes("doesn't exist") || error.includes("Base table or view not found")) {
                         
                         // Reset flag dan create tabel baru
                         await NXUI.ref.mergeData("createTabel", tabel, {
                             tableCreated: false,
                             oldTableStructure: []
                         }, {
                             deepMerge: true,
                             createIfNotExists: true
                         });
                         
                         // Rekursif call untuk create tabel
                         return await nx.saveCreateTabel(tabel);
                     }
                     
                     throw new Error(alterResult.data?.error || 'Failed to alter table');
                 }
             } else {
                 console.log('ℹ️ Tidak ada perubahan pada struktur tabel');
             }
         } else {
             // Tabel belum ada, buat tabel baru
             const addTabel = {
                 tabelName: metadata?.label,
                 tableStructure: metadata.tableStructure || []
             };
             
             const dataTabel = await NXUI.Storage().models("Office").buckCreateTabel(addTabel);
            
             if (dataTabel.data && dataTabel.data.success) {
                
                 // Cek apakah tabel benar-benar baru dibuat atau sudah ada sebelumnya
                 const isNewTable = dataTabel.data.results.sql !== 'TABLE ALREADY EXISTS';
                 
                 if (isNewTable) {
                     // Tabel baru dibuat, simpan struktur dari tableInfo server
                     const serverTableInfo = dataTabel.data.results.tableInfo || [];
                     
                     // Extract field names dari server (skip default fields)
                     const defaultFields = ['id', 'userid', 'row', 'updated_at', 'created_at'];
                     const serverFields = serverTableInfo
                         .filter(col => !defaultFields.includes(col.Field))
                         .map(col => col.Field);
                     
                     
                     // Set flag bahwa tabel sudah dibuat dan simpan struktur awal
                     await NXUI.ref.mergeData("createTabel", tabel, {
                         tableCreated: true,
                         oldTableStructure: metadata.tableStructure,
                         serverFields: serverFields,
                         results: dataTabel.data.results,
                         createdAt: new Date().toISOString()
                     }, {
                         deepMerge: true,
                         createIfNotExists: true
                     });
                 } else {
                     // Tabel sudah ada sebelumnya, jangan update oldTableStructure
                     console.log('⚠️ Tabel sudah ada, gunakan ALTER TABLE untuk modifikasi');
                 }
             } else {
                 throw new Error(dataTabel.data?.error || 'Failed to create table');
             }
         }
         
         await renderCreateTabel();
         
     } catch (error) {
         console.error('❌ Error in saveCreateTabel:', error);
         // NXUI.notification({
         //     type: 'error',
         //     message: 'Error: ' + (error.message || error)
         // });
         throw error;
     }
 }
 
 // Helper function untuk deteksi perubahan struktur tabel
 function detectTableChanges(oldStructure, newStructure) {
     const changes = {
         hasChanges: false,
         addColumns: [],
         dropColumns: [],
         modifyColumns: []
     };
     
     // Buat mapping untuk akses cepat
     const oldFields = {};
     const newFields = {};
     
     oldStructure.forEach(item => {
         const fieldName = Object.keys(item)[0];
         oldFields[fieldName] = item[fieldName];
     });
     
     newStructure.forEach(item => {
         const fieldName = Object.keys(item)[0];
         newFields[fieldName] = item[fieldName];
     });
     
     // Cek field yang ditambahkan atau dimodifikasi
     Object.keys(newFields).forEach(fieldName => {
         if (!oldFields[fieldName]) {
             // Field baru
             changes.addColumns.push({ [fieldName]: newFields[fieldName] });
             changes.hasChanges = true;
         } else {
             // Cek apakah field dimodifikasi
             const oldField = oldFields[fieldName];
             const newField = newFields[fieldName];
             
             if (JSON.stringify(oldField) !== JSON.stringify(newField)) {
                 // Field dimodifikasi
                 changes.modifyColumns.push({ [fieldName]: newFields[fieldName] });
                 changes.hasChanges = true;
             }
         }
     });
     
     // Cek field yang dihapus
     Object.keys(oldFields).forEach(fieldName => {
         if (!newFields[fieldName]) {
             // Field dihapus
             changes.dropColumns.push(fieldName);
             changes.hasChanges = true;
         }
     });
     
     return changes;
 }

nx.updateBucketCreateTabel = async function () {
        try {
            const tabelStore = await NXUI.ref.getAll("createTabel") || {};
            
            // Get the bucket ID from stored SDK data or metadata
            const metadata = await NXUI.ref.get("createTabel", "metadata");
            const bucketId = NXUI.SDKData?.id || NXUI.FormIndexData?.id || metadata?.bucketId;
            
            if (!bucketId) {
                console.error('❌ Bucket ID not found. Cannot update bucket.');
                return false;
            }
            
            // Store bucket ID in metadata for future reference
            if (metadata && !metadata.bucketId) {
                await NXUI.ref.mergeData("createTabel", "metadata", {
                    bucketId: bucketId
                }, {
                    deepMerge: true,
                    createIfNotExists: true
                });
            }
            
            await NXUI.Storage().models("Office").backedCreateTabel(tabelStore);
            
            console.log('✅ Bucket updated successfully');
            return true;
        } catch (error) {
            console.error('❌ Error updating bucket:', error);
            return false;
        }
}

nx.deleteTabel = async function (failed) {
  try {
    // Get current metadata
    const metadata = await NXUI.ref.get("createTabel", "metadata");
    
    if (!metadata) {
      console.error('❌ Metadata not found');
      return;
    }

    // Remove the failed item from tags array
    const updatedTags = (metadata.tags || []).filter(tag => tag.failed !== failed);
    
    // Remove the failed item from array
    const updatedArray = (metadata.array || []).filter(item => item !== failed);
    
    // Remove the failed item from value (pipe-separated string)
    const valueArray = (metadata.value || '').split('|').filter(item => item !== failed && item.trim() !== '');
    const updatedValue = valueArray.join('|');

    // Prepare updated metadata
    const updatedMetadata = {
      id: "metadata",
      tags: updatedTags,
      array: updatedArray,
      value: updatedValue,
      name: metadata.name || "dropdown",
      targetId: metadata.targetId || "dropdown",
      outputId: metadata.outputId || "action",
      updatedAt: new Date().toISOString(),
      createdAt: metadata.createdAt || new Date().toISOString()
    };

    // Update metadata
    await NXUI.ref.mergeData("createTabel", "metadata", updatedMetadata, { 
      deepMerge: true,
      createIfNotExists: true
    });
    
    // Delete the failed record
    const deletTabelRecord = await NXUI.ref.get("createTabel", failed) || {};
    
    // Jika tabel sudah dibuat (ada flag tableCreated), hapus tabel dari database
    if (deletTabelRecord.tableCreated) {
        await NXUI.Storage().models("Office").dropBuckCreateTabel({
            tabelName: deletTabelRecord.label || failed
        });
    }
    
    // Jika view sudah dibuat (ada connection), hapus view dari database
    if (deletTabelRecord.connection) {
        await NXUI.Storage().models("Office").delTabelView({
            tabel: failed
        });
    }
    
    // Hapus record dari IndexedDB
    await NXUI.ref.delete("createTabel", failed);
    // Re-render the view using stored id
    // if (NXUI.FormIndexDataId) {
   await renderCreateTabel();
  
  } catch (error) {
    console.error('❌ Error deleting failed tag:', error);
    throw error;
  }
};

export async function tabelEdit(store) {
  try {
    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        // Prepare updated metadata
        const updatedMetadata = {
          id: variable,
          tabel: newValue
        };

        // Update metadata - mergeData akan create jika tidak ada, update jika sudah ada
        await NXUI.ref.mergeData("createTabel", variable, updatedMetadata, {
          deepMerge: true,
          createIfNotExists: true
        });

        // Tunggu sebentar untuk memastikan Select2 sudah benar-benar di-destroy
        // sebelum render ulang view
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await renderCreateTabel();
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}



