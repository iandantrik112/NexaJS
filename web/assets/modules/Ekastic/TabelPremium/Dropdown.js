/**
 * Generate dropdown menu items HTML
 * @param {string} id - Record ID
 * @param {string} no - Record number
 * @returns {string} HTML string for dropdown menu
 */
export function handleMenuDropdown(id, no,className,dropdown) {
    // Handle dropdown structure safely
    const dropdownData = dropdown?.data || [];
    
    const result = dropdownData.map((item, index) => {   
        // If item is already an object with the properties, use it directly
        // Otherwise, it might be a key and we need dropdown[item]
        const row = item && typeof item === 'object' && item.action 
            ? item 
            : (dropdown[item] || item);
        
        return {
            action: row?.action,
            icon: row?.icon,
            label: row?.label,
            danger: row?.danger || false,
        };
    }).filter(item => item.action); // Remove items without action

  const cellUpdate=NEXA?.controllers?.data?.upaccess[className] ?? 0;
  const cellDelete=NEXA?.controllers?.data?.redaccess[className] ?? 0;
  
  // Separate standard menu items and custom menu items from result
  const standardActions = ['view', 'edit', 'delete'];
  const customItemsFromResult = result.filter(item => !standardActions.includes(item.action));
  
  // Standard menu items (in order) - these are the parent/main menus
  const standardMenuItems = [
    { action: 'view', icon: 'visibility', label: 'View Details', danger: false },
    { action: 'edit', icon: 'edit', label: 'Edit Record', danger: false },
    { action: 'delete', icon: 'delete', label: 'Delete', danger: false }
  ];
  
  // If result has items, exclude 'edit' from standard items (it will be broken into specific parts)
  // Otherwise, show standard menu items
  const finalStandardItems = result.length > 0
    ? standardMenuItems
        .filter(standardItem => standardItem.action !== 'edit') // Exclude edit when result has items
        .map(standardItem => {
          const foundInResult = result.find(item => item.action === standardItem.action);
          return foundInResult || standardItem;
        })
    : standardMenuItems.map(standardItem => {
        const foundInResult = result.find(item => item.action === standardItem.action);
        return foundInResult || standardItem;
      });
  
  // Combine: standard menu items first (parent menus - always shown), then custom menu items from result (below)
  const dropdownItems = [
    ...finalStandardItems,
    ...customItemsFromResult
  ];
  // Filter items based on permissions
  const visibleItems = dropdownItems.filter(item => {
    // Custom menu items from result - only show if user has update permission
    if (!['view', 'edit', 'delete'].includes(item.action)) {
      return cellUpdate; // Show custom menu only if cellUpdate is true
    }
    // Standard menu items based on permissions
    if (item.action === 'view') return true; // Always show view
    if (item.action === 'edit') return cellUpdate; // Show edit if update permission exists
    if (item.action === 'delete') return cellDelete; // Show delete if delete permission exists
    return false;
  });

  // Check if there are any delete items (for divider logic)
  const hasDelete = visibleItems.some(item => item.action === 'delete');
  const hasNonDeleteActions = visibleItems.some(item => item.action !== 'delete');

  return `
      <div class="nx-dropdown-content ekastic-action-menu">
          ${visibleItems
            .filter(item => item.action !== 'delete')
            .map(item => generateDropdownItem(item, id, no))
            .join('')}
          ${hasDelete && hasNonDeleteActions ? '<div class="nx-dropdown-divider"></div>' : ''}
          ${visibleItems
            .filter(item => item.action === 'delete')
            .map(item => generateDropdownItem(item, id, no))
            .join('')}
      </div>
  `;
}

/**
 * Generate single dropdown menu item
 * @param {Object} item - Menu item configuration
 * @param {string} id - Record ID
 * @param {string} no - Record number
 * @returns {string} HTML string for menu item
 */
function generateDropdownItem(item, id, no) {
  const dangerClass = item.danger ? 'nx-dropdown-danger' : '';
  return `
      <a href="javascript:void(0)" class="${dangerClass}" data-action="${item.action}" data-id="${id}" data-no="${no || id}" onclick="return false;">
          <span class="material-symbols-outlined">${item.icon}</span>
          ${item.label}
      </a>
  `;
}

