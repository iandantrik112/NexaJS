// Export function untuk route 'contact/data' (menjadi 'contact_data.js')
export async function lightbox(page, route) {
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
<img id="myImg" src="http://localhost:3000/drive/300x300/2026/03/cli_1774931672_aad1da64.png" alt="Snow" style="width:100%;max-width:300px" class="nexa-lightbox">
<!-- Map container -->

<img id="myImg2" src="http://localhost:3000/drive/300x300/2026/03/a1_1774931292_0613848b.png" alt="Snow" style="width:100%;max-width:300px" class="nexa-lightbox">



        `;
        // PILIH SALAH SATU CARA INISIASI:
        
        // CARA 1: Manual per image (NONAKTIF)
        // const connection1 = new NexaLightbox("#myImg");
        // const connection2 = new NexaLightbox("#myImg2");
        
        // CARA 2: Auto-initialize (NONAKTIF - karena sudah manual di atas)
        // Otomatis bekerja dengan class 'nexa-lightbox' tanpa kode tambahan
        
        // CARA 3: Initialize semua sekaligus (AKTIF)
        const allLightboxes = NXUI.Lightbox.initAll('.nexa-lightbox');
        console.log('Initialized', allLightboxes.length, 'lightboxes');



    });
  }
  