export async function recordHandler(cellValue,token,action) {
   try {
       const Sdk = new NXUI.Buckets(token);
       const storage = await Sdk.storage();
    // const  checkedItems = await Sdk.getFields("nested") || [];
      const dataform = NXUI.NexaFormKey.include(storage, storage.handler?.[action]?.origin);
console.log('label:', storage.handler?.[action]?.origin);
       const datail=storage.handler?.[action]?.origin[0] ?? null
       if (!dataform) {
           console.error("cellValue is required");
           return;
       }
 
       const modalForm = "cellUpdate_" + cellValue.id;
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
           storage:storage,
           setDataBy: {
               id: cellValue.id,
               store: dataform,
               dataKey: dataKey,
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
       if (datail=='detail') {
        NXUI.id("body_"+modalForm).setStyle("padding", "0px")
       }

   } catch (error) {
       console.error("Error displaying record:", error);
   }
}

window.saveACIDForm = async function (modalForm, cellValue,tabel) {
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
 NXUI.nexaModal.close(modalForm);
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
