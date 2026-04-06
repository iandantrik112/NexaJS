/** Instance NexaTables halaman ini — di-destroy saat kunjungan ulang / navigasi */
let _tablesPageInstances = [];

/**
 * Route `/tables` — contoh `NXUI.NexaTables` + `table.css` (cari, sort, paginasi).
 */
export async function tables(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Tables | App",
        description: "Contoh NexaTables dengan data statis dan NXUI.Storage.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      _tablesPageInstances.forEach((t) => {
        try {
          t.destroy();
        } catch (_) {
          /* ignore */
        }
      });
      _tablesPageInstances = [];

      container.innerHTML = `
        <h1>NexaTables</h1>
        <p>Contoh tabel interaktif: filter teks, sort kolom, paginasi. CSS tabel + dependensi ada di <code>index.html</code> (<code>table.css</code>, paginasi, form assets, tombol, select2).</p>
        <p><strong>Route:</strong> ${routeName}</p>

        <h2 style="margin-top:1.5rem">1. Data statis</h2>
        <p style="font-size:0.9rem;opacity:0.85">Kolom ditebak dari properti objek; judul kolom bisa diatur lewat opsi <code>columns</code>.</p>
        <div id="nx-tables-demo-static"></div>

        <h2 style="margin-top:1.5rem">2. Dari <code>NXUI.Storage</code> — GET typicode (uji banyak baris)</h2>
        <p style="font-size:0.9rem;opacity:0.85">Pola <strong><code>NexaTables.fromStorage</code></strong> dengan <code>method: 'get'</code> — setara memanggil <code>Storage().get(NEXA.typicode)</code> lalu <code>rowsFromStorageResponse</code>. Array penuh di memori; DOM satu halaman.</p>
        <div id="nx-tables-demo-storage"></div>

        <h2 style="margin-top:1.5rem">3. <code>Storage</code> — <code>model</code> + <code>query</code> (pola seperti <code>NexaDom</code>)</h2>
        <p style="font-size:0.9rem;opacity:0.85">
          Contoh pemakaian <code>new NXUI.NexaTables({ storage: { model, query } })</code> — sama gaya dengan <code>templates/exsampel.js</code> (bagian <code>storage: { model, query }</code>).
        </p>
        <div id="nx-tables-demo-storage-post"></div>

        <h2 style="margin-top:1.5rem">4. Query <code>buckets</code> — objek <code>app</code> (seperti <code>about.js</code>)</h2>
        <p style="font-size:0.9rem;opacity:0.85">
          Pola <code>Storage().buckets(app).get({ limit })</code> + <code>NexaTables.fromBuckets</code>. Ini setara jenis query join/alias, berbeda dari <code>storage: &#123; model, query &#125;</code> di contoh NexaDom (<code>exsampel.js</code>).
        </p>
        <div id="nx-tables-demo-buckets"></div>

        <h2 style="margin-top:1.5rem">5. Kolom eksplisit + format sel</h2>
        <div id="nx-tables-demo-columns"></div>

        <h2 style="margin-top:1.5rem">6. Inline editing – semua type</h2>
        <p style="font-size:0.9rem;opacity:0.85">
          Contoh opsi <code>editing</code> dengan berbagai tipe input: text, number, checkbox, select, textarea, search, email, password, tel, url, date, datetime-local, time, color, range.
        </p>
        <div id="nx-tables-demo-editing-types"></div>
      `;

      const demoStatic = [
        { id: 1, produk: "Laptop", stok: 12, aktif: true },
        { id: 2, produk: "Mouse", stok: 40, aktif: true },
        { id: 3, produk: "Keyboard", stok: 8, aktif: false },
        { id: 4, produk: "Monitor", stok: 5, aktif: true },
        { id: 5, produk: "Webcam", stok: 0, aktif: false },
      ];

      const t1 = new NXUI.NexaTables({
        container: "#nx-tables-demo-static",
        data: demoStatic,
        caption: "Inventori (data lokal)",
        /** Kolom pertama nomor urut; `id` tetap di data tapi tidak ditampilkan (sensitif) */
        rowNumberColumn: true,
        hideColumnKeys: ["id"],
        editing:{
            produk: {
                type: "text",   
            },
            stok: {
                type: "number",
                min: 0,
                max: 100,
                step: 1,
            },
            aktif: {
                type: "checkbox",
            },
        },
        onEdit: (key, value, row) => {
            console.log("NexaTables row edit:", key, value, row);
        },
    
        pageSize: 4,
        export: {
          enabled: true,
          types: ["csv", "json", "xlsx", "pdf"], // default: ["csv"]
          include: "filtered",
          fileName: "Inventori",
        },

        /** Warna tombol halaman aktif paginasi (override `.pagination .page-link.active` di pagination.css) */
        paginationActiveBg: "#1730B4",
        paginationActiveBorder: "#1730B4",
        paginationActiveColor: "#ffffff",
        columns: [
          { key: "produk", title: "Produk" },
          { key: "stok", title: "Stok" },
          { key: "aktif", title: "Aktif" },
        ],
      });
      await t1.mount();
      _tablesPageInstances.push(t1);

      try {
        const t2 = await NXUI.NexaTables.fromStorage(
          "#nx-tables-demo-storage",
          { method: "get", url: NEXA.typicode },
          {
            caption: "Typicode — GET via fromStorage (full array)",
            pageSize: 10,
            export: {
              enabled: true,
              types: ["csv"],
              include: "filtered",
              fileName: "Typicode",
            },
            columns: [
              { key: "id", title: "ID" },
              { key: "title", title: "Judul" },
              { key: "albumId", title: "Album" },
            ],
          }
        );
        _tablesPageInstances.push(t2);
      } catch (e) {
        console.warn("tables.js: typicode GET gagal (abaikan jika offline):", e);
      }

      try {
        // Pola sama seperti `templates/exsampel.js`: storage: { model, query }
        const tPostLike = new NXUI.NexaTables({
          container: "#nx-tables-demo-storage-post",
          storage: {
            model: "demo",
            select: ["id", "title"], // opsional, default "*"
            query: (q) => q.whereNotNull("id"),
          },
          caption: "Storage().model('demo') + query — pola seperti NexaDom",
          pageSize: 5,
          rowNumberColumn: true,
          hideColumnKeys: ["id"],
          export: {
            enabled: true,
            types: ["csv"],
            include: "filtered",
            fileName: "Demo",
          },
          editing:{
            title: {
                type: "text",   
            },
           
        },

          columns: [{ key: "title", title: "Nama" }],
          onEdit: (key, value, row) => {
            console.log("NexaTables row edit:", key, value, row);
        },
          spinner: {
            enabled: true,
            centerScreen: false,
            type: "overlay",
            size: "medium",
            color: "#CB2F2F",
            position: "center",
            message: "Memuat data demo…",
          },
        });
        await tPostLike.mount();
        _tablesPageInstances.push(tPostLike);
      } catch (e) {
        console.warn("tables.js: Storage model demo gagal (backend / jaringan):", e);
      }

      try {
        const app = {
          alias: [
            "user.status AS status",
            "user.nama AS nama",
            "user.jabatan AS jabatan",
            "user.avatar AS avatar",
            "user.id AS id",
          ],
          aliasNames: ["status", "nama", "jabatan", "avatar", "id"],
         
          tabelName: ["user"],
          where: false,
          group: false,
          order: false,
          operasi: {
            user: {
              type: "single",
              index: "",
              aliasIndex: "user",
              keyIndex: 261760199266386,
              target: "",
              condition: "",
              aliasTarget: "",
              keyTarget: "",
            },
          },
          access: "public",
          id: 1,
        };

        const tBuckets = await NXUI.NexaTables.fromBuckets(
          "#nx-tables-demo-buckets",
          app,
          { limit: 50 },
          {
            caption: "Federated — buckets(app).get({ limit: 50 })",
            pageSize: 8,
            rowNumberColumn: true,
            hideColumnKeys: ["id"],
            export: {
              enabled: true,
              types: ["csv"],
              include: "filtered",
              fileName: "User_buckets",
            },
            columns: [
              { key: "nama", title: "Nama" },
              { key: "status", title: "Status" },
              { key: "jabatan", title: "Jabatan" },
              { key: "avatar", title: "Avatar" },
            ],
          }
        );
        _tablesPageInstances.push(tBuckets);
      } catch (e) {
        console.warn("tables.js: buckets(app).get gagal (backend / DB):", e);
      }

      const t3 = new NXUI.NexaTables({
        container: "#nx-tables-demo-columns",
        data: [
          { kode: "A1", nilai: 42.5, catatan: { tier: "gold" } },
          { kode: "B2", nilai: 10, catatan: { tier: "silver" } },
        ],
        caption: "Objek bersarang di sel (JSON)",
        pageSize: 5,
        export: {
          enabled: true,
          types: ["csv"],
          include: "filtered",
          fileName: "Tabel_JSON",
        },
        // Column actions di ujung tabel (dropdown + icon)
        actions: {
          edit: true,
          delete: true,
          view: true,
          add: true,
          export: true,
          import: true,
          print: true,
          share: true,
        },
        onAction: (action, row) => {
          console.log("NexaTables row action:", action, row);
        },
        columns: [
          { key: "kode", title: "Kode" },
          { key: "nilai", title: "Nilai" },
          { key: "catatan", title: "Catatan" },
        ],
        formatCell: (value, key) => {
          if (key === "nilai" && typeof value === "number") {
            return value.toFixed(1);
          }
          if (value != null && typeof value === "object") {
            return JSON.stringify(value);
          }
          return String(value ?? "");
        },
      });
      await t3.mount();
      _tablesPageInstances.push(t3);

      // 6. Demo inline editing – semua type yang didukung `editing`
      const demoTypes = [
        {
          id: 1,
          text: "Halo",
          number: 10,
          checkbox: true,
          select: "A",
          textarea: "Catatan awal",
          search: "query 1",
          email: "user@example.com",
          password: "secret",
          tel: "08123456789",
          url: "https://example.com",
          date: "2026-04-03",
          datetime: "2026-04-03T10:30",
          time: "10:30",
          color: "#ff0000",
          range: 50,
        },
        {
          id: 2,
          text: "Halo lagi",
          number: 20,
          checkbox: false,
          select: "B",
          textarea: "Catatan lain",
          search: "query 2",
          email: "user2@example.com",
          password: "secret2",
          tel: "08987654321",
          url: "https://example.org",
          date: "2026-04-04",
          datetime: "2026-04-04T11:00",
          time: "11:00",
          color: "#00ff00",
          range: 75,
        },
      ];

      const tEditTypes = new NXUI.NexaTables({
        container: "#nx-tables-demo-editing-types",
        data: demoTypes,
        caption: "Inline editing – semua type",
        pageSize: 5,
        columns: [
          { key: "id", title: "ID" },
          { key: "text", title: "text" },
          { key: "number", title: "number" },
          { key: "checkbox", title: "checkbox" },
          { key: "select", title: "select" },
          { key: "textarea", title: "textarea" },
          { key: "search", title: "search" },
          { key: "email", title: "email" },
          { key: "password", title: "password" },
          { key: "tel", title: "tel" },
          { key: "url", title: "url" },
          { key: "date", title: "date" },
          { key: "datetime", title: "datetime-local" },
          { key: "time", title: "time" },
          { key: "color", title: "color" },
          { key: "range", title: "range" },
        ],
        editing: {
          text: { type: "text" },
          number: { type: "number", min: 0, max: 100, step: 1 },
          checkbox: { type: "checkbox" },
          select: {
            type: "select",
            options: ["A", "B", "C"],
          },
          textarea: { type: "textarea", rows: 3 },
          search: { type: "search" },
          email: { type: "email" },
          password: { type: "password" },
          tel: { type: "tel" },
          url: { type: "url" },
          date: { type: "date" },
          datetime: { type: "datetime-local" },
          time: { type: "time" },
          color: { type: "color" },
          range: { type: "range", min: 0, max: 100, step: 5 },
        },
        onEdit: (key, value, row) => {
          console.log("NexaTables editing-types:", key, value, row);
        },
      });
      await tEditTypes.mount();
      _tablesPageInstances.push(tEditTypes);
    }
  );
}
