import { NEXASDKJOIN } from "./sdk.js";
import { setOperasiByJoin } from "./index.js";
import { queAggregatec } from "../Aggregate/index.js";
import { setWhereBy } from "../Where/index.js";
import { setArithmetic } from "../Arithmetic/index.js";
import { queryOrderBy } from "../Order/index.js";
import { queryGroupBy } from "../Group/index.js";



// Utility function untuk mendeteksi dan menerapkan cursor pointer

export async function initOperasi(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();


    NXUI.QUERY = {
      store: Sdk,
      storage: storage,
      ...storage.buckets?.join,
    };
    const joinKeyLength = storage.buckets?.join?.key.length || 0;
    const isTypeCross = joinKeyLength > 1;
    const isTypeNested = joinKeyLength <= 1;

    const wrapper = NXUI.createElement(
      "div",
      `    <div id="sdkinitOperasi">
  <div class="nx-card-header">
   <h3 class="bold fs-20px">Operasi Tabel</h3>  
 </div>

  
         <div class="nx-row" style="padding-left:5px;margin-bottom:20px;margin-top:20px"> 
<div class="nx-switch-grid">
  <div class="nx-switch-item">
    <input type="checkbox" id="switchNested" ${
      isTypeNested ? "checked" : ""
    }  />
    <label for="switchNested">
      <span class="nx-switch"></span>
      Type Nested
    </label>
  </div>
  <div class="nx-switch-item">
    <input type="checkbox" id="switchCross" ${isTypeCross ? "checked" : ""}  />
    <label for="switchCross">
      <span class="nx-switch"></span>
      Type Cross
    </label>
  </div>
</div>

         </div>
         <div class="nx-row" style="padding-left:5px"id="nxdrop"> </div>
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
          content: [await Failed(Sdk), await joinFailed(Sdk)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        await tabelEdit();
        // Apply cursor pointer to clickable elements
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export function groupBySuffix(dataArray) {
  const grouped = {};

  // Ensure dataArray is an array
  if (!Array.isArray(dataArray)) {
    return [];
  }

  // Group data by suffix (part after last dash)
  dataArray.forEach((item) => {
    const lastDashIndex = item.lastIndexOf("-");
    if (lastDashIndex !== -1) {
      const suffix = item.substring(lastDashIndex + 1);

      // Skip items with -id and -userid suffixes
      if (suffix === "id" || suffix === "userid") {
        return;
      }

      if (!grouped[suffix]) {
        grouped[suffix] = [];
      }
      grouped[suffix].push(item);
    }
  });

  // Only include suffixes that have more than one item (have pairs)
  const result = [];
  Object.keys(grouped)
    .sort()
    .forEach((suffix) => {
      if (grouped[suffix].length > 1) {
        result.push(...grouped[suffix]);
      }
    });

  return result;
}
// Fungsi untuk menangani perubahan switch (hanya satu yang bisa aktif)

export async function Failed(storage) {
  const data = await storage.storage();

  // Create badges for this function
  const join = (data.buckets?.join?.key?.length || 1) - 1;
  const aggregateType = data.aggregateType?.length || 0;
  const arithmetic = data.arithmetic?.length || 0;
  const where = data.where?.conditions?.length || 0;
  const groupBy = data.groupBy?.fields?.length || 0;
  const orderBy = data.orderBy?.fields?.length || 0;

  const badgeJoin = join
    ? `<span class="nx-badge nx-danger nx-pill">${join}</span>`
    : ``;
  const badgeAggregate = aggregateType
    ? `<span class="nx-badge nx-primary nx-pill">${aggregateType}</span>`
    : ``;
  const badgeArithmetic = arithmetic
    ? `<span class="nx-badge nx-success nx-pill">${arithmetic}</span>`
    : ``;
  const badgeWhere = where
    ? `<span class="nx-badge nx-warning nx-pill">${where}</span>`
    : ``;
  const badgeGroupBy = groupBy
    ? `<span class="nx-badge nx-info nx-pill">${groupBy}</span>`
    : ``;
  const badgeOrderBy = orderBy
    ? `<span class="nx-badge nx-danger nx-pill">${orderBy}</span>`
    : ``;

  const joinFailed = data.buckets?.join?.failed?.length || 0;
  const oprasiFailed = data.buckets?.join?.operasi || {};
  const joinKeys = data.buckets?.join?.key || [];
  const joinedTablesData = [];
  for (const key of joinKeys) {
    const tableData = storage.metaKeyName(key);
    if (tableData) {
      joinedTablesData.push(tableData);
    }
  }

  let tempalatefield = "";
  joinKeys.forEach((row, index) => {
    if (row !== data.tableName) {
      const tabelCalss = row && row.includes("-") ? row.split("-")[0] : row;
      // Validasi untuk mencegah error jika oprasiFailed tidak ada atau bukan object
      const dataOp =
        oprasiFailed && typeof oprasiFailed === "object"
          ? oprasiFailed[tabelCalss]
          : null;
      const iconMap = getIcon(dataOp?.type);
      let configTabel = "";
      if (dataOp) {
        configTabel = `=${dataOp?.type} JOIN ${dataOp?.target} ${dataOp?.condition} ${dataOp?.index}`;
      } else {
        configTabel = "";
      }

      tempalatefield += `
        <li class="nx-list-item d-flex justify-content-between align-items-center">
        <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${row} ${configTabel} </strong>
        
          <a href="javascript:void(0);" onclick="operasiJoin('${data?.id}','${data?.store}');" class="nx-add-join-btn" title="Add Join">
         <span class="material-symbols-outlined nx-icon-lg">${iconMap}</span>
        </a>
        </li>
     `;
    }
  });
  let upgradeSistem = "";

  if ((data.variables?.length || 0) == joinFailed) {
    upgradeSistem = `${joinFailed} Failed`;
  } else {
    upgradeSistem = ``;
  }
  return {
    title: "Index Tabel " + data.tableName,
    col: "nx-col-8",
    footer: `
    <small class="text-muted">Target ${Number(
      joinKeys.length - 1
    )} Tabel</small>

  <small class="text-muted align-right">
   <button onclick="updateFailedJoin('${data?.id}','${
      data?.store
    }');" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>

    `,
    html: `
     <div class="nx-row" style="margin-bottom:2px;margin-top: 16px;">
                <div class="nx-col-3">

                  <button onclick="operasiJoin('${data?.id}','${
      data?.store
    }');"type="button" class="nx-btn-secondary-light full-width">

                     <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">table_chart</span>
                  &nbsp;Join Tabel ${badgeJoin} 
                  </button>
                 </div>
                 <div class="nx-col-3">
                  <button onclick="operasiJoin('${data?.id}','${
      data?.store
    }');;" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">key</span>
                     &nbsp;Alias
                  </button>
                 </div>

         
                 <div class="nx-col-3">
                  <button onclick="addAggregatec('${data?.id}','${
      data?.store
    }');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">functions</span>
                     &nbsp;Aggregatec ${badgeAggregate} 
                  </button>
                 </div>
                 <div class="nx-col-3">
                  <button onclick="addArithmetic('${data?.id}','${
      data?.store
    }');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">calculate</span>
                     &nbsp;Arithmetic ${badgeArithmetic} 
                  </button>
                 </div>
                 <div class="nx-col-3">
                  <button onclick="getWhereBy('${data?.id}','${
      data?.store
    }');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">filter_list</span>
                     &nbspWhere ;${badgeWhere} 
                  </button>
                 </div>

                 <div class="nx-col-3">
                  <button onclick="getGroup('${data?.id}','${
      data?.store
    }');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">group_work</span>
                     &nbspGroup;${badgeGroupBy}
                  </button>
                 </div>
                 <div class="nx-col-3">
                  <button onclick="getOrderBy('${data?.id}','${
      data?.store
    }');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">sort</span>
                   &nbsp;Order ${badgeOrderBy} 
                  </button>
                </div>
                 <div class="nx-col-3">
                  <button onclick="setLastID();" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">link</span>
                    Foreign
                  </button>
                 </div>
                 </div>
        <ul class="nx-list-group">
         ${
           tempalatefield ||
           `
        <li class="nx-list-item d-flex justify-content-between align-items-center">
         
        <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${data.tableName}</strong>
        </li>

         `
         }
         </ul>`,
  };
}

export async function joinFailed(storage) {
  const indexKey = await storage.storage();
  let tempalatefield = "";
  const warangFailid = groupBySuffix(indexKey.buckets?.join?.failed || []);

  if (!indexKey.buckets?.join?.alias) {
    warangFailid.forEach((row, index) => {
      tempalatefield += `
      <li id="${row}" class="nx-list-item d-flex justify-content-between align-items-center">
       <strong>${row}</strong>
      </li>
     `;
    });
    return {
      title: "Field Join " + indexKey.tableName,
      col: "nx-col-4",
      footer: `
   <small class="text-muted">${Math.max(
     0,
     warangFailid.length - 1
   )} Field duplikat AS </small>
    `,
      html: `
    <div class="nx-scroll"style="height:400px; padding-top:10px">
     <div class="nx-alert nx-alert-danger">
       Ditemukan ${Number(
         Math.max(0, warangFailid.length - 1)
       )} field duplikat. Silakan lakukan operasi <b>AS</b> pada field yang sama  agar dapat melanjutkan ke tahap operasi berikutnya. degan megklik tombol Update Bucket
     </div>
    <ul class="nx-list-group">
      ${tempalatefield}
     </ul>
