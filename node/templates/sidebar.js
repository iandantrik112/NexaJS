/**
 * Route `/sidebar` — demo `NXUI.Sidebar` / `NXUI.NexaSidebar` (`assets/modules/Sidebar/NexaSidebar.js`).
 * Instance lokal + destroy saat keluar route (hindari bentrok dengan singleton `initSidebar` di halaman lain).
 */
let _sidebarDemoInstance = null;

/** Menu contoh: slug = path SPA (tanpa slash depan di data; href dijadi `/slug`). */
const sidebarDemoData = {
  demo_rute: [
    { name: "Beranda", slug: "beranda" },
    { name: "Grid", slug: "grid" },
    { name: "Dropdown", slug: "dropdown" },
    { name: "Form", slug: "form" },
    { name: "Sidebar (halaman ini)", slug: "sidebar" },
  ],
  demo_nested: [{ name: "DS / Data", slug: "ds/data" }],
};

function destroySidebarDemo() {
  if (_sidebarDemoInstance && typeof _sidebarDemoInstance.destroy === "function") {
    try {
      _sidebarDemoInstance.destroy();
    } catch (_) {
      /* ignore */
    }
  }
  _sidebarDemoInstance = null;
}

export async function sidebar(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Sidebar | App",
        description: "Demo NexaSidebar — menu kolaps, aktif dari URL, tautan SPA.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      destroySidebarDemo();

      container.innerHTML = `
        <style>
          .nexa-sidebar-demo-page {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: flex-start;
            max-width: 960px;
          }
          /* Sidebar bawaan .nx-sidebar pakai fixed; di dalam #main kita pakai layout biasa */
          .nexa-sidebar-demo-page .nexa-sidebar-demo-aside.nx-sidebar {
            position: relative;
            top: auto;
            left: auto;
            height: auto;
            max-height: 70vh;
            width: min(280px, 100%);
            flex: 0 0 auto;
            z-index: 1;
            margin: 0;
          }
          .nexa-sidebar-demo-main {
            flex: 1 1 280px;
            min-width: 0;
            line-height: 1.55;
          }
          .nexa-sidebar-demo-main h1 { margin-top: 0; font-size: 1.5rem; }
          .nexa-sidebar-demo-main pre {
            font-size: 0.72rem;
            padding: 12px 14px;
            background: #1e1e1e;
            color: #e4e4e4;
            border-radius: 8px;
            overflow: auto;
          }
        </style>
        <div class="nexa-sidebar-demo-page">
          <aside class="nx-sidebar nexa-sidebar-demo-aside" id="nexa-sidebar-demo-root" aria-label="Menu demo"></aside>
          <div class="nexa-sidebar-demo-main">
            <h1>NXUI.Sidebar (NexaSidebar)</h1>
            <p style="margin-top:0;opacity:.9;font-size:.95rem">
              Kelas di <code>assets/modules/Sidebar/NexaSidebar.js</code>. Akses: <code>new NXUI.Sidebar(options)</code>
              atau <code>new NXUI.NexaSidebar(options)</code>, lalu <code>.init()</code>.
            </p>
            <p style="font-size:.9rem">
              Untuk singleton + muat CSS + sync <code>nxui:routeChange</code>, gunakan
              <code>await NXUI.initSidebar({ container, data, basePath, ... })</code> (lihat JSDoc di modul).
            </p>
            <p style="font-size:.9rem"><strong>Kiri:</strong> menu dari <code>data</code> (kategori → item <code>name</code> / <code>slug</code>).
            Tautan memakai path SPA (<code>/beranda</code>, <code>/ds/data</code>, …).</p>
            <pre><code>new NXUI.Sidebar({
  container: '#nexa-sidebar-demo-root',
  data: sidebarDemoData,
  basePath: '',
  storageKey: 'nexa-sidebar-demo-spa',
  expandedByDefault: ['demo_rute'],
  linkGenerator: (item, base) => \`/\${item.slug}\`,
}).init();</code></pre>
          </div>
        </div>
      `;

      const root = container.querySelector("#nexa-sidebar-demo-root");
      if (!root || typeof NXUI === "undefined" || !NXUI.Sidebar) {
        console.error("NXUI.Sidebar tidak tersedia atau container hilang.");
        return;
      }

      /* Gaya: `nexa.css` meng-import Sidebar/NexaSidebar.css; initSidebar juga bisa memuat dinamis */

      /** SPA: jangan gabungkan dengan `NEXA.url` API — href absolut path app */
      const spaLink = (item) => `/${item.slug.replace(/^\//, "")}`;

      _sidebarDemoInstance = new NXUI.Sidebar({
        container: root,
        data: sidebarDemoData,
        basePath: "",
        storageKey: "nexa-sidebar-demo-spa",
        expandedByDefault: ["demo_rute"],
        activeClass: "active-grid",
        persistState: true,
        autoDetectActive: true,
        linkGenerator: (item) => spaLink(item),
      });
      _sidebarDemoInstance.init();
    }
  );
}
