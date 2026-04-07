import { Form } from "./Form.js";
import { Save } from "./Save.js";
export async function queryGroupBy(id,tabel) {
 try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID="group_"+id;
    NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-500px",
    minimize: true,
    label: `Group By Field`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    // Select: ["#groupbySelect"], 
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy:dataform, // ✅ Standard validation approach
    onclick: {
      title: "Save Group By",
      cancel: "Cancel",
      send: "saveGroupByValue", // ✅ Use namespaced function name
    },
    content:await Form(dataform),
  });
  NXUI.nexaModal.open(modalID);
  NXUI.NexaOption({
   placeholder:"Search variables... (Ctrl+F)" ,
   elementById:"SearchGroup" ,
   select:"groupby" 
  });



  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}
nx.saveGroupByValue = async function (id,data,tabel) {
  await Save(id,data,tabel)
};
