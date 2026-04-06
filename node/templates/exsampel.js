/**
 * Contoh `NXUI.NexaDom` + query builder tabel (`docs/NexaModels.md`).
 * `storage.model` = nama tabel; `storage.query` = (builder) => … untuk where/join/dll.
 *
 * Alternatif tampilan tabel (filter/sort/paginasi klien + `table.css`) tanpa `render` HTML string:
 * `NXUI.NexaTables.fromStorage(container, { method: 'get'|'post'|'api', … }, tableOptions)` — lihat `assets/modules/Tables/NexaTables.js` dan `templates/tables.js`.
 */
let _exsampelNexaDom = null;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function exsampel(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Contoh NexaDom | App",
        description: "NexaDom + Storage().model() — tabel demo (NexaModels).",
      },
      style,
      nav = {},
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      if (_exsampelNexaDom && typeof _exsampelNexaDom.destroy === "function") {
        try {
          _exsampelNexaDom.destroy();
        } catch (_) {
          /* ignore */
        }
      }
      _exsampelNexaDom = null;

      container.innerHTML = `
        <section class="exsampel-nexadom" style="max-width:960px;margin:0 auto;">
          <h1>Contoh NexaDom + model(tabel)</h1>
          <p style="color:#555;line-height:1.5;">
            Sumber data: <code>Storage().model("demo")</code> + opsi <code>storage.query</code> untuk kondisi tetap
            (mis. <code>where</code>, <code>join</code>). Pagination/search/sort NexaDom ditambahkan setelah hook tersebut.
            Lihat <code>docs/NexaModels.md</code>.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:1rem 0;">
            <input type="search" id="exsampel-search" placeholder="Cari di title / slug…" autocomplete="off"
              style="flex:1;min-width:200px;padding:8px 12px;border:1px solid #ccc;border-radius:6px;">
            <button type="button" id="exsampel-sort" title="Toggle urutan title"
              style="padding:8px 14px;border:1px solid #333;background:#333;color:#fff;border-radius:6px;cursor:pointer;">
              Urutkan title
            </button>
          </div>
          <div id="exsampel-data" style="min-height:120px;"></div>
          <div id="exsampel-pagination" style="margin-top:12px;"></div>
          <p id="exsampel-info" style="margin-top:8px;color:#666;font-size:0.9rem;"></p>
        </section>
      `;

      // const demoSql = NXUI.Storage()
      //   .model("demo")
      //   .select("*")
      //   .whereNotNull("id")
      //   .toSql();
      // console.log("model(table) query (contoh + whereNotNull id):", demoSql);

      _exsampelNexaDom = new NXUI.NexaDom({
        container: "#exsampel-data",
        pagination: "#exsampel-pagination",
        paginationinfo: "#exsampel-info",
        searchElement: "#exsampel-search",
        sortClickElement: "#exsampel-sort",
        order: 5,
        sortBy: "title",
        sortOrder: "ASC",
        searchFields: ["title", "slug"],
        maxVisiblePages: 5,
        spinner: {
           enabled: true,        // Aktifkan/nonaktifkan spinner (default: true)
           centerScreen: true,   // Tampilkan di tengah layar (default: true) - jika false, tampil di dalam container
           type: 'overlay',      // Tipe spinner: 'overlay' | 'inline' | 'button' (default: 'overlay' jika centerScreen: true)
           size: 'medium',       // Ukuran: 'small' | 'medium' | 'large' (default: 'medium')
           color: '#CB2F2F',     // Warna spinner (default: '#007bff')
           position: 'center',   // Posisi untuk inline: 'center' | 'top' | 'bottom' (default: 'center')
           message: ''           // Pesan yang ditampilkan (optional, default: '')
       },
        // NexaDom: satu model + query(q). Untuk objek app (alias/operasi/buckets) + NexaTables, lihat templates/tables.js (demo 4) — NexaTables.fromBuckets.
        config:false,
        storage: {
          model: "demo",
          // select: ["id", "title", "slug", "deskripsi", "images"], // opsional, default "*"
          /** Kondisi & relasi dasar — sama untuk count + halaman data (sebelum LIKE search NexaDom). */
          query: (q) => q.whereNotNull("id"),
          // query: (q) => q.where("status", "=", 1).leftJoin("lain", "demo.id", "=", "lain.demo_id"),
        },
        render: (dataArray) => {
          if (!dataArray || dataArray.length === 0) {
            return '<p style="color:#888;">Tidak ada data.</p>';
          }
          return `
            <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
              <thead>
                <tr style="border-bottom:2px solid #ddd;">
                  <th style="text-align:left;padding:10px 8px;">No</th>
                  <th style="text-align:left;padding:10px 8px;">Title</th>
                  <th style="text-align:left;padding:10px 8px;">Slug</th>
                  <th style="text-align:left;padding:10px 8px;">Deskripsi</th>
                  <th style="text-align:left;padding:10px 8px;">Id</th>
                </tr>
              </thead>
              <tbody>
                ${dataArray
                  .map(
                    (item) => `
                  <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px 8px;">${item.no ?? ""}</td>
                    <td style="padding:10px 8px;">${escapeHtml(String(item.title ?? ""))}</td>
                    <td style="padding:10px 8px;">${escapeHtml(String(item.slug ?? ""))}</td>
                    <td style="padding:10px 8px;">${escapeHtml(String(item.deskripsi ?? ""))}</td>
                    <td style="padding:10px 8px;">${escapeHtml(String(item.id ?? ""))}</td>
                  </tr>`,
                  )
                  .join("")}
              </tbody>
            </table>
          `;
        },
      });
    },
  );
}
