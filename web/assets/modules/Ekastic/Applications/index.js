import { components,componentsInit,initComponentsSearch } from "../Components/index.js";
export async function setApplications(key, data) {
   try {
   	 const tabel = await NXUI.ref.get(key.store, key.id);
   	 console.log(tabel)
  const modules = await components(tabel);
  const modulesInit = await componentsInit(tabel);

  // 1. Buat container sementara untuk template
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `

        <div class="nx-card-header">
              <div class="nx-card-title">
               <h5 class="bold">Metadata Applications</h5>
              </div>
        </div>
        <div class="nx-row">
        <div class="nx-col-12">
           ${modulesInit}   
        </div>
      
      </div>
  `;
  // Generate narrative as fallback if diagram fails
   setTimeout(async () => {
    try {
      // Pass the retrieved form data to init function
            if (typeof feather !== "undefined") {
                feather.replace();
              }
              initComponentsSearch()
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