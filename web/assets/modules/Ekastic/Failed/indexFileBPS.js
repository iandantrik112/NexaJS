// Class untuk mengelola data BPS API
class BPSDataManager {
  constructor(apiKey, baseUrl, domainId) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.domainId = domainId;
    this.topics = [];
    this.subjects = {};
    this.data = {};
  }
  
  // Step 1: Ambil daftar topik/kategori
  async fetchTopics() {
    const subcatUrl = `${this.baseUrl}/api/list/?model=subcat&domain=${this.domainId}&lang=ind&key=${this.apiKey}`;
    try {
      const response = await fetch(subcatUrl);
      const responseData = await response.json();
      
      if (responseData.status === 'OK' && responseData.data && responseData.data[1]) {
        const subcats = responseData.data[1];
        // console.log('subcats:', responseData);
        
        this.topics = subcats.map(subcat => ({
          label: subcat.title || `Kategori ${subcat.subcat_id || ''}`,
          value: subcat.title || `Kategori ${subcat.subcat_id || ''}`,
          subcat_id: subcat.subcat_id
        }));
        
        // console.log(`✅ Total topik tersedia: ${responseData.data[0].total}`);
        // console.log('📋 DAFTAR SEMUA TOPIK:');
        // this.topics.forEach((topic, i) => {
        //   console.log(`   ${i + 1}. ${topic.label} (ID: ${topic.subcat_id})`);
        // });
        // console.log('📄 FORMAT JSON:', JSON.stringify(this.topics, null, 2));
        
        return { success: true, data: responseData };
      } else {
        return { success: false, data: null };
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
  
  // Step 2: Ambil subject untuk kategori tertentu
  async fetchSubjects(categoryName) {
    console.log(`🌾 STEP 2: MENGAMBIL SUBJECT: "${categoryName}"`);
    
    const category = this.topics.find(t => t.label === categoryName || t.value === categoryName);
    
    if (!category) {
      return { success: false, subjects: [] };
    }
    
    const subcatId = category.subcat_id;
    const subjectUrl = `${this.baseUrl}/api/list/?model=subject&domain=${this.domainId}&lang=ind&key=${this.apiKey}&subcat=${subcatId}&page=1`;
    
    try {
      const response = await fetch(subjectUrl);
      const responseData = await response.json();
      
      if (responseData.status === 'OK' && responseData.data && responseData.data[1]) {
        const subjects = responseData.data[1];
        
        const subjectList = subjects.map(subj => ({
          label: subj.title || 'N/A',
          value: subj.title || 'N/A',
          sub_id: subj.sub_id || null,
          subcat: subj.subcat || 'N/A',
          subcat_id: subj.subcat_id || null
        }));
        
        this.subjects[categoryName] = subjectList;
       
        
        return { success: true, subjects: subjectList };
      } else {
        return { success: false, subjects: [] };
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      return { success: false, error: err.message, subjects: [] };
    }
  }
  
  // Step 3: Ambil data untuk subject tertentu
  async fetchData(subjectId, subjectTitle, year = null) {
    console.log(`📊 STEP 3: MENGAMBIL DATA untuk Subject: "${subjectTitle}"`);
    
    if (!year) {
      const currentYear = new Date().getFullYear();
      year = currentYear - 1;
    }
    
    const variableOptions = [
      subjectId.toString(),
      subjectTitle.toLowerCase().replace(/\s+/g, '-'),
      subjectTitle.toLowerCase().replace(/\s+/g, '_')
    ];
    
    let dataFound = null;
    
    for (const variable of variableOptions) {
      const dataUrl = `${this.baseUrl}/api/list/model/data/domain/${this.domainId}/var/${variable}/key/${this.apiKey}?th=${year}`;
      
      try {
        const response = await fetch(dataUrl);
        const responseData = await response.json();
        
        if (responseData.status === 'OK') {
          const hasData = (responseData.var && responseData.var.length > 0) ||
                         (responseData.datacontent && responseData.datacontent.length > 0) ||
                         (responseData.subject && responseData.subject.length > 0);
          
          if (hasData) {
            dataFound = responseData;
            this.data[subjectId] = {
              subject_id: subjectId,
              subject_title: subjectTitle,
              year: year,
              variable: variable,
              data: responseData
            };
            // console.log(`✅ Data ditemukan untuk "${subjectTitle}"`);
            // console.log(`📄 DATA:`, JSON.stringify(dataFound, null, 2));
            break;
          }
        }
      } catch (err) {
        // Silent fail, try next variable
      }
    }
    
    if (!dataFound) {
      console.log(`⚠️ Data tidak ditemukan untuk "${subjectTitle}"`);
    }
    
    return dataFound;
  }
  
  // Step 4: Ambil daftar Static Table berdasarkan subject
  async fetchStaticTablesBySubject(subjectId, page = 1) {
    let staticTableUrl = `${this.baseUrl}/api/list/?model=statictable&domain=${this.domainId}&lang=ind&key=${this.apiKey}&page=${page}`;
    if (subjectId) {
      staticTableUrl += `&subj=${subjectId}`;
    }
    
    try {
      const response = await fetch(staticTableUrl);
      
      // Cek Content-Type untuk memastikan response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log(`   ⚠️ Response bukan JSON, Content-Type: ${contentType}`);
        console.log(`   URL: ${staticTableUrl}`);
        return { success: false, error: 'Response bukan JSON (mungkin HTML error page)', staticTables: [] };
      }
      
      const responseData = await response.json();
      
      if (responseData.status === 'OK' && responseData.data && responseData.data[1]) {
        const staticTables = responseData.data[1];
        const pageInfo = responseData.data[0];
        
        const tableList = staticTables.map(table => ({
          table_id: table.table_id || null,
          title: table.title || 'N/A',
          subject_id: table.subject_id || null,
          subject: table.subject || 'N/A',
          pub_date: table.pub_date || null,
          table_url: table.table_url || null
        }));
        
        return { 
          success: true, 
          staticTables: tableList,
          pageInfo: pageInfo,
          total: pageInfo.total || 0
        };
      } else {
        return { success: false, staticTables: [], error: responseData.message || 'Data tidak ditemukan' };
      }
    } catch (err) {
      console.log(`   ❌ Error fetching Static Table: ${err.message}`);
      return { success: false, error: err.message, staticTables: [] };
    }
  }
  
  // Step 5: Ambil topik dari Static Table untuk subject
  async fetchTopicsFromStaticTable(subjectId, subjectTitle) {
    console.log(`   📊 Mencari Static Table untuk subject_id: ${subjectId}...`);
    const staticTablesResult = await this.fetchStaticTablesBySubject(subjectId, 1);
    
    const topics = [];
    
    if (staticTablesResult.success && staticTablesResult.staticTables.length > 0) {
      console.log(`   ✅ Ditemukan ${staticTablesResult.staticTables.length} Static Table`);
      
      staticTablesResult.staticTables.forEach(table => {
        if (table.title && table.title !== 'N/A') {
          topics.push({
            source: 'static_table',
            table_id: table.table_id,
            label: table.title,
            pub_date: table.pub_date,
            subject_id: table.subject_id,
            subject: table.subject,
            table_url: table.table_url
          });
        }
      });
      
      // Jika ada lebih dari 1 halaman, ambil semua halaman
      if (staticTablesResult.pageInfo && staticTablesResult.pageInfo.pages > 1) {
        for (let page = 2; page <= staticTablesResult.pageInfo.pages; page++) {
          const nextPageResult = await this.fetchStaticTablesBySubject(subjectId, page);
          if (nextPageResult.success && nextPageResult.staticTables.length > 0) {
            nextPageResult.staticTables.forEach(table => {
              if (table.title && table.title !== 'N/A') {
                topics.push({
                  source: 'static_table',
                  table_id: table.table_id,
                  label: table.title,
                  pub_date: table.pub_date,
                  subject_id: table.subject_id,
                  subject: table.subject,
                  table_url: table.table_url
                });
              }
            });
          }
        }
      }
    } else {
      console.log(`   ⚠️ Tidak ada Static Table ditemukan untuk subject_id: ${subjectId}`);
    }
    
    return topics;
  }
  
  // Step 6: Ambil topik dari Publication untuk subject
  async fetchTopicsFromPublication(subjectId, subjectTitle) {
    const pubUrl = `${this.baseUrl}/api/list/?model=publication&domain=${this.domainId}&lang=ind&key=${this.apiKey}&subj=${subjectId}&page=1`;
    
    try {
      const response = await fetch(pubUrl);
      const responseData = await response.json();
      
      const topics = [];
      
      if (responseData.status === 'OK' && responseData.data && responseData.data[1]) {
        const publications = responseData.data[1];
        const pageInfo = responseData.data[0];
        
        // Ambil semua publication tanpa filter
        publications.forEach(pub => {
          if (pub.title && pub.title !== 'N/A') {
            topics.push({
              source: 'publication',
              pub_id: pub.pub_id || null,
              label: pub.title,
              pub_date: pub.pub_date || null,
              subject_id: pub.subject_id || subjectId
            });
          }
        });
        
        // Ambil semua halaman jika ada
        if (pageInfo && pageInfo.pages > 1) {
          for (let page = 2; page <= pageInfo.pages; page++) {
            const nextPageUrl = `${this.baseUrl}/api/list/?model=publication&domain=${this.domainId}&lang=ind&key=${this.apiKey}&subj=${subjectId}&page=${page}`;
            const nextResponse = await fetch(nextPageUrl);
            const nextData = await nextResponse.json();
            
            if (nextData.status === 'OK' && nextData.data && nextData.data[1]) {
              nextData.data[1].forEach(pub => {
                if (pub.title && pub.title !== 'N/A') {
                  topics.push({
                    source: 'publication',
                    pub_id: pub.pub_id || null,
                    label: pub.title,
                    pub_date: pub.pub_date || null,
                    subject_id: pub.subject_id || subjectId
                  });
                }
              });
            }
          }
        }
      }
      
      return topics;
    } catch (err) {
      return [];
    }
  }
  
  // Step 7: Ambil detail Publication berdasarkan pub_id
  async fetchPublicationDetail(pubId) {
    // Endpoint: /api/list/?model=publication&domain={domain}&id={id}&key={key}
    // Endpoint ini mengembalikan daftar publication, jadi kita cari yang sesuai dengan pub_id
    const detailUrl = `${this.baseUrl}/api/list/?model=publication&domain=${this.domainId}&lang=ind&key=${this.apiKey}&id=${pubId}`;
    
    try {
      const response = await fetch(detailUrl);
      
      // Cek Content-Type untuk memastikan response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: false, error: 'Response bukan JSON', detail: null };
      }
      
      const responseData = await response.json();
      
      if (responseData.status === 'OK' && responseData.data) {
        // Response berisi array dengan struktur [pageInfo, publications]
        let publications = [];
        
        if (Array.isArray(responseData.data)) {
          if (responseData.data[1] && Array.isArray(responseData.data[1])) {
            publications = responseData.data[1];
          } else {
            publications = responseData.data;
          }
        } else {
          publications = [responseData.data];
        }
        
        // Cari publication dengan pub_id yang sesuai
        let publication = publications.find(pub => pub.pub_id === pubId);
        
        // Jika tidak ditemukan di halaman pertama, cari di semua halaman
        if (!publication && responseData.data[0] && responseData.data[0].pages > 1) {
          const pageInfo = responseData.data[0];
          for (let page = 2; page <= pageInfo.pages; page++) {
            const nextPageUrl = `${this.baseUrl}/api/list/?model=publication&domain=${this.domainId}&lang=ind&key=${this.apiKey}&id=${pubId}&page=${page}`;
            const nextResponse = await fetch(nextPageUrl);
            const nextData = await nextResponse.json();
            
            if (nextData.status === 'OK' && nextData.data && nextData.data[1]) {
              publication = nextData.data[1].find(pub => pub.pub_id === pubId);
              if (publication) {
                break;
              }
            }
          }
        }
        
        if (publication) {
          return {
            success: true,
            detail: publication
          };
        } else {
          return {
            success: false,
            error: `Publication dengan pub_id "${pubId}" tidak ditemukan`,
            detail: null
          };
        }
      } else {
        return {
          success: false,
          error: responseData.message || 'Data tidak ditemukan',
          detail: null
        };
      }
    } catch (err) {
      return {
        success: false,
        error: err.message,
        detail: null
      };
    }
  }
  
  // Menampilkan ringkasan semua data
  displaySummary() {
    console.log('✅ RINGKASAN:');
    console.log(`   Topik: ${this.topics.length} | Subject: ${Object.values(this.subjects).reduce((sum, arr) => sum + arr.length, 0)} | Data: ${Object.keys(this.data).length}`);
  }
}

export async function setFailed(data) {
  try {
    // BPS API Configuration
    const BPS_API_KEY = '2b5881e930f563142e9bccec44da6744';
    const BPS_BASE_URL = 'https://webapi.bps.go.id/v1';
    const DOMAIN_ID = '7503'; // Kabupaten Pohuwato
    
    // Buat instance BPSDataManager
    const bpsManager = new BPSDataManager(BPS_API_KEY, BPS_BASE_URL, DOMAIN_ID);
    
    // // Step 1: Ambil daftar topik/kategori
    const topicsResult = await bpsManager.fetchTopics();
    console.log('topicsResult:', topicsResult);
    
    // if (!topicsResult.success) {
    //   return '';
    // }
    
      // Step 2: Ambil subject untuk "Pertanian dan Pertambangan"
       const categoryName = "Sosial dan Kependudukan";
       const subjectsResult = await bpsManager.fetchSubjects(categoryName);
       console.log('subjectsResult:', subjectsResult);

       const topicsFromPublication = await bpsManager.fetchTopicsFromPublication(101, "Pemerintahan");
       console.log('📋 DATA TOPIK LENGKAP:', JSON.stringify(topicsFromPublication, null, 2));
      
      // // Contoh: Ambil detail publication berdasarkan pub_id
      // if (topicsFromPublication.length > 0) {
      //   const firstPubId = topicsFromPublication[0].pub_id;
      //   console.log(`\n🔍 Mengambil detail publication untuk pub_id: ${firstPubId}`);
      //   const publicationDetail = await bpsManager.fetchPublicationDetail(firstPubId);
      //   console.log('📄 DETAIL PUBLICATION:', JSON.stringify(publicationDetail, null, 2));
      // }



      const detail = await bpsManager.fetchPublicationDetail("40528c96cc38eb0762ce422d");
console.log('📄 DETAIL PUBLICATION:', JSON.stringify(detail, null, 2));
    
    // if (!subjectsResult.success || subjectsResult.subjects.length === 0) {
    //   bpsManager.displaySummary();
    //   return '';
    // }
    
    // // Step 3: Ambil data untuk beberapa subject pertama (maksimal 3)
    // const subjectsToFetch = subjectsResult.subjects.slice(0, 3);
    
    // for (const subject of subjectsToFetch) {
    //   if (subject.sub_id) {
    //     await bpsManager.fetchData(subject.sub_id, subject.label);
    //   }
    // }
    
    // Tampilkan ringkasan
    // bpsManager.displaySummary();
    
    return '';
    
  } catch (error) {
    console.error("❌ Error:", error);
    return '';
  }
}
