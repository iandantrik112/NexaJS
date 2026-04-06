/**
 * Narasi.js - Narrative Text Component
 * Rich text narrative component for NexaReactive
 */


export class Narasi {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.nexaUI = interactions.nexaUI;
  }

  /**
   * Generate content from data table
   */
  generateContentFromData(dataTabel) {
    const currentDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const currentTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    let content = `
      <div style="text-align: left; margin-bottom: 30px;">
        <h2 style="margin: 0; color: #2c3e50; font-size: 20px; font-weight: 600; letter-spacing: 1px;">LAPORAN DATA</h2>
        <p style="margin: 5px 0; color: #7f8c8d; font-size: 12px;">Tanggal: ${currentDate} | Waktu: ${currentTime}</p>
      </div>
      
      <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-left: 4px solid #2c3e50; border-radius: 4px; text-align: center;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px; font-weight: 600;">RINGKASAN EKSEKUTIF</h3>
        <p style="margin: 0; color: #34495e; line-height: 1.6;">
          Berdasarkan hasil pengambilan data pada <strong>${currentDate}</strong>, sistem telah berhasil mengambil 
          <strong style="color: #2980b9;"> ${dataTabel.totalCount || 0} record data</strong> dari database. 
          Data tersebut telah diverifikasi dan siap untuk dianalisis lebih lanjut.
        </p>
      </div>
    `;
    
    if (dataTabel.response && Array.isArray(dataTabel.response) && dataTabel.response.length > 0) {
      // Get all keys from first item to create table headers
      const firstItem = dataTabel.response[0];
      const keys = Object.keys(firstItem);
      
      content += `
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
            DETAIL DATA
          </h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: white; border: 1px solid #2c3e50;">
              <thead>
                <tr style="background: #2c3e50; color: white;">
                  <th style="padding: 12px 15px; text-align: center; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border: 1px solid #34495e; width: 60px;">
                    NO
                  </th>
      `;
      
      // Table headers
      keys.forEach(key => {
        const isTotal = key.toLowerCase().includes('total');
        const textAlign = isTotal ? 'center' : 'left';
        content += `
          <th style="padding: 12px 15px; text-align: ${textAlign}; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border: 1px solid #34495e;">
            ${key.replace(/_/g, ' ')}
          </th>
        `;
      });
      
      content += `
                </tr>
              </thead>
              <tbody>
      `;
      
      // Table rows
      dataTabel.response.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
        content += `<tr style="background: ${rowBg};">`;
        
        // Add No column
        content += `
          <td style="padding: 12px 15px; color: #2c3e50; border: 1px solid #bdc3c7; text-align: center; font-weight: 600;">
            ${index + 1}
          </td>
        `;
        
        keys.forEach(key => {
          const value = item[key] !== null && item[key] !== undefined ? item[key] : '-';
          const isTotal = key.toLowerCase().includes('total');
          const textAlign = isTotal ? 'center' : 'left';
          content += `
            <td style="padding: 12px 15px; color: #2c3e50; border: 1px solid #bdc3c7; text-align: ${textAlign}; font-weight: 600;">
              ${value}
            </td>
          `;
        });
        
        content += `</tr>`;
      });
      
      content += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      content += `
        <div style="padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 25px;">
          <p style="margin: 0; color: #856404;">
            <strong>Peringatan:</strong> Tidak ada data yang ditemukan dalam query ini.
          </p>
        </div>
      `;
    }
    
    // Add footer note
    content += `
      <div style="margin-top: 30px; padding: 15px; background: #ecf0f1; border-radius: 4px; font-size: 12px; color: #7f8c8d; text-align: center;">
        <p style="margin: 0;">
          Dokumen ini dibuat secara otomatis oleh sistem. Untuk pertanyaan lebih lanjut, silakan hubungi administrator.
        </p>
      </div>
    `;
    
    return content;
  }

  /**
   * Create complete narasi from data table (includes title and content generation)
   */
  createNarasiFromData(dataTabel, title = "LAPORAN DATA RESMI") {
    const content = this.generateContentFromData(dataTabel);
    return this.createNarasi(title, content);
  }

  /**
   * Create a narrative text element
   */
  createNarasi(
    title = "Narasi",
    content = "This is a sample narasi content..."
  ) {
    const narasiId = `narasi-${Date.now()}`;

    const narasiHTML = `
      <div class="nexa-narasi-container" id="${narasiId}" style="
        width: 100%;
        margin: 20px auto;
        padding: 0;
        border: 2px solid #2c3e50;
        border-radius: 0;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: "Montserrat", Arial, sans-serif;
        line-height: 1.6;
        max-width: 210mm;
        min-height: 297mm;
        page-break-after: always;
      ">
        <!-- Document Header - Professional Office Style -->
        <div class="nexa-narasi-header" style="
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          padding: 30px 40px;
          border-bottom: 4px solid #2980b9;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #2980b9 0%, #3498db 50%, #2980b9 100%);
          "></div>
          <div class="nexa-narasi-title" style="
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: left;
          ">${title}</div>
          <div class="nexa-narasi-meta" style="
            font-size: 12px;
            opacity: 0.95;
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
            font-weight: 300;
          ">
            <span style="display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 14px;">📋</span>
              <span>Dokumen Resmi</span>
            </span>
            <span style="opacity: 0.7;">|</span>
            <span>${new Date().toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
            <span style="opacity: 0.7;">|</span>
            <span>NexaReactive System</span>
          </div>
        </div>
        
        <!-- Document Content - Professional Layout -->
        <div class="nexa-narasi-content" style="
          padding: 40px;
          color: #2c3e50;
          font-size: 13px;
          line-height: 1.8;
          background: #ffffff;
        ">
          ${content}
          
          <!-- Document Footer - Professional Office Footer -->
          <div class="nexa-narasi-footer" style="
            margin-top: 40px;
            padding-top: 25px;
            border-top: 2px solid #2c3e50;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            background: #f8f9fa;
            padding: 20px 40px;
            margin: 40px -40px -40px -40px;
          ">
            <div style="
              font-size: 11px;
              color: #7f8c8d;
              display: flex;
              align-items: center;
              gap: 12px;
              flex-wrap: wrap;
            ">
              <span style="display: flex; align-items: center; gap: 5px;">
                <span>📄</span>
                <span>Halaman 1 dari 1</span>
              </span>
              <span style="opacity: 0.5;">•</span>
              <span>Dokumen Resmi - Tidak untuk disebarluaskan</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return narasiHTML;
  }

  
}