</div>

     `,
    };
  } else {
    (indexKey.buckets?.join?.failed || []).forEach((row, index) => {
      const alis = indexKey.buckets?.join?.alias?.[index];
      tempalatefield += `
      <li id="${row}" class="nx-list-item d-flex justify-content-between align-items-center" style="background-color: #ffffff00;">
            <strong>${alis}</strong>
        <span class="align-right">
        <a href="javascript:void(0);" onclick="deleteFailed('${row}');" class="nx-add-join-btn">
          <span class="material-symbols-outlined nx-icon-xs">delete</span>
        </a>
        </span>

      </li>
     `;
    });

    return {
      title: "Field Join " + indexKey.tableName,
      col: "nx-col-4",
      footer: `
   <small class="text-muted">${
     indexKey.buckets?.join?.failed?.length || 0
   } Field  AS</small>
    `,
      html: `
    <div class="nx-scroll"style="height:400px; padding-top:5px">
     <ul class="nx-list-group">
      ${tempalatefield}
     </ul>
</div>

     `,
    };
  }
}
// 010TDS001

// Function untuk menghapus join

export async function rendering(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, initOperasi, {
    containerSelector: ["#sdkinitOperasi"],
  });
}
/**
 * Mengatur inline editing untuk tabel field dalam form SDK
 * Memungkinkan pengguna untuk mengedit field secara langsung di tabel dengan callback save
 *
 * @param {Object} store - Instance Buckets untuk mengakses dan update data form
 * @returns {Promise<void>}
 */
export async function tabelEdit() {
  try {
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();
    let data = NXUI.QUERY.failed;
    const store = NXUI.QUERY.store;
    const storage = await store.storage();
    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        console.log(variable, newValue);
        const hasil = data.map((item) => (item === variable ? newValue : item));

        await store.upIndex({
          buckets: {
            join: {
              failed: hasil,
            },
          },
        });
        await rendering(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}
nx.deleteFailed = async function (failed) {
  console.log(NXUI.QUERY);
  let data = NXUI.QUERY.failed;
  const store = NXUI.QUERY.store;
  const storage = await store.storage();
  const hasil = data.filter((item) => item !== failed);

  await store.upIndex({
    buckets: {
      join: {
        failed: hasil,
      },
    },
  });
  await cleanup(storage.id);
  await rendering(storage);
};

nx.operasiJoin = async function (id, store) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    return await setOperasiByJoin(id, store);
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
};

nx.addAggregatec = async function (id, store) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    return await queAggregatec(id, store);
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
};

nx.updateFailedJoin = async function (id) {
  await cleanup(id);
};

nx.saveOperasiJoin = async function (modalID, data, store) {
  try {
    const Sdk = new NXUI.Buckets(store.id);
    const tabelIndex =
      data.index && data.index.includes("-")
        ? data.index.split("-")[0]
        : data.index;
    const keyIndex = await Sdk.metaIndex(tabelIndex);
    const tabelTarget =
      data.target && data.target.includes("-")
        ? data.target.split("-")[0]
        : data.target;
    const keyTarget = await Sdk.metaIndex(tabelTarget);

    const aliasIndexData = {
      [tabelTarget]: {
        ...data,
        index: data.index.replace("-", "."),
        target: data.target.replace("-", "."),
        aliasIndex: tabelIndex,
        aliasTarget: tabelTarget,
        keyIndex: keyIndex?.key,
        keyTarget: keyTarget?.key,
      },
    };

    // Get current storage to preserve existing data
    const currentStorage = await Sdk.storage();
    const currentJoin = currentStorage?.buckets?.join || {};

    await Sdk.upIndex({
      buckets: {
        join: {
          ...currentJoin, // Preserve existing join data (key, failed, etc.)
          operasi: {
            ...currentJoin.operasi, // Preserve existing operasi data
            ...aliasIndexData, // Add new operasi data
          },
        },
      },
    });
    NXUI.nexaModal.close(modalID);
    await rendering(currentStorage);
    // Inisialisasi dengan auto mode (tanpa parameter store)
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
};
export async function cleanup(id) {
  const store = new NXUI.Buckets(id);
  const storage = await store.storage();
  const resultAlias = alias(storage.buckets?.join?.failed || []);
  const getAlias = getAliasNames(resultAlias);
  await cleanForm(storage);
  await store.upIndex({
    icon: "server",
    form: generateExtract(getAlias, storage.form,aliasOrigin(storage.buckets?.join?.failed || [])),
    variables: getAlias,
    variablesOrigin: aliasOrigin(storage.buckets?.join?.failed || []),

  });

  const currentJoin = storage?.buckets?.join || {};
  await store.upIndex({
    buckets: {
      variablesAlias:  variablesAS(storage.buckets?.join?.failed || []),
      join: {
        ...currentJoin, // Preserve existing join data (key, failed, etc.)
        alias: resultAlias,
        aliasNames: getAlias,
        failedNames: aliasOrigin(storage.buckets?.join?.failed || []),
      },
    },
  });

  await cleanOperasi(storage);
  await NEXASDKJOIN(id);
 

  await rendering(storage);
}
export function aliasOrigin(data) {
  const aliasCount = {}; // Untuk tracking alias yang sudah digunakan
  const result = data.map((item) => {
    const dotted = item.replace("-", ".");
    return dotted;
  });

  return result;
}

export function variablesAS(data) {
  const aliasCount = {}; // Untuk tracking alias yang sudah digunakan
  const result = data.map((item) => {
    const dotted = item.replace("-", ".");
    let alias = item && item.includes("-") ? item.split("-")[1] : item; // Ambil bagian setelah "-"

    // Cek jika alias sudah ada, buat unik dengan menambah counter
    if (aliasCount[alias]) {
      aliasCount[alias]++;
      alias = `${alias}${aliasCount[alias]}`;
    } else {
      aliasCount[alias] = 1;
    }

    return `${dotted.split(".")[0]}.${alias}`;
  });

  return result;
}

export function alias(data) {
  const aliasCount = {}; // Untuk tracking alias yang sudah digunakan
  const result = data.map((item) => {
    const dotted = item.replace("-", ".");
    let alias = item && item.includes("-") ? item.split("-")[1] : item; // Ambil bagian setelah "-"

    // Cek jika alias sudah ada, buat unik dengan menambah counter
    if (aliasCount[alias]) {
      aliasCount[alias]++;
      alias = `${alias}${aliasCount[alias]}`;
    } else {
      aliasCount[alias] = 1;
    }

    return `${dotted} AS ${alias}`;
  });

  return result;
}

export function getAliasNames(fullResult) {
  const aliases = fullResult.map((item) => {
    // Ambil bagian setelah "AS "
    return item && item.includes(" AS ") ? item.split(" AS ")[1] : item;
  });

  return aliases;
}

export async function cleanForm(data) {
  const Sdk = new NXUI.Buckets(data.id);
  const hasil = Object.fromEntries(
    Object.entries(data.form).filter(([key]) => data.variables.includes(key))
  );
  await NXUI.ref.mergeData(data.store, data.id, {
    form: {
      ...hasil,
    },
  });
}

export async function cleanOperasi(data) {
  const Sdk = new NXUI.Buckets(data.id);
  // Membersihkan data dengan menghapus key kosong ("") dari objek operasi
  const cleanedOperasi = Object.fromEntries(
    Object.entries(data.buckets?.join?.operasi || {}).filter(
      ([key, value]) => key !== ""
    )
  );

  await Sdk.upIndex({
    buckets: {
      join: {
        operasi: cleanedOperasi,
      },
    },
  });
}

export function getIcon(type) {
  const iconMap = {
    join: "join", // Icon untuk field text biasa
    inner: "join_inner", // Icon untuk field hidden
    left: "join_left", // Icon untuk field email
    right: "join_right", // Icon untuk field password
    full: "picture_in_picture_large", // Icon untuk field telepon
    cross: "health_cross", // Icon untuk field URL
    natural: "eco", // Icon untuk field search
  };

  // Kembalikan icon sesuai tipe, atau icon default jika tipe tidak ditemukan
  return iconMap[type] || "join";
}

export function generateExtract(variables, cek,failed) {
  console.log(variables, cek,failed)
  const timestamp = new Date().toISOString(); // waktu sekarang
  const extrak = {};
  variables.forEach((name,index) => {
    // Jika field sudah ada di cek, gunakan data yang sudah ada
     if (cek[name]) {
       extrak[name] = cek[name];
     } else {
      // Jika belum ada, buat field baru dengan default values
      extrak[name] = {
        type: "text",
        icons: "attach_file",
        columnWidth: "nx-col-12",
        name: name,
        label: name,
        failedtabel: failed[index],
        fieldAlias: name,
        placeholder: name,
        validation: 2,
        created_at: timestamp,
        control: "",
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
     }
  });

  return extrak;
}
nx.addArithmetic = function (id, storage) {
  return setArithmetic(id, storage);
};

nx.getWhereBy = function (id, storage) {
  return setWhereBy(id, storage);
};
nx.getOrderBy = function (id, storage) {
  return queryOrderBy(id, storage);
};
nx.getGroup = function (id, storage) {
  return queryGroupBy(id, storage);
};
