        // Export function untuk route 'contact/data' (menjadi 'contact_data.js')
export async function notifikasi(page, route) {
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
        <a  onclick="setNotifikasi('modal1');" href="javascript:void(0);">Notifikasi</a>
          <p><strong>Description:</strong> </p>
          <div>
            <h2>Contact Information</h2>
            <p>Data kontak akan ditampilkan di sini.</p>
          </div>
        `;
    });
  }


  nx.setNotifikasi = async function (id) {
     console.log('id:', id);
    try {

    const Notif = new NXUI.Notifikasi({ autoHideDelay: 3000 }); // 3 seconds

     Notif.show({
          type: "success",
          title: "Operation Successful",
          subtitle: "Your data has been saved successfully!",
        });



    } catch (e) {
      console.error("[modal.js] Modal error:", e);
    }
};