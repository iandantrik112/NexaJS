// Export function untuk route `colom` (templates/colom.js)
/** Harus sama dengan `id` pada row Layer; DOM dari NexaLayer: `#nx_card_{id}` + `#nx_body_{id}`. */
const COL_CARD_NOTIFICATIONS = "Notifications";
const COL_CARD_SETTING_FAILED = "SettingFailed";

const BUCKET_DEMO2 = {
  id: "demo2",
  settings: { storage: "indexedDB" },
  key: 2617601992663861,
};

export async function colom(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Contact Data | App",
    description: "Data kontak.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
      try {
        await route.Layer({
          container,
          nav,
          page,
          dimensi: [10, "vh"],
          content: async ({ height }) => [
            await Failed(null, height),
            await content2(null, height),
          ],
        });
      } catch (error) {
        console.error("❌ Error initializing layer:", error);
      }
  });
}

export async function Failed(data,height) {
  return {
    id: COL_CARD_NOTIFICATIONS,
    header: "Notifications",
    col: "nx-col-6",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: false,
    html: `
 <a  onclick="redModal('modal1');" href="javascript:void(0);">Open</a>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incidi`,
  };
}

export async function content2(_data, height) {
  const h = NXUI.Storage().buckets(BUCKET_DEMO2);
  const local = await h.get( { limit: 50 } );
  const rows = Array.isArray(local?.response)
    ? local.response
    : Array.isArray(local?.data)
      ? local.data
      : [];
  // item.id → setSlugId (sessionStorage), bukan ditambahkan ke string URL
  const templ = await NXUI.map(rows, (item) =>
    `<p>${item.a1} >${item.a2}</p>`
  );


  return {
    id: COL_CARD_SETTING_FAILED,
    header: "Setting Failed",
    col: "nx-col-6",
    scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: false,
    html: templ,
  };
}


/** Muat ulang route penuh (SPA) — header/nav + handler route dijalankan lagi. */
export async function rendering(store) {
  await NXUI.Refresh.refresh();
}

/** Partial kartu “Setting Failed” — `keepScroll` menjaga scroll kolom NexaLayer lain. */
export async function renderingPartial() {
  await NXUI.Refresh.partial({
    scope: "#main",
    target: `#nx_body_${COL_CARD_SETTING_FAILED}`,
    keepScroll: true,
    render: async () => (await content2(null, undefined)).html,
  });
}


nx.redModal =async function (id) {
   try {
           console.log('id:', id);
           const modalID = "setModal_" + id ;
            await NXUI.Modal({
             elementById: modalID,
             styleClass: "w-500px",
             minimize: true,
             label: `Modal `,
             setDataBy:false,
             getFormBy: ["id", "name"],
             // getValidationBy: ["name"],
             onclick: {
               title: "Save Settings",
               cancel: "Cancel",
               send: "saveGroupByModal",
               validation: {
                 a1: 2,
                 a2: 2,
               },
             },
             content: `<div class="nx-row">
              <div class="nx-col-6">
                <div class="form-nexa-group">
                  <label>First Name</label>
                  <input type="text" id="a1" name="a1" class="form-nexa-control" />
                </div>
              </div>
              <div class="nx-col-6">
                <div class="form-nexa-group">
                  <label>Last Name</label>
                  <input type="text" id="a2" name="a2" class="form-nexa-control" />
                </div>
              </div>
            </div>`,
           });
          await NXUI.Modal.open(modalID);
        } catch (e) {
          console.error("[modal demo] Modal error:", e);
        }
};

/** Cegah double-submit (dua kali `set` = dua baris baru). `set` IndexedDB = selalu append, bukan upsert. */
let saveGroupByModalBusy = false;

nx.saveGroupByModal = async function (id, data) {
  if (!data || saveGroupByModalBusy) return;
  saveGroupByModalBusy = true;
  try {
    const h = NXUI.Storage().buckets(BUCKET_DEMO2);
    await h.set(data);
    await renderingPartial();
    await NXUI.Modal.close(id);
  } finally {
    saveGroupByModalBusy = false;
  }
};