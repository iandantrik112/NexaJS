
export async function setSlug(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

  const dimensi = new NXUI.NexaDimensi();

  const height = dimensi.height("#nexa_app", 220, 'vh');
   const formData = storage?.form;
   let formArray = [];
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



    const wrapper = NXUI.createElement(
      "div",
      `
          <div class="nx-card-header">
           <h3 class="bold fs-20px">Slug Generator </h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="contentsetSlug">
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
          content: [await setformslug(formArray, storage,height), await informasi(formArray, storage,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        new NXUI.NexaTags({
           targetId: ["tags","tags2"],
           data: result,  // Mode bebas input (bisa menulis tag baru)
           validasi: [1,2],
           onChange: (data) => {
             console.log(`📝 [${data.name}] Tags berubah:`, data);
           }
         });


        NXUI.NexaSlug.fromFormData(storage?.form, { delay: 100 });
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function setformslug(formArray, data,height) {
    const result2 = formArray
     .filter(item => item.type === 'slug')
     .map(item => ({
      ...item.slug,
     }));
  const failed= result2[0]?.failed?.value ? `value="${result2[0]?.failed?.value}"` :'';
  const variabel= result2[0]?.variabel?.value ? `value="${result2[0]?.variabel?.value}"` :'';
  const nameID=result2[0]?.variabel?.array;
  const types0=data?.form[nameID[0]]?.type ?? 'text';
  const types1=data?.form[nameID[1]]?.type ?? 'text';
  console.log('label:', data?.form[nameID[1]]);
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
   <button onclick="addtagsSlung('${data?.id}');" class="nx-btn-primary custom-size-sm">${btn} Generator</button>
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
     <p class="text-muted small mb-3">Coba ketik di field <strong>Source</strong> (${nameID?.[1] || 'field 1'} dan ${nameID?.[0] || 'field 2'}), slug akan otomatis ter-generate di field <strong>Target</strong> (${result2[0]?.failed?.value || 'slug'})</p>
    </div>
    <div class="nx-col-12">
<div class="form-nexa-group">
    <label class="small text-primary"><strong>Source Field 1</strong> (${nameID?.[1] || ''})</label>
    <input type="${types1}" name="${nameID?.[1] || ''}"id="${nameID?.[1] || ''}"class="form-nexa-control" placeholder="Ketik di sini... akan digunakan untuk generate slug" />
</div>
</div>
 <div class="nx-col-12">
<div class="form-nexa-group">
    <label class="small text-primary"><strong>Source Field 2</strong> (${nameID?.[0] || ''})</label>
    <input type="${types0}" name="${nameID?.[0] || ''}" id="${nameID?.[0] || ''}"class="form-nexa-control" placeholder="Ketik di sini... akan digunakan untuk generate slug" />
</div>
</div>
   <div class="nx-col-12">
<div class="form-nexa-group">
    <label class="small text-success"><strong>Slug (Target)</strong> (${result2[0]?.failed?.value || ''})</label>
    <input type="text" name="${result2[0]?.failed?.value || ''}"id="slug"class="form-nexa-control" placeholder="Slug akan otomatis ter-generate dari source fields di atas" />
</div>
</div>




</div>
    `
    ,
  };
}

export async function informasi(formArray, data,height) {
  return {
    title: "Panduan Slug ",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
     💡 <strong>Tips:</strong> Konfigurasi slug generator
    </small>`,
    html: `
    <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Input Tag Target (Slug Field)</strong>
              <p class="mb-2">Ketik nama field <strong>target</strong> untuk slug yang akan dihasilkan di input "Ketik tag failed dan tekan Enter...". Contoh: "slug", "url", dll. Tekan Enter setelah mengetik untuk membuat tag baru.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Pilih Field Source (Variabel)</strong>
              <p class="mb-2">Di input "Cari dan pilih dari variabel...", pilih <strong>2 field</strong> yang akan digunakan sebagai <strong>sumber</strong> untuk generate slug. Contoh: "title" dan "category". Slug akan di-generate dari kombinasi kedua field ini.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Uji Contoh Form</strong>
              <p class="mb-2">Di bagian "Contoh / Demo", coba ketik di field <strong>Source Field 1</strong> dan <strong>Source Field 2</strong>. Slug akan <strong>otomatis ter-generate</strong> di field <strong>Target (Slug)</strong> secara real-time. Ini adalah preview bagaimana slug generator bekerja di form asli Anda.</p>
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
              <strong>5.Slug Generator Otomatis</strong>
              <p class="mb-2">Sistem akan otomatis generate slug berdasarkan kombinasi field source yang telah dikonfigurasi. Slug akan ter-update secara real-time saat Anda mengisi form contoh. Format slug: lowercase, dengan separator (biasanya dash atau underscore).</p>
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
  await NXUI.NexaRender.refresh(store, setSlug, {
    containerSelector: ["#contentsetSlug"],
  });
}
window.addtagsSlung = async function (id) {
  const Sdk = new NXUI.Buckets(id);
     const storage = await Sdk.storage();
     console.log('label:', storage);
  // Panggil static method dari NexaTags untuk mengambil semua tags
  const result = NXUI.NexaTags.getAllTags();
  console.log('label:', result.failed?.value);
  console.log({
          [result.failed?.value]: {
            slug:result,
          },
        });
        await Sdk.upField({
            [result.failed?.value]: {
              slug:result,
            },
          });

await rendering(storage)
  console.log("📦 Semua tags berdasarkan name:", result);
  return result;
};
