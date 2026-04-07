/**
 * Get icon berdasarkan type field
 * Menggunakan MaterialCommunityIcons (Material prop)
 * @param {string} type - Type field
 * @param {string} customIcon - Custom icon jika ada
 * @returns {string} - Nama icon MaterialCommunityIcons
 */
export function getIconByType(type, customIcon = null) {
  // Jika ada custom icon dan bukan "attach_file", gunakan custom icon tersebut
  if (customIcon && customIcon !== "attach_file") {
    // Transform invalid Material icons to valid MaterialCommunityIcons
    if (customIcon === 'business') return 'office-building';
    if (customIcon === 'visibility_off') return 'eye-off';
    if (customIcon === 'visibility') return 'eye';
    if (customIcon === 'visibility_outlined') return 'eye-outline';
    if (customIcon === 'visibility_off_outlined') return 'eye-off-outline';
    
    return customIcon;
  }

  // Mapping tipe field ke MaterialCommunityIcons
  // Nama icon harus sesuai dengan MaterialCommunityIcons naming convention
  // Format: menggunakan dash/hyphen, bukan underscore
  const iconMap = {
    text: "pencil-outline", // Icon untuk field text biasa
    hidden: "eye-off-outline", // Icon untuk field hidden
    email: "email-outline", // Icon untuk field email
    password: "lock-outline", // Icon untuk field password
    number: "numeric", // Icon untuk field number
    tel: "phone-outline", // Icon untuk field telepon
    url: "link-variant", // Icon untuk field URL
    search: "magnify", // Icon untuk field search
    date: "calendar-outline", // Icon untuk field date
    "datetime-local": "clock-outline", // Icon untuk field datetime-local
    time: "clock-outline", // Icon untuk field time
    textarea: "text-box-outline", // Icon untuk field textarea
    select: "menu-down", // Icon untuk field select
    dropdown: "menu-down", // Icon untuk field dropdown
    radio: "radiobox-marked", // Icon untuk field radio
    checkbox: "checkbox-marked", // Icon untuk field checkbox
    switch: "toggle-switch-outline", // Icon untuk field switch
    boolean: "toggle-switch-outline", // Icon untuk field boolean
    file: "file-outline", // Icon untuk field file
    camera: "camera-outline", // Icon untuk field camera
    range: "slider-horizontal", // Icon untuk field range
    color: "palette-outline", // Icon untuk field color
    flag: "flag-outline", // Icon untuk field flag
    currency: "currency-usd", // Icon untuk field currency
    approval: "check-circle-outline", // Icon untuk field approval
    slug: "link-variant", // Icon untuk slug
    keyup: "keyboard-outline", // Icon untuk keyup
    tags: "tag-outline", // Icon untuk tags
    maps: "map-marker-outline", // Icon untuk maps
    richtext: "format-text", // Icon untuk rich text editor
    editor: "text-box-multiple-outline", // Icon untuk editor
    document: "file-document-outline", // Icon untuk document
    video: "video-outline", // Icon untuk video
    instansi: "office-building", // Icon untuk instansi
  };

  // Kembalikan icon sesuai tipe, atau icon default jika tipe tidak ditemukan
  return iconMap[type?.toLowerCase()] || "help-circle-outline";
}

