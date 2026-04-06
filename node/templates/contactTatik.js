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

      const users = [
        { nama: "Rina Wijaya", email: "rina@example.com" },
        { nama: "Budi Santoso", email: "budi@example.com" },
        { nama: "Maya Putri", email: "maya@example.com" },
      ];

      // if (typeof result.hydrate === "function") {
        result.hydrate(container, { user: users });
      // }

      console.log("[contact] html + hydrate selesai");
    } catch (error) {
      console.error("[contact] html() throw:", error);
    }
  });
}
