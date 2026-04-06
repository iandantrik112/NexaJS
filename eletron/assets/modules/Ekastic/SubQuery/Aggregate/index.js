import { FormAggregateCustom } from "./Form.js";
import { SaveCustom } from "./Save.js";
export async function queAggregatecCustom(id,tabel,custom) {
 try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID="aggregatec_"+id;
    NXUI.addcustom = custom;
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
      send: "saveAggregateByCustom", // ✅ Use namespaced function name
    },
    content:await FormAggregateCustom(dataform,custom,modalID),
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
nx.saveAggregateByCustom = async function (id,data,tabel) {
   let custom = NXUI.addcustom;
  await SaveCustom(id,data,tabel,custom)
};
