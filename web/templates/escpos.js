// Route `escpos` — demo NXUI.Escpos (NexaEscpos), RAW ESC/POS

/** Perkiraan teks yang terbaca di kertas (bagian teks saja; QR/barcode = biner di stream) */
const PREVIEW_STRUK_TEKS = `——— perkiraan tampilan teks ———
(judul besar + tebal, tengah)
NEXA DEMO

Struk ESC/POS
<tanggal & waktu dari browser>

--------------------------------
Kopi Susu        x2   Rp 30.000
Nasi Goreng      x1   Rp 25.000
TOTAL                 Rp 55.000
--------------------------------
          Terima kasih

<< QR: data "https://example.com/invoice/demo-001" (grafis, bukan teks) >>
<< CODE128: "INV-DEMO-001" (garis barcode) >>
<< feed + potong kertas (perintah GS V) >>`;

function formatHexdump(u8, maxBytes = 512) {
  const n = Math.min(u8.length, maxBytes);
  const lines = [];
  for (let offset = 0; offset < n; offset += 16) {
    const end = Math.min(offset + 16, n);
    const slice = u8.subarray(offset, end);
    const hexCells = [];
    for (let j = 0; j < 16; j++) {
      hexCells.push(
        j < slice.length ? slice[j].toString(16).padStart(2, "0") : "  "
      );
    }
    let ascii = "";
    for (let j = 0; j < slice.length; j++) {
      const b = slice[j];
      ascii += b >= 32 && b < 127 ? String.fromCharCode(b) : ".";
    }
    lines.push(
      `${offset.toString(16).padStart(8, "0")}  ${hexCells.join(" ")}  |${ascii}|`
    );
  }
  if (u8.length > maxBytes) {
    lines.push(
      `… dipotong: menampilkan ${maxBytes} / ${u8.length} byte (unduh .bin untuk utuh)`
    );
  }
  return lines.join("\n");
}

/** Cuplikan decode UTF-8 dari awal buffer; byte tak tercetak → · */
function utf8LooseSnippet(u8, maxBytes = 600, maxChars = 1500) {
  const n = Math.min(u8.length, maxBytes);
  const s = new TextDecoder("utf-8", { fatal: false }).decode(u8.subarray(0, n));
  const vis = Array.from(s, (ch) => {
    if (ch === "\n" || ch === "\r" || ch === "\t") return ch;
    const c = ch.codePointAt(0);
    if (c >= 32 && c !== 127) return ch;
    return "·";
  }).join("");
  let out = vis;
  if (out.length > maxChars) out = out.slice(0, maxChars) + "\n…(potong)";
  if (u8.length > maxBytes) out += `\n… buffer ${u8.length} byte; cuplikan ${maxBytes} byte pertama`;
  return out.trim() || "(di awal buffer dominan perintah ESC/GS, bukan teks)";
}

function buildDemoStruk() {
  const esc = new NXUI.Escpos();
  esc
    .init()
    .align("center")
    .size(2, 2)
    .bold(true)
    .text("NEXA DEMO")
    .lf()
    .resetModes()
    .size(1, 1)
    .text("Struk ESC/POS")
    .lf()
    .text(new Date().toLocaleString("id-ID"))
    .lf()
    .lf()
    .align("left")
    .text("--------------------------------")
    .lf()
    .text("Kopi Susu        x2   Rp 30.000")
    .lf()
    .text("Nasi Goreng      x1   Rp 25.000")
    .lf()
    .bold(true)
    .text("TOTAL                Rp 55.000")
    .lf()
    .resetModes()
    .text("--------------------------------")
    .lf()
    .align("center")
    .text("Terima kasih")
    .lf()
    .lf()
    .qr("https://example.com/invoice/demo-001", { moduleSize: 6, ecc: "M" })
    .lf()
    .lf()
    .align("left")
    .text("CODE128:")
    .lf();
  esc.barcode128("INV-DEMO-001");
  esc.lf().feedLines(4).cut("partial");
  return esc;
}

