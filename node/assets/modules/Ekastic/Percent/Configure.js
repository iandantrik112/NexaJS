export async function ConfigurePercent(date, setData, maxDataset) {
  try {
    const dataform = await NXUI.ref.get(date.store, date.id);
    let tempalatefield = "";
    const storeID = dataform.percent || { label: "", type: "", variables: [] };
    setData.forEach((row, index) => {
      // Skip jika ada nama id dan userid
      if (
        row.toLowerCase().includes("id") ||
        row.toLowerCase().includes("row") ||
        row.toLowerCase().includes("userid")
      ) {
        return;
      }

      // Check if this variable was previously selected
      const isChecked =
        storeID.variables && storeID.variables.includes(row) ? "checked" : "";

      tempalatefield += `
      <div class="nx-col-12">
        <div class="nx-checkbox-grid">
          <div class="nx-checkbox-item mb-5px">
           <input type="checkbox" id="${row}${index}2" name="${row}" value="${row}" ${isChecked}/>
            <label for="${row}${index}2">
              <span class="nx-checkmark"></span>
              ${row}
            </label>
          </div>
        </div>
      </div>
    `;
    });

    return `<div class="nx-row">
  <div class="nx-col-12">
    <div class="form-nexa-group">
      <label>Label</label>
      <input type="text" name="label" class="form-nexa-control" placeholder="Tulis label chart" value="${
        storeID.label || ""
      }" />
    </div>
  </div>


  
  <div class="nx-col-12">
    <div class="form-nexa-group">
      ${tempalatefield}
    </div>
  </div>
</div>`;
  } catch (error) {
    // Error handling
  }
}
nx.saveConfigurePercent = async function (modalid, data, tabel) {
  // Filter out fields that don't have values (empty strings, null, undefined)
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      return value !== null && value !== undefined && value !== "";
    })
  );

  // Transform data: keep label and type separate, put other fields in variables array
  const transformedData = {
    label: data.label || "Percent",
    type: "Bar",
    tableKey:tabel.tableKey,
    variables: Object.keys(filteredData).filter(
      (key) => key !== "label" && key !== "type"
    ),
  };

  const makeDir = {
    percent: transformedData,
  };

  await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

  // Close modal first
  NXUI.nexaModal.close(modalid);

  // Trigger table refresh by dispatching custom event
  const refreshEvent = new CustomEvent("tableConfigUpdated", {
    detail: {
      tableId: tabel.id,
      tableData: transformedData,
      store: tabel.store,
    },
  });
  document.dispatchEvent(refreshEvent);

  // Save only the transformed data
  // Add your save logic here with transformedData
};
