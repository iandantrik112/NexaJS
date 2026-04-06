import { refChildren } from './refChildren.js';

export async function refDirectory(data) {
  try {
  	    const  Sdk = await window.NXUI.ref.get("bucketsStore", "Navigation");
  const dimensi = new NXUI.NexaDimensi();
  console.log('label:', Sdk);
  const height = dimensi.height("#nexa_app", 220, 'vh');
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="hendelactionNavigationdir">
         <div class="nx-card-header">
            <h3 class="bold fs-20px">Navigation action</h3>  
         </div>
           <div  class="pr-10px nx-scroll-hidden"style="height:600px">
           <div class="nx-row" style="padding-left:5px"id="nxdrop"></div>
          </div>
      </div>   
    `
    );

    setTimeout(async () => {
      try {
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaDrag({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        const template = render.Container({
          container: "#nxdrop",
          content: [await konfigurasi(height)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        
        // Inisialisasi inline editing untuk label
        await tabelEdit(Sdk);
        
        // Restore expanded menu state setelah render
        setTimeout(() => {
          if (window.restoreExpandedMenuState) {
            window.restoreExpandedMenuState();
          }
        }, 50);

      } catch (error) {
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
  }
}


// Fungsi rekursif untuk render main_menu dengan children sebagai tree
function renderMainMenuTree(items, level = 0, storage, parentClass = '', parentItemId = '') {
  if (!items || items.length === 0) {
    return '';
  }
  
  return items.map((item, index) => {
    const itemId = parentItemId ? `${parentItemId}-${index}` : `menu-${index}`;
    const indentPadding = level > 0 ? `${level * 10}px` : '0px';
    const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
    const row = storage?.action?.[item.class];
    const itemClass = item.class || item.id;
    
    // Icon expand/collapse untuk item yang punya children
    const expandButton = hasChildren ? `
      <span class="material-symbols-outlined menu-toggle-icon" 
            id="icon-${itemId}" 
            onclick="toggleMenuTree('${itemId}')"
            style="font-size: 18px; cursor: pointer; padding: 2px; margin-right: 4px; transition: transform 0.2s;"
            onmouseover="this.style.opacity='0.7'"
            onmouseout="this.style.opacity='1'"
            title="Toggle Expand/Collapse">chevron_right</span>
    ` : '<span style="display:inline-block;width:24px;"></span>';
    
    // Render children (default collapsed) - pass parent class yang sebenarnya
    const childrenHtml = hasChildren ? renderMainMenuTree(item.children, level + 1, storage, itemClass, itemId) : '';
    
    return `
      <div class="menu-tree-item" 
           draggable="true"
           data-main-menu-item='${JSON.stringify(item)}' 
           data-main-menu-level="${level}" 
           data-menu-id="${itemId}"
           data-item-class="${itemClass}"
           data-item-level="${level}"
           data-item-index="${index}"
           data-parent-class="${parentClass || ''}"
           data-parent-id="${parentItemId || ''}"
           style="padding-left: ${indentPadding}; margin: 0; cursor: move;"
           ondragstart="handleDragStart(event, '${itemClass}', ${level}, '${parentClass || ''}', ${index})"
           ondragover="handleDragOver(event)"
           ondrop="handleDrop(event, '${itemClass}', ${level}, '${parentClass || ''}', ${index})"
           ondragenter="handleDragEnter(event)"
           ondragleave="handleDragLeave(event)">
        <div class="menu-item-row" style="display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor=''">
          <span class="material-symbols-outlined drag-handle" style="font-size: 18px; cursor: grab; color: rgba(27, 46, 75, 0.4); padding: 2px;" title="Drag to reorder">drag_indicator</span>
          ${expandButton}
          <span class="material-symbols-outlined nx-icon-md" style="color: ${hasChildren ? '#2196F3' : '#666'};">
            ${hasChildren ? 'folder' : (item.type === 'file' ? 'description' : (row?.icon || 'menu'))}
          </span>
          <div style="flex: 1;">
            <span id="${itemClass}" type="text" class="editable" data-min-length="3" name="label" style="font-weight: bold;">
              ${item.label || itemClass}
            </span>
          </div>
        </div>
        <div class="menu-children-wrapper" data-parent-id="${itemId}" style="display:none; margin-left: 2px;">
          ${childrenHtml}
        </div>
      </div>
    `;
  }).join('');
}

export async function konfigurasi(height) {
  const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
  const variabel = storage.main_menu || [];

  let treeHtml = `
    <div class="menu-tree-container" style="padding: 8px;">
      ${renderMainMenuTree(variabel, 0, storage)}
    </div>
  `;


  return {
    title: "Main menu",
    col: "nx-col-12",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted"> Variabel action</small>
  <small class="text-muted align-right">
   <button onclick="upBucketsNav();" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>
    `,
    html: `
     <div style="padding-top:4px">
       ${treeHtml}
     </div>
    `,
  };
}



