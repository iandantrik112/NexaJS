// Export function untuk route field (menjadi 'field.js')
export async function field(page, route) {
  route.register(
    page,
    async (
      routeName,
      container,
      routeMeta = {
        title: "NexaField — demo semua fitur",
        description: "Inline editing: tipe input, validasi, label/icon, disabled/readonly.",
      },
      style,
      nav = {}
    ) => {
      route.routeMetaByRoute.set(page, routeMeta);
      console.log("📍 Navigating to:", NEXA);
      container.innerHTML = `
<style>
  .nexa-field-demo { max-width: 960px; margin: 0 auto; font-family: system-ui, sans-serif; }
  .nexa-field-demo h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  .nexa-field-demo .sub { color: #555; margin-bottom: 1.25rem; font-size: 0.95rem; }
  .nexa-field-demo section { margin-bottom: 1.75rem; border: 1px solid #e5e5e5; border-radius: 8px; padding: 1rem 1.25rem; background: #fafafa; }
  .nexa-field-demo h2 { font-size: 1.05rem; margin: 0 0 0.75rem; color: #1a1a1a; }
  .nexa-field-demo .hint { font-size: 0.8rem; color: #666; margin-bottom: 0.5rem; }
  .nexa-field-demo-row { display: grid; grid-template-columns: minmax(140px, 200px) 1fr; gap: 0.5rem 1rem; align-items: center; padding: 0.35rem 0; border-bottom: 1px solid #eee; }
  .nexa-field-demo-row:last-child { border-bottom: none; }
  .nexa-field-demo-k { font-size: 0.85rem; color: #444; }
  .nexa-field-demo-v { min-width: 0; }
  .nexa-field-demo-v .editable { display: inline-block; min-width: 120px; padding: 4px 6px; border-radius: 4px; border: 1px dashed transparent; }
  .nexa-field-demo-v .editable:hover { border-color: #bcd; }
</style>
<div class="nexa-field-demo">
  <h1>NexaField — demo fitur</h1>
  <p class="sub">Route: <code>${routeName}</code> · Klik nilai untuk mengedit · Perubahan tercatat di konsol (<code>onSaveCallback</code>).</p>

  <section>
    <h2>Teks &amp; angka</h2>
    <p class="hint">type text, number, email, url, tel, date, time, password</p>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">text + label + icon</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_text" name="nama" type="text" label="Nama" icon="person">Budi Santoso</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">number (min/max)</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_num" name="qty" type="number" label="Qty" icon="numbers" data-min="0" data-max="999">42</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">email</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_email" name="email" type="email" label="Email" icon="email">budi@contoh.com</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">url</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_url" name="situs" type="url" label="URL" icon="link">https://contoh.org</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">tel</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_tel" name="hp" type="tel" label="Telepon" icon="phone">0812-3456-7890</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">date (min/max)</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_date" name="tanggal" type="date" label="Tanggal" icon="calendar_today" data-min-date="2024-01-01" data-max-date="2030-12-31">2026-04-04</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">time</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_time" name="jam" type="time" label="Jam" icon="schedule">14:30</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">password</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_pass" name="token" type="password" label="Secret" icon="lock">rahasia123</span></div>
    </div>
  </section>

  <section>
    <h2>Panjang &amp; pola</h2>
    <p class="hint">required, data-min-length, data-max-length, data-pattern, data-pattern-message</p>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">wajib + 3–20 char</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_req" name="username" type="text" label="Username" icon="badge" required data-min-length="3" data-max-length="20">user_demo</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">hanya huruf</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_pat" name="kode" type="text" label="Kode" icon="pin" data-pattern="^[A-Za-z]+$" data-pattern-message="Hanya huruf A-Z">ABC</span></div>
    </div>
  </section>

  <section>
    <h2>Select &amp; textarea</h2>
    <p class="hint">data-options pakai pemisah | · Select2 jika NXUI.initSelect2 tersedia</p>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">select</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_select" name="kota" type="select" label="Kota" icon="arrow_drop_down" data-options="Jakarta|Bandung|Surabaya|Medan">Bandung</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">textarea</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_area" name="catatan" type="textarea" label="Catatan" icon="description">Baris pertama.&#10;Baris kedua.</span></div>
    </div>
  </section>

  <section>
    <h2>Tags</h2>
    <p class="hint">tags = multi-select dari data-options · tags-input = ketik bebas dipisah koma</p>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">tags (multi)</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_tags" name="skills" type="tags" label="Skill" icon="label" data-options="JavaScript|TypeScript|PHP|Vue|React|Node" data-tags="JavaScript, TypeScript" data-min-tags="1" data-max-tags="4"></span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">tags-input</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_tagsin" name="label_bebas" type="tags-input" label="Label bebas" icon="sell" data-tags="urgent, follow-up" data-min-tags="1" data-max-tags="6" data-min-tag-length="2" data-max-tag-length="24"></span></div>
    </div>
  </section>

  <section>
    <h2>Status non-edit</h2>
    <p class="hint">disabled &amp; readonly — tidak bisa diklik untuk edit</p>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">disabled</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_dis" name="locked" type="text" label="Terkunci" icon="lock" disabled>Tidak bisa diubah</span></div>
    </div>
    <div class="nexa-field-demo-row">
      <div class="nexa-field-demo-k">readonly</div>
      <div class="nexa-field-demo-v"><span class="editable" id="f_ro" name="baca" type="text" label="Baca saja" icon="visibility" readonly>Hanya tampilan</span></div>
    </div>
  </section>
</div>
`;
      tabelEdit(route);
    }
  );
}

export async function tabelEdit(store) {
  const field = new NXUI.Field();
  field.onSaveCallback(
    async (variable, newValue, element, type, fieldName) => {
      console.log("[Field save]", {
        id: variable,
        fieldName,
        type,
        newValue,
        element,
      });
    }
  );

  field.initElements();
}
