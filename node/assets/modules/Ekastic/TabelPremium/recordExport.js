export async function recordExport(token) {
    const Sdk = new NXUI.Buckets(token);
  const dataform = await Sdk.storage();
 let dataExport= NXUI.AppFederated;
 let pageInfo=  NXUI.pageInfo;


// Extract data array to count records (inline function to avoid hoisting issue)
function extractDataArrayInline(dataExport) {
  if (!dataExport) {
    return null;
  }
  if (Array.isArray(dataExport)) {
    return dataExport;
  }
  if (typeof dataExport === 'object' && dataExport.response && Array.isArray(dataExport.response)) {
    return dataExport.response;
  }
  if (typeof dataExport === 'object' && dataExport.data && Array.isArray(dataExport.data)) {
    return dataExport.data;
  }
  return null;
}

/**
 * Format label: replace underscore with space and capitalize
 */
function formatLabel(label) {
  if (!label) return '';
  // Replace underscore with space
  let formatted = label.replace(/_/g, ' ');
  // Capitalize first letter of each word
  formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
  return formatted;
}

const checkedItems = await Sdk.getFields("tabel") || [];
const fieldMapping = checkedItems.filter(item => item.name !== 'id') // Filter out field 'id'
  .map(item => ({
      field: item.name,
      label: formatLabel(item.placeholder || item.name),
  }));
const dataArray = extractDataArrayInline(dataExport);
const recordCount = dataArray ? dataArray.length : 0;
const currentPage = pageInfo?.page || 1;
const totalRecords = dataExport?.totalCount || 0;
const totalPages = pageInfo?.total || 0;

const content =`

  <div class="nx-row">
    <div class="nx-col-3">
      <div class="export" data-export-type="csv" style="text-align: center; padding: 15px; cursor: pointer;">
        <span class="material-symbols-outlined" style="font-size:30px; color: #4CAF50; display: block;">docs</span>
        <div style="margin-top: 10px; font-weight: 500; color: #333;">CSV</div>
      </div>
    </div>
 
    <div class="nx-col-3">
      <div class="export" data-export-type="xlsx" style="text-align: center; padding: 15px; cursor: pointer;">
        <span class="material-symbols-outlined" style="font-size:30px; color: #2196F3; display: block;">docs</span>
        <div style="margin-top: 10px; font-weight: 500; color: #333;">XLSX</div>
      </div>
    </div>

    <div class="nx-col-3">
      <div class="export" data-export-type="pdf" style="text-align: center; padding: 15px; cursor: pointer;">
        <span class="material-symbols-outlined" style="font-size:30px; color: #F44336; display: block;">docs</span>
        <div style="margin-top: 10px; font-weight: 500; color: #333;">PDF</div>
      </div>
    </div>

    <div class="nx-col-3">
      <div class="export" data-export-type="json" style="text-align: center; padding: 15px; cursor: pointer;">
        <span class="material-symbols-outlined" style="font-size:30px; color: #FF9800; display: block;">data_object</span>
        <div style="margin-top: 10px; font-weight: 500; color: #333;">JSON</div>
      </div>
    </div>
  </div>
  <div class="nx-col-12 p-10px">
<div class="nx-alert nx-alert-info">
  <div style="display: flex; align-items: start; gap: 12px;">
    <span class="material-symbols-outlined" style="font-size: 20px; color: #2196F3; flex-shrink: 0;">info</span>
    <div style="flex: 1;">
      <div style="font-weight: 600; margin-bottom: 8px; color: #1976d2;">Informasi Export Data</div>
      <div style="font-size: 13px; line-height: 1.6; color: #424242;">
        <div style="margin-bottom: 0px;"><strong>Tabel:</strong> ${dataform.label || 'Data Export'}</div>
        <div style="margin-bottom: 0px;"><strong>Total Data:</strong> ${totalRecords.toLocaleString('id-ID')} record${totalRecords !== 1 ? 's' : ''}</div>
        <div style="margin-bottom: 0px;"><strong>Total Halaman:</strong> ${totalPages.toLocaleString('id-ID')} Halaman Export </div>
        <div style="margin-bottom: 0px;"><strong>Data yang Diexport:</strong> ${recordCount.toLocaleString('id-ID')} record${recordCount !== 1 ? 's' : ''} (Halaman ${currentPage})</div>
      </div>
    </div>
  </div>
</div>
</div>


`
 const modalID='recordExport'+token;
  NXUI.modalHTML({
    elementById: modalID,
    styleClass: "w-400px",
    label: `Export Data`,
    onclick:false,
    content: content
  })
  NXUI.nexaModal.open(modalID);
  NXUI.id("body_" + modalID).setStyle("padding", "0px");
  
  // Attach event listeners after modal is opened
  setTimeout(() => {
    attachExportListeners(modalID, dataExport, dataform.label, fieldMapping);
  }, 100);
}

