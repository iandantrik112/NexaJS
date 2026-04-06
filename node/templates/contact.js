// Export function untuk route 'contact'
export async function contact(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Contact | App",
    description: "Hubungi kami.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    console.log("📍 Navigating to:", routeName, routeMeta, nav);

    try {
      const result = await NXUI.html("exam", {
        title: routeMeta.title || "Contact",
        description: routeMeta.description || "",
      });

      if (!result.success || result.content == null) {
        console.error("[contact] html gagal:", result.error);
        return;
      }

      container.innerHTML = result.content;

      // Sumber data: Storage().model(tabel). `order` = baris per halaman (UI).
      // Batch SQL default 10000 — atau set `storageFetchLimit` jika tabel sangat besar.
      const { totalCount, rows } = await NXUI.NexaForgeView.hydrateStorage(
        container,
        {
          storage: {
            model: "demo",
            query: (q) => q.whereNotNull("id"),
          },
          spinner: {
            enabled: true,
            centerScreen: true,
            type: "overlay",
            size: "medium",
            color: "#CB2F2F",
            position: "center",
            message: "",
          },
          order: 5,
          sortBy: "title",
          sortOrder: "ASC",
          searchableFields: ["nama", "email"],
          search: "exam-user-search",
          pagination: "exam-user-pagination",
          /** Tampilkan bar pagination meski semua data muat satu halaman (NexaForge default menyembunyikan jika ≤1 halaman). */
          alwaysShowPagination: true,
          mapRow: (row) => ({
            id: row.id,
            nama: row.title != null ? String(row.title) : "",
            email: row.slug != null ? String(row.slug) : "",
          }),
        },
      );

      console.log("[contact] html + hydrateStorage selesai", {
        totalCount,
        loaded: rows.length,
      });
    } catch (error) {
      console.error("[contact] html() throw:", error);
    }
  });
}
