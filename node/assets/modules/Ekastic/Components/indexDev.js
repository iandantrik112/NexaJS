import { modulesInit } from "./modulesInit.js";
export async function components(tabel) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    const modulcomponents = tabel.submenu;
    console.log(modulcomponents);
    let templateHtml = "";
    modulcomponents.forEach((data, index) => {
      let clickHtml = "";
      if (
        data.label !== "Applications" &&
        data.label !== "Update" &&
        data.label !== "Delete" &&
        data.label !== "Packages"
      ) {
        clickHtml = `<a onclick="Unstall('${data.id}','${data.key}');"class="pull-right nx-btn-secondary-light custom-size-sm fs-11px" href="javascript:void(0);">Unstall</a>`;
      } else {
        clickHtml = ``;
      }
      templateHtml += `
       <li class="nx-list-item" id="${data.key}" style="background-color: #ffffff00;">
       <i class="nx-icon-md" data-feather="${data.icon}"></i>
         <span class="pt-15px"> ${data.label}</span>
         ${clickHtml}
        </li> 
      `;
      // }
    });
    return `

<ul class="nx-list-group">
 ${templateHtml || ""}
</ul>
        `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

export async function componentsInit(tabel) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    const modulesInitcomponents = await modulesInit(tabel);
    const modulIns = tabel.submenu || [];
    let templateHtml = "";

    modulesInitcomponents.forEach((data, index) => {
      // Skip restricted items completely - don't show them in the list
      if (
        data.label === "Applications" ||
        data.label === "Update" ||
        data.label === "Delete" ||
        data.label === "Packages"
      ) {
        return; // Skip this iteration
      }

      let clickHtml = "";

      // Check if this item is already installed by comparing with existing submenu
      const isAlreadyInstalled = modulIns.some(
        (item) => item && item.key === data.key
      );
      if (isAlreadyInstalled) {
        clickHtml = `<a onclick="Unstall('${tabel.id}','${data.key}');"class="pull-right nx-btn-secondary-light custom-size-sm fs-11px" href="javascript:void(0);">Unstall</a>`;
      } else {
        clickHtml = ` <a onclick="Install('${tabel.id}','${index}');" class="pull-right nx-btn-primary custom-size-sm fs-11px" href="javascript:void(0);">Install </a>`;
      }

      templateHtml += `
       <li class="nx-list-item" id="${data.key}"style="background-color: #ffffff00;">
       <i class="nx-icon-md" data-feather="${data.icon}"></i>
         <span class="pt-15px"> ${data.label}</span>
          ${clickHtml}
         <dd>${data.description}</dd>
        </li>
      `;
      // }
    });
    return `

<ul class="nx-list-group">
 ${templateHtml || ""}
</ul>
        `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}
nx.Unstall = async function (tabel, key) {
  try {
    // Get fresh data from store
    const dataform = await NXUI.ref.get("nexaStore", tabel);
    console.log("Fresh data before unstall:", dataform);

    // Filter by ID instead of index to ensure correct removal
    const tanpaIndex0 = dataform.submenu.filter((item) => item.key !== key);
    console.log("After filtering:", tanpaIndex0);

    const margeset = {
      submenu: tanpaIndex0,
    };
    await NXUI.ref.mergeData("nexaStore", tabel, margeset);

    // Get fresh data after update to ensure we have the latest state
    const updatedData = await NXUI.ref.get("nexaStore", tabel);
    console.log("Fresh data after unstall:", updatedData);

    // Update button state from Unstall to Install
    const listItem = document.getElementById(key);
    if (listItem) {
      const buttonElement = listItem.querySelector('a[onclick*="Unstall"]');
      if (buttonElement) {
        buttonElement.setAttribute("onclick", `Install('${tabel}','${key}');`);
        buttonElement.className =
          "pull-right nx-btn-primary custom-size-sm fs-11px";
        buttonElement.textContent = "Install";
      }
    }

    // Re-render the components list with fresh data
    try {
      // Get fresh data after unstall
      const freshData = await NXUI.ref.get("nexaStore", tabel);

      // Re-render the components list
      const newListHtml = await componentsInit(freshData);

      // Find the list container and replace its content
      const listContainer = document.querySelector(".nx-list-group");
      if (listContainer) {
        listContainer.innerHTML = newListHtml
          .replace('<ul class="nx-list-group">', "")
          .replace("</ul>", "");

        // Re-initialize Feather icons after re-rendering
        if (typeof feather !== "undefined") {
          feather.replace();
        }

         if (window.nexaStoreInstance) {
          // Reload stored data
          await window.nexaStoreInstance.loadStoredData();

          // Trigger UI refresh
          if (window.nexaStoreInstance.onDataLoaded) {
            window.nexaStoreInstance.onDataLoaded();
          }
        }
      }
    } catch (uiError) {
      console.warn("UI re-render failed:", uiError);
    }
  } catch (error) {
    console.error("❌ Failed to save checked variables order:", error);
  }
};

nx.Install = async function (tabel, key) {
  try {
    // Get fresh data from store
    const dataform = await NXUI.ref.get("nexaStore", tabel);
    console.log("Fresh data before install:", dataform);

    const modulesInitcomponents = await modulesInit(dataform);

    console.log("Item to install:", modulesInitcomponents[key]);
    console.log("Tabel:", tabel, "Key:", key);

    if (modulesInitcomponents[key]) {
      // Add the new item to the existing submenu array
      const margeset = {
        submenu: [...dataform.submenu, modulesInitcomponents[key]],
      };
      await NXUI.ref.mergeData("nexaStore", tabel, margeset);

      // Get fresh data after update to ensure we have the latest state
      const updatedData = await NXUI.ref.get("nexaStore", tabel);
      console.log("Fresh data after install:", updatedData);

      // Update button state from Install to Unstall
      const listItem = document.getElementById(modulesInitcomponents[key].key);
      if (listItem) {
        const buttonElement = listItem.querySelector('a[onclick*="Install"]');
        if (buttonElement) {
          buttonElement.setAttribute(
            "onclick",
            `Unstall('${tabel}','${modulesInitcomponents[key].key}');`
          );
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
      const listContainer = document.querySelector(".nx-list-group");
      if (listContainer) {
        listContainer.innerHTML = newListHtml
          .replace('<ul class="nx-list-group">', "")
          .replace("</ul>", "");

        // Re-initialize Feather icons after re-rendering
        if (typeof feather !== "undefined") {
          feather.replace();
        }

        if (window.nexaStoreInstance) {
          // Reload stored data
          await window.nexaStoreInstance.loadStoredData();

          // Trigger UI refresh
          if (window.nexaStoreInstance.onDataLoaded) {
            window.nexaStoreInstance.onDataLoaded();
          }
        }
      }
    } catch (uiError) {
      console.warn("UI re-render failed:", uiError);
    }

    // nx.id("label" + data).hide();
  } catch (error) {
    console.error("❌ Failed to save checked variables order:", error);
  }
};
