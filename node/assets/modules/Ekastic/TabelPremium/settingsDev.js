// Assign to nx - Proxy akan otomatis membuat window.approvalHistory untuk onclick handler
// Menggunakan alur sesuai nexa-ui.js dimana nx Proxy otomatis sync ke window
if (typeof window !== 'undefined') {
  const assignToNx = () => {
    if (window.nx) {
      // Assign ke nx - Proxy di nexa-ui.js akan otomatis membuat window.approvalHistory
      window.approvalHistory = approvalHistory;
    } else {
      // Wait for nx to be available (dari nexa-ui.js initialization)
      setTimeout(assignToNx, 50);
    }
  };
  assignToNx();
}
