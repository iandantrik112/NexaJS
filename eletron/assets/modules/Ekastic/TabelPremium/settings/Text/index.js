// Import all text styling features
import './textTransform.js';
import './textAlign.js';
import './fontWeight.js';
import './fontStyle.js';
import './textColor.js';
import './backgroundColor.js';

export async function infotableText(data) {
  return `

  <div class="nx-row">
    <div class="nx-col-4">
      <button type="button" class="nx-btn-primary icon-button  flex items-center justify-start gap-2" style="width: 100%" onclick="opentableTexttransformSettings('${data.id}')">
        <span class="material-symbols-outlined nx-icon-sm">text_fields</span>
        <span>Text Transform</span>
      </button>
    </div>



    <div class="nx-col-4">
      <button type="button" class="nx-btn-primary icon-button  flex items-center justify-start gap-2" style="width: 100%" onclick="openTableTextalignFilName('${data.id}')">
        <span class="material-symbols-outlined nx-icon-sm">format_align_left</span>
        <span>Text Align</span>
      </button>
    </div>
  

    <div class="nx-col-4">
      <button type="button" class="nx-btn-primary icon-button  flex items-center justify-start gap-2" style="width: 100%" onclick="openTableFontWeightFilName('${data.id}')">
        <span class="material-symbols-outlined nx-icon-sm">format_bold</span>
        <span>Font Weight</span>
      </button>
    </div>



    <div class="nx-col-4">
      <button type="button" class="nx-btn-primary icon-button  flex items-center justify-start gap-2" style="width: 100%" onclick="openTableFontStyleFilName('${data.id}')">
        <span class="material-symbols-outlined nx-icon-sm">format_italic</span>
        <span>Font Style</span>
      </button>
    </div>


    <div class="nx-col-4">
      <button type="button" class="nx-btn-primary icon-button  flex items-center justify-start gap-2" style="width: 100%" onclick="openTableColorFilName('${data.id}')">
        <span class="material-symbols-outlined nx-icon-sm">palette</span>
        <span>Text Color</span>
      </button>
  </div>


    <div class="nx-col-4">
      <button type="button" class="nx-btn-primary icon-button  flex items-center justify-start gap-2" style="width: 100%" onclick="openTableBackgroundColorFilName('${data.id}')">
        <span class="material-symbols-outlined nx-icon-sm">format_color_fill</span>
        <span>Background</span>
      </button>
    </div>
  </div>
    <br>
<div class="nx-alert nx-alert-info">
Atur styling teks pada tabel sesuai kebutuhan Anda. Gunakan fitur berikut untuk mengatur tampilan teks: transformasi teks (uppercase, lowercase, capitalize), perataan teks (kiri, tengah, kanan), ketebalan huruf (bold, normal), gaya font (italic, normal), warna teks, dan warna latar belakang kolom. Setiap pengaturan dapat diterapkan secara individual untuk setiap kolom.
</div>



  `
}
