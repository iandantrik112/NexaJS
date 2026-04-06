import { uidAccses } from "./data.js";
import { initializeUserSearch } from "./Search.js";

export async function AccsesTable(Sdk) {
  const storage = await Sdk.storage();
  const data = await uidAccses(storage.className);
  if (!data || !Array.isArray(data)) {
    return `
      <div class="nx-table-responsive">
        <div class="nx-alert nx-alert-warning">
          <strong>No Data Available</strong>
          <p>No user data found to display.</p>
        </div>
      </div>
    `;
  }
  const tableRows = data
    .map((user, index) => {
      const avatarUrl = user.avatar
        ? `${NEXA.url}/assets/drive/${user.avatar}`
        : ``;

      // Fix data structure handling
      const subdata = user.subdata || [];
      const hasAccessID = subdata.length > 0 ? subdata[0].id : "false";
      const hasAccess = subdata.length > 0;
      const status =
        subdata.length > 0 && subdata[0].status == 1 ? "checked" : "";
      const pintasan =
        subdata.length > 0 && subdata[0].pintasan == 1 ? "checked" : "";
      const acdelete =
        subdata.length > 0 && subdata[0].acdelete == 1 ? "checked" : "";

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
             <img src="${avatarUrl}" alt="${user.nama}" class="nx-avatar nx-avatar-sm" 
                  onerror="this.src='${avatarUrl}'">
             <div class="nx-user-details">
               <strong>${user.nama}</strong>
               <small class="text-muted d-block">ID: ${user.jabatan}</small>
             </div>
           </div>
         </td>
         <td>${accessStatus}</td>
          <td>
              <div class="nx-switch-grid">
          
               <div class="nx-switch-item">
                 <input class="${hasAccessID}" name="status" value="${user.userid}" type="checkbox" id="explorer${index}"${status}/>
                 <label for="explorer${index}">
                   <span class="nx-switch"></span>
                 
                 </label>
               </div>

               <div class="nx-switch-item">
                 <input class="${hasAccessID}" name="pintasan" value="${user.userid}" type="checkbox" id="pintasan${index}" ${pintasan} />
                 <label for="pintasan${index}">
                   <span class="nx-switch"></span>
                 </label>
               </div>


               <div class="nx-switch-item">
                 <input  class="${hasAccessID}" name="acdelete" value="${user.userid}" type="checkbox" id="switchDelete${index}" ${acdelete} />
                 <label for="switchDelete${index}">
                   <span class="nx-switch"></span>
                 
                 </label>
               </div>



             </div>

          </td>
       </tr>
     `;
    })
    .join("");

  const html = `
    <div class="nx-row">
    <div class="nx-col-6">
     <h3 class=" bold pt-15px pl-10px">${data.length} User Accses</h3> 
    </div>
    <div class="nx-col-6">
<div class="form-nexa-input-group p-10px">
                    <div class="form-nexa-input-group-text">
                      <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
                    </div>
                    <input type="text" 
                           id="searchFormVariablesInput" 
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

    <div class="nx-table-responsive nx-scroll-hidden"style="height:400px; padding-top:20px">
      <table class="nx-table nx-table-striped">
        <thead>
          <tr>
            <th><i class="fas fa-user"></i> User Information</th>
            <th><i class="fas fa-shield-alt"></i> Access Status</th>
            <th><i class="fas fa-key"></i> Permissions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
    
    <style>
      .nx-user-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .nx-user-details {
        display: flex;
        flex-direction: column;
      }
      .nx-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e9ecef;
      }
      .nx-table-row-hidden {
        display: none !important;
      }
      .nx-no-results {
        text-align: center;
        padding: 20px;
        color: #6c757d;
        font-style: italic;
      }
    </style>
  `;

  // Initialize search functionality after returning HTML
  setTimeout(() => {
    initializeUserSearch();
  }, 100);

  return html;
}

// Fungsi global sudah tidak diperlukan karena menggunakan event listeners
