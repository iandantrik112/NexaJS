// Route `svg` → halaman demo NXUI.Svg (factory dari assets/modules/Svg/index.js, diekspor di Nexa.js sebagai NXUI.Svg)
export async function svg(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Svg | App",
    description: "Demo NXUI.Svg — ilustrasi dari svgContent, fill, dan xml inline.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <h1>NXUI.Svg</h1>
      <p>Fungsi <code>NXUI.Svg(options)</code> mengembalikan <code>HTMLElement</code> (wrapper <code>.svg-container</code>) berisi parsed <code>&lt;svg&gt;</code>.</p>
      <ul style="margin:0.5rem 0 1rem 1.25rem;line-height:1.5;">
        <li><strong>name</strong> — kunci di <code>svgContent</code>: <code>forgot</code>, <code>nexa</code>, <code>qr</code></li>
        <li><strong>fill</strong> — mengganti aksen undraw <code>#17B8A6</code> (opsional)</li>
        <li><strong>xml</strong> — string SVG mentah</li>
        <li><strong>source</strong> — kunci <code>assetsImage</code> (perlu <code>register</code> dulu di <code>localImage.js</code>)</li>
      </ul>
      <div id="nexa-svg-demo-row" style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;"></div>
    `;

    const row = container.querySelector("#nexa-svg-demo-row");
    if (!row || typeof NXUI === "undefined" || typeof NXUI.Svg !== "function") {
      console.error("NXUI.Svg tidak tersedia — pastikan Nexa.js dimuat.");
      return;
    }

    // svgContent: forgot + warna kustom
    row.appendChild(
      NXUI.Svg({
        name: "forgot",
        width: 200,
        height: 178,
        fill: "#CB2F2F",
        className: "demo-svg-forgot",
      })
    );

    // svgContent: nexa (default teal #17B8A6)
    row.appendChild(
      NXUI.Svg({
        name: "nexa",
        width: 220,
        height: 176,
        className: "demo-svg-nexa",
      })
    );

    // svgContent: qr (lebih kecil)
    row.appendChild(
      NXUI.Svg({
        name: "qr",
        width: 180,
        height: 110,
        fill: "#2563eb",
        className: "demo-svg-qr",
      })
    );

    // xml inline (tanpa svgContent)
    row.appendChild(
      NXUI.Svg({
        xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#17B8A6"/><path fill="#fff" d="M12 7v6l4 2"/></svg>',
        width: 56,
        height: 56,
        className: "demo-svg-xml",
        id: "demo-clock-icon",
      })
    );
  });
}
