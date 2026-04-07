import { initStorage } from "../storage.js";
import { NEXASDK } from "./sdk.js";
import { queAggregatec } from "../Aggregate/index.js";
import { setWhereBy } from "../Where/index.js";
import { setArithmetic } from "../Arithmetic/index.js";
import { queryOrderBy } from "../Order/index.js";
import { queryGroupBy } from "../Group/index.js";
import { operasiByJoin } from "./join.js";

// Utility function untuk mendeteksi dan menerapkan cursor pointer

/**
 * Get icon based on operation type
 * @param {string} type - Operation type (single, join, etc.)
 * @returns {string} - Material icon name
 */
function getIcon(type) {
  const iconMap = {
    single: "database",
    join: "join_inner",
    left: "join_left", 
    right: "join_right",
    inner: "join_inner",
    outer: "join_full"
  };
  return iconMap[type] || "database";
}

export async function setOperasi(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const dimensi = new NXUI.NexaDimensi();
    const height = dimensi.height("#nexa_app", 210, 'vh',true);
    console.log('label:', height);
    // Initialize default data structure for single table operations
    if (!storage.aggregateType) storage.aggregateType = [];
    if (!storage.arithmetic) storage.arithmetic = [];
    if (!storage.where) storage.where = { conditions: [] };
    if (!storage.groupBy) storage.groupBy = { fields: [] };
    if (!storage.orderBy) storage.orderBy = { fields: [] };
    const joinKeyLength = storage?.buckets?.key?.length || 0;
    const isTypeCross = joinKeyLength > 1;
    const isTypeNested = joinKeyLength <= 1;
    NXUI.QUERY = {
      store: Sdk,
      storage: storage,
    };

    const wrapper = NXUI.createElement(
      "div",
      `    <div id="sdksetOperasi">

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
          content: [await setQuery(Sdk,height), await Konfigurasi(Sdk,height)],
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
    console.error("❌ Manual mode initialization setQuery:", error);
  }
}

// Fungsi untuk menangani perubahan switch (hanya satu yang bisa aktif)

export async function setQuery(storage,height) {
  console.log('label:', storage);
  const data = await storage.storage();
  const mos=await initStorage(data);
  // Create badges for this function
  const aggregateType = data.aggregateType?.length || 0;
  const arithmetic = data.arithmetic?.length || 0;
  const where = data.where?.conditions?.length || 0;
  const groupBy = data.groupBy?.fields?.length || 0;
  const orderBy = data.orderBy?.fields?.length || 0;
  const joinKeys = data.buckets?.key || [];

  let tempalatefield = "";
  // Get operation data from buckets
  const oprasiFailed = data.buckets?.operasi || {};
  
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
  return {
    title: "Index Tabel " + data.tableName,
    id: "nxIndex",
    col: "nx-col-9",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `
    <small class="text-muted">${data.app} Table Operation </small>


  <small class="text-muted align-right">
   <button onclick="updateBucket('${data?.id}');" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>
    `,
    html: `
    ${await initStorage(data)}
     <div class="nx-row" style="margin-bottom:2px;margin-top: 16px;">
                 <div class="nx-col-4">
                  <button onclick="addAggregatec('${data?.id}','${data?.store}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">functions</span>
                     &nbsp;Aggregatec ${badgeAggregate} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="addArithmetic('${data?.id}','${data?.store}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">calculate</span>
                     &nbsp;Arithmetic ${badgeArithmetic} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getWhereBy('${data?.id}','${data?.store}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">filter_list</span>
                     &nbsp;Where ${badgeWhere} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getGroup('${data?.id}','${data?.store}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">group_work</span>
                     &nbsp;Group ${badgeGroupBy}
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getOrderBy('${data?.id}','${data?.store}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">sort</span>
                   &nbsp;Order ${badgeOrderBy} 
                  </button>
                </div>
                 <div class="nx-col-4">
                  <button onclick="subQueryBy('${data?.id}','${data?.store}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">total_dissolved_solids</span>
                   &nbsp;Formula 
                  </button>
                </div>
                 </div>
        <ul class="nx-list-group">
        <li class="nx-list-item d-flex justify-content-between align-items-center" style="width:100%">
          <strong class="pull-right"><span class="material-symbols-outlined nx-icon-md">database</span> ${data.tableName} </strong>
          <span>index </span>
        </li>
         </ul>

       <ul class="nx-list-group">
         ${
           tempalatefield ||
           `
        <li class="nx-list-item d-flex justify-content-between align-items-center">
         
        <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${data.tableName}</strong>
        </li>

         `
         }
         </ul>
      `,
  };
}

export async function Konfigurasi(data,height) {
  return {
    title: "Konfigurasi Table Operation",
    col: "nx-col-3",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `        
     <small>
       <strong>💡 Tips:</strong> Gunakan tombol operasi
     </small>`,
    html: `
     <div style="padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>1.Pilih Storage Type</strong>
              <p class="mb-1">Pilih jenis database storage: <strong>SQL Database</strong> untuk relasional, <strong>IndexedDB</strong> untuk client-side, atau <strong>Firebase</strong> untuk cloud real-time.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>2.Pilih Type Query</strong>
              <p class="mb-1">Aktifkan "Type Nested" untuk query bersarang atau "Type Cross" untuk query silang.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>3.Konfigurasi Aggregate</strong>
              <p class="mb-1">Klik tombol "Aggregatec" untuk menambahkan fungsi agregasi (SUM, COUNT, AVG, dll).</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>4.Set Arithmetic</strong>
              <p class="mb-1">Klik tombol "Arithmetic" untuk menambahkan operasi matematika pada field.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>5.Konfigurasi Where</strong>
              <p class="mb-1">Klik tombol "Where" untuk menambahkan kondisi filter pada query.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>6.Set Group By</strong>
              <p class="mb-1">Klik tombol "Group" untuk mengelompokkan data berdasarkan field tertentu.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>7.Konfigurasi Order By</strong>
              <p class="mb-1">Klik tombol "Order" untuk mengurutkan hasil query (ASC/DESC).</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>8.Update Bucket</strong>
              <p class="mb-1">Klik "Update Bucket" untuk menerapkan semua konfigurasi dan generate query SQL.</p>
            </div>
          </div>
        </div>
        
        <div class="nx-card-content p-10px" style="margin-top: 20px;">
          <h4 class="mb-2">📊 Storage Types</h4>
          <div class="nx-info-box">
            <div class="nx-info-item">
              <span class="material-symbols-outlined nx-icon-sm">storage</span>
              <div>
                <strong>SQL Database</strong>
                <p class="mb-1">Database relasional dengan transaksi ACID, cocok untuk data terstruktur dan kompleks.</p>
              </div>
            </div>
            <div class="nx-info-item">
              <span class="material-symbols-outlined nx-icon-sm">folder_open</span>
              <div>
                <strong>IndexedDB</strong>
                <p class="mb-1">Database client-side dengan kapasitas besar, ideal untuk aplikasi offline.</p>
              </div>
            </div>
            <div class="nx-info-item">
              <span class="material-symbols-outlined nx-icon-sm">cloud</span>
              <div>
                <strong>Firebase</strong>
                <p class="mb-1">Database cloud real-time dengan skalabilitas tinggi untuk aplikasi modern.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    `,
  };
}
export async function rendering(store) {
  // Ambil data storage terbaru
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, setOperasi, {
    containerSelector: ["#sdksetOperasi"],
  });
}


nx.updateBucket = async function (id) {
    const store = NXUI.QUERY.store;
    const storage = await store.storage();
    await cleanup(id);
    await rendering(storage);
};

export async function cleanup(id) {
  const store = new NXUI.Buckets(id);
  const data = await store.storage();
  console.log('buckets:', data.buckets);
  const sqlview = {
      access:"public",
      alias: data.buckets?.allAlias,
      aliasNames: data.buckets?.variables,
      tabelName: data.buckets?.key,
      where: data.where?.alias || false,
      group: data.groupBy?.alias || false,
      order: data.orderBy?.alias || false,
      operasi: data.buckets?.operasi,
      limit: 5,
      offset: 0,
    };
console.log('sqlview:', sqlview);
    await store.upIndex({
      type:data.type,
      priority: 1,
      contentID: data.type + "_" + data.id,
      applications: sqlview || false,

    });
     return await store.upBucket();
     // await NEXASDK(data.id);
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
    const store = NXUI.QUERY.store;
    const storage = await store.storage();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        console.log(variable, newValue);
        // For single table operations, we can handle field updates here
        await rendering(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error rendering form:", error);
  }
}

nx.addAggregatec = async function (id, store) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    return await queAggregatec(id, store);
  } catch (error) {
    console.error("❌ Auto mode initialization setQuery:", error);
  }
};

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
nx.subQueryBy = function (id, storage) {
  // return queryGroupBy(id, storage);
};


nx.operasiJoin = async function (id, store) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    return await operasiByJoin(id, store);
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
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
    const currentJoin = currentStorage?.buckets || {};
      await Sdk.upIndex({
        buckets: {
            operasi: {
              ...currentJoin.operasi, // Preserve existing operasi data
              ...aliasIndexData, // Add new operasi data
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