// Variabel global untuk menyimpan data drag
window._dragData = null;

// Fungsi untuk handle drag start
window.handleDragStart = function(event, itemClass, level, parentId, index) {
  // Stop propagation untuk mencegah parent element juga trigger drag start
  event.stopPropagation();
  
  // Hanya set dragData jika ini adalah element yang benar-benar di-drag (bukan dari event bubbling)
  // Cek apakah event.target adalah element yang memiliki draggable atau anak langsung dari menu-item-row
  const targetElement = event.target;
  const dragElement = event.currentTarget;
  
  // Pastikan kita hanya handle drag dari element yang benar
  if (!dragElement.classList.contains('menu-tree-item')) {
    return;
  }
  
  window._dragData = {
    itemClass: itemClass,
    level: parseInt(level) || 0,
    parentId: parentId || '',
    index: parseInt(index) || 0,
    element: dragElement
  };
  dragElement.style.opacity = '0.5';
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', dragElement.outerHTML);
};

// Fungsi untuk handle drag over
window.handleDragOver = function(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  return false;
};

// Fungsi untuk handle drag enter
window.handleDragEnter = function(event) {
  if (window._dragData && event.currentTarget !== window._dragData.element) {
    event.currentTarget.style.backgroundColor = '#e3f2fd';
    event.currentTarget.style.borderTop = '2px solid #2196F3';
  }
};

// Fungsi untuk handle drag leave
window.handleDragLeave = function(event) {
  event.currentTarget.style.backgroundColor = '';
  event.currentTarget.style.borderTop = '';
};

