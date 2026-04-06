/**
 * Route `/filter` — demo `NXUI.Filter` / `NXUI.NexaFilter` (`assets/modules/Dom/NexaFilter.js`).
 * Menampilkan subset representatif + ternary, switch, dan lebih banyak `Filter()`;
 * untuk daftar lengkap semua nama filter tetap lihat `NexaFilter.js` (method `Filter`).
 */

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

export async function filter(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Filter | App",
        description: "Demo NexaFilter — Filter, parseFilters, processTemplate, ternary, switch.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      if (typeof NXUI === "undefined" || !NXUI.Filter) {
        container.innerHTML = "<p>NXUI.Filter tidak tersedia.</p>";
        return;
      }

      const F = new NXUI.Filter();

      const data = {
        name: "nexa pengguna",
        amount: 9876543.2,
        desc:
          "Teks panjang untuk truncate dan demonstrasi slug dari judul yang ada spasi.",
        isoDate: "2026-04-04T10:30:00.000Z",
        status: "active",
        tags: ["satu", "dua", "tiga"],
        qty: 12,
        htmlSnippet: "<b>tebal</b> dan <i>miring</i>",
        bytes: 1536000,
        phoneRaw: "081234567890",
        emptyLabel: "",
        score: 0.875,
      };

      const directRows = [
        ["upper", F.Filter("Hello", "upper", [])],
        ["lower", F.Filter("Hello", "lower", [])],
        ["capitalize", F.Filter("halo dunia", "capitalize", [])],
        ["trim", F.Filter("  x  ", "trim", [])],
        ["number_format:2", F.Filter(3.14159, "number_format", ["2"])],
        ["currency:IDR", F.Filter(50000, "currency", ["IDR"])],
        ["decimal_to_rupiah", F.Filter(data.amount, "decimal_to_rupiah", [])],
        ["percent:1", F.Filter(12.345, "percent", ["1"])],
        ["round:2", F.Filter(3.145, "round", ["2"])],
        ["truncate:40", F.Filter(data.desc, "truncate", ["40"])],
        ["more:25", F.Filter(data.desc, "more", ["25"])],
        ["slug", F.Filter(data.name, "slug", [])],
        ["escape", F.Filter("<b>x</b>", "escape", [])],
        ["strip_tags", F.Filter(data.htmlSnippet, "strip_tags", [])],
        ["date:YYYY-MM-DD", F.Filter(data.isoDate, "date", ["YYYY-MM-DD"])],
        ["indonesian_date", F.Filter(data.isoDate, "indonesian_date", [])],
        ["time_ago (ISO)", F.Filter(data.isoDate, "time_ago", [])],
        ["filesize", F.Filter(data.bytes, "filesize", [])],
        ["yesno", F.Filter(true, "yesno", ["Ya", "Tidak"])],
        ["default:—", F.Filter(data.emptyLabel, "default", ["—"])],
        ["length (array)", F.Filter(data.tags, "length", [])],
        ["first", F.Filter(data.tags, "first", [])],
        ["last", F.Filter(data.tags, "last", [])],
        ["join", F.Filter(data.tags, "join", [" | "])],
        ["number", F.Filter(12345.6, "number", [])],
        ["percentage", F.Filter(88, "percentage", [])],
        ["phone", F.Filter(data.phoneRaw, "phone", [])],
        ["mask:*,2,2", F.Filter("secretvalue", "mask", ["*", "2", "2"])],
        ["replace:a,X", F.Filter("banana", "replace", ["a", "X"])],
        ["url_encode", F.Filter("a/b", "url_encode", [])],
        ["json_encode", F.Filter({ a: 1 }, "json_encode", [])],
        [
          "parseFilters",
          JSON.stringify(F.parseFilters("lower|truncate:8")),
        ],
      ];

      const directTable = directRows
        .map(
          ([label, val]) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;vertical-align:top;font-family:ui-monospace,monospace;font-size:.76rem;white-space:nowrap">${escapeHtml(label)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;word-break:break-word">${escapeHtml(String(val))}</td>
        </tr>`
        )
        .join("");

      const templateBlock = `
        <h2 style="font-size:1.05rem;margin:1.25rem 0 0.4rem">processTemplate — placeholder + pipa</h2>
        <div class="nexa-filter-demo-tpl" style="border:1px solid #e5e7eb;border-radius:8px;padding:1rem 1.1rem;background:#fafafa;line-height:1.55;margin-bottom:1rem">
          <p style="margin:0 0 .4rem"><strong>Nama:</strong> {name|capitalize}</p>
          <p style="margin:0 0 .4rem"><strong>Harga:</strong> {amount|decimal_to_rupiah}</p>
          <p style="margin:0 0 .4rem"><strong>Ringkas:</strong> {desc|truncate:55}</p>
          <p style="margin:0 0 .4rem"><strong>Slug:</strong> {name|slug}</p>
          <p style="margin:0 0 .4rem"><strong>Tanggal:</strong> {isoDate|indonesian_date}</p>
          <p style="margin:0 0 .4rem"><strong>Tag:</strong> {tags|join: · }</p>
          <p style="margin:0"><strong>Status (badge):</strong> {status|badge}</p>
        </div>
        <h2 style="font-size:1.05rem;margin:0 0 0.4rem">Ternary (processTernary)</h2>
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:1rem;background:#f8fafc;margin-bottom:1rem">
          <p style="margin:0">{status === 'active' ? 'Kondisi: aktif' : 'Kondisi: non-aktif'}</p>
          <p style="margin:0.5rem 0 0">{qty > 10 ? 'Stok cukup' : 'Stok tipis'}</p>
        </div>
        <h2 style="font-size:1.05rem;margin:0 0 0.4rem">Switch (processSwitch)</h2>
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:1rem;background:#fffef8">
          {switch status}
          {case 'active'}<span style="color:green;font-weight:600">Aktif</span>{/case}
          {case 'pending'}Menunggu{/case}
          {default}Status lain{/default}
          {/switch}
        </div>
      `;

      const rendered = F.processTemplate(templateBlock, data);

      /** Rantai filter di template: lower lalu truncate */
      const chainTpl =
        "<p style='margin:.75rem 0 0'><strong>Rantai:</strong> {name|lower|truncate:12}</p>";
      const chainOut = F.processTemplate(chainTpl, data);

      /** nl2br + icon mengeluarkan HTML — hanya data statis demo */
      const htmlTpl = `
        <p style="margin:.75rem 0 0"><strong>nl2br:</strong> {staticLines|nl2br}</p>
        <p style="margin:.5rem 0 0"><strong>icon:</strong> {staticIcon|icon:home,20px}</p>
      `;
      const htmlData = {
        ...data,
        staticLines: "Baris satu\\nBaris dua",
        staticIcon: "home",
      };
      const htmlOut = F.processTemplate(htmlTpl, htmlData);

      container.innerHTML = `
        <style>
          .nexa-filter-demo { max-width: 48rem; line-height: 1.55; }
          .nexa-filter-demo h1 { margin-top: 0; }
          .nexa-filter-demo .direct-wrap { overflow-x: auto; margin-top: 0.5rem; }
          .nexa-filter-demo table { width: 100%; border-collapse: collapse; font-size: 0.88rem; min-width: 320px; }
          .nexa-filter-demo code { font-size: 0.85em; }
          .nexa-filter-note {
            font-size: 0.82rem; opacity: 0.9; margin: 1rem 0 0;
            padding: 10px 12px; background: #f0f4f8; border-radius: 8px;
          }
        </style>
        <div class="nexa-filter-demo">
          <h1>NXUI.Filter (NexaFilter)</h1>
          <p style="margin-top:0;opacity:.9">
            <code>assets/modules/Dom/NexaFilter.js</code> — <code>new NXUI.Filter()</code>,
            <code>.Filter(value, name, args)</code>, <code>.parseFilters</code>, <code>.processTemplate</code>.
          </p>
          <p class="nexa-filter-note">
            Tabel di bawah <strong>tidak memuat semua</strong> cabang <code>Filter()</code> (mis. <code>json_decode</code>, <code>base64_*</code>, <code>md5</code> placeholder, <code>ellipsis</code>, <code>split</code>, <code>age</code>, <code>dayname</code>, <code>html_decode</code>, …).
            Lihat <code>switch (filterName)</code> di <code>NexaFilter.js</code> untuk daftar penuh.
          </p>
          <h2 style="font-size:1.05rem;margin:1rem 0 0.35rem">Filter langsung (cuplikan)</h2>
          <div class="direct-wrap">
            <table>
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #ccc;width:11rem">Filter</th>
                  <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #ccc">Hasil</th>
                </tr>
              </thead>
              <tbody>${directTable}</tbody>
            </table>
          </div>
          <div id="nexa-filter-processed-mount"></div>
        </div>
      `;

      const mount = container.querySelector("#nexa-filter-processed-mount");
      if (mount) {
        mount.innerHTML = rendered + chainOut + htmlOut;
      }
    }
  );
}
