import { subQuery } from "../SubQuery/index.js";
import { NexaChart } from "../../Chart/index.js";
export async function iniChart(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

    // Cek apakah storage.chart?.applications ada
    if (!storage.chart?.applications) {
      // Return UI untuk konfigurasi chart
      const configWrapper = NXUI.createElement(
        "div",
        `
        <div class="nx-card-header">
          <h3 class="bold fs-20px">Metadata Chart ${
            storage.className || "N/A"
          }</h3>  
          <div class="nx-card-controls align-right">v.${
            storage.version || "1.0"
          }</div>
        </div>
        <div id="setTabelNav">
          <div class="nx-row" id="nxdrop"></div>
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
            content: [await configChart(storage), await content2(Sdk)],
          });
          NXUI.id("nxdrop").innerHTML = template;
          render.drop();
          await setCheckbox(Sdk);
        } catch (error) {
          console.error("❌ Error initializing chart configuration:", error);
        }
      }, 100);

      return configWrapper.innerHTML;
    }

    const server = await NXUI.Storage()
      .models("Office")
      .executeAnalysis(storage.chart?.applications);

    // Dynamic filter based on aliasNames
    const aliasNames = storage.chart?.applications.aliasNames || [];
    const updatedResponse = server.data.response
      .filter((item) => {
        // Check if any of the alias fields are null or empty
        return aliasNames.every(
          (field) => item[field] !== null && item[field] !== ""
        );
      })
      .map((item) => ({
        label: item[aliasNames[0]], // Menggunakan field pertama sebagai label
        value: item[aliasNames[1]], // Menggunakan field kedua sebagai value
      }));

    const wrapper = NXUI.createElement(
      "div",
      `
         <div class="nx-card-header">
           <h3 class="bold fs-20px">Metadata Chart ${storage.className}</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setTabelNav">
         <div class="nx-row" id="nxdrop"></div>
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
          content: [await configChart(storage), await content2(Sdk)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        await setCheckbox(Sdk);

        // Tunggu sebentar untuk memastikan DOM sudah ter-render
        setTimeout(async () => {
          try {
            // Pastikan canvas element sudah tersedia
            const canvasElement = document.getElementById("chart_myChartId");
            if (!canvasElement) {
              console.error(
                "Canvas element dengan ID 'chart_myChartId' tidak ditemukan"
              );
              return;
            }
            // Contoh penggunaan
            const chartData = updatedResponse;
            // Membuat chart Bar
            const result = await NexaChart(chartData, "Donut", "myChartId");
          } catch (chartError) {
            console.error("❌ Error creating chart:", chartError);
          }
        }, 200); // Tambah delay sedikit lebih lama
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization configChart:", error);
  }
}

export async function configChart(storage) {
  try {
    // Pastikan storage.chart ada sebelum memanggil subQuery
    if (!storage.chart) {
      storage.chart = {};
    }

    const storageapp = await subQuery(storage, "chart");

    return {
      title: "Properti",
      col: "nx-col-6",
      footer: storageapp?.footer,
      html: storageapp?.html,
    };
  } catch (error) {
    console.error("❌ Error in configChart:", error);
    // Return default config jika ada error
    return {
      title: "Properti",
      col: "nx-col-6",
      footer: "",
      html: `
        <div class="nx-alert nx-alert-info">
          <i class="nx-icon nx-icon-info"></i>
          Konfigurasi chart belum tersedia. Silakan atur konfigurasi terlebih dahulu.
        </div>
      `,
    };
  }
}

export async function content2(data) {
  return {
    title: "Setting configChart",
    col: "nx-col-6",
    footer: "nx-col-6",
    html: `          
        <div id="contenerChart" style="width: 100%; height: 400px; padding: 20px;">
          <canvas id="chart_myChartId" style="width: 100%; height: 100%;"></canvas>
       </div>`,
  };
}

export async function rendering(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, setTabelNav, {
    containerSelector: ["#setTabelNav"],
  });
}

export async function setCheckbox(store) {
  try {
    // Inisialisasi checkbox handler dari NXUI
    const checkbox = new NXUI.Checkbox();

    // Set callback untuk menangani perubahan checkbox
    checkbox.onSaveCallback(async (element) => {
      const storage = await store.storage();

      // Handle checkbox kondisi field - simpan alias sebagai array
      // Pastikan storage.chart ada
      if (!storage.chart) {
        storage.chart = {};
      }

      let updatedAlias = storage.chart.alias || [];

      // Jika alias belum ada atau bukan array, buat array kosong
      if (!Array.isArray(updatedAlias)) {
        updatedAlias = updatedAlias ? [updatedAlias] : [];
      }

      // Gunakan element.checked untuk menentukan aksi
      if (element.checked) {
        // Jika checkbox dicentang, tambahkan alias jika belum ada
        const existingIndex = updatedAlias.findIndex(
          (alias) => alias === element.value
        );

        if (existingIndex === -1) {
          updatedAlias.push(element.value);
        }
      } else {
        // Jika checkbox dicabang, hapus alias jika ada
        const existingIndex = updatedAlias.findIndex(
          (alias) => alias === element.value
        );

        if (existingIndex !== -1) {
          updatedAlias.splice(existingIndex, 1);
        }
      }

      // Buat variablesAlias dari updatedAlias dengan menggabungkan table.field dengan alias name
      const variablesAlias = updatedAlias.map((aliasItem) => {
        // Gunakan regex untuk lebih robust matching
        const match = aliasItem.match(/^(.+?)\s+AS\s+(.+)$/i);
        if (match) {
          const tableField = match[1].trim(); // Exsampel.status
          const aliasName = match[2].trim(); // status

          // Ambil bagian table dari tableField dan gabungkan dengan aliasName
          const tableName = tableField.split(".")[0]; // Exsampel
          return `${tableName}.${aliasName}`; // Exsampel.status
        }
        return aliasItem; // Jika tidak ada AS, return as is
      });

      await store.upIndex({
        chart: {
          ...storage.chart,
          alias: updatedAlias,
          variablesAlias: variablesAlias,
        },
      });
    });

    // Inisialisasi semua elemen checkbox
    checkbox.Elements();
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}
