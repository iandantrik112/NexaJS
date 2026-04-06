/**
 * Contoh route: `geolocation` → `templates/geolocation.js`
 * Memakai `NXUI.Geolocation` (kelas NexaGeolocation) seperti di assets/modules/Nexa.js (Geolocation: NexaGeolocation).
 */
let geoDemo = null;

function isElectron() {
  return typeof navigator !== "undefined" && /Electron\//.test(navigator.userAgent || "");
}

function getGeolocation() {
  if (typeof NXUI === "undefined" || !NXUI.Geolocation) {
    return null;
  }
  if (!geoDemo) {
    // Di Electron, akurasi tinggi memakai Network Location Provider Google → sering HTTP 403 & POSITION_UNAVAILABLE.
    geoDemo = new NXUI.Geolocation({
      enableHighAccuracy: !isElectron(),
      timeout: 12000,
      maximumAge: 60000,
    });
  }
  return geoDemo;
}

function formatCoord(v, digits = 6) {
  if (v == null || Number.isNaN(v)) return "—";
  return typeof v === "number" ? v.toFixed(digits) : String(v);
}

export async function geolocation(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Geolocation | App",
        description: "Lokasi perangkat dengan NXUI.Geolocation (NexaGeolocation).",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      const geo = getGeolocation();
      if (!geo) {
        container.innerHTML =
          '<p style="padding:1rem">NXUI.Geolocation tidak tersedia — pastikan Nexa.js dimuat.</p>';
        return;
      }

      if (!geo.isSupported) {
        container.innerHTML =
          '<p style="padding:1rem">Geolocation API tidak didukung browser ini.</p>';
        return;
      }

      container.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 720px;">
        <h1 style="margin-top:0">NXUI.Geolocation</h1>
        <p style="color:#555">Alias <code>Geolocation</code> pada NXUI — <code>getCurrentPosition</code>, <code>watchPosition</code>, <code>stopWatching</code>.</p>
        <p style="font-size:14px;color:#666">Route: <code>${routeName}</code></p>
        <p style="font-size:12px;color:#888">Perlu konteks aman (HTTPS) pada banyak browser. Di <strong>Electron</strong>, lokasi jaringan Google sering ditolak (403) — demo memakai akurasi normal; aktifkan GPS/OS location bila perlu.</p>

        <div style="display:flex;flex-wrap:wrap;gap:10px;margin:1.25rem 0;">
          <button type="button" id="geo-once" style="padding:8px 16px;border-radius:6px;border:1px solid #0d6efd;background:#0d6efd;color:#fff;cursor:pointer">
            Dapatkan posisi sekali
          </button>
          <button type="button" id="geo-watch" style="padding:8px 16px;border-radius:6px;border:1px solid #198754;background:#198754;color:#fff;cursor:pointer">
            Mulai lacak
          </button>
          <button type="button" id="geo-stop" style="padding:8px 16px;border-radius:6px;border:1px solid #6c757d;background:#fff;cursor:pointer">
            Stop lacak
          </button>
        </div>

        <p id="geo-status" style="font-size:14px;color:#444;min-height:1.5em"></p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:0.5rem">
          <tbody>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px;width:40%">Latitude</td><td style="padding:8px" id="geo-lat">—</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px">Longitude</td><td style="padding:8px" id="geo-lng">—</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px">Akurasi (m)</td><td style="padding:8px" id="geo-acc">—</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px">Ketinggian</td><td style="padding:8px" id="geo-alt">—</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px">Kecepatan (m/s)</td><td style="padding:8px" id="geo-spd">—</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px">Arah (°)</td><td style="padding:8px" id="geo-hdg">—</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px">Waktu</td><td style="padding:8px" id="geo-time">—</td></tr>
          </tbody>
        </table>

        <p style="margin-top:1rem">
          <a id="geo-maps" href="#" target="_blank" rel="noopener" style="color:#0d6efd;display:none">Buka di Google Maps</a>
        </p>

        <p style="margin-top:1.5rem;font-size:12px;color:#888">
          Callback: <code>onSuccess</code> / <code>onPositionSuccess</code>, <code>onError</code>, <code>onUpdate</code> — lihat <code>Geolocation/NexaGeolocation.js</code>.
        </p>
      </div>
    `;

      const statusEl = container.querySelector("#geo-status");
      const latEl = container.querySelector("#geo-lat");
      const lngEl = container.querySelector("#geo-lng");
      const accEl = container.querySelector("#geo-acc");
      const altEl = container.querySelector("#geo-alt");
      const spdEl = container.querySelector("#geo-spd");
      const hdgEl = container.querySelector("#geo-hdg");
      const timeEl = container.querySelector("#geo-time");
      const mapsEl = container.querySelector("#geo-maps");
      const btnOnce = container.querySelector("#geo-once");
      const btnWatch = container.querySelector("#geo-watch");
      const btnStop = container.querySelector("#geo-stop");

      function paintPosition(data) {
        if (latEl) latEl.textContent = formatCoord(data.latitude);
        if (lngEl) lngEl.textContent = formatCoord(data.longitude);
        if (accEl) accEl.textContent = data.accuracy != null ? formatCoord(data.accuracy, 1) : "—";
        if (altEl) altEl.textContent = data.altitude != null ? formatCoord(data.altitude, 1) : "—";
        if (spdEl) spdEl.textContent = data.speed != null ? formatCoord(data.speed, 2) : "—";
        if (hdgEl) hdgEl.textContent = data.heading != null ? formatCoord(data.heading, 1) : "—";
        if (timeEl) timeEl.textContent = data.datetime ? data.datetime.toLocaleString() : "—";
        if (mapsEl && data.googleMapsUrl) {
          mapsEl.href = data.googleMapsUrl;
          mapsEl.style.display = "inline";
        }
      }

      function paintError(err) {
        if (statusEl) {
          statusEl.style.color = "#842029";
          statusEl.textContent = err.userMessage || err.message || "Gagal mendapat lokasi";
        }
      }

      function clearStatus() {
        if (statusEl) {
          statusEl.style.color = "#444";
          statusEl.textContent = "";
        }
      }

      geo.onSuccess = (data) => {
        clearStatus();
        if (statusEl) statusEl.textContent = geo.isWatching ? "Memperbarui posisi…" : "Posisi berhasil dibaca.";
        paintPosition(data);
      };

      geo.onError = (err) => {
        paintError(err);
      };

      geo.onUpdate = (data) => {
        if (statusEl) {
          statusEl.style.color = "#198754";
          statusEl.textContent = "Lacak aktif — pembaruan posisi.";
        }
        paintPosition(data);
      };

      btnOnce?.addEventListener("click", async () => {
        clearStatus();
        if (statusEl) statusEl.textContent = "Meminta lokasi…";
        try {
          const data = await geo.getCurrentPosition();
          paintPosition(data);
          if (statusEl) statusEl.textContent = "Posisi berhasil dibaca.";
        } catch (e) {
          paintError(e);
        }
      });

      btnWatch?.addEventListener("click", () => {
        clearStatus();
        geo.watchPosition();
        if (statusEl) statusEl.textContent = "Mulai memantau posisi…";
      });

      btnStop?.addEventListener("click", () => {
        geo.stopWatching();
        if (statusEl) {
          statusEl.style.color = "#444";
          statusEl.textContent = "Pemantauan dihentikan.";
        }
      });

      if (geo.lastPosition) {
        paintPosition(geo.lastPosition);
      }
    }
  );
}