function initEscposDemo(container) {
  const preHex = container.querySelector("#escpos-hex-out");
  const preHuman = container.querySelector("#escpos-human-preview");
  const preSnippet = container.querySelector("#escpos-utf8-snippet");
  const meta = container.querySelector("#escpos-meta");

  const showBuffer = (esc, label, humanPreviewText) => {
    const u8 = esc.toUint8Array();
    window.__nexaEscposLast = u8;
    if (preHex) preHex.textContent = formatHexdump(u8, 512);
    if (preHuman) {
      preHuman.textContent =
        humanPreviewText != null ? humanPreviewText : PREVIEW_STRUK_TEKS;
    }
    if (preSnippet) {
      preSnippet.textContent = utf8LooseSnippet(u8, 600, 1500);
    }
    if (meta) {
      meta.textContent = `${label} — ${u8.length} byte total · window.__nexaEscposLast`;
    }
    console.log("[Escpos demo]", label, u8.length, "bytes");
  };

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-escpos-action]");
    if (!btn) return;
    const act = btn.getAttribute("data-escpos-action");

    switch (act) {
      case "build-struk": {
        const esc = buildDemoStruk();
        showBuffer(
          esc,
          "Struk lengkap (QR + barcode128 + cut)",
          PREVIEW_STRUK_TEKS.replace(
            "<tanggal & waktu dari browser>",
            new Date().toLocaleString("id-ID")
          )
        );
        break;
      }
      case "build-minimal": {
        const esc = new NXUI.Escpos();
        esc.init().text("Hello ESC/POS").lf().feedLines(2).cut("partial");
        showBuffer(
          esc,
          "Minimal",
          "——— perkiraan teks ———\nHello ESC/POS\n\n<<feed>>\n<<potong>>"
        );
        break;
      }
      case "static-receipt": {
        const esc = NXUI.Escpos.receipt("Baris 1\nBaris 2\nBaris 3")
          .feedLines(2)
          .cut("partial");
        showBuffer(
          esc,
          "NexaEscpos.receipt()",
          "——— perkiraan teks ———\nBaris 1\nBaris 2\nBaris 3\n\n<<feed>>\n<<potong>>"
        );
        break;
      }
      case "raw-esc-init": {
        const esc = new NXUI.Escpos();
        esc.raw("1B40").text("Setelah ESC @ (hex)").lf();
        showBuffer(
          esc,
          "raw('1B40') + text",
          "——— perkiraan teks ———\nSetelah ESC @ (hex)\n"
        );
        break;
      }
      case "download": {
        const u8 = window.__nexaEscposLast;
        if (!u8 || !u8.length) {
          buildDemoStruk().download("nexa-demo-escpos.bin");
        } else {
          new NXUI.Escpos().raw(u8).download("nexa-demo-escpos.bin");
        }
        break;
      }
      case "copy-hex": {
        const u8 = window.__nexaEscposLast;
        if (!u8 || !navigator.clipboard) {
          alert("Buat buffer dulu (Struk) atau clipboard tidak tersedia.");
          return;
        }
        const hex = Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join(
          ""
        );
        navigator.clipboard.writeText(hex).then(
          () => {
            if (meta) meta.textContent += " — hex disalin (tanpa spasi)";
          },
          () => alert("Gagal menyalin")
        );
        break;
      }
      default:
        break;
    }
  });

  // Buffer awal agar download langsung punya isi
  showBuffer(
    buildDemoStruk(),
    "Awal: struk demo (ubah dengan tombol)",
    PREVIEW_STRUK_TEKS.replace(
      "<tanggal & waktu dari browser>",
      new Date().toLocaleString("id-ID")
    )
  );

  console.log(
    "[Escpos demo] NXUI.Escpos — lihat assets/modules/Escpos/NexaEscpos.js"
  );
}

