export async function setRestful(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    storage.applications.access=storage?.api?.access ?'privat' :'public';
      const sdkfrom = await Sdk.getFields("condition");
      const sdkTabel = await Sdk.getFields("tabel");
  const resultFalind = sdkTabel.map(item => ({
    label :item.placeholder,
    info_error :item.placeholder,
    failed:item.name,
    type:item.type,
    validation:Number(item.validation),
  }));
    const Restful={
    	version:storage.version,
    	config:storage.api,
    	data:{
          applications:storage.applications,
          validasi:resultFalind,
    	}
    }
    NXUI.RESAPI=Restful;
    const dimensi = new NXUI.NexaDimensi();
    const height = dimensi.height("#nexa_app", 210, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `<div class="nx-card-header">
           <h3 class="bold fs-20px">Restful API</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setRestful">
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
          content: [await Cradensial(storage,height), await Guide(height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
         await setCheckbox(Sdk);
          await tabelEdit(Sdk);
      } catch (error) {
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
  }
}

export async function Cradensial(storage,height) {
   const access=storage?.api?.access?'Privat' :'Public';
  return {
    title: "Kredensial",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `
SDK (Software Development Kit)

  <small class="text-muted align-right">
   <button onclick="addBucketApi('${storage.id}','${storage?.api?.authorization}');" class="nx-btn-primary custom-size-sm">
   ${storage?.api?.key ?' Update' : 'Save'} Bucket
   </button>
  </small>
    	`,
    html:`

 <table class="nx-table" style="background-color: #ffffff00;">
  <tbody>
    <tr>
      <td>Version</td>
      <td class="bold">${storage.version}</td>
    </tr>
    <tr>
      <td>Generate Token</td>
      <td>
		  <div class="nx-switch-item">
		    <input type="checkbox" id="switch1" name="token" ${storage?.api?.token ? "checked" : ""}/>
		    <label for="switch1">
		      <span class="nx-switch"></span>
		    </label>
		  </div>
      </td>
    </tr>

    <tr>
      <td>Authorization</td>
      <td class="bold">${storage?.api?.authorization|| 'false'}</td>
    </tr>
    <tr>
      <td>App ID</td>

      <td class="bold">${storage?.api?.appid|| 'false'}</td>
    </tr>
    <tr>
      <td>App Name</td>
       <td><span id="appname" type="text" class="editable" data-min-length="5" name="appname">${storage?.api?.appname || storage?.api?.endpoind}</span></td>
    </tr>
    <tr>
      <td>Endpoint</td>
      <td>/api/${storage?.api?.endpoind}</td>
    </tr>
    <tr>
      <td>Expire</td>
      <td><span id="expair" type="date" class="editable" data-min-length="5" name="expair">${storage?.api?.expair || 'false'}</span></td>
    </tr>
    <tr>
      <td>Access Data</td>
      <td>
		  <div class="nx-switch-item">
		    <input type="checkbox" id="switch6"  name="access"${storage?.api?.access ? "checked" : ""}/>
		    <label for="switch6">
		      <span class="nx-switch"></span>
    	       ${access}
		    </label>
		  </div>
      </td>
    </tr>
    <tr>

      <td>Operasi</td>
      <td>
          <div class="nx-switch-grid">
		  <div class="nx-switch-item">
		    <input type="checkbox" id="switch2" name="GET" ${storage?.api?.GET ? "checked" : ""}/>
		    <label for="switch2">
		      <span class="nx-switch"></span>
    	     GET
		    </label>
		  </div>
		  <div class="nx-switch-item">
		    <input type="checkbox" id="switch3" name="POST" ${storage?.api?.POST ? "checked" : ""}/>
		    <label for="switch3">
		      <span class="nx-switch"></span>
    	       POST
		    </label>
		  </div>
		  <div class="nx-switch-item">
		    <input type="checkbox" id="switch4" name="PUT" ${storage?.api?.PUT ? "checked" : ""}/>
		    <label for="switch4">
		      <span class="nx-switch"></span>
    	       PUT
		    </label>
		  </div>
		  <div class="nx-switch-item">
		    <input type="checkbox" id="switch8" name="PATCH" ${storage?.api?.PATCH ? "checked" : ""}/>
		    <label for="switch8">
		      <span class="nx-switch"></span>
    	       PATCH
		    </label>
		  </div>
	  <div class="nx-switch-item">
		    <input type="checkbox" id="switch5"  name="DELETE"${storage?.api?.DELETE ? "checked" : ""}/>
		    <label for="switch5">
		      <span class="nx-switch"></span>
    	     DELETE
		    </label>
		  </div>
		  <div class="nx-switch-item">
		    <input type="checkbox" id="switch7" name="OPTIONS" ${storage?.api?.OPTIONS ? "checked" : ""}/>
		    <label for="switch7">
		      <span class="nx-switch"></span>
    	     OPTIONS
		    </label>
		  </div>




		  </div>
      </td>

    </tr>
    <tr>
      <td>Description</td>
        <td><span id="description" type="text" class="editable" data-min-length="5" name="description">${storage?.api?.description ||'Null'}</span></td>
    </tr>

  </tbody>
</table>
    `,
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
    footer: "Panduan Konfigurasi",
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Konfigurasi Token</strong>
              <p class="mb-2">Aktifkan "Generate Token" untuk membuat token otomatis. Token akan digunakan untuk autentikasi API dan ditampilkan di field Authorization.</p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Endpoint API</strong>
              <p class="mb-2">Gunakan endpoint yang ditampilkan untuk mengakses API. Format: <code>/api/[App Name]</code>. Endpoint ini digunakan untuk semua operasi CRUD. Tambahkan base URL server Anda di depan endpoint.</p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Akses Data</strong>
              <p class="mb-2">Pilih akses data: <strong>Public</strong> untuk akses tanpa autentikasi, atau <strong>Privat</strong> untuk akses yang memerlukan token/authorization.</p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Operasi API (HTTP Methods)</strong>
              <p class="mb-2">Aktifkan operasi HTTP method yang diizinkan untuk API ini:</p>
              <ul class="mb-2" style="padding-left: 20px; margin-top: 8px;">
                <li><strong>GET</strong> - Untuk membaca/mengambil data dari server. Tidak mengubah data, hanya mengambil informasi.</li>
                <li><strong>POST</strong> - Untuk menambah data baru ke server. Mengirim data dalam request body (FormData atau JSON).</li>
                <li><strong>PUT</strong> - Untuk menampilkan data dari server. Sama seperti GET, tetapi menggunakan method 'red' di backend untuk membaca data.</li>
                <li><strong>PATCH</strong> - Untuk mengubah/update data sebagian saja. Hanya mengupdate field yang dikirim, field lain tetap tidak berubah. Menggunakan method 'updated' di backend.</li>
                <li><strong>DELETE</strong> - Untuk menghapus data dari server. Hati-hati saat mengaktifkan operasi ini.</li>
                <li><strong>OPTIONS</strong> - Untuk pagination dan metadata. Mengembalikan informasi tentang data tanpa mengubahnya.</li>
              </ul>
              <p class="mb-2">Pilih hanya operasi yang benar-benar diperlukan untuk keamanan API Anda.</p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Autentikasi</strong>
              <p class="mb-2">Untuk API Privat, sertakan header Authorization dengan token yang ditampilkan. Contoh: <code>Authorization: [token]</code></p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6. App ID & App Name</strong>
              <p class="mb-2">App ID dan App Name digunakan untuk identifikasi aplikasi. <strong>App Name dapat diubah</strong> dengan klik pada field tersebut. App Name menjadi bagian dari endpoint URL dan akan otomatis memperbarui endpoint.</p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>7. Expire Token</strong>
              <p class="mb-2"><strong>Field Expire dapat diubah</strong> dengan klik pada field tersebut. Set tanggal kadaluarsa token atau biarkan false jika token tidak memiliki batas waktu. Format: YYYY-MM-DD atau false.</p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>8. Description</strong>
              <p class="mb-2"><strong>Field Description dapat diubah</strong> dengan klik pada field tersebut. Tambahkan deskripsi atau dokumentasi tentang penggunaan API ini. Deskripsi ini membantu pengembang lain memahami fungsi dan cara menggunakan API yang telah dikonfigurasi. Minimum 5 karakter.</p>
            </div>
          </div>
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>9. Save Bucket API</strong>
              <p class="mb-2">Setelah mengkonfigurasi semua pengaturan, klik tombol <strong>"Save Bucket"</strong> di bagian bawah untuk menyimpan konfigurasi API ke database. Tombol akan berubah menjadi <strong>"Update Bucket"</strong> setelah data berhasil disimpan. Konfigurasi yang disimpan mencakup: version, config API, data aplikasi, field mapping, dan description.</p>
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
  await NXUI.NexaRender.refresh(store, setRestful, {
    containerSelector: ["#setRestful"],
  });
}
export async function tabelEdit(Sdk) {
  try {
    const storage = await Sdk.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
          await Sdk.upIndex({

              api: {
              [variable]:newValue
           },
          });
        // Re-render form setelah perubahan
        await rendering(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
  }
}

export async function setCheckbox(Sdk) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    
    const checkbox = new NXUI.Checkbox();
    // Set callback untuk menangani perubahan checkbox

    checkbox.onSaveCallback(async (element) => {
      const storage = await Sdk.storage();
      if (element.name=='token') {
      	 const authorization = storage.authorization ?? storage?.api?.authorization ?? settoken(storage.key)
          await Sdk.upIndex({
          	//api:false
                authorization: authorization,
          	    api:{
                    token: element.checked,
                     authorization: authorization,
                    appid:storage.key,
                    endpoind:storage.className.toLowerCase(),
                    GET:false,
                    POST:false,
                    PUT:false,
                    PATCH:false,
                    OPTIONS:false,
                    DELETE:false,
          	    }
          });
      } else {
          await Sdk.upIndex({
              api: {
              [element.name]:element.checked
           },
          });
      }
       await rendering(storage)
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
  }
}

export function settoken(context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `NX_${timestamp}${context}${random}`;
}
nx.addBucketApi = async function (id,token) {
  const Sdk = new NXUI.Buckets(id);
   const storage = await Sdk.storage();
   let data=NXUI.RESAPI


    // Validasi data sebelum dikirim
    if (!data || !data.config) {
      return;
    }

    const dataTabel = await NXUI.Storage().models("Office").restful({
      endpoind:data.config?.endpoind || storage?.api?.endpoind || storage?.className?.toLowerCase() || null,
      version:data.version || storage?.version || '1.0.0',
      appname:data.config?.appname || data.config?.endpoind || storage?.api?.appname || storage?.api?.endpoind || null,
      authorization:data.config?.authorization || token || null,
      description:data.config?.description || null,
      data:data || null,
      storage:storage || null,
    });

    // Simpan key response jika berhasil
    if (dataTabel?.response?.id) {
      await Sdk.upIndex({
          api: {
          key:dataTabel.response.id,
       },
      });
      await rendering(storage);
    }
  // return await Sdk.upBucket();
};