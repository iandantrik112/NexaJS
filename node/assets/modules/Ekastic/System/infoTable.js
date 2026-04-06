export async function infoTable(nexaStoreInstance, data = null) {
 try {
      const tableId = data.tableId || data.key || data.id;

      if (!tableId) {
        console.error("No table ID provided for info");
        return;
      }

      // Get table data from IndexedDB
      const db = await nexaStoreInstance.nexaUI
        .Storage()
        .indexedDB.init("NexaStoreDB", 1, ["nexaStore"]);
      const tableData = await db.Storage().indexedDB.get("nexaStore", tableId);

      if (!tableData) {
        console.error("Table not found:", tableId);
        return;
      }

      // Format creation and update dates
      const createdAt = tableData.createdAt
        ? new Date(tableData.createdAt).toLocaleString()
        : "N/A";
      const updatedAt = tableData.updatedAt
        ? new Date(tableData.updatedAt).toLocaleString()
        : "Same as created";

      // Count variables
      const variableCount = tableData.selectedVariables
        ? tableData.selectedVariables.length
        : 0;

      // Get configured types
      const configuredTypes = nexaStoreInstance.getConfiguredTypesDisplay(tableData);

      // Display detailed table information
      nexaStoreInstance.nexaUI.modalHTML({
        elementById: "infoTabelModal",
        styleClass: "w-700px",
        label: `Table Information: ${tableData.className}`,
        onclick: {
          title: "Close",
          cancel: false, // Hide cancel button
          send: false, // No send action, just close
        },
        content: `
          <div class="table-info-container">
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="info-card">
                  <h5 class="info-title">📊 Basic Information</h5>
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>Class Name:</strong></td>
                      <td>${tableData.className || "N/A"}</td>
                    </tr>
                    <tr>
                      <td><strong>Table Name:</strong></td>
                      <td>${tableData.tableName || "N/A"}</td>
                    </tr>
                    <tr>
                      <td><strong>Table Key:</strong></td>
                      <td>${tableData.tableKey || "N/A"}</td>
                    </tr>
                    <tr>
                      <td><strong>Table ID:</strong></td>
                      <td><code>${tableData.id || "N/A"}</code></td>
                    </tr>
                    <tr>
                      <td><strong>Type:</strong></td>
                      <td><span class="badge badge-primary">${
                        tableData.settings?.type || tableData.type || "table"
                      }</span></td>
                    </tr>
                  </table>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="info-card">
                  <h5 class="info-title">📅 Timestamps</h5>
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>Created:</strong></td>
                      <td>${createdAt}</td>
                    </tr>
                    <tr>
                      <td><strong>Last Updated:</strong></td>
                      <td>${updatedAt}</td>
                    </tr>
                    <tr>
                      <td><strong>Variables Count:</strong></td>
                      <td><span class="badge badge-success">${variableCount} variables</span></td>
                    </tr>
                    <tr>
                      <td><strong>Configured Types:</strong></td>
                      <td><small class="text-muted">${configuredTypes}</small></td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-12">
                <div class="info-card">
                  <h5 class="info-title">🔧 Selected Variables</h5>
                  <div class="variables-info" style="max-height: 200px; overflow-y: auto; border: 1px solid #e0e0e0; padding: 15px; border-radius: 6px; background-color: #f8f9fa;">
                    ${
                      tableData.selectedVariables &&
                      tableData.selectedVariables.length > 0
                        ? tableData.selectedVariables
                            .map(
                              (variable) =>
                                `<span class="badge badge-info mr-2 mb-2">${variable}</span>`
                            )
                            .join("")
                        : '<p class="text-muted mb-0">No variables selected</p>'
                    }
                  </div>
                </div>
              </div>
            </div>

            ${
              tableData.settings?.tags && tableData.settings.tags.length > 0
                ? `
            <div class="row mt-3">
              <div class="col-12">
                <div class="info-card">
                  <h5 class="info-title">🏷️ Tags</h5>
                  <div class="tags-info">
                    ${tableData.settings.tags
                      .map(
                        (tag) =>
                          `<span class="badge badge-secondary mr-2 mb-2">${tag}</span>`
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
            `
                : ""
            }

            ${
              tableData.settings?.limit
                ? `
            <div class="row mt-3">
              <div class="col-12">
                <div class="info-card">
                  <h5 class="info-title">⚙️ Settings</h5>
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>Record Limit:</strong></td>
                      <td>${tableData.settings.limit}</td>
                    </tr>
                    <tr>
                      <td><strong>Primary Key:</strong></td>
                      <td>${
                        tableData.settings.primaryKey || tableData.tableKey
                      }</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            `
                : ""
            }
            
            <div class="row mt-3">
              <div class="col-12">
                <div class="info-card">
                  <h5 class="info-title">⚙️ Available Actions</h5>
                  <div class="actions-info">
                    <span class="badge badge-warning mr-2">✏️ Edit Table</span>
                    <span class="badge badge-info mr-2">⚙️ Table Settings</span>
                    <span class="badge badge-danger mr-2">🗑️ Delete Table</span>
                    <span class="badge badge-secondary mr-2">ℹ️ View Information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <style>
            .info-card {
              background: white;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 15px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .info-title {
              color: #333;
              margin-bottom: 15px;
              font-size: 16px;
              font-weight: 600;
            }
            .table td {
              padding: 8px 12px;
              border: none;
            }
            .table td:first-child {
              width: 40%;
              color: #666;
            }
            .badge {
              font-size: 12px;
              padding: 6px 12px;
            }
            .actions-info .badge {
              margin-bottom: 8px;
            }
          </style>
        `,
      });

      nexaStoreInstance.setModal("infoTabelModal");
    } catch (error) {
      console.error("Failed to show table info:", error);
    }
}
