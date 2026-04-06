

export async function setValue(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
      const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 210, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Search  Value</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setValue">
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
          content: [await Aplikasi(Sdk,height), await Guide(Sdk,height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
         await tabelEdit(Sdk);
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
    const targeValue = storage?.target?.[storage?.value] || {};
    const checkedItems = targeValue.form || [];
    const fieldCount = Array.isArray(checkedItems) ? checkedItems.length : 0;

    const objKey = (targeValue?.variables && Array.isArray(targeValue.variables)) 
      ? targeValue.variables.join('|') + '|' 
      : '';
    let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-1">
  <tbody>
    ${
      checkedItems
        ? checkedItems
            .map(
              (item, index) => {
                // Ambil nilai add dari target[value].add[item.name]
                const addValue = targeValue?.add?.[item.name] || 'null';
                return `
      <tr>
      <td style="width:20px">
       <span class="material-symbols-outlined nx-icon-md">${NXUI.getIconByType(item.type)} </span>
     </td>
     <td>${item.name}</td>
     <td>  
     <div id="${item.name}"type="select" class="editable" name="add" data-options="${objKey}|null">${addValue}</div></td>
     </td> 
 


       </tr>
    `;
              }
            )
            .join("")
        : "<tr></tr>"
    }
  </tbody>
</table>
   `;






  return {
    title: `Properti  ${storage?.value ? `Activ ${storage?.value}` :''}`,
    col: "nx-col-7",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${fieldCount} Field Condition ${storage?.value ? `dari ${storage.value}` : ''}</small>`,
    html:tabelHtml,
  };
}

export async function Guide(Sdk,height) {
  const storage = await Sdk.storage();
  const checkedItems = await Sdk.getFields("search");
  const fieldCount = Array.isArray(checkedItems) ? checkedItems.length : 0;
  const targeValue = storage?.target || {};
  
  // Hitung field yang sudah dikonfigurasi (ada di target)
  const configuredCount = checkedItems ? checkedItems.filter(item => targeValue?.[item.name]).length : 0;
    let tabelHtml = `
<table class="nx-table-wrapper nx-table-sm mb-1">
  <tbody>
    ${
      checkedItems
        ? checkedItems
            .map(
              (item, index) => {
                const data = item.search;
                const satting=targeValue?.[item.name] ?'getValueSearch':'addValueSearch';
                return `
      <tr>
      <td style="width:20px">
       <span class="material-symbols-outlined nx-icon-md">${NXUI.getIconByType(item.type)} </span>
     </td>
     <td>${item.name}</td>
     <td>Key=${data?.tabelName}</td>
   
     <td class="text-center">
    <span class="material-symbols-outlined  nx-icon-md">${targeValue?.[item.name] ? 'check_box' : 'help_center'}</span>
      <a  href="javascript:void(0);" onclick="${satting}('${item.name}','${data?.tabelName}','${storage.id}','${index}')" title="Add item" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">${targeValue?.[item.name] ? 'settings' : 'add'} </span>
      </a>
      <a  href="javascript:void(0);" onclick="deletValueSearch('${item.name}','${data?.tabelName}','${storage.id}','${index}')" title="Hapus item" style="color:#ccc" >
               <span class="material-symbols-outlined nx-icon-md">delete</span>
      </a>

     </td>




       </tr>
    `;
              }
            )
            .join("")
        : "<tr></tr>"
    }
  </tbody>
</table>
   `;

  return {
    title: "Konfigurasi",
    col: "nx-col-5",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${configuredCount} dari ${fieldCount} Search Field dikonfigurasi</small>`,
    html: `
      ${tabelHtml}
<div class="nx-card">
  <div class="nx-card-header">
    <strong>Panduan</strong>
  </div>
  <div class="nx-card-body">
<div style="padding-top:4px">
     
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1.Pilih Search Field yang Aktif</strong>
              <p class="mb-2">Di tabel "Config", klik icon settings (⚙️) pada search field yang ingin dikonfigurasi. Ini akan mengaktifkan field tersebut dan menampilkan field condition yang tersedia di tabel "Properti".</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2.Pilih Field Condition</strong>
              <p class="mb-2">Lihat tabel "Properti" untuk melihat daftar field condition yang tersedia. Field condition ini akan menerima nilai dari hasil search yang dipilih user.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3.Map Field Condition ke Variable Database</strong>
              <p class="mb-2">Pada setiap field condition di tabel "Properti", pilih variable database dari dropdown. Variable ini akan menjadi sumber data yang diambil ketika user memilih item dari search field. Contoh: field condition "title" bisa di-map ke variable "jabatan" untuk mengambil data jabatan.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4.Cara Kerja Component Value</strong>
              <p class="mb-2">Ketika user memilih item dari search field, component Value akan otomatis mengambil nilai dari variable yang sudah di-map dan mengisi field condition yang sesuai. Data ini disimpan di <code>target[nama_field].add</code> yang dapat diakses untuk mengisi inputan form.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5.Menggunakan Data di Form</strong>
              <p class="mb-2">Data yang sudah di-map dapat diakses melalui <code>storage.target[nama_field].add[field_condition]</code>. Gunakan data ini untuk mengisi field form lainnya atau untuk logika bisnis yang diperlukan.</p>
            </div>
          </div>
         
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
  await NXUI.NexaRender.refresh(store, setValue, {
    containerSelector: ["#setValue"],
  });
}


export async function tabelEdit(store) {
  try {
    const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        // Ambil storage terbaru untuk mendapatkan value yang aktif
        const currentStorage = await store.storage();
        const activeValue = currentStorage?.value || variable;
        
        // Ambil data add yang sudah ada untuk digabungkan
        const existingAdd = currentStorage?.target?.[activeValue]?.add || {};
        
        // Bersihkan key "add" yang tidak seharusnya ada (bug dari data lama)
        const cleanedAdd = { ...existingAdd };
        if (cleanedAdd.hasOwnProperty('add')) {
          delete cleanedAdd.add;
        }
        
        // variable = id element (nama field condition seperti "title")
        // fieldName = name attribute ("add")
        // Simpan ke target[activeValue].add[variable] = target[activeValue].add["title"]
        const updatedAdd = {
          ...cleanedAdd,
          [variable]: newValue  // Menggunakan variable (nama field) sebagai key
        };
        
        // Simpan ke target[activeValue].add dengan seluruh data yang sudah di-update
        await store.upNested({
          [activeValue]: {
            add: updatedAdd
          }
        }, 'target');

         await store.upField({
           [variable]: {
              target: true,
           },
         });

        // // Re-render form setelah perubahan
        // await renderingEditorSelectTags(storage);
        const updatedStorage = await store.storage();
         await rendering(updatedStorage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error renderingEditor form:", error);
  }
}




window.getValueSearch = async function (falid, tabel, id, index) {
  const Sdk = new NXUI.Buckets(id);
  await Sdk.upIndex({
    value: falid,
  });
  
  // Refresh tampilan setelah mengatur value
  const storage = await Sdk.storage();
  await rendering(storage);
}
window.addValueSearch = async function (falid, tabel, id, index) {
  const Sdk = new NXUI.Buckets(id);
  const checkedItems = await Sdk.getFields("search");
  const checkedCondition = await Sdk.getFields("condition");
  const Condition = checkedCondition.map(item => (item.name));





  const metaField = await Sdk.metaField(tabel, falid);
  const allVariables = metaField?.data[falid]?.variables ?? [];
  
  // Daftar variabel yang harus di-exclude
  const excludeVariables = [
    "id",
   
  ];
  
  // Filter variabel yang tidak ada di excludeVariables
  const variables = allVariables.filter(variable => !excludeVariables.includes(variable));
  
  await Sdk.upIndex({
    value: falid,
    target: {
      [falid]: {
        variables: variables,
        form: checkedCondition,
        satatic: false,
        ...checkedItems[index].search,
        // Pastikan add adalah object, bukan false
        add: checkedItems[index].search?.add || {},
      },
    },
  });
  
  // Refresh tampilan setelah menambah
  const storage = await Sdk.storage();
  await rendering(storage);
}
window.deletValueSearch = async function (falid, tabel, id, index) {
  const Sdk = new NXUI.Buckets(id);
  const storage = await Sdk.storage();
  
  // Ambil target yang sudah ada
  const currentTarget = storage?.target || {};
  
  // Hapus item dengan key falid dari target
  if (currentTarget[falid]) {
    delete currentTarget[falid];
    
    // Update target dengan menghapus key yang sudah dihapus
    // Simpan kembali storage yang sudah dimodifikasi
    if (storage?.store && storage?.id) {
      await NXUI.ref.mergeData(storage.store, storage.id, {
        ...storage,
        target: currentTarget
      });
    }
    
    // Ambil storage terbaru setelah merge untuk refresh tampilan
    const updatedStorage = await Sdk.storage();
    await rendering(updatedStorage);
  }
}
