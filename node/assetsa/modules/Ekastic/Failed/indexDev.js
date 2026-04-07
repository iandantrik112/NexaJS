// Class untuk mengelola data BPS API
class BPSDataManager {
  constructor(apiKey, baseUrl, domainId, page = 1) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.domainId = domainId;
    this.topics = [];
    this.subjects = {};
    this.data = {};
    this.page = page;
  }
  
  // Step 1: Ambil daftar topik/kategori untuk halaman tertentu
  async fetchTopics(page = 1) {
    const subcatUrl = `${this.baseUrl}/api/list?model=var&domain=${this.domainId}&key=${this.apiKey}&page=${page}`;
    try {
      const response = await fetch(subcatUrl);
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // Ambil semua sub_name dari semua halaman
  async fetchAllSubNames() {
    const allSubNames = [];
    let currentPage = 1;
    let hasMorePages = true;
    let totalPages = null;
    let totalItems = 0;

    console.log('🔄 Memulai pengambilan semua sub_name...\n');

    while (hasMorePages) {
      try {
        const result = await this.fetchTopics(currentPage);
        
        if (!result.success) {
          console.log(`❌ Gagal mengambil halaman ${currentPage}`);
          break;
        }

        const responseData = result.data;
        
        // Cek struktur response untuk mendapatkan total halaman
        if (responseData.data && Array.isArray(responseData.data)) {
          // Biasanya data[0] berisi metadata (total, per_page, dll)
          if (responseData.data[0] && typeof responseData.data[0] === 'object') {
            totalPages = responseData.data[0].total_page || responseData.data[0].total_pages;
            totalItems = responseData.data[0].total || totalItems;
          }

          // Data aktual biasanya di data[1]
          if (responseData.data[1] && Array.isArray(responseData.data[1])) {
            const items = responseData.data[1];
            
            // Extract sub_name dari setiap item
            items.forEach(item => {
              if (item.sub_name) {
                allSubNames.push({
                  sub_name: item.sub_name,
                  var_id: item.var_id || null,
                  var_title: item.var_title || null,
                  page: currentPage
                });
              }
            });

            console.log(`✅ Halaman ${currentPage}: ${items.length} item ditemukan (Total: ${allSubNames.length})`);
          }
        }

        // Cek apakah masih ada halaman berikutnya
        if (totalPages) {
          hasMorePages = currentPage < totalPages;
        } else {
          // Jika tidak ada info total_pages, cek apakah data[1] kosong atau tidak ada
          if (!responseData.data || !responseData.data[1] || responseData.data[1].length === 0) {
            hasMorePages = false;
          }
        }

        currentPage++;
        
        // Safety limit untuk menghindari infinite loop
        if (currentPage > 1000) {
          console.log('⚠️  Batas maksimal halaman tercapai (1000)');
          break;
        }

        // Delay kecil untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error pada halaman ${currentPage}:`, error);
        hasMorePages = false;
      }
    }

    console.log(`\n✅ Selesai! Total sub_name ditemukan: ${allSubNames.length}`);
    if (totalItems > 0) {
      console.log(`📊 Total item dari API: ${totalItems}`);
    }

    // Generate unique sub_names (sorted alphabetically)
    const uniqueSubNames = [...new Set(allSubNames.map(item => item.sub_name))].sort();

    // Return data statistik yang baku
    return {
      total: allSubNames.length,
      uniqueCount: uniqueSubNames.length,
      uniqueSubNames: uniqueSubNames
    };
  }
  
  // Step 2: Ambil subject untuk kategori tertentu

  
  // Menampilkan ringkasan semua data
  // displaySummary() {
  //   console.log('✅ RINGKASAN:');
  //   console.log(`   Topik: ${this.topics.length} | Subject: ${Object.values(this.subjects).reduce((sum, arr) => sum + arr.length, 0)} | Data: ${Object.keys(this.data).length}`);
  // }
}

export async function setFailed(data) {
  try {
    // BPS API Configuration
    const BPS_API_KEY = '2b5881e930f563142e9bccec44da6744';
    const BPS_BASE_URL = 'https://webapi.bps.go.id/v1';
    const DOMAIN_ID = '7503'; // Kabupaten Pohuwato
    
    // Buat instance BPSDataManager
    const bpsManager = new BPSDataManager(BPS_API_KEY, BPS_BASE_URL, DOMAIN_ID, 1);
    
    // Ambil semua sub_name dari semua halaman
    const result = await bpsManager.fetchAllSubNames();
    
    if (result && result.total > 0) {
      console.log('\n📋 HASIL STATISTIK SUB_NAME:');
      console.log('='.repeat(50));
      console.log(`Total: ${result.total} item`);
      console.log(`Unique sub_name: ${result.uniqueCount}`);
      console.log('\n📝 Daftar unique sub_name:');
      
      // Tampilkan unique sub_name dengan format yang rapi
      result.uniqueSubNames.forEach((subName, index) => {
        console.log(`${index + 1}. ${subName}`);
      });
      
      console.log('\n📊 Data Statistik (JSON):');
      console.log(JSON.stringify(result, null, 2));
      
      return JSON.stringify(result, null, 2);
    } else {
      console.error('❌ Gagal mengambil data atau tidak ada data');
      return '';
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    return '';
  }
}
