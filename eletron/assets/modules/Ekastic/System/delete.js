export async function setDeleteTable(metadata = null) {
  try {
    const data = await NXUI.ref.get(metadata.store, metadata.id);
    // Format creation date for display
    const createdAt = data.createdAt
      ? new Date(data.createdAt).toLocaleString()
      : "N/A";

    // // Count variables
    const variableCount = data.variables ? data.variables.length : 0;
    NXUI.modalHTML({
      elementById: metadata.modalid,
      styleClass: "w-500px",
      label: `🗑️ Delete Table: ${data.label}`,
      setDataBy: data,
      getDaBy: ["id"], //
      getValidationBy: ["id"],
      onclick: {
        title: "Delete Permanently",
        cancel: "Cancel",
        send: "confirmDelete",
      },
      content: `
            <div class="delete-confirmation-container">     
              <div class="table-details mb-4">
                <h5 class="text-danger mb-3">Storage Information</h5>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Class Name:</strong></td>
                    <td>${data.className || "N/A"}</td>
                  </tr>
                  <tr>
                    <td><strong>Table Name:</strong></td>
                    <td>${data.tableName || "N/A"}</td>
                  </tr>
                  <tr>
                    <td><strong>Table Key:</strong></td>
                    <td>${data.tableKey || "N/A"}</td>
                  </tr>
                  <tr>
                    <td><strong>Created:</strong></td>
                    <td>${createdAt}</td>
                  </tr>
                  <tr>
                    <td><strong>Variables:</strong></td>
                    <td><span class="badge badge-info">${variableCount} variables</span></td>
                  </tr>
                </table>
              </div>
      
              <div class="confirmation-input mb-3 form-nexa-group">
                <label for="tabeldelete" class="form-label">
                  <strong>Type "DELETE" to confirm:</strong>
                </label>
                <input type="text" class="form-nexa-control"  id="tabeldelete"  name="tabeldelete" 
                       placeholder="Type DELETE here...">
                <small id="deletWarning" class="form-text text-muted"></small>
              </div>
           
              <div class="selected-variables-preview" style="max-height: 150px; overflow-y: auto; border: 1px solid #e0e0e0; padding: 10px; border-radius: 4px; background-color: #fff3cd;">
                <strong>This helps prevent accidental deletions</strong><br>
              </div>
            </div>
         
            <style>
              .delete-confirmation-container .table td {
                padding: 8px 12px;
                border: none;
              }
              .delete-confirmation-container .table td:first-child {
                width: 35%;
                color: #666;
                font-weight: 500;
              }
              .deletion-impact ul li {
                color: #dc3545;
                margin-bottom: 5px;
              }
              .selected-variables-preview {
                border-left: 4px solid #ffc107;
              }
              .variable-badge {
                color: #656d76 !important;
                margin:4px;
                padding:2px;
                font-size: 0.85em;
                font-weight: 500;
                border-radius: 6px;
                display: inline-block;

              }
              #tabeldelete.valid {
                border-color: #28a745;
                background-color: #d4edda;
              }
              #tabeldelete.invalid {
                border-color: #dc3545;
                background-color: #f8d7da;
              }
            </style>
          `,
    });

    NXUI.nexaModal.open(metadata.modalid);

    // Setup initial state - disable submit button until correct input
  } catch (error) {
    // Failed to show delete confirmation
  }
}

nx.confirmDelete = async function (modalId, data, tabel) {
  try {
    if (data.tabeldelete == "DELETE") {
      // Delete single record
      const result = await NXUI.ref.delete(tabel.store, tabel.id);
      if (window.nexaStoreInstance) {
        // Reload stored data
        await window.nexaStoreInstance.loadStoredData();

        // Trigger UI refresh
        if (window.nexaStoreInstance.onDataLoaded) {
          window.nexaStoreInstance.onDataLoaded();
        }
      }
      NXUI.nexaModal.close(modalId);
    } else {
      NXUI.id("deletWarning").innerHTML =
        'Ketik "DELETE" untuk konfirmasi yang benar';
    }
  } catch (error) {
    // Delete operation failed
  }
};
