// Export function untuk route 'guides'
// Mendukung sub-routes seperti: guides/pengenalan — tidak perlu daftar tiap sub-route di App.js
export async function guides(page, route) {
    route.register(page, async (routeName, container, routeMeta, style, nav = {}) => {
      console.log('📍 Navigating to:', routeName, nav);
      
      // baseRoute / subRoute dari argumen ke-5 (bukan routeMeta)
      const baseRoute = nav.baseRoute || page;
      const subRoute = nav.subRoute != null && nav.subRoute !== '' ? nav.subRoute : null;
      
      // Jika ada sub-route, tampilkan konten sub-route
      if (subRoute) {
        container.innerHTML = `
          <h1>Guides: ${subRoute}</h1>
          <p>Ini adalah halaman Guides untuk sub-route: <strong>${subRoute}</strong></p>
          <p>Route lengkap: ${routeName}</p>
          <p>Base route: ${baseRoute}</p>
          <p>Sub-route: ${subRoute}</p>
          <hr>
          <nav>
            <a href="guides">← Kembali ke Guides</a> |
            <a href="guides/pengenalan">Pengenalan</a> |
            <a href="guides/MVC">MVC</a>
          </nav>
        `;
      } else {
        // Tampilkan daftar sub-routes jika tidak ada sub-route
        container.innerHTML = `
          <h1>Guides Page</h1>
          <p>Ini adalah halaman Guides.</p>
          <p>Route: ${routeName}</p>
          <hr>
          <h2>Daftar Sub-Routes:</h2>
          <ul>
            <li><a href="guides/pengenalan">Pengenalan</a></li>
            <li><a href="guides/MVC">MVC Pattern</a></li>
            <li><a href="guides/komponen">Komponen</a></li>
            <li><a href="guides/state-management">State Management</a></li>
          </ul>
        `;
      }
    });
}

