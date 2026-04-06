export async function setIconSelector(token) {
    const Sdk = new NXUI.Buckets(token);
  const dataform = await Sdk.storage();
  const materialIcons = [
    "search",
    "person",
    "home",
    "location_on",
    "calendar_month",
    "schedule",
    "folder",
    "image",
    "star",
    "favorite",
    "bookmark",
    "share",
    "language",
    "account_circle",
    "info",
    "help",
    "warning",
    "error",
    "notifications",
    "mail",
    "message",
    "chat",
    "call",
    "video_call",
    "business",
    "work",
    "school",
    "grade",
    "trending_up",
    "analytics",
    "dashboard",
    "menu",
    "more_vert",
    "more_horiz",
    "expand_more",
    "expand_less",
    "arrow_back",
    "arrow_forward",
    "arrow_upward",
    "arrow_downward",
    "refresh",
    "sync",
    "cached",
    "update",
    "history",
    "restore",
    "shopping_cart",
    "payment",
    "credit_card",
    "wallet",
    "account_balance",
    "category",
    "bookmark_border",

    // Communication & Social
    "forum",
    "comment",
    "sms",
    "textsms",
    "alternate_email",
    "contact_mail",
    "contact_phone",
    "contacts",
    "group",
    "groups",
    "people",
    "public",
    "share_location",
    "rss_feed",
    "wifi",
    "signal_wifi_4_bar",
    "bluetooth",
    "network_wifi",

    // Media & Entertainment
    "play_arrow",
    "pause",
    "stop",
    "replay",
    "skip_next",
    "skip_previous",
    "fast_forward",
    "fast_rewind",
    "volume_up",
    "volume_down",
    "volume_off",
    "music_note",
    "album",
    "library_music",
    "mic",
    "mic_off",
    "headphones",
    "speaker",
    "radio",
    "video_library",
    "movie",
    "theaters",
    "camera",
    "camera_alt",
    "photo_camera",
    "videocam",
    "photo",
    "collections",
    "perm_media",

    // Files & Documents
    "folder_open",
    "create_new_folder",
    "folder_shared",
    "article",
    "document_scanner",
    "picture_as_pdf",
    "file_copy",
    "file_present",
    "drive_file_rename_outline",
    "text_snippet",
    "note",
    "sticky_note_2",
    "assignment",
    "task",
    "receipt",
    "inventory",
    "archive",
    "unarchive",

    // Shopping & Commerce
    "store",
    "storefront",
    "shopping_bag",
    "local_grocery_store",
    "add_shopping_cart",
    "remove_shopping_cart",
    "shopping_basket",
    "loyalty",
    "card_giftcard",
    "redeem",
    "local_offer",
    "sell",
    "money",
    "currency_exchange",
    "receipt_long",
    "point_of_sale",

    // Transportation & Travel
    "directions_car",
    "local_taxi",
    "directions_bus",
    "train",
    "flight",
    "sailing",
    "motorcycle",
    "pedal_bike",
    "directions_walk",
    "directions_run",
    "local_shipping",
    "traffic",
    "map",
    "navigation",
    "explore",
    "compass_calibration",
    "my_location",
    "place",
    "pin_drop",
    "room",
    "travel_explore",
    "luggage",
    "hotel",

    // Health & Fitness
    "fitness_center",
    "sports_gymnastics",
    "sports_soccer",
    "sports_basketball",
    "sports_tennis",
    "pool",
    "hiking",
    "self_improvement",
    "spa",
    "healing",
    "medical_services",
    "local_hospital",
    "local_pharmacy",
    "monitor_heart",
    "psychology",
    "mood",
    "sentiment_satisfied",
    "sentiment_very_satisfied",
    "sentiment_dissatisfied",

    // Food & Dining
    "restaurant",
    "local_pizza",
    "local_cafe",
    "local_bar",
    "wine_bar",
    "coffee",
    "breakfast_dining",
    "lunch_dining",
    "dinner_dining",
    "fastfood",
    "cake",
    "kitchen",
    "dining",
    "room_service",
    "delivery_dining",
    "takeout_dining",

    // Weather & Nature
    "wb_sunny",
    "cloud",
    "thunderstorm",
    "ac_unit",
    "beach_access",
    "nature",
    "nature_people",
    "park",
    "forest",
    "grass",
    "eco",
    "recycling",
    "water_drop",
    "local_fire_department",
    "waves",
    "terrain",

    // Technology & Devices
    "computer",
    "laptop",
    "tablet",
    "smartphone",
    "watch",
    "tv",
    "desktop_windows",
    "keyboard",
    "mouse",
    "memory",
    "storage",
    "router",
    "developer_board",
    "cable",
    "usb",
    "battery_full",
    "battery_charging_full",
    "power",
    "electrical_services",

    // Security & Privacy
    "security",
    "verified_user",
    "shield",
    "vpn_key",
    "fingerprint",
    "privacy_tip",
    "admin_panel_settings",
    "supervised_user_circle",
    "no_accounts",
    "account_box",
    "badge",

    // Time & Calendar
    "access_time",
    "alarm",
    "timer",
    "event",
    "event_available",
    "event_busy",
    "today",
    "date_range",
    "calendar_today",
    "watch_later",
    "hourglass_empty",
    "hourglass_full",

    // Tools & Utilities
    "build",
    "construction",
    "handyman",
    "plumbing",
    "cleaning_services",
    "pest_control",
    "agriculture",
    "precision_manufacturing",
    "manufacturing",
    "factory",
    "engineering",

    // Education & Learning
    "library_books",
    "book",
    "bookmark_added",
    "class",
    "quiz",
    "science",
    "biotech",
    "rule",
    "straighten",

    // System & Interface
    "grid_view",
    "view_list",
    "view_module",
    "view_carousel",
    "fullscreen",
    "fullscreen_exit",
    "zoom_in",
    "zoom_out",
    "rotate_right",
    "rotate_left",
    "flip",
    "crop",

    // Status & Indicators
    "new_releases",
    "fiber_new",
    "autorenew",
    "loop",
    "all_inclusive",

    // Geography & Location
    "satellite",
    "layers",
    "streetview",
    "landscape",

    // Accessibility
    "accessibility",
    "accessible",
    "hearing",
    "hearing_disabled",
    "record_voice_over",
    "sign_language",
    "closed_caption",
    "subtitles",
    "translate",

    // Animals & Nature
    "pets",
    "child_friendly",
    "elderly",
    "pregnant_woman",
    "stroller",

    // Emojis & Expressions
    "emoji_emotions",
    "emoji_events",
    "emoji_flags",
    "emoji_food_beverage",
    "emoji_nature",
    "emoji_objects",
    "emoji_people",
    "emoji_symbols",
    "emoji_transportation",

    // Additional Useful Icons
    "inventory_2",
    "qr_code",
    "qr_code_scanner",
    "face",
    "key",
    "star_rate",
    "thumb_up",
    "thumb_down",
    "thumbs_up_down",
    "local_activity",
    "confirmation_number",
    "event_seat",
    "weekend",
    "apartment",
    "domain",
    "gavel",
    "balance",
    "savings",
    "trending_down",
    "trending_flat",
    "show_chart",
    "multiline_chart",
    "pie_chart",
    "donut_large",
    "donut_small",
    "attach_money",
    "euro_symbol",
    "currency_pound",
    "currency_yen",
    "account_balance_wallet",
    "monetization_on",
    "paid",
    "request_quote",
    "local_atm",
    "price_check",
    "volunteer_activism",
    "handshake",
    "help_center",
    "live_help",
    "support_agent",
    "headset_mic",
    "call_end",
    "dialpad",
    "voicemail",
    "contact_support",
    "mark_email_read",
    "mark_email_unread",
    "drafts",
    "send",
    "forward",
    "inbox",
    "outbox",
    "unsubscribe",
    "flag",
    "announcement",
    "campaign",
    "volume_mute",
    "surround_sound",
    "graphic_eq",
    "equalizer",
    "shuffle",
    "repeat",
    "repeat_one",
    "playlist_add",
    "playlist_play",
    "queue",
    "queue_music",
    "library_add",
    "subscriptions",
    "video_settings",
    "hd",
    "4k",
    "av_timer",
    "closed_caption_off",
    "subtitles_off",
    "web",
    "web_asset",
    "important_devices",
    "cast",
    "cast_connected",
    "speaker_group",
    "portable_wifi_off",
    "wifi_off",
    "signal_wifi_off",
    "network_check",
    "settings_ethernet",
    "settings_input_antenna",
    "settings_input_component",
    "settings_input_composite",
    "settings_input_hdmi",
    "settings_input_svideo",
    "switch_video",
    "tv_off",
    "connected_tv",
  ];

  const iconModalId = `iconSelectorModal_${token}`;
  let tempalate = "";
  
  // Helper function to create icon HTML (will be used for lazy rendering)
  const createIconHTML = (iconName) => {
    return `
      <a 
      href="javascript:void(0);" onclick="appIconItem('${iconName}','${token}','${iconModalId}');"
      class="icon-item" 
      data-icon-name="${iconName}"
           style="display: inline-flex; 
           flex-direction: column; 
           align-items: center; 
           padding: 8px; margin: 2px; 
           border: 1px solid #e9ecef; 
           border-radius: 6px; cursor: pointer;
           transition: all 0.2s;
           min-width: 60px;
           height: 60px;
           flex: 1 1 auto;">
        <span class="material-symbols-outlined" style="font-size: 24px; color: #333;">${iconName}</span>
      </a>
    `;
  };
  
  NXUI.modalHTML({
    elementById: iconModalId,
    styleClass: "w-800px",
    label: `🎨 Select App Icon`,
    onclick: {
      title: "Clear Icon",
      cancel: "Close",
      send: false,
    },
    content: `
<div class="form-nexa-input-group">
      <div class="form-nexa-input-group-text">
        <span class="material-symbols-outlined" style="font-size: 24px; margin: 0px;">search</span>
      </div>
      <input type="text" id="searchIconInput_${token}" name="searchIconInput_${token}" class="form-nexa-control" placeholder="Cari nama icon... (Ctrl+F)">
       <div class="form-nexa-input-group-text">
         <button type="button" id="clearIconSearch_${token}" class="nx-btn-secondary" style="background: none; border: none; padding: 4px; color: #6c757d; cursor: pointer;">
           <span class="material-symbols-outlined" style="font-size: 24px; margin: 0px;">clear</span>
         </button>
       </div>
    </div>
          <div class="nx-scroll-hidden" style="height:400px; padding:8px;">
            <div class="icon-grid-container" id="iconGrid_${token}" style="
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
              gap: 4px;
              width: 100%;
              height: 100%;
              overflow-y: auto;
              padding: 4px;
            ">
             <div style="text-align: center; padding: 20px; color: #6c757d;">
               <span class="material-symbols-outlined" style="font-size: 48px; display: block; margin-bottom: 10px;">hourglass_empty</span>
               <div>Memuat icon...</div>
             </div>
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
  
  // Setup search functionality first (can work even while loading)
  const setupSearchFunctionality = () => {
    setTimeout(() => {
    const searchInput = NXUI.id(`searchIconInput_${token}`).element;
    const clearButton = NXUI.id(`clearIconSearch_${token}`).element;
    const iconGrid = NXUI.id(`iconGrid_${token}`).element;
    
    if (searchInput && iconGrid) {
      // Function to filter icons
      const filterIcons = (searchText) => {
        const searchValue = searchText.toLowerCase().trim();
        const iconItems = iconGrid.querySelectorAll('.icon-item');
        
        iconItems.forEach(item => {
          const iconName = item.getAttribute('data-icon-name') || '';
          if (iconName.toLowerCase().includes(searchValue)) {
            item.style.display = 'inline-flex';
          } else {
            item.style.display = 'none';
          }
        });
      };
      
      // Event listener for search input
      searchInput.addEventListener('input', (e) => {
        filterIcons(e.target.value);
      });
      
      // Event listener for Ctrl+F shortcut
      searchInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'f') {
          e.preventDefault();
          searchInput.focus();
        }
      });
      
      // Event listener for clear button
      if (clearButton) {
        clearButton.addEventListener('click', () => {
          searchInput.value = '';
          filterIcons('');
          searchInput.focus();
        });
      }
      
      // Focus search input when modal opens
      searchInput.focus();
    }
    }, 100);
  };
  
  // Lazy load icons in batches to improve performance
  setTimeout(() => {
    const iconGrid = NXUI.id(`iconGrid_${token}`).element;
    if (!iconGrid) return;
    
    // Clear loading indicator
    iconGrid.innerHTML = '';
    
    // Render icons in batches
    const BATCH_SIZE = 50; // Render 50 icons at a time
    let currentIndex = 0;
    
    const renderBatch = () => {
      const fragment = document.createDocumentFragment();
      const endIndex = Math.min(currentIndex + BATCH_SIZE, materialIcons.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        const iconName = materialIcons[i];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createIconHTML(iconName);
        const iconElement = tempDiv.firstElementChild;
        fragment.appendChild(iconElement);
      }
      
      iconGrid.appendChild(fragment);
      currentIndex = endIndex;
      
      // Continue rendering if there are more icons
      if (currentIndex < materialIcons.length) {
        requestAnimationFrame(renderBatch);
      }
    };
    
    // Start rendering
    requestAnimationFrame(renderBatch);
  }, 50);
  
  // Setup search functionality immediately (works even while icons are loading)
  setupSearchFunctionality();
}

window.appIconItem = async function(fieldLabel,token,iconModalId) {
console.log('label:', fieldLabel,token);
 NXUI.nexaModal.close(iconModalId);
    const Sdk = new NXUI.Buckets(token);
      const dataform = await Sdk.storage();
     await Sdk.upIndex({
         appIcon: fieldLabel,
     });
           
         const dataforms= await new NXUI.NexaModels().Storage("controllers")
          .where("userid",Number(NEXA.userId))
          .where("label", dataform.className)
          .update({
             appicon: fieldLabel,
          });

     NXUI.id("appIcon").innerHTML = fieldLabel;

}