// Fungsi untuk handle drop
window.handleDrop = async function(event, targetClass, targetLevel, targetParentId, targetIndex) {
  event.preventDefault();
  event.stopPropagation();
  
  // Reset visual feedback
  event.currentTarget.style.backgroundColor = '';
  event.currentTarget.style.borderTop = '';
  
  if (!window._dragData) {
    return;
  }
  
  const dragData = window._dragData;
  const parsedTargetLevel = parseInt(targetLevel) || 0;
  
  // Cegah drop pada diri sendiri atau pada children dari item yang di-drag
  if (dragData.itemClass === targetClass) {
    window._dragData = null;
    // Reset opacity
    document.querySelectorAll('.menu-tree-item').forEach(el => {
      el.style.opacity = '';
      el.style.backgroundColor = '';
      el.style.borderTop = '';
    });
    return;
  }
  
  try {
    const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    
    // Fungsi rekursif untuk mencari item berdasarkan class/id
    function findItemInTree(items, targetClass) {
      for (const item of items) {
        if (item.class === targetClass || item.id === targetClass) {
          return item;
        }
        if (item.children && Array.isArray(item.children)) {
          const found = findItemInTree(item.children, targetClass);
          if (found) return found;
        }
      }
      return null;
    }
    
    // Cek sederhana: hanya cegah jika target adalah diri sendiri
    if (dragData.itemClass === targetClass) {
      window._dragData = null;
      document.querySelectorAll('.menu-tree-item').forEach(el => {
        el.style.opacity = '';
        el.style.backgroundColor = '';
        el.style.borderTop = '';
      });
      return;
    }
    
    // Fungsi rekursif untuk mencari dan menghapus item dari tree
    function removeItemFromTree(items, targetClass) {
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].class === targetClass || items[i].id === targetClass) {
          return items.splice(i, 1)[0];
        }
        if (items[i].children && Array.isArray(items[i].children)) {
          const removed = removeItemFromTree(items[i].children, targetClass);
          if (removed) return removed;
        }
      }
      return null;
    }
    
    // Fungsi rekursif untuk mencari item target dan mendapatkan parent array serta index-nya
    // Target adalah item itu sendiri, kita perlu tahu di array mana dan index berapa
    function findTargetItemAndParent(items, targetClass, targetLevel, targetParentId, currentLevel = 0) {
      // Root level - cari langsung di items
      if (targetLevel === 0 && (targetParentId === '' || targetParentId === null || targetParentId === 'null')) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].class === targetClass || items[i].id === targetClass) {
            return { array: items, index: i, targetItem: items[i] };
          }
        }
      }
      
      // Nested level - cari parent dulu, lalu cari target di children parent
      if (targetLevel > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemId = item.class || item.id;
          
          // Jika ini adalah parent dari target (parent berada di level targetLevel - 1)
          if (targetParentId && itemId === targetParentId) {
            if (!item.children || !Array.isArray(item.children)) {
              item.children = [];
            }
            // Cari target di children array
            for (let j = 0; j < item.children.length; j++) {
              if (item.children[j].class === targetClass || item.children[j].id === targetClass) {
                return { array: item.children, index: j, targetItem: item.children[j] };
              }
            }
          }
          
          // Rekursif di children untuk mencari parent lebih dalam
          if (item.children && Array.isArray(item.children)) {
            const found = findTargetItemAndParent(item.children, targetClass, targetLevel, targetParentId, currentLevel + 1);
            if (found) {
              return found;
            }
          }
        }
      }
      
      return null;
    }
    
    // Cek apakah target akan ikut terhapus jika kita hapus dragged item
    // Caranya: cek apakah target adalah descendant dari dragged item
    function isTargetDescendantOfDragged(draggedItemClass, targetClass, items) {
      const draggedItem = findItemInTree(items, draggedItemClass);
      if (!draggedItem || !draggedItem.children || !Array.isArray(draggedItem.children)) {
        return false;
      }
      
      function checkDescendant(parent, target) {
        if (!parent.children || !Array.isArray(parent.children)) {
          return false;
        }
        for (const child of parent.children) {
          if (child.class === target || child.id === target) {
            return true;
          }
          if (checkDescendant(child, target)) {
            return true;
          }
        }
        return false;
      }
      
      return checkDescendant(draggedItem, targetClass);
    }
    
    const targetWillBeRemoved = isTargetDescendantOfDragged(dragData.itemClass, targetClass, storage.main_menu);
    
    // Hapus item yang di-drag dari posisi asalnya TERLEBIH DAHULU
    const removedItem = removeItemFromTree(storage.main_menu, dragData.itemClass);
    
    if (!removedItem) {
      window._dragData = null;
      // Reset opacity
      document.querySelectorAll('.menu-tree-item').forEach(el => {
        el.style.opacity = '';
        el.style.backgroundColor = '';
        el.style.borderTop = '';
      });
      return;
    }
    
    // CARI TARGET SETELAH MENGHAPUS ITEM
    let targetInfo;
    
    if (targetWillBeRemoved) {
      // Target ada di dalam removedItem
      // Kita perlu mencari parent dari target di dalam removedItem
      // Kemudian kita insert removedItem ke storage di posisi yang sesuai dengan parent target
      
      // Cari parent dari target di dalam removedItem
      function findParentArrayInRemovedItem(item, parentId, currentLevel = 0) {
        if (!parentId || parentId === '') {
          // Root level - jika removedItem adalah root level, return children-nya
          if (currentLevel === 0 && item.children) {
            return { array: item.children, found: true, item: item };
          }
          return { array: null, found: false, item: null };
        }
        
        // Cari parent di children
        if (item.children && Array.isArray(item.children)) {
          for (const child of item.children) {
            if ((child.class || child.id) === parentId) {
              if (!child.children || !Array.isArray(child.children)) {
                child.children = [];
              }
              return { array: child.children, found: true, item: child };
            }
            // Rekursif
            const found = findParentArrayInRemovedItem(child, parentId, currentLevel + 1);
            if (found.found) return found;
          }
        }
        return { array: null, found: false, item: null };
      }
      
      const parentArrayInfo = findParentArrayInRemovedItem(removedItem, targetParentId || '', dragData.level);
      if (parentArrayInfo.found && parentArrayInfo.array) {
        // Cari index target di parent array
        let targetIndex = 0;
        for (let i = 0; i < parentArrayInfo.array.length; i++) {
          if (parentArrayInfo.array[i].class === targetClass || parentArrayInfo.array[i].id === targetClass) {
            targetIndex = i;
            break;
          }
        }
        // targetInfo.array adalah array dari removedItem (children dari parent target)
        // Kita perlu menemukan di storage di mana parent dari targetParentId berada
        // Karena targetParentId ada di dalam removedItem, kita perlu mencari grandparent di storage
        
        // Cari grandparent: parent dari targetParentId di dalam removedItem
        // Kemudian cari grandparent tersebut di storage
        function findGrandparentInRemovedItem(item, targetParentId, currentLevel = 0) {
          if (!item.children || !Array.isArray(item.children)) {
            return null;
          }
          
          for (const child of item.children) {
            // Jika ini adalah parent dari targetParentId
            if (child.children && Array.isArray(child.children)) {
              for (const grandchild of child.children) {
                if ((grandchild.class || grandchild.id) === targetParentId) {
                  return child; // Ini adalah grandparent
                }
              }
            }
            // Rekursif
            const found = findGrandparentInRemovedItem(child, targetParentId, currentLevel + 1);
            if (found) return found;
          }
          return null;
        }
        
        // Cari path dari root ke targetParentId di dalam removedItem
        // Path ini akan membantu kita menemukan di mana removedItem harus dimasukkan
        function findPathToTargetParent(item, targetParentId, path = []) {
          if (!item.children || !Array.isArray(item.children)) {
            return null;
          }
          
          for (const child of item.children) {
            const childId = child.class || child.id;
            const newPath = [...path, childId];
            
            if (childId === targetParentId) {
              return newPath;
            }
            
            if (child.children && Array.isArray(child.children)) {
              const found = findPathToTargetParent(child, targetParentId, newPath);
              if (found) return found;
            }
          }
          return null;
        }
        
        const pathToTargetParent = findPathToTargetParent(removedItem, targetParentId, []);
        
        // Cari di storage item yang masih ada berdasarkan path
        // Jika path adalah [ipkd_xxx, jelajah_xxx], kita cari ipkd_xxx di storage
        // Tapi karena semua item di path ikut terhapus, kita perlu mencari item yang level-nya sesuai
        
        // Solusi sederhana: karena semua item di path ikut terhapus ketika kita hapus root item,
        // kita masukkan removedItem ke root level di posisi yang sesuai dengan targetLevel
        // Atau lebih tepat: kita cari di storage item yang masih ada yang level-nya sama dengan targetLevel - 1
        
        // Untuk kasus ini, karena targetLevel adalah 3 dan dragged item adalah level 0,
        // kita perlu mencari di storage item yang level-nya 2 (targetLevel - 1)
        // Tapi karena semua item ikut terhapus, kita masukkan ke root
        targetInfo = {
          array: storage.main_menu,
          index: storage.main_menu.length // Insert di akhir root level
        };
      } else {
        console.error('Cannot find parent array in removed item!');
        // Restore item
        storage.main_menu.splice(dragData.index, 0, removedItem);
        window._dragData = null;
        return;
      }
    } else {
      // Target tidak ikut terhapus, cari di tree yang tersisa
      targetInfo = findTargetItemAndParent(storage.main_menu, targetClass, parsedTargetLevel, targetParentId || '');
      
      if (!targetInfo) {
        console.error('Target not found after remove! Restoring item...');
        // Kembalikan item ke posisi asal
        if (dragData.level === 0) {
          storage.main_menu.splice(dragData.index, 0, removedItem);
        } else {
          // Cari parent untuk restore
          const parentForRestore = findItemInTree(storage.main_menu, dragData.parentId);
          if (parentForRestore) {
            if (!parentForRestore.children || !Array.isArray(parentForRestore.children)) {
              parentForRestore.children = [];
            }
            parentForRestore.children.splice(dragData.index, 0, removedItem);
          } else {
            storage.main_menu.push(removedItem);
          }
        }
        window._dragData = null;
        // Reset opacity
        document.querySelectorAll('.menu-tree-item').forEach(el => {
          el.style.opacity = '';
          el.style.backgroundColor = '';
          el.style.borderTop = '';
        });
        return;
      }
    }
    
    // Adjust index jika item yang dihapus berada sebelum target (hanya jika di array yang sama)
    function findItemIndexInArray(array, itemClass) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].class === itemClass || array[i].id === itemClass) {
          return i;
        }
      }
      return -1;
    }
    
    // Cek apakah item yang dihapus ada di array yang sama dengan target
    const removedIndex = findItemIndexInArray(targetInfo.array, dragData.itemClass);
    if (removedIndex !== -1 && removedIndex < targetInfo.index) {
      // Jika item yang dihapus ada sebelum target, kurangi index target
      targetInfo.index--;
    }
    
    // Insert item ke posisi baru (sebelum target)
    targetInfo.array.splice(targetInfo.index, 0, removedItem);
    
    // Update action.data dan action.value jika item dipindahkan ke/di root level
    // Update jika: (1) item asal dan target sama-sama di root level, ATAU (2) target di root level (tidak peduli dari level berapa item di-drag)
    if (parsedTargetLevel === 0) {
      // Fungsi untuk mendapatkan semua class dari root level items
      function getRootLevelClasses(items) {
        return items.map(item => item.class || item.id).filter(Boolean);
      }
      
      const rootClasses = getRootLevelClasses(storage.main_menu);
      
      // Update action.data array sesuai urutan baru
      if (storage.action && storage.action.data) {
        // Filter hanya yang ada di root level
        const rootActionData = storage.action.data.filter(classId => rootClasses.includes(classId));
        // Tambahkan yang tidak ada di action.data tapi ada di root level
        rootClasses.forEach(classId => {
          if (!rootActionData.includes(classId)) {
            rootActionData.push(classId);
          }
        });
        // Update urutan sesuai main_menu
        const orderedActionData = [];
        rootClasses.forEach(classId => {
          if (rootActionData.includes(classId)) {
            orderedActionData.push(classId);
          }
        });
        storage.action.data = orderedActionData;
        
        // Update action.value
        storage.action.value = orderedActionData.join('|');
        
        // Update action.metadata jika ada
        if (storage.action.metadata) {
          storage.action.metadata.array = orderedActionData;
          storage.action.metadata.value = storage.action.value;
        }
        
        // Update root level array dan value
        storage.array = orderedActionData;
        storage.value = storage.action.value;
      }
    }
    
    // Simpan perubahan
    await NXUI.ref.mergeData("bucketsStore", "Navigation", storage);
    
    // Reset drag data
    window._dragData = null;
    
    // Refresh tampilan
    await hendelactionNavigationdirhdir(storage);
  } catch (error) {
    console.error('Error in handleDrop:', error);
    window._dragData = null;
  }
  
  // Reset opacity semua elemen
  document.querySelectorAll('.menu-tree-item').forEach(el => {
    el.style.opacity = '';
    el.style.backgroundColor = '';
    el.style.borderTop = '';
  });
};

