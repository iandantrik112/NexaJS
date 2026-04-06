import {
  allVersion,
  lastVersion,
  tabelVersion,
} from "../Configuration/version.js";

// Function to get Indonesian date and time
function getIndonesianDateTime() {
  const now = new Date();
  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return now.toLocaleString("id-ID", options);
}

export async function modulesInit(tabel) {
  try {
    const lastVer = await lastVersion();
    const row = await NXUI.ref.get("nexaStore", tabel.id);
    const safeTableId = row.id;
    const setlabel = row.label; // kapital awal type

    let versi = row.lastversion;
    let parts = versi.split(".");
    parts[parts.length - 1] = lastVer.updateVersion.split(".")[2];
    let version = parts.join(".");

    // Function to get version from tabel.submenu based on key
    const getVersionFromSubmenu = (key) => {
      if (tabel.submenu && Array.isArray(tabel.submenu)) {
        const foundItem = tabel.submenu.find(
          (item) => item && item.key === key
        );
        return foundItem ? foundItem.lastversion || foundItem.version : null;
      }
      return null;
    };

    const lastversion = row?.lastversion ?? version; // Store the version value
    const standardActions = [
      {
        id: safeTableId,
        version: "1.0.1",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_settings`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Applications",
        description: "Application settings configurations",
        category: "system",
        priority: 1,
        status: "active",
        permissions: ["read", "write", "admin"],
        icon: "grid", // Feather Icons: settings
        key: `${safeTableId}_settings`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "settings",
        keyid: row.key,
        store: row.store,
        type: row.type,
        modalid: safeTableId + "_modal_settings",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.9",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_transaction`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Query",
        description: "Execute database transactions query",
        category: "database",
        priority: 11,
        icon: "database", // Feather Icons: archive
        key: `${safeTableId}_transaction`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "setQuery",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_transaction",
        created_at: getIndonesianDateTime(),
      },
  {
        id: safeTableId,
        version: "1.0.25",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_subQuery`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "SubQuery",
        description: "Execute database subquery transactions",
        category: "database",
        priority: 29,
        icon: "code", // Feather Icons: code
        key: `${safeTableId}_subQuery`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "setSubQuery",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_subQuery",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.4",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_tabel`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Metadata ",
        description: "View and navigate Metadata  view",
        category: "data",
        priority: 4,
        icon: "table", // Feather Icons: archive
        key: `${safeTableId}_tabel`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewTabelNav",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_tabel",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.2",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_package`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Packages",
        description: "View and data packages management",
        category: "data",
        priority: 2,
        icon: "package", // Feather Icons: edit
        key: `${safeTableId}_package`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewPackage",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_package",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.12",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_sortable`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Sortable",
        description: "Sort and reorder data items interface",
        category: "ui",
        priority: 13,
        icon: "trello", // Feather Icons: trello
        key: `${safeTableId}_sortable`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewSortable",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_sortable",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.3",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_formStuktur`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Form",
        description: "Create and form structures builder",
        category: "ui",
        priority: 3,
        icon: "trello", // Feather Icons: edit
        key: `${safeTableId}_formStuktur`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "formStuktur",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_formStuktur",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.5",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_nestedForm`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Nested",
        description: "Nested form structures and nested form builder",
        category: "ui",
        priority: 4,
        icon: "layers", // Feather Icons: layers
        key: `${safeTableId}_nestedForm`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewNestedForm",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_nestedForm",
        created_at: getIndonesianDateTime(),
      },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_chart`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Chart",
      //   description: "Visualize data with charts graphs",
      //   category: "visualization",
      //   priority: 5,
      //   icon: "pie-chart", // Feather Icons: archive
      //   key: `${safeTableId}_chart`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewChart",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_view_Chart",
      //   created_at: getIndonesianDateTime(),
      // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_count`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Percent",
      //   description: "View percentage count statistics",
      //   category: "analytics",
      //   priority: 6,
      //   icon: "percent", // Feather Icons: archive
      //   key: `${safeTableId}_count`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewCount",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_view_Count",
      //   created_at: getIndonesianDateTime(),
      // },
      {
        id: safeTableId,
        version: "1.0.6",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_Search`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Search",
        description: "Search and filter data management",
        category: "tools",
        priority: 7,
        icon: "search", // Feather Icons: archive
        key: `${safeTableId}_Search`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewSearch",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_view_Search",
        created_at: getIndonesianDateTime(),
      },

      {
          id: safeTableId,
          version: "1.0.7",
          lastversion:
            getVersionFromSubmenu(`${safeTableId}_approval `) || lastversion,
          store: row.store,
          title: setlabel,
          label: "Approval ",
          description: "Approval workflow and review system",
          category: "ui",
          priority: 8,
          icon: "check-circle", // Feather Icons: check-circle
          key: `${safeTableId}_approval`, // 🔧 FIX: Unique key untuk setiap submenu
          action: "viewApproval",
          keyid: row.key,
          type: row.type,
          modalid: safeTableId + "_modal_approval",
          created_at: getIndonesianDateTime(),
        },
      {
        id: safeTableId,
        version: "1.0.8",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_select`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Select",
        description: "Selection components dropdowns ui",
        category: "ui",
        priority: 9,
        icon: "pocket", // Feather Icons: archive
        key: `${safeTableId}_select`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewSelect",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_select",
        created_at: getIndonesianDateTime(),
      },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_mobile`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Android",
      //   description: "Mobile application settings config",
      //   category: "platform",
      //   priority: 10,
      //   icon: "smartphone", // Feather Icons: archive
      //   key: `${safeTableId}_mobile`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewMobile",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_view_mobile",
      //   created_at: getIndonesianDateTime(),
      // },
       {
         id: safeTableId,
         version: "1.0.10",
         lastversion:
           getVersionFromSubmenu(`${safeTableId}_permissionsFailed`) ||
           lastversion,
         store: row.store,
         title: setlabel,
         label: "Failed",
         description: "Failed permissions error handling",
         category: "security",
         priority: 11,
         icon: "tool", // Feather Icons: archive
         key: `${safeTableId}_permissionsFailed`, // 🔧 FIX: Unique key untuk setiap submenu
         action: "permissionsFailed",
         keyid: row.key,
         type: row.type,
         modalid: safeTableId + "_modal_permissionsFailed",
         created_at: getIndonesianDateTime(),
       },

      {
        id: safeTableId,
        version: "1.0.11",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_usersAccses`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Accses",
        description: "User access and permissions control",
        category: "security",
        priority: 12,
        icon: "shield", // Feather Icons: archive
        key: `${safeTableId}_usersAccses`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "usersAccses",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_usersAccses",
        created_at: getIndonesianDateTime(),
      },

       {
         id: safeTableId,
         version: "1.0.13",
         lastversion:
           getVersionFromSubmenu(`${safeTableId}_system`) || lastversion,
         store: row.store,
         title: setlabel,
         label: "System",
         description: "System Buckets management",
         category: "crud",
         priority: 14,
         icon: "briefcase", // Feather Icons: edit
         key: `${safeTableId}_update`, // 🔧 FIX: Unique key untuk setiap submenu
         action: "systemInit",
         keyid: row.key,
         type: row.type,
         modalid: safeTableId + "_modal_system",
         created_at: getIndonesianDateTime(),
       },

        {
          id: safeTableId,
          version: "1.0.14",
          lastversion:getVersionFromSubmenu(`${safeTableId}_foreign`) || lastversion,
          store: row.store,
          title: setlabel,
          label: "Foreign",
          description: "Join crud key Package Records management",
          category: "crud",
          priority: 15,
          icon: "coffee", // Feather Icons: trash-2
          key: `${safeTableId}_foreign`, // 🔧 FIX: Unique key untuk setiap submenu
          keyid: row.key, // 🔧 FIX: Unique key untuk setiap submenu
          action: "foreignTable",
          type: row.type,
          modalid: safeTableId + "_modal_foreign",
          created_at: getIndonesianDateTime(),
        },
      {
        id: safeTableId,
        version: "1.0.16",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_properties`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Properties",
        description: "Information Packages properties info",
        category: "info",
        priority: 16,
        icon: "alert-circle", // Feather Icons: alert-circle
        key: `${safeTableId}_properties`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "infoTable",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_properties",
        created_at: getIndonesianDateTime(),
      },
      // {
      //   id: safeTableId,
      //   version: "1.0.15",
      //   lastversion: getVersionFromSubmenu(`${safeTableId}_upgrade`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Upgrade",
      //   description: "Upgrade Key Packages management",
      //   category: "crud",
      //   priority: 15,
      //   icon: "command", // Feather Icons: edit
      //   key: `${safeTableId}_upgrade`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "keyPackages",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_upgrade",
      //   created_at: getIndonesianDateTime(),
      // },
      {
        id: safeTableId,
        version: "1.0.17",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_upload`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Upload",
        description: "Upload files and documents system",
        category: "tools",
        priority: 17,
        icon: "upload", // Feather Icons: upload
        key: `${safeTableId}_upload`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "uploadFile",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_upload",
        created_at: getIndonesianDateTime(),
      },
       // {
       //   id: safeTableId,
       //   version: "1.0.18",
       //   lastversion:getVersionFromSubmenu(`${safeTableId}_asfailed`) || lastversion,
       //   store: row.store,
       //   title: setlabel,
       //   label: "Failed AS",
       //   description: "Alis Failed Key Packages management",
       //   category: "tools",
       //   priority: 18,
       //   icon: "framer", // Feather Icons: download
       //   key: `${safeTableId}__asfailed`, // 🔧 FIX: Unique key untuk setiap submenu
       //   action: "asfailedData",
       //   keyid: row.key,
       //   type: row.type,
       //   modalid: safeTableId + "_modal_asfailed",
       //   created_at: getIndonesianDateTime(),
       // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_import`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Import",
      //   description: "Import data from external sources",
      //   category: "tools",
      //   priority: 19,
      //   icon: "file-plus", // Feather Icons: file-plus
      //   key: `${safeTableId}_import`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "importData",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_import",
      //   created_at: getIndonesianDateTime(),
      // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_backup`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Backup",
      //   description: "Create data backup and restore sys",
      //   category: "system",
      //   priority: 20,
      //   icon: "save", // Feather Icons: save
      //   key: `${safeTableId}_backup`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "backupData",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_backup",
      //   created_at: getIndonesianDateTime(),
      // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_logs`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Logs",
      //   description: "View system logs activity history",
      //   category: "info",
      //   priority: 21,
      //   icon: "file-text", // Feather Icons: file-text
      //   key: `${safeTableId}_logs`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewLogs",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_logs",
      //   created_at: getIndonesianDateTime(),
      // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_visitor`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Visitor",
      //   description: "Track and manage visitor analytics",
      //   category: "analytics",
      //   priority: 22,
      //   icon: "eye", // Feather Icons: eye
      //   key: `${safeTableId}_visitor`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewVisitor",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_visitor",
      //   created_at: getIndonesianDateTime(),
      // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_aritmatika`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Aritmatika",
      //   description: "Perform mathematical calculations ops",
      //   category: "tools",
      //   priority: 23,
      //   icon: "slack", // Feather Icons: calculator
      //   key: `${safeTableId}_aritmatika`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewAritmatika",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_aritmatika",
      //   created_at: getIndonesianDateTime(),
      // },
       {
          id: safeTableId,
          version: "1.0.19",
          lastversion:getVersionFromSubmenu(`${safeTableId}_slug`) || lastversion,
          store: row.store,
          title: setlabel,
          label: "Slug",
          description: "URL-friendly text representation form generator",
          category: "ui",
          priority: 24,
          icon: "link", // Feather Icons: link
          key: `${safeTableId}_slug`, // 🔧 FIX: Unique key untuk setiap submenu
          action: "viewSlug",
          keyid: row.key,
          type: row.type,
          modalid: safeTableId + "_modal_slug",
          created_at: getIndonesianDateTime(),
        },
       {
         id: safeTableId,
         version: "1.0.20",
         lastversion: getVersionFromSubmenu(`${safeTableId}_keyup`) || lastversion,
         store: row.store,
         title: setlabel,
         label: "Keyup",
         description: "Keyboard event handling capturing target and bubbling",
         category: "ui",
         priority: 25,
         icon: "type", // Feather Icons: type
         key: `${safeTableId}_keyup`, // 🔧 FIX: Unique key untuk setiap submenu
         action: "viewKeyup",
         keyid: row.key,
         type: row.type,
         modalid: safeTableId + "_modal_keyup",
         created_at: getIndonesianDateTime(),
       },

 

      {
        id: safeTableId,
        version: "1.0.23",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_interface`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Interface",
        description: "Antarmuka pengguna yang menjadi titik interaksi",
        category: "interface",
        priority: 28,
        icon: "box", // Feather Icons: filter
        key: `${safeTableId}_interface`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewInterface",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_interface",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.21",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_navigation`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Navigation",
        description: "Navigation menu and routing interface component",
        category: "ui",
        priority: 26,
        icon: "navigation", // Feather Icons: navigation
        key: `${safeTableId}_navigation`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewNavigation",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_navigation",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.22",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_join`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Join Tabel",
        description: "Execute database transactions query",
        category: "join",
        priority: 27,
        icon: "git-pull-request", // Feather Icons: filter
        key: `${safeTableId}_join`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "setQuery",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_join",
        created_at: getIndonesianDateTime(),
      },
    
     {
        id: safeTableId,
        version: "1.0.24",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_delete`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Delete",
        description: "Delete Access Packages management",
        category: "crud",
        priority: 28,
        icon: "trash-2", // Feather Icons: trash-2
        key: `${safeTableId}_delete`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "deleteTable",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_delete",
        created_at: getIndonesianDateTime(),
      },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_tags`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Tags",
      //   description: "Tags management and organization system",
      //   category: "tools",
      //   priority: 30,
      //   icon: "tag", // Feather Icons: tag
      //   key: `${safeTableId}_tags`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewTags",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_tags",
      //   created_at: getIndonesianDateTime(),
      // },
      {
        id: safeTableId,
        version: "1.0.26",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_editor`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Textarea",
        description: "Textarea editor and rich text input component",
        category: "ui",
        priority: 31,
        icon: "align-left", // Feather Icons: align-left
        key: `${safeTableId}_editor`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewEditor",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_editor",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.27",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_dropdown`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Dropdown",
        description: "Dropdown menu selection component interface",
        category: "ui",
        priority: 32,
        icon: "chevron-down", // Feather Icons: chevron-down
        key: `${safeTableId}_dropdown`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewDropdown",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_dropdown",
        created_at: getIndonesianDateTime(),
      },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_maps`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Maps",
      //   description: "Interactive maps and location visualization",
      //   category: "visualization",
      //   priority: 33,
      //   icon: "map", // Feather Icons: map
      //   key: `${safeTableId}_maps`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewMaps",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_maps",
      //   created_at: getIndonesianDateTime(),
      // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_inline`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Inline",
      //   description: "Inline editing and inline form components",
      //   category: "ui",
      //   priority: 34,
      //   icon: "edit-2", // Feather Icons: edit-2
      //   key: `${safeTableId}_inline`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewInline",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_inline",
      //   created_at: getIndonesianDateTime(),
      // },
      {
        id: safeTableId,
        version: "1.0.28",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_operasi`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Operasi",
        description: "Create and manage database table operations",
        category: "database",
        priority: 35,
        icon: "layers", // Feather Icons: layers
        key: `${safeTableId}_operasi`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewOperasi",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_operasi",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.29",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_handler`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Handler",
        description: "Event handler and action management system",
        category: "system",
        priority: 36,
        icon: "zap", // Feather Icons: zap
        key: `${safeTableId}_handler`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewHandler",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_handler",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.30",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_insert`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Insert",
        description: "Insert new data records into database table",
        category: "crud",
        priority: 37,
        icon: "plus", // Feather Icons: plus
        key: `${safeTableId}_insert`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewInsert",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_insert",
        created_at: getIndonesianDateTime(),
      },
        // {
        //   id: safeTableId,
        //   version: version,
        //   lastversion:
        //     getVersionFromSubmenu(`${safeTableId}_modal`) || lastversion,
        //   store: row.store,
        //   title: setlabel,
        //   label: "Modal",
        //   description: "Modal dialog and popup window interface",
        //   category: "ui",
        //   priority: 38,
        //   icon: "maximize-2", // Feather Icons: maximize-2
        //   key: `${safeTableId}_modal`, // 🔧 FIX: Unique key untuk setiap submenu
        //   action: "viewModal",
        //   keyid: row.key,
        //   type: row.type,
        //   modalid: safeTableId + "_modal_modal",
        //   created_at: getIndonesianDateTime(),
        // },
       {
         id: safeTableId,
         version: "1.0.39",
         lastversion:
           getVersionFromSubmenu(`${safeTableId}_avatar`) || lastversion,
         store: row.store,
         title: setlabel,
         label: "Avatar",
         description: "User avatar and profile picture component",
         category: "ui",
         priority: 39,
         icon: "user", // Feather Icons: user
         key: `${safeTableId}_avatar`, // 🔧 FIX: Unique key untuk setiap submenu
         action: "viewAvatar",
         keyid: row.key,
         type: row.type,
         modalid: safeTableId + "_modal_avatar",
         created_at: getIndonesianDateTime(),
       },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_slideshow`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Slideshow",
      //   description: "Image slideshow and carousel component",
      //   category: "visualization",
      //   priority: 40,
      //   icon: "image", // Feather Icons: image
      //   key: `${safeTableId}_slideshow`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewSlideshow",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_slideshow",
      //   created_at: getIndonesianDateTime(),
      // },
      // {
      //   id: safeTableId,
      //   version: version,
      //   lastversion:
      //     getVersionFromSubmenu(`${safeTableId}_wizard`) || lastversion,
      //   store: row.store,
      //   title: setlabel,
      //   label: "Wizard",
      //   description: "Step-by-step wizard and multi-step form component",
      //   category: "ui",
      //   priority: 41,
      //   icon: "layers", // Feather Icons: layers
      //   key: `${safeTableId}_wizard`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "viewWizard",
      //   keyid: row.key,
      //   type: row.type,
      //   modalid: safeTableId + "_modal_wizard",
      //   created_at: getIndonesianDateTime(),
      // },
      {
        id: safeTableId,
        version: "1.0.31",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_detail`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Detail",
        description: "Detail view and information display component",
        category: "data",
        priority: 42,
        icon: "info", // Feather Icons: info
        key: `${safeTableId}_detail`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewDetail",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_detail",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.32",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_action`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Action",
        description: "Action handlers and event management system",
        category: "system",
        priority: 43,
        icon: "play-circle", // Feather Icons: play-circle
        key: `${safeTableId}_action`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewAction",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_action",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.33",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_value`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Value",
        description: "Value management and data value handling system",
        category: "data",
        priority: 44,
        icon: "hash", // Feather Icons: hash
        key: `${safeTableId}_value`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewValue",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_value",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.34",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_restful`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "RESTful",
        description: "RESTful API endpoints and HTTP methods management",
        category: "api",
        priority: 45,
        icon: "server", // Feather Icons: server
        key: `${safeTableId}_restful`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewRestful",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_restful",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.35",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_analysis`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Analysis",
        description: "Data analysis and analytical insights management",
        category: "analytics",
        priority: 46,
        icon: "bar-chart-2", // Feather Icons: bar-chart-2
        key: `${safeTableId}_analysis`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewAnalysis",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_analysis",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.36",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_tabelView`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Tabel View",
        description: "View and display table data in structured format",
        category: "data",
        priority: 47,
        icon: "layout", // Feather Icons: layout
        key: `${safeTableId}_tabelView`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewTabelView",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_tabelView",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.37",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_createTabel`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Create Tabel",
        description: "Create new database table structure and schema",
        category: "database",
        priority: 48,
        icon: "file-plus", // Feather Icons: file-plus
        key: `${safeTableId}_createTabel`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "createTabel",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_createTabel",
        created_at: getIndonesianDateTime(),
      },
      {
        id: safeTableId,
        version: "1.0.38",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_mergeTabel`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Alter Tabel",
        description: "Alter Tabel database tables and combine table structures",
        category: "database",
        priority: 49,
        icon: "git-merge", // Feather Icons: git-merge
        key: `${safeTableId}_mergeTabel`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "mergeTabel",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_mergeTabel",
        created_at: getIndonesianDateTime(),
      },   
      {
        id: safeTableId,
        version: "1.0.40",
        lastversion:
          getVersionFromSubmenu(`${safeTableId}_instansi`) || lastversion,
        store: row.store,
        title: setlabel,
        label: "Instansi",
        description: "Institution management and organization system",
        category: "data",
        priority: 50,
        icon: "home", // Feather Icons: home
        key: `${safeTableId}_instansi`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "viewInstansi",
        keyid: row.key,
        type: row.type,
        modalid: safeTableId + "_modal_instansi",
        created_at: getIndonesianDateTime(),
      },   
    ];

    return standardActions;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}
