export async function saveTabel(modalId, data, table) {
  try {
const angka = String(table.key); // pastikan jadi string
const tengah = Math.floor(angka.length / 2);
const verspckg = angka.substring(tengah - 1, tengah + 1);

const safeTabelStore = "nexaStore";
const pckVersioan = "1." + verspckg + ".1";
const lastVersioan = "1." + verspckg + ".1";

console.log({ verspckg, pckVersioan, lastVersioan });
    let ref = NXUI.ref;
    // Convert selectedVariables from string to array
    const processedData = {
      ...data,
      selectedVariables: data.selectedVariables
        ? data.selectedVariables
            .split(",")
            .map((variable) => variable.trim())
            .filter((v) => v)
        : [],
    };

    // Remove search input from final data (not needed for save)
    delete processedData.searchFormVariablesInput;
    let nmTypeLabel=''
    if (processedData.type=='single') {
       nmTypeLabel='Nested'
    } else {
       nmTypeLabel='Cross'

    }

    // TODO: Implement actual save logic here
    // You can now use processedData.selectedVariables as an array
    const safeTableId =
      processedData.tabelCalss
        .toLowerCase()
        .replace(/\s+/g, "_") // ganti spasi jadi underscore
        .replace(/,/g, "") + // hapus koma
      "_" +
      table.original_data_label +
      settoken(table.key, processedData.type);

    const setlabel =
      processedData.tabelCalss
        .replace(/[^a-zA-Z0-9 ]/g, "") // hapus simbol
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()); // kapital awal type
    

      const typeMap = {
        single: "hard-drive",
        join: "server",
      };
    const standardActions = [
      {
        id: safeTableId,
        version:pckVersioan,
        store: safeTabelStore,
        title: setlabel,
        label: "Components",
        icon: "grid", // Feather Icons: settings
        key: `${safeTableId}_settings`, // 🔧 FIX: Unique key untuk setiap submenu
        action: "settings",
        keyid: table.key,
        store: safeTabelStore,
        type: processedData.type,
        modalid: safeTableId + "_modal_settings",
      },
      // {
      //   id: safeTableId,
      //   version:pckVersioan,
      //   store: safeTabelStore,
      //   title: setlabel,
      //   label: "Update",
      //   icon: "sliders", // Feather Icons: edit
      //   key: `${safeTableId}_update`, // 🔧 FIX: Unique key untuk setiap submenu
      //   action: "editTable",
      //   keyid: table.key,
      //   type: processedData.type,
      //   modalid: safeTableId + "_modal_update",
      // },

    ];
  
    // Show success message with array data
    const metadata = {
      app: nmTypeLabel,
      id: safeTableId,
      version:pckVersioan,
      lastversion:pckVersioan,
      store: safeTabelStore,
      label: setlabel,
      className: processedData.tabelCalss,
      key: table.key,
      access: 'public',
      settings:{
          "formPrimaryKey":table.key,
          "formTags": "",
          "model": "Default",
          "formLimit": 10,
          "formOffset":0,
          "size": "",
          "buttontype": "nx-btn-primary",
          "layout": "vertical",
          "spacing": "normal",
          "access": "public",
          "floating": true,
          "validation": true,
          "tablesettings": false,
      },
      buckets:{
          key:[table.original_data_label],
          allAlias: generateAllAlias(processedData.selectedVariables,table.original_data_label), // Menyimpan tabel Alias yang di-join
          failed: generateFailed(processedData.selectedVariables,table.original_data_label), // Menyimpan field variables yang di-join
     
          variables: processedData.selectedVariables,
          variablesAlias:aliasOrigin(processedData.selectedVariables,table.original_data_label),
          operasi: {
            [table.original_data_label]: {
              type: "single",
              index: "",
              aliasIndex: table.original_data_label,
              keyIndex: table.key,
              target: "",
              condition: "",
              aliasTarget: "",
              keyTarget: "",
            },
          },
      },
      tableKey:table.key,
      tableName: table.original_data_label,
      type: processedData.type,
      submenu: standardActions,
      icon: typeMap[processedData.type] || "database", // Feather Icons: database
      modalid: safeTableId + "_modal_index",
      variables: processedData.selectedVariables,
      variablesOrigin:aliasOrigin(processedData.selectedVariables,table.original_data_label),
      form: generateExtract(processedData.selectedVariables,table.original_data_label,table.key)
    };
    
    await ref.set(safeTabelStore, metadata);
    NXUI.nexaModal.close(modalId);

    // 🔄 TRIGGER UI REFRESH: Reload NexaStore data and refresh UI
    if (window.nexaStoreInstance) {
      // Reload stored data
      await window.nexaStoreInstance.loadStoredData();

      // Trigger UI refresh
      if (window.nexaStoreInstance.onDataLoaded) {
        window.nexaStoreInstance.onDataLoaded();
      }
    }
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export function aliasOrigin(data, tableName) {
  const result = data.map((item) => {
    const dotted = tableName + "." + item;
    return dotted;
  });

  return result;
}

export function generateAllAlias(data, tableName) {
  const result = data.map((item) => {
    return `${tableName}.${item} AS ${item}`;
  });

  return result;
}

export function generateFailed(data, tableName) {
  const result = data.map((item) => {
    return `${tableName}-${item}`;
  });

  return result;
}




export function settoken(prefix = "", context = "") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const safeContext = context.replace(/[^a-zA-Z0-9]/g, "_");
  return `_NX_${prefix}_${safeContext}_${timestamp}_${random}`;
}


export function generateExtract(variables,tabel,setKeyTabel) {
  const timestamp = new Date().toISOString(); // waktu sekarang
  const extrak = {};
  variables.forEach(name => {
    extrak[name] = {
      type: "text",
      icons: "attach_file",
      columnWidth: "nx-col-12",
      name: name,
      key: Number(setKeyTabel),
      failedtabel:tabel+"."+name,
      failed: name,
      failedAs: `${tabel}.${name} AS ${name}`, // ✅ Add SQL alias format
      fieldAlias: name,
      placeholder: name,
      validation: "2",
      timestamp: timestamp,
      control:'',
      value: false,
      hidden: false,
      readonly: false,
      tabel: false,
      condition: false,
      modal: false,
      search: false,
      filtering: false,
      inline: false,
      select: false,
    };
  });
  return extrak;
}