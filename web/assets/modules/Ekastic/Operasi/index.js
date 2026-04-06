import { opMetadata } from "./Metadata.js";
import { opComplex } from "./complex.js";
import { opPetir } from "./Petir.js";
import { NexaRoutes } from "./NexaRoutes.js";
import { subquery } from "./SubQuery/index.js";
import { opLayar } from "./Layar/index.js";

// Placeholder function untuk Layar (akan dibuat modul terpisah nanti)
async function opLayarX(data) {
  return `
    <div class="nx-card-body" style="padding: 20px;">
      <div class="nx-alert nx-alert-info">
        <h5><span class="material-symbols-outlined">tabs</span> Layar</h5>
        <p>Modul Layar sedang dalam pengembangan. Fitur untuk membuat dan mengelola banyak query SQL sekaligus dengan interface multi-tab.</p>
        <p><strong>Fitur yang akan tersedia:</strong></p>
        <ul>
          <li>Multi-tab query editor</li>
          <li>Jalankan banyak query sekaligus</li>
          <li>Kelola dan simpan query dalam satu layar</li>
          <li>Copy/paste query antar tab</li>
        </ul>
      </div>
    </div>
  `;
}

// Placeholder function untuk View (akan dibuat modul terpisah nanti)
async function opView(data) {
  return `
    <div class="nx-card-body" style="padding: 20px;">
      <div class="nx-alert nx-alert-info">
        <h5><span class="material-symbols-outlined">visibility</span> View</h5>
        <p>Modul View sedang dalam pengembangan. Fitur untuk membuat tabel view yang menggabungkan beberapa tabel dengan SQL editor.</p>
        <p><strong>Fitur yang akan tersedia:</strong></p>
        <ul>
          <li>Editor SQL untuk membuat CREATE VIEW statement</li>
          <li>Menggabungkan beberapa tabel dengan JOIN</li>
          <li>Konfigurasi kolom dan alias untuk view</li>
          <li>Preview hasil view sebelum dibuat</li>
        </ul>
      </div>
    </div>
  `;
}

// Placeholder function untuk Create Table (akan dibuat modul terpisah nanti)
async function opCreateTable(data) {
  return `
    <div class="nx-card-body" style="padding: 20px;">
      <div class="nx-alert nx-alert-info">
        <h5><span class="material-symbols-outlined">table_chart</span> Create Table</h5>
        <p>Modul Create Table sedang dalam pengembangan. Fitur untuk membuat tabel baru dengan SQL editor dan konfigurasi struktur tabel.</p>
        <p><strong>Fitur yang akan tersedia:</strong></p>
        <ul>
          <li>Wizard pembuatan tabel dengan form interaktif</li>
          <li>Editor SQL untuk CREATE TABLE statement</li>
          <li>Konfigurasi kolom, tipe data, dan constraint</li>
          <li>Preview struktur tabel sebelum dibuat</li>
        </ul>
      </div>
    </div>
  `;
}

export async function redOperasi(data) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
    const dimensi = new NXUI.NexaDimensi();

const height = dimensi.height("#nexa_app", 150, 'vh');
    const wrapper = NXUI.createElement(
      "div",
      `
        <div class="nx-card-header">
           <h3 class="bold fs-20px">Operasi</h3>  
           <div class="nx-card-controls align-right">v.${storage.version}</div>
         </div>
      <div id="setTabelNav">
         <div class="nx-row" id="nxdrop"></div>
      </div>
    `
    );

    setTimeout(async () => {
      try {
        // Inisialisasi NexaRoutes dengan data, container selector, dan default view
        // Default view 'metadata' sama dengan yang ditampilkan di Aplikasi (baris 74)
        const routes = new NexaRoutes(data, '#nxdrop .nx-col-8', 'metadata');
        
        // Register semua views yang tersedia
        routes.registerMultiple({
          metadata: opMetadata,  // View default yang sama dengan Aplikasi
          complex: opComplex,
          petir: opPetir,
          layar: opLayar,
          subquery: subquery,
          view: opView,
          create_table: opCreateTable
        });
        
        // Setup global functions untuk akses dari HTML onclick
        routes.setupGlobalFunctions();
        
        // Simpan instance routes di global untuk akses dari file lain
        window._nexaRoutes = routes;
        
        // Initialize drag and drop after template is inserted
        const render = new NXUI.NexaDrag({
          container: "#nxdrop",
          dragClass: "nx-dragging",
          dropClass: "nx-drop-zone",
        });

        // Cek apakah ada view terakhir yang tersimpan
        const lastView = routes.loadLastView();
        let initialView = 'metadata'; // Default view
        
        // Jika ada view terakhir dan masih terdaftar, gunakan itu
        if (lastView && routes.hasView(lastView)) {
          initialView = lastView;
        }

        // Render template dengan view yang sesuai (sudah menggunakan initialView)
        const template = render.Container({
          container: "#nxdrop",
          content: [
            await Aplikasi(data, height, storage, initialView), 
            await Guide(height, storage)
          ],
        });
        NXUI.id("nxdrop").innerHTML = template;
        render.drop();
        
        // Set currentView untuk tracking (tidak perlu switch lagi karena sudah di-render)
        if (initialView) {
          routes.currentView = initialView;
        }
      } catch (error) {
        console.error("❌ Error initializing drag and drop:", error);
      }
    }, 100);
    return wrapper.innerHTML;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
  }
}

