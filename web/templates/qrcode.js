// Route `qrcode` — demo fitur NXUI.Qrcode

/** PNG 1×1 transparan — cadangan jika favicon tidak ada */
const DEMO_LOGO_FALLBACK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function resolveLogoUrl() {
  const base = typeof NEXA !== "undefined" && NEXA.url ? String(NEXA.url).replace(/\/$/, "") : "";
  if (base) return `${base}/assets/images/favicon.ico`;
  if (typeof location !== "undefined") return `${location.origin}/assets/images/favicon.ico`;
  return DEMO_LOGO_FALLBACK;
}

function whenQRiousReady(cb, maxMs = 15000) {
  if (typeof QRious !== "undefined") {
    cb();
    return;
  }
  const t0 = Date.now();
  const id = setInterval(() => {
    if (typeof QRious !== "undefined") {
      clearInterval(id);
      cb();
    } else if (Date.now() - t0 > maxMs) {
      clearInterval(id);
      cb();
    }
  }, 50);
}

function initQrcodeDemo(container) {
  const logoUrl = resolveLogoUrl();

  const setStatus = (id, text) => {
    const el = container.querySelector(id);
    if (el) el.textContent = text;
  };

  // --- 1) Dasar: teks + updateText ---
  const qrBasic = new NX.Qrcode("qr-demo-basic", {
    text: "https://example.com/nexa-demo",
    width: 200,
    height: 200,
    showControls: false,
  });

  container.querySelector("#qr-btn-apply-text")?.addEventListener("click", () => {
    const input = container.querySelector("#qr-input-text");
    const v = input?.value?.trim();
    if (!v) {
      setStatus("#qr-status-basic", "Isi teks dulu.");
      return;
    }
    const ok = qrBasic.updateText(v);
    setStatus("#qr-status-basic", ok ? "updateText OK." : "Gagal (kosong / library belum siap).");
  });

  // --- 2) Warna + tingkat koreksi: updateOptions ---
  const qrStyle = new NXUI.Qrcode("qr-demo-style", {
    text: "NXUI.Qrcode — warna & ECC",
    width: 200,
    height: 200,
    colorDark: "#0d47a1",
    colorLight: "#e3f2fd",
    correctLevel: "Q",
    showControls: false,
  });

  container.querySelector("#qr-btn-apply-style")?.addEventListener("click", () => {
    const dark = container.querySelector("#qr-color-dark")?.value || "#000000";
    const light = container.querySelector("#qr-color-light")?.value || "#ffffff";
    const level = container.querySelector("#qr-level")?.value || "M";
    qrStyle.updateOptions({
      colorDark: dark,
      colorLight: light,
      correctLevel: level,
    });
    setStatus("#qr-status-style", `updateOptions: ${dark} / ${light} / ${level}`);
  });

  // --- 3) Logo ---
  const qrLogo = new NXUI.Qrcode("qr-demo-logo", {
    text: "Logo di tengah (ECC tinggi disarankan)",
    width: 220,
    height: 220,
    correctLevel: "H",
    logo: logoUrl,
    logoSize: 0.22,
    logoMargin: 10,
    logoRadius: 10,
    showControls: false,
  });

  container.querySelector("#qr-btn-logo-fallback")?.addEventListener("click", () => {
    qrLogo.updateOptions({
      logo: DEMO_LOGO_FALLBACK,
      logoSize: 0.25,
      correctLevel: "H",
    });
    setStatus("#qr-status-logo", "Logo diganti ke data URI 1×1.");
  });

  container.querySelector("#qr-btn-logo-url")?.addEventListener("click", () => {
    qrLogo.updateOptions({
      logo: logoUrl,
      correctLevel: "H",
    });
    setStatus("#qr-status-logo", "Logo dari URL favicon (atau gagal load = QR saja).");
  });

  // --- 4) showControls + addButtons / clearButtons / removeButton ---
  const qrControls = new NXUI.Qrcode("qr-demo-controls", {
    text: "Tombol unduh & kustom",
    width: 180,
    height: 180,
    showControls: true,
  });

  whenQRiousReady(() => {
    qrControls.addButtons([
      {
        type: "download",
        text: "Unduh PNG",
        className: "demo-download-btn",
      },
      {
        text: "Alert teks",
        callback: () => {
          alert(qrControls.options.text || "");
        },
        options: {
          className: "demo-alert-btn",
          background: "#6f42c1",
          hoverBackground: "#5a32a3",
        },
      },
    ]);
  });

  container.querySelector("#qr-btn-clear-buttons")?.addEventListener("click", () => {
    qrControls.clearButtons();
    setStatus("#qr-status-controls", "clearButtons() — kontrol dikosongkan.");
  });

  container.querySelector("#qr-btn-remove-download")?.addEventListener("click", () => {
    qrControls.removeButton("demo-download-btn");
    setStatus("#qr-status-controls", "removeButton('demo-download-btn').");
  });

  // --- 5) Export: getDataURL, getBlob, downloadQR ---
  const qrExport = new NXUI.Qrcode("qr-demo-export", {
    text: "getDataURL / getBlob / downloadQR",
    width: 160,
    height: 160,
    showControls: false,
  });

  container.querySelector("#qr-btn-show-dataurl")?.addEventListener("click", () => {
    whenQRiousReady(() => {
      const url = qrExport.getDataURL();
      const img = container.querySelector("#qr-preview-img");
      if (img) {
        img.src = url || "";
        img.style.display = url ? "inline-block" : "none";
      }
      setStatus("#qr-status-export", url ? "getDataURL → pratinjau di bawah." : "getDataURL null.");
    });
  });

  container.querySelector("#qr-btn-blob")?.addEventListener("click", () => {
    whenQRiousReady(() => {
      qrExport.getBlob((blob) => {
        if (!blob) {
          setStatus("#qr-status-export", "getBlob gagal.");
          return;
        }
        setStatus(
          "#qr-status-export",
          `getBlob OK — type: ${blob.type}, size: ${blob.size} byte`
        );
        console.log("[Qrcode demo] getBlob", blob);
      });
    });
  });

  container.querySelector("#qr-btn-direct-download")?.addEventListener("click", () => {
    whenQRiousReady(() => {
      const ok = qrExport.downloadQR();
      setStatus("#qr-status-export", ok ? "downloadQR() dipanggil." : "downloadQR gagal.");
    });
  });

  container.querySelector("#qr-btn-clear-qr")?.addEventListener("click", () => {
    qrExport.clear();
    setStatus("#qr-status-export", "clear() — canvas dihapus. generate() lagi dari input.");
  });

  container.querySelector("#qr-btn-regenerate-export")?.addEventListener("click", () => {
    const t = container.querySelector("#qr-export-text")?.value?.trim() || "Regenerate";
    qrExport.updateText(t);
    setStatus("#qr-status-export", "generate lewat updateText.");
  });

  // --- 6) Static: generateToElement ---
  NXUI.Qrcode.generateToElement("qr-demo-static-el", "NXUI.Qrcode.generateToElement()", {
    width: 160,
    height: 160,
    colorDark: "#1b5e20",
    showControls: false,
  });

  // generateToCanvas mengembalikan Promise (menunggu init + canvas).
  whenQRiousReady(() => {
    const holder = container.querySelector("#qr-static-canvas-holder");
    if (!holder) return;
    (async () => {
      try {
        const canvas = await NXUI.Qrcode.generateToCanvas("Static generateToCanvas()", {
          width: 140,
          height: 140,
          colorDark: "#bf360c",
          colorLight: "#fff3e0",
          correctLevel: "M",
        });
        if (canvas) {
          holder.innerHTML = "";
          canvas.style.display = "block";
          holder.appendChild(canvas);
          setStatus("#qr-status-static", "generateToCanvas() — canvas disisipkan.");
        } else {
          setStatus(
            "#qr-status-static",
            "generateToCanvas null (QRious / jaringan / timeout ~10s)."
          );
        }
      } catch (e) {
        console.error("[Qrcode demo] generateToCanvas", e);
        setStatus("#qr-status-static", "generateToCanvas error — lihat konsol.");
      }
    })();
  });

  window.__nexaQrcodeDemo = {
    qrBasic,
    qrStyle,
    qrLogo,
    qrControls,
    qrExport,
  };

  console.log(
    "[Qrcode demo] Instance di window.__nexaQrcodeDemo — coba .updateText(), .getDataURL(), dll."
  );
}

