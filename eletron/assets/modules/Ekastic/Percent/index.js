import { NexaTabelChart } from "../../Chart/index.js";
import { nestedAnalysis } from "./nestedAnalysis.js";
import { crossJoinAnalysis } from "./crossJoinAnalysis.js";
import { ConfigurePercent } from "./Configure.js";
import { createTabel } from "./tabel.js";

// Function to convert raw data to table format
function convertToTableFormat(data, config) {
  if (!data || data.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Get the first row to determine columns
  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  // Filter columns based on configuration
  const selectedColumns = config?.variables || columns;
  const filteredColumns = columns.filter((col) =>
    selectedColumns.includes(col)
  );

  // Create labels (column names)
  const labels = filteredColumns;

  // Create datasets (rows of data)
  const datasets = data.map((row, index) => ({
    label: `Row ${index + 1}`,
    data: filteredColumns.map((col) => row[col] || ""),
    fill: false,
    tension: 0.4,
    backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    }, 0.3)`,
    borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  }));

  return {
    labels,
    datasets,
  };
}

export async function iniPercent(tabel) {
  try {
    const dataform = await NXUI.ref.get(tabel.store, tabel.id);
        NXUI.PercentData = {
      tabelChart: "bucketsStore",
      tabelChartKey: "chart_" + dataform.id,
      ...dataform,
    };

    if (!dataform.percent) {
            return `
   <div style="padding:30px" class="nx-container">
  <div class="nx-row">
    <div class="nx-col-12">
    <div class="nx-alert nx-alert-danger">
      Query Structure belum tersedia <a href="javascript:void(0);"onclick="returnModelPercent('${dataform.type}');"><span class="material-symbols-outlined nx-icon-md mr-5px">settings</span></a>
              </div>
    </div>
    </div>
  </div>
</div>
`
    }


    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
            <div class="nx-row">
              <div class="nx-col-6">
               <span class="bold">Metadata ${tabel.label}</span>
              </div>
              <div class="nx-col-6 align-right">
              <a href="javascript:void(0);"onclick="returnModelPercent('${dataform.type}');"><span class="material-symbols-outlined nx-icon-md mr-5px">settings</span></a>
              </div>
            </div>
        </div>
        <div class="nx-row">
        <div class="nx-col-12">
         <div class="nx-scroll" style="height:580px;">
           <div class="nx-row">
                 <div class="nx-col-12" id="container-id">
      
               </div>
           </div>
        </div>
        </div>
    `
    );

    // Function to render table
    const renderTable = async () => {
      try {
        // Clear existing table
        const container = document.getElementById("container-id");
        if (container) {
          container.innerHTML = "";
        }

        if (dataform.type == "join") {
          const data = await crossJoinAnalysis(dataform);

          if (!data || data.length === 0) {
            return;
          }

          // Try using NexaTabelChart first, fallback to direct conversion
          try {
            const Chart = await NexaTabelChart(
              data,
              "Table",
              tabel.id,
              dataform.percent
            );
            const tabelInstance = await createTabel("container-id", Chart);
          } catch (chartError) {
            // Fallback to direct conversion
            const tableData = convertToTableFormat(data, dataform.percent);
            const tabelInstance = await createTabel("container-id", tableData);
          }
        } else {
          const data = await nestedAnalysis(dataform);

          if (!data || data.length === 0) {
            return;
          }

          // Try using NexaTabelChart first, fallback to direct conversion
          try {
            const Chart = await NexaTabelChart(
              data,
              "Table",
              tabel.id,
              dataform.percent
            );
            const tabelInstance = await createTabel("container-id", Chart);
          } catch (chartError) {
            // Fallback to direct conversion
            const tableData = convertToTableFormat(data, dataform.percent);
            const tabelInstance = await createTabel("container-id", tableData);
          }
        }
      } catch (error) {
        // Error handling
      }
    };

    // Initial table render
    setTimeout(() => {
      renderTable();
    }, 100);

    // Listen for table configuration updates
    const tableUpdateHandler = async (event) => {
      if (event.detail.tableId === tabel.id) {
        // Clear existing table content
        const container = document.getElementById("container-id");
        if (container) {
          container.innerHTML = "";
        }
        // Add small delay to ensure container is properly cleared
        setTimeout(async () => {
          await renderTable();
        }, 100);
      }
    };

    // Add event listener for table updates
    document.addEventListener("tableConfigUpdated", tableUpdateHandler);

    return wrapper.innerHTML;
  } catch (error) {
    // Error handling
  }
}
nx.returnModelPercent = async function (type) {
  let maxDataset = NXUI.PercentData;
  let setData = [];
  let setSDK;
  if (type == "join") {
    setData = maxDataset.joinField;
    setSDK = maxDataset.joinSDK;
  } else {
    setData = maxDataset.variables;
    setSDK = maxDataset.formSDK;
  }
  const modalID = "modal_table_" + maxDataset.id;
  NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-400px",
    minimize: true,
    label: `Configure Table Field`,
    getFormBy: ["id", "name"], // Auto-collect form data by element ID (biar jelas fungsinya)
    setDataBy: maxDataset, // ✅ Standard validation approach
    onclick: {
      title: "Save Configure",
      cancel: "Cancel",
      send: "saveConfigurePercent", // ✅ Use namespaced function name
    },
    content: await ConfigurePercent(maxDataset, setData, setSDK),
  });
  NXUI.nexaModal.open(modalID);
  // NXUI.NexaOption({
  //  placeholder:"Search variables... (Ctrl+F)" ,
  //  elementById:"SearchGroup" ,
  //  select:"groupby"
  // });
};
