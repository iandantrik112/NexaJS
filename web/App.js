import "./assets/modules/Nexa.js";
import config from "./config.js";
const req = new NXUI.Page({
  /** Base app + API + endpoint tambahan (multi-API) → NEXA.url, NEXA.apiBase, NEXA.endpoint, plus NEXA.nama untuk tiap URL string */
  endpoint: config,
  containerId: "main",
  mountPath: "", // Subfolder SPA di URL (mis. "app" untuk /app/contact); kosong jika SPA di root
  appRoot: "templates",
  spinner: {
    enabled: true, // Aktifkan/nonaktifkan spinner (default: true)
    centerScreen: true, // Tampilkan di tengah layar (default: true) - jika false, tampil di dalam container
    type: "overlay", // Tipe spinner: 'overlay' | 'inline' | 'button' (default: 'overlay' jika centerScreen: true)
    size: "medium", // Ukuran: 'small' | 'medium' | 'large' (default: 'medium')
    color: "#CB2F2F", // Warna spinner (default: '#007bff')
    position: "center", // Posisi untuk inline: 'center' | 'top' | 'bottom' (default: 'center')
    message: "", // Pesan yang ditampilkan (optional, default: '')
  },
  defaultRouteMeta: {
    title: "App",
    description: "Aplikasi SPA (NexaRoute).",
  },
  // true = tampilkan stack error di halaman saat route gagal; produksi set false. Alternatif: ?nexaDebug=1 tanpa mengubah file.
  debugRouteErrors: true,
  /**
   * Web Worker: fetch HTTP Storage().package / api / … di thread terpisah (lihat NexaStorage rawWorkerFetchJson).
   *
   * Kenapa “tidak terasa” beda dengan worker mati?
   * - indexedDB: true → cache SWR: respons yang masih segar dibaca dari IndexedDB di main thread (bukan worker), lalu fetch pembaruan di background. Jalur cepat itu memang bukan worker — sengaja agar UI langsung dapat data cache.
   * - localhost / jaringan cepat → latensi fetch kecil; worker tidak mempercepat RTT server.
   * - Worker membantu menjaga main thread saat parse + fetch berat; untuk payload kecil bedanya tipis.
   *
   * Uji worker di jaringan: set indexedDB: false (tanpa cache SWR) sementara, atau buka ?nexaWorkerDebug=1 / debug: true untuk log [NexaWorker].
   */
  webWorker: {
    enabled: true,
    storage: true,
    /** true = SWR cache respons package/api di DB NexaStorageAPICache (terpisah dari buckets). false = tiap request fetch lewat worker/main tanpa baca cache dulu */
    indexedDB: true,
    /** TTL cache (ms). 0 = tidak pernah kedaluwarsa menurut waktu (cache selalu “segar” untuk baca cepat). */
    storageCacheTtlMs: 86400000,
    /** true = log [NexaWorker] saat request lewat worker */
    debug: false,
  },
  // Service Worker (terpisah dari Web Worker): registrasi + opsi Background Sync
  serviceWorker: {
    /** Wajib true agar SW terpasang; {} saja tidak mengaktifkan apa pun */
    enabled: false,
    /** Wajib dari root (bukan /assets/...) agar scope '/' diizinkan browser */
    scriptUrl: "/sw.js",
    scope: "/",
    /** true = siapkan event sync (halaman bisa NXUI.registerNexaBackgroundSync('nexa-background-sync')) */
    backgroundSync: false,
    debug: false,
  },
  route: [
    "beranda",
    "about",
    "modal",
    "blog",
    "contact",
    "guides",
    "exsampel",
    "colom",
    "form",
    "ds/data",
    "wizard",
    "tables",
    "notifikasi",
    "voice",
    "markdown",
    "field",
    "checkable",
    "qrcode",
    "prind",
    "escpos",
    "lightbox",
    "svg",
    "scimport",
    "filetype",
    "dropdown",
    "grid",
    "sidebar",
    "sortable",
    "scroll",
    "filter",
    "eventhandling",
    "network",
    "geolocation",
    "terminal",
  ],
  onRoute: (routeInfo) => {
    /** routeMeta dari NexaRoute.routeMetaByRoute; defaultRouteMeta dari konfigurasi NXUI.Page */
    const def = routeInfo.defaultRouteMeta || {};
    const pack = routeInfo.routeMeta
      ? { ...def, ...routeInfo.routeMeta }
      : { ...def };
    const base = typeof location !== "undefined" ? location.origin : "";
    NXUI.setPageMeta({
      appName: "App",
      ...pack,
      ogUrl: typeof location !== "undefined" ? location.href : undefined,
      canonical: typeof location !== "undefined" ? location.href : undefined,
      ogImage:
        pack.ogImage ||
        (base ? `${base}/assets/images/favicon.ico` : undefined),
    });
  },
});
// console.log('NEXA:', new NXUI.Buckets());
// example → ExampleControllers → App\Controllers\Admin\ExampleController::track
// (async () => {
//   const data4 = await NXUI.Storage().example().track({
//     userid: 1,
//     name: "John Doe",
//     email: "john@example.com",
//   });
//   console.log("Method chaining response:", data4);
// })();
