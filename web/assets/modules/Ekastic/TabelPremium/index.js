

 import { EkasticTabel } from "./EkasticTabel.js";
/**
 * Backward compatibility function
 * Tetap support penggunaan lama dengan setPackage()
 */
export async function NXTabel(key, options = {}) {
    const data = await NXUI.appBuckets(key, {
         Authorization: options.Authorization
     });
    const packageInstance = new EkasticTabel(data);
    const DomEvent= await packageInstance.init(data,'300px');
    return DomEvent;

//   const dimensi = new NXUI.NexaDimensi();

// const height = dimensi.height("#nexa_app", 180, 'vh');
//     const packageInstance = new EkasticTabel(options);
 // return await packageInstance.init(key,height);
}