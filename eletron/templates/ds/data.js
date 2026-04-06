// Export function untuk route 'contact/data' (menjadi 'contact_data.js')
export async function ds_data(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Contact Data | App",
    description: "Data kontak.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    console.log("📍 Navigating to:", NEXA);
    container.innerHTML = `
        <h1>Contact Data Page</h1>
        <p>Ini adalah halaman Contact Data.</p>
        <p>Route: ${routeName}</p>
        <p><strong>Title:</strong> </p>
        <p><strong>Description:</strong> </p>
        <div>
          <h2>Contact Information</h2>
          <p>Data kontak akan ditampilkan di sini.</p>
        </div>
      `;
  });
}
