
function applyTheme(jsonViewer, themeName = "light") {
  // Remove existing theme classes
  jsonViewer.classList.remove("light", "dark");

  // Add the appropriate theme class based on jsonbundle.css
  if (themeName === "light") {
    jsonViewer.classList.add("light");
  }
  // Default is dark theme (no class needed as it's the default in CSS)
}

/**
 * Set Failed Data Viewer with JsonViewer and Drag & Drop
 * @param {Object} data - Data object containing id and other properties
 * @param {String} theme - Theme name ('light' or 'dark'), defaults to 'light'
 * @returns {String} HTML string for the viewer
 */
export async function setasfailedData(data, theme = "light") {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
  const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 270, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `

     <div id="setasfailedDataAS">
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Failed AS  </h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
      
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
          content: [
            await setSystemInitApplication(storage,height),
            await Information(height),
          ],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();

        const checkedItemstabel = await Sdk.getFields("tabel");
        const checkedItemsform = await Sdk.getFields("condition");
        const checkedItemsselect = await Sdk.getFields("select");
        const checkedItemssearch = await Sdk.getFields("search");
        // Sample JSON data - replace with actual storage data
          const jsonData = {
          className: storage.tableName,
          status: storage.app,
          version: storage.version,
          key: storage.key,
          token: storage.id,
          column: storage.column,
          applications: storage.applications,
          tabel: checkedItemstabel,
          form: checkedItemsform ?? false,
          select: checkedItemsselect ?? false,
          search: checkedItemssearch ?? false,
          updatedAt: storage.updatedAt,
        };

        // Create JsonViewer element
        const jsonViewer = document.createElement("json-viewer");
        jsonViewer.setAttribute("data", JSON.stringify(jsonData));

        // Apply theme (default: light)
        applyTheme(jsonViewer, theme);

        // Find the container element
        const container = document.getElementById("jsonViewerContainer");
        if (container) {
          container.appendChild(jsonViewer);
        } else {
          console.error("❌ Container 'jsonViewerContainer' not found");
        }
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function setSystemInitApplication(data,height) {
  return {
    title: "System",
    col: "nx-col-8",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `
      <small class="text-muted"> Failed AS  tabel</small>

  <small class="text-muted align-right">
   <button onclick="updateBucketAs('${data.id}');" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>

    `,
    html: `
     <div class="nx-scroll-hidden" style="height:500px">
        <div id="jsonViewerContainer"></div>
      </div>
     `,
  };
}

export async function Information(height) {
  return {
    title: "Information",
    col: "nx-col-4",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `        
     <small>
       <strong>💡 Info:</strong> Panel ini menampilkan informasi sistem aplikasi dan konfigurasi metadata.<br>
       <strong>📊 Data:</strong> JSON viewer menampilkan status aplikasi, versi, dan konfigurasi field.
     </small>`,
    html: `
     <div class="nx-scroll-hidden" style="height:350px; padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>📋 Status Aplikasi</strong>
              <p class="mb-1">Menampilkan status aplikasi dan informasi versi yang sedang aktif.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>🔑 Key & Token</strong>
              <p class="mb-1">Informasi key dan token yang digunakan untuk autentikasi sistem.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>🗃️ Table Name</strong>
              <p class="mb-1">Nama tabel database yang digunakan sebagai sumber data utama.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>📱 Applications</strong>
              <p class="mb-1">Daftar aplikasi yang terintegrasi dengan sistem metadata.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>📊 Field Configuration</strong>
              <p class="mb-1">Status konfigurasi field untuk tabel, form, select, dan search.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>🕒 Last Updated</strong>
              <p class="mb-1">Timestamp terakhir kali sistem dikonfigurasi atau diperbarui.</p>
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
  await NXUI.NexaRender.refresh(store, setasfailedData, {
    containerSelector: ["#setasfailedDataAS"],
  });
}
window.updateBucketAs = async function (AliasIdkey) {
 const Sdk = new NXUI.Buckets(AliasIdkey);
    const storage = await Sdk.storage();
    // Ambil data fields dan items yang sudah dicek
    // Filter allAlias berdasarkan aliasNames
    if (storage.buckets.allAlias && storage.applications.aliasNames) {
      storage.applications.alias = storage.buckets.allAlias.filter(aliasItem => {
        // Extract name after "AS" from alias string (e.g., "petani.nik AS nik" -> "nik")
        const match = aliasItem.match(/\s+AS\s+(\w+)$/i);
        if (match) {
          const aliasName = match[1].trim();
          return storage.applications.aliasNames.includes(aliasName);
        }
        return false;
      });
    } else {
      storage.applications.alias = storage.buckets.allAlias || [];
    }

   // Update failedAs untuk setiap form item
   if (storage.form && typeof storage.form === 'object') {
    Object.values(storage.form).forEach((row) => {
      if (row && row.failedtabel && row.failed && row.name) {
        const tabelName = row.failedtabel.split('.')[0];
        storage.form[row.name].failedAs = `${tabelName}.${row.failed} AS ${row.name}`;
      }
    });
  }


           await Sdk.upIndex({

               column: storage.applications.aliasNames,
               applications: storage.applications,
               form: storage.form,
           });
 
await rendering(storage)

}
