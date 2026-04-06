/** Hentikan listener Firebase realtime dari kunjungan About sebelumnya (satu listener aktif). */
let _firebaseBucketsRealtimeStop = null;

// Export function untuk route 'about'
export async function about(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "About | App",
    description: "Tentang kami.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    if (typeof _firebaseBucketsRealtimeStop === "function") {
      try {
        _firebaseBucketsRealtimeStop();
      } catch (_) {
        /* ignore */
      }
      _firebaseBucketsRealtimeStop = null;
    }

    // webWorker.indexedDB + storageCacheTtlMs — cache IndexedDB segar dipakai dulu (SWR + event "nexa-storage-cache-update"); lewat TTL = fetch dulu
     const res = await NXUI.Storage().api("test", { title: "Halo", slug: "halo" });

    console.log("api:", res);
     // typicode = URL absolut dari App.js endpoint — GET (bukan POST). url() satu argumen tanpa sub-method mengembalikan Proxy, bukan Promise.
     const res2 = await NXUI.Storage().get(NEXA.typicode);
    console.log("typicode GET:", res2);



      const sStorage = await NXUI.Storage().example().news({ news: 1 });

    console.log("Storage:", sStorage);


      console.log("📍 Navigating to:", routeName, routeMeta, nav);


   // Ke  Folder models Langsung
   // News::data(string $search) — argumen pertama harus string, bukan number
   const data1models = await NXUI.Storage().models("News", {
     method: "data",
     params: ["demo"],
   });
 console.log("models:", data1models);
   const data2 = await NXUI.Storage().models("User").byAvatar(1);
   console.log(data2);



   // Tabel / query builder — sama dengan new NexaModels().Storage("news"), lewat satu pintu Storage()
   const complexQuery = await NXUI.Storage()
     .model("news")
     .select("*")
     .get();

   console.log("model(table) query:", complexQuery);


    const app = {
        "alias": [
            "user.status AS status",
            "user.nama AS nama", 
            "user.jabatan AS jabatan",
            "user.avatar AS avatar",
            "user.id AS id"
        ],
        "aliasNames": ["status", "nama", "jabatan","avatar", "id"],
        "tabelName": ["user"],
        "where": false,
        "group": false,
        "order": false,
        "operasi": {
            "user": {
                "type": "single",
                "index": "",
                "aliasIndex": "user",
                "keyIndex": 261760199266386,
                "target": "",
                "condition": "",
                "aliasTarget": "",
                "keyTarget": ""
            }
        },
        "access": "public",
        "id":1
    };

       const buckets = await NXUI.Storage()
         .buckets(app)
         .get({
           limit: 50,
           // offset: 0,
           // order: "ORDER BY user.id DESC",
         });
       console.log("Federated.get (buckets):", buckets);
     


// IndexedDB: wajib objek + settings.storage + key (ID baris di bucketsStore). Bukan .buckets('demo') saja — itu hanya { id:'demo' } dan default-nya mode database.
     
      //  const bucketsnexaStore = await NXUI.Storage()
      //    .buckets({
      //      id: "demo",
      //      settings: { storage: "indexedDB" },
      //      key: 261760199266386,
      //    })
      //    .set({ name: "dantrik" });
      //  console.log("Federated.set (buckets indexedDB):", bucketsnexaStore);
   
       // IndexedDB get: sama seperti .set — wajib id + settings.storage + key (harus sama dengan dokumen di bucketsStore)
       const bucketsnexaStoreGet = await NXUI.Storage()
         .buckets({
           id: "demo",
           settings: { storage: "indexedDB" },
           key: 261760199266386,
         })
         .get({ limit: 50 });
       console.log("Federated.get (buckets indexedDB):", bucketsnexaStoreGet);
   


       // const bucketsnexaStoreGetdel = await NXUI.Storage()
       //   .buckets({
       //     id: "demo",
       //     settings: { storage: "indexedDB" },
       //     key: 261760199266386,
       //   })
       //   .del({ id: 2 });
       // console.log("Federated.del (buckets indexedDB):", bucketsnexaStoreGetdel);

    // Firebase — pola sama: id + settings.storage + key (kunci dokumen di bucketsStore Firebase)
    // Pastikan NexaFirebase.js terkonfigurasi; jika belum, blok ini hanya log peringatan.
    let bucketsFirebaseGet = null;
    let bucketsFirebaseNote = "";
    try {
        const bucketsFirebaseSet = await NXUI.Storage()
          .buckets({
            id: "demo-firebase",
            settings: { storage: "firebase" },
            key: 261760199266386,
          })
          .set({ name: "contoh-firebase" });
        console.log("Federated.set (buckets firebase):", bucketsFirebaseSet);

      bucketsFirebaseGet = await NXUI.Storage()
        .buckets({
          id: "demo-firebase",
          settings: { storage: "firebase" },
          key: 261760199266386,
        })
        .get({ limit: 50 });
      console.log("Federated.get (buckets firebase):", bucketsFirebaseGet);

      // Realtime: hanya untuk settings.storage === "firebase" — NexaFirebase.watch("bucketsStore", …)
      const fbBucket = NXUI.Storage().buckets({
        id: "demo-firebase",
        settings: { storage: "firebase" },
        key: 261760199266386,
      });
      _firebaseBucketsRealtimeStop = await fbBucket.getRealtime({ limit: 50 }, (payload) => {
        console.log("Federated.getRealtime (buckets firebase):", {
          success: payload?.success,
          mode: payload?.mode,
          response: payload?.response,
          count: payload?.count,
          totalCount: payload?.totalCount,
          changeType: payload?.changeType,
          ts: payload?.timestamp,
        });
      });
    } catch (e) {
      bucketsFirebaseNote = String(e?.message || e);
      console.warn("Firebase bucket (contoh, boleh abaikan jika belum setup):", bucketsFirebaseNote);
    }

    container.innerHTML = `
        <h1>About Page</h1>
        <p>Ini adalah halaman About.</p>
        <p>Route: ${routeName}</p>
        <p><strong>DB API:</strong> ${buckets?.mode ?? "—"} · rows: ${buckets?.count ?? 0}</p>
        <p><strong>IndexedDB:</strong> ${bucketsnexaStoreGet?.mode ?? "—"} · rows: ${bucketsnexaStoreGet?.count ?? 0}</p>
        <p><strong>Firebase:</strong> ${bucketsFirebaseGet ? `${bucketsFirebaseGet.mode ?? "—"} · rows: ${bucketsFirebaseGet.count ?? 0}` : `—${bucketsFirebaseNote ? ` (${bucketsFirebaseNote})` : ""}`} · realtime: konsol</p>
        <p><strong>Title:</strong> </p>
        <p><strong>Description:</strong> </p>
      `;
  });
}
