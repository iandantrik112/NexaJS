import { modulesInit } from "./modulesInit.js";

export async function componentsInit(tabel) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    const modulesInitcomponents = await modulesInit(tabel);
   
        const dimensi = new NXUI.NexaDimensi();
    const height = dimensi.height("#nexa_app", 120, 'vh');
    // Add null check for modulesInitcomponents
    if (!modulesInitcomponents || !Array.isArray(modulesInitcomponents)) {
      console.error(
        "❌ modulesInit returned invalid data:",
        modulesInitcomponents
      );
      return `<div class="nx-card"><div class="nx-card-body"><p>No components available</p></div></div>`;
    }

    const modulIns = tabel.submenu || [];
    let templateHtml = "";

    modulesInitcomponents.forEach((data, index) => {
      // Skip restricted items completely - don't show them in the list
      if (data.label === "Applications") {
        return; // Skip this iteration
      }

      let clickHtml = "";
      let version = "";

      // Check if this item is already installed by comparing with existing submenu
      const isAlreadyInstalled = modulIns.some(
        (item) => item && item.key === data.key
      );
      if (isAlreadyInstalled) {
        clickHtml = `<a  id="unstall${data.key}"onclick="Unstall('${tabel.id}','${data.key}','${tabel.version}','${index}');"class="pull-right nx-btn-secondary-light custom-size-sm fs-11px" href="javascript:void(0);">Unstall</a>`;
        version = data.lastversion;
      } else {
        clickHtml = ` <a id="install${data.key}"onclick="Install('${tabel.id}','${index}','${data.version}','${data.key}');" class="pull-right nx-btn-primary custom-size-sm fs-11px" href="javascript:void(0);">Install </a>`;
        version = data.version;
      }
      templateHtml += `
       <div class="nx-list-item" id="${data.key}"style="background-color: #ffffff00;">
       <i class="nx-icon-md" data-feather="${data.icon}"></i>
         <span class="pt-15px"> ${data.label}</span>
          ${clickHtml}
          <small class="fs-10px"id="v${data.key}">v.${version}</small>
         <dd>${data.description} </dd>
         <span class="material-symbols-outlined nx-icon-xs">deployed_code_update</span>
         <small class="fs-10px">${data.created_at}</small>
        </div>
      `;
      // }
    });
    return `
<div style="  padding-top: 10px;">
<div class="nx-card">
  <div class="nx-card-header">
   <h3 class="bold fs-20px">Components</h3>  

 <div class="nx-card-controls align-right">
                  <div class="form-nexa-input-group">
                    <div class="form-nexa-input-group-text">
                      <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
                    </div>
                    <input type="text" 
                           id="searchComponents" 
                           class="form-nexa-control" 
                           placeholder="Search Components...">
                     <div class="form-nexa-input-group-text">
                       <button type="button" 
                               id="clearSearchBtn"
                               class="nx-btn-secondary" 
                               style="background: none; border: none; padding: 4px; color: #6c757d;">
                         <span class="material-symbols-outlined" style="font-size: 16px;">clear</span>
                       </button>
                     </div>
                  </div>
 </div>
  </div>
  <div class="nx-card-body nx-scroll"style="height:${height};">
    <div class="nx-list-group nx-grid-4-col" id="componentsList">
     ${templateHtml || ""}
    </div>
  </div>
</div>
</div>


        `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

nx.Unstall = async function (tabel, key,version,displaykey) {
  try {
    // Get fresh data from store
    const dataform = await NXUI.ref.get("nexaStore", tabel);
    console.log("Fresh data before unstall:", dataform);
    // Filter by ID instead of index to ensure correct removal
    const tanpaIndex0 = dataform.submenu.filter((item,index) => item.key !== key);
    console.log("After filtering:", tanpaIndex0);
    const margeset = {
      submenu: tanpaIndex0,
      version: version,
      lastversion: version,
      created_at: new Date().toISOString(),
    };
    await NXUI.ref.mergeData("nexaStore", tabel, margeset);
    // Get fresh data after update to ensure we have the latest state
    const updatedData = await NXUI.ref.get("nexaStore", tabel);
     NXUI.id("v"+displaykey).innerHTML = "v."+version;;
    // Update button state from Unstall to Install
    const listItem = document.getElementById(key);
    if (listItem) {
      const buttonElement = listItem.querySelector('a[onclick*="Unstall"]');
      if (buttonElement) {
        buttonElement.setAttribute("onclick", `Install('${tabel}','${displaykey}','${version}','${key}');`);
        buttonElement.className =
          "pull-right nx-btn-primary custom-size-sm fs-11px";
        buttonElement.textContent = "Install";
      }
    }
// tabel, key, version,displaykey
    // Re-render the components list with fresh data
    try {
      // Get fresh data after unstall
      const freshData = await NXUI.ref.get("nexaStore", tabel);

      // Re-render the components list
      const newListHtml = await componentsInit(freshData);

      // Find the list container and replace its content
      const listContainer = document.querySelector(
        ".nx-list-group nx-grid-4-col"
      );
      if (listContainer) {
        listContainer.innerHTML = newListHtml
          .replace('<div class="nx-list-group nx-grid-4-col">', "")
          .replace("</div>", "");

        // Re-initialize Feather icons after re-rendering
        if (typeof feather !== "undefined") {
          feather.replace();
        }
      }
    } catch (uiError) {
      console.warn("UI re-render failed:", uiError);
    }

    if (window.nexaStoreInstance) {
      // Reload stored data
      await window.nexaStoreInstance.loadStoredData();

      // Trigger UI refresh
      if (window.nexaStoreInstance.onDataLoaded) {
        window.nexaStoreInstance.onDataLoaded();
      }
    }
  } catch (error) {
    console.error("❌ Failed to save checked variables order:", error);
  }
};