export async function escpos(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "NXUI.Escpos — demo RAW ESC/POS",
        description: "Builder byte untuk thermal; unduh .bin / hex preview.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);
      console.log("📍 Navigating to:", NEXA);

      container.innerHTML = `
<style>
  .nexa-escpos-page { max-width: 720px; margin: 0 auto; font-family: system-ui, sans-serif; }
  .nexa-escpos-page h1 { font-size: 1.3rem; }
  .nexa-escpos-page .sub { color: #555; margin-bottom: 1rem; }
  .nexa-escpos-page section {
    margin-bottom: 1rem; padding: 1rem; border: 1px solid #e4e4e4; border-radius: 8px; background: #fafafa;
  }
  .nexa-escpos-page h2 { font-size: 0.95rem; margin: 0 0 0.5rem; }
  .nexa-escpos-page .actions { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
  .nexa-escpos-page button {
    padding: 0.4rem 0.7rem; font-size: 0.82rem; cursor: pointer; border: 1px solid #bbb; border-radius: 6px; background: #fff;
  }
  .nexa-escpos-page button:hover { background: #eef6ff; }
  .nexa-escpos-page .hint { font-size: 0.78rem; color: #666; margin-top: 0.45rem; line-height: 1.4; }
  .nexa-escpos-page .escpos-pre-label { font-size: 0.78rem; font-weight: 600; color: #444; margin: 0.85rem 0 0.25rem; }
  .nexa-escpos-page pre.escpos-pre-human {
    margin: 0; padding: 0.75rem; background: #fff; color: #222; border: 1px solid #ccc; border-radius: 6px;
    font-size: 0.8rem; line-height: 1.5; overflow: auto; max-height: 280px; white-space: pre-wrap;
    font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  }
  .nexa-escpos-page pre.escpos-pre-snippet {
    margin: 0; padding: 0.65rem 0.75rem; background: #f6f4ef; color: #333; border: 1px dashed #c9b896; border-radius: 6px;
    font-size: 0.72rem; line-height: 1.45; overflow: auto; max-height: 140px; white-space: pre-wrap;
    font-family: ui-monospace, Consolas, monospace;
  }
  .nexa-escpos-page pre#escpos-hex-out {
    margin: 0; padding: 0.75rem; background: #1e1e1e; color: #b4d273;
    border-radius: 6px; font-size: 0.68rem; line-height: 1.4; overflow: auto; max-height: 260px;
    white-space: pre; font-family: ui-monospace, Consolas, monospace;
  }
  .nexa-escpos-page #escpos-meta { font-size: 0.8rem; color: #333; margin-top: 0.35rem; }
</style>
<div class="nexa-escpos-page">
  <h1>NXUI.Escpos — demo</h1>
  <p class="sub">Route: <code>${routeName}</code> · Modul: <code>assets/modules/Escpos/NexaEscpos.js</code> · Hanya menghasilkan <strong>byte RAW</strong> (bukan <code>window.print</code>).</p>

  <section>
    <h2>Aksi</h2>
    <div class="actions">
      <button type="button" data-escpos-action="build-struk">Bangun struk (QR + CODE128 + cut)</button>
      <button type="button" data-escpos-action="build-minimal">Minimal: init + teks + cut</button>
      <button type="button" data-escpos-action="static-receipt">NexaEscpos.receipt()</button>
      <button type="button" data-escpos-action="raw-esc-init">raw('1B40') + teks</button>
      <button type="button" data-escpos-action="download">Unduh .bin</button>
      <button type="button" data-escpos-action="copy-hex">Salin hex (tanpa spasi)</button>
    </div>
    <p class="hint">Kirim <code>.bin</code> ke printer lewat WebUSB, backend serial, atau utilitas OS. Encoding teks default UTF-8; printer lama mungkin perlu halaman kode lain.</p>
    <p id="escpos-meta"></p>

    <p class="escpos-pre-label">1) Perkiraan tampilan teks di struk (bukan byte mentah)</p>
    <pre id="escpos-human-preview" class="escpos-pre-human"></pre>

    <p class="escpos-pre-label">2) Cuplikan karakter UTF-8 / ASCII dari awal buffer (perintah ESC/LF terselip)</p>
    <pre id="escpos-utf8-snippet" class="escpos-pre-snippet"></pre>

    <p class="escpos-pre-label">3) Awal file .bin — format hexdump (offset · hex · ASCII)</p>
    <pre id="escpos-hex-out"></pre>
  </section>
</div>
`;

      initEscposDemo(container);
    }
  );
}
