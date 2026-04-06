/**
 * Route `/modal` — demo NXUI.Modal selaras dengan `templates/form.js`:
 * - `floating` + NexaFloating (body modal)
 * - `setDataBy.form` → NexaModalHtml membangun `validasi` untuk NexaValidation (lihat `assets/modules/modal/NexaModalHtml.js`)
 * - `onclick.validation` + `getFormBy` / `getValidationBy`
 */
export async function modal(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Modal demo | App",
        description: "NexaModal + NexaFloating + NexaValidation.",
      },
      style,
      nav = {},
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      container.innerHTML = `
        <section class="nexa-modal-demo" style="max-width:40rem;">
          <h1>Contoh modal</h1>
          <p>Isi form di modal memakai <strong>NexaFloating</strong> (sama seperti halaman <code>/form</code>).</p>
           <a  onclick="openModalFloatingDemo('modal1');" href="javascript:void(0);">Open</a>
        </section>
      `;
    },
  );
}

/** Definisi field: dipakai untuk `floating.form` dan `setDataBy.form`. */
function getModalFormDef() {
  return {
    nama: {
      condition: true,
      type: "text",
      label: "Nama",
      placeholder: "Nama lengkap",
      name: "nama",
      id: "nama",
      validation: 2,
    },
    email: {
      condition: true,
      type: "email",
      label: "Email",
      placeholder: "email@contoh.com",
      name: "email",
      id: "email",
      validation: 2,
    },
  };
}

/**
 * Buka modal dengan body dari NexaFloating.
 * `NXUI.Modal` meneruskan `floating` ke `modalHTML` di NexaModalHtml.js.
 */
nx.openModalFloatingDemo = async function (id) {
  console.log('id:', id);
    try {
      const modalID = "setModal_" + id;
      const formDef = getModalFormDef();
      const floatingConfig = {
        id: `form_modal_${id}_nexa`,
        label: "Kontak",
        variables: ["nama", "email"],
        form: formDef,
        settings: {
          floating: true,
          layout: "vertical",
        },
      };

      await NXUI.Modal({
        elementById: modalID,
        styleClass: "w-500px",
        minimize: true,
        label: "Modal — data kontak",
        floating: floatingConfig,
        setDataBy: {
          form: formDef,
          source: "templates/modal.js",
          modalKey: id,
        },
        getFormBy: ["name"],
        getValidationBy: ["name"],
        onclick: {
          title: "Simpan",
          cancel: "Batal",
          send: "saveModalFormSubmit",
          validation: {},
        },
      });
      await NXUI.Modal.open(modalID);
    } catch (e) {
      console.error("[modal.js] Modal error:", e);
    }
};

/**
 * Dipanggil NexaModalHtml setelah NexaValidation sukses (nama string di `onclick.send`).
 * Resolusi handler: window → NXUI → nx → nx._global (sama seperti NexaForm).
 */
nx.saveModalFormSubmit = async function (modalId, formData, setDataBy) {
  console.log("[saveModalFormSubmit]", { modalId, formData, setDataBy });
  await NXUI.Modal.close(modalId);
};

/** Alias kompatibilitas untuk pemanggilan lama seperti `onclick="redModal('modal1')"` */
nx.redModal = nx.openModalFloatingDemo;
