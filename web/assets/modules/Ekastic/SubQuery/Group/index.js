import { FormCustom } from "./Form.js";
import { SaveCustom } from "./Save.js";
export async function queryGroupByCustom(id, tabel, custom) {
  try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID = "group_" + id;
    NXUI.addcustom = custom;
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-500px",
      minimize: true,
      label: `Group By Field`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      // Select: ["#groupbySelect"],
      getValidationBy: ["name"], // ✅ Standard validation approach
      setDataBy: dataform, // ✅ Standard validation approach
      onclick: {
        title: "Save Group By",
        cancel: "Cancel",
        send: "saveGroupByCustom", // ✅ Use namespaced function name
      },
      content: await FormCustom(dataform, custom,modalID),
    });
    NXUI.nexaModal.open(modalID);
    NXUI.NexaOption({
      placeholder: "Search variables... (Ctrl+F)",
      elementById: "SearchGroupCustom",
      select: "groupby",
    });
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}
nx.saveGroupByCustom = async function (id, data, tabel) {
  let custom = NXUI.addcustom;
  await SaveCustom(id, data, tabel, custom);
};
