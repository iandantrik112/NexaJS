import { ArithmeticFormCustom } from "./Form.js";
import { SaveAritCustom } from "./Save.js";
export async function setArithmeticCustom(id,tabel,custom) {
 try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID="arithmetic_"+id;
      NXUI.addcustom = custom;
    NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-500px",
    minimize: true,
    label: `Arithmetic Field`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    setDataBy:dataform, // ✅ Standard validation approach
     getValidationBy: ["name"], // ✅ Standard validation approach
    onclick: {
      title: "Save Arithmetic",
      cancel: "Cancel",
      send: "SaveAritCustomArithmeticValue", // ✅ Use namespaced function name
    },
    content:await ArithmeticFormCustom(dataform,modalID,custom),
  });
  NXUI.nexaModal.open(modalID);
  NXUI.id("footer"+modalID).hide()
  NXUI.NexaOption({
   placeholder:"Search variables... (Ctrl+F)" ,
   elementById:"ArithmeticOrder" ,
   select:"field" 
  });

 NXUI.id("operation").on("change", function(e) {
    NXUI.id("footer" + modalID).show()
 });
  
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}
nx.SaveAritCustomArithmeticValue = async function (id,data,tabel) {
  let custom = NXUI.addcustom;
  await SaveAritCustom(id,data,tabel,custom)
};
