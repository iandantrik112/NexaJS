export async function setOperasiByJoin(id, store) {
  try {
    const Sdk = new NXUI.Buckets(id);
    const storage = await Sdk.storage();
    const modalID = "indexJoin" + id;
    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-600px",
      minimize: true,
      label: `Key Join`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      setDataBy: storage, // ✅ Standard validation approach
      onclick: {
        title: "Save Operasi Join",
        cancel: "Cancel",
        send: "saveOperasiJoin", // ✅ Use namespaced function name
      },
      content: await tempalate(storage),
    });
    NXUI.nexaModal.open(modalID);
    // NXUI.id("index").on("change", async function (e) {
    //     // const tabelCalss = e.target.value.split("-");
    //     console.log(e)
    // })

    // Dengan konfigurasi tambahan
    NXUI.initSelect2("#index", {
      placeholder: "Pilih opsi...",
      allowClear: true,
      width: "100%",
    });

    NXUI.initSelect2("#target", {
      placeholder: "Pilih opsi...",
      allowClear: true,
      width: "100%",
    });

    NXUI.onSelect2Change("#index", function (e) {
      const tabelCalss = e.target.value.split("-");
      const data = storage.buckets.join.failed.filter(
        (item) => !item.startsWith(tabelCalss[0] + "-")
      );

      let templatetarget = "";
      data.forEach((row) => {
        templatetarget += `<option value="${row}">${row}</option>`;
      });
      NXUI.id("target").innerHTML = templatetarget;
    });
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

export async function tempalate(storage) {
  let tempalate = "";
  tempalate += '<div class="nx-row">';
  // === Bagian Select ===
  let label = "name";
  tempalate += `<div class="nx-col-6">
<div class="form-nexa-group">
  <label>Index Key </label>
  <select class="form-nexa-control"id="index"name="index">`;
  storage.buckets.join.failed.forEach((row) => {
    tempalate += `<option value="${row}">${row}</option>`;
  });
  tempalate += `</select></div></div>`;
  // === Bagian Select ===
  tempalate += `
<div class="nx-col-6">
  <div class="form-nexa-group">
   <label>Target Key </label>
   <select class="form-nexa-control"id="target"name="target">
     <option value="">Select country</option>
   </select>
   </div>
</div>`;
  tempalate += `  
 <div class="nx-col-6 mb-10px">
     <label for="groupJoinType">Join Type:</label>
     <select id="type"name="type" class="form-nexa-control">
       <option value="inner">INNER JOIN</option>
       <option value="left">LEFT JOIN</option>
       <option value="right">RIGHT JOIN</option>
       <option value="full">FULL OUTER JOIN</option>
       <option value="cross">CROSS JOIN</option>
       <option value="natural">NATURAL JOIN</option>
     </select>
   </div>
   <div class="nx-col-6 mb-10px">
     <label>Condition:</label>
     <select id="condition" name="condition" class="form-nexa-control">
       <option value="=">=</option>
       <option value="!=">!=</option>
       <option value=">">&gt;</option>
       <option value="<">&lt;</option>
       <option value=">=">&gt;=</option>
       <option value="<=">&lt;=</option>
       <option value="LIKE">LIKE</option>
       <option value="IN">IN</option>
       <option value="BETWEEN">BETWEEN</option>
     </select>
   </div>

`;
  tempalate += "</div>";

  return tempalate;
}
