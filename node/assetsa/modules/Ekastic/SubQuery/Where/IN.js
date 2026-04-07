 import { metaIndex, metaField } from "../../Metadata/Field.js";
  import { SaveJoinCustom } from "./Save.js";
export async function setJoinINCustom(variable,id,value,tabel,custom) {

 try {
//   "where": [
//     { "field": "status", "operator": "=", "value": "'aktif'" },
//     { "field": "petani.nik", "operator": "!=", "value": "NULL" }
//   ],
        const tabelCalss =variable.split(".");
        const getCalss = metaIndex(tabelCalss[0]);
        console.log(value)

         const fieldName = value.replace(".", " "); // ganti hanya underscore pertama
         const modalID="whereIN_"+id;
         console.log(getCalss.key, tabelCalss[0], tabelCalss[1])
         const renGroup = await NXUI.Storage()
          .models("Office")
          .setAtGroup(getCalss.key, tabelCalss[0], tabelCalss[1]);
          NXUI.modalHTML({
            elementById: modalID,
            styleClass: "w-500px",
            minimize: true,
            label: `Where ${fieldName} Field`,
            getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml

            setDataBy:tabel, // ✅ Standard validation approach
            onclick: {
              title: "Save Where ",
              cancel: "Cancel",
              send: "saveWhereINValueOneCustom", // ✅ Use namespaced function name
            },
            content:await setTemplate(tabelCalss[1],renGroup.data,tabel,fieldName,variable),
          });
          NXUI.nexaModal.open(modalID);

   

  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}

export async function setTemplate(nama,data,tabel,type,variable) {
  console.log(data)
  let tempalate=''
  tempalate += `<input type="hidden"name="operator" value="${type}" readonly />`;
  tempalate += `<input type="hidden"name="variable" value="${variable}" readonly />`;
  data.forEach((row,index) => {
     const no = index + 1; // mulai dari 1
     const name=row[nama];
     const numset=nama+no;
    tempalate += `
      <div class="nx-col-12 mb-10px">
        <div class="nx-checkbox-grid">
          <div class="nx-checkbox-item">
            <input type="checkbox" id="${numset}" name="${variable}"value="${name}"/>
            <label for="${numset}">
              <span class="nx-checkmark"></span>
              ${name}
            </label>
          </div>
        </div>
      </div>
    `;

});
  return tempalate
}
nx.saveWhereINValueOneCustom = async function (id, data, tabel) {
  try {
 let custom = NXUI.addcustom;
    // Ambil field dari data.variable
    const field = data.variable; // "status"

    // Ambil value dari data[field] (misal "admin,user")
    const rawValue = data[field] || "";

    // Konversi ke array (pisah koma)
    const valuesArray = rawValue ? rawValue.split(',') : [];

    // Gunakan operator dari data, default "IN" jika kosong
    const operator = valuesArray.length
      ? (data.operator || "IN")
      : "IS NULL"; // jika kosong → IS NULL

    // Buat object where
    const whereItem = {
      field: field,
      operator: operator,
      value: valuesArray.length ? valuesArray : null
    };
    await SaveJoinCustom(id, whereItem, tabel,custom);


    NXUI.nexaModal.close(id);
    NXUI.nexaModal.close("where_"+tabel.id);

  } catch (error) {
    console.error("❌ Save IN value failed:", error);
  }
};


