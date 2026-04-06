// Function to get aggregate type descriptions with dynamic field data
function getAggregateDescription(type, field = "", alias = "") {
  const fieldName = field.split(".").pop() || "field"; // Get field name for display
  const aliasName = alias
    ? alias.split(" AS ")[1]?.trim() || fieldName
    : fieldName;

  const descriptions = {
    COUNT: `Menghitung jumlah baris/record yang memiliki nilai pada ${fieldName}. Hasil: COUNT(${field}) AS ${aliasName}`,
    SUM: `Menjumlahkan semua nilai numerik pada ${fieldName}. Hasil: SUM(${field}) AS ${aliasName}`,
    AVG: `Menghitung rata-rata dari semua nilai numerik pada ${fieldName}. Hasil: AVG(${field}) AS ${aliasName}`,
    MAX: `Mengambil nilai tertinggi/maksimum dari ${fieldName}. Hasil: MAX(${field}) AS ${aliasName}`,
    MIN: `Mengambil nilai terendah/minimum dari ${fieldName}. Hasil: MIN(${field}) AS ${aliasName}`,
    STDDEV: `Menghitung standar deviasi dari nilai-nilai pada ${fieldName}. Hasil: STDDEV(${field}) AS ${aliasName}`,
    VARIANCE: `Menghitung varians dari nilai-nilai pada ${fieldName}. Hasil: VARIANCE(${field}) AS ${aliasName}`,
    FIRST: `Mengambil nilai pertama yang ditemukan pada ${fieldName}. Hasil: FIRST(${field}) AS ${aliasName}`,
    LAST: `Mengambil nilai terakhir yang ditemukan pada ${fieldName}. Hasil: LAST(${field}) AS ${aliasName}`,
  };

  return (
    descriptions[type] ||
    `Fungsi agregat ${type} untuk memproses data pada ${fieldName}. Hasil: ${type}(${field}) AS ${aliasName}`
  );
}

export async function FormAggregate(tabel) {
  try {
    let template = "";

    if (tabel.variablesOrigin && Array.isArray(tabel.variablesOrigin)) {
      tabel.variablesOrigin.forEach((row) => {
        template += `<option value="${row}">${row}</option>`;
      });
    }

    // Pastikan aggregateType selalu array
    const aggregateList = Array.isArray(tabel?.aggregateType)
      ? tabel.aggregateType
      : [];

    // Render daftar aggregateType - hanya tampilkan item yang memiliki field
    let templateField = "";
    let validIndex = 0;
    aggregateList.forEach((row, index) => {
      // Hanya tampilkan jika row.field ada dan tidak kosong
      if (row.field && row.field.trim() !== "") {
        const no = validIndex + 1; // mulai dari 1
        templateField += `
            <li class="nx-list-item" id="orderkey${index}">
              ${no}. ${row.field} ${row.type} 
             
              <a class="pull-right" onclick="nx.eleteOrderID(${index});" href="javascript:void(0);">
                <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
              </a>
               <p class="nx-text-muted">${getAggregateDescription(
                 row.type,
                 row.field,
                 row.alias
               )}</p>
            </li>
          `;
        validIndex++;
      }
    });

    // // Fungsi hapus item aggregateType
    nx.eleteOrderID = async function (id) {
      const index = parseInt(id, 10);
      const filtered = aggregateList.filter((_, i) => i !== index);
      const makeDir = { aggregateType: filtered };
      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang daftar biar nomor & tombol sinkron - hanya tampilkan item yang valid
      const listContainer = NXUI.id("aggregateList");
      if (listContainer) {
        let newTemplate = "";
        let validIndex = 0;
        filtered.forEach((row, newIndex) => {
          // Hanya tampilkan jika row.field ada dan tidak kosong
          if (row.field && row.field.trim() !== "") {
            newTemplate += `
                <li class="nx-list-item" id="orderkey${newIndex}">
                  ${validIndex + 1}. ${row.field} ${row.type}
                 
                  <a class="pull-right" onclick="nx.eleteOrderID(${newIndex});" href="javascript:void(0);">
                    <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
                  </a>
                  <p class="nx-text-muted">${getAggregateDescription(
                    row.type,
                    row.field,
                    row.alias
                  )}</p>
                </li>
              `;
            validIndex++;
          }
        });
        listContainer.innerHTML = newTemplate;
      }
    };

    // // Ambil direction pertama dari aggregateType jika ada, default kosong
    const selectedDirection = aggregateList?.[0]?.type || "";
    return `
        <div class="nx-container">
          <div class="nx-row">
           <div class="nx-col-12"id="SearchOrder"></div>
            <div class="nx-col-8">
              <div class="form-nexa-group">
                <label>Field</label>
              <select class="form-nexa-control"name="field"id="field">
              <option value="">Select Field</option>
              ${template}
            </select>
              </div>
            </div>
            <div class="nx-col-4">
              <div class="form-nexa-group">
                <label>Type</label>
                <select class="form-nexa-control" id="type" name="type">
                  <option value="">Aggregate Function</option>
                  <option value="MAX" ${
                    selectedDirection === "MAX" ? "selected" : ""
                  }>MAX</option>
                  <option value="MIN" ${
                    selectedDirection === "MIN" ? "selected" : ""
                  }>MIN</option>
                  <option value="COUNT" ${
                    selectedDirection === "COUNT" ? "selected" : ""
                  }>COUNT</option>
                  <option value="SUM" ${
                    selectedDirection === "SUM" ? "selected" : ""
                  }>SUM</option>
                  <option value="AVG" ${
                    selectedDirection === "AVG" ? "selected" : ""
                  }>AVG</option>
                  <option value="STDDEV" ${
                    selectedDirection === "STDDEV" ? "selected" : ""
                  }>STDDEV</option>
                  <option value="VARIANCE" ${
                    selectedDirection === "VARIANCE" ? "selected" : ""
                  }>VARIANCE</option>
                  <option value="FIRST" ${
                    selectedDirection === "FIRST" ? "selected" : ""
                  }>FIRST</option>
                  <option value="LAST" ${
                    selectedDirection === "LAST" ? "selected" : ""
                  }>LAST</option>
                </select>
              </div>
            </div>
            <div class="nx-col-12">
              <ul class="nx-list-group" id="aggregateList">
                ${templateField}
              </ul>
            </div>
          </div>
        </div>
      `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading aggregateType form.</div></div>`;
  }
}
