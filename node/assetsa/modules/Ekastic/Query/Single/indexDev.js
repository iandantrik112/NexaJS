import { initStorage } from "../storage.js";
import { NEXASDK } from "./sdk.js";
import { queAggregatec } from "../Aggregate/index.js";
import { setWhereBy } from "../Where/index.js";
import { setArithmetic } from "../Arithmetic/index.js";
import { queryOrderBy } from "../Order/index.js";
import { queryGroupBy } from "../Group/index.js";

// Utility function untuk mendeteksi dan menerapkan cursor pointer

export async function singleOperasi(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

    // Initialize default data structure for single table operations
    if (!storage.aggregateType) storage.aggregateType = [];
    if (!storage.arithmetic) storage.arithmetic = [];
    if (!storage.where) storage.where = { conditions: [] };
    if (!storage.groupBy) storage.groupBy = { fields: [] };
    if (!storage.orderBy) storage.orderBy = { fields: [] };

    NXUI.QUERY = {
      store: Sdk,
      storage: storage,
    };

    const wrapper = NXUI.createElement(
      "div",
      `    <div id="sdksingleOperasi">

  <div class="nx-card-header">
   <h3 class="bold fs-20px">Operasi Tabelaaaaaaaaaaaaaaaaa</h3>  
 </div>

  
         <div class="nx-row" style="padding-left:5px;margin-bottom:20px;margin-top:20px"> 
<div class="nx-switch-grid">
  <div class="nx-switch-item">
    <input type="checkbox" id="switchNested" checked />
    <label for="switchNested">
      <span class="nx-switch"></span>
      Type Nested
    </label>
  </div>
  <div class="nx-switch-item">
    <input type="checkbox" id="switchCross"/>
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
          content: [await setQuery(Sdk), await Konfigurasi(Sdk)],
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

export async function setQuery(storage) {
  console.log('label:', storage);
  const data = await storage.storage();
  const mos=await initStorage(data);
  console.log(mos);

  // Create badges for this function
  const aggregateType = data.aggregateType?.length || 0;
  const arithmetic = data.arithmetic?.length || 0;
  const where = data.where?.conditions?.length || 0;
  const groupBy = data.groupBy?.fields?.length || 0;
  const orderBy = data.orderBy?.fields?.length || 0;

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
    title: "Index Tabel 1111111111" + data.tableName,
    col: "nx-col-8",
    footer: `
    <small class="text-muted">Single Table Operation</small>


  <small class="text-muted align-right">
   <button onclick="updateBucket('${data?.id}');" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>
    `,
    html: `

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
                   &nbsp;Subquery 
                  </button>
                </div>
                 </div>
        <ul class="nx-list-group">
        <li class="nx-list-item d-flex justify-content-between align-items-center">
          <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${data.tableName}</strong>
        </li>
         </ul>`,
  };
}

export async function Konfigurasi(data) {
  return {
    title: "Konfigurasi Table Operation",
    col: "nx-col-4",
    footer: `        
     <small>
       <strong>💡 Tips:</strong> Gunakan tombol operasi untuk membangun query database yang kompleks.<br>
       <strong>🔄 Update:</strong> Klik "Update Bucket" untuk menerapkan semua konfigurasi query.
     </small>`,
    html: `
     <div class="nx-scroll-hidden" style="height:300px; padding-top:4px">
      <div class="nx-card-content p-10px">
        <div class="nx-step-guide">
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>1.Pilih Type Query</strong>
              <p class="mb-1">Aktifkan "Type Nested" untuk query bersarang atau "Type Cross" untuk query silang.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>2.Konfigurasi Aggregate</strong>
              <p class="mb-1">Klik tombol "Aggregatec" untuk menambahkan fungsi agregasi (SUM, COUNT, AVG, dll).</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>3.Set Arithmetic</strong>
              <p class="mb-1">Klik tombol "Arithmetic" untuk menambahkan operasi matematika pada field.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>4.Konfigurasi Where</strong>
              <p class="mb-1">Klik tombol "Where" untuk menambahkan kondisi filter pada query.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>5.Set Group By</strong>
              <p class="mb-1">Klik tombol "Group" untuk mengelompokkan data berdasarkan field tertentu.</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>6.Konfigurasi Order By</strong>
              <p class="mb-1">Klik tombol "Order" untuk mengurutkan hasil query (ASC/DESC).</p>
            </div>
          </div>
          
          <div class="nx-step mb-1">
            <div class="nx-step-content">
              <strong>7.Update Bucket</strong>
              <p class="mb-1">Klik "Update Bucket" untuk menerapkan semua konfigurasi dan generate query SQL.</p>
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
  await NXUI.NexaRender.refresh(store, singleOperasi, {
    containerSelector: ["#sdksingleOperasi"],
  });
}

export function aliasOrigin(data, tableName) {
  const result = data.map((item) => {
    const dotted = tableName + "." + item;
    return dotted;
  });

  return result;
}
export function setQueryOrigin(data, tableName) {
  const result = data.map((item) => {
    const dotted = tableName + "-" + item;
    return dotted;
  });

  return result;
}
export function variablesAS(tableName, data) {
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

    return `${tableName}.${alias}`;
  });

  return result;
}
export function alias(data) {
  const aliasCount = {}; // Untuk tracking alias yang sudah digunakan
  const result = data.map((item) => {
    // Extract the field name after the last dot (e.g., "Exsampel.nama" -> "nama")
    let alias = item.split(".").pop();

    // Cek jika alias sudah ada, buat unik dengan menambah counter
    if (aliasCount[alias]) {
      aliasCount[alias]++;
      alias = `${alias}${aliasCount[alias]}`;
    } else {
      aliasCount[alias] = 1;
    }

    return `${item} AS ${alias}`;
  });

  return result;
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
  // Kirim data lengkap ke server untuk diproses
  const variables = data.variables;
  const tableName = data.tableName;
  const Origin = aliasOrigin(variables, tableName); // Untuk tracking alias yang sudah digunakan
  const setQuery = setQueryOrigin(variables, tableName); // Untuk tracking alias yang sudah digunakan
  const aliasResult = alias(Origin); // Untuk tracking alias yang sudah digunakan
  const query = {
    alias: aliasResult,
    setQuery: setQuery,
    setQueryNames: Origin,
    aliasNames: variables,
    key: [tableName],
    operasi: {
      [tableName]: {
        type: "single",
        index: "",
        aliasIndex: tableName,
        keyIndex: data.key,
        target: "",
        condition: "",
        aliasTarget: "",
        keyTarget: "",
      },
    },
  };

  await store.upIndex({
    type: "single",
    variablesOrigin: Origin,
    buckets: {
      allAlias: aliasResult,
      variablesAlias: variablesAS(tableName, variables || []),
      single: {
        ...query, // Preserve existing join data (key, setQuery, etc.)
      },
    },
  });

  await NEXASDK(id);
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
