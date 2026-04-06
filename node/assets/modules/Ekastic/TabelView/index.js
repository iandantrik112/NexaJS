import './order.js';
import './group.js';
import './where.js';
import './query.js';
export async function setabelView(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const tabel = await Sdk.metaData();

     const metadata = await NXUI.ref.get("tabelStore", "metadata");
     if (!metadata?.outputId) {
        const getTabelView = await NXUI.Storage().models("Office").getTabelView({
            tabel:true
         });
         for (const tabel of  getTabelView.data.response) {
           await NXUI.ref.set("tabelStore", tabel);
         }

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
           <h3 class="bold fs-20px">Tabel View</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div  class="pr-10px">
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
          </div>
      </div>   
    `
    );
   const checkedItems = await Sdk.getFields("tags");
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

  const metadata = await NXUI.ref.get("tabelStore", "metadata");
   const variabel=metadata?.array || [];
  console.log('metadata:', variabel?.length);
   const failed=metadata?.value ? `value="${metadata?.value}"` :'';
    // Gunakan NXUI.SDKData yang sudah disimpan, atau Sdk jika tersedia
    const sdkInstance = NXUI.SDKData || Sdk;
    const tabel = await sdkInstance.metaData();
    // Ensure tabel is an array before calling map
    const tabelTangs = Array.isArray(tabel) ? tabel.map(item => item.label).join("|") : "";
  let tabelHtml = `

<div class="form-nexa-group">
  <input type="text" id="dropdown" ${failed} class="form-nexa-control" name="dropdown" placeholder="Ketik nama tabel baru dan tekan Enter..." />
</div>
<table class="nx-table-wrapper nx-table-sm mb-2">
  <thead>
    <tr>
      <th>View</th>
      <th>Index</th>
      <th>Oprasi</th>
      <th>Connection</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${
      variabel && variabel.length > 0
        ? (await Promise.all(
            variabel.map(async(item, index) => {   
                const row = await NXUI.ref.get("tabelStore",item);
                const setSave=row?.oprasi ? 'saveConnection':'saveFaildTags';
                return `
      <tr>
   
     <td>${item}</td>
     <td>
<span 
  class="editable" 
  id="${item}"
  type="tags"
  name="tabel"             
  data-options="${tabelTangs}"
  data-tags="${row?.tabel || ''}"
  data-min-tags="1"
  data-max-tags="10"
  label="Join"
  icon="label">
${row?.tabel||'Null'}
</span></td>
   <td  class="text">
  <div class="nx-switch-item">
    <input type="checkbox" id="switch1" ${row?.oprasi ?' checked':''}/>
    <label for="switch1">
      <span class="nx-switch"></span>
    </label>
  </div>

   </td>
     <td>
 <div class="nx-switch-item">
    <input type="checkbox" id="switch2" ${row?.connection ?' checked':''}/>
    <label for="switch2">
      <span class="nx-switch"></span>
    </label>
  </div>

     </td>
     <td class="text-right">

    <a  href="javascript:void(0);" onclick="settingsJoin('${item}')" title="Join Settings" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">join_left</span>
         </a>
         <a  href="javascript:void(0);" onclick="settingsFaildTags('${item}')" title="Field Settings" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">view_timeline</span>
         </a>
         <a  href="javascript:void(0);" onclick="settingsWhere('${item}')" title="WHERE Clause" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">filter_list</span>
         </a>
         <a  href="javascript:void(0);" onclick="settingsOrderBy('${item}')" title="ORDER BY" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">sort</span>
         </a>
         <a  href="javascript:void(0);" onclick="settingsGroupBy('${item}')" title="GROUP BY" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">group_work</span>
         </a>
         <a  href="javascript:void(0);" onclick="saveFaildTags('${item}')" title="Save View" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">save</span>
         </a>

         ${row?.oprasi ?` 
         <a  href="javascript:void(0);" onclick="testQuery('${item}')" title="Test Query" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">play_arrow</span>
         </a>  

     
         <a  href="javascript:void(0);" onclick="settingsQuery('${item}')" title="Query View" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">database</span>
         </a>  


         ` :''}      
        
     
       <a  href="javascript:void(0);" onclick="deleteFaildTags('${item}')" title="Delete View" style="color:#ccc" >
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
   <button onclick="updateBucketView();" class="nx-btn-primary custom-size-sm">Update Bucket</button>
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
    title: "Panduan Tabel View",
    col: "nx-col-4",
          scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     <strong>💡 Tips:</strong> Ikuti langkah-langkah secara berurutan untuk hasil terbaik

    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Buat View Baru</strong>
              <p class="mb-2">Ketik nama view di input field dan tekan <strong>Enter</strong>. View akan muncul di tabel "Properti".</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Pilih Tabel (Index)</strong>
              <p class="mb-2">Klik kolom <strong>"Index"</strong> untuk memilih tabel yang akan digunakan. Pilih minimal 1 tabel, maksimal 10 tabel. Gunakan format tags (pisahkan dengan koma).</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Generate Field (Save Field)</strong>
              <p class="mb-2">Setelah memilih tabel, klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">save</span> <strong>"Save View"</strong> untuk generate field dari tabel yang dipilih. Field akan otomatis diformat dengan alias dan prefix tabel.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Konfigurasi JOIN (Opsional)</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">join_left</span> untuk mengatur JOIN antar tabel. Pilih:
              <br>• <strong>Type:</strong> INNER, LEFT, RIGHT, FULL OUTER, CROSS, atau NATURAL JOIN
              <br>• <strong>Index:</strong> Field dari tabel pertama
              <br>• <strong>Target:</strong> Field dari tabel kedua (otomatis difilter agar tidak sama dengan tabel index)</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Atur Field (Field Settings)</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">settings</span> untuk mengatur field yang akan ditampilkan. Field yang sudah digunakan di JOIN tidak bisa dihapus. Hapus field yang tidak diperlukan dengan klik ikon delete.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6. WHERE Clause (Opsional)</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">filter_list</span> untuk menambahkan kondisi WHERE:
              <br>• Pilih field, operator (=, !=, >, <, LIKE, IN, BETWEEN, dll)
              <br>• Untuk <strong>IN/NOT IN:</strong> Masukkan nilai dipisahkan koma (contoh: 1,2,3 atau 'a','b','c')
              <br>• Untuk <strong>LIKE/NOT LIKE:</strong> Gunakan wildcard % (contoh: %test% atau test%)
              <br>• Untuk <strong>BETWEEN:</strong> Masukkan 2 nilai
              <br>• Gunakan <strong>AND/OR</strong> untuk multiple conditions</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>7. ORDER BY (Opsional)</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">sort</span> untuk mengatur urutan data:
              <br>• Pilih field yang akan diurutkan
              <br>• Pilih arah: <strong>ASC</strong> (naik) atau <strong>DESC</strong> (turun)
              <br>• Tambahkan multiple field untuk sorting bertingkat</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>8. GROUP BY (Opsional)</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">group_work</span> untuk mengelompokkan data:
              <br>• Pilih field yang akan dijadikan grup
              <br>• Field lain otomatis menggunakan <strong>ANY_VALUE()</strong> untuk memenuhi SQL mode
              <br>• Berguna untuk agregasi data (SUM, COUNT, dll)</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>9. Custom Query (Advanced)</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">database</span> untuk menulis SQL query custom:
              <br>• Gunakan editor CodeMirror dengan syntax highlighting
              <br>• Format otomatis dengan tombol <strong>Format</strong>
              <br>• Query custom akan menggantikan build otomatis
              <br>• Pastikan query adalah SELECT statement yang valid</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>10. Test Query (Rekomendasi)</strong>
              <p class="mb-2">Sebelum menyimpan view, klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">play_arrow</span> <strong>"Test Query"</strong> untuk preview hasil query:
              <br>• Query akan dijalankan dengan <strong>LIMIT 10</strong> untuk preview
              <br>• Tampilkan sample data dalam tabel
              <br>• Validasi query sebelum membuat view permanen
              <br>• Jika ada error, perbaiki konfigurasi sebelum save</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>11. Simpan View ke Database</strong>
              <p class="mb-2">Setelah semua konfigurasi selesai dan test query berhasil, klik tombol <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">save</span> <strong>"Save View"</strong> untuk membuat/update view di database. View akan dibuat dengan nama sesuai label view.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>12. Hapus View</strong>
              <p class="mb-2">Klik ikon <span class="material-symbols-outlined nx-icon-sm" style="vertical-align: middle;">delete</span> untuk menghapus view. View akan dihapus dari IndexedDB dan database (jika sudah dibuat).</p>
            </div>
          </div>
          
          <div class="nx-step mb-2" style="background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 3px solid #007bff;">
            <div class="nx-step-content">
              <strong>📌 Catatan Penting:</strong>
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                <li>Field yang digunakan di JOIN tidak bisa dihapus</li>
                <li>WHERE/ORDER BY/GROUP BY menggunakan full field name (table.field)</li>
                <li>GROUP BY otomatis menggunakan ANY_VALUE() untuk field non-grup</li>
                <li>Custom query akan menggantikan semua build otomatis</li>
                <li>Selalu test query sebelum save untuk memastikan query berjalan dengan benar</li>
                <li>View akan otomatis di-update saat ada perubahan field</li>
              </ul>
            </div>
          </div>
        
        </div>
      </div>
      </div>
    `,
  };
}

export async function renderTabelView() {
  await NXUI.NexaRender.refresh(NXUI.FormIndexData, setabelView, {
    containerSelector: ["#setabelView"],
  });
}

// Export ke window untuk akses dari file lain
if (typeof window !== 'undefined') {
  window.renderTabelView = renderTabelView;
}
export async function addtagssJoin(changeData,storage) {
  try {
    // Ambil metadata yang sudah ada terlebih dahulu untuk mempertahankan field yang sudah ada
    const existingMetadata = await NXUI.ref.get("tabelStore", "metadata") || {};
    
    // CARA MUDAH: Simpan setiap key sebagai record terpisah dengan ID = key itu sendiri
    // Gunakan mergeData untuk setiap key - otomatis create/update (parallel processing)
    // Pastikan data yang sudah ada (seperti oprasi, tabel, dll) tidak terhapus
    await Promise.all(
      changeData.array.map(async key => {
        // Ambil data yang sudah ada untuk mempertahankan field yang sudah ada
        const existingData = await NXUI.ref.get("tabelStore", key) || {};
        
        // Merge data baru dengan data yang sudah ada
        return NXUI.ref.mergeData("tabelStore", key, {
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
    await NXUI.ref.mergeData("tabelStore", "metadata", {
      id: "metadata",
      ...changeData, // Hanya field yang ada di changeData yang akan di-update
      updatedAt: new Date().toISOString()
    }, { 
      deepMerge: true, // Deep merge memastikan field nested yang sudah ada tidak terhapus
      createIfNotExists: true // Create jika belum ada
    });
    
    await renderTabelView();
    // Re-render using stored id

  } catch (error) {
    console.error('❌ Error in addtagssJoin:', error);
    throw error;
  }
};
 
nx.settingsFaildTags = async function (tabel) {
    const metadata = await NXUI.ref.get("tabelStore", tabel); 
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
  const metadata = await NXUI.ref.get("tabelStore", tabel);

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
  await NXUI.ref.mergeData("tabelStore", tabel, {
    ...metadata,
    failedAS: result
  }, {
    deepMerge: true,
    createIfNotExists: true
  });

  // Hapus element UI
  NXUI.id("id" + id).remove();
  
  // Refresh view untuk menampilkan perubahan
  await renderTabelView();
};

nx.settingsJoin = async function (tabel) {
  console.log('tabel:', tabel);
  const metadata = await NXUI.ref.get("tabelStore", tabel);
  console.log('metadata:', metadata);
  
  // Validasi metadata dan tabelAlias
  // if (!metadata) {
  //   NXUI.notification({
  //     type: 'error',
  //     message: 'Metadata tidak ditemukan. Silakan generate field terlebih dahulu.'
  //   });
  //   return;
  // }
  
  // if (!metadata.tabelAlias || !Array.isArray(metadata.tabelAlias) || metadata.tabelAlias.length < 2) {
  //   // NXUI.notification({
  //   //   type: 'error',
  //   //   message: 'Minimal diperlukan 2 tabel untuk melakukan JOIN. Silakan pilih tabel terlebih dahulu dan klik "Save View".'
  //   // });
  //   return;
  // }
  
  const targetInput = metadata.tabelAlias.slice(1);


    // Ambil data oprasi yang sudah ada untuk menampilkan nilai sebelumnya
    const existingOprasi = metadata.oprasi || [];
    // Buat map untuk memudahkan pencarian data berdasarkan nama tabel
    const oprasiMap = {};
    existingOprasi.forEach(item => {
      const tableName = Object.keys(item)[0];
      oprasiMap[tableName] = item[tableName];
    });

    // Buat array options untuk select index dan target
    const optionsArray = [];
    if (metadata.failedAS && Array.isArray(metadata.failedAS)) {
      metadata.failedAS.forEach((row) => {
        const value = row.split(' AS ')[0].trim();
        const label = row.split('AS')[0].trim();
        optionsArray.push({ value, label });
      });
    }

    // Fungsi helper untuk membuat option dengan selected
    const createOption = (value, label, selectedValue) => {
      const selected = value === selectedValue ? 'selected' : '';
      return `<option value="${value}" ${selected}>${label}</option>`;
    };

   // Simpan semua options dalam format JSON untuk digunakan di JavaScript
   const allOptionsJSON = JSON.stringify(optionsArray);
   
   let templateFieldCustom=''
    targetInput.forEach((field, index) => {
      // Ambil data yang sudah ada untuk field ini
      const existingData = oprasiMap[field] || {};
      const existingType = existingData.type || '';
      const existingIndex = existingData.index || '';
      const existingTarget = existingData.target || '';
      
      // Extract nama tabel dari existingIndex untuk filter awal
      let selectedTableInIndex = '';
      if (existingIndex) {
        const parts = existingIndex.split('.');
        if (parts.length > 0) {
          selectedTableInIndex = parts[0];
        }
      }
      
      // Buat option untuk type dengan selected jika sudah ada
      const typeOptions = [
        { value: 'inner', label: 'INNER JOIN' },
        { value: 'left', label: 'LEFT JOIN' },
        { value: 'right', label: 'RIGHT JOIN' },
        { value: 'full', label: 'FULL OUTER JOIN' },
        { value: 'cross', label: 'CROSS JOIN' },
        { value: 'natural', label: 'NATURAL JOIN' }
      ].map(type => createOption(type.value, type.label, existingType)).join('');
      
      // Buat option untuk index dengan selected jika sudah ada
      const indexOptions = optionsArray.map(opt => createOption(opt.value, opt.label, existingIndex)).join('');
      
      // Buat option untuk target dengan filter: hilangkan option yang mengandung tabel yang sama dengan index
      const filteredTargetOptions = optionsArray.filter(opt => {
        // Jika ada selectedIndex, filter out option yang mengandung tabel yang sama
        if (selectedTableInIndex) {
          const optTable = opt.value.split('.')[0];
          return optTable !== selectedTableInIndex;
        }
        return true;
      });
      const targetOptions = filteredTargetOptions.map(opt => createOption(opt.value, opt.label, existingTarget)).join('');
      
      templateFieldCustom += `
          <div class="nx-col-4">
            <div class="form-nexa-group">
              <label>type ${field}</label>
                 <select id="type_${field}" name="type_${field}" class="form-nexa-control select2-field">
                   ${typeOptions}
                 </select>
            </div>
          </div>
          <div class="nx-col-4">
            <div class="form-nexa-group">
              <label>index</label>
                 <select id="index_${field}" name="index_${field}" class="form-nexa-control select2-field" data-field="${field}">
                   ${indexOptions}
                 </select>
            </div>
          </div>
          <div class="nx-col-4">
            <div class="form-nexa-group">
              <label>Target</label>
                 <select id="target_${field}" name="target_${field}" class="form-nexa-control select2-field" data-field="${field}">
                   ${targetOptions}
                 </select>
            </div>
          </div>
      `;
    });






  const modalID = "group_" + tabel;
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-600px",
      minimize: true,
      label: `Group View By ${tabel}`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      // Select: ["#groupbySelect"],
      getValidationBy: ["name"], // ✅ Standard validation approach
      setDataBy: metadata, // ✅ Standard validation approach
      onclick: {
        title: "Save View",
        cancel: "Cancel",
        send: "saveGroupByView", // ✅ Use namespaced function name
      },
      content:`
  <div class="nx-row" data-options='${allOptionsJSON}'>
   
     ${templateFieldCustom}

</div>

        ` ,
    });
    NXUI.nexaModal.open(modalID);
    
    // Inisialisasi Select2 untuk semua select field setelah modal dibuka
    setTimeout(() => {
      // Ambil semua options dari data attribute
      const optionsContainer = document.querySelector(`#${modalID} .nx-row`);
      const allOptions = JSON.parse(optionsContainer.getAttribute('data-options') || '[]');
      
      // Fungsi untuk extract nama tabel dari value (misalnya "demo.userid" -> "demo")
      const getTableName = (value) => {
        if (!value) return '';
        const parts = value.split('.');
        return parts.length > 0 ? parts[0] : '';
      };
      
      // Fungsi untuk update target options berdasarkan index yang dipilih
      const updateTargetOptions = (fieldName) => {
        const indexSelect = document.getElementById(`index_${fieldName}`);
        const targetSelect = document.getElementById(`target_${fieldName}`);
        
        if (!indexSelect || !targetSelect) return;
        
        const selectedIndex = indexSelect.value;
        const selectedTable = getTableName(selectedIndex);
        const currentTargetValue = targetSelect.value;
        
        // Filter options: hilangkan option yang mengandung tabel yang sama dengan index
        const filteredOptions = allOptions.filter(opt => {
          if (!selectedTable) return true;
          const optTable = getTableName(opt.value);
          return optTable !== selectedTable;
        });
        
        // Destroy Select2 terlebih dahulu
        if ($(targetSelect).hasClass('select2-hidden-accessible')) {
          $(targetSelect).select2('destroy');
        }
        
        // Clear dan rebuild options
        targetSelect.innerHTML = '<option value="">Pilih opsi...</option>';
        filteredOptions.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          // Restore selected value jika masih valid
          if (currentTargetValue === opt.value && opt.value !== '') {
            option.selected = true;
          }
          targetSelect.appendChild(option);
        });
        
        // Re-initialize Select2
        NXUI.initSelect2(`#target_${fieldName}`, {
          placeholder: "Pilih opsi...",
          allowClear: true,
          width: "100%"
        });
      };
      
      // Inisialisasi Select2 untuk semua select field dengan class select2-field
      const selectFields = document.querySelectorAll(`#${modalID} .select2-field`);
      selectFields.forEach(select => {
        NXUI.initSelect2(`#${select.id}`, {
          placeholder: "Pilih opsi...",
          allowClear: true,
          width: "100%"
        });
        
        // Tambahkan event listener untuk select index
        if (select.id.startsWith('index_')) {
          const fieldName = select.getAttribute('data-field');
          $(select).on('change', function() {
            updateTargetOptions(fieldName);
          });
        }
      });
    }, 300); // Tunggu 300ms untuk memastikan modal sudah di-render
}
nx.saveGroupByView = async function (modalID,data,storage) {
    // Konversi data dari format flat menjadi array of objects yang dikelompokkan per tabel
    const groupedData = {};
    
    // Loop melalui semua keys di data
    Object.keys(data).forEach(key => {
      // Extract prefix (type_, index_, target_) dan nama tabel
      const match = key.match(/^(type|index|target)_(.+)$/);
      
      if (match) {
        const prefix = match[1]; // type, index, atau target
        const tableName = match[2]; // nama tabel (user, visitors, drive, dll)
        
        // Inisialisasi object untuk tabel jika belum ada
        if (!groupedData[tableName]) {
          groupedData[tableName] = {};
        }
        
        // Set value sesuai prefix
        groupedData[tableName][prefix] = data[key];
      }
    });
    
    // Konversi menjadi array of objects dengan format yang diinginkan
    const result = Object.keys(groupedData).map(tableName => {
      return {
        [tableName]: {
          type: groupedData[tableName].type || '',
          index: groupedData[tableName].index || '',
          target: groupedData[tableName].target || ''
        }
      };
    });
    
          const updatedMetadata = {
            id:storage.id,
            oprasi:result,
   };

        // Update metadata - mergeData akan create jika tidak ada, update jika sudah ada
        await NXUI.ref.mergeData("tabelStore", storage.id, updatedMetadata, {
          deepMerge: true,
          createIfNotExists: true
        });
    NXUI.nexaModal.close(modalID);
    await renderTabelView();
    // return result;
}
nx.saveFaildTags = async function (tabel) {
  // Ambil metadata dari storage
  const metadata = await NXUI.ref.get("tabelStore", tabel);
  // contoh metadata.tabel = "demo, user"
  const raw = metadata?.tabel || "";
  // jadikan array -> ["demo", "user"]
  const arr = raw.split(",").map(s => s.trim()).filter(Boolean);
  // Ambil seluruh tabel metadata dari API
  const allTables = await NXUI.SDKData.metaData();


  // Filter berdasarkan arr
  const filtered = allTables.filter(item => arr.includes(item.label));

  // Buka data untuk setiap key secara terpisah
  // Loop melalui setiap item di filtered dan ambil data berdasarkan key masing-masing
  const dataResults = await Promise.all(
    filtered.map(async (item) => {
      try {
        // Ambil key dari item (bisa item.key, item.id, atau property lain sesuai struktur data)
        const key = item.key || item.id || item.name;
        if (!key) {
          return { item, data: null, error: 'No key found' };
        }
        // Buka data berdasarkan key
        const data = await NXUI.SDKData.metaIndexKey(key);
      
        
        return {
          ...item,
          key: key,
          data: data
        };
      } catch (error) {
        console.error(`❌ Error membuka data untuk item:`, item, error);
        return {
          ...item,
          data: null,
          error: error.message
        };
      }
    })
  );
  
  // Kumpulkan semua variables dari setiap item dengan informasi tabel
  const allVariables = [];
  dataResults.forEach(result => {
    // Cek jika data ada dan memiliki variables
    if (result.data && result.data.variables && Array.isArray(result.data.variables)) {
      const tableLabel = result.label || result.item?.label || ''; // Ambil nama tabel
      // Tambahkan variables dari item ini dengan informasi tabel
      result.data.variables.forEach(variable => {
        allVariables.push({
          variable: variable.trim(),
          table: tableLabel
        });
      });
    }
  });
  
  // Format variables menjadi SQL alias format dengan handling duplikat
  const formattedVariables = [];
  const variableCount = {}; // Track jumlah kemunculan setiap variable
  
  allVariables.forEach(({ variable, table }) => {
    const varName = variable.trim();
    
    // Hitung kemunculan variable (tanpa mempertimbangkan tabel)
    if (!variableCount[varName]) {
      variableCount[varName] = 0;
    }
    variableCount[varName]++;
    
    // Format dengan prefix nama tabel
    const tablePrefix = table ? `${table}.` : '';
    
    // Jika pertama kali muncul, gunakan nama asli
    if (variableCount[varName] === 1) {
      formattedVariables.push(`${tablePrefix}${varName} AS ${varName} `);
    } else {
      // Jika duplikat, tambahkan angka di belakang alias
      formattedVariables.push(`${tablePrefix}${varName} AS ${varName}${variableCount[varName] - 1} `);
    }
  });
  
  // Buat array unik (hilangkan duplikat) untuk referensi - hanya nama variable
  const uniqueVariables = [...new Set(allVariables.map(item => item.variable))];

      
      // Ambil data yang sudah ada untuk mempertahankan semua field yang sudah ada (termasuk oprasi)
      const existingData = await NXUI.ref.get("tabelStore", tabel) || {};
      
      // Merge data baru dengan data yang sudah ada, pertahankan semua field yang sudah ada
      const updatedMetadata = {
            ...existingData, // Pertahankan semua field yang sudah ada
            id:tabel,
            createView:tabel,
            tabelKey: dataResults.map(item => item.key),
            tabelAlias: dataResults.map(item => item.label),
            failedAS: formattedVariables,
            failedLength: formattedVariables.length
            // Field oprasi dan field lain akan tetap ada karena menggunakan spread operator
   };

        // Update metadata - mergeData akan create jika tidak ada, update jika sudah ada
        await NXUI.ref.mergeData("tabelStore", tabel, updatedMetadata, {
          deepMerge: true,
          createIfNotExists: true
        });
        if (metadata?.oprasi) {
            saveConnection(tabel)
        }
    
         await renderTabelView();
          //
  // buckTabelView
};

nx.saveConnection  = async function (tabel) {
    try {
        // Ambil metadata terbaru dari IndexedDB (termasuk failedAS yang sudah di-update)
        const metadata = await NXUI.ref.get("tabelStore", tabel) || {};
        
        // Cek apakah ada query custom
        const hasCustomQuery = metadata?.query?.custom === true && metadata?.query?.view;
        
        // Validasi data yang diperlukan (hanya jika tidak ada query custom)
        if (!hasCustomQuery) {
            if (!metadata.failedAS || !Array.isArray(metadata.failedAS) || metadata.failedAS.length === 0) {
                throw new Error('failedAS is required and cannot be empty');
            }
        }
        
        // Buat/recreate view dengan data terbaru
        // Jika ada query custom, server akan menggunakan query tersebut
        // CREATE OR REPLACE VIEW akan otomatis update view jika sudah ada
        const dataTabel = await NXUI.Storage().models("Office").buckTabelView(metadata);
        
        if (!dataTabel.data || !dataTabel.data.success) {
            throw new Error(dataTabel.data?.error || 'Failed to create/update view');
        }
        
        // Update metadata dengan query dan connection status
        const updatedMetadata = {
            ...metadata, // Pertahankan semua field yang sudah ada
            id: tabel,
            query: {
                view: dataTabel.data.results.query,
                sql: dataTabel.data.results.sql,
                custom: hasCustomQuery // Pertahankan flag custom jika ada
            },
            connection: dataTabel.data.success,
            updatedAt: new Date().toISOString()
        };

        // Update metadata - mergeData akan create jika tidak ada, update jika sudah ada
        await NXUI.ref.mergeData("tabelStore", tabel, updatedMetadata, {
            deepMerge: true,
            createIfNotExists: true
        });
  ;
        await renderTabelView();
        
    } catch (error) {
        console.error('❌ Error in saveConnection:', error);
        throw error;
    }
}

nx.updateBucketView = async function () {
        const tabelStore = await NXUI.ref.getAll("tabelStore") || {};
        await NXUI.Storage().models("Office").backedTabelView(tabelStore);

     return true
}
nx.testQuery = async function (tabel) {
    try {
        // Ambil metadata terbaru dari IndexedDB
        const metadata = await NXUI.ref.get("tabelStore", tabel) || {};
        const modalID = "testQuery_" + tabel;
        
        // Validasi data yang diperlukan
        const hasCustomQuery = metadata?.query?.custom === true && metadata?.query?.view;
        
        if (!hasCustomQuery) {
            if (!metadata.failedAS || !Array.isArray(metadata.failedAS) || metadata.failedAS.length === 0) {
                NXUI.notification({
                    type: 'error',
                    message: 'Field (failedAS) belum dikonfigurasi. Silakan klik "Save View" terlebih dahulu untuk generate field.'
                });
                return;
            }
        }
        
        // Tampilkan loading
        NXUI.modalHTML({
            elementById: modalID,
            styleClass: "w-900px",
            minimize: true,
            label: `Test Query - ${tabel}`,
            getFormBy: ["name"],
            getValidationBy: ["name"],
            setDataBy: metadata,
            onclick: false,
            content: `
                <div class="nx-card-content p-20px text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="mt-3">Menjalankan query test...</p>
                </div>
            `
        });
        NXUI.nexaModal.open(modalID);
        
        // Panggil backend untuk test query
        const testResult = await NXUI.Storage().models("Office").testTabelView(metadata);
        
        // Cek hasil
        if (!testResult.data || !testResult.data.success) {
            const errorMessage = testResult.data?.error || 'Query test gagal';
            
            // Tampilkan error
            NXUI.modalHTML({
                elementById: modalID,
                styleClass: "w-900px",
                minimize: true,
                label: `Test Query - ${tabel}`,
                getFormBy: ["name"],
                getValidationBy: ["name"],
                setDataBy: metadata,
                onclick: {
                    title: "Close",
                    cancel: false,
                    send: false,
                },
                content: `
                    <div class="nx-card-content p-20px">
                        <div class="alert alert-danger">
                            <h4 class="alert-heading">
                                <span class="material-symbols-outlined">error</span> Error
                            </h4>
                            <p><strong>Query test gagal:</strong></p>
                            <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto;">${errorMessage}</pre>
                        </div>
                    </div>
                `
            });
            NXUI.nexaModal.open(modalID);
            return;
        }
        
        // Ambil data hasil
        const resultData = testResult.data.results;
        const rows = resultData.data || [];
        const rowCount = resultData.rowCount || 0;
        
        // Buat tabel untuk menampilkan hasil
        let tableHTML = '';
        if (rows.length > 0) {
            // Ambil kolom dari row pertama
            const columns = Object.keys(rows[0]);
            
            // Header tabel
            tableHTML = `
                <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                    <table class="nx-table-wrapper nx-table-sm">
                        <thead style="position: sticky; top: 0; background: #fff; z-index: 10;">
                            <tr>
                                ${columns.map(col => `<th>${col}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map((row, idx) => `
                                <tr>
                                    ${columns.map(col => {
                                        const value = row[col];
                                        // Format value: jika null tampilkan "NULL", jika object/array tampilkan JSON
                                        let displayValue = value === null || value === undefined ? '<em class="text-muted">NULL</em>' : value;
                                        if (typeof displayValue === 'object') {
                                            displayValue = JSON.stringify(displayValue);
                                        }
                                        return `<td>${displayValue}</td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            tableHTML = `
                <div class="alert alert-info">
                    <span class="material-symbols-outlined">info</span>
                    Query berhasil dijalankan, namun tidak ada data yang dikembalikan.
                </div>
            `;
        }
        
        // Tampilkan hasil
        NXUI.modalHTML({
            elementById: modalID,
            styleClass: "w-900px",
            minimize: true,
            label: `Test Query - ${tabel}`,
            getFormBy: ["name"],
            getValidationBy: ["name"],
            setDataBy: metadata,
            onclick: {
                title: "Close",
                cancel: false,
                send: false,
            },
            content: `
                <div class="nx-card-content p-20px">
                    <div class="alert alert-success mb-3">
                        <h4 class="alert-heading">
                            <span class="material-symbols-outlined">check_circle</span> Query Berhasil
                        </h4>
                        <p class="mb-0">
                            <strong>Jumlah baris:</strong> ${rowCount} (maksimal 10 baris untuk preview)
                        </p>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Hasil Data:</strong>
                        ${tableHTML}
                    </div>
                    
                    <div class="alert alert-warning">
                        <small>
                            <strong>💡 Catatan:</strong> Ini adalah preview dengan maksimal 10 baris. 
                            View yang dibuat akan menampilkan semua data sesuai query.
                        </small>
                    </div>
                </div>
            `
        });
        NXUI.nexaModal.open(modalID);
        
    } catch (error) {
        console.error('❌ Error in testQuery:', error);
        NXUI.notification({
            type: 'error',
            message: 'Terjadi kesalahan saat menjalankan test query: ' + (error.message || error)
        });
    }
}

nx.deleteFaildTags = async function (failed) {
  try {
    // Get current metadata
    const metadata = await NXUI.ref.get("tabelStore", "metadata");
    
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
    await NXUI.ref.mergeData("tabelStore", "metadata", updatedMetadata, { 
      deepMerge: true,
      createIfNotExists: true
    });
    
    // Delete the failed record
    const deletTabelView = await NXUI.ref.get("tabelStore", failed) || {};
    
    // Jika view sudah dibuat (ada connection), hapus view dari database
    if (deletTabelView.connection) {
        await NXUI.Storage().models("Office").delTabelView({
            tabel: failed
        });
    }
    
    // Hapus record dari IndexedDB
    await NXUI.ref.delete("tabelStore", failed);
    // Re-render the view using stored id
    // if (NXUI.FormIndexDataId) {
   await renderTabelView();
  
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
        await NXUI.ref.mergeData("tabelStore", variable, updatedMetadata, {
          deepMerge: true,
          createIfNotExists: true
        });

        // Tunggu sebentar untuk memastikan Select2 sudah benar-benar di-destroy
        // sebelum render ulang view
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await renderTabelView();
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}




