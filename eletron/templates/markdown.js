/**
 * Memuat `templates/{nama}.md` lewat GET (sama pola dengan NXUI.html + .html).
 * Pastikan dev server memakai router ini agar .md dilayani sebagai file:
 *   php -S localhost:8003 router.php
 * (tanpa ini, banyak server mengembalikan index.html untuk semua path.)
 */
export async function markdown(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Contact Data | App",
        description: "Data kontak.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      const result = await NXUI.Markdown("NexaField", {
        title: routeMeta.title || "Contact",
        description: routeMeta.description || "",
      }, "docs");

      if (!result?.success || result.content == null) {
        console.error("[markdown] gagal:", result?.error);
        container.innerHTML =
          '<p class="nx-md-error">Markdown tidak bisa dimuat. Cek konsol ' +
          "(pastikan server memakai <code>router.php</code> agar file .md dilayani).</p>";
        return;
      }

      container.innerHTML = `<article class="nx-markdown">${result.content}</article>`;
      if (typeof result.highlight === "function") {
        result.highlight(container.querySelector(".nx-markdown"));
      }
    }
  );
}
