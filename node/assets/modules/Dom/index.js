
export async function setTabelNav(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const wrapper = NXUI.createElement(
      "div",
      `
      <div class="nx-row">Header</div>

      <div id="setTabelNav">
         <div class="nx-row" id="nxdrop"></div>
      </div>
    `
    );

    setTimeout(async () => {
      try {
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaLayer({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        const template = render.Container({
          container: "#nxdrop",
          content: [await Failed(Sdk), await content2(Sdk)],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function Failed(data) {
  return {
    title: "Property",
    col: "nx-col-8",
    footer: "nx-col-6",
    html: "Ini adalah contoh konten card dasar. Card dapat berisi teks, gambar, dan elemen lainny",
  };
}

export async function content2(data) {
  return {
    title: "Setting Failed",
    col: "nx-col-4",
    footer: "nx-col-6",
    html: `Ini adalah contoh konten card dasar. Card dapat berisi teks, gambar, dan elemen lainnya`,
  };
}

export async function rendering(store) {
  // Ambil data storage terbaru

  // Refresh tampilan form menggunakan NexaRender dengan container selector
  await NXUI.NexaRender.refresh(store, setTabelNav, {
    containerSelector: ["#setTabelNav"],
  });
}
