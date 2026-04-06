import { ArithmeticForm } from "./Form.js";
import { Save } from "./Save.js";
export async function setArithmetic(id,tabel) {
 try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID="arithmetic_"+id;
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
      send: "saveArithmeticValue", // ✅ Use namespaced function name
    },
    content:await ArithmeticForm(dataform),
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
nx.saveArithmeticValue = async function (id,data,tabel) {
  await Save(id,data,tabel)
};
