// Export function untuk route 'blog'
const DEFAULT_BLOG_META = {
  title: "Blog | devjs",
  description: "Artikel blog.",
};

export async function blog(page, route) {
  route.register(page, async (routeName, container, routeMeta = DEFAULT_BLOG_META, style, nav = {}) => {
    console.log("📍 Navigating to:", routeName, routeMeta, nav);
    // baseRoute / subRoute dari argumen ke-5 (bukan routeMeta)
    const baseRoute = nav.baseRoute || page;
    const subRoute = nav.subRoute != null && nav.subRoute !== '' ? nav.subRoute : null;

    // Jika ada sub-route, tampilkan konten sub-route (sama pola seperti posdip/templates/assets/berita.js)
    if (subRoute) {

      const slug = routeName.split('/').filter(Boolean).pop();
      const data4 = await NXUI.Storage().example().newsId({ id: slug });
      console.log("data4:", data4);



console.log(NEXA.drive);
      const d = data4?.data;
      if (d) {
        route.routeMetaByRoute.set(page, {
          title: `${d.title} | devjs`,
          description: d.deskripsi || DEFAULT_BLOG_META.description,
          ogImage:`http://localhost:3000/drive/300x300/${d.images}`
        });
      } else {
        route.routeMetaByRoute.set(page, { ...DEFAULT_BLOG_META });
      }

      container.innerHTML = `
          <h1>${d ? d.title : "Artikel tidak ditemukan"}</h1>
          <p><strong>${d ? d.deskripsi : ""}</strong></p>
          <p>Route lengkap: ${routeName}</p>
          <p>Base route: ${slug}</p>
          <hr>
          <nav>
            <a href="/blog">← Kembali ke blog</a> |
          </nav>
        `;
    } else {
      route.routeMetaByRoute.set(page, { ...DEFAULT_BLOG_META });
      const data4 = await NXUI.Storage().example().news({ news: 1 });
      container.innerHTML = `
          <h1>Guides Page</h1>
          <p>Ini adalah halaman Guides.</p>
          <p>Route: ${routeName}</p>
                     ${data4.data.map(item => {
                               // item.id → setSlugId (sessionStorage), bukan ditambahkan ke string URL
                      
                               const slug = NXUI.createSlug(item.pubdate, item.slug, item.id, 'berita');
                               return `
                               <div class="nx-media bdr-1">
                                   <div class="dataset-item-icon">
                                   <a href="blog/${slug}">${item.title}</a>
                                   <img src="${NEXA.drive}/300x300/${item.images}" class="img-responsive" alt="Image">
                                 </div> 
                               
                                 </div>
                               </div>`;
                           }).join('')}
          <hr>
          <h2>Daftar Sub-Routes:</h2>
        
        `;
    }
  });
}