// Fungsi untuk copy item dari submenu (untuk dipilih)
window.copyFromSubmenu = async function (submenuKey, label, submenuPath) {
  try {
    // HANYA MEMBACA data submenu, TIDAK mengubah sama sekali
    const storage = await window.NXUI.ref.get("bucketsStore", "directory");
    
    // Fungsi rekursif untuk mencari item submenu (HANYA READ, tidak mengubah)
    function findSubmenuItem(items, targetKey) {
      // Buat copy dari items untuk menghindari mutasi
      const itemsCopy = JSON.parse(JSON.stringify(items));
      
      for (const item of itemsCopy) {
        if (item.key === targetKey) {
          return item; // Return copy, bukan reference asli
        }
        if (item.submenu && item.submenu.length > 0) {
          const found = findSubmenuItem(item.submenu, targetKey);
          if (found) return found;
        }
      }
      return null;
    }
    
    // Deep copy dari seluruh storage.submenu untuk memastikan tidak ada mutasi
    const submenuCopy = JSON.parse(JSON.stringify(storage.submenu || []));
    const submenuItem = findSubmenuItem(submenuCopy, submenuKey);
    
    if (!submenuItem) {
      return;
    }
    
    // Simpan ke global untuk digunakan saat memilih parent di main_menu
    // Ini adalah deep copy lengkap, TIDAK mengubah struktur data submenu asli
    window._selectedSubmenuItem = {
      key: submenuItem.key,
      label: submenuItem.label,
      folder: submenuItem.folder,
      file: submenuItem.file,
      href: submenuItem.href,
      hrefOrigin: submenuItem.hrefOrigin,
      action: submenuItem.action,
      type: submenuItem.type, // Pertahankan type (file atau folder)
      submenu: submenuItem.submenu, // Deep copy dari submenu
      submenuPath: submenuPath
    };
    
    // PASTIKAN: Tidak ada penyimpanan ke storage "directory"
    // Tidak ada mergeData untuk "directory"
    // Struktur data submenu di storage "directory" TIDAK diubah sama sekali
  } catch (error) {
  }
};


