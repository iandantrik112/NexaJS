/**
 * Helper functions for SearchField and dataform operations
 */
// import { modalHTML } from "./Functions/NexaModal.js";

/**
 * Updates dataformStor object with dynamic ID and removes 'id' from variables
 * @param {Object} dataformStor - The dataform storage object (joinSDK or formSDK)
 * @param {string|number} dynamicId - The dynamic ID to set in where condition
 * @returns {Object} Updated dataformStor object
 */
export async function recordApproval(key,failed,id,cellID) {
   try {
 const dataform = await NXUI.ref.get("nexaStore", cellID);
 const dataKey=dataform.form[failed];
       const store= new NXUI.Federated({
        id:cellID,
       });
       let label=''
       let status=''
       if (key.checked) {
          status='disetujui';
          label=key.checked+":"+dataKey?.receive +" Approved By "+NEXA.userSlug
       } else {
          status='ditolak';
          label=key.checked+":"+dataKey?.reject +" Approved By "+NEXA.userSlug
       }
       const cellValue={
         [failed]:label
       }
     if (dataKey?.approdialog) {
       return  await modalApproval(key,failed,id,cellID)
     } else {
      const response= await store.upt(cellValue,id,null)
       // Tabel 276136656376989
          const retFind = await NXUI.Storage()
              .models("Office")
              .setRetFindKey(
                276136656376989,
                "Approval",
                "record_id",
                id
              );

   
              if (retFind.data) {
              const upValue={
                 catatan:label.split(':')[1],
                 status:status
               }
               await NXUI.Storage()
                 .models("Office")
                 .setRetUpdate(
                   276136656376989,
                   "Approval",
                   upValue,
                   retFind.data.id
                 );
              } else {
                 const addValue={
                 userid:Number(NEXA.userId),
                 record_id:id,
                 status:status,
                 table_name:dataKey.key,
                 approved_by:NEXA.userSlug,
                 catatan:label.split(':')[1]
               }

                 await NXUI.Storage()
                   .models("Office")
                   .setRetInsert(276136656376989, "Approval", addValue);
              }
      }
  } catch (error) {
      console.error("Error executing join operation:", error);
    }
}
export async function modalApproval(key,failed,id,cellID) {
      const dataform = await NXUI.ref.get("nexaStore", cellID);
       
      const dataKey=dataform.form[failed];
       const store= new NXUI.Federated({
        id:cellID,
       });
       let label=''
       let label2=''
       let status=''
       if (key.checked) {
          status='disetujui';
          label=key.checked+":"+dataKey?.receive +" Approved By "+NEXA.userSlug
       } else {
          status='ditolak';
          label=dataKey?.reject
          label2=key.checked+":"+dataKey?.reject +" Approved By "+NEXA.userSlug
       }
       const cellValue={
         [failed]:label
       }
       if (status=='ditolak') {
        // Create a valid CSS selector ID by replacing invalid characters
        const modalID = `modal-approval-${id}-${cellID}`.replace(/[^a-zA-Z0-9-]/g, '-');
         NXUI.modalHTML({
           elementById: modalID,
           styleClass: "w-500px",
           minimize: true,
           label: `Keterangan Approval`,
         
           onclick: false,
           content: `
             <div class="p-3">



             <span id="${modalID}" type="text" class="editable" data-min-length="5" data-key="${id}" data-cellid="${cellID}" name="${failed}">${
                label
              }</span>



<br>
<br>


<div class="nx-alert-sm nx-alert-danger">
   <small>Beri alasan ditolak: dengan megkik text ${label}</small>
</div>



        
             </div>
           `,
         });
         NXUI.nexaModal.open(modalID);
         await tabelEdit(dataform);
       } else {
         await store.upt(cellValue,id,null)
          const retFind = await NXUI.Storage()
              .models("Office")
              .setRetFindKey(
                276136656376989,
                "Approval",
                "record_id",
                id
              );

   
              if (retFind.data) {
              const upValue={
                 catatan:label.split(':')[1],
                 status:status
               }
               await NXUI.Storage()
                 .models("Office")
                 .setRetUpdate(
                   276136656376989,
                   "Approval",
                   upValue,
                   retFind.data.id
                 );
              } else {
                 const addValue={
                 userid:Number(NEXA.userId),
                 record_id:id,
                 status:status,
                 table_name:dataKey.key,
                 approved_by:NEXA.userSlug,
                 catatan:label.split(':')[1]
               }

                 await NXUI.Storage()
                   .models("Office")
                   .setRetInsert(276136656376989, "Approval", addValue);
              }



       }
      
}


export async function tabelEdit(store) {
  try {
    // const storage = await store.storage();
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {

        console.log('fieldName:', fieldName);
        console.log('data-key:', element.dataset.key);
        console.log('data-cellid:', element.dataset.cellid);

        // Validasi data yang diperlukan
        if (!element.dataset.key || !element.dataset.cellid) {
          console.error('Missing required data attributes');
          return;
        }

        const recordId = Number(element.dataset.key);
        const cellId = element.dataset.cellid;

        if (isNaN(recordId)) {
          console.error('Invalid record ID:', element.dataset.key);
          return;
        }

       const cellValue={
         [fieldName]:"false:"+newValue
       }

        const store= new NXUI.Federated({
         id: cellId,
        });
        
        try {
          await store.upt(cellValue, recordId, null);

           const retFind = await NXUI.Storage()
               .models("Office")
               .setRetFindKey(
                 276136656376989,
                 "Approval",
                 "record_id",
                element.dataset.key
               );
              const upValue={
                  catatan:newValue,
                  status:"ditolak"
                }
                await NXUI.Storage()
                  .models("Office")
                  .setRetUpdate(
                    276136656376989,
                    "Approval",
                    upValue,
                    retFind.data.id
                  );
        } catch (error) {
          console.error('Error updating approval:', error);
        }
        NXUI.nexaModal.close(variable);
 
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}