/**
 * Route `/grid` — demo NexaGrid sesuai docs/NexaGrid.md:
 * - Parameter `style` ke `route.register` → `route.applyGridStyle(container, style)`
 * - Layout: header, 8+4, tiga kolom responsif, offset, footer + cuplikan API
 */
const gridDemoStyle = {
  useContainer: true,
  container: { nx: true },
  rows: [
    {
      marginBottom: "1rem",
      columns: [
        {
          cols: 12,
          textAlign: "center",
          padding: "0.5rem 0 1rem",
          content: `
            <h1 style="margin:0 0 0.35rem;font-size:1.75rem">NexaGrid</h1>
            <p style="margin:0;line-height:1.5;opacity:.88;font-size:.95rem">
              Contoh <code>route.applyGridStyle(container, style)</code> — konfigurasi object ketiga pada
              <code>route.register(page, handler, style, routeMeta)</code>.
              Dokumentasi: <code>docs/NexaGrid.md</code>
            </p>`,
        },
      ],
    },
    {
      marginBottom: "1.25rem",
      columns: [
        {
          cols: 8,
          padding: "1rem",
          content: `
            <h2 style="margin:0 0 .5rem;font-size:1.15rem">Konten utama (cols 8)</h2>
            <p style="margin:0;line-height:1.55;font-size:.9rem">
              Pola ini sama dengan contoh “About Page” di NexaGrid: satu baris 12 judul, lalu baris 8 + 4.
            </p>`,
        },
        {
          cols: 4,
          padding: "1rem",
          content: `
            <aside style="background:#f3f4f6;border-radius:8px;padding:1rem;font-size:.875rem;line-height:1.5">
              <strong>Sidebar</strong> (cols 4)<br/>
              <span style="opacity:.85">Class nx-container / nx-row / nx-col dari grid system.</span>
            </aside>`,
        },
      ],
    },
    {
      marginBottom: "1.25rem",
      columns: [
        {
          cols: 12,
          padding: "0 0 .5rem",
          content: `<h2 style="margin:0;font-size:1.05rem">Tiga kolom responsif</h2>
            <p style="margin:.35rem 0 0;font-size:.85rem;opacity:.85">cols 12 → md 6 → lg 4 (lihat Contoh 3 di NexaGrid.md)</p>`,
        },
      ],
    },
    {
      marginBottom: "1.25rem",
      columns: [
        {
          cols: 6,
        //  responsive: { md: 6, lg: 4 },
          padding: "0.5rem",
          content: `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:1rem;background:#fafafa;font-size:.9rem"><strong>Kolom 1</strong><br/><span style="opacity:.8">12 / 6 / 4</span></div>`,
        },
        {
          cols: 6,
        //   responsive: { md: 6, lg: 4 },
          padding: "0.5rem",
          content: `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:1rem;background:#fafafa;font-size:.9rem"><strong>Kolom 2</strong><br/><span style="opacity:.8">12 / 6 / 4</span></div>`,
        },
        {
          cols: 12,
          responsive: { md: 12, lg: 4 },
          padding: "0.5rem",
          content: `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:1rem;background:#fafafa;font-size:.9rem"><strong>Kolom 3</strong><br/><span style="opacity:.8">12 / 12 / 4</span></div>`,
        },
      ],
    },
    {
      marginBottom: "1.25rem",
      columns: [
        {
          cols: 6,
          offset: 3,
          textAlign: "center",
          padding: "1rem",
          content: `<p style="margin:0;font-size:.9rem"><strong>Offset 3</strong> — lebar 6 kolom, bergeser dari kiri (Contoh 6 NexaGrid.md)</p>`,
        },
      ],
    },
    {
      columns: [
        {
          cols: 12,
          textAlign: "center",
          padding: "1rem 0 0",
          content: `
            <p style="margin:0 0 .5rem;font-size:.85rem;opacity:.9">Alternatif imperatif:</p>
            <pre style="margin:0 auto;max-width:42rem;text-align:left;font-size:.72rem;line-height:1.45;padding:12px 14px;background:#1e1e1e;color:#e4e4e4;border-radius:8px;overflow:auto">await route.createGridLayout(container, rows, { useContainer: true, nx: true });
// atau
await NXUI.grid.createGrid({ parent: container, useContainer: true, container: { nx: true }, rows });</pre>`,
        },
      ],
    },
  ],
};

export async function grid(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Grid | App",
        description: "Demo NexaGrid — applyGridStyle & parameter style (docs/NexaGrid.md).",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      const effectiveStyle = style && style.rows?.length ? style : gridDemoStyle;

      if (typeof NXUI !== "undefined" && NXUI.grid) {
        await route.applyGridStyle(container, effectiveStyle);
        return;
      }

      console.warn("NXUI.grid tidak tersedia — fallback HTML sederhana.");
      container.innerHTML =
        "<h1>NexaGrid</h1><p>NXUI.grid tidak dimuat. Periksa import Nexa.js.</p>";
    },
    gridDemoStyle,
    {
      title: "Grid | App",
      description: "Demo NexaGrid — applyGridStyle & parameter style (docs/NexaGrid.md).",
    }
  );
}
