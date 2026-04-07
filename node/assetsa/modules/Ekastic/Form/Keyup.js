
export async function setKeyup(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

  const dimensi = new NXUI.NexaDimensi();

  const height = dimensi.height("#nexa_app", 220, 'vh');
   const formData = storage?.form;
   let formArray = [];
console.log('Daftar key:', Object.keys(formData));
   if (formData) {
     // If it's already an array, use it directly
     if (Array.isArray(formData)) {
       formArray = formData;
     } 
     // If it's an object, convert to array using Object.values()
     else if (typeof formData === 'object') {
       formArray = Object.values(formData);
     }
   }
  
  const result = formArray.map(item => ({
     failed: item.name,
     }));

    const result2 = formArray
     .filter(item => item.type === 'keyup')
     .map(item => ({
      ...item.keyup,
     }));
     console.log('result2:', result2);

    const wrapper = NXUI.createElement(
      "div",
      `
          <div class="nx-card-header">
           <h3 class="bold fs-20px">Keyup Handler Generator </h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="contentsetKeyup">
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
          content: [await setformslug(result2, storage,height), await informasi(formArray, storage,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        new NXUI.NexaTags({
           targetId: ["tags","tags2"],
           data: result,  // Mode bebas input (bisa menulis tag baru)
           validasi: [1,1],
           onChange: (data) => {
             console.log(`📝 [${data.name}] Tags berubah:`, data);
           }
         });


        // Initialize NexaKeyup untuk handle keyup events dan copy value
        // Ambil konfigurasi keyup dari result2
        const keyupConfig = result2 && result2.length > 0 ? result2[0] : null;
        const sourceFields = keyupConfig?.variabel?.array || [];
        const targetFields = keyupConfig?.failed?.array || [];
        
        // Debounce timer untuk mengurangi frekuensi update
        let debounceTimer = null;
        

           NXUI.NexaKeyup.fromFormData(storage?.form, { delay: 100 });
        
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function setformslug(result2, data,height) {
  // Validasi: pastikan result2 ada dan tidak kosong
  if (!result2 || result2.length === 0) {
    console.warn('⚠️ setformslug: result2 kosong atau tidak ditemukan');
    return {
      title: "Property",
      col: "nx-col-8",
      scroll: {
        type: "nx-scroll-hidden",
        height: height,
      },
      footer: `<small class="text-muted">Form - Tidak ada konfigurasi keyup ditemukan</small>`,
      html: `<div class="nx-row"><div class="nx-col-12"><p class="text-muted">Tidak ada konfigurasi keyup ditemukan. Silakan tambahkan field dengan type "keyup" terlebih dahulu.</p></div></div>`
    };
  }

  const failed=     result2[0]?.failed?.value   ? `value="${result2[0]?.failed?.value}"` :'';
  const variabel=   result2[0]?.variabel?.value ? `value="${result2[0]?.variabel?.value}"` :'';
  const nameID1=result2[0]?.failed?.value;
  const nameID2=result2[0]?.variabel?.value;
  console.log('label:', nameID1);
  const types0=data?.form[nameID1]?.type ?? 'text';
  const types1=data?.form[nameID2]?.type ?? 'text';

 const btn=result2[0] ? 'Update':'Save';
  return {
    title: "Property",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
     footer: `
      <small class="text-muted">Form</small>

  <small class="text-muted align-right">
   <button onclick="addtagskeyup('${data?.id}');" class="nx-btn-primary custom-size-sm">${btn} Generator</button>
  </small>

    `,
    html: `
  <div class="nx-row">
    <div class="nx-col-12">



<div class="form-nexa-group">
  <label></label>
  <input type="text" id="tags" ${failed} class="form-nexa-control" name="failed" placeholder="Ketik tag failed dan tekan Enter..." />
</div>
</div>
    <div class="nx-col-12">
<div class="form-nexa-group">
  <label></label>
  <input type="text" id="tags2" ${variabel}class="form-nexa-control" name="variabel" placeholder="Cari dan pilih dari variabel..." />
</div> 
</div> 

    <div class="nx-col-12">
     <h5 class="mb-2">📝 Contoh / Demo</h5>
     <p class="text-muted small mb-3">Coba ketik di field <strong>Source</strong> (${nameID2}), value akan otomatis muncul di field <strong>Target</strong> (${nameID1})</p>
    </div>
 <div class="nx-col-12">
<div class="form-nexa-group">
    <label class="small text-primary"><strong>Source Field</strong> (${nameID2})</label>
    <input type="${types0}" name="${nameID2}" id="${nameID2}"class="form-nexa-control" placeholder="Ketik di sini... value akan otomatis masuk ke target field" />
</div>
</div>
   <div class="nx-col-12">
<div class="form-nexa-group">
    <label class="small text-success"><strong>Target Field</strong> (${nameID1})</label>
    <input type="${types1}" name="${nameID1}"id="${nameID1}"class="form-nexa-control" placeholder="Value dari source akan muncul di sini secara otomatis" />
</div>
</div>




</div>
    `
    ,
  };
}
export async function informasi(formArray, data,height) {
  return {
    title: "Panduan Keyup Handler",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     💡 <strong>Tips:</strong> Konfigurasi keyup handler generator
    </small>`,
    html: `
    <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Input Tag Target (Failed)</strong>
              <p class="mb-2">Ketik nama field <strong>target</strong> yang akan menerima value secara otomatis di input "Ketik tag failed dan tekan Enter...". Contoh: "deskripsi", "slug", dll. Tekan Enter setelah mengetik untuk membuat tag baru.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Pilih Field Source (Variabel)</strong>
              <p class="mb-2">Di input "Cari dan pilih dari variabel...", pilih field yang akan digunakan sebagai <strong>sumber</strong> untuk keyup event. Contoh: "title", "nama", dll. Ketika user mengetik di field ini, value akan otomatis dikopi ke field target.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Uji Contoh Form</strong>
              <p class="mb-2">Di bagian "Contoh / Demo", coba ketik di field <strong>Source</strong> (field pertama). Nilai yang Anda ketik akan <strong>otomatis muncul</strong> di field <strong>Target</strong> (field kedua) secara real-time. Ini adalah preview bagaimana keyup handler bekerja di form asli Anda.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Simpan Konfigurasi</strong>
              <p class="mb-2">Klik tombol "Save Generator" atau "Update Generator" di bagian footer untuk menyimpan konfigurasi tag failed dan variabel ke database.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5.Keyup Handler Otomatis</strong>
              <p class="mb-2">Sistem akan otomatis attach keyup handler berdasarkan field yang telah dikonfigurasi. Handler akan ter-trigger secara real-time saat Anda mengisi form contoh.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}

export async function rendering(store) {
  // Ambil data storage terbaru
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, setKeyup, {
    containerSelector: ["#contentsetKeyup"],
  });
}
window.addtagskeyup = async function (id) {
  const Sdk = new NXUI.Buckets(id);
     const storage = await Sdk.storage();
     console.log('label:', storage);
  
  // Panggil static method dari NexaTags untuk mengambil semua tags
  const result = NXUI.NexaTags.getAllTags();
  console.log('Keyup config:', result);
  console.log({
          [result.failed?.value]: {
            keyup: result,
          },
        });
        await Sdk.upField({
            [result.failed?.value]: {
              keyup:result,
            },
          });

await rendering(storage)
  console.log("📦 Semua tags berdasarkan name:", result);
  return result;
};
