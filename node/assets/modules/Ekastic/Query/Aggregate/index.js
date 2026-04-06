import { FormAggregate } from "./Form.js";
import { Save } from "./Save.js";
export async function queAggregatec(id,tabel) {
 try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID="aggregatec_"+id;
    NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-500px",
    minimize: true,
    label: `Aggregate Field`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    setDataBy:dataform, // ✅ Standard validation approach
    onclick: {
      title: "Save Aggregate",
      cancel: "Cancel",
      send: "saveAggregateByValue", // ✅ Use namespaced function name
    },
    content:await FormAggregate(dataform),
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
nx.saveAggregateByValue = async function (id,data,tabel) {
  await Save(id,data,tabel)
};
