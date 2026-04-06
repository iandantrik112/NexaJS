export function setIconSelector(variableName, builderType) {
  // Official Material Symbols from Google (verified valid icons only)

  const materialIcons = [
    // Form Input Types
    "edit_note",
    "visibility_off",
    "email",
    "lock",
    "numbers",
    "phone",
    "link",
    "search",
    "calendar_today",
    "schedule",
    "access_time",
    "description",
    "event_list",
    "radio_button_checked",
    "check_box",
    "split_scene_right",
    "attach_file",
    "tune",
    "palette",
    "flag",
    "attach_money",

    // Form Actions
    "save",
    "send",
    "clear",
    "refresh",
    "undo",
    "redo",
    "delete",
    "edit",
    "add",
    "remove",
    "close",
    "check",
    "cancel",

    // Form Validation
    "error",
    "warning",
    "info",
    "help",
    "verified",
    "check_circle",
    "cancel",

    // User & Account
    "person",
    "account_circle",
    "face",
    "fingerprint",
    "badge",
    "supervised_user_circle",

    // Location & Address
    "location_on",
    "place",
    "pin_drop",
    "home",
    "business",
    "apartment",

    // Contact Information
    "mail",
    "call",
    "contact_mail",
    "contact_phone",
    "alternate_email",

    // Files & Documents
    "folder",
    "image",
    "picture_as_pdf",
    "article",
    "text_snippet",
    "note",
    "assignment",
    "receipt",

    // Categories & Organization
    "category",
    "label",
    "bookmark",
    "star",
    "favorite",

    // Time & Date
    "event",
    "today",
    "date_range",
    "alarm",
    "timer",

    // Settings & Configuration
    "settings",
    "tune",
    "build",
    "admin_panel_settings",

    // Navigation & Actions
    "arrow_back",
    "arrow_forward",
    "expand_more",
    "expand_less",
    "menu",
    "more_vert",
    "more_horiz",
  ];

  const iconModalId = `iconSelectorModal_${variableName}`;
  let tempalate = "";
  const iconGridHTML = materialIcons
    .map(
      (iconName) => `
        <a 
        href="javascript:void(0);" onclick="addIconItem('${iconName}','${variableName}','${builderType}');"
        class="icon-item" 
             style="display: inline-flex; 
             flex-direction: column; 
             align-items: center; 
             padding: 8px; margin: 2px; 
             border: 1px solid #e9ecef; 
             border-radius: 6px; cursor: pointer;
             transition: all 0.2s;
             min-width: 60px;
             flex: 1 1 auto;">
          <span class="material-symbols-outlined" style="font-size: 24px; color: #333;">${iconName}</span>
        </a>
      `
    )
    .join("");
  NXUI.modalHTML({
    elementById: iconModalId,
    styleClass: "w-800px",
    label: `🎨 Select Icon for "${variableName}"`,
    onclick: {
      title: "Clear Icon",
      cancel: "Close",
      send: false,
    },
    content: `
          <div class="nx-scroll-hidden" style="height:400px; padding:8px;">
            <div class="icon-grid-container" id="iconGrid" style="
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
              gap: 4px;
              width: 100%;
              height: 100%;
              overflow-y: auto;
              padding: 4px;
            ">
             ${iconGridHTML}
            </div>
          </div>
          <style>
            .icon-grid-container .icon-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-decoration: none;
              color: inherit;
              padding: 8px;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.2s ease;
              background: white;
              min-height: 60px;
            }
            .icon-grid-container .icon-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              background-color: #f8f9fa;
              border-color: #dee2e6;
            }
            .icon-grid-container .icon-item.selected {
              background: #e3f2fd !important;
              border-color: #2196f3 !important;
            }
            .icon-grid-container .icon-item .material-symbols-outlined {
              font-size: 20px;
              color: #333;
            }
          </style>
        `,
  });
  NXUI.nexaModal.open(iconModalId);
  NXUI.id("body_" + iconModalId).setStyle("padding", "0px");
}
