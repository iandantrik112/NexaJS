export async function setFlag(fieldName, placeholder, size, isFloating) {
  try {
    const dataform = await NXUI.Storage()
      .models("Office")
      .tablesRetData(28, "wilayah", 104);
    NXUI.dataFlag=dataform.data
 
    // Gunakan data dari nexaStore
    const wilayahData = dataform.data || [];

    // Proses data untuk mendapatkan unique values
    const kabupatenList = [...new Set(wilayahData.map((item) => item.nm_kab))];

    // Generate options untuk select
    const generateOptions = (list, placeholder) => {
      return (
        `<option value="">${placeholder}</option>` +
        list.map((item) => `<option value="${item}">${item}</option>`).join("")
      );
    };

    // Jika fieldName adalah 'kecamatan', tampilkan hanya Kabupaten dan Kecamatan
    if (fieldName == "kecamatan") {
      return `<div class="nx-row">
        <div class="nx-col-6">
          <div class="form-nexa-group form-nexa-select-icon">
            <select class="form-nexa-control" onchange="nx.filterKecamatan(this.value)">
              ${generateOptions(kabupatenList, "Select Kabupaten")}
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kabupaten</label>
          </div>
        </div>
        <div class="nx-col-6">
          <div class="form-nexa-group form-nexa-select-icon">
            <select name="kecamatan"class="form-nexa-control" id="kecamatan-select">
              <option value="">Select Kecamatan</option>
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kecamatan</label>
          </div>
        </div>

      </div>
       `;
    } else {
      // Untuk fieldName lainnya, tampilkan Kabupaten, Kecamatan, dan Desa
      return `<div class="nx-row">
        <div class="nx-col-4">
          <div class="form-nexa-group form-nexa-select-icon">
            <select class="form-nexa-control" onchange="nx.filterKecamatan(this.value)">
              ${generateOptions(kabupatenList, "Select Kabupaten")}
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kabupaten</label>
          </div>
        </div>
        <div class="nx-col-4">
          <div class="form-nexa-group form-nexa-select-icon">
            <select name="kecamatan" class="form-nexa-control" id="kecamatan-select"onchange="nx.filterKecamatanDesa(this.value)">
              <option value="">Select Kecamatan</option>
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kecamatan</label>
          </div>
        </div>
        <div class="nx-col-4">
          <div class="form-nexa-group form-nexa-select-icon">
            <select name="desa"class="form-nexa-control" id="desa-select">
              <option value="">Select Desa</option>
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Desa</label>
          </div>
        </div>
      </div>
     `;
    }
  } catch (error) {
    console.error("Error getting data from nexaStore:", error);
    // Return fallback HTML jika ada error
    return `<div class="nx-row">
      <div class="nx-col-12">
        <div class="form-nexa-group">
          <label>Error loading data</label>
          <input type="text" class="form-nexa-control" disabled />
        </div>
      </div>
    </div>`;
  }
}

nx.filterKecamatanDesa = function (kecamatan) {
  let wilayahData=NXUI.dataFlag;
  console.log(kecamatan)
  const desaSelect = document.getElementById("desa-select");
   const filteredDesa = [...new Set(
     wilayahData
       .filter(item => item.nm_kec === kecamatan)
       .map(item => item.nama)
   )];
   console.log(filteredDesa)
   filteredDesa.forEach((desa) => {
     const option = document.createElement("option");
     option.value = desa;
     option.textContent = desa;
     desaSelect.appendChild(option);
   });

}
nx.filterKecamatan = function (kabupaten) {
   let wilayahData=NXUI.dataFlag;
   const kecamatanSelect = document.getElementById("kecamatan-select");


   const filteredKecamatan = [...new Set(
     wilayahData
       .filter(item => item.nm_kab === kabupaten)
       .map(item => item.nm_kec)
   )];
   filteredKecamatan.forEach((kecamatan) => {
     const option = document.createElement("option");
     option.value = kecamatan;
     option.textContent = kecamatan;
     kecamatanSelect.appendChild(option);
   });

};

