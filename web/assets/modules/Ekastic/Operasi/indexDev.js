import { opMetadata } from "./Metadata.js";
import { opComplex } from "./complex.js";
export async function redOperasi(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 210, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Operasi</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setTabelNav">
         <div class="nx-row" id="nxdrop"></div>
      </div>
    `
    );

    setTimeout(async () => {
      try {
        // Simpan data untuk akses global
        window._operasiData = data;
        
        // Fungsi untuk mengganti konten HTML di Aplikasi
        window.switchToComplex = async function() {
          try {
            const complexHtml = await opComplex(window._operasiData);
            // Cari card body di kolom nx-col-8
            const appCard = document.querySelector('#nxdrop .nx-col-8 .nx-card-body');
            if (appCard) {
              appCard.innerHTML = complexHtml;
            }
          } catch (error) {
            console.error("❌ Error switching to complex:", error);
          }
        };
        
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaDrag({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        const template = render.Container({
          container: "#nxdrop",
          content: [await Aplikasi(data,height), await Guide(height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function Aplikasi(data,height) {
  return {
    title: "Index Tabel",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: "nx-col-6",
    html:await opMetadata(data),
  };
}

export async function Guide(height) {
  return {
    title: "Model",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: "nx-col-6",
    html: `
     <div style="padding-top:0px">
      
<div class="nx-list-item"  style="background-color: #ffffff00; margin-top:10px">
       <span class="material-symbols-outlined">apps</span>
         <span class="pt-15px"> SubQuery</span>
           <a  onclick="switchToComplex();" class="pull-right nx-btn-primary custom-size-sm fs-11px" href="javascript:void(0);">Open</a>
          <small class="fs-10px" >v.1.59.1</small>
         <dd>Execute database subquery transactions </dd>
         <span class="material-symbols-outlined nx-icon-xs" style="margin: 0px; font-size: 24px;">deployed_code_update</span>
         <small class="fs-10px">08/11/2025, 10.43.52</small>
        </div>


     <div class="nx-list-item"style="background-color: #ffffff00; margin-top:10px">
       <span class="material-symbols-outlined">apps</span>
         <span class="pt-15px"> SubQuery</span>
           <a  onclick="switchToComplex();" class="pull-right nx-btn-primary custom-size-sm fs-11px" href="javascript:void(0);">Open</a>
          <small class="fs-10px" >v.1.59.1</small>
         <dd>Execute database subquery transactions </dd>
         <span class="material-symbols-outlined nx-icon-xs" style="margin: 0px; font-size: 24px;">deployed_code_update</span>
         <small class="fs-10px">08/11/2025, 10.43.52</small>
      </div>



      
      </div>
    `,
  };
}
export async function rendering(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, setTabelNav, {
    containerSelector: ["#setTabelNav"],
  });
}
