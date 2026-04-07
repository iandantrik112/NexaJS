// Export function untuk route 'home'
export async function beranda(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Beranda | App",
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
        <div class="main-splash">
          <img
            class="main-splash__icon"
            src="/assets/images/icon.png"
            alt=""
            width="50"
            height="50"
          />
          <div class="main-splash__headlines">
            <h1 class="main-splash__welcome">NexaJS Framework</h1>
          </div>
          <p class="main-splash__lead">
            Bangun aplikasi web modern dengan routing SPA, worker, dan pola NexaUI —
            satu tempat untuk struktur yang rapi dan siap dikembangkan.
          </p>
          <p class="main-splash__hint">Contoh tautan:</p>
          <ul class="main-splash__nav">
            <li><a href="/beranda" id="nav-home">Beranda</a></li>
            <li><a href="/about" id="nav-about">About</a></li>
            <li><a href="/blog" id="nav-blog">Blog</a></li>
          </ul>
        </div>
        `;
    // }
  });
}
