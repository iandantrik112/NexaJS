/**
 * Route `/form` — contoh alur resmi NexaForm:
 * - `floating` → NexaFloating (HTML field dari definisi `form` + `variables`)
 * - `setDataBy.form` → definisi yang sama dipakai NexaForm untuk membangun rules NexaValidation
 * - `onclick.validation` + `getValidationBy` / `getFormBy` → submit lewat Validation(), bukan collectFormData mentah
 *
 * Tanpa `content` HTML manual: isi form digenerate NexaFloating agar konsisten dengan class form-nexa / floating label.
 */
export async function form(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "Contoh NexaForm | App",
        description: "NexaFloating + NexaValidation lewat NXUI.Form.",
      },
      style,
      nav = {},
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);

      /** Satu sumber kebenaran untuk field: dipakai NexaFloating DAN setDataBy.form (validasi). */
      const demoForm = {
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
        pesan: {
          condition: true,
          type: "text",
          label: "Pesan",
          placeholder: "Minimal 10 karakter",
          name: "pesan",
          id: "pesan",
          validation: 10,
        },
      };

      /** Konfigurasi NexaFloating (lihat NexaFloating.js: wajib `form` object + urutan `variables`). */
      const floatingConfig = {
        id: "form_demo_nexa",
        label: "Form demo",
        variables: ["nama", "email", "pesan"],
        form: demoForm,
        settings: {
          floating: true,
          layout: "vertical",
        },
      };

      container.innerHTML = `
        <section class="nexa-form-demo" style="max-width:40rem;">
          <h1>Contoh NexaForm</h1>
          <p>Field dari <strong>NexaFloating</strong>; submit memakai <strong>NexaValidation</strong> (wajib + min length).</p>
          <div id="nexaFormDemo"></div>
          <h2 style="margin-top:1.25rem;font-size:1rem;">Output (JSON)</h2>
          <pre id="nexaFormDemoOutput" style="background:#f5f5f5;padding:1rem;border-radius:6px;overflow:auto;font-size:0.85rem;"></pre>
        </section>
      `;

      try {
        await NXUI.Form({
          elementById: "nexaFormDemo",
          label: "Form demo",
          floating: floatingConfig,
          onclick: {
            title: "Simpan",
            cancel: "Batal",
            send: "nexaFormDemoSubmit",
            validation: {},
          },
          setDataBy: {
            route: routeName,
            source: "templates/form.js",
            form: demoForm,
          },
          getFormBy: ["name"],
          getValidationBy: ["name"],
        });
      } catch (err) {
        console.error("[form.js] NXUI.Form gagal:", err);
        container.insertAdjacentHTML(
          "beforeend",
          `<p style="color:#b00020;">Gagal memuat form: ${String(err?.message || err)}</p>`,
        );
      }
    },
  );
}

/**
 * Dipanggil NexaForm setelah NexaValidation sukses (`onclick.send` = nama string).
 * Resolusi: window → NXUI → nx → nx._global (lihat assets/modules/Form/NexaForm.js).
 *
 * `nx` global dibuat di assets/modules/Nexa.js (~1057–1095): shorthand NXUI + Proxy;
 * assignment `nx.nexaFormDemoSubmit = fn` juga mendaftarkan `window.nexaFormDemoSubmit`
 * untuk kompatibilitas callback berbasis string.
 */
nx.nexaFormDemoSubmit = async function (formId, formData, setDataBy) {
  console.log("[nexaFormDemoSubmit]", { formId, formData, setDataBy });
  const out = document.getElementById("nexaFormDemoOutput");
  if (out) {
    out.textContent = JSON.stringify({ formData, setDataBy }, null, 2);
  }
};
