import { AccsesTable } from "./Tabel.js";
export async function setAccses(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    console.log('label:', NEXA);
    const storage = await Sdk.storage();
    const dimensi = new NXUI.NexaDimensi();
    const height = dimensi.height("#nexa_app", 140, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="AccsesUser">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">
            Access </h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
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
          content: [
            await userTabelAccses(Sdk,height),
            await konfigurasi(Sdk,height),
          ],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        //await tabelEdit(Sdk);
        // await setCheckbox(Sdk);
        const nexaScroll = new NXUI.NexaScroll({
        storageKey: 'nexaScrollPositions3',
        debounceDelay: 100,
        autoInit: true
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

export async function userTabelAccses(Sdk,height) {
  await AccsesTable(Sdk)
  return {
    title: "Permissions",
    col: "nx-col-8",
  
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `User Accses <span id="itempagination"></span>`,
    html:`


    <div class="nx-row">
    <div class="nx-col-5">
     <h3   id="iteminfo" class=" bold pt-15px pl-10px">0 User Accses</h3> 
    </div>
    <div class="nx-col-7">
<div class="form-nexa-input-group p-10px">
                    <div class="form-nexa-input-group-text">
                      <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
                    </div>
                    <input type="text" 
                           id="itemsearch" 
                           name="searchFormVariablesInput"
                           class="form-nexa-control" 
                           placeholder="Search User... (Ctrl+F)" 
                           >
                     <div class="form-nexa-input-group-text">
                       <button type="button" 
                               class="nx-btn-secondary" 
                               style="background: none; border: none; padding: 4px; color: #6c757d;">
                         <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
                       </button>
                     </div>
                  </div>


    </div>
  </div>
    <div id="dataContainer">
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p>Loading user data...</p>
        </div>
    </div>

      ` ,
  };
}

export async function konfigurasi(data,height) {
  return {
    title: "Access Control",
    col: "nx-col-4",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: ` 
    <small>
    🔐 Access Control:</strong> Kelola izin akses
    </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
              <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Permissions (Status)</strong>
              <p class="mb-2">Kontrol akses utama pengguna ke sistem. Mengaktifkan atau menonaktifkan akses dasar untuk pengguna tertentu.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Pintasan</strong>
              <p class="mb-2">Aktifkan/Nonaktifkan akses pintasan untuk pengguna. Memberikan kemudahan navigasi cepat dan akses langsung ke fitur penting.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Navigation (Menu Access)</strong>
              <p class="mb-2">Kontrol akses pengguna ke menu navigasi sistem. Mengatur izin untuk mengakses berbagai menu dan fitur aplikasi.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Approval Workflow</strong>
              <p class="mb-2">Aktifkan sistem persetujuan untuk tindakan tertentu. Memerlukan konfirmasi sebelum eksekusi operasi penting.</p>
            </div>
          </div>

          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Insert Permission</strong>
              <p class="mb-2">Izinkan atau batasi kemampuan pengguna untuk menambahkan data baru dalam sistem. Kontrol akses untuk operasi penambahan data.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>6. Delete Permission</strong>
              <p class="mb-2">Izinkan atau batasi kemampuan pengguna untuk menghapus data/file dalam sistem. Kontrol akses untuk operasi penghapusan.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>7. Update Data</strong>
              <p class="mb-2">Kontrol kemampuan pengguna untuk memperbarui data dalam sistem. Mengatur izin edit dan modifikasi konten.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>8. Public Access</strong>
              <p class="mb-2">Kelola akses publik untuk data dan fitur tertentu. Kontrol visibilitas konten untuk pengguna umum dan publik.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>9. Kecamatan Access</strong>
              <p class="mb-2">Kontrol akses pengguna berdasarkan wilayah kecamatan. Mengatur izin akses data sesuai dengan wilayah administratif.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>10. Desa Access</strong>
              <p class="mb-2">Kontrol akses pengguna berdasarkan wilayah desa. Mengatur izin akses data sesuai dengan tingkat desa/kelurahan.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>11. Status Indicators</strong>
              <p class="mb-2">✓ Hijau: Pengguna memiliki akses penuh<br>✗ Merah: Pengguna tidak memiliki akses</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>12. Real-time Updates</strong>
              <p class="mb-2">Perubahan izin akan langsung diterapkan dan tersimpan ke database secara otomatis.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}
export async function renderingTabel(store) {
  await NXUI.NexaRender.refresh(store, setAccses, {
    containerSelector: ["#AccsesUser"],
  });
}
export async function setCheckbox(store) {
  try {
  const version = await NXUI.ref.get(
    "bucketsStore",
    "version"
    );
  console.log('label:', version.version);
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();
       const Notif = new NXUI.Notifikasi({ autoHideDelay: 4000 }); // 2 seconds
    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      console.log('label:', element);
      const storage = await store.storage();
      if (element.class=='false') {
         console.log('Insert')
            const dataformd=  await  new NXUI.NexaModels().Storage("controllers")
                .insert({
                  userid:Number(element.value),
                  categori: "Accses",
                  status: 1,
                  version: version?.version,
                  label:   storage?.className,
                  appid:   storage?.id,
                  appname: storage?.label,
                  appicon: storage?.appicon ?? "inventory_2",
                });
               Notif.show({
                      type: "success",
                      subtitle: `Berhasil mengaktifkan Access Permissions  `,
                      actions: true,
                    });
          await renderingAccses(storage)
      } else {
        if (element.name =="status") {
           if (element.checked) {
              const assert=element.checked ? "1" : "0"
              await new NXUI.NexaModels().Storage("controllers")
              .where("id", Number(element.class))
              .update({
                [element.name]:assert,
              });
           } else {
              await new NXUI.NexaModels().Storage("controllers")
              .where("id", Number(element.class))
              .delete();
                Notif.show({
                      type: "success",
                      subtitle: `Berhasil menonaktifkan Access Permissions `,
                      actions: true,
                    });

             await renderingAccses(storage)
           }
        } else {
          const assert=element.checked ? "1" : "0"
          await new NXUI.NexaModels().Storage("controllers")
          .where("id", Number(element.class))
          .update({
            [element.name]:assert,
          });
                  // ✅ Subtitle berdasarkan status checked dan element.name
                  let subtitleMessage;
                  if (element.name === 'acmenu') {
                    subtitleMessage = assert === "1" 
                      ? `Berhasil mengaktifkan akses menu  secara public`
                      : `Berhasil menonaktifkan  akses menu   secara public`
                 
                  } else if (element.name === 'acdelete') {
                    subtitleMessage = assert === "1"
                      ? `Berhasil mengaktifkan akses hapus data   secara public`
                      : `Berhasil menonaktifkan  akses hapus data   secara public`
                  } else if (element.name === 'acpublik') {
                    subtitleMessage = assert === "1"
                      ? `Berhasil mengaktifkan  akses data public`
                      : `Berhasil menonaktifkan akses data public`;

                  } else if (element.name === "acinsert") {
                    subtitleMessage = assert === "1"
                      ? `Berhasil mengaktifkan insert data public`
                      : `Berhasil menonaktifkan  insert data public`;

                  } else if (element.name === "acupdate") {
                    subtitleMessage = assert === "1"
                      ? `Berhasil mengaktifkan update data public`
                      : `Berhasil menonaktifkan  update data public`;
                  } else {
                    subtitleMessage = assert === "1"
                      ? `Berhasil mengaktifkan  Access  ${element.name}`
                      : `Berhasil menonaktifkan  Access  ${element.name}`;
                  }
                  
                  Notif.show({
                      type: "success",
                      subtitle: subtitleMessage,
                      actions: true,
                    });


        }
      }
      
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

export async function renderingAccses(store) {
  await NXUI.NexaRender.refresh(store, setAccses, {
    containerSelector: ["#AccsesUser"],
  });
}
