/**
 * Helper functions for SearchField and dataform operations
 */
// import { modalHTML } from "./Functions/NexaModal.js";
import { refreshTableData  } from "./Functions/refreshTableData.js";
/**
 * Updates dataformStor object with dynamic ID and removes 'id' from variables
 * @param {Object} dataformStor - The dataform storage object (joinSDK or formSDK)
 * @param {string|number} dynamicId - The dynamic ID to set in where condition
 * @returns {Object} Updated dataformStor object
 */
export async function modalDetails(id,cellValue, variable,dynamicId) {
   try {
  if (!id) {
    console.warn("dataformStor is null or undefined");
   
  }
 const dataform = await NXUI.ref.get("nexaStore", id);
 const dataKey=dataform.form[variable];
 addWhere(dataform.applications, { field: dataKey?.failedtabel, value: dynamicId });
 // const tabel = await NXUI.Storage().models("Office").executeOperation(dataform.applications);

   const dastorger= new NXUI.Federated(dataform);
   const tabel= await dastorger.get(dataform.applications)

       const responseData = tabel?.response?.[0];

       if (responseData) {
       const firstKey = Object.keys(responseData)[0];
       const firstValue = responseData[variable];

       // Potong nama jika terlalu panjang (maksimal 20 karakter)
       const truncatedValue =firstValue && firstValue.length > 20? firstValue.substring(0, 20) + "..." : firstValue;
       const modalID = dataform.id + "_" + dynamicId;
       // Buat HTML content untuk menampilkan daftar data (tidak termasuk 'id')
       const contentHTML = Object.entries(responseData)
         .filter(([key, value]) => key !== 'id') // Filter out 'id' field
        .map(([key, value]) => {
          // Ambil label dari dataformLabel berdasarkan key
          const fieldConfig = dataform.form && dataform.form[key];
          const displayLabel = fieldConfig?.placeholder || fieldConfig?.label;
          const displayValue = value === null ? "Tidak ada data" : value;
          
          let callbackData = '';
          if (fieldConfig?.type == 'file') {
             callbackData = `<a href="${window.NEXA.url}/${displayValue}" download>Download</a>`;
          } else if (fieldConfig?.type == 'approval') {
             callbackData = `<a href="#" onclick="approvalHistory('${fieldConfig.key}','${dynamicId}','${id}')">History</a>`;
          } else {
             callbackData = displayValue;
          }

          return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
              <strong class="text-capitalize">${displayLabel}:</strong>
              <span class="text-muted">${callbackData}</span>
            </div>
          `;
         })
         .join("");

       NXUI.modalHTML({
         elementById: modalID,
         styleClass: "w-500px",
         minimize: true,
         label: `Detail`,
         onclick: false,
         content: `
           <div class="p-3">
             <h6 class="mb-3">Detail Data:</h6>
             ${contentHTML}
           </div>
         `,
       });
       NXUI.nexaModal.open(modalID);
       }
      } catch (error) {
        console.error("Error executing join operation:", error);
      }



}


// Fungsi untuk menambah kondisi WHERE
export function addWhere(obj, conditions, operator = "AND") {
  // Pastikan operator adalah huruf besar
  operator = operator.toUpperCase();

  // Jika kondisi hanya satu (bukan array), ubah jadi array
  if (!Array.isArray(conditions)) {
    conditions = [conditions];
  }

  // Ubah setiap kondisi menjadi bentuk SQL: field='value'
  const conditionStrings = conditions.map(cond => {
    const { field, value, comparison = "=" } = cond;
    return `${field}${comparison}'${value}'`;
  });

  // Gabungkan semua kondisi dengan operator (AND / OR)
  const newCondition = conditionStrings.join(` ${operator} `);

  // Jika belum ada WHERE, buat baru
  if (!obj.where || obj.where === false) {
    obj.where = `WHERE ${newCondition}`;
  } else {
    // Jika sudah ada, tambahkan dengan operator
    obj.where += ` ${operator} ${newCondition}`;
  }

  return obj;
}

window.styleClassModalUpdate = async function (modalid ,upmodalForm) {
  const dataform = await NXUI.ref.get("nexaStore", modalid);
  const classModal = "classModal" + modalid;
  NXUI.nexaModal.close(upmodalForm);
  NXUI.modalHTML({
    elementById: classModal,
    styleClass: "w-400px",
    minimize: true,
    label: `Style Modal`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy: modalid, // ✅ Standard validation approach
    onclick: {
      title: "Submit",
      cancel: "Cancel",
      send: "saveClassModalUpdate", // ✅ Use namespaced function name
    },

    content: `
<div class="nx-row">
  <div class="nx-col-8">
    <div class="form-nexa-group">
      <label>Lebar</label>
      <input type="number" class="form-nexa-control"name="width"value="${
        dataform?.modal?.width || "500"
      }" />
    </div>
  </div>
  <div class="nx-col-4">
    <div class="form-nexa-group">
      <label>Type</label>
      <input type="text" class="form-nexa-control"value="px" />
    </div>
  </div>
</div>
      `,
  });

  NXUI.nexaModal.open(classModal);
};
window.saveClassModalUpdate = async function (modalid, data, tabel) {
  // const dataform = await NXUI.ref.get("nexaStore", tabel);

  const makeDir = {
    modal: {
      swidth: "w-" + data.width + "px",
      width: data.width,
    },
  };
  await NXUI.ref.mergeData("nexaStore", tabel, makeDir);
  NXUI.nexaModal.close(modalid);
};
window.approvalHistory = async function (data,id, tabel) {
 console.log('label:', id, data, tabel);


           const retFind = await NXUI.Storage()
               .models("Office")
               .tablesLax(
                 276136656376989,
                 {
                  where: {
                    table_name: data,
                    record_id: id
                  }
                 }
               );
console.log('label:', retFind);




  const classModal=`modalapprovalHistory_${id}_${tabel}`
  
  // Generate content HTML for approval history
  let contentHTML = '';
  if (retFind && retFind.data && retFind.data.length > 0) {
    contentHTML = retFind.data.map((item, index) => {
      const statusBadge = `<span class="badge ${item.status === 'ditolak' ? 'bg-danger' : item.status === 'disetujui' ? 'bg-success' : 'bg-warning'}">${item.status}</span>`;
      
      return `
        <div class="approval-item mb-4 p-3 border rounded">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 text-primary">Riwayat #${index + 1}</h6>
            <span class="text-muted small">${item.created_at}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <strong class="text-capitalize">Status:</strong>
            <span class="text-muted">${statusBadge}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <strong class="text-capitalize">Catatan:</strong>
            <span class="text-muted">${item.catatan || 'Tidak ada catatan'}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <strong class="text-capitalize">Approved by:</strong>
            <span class="text-muted">${item.approved_by || 'Belum disetujui'}</span>
          </div>
          ${item.approved_at ? `
          <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <strong class="text-capitalize">Tanggal disetujui:</strong>
            <span class="text-muted">${item.approved_at}</span>
          </div>
          ` : ''}
        </div>
      `;
    }).join('');
  } else {
    contentHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
        <strong class="text-capitalize">Status:</strong>
        <span class="text-muted">Tidak ada riwayat persetujuan</span>
      </div>
    `;
  }

  NXUI.modalHTML({
    elementById: classModal,
    styleClass: "w-600px",
    minimize: true,
    label: `Approval History`,
    onclick: false,
    content: `
      <div class="p-3">
        <h6 class="mb-3">Detail Data:</h6>
        ${contentHTML}
      </div>
    `,
  });
 NXUI.nexaModal.open(classModal);





}
