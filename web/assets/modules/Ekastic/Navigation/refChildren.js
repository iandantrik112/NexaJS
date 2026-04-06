
export async function refChildren(data) {
  try {
  	    const  Sdk = await window.NXUI.ref.get("bucketsStore", "Navigation");
        console.log('label:', Sdk);
  const dimensi = new NXUI.NexaDimensi();
  const height = dimensi.height("#nexa_app", 220, 'vh');
    NXUI.FormIndexData = Sdk;
    const wrapper = NXUI.createElement(
      "div",
      `
     <div id="hendelactionNavigation">
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
          content: [await FailedAction(height), await konfigurasi(height)],
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

// Fungsi rekursif untuk render submenu sebagai tree (untuk source)
function renderSubmenuTreeSource(items, level = 0, parentKey = '') {
  if (!items || items.length === 0) {
    return '';
  }
  
  return items.map((item, index) => {
    const itemId = parentKey ? `submenu-${parentKey}-${index}` : `submenu-${index}`;
    const indentPadding = level > 0 ? `${level * 10}px` : '0px';
    const hasChildren = item.submenu && item.submenu.length > 0;
    const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;
    
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
    
    // Render children (default collapsed)
    const childrenHtml = hasChildren ? renderSubmenuTreeSource(item.submenu, level + 1, fullKey) : '';
    
    return `
      <div class="menu-tree-item" data-submenu-key="${item.key}" data-submenu-path="${fullKey}" data-menu-id="${itemId}" style="padding-left: ${indentPadding}; margin: 0;">
        <div class="menu-item-row" style="display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor=''">
          ${expandButton}
          <span class="material-symbols-outlined nx-icon-md" style="color: ${hasChildren ? '#2196F3' : '#666'};">
            ${hasChildren ? 'folder' : 'description'}
          </span>
          <div style="flex: 1;">
            <strong>${item.label || item.key}</strong>
          </div>
          <div>
            <span class="material-symbols-outlined" 
                  onclick="copyFromSubmenu('${item.key}', '${item.label || item.key}', '${fullKey}')"
                  style="font-size: 18px; cursor: pointer; padding: 4px; color: rgba(27, 46, 75, 0.65); transition: opacity 0.2s;"
                  onmouseover="this.style.opacity='0.7'"
                  onmouseout="this.style.opacity='1'"
                  title="Copy dari Submenu">content_copy</span>
          </div>
        </div>
        <div class="menu-children-wrapper" data-parent-id="${itemId}" style="display:none; margin-left: 2px;">
          ${childrenHtml}
        </div>
      </div>
    `;
  }).join('');
}

export async function FailedAction(height) {
  const storage = await window.NXUI.ref.get("bucketsStore", "directory");
  const variabel = storage.submenu || [];
  const jumlahVariabel = variabel.length;

  let treeHtml = `
    <div class="menu-tree-container" style="padding: 8px;">
      ${renderSubmenuTreeSource(variabel)}
    </div>
  `;


  return {
    title: "Submenu (Source)",
    col: "nx-col-6",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted">${jumlahVariabel || "0"} Item submenu</small>`,
    html: `
     <div style="padding-top:4px">
       ${treeHtml}
     </div>
    `,
  };
}

// Fungsi rekursif untuk render submenu sebagai tree
function renderSubmenuTree(items, level = 0, parentKey = '') {
  if (!items || items.length === 0) {
    return '<tr><td colspan="3" class="text-center text-muted">Tidak ada submenu</td></tr>';
  }
  
  return items.map((item, index) => {
    const indentPadding = level > 0 ? `${level * 30}px` : '0px';
    const hasChildren = item.submenu && item.submenu.length > 0;
    const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;
    
    // Visual indicator untuk hierarki (garis vertikal atau panah)
    const hierarchyIndicator = level > 0 ? '<span style="color: #ccc; margin-right: 8px;">├─</span>' : '';
    
    return `
      <tr data-submenu-key="${item.key}" data-submenu-path="${fullKey}" data-submenu-level="${level}">
        <td class="text" style="padding-left: ${indentPadding};">
          ${hierarchyIndicator}
          <span class="material-symbols-outlined nx-icon-md">${hasChildren ? 'folder' : 'description'}</span>
        </td>
        <td style="padding-left: ${indentPadding};">
          <strong>${item.label || item.key}</strong>
          ${hasChildren ? `<span class="badge badge-sm">${item.submenu.length} items</span>` : ''}
        </td>
        <td class="text-center">
          <button onclick="copyFromSubmenu('${item.key}', '${fullKey}')" 
                  class="nx-btn nx-btn-sm nx-btn-primary" 
                  title="Copy dari Submenu">
            <span class="material-symbols-outlined nx-icon-sm">content_copy</span>
          </button>
        </td>
      </tr>
      ${hasChildren ? renderSubmenuTree(item.submenu, level + 1, fullKey) : ''}
    `;
  }).join('');
}

// Fungsi rekursif untuk render main_menu dengan children sebagai tree
function renderMainMenuTree(items, level = 0, storage, parentId = '') {
  if (!items || items.length === 0) {
    return '';
  }
  
  return items.map((item, index) => {
    const itemId = parentId ? `${parentId}-${index}` : `menu-${index}`;
    const indentPadding = level > 0 ? `${level * 10}px` : '0px';
    const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
    const row = storage?.action?.[item.class];
    
    // Cek apakah item adalah file (jika type === 'file', jangan tampilkan icon add)
    const isFile = item.type === 'file';
    const addIcon = isFile ? '' : `
      <span class="material-symbols-outlined" 
            onclick="addChildrenToMainMenu('${item.class || item.id}', '${item.label || item.class}', '${itemId}')"
            style="font-size: 18px; cursor: pointer; padding: 4px; color: rgba(27, 46, 75, 0.65); transition: opacity 0.2s;"
            onmouseover="this.style.opacity='0.7'"
            onmouseout="this.style.opacity='1'"
            title="Tambah Children dari Submenu">add</span>
    `;
    
    // Icon hapus untuk semua item
    const deleteIcon = `
      <span class="material-symbols-outlined" 
            onclick="deleteMainMenuItem('${item.class || item.id}', '${item.label || item.class}')"
            style="font-size: 18px; cursor: pointer; padding: 4px; color: rgba(27, 46, 75, 0.65); transition: opacity 0.2s; margin-left: 2px;"
            onmouseover="this.style.opacity='0.7'"
            onmouseout="this.style.opacity='1'"
            title="Hapus Item">delete</span>
    `;
    
    const actionIcons = `${addIcon}${deleteIcon}`;
    
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
    
    // Render children (default collapsed)
    const childrenHtml = hasChildren ? renderMainMenuTree(item.children, level + 1, storage, itemId) : '';
    
    return `
      <div class="menu-tree-item" data-main-menu-item='${JSON.stringify(item)}' data-main-menu-level="${level}" data-menu-id="${itemId}" style="padding-left: ${indentPadding}; margin: 0;">
        <div class="menu-item-row" style="display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor=''">
          ${expandButton}
          <span class="material-symbols-outlined nx-icon-md" style="color: ${hasChildren ? '#2196F3' : '#666'};">
            ${hasChildren ? 'folder' : (item.type === 'file' ? 'description' : (row?.icon || 'menu'))}
          </span>
          <div style="flex: 1;">
            <span id="${item.class || item.id}" type="text" class="editable" data-min-length="3" name="label" style="font-weight: bold;">
              ${item.label || item.class}
            </span>
          </div>
          <div style="display: flex; align-items: center;">
            ${actionIcons}
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
    col: "nx-col-6",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small class="text-muted"> Variabel action</small>`,
    html: `
     <div style="padding-top:4px">
       ${treeHtml}
     </div>
    `,
  };
}



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

// Fungsi untuk menambahkan children dari submenu ke main_menu
// Sekarang mendukung penambahan di level mana pun (induk atau sub children)
window.addChildrenToMainMenu = async function (mainMenuClass, mainMenuLabel, itemId) {
  try {
    const selectedItem = window._selectedSubmenuItem;
    if (!selectedItem) {
      return;
    }

    const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    
    // Fungsi rekursif untuk mencari item berdasarkan class atau id di seluruh tree
    function findMenuItemRecursive(items, targetClass) {
      for (const item of items) {
        // Cek apakah ini adalah item yang dicari
        if (item.class === targetClass || item.id === targetClass) {
          return item;
        }
        
        // Jika ada children, cari secara rekursif
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          const found = findMenuItemRecursive(item.children, targetClass);
          if (found) {
            return found;
          }
        }
      }
      return null;
    }
    
    // Cari item main_menu yang dipilih (bisa di level mana pun)
    const mainMenuItem = findMenuItemRecursive(storage.main_menu || [], mainMenuClass);
    if (!mainMenuItem) {
      return;
    }

    // Fungsi untuk generate ID unik
    function generateUniqueId(prefix = 'menu') {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `${prefix}_${timestamp}_${random}`;
    }
    
    // Fungsi rekursif untuk mengkonversi submenu item ke format main_menu children
    // Mempertahankan SEMUA properti dari submenu asli, tidak hanya class dan label
    // Hanya membuat copy baru, TIDAK mengubah struktur submenu asli
    // Juga menambahkan entry ke action object untuk bisa diedit dengan tabelEdit
    // PENTING: Children TIDAK ditambahkan ke action.data dan action.value, hanya ke action object
    function convertSubmenuToChildren(submenuItem, actionObject) {
      // Generate ID unik untuk item ini
      const uniqueId = generateUniqueId(submenuItem.key || 'child');
      
      // Buat object baru dengan mempertahankan SEMUA properti dari submenu item
      // Tidak mengubah submenu asli
      const child = {
        class: uniqueId, // Gunakan ID unik sebagai class agar bisa diedit
        label: submenuItem.label,
        // Pertahankan semua properti asli dari submenu
        key: submenuItem.key,
        file: submenuItem.file,
        folder: submenuItem.folder,
        href: submenuItem.href,
        hrefOrigin: submenuItem.hrefOrigin,
        action: submenuItem.action,
        type: submenuItem.type, // Pertahankan type (file atau folder)
        children: false,
        id: uniqueId // Simpan ID untuk referensi
      };
      
      // Tambahkan entry ke action object agar bisa diedit dengan tabelEdit
      // PENTING: TIDAK menambahkan ke action.data dan action.value karena ini bukan action utama
      if (!actionObject[uniqueId]) {
        actionObject[uniqueId] = {
          action: uniqueId,
          label: submenuItem.label || submenuItem.key,
          className: uniqueId,
          class: uniqueId,
          handler: submenuItem.action || '#',
          icon: submenuItem.type === 'folder' ? 'folder' : 'menu',
          children: false,
          // Pertahankan properti lain dari submenu
          key: submenuItem.key,
          file: submenuItem.file,
          folder: submenuItem.folder,
          href: submenuItem.href,
          hrefOrigin: submenuItem.hrefOrigin,
          type: submenuItem.type
        };
        
        // TIDAK menambahkan ke action.data array karena ini adalah children, bukan action utama
      }
      
      // Hapus properti yang undefined/null agar tidak memenuhi object
      Object.keys(child).forEach(key => {
        if (child[key] === undefined || child[key] === null) {
          delete child[key];
        }
      });
      
      // Jika item memiliki submenu, copy semua children-nya juga (deep copy)
      // Ini hanya membuat copy, tidak mengubah submenu asli
      if (submenuItem.submenu && submenuItem.submenu.length > 0) {
        child.children = submenuItem.submenu.map(subItem => 
          convertSubmenuToChildren(subItem, actionObject)
        );
      }
      
      return child;
    }
    
    // Catatan: Fungsi ini hanya membaca dan membuat copy dari submenu
    // Struktur data submenu di storage "directory" TIDAK diubah sama sekali
    
    // Inisialisasi action object jika belum ada
    if (!storage.action) {
      storage.action = {};
    }
    
    // Inisialisasi action.data array jika belum ada
    if (!storage.action.data) {
      storage.action.data = [];
    }
    
    // Inisialisasi children jika belum ada
    if (!mainMenuItem.children || !Array.isArray(mainMenuItem.children)) {
      mainMenuItem.children = [];
    }
    
    // Cek apakah sudah ada di children item ini berdasarkan key asli
    const existingChildIndex = mainMenuItem.children.findIndex(child => {
      // Cek berdasarkan key asli dari submenu
      return child.key === selectedItem.key;
    });
    
    // Buat children baru dengan semua submenu-nya (jika ada)
    // PENTING: Hanya pass action object, TIDAK pass action.data karena children bukan action utama
    const newChild = convertSubmenuToChildren(selectedItem, storage.action);
    
    if (existingChildIndex !== -1) {
      // Item sudah ada, cek apakah perlu di-update
      const existingChild = mainMenuItem.children[existingChildIndex];
      
      // Jika children yang sudah ada hanya boolean true atau belum lengkap, update dengan struktur lengkap
      if (existingChild.children === true || (typeof existingChild.children === 'boolean' && selectedItem.submenu && selectedItem.submenu.length > 0)) {
        // Update children yang sudah ada dengan struktur lengkap
        mainMenuItem.children[existingChildIndex] = newChild;
      } else if (Array.isArray(existingChild.children) && existingChild.children.length > 0) {
        // Sudah ada dan sudah lengkap, skip
        return;
      } else {
        // Update dengan struktur baru
        mainMenuItem.children[existingChildIndex] = newChild;
      }
    } else {
      // Item belum ada, tambahkan baru
      // Tambahkan children
      mainMenuItem.children.push(newChild);
    }
    
    // PENTING: Tidak perlu update manual karena mainMenuItem adalah reference langsung dari storage.main_menu
    // Perubahan sudah otomatis tercermin di storage karena JavaScript menggunakan reference untuk object
    
    // PENTING: JANGAN update action.value dan root level array/value karena children bukan action utama
    // action.data dan action.value hanya berisi action utama yang dibuat melalui input field di refMenu.js
    // Children hanya ada di action object untuk bisa diedit, tapi TIDAK di action.data dan action.value
    
    // PASTIKAN: Simpan perubahan HANYA ke main_menu (Navigation)
    // TIDAK menyimpan ke "directory" (submenu)
    // Struktur data submenu di storage "directory" TIDAK diubah sama sekali
    // Hanya mengubah main_menu di storage "Navigation"
    await NXUI.ref.mergeData("bucketsStore", "Navigation", storage);
    
    // Clear selection
    window._selectedSubmenuItem = null;
    
    // Refresh tampilan
    await renderingrefChildren(storage);
  } catch (error) {
  }
};

// Fungsi untuk menghapus item dari main_menu dan children
window.deleteMainMenuItem = async function(itemClass, itemLabel) {
  try {
    const storage = await window.NXUI.ref.get("bucketsStore", "Navigation");
    
    if (!storage || !storage.main_menu) {
      return;
    }
    
    // Fungsi rekursif untuk menghapus item dari main_menu
    function removeMenuItemFromTree(items, targetClass) {
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        
        // Jika ini adalah item yang dicari
        if (item.class === targetClass || item.id === targetClass) {
          // Hapus item dari array
          items.splice(i, 1);
          return true;
        }
        
        // Jika ada children, cari secara rekursif
        if (item.children && Array.isArray(item.children)) {
          if (removeMenuItemFromTree(item.children, targetClass)) {
            return true;
          }
        }
      }
      return false;
    }
    
    // Fungsi untuk mengumpulkan semua class/id dari children secara rekursif
    function collectAllChildIds(items, targetClass, collectedIds = []) {
      for (const item of items) {
        if (item.class === targetClass || item.id === targetClass) {
          // Jika ini adalah item target, kumpulkan semua children-nya
          if (item.children && Array.isArray(item.children)) {
            collectAllChildIdsRecursive(item.children, collectedIds);
          }
          // Tambahkan ID item target sendiri
          collectedIds.push(item.class || item.id || targetClass);
          return collectedIds;
        }
        if (item.children && Array.isArray(item.children)) {
          collectAllChildIds(item.children, targetClass, collectedIds);
        }
      }
      return collectedIds;
    }
    
    // Fungsi helper untuk mengumpulkan semua ID dari children secara rekursif
    function collectAllChildIdsRecursive(children, collectedIds = []) {
      for (const child of children) {
        if (child.class || child.id) {
          collectedIds.push(child.class || child.id);
        }
        if (child.children && Array.isArray(child.children)) {
          collectAllChildIdsRecursive(child.children, collectedIds);
        }
      }
      return collectedIds;
    }
    
    // Kumpulkan semua ID yang perlu dihapus (item + children)
    const idsToDelete = collectAllChildIds(storage.main_menu, itemClass);
    
    // Hapus dari main_menu
    const removed = removeMenuItemFromTree(storage.main_menu, itemClass);
    
    if (!removed) {
      return;
    }
    
    // Hapus semua item (termasuk children) dari action object
    if (storage.action) {
      idsToDelete.forEach(id => {
        if (storage.action[id]) {
          delete storage.action[id];
        }
      });
    }
    
    // Hapus semua ID dari action.data array
    if (storage.action && storage.action.data) {
      idsToDelete.forEach(id => {
        const dataIndex = storage.action.data.indexOf(id);
        if (dataIndex !== -1) {
          storage.action.data.splice(dataIndex, 1);
        }
      });
    }
    
    // Hapus dari handler juga
    if (storage.handler) {
      idsToDelete.forEach(id => {
        if (storage.handler[id]) {
          delete storage.handler[id];
        }
      });
    }
    
    // Update action.value
    if (storage.action && storage.action.data) {
      storage.action.value = storage.action.data.join('|');
    }
    
    // Update metadata jika ada
    if (storage.action && storage.action.metadata) {
      storage.action.metadata.array = storage.action.data || [];
      storage.action.metadata.value = storage.action.value || '';
    }
    
    // Update root level array dan value
    if (storage.action && storage.action.data) {
      storage.array = storage.action.data;
      storage.value = storage.action.value;
    }
    
    // Simpan perubahan
    await NXUI.ref.mergeData("bucketsStore", "Navigation", storage);
    
    // Refresh tampilan
    await renderingrefChildren(storage);
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

export async function renderingrefChildren(store) {
  await NXUI.NexaRender.refresh(store, refChildren, {
    containerSelector: "#hendelactionNavigation",
  });
  
  // Restore expanded menu state setelah refresh
  setTimeout(() => {
    if (window.restoreExpandedMenuState) {
      window.restoreExpandedMenuState();
    }
  }, 100);
}
