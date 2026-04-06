/** Instance demo — di-destroy saat navigasi ulang ke route ini */
let _dropdownDemoInstances = [];

/**
 * Route `/dropdown` — contoh `NXUI.Dropdown` / `NXUI.NexaDropdown` (NexaDropdown.js).
 */
export async function dropdown(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Dropdown | App",
        description: "Demo NexaDropdown — toggle class show, tutup luar & Escape.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      _dropdownDemoInstances.forEach((inst) => {
        try {
          inst.destroy();
        } catch (_) {
          /* ignore */
        }
      });
      _dropdownDemoInstances = [];

      container.innerHTML = `
        <style>
          .nexa-dropdown-demo h1 { margin-top: 0; }
          .nexa-dropdown-demo section { margin-bottom: 2rem; max-width: 40rem; }
          .nexa-dropdown-demo .row { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start; }
          /* Menu pakai substring "dropdown-menu" agar NexaDropdown.closeAll selaras */
          .nexa-dropdown-demo .dropdown-menu-panel {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            margin: 6px 0 0;
            min-width: 200px;
            padding: 8px 0;
            list-style: none;
            background: #fff;
            border: 1px solid rgba(0,0,0,0.12);
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            z-index: 50;
          }
          .nexa-dropdown-demo .dropdown-menu-panel.show { display: block; }
          .nexa-dropdown-demo .dropdown-menu-panel a {
            display: block;
            padding: 8px 16px;
            color: #222;
            text-decoration: none;
            font-size: 0.9rem;
          }
          .nexa-dropdown-demo .dropdown-menu-panel a:hover { background: #f3f4f6; }
          .nexa-dropdown-demo .dd-trigger {
            padding: 8px 14px;
            border-radius: 6px;
            border: 1px solid #ccc;
            background: #fafafa;
            cursor: pointer;
            font-size: 0.9rem;
          }
          .nexa-dropdown-demo .dd-wrap { position: relative; display: inline-block; }
        </style>

        <div class="nexa-dropdown-demo">
          <h1>NXUI.Dropdown (NexaDropdown)</h1>
          <p style="line-height:1.55;max-width:42rem">
            Kelas <code>NexaDropdown</code> di <code>assets/modules/Dropdown/NexaDropdown.js</code>.
            Akses: <code>new NXUI.Dropdown(options)</code> atau <code>new NXUI.NexaDropdown(options)</code>.
            Menu memakai class <strong>show</strong> (default). Nama class menu sebaiknya mengandung <code>dropdown-menu</code> agar <code>closeAll</code> konsisten.
          </p>

          <section>
            <h2>1. Manual — <code>triggerId</code> + <code>menuId</code></h2>
            <div class="row">
              <div class="dd-wrap">
                <button type="button" class="dd-trigger" id="demo-dd-manual-btn">Aksi ▾</button>
                <ul class="dropdown-menu-panel dropdown-menu" id="demo-dd-manual-menu" aria-hidden="true">
                  <li><a href="#" data-dd-stop>Profil</a></li>
                  <li><a href="#" data-dd-stop>Pengaturan</a></li>
                  <li><a href="#" data-dd-stop>Keluar</a></li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>2. <code>NexaDropdown.init([...])</code> — beberapa sekaligus</h2>
            <p style="font-size:0.9rem;opacity:0.9">ID di bawah sama dengan contoh di <code>docs/dropdown.md</code> (<code>btn-a</code> / <code>menu-a</code>, <code>btn-b</code> / <code>menu-b</code>).</p>
            <div class="row">
              <div class="dd-wrap">
                <button type="button" class="dd-trigger" id="btn-a">File ▾</button>
                <ul class="dropdown-menu-panel dropdown-menu" id="menu-a">
                  <li><a href="#" data-dd-stop>Baru</a></li>
                  <li><a href="#" data-dd-stop>Simpan</a></li>
                </ul>
              </div>
              <div class="dd-wrap">
                <button type="button" class="dd-trigger" id="btn-b">Edit ▾</button>
                <ul class="dropdown-menu-panel dropdown-menu" id="menu-b">
                  <li><a href="#" data-dd-stop>Undo</a></li>
                  <li><a href="#" data-dd-stop>Redo</a></li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>3. <code>data-dropdown-trigger</code> + <code>NexaDropdown.autoInit(container)</code></h2>
            <p style="font-size:0.9rem;opacity:0.9">Trigger wajib punya <code>id</code>. Nilai atribut = <code>id</code> elemen menu.</p>
            <div class="row">
              <div class="dd-wrap">
                <button type="button" class="dd-trigger" id="demo-dd-auto-btn" data-dropdown-trigger="demo-dd-auto-menu">Opsi ▾</button>
                <ul class="dropdown-menu-panel dropdown-menu" id="demo-dd-auto-menu">
                  <li><a href="#" data-dd-stop>Satu</a></li>
                  <li><a href="#" data-dd-stop>Dua</a></li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      `;

      if (typeof NXUI === "undefined" || !NXUI.NexaDropdown) {
        console.error("NXUI.NexaDropdown tidak tersedia.");
        return;
      }

      const D = NXUI.NexaDropdown;

      // Klik item: hanya demo, cegah navigasi
      container.querySelectorAll("[data-dd-stop]").forEach((a) => {
        a.addEventListener("click", (e) => e.preventDefault());
      });

      const manual = new D({
        triggerId: "demo-dd-manual-btn",
        menuId: "demo-dd-manual-menu",
        onOpen: () => console.log("[dropdown] manual open"),
        onClose: () => console.log("[dropdown] manual close"),
      });
      _dropdownDemoInstances.push(manual);

      // Contoh 1:1 dengan docs/dropdown.md — NXUI.NexaDropdown.init([...])
      const batch = D.init([
        { triggerId: "btn-a", menuId: "menu-a" },
        { triggerId: "btn-b", menuId: "menu-b" },
      ]);
      if (Array.isArray(batch)) {
        _dropdownDemoInstances.push(...batch);
      } else if (batch) {
        _dropdownDemoInstances.push(batch);
      }

      const autoList = D.autoInit(container);
      if (autoList && autoList.length) {
        _dropdownDemoInstances.push(...autoList);
      }
    }
  );
}
