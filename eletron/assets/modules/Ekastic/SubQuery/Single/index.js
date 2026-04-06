import { NEXASDK } from "./sdk.js";
import { queAggregatecCustom } from "../Aggregate/index.js";
import { setWhereByCustom } from "../Where/index.js";
import { setArithmeticCustom } from "../Arithmetic/index.js";
import { queryOrderByCustom } from "../Order/index.js";
import { queryGroupByCustom } from "../Group/index.js";

// Utility function untuk mendeteksi dan menerapkan cursor pointer

export async function singleOperasi(data, custom) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

    // Initialize default data structure for single table operations
    if (!storage[custom].aggregateType) storage[custom].aggregateType = [];
    if (!storage[custom].arithmetic) storage.arithmetic = [];
    if (!storage[custom].where) storage[custom].where = { conditions: [] };
    if (!storage[custom].groupBy) storage[custom].groupBy = { fields: [] };
    if (!storage[custom].orderBy) storage[custom].orderBy = { fields: [] };

    NXUI.QUERY = {
      store: Sdk,
      storage: storage,
    };
    let itemHtml = "";
    let checked = "";
    storage.buckets.variablesAlias.forEach((row, index) => {
      const isValue = storage.buckets.allAlias[index];

      // Cek apakah isValue ada dalam array alias yang dipilih
      const aliasArray = storage[custom].alias || [];
      const isChecked = aliasArray.includes(isValue);
      checked = isChecked ? "checked" : "";
      itemHtml += `
        <div class="nx-switch-grid">
          <div class="nx-switch-item mb-10px pl-10px">
            <input class="condition" name="${custom}" type="checkbox" id="public_${custom}${index}" value="${isValue}" ${checked}/>
            <label for="public_${custom}${index}">
              <span class="nx-switch"></span>
              ${row}
            </label>
          </div>
        </div>
      `;
    });
    // Create badges for this function
    const aggregateType = storage[custom].aggregateType?.length || 0;
    const arithmetic = storage[custom].arithmetic?.length || 0;
    const where = storage[custom].where?.conditions?.length || 0;
    const groupBy =storage[custom].groupBy?.fields?.length || 0;
    const orderBy = storage[custom].orderBy?.fields?.length || 0;

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
      title: "Index Tabel " + storage.tableName,
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
                  <button onclick="addAggregatecCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">functions</span>
                     &nbsp;Aggregatec ${badgeAggregate} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="addArithmeticCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">calculate</span>
                     &nbsp;Arithmetic ${badgeArithmetic} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getWhereByCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">filter_list</span>
                     &nbsp;Where ${badgeWhere} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getGroupCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">group_work</span>
                     &nbsp;Group ${badgeGroupBy}
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getOrderByCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">sort</span>
                   &nbsp;Order ${badgeOrderBy} 
                  </button>
                </div>
                 <div class="nx-col-4">
                  <button onclick="subQueryBy('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">total_dissolved_solids</span>
                   &nbsp;Subquery 
                  </button>
                </div>
                 </div>
        <ul class="nx-list-group">
        <li class="nx-list-item d-flex justify-content-between align-items-center">
          <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${storage.tableName}</strong>
        </li>
         </ul>

   <div class="nx-scroll-hidden" style="height:300px; padding-top:20px">
     ${itemHtml}
     </div>
 

         `,
    };
  } catch (error) {
    console.error("❌ Error in singleOperasi:", error);
    return {
      title: "Error",
      col: "nx-col-8",
      footer: `<small class="text-danger">Error: ${error.message}</small>`,
      html: `<div class="alert alert-danger">Failed to initialize single operation: ${error.message}</div>`,
    };
  }
}

export async function renderingCustom(store) {
  // Ambil data storage terbaru
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  // await NXUI.NexaRender.refresh(store, singleOperasi, {
  //   containerSelector: ["#sdksingleOperasi"],
  // });
}

export function aliasOrigin(data, tableName) {
  const result = data.map((item) => {
    const dotted = tableName + "." + item;
    return dotted;
  });

  return result;
}
export function failedOrigin(data, tableName) {
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
  await renderingCustom(storage);
};

export async function cleanup(id) {
  const store = new NXUI.Buckets(id);
  const data = await store.storage();
  // Kirim data lengkap ke server untuk diproses
  const variables = data.variables;
  const tableName = data.tableName;
  const Origin = aliasOrigin(variables, tableName); // Untuk tracking alias yang sudah digunakan
  const failed = failedOrigin(variables, tableName); // Untuk tracking alias yang sudah digunakan
  const aliasResult = alias(Origin); // Untuk tracking alias yang sudah digunakan
  const query = {
    alias: aliasResult,
    failed: failed,
    failedNames: Origin,
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
      variablesAlias: variablesAS(tableName, variables || []),
      analysis: query,
      single: {
        ...query, // Preserve existing join data (key, failed, etc.)
      },
    },
  });

  // await NEXASDK(id);
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
        await renderingCustom(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error renderingCustom form:", error);
  }
}

nx.addAggregatecCustom = async function (id, store,castem) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    return await queAggregatecCustom(id, store,castem);
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
};

nx.addArithmeticCustom = function (id, storage,custom) {
  return setArithmeticCustom(id, storage,custom);
};

nx.getWhereByCustom = function (id, storage,custom) {
  return setWhereByCustom(id, storage,custom);
};
nx.getOrderByCustom = function (id, storage,custom) {
  return queryOrderByCustom(id, storage,custom);
};
nx.getGroupCustom = function (id, storage,custom) {
  return queryGroupByCustom(id, storage,custom);
};
nx.subQueryBy = function (id, storage,custom) {
  // return queryGroupBy(id, storage);
};
