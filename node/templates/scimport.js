// Route scimport — pola sama dengan CSS: NexaStylesheet.Dom + NexaScript.Dom
// JANGAN pakai NexaScript.modules(['text.js']): itu NexaUi → …/assets/modules/text.js + dynamic import() → 404 HTML → error MIME "text/html".
//
// Basis '/templates' OK jika SPA di root (mountPath '') dan appRoot 'templates'.
// Jika mountPath non-kosong / appRoot diubah, ganti ke path absolut penuh, mis.
// `/${mountPath}/templates` atau helper dari nexaPage.

export async function scimport(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Contact Data | App",
    description: "Data kontak.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    console.log("📍 Navigating to:", NEXA);

    container.innerHTML = `
      <h1>Contact Data Page</h1>
      <p>Ini adalah halaman Contact Data.</p>
      <p>Route: <code>${routeName}</code></p>
      <p><strong>Title:</strong> </p>
      <p><strong>Description:</strong> </p>
      <div>
        <h2>Contact Information</h2>
        <p>Data kontak akan ditampilkan di sini.</p>
      </div>
      <p id="scimport-text-target">Setelah <code>text.js</code> dimuat (lihat konsol + tag <code>&lt;script&gt;</code> di head).</p>
    `;

    console.log("NEXA:", NEXA);


    try {
      await NXUI.Stylesheet.Dom(["text.css"]);
      await NXUI.Script.Dom(["text.js"]);
    } catch (e) {
      console.error("[scimport] gagal memuat text.css / text.js:", e);
    }
  });
}