// Fungsi untuk mendapatkan expanded menu IDs dari localStorage
function getExpandedMenuIds() {
  try {
    const expanded = localStorage.getItem('navigation_expanded_menu_ids');
    return expanded ? JSON.parse(expanded) : [];
  } catch (error) {
    return [];
  }
}

// Fungsi untuk menyimpan expanded menu IDs ke localStorage
function saveExpandedMenuIds(expandedIds) {
  try {
    localStorage.setItem('navigation_expanded_menu_ids', JSON.stringify(expandedIds));
  } catch (error) {
  }
}

// Fungsi untuk toggle expand/collapse menu tree
window.toggleMenuTree = function(itemId) {
  const childrenWrapper = document.querySelector(`.menu-children-wrapper[data-parent-id="${itemId}"]`);
  const icon = document.getElementById(`icon-${itemId}`);
  
  if (childrenWrapper && icon) {
    const isExpanded = childrenWrapper.style.display !== 'none';
    const expandedIds = getExpandedMenuIds();
    
    if (isExpanded) {
      // Collapse
      childrenWrapper.style.display = 'none';
      icon.textContent = 'chevron_right';
      icon.style.transform = 'rotate(0deg)';
      
      // Hapus dari expanded IDs
      const index = expandedIds.indexOf(itemId);
      if (index > -1) {
        expandedIds.splice(index, 1);
        saveExpandedMenuIds(expandedIds);
      }
    } else {
      // Expand
      childrenWrapper.style.display = 'block';
      icon.textContent = 'expand_more';
      icon.style.transform = 'rotate(0deg)';
      
      // Tambahkan ke expanded IDs
      if (!expandedIds.includes(itemId)) {
        expandedIds.push(itemId);
        saveExpandedMenuIds(expandedIds);
      }
    }
  }
};