nx.Install = async function (tabel, key, version,displaykey) {
  try {
    // Get fresh data from store
    const dataform = await NXUI.ref.get("nexaStore", tabel);
    const modulesInitcomponents = await modulesInit(dataform);
    if (modulesInitcomponents[key]) {
      // Add the new item to the existing submenu array
      const margeset = {
        submenu: [...dataform.submenu, modulesInitcomponents[key]],
        version: version,
        lastversion: version,
        created_at: new Date().toISOString(),
      };
      await NXUI.ref.mergeData("nexaStore", tabel, margeset);
      // Get fresh data after update to ensure we have the latest state
      const updatedData = await NXUI.ref.get("nexaStore", tabel);
       NXUI.id("v"+displaykey).innerHTML = "v."+version;
      
    const listItem = document.getElementById(displaykey);
    if (listItem) {
      const buttonElement = listItem.querySelector('a[onclick*="Install"]');
      if (buttonElement) {
        buttonElement.setAttribute("onclick", `Unstall('${tabel}','${displaykey}','${version}','${key}');`);
        buttonElement.className =
          "pull-right nx-btn-secondary-light custom-size-sm fs-11px";
        buttonElement.textContent = "Unstall";
      }
    }

    }

    // Re-render the components list with fresh data
    try {
      // Get fresh data after install
      const freshData = await NXUI.ref.get("nexaStore", tabel);

      // Re-render the components list
      const newListHtml = await componentsInit(freshData);

      // Find the list container and replace its content
      const listContainer = document.querySelector(
        ".nx-list-group nx-grid-4-col"
      );
      if (listContainer) {
        listContainer.innerHTML = newListHtml
          .replace('<div class="nx-list-group nx-grid-4-col">', "")
          .replace("</div>", "");

        // Re-initialize Feather icons after re-rendering
        if (typeof feather !== "undefined") {
          feather.replace();
        }
      }
    } catch (uiError) {
      console.warn("UI re-render failed:", uiError);
    }
    if (window.nexaStoreInstance) {
      // Reload stored data
      await window.nexaStoreInstance.loadStoredData();

      // Trigger UI refresh
      if (window.nexaStoreInstance.onDataLoaded) {
        window.nexaStoreInstance.onDataLoaded();
      }
    }
    // nx.id("label" + data).hide();
  } catch (error) {
    console.error("❌ Failed to save checked variables order:", error);
  }
};
// Global function to initialize search functionality


export async function components(tabel) {
  try {
    return ``;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

 export function initComponentsSearch() {
    const searchInput = document.getElementById("searchComponents");
    const clearBtn = document.getElementById("clearSearchBtn");
    const componentsList = document.getElementById("componentsList");
    
    if (!searchInput || !clearBtn || !componentsList) {
      // console.warn("Search elements not found, retrying...");
      // setTimeout(initComponentsSearch, 100);
      return;
    }

    // Search function
    function searchComponents(searchTerm) {
      const listItems = componentsList.querySelectorAll(".nx-list-item");
      
      listItems.forEach((item) => {
        const label = item.querySelector("span.pt-15px")?.textContent?.toLowerCase() || "";
        const description = item.querySelector("dd")?.textContent?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();
        
        // Show/hide based on search match
        if (label.includes(searchLower) || description.includes(searchLower)) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    }

    // Clear search function
    function clearSearch() {
      searchInput.value = "";
      const listItems = componentsList.querySelectorAll(".nx-list-item");
      listItems.forEach((item) => {
        item.style.display = "block";
      });
    }

    // Event listeners
    searchInput.addEventListener("input", (e) => {
      searchComponents(e.target.value);
    });

    clearBtn.addEventListener("click", clearSearch);

    // Also handle Enter key for better UX
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchComponents(e.target.value);
      }
    });

    console.log("✅ Components search functionality initialized");
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponentsSearch);
  } else {
    initComponentsSearch();
  }
  
//   // Also make it available globally
//   window.initComponentsSearch = initComponentsSearch;
// }