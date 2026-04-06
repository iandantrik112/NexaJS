// Export function untuk route 'home'
export async function beranda(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Nexa",
    description: "Halaman beranda.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    // Contoh penggunaan htmlDom().assign() - Load template dari folder theme
    // Syntax: NXUI.htmlDom().assign(file, variables, template, options)
    // try {
    //   const htmlDom = NXUI.NexaHtml();
    //  const lastRoute = await NXUI.ref.get("bucketsRoute", "lastRoute");
    //    console.log("lastRoute:", lastRoute);
    //   // Load template dengan variables
    //   const content = await htmlDom.html("home", {
    //     title: "Home Page",
    //     description: "Ini adalah halaman Home",
    //     route: routeName,
    //   }); // template default: 'theme'
    //   container.innerHTML = content.content;
    // } catch (error) {
      // Fallback jika template tidak ditemukan
      container.innerHTML = `
      <a href="/beranda" id="nav-home">Beranda</a>
      <a href="/about" id="nav-about">About</a>
      <a href="/blog" id="nav-blog">Blog</a>
      <a href="/contact" id="nav-contact">Contact</a>
      <a href="/exsampel" id="nav-contact">exsampel</a>
      <a href="/guides" id="nav-contact">guides</a>
      <a href="/modal" id="nav-contact">modal</a>
      <a href="/colom" id="nav-contact">Colom</a>
      <a href="/form" id="nav-contact">form</a>
      <a href="/ds/data" id="nav-contact-data">Contact / data</a>
      <a href="/wizard" id="nav-contact-wizard">Wizard</a>
      <a href="/tables" id="nav-contact-tables">Tables</a>
      <a href="/notifikasi" id="nav-contact-notifikasi">Notifikasi</a>
      <a href="/voice" id="nav-contact-notifikasi">Voice</a>
      <a href="/markdown" id="nav-contact-notifikasi">Markdown</a>
      <a href="/field" id="nav-contact-notifikasi">Field</a>
      <a href="/checkable" id="nav-contact-notifikasi">Checkable</a>
      <a href="/qrcode" id="nav-contact-notifikasi">QRCode</a>
      <a href="/prind" id="nav-contact-notifikasi">Prind</a>
      <a href="/escpos" id="nav-contact-notifikasi">Escpos</a>
      <a href="/lightbox" id="nav-contact-notifikasi">Lightbox</a>
      <a href="/svg" id="nav-contact-notifikasi">Svg</a>
      <a href="/scimport" id="nav-contact-notifikasi">Import</a>
      <a href="/filetype" id="nav-contact-notifikasi">File Type</a>
      <a href="/dropdown" id="nav-contact-notifikasi">Dropdown</a>
      <a href="/grid" id="nav-contact-notifikasi">Grid</a>
      <a href="/sidebar" id="nav-contact-notifikasi">Sidebar</a>
      <a href="/sortable" id="nav-contact-notifikasi">Sortable</a>
      <a href="/scroll" id="nav-contact-notifikasi">Scroll</a>
      <a href="/filter" id="nav-contact-notifikasi">Filter</a>
      <a href="/eventhandling" id="nav-contact-notifikasi">Handling</a>
      <a href="/network" id="nav-contact-notifikasi">Network</a>
      <a href="/geolocation" id="nav-contact-notifikasi">Geolocation</a>
      <a href="/terminal" id="nav-contact-notifikasi">Terminal</a>
        `;
    // }
  });
}
