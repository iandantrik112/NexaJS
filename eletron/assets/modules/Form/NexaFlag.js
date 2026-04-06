export async function setFlag(
  fieldName,
  placeholder,
  size,
  isFloating,
  fieldConfig,
  formSettings,
  setValue
) {
  try {
   const dataform = await NXUI.Storage()
      .models("Office")
      .flag();
    NXUI.dataFlag = dataform.data;
    // Gunakan data dari nexaStore
    const wilayahData = dataform.data || [];
    // Handle setValue - bisa berupa string nama desa atau object data lengkap
    let hasil = null;

    if (typeof setValue === "string") {
      // Jika setValue adalah string, cari berdasarkan nama desa
      if (
        setValue === "Select Kabupaten" ||
        setValue === "Select Kecamatan" ||
        setValue === "Select Desa"
      ) {
        // Jika masih placeholder, tidak ada data yang dipilih
        hasil = null;
      } else {
        // Cari berdasarkan nama desa
        hasil = wilayahData.find(
          (item) => item.nama.toLowerCase() === setValue.toLowerCase()
        );
      }
    } else if (typeof setValue === "object" && setValue !== null) {
      // Jika setValue adalah object (data lengkap), gunakan langsung
      hasil = setValue;
    }

    // Proses data untuk mendapatkan unique values
    const kabupatenList = [...new Set(wilayahData.map((item) => item.nm_kab))];

    // Generate options untuk select
    const generateOptions = (list, placeholder, selectedValue = null) => {
      return (
        `<option value="">${placeholder}</option>` +
        list
          .map((item) => {
            const selected =
              selectedValue && item === selectedValue ? " selected" : "";
            return `<option value="${item}"${selected}>${item}</option>`;
          })
          .join("")
      );
    };

    // Jika fieldName adalah 'kecamatan', tampilkan hanya Kabupaten dan Kecamatan
    if (fieldName == "kecamatan") {
      // Generate kecamatan options based on selected kabupaten
      const kecamatanList = hasil
        ? [
            ...new Set(
              wilayahData
                .filter((item) => item.nm_kab === hasil.nm_kab)
                .map((item) => item.nm_kec)
            ),
          ]
        : [];

      return `<div class="nx-row">
        <div class="nx-col-6">
          <div class="form-nexa-group form-nexa-select-icon">
            <select class="form-nexa-control flag-kabupaten-select" onchange="window.filterKecamatan(this.value)">
              ${generateOptions(
                kabupatenList,
                "Select Kabupaten",
                hasil ? hasil.nm_kab : null
              )}
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kabupaten</label>
          </div>
        </div>
        <div class="nx-col-6">
          <div class="form-nexa-group form-nexa-select-icon">
            <select name="kecamatan" class="form-nexa-control flag-kecamatan-select" id="kecamatan-select">
              ${generateOptions(
                kecamatanList,
                "Select Kecamatan",
                hasil ? hasil.nm_kec : null
              )}
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kecamatan</label>
          </div>
        </div>

      </div>
       `;
    } else {
      // Untuk fieldName lainnya, tampilkan Kabupaten, Kecamatan, dan Desa
      // Generate kecamatan and desa options based on selected values
      const kecamatanList = hasil
        ? [
            ...new Set(
              wilayahData
                .filter((item) => item.nm_kab === hasil.nm_kab)
                .map((item) => item.nm_kec)
            ),
          ]
        : [];
      const desaList = hasil
        ? [
            ...new Set(
              wilayahData
                .filter((item) => item.nm_kec === hasil.nm_kec)
                .map((item) => item.nama)
            ),
          ]
        : [];

      return `<div class="nx-row">
        <div class="nx-col-4">
          <div class="form-nexa-group form-nexa-select-icon">
            <select class="form-nexa-control flag-kabupaten-select" onchange="window.filterKecamatan(this.value)">
              ${generateOptions(
                kabupatenList,
                "Select Kabupaten",
                hasil ? hasil.nm_kab : null
              )}
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kabupaten</label>
          </div>
        </div>
        <div class="nx-col-4">
          <div class="form-nexa-group form-nexa-select-icon">
            <select name="kecamatan" class="form-nexa-control flag-kecamatan-select" id="kecamatan-select" onchange="window.filterKecamatanDesa(this.value)">
              ${generateOptions(
                kecamatanList,
                "Select Kecamatan",
                hasil ? hasil.nm_kec : null
              )}
            </select>
            <i class="material-symbols-outlined">public</i>
            <label>Kecamatan</label>
          </div>
        </div>
        <div class="nx-col-4">
          <div class="form-nexa-group form-nexa-select-icon">
            <select name="desa" class="form-nexa-control flag-desa-select" id="desa-select">
              ${generateOptions(
                desaList,
                "Select Desa",
                hasil ? hasil.nama : null
              )}
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
window.filterKecamatanDesa = function (kecamatan) {
  try {
    let wilayahData = NXUI.dataFlag;
    if (!wilayahData || !Array.isArray(wilayahData)) {
      console.warn('Flag data not available');
      return;
    }
    
    const desaSelect = document.getElementById("desa-select");
    if (!desaSelect) {
      console.warn('Desa select element not found');
      return;
    }
    
    // Prevent Select2 conflicts - destroy if exists
    if (window.$ && window.$.fn.select2 && $(desaSelect).hasClass('select2-hidden-accessible')) {
      $(desaSelect).select2('destroy');
    }
    
    // Clear existing options except the first one (placeholder)
    desaSelect.innerHTML = '<option value="">Select Desa</option>';
    
    const filteredDesa = [
      ...new Set(
        wilayahData
          .filter((item) => item.nm_kec === kecamatan)
          .map((item) => item.nama)
      ),
    ];
    
    filteredDesa.forEach((desa) => {
      const option = document.createElement("option");
      option.value = desa;
      option.textContent = desa;
      desaSelect.appendChild(option);
    });
    
    // Re-initialize Select2 if needed
    setTimeout(() => {
      if (window.NXUI && window.NXUI.initSelect2 && desaSelect.classList.contains('nexa-floating-select')) {
        try {
          window.NXUI.initSelect2(`#${desaSelect.id}`, {
            placeholder: "Select Desa",
            allowClear: true,
            width: "100%"
          });
        } catch (e) {
          console.warn('Select2 initialization failed:', e);
        }
      }
    }, 100);
    
  } catch (error) {
    console.error('Error in filterKecamatanDesa:', error);
  }
};

