import { Form } from "./Form.js";
import { Save } from "./Save.js";
export async function queryOrderBy(id,tabel) {
 try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID="order_"+id;
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
      send: "saveOrderByValue", // ✅ Use namespaced function name
    },
    content:await Form(dataform),
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
nx.saveOrderByValue = async function (id,data,tabel) {
  await Save(id,data,tabel)
};
