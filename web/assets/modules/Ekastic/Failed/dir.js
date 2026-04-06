import { NexaDirectory } from "./Tree.js";

export async function setFailed(data) {
  try {

     const Sdk = new NXUI.Buckets(data.id);
     const storage = await Sdk.storage();

        const objKey=Object.keys(storage?.form);
          const  variabels =storage?.insert ?? objKey;
          const menuTree={
        "main_menu": [
        {
           
            "class": "animation",
            "label": "Mengenal Pohuwato",
            "children": [
                {
                   
                    "label": "Profil Kabupaten",
                    "children": [
                        {
                            "href": "/profil/kabupaten/pohuwato",
                            "label": "Tentang Pohuwato"
                        },
                        {
                            "href": "/profil/sejarah/kabupaten/pohuwato",
                            "label": "Sejarah Kabupaten"
                        },
                        {
                            "href": "/profil/lembaga/daerah/pohuwato",
                            "label": "Lambang Daerah"
                        },
                        {
                            "href": "/profil/peta/wilayah/kabupaten/pohuwato",
                            "label": "Peta Pohuwato"
                        }
                    ]
                },
                {
                    "label": "Wilayah",
                    "children": [
                        {
                            "href": "/profil/wilayah/dengilo",
                            "label": "Dengilo"
                        },
                        {
                            "href": "/profil/wilayah/paguat",
                            "label": "Paguat"
                        },
                        {
                            "href": "/profil/wilayah/marisa",
                            "label": "Marisa"
                        },
                        {
                            "href": "/profil/wilayah/buntulia",
                            "label": "Buntulia"
                        },
                        {
                            "href": "/profil/wilayah/duhiadaa",
                            "label": "Duhiadaa"
                        },
                        {
                            "href": "/profil/wilayah/patilanggio",
                            "label": "Patilanggio"
                        },
                        {
                            "href": "/profil/wilayah/randangan",
                            "label": "Randangan"
                        },
                        {
                            "href": "/profil/wilayah/taluditi",
                            "label": "Taluditi"
                        },
                        {
                            "href": "/profil/wilayah/wanggarasi",
                            "label": "Wanggarasi"
                        },
                        {
                            "href": "/profil/wilayah/lemito",
                            "label": "Lemito"
                        },
                        {
                            "href": "/profil/wilayah/poptim",
                            "label": "Popayato Timur"
                        },
                        {
                            "href": "/profil/wilayah/popayato",
                            "label": "Popayato"
                        },
                        {
                            "href": "/profil/wilayah/pobbar",
                            "label": "Popayato Barat"
                        }
                    ]
                },
                {
                   
                    "label": "Profil Pemerintahan",
                    "children": [
                        {
                            "href": "/pemerintahan/visimisi",
                            "label": "Visi & Misi"
                        },
                        {
                            "href": "/pemerintahan/ruang-lingkup",
                            "label": "Ruang Lingkup"
                        },
                        {
                            "href": "/pemerintahan/tugas-dan-fungsi-pemerintahan",
                            "label": "Topoksi Pemerintahan"
                        },
                        {
                           
                            "label": "Pimpinan Daerah",
                            "children": [
                                {
                                    "href": "/pemerintahan/pimpinan/bupati",
                                    "label": "Bupati"
                                },
                                {
                                    "href": "/pemerintahan/pimpinan/wakil-bupati",
                                    "label": "Wakil Bupati"
                                },
                                {
                                    "href": "/pemerintahan/pimpinan/sekretariat-daerah",
                                    "label": "Sekretaris Daerah"
                                }
                            ]
                        },
                        {
                           
                            "label": "Perangkat Daerah",
                            "children": [
                                {
                                    "href": "/pemerintahan/perangkat/badan",
                                    "label": "Badan"
                                },
                                {
                                    "href": "/pemerintahan/perangkat/dinas",
                                    "label": "Dinas"
                                }
                            ]
                        },
                        {
                            "href": "/pemerintahan/struktur-organisasi",
                            "label": "Struktur Organisasi"
                        },
                        {
                            "href": "/pemerintahan/pejabat-struktural",
                            "label": "Daftar Pejabat Struktural"
                        },
                        {
                            "href": "/pemerintahan/kantor-pemerintah-kabupaten",
                            "label": "Alamat Kantor Pemerintah Kabupaten"
                        },
                        {
                            "href": "/pemerintahan/dprd-pohuwato",
                            "label": "DPRD Pohuwato"
                        },
                        {
                            "href": "/pemerintahan/lhkpn",
                            "label": "LHKPN"
                        },
                        {
                            "href": "/pemerintahan/manajemen-kinerja",
                            "label": "Manajemen Kinerja"
                        }
                    ]
                },
                {
                    "href": "/profil/laporan-pemerintahan",
                    "label": "Laporan Pemerintah"
                },
                {
                    "href": "/profil/info-publik-media",
                    "label": "Informasi Publik dan Media"
                }
            ]
        },
        {
           
            "class": "animation",
            "label": "Informasi dan Layanan",
            "children": [
                {
                   
                    "label": "Pembangunan Daerah",
                    "children": [
                        {
                            "href": "/informasi/proyek-strategis",
                            "label": "10 Proyek Strategis Pemda Pohuwato Tahun 2025"
                        }
                    ]
                },
                {
                   
                    "label": "Hidup di Pohuwato",
                    "children": [
                        {
                           
                            "label": "Menuju Pohuwato",
                            "children": [
                                {
                                    "href": "/informasi/menuju/akses/bandara",
                                    "label": "Akses Bandara"
                                },
                                {
                                    "href": "/informasi/menuju/akses/pelabuhan",
                                    "label": "Akses Pelabuhan"
                                },
                                {
                                    "href": "/informasi/menuju/akses/transportasi-darat",
                                    "label": "Akses Transportasi Darat"
                                },
                                {
                                    "href": "/informasi/menuju/akses/keliling-pohuwato",
                                    "label": "Berkeliling Pohuwato"
                                }
                            ]
                        },
                        {
                           
                            "label": "Transportasi",
                            "children": [
                                {
                                    "href": "/informasi/transportasi/bus-sekolah",
                                    "label": "Bus Sekolah"
                                },
                                {
                                    "href": "/informasi/transportasi/bus-wisata",
                                    "label": "Bus Wisata"
                                },
                                {
                                    "href": "/informasi/transportasi/info-rute",
                                    "label": "Informasi Rute"
                                },
                                {
                                    "href": "/informasi/transportasi/bentor",
                                    "label": "Bentor"
                                },
                                {
                                    "href": "/informasi/transportasi/taxi",
                                    "label": "Rental Mobil/TAXI"
                                }
                            ]
                        },
                        {
                           
                            "label": "Akomodasi",
                            "children": [
                                {
                                    "href": "/informasi/akomodasi/hotel",
                                    "label": "Hotel"
                                },
                                {
                                    "href": "/informasi/akomodasi/penginapan",
                                    "label": "Penginapan"
                                }
                            ]
                        },
                        {
                           
                            "label": "Kesehatan",
                            "children": [
                                {
                                    "href": "/informasi/kesehatan/rumah-sakit",
                                    "label": "Rumah Sakit"
                                },
                                {
                                    "href": "/informasi/kesehatan/puskes",
                                    "label": "Puskesmas"
                                },
                                {
                                    "href": "/informasi/kesehatan/prokes",
                                    "label": "Program Kesehatan"
                                }
                            ]
                        },
                        {
                           
                            "label": "Sarana Kebugaran",
                            "children": [
                                {
                                    "href": "/sarana/kebugaran/gor",
                                    "label": "GOR"
                                }
                            ]
                        },
                        {
                           
                            "label": "Fasilitas Pendidikan",
                            "children": [
                                {
                                    "href": "/pendidikan/paud",
                                    "label": "Pendidikan Anak Usia Dini (PAUD)"
                                },
                                {
                                    "href": "/pendidikan/slb",
                                    "label": "Sekolah Luar Biasa"
                                },
                                {
                                    "href": "/pendidikan/sd",
                                    "label": "Sekolah Dasar"
                                },
                                {
                                    "href": "/pendidikan/smp",
                                    "label": "Sekolah Menengah Pertama"
                                },
                                {
                                    "href": "/pendidikan/sma",
                                    "label": "Sekolah Menengah Atas"
                                },
                                {
                                    "href": "/pendidikan/pt",
                                    "label": "Perguruan Tinggi"
                                },
                                {
                                    "href": "/pendidikan/perpustakaan",
                                    "label": "Perpustakaan"
                                },
                                {
                                    "href": "/pendidikan/ppdb",
                                    "label": "PPDB Online"
                                },
                                {
                                    "href": "/pendidikan/pjj",
                                    "label": "Pembelajaran Jarak Jauh (PJJ)"
                                }
                            ]
                        },
                        {
                           
                            "label": "Sosial & Komunitas",
                            "children": [
                                {
                                    "href": "/komunitas/pkk",
                                    "label": "PKK"
                                },
                                {
                                    "href": "/komunitas/pengusaha",
                                    "label": "Pohuwato Entrepreneur"
                                },
                                {
                                    "href": "/komunitas/jumantik",
                                    "label": "Jumantik"
                                },
                                {
                                    "href": "/komunitas/karang-taruna",
                                    "label": "Karang Taruna"
                                },
                                {
                                    "href": "/komunitas/creative",
                                    "label": "Pohuwato Creative Hub"
                                },
                                {
                                    "href": "/komunitas/pkh",
                                    "label": "Program Keluarga Harapan (PKH)"
                                }
                            ]
                        }
                    ]
                },
                {
                   
                    "label": "Layanan Warga",
                    "children": [
                        {
                           
                            "label": "Layanan Darurat",
                            "children": [
                                {
                                    "href": "/layanan/darurat/kesehatan",
                                    "label": "Gawat Darurat Kesehatan"
                                },
                                {
                                    "href": "/layanan/darurat/pohuwato-siaga",
                                    "label": "Pohuwato Siaga"
                                },
                                {
                                    "href": "/layanan/darurat/pantau-banjir",
                                    "label": "Pantau Banjir"
                                },
                                {
                                    "href": "/layanan/darurat/kebakaran",
                                    "label": "Kebakaran"
                                }
                            ]
                        },
                        {
                           
                            "label": "Administrasi Kependudukan",
                            "children": [
                                {
                                    "href": "/layanan/administrasi/kependudukan/ktp",
                                    "label": "Kartu Tanda Penduduk"
                                },
                                {
                                    "href": "/layanan/administrasi/kependudukan/kia",
                                    "label": "Kartu Identitas Anak"
                                },
                                {
                                    "href": "/layanan/administrasi/kependudukan/kk",
                                    "label": "Kartu Keluarga"
                                },
                                {
                                    "href": "/layanan/administrasi/kependudukan/akta-lahir",
                                    "label": "Akta Kelahiran"
                                },
                                {
                                    "href": "/layanan/administrasi/kependudukan/akta-kematian",
                                    "label": "Akta Kematian"
                                },
                                {
                                    "href": "/layanan/administrasi/kependudukan/akta-perceraian",
                                    "label": "Akta Perceraian"
                                },
                                {
                                    "href": "/layanan/administrasi/kependudukan/akta-perkawinan",
                                    "label": "Akta Perkawinan"
                                }
                            ]
                        },
                        {
                           
                            "label": "Pelayanan Terpadu",
                            "children": [
                                {
                                    "href": "/layanan/terpadu/pemakaman",
                                    "label": "Pemakaman"
                                },
                                {
                                    "href": "/layanan/terpadu/penggunaan-taman",
                                    "label": "Penggunaan Taman"
                                },
                                {
                                    "href": "/layanan/terpadu/izin-bangunan",
                                    "label": "Perizinan Bangunan"
                                },
                                {
                                    "href": "/layanan/terpadu/surat-izin-praktik",
                                    "label": "Surat Izin Praktik"
                                },
                                {
                                    "href": "/layanan/terpadu/pelayanan-izin-lainnya",
                                    "label": "Pelayanan dan Perizinan Lainnya"
                                }
                            ]
                        },
                        {
                           
                            "label": "Perpajakan",
                            "children": [
                                {
                                    "href": "/layanan/perpajakan/online",
                                    "label": "Pajak Online"
                                },
                                {
                                    "href": "/layanan/perpajakan/e-samsat",
                                    "label": "E-Samsat"
                                },
                                {
                                    "href": "/layanan/perpajakan/esppt",
                                    "label": "eSPPT PBB"
                                },
                                {
                                    "href": "/layanan/perpajakan/ebphtb",
                                    "label": "eBPHTB"
                                },
                                {
                                    "href": "/layanan/perpajakan/retriburasi",
                                    "label": "Retribusi"
                                }
                            ]
                        },
                        {
                           
                            "label": "Akses Digital",
                            "children": [
                                {
                                    "href": "/layanan/digital/sibeto",
                                    "label": "SIBETO"
                                },
                                {
                                    "href": "/layanan/digital/tapara",
                                    "label": "SIAP TAPARA"
                                },
                                {
                                    "href": "/layanan/digital/kesbangpol",
                                    "label": "Rezim"
                                }
                            ]
                        },
                        {
                           
                            "label": "Bantuan Pemerintah",
                            "children": [
                                {
                                    "href": "/layanan/bantuan/blt",
                                    "label": "BLT"
                                }
                            ]
                        },
                        {
                           
                            "label": "Pengaduan Warga",
                            "children": [
                                {
                                    "href": "/pengaduan/lapor-pak",
                                    "label": "Lapor Pak"
                                }
                            ]
                        },
                        {
                            "href": "/layanan/disabilitas",
                            "label": "Layanan Disabilitas"
                        }
                    ]
                },
                {
                   
                    "label": "Investasi & Bisnis",
                    "children": [
                        {
                           
                            "label": "Berinvestasi di Pohuwato",
                            "children": [
                                {
                                    "href": "/informasi/investasi/mulai-investasi",
                                    "label": "Mulai Berinvestasi"
                                },
                                {
                                    "href": "/informasi/investasi/potensi-investasi",
                                    "label": "Potensi Investasi"
                                },
                                {
                                    "href": "/informasi/investasi/prosedur-investasi",
                                    "label": "Prosedur Investasi"
                                },
                                {
                                    "href": "/informasi/investasi/prosedur-operasional",
                                    "label": "Prosedur Operasional"
                                },
                                {
                                    "href": "/informasi/investasi/realisasi-investasi",
                                    "label": "Realisasi Investasi"
                                }
                            ]
                        },
                        {
                           
                            "label": "Berkarir di Pohuwato",
                            "children": [
                                {
                                    "href": "/informasi/investasi/loker",
                                    "label": "Lowongan Kerja"
                                },
                                {
                                    "href": "/informasi/investasi/asuransi-pekerja",
                                    "label": "Asuransi Pekerja"
                                },
                                {
                                    "href": "/informasi/investasi/tenaga-kerja",
                                    "label": "Tenaga Kerja"
                                },
                                {
                                    "href": "/informasi/investasi/naker",
                                    "label": "Naker"
                                }
                            ]
                        }
                    ]
                },
                {
                   
                    "label": "Kebijakan Kota",
                    "children": [
                        {
                            "href": "/informasi/kebijakan/sosial",
                            "label": "Kebijakan Bantuan Sosial"
                        },
                        {
                            "href": "/informasi/kebijakan/perumahan",
                            "label": "Kebijakan Bantuan Perumahan"
                        }
                    ]
                },
                {
                   
                    "label": "Aplikasi Layanan Warga",
                    "children": [
                        {
                            "href": "/layanan/digital/sibeto",
                            "label": "SIBETO"
                        },
                        {
                            "href": "/layanan/digital/tapara",
                            "label": "SIAP TAPARA"
                        },
                        {
                            "href": "/layanan/digital/kesbangpol",
                            "label": "Rezim"
                        }
                    ]
                },
                {
                   
                    "label": "Keamanan & Ketahanan",
                    "children": [
                        {
                            "href": "/informasi/keamanan/hukum",
                            "label": "Hukum"
                        }
                    ]
                }
            ]
        },
        {
           
            "class": "animation",
            "label": "Jelajah Pohuwato",
            "children": [
                {
                    "href": "/jelajah/pusat-perbelanjaan",
                    "label": "Pusat Perbelanjaan"
                },
                {
                    "href": "/jelajah/wisata-kuliner",
                    "label": "Wisata Kuliner"
                },
                {
                    "href": "/jelajah/rekreasi-taman-bermain",
                    "label": "Tempat Rekreasi dan Taman Bermain"
                },
                {
                    "href": "/jelajah/taman-kota",
                    "label": "Taman Kota"
                },
                {
                    "href": "/jelajah/hiburan",
                    "label": "Hiburan"
                }
            ]
        },
        {
            "href": "/ipkd",
            "label": "IPKD"
        }
    ]
};

    // const  checkedItems = await Sdk.getFields("nested") || [];
      const filteredStorage = NXUI.NexaFormKey.include(storage, variabels);
     
     // Helper function to convert menuTree structure to Tree.js format
     function convertMenuToTreeFormat(menuData) {
       function convertItem(item, parentKey = "") {
         // Generate unique key if not provided
         const itemKey = item.key || item.label?.toLowerCase().replace(/\s+/g, "-") || `item-${Math.random().toString(36).substr(2, 9)}`;
         const fullKey = parentKey ? `${parentKey}-${itemKey}` : itemKey;
         
         // Check if item has children to determine if it's a folder
         const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
         
         const convertedItem = {
           key: fullKey,
           label: item.label || "Untitled"
         };
         
         // Only set icon if explicitly provided, otherwise let Tree.js auto-detect folder/file
         if (item.icon) {
           convertedItem.icon = item.icon;
         }
         // If no icon provided, Tree.js will auto-use "folder" for items with submenu or "file" for items without
         
         // Set action: prioritize existing action, then href-based action, then null
         if (item.action) {
           convertedItem.action = item.action;
         } else if (item.href) {
           convertedItem.action = `viewPage:${item.href}`;
         }
         // If no action and no children, action stays undefined (Tree.js handles this)
         
         // Convert children to submenu (Tree.js expects 'submenu' not 'children')
         if (hasChildren) {
           convertedItem.submenu = item.children.map(child => convertItem(child, fullKey));
         }
         
         // Preserve additional properties that might be useful
         if (item.href) convertedItem.href = item.href;
         if (item.class) convertedItem.class = item.class;
         
         return convertedItem;
       }
       
       // Handle different input formats: main_menu array, submenu array, or direct object
       let menuItems = [];
       if (menuData.main_menu && Array.isArray(menuData.main_menu)) {
         menuItems = menuData.main_menu;
       } else if (menuData.submenu && Array.isArray(menuData.submenu)) {
         menuItems = menuData.submenu;
       } else if (Array.isArray(menuData)) {
         menuItems = menuData;
       } else {
         console.warn("Menu data format not recognized, using empty menu");
       }
       
       return {
         submenu: menuItems.map(item => convertItem(item))
       };
     }
     
     // Convert menuTree to Tree.js format
     const treeData = convertMenuToTreeFormat(menuTree);
     
     setTimeout(async () => {
       try {
         const containerId = `menu_${storage.id}`;
         const contentContainerId = `content_${storage.id}`;
         
         // Wait for containers to be available
         const menuContainer = document.getElementById(containerId);
         const contentContainer = document.getElementById(contentContainerId);
         
         if (!menuContainer) {
           console.error(`Menu container not found: ${containerId}`);
           return;
         }
         
         if (!contentContainer) {
           console.error(`Content container not found: ${contentContainerId}`);
           return;
         }
         
         // Initialize NexaDirectory with containerId, instance, and contentContainerId
         const treeInstance = new NexaDirectory(containerId, null, contentContainerId);
         // Render with converted data
         treeInstance.render(treeData);
       } catch (error) {
         console.error("❌ Error initializing NexaDirectory:", error);
       }
     }, 100);
    // ✅ Return template sederhana, NexaFlexPage akan handle data dengan render
    // Jika input sudah memiliki value, akan otomatis diparse menjadi chips
    // Contoh: value="status,updated_at" akan menampilkan 2 chips: status dan updated_at
    return `
  <div class="nx-row">
    <div class="nx-col-4">
      <div id="menu_${storage.id}"></div>
    </div>
    <div class="nx-col-8">
      <div id="content_${storage.id}"></div>
    </div>
</div>

          


    `;
    
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return `
        <div class="alert alert-danger text-center">
            <h5>❌ Initialization Failed</h5>
            <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
        </div>
    `;
  }
}

export class TreeChild {
  constructor() {
    this.isEditing = false;
  }
}
