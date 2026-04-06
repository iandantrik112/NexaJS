/**
 * Route `/iconfiletype` — demo `NXUI.fileType` / `NXUI.NexaType.fileType` (Dom/NexaType.js).
 * Path file digabung dengan `NEXA.url` untuk preview gambar & iframe PDF.
 */
export async function filetype(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Icon file type | App",
        description: "Preview ikon / gambar per ekstensi lewat NXUI.fileType.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      container.innerHTML = `
        <h1>NXUI.fileType</h1>
        <p style="max-width:48rem;line-height:1.55">
          <code>NXUI.fileType(filePath, targetSelector)</code> sama dengan
          <code>NXUI.NexaType.fileType(...)</code> — mengisi elemen target dengan preview (ikon Font Awesome, gambar, atau khusus PDF).
          Path biasanya relatif ke origin: digabung menjadi <code>NEXA.url + filePath</code>.
        </p>
        <p style="font-size:0.9rem;opacity:0.9">Gambar nyata butuh file yang bisa di-<code>GET</code> di URL tersebut (ganti path di bawah sesuai proyek Anda).</p>

        <div class="iconfiletype-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:1.25rem;margin-top:1.25rem;max-width:720px;">
          <div>
            <div style="font-size:0.8rem;margin-bottom:6px;font-weight:600">PDF</div>
            <div id="ft-pdf" style="min-height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #ccc;border-radius:8px;padding:8px;"></div>
          </div>
          <div>
            <div style="font-size:0.8rem;margin-bottom:6px;font-weight:600">XLSX</div>
            <div id="ft-xlsx" style="min-height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #ccc;border-radius:8px;padding:8px;"></div>
          </div>
          <div>
            <div style="font-size:0.8rem;margin-bottom:6px;font-weight:600">JSON</div>
            <div id="ft-json" style="min-height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #ccc;border-radius:8px;padding:8px;"></div>
          </div>
          <div>
            <div style="font-size:0.8rem;margin-bottom:6px;font-weight:600">ZIP</div>
            <div id="ft-zip" style="min-height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #ccc;border-radius:8px;padding:8px;"></div>
          </div>
          <div>
            <div style="font-size:0.8rem;margin-bottom:6px;font-weight:600">PNG (gambar)</div>
            <div id="ft-png" style="min-height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #ccc;border-radius:8px;padding:8px;"></div>
          </div>
          <div>
            <div style="font-size:0.8rem;margin-bottom:6px;font-weight:600">Tanpa ekstensi</div>
            <div id="ft-plain" style="min-height:40px;display:flex;align-items:center;justify-content:center;border:1px dashed #ccc;border-radius:8px;padding:8px;"></div>
          </div>
        </div>

        <h2 style="margin-top:2rem;font-size:1.1rem">Objek kembalian (konsol)</h2>
        <p style="font-size:0.9rem;opacity:0.85">Buka DevTools — tiap pemanggilan mengembalikan info <code>extension</code>, <code>iconClass</code>, <code>isImage</code>, dll.</p>
      `;

      if (typeof NXUI === "undefined" || typeof NXUI.fileType !== "function") {
        console.error("NXUI.fileType tidak ada — pastikan Nexa.js termuat.");
        return;
      }

      const base =
        typeof NEXA !== "undefined" && NEXA.url
          ? String(NEXA.url).replace(/\/+$/, "")
          : typeof location !== "undefined"
            ? location.origin
            : "";

      const rows = [
        { path: "/demo/contoh.pdf", sel: "#ft-pdf", label: "PDF" },
        { path: "/demo/laporan.xlsx", sel: "#ft-xlsx", label: "XLSX" },
        { path: "/demo/data.json", sel: "#ft-json", label: "JSON" },
        { path: "/demo/bundel.zip", sel: "#ft-zip", label: "ZIP" },
        {
          path: "/assets/images/screenshot.png",
          sel: "#ft-png",
          label: "PNG",
        },
        { path: "/upload/nama-tanpa-ekstensi", sel: "#ft-plain", label: "plain" },
      ];

      rows.forEach(({ path, sel, label }) => {
        const out = NXUI.fileType(path, sel);
        if (out) {
          console.log(`[iconfiletype] ${label}`, path, out);
        } else {
          console.warn(`[iconfiletype] ${label} — target tidak ada atau path tidak valid`, sel);
        }
      });

      if (!base) {
        console.warn("[iconfiletype] NEXA.url kosong — preview gambar bisa gagal.");
      }
    }
  );
}
