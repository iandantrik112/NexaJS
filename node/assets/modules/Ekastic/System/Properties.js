export async function setProperties(metadata = null) {
  try {
    const tableData = await NXUI.ref.get(metadata.store, metadata.id);
    console.log("📊 Table Data:", tableData);

    // Format creation and update dates
    const createdAt = tableData.createdAt
      ? new Date(tableData.createdAt).toLocaleString()
      : "N/A";
    const updatedAt = tableData.updatedAt
      ? new Date(tableData.updatedAt).toLocaleString()
      : "Same as created";

    // Count variables from the new structure
    const variableCount = tableData.variables ? tableData.variables.length : 0;

    // Get form fields count
    const formFieldsCount = tableData.form
      ? Object.keys(tableData.form).length
      : 0;

    // Get submenu actions count
    const submenuCount = tableData.submenu ? tableData.submenu.length : 0;

    // Get configured types from form fields
    const configuredTypes = tableData.form
      ? Object.values(tableData.form)
          .map((field) => field.type)
          .filter((type, index, self) => self.indexOf(type) === index)
          .join(", ")
      : "No types configured";

    // Get form settings info
    const formSettings = tableData.settings || {};
    const assetsStyle = tableData.assets?.style || {};

    // Display detailed table information
    nexaStoreInstance.nexaUI.modalHTML({
      elementById: metadata.modalid,
      styleClass: "w-700px",
      label: `Table Information: ${tableData.className}`,
      onclick: {
        title: "Close",
        cancel: false, // Hide cancel button
        send: false, // No send action, just close
      },
      content: `
            <div class="table-info-container">
              <div class="nx-row mb-3">
                <div class="nx-col-12">
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
                          tableData.type || "table"
                        }</span></td>
                      </tr>
                      <tr>
                        <td><strong>Version:</strong></td>
                        <td><span class="badge badge-info">${
                          tableData.version || "1.0.0"
                        }</span></td>
                      </tr>
                    </table>
                  </div>
                </div>
             
                <div class="nx-col-12">
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
                        <td><strong>Form Fields:</strong></td>
                        <td><span class="badge badge-warning">${formFieldsCount} fields</span></td>
                      </tr>
                      <tr>
                        <td><strong>Actions Available:</strong></td>
                        <td><span class="badge badge-secondary">${submenuCount} actions</span></td>
                      </tr>
                      <tr>
                        <td><strong>Field Types:</strong></td>
                        <td><small class="text-muted">${configuredTypes}</small></td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
           
              <div class="nx-row">
                <div class="nx-col-12">
                  <div class="info-card">
                    <h5 class="info-title">🔧 Table Variables</h5>
                    <div class="variables-info" style="max-height: 200px; overflow-y: auto; border: 1px solid #e0e0e0; padding: 15px; border-radius: 6px; background-color: #f8f9fa;">
                      ${
                        tableData.variables && tableData.variables.length > 0
                          ? tableData.variables
                              .map(
                                (variable) =>
                                  `<span class="badge badge-info mr-2 mb-2">${variable}</span>`
                              )
                              .join("")
                          : '<p class="text-muted mb-0">No variables defined</p>'
                      }
                    </div>
                  </div>
                </div>
              </div>

              ${
                tableData.form && Object.keys(tableData.form).length > 0
                  ? `
              <div class="row mt-3">
                <div class="nx-col-12">
                  <div class="info-card">
                    <h5 class="info-title">📝 Form Fields Configuration</h5>
                    <div class="form-fields-info" style="max-height: 300px; overflow-y: auto;">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>Field Name</th>
                            <th>Type</th>
                            <th>Column Width</th>
                            <th>Validation</th>
                            <th>Options Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${Object.entries(tableData.form)
                            .map(
                              ([fieldName, fieldConfig]) => `
                            <tr>
                              <td><strong>${fieldName}</strong></td>
                              <td><span class="badge badge-primary">${
                                fieldConfig.type || "text"
                              }</span></td>
                              <td><small class="text-muted">${
                                fieldConfig.columnWidth || "nx-col-12"
                              }</small></td>
                              <td><span class="badge ${
                                fieldConfig.validation
                                  ? "badge-success"
                                  : "badge-secondary"
                              }">${fieldConfig.validation || "none"}</span></td>
                              <td><span class="badge badge-info">${
                                fieldConfig.options?.length || 0
                              }</span></td>
                            </tr>
                          `
                            )
                            .join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              `
                  : ""
              }

              ${
                tableData.settings?.formTags &&
                tableData.settings.formTags.trim()
                  ? `
              <div class="row mt-3">
                <div class="nx-col-12">
                  <div class="info-card">
                    <h5 class="info-title">🏷️ Form Tags</h5>
                    <div class="tags-info">
                      ${tableData.settings.formTags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0)
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
                tableData.settings && Object.keys(tableData.settings).length > 0
                  ? `
              <div class="row mt-3">
                <div class="nx-col-12">
                  <div class="info-card">
                    <h5 class="info-title">⚙️ Form Settings</h5>
                    <div class="nx-row">
                      <div class="nx-col-6">
                        <table class="table table-borderless table-sm">
                          <tr>
                            <td><strong>Form Limit:</strong></td>
                            <td>${
                              tableData.settings.formLimit || "No limit"
                            }</td>
                          </tr>
                          <tr>
                            <td><strong>Primary Key:</strong></td>
                            <td>${
                              tableData.settings.formPrimaryKey ||
                              tableData.tableKey
                            }</td>
                          </tr>
                          <tr>
                            <td><strong>Order By:</strong></td>
                            <td>${
                              tableData.settings.formOrder || "Default"
                            }</td>
                          </tr>
                          <tr>
                            <td><strong>Order Direction:</strong></td>
                            <td><span class="badge ${
                              tableData.settings.formOrderDirection === "ASC"
                                ? "badge-success"
                                : "badge-warning"
                            }">${
                      tableData.settings.formOrderDirection || "ASC"
                    }</span></td>
                          </tr>
                        </table>
                      </div>
                      <div class="nx-col-6">
                        <table class="table table-borderless table-sm">
                          <tr>
                            <td><strong>Size:</strong></td>
                            <td><span class="badge badge-info">${
                              tableData.settings.size ||
                              assetsStyle.size ||
                              "Default"
                            }</span></td>
                          </tr>
                          <tr>
                            <td><strong>Button Type:</strong></td>
                            <td><span class="badge badge-secondary">${
                              tableData.settings.buttontype ||
                              assetsStyle.button ||
                              "Default"
                            }</span></td>
                          </tr>
                          <tr>
                            <td><strong>Layout:</strong></td>
                            <td><span class="badge badge-primary">${
                              tableData.settings.layout ||
                              assetsStyle.layout ||
                              "Default"
                            }</span></td>
                          </tr>
                          <tr>
                            <td><strong>Floating Labels:</strong></td>
                            <td><span class="badge ${
                              tableData.settings.floating ||
                              assetsStyle.floating
                                ? "badge-success"
                                : "badge-secondary"
                            }">${
                      tableData.settings.floating || assetsStyle.floating
                        ? "Enabled"
                        : "Disabled"
                    }</span></td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              `
                  : ""
              }
           
              <div class="row mt-3">
                <div class="nx-col-12">
                  <div class="info-card">
                    <h5 class="info-title">⚙️ Available Actions</h5>
                    <div class="actions-info">
                      ${
                        tableData.submenu && tableData.submenu.length > 0
                          ? tableData.submenu
                              .map(
                                (action) => `
                          <span class="badge ${
                            action.action === "settings"
                              ? "badge-primary"
                              : action.action === "editTable"
                              ? "badge-warning"
                              : action.action === "deleteTable"
                              ? "badge-danger"
                              : action.action === "viewTable"
                              ? "badge-info"
                              : action.action === "infoTable"
                              ? "badge-secondary"
                              : "badge-light"
                          } mr-2 mb-2">
                            <i data-feather="${action.icon}"></i> ${
                                  action.label
                                }
                          </span>
                        `
                              )
                              .join("")
                          : `
                          <span class="badge badge-warning mr-2">✏️ Edit Table</span>
                          <span class="badge badge-info mr-2">⚙️ Table Settings</span>
                          <span class="badge badge-danger mr-2">🗑️ Delete Table</span>
                          <span class="badge badge-secondary mr-2">ℹ️ View Information</span>
                        `
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
         
            <style>
              .info-card {
             
              
                margin-bottom: 15px;
             
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

    // Open the modal
    NXUI.nexaModal.open(metadata.modalid);
  } catch (error) {
    console.error("Failed to show table info:", error);
    // Show error notification
    if (window.nexaStoreInstance?.nexaUI) {
      window.nexaStoreInstance.nexaUI.notification({
        message: "Failed to load table information",
        type: "error",
      });
    }
  }
}
