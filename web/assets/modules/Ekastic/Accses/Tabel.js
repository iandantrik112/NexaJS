
import { uidAccses } from "./data.js";
import { setCheckbox } from "./index.js";
export async function AccsesTable(Sdk) {
  const storage = await Sdk.storage();
  const app = await uidAccses(storage);
 try {
    const dataDom = new NXUI.NexaDom({
        container: '#dataContainer',
        pagination: '#itempagination',
        sortOrder: 'ASC',
        sortBy: 'id',
        // sortClickElement: '#sortBy',  // ✅ Element untuk toggle sort
        // paginationinfo: "#info",
        searchElement: "#itemsearch",  // ✅ Element input search
        searchFields: ['nama'],        // ✅ Field yang dicari
        order:5,
        config: app,  // ✅ Pass config object
        // ✅ Callback untuk inisialisasi elemen dinamis setelah render
        onAfterRender: (data, container) => {
            const datauser=window.NXUI?.currentState?.totalCount || 0 ;
            NXUI.id("iteminfo").innerHTML=datauser+' User Accses';
            // Panggil setCheckbox dari index.js untuk handle checkbox dinamis
            setCheckbox(Sdk);
            
            // Set src ke original URL jika ada (onerror handler akan handle fallback)
            const avatarImages = container.querySelectorAll('img[data-original]');
            avatarImages.forEach((img) => {
                const originalUrl = img.dataset.original;
                
                if (originalUrl && originalUrl.trim()) {
                    // Langsung set src ke original, onerror handler akan handle fallback
                    img.src = originalUrl;
                }
            });
        },
         render: (dataArray) => {
        
         const rows = dataArray.map((user, index) => {
                // Fallback ke gambar default jika avatar tidak ada atau error
                // Gunakan NEXA.urlBase terlebih dahulu (URL asli dari server), jika tidak ada baru gunakan NEXA.url
                const baseUrl = NEXA.urlBase || NEXA.url || window.location.origin;
                const defaultAvatar = `${baseUrl}/assets/drive/images/pria.png`;
                // Simpan URL avatar asli di data attribute untuk pre-check
                const originalAvatarUrl = (user.avatar && user.avatar.trim())
        ? `${baseUrl}/assets/drive/${user.avatar}`
        : null;
                // Langsung gunakan default jika avatar tidak ada atau kosong
                const avatarUrl = originalAvatarUrl || defaultAvatar;

      // Fix data structure handling
      const subdata = user.subdata || [];
      const hasAccessID = subdata.length > 0 ? subdata[0].id : "false";
      const hasAccess = subdata.length > 0;
      const status   =subdata.length > 0 && subdata[0].status == 1 ? "checked" : "";
      const acmenu =subdata.length > 0 && subdata[0].acmenu == 1 ? "checked" : "";
      const pintasan =subdata.length > 0 && subdata[0].pintasan == 1 ? "checked" : "";
      const acdelete =subdata.length > 0 && subdata[0].acdelete == 1 ? "checked" : "";
      const acpublik =subdata.length > 0 && subdata[0].acpublik == 1 ? "checked" : "";
      const approval =subdata.length > 0 && subdata[0].approval == 1 ? "checked" : "";
      const acupdate =subdata.length > 0 && subdata[0].acupdate == 1 ? "checked" : "";
      const acinsert =subdata.length > 0 && subdata[0].acinsert == 1 ? "checked" : "";
      const kecamatan =subdata.length > 0 && subdata[0].kecamatan == 1 ? "checked" : "";
      const desa =subdata.length > 0 && subdata[0].desa == 1 ? "checked" : "";

      const accessStatus = hasAccess
        ? `<span class="nx-badge nx-soft-green">✓ Access Granted</span>`
        : `<span class="nx-badge nx-soft-red">✗ No Access</span>`;

      const accessDetails = hasAccess
        ? user.subdata
            .map(
              (access) =>
                `<small class="text-muted d-block">${access.categori} - ${access.label}</small>`
            )
            .join("")
        : '<small class="text-muted">No access permissions</small>';
         
         return `
             <tr>
                 <td>
                     <div class="nx-user-info">
             <img src="${defaultAvatar}" alt="${user.nama}" class="nx-avatar nx-avatar-sm" 
                  loading="lazy"
                  data-original="${originalAvatarUrl || ''}"
                  data-default="${defaultAvatar}"
                  data-user-index="${index}"
                  onerror="if(this.src !== this.dataset.default) { this.onerror=null; this.src=this.dataset.default; }">
             <div class="nx-user-details">
               <strong>${user.nama}</strong>
               <small class="text-muted d-block">ID: ${user.jabatan}</small>
           <div><i class="fas fa-shield-alt"></i> Access Status</div>
              ${accessStatus}
             </div>
           </div>
                 </td>
                 
                 <td>
                 <div class="nx-switch-grid">
          
               <div class="nx-switch-item">
                 <input class="${hasAccessID}" name="status" value="${user.id}" type="checkbox" id="explorer${index}"${status}/>
                 <label for="explorer${index}">
                   <span class="nx-switch"></span>
                    Permissions
                 </label>
               </div>

               <div class="nx-switch-item">
                 <input class="${hasAccessID}" name="pintasan" value="${user.id}" type="checkbox" id="pintasan${index}" ${pintasan} />
                 <label for="pintasan${index}">
                   <span class="nx-switch"></span>
                  Pintasan
                 </label>
               </div>

               <div class="nx-switch-item">
                 <input class="${hasAccessID}" name="acmenu" value="${user.id}" type="checkbox" id="acmenu${index}" ${acmenu} />
                 <label for="acmenu${index}">
                   <span class="nx-switch"></span>
                   Navigation 
                 </label>
               </div>
              <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="approval" value="${user.id}" type="checkbox" id="switchapproval${index}" ${approval} />
                 <label for="switchapproval${index}">
                   <span class="nx-switch"></span>
                 Approval 
                 </label>
               </div>

              <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="acinsert" value="${user.id}" type="checkbox" id="switchIinsert${index}" ${acinsert} />
                 <label for="switchIinsert${index}">
                   <span class="nx-switch"></span>
                 Insert
                 </label>
               </div>

               <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="acdelete" value="${user.id}" type="checkbox" id="switchDelete${index}" ${acdelete} />
                 <label for="switchDelete${index}">
                   <span class="nx-switch"></span>
                 Delete
                 </label>
               </div>

 

             <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="acupdate" value="${user.id}" type="checkbox" id="switchacupdate${index}" ${acupdate} />
                 <label for="switchacupdate${index}">
                   <span class="nx-switch"></span>
                 Update 
                 </label>
               </div>
                 <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="acpublik" value="${user.id}" type="checkbox" id="switchacpublik${index}" ${acpublik} />
                 <label for="switchacpublik${index}">
                   <span class="nx-switch"></span>
                 Public 
                 </label>
               </div>
              <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="kecamatan" value="${user.id}" type="checkbox" id="switchkecamatan${index}" ${kecamatan} />
                 <label for="switchkecamatan${index}">
                   <span class="nx-switch"></span>
                 Kecamatan 
                 </label>
               </div>

              <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="desa" value="${user.id}" type="checkbox" id="switchdesa${index}" ${desa} />
                 <label for="switchdesa${index}">
                   <span class="nx-switch"></span>
                 Desa 
                 </label>
               </div>

             </div>
                 </td>
             </tr>
         `;
         }).join('');
         return `
      <table class="nx-table nx-table-striped">
        <thead>
          <tr>
            <th><i class="fas fa-user"></i> User Information</th>
            <th><i class="fas fa-key"></i> Permissions</th>
          </tr>
        </thead>
         <tbody>${rows}</tbody></table>`;
     }


    });


  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return `
        <div class="alert alert-danger text-center">
            <h5>❌ Initialization Failed</h5>
            <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
        </div>
    `;
  }

}

// 🔧 Helper function untuk mendapatkan total count dari mana saja
window.getNexaTableInfo = function() {
    // Method 1: Dari global state
    if (window.NXUI && window.NXUI.currentState) {
        return window.NXUI.currentState;
    }
    
    // Method 2: Dari container dengan data-nexa-dom
    const nexaDomContainer = document.querySelector('[data-nexa-dom="true"]');
    if (nexaDomContainer && nexaDomContainer._nexaDomInstance) {
        const instance = nexaDomContainer._nexaDomInstance;
        return {
            totalCount: instance.state.totalCount,
            currentPage: instance.state.currentPage,
            totalPages: instance.state.totalPages,
            dataLength: instance.state.data.length,
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Method 3: Dari currentTableInfo jika tersedia
    if (window.NXUI && window.NXUI.currentTableInfo) {
        return window.NXUI.currentTableInfo;
    }
    
    return {
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        dataLength: 0,
        lastUpdated: null,
        error: 'No table data found'
    };
};

// 🔧 Shortcut function untuk mendapatkan total count saja
window.getTotalCount = function() {
    const info = window.getNexaTableInfo();
    return info.totalCount || 0;
};

// Fungsi global sudah tidak diperlukan karena menggunakan event listeners
