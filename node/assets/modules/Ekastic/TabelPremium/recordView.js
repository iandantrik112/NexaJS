
export async function recordView(cellValue,token) {
   try {
       if (cellValue) {
       const modalID ="cellValue_" + cellValue.id;
       const Sdk = new NXUI.Buckets(token);
       const dataform = await Sdk.storage();
       const dynamicId = cellValue.id;
       // Buat HTML content untuk menampilkan daftar data (tidak termasuk 'id')
       const contentHTML = Object.entries(cellValue)
         .filter(([key, value]) => key !== 'id') // Filter out 'id' field
        .map(([key, value]) => {
          // Format key menjadi label (capitalize first letter)
          const fieldConfig = dataform.form && dataform.form[key];
          let displayLabel = fieldConfig?.placeholder || fieldConfig?.label;
          
          // Replace underscores with spaces and capitalize first letter
          if (displayLabel) {
            displayLabel = displayLabel.replace(/_/g, ' ');
            displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
          }
          
          const displayValue = value === null ? "Tidak ada data" : value;
          
          let callbackData = '';
          if (fieldConfig?.type == 'file') {
             callbackData = `<a href="${window.NEXA.url}/${displayValue}" download><span class="material-symbols-outlined nx-icon-sm">download</span> Download</a>`;
          } else if (fieldConfig?.type == 'approval') {
             callbackData = `<a href="#" onclick="approvalHistory('${fieldConfig.key}','${dynamicId}','${token}')"><span class="material-symbols-outlined nx-icon-sm">history</span> History</a>`;
         
            } else {
             callbackData = displayValue;
          }


          return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
              <strong>${displayLabel}:</strong>
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
             ${contentHTML}
           </div>
         `,
       });
       NXUI.nexaModal.open(modalID);
       }
      } catch (error) {
        console.error("Error displaying record:", error);
      }
}

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
        ${contentHTML}
      </div>
    `,
  });
 NXUI.nexaModal.open(classModal);

}