/**
 * Extract data array from various data structures
 */
function extractDataArray(dataExport) {
  if (!dataExport) {
    return null;
  }
  
  // If it's already an array, return it
  if (Array.isArray(dataExport)) {
    return dataExport;
  }
  
  // If it's an object with 'response' property containing array
  if (typeof dataExport === 'object' && dataExport.response && Array.isArray(dataExport.response)) {
    return dataExport.response;
  }
  
  // If it's an object with 'data' property containing array
  if (typeof dataExport === 'object' && dataExport.data && Array.isArray(dataExport.data)) {
    return dataExport.data;
  }
  
  return null;
}

/**
 * Sanitize filename - remove invalid characters
 */
function sanitizeFileName(fileName) {
  if (!fileName) {
    return 'export';
  }
  // Replace invalid characters for filename
  return fileName.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_').trim();
}

/**
 * Attach click event listeners to export buttons
 */
function attachExportListeners(modalID, dataExport, fileName, fieldMapping) {
  const exportButtons = document.querySelectorAll(`#body_${modalID} .export`);
  
  exportButtons.forEach(button => {
    button.addEventListener('click', function() {
      const exportType = this.getAttribute('data-export-type');
      
      // Extract data array from various structures
      const dataArray = extractDataArray(dataExport);
      
      if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
        const Notif = new NXUI.Notifikasi({ autoHideDelay: 2000 });
        Notif.show({
          type: 'warning',
          title: 'Export Data',
          subtitle: 'Tidak ada data untuk diexport',
          actions: true,
        });
        return;
      }
      
      switch(exportType) {
        case 'csv':
          exportToCSV(dataArray, fileName, fieldMapping);
          break;
        case 'xlsx':
          exportToXLSX(dataArray, fileName, fieldMapping);
          break;
        case 'pdf':
          exportToPDF(dataArray, fileName, fieldMapping);
          break;
        case 'json':
          exportToJSON(dataArray, fileName, fieldMapping);
          break;
      }
    });
  });
}

/**
 * Export data to CSV
 */
function exportToCSV(data, fileName = 'export', fieldMapping = []) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data tidak valid');
    }
    
    // Use fieldMapping if available, otherwise fallback to object keys
    let headers, fieldNames;
    if (fieldMapping && fieldMapping.length > 0) {
      headers = fieldMapping.map(f => f.label);
      fieldNames = fieldMapping.map(f => f.field);
    } else {
      // Fallback: use object keys and exclude 'id'
      fieldNames = Object.keys(data[0]).filter(header => header !== 'id');
      headers = fieldNames;
    }
    
    // Create CSV content with labels as headers
    let csvContent = headers.map(header => `"${header}"`).join(',') + '\n';
    
    data.forEach(row => {
      const values = fieldNames.map(fieldName => {
        const value = row[fieldName] !== undefined ? row[fieldName] : '';
        // Escape quotes and wrap in quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Sanitize filename and add extension
    const sanitizedFileName = sanitizeFileName(fileName);
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${sanitizedFileName}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 2000 });
    Notif.show({
      type: 'success',
      title: 'Export CSV',
      subtitle: 'Export CSV berhasil',
      actions: true,
    });
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 3000 });
    Notif.show({
      type: 'error',
      title: 'Export CSV',
      subtitle: 'Gagal export ke CSV: ' + error.message,
      actions: true,
    });
  }
}

/**
 * Export data to XLSX (Excel format)
 */