export async function qrcode(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "NXUI.Qrcode — demo fitur",
        description: "generate, updateText, updateOptions, logo, kontrol, export, static API.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);
      console.log("📍 Navigating to:", NEXA);

      container.innerHTML = `
<style>
  .nexa-qrcode-page { max-width: 960px; margin: 0 auto; font-family: system-ui, sans-serif; }
  .nexa-qrcode-page h1 { font-size: 1.35rem; }
  .nexa-qrcode-page .sub { color: #555; margin-bottom: 1rem; }
  .nexa-qrcode-page section {
    margin-bottom: 1.25rem; padding: 1rem; border: 1px solid #e8e8e8; border-radius: 10px; background: #fafafa;
  }
  .nexa-qrcode-page h2 { font-size: 1rem; margin: 0 0 0.5rem; }
  .nexa-qrcode-page .grid-2 {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; align-items: start;
  }
  .nexa-qrcode-page .panel { background: #fff; border-radius: 8px; padding: 0.75rem; border: 1px solid #eee; }
  .nexa-qrcode-page label { display: block; font-size: 0.8rem; font-weight: 600; margin: 0.35rem 0 0.2rem; }
  .nexa-qrcode-page input[type="text"], .nexa-qrcode-page input[type="color"], .nexa-qrcode-page select {
    width: 100%; max-width: 100%; padding: 0.35rem 0.5rem; font-size: 0.9rem; box-sizing: border-box;
  }
  .nexa-qrcode-page .row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 0.5rem; }
  .nexa-qrcode-page button {
    padding: 0.4rem 0.75rem; font-size: 0.85rem; cursor: pointer; border: 1px solid #ccc; border-radius: 6px; background: #fff;
  }
  .nexa-qrcode-page button:hover { background: #e8f4ff; }
  .nexa-qrcode-page .status { font-size: 0.8rem; color: #444; margin-top: 0.5rem; min-height: 1.2em; }
  .nexa-qrcode-page .hint { font-size: 0.78rem; color: #666; margin-top: 0.35rem; }
  .nexa-qrcode-page #qr-preview-img { max-width: 160px; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
</style>
<div class="nexa-qrcode-page">
  <h1>NXUI.Qrcode — demo fitur</h1>
  <p class="sub">Route: <code>${routeName}</code> · Memuat <strong>QRious</strong> dari unpkg jika belum ada · Modul: <code>assets/modules/Qrcode/NexaQrcode.js</code> · API: <code>NXUI.Qrcode</code></p>

  <section>
    <h2>1. Dasar — <code>updateText</code></h2>
    <p class="hint">Konstruktor: <code>new NXUI.Qrcode(containerId, options)</code> · Isi lalu terapkan teks QR.</p>
    <div class="grid-2">
      <div class="panel">
        <label for="qr-input-text">Nilai QR</label>
        <input type="text" id="qr-input-text" value="https://example.com/nexa-demo" />
        <div class="row">
          <button type="button" id="qr-btn-apply-text">updateText()</button>
        </div>
        <p class="status" id="qr-status-basic"></p>
      </div>
      <div class="panel" style="text-align:center;">
        <div id="qr-demo-basic"></div>
      </div>
    </div>
  </section>

  <section>
    <h2>2. Gaya — <code>updateOptions</code> (<code>colorDark</code>, <code>colorLight</code>, <code>correctLevel</code>)</h2>
    <div class="grid-2">
      <div class="panel">
        <label for="qr-color-dark">colorDark</label>
        <input type="color" id="qr-color-dark" value="#0d47a1" />
        <label for="qr-color-light">colorLight</label>
        <input type="color" id="qr-color-light" value="#e3f2fd" />
        <label for="qr-level">correctLevel (QRious)</label>
        <select id="qr-level">
          <option value="L">L — rendah</option>
          <option value="M">M — default</option>
          <option value="Q" selected>Q</option>
          <option value="H">H — tinggi (logo)</option>
        </select>
        <div class="row">
          <button type="button" id="qr-btn-apply-style">updateOptions()</button>
        </div>
        <p class="status" id="qr-status-style"></p>
      </div>
      <div class="panel" style="text-align:center;">
        <div id="qr-demo-style"></div>
      </div>
    </div>
  </section>

  <section>
    <h2>3. Logo — <code>logo</code>, <code>logoSize</code>, <code>logoMargin</code>, <code>logoRadius</code></h2>
    <p class="hint">ECC <code>H</code> disarankan. URL dari <code>NEXA.url</code> + favicon, atau data URI cadangan.</p>
    <div class="grid-2">
      <div class="panel">
        <div class="row">
          <button type="button" id="qr-btn-logo-url">Pakai favicon URL</button>
          <button type="button" id="qr-btn-logo-fallback">Pakai logo 1×1 (data URI)</button>
        </div>
        <p class="status" id="qr-status-logo"></p>
      </div>
      <div class="panel" style="text-align:center;">
        <div id="qr-demo-logo"></div>
      </div>
    </div>
  </section>

  <section>
    <h2>4. Kontrol — <code>showControls</code>, <code>addButtons</code>, <code>clearButtons</code>, <code>removeButton</code></h2>
    <p class="hint"><code>createDownloadButton</code> / <code>createCustomButton</code> lewat <code>addButtons</code>.</p>
    <div class="grid-2">
      <div class="panel">
        <div class="row">
          <button type="button" id="qr-btn-clear-buttons">clearButtons()</button>
          <button type="button" id="qr-btn-remove-download">removeButton('demo-download-btn')</button>
        </div>
        <p class="status" id="qr-status-controls"></p>
      </div>
      <div class="panel" style="text-align:center;">
        <div id="qr-demo-controls"></div>
      </div>
    </div>
  </section>

  <section>
    <h2>5. Export — <code>getDataURL</code>, <code>getBlob</code>, <code>downloadQR</code>, <code>clear</code></h2>
    <div class="grid-2">
      <div class="panel">
        <label for="qr-export-text">Teks (regenerate)</label>
        <input type="text" id="qr-export-text" value="getDataURL / getBlob / downloadQR" />
        <div class="row">
          <button type="button" id="qr-btn-show-dataurl">getDataURL → img</button>
          <button type="button" id="qr-btn-blob">getBlob (konsol)</button>
          <button type="button" id="qr-btn-direct-download">downloadQR()</button>
        </div>
        <div class="row">
          <button type="button" id="qr-btn-clear-qr">clear()</button>
          <button type="button" id="qr-btn-regenerate-export">updateText (isi atas)</button>
        </div>
        <img id="qr-preview-img" alt="Pratinjau getDataURL" style="display:none;" />
        <p class="status" id="qr-status-export"></p>
      </div>
      <div class="panel" style="text-align:center;">
        <div id="qr-demo-export"></div>
      </div>
    </div>
  </section>

  <section>
    <h2>6. Statis — <code>generateToElement</code>, <code>generateToCanvas</code></h2>
    <p class="hint"><code>generateToCanvas</code> async — menunggu init + canvas; demo memanggilnya dengan <code>await</code> setelah QRious siap.</p>
    <div class="grid-2">
      <div class="panel" style="text-align:center;">
        <div id="qr-demo-static-el"></div>
        <p class="hint">generateToElement</p>
      </div>
      <div class="panel" style="text-align:center;">
        <div id="qr-static-canvas-holder"></div>
        <p class="hint">generateToCanvas → canvas disisipkan</p>
        <p class="status" id="qr-status-static"></p>
      </div>
    </div>
  </section>
</div>
`;

      initQrcodeDemo(container);
    }
  );
}
