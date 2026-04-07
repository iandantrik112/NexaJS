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
          <article class="nx-page">
            <h1 class="nx-page__title">${d ? d.title : "Artikel tidak ditemukan"}</h1>
            ${d?.deskripsi ? `<p class="nx-page__lead"><strong>${d.deskripsi}</strong></p>` : ""}
            <p class="nx-page__meta"><span class="nx-page__label">Route:</span> ${routeName}</p>
            <p class="nx-page__meta"><span class="nx-page__label">Slug:</span> ${slug}</p>
            <hr class="nx-page__rule" />
            <nav class="nx-page__nav">
              <a href="/blog">← Kembali ke blog</a>
            </nav>
          </article>
        `;
    } else {
      route.routeMetaByRoute.set(page, { ...DEFAULT_BLOG_META });
      const data4 = await NXUI.Storage().example().news({ news: 1 });
      const items = data4?.data || [];
      container.innerHTML = `
          <article class="nx-page">
            <h1 class="nx-page__title">Guides Page</h1>
            <p class="nx-page__lead">Ini adalah halaman Guides.</p>
            <p class="nx-page__meta"><span class="nx-page__label">Route:</span> ${routeName}</p>
            <div class="nx-page__blog-list">
              ${items.map((item) => {
                const slug = NXUI.createSlug(item.pubdate, item.slug, item.id, "berita");
                return `
                <article class="nx-page__blog-card">
                  <a class="nx-page__blog-card-title" href="/blog/${slug}">${item.title}</a>
                  <img src="${NEXA.drive}/300x300/${item.images}" class="nx-page__blog-card-img img-responsive" alt="" />
                </article>`;
              }).join("")}
            </div>
            <hr class="nx-page__rule" />
            <h2 class="nx-page__subtitle">Daftar Sub-Routes</h2>
            <p class="nx-page__hint">Buka artikel lewat tautan di atas.</p>
          </article>
        `;
    }
  });
}

