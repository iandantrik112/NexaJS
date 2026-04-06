import { metadata } from "./metadata.js";
import { allDb } from "./Database/index.js";
import { setStores } from "./Stores/index.js";


// import { getKeyPackages } from "./upgrade/index.js";
import { HistoryManager } from "./histoy.js";
import { allVersion, lastVersion, tabelVersion } from "./version.js";
import { Configuration } from "./Configuration.js";
export async function setConfiguration(data) {
  const allVersi = await tabelVersion();
  const lastVer = await lastVersion();
  const dataform = await NXUI.ref.get("bucketsStore", "system");
  // Add null check for dataform before passing to Configuration
  const safeDataform = lastVer || {};
  const initApp = await Configuration(lastVer);
  let templateApp=''
  if (data.key == "Metadata") {
     templateApp=await metadata(data)
  } else if (data.key == "App") {
     templateApp =initApp;
  } else if (data.key == "Db") {
     templateApp =await allDb(data)
  } else {
    templateApp=''
  }
  const wrapper = NXUI.createElement(
    "div",
    `
        <div id="setConfiguration">
        <div class="nx-card-header">
             <div class="nx-card-title">
               <h5 class="bold">${data.key} System </h5>
              </div>
              <div class="nx-card-controls align-right">
               
               <a class="nx-btn-secondary-light  custom-size-sm" href="javascript:void(0);"onclick="ConfigurationModelSearch('${
                 safeDataform.updateVersion
               }');"><span class="material-symbols-outlined nx-icon-md mr-5px">add</span>Version</a>
              </div>
      </div>
     <div class="nx-row " >
       <div class="nx-col-12">
         <div class="nx-scroll-hidden" style="height:700px;padding-bottom:100px">
         <div style="padding:10px">${templateApp}</div>
       </div>
       </div>
      </div>
      </div>
    `
  );
  return wrapper.innerHTML;
}
// this.version = "1.0.0";
// this.updateVersion = "1.0.2";

export async function setConfigurationBy(id) {
  try {
    const dataform = await NXUI.ref.get("bucketsStore", "system");
    // console.log("dataform:", dataform);

    // Check if dataform exists and has the expected structure
    if (!dataform) {
      console.warn("No system configuration found, using default values");
    }

    const modalID = "Configuration";
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-400px",
      minimize: true,
      label: `Configuration`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      onclick: {
        title: "Save Configuration",
        cancel: "Cancel",
        send: "saveConfigurationValue", // ✅ Use namespaced function name
      },
      content: `
  <div class="nx-row">
  <div class="nx-col-6">
    <div class="form-nexa-group">
      <label>Version Start</label>
      <input type="text" class="form-nexa-control"name="version"  value="${
        id || "1.0.0"
      }"/>
    </div>
  </div>
  <div class="nx-col-6">
    <div class="form-nexa-group">
      <label>Update Version</label>
      <input type="text" class="form-nexa-control"name="update" value="${
        id || "1.0.2"
      }" />
    </div>
  </div>
  <div class="nx-col-12">
    <div class="form-nexa-group">
      <label>Deskripsi Update Version</label>
      <input type="text" class="form-nexa-control"name="deskripsi" placeholder="Deskripsi Update Version" value="${
        dataform?.description || ""
      }"/>
    </div>
  </div>
</div>`,
    });
    NXUI.nexaModal.open(modalID);
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}
nx.ConfigurationModelSearch = async function (id) {
  setConfigurationBy(id);
};
nx.saveConfigurationValue = async function (id, data) {
  const dataform = await NXUI.ref.get("bucketsStore", "system");
  const Store = await NXUI.ref.getAll("nexaStore");

  // Initialize dataform as empty object if undefined
  const safeDataform = dataform || {};

  const config = {
    [data.update]: {
      type: "System",
      version: data.update,
      application: Store.data,
      created_at: new Date().toISOString(),
    },
  };
  const userId = await NXUI.ref.set("bucketsStore", {
    id: "system",
    ...config,
    updateVersion: data.update,
    description: data.deskripsi,
  });
  // const dataform2 = await NXUI.ref.get("bucketsStore", "system");

    const dataTabel = await NXUI.Storage()
      .models("Office")
      .bucketsSystem({
        user_id: Number(NEXA.userId),
        version: data.update,
        data_type: "System",
        to_id: "System",
        status: "development",// production
        data_key: data.update,
        data_value: config,
        description: data.deskripsi,
      });
;
  NXUI.nexaModal.close(id);
  await renderingSetConfiguration(dataform)
};
nx.clearConfiguration = function () {
  window.nexaTreeInstance.resetContentState();
};

export async function renderingSetConfiguration(store) {
  await NXUI.NexaRender.refresh(store, setConfiguration, {
    containerSelector: ["#setConfiguration"],
  });
}
