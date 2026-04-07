// Store for header group data (module-level variables)
let currentGroups = [];
let tableFields = [];
let headerGroupSdk = null;

export async function formHeaderGroup(Sdk) {
  const dataform = await Sdk.storage();
  const checkedItems = await Sdk.getFields("tabel") || [];
  
  // Get saved header group configuration
  const savedHeaderGroups = dataform.settings?.headerGroups || [];
  
  // Get only table fields (exclude id and no)
  tableFields = checkedItems.filter(item => item.tabel === true && item.name !== 'id' && item.name !== 'no');
  
  // Create default groups if none exist
  currentGroups = savedHeaderGroups.length > 0 ? savedHeaderGroups : [
    {
      groupName: "Default Group",
      columns: [] // Empty by default, user must select columns
    }
  ];
  
  // Store SDK reference
  headerGroupSdk = Sdk;
  
  // Build UI for header group configuration
  let groupsHTML = '';
  
  currentGroups.forEach((group, groupIndex) => {
    const groupColumns = group.columns || [];
    let columnsHTML = '';
    
    tableFields.forEach(field => {
      const isInGroup = groupColumns.includes(field.name);
      const checkedAttr = isInGroup ? 'checked' : '';
      columnsHTML += `
        <div class="nx-checkbox-item">
          <input type="checkbox" 
                 id="headerGroup_${groupIndex}_${field.name}" 
                 name="headerGroup_${groupIndex}_columns" 
                 value="${field.name}"${checkedAttr ? ' checked' : ''}>
          <label for="headerGroup_${groupIndex}_${field.name}">
            <span class="nx-checkmark"></span>
            ${field.placeholder || field.name}
          </label>
        </div>
      `;
    });
    
    groupsHTML += `
      <div class="nx-card" style="margin-bottom: 15px;" data-group-index="${groupIndex}">
        <div class="nx-card-header">
          <h5 style="margin: 0;">Group ${groupIndex + 1}</h5>
          ${currentGroups.length > 1 ? `
            <button type="button" class="nx-btn-sm nx-btn-text header-group-remove" data-index="${groupIndex}">
              <span class="material-symbols-outlined nx-icon-sm">delete</span>
            </button>
          ` : ''}
        </div>
        <div class="nx-card-body">
          <div class="form-nexa-group">
            <label>Group Name</label>
            <input type="text" 
                   name="headerGroup_${groupIndex}_groupName"
                   class="form-nexa-control header-group-name" 
                   data-index="${groupIndex}"
                   value="${(group.groupName || 'Default Group').replace(/"/g, '&quot;')}"
                   placeholder="Enter group name">
          </div>
          <div class="form-nexa-group">
            <label>Select Columns</label>
            <div class="nx-checkbox-grid" style="max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              ${columnsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  return `

      <div id="headerGroupsContainer">
        ${groupsHTML}
      </div>
  `;
}

export async function initHeaderGroupHandlers() {
  // Wait for DOM to be ready
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Add button handlers
  const addBtn = document.getElementById('addNewHeaderGroup');
  
  if (addBtn) {
    addBtn.addEventListener('click', addNewHeaderGroup);
  }
  
  // Delegate for remove buttons and group name changes
  const container = document.getElementById('headerGroupsContainer');
  if (container) {
    container.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.header-group-remove');
      if (removeBtn) {
        const index = parseInt(removeBtn.dataset.index);
        removeHeaderGroup(index);
      }
    });
    
    container.addEventListener('change', (e) => {
      const nameInput = e.target.closest('.header-group-name');
      if (nameInput) {
        const index = parseInt(nameInput.dataset.index);
        updateGroupName(index, nameInput.value);
      }
    });
  }
}

function addNewHeaderGroup() {
  const newGroup = {
    groupName: "New Group",
    columns: []
  };
  
  currentGroups.push(newGroup);
  renderHeaderGroups();
}

function removeHeaderGroup(groupIndex) {
  if (currentGroups.length <= 1) {
    NXUI.nexaNotify?.({ message: 'Minimal 1 group harus ada', type: 'warning' });
    return;
  }
  
  currentGroups.splice(groupIndex, 1);
  renderHeaderGroups();
}

function renderHeaderGroups() {
  const container = document.getElementById('headerGroupsContainer');
  if (!container) return;
  
  let groupsHTML = '';
  
  currentGroups.forEach((group, groupIndex) => {
    const groupColumns = group.columns || [];
    let columnsHTML = '';
    
    tableFields.forEach(field => {
      const isInGroup = groupColumns.includes(field.name);
      const checkedAttr = isInGroup ? 'checked' : '';
      columnsHTML += `
        <div class="nx-checkbox-item">
          <input type="checkbox" 
                 id="headerGroup_${groupIndex}_${field.name}" 
                 name="headerGroup_${groupIndex}_columns" 
                 value="${field.name}"${checkedAttr ? ' checked' : ''}>
          <label for="headerGroup_${groupIndex}_${field.name}">
            <span class="nx-checkmark"></span>
            ${field.placeholder || field.name}
          </label>
        </div>
      `;
    });
    
    groupsHTML += `
      <div class="nx-card" style="margin-bottom: 15px;" data-group-index="${groupIndex}">
        <div class="nx-card-header">
          <h5 style="margin: 0;">Group ${groupIndex + 1}</h5>
          ${currentGroups.length > 1 ? `
            <button type="button" class="nx-btn-sm nx-btn-text header-group-remove" data-index="${groupIndex}">
              <span class="material-symbols-outlined nx-icon-sm">delete</span>
            </button>
          ` : ''}
        </div>
        <div class="nx-card-body">
          <div class="form-nexa-group">
            <label>Group Name</label>
            <input type="text" 
                   name="headerGroup_${groupIndex}_groupName"
                   class="form-nexa-control header-group-name" 
                   data-index="${groupIndex}"
                   value="${(group.groupName || 'Default Group').replace(/"/g, '&quot;')}"
                   placeholder="Enter group name">
          </div>
          <div class="form-nexa-group">
            <label>Select Columns</label>
            <div class="nx-checkbox-grid" style="max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #ddd; border-radius: 4px; ">
              ${columnsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = groupsHTML;
}

function updateGroupName(groupIndex, newName) {
  if (currentGroups[groupIndex]) {
    currentGroups[groupIndex].groupName = newName;
  }
}
