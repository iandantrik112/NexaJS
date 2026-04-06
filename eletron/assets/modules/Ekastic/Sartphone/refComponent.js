import { androidColors, getSelectedColor, generateAssetColor } from './color.js';
export async function refComponent(data) {
  try {
   const  Sdk = await window.NXUI.ref.get("bucketsStore", "Apps");

      const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 220, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Component</h3>  
           <div class="nx-card-controls align-right"></div>
         </div>
      <div id="refComponent">
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
    const { selectedColor, isChecked } = getSelectedColor(Sdk);
    const assetColor = generateAssetColor(selectedColor);
    
    // Simpan assetColor ke storage jika belum ada atau perlu update
    if (selectedColor && isChecked) {
      const existingData = await window.NXUI.ref.get("bucketsStore", "Apps") || {};
      const existingAssetColor = existingData.assetColor || {};
      if (JSON.stringify(existingAssetColor) !== JSON.stringify(assetColor)) {
        await window.NXUI.ref.set("bucketsStore", {
          ...existingData,
          id: "Apps",
          assetColor: assetColor
        });
      }
    }
    
  return {
    title: "Properti",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `
SDK (Software Development Kit)

  <small class="text-muted align-right">
   <button onclick="addBucketApps('${Sdk?.key|| 0}');" class="nx-btn-primary custom-size-sm">
   ${Sdk?.key ?' Update' : 'Save'} Bucket
   </button>
  </small>
      `,
    html:`
      <div style="padding:0px;">
        <div id="selectedColorInfo" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; ${selectedColor && isChecked ? 'display: block;' : 'display: none;'}">
          <strong>Warna Terpilih:</strong>
          <div id="selectedColorDetails" style="margin-top: 8px;">
            ${selectedColor && isChecked ? `
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; background: ${selectedColor}; border-radius: 8px; border: 1px solid #e0e0e0;"></div>
                <div>
                  <div style="font-weight: 600; font-size: 16px; color: #333; margin-bottom: 4px;">${Sdk.name || ''}</div>
                  <div style="font-size: 14px; color: #666; margin-bottom: 4px;">${selectedColor}</div>
                  <div style="font-size: 12px; color: #999; margin-bottom: 4px;">${Sdk.description || ''}</div>
                  <div style="font-size: 12px; color: #2196F3;">statusBar: "${Sdk.statusBar || ''}"</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        
        ${selectedColor && isChecked ? `
        <div id="assetColorInfo" style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
          <strong>Asset Color:</strong>
          <div style="margin-top: 10px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px;">
            <div><strong>backgroundColor:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${assetColor.backgroundColor}; border: 1px solid #ddd; vertical-align: middle; margin-left: 5px;"></span> ${assetColor.backgroundColor}</div>
            <div><strong>color:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${assetColor.color}; border: 1px solid #ddd; vertical-align: middle; margin-left: 5px;"></span> ${assetColor.color}</div>
            <div><strong>btnColor:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${assetColor.btnColor}; border: 1px solid #ddd; vertical-align: middle; margin-left: 5px;"></span> ${assetColor.btnColor}</div>
            <div><strong>iconTextColor:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${assetColor.iconTextColor}; border: 1px solid #ddd; vertical-align: middle; margin-left: 5px;"></span> ${assetColor.iconTextColor}</div>
            <div><strong>buttonColor:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${assetColor.buttonColor}; border: 1px solid #ddd; vertical-align: middle; margin-left: 5px;"></span> ${assetColor.buttonColor}</div>
            <div><strong>buttonTextColor:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${assetColor.buttonTextColor}; border: 1px solid #ddd; vertical-align: middle; margin-left: 5px;"></span> ${assetColor.buttonTextColor}</div>
            <div><strong>deleteColor:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${assetColor.deleteColor}; border: 1px solid #ddd; vertical-align: middle; margin-left: 5px;"></span> ${assetColor.deleteColor}</div>
          </div>
        </div>
        ` : ''}
        </div>


 <table class="nx-table" style="background-color: #ffffff00;">
  <tbody>
    <tr>
      <td style="width:200px">Version</td>
      <td><span id="version" type="text" class="editable" data-min-length="5" name="version">${Sdk?.version || '1.0.0'}</span></td>
    </tr>
    <tr>
      <td>App Name</td>
      <td><span id="appname" type="text" class="editable" data-min-length="5" name="appname">${Sdk?.appname || 'NexaUI'}</span></td>
    </tr>
    <tr>
      <td>Deskripsi</td>
      <td><span id="description" type="text" class="editable" data-min-length="5" name="description">${Sdk?.description || `Selamat datang di NexaUI Framework! Kami menghadirkan solusi
        pengembangan Mobile yang benar-benar berbeda`}</span></td>
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
    footer: `
SDK (Software Development Kit)
      `,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Edit Properti Aplikasi</strong>
              <p class="mb-2">Klik pada field yang ingin Anda edit di tabel "Properti" untuk melakukan inline editing. Anda dapat mengedit Version, App Name, dan Deskripsi aplikasi secara langsung.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Inline Editing</strong>
              <p class="mb-2">Setelah mengklik field, Anda dapat langsung mengetik untuk mengubah nilainya. Perubahan akan otomatis tersimpan ke storage saat Anda selesai mengedit.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. Warna Terpilih</strong>
              <p class="mb-2">Jika Anda sudah memilih warna di halaman "Screen", informasi warna terpilih akan ditampilkan di bagian atas tabel Properti, termasuk nama warna, kode hex, deskripsi, dan statusBar style.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Simpan ke Database</strong>
              <p class="mb-2">Gunakan tombol "Save Bucket" atau "Update Bucket" di bagian footer untuk menyimpan semua perubahan ke database. Data akan tersimpan dengan ID "Apps" di bucketsStore.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Field Properti</strong>
              <p class="mb-2">
                <strong>Version:</strong> Versi aplikasi Anda (contoh: 1.0.0)
                <br><strong>App Name:</strong> Nama aplikasi yang akan ditampilkan
                <br><strong>Deskripsi:</strong> Deskripsi singkat tentang aplikasi Anda
              </p>
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
  await NXUI.NexaRender.refresh(store, refComponent, {
    containerSelector: ["#refComponent"],
  });
}
 

 export async function tabelEdit(store) {
  try {
    const storage = await window.NXUI.ref.get("bucketsStore", "Apps");
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        console.log('label:', variable,newValue);

        const existingData = await window.NXUI.ref.get("bucketsStore", "Apps") || {};
        
        // Merge data yang sudah ada dengan data baru
        // Spread operator ...existingData mempertahankan semua variabel yang sudah ada
        // (title, version, dll) dan hanya update field yang diubah
        await window.NXUI.ref.set("bucketsStore", {
          ...existingData, // Pertahankan semua variabel yang sudah ada (title, version, dll)
          id:"Apps",
          [variable]:newValue, 
        });
      });

    // Inisialisasi semua elemen yang dapat diedit inline Nested 
    nexaField.initElements();
  } catch (error) {
  }
}
nx.addBucketApps = async function (key) {
    const existingData = await window.NXUI.ref.get("bucketsStore", "Apps") || {};
    const dataTabel = await NXUI.Storage().models("Office").setApps(existingData);
    console.log('addBucketApps:', dataTabel);
     await window.NXUI.ref.set("bucketsStore", {
         ...existingData, // Pertahankan semua variabel yang sudah ada (title, version, dll)
         id:"Apps",
         key:dataTabel.data.response.id, 
       });
     await rendering(existingData)

}