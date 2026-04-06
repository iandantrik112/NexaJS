// Route `prind` — demo NXUI.Prind (NexaPrind), selaras docs/NexaPrind.md
//
// API:
// - NXUI.Prind.printById(id, options?)
// - NXUI.Prind.printBySelector(selector, options?)
// - new NXUI.Prind().print(element, options?) — instance langsung (tanpa guard isPrinting di printById)

function initPrindDemo(container) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-prind-action]");
    if (!btn) return;
    const act = btn.getAttribute("data-prind-action");

    switch (act) {
      case "print-id-simple":
        NXUI.Prind.printById("prind-print-root");
        break;
      case "print-id-a4":
        NXUI.Prind.printById("prind-print-root", {
          title: "Faktur demo — A4 portrait",
          paperSize: "A4",
          orientation: "portrait",
          margins: "15mm",
          fontSize: "11pt",
          lineHeight: "1.35",
        });
        break;
      case "print-id-landscape":
        NXUI.Prind.printById("prind-print-root", {
          title: "Faktur demo — landscape",
          paperSize: "A4",
          orientation: "landscape",
          marginTop: "12mm",
          marginRight: "10mm",
          marginBottom: "12mm",
          marginLeft: "10mm",
          fontSize: "10pt",
        });
        break;
      case "print-id-new-window":
        NXUI.Prind.printById("prind-print-root", {
          title: "Preview — window baru",
          newWindow: true,
          removeAfterPrint: false,
          paperSize: "A4",
        });
        break;
      case "print-selector-article":
        NXUI.Prind.printBySelector(".prind-article-only", {
          title: "Cuplikan artikel (printBySelector)",
          paperSize: "A4",
          margins: "20mm",
          fontSize: "12pt",
          lineHeight: "1.4",
        });
        break;
      case "print-instance": {
        const el = container.querySelector("#prind-print-root");
        if (!el) return;
        const pr = new NXUI.Prind();
        pr.print(el, {
          title: "Via new NXUI.Prind().print()",
          paperSize: "A4",
          orientation: "portrait",
          margins: "12mm",
        });
        break;
      }
      default:
        break;
    }
  });

  const dateEl = container.querySelector("#prind-demo-date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  }

  console.log(
    "[Prind demo] NXUI.Prind.printById / printBySelector — lihat docs/NexaPrind.md untuk opsi lengkap."
  );
}

export async function prind(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "NXUI.Prind — demo cetak",
        description: "printById, printBySelector, instance.print — NexaPrind.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);
      console.log("📍 Navigating to:", NEXA);

      container.innerHTML = `
<style>
  .nexa-prind-demo { max-width: 820px; margin: 0 auto; font-family: system-ui, sans-serif; }
  .nexa-prind-demo > h1 { font-size: 1.35rem; }
  .nexa-prind-demo .sub { color: #555; margin-bottom: 1rem; }
  .nexa-prind-demo .toolbar {
    display: flex; flex-wrap: wrap; gap: 0.45rem; margin-bottom: 1.25rem; padding: 0.85rem;
    background: #f0f4f8; border-radius: 8px; border: 1px solid #dde4ec;
  }
  .nexa-prind-demo .toolbar button {
    padding: 0.4rem 0.75rem; font-size: 0.82rem; cursor: pointer; border: 1px solid #b8c5d0;
    border-radius: 6px; background: #fff;
  }
  .nexa-prind-demo .toolbar button:hover { background: #e8f2fc; }
  .nexa-prind-demo .hint { font-size: 0.78rem; color: #666; margin-top: 0.5rem; width: 100%; }
  #prind-print-root.prind-sheet {
    padding: 1.25rem 1.5rem; background: #fff; border: 1px solid #ddd; border-radius: 8px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  }
  #prind-print-root h2 { margin: 0 0 0.35rem; font-size: 1.25rem; }
  #prind-print-root .meta { color: #444; font-size: 0.9rem; margin-bottom: 1rem; }
  #prind-print-root table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  #prind-print-root th, #prind-print-root td { border: 1px solid #ccc; padding: 0.45rem 0.6rem; text-align: left; }
  #prind-print-root th { background: #f5f5f5; }
  #prind-print-root .total-row td { font-weight: 600; }
  .prind-secondary { margin-top: 1.5rem; padding: 1rem; background: #fafafa; border-radius: 8px; border: 1px dashed #ccc; }
  .prind-article-only { max-width: 36rem; }
  .prind-article-only h3 { margin-top: 0; }
</style>
<div class="nexa-prind-demo">
  <h1>NXUI.Prind — demo</h1>
  <p class="sub">Route: <code>${routeName}</code> · Kelas <strong>NexaPrind</strong> di <code>NXUI.Prind</code> · Rujukan: <code>docs/NexaPrind.md</code></p>

  <div class="toolbar">
    <button type="button" data-prind-action="print-id-simple">printById (default)</button>
    <button type="button" data-prind-action="print-id-a4">printById A4 + margin + font</button>
    <button type="button" data-prind-action="print-id-landscape">printById landscape</button>
    <button type="button" data-prind-action="print-id-new-window">printById newWindow</button>
    <button type="button" data-prind-action="print-selector-article">printBySelector .prind-article-only</button>
    <button type="button" data-prind-action="print-instance">new NXUI.Prind().print(...)</button>
    <p class="hint">Hanya elemen bertanda <code>#prind-print-root</code> / <code>.prind-article-only</code> yang dikirim ke dialog cetak. Toolbar di luar area cetak.</p>
  </div>

  <div id="prind-print-root" class="prind-sheet">
    <h2>Faktur demo</h2>
    <p class="meta">Tanggal: <span id="prind-demo-date">—</span> · No. INV-DEMO-001</p>
    <table>
      <thead>
        <tr>
          <th style="width:3rem">No</th>
          <th>Item</th>
          <th style="width:5rem">Qty</th>
          <th style="width:8rem">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>Layanan Nexa Route</td><td>1</td><td>Rp 500.000</td></tr>
        <tr><td>2</td><td>Modul NXUI.Prind</td><td>1</td><td>Rp 250.000</td></tr>
        <tr><td>3</td><td>Dokumentasi PDF</td><td>2</td><td>Rp 100.000</td></tr>
      </tbody>
      <tfoot>
        <tr class="total-row"><td colspan="3">Total</td><td>Rp 850.000</td></tr>
      </tfoot>
    </table>
    <p style="margin-top:1rem;font-size:0.85rem;color:#555;">Teks ini ikut dicetak bersama tabel (perilaku tabel & heading sesuai catatan di NexaPrind.md).</p>
  </div>

  <div class="prind-secondary">
    <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#666;">Area terpisah untuk uji <code>printBySelector</code>:</p>
    <article class="prind-article-only">
      <h3>Artikel ringkas</h3>
      <p><code>NXUI.Prind.printBySelector('.prind-article-only', { title, paperSize, … })</code> mencetak hanya blok ini (elemen pertama yang cocok selector).</p>
    </article>
  </div>
</div>
`;

      initPrindDemo(container);
    }
  );
}