function exportToXLSX(data, fileName = 'export', fieldMapping = []) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data tidak valid');
    }
    
    // Use fieldMapping if available, otherwise fallback to object keys
    let headers, fieldNames;
    if (fieldMapping && fieldMapping.length > 0) {
      headers = fieldMapping.map(f => f.label);
      fieldNames = fieldMapping.map(f => f.field);
    } else {
      // Fallback: use object keys and exclude 'id'
      fieldNames = Object.keys(data[0]).filter(header => header !== 'id');
      headers = fieldNames;
    }
    
    // Create HTML table content for Excel with labels as headers
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #4CAF50; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${fieldNames.map(fieldName => `<td>${row[fieldName] !== undefined ? row[fieldName] : ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Sanitize filename and add extension
    const sanitizedFileName = sanitizeFileName(fileName);
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Download file as XLSX (using HTML format with Excel MIME type)
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${sanitizedFileName}_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 2000 });
    Notif.show({
      type: 'success',
      title: 'Export XLSX',
      subtitle: 'Export XLSX berhasil',
      actions: true,
    });
  } catch (error) {
    console.error('Error exporting to XLSX:', error);
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 3000 });
    Notif.show({
      type: 'error',
      title: 'Export XLSX',
      subtitle: 'Gagal export ke XLSX: ' + error.message,
      actions: true,
    });
  }
}

/**
 * Export data to PDF
 */
function exportToPDF(data, fileName = 'export', fieldMapping = []) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data tidak valid');
    }
    
    // Use fieldMapping if available, otherwise fallback to object keys
    let headers, fieldNames;
    if (fieldMapping && fieldMapping.length > 0) {
      headers = fieldMapping.map(f => f.label);
      fieldNames = fieldMapping.map(f => f.field);
    } else {
      // Fallback: use object keys and exclude 'id'
      fieldNames = Object.keys(data[0]).filter(header => header !== 'id');
      headers = fieldNames;
    }
    
    // Sanitize filename for title
    const sanitizedFileName = sanitizeFileName(fileName);
    
    // Create printable HTML content with labels as headers
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${sanitizedFileName}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; margin-bottom: 10px; }
    .export-info { margin-bottom: 15px; color: #666; font-size: 12px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 11px; }
    th { background-color: #f0f0f0; font-weight: bold; }
    .no-print { margin-top: 20px; padding: 10px; }
    button { padding: 8px 16px; margin-right: 10px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>${sanitizedFileName}</h1>
  <div class="export-info">
    <p>Tanggal Export: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
    <p>Total Records: ${data.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        ${headers.map(header => `<th>${header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${fieldNames.map(fieldName => `<td>${row[fieldName] !== undefined ? row[fieldName] : ''}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="no-print">
    <button onclick="window.print()">Print / Save as PDF</button>
    <button onclick="window.close()">Close</button>
  </div>
</body>
</html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog after content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 2000 });
    Notif.show({
      type: 'success',
      title: 'Export PDF',
      subtitle: 'Export PDF berhasil',
      actions: true,
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 3000 });
    Notif.show({
      type: 'error',
      title: 'Export PDF',
      subtitle: 'Gagal export ke PDF: ' + error.message,
      actions: true,
    });
  }
}

/**
 * Export data to JSON
 */
function exportToJSON(data, fileName = 'export', fieldMapping = []) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data tidak valid');
    }
    
    // Transform data using fieldMapping to use labels as keys
    let jsonData;
    if (fieldMapping && fieldMapping.length > 0) {
      // Create a map for faster lookup: field -> label
      const fieldToLabel = {};
      fieldMapping.forEach(f => {
        fieldToLabel[f.field] = f.label;
      });
      
      // Transform each row: use labels as keys instead of field names
      jsonData = data.map(row => {
        const transformedRow = {};
        fieldMapping.forEach(f => {
          transformedRow[f.label] = row[f.field] !== undefined ? row[f.field] : null;
        });
        return transformedRow;
      });
    } else {
      // Fallback: use original data but exclude 'id'
      jsonData = data.map(row => {
        const { id, ...rest } = row;
        return rest;
      });
    }
    
    // Convert to JSON string with pretty formatting
    const jsonContent = JSON.stringify(jsonData, null, 2);
    
    // Sanitize filename and add extension
    const sanitizedFileName = sanitizeFileName(fileName);
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Download file
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${sanitizedFileName}_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 2000 });
    Notif.show({
      type: 'success',
      title: 'Export JSON',
      subtitle: 'Export JSON berhasil',
      actions: true,
    });
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    const Notif = new NXUI.Notifikasi({ autoHideDelay: 3000 });
    Notif.show({
      type: 'error',
      title: 'Export JSON',
      subtitle: 'Gagal export ke JSON: ' + error.message,
      actions: true,
    });
  }
}