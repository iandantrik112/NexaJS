
const contactsData = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "08123456789" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "08987654321" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "08555555555" },
];

// Export function untuk route 'eventhandling' → modul templates/eventhandling.js
export async function eventhandling(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Contact Data | App",
    description: "Data kontak dengan NexaEvent handling.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    
    // Initialize NexaEvent dari global NXUI (sudah loaded di Nexa.js)
    const eventSystem = NXUI.NexaEvent();

    // Render contact list HTML
    container.innerHTML = `
      <div style="padding: 2rem; font-family: Arial, sans-serif;">
        <h1>📋 Contact Management System</h1>
        <p style="color: #666;">Demonstrasi penggunaan NexaEvent</p>

        <!-- Add New Contact Button -->
        <div style="margin: 2rem 0;">
          <button id="addContactClick" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
            ➕ Add New Contact
          </button>
          <button id="loadDataClick" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-left: 10px;">
            🔄 Reload Data
          </button>
          <button id="clearHistoryClick" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-left: 10px;">
            🗑️ Clear History
          </button>
        </div>

        <!-- Contacts Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 2rem;">
          <thead style="background: #f8f9fa; border-bottom: 2px solid #ddd;">
            <tr>
              <th style="padding: 12px; text-align: left;">ID</th>
              <th style="padding: 12px; text-align: left;">Name</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Phone</th>
              <th style="padding: 12px; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="contactsTable">
            ${renderContactRows()}
          </tbody>
        </table>

        <!-- Event Log -->
        <div style="margin-top: 3rem; padding: 1.5rem; background: #f0f0f0; border-radius: 4px;">
          <h3>📝 Event Log (Handler History)</h3>
          <div id="eventLog" style="max-height: 300px; overflow-y: auto; background: white; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 12px;">
            <p style="color: #999;">No events yet...</p>
          </div>
        </div>
      </div>
    `;

    // ==================== HANDLER FUNCTIONS ====================

    // Add Contact Handler
    const addContactClick = (data) => {
      const message = '✅ Add Contact button clicked!';
      console.log(message, data);
      logEvent('addContactClick', message);
      alert('Add new contact modal akan terbuka');
    };

    // Load Data Handler
    const loadDataClick = (data) => {
      const message = '✅ Load Data - Fetching contacts...';
      console.log(message, data);
      logEvent('loadDataClick', message);
      alert('Data kontak berhasil di-reload');
    };

    // Edit Contact Handler
    const editClick = (data) => {
      const contactId = data.id || data.attributes.key?.value;
      const message = `✏️ Edit contact #${contactId}`;
      console.log(message, data);
      logEvent('editClick', message);
      alert(`Edit form untuk contact #${contactId} akan terbuka`);
    };

    // Delete Contact Handler
    const deleteClick = (data) => {
      const contactId = data.id || data.attributes.key?.value;
      const message = `🗑️ Delete contact #${contactId}`;
      console.log(message, data);
      logEvent('deleteClick', message);
      const confirmed = confirm(`Yakin hapus contact #${contactId}?`);
      if (confirmed) {
        logEvent('deleteConfirmed', `Contact #${contactId} deleted`);
      }
    };

    // View Contact Handler
    const viewClick = (data) => {
      const contactId = data.id || data.attributes.key?.value;
      const contact = contactsData.find(c => c.id === parseInt(contactId));
      const message = `👁️ View contact #${contactId} - ${contact?.name}`;
      console.log(message, data);
      logEvent('viewClick', message);
      showContactDetail(contact);
    };

    // Clear History Handler
    const clearHistoryClick = (data) => {
      const message = '🧹 Clear all event history';
      console.log(message, data);
      localStorage.removeItem('eventLog');
      document.getElementById('eventLog').innerHTML = '<p style="color: #999;">No events yet...</p>';
      logEvent('clearHistoryClick', 'Event history cleared');
    };

    // ==================== REGISTER HANDLERS ====================
    eventSystem.register({
      addContactClick,
      loadDataClick,
      editClick,
      deleteClick,
      viewClick,
      clearHistoryClick,
    });

    // Aktifkan event delegation
    eventSystem.Handler();

    // ==================== UTILITY FUNCTIONS ====================

    function renderContactRows() {
      return contactsData.map(contact => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">${contact.id}</td>
          <td style="padding: 12px;">${contact.name}</td>
          <td style="padding: 12px;">${contact.email}</td>
          <td style="padding: 12px;">${contact.phone}</td>
          <td style="padding: 12px; text-align: center;">
            <button id="viewClick" key="${contact.id}" style="padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">View</button>
            <button id="editClick" key="${contact.id}" style="padding: 6px 12px; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">Edit</button>
            <button id="deleteClick" key="${contact.id}" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    function logEvent(handlerName, message) {
      const timestamp = new Date().toLocaleTimeString('id-ID');
      const eventLog = document.getElementById('eventLog');
      
      // Jika masih "No events yet", clear dulu
      if (eventLog.innerHTML.includes('No events yet')) {
        eventLog.innerHTML = '';
      }

      const logEntry = document.createElement('div');
      logEntry.style.borderBottom = '1px solid #ddd';
      logEntry.style.paddingBottom = '8px';
      logEntry.style.marginBottom = '8px';
      logEntry.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
      eventLog.appendChild(logEntry);
      eventLog.scrollTop = eventLog.scrollHeight;

      // Simpan ke localStorage untuk audit trail
      const allLogs = JSON.parse(localStorage.getItem('eventLog') || '[]');
      allLogs.push({
        handler: handlerName,
        message: message,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('eventLog', JSON.stringify(allLogs));
    }

    function showContactDetail(contact) {
      if (!contact) return;
      alert(`
📋 Contact Detail
━━━━━━━━━━━━━━━━━━
ID: ${contact.id}
Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone}
      `);
    }

    console.log("📍 Navigating to:", routeName);
    console.log("✅ NexaEvent handlers registered:", eventSystem.getStatus());
  });
}
