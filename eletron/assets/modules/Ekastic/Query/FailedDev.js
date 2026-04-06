
export async function initFailed(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    console.log('buckets:', storage?.buckets);
    const joinKeyLength = storage?.buckets?.join?.key?.length || 0;
    const isTypeCross = joinKeyLength > 1;
    const isTypeNested = joinKeyLength <= 1;
    const wrapper = NXUI.createElement(
      "div",
      `    <div id="sdkinitFailed">
  <div class="nx-card-header">
   <h3 class="bold fs-20px">Join Tabel</h3>  
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

        // Apply cursor pointer to clickable elements
        setTimeout(() => {
          const container = NXUI.id("nxdrop");
          if (container) {
            // autoApplyCursorPointer(container);
          }
        }, 50);
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

// Fungsi untuk menangani perubahan switch (hanya satu yang bisa aktif)

export async function Failed(storage) {
  const data = await storage.storage();

  const joinFailed = data.buckets?.join?.failed?.length || 0;
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
      tempalatefield += `
        <li class="nx-list-item d-flex justify-content-between align-items-center">
         
        <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${row}</strong>
          <a href="javascript:void(0);" onclick="deleteJoin('${row}','${data.id}');" class="nx-add-join-btn" title="Add Join">
          <span class="material-symbols-outlined nx-icon-md">delete</span>
        </a>
        </li>
     `;
    }
  });

  return {
    title: "Index Tabel " + data.tableName,
    col: "nx-col-6",
    footer: `
    <small class="text-muted">Target ${Number(
      joinKeys.length - 1
    )} Tabel</small>

  <small class="text-muted align-right">
  ${joinFailed} Failed
</small>

    `,
    html: `
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
  const data = await storage.metaData();
  let tempalatefield = "";

  // Get existing joined keys untuk filter
  const existingJoinedKeys = indexKey.buckets?.join?.key || [];
  data.forEach((row, index) => {
    // Filter: bukan table sendiri DAN belum di-join
    if (
      indexKey.tableName !== row.label &&
      !existingJoinedKeys.includes(row.label)
    ) {
      tempalatefield += `
      <li id="${indexKey.id}" class="nx-list-item d-flex justify-content-between align-items-center">
         <strong><span class="material-symbols-outlined nx-icon-md">join_left</span> ${row.label}</strong>
        <a href="javascript:void(0);" onclick="addJoin('${row.key}','${indexKey.id}','${indexKey.key}');" class="nx-add-join-btn" title="Add Join">
          <span class="material-symbols-outlined nx-icon-md">add</span>
        </a>
      </li>
     `;
    }
  });

  return {
    title: "Target Join " + indexKey.tableName,
    col: "nx-col-6",
  footer: `<small class="text-muted">${data.length} Tabel</small>`,
    html: `
       <div>
    <ul class="nx-list-group nx-scroll-hidden" style="height:400px; padding-top:4px">
     ${tempalatefield}
     </ul>
     </div>

     `,
  };
}
// 010TDS001
nx.addJoin = async function (id, key, index) {
  try {
    const Sdk = new NXUI.Buckets(key);

    // Get data with error handling
    const data = await Sdk.metaIndexKey(id);
    if (!data) {
      console.error(`❌ addJoin: Failed to get data for id '${id}'`);
      return;
    }

    const storage = await Sdk.storage();
    if (!storage) {
      console.error(`❌ addJoin: Failed to get storage for key '${key}'`);
      return;
    }

    const data2 = await Sdk.metaIndexKey(index);
    if (!data2) {
      console.error(
        `❌ addJoin: Failed to get data2 for storage.key '${storage.key}'`
      );
      return;
    }

    console.log("Storage:", storage);
    console.log("Data:", data);
    console.log("Data2:", data2);

    const label1 = storage.tableName;
    const label2 = data.table_name;
    const variables1 = data2.variables || [];
    const variables2 = data.variables || [];

    // kasih prefix ke masing-masing array
    const prefixed1 = variables1.map((v) => `${label1}-${v}`);
    const prefixed2 = variables2.map((v) => `${label2}-${v}`);

    // gabungkan
    const merged = [...prefixed1, ...prefixed2];
    const mergedTabel = [label1, label2]; // Tabel keys yang di-join

    // Metode yang benar untuk merge data tanpa menghapus yang sudah ada
    const currentBuckets = storage.buckets || {};
    const currentJoin = currentBuckets.join || {};

    // Handle existing data structure
    const existingKeys = currentJoin.key || [];
    const existingFailed = currentJoin.failed || [];

    // Merge keys (hindari duplikasi)
    const existingKeySet = new Set(existingKeys);
    const newKeys = mergedTabel.filter((item) => !existingKeySet.has(item));
    const finalKeys = [...existingKeys, ...newKeys];

    // Merge failed data (hindari duplikasi)
    const existingFailedSet = new Set(existingFailed);
    const newFailedItems = merged.filter(
      (item) => !existingFailedSet.has(item)
    );
    const finalFailed = [...existingFailed, ...newFailedItems];

 console.log({
      app: "Cross",
      type: "join",
      buckets: {
        ...currentBuckets, // Pertahankan buckets lain yang sudah ada
        failed: finalFailed, // Menyimpan field variables yang di-join
        join: {
          key: finalKeys, // Menyimpan tabel keys yang di-join
          failed: finalFailed, // Menyimpan field variables yang di-join
        },
      },
    });


    await Sdk.upIndex({
      app: "Cross",
      type: "join",
      buckets: {
        ...currentBuckets, // Pertahankan buckets lain yang sudah ada
        failed: finalFailed, // Menyimpan field variables yang di-join
        join: {
          key: finalKeys, // Menyimpan tabel keys yang di-join
          failed: finalFailed, // Menyimpan field variables yang di-join
        },
      },
    });

    await rendering(storage);
  } catch (error) {
    console.error("❌ Error in addJoin:", error);
  }
};

// Function untuk menghapus join
nx.deleteJoin = async function (tableKey, bucketKey) {
  try {
    const Sdk = new NXUI.Buckets(bucketKey);
    const storage = await Sdk.storage();

    if (!storage || !storage.buckets || !storage.buckets.join) {
      console.log("No join data to remove");
      return;
    }
    const tableNameToRemove = tableKey; // e.g., "alsintan_per_desa"
    const currentJoin = storage.buckets.join;

    const currentKeys = currentJoin.key || [];
    const currentFailed = currentJoin.failed || [];

    // Remove table key (exact match)
    const updatedKeys = currentKeys.filter((key) => key !== tableNameToRemove);

    // Remove all failed items that start with tableNameToRemove-
    const prefixToRemove = `${tableNameToRemove}-`;
    const updatedFailed = currentFailed.filter(
      (item) => !item.startsWith(prefixToRemove)
    );
    // Tentukan app berdasarkan jumlah keys setelah penghapusan
    // Jika kurang dari 1 (0): "Nested", jika masih lebih dari 1: "Cross"
    const appType = updatedKeys.length <= 1 ? "Nested" : "Cross";
    const sestemType = updatedKeys.length <= 1 ? "form" : "join";

    await Sdk.upIndex({
      app: appType,
      type: sestemType,
      buckets: {
        ...storage.buckets,
        join: {
          key: updatedKeys,
          failed: updatedFailed,
          alias: false,
          aliasNames: false,
        },
      },
    });
    await rendering(storage);
  } catch (error) {
    console.error("❌ Error removing join:", error);
  }
};
/**
 * Fungsi untuk me-refresh/render ulang form SDK setelah ada perubahan
 * Menggunakan NexaRender untuk update tampilan form dengan data terbaru
 *
 * @param {Object} store - Instance Buckets yang berisi data form terbaru
 * @returns {Promise<void>}
 */
export async function rendering(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, initFailed, {
    containerSelector: ["#sdkinitFailed"],
  });
}