// Fungsi untuk restore expanded menu state setelah render
window.restoreExpandedMenuState = function() {
  const expandedIds = getExpandedMenuIds();
  
  expandedIds.forEach(itemId => {
    const childrenWrapper = document.querySelector(`.menu-children-wrapper[data-parent-id="${itemId}"]`);
    const icon = document.getElementById(`icon-${itemId}`);
    
    if (childrenWrapper && icon) {
      childrenWrapper.style.display = 'block';
      icon.textContent = 'expand_more';
      icon.style.transform = 'rotate(0deg)';
    }
  });
};

// Fungsi untuk inline editing label di main_menu dan children
export async function tabelEdit(store) {
  try {
    const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        // variable adalah ID/class dari item yang diedit
        // fieldName adalah 'label'
        
        // Ambil storage dan update field dengan nilai baru berdasarkan fieldName
        const updatedStorage = await window.NXUI.ref.get("bucketsStore", "Navigation");
        
        // Update di action object jika ada
        if (!updatedStorage.action) {
          updatedStorage.action = {};
        }
        if (!updatedStorage.action[variable]) {
          updatedStorage.action[variable] = {};
        }
        updatedStorage.action[variable][fieldName] = newValue;
        
        // Update handler juga agar sinkron dengan perubahan label
        if (updatedStorage?.handler?.[variable]) {
          updatedStorage.handler[variable] = {
            ...updatedStorage.handler[variable],
            ...updatedStorage.action[variable]
          };
        }
        
        // Update label langsung di main_menu secara rekursif jika fieldName adalah 'label'
        if (fieldName === 'label' && updatedStorage.main_menu) {
          // Fungsi rekursif untuk update label di main_menu dan children
          function updateMainMenuLabel(items, targetClass, newLabel) {
            for (const item of items) {
              // Cek berdasarkan class atau id
              if (item.class === targetClass || item.id === targetClass) {
                item.label = newLabel;
                return true;
              }
              // Jika ada children, cari secara rekursif
              if (item.children && Array.isArray(item.children)) {
                if (updateMainMenuLabel(item.children, targetClass, newLabel)) {
                  return true;
                }
              }
            }
            return false;
          }
          
          updateMainMenuLabel(updatedStorage.main_menu, variable, newValue);
        }
        
        // Simpan menggunakan mergeData
        await NXUI.ref.mergeData("bucketsStore", "Navigation", updatedStorage);
        
        // Perubahan sudah terlihat langsung di DOM karena element sudah di-update oleh NexaField
        // Tidak perlu refresh untuk menghindari flickering
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
  }
}

export async function hendelactionNavigationdirhdir(store) {
  await NXUI.NexaRender.refresh(store, refDirectory, {
    containerSelector: "#hendelactionNavigationdir",
  });
  
  // Restore expanded menu state setelah refresh
  setTimeout(() => {
    if (window.restoreExpandedMenuState) {
      window.restoreExpandedMenuState();
    }
  }, 100);
}

window.upBucketsNav =async function() {
      const  Sdk = await window.NXUI.ref.get("bucketsStore", "Navigation");
       const dataTabel = await NXUI.Storage().models("Office").upNavigation(Sdk);
       console.log('dataTabel:', dataTabel);
};

