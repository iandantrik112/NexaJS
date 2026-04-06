import { androidColors, getSelectedColor, generateAssetColor } from './color.js';

export async function refScreen(data) {
  try {
  const  Sdk = await window.NXUI.ref.get("bucketsStore", "Apps");
    NXUI.FormIndexData = Sdk;
    console.log('Sdk:', Sdk);
      const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 220, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Apps Screen </h3>  
           <div class="nx-card-controls align-right"></div>
         </div>
      <div id="refScreen">
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
        await setCheckbox(Sdk)
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
  // Cek warna yang sudah dipilih dari storage
  const { selectedColor, isChecked } = getSelectedColor(Sdk);
  
  return {
    title: "Screen",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: "Apps Screen",
    html: `
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
                  <div style="font-size: 12px; color: #999; margin-bottom: 4px;">${Sdk.deskripsi || ''}</div>
                  <div style="font-size: 12px; color: #2196F3;">statusBar: "${Sdk.statusBar || ''}"</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <h4 style="margin-bottom: 15px; font-weight: 600;">Primary Colors</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 25px;">
          ${androidColors.primary.map((item, index) => {
            const isSelected = selectedColor === item.color && isChecked;
            return `
            <div class="color-card" style="border: ${isSelected ? '2px solid ' + item.color : '2px solid #e0e0e0'}; border-radius: 8px; padding: 10px; background: #fff; cursor: pointer; transition: all 0.3s; box-shadow: ${isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};" 
                 data-color="${item.color}" 
                 data-name="${item.name}" 
                 data-deskripsi="${item.deskripsi}" 
                 data-statusbar="${item.statusBar}">
              <div class="nx-switch-item" style="margin-bottom: 8px;">
                <input type="checkbox" id="color-primary-${index}" 
                       data-color="${item.color}"
                       data-name="${item.name}" 
                       data-deskripsi="${item.deskripsi}" 
                       data-statusbar="${item.statusBar}"
                       ${isSelected ? 'checked' : ''} />
                <label for="color-primary-${index}">
                  <span class="nx-switch"></span>
                  ${item.name}
                </label>
              </div>
              <div style="width: 100%; height: 60px; background: ${item.color}; border-radius: 4px; margin-bottom: 8px;"></div>
              <div style="font-size: 12px; color: #666; margin: 4px 0;">${item.color}</div>
              <div style="font-size: 11px; color: #999;">${item.deskripsi}</div>
              <div style="font-size: 11px; color: #2196F3; margin-top: 4px;">statusBar: "${item.statusBar}"</div>
            </div>
          `;
          }).join('')}
        </div>

        <h4 style="margin-bottom: 15px; font-weight: 600; margin-top: 20px;">Neutral Colors</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 25px;">
          ${androidColors.neutral.map((item, index) => {
            const isSelected = selectedColor === item.color && isChecked;
            return `
            <div class="color-card" style="border: ${isSelected ? '2px solid ' + item.color : '2px solid #e0e0e0'}; border-radius: 8px; padding: 10px; background: #fff; cursor: pointer; transition: all 0.3s; box-shadow: ${isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};" 
                 data-color="${item.color}" 
                 data-name="${item.name}" 
                 data-deskripsi="${item.deskripsi}" 
                 data-statusbar="${item.statusBar}">
              <div class="nx-switch-item" style="margin-bottom: 8px;">
                <input type="checkbox" id="color-neutral-${index}" 
                       data-color="${item.color}"
                       data-name="${item.name}" 
                       data-deskripsi="${item.deskripsi}" 
                       data-statusbar="${item.statusBar}"
                       ${isSelected ? 'checked' : ''} />
                <label for="color-neutral-${index}">
                  <span class="nx-switch"></span>
                  ${item.name}
                </label>
              </div>
              <div style="width: 100%; height: 60px; background: ${item.color}; border-radius: 4px; margin-bottom: 8px; border: ${item.color === '#FFFFFF' || item.color === '#fff' || item.color === '#F5F5F5' ? '1px solid #e0e0e0' : 'none'};"></div>
              <div style="font-size: 12px; color: #666; margin: 4px 0;">${item.color}</div>
              <div style="font-size: 11px; color: #999;">${item.deskripsi}</div>
              <div style="font-size: 11px; color: #2196F3; margin-top: 4px;">statusBar: "${item.statusBar}"</div>
            </div>
          `;
          }).join('')}
        </div>

        <h4 style="margin-bottom: 15px; font-weight: 600; margin-top: 20px;">Accent Colors</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
          ${androidColors.accent.map((item, index) => {
            const isSelected = selectedColor === item.color && isChecked;
            return `
            <div class="color-card" style="border: ${isSelected ? '2px solid ' + item.color : '2px solid #e0e0e0'}; border-radius: 8px; padding: 10px; background: #fff; cursor: pointer; transition: all 0.3s; box-shadow: ${isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};" 
                 data-color="${item.color}" 
                 data-name="${item.name}" 
                 data-deskripsi="${item.deskripsi}" 
                 data-statusbar="${item.statusBar}">
              <div class="nx-switch-item" style="margin-bottom: 8px;">
                <input type="checkbox" id="color-accent-${index}" 
                       data-color="${item.color}"
                       data-name="${item.name}" 
                       data-deskripsi="${item.deskripsi}" 
                       data-statusbar="${item.statusBar}"
                       ${isSelected ? 'checked' : ''} />
                <label for="color-accent-${index}">
                  <span class="nx-switch"></span>
                  ${item.name}
                </label>
              </div>
              <div style="width: 100%; height: 60px; background: ${item.color}; border-radius: 4px; margin-bottom: 8px;"></div>
              <div style="font-size: 12px; color: #666; margin: 4px 0;">${item.color}</div>
              <div style="font-size: 11px; color: #999;">${item.deskripsi}</div>
              <div style="font-size: 11px; color: #2196F3; margin-top: 4px;">statusBar: "${item.statusBar}"</div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
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
    footer: "Apps Screen",
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>1. Pilih Warna</strong>
              <p class="mb-2">Pilih salah satu warna dari kategori Primary, Neutral, atau Accent Colors dengan mencentang checkbox pada warna yang diinginkan. Hanya satu warna yang dapat dipilih dalam satu waktu.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>2. Informasi Warna</strong>
              <p class="mb-2">Setelah memilih warna, informasi warna terpilih akan ditampilkan di bagian atas, termasuk nama warna, kode hex, deskripsi, dan rekomendasi statusBar style.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>3. StatusBar Style</strong>
              <p class="mb-2">Setiap warna memiliki rekomendasi statusBar style:
                <br>- <strong>"light"</strong>: Teks putih (untuk background gelap)
                <br>- <strong>"dark"</strong>: Teks hitam (untuk background terang)
              </p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>4. Penyimpanan Otomatis</strong>
              <p class="mb-2">Warna yang dipilih akan otomatis tersimpan dan akan tercentang kembali saat halaman dimuat ulang.</p>
            </div>
          </div>
          
          <div class="nx-step mb-2">
            <div class="nx-step-content">
              <strong>5. Kategori Warna</strong>
              <p class="mb-2">
                <strong>Primary Colors:</strong> Warna utama Material Design untuk elemen penting.
                <br><strong>Neutral Colors:</strong> Warna netral untuk background dan teks.
                <br><strong>Accent Colors:</strong> Warna aksen untuk highlight dan fitur khusus.
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
  await NXUI.NexaRender.refresh(store, refScreen, {
    containerSelector: ["#refScreen"],
  });
}
 



 export async function setCheckbox(store) {
  try {
    // Ambil data dari storage untuk mengecek checkbox yang sudah dipilih
    const savedData = await window.NXUI.ref.get("bucketsStore", "Apps");
    console.log('Data tersimpan:', savedData);
    
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      // const storage = await store.storage();
      // Handle checkbox kondisi field
      
      // Akses atribut data melalui element.data (camelCase)
      // Contoh: data-color -> element.data.color, data-status-bar -> element.data.statusBar
      const color = element.data?.color;
      const name = element.data?.name;
      const deskripsi = element.data?.deskripsi;
      const statusBar = element.data?.statusbar;
     
      
      // Jika checkbox dicentang dan memiliki data-color, tampilkan info
      if (element.checked && color) {
        // Ambil data yang sudah ada terlebih dahulu untuk mempertahankan variabel lain
        // (seperti title, version, dan variabel lainnya yang sudah ada)
        const existingData = await window.NXUI.ref.get("bucketsStore", "Apps") || {};
        
        // Generate assetColor berdasarkan warna yang dipilih
        const assetColor = generateAssetColor(color);
        
        // Merge data yang sudah ada dengan data baru
        // Spread operator ...existingData mempertahankan semua variabel yang sudah ada
        // (title, version, dll) dan hanya update field yang diubah
        await window.NXUI.ref.set("bucketsStore", {
          ...existingData, // Pertahankan semua variabel yang sudah ada (title, version, dll)
          id:"Apps",
          color:color, 
          name:name, 
          deskripsi:deskripsi, 
          statusBar:statusBar,
          checked: element.checked,
          assetColor: assetColor // Simpan assetColor yang sudah di-generate sebagai object
        });
        await rendering(store)
        

      }
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}
 