
export async function theadLabel(data) {
    const Sdk = new NXUI.Buckets(data.id);
  const dataform = await Sdk.storage();
  // console.log('label:', dataform);
//   console.log('label:', dataform);
//  const checkedItems = await Sdk.getFields("tabel") || [];
//    const result = checkedItems.map(item => ({
//       failed: item.name,
//       failedAs: item.placeholder
//     }));
//    console.log('label:', result);

  const nexaField = new NXUI.Field();
  nexaField.onSaveCallback(
    async (variable, newValue, element, type, fieldName) => {
        let actualFieldName = '';
        if (variable && variable.startsWith('filtertext_')) {
          actualFieldName = variable.replace('filtertext_', '');
        } else if (variable) {
          actualFieldName = variable;
        }
      // Capitalize first letter of each word in newValue
      const capitalizedValue = newValue.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');

      // Update field dengan nilai baru
      try {


        if (variable== "appname") {
           await Sdk.upIndex({
               label: capitalizedValue,
               appicon:'table_view',
           });


                  // appname: storage.label,
                  // appicon: storage?.appicon ?? "inventory_2",
         const dataforms= await new NXUI.NexaModels().Storage("controllers")
          .where("userid",Number(NEXA.userId))
          .where("label", dataform.className)
          .update({
             appname: capitalizedValue,
          });





        } else {
           await Sdk.upField({
             [actualFieldName]: {
               placeholder: capitalizedValue,
             },
           });
          }
        
    
      } catch (error) {
        console.error('Error updating placeholder:', error);
      }
    }
  );

  // Aktifkan editing
  nexaField.initElements();
}