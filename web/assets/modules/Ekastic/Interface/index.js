
import { NexaInstallUI } from "./install.js";
import { EkasticTabel } from "../../Tabel/EkasticTabel.js";
export async function setInterface(key, data) {
  try {

    const tabel = await NXUI.ref.get(key.store, key.id);
    // if (tabel?.packages) {
      const content=tabel?.packages
      const dimensi = new NXUI.NexaDimensi();
       const height = dimensi.height("#nexa_app", 180, 'vh');     


      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
              <div class="nx-card-header">
                    <div class="nx-card-title">
                     <h5 class="bold">User interface (UI) </h5>
                    </div>
              </div>
              <div class="nx-row" style="padding-top:100px">
              <div class="nx-col-6">
          <div class="nx-media nx-media-bordered" onclick="selectDataType('table','${key.id}')" style="cursor: pointer; padding: 15px; border-radius: 8px; transition: all 0.3s ease; border: 2px solid transparent;">
          <div class="nx-media-img" style="width:40px">
            <span class="material-symbols-outlined" style="font-size:40px; color:#566476">table_view</span>
          </div>
            <div class="nx-media-body">
              <h5 style="margin: 0 0 8px 0; color: #2c3e50;"> Data Tabel</h5>
              <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Tampilan data dalam format tabel yang terstruktur dan mudah dibaca. Cocok untuk data numerik dan kategorikal yang memerlukan analisis komparatif.</p>
            </div>
          </div>
              </div>
              <div class="nx-col-6 pl-20px">
          <div class="nx-media nx-media-bordered" onclick="selectDataType('object','${key.id}')" style="cursor: pointer; padding: 15px; border-radius: 8px; transition: all 0.3s ease; border: 2px solid transparent;">
          <div class="nx-media-img" style="width:40px">
            <span class="material-symbols-outlined" style="font-size:40px; color:#566476">landslide</span>
          </div>
                   <div class="nx-media-body">
              <h5 style="margin: 0 0 8px 0; color: #2c3e50;"> Data Object</h5>
              <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Tampilan data dalam format objek yang fleksibel dan dinamis. Ideal untuk data kompleks dengan relasi hierarkis dan struktur yang bervariasi.</p>
           
            </div>
          </div>
              </div>
            
            </div>
        `;

      // Generate narrative as fallback if diagram fails
      setTimeout(async () => {
        try {
          // await searchKeyword(dataform);
        } catch (error) {
          console.error("❌ Error rendering form:", error);
        }
      }, 100);
      // 5. Kembalikan HTML template sebagai string
      return wrapper.innerHTML;

  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

nx.selectDataType =async function (type,id) {
 const installInstance = new NexaInstallUI();
return await installInstance.showInstallModal(id, type);
};


 
