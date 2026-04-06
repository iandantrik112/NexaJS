import { infotableSize } from "./settings/tableSize.js";
import { getSortable } from "./settings/Sortable.js";
import { tableHeaderGroup } from "./settings/tableHeaderGroup.js";

import { infotableSizeTableLayout } from "./settings/tableLayout.js";
import { infotableText } from "./settings/tableText.js";

export function generateUniqueName(name = "") {
  const clean = name.trim().toLowerCase().replace(/\s+/g, "_");
  const rand = Math.random().toString(36).substring(2, 10); // 8 karakter acak
  const time = Date.now().toString(36); // waktu unik
  return `${clean}_${time}_${rand}`;
}
export async function appSettings(token) {
  try {
    if (token) {
      const Sdk = new NXUI.Buckets(token);
      const dataform = await Sdk.storage();
      const modalID ="cellsettings_" + dataform.className;
      const tabNavID = "myTab_" + dataform.className;
      const tabContentID = "myTabContent" + dataform.className;


      const headerGroup= await tableHeaderGroup(Sdk)

      NXUI.modalHTML({
        elementById: modalID,
        styleClass: "w-540px",
        minimize: true,
        label: `Settings Table`,
        onclick: false,
        content: `
          <ul class="nx-nav-tabs nx-nav-tabs-sm"id="${tabNavID}">
 
            <li class="nx-tabs-item">
              <a class="nx-nav-link" href="#tabelsize${tabNavID}" style="display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined nx-icon-md">aspect_ratio</span><span>Size & Layout</span></a>
            </li>
            <li class="nx-tabs-item">
              <a class="nx-nav-link" href="#tabelLayout${tabNavID}" style="display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined nx-icon-md">view_module</span><span>Text & Transform</span></a>
            </li>
            <li class="nx-tabs-item">
              <a class="nx-nav-link" href="#sortable${tabNavID}" style="display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined nx-icon-md">sort</span><span>Column & Sortable</span></a>
            </li>
            <li class="nx-tabs-item">
              <a class="nx-nav-link" href="#headerGroup${tabNavID}" style="display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined nx-icon-md">folder</span><span>Header Group</span></a>
            </li>
          </ul>
        <div class="nx-tab-content" id="${tabContentID}" style="padding-left:10px;padding-right:10px">
            <div class="nx-tab-pane" id="tabelsize${tabNavID}">
              ${await infotableSize({ id: token })}
            </div>
            <div class="nx-tab-pane" id="tabelLayout${tabNavID}">
              ${await infotableText({ id: token })}
            </div>
            <div class="nx-tab-pane" id="sortable${tabNavID}">
            ${await getSortable(dataform)}
             </div>
            <div class="nx-tab-pane" id="headerGroup${tabNavID}">
             ${headerGroup}
             </div>
         </div>
         `,
       });
       
       NXUI.nexaModal.open(modalID);
       NXUI.id("body_"+modalID).setStyle("padding", "0px");

      // Initialize tabs after modal is rendered
      setTimeout(async() => {

        const Tabs = new NXUI.NexaTabs({ 
          newtoken: `${token}`,
          navSelector: `#${tabNavID}`,
          contentSelector: `#${tabContentID}` 
        });
      }, 100);
    }
  } catch (error) {
    console.error("Error displaying record:", error);
  }
}
