import { formHeaderGroup,initHeaderGroupHandlers } from "./tableHeader.js";
let currentGroups = [];
let headerGroupSdk = null;

export async function tableHeaderGroup(Sdk) {
  const dataform = await Sdk.storage();
  // Get saved header group configuration
  const statusHeaderGroups = dataform.settings?.headerGroups || false;
   const checkedAttr = statusHeaderGroups ? 'checked' : '';
   const textAttr = statusHeaderGroups ? 'Enable' : 'Disabled';
  
 const savedHeaderGroups = dataform.settings?.headerGroups || [];

  currentGroups = savedHeaderGroups.length > 0 ? savedHeaderGroups : [
    {
      groupName: "Default Group",
      columns: [] // Empty by default, user must select columns
    }
  ];
  
  return `
    <div class="nx-row">
    <div class="nx-col-6">
        <button type="button" class="nx-btn-sm nx-btn-primary icon-button" onclick="settingHeaderGroup(this,'${dataform.id}')">
          <span class="material-symbols-outlined nx-icon-sm">add</span>
          <span>Add New Group</span>
        </button>
    </div>
    <div class="nx-col-6">
      <div class="nx-switch-item">
        <input type="checkbox" id="switch1" onclick="enableHeaderGroup(this,'${dataform.id}')" ${checkedAttr}/>
        <label for="switch1">
          <span class="nx-switch"></span>
          ${textAttr} Header Group
        </label>
      </div>
    </div>


  </div>
  <br>
  <br>
  <div class="nx-alert nx-alert-info">
Header Group, yang berfungsi untuk mengelola dan menampilkan konfigurasi pengelompokan kolom (header grouping) pada tabel
</div>

`
}




window.enableHeaderGroup = async function(e,token) {
    const Sdk = new NXUI.Buckets(token);
    if (!e.checked) {
       await Sdk.upSettings({
           headerGroups: false
         });
      console.log('label:', e.checked);
      
      // ✅ Refresh UI tabel setelah header group di-disable
      if (typeof window.refreshUITable === 'function') {
        await window.refreshUITable();
      }
     }
}
window.settingHeaderGroup = async function(e,token) {
  const Sdk = new NXUI.Buckets(token);
  const dataform = await Sdk.storage();
  const modalForm = "insert" + token;
  
  // Set global SDK reference
  headerGroupSdk = Sdk;
  // if (e.checked) {
  NXUI.formModal({
      elementById: modalForm,
      styleClass: "w-500px",
      minimize: true,
      label: `Add Record`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      // getValidationBy: ["name"], // ✅ Standard validation approach
      setDataBy: Sdk, // ✅ Standard validation approach
      onclick: {
        title: "Submit",
        cancel: "Cancel",
        send: "saveHeaderGroups", // ✅ Use wrapper function yang akan trigger refresh
      },
      floating: false,
      content: await formHeaderGroup(Sdk),
      footer: `
      <button type="button" class="btn btn-secondary"id="addNewHeaderGroup">
          <span class="material-symbols-outlined" style="font-size: 18px; margin: 0px;">add</span>
      </button>
   `,
    });

      NXUI.nexaModal.open(modalForm);
      NXUI.id("body_"+modalForm).setStyle("padding", "0px");
     await initHeaderGroupHandlers()
 // } else {
 //    // await Sdk.upSettings({
 //    //     headerGroups: false
 //    //   });
 // }
}

window.saveHeaderGroups = async function(modalid, data,sdk) {
  try {
    console.log('Received form data:', data);
    
    // Collect all group data from form data object
    const groups = [];
    
    if (data && typeof data === 'object') {
      // Loop through all data keys to find header group columns
      Object.keys(data).forEach(key => {
        if (key.startsWith('headerGroup_') && key.endsWith('_columns')) {
          // Extract group index from key (e.g., "headerGroup_0_columns" -> 0)
          const match = key.match(/headerGroup_(\d+)_columns/);
          if (match) {
            const groupIndex = parseInt(match[1]);
            const columnsValue = data[key];
            
            // Parse columns: if it's a string with comma, split it; otherwise use as array
            const columns = typeof columnsValue === 'string' 
              ? columnsValue.split(',').map(col => col.trim()).filter(col => col.length > 0)
              : (Array.isArray(columnsValue) ? columnsValue : [columnsValue]);
            
            // Get group name from form data
            const groupNameKey = `headerGroup_${groupIndex}_groupName`;
            const groupName = data[groupNameKey] || `Group ${groupIndex + 1}`;
            
            if (columns.length > 0) {
              groups[groupIndex] = {
                groupName: groupName,
                columns: columns
              };
            }
          }
        }
      });
      
      // Convert to array and filter out undefined
      const validGroups = groups.filter(g => g !== undefined);
      
      if (validGroups.length > 0 && sdk) {
        console.log('label:', validGroups);
        await sdk.upSettings({
          headerGroups: validGroups
        });
        
        // ✅ Refresh UI tabel setelah header group disimpan
        if (typeof window.refreshUITable === 'function') {
          await window.refreshUITable();
        }
      }
       NXUI.nexaModal.close(modalid);
    }
  } catch (error) {
    console.error('Error saving header groups:', error);
    NXUI.nexaNotify?.({ message: 'Error saving header groups', type: 'error' });
  }
}