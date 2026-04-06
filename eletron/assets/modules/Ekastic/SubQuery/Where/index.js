import { FormCustom } from "./Form.js";
import { SaveJoinCustom } from "./Save.js";
import { setJoinINCustom } from "./IN.js";
import { metaIndex, metaField } from "../../Metadata/Field.js";

export async function setWhereByCustom(id, tabel, custom) {
  try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID = "where_" + id;
    // Pastikan setDataBy berisi informasi store dan id untuk Save function
    const setDataBy = {
      ...dataform,
      store: tabel,
      id: id,
    };
    NXUI.addcustom = custom;
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-500px",
      minimize: true,
      label: `Where Field`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      getValidationBy: ["name"], // ✅ Standard validation approach
      setDataBy: setDataBy, // ✅ Standard validation approach
      onclick: {
        title: "Save Where",
        cancel: "Cancel",
        send: "saveWhereValueCustom", // ✅ Use namespaced function name
      },
      content: await FormCustom(dataform, custom),
    });
    NXUI.nexaModal.open(modalID);
    NXUI.id("footer" + modalID).hide();
    NXUI.id("selectField").on("change", async function (e) {
      const tabelCalss = e.target.value.split(".");
      const getCalss = metaIndex(tabelCalss[0]);
      // Ambil data untuk select value
      const renGroup = await NXUI.Storage()
        .models("Office")
        .setAtGroup(getCalss.key, getCalss.label, tabelCalss[1]);

      let template = "";
      renGroup.data.forEach((row) => {
        template += `<option value="${row[tabelCalss[1]]}">${
          row[tabelCalss[1]]
        }</option>`;
      });
      NXUI.id("valuewhere").innerHTML = template;
      NXUI.id("nxcol6Operator").show();
      NXUI.id("nxcol6Value").show();
    });

    NXUI.id("operator").on("change", function (e) {
      if (e.target.value === "NOT_IN" || e.target.value === "IN") {
        const value = NXUI.id("selectField").val();
        setJoinINCustom(value, id, e.target.value, dataform, modalID, custom);

        console.log(value);
        NXUI.id("footer" + modalID).hide();
      } else {
        NXUI.id("footer" + modalID).show();
      }
    });

    NXUI.NexaOption({
      placeholder: "Search variables... (Ctrl+F)",
      elementById: "SearchWhere",
      select: "selectField",
    });
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}

nx.saveWhereValueCustom = async function (id, data, tabel) {
  let custom = NXUI.addcustom;
  await SaveJoinCustom(id, data, tabel, custom);
};
