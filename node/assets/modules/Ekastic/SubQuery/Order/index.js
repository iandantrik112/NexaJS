import { FormCustom } from "./Form.js";
import { SaveValueCustom } from "./Save.js";
export async function queryOrderByCustom(id,tabel,custom) {
 try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID="order_"+id;
     NXUI.addcustom = custom;
    NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-500px",
    minimize: true,
    label: `Order Field`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    setDataBy:dataform, // ✅ Standard validation approach
    onclick: {
      title: "Save Order By",
      cancel: "Cancel",
      send: "saveOrderByValueCustom", // ✅ Use namespaced function name
    },
    content:await FormCustom(dataform,custom),
  });
  NXUI.nexaModal.open(modalID);

  NXUI.NexaOption({
   placeholder:"Search variables... (Ctrl+F)" ,
   elementById:"SearchOrder" ,
   select:"field" 
  });


  
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}
nx.saveOrderByValueCustom = async function (id,data,tabel) {
    let custom = NXUI.addcustom;
  await SaveValueCustom(id,data,tabel,custom)
};
