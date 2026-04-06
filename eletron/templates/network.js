/**
 * Contoh route: `network` → `templates/network.js`
 * Memakai `NXUI.Network` (kelas NexaNetwork) seperti di assets/modules/Nexa.js (Network: NexaNetwork).
 */
let networkMonitor = null;

function getNetworkMonitor() {
  if (typeof NXUI === "undefined" || !NXUI.Network) {
    return null;
  }
  if (!networkMonitor) {
    networkMonitor = new NXUI.Network();
  }
  return networkMonitor;
}

export async function network(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Network | App",
        description: "Monitor koneksi dengan NXUI.Network (NexaNetwork).",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      const net = getNetworkMonitor();
      if (!net) {
        container.innerHTML =
          '<p style="padding:1rem">NXUI.Networkaaa tidak tersedia — pastikan Nexa.js dimuat.</p>';
        return;
      }

      container.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 720px;">
        <h1 style="margin-top:0">NXUI.Network</h1>
        <p style="color:#555">Alias <code>Network</code> pada NXUI — pemantauan online/offline, Network Information API, dan stabilitas.</p>
        <p style="font-size:14px;color:#666">Route: <code>${routeName}</code></p>

        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:1.5rem 0;">
          <span id="net-badge" style="padding:6px 14px;border-radius:8px;font-weight:600;background:#e9ecef">…</span>
          <span id="net-quality" style="font-size:14px;color:#444"></span>
          <button type="button" id="net-refresh" style="padding:8px 16px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer">
            Periksa sekarang
          </button>
        </div>

        <h2 style="font-size:1.1rem">Detail koneksi</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6">
              <th style="text-align:left;padding:10px">Properti</th>
              <th style="text-align:left;padding:10px">Nilai</th>
            </tr>
          </thead>
          <tbody id="net-table-body"></tbody>
        </table>

        <h2 style="font-size:1.1rem;margin-top:1.75rem">Peristiwa online/offline</h2>
        <div id="net-events" style="max-height:160px;overflow-y:auto;background:#f8f9fa;border-radius:8px;padding:12px;font-family:ui-monospace,monospace;font-size:12px"></div>

        <p style="margin-top:1.5rem;font-size:12px;color:#888">
          Callback: <code>onStatusChange</code>, <code>onQualityChange</code>, <code>onStatusData</code> — lihat <code>Network/NexaNetwork.js</code>.
        </p>
      </div>
    `;

      const badge = container.querySelector("#net-badge");
      const qualityEl = container.querySelector("#net-quality");
      const tableBody = container.querySelector("#net-table-body");
      const eventsEl = container.querySelector("#net-events");
      const refreshBtn = container.querySelector("#net-refresh");

      function fillTable(rows) {
        if (!tableBody) return;
        tableBody.innerHTML = rows
          .map(
            (r) =>
              `<tr style="border-bottom:1px solid #eee"><td style="padding:8px">${r.label}</td><td style="padding:8px">${r.value}</td></tr>`
          )
          .join("");
      }

      function paintFromInfo(info, stability) {
        if (badge) {
          badge.textContent = info.online ? "Online" : "Offline";
          badge.style.background = info.online ? "#d1e7dd" : "#f8d7da";
          badge.style.color = info.online ? "#0f5132" : "#842029";
        }
        if (qualityEl && stability) {
          qualityEl.textContent = `${stability.status} · ${stability.quality}`;
        }
      }

      net.onStatusChange = (online, info, fromEvent) => {
        paintFromInfo(info, net.analyzeStability());
        if (fromEvent && eventsEl) {
          const t = new Date().toLocaleTimeString();
          const line = document.createElement("div");
          line.textContent = `[${t}] ${online ? "Online" : "Offline"} — ${info.type || "?"}`;
          eventsEl.prepend(line);
        }
      };

      net.onQualityChange = (quality, status) => {
        if (qualityEl) {
          qualityEl.textContent = `${status} · ${quality}`;
        }
      };

      net.onStatusData = (tableData) => {
        fillTable(tableData);
      };

      const initial = net.getDetailedInfo();
      paintFromInfo(initial, initial.stability);
      fillTable([
        { label: "Status", value: initial.online ? "Online" : "Offline" },
        { label: "Jenis koneksi", value: initial.type },
        { label: "Perkiraan kecepatan", value: initial.speed },
        { label: "Downlink", value: initial.downlink },
        { label: "RTT", value: initial.rtt },
        { label: "Data saver", value: initial.dataSaver },
        { label: "Stabilitas", value: initial.stability.status },
        { label: "Kualitas", value: initial.stability.quality },
      ]);

      refreshBtn?.addEventListener("click", () => {
        net.checkNetworkChanges();
      });
    }
  );
}
