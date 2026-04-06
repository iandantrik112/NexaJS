export async function recordUpdate(cellValue, token) {
   try {
       if (!cellValue) {
           console.error("cellValue is required");
           return;
       }

       const modalForm = "cellUpdate_" + cellValue.id;
       const Sdk = new NXUI.Buckets(token);
       const dataform = await Sdk.storage();
       // ✅ Get form configuration from dataform
       const dataKey = dataform.form || {};
       
       NXUI.formModal({
           elementById: modalForm,
           styleClass: dataform?.modal?.swidth ?? "w-500px",
           minimize: true,
           mode: 'update',
           value: cellValue,
           label: `Update Record`,
           getFormBy: ["name"],
           getValidationBy: ["name"],
           storage:dataform,
           setDataBy: {
               id: cellValue.id,
               store: dataform,
               dataKey: dataKey
           },
           onclick: {
               title: "Submit",
               cancel: "Cancel",
               send: "saveACIDForm",
           },
           floating: dataform,
           content: false,
           footer: `
           <button type="button" onclick="styleClassModalUpdate('${dataform.id}','${modalForm}')" class="btn btn-secondary">
               <span class="material-symbols-outlined" style="font-size: 18px; margin: 0px;">settings</span>
           </button>
       `,
       });

       NXUI.nexaModal.open(modalForm);

   } catch (error) {
       console.error("Error displaying record:", error);
   }
}

window.saveACIDForm = async function (modalForm, cellValue,tabel) {
     NXUI.nexaModal.close(modalForm);
      const hasFileType = getFileFields(tabel.store.form);
      const store= new NXUI.Federated(tabel.store);

      const response= await store.upt(cellValue,tabel.id,hasFileType)
     // const response = await NXUI.Storage()
     //          .models("Office")
     //          .setRetUpdate(
     //            tabel.dataKey.key,
     //            modalForm,
     //            cellValue,
     //            tabel.id
     //          );
 await window.refreshTable();

};

export function getFileFields(data) {
  const files = Object.entries(data)
    .filter(([_, field]) => {
      const isFile = field.type === "file";

      return isFile;
    })
    .map(([key, field]) => {
      const config = {
        name: field.name,
        key: Number(field.key),
        label: field.label,
        accept: field.fieldAccept,
        multiple: field.fieldMultiple,
        importing: field.fieldImporting,
        maxSize: field.fileUploadSize,
      };
      return config;
    });
  return files.length > 0 ? files : false;
}
