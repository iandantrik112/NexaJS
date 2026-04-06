import { tabelVersion, packaceVersion } from "./version.js";
export async function initVersi(data) {
  const allVersi = await tabelVersion();
  const metadataform = await NXUI.ref.get(
    "bucketsStore",
    "version"
  );

  // Add null/undefined checks and provide default values
  const safeData = data || {};
  const updateVersion = metadataform?.version || "1.0.0";
  const updatedAt = metadataform?.updatedAt || "Not available";

  // Filter available versions (excluding current version)
  const availableVersions = allVersi.filter((item) => 
    item.version !== updateVersion
  );
  const availableCount = availableVersions.length;

  // Find current version details
  const currentVersionInfo = allVersi.find(
    (item) => item.version === updateVersion
  );
  const currentDescription = currentVersionInfo
    ? currentVersionInfo.description
    : "Tidak ada deskripsi";
  return `
  <div class="nx-row">
    <div class="nx-col-12">
     
   
     <div id="updateVersion">
       <div class="nx-card">
         <div class="nx-card-body">
             <h3 class="bold">Activ Version ${updateVersion}</h3>
               <p>Updated At ${updatedAt}</p>
           <h4>Deskripsi Versi Saat Ini</h4>
           <div class="nx-divider"></div>
           <p><strong>Versi yang tersedia untuk diinstall: ${availableCount}</strong></p>
         </div>
       </div>
     </div>
    </div>
    <div class="nx-col-12">
<table class="nx-table">
  <thead>
    <tr>
      <th>Version</th>
      <th>Packages</th>
      <th>Description</th>
      <th class="tx-right">Install</th> 
    </tr>
  </thead>
  <tbody>
    ${allVersi
      .map((item) => {
        try {
            let dataVesi=''
          const packagesData = JSON.parse(item.packages);
          const packagesArray = packagesData[item.version]?.application || [];
          const packagesCount = Array.isArray(packagesArray)
            ? packagesArray.length
            : 0;
          const ID = item.version.replace(/\./g, "");
           if (item.version ==updateVersion) {
             dataVesi =`
             <button  class="nx-btn-secondary-light custom-size-sm">Activ Version </button>
             <button onclick="updateVersion('${updateVersion}');"  class="nx-btn-secondary-light custom-size-sm">Update </button>

             `
           } else {
             dataVesi =`
             <button onclick="installVersion('${item.version}');" class="nx-btn-primary custom-size-sm">
              <span class="material-symbols-outlined nx-icon-sm">system_update_alt</span>
             </button>
             <button onclick="deleteVersion('${item.version}','${item.id}');" class="nx-btn-secondary-light custom-size-sm">
              <span class="material-symbols-outlined nx-icon-sm">delete</span>
             </button>
             `
           }
          return `
          <tr id="item${item.id}">
            <td class="bold"><strong>${item.version}</strong> </td>
            <td><a href="javascript:void(0);" 
             onclick="detailPacakes('${item.version}');">
              <span class="nx-badge nx-badge-primary">${packagesCount} packages</span>
            </a>
            </td>
              
            <td>
            <p>${item.description}</p>
            <p> created_at: ${item.created_at}</p>
        
            </td>
            <td class="tx-right" id="${ID}">
              ${dataVesi}
            </td>
          </tr>
        `;
        } catch (error) {
          return `
          <tr>
                <td class="bold"><strong>${item.version}</strong> </td>
            <td>${item.created_at}</td>
            <td><span class="nx-badge nx-badge-secondary">0 packages</span></td>
            <td>
            <p>${item.description}</p>
            <p> created_at: ${item.created_at}</p>
            </td>
            <td lass="tx-right"></td>
          </tr>
        `;
        }
      })
      .join("")}
  </tbody>
</table>
    </div>
  </div>
`;
}
// Function to safely serialize data for HTML attributes
function serializeForHtmlAttribute(data) {
  try {
    return JSON.stringify(data).replace(/"/g, "&quot;");
  } catch (error) {
    console.error("Error serializing data:", error);
    return "[]";
  }
}
nx.detailPacakes = async function (version) {
  try {
    const packages = await packaceVersion(version);
    console.log(packages);
    const text = version;
    const modalID = "modalversi" + version.replace(/\./g, "");
    let template = "";
    packages.forEach((pkg, index) => {
      console.log(pkg.icon);
      template += `
  <div class="nx-col-8">
   <span class="material-symbols-outlined nx-icon-md">box_add</span>
   ${pkg.className}
  </div>
  <div class="nx-col-4"><span onclick="installPackages('${version}','${pkg.id}','${modalID}');" class="pull-right nx-btn-primary custom-size-sm">Install</span></div>
        `;
    });
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-400px",
      minimize: true,
      label: `Packages Version ` + version,
      onclick: false,
      content: ` 
     <div class="nx-row">
        ${template} 
    </div>`,
    });
    NXUI.nexaModal.open(modalID);
  } catch (error) {
    console.error("Error parsing packages:", error);
    console.error("Raw packagesJson that failed:", packagesJson);
  }
};

nx.installVersion = async function (version) {
  try {
    const ID = version.replace(/\./g, "");
    const packages = await packaceVersion(version);
    NXUI.id(ID).innerHTML = "<strong>Proses inisialisasi </strong>";
    // Cara: ambil semua data lalu delete satu per satu
    const allData = await NXUI.ref.getAll("nexaStore");
    for (const item of allData.data) {
      await NXUI.ref.delete("nexaStore", item.id);
    }

    for (const nexaStore of packages) {
      await NXUI.ref.set("nexaStore", nexaStore);
    }



      const userId = await NXUI.ref.set("bucketsStore", {
      id: "version",
      version:version,
     });

    setTimeout(() => {
      window.location.reload();
    }, 1200);
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
};
nx.installPackages = async function (version, id, modalID) {
  NXUI.nexaModal.close(modalID);
  const packages = await packaceVersion(version);
  for (const nexaStore of packages) {
    if (nexaStore.id == id) {
      await NXUI.ref.set("nexaStore", nexaStore);
    }
  }
  window.location.reload();
};
nx.deleteVersion = async function (version,id) {
 
  NXUI.id("item"+id).remove();
  const sa = await new NXUI.NexaModels()
      .Storage("nexa_office")
      .where("id", id)
      .delete()
      .then(async (response) => {
      
      })
      .catch((error) => {
        console.error("Insert gagal:", error);
      });





}
nx.updateVersion = async function (version) {
    const app = await NXUI.ref.getAll("nexaStore");
  console.log(app.data)

  const config = {
    [version]: {
      type: "System",
      version:version,
      application: app.data,
      updatedAt: new Date().toISOString(),
    },
  };

    const dataTabel = await NXUI.Storage().models("Office").upBucketsSystem({
         version:version,
         data:config,
       });
}