export async function Aplikasi(data,height,storage, initialView = 'metadata') {
  // Tentukan view function berdasarkan initialView
  let viewFunction = opMetadata; // Default
  if (initialView === 'complex') viewFunction = opComplex;
  else if (initialView === 'petir') viewFunction = opPetir;
  else if (initialView === 'layar') viewFunction = opLayar;
  else if (initialView === 'subquery') viewFunction = subquery;
  else if (initialView === 'view') viewFunction = opView;
  else if (initialView === 'create_table') viewFunction = opCreateTable;
  
  return {
    id: "OperasiQuery",
    title: "Operasi Query ",
    col: "nx-col-8",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small>Operasi Type</small>`,
    html: await viewFunction(data),
  };
}

// Array menu items untuk Guide - mudah dikelola dan ditambahkan
const menuItems = [
  {
    icon: 'table_view',
    title: 'Index Tabel',
    type: 'single',
    action: 'goHome()',
    actionLabel: 'Update',
    version: 'v.1.59.1',
    description: 'Edit dan kelola metadata tabel dengan SQL editor interaktif',
    date: '08/11/2025, 10.43.52'
  },
  {
    icon: 'code',
    title: 'Complex',
    type: 'operasi',
    action: "navigate('complex')",
    actionLabel: 'Upgrade',
    version: 'v.1.59.1',
    description: 'Editor SQL untuk query kompleks dan subquery transactions',
    date: '08/11/2025, 10.43.52'
  },
  {
    icon: 'bolt',
    title: 'Petir',
    type: 'petir',
    action: "navigate('petir')",
    actionLabel: 'Upgrade',
    version: 'v.1.59.1',
    description: 'Editor SQL ultra-advanced untuk query super kompleks, nested queries, dan advanced database operations',
    date: '08/11/2025, 10.43.52'
  },
   {
    icon: 'account_tree',
    title: 'SubQuery',
    type: 'subquery',
    action: "navigate('subquery')",
    actionLabel: 'Upgrade',
    version: 'v.1.59.1',
    description: 'Editor SQL untuk subquery, nested queries, dan query dengan relasi tabel yang kompleks',
    date: '08/11/2025, 10.43.52'
  },
  {
    icon: 'tabs',
    title: 'Layar',
    type: 'layar',
    action: "navigate('layar')",
    actionLabel: 'New',
    version: 'v.1.59.1',
    description: 'Membuat dan mengelola banyak query SQL sekaligus dengan interface multi-tab',
    date: '08/11/2025, 10.43.52'
  },
  // {
  //   icon: 'view_quilt',
  //   title: 'Create View',
  //   type: 'view',
  //   action: "navigate('view')",
  //   actionLabel: 'New',
  //   version: 'v.1.59.1',
  //   description: 'Membuat tabel view yang menggabungkan beberapa tabel dengan SQL editor',
  //   date: '08/11/2025, 10.43.52'
  // },
  // {
  //   icon: 'table_chart',
  //   title: 'Create Tabel',
  //   type: 'create_table',
  //   action: "navigate('create_table')",
  //   actionLabel: 'New',
  //   version: 'v.1.59.1',
  //   description: 'Membuat tabel baru dengan SQL editor dan konfigurasi struktur tabel',
  //   date: '08/11/2025, 10.43.52'
  // }

];

export async function Guide(height,storage) {
  // Generate HTML dari array menuItems
  const menuHtml = menuItems.map(item => {
    // Cek apakah type cocok dengan storage?.query untuk menampilkan icon check
    const isActive = item.type === storage?.query;
    const checkIcon = isActive ? `<span class="material-symbols-outlined" style="margin-left: 5px; color: #4CAF50; font-size: 18px;">select_check_box</span>` : '';
    
    return `
    <div class="nx-list-item" style="background-color: #ffffff00; margin-top:10px">
      <span class="material-symbols-outlined" style="color: #566476;">${item.icon}</span>
      <span class="pt-15px">${item.title}${checkIcon}</span>
      <a onclick="${item.action};" class="pull-right nx-btn-primary custom-size-sm fs-11px" href="javascript:void(0);">${item.actionLabel}</a>
      <small class="fs-10px">${item.version}</small>
      <dd>${item.description}</dd>
      <span class="material-symbols-outlined nx-icon-xs" style="margin: 0px; font-size: 24px; color: #566476;">deployed_code_update</span>
      <small class="fs-10px">${item.date}</small>
    </div>
  `;
  }).join('');

  return {
    title: "Model",
    col: "nx-col-4",
      scroll: {
      type: "nx-scroll-hidden",
      height: height,
    },
    footer: `<small>Operasi  Model</small>`,
    html: `
     <div style="padding-top:0px">
      ${menuHtml}
     </div>
    `,
  };
}
export async function refreshLayar(store) {
  await NXUI.NexaRender.refresh(store, redOperasi, {
    containerSelector: "#OperasiQuery",
  });
}
