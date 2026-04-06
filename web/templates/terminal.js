// Route `terminal` → `terminal.js`
export async function terminal(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Terminal | App",
        description: "Command line Nexa di halaman.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      /** `NXUI.Terminal` = `NexaTerminal` dari bundel Nexa.js */
      const term = new NXUI.Terminal();
      const terminalHtml = await term.domView();

      container.innerHTML = `
        <section class="nexa-terminal-route" style="padding:1rem;">
          <h1 style="margin:0 0 0.75rem;">Terminal</h1>
          <p style="opacity:.85;margin:0 0 1rem;">Route: <code>${routeName}</code></p>
          ${terminalHtml}
        </section>
      `;
    }
  );
}
