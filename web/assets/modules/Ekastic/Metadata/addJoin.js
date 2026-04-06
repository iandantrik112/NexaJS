export async function addJoin(label,id,tabel) {
 try {
  console.log(label,id,tabel)
//     // Inisialisasi dengan auto mode (tanpa parameter store)
// // console.log(NEXA.controllers.data.tabel.submenu)
// //      console.log(data)
    const tableData = await NXUI.ref.get("nexaStore",tabel);
     console.log(tableData)
let tempalate = '';

const tabelJoin = NEXA.controllers.data.tabel.submenu;
  const store = await  NXUI.Storage()
    .models("Office")
    .tabelVariables(id, tabel);
 

    // <option value="">Select country</option>
    // <option value="id">Indonesia</option>
    // <option value="us">United States</option>



tempalate += '<div class="nx-row">';
// === Bagian Select ===

tempalate += `<div class="nx-col-6">
<div class="form-nexa-group">
  <input type="hidden" name="targetkey" value="${label}" />
  <input type="hidden" name="keyindex" value="${tableData.tableKey}" />
  <input type="hidden" name="keytarget" value="${id}" />
  <input type="hidden" name="keyindexname" value="${tableData.tableName}" />
  <input type="hidden" name="keytargetname" value="${label}" />
  <label>Index Key (${tableData.tableName})</label>
  <select class="form-nexa-control"id="index"name="${tableData.tableName}">`;
  tableData.variablesOrigin.forEach((row) => {
    tempalate += `<option value="${tableData.tableName}.${row}">${row}</option>`;
  });
tempalate += `</select></div></div>`;
// === Bagian Select ===
tempalate += `<div class="nx-col-6">
<div class="form-nexa-group">
  <label>Target Key (${label})</label>
 <select class="form-nexa-control"id="target"name="${label}">`;
store.data[tabel].variables.forEach((row) => {
  tempalate += `<option value="${label}.${row}">${row}</option>`;
});

tempalate += `</select></div></div>`;
tempalate += `  
 <div class="nx-col-6 mb-10px">
     <label for="groupJoinType">Join Type:</label>
     <select id="groupJoinType" class="form-nexa-control">
       <option value="inner">INNER JOIN</option>
       <option value="left">LEFT JOIN</option>
       <option value="right">RIGHT JOIN</option>
       <option value="full">FULL OUTER JOIN</option>
       <option value="cross">CROSS JOIN</option>
       <option value="natural">NATURAL JOIN</option>
     </select>
   </div>
   <div class="nx-col-6 mb-10px">
     <label for="groupJoinCondition">Condition:</label>
     <select id="groupJoinCondition" class="form-nexa-control">
       <option value="=">=</option>
       <option value="!=">!=</option>
       <option value=">">></option>
       <option value="<"><</option>
       <option value=">=">>=</option>
       <option value="<="><=</option>
       <option value="LIKE">LIKE</option>
       <option value="BETWEEN">BETWEEN</option>
       <option value="IN">IN</option>
       <option value="NOT_IN">NOT IN</option>
       <option value="IS NULL">IS NULL</option>
       <option value="IS NOT NULL">IS NOT NULL</option>
     </select>
   </div>

`;
tempalate += '</div>';
tempalate += '<div class="nx-scroll nx-scroll-rounded" style="height: 200px;">';
tempalate += '<div class="nx-row">';
// === Bagian Checkbox ===
// variabel yang tidak ingin ditampilkan
const skip = ["id", "userid","row"];
store.data[tabel].variables.forEach((row) => {
  if (!skip.includes(row.toLowerCase())) {
    tempalate += `
      <div class="nx-col-12">
        <div class="nx-checkbox-grid">
          <div class="nx-checkbox-item">
            <input type="checkbox" id="${row}" name="${row}"value="${label}.${row}"/>
            <label for="${row}">
              <span class="nx-checkmark"></span>
              ${row}
            </label>
          </div>
        </div>
      </div>
    `;
  }
});

tempalate += '</div>';
tempalate += '</div>';
return tempalate;




  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }



};

nx.configKeyJoin = async function (modalid,data,id) {
  const tableData = await NXUI.ref.get("nexaStore", id);

  if (!tableData) return;

  // Ambil join lama atau default ke object kosong
  const existingJoin = tableData.join || {};

  // Ambil data yang memiliki nilai
  const filledOnly = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== "")
  );

  const targetKey = filledOnly.targetkey;

  // Buat targetJOIN tanpa menimpa data lama
  const targetJOIN = {
    ...existingJoin, // pertahankan join lama
    [targetKey]: {
      ...(existingJoin[targetKey] || {}), // pertahankan data lama untuk key ini
      ...filledOnly                        // tambahkan data baru
    }
  };

  console.log("Hanya yang ada nilainya:", targetJOIN);
  // Tentukan key yang di-skip
  const skip = ["index", "target", "groupJoinType", "groupJoinCondition", "targetkey","keyindex","keytarget","keyindexname","keytargetname"];

  // Ambil keys dengan value
  const keysWithValue = Object.entries(data)
    .filter(([key, value]) => value !== "" && !skip.includes(key))
    .map(([key]) => key);

  const index = tableData.tableName; // prefix untuk tableData.variables
  const terget = targetKey;           // prefix untuk keysWithValue

  // Tambahkan prefix hanya jika belum ada
  const prefixedTableVars = tableData.variablesOrigin.map(v =>
    v.includes(".") ? v : `${index}.${v}`
  );

  const prefixedKeyVars = keysWithValue.map(v =>
    v.includes(".") ? v : `${terget}.${v}`
  );

let skipAll = Array.from(new Set([
  ...tableData.variables,        // pertahankan variabel lama
  ...prefixedTableVars,
  ...prefixedKeyVars
]));

// Hanya ambil yang memiliki '_' di nama variabel
skipAll = skipAll.filter(v => v.includes("."));

// Pisahkan 'id' dari array (case-insensitive)
const hasId = skipAll.some(item => item.toLowerCase().endsWith(".id"));
skipAll = skipAll.filter(item => !item.toLowerCase().endsWith(".id"));

// Tambahkan 'id' di akhir jika ada sebelumnya
if (hasId) {
  skipAll.push(`${terget}.id`);
}
  // Merge data ke store tanpa menimpa variabel lama
  const makeDir = {
    join: targetJOIN,
    variables: skipAll
  };


  await NXUI.ref.mergeData("nexaStore", id, makeDir);
   NXUI.nexaModal.close(modalid);
   NXUI.nexaModal.close("add_join_tabel"+id);
   NXUI.nexaModal.close("join_tabel"+id);
   // NXUI.nexaModal.close(id+"_index");


};



// ===== Contoh penggunaan =====

