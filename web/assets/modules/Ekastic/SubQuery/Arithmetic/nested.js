// import { metaIndex, metaField, metaJoin } from "../Metadata/Field.js";
export async function nested(tabel,modalID,custom) {
  try {
    let template = "";
    if (tabel.variablesOrigin && Array.isArray(tabel.variablesOrigin)) {
      tabel.variablesOrigin.forEach((row) => {
        template += `<option value="${row}">${row}</option>`;
      });
    }

    // Fungsi hapus item aggregateType
    // Pastikan aggregateType selalu array
    const aggregateList = Array.isArray(tabel[custom]?.aggregateType)
      ? tabel.aggregateType
      : [];

    // Ambil direction pertama dari aggregateType jika ada, default kosong
    const selectedDirection = aggregateList?.[0]?.type || "";

    return `
      <div class="nx-container">
        <div class="nx-row">
         <div class="nx-col-12"id="ComplexArithmeticOrder"></div>
          <div class="nx-col-8">
            <div class="form-nexa-group">
              <label>Field</label>
            <select class="form-nexa-control"name="field"id="fieldComplex">
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
                <option value="COMPLEX">COMPLEX</option>
             
              </select>
            </div>
          </div>
          <div class="nx-col-12">
             <div id="arithmetic-forms-container" class="nx-row"></div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading aggregateType form.</div></div>`;
  }
}