window.filterKecamatan = function (kabupaten) {
  try {
    let wilayahData = NXUI.dataFlag;
    if (!wilayahData || !Array.isArray(wilayahData)) {
      console.warn('Flag data not available');
      return;
    }
    
    const kecamatanSelect = document.getElementById("kecamatan-select");
    const desaSelect = document.getElementById("desa-select");
    
    if (!kecamatanSelect) {
      console.warn('Kecamatan select element not found');
      return;
    }

    // Prevent Select2 conflicts - destroy if exists
    if (window.$ && window.$.fn.select2) {
      if ($(kecamatanSelect).hasClass('select2-hidden-accessible')) {
        $(kecamatanSelect).select2('destroy');
      }
      if (desaSelect && $(desaSelect).hasClass('select2-hidden-accessible')) {
        $(desaSelect).select2('destroy');
      }
    }

    // Clear existing options except the first one (placeholder)
    kecamatanSelect.innerHTML = '<option value="">Select Kecamatan</option>';
    
    // Also clear desa dropdown when kabupaten changes
    if (desaSelect) {
      desaSelect.innerHTML = '<option value="">Select Desa</option>';
    }

    const filteredKecamatan = [
      ...new Set(
        wilayahData
          .filter((item) => item.nm_kab === kabupaten)
          .map((item) => item.nm_kec)
      ),
    ];
    
    filteredKecamatan.forEach((kecamatan) => {
      const option = document.createElement("option");
      option.value = kecamatan;
      option.textContent = kecamatan;
      kecamatanSelect.appendChild(option);
    });
    
    // Re-initialize Select2 if needed
    setTimeout(() => {
      if (window.NXUI && window.NXUI.initSelect2) {
        try {
          if (kecamatanSelect.classList.contains('nexa-floating-select')) {
            window.NXUI.initSelect2(`#${kecamatanSelect.id}`, {
              placeholder: "Select Kecamatan",
              allowClear: true,
              width: "100%"
            });
          }
          if (desaSelect && desaSelect.classList.contains('nexa-floating-select')) {
            window.NXUI.initSelect2(`#${desaSelect.id}`, {
              placeholder: "Select Desa",
              allowClear: true,
              width: "100%"
            });
          }
        } catch (e) {
          console.warn('Select2 initialization failed:', e);
        }
      }
    }, 100);
    
  } catch (error) {
    console.error('Error in filterKecamatan:', error);
  }
};
