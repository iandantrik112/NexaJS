import { addJoin } from "./addJoin.js";
export async function Jointabel(data = null) {
 try {
  console.log(data.key)
    // Inisialisasi dengan auto mode (tanpa parameter store)

    let tempalate = '';
     tempalate += '<div class="nx-list-group">';
    const tabelJoin = NEXA.controllers.data.tabel.submenu;
    tabelJoin.forEach((row) => {
      if (String(row.key) !== String(data.key)) {
        tempalate += `
            <a class="nx-list-item"onclick="nx.addJoinTabel('${row.label}','${row.key}','${data.id}');" href="javascript:void(0);">
            <span class="material-symbols-outlined nx-icon-md">database</span> ${row.label}
            </a>
        `;
      }

    });
     tempalate += '</div';
  //    NXUI.class("element")
  // .setStyle("width", "200px")
  // .setStyle("height", "100px")
  // .setStyle("background", "blue");
    return tempalate;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }



};
window.addJoinTabel = async function (label,id,tabel) {
 console.log(label,id,tabel)
  const modalId="add_join_tabel"+tabel
  NXUI.modalHTML({
    elementById: modalId,
    styleClass: "w-400px",
    minimize: true,
      getFormBy: ["id", "name"], // Auto-collect form data by element ID (biar jelas fungsinya)
    label: `Key Join (${label})`,
    setDataBy: tabel, // ✅ Standard validation approach
    onclick: {
      title: "💾 Save Join",
      cancel: "Cancel",
        send: "configKeyJoin", // ✅ Use namespaced function name
    },
    content:await addJoin(label,id,tabel),
  });
  NXUI.nexaModal.open(modalId);
};
