  import { initFailed } from "./Failed.js";
  import { initOperasi } from "./Join/operasi.js";
  import {  setOperasi } from "./Operasi/index.js";


// Utility function untuk mendeteksi dan menerapkan cursor pointer

export async function initQuery(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
  
    

        if (data.category =='join') {
             return await initFailed(data) 
        } else {
            // if (storage.app=="Cross") {
            //   return await initOperasi(data) 
            // } else if (storage.app=="Nested") {
              return await setOperasi(data) 
            // } else {
         
            // }
        }


  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}


