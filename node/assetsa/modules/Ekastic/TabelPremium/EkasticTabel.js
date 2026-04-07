import {NexaTabel, StorageData} from "./NexaTabel.js";
import { handleMenuDropdown } from "./Dropdown.js";
import { Tabeltfoott } from "./Tabeltfoott.js";
import { recordView } from "./recordView.js";
import { recordApproval } from "./recordApproval.js";
import { recordHandler } from "./recordHandler.js";
import { recordExport } from "./recordExport.js";
import { appSettings } from "./settings.js";
import { theadLabel } from "./theadLabel.js";
/**
 * EkasticTabel Class - Dynamic table package generator
 * Mengelola pembuatan tabel dinamis berdasarkan konfigurasi field
 */
export class EkasticTabel {
    constructor(options = {}) {
        // ✅ Load saved items per page from localStorage (inline method)
        const loadSavedItemsPerPage = (containerSelector) => {
            try {
                const storageKey = `ekastic_items_per_page_${containerSelector || 'default'}`;
                const saved = localStorage.getItem(storageKey);
                
                
                if (saved) {
                    const itemsPerPage = parseInt(saved);
                    if (!isNaN(itemsPerPage) && itemsPerPage > 0) {
                        return itemsPerPage;
                    }
                }
            } catch (error) {
            }
            return null;
        };
        
        const savedItemsPerPage = loadSavedItemsPerPage(options.containerSelector || '#dataContainer');
        
        this.options = {
            containerSelector: options.containerSelector || '#dataContainer',
            paginationSelector: options.paginationSelector || '#itempagination',
            searchSelector: options.searchSelector || '#itemsearch',
            sortSelector: options.sortSelector || '#sortBy',
            infoSelector: options.infoSelector || '#info',
            itemsPerPage: savedItemsPerPage || options.itemsPerPage || 5,
            sortOrder: options.sortOrder || 'DESC',
            sortBy: options.sortBy || 'id',
            tableClass: options.tableClass || 'table',
            ...options
        };
        
        this.fieldNames = [];
        this.fieldHeaders = [];
        this.variabels = []; // ✅ Simpan data variabels lengkap
        this.variable = {}; // ✅ Object untuk akses seperti this.variable[fieldName]
        this.tabelInstance = null;
        this.className = null;
        this.className = null;
        this.height = null;
        this.token = null;
        this.column  = [];
        this.form  = [];
        this.add = null;
        this.dropdown = {}; // ✅ Simpan filter yang aktif
        this.activeFilters = {}; // ✅ Simpan filter yang aktif
        this.filterCache = {}; // ✅ Cache untuk unique values
        this.storage = {}; // ✅ Cache untuk unique values
        this.settings =[]; // ✅ Cache untuk unique values
        this.inlineFormInstance = null; // ✅ Instance NexaFormInline untuk inline editing
        this.listenersInitialized = false; // ✅ Flag untuk prevent duplicate event listeners per instance
        this.featuresInitialized = false; // ✅ Flag untuk prevent duplicate fitur() calls
        this.toggleListenersInitialized = false; // ✅ Flag untuk prevent duplicate toggle listeners per instance
        this._dropdownToggleHandler = null; // ✅ Store handler reference
        this._dropdownActionHandler = null; // ✅ Store handler reference
        this._keyboardHandler = null; // ✅ Store keyboard handler reference
        this._instanceId = `ekastic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // ✅ Unique instance ID
    }

    /**
     * Initialize package dengan data dari SDK
     */
    async init(key,height=null) {
        try {
            const Sdk = new NXUI.Buckets(key.id);
            const data = await Sdk.storage();
            const variabels = await Sdk.getFields("tabel") || [];
            this.storage = data;
            this.settings = data.settings;
            this.variabels = variabels;
            this.dropdown = data.dropdown;
            
            // ✅ Handle column: support subquery/subnested by merging aliasNames
            // ✅ Backward compatible: 
            //    - Jika data.column ada, gunakan langsung (prioritas tertinggi)
            //    - Jika subnested tidak ada, subnestedAliasNames akan menjadi [] (sama seperti sebelumnya)
            //    - Untuk query normal tanpa subnested, behavior sama seperti sebelumnya
                this.form = data.form;
            if (data?.column) {
                this.column = data.column;
            } else if (data.applications) {
                // ✅ Gabungkan aliasNames dari query utama dan subnested (jika ada)
                const mainAliasNames = data.applications.aliasNames || [];
                const subnestedAliasNames = data.applications.subnested?.aliasNames || [];
                this.column = [...mainAliasNames, ...subnestedAliasNames];
            } else {
                this.column = [];
            }
          
            // this.appConfig?.aliasNames
            
            this.token = key.id;
            this.className = data.className;
            this.height = height || '300px';
            this.add = NEXA?.controllers?.data?.accessAdd?.[data.className] ?? 0;

            // ✅ Buat object untuk akses seperti this.variable[fieldName]
            this.variable = {};
            variabels.forEach(v => {
                if (v.failed) {
                    this.variable[v.failed] = v;
                }
            });

            NXUI.indexData = {
               ...this.storage,
               options: this.options,
             };


           this.extractFieldInformation(variabels);
            
            // Setup application config
            this.setupAppConfig(data);
            
            // Create NexaTabel instance
            this.createTabelInstance();
            
            // ✅ Initialize inline editing
            // this.initializeInlineEditing();
            
            // ✅ Initialize dropdown functionality (will be called after DOM is ready)
            // Don't call here - wait until after HTML is rendered
            
            // ✅ Sync itemsPerPage with NexaTabel BEFORE generating HTML
            if (this.tabelInstance) {
                // Use the actual value from NexaTabel if it's different
                if (this.tabelInstance.config.itemsPerPage !== this.options.itemsPerPage) {
                    this.options.itemsPerPage = this.tabelInstance.config.itemsPerPage;
                    
                    // ✅ Also save the synced value to localStorage
                    this.saveItemsPerPage(this.options.itemsPerPage);
                }
            }
            
            // ✅ Set sebagai instance aktif untuk akses global
            window.currentEkasticTabel = this;
            
            // ✅ Store all instances for cleanup
            if (!window.ekasticInstances) {
                window.ekasticInstances = [];
            }
            window.ekasticInstances.push(this);
            
        // Generate HTML template (now with correct itemsPerPage)
            const htmlTemplate = this.generateHTML();
            
            // ✅ Set initial button state setelah HTML di-generate
            setTimeout(() => {
                this.updateClearFiltersButton();
                // ✅ Initialize dropdown functionality setelah DOM ready
                this.initializeDropdownActions();
                // Note: initializeColumnResize() akan dipanggil di callback onAfterRender
            }, 100);
            
            return htmlTemplate;
            
        } catch (error) {
            return this.generateErrorHTML(error.message);
        }
    }



 
    extractFieldInformation(variabels) {
        const tabelFields = variabels.filter(field => field.tabel === true);
        this.fieldNames = tabelFields; // ✅ Simpan seluruh object field, bukan hanya field.failed
        this.fieldHeaders = tabelFields; // ✅ Simpan seluruh object field, bukan hanya placeholder
     
    }

    /**
     * Setup application configuration
     */
    setupAppConfig(data) {
        this.appConfig = {
            ...data.applications,
            "id": data.id,
            "access": data.access
        }
        
    }

    /**
     * Create NexaTabel instance dengan konfigurasi dinamis
     */
    createTabelInstance() {
        this.tabelInstance = new NexaTabel({
            container: this.options.containerSelector,
            pagination: this.options.paginationSelector,
            sortOrder: this.options.sortOrder,
            sortBy: this.options.sortBy,
            sortClickElement: this.options.sortSelector,
            paginationinfo: this.options.infoSelector,
            searchElement: this.options.searchSelector,
            searchFields: this.fieldNames.map(field => field.failed), // ✅ Extract failed untuk searchFields
            itemsPerPage: this.options.itemsPerPage, // ✅ Use itemsPerPage instead of order
            order: this.options.itemsPerPage, // ✅ Keep for backward compatibility
            config: this.appConfig,
            render: (dataArray) => this.renderTable(dataArray),
            // ✅ Callback setelah tabel di-render (untuk re-initialize dropdown)
            onAfterRender: async () => {
            // ✅ Initialize column resize IMMEDIATELY (no delay)
            this.initializeColumnResize();
            await  theadLabel(this.storage)
            // Re-initialize dropdown jika belum terpasang (menggunakan event delegation)
            if (!this.toggleListenersInitialized) {
                this.setupDropdownToggleListeners();
            }
            if (!this.listenersInitialized) {
                this.setupDropdownEventListeners();
            }
            }
        });
    }

    /**
     * Initialize inline editing functionality
     */


   
    /**
     * Initialize dropdown actions functionality
     */
    initializeDropdownActions() {
        try {
            // Initialize dropdown actions
            
            // ✅ Setup dropdown toggle event listeners
            if (!this.toggleListenersInitialized) {
                this.setupDropdownToggleListeners();
            }
            
            // ✅ Setup dropdown action listeners (View, Edit, Delete, etc)
            if (!this.listenersInitialized) {
                this.setupDropdownEventListeners();
            }
            
        } catch (error) {
            console.error('Error inisialisasi dropdown actions:', error);
        }
    }

    /**
     * Helper function to get actual dropdown height
     */
    getDropdownHeight(dropdownContent) {
        const originalDisplay = dropdownContent.style.display;
        const originalPosition = dropdownContent.style.position;

        dropdownContent.style.display = 'block';
        dropdownContent.style.position = 'absolute';
        dropdownContent.style.visibility = 'hidden';

        const height = dropdownContent.offsetHeight;

        dropdownContent.style.display = originalDisplay;
        dropdownContent.style.position = originalPosition;
        dropdownContent.style.visibility = '';

        return height || 80; // Fallback to 80px if measurement fails
    }

    /**
     * Position dropdown content dynamically based on viewport
     */
    positionDropdown(dropdown, dropdownContent) {
        const btnRect = dropdown.getBoundingClientRect();
        const actualDropdownHeight = this.getDropdownHeight(dropdownContent);
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Calculate positioning - prefer right alignment for action menus
        let calculatedLeft = btnRect.right - 150; // Default right-aligned

        // Ensure dropdown doesn't go off-screen to the left
        if (calculatedLeft < 10) {
            calculatedLeft = btnRect.left;
        }

        // Ensure dropdown doesn't go off-screen to the right
        if (calculatedLeft + 150 > viewportWidth) {
            calculatedLeft = viewportWidth - 160;
        }

        // Check if dropdown would be clipped by viewport bottom
        const spaceBelow = viewportHeight - btnRect.bottom;
        const spaceAbove = btnRect.top;

        // Add some buffer (20px) to prevent edge cases
        if (spaceBelow < actualDropdownHeight + 20 && spaceAbove > actualDropdownHeight + 20) {
            // Position above the button only if there's more space above
            dropdownContent.style.cssText = `
                position: fixed !important;
                top: ${btnRect.top - actualDropdownHeight - 5}px !important;
                left: ${calculatedLeft}px !important;
                right: auto !important;
                z-index: 10000 !important;
            `;
        } else {
            // Position below the button (preferred)
            dropdownContent.style.cssText = `
                position: fixed !important;
                top: ${btnRect.bottom + 5}px !important;
                left: ${calculatedLeft}px !important;
                right: auto !important;
                z-index: 10000 !important;
            `;
        }
    }

    /**
     * Setup dropdown toggle listeners (click to open/close dropdown)
     */
    setupDropdownToggleListeners() {
            // Prevent duplicate initialization for THIS instance only
        if (this.toggleListenersInitialized) {
            return;
        }

        // Setting up toggle listeners

        // Use global handler that checks current active instance
        // Only add ONE global listener, check instance on each click
        if (!window._ekasticGlobalToggleHandler) {
            window._ekasticGlobalToggleHandler = (e) => {
                // Get current active instance
                const currentInstance = window.currentEkasticTabel;
                if (!currentInstance) return;
                
                // Check if click is within current instance's container
                const clickedContainer = e.target.closest(currentInstance.options.containerSelector);
                if (!clickedContainer) return;
                
                // Handling click in active instance
                const dropdownBtn = e.target.closest('.nx-dropdown-btn');
                if (dropdownBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const dropdown = dropdownBtn.closest('.nx-dropdown');
                    const dropdownContent = dropdown?.querySelector('.nx-dropdown-content');
                    
                    if (dropdown && dropdownContent) {
                        // Check if dropdown is currently active
                        const isCurrentlyActive = dropdown.classList.contains('active');

                        // Close all dropdowns first
                        document.querySelectorAll('.nx-dropdown.active').forEach((activeDropdown) => {
                            activeDropdown.classList.remove('active');
                            const activeContent = activeDropdown.querySelector('.nx-dropdown-content');
                            if (activeContent) {
                                activeContent.style.position = '';
                                activeContent.style.top = '';
                                activeContent.style.left = '';
                                activeContent.style.right = '';
                                activeContent.style.zIndex = '';
                            }
                        });

                        // If dropdown was not active, open it with smart positioning
                        if (!isCurrentlyActive) {
                            dropdown.classList.add('active');
                            currentInstance.positionDropdown(dropdown, dropdownContent);
                        }
                    }
                } else if (clickedContainer) {
                    // Close dropdown when clicking outside (but within this instance)
                    if (!e.target.closest('.nx-dropdown')) {
                        clickedContainer.querySelectorAll('.nx-dropdown').forEach(dropdown => {
                            dropdown.classList.remove('active');
                            const content = dropdown.querySelector('.nx-dropdown-content');
                            if (content) {
                                content.style.position = '';
                                content.style.top = '';
                                content.style.left = '';
                                content.style.right = '';
                                content.style.zIndex = '';
                            }
                        });
                    }
                }
            };
            document.addEventListener('click', window._ekasticGlobalToggleHandler);
        }
        
        this._dropdownToggleHandler = window._ekasticGlobalToggleHandler;

        // Add keyboard listener for Escape key (instance-specific)
        this._keyboardHandler = (e) => {
            if (e.key === 'Escape') {
                // Close dropdowns only in this instance
                const container = document.querySelector(this.options.containerSelector);
                if (container) {
                    container.querySelectorAll('.nx-dropdown.active').forEach((dropdown) => {
                        dropdown.classList.remove('active');
                        const content = dropdown.querySelector('.nx-dropdown-content');
                        if (content) {
                            content.style.position = '';
                            content.style.top = '';
                            content.style.left = '';
                            content.style.right = '';
                            content.style.zIndex = '';
                        }
                    });
                }
            }
        };
        document.addEventListener('keydown', this._keyboardHandler);

        this.toggleListenersInitialized = true;
    }

    /**
     * Render table dengan data dinamis
     */
    renderTable(dataArray) {
        // ✅ Calculate accessDataMenu once for the entire table
        const accessDataMenu = NEXA?.controllers?.data?.accessData?.[this.className] ?? 0;
        
        // ✅ Check if header groups is enabled
        const headerGroups = this.settings?.headerGroups || [];
        const useHeaderGroups = headerGroups.length > 0;
        
        // ✅ Determine field order for rendering tbody
        let fieldOrder = [];
        
        if (useHeaderGroups) {
            // Build field order based on header groups
            headerGroups.forEach(group => {
                group.columns.forEach(columnName => {
                    const field = this.fieldNames.find(f => f.name === columnName);
                    if (field) {
                        fieldOrder.push(field);
                    }
                });
            });
            
            // Add fields not in any group (except id) - id will be added separately
            this.fieldNames.forEach(field => {
                if (field.name !== 'id' && !fieldOrder.includes(field)) {
                    fieldOrder.push(field);
                }
            });
            
            // ✅ Add 'id' field at the end for Action column (if accessDataMenu !== 0)
            if (accessDataMenu !== 0) {
                const idField = this.fieldNames.find(f => f.name === 'id');
                if (idField && !fieldOrder.includes(idField)) {
                    fieldOrder.push(idField);
                }
            }
        } else {
            // Standard mode - use original order
            fieldOrder = this.fieldNames;
        }
        
        
        // ✅ If aliasNames is provided, sort field order to match alias order (standard mode)
        // ✅ Backward compatible:
        //    - Jika semua field ada di fieldNames, behavior sama seperti sebelumnya (hanya sorting)
        //    - Jika ada field yang tidak ada (dari subnested), akan dibuat field object minimal
        //    - Field yang tidak ada di aliasNames tetap ditambahkan di akhir (backward compatible)
        const aliasNames = Array.isArray(this.column) ? this.column : [];
        if (!useHeaderGroups && aliasNames.length > 0) {
            // ✅ Create a map of existing fields by name
            const fieldMap = new Map();
            fieldOrder.forEach(field => {
                if (field.name) {
                    fieldMap.set(field.name, field);
                }
            });
            
            // ✅ Build fieldOrder based on aliasNames order, including missing fields
            const newFieldOrder = [];
            aliasNames.forEach(columnName => {
                if (fieldMap.has(columnName)) {
                    // ✅ Field exists, add it (backward compatible - behavior sama)
                    newFieldOrder.push(fieldMap.get(columnName));
                } else {
                    // ✅ Field doesn't exist in fieldNames (e.g., from subnested), create minimal field object
                    // ✅ Try to find it in variabels first (might have tabel === false)
                    // ✅ Search by name, failed, fieldAlias, or name (to handle various field configurations)
                    let fieldObj = this.variabels.find(v => 
                        v.name === columnName || 
                        v.failed === columnName || 
                        v.fieldAlias === columnName ||
                        (v.name && v.name.toLowerCase() === columnName.toLowerCase()) ||
                        (v.failed && v.failed.toLowerCase() === columnName.toLowerCase())
                    );
                    
                    // ✅ If not found in variabels, try to find in form
                    if (!fieldObj && this.form && this.form[columnName]) {
                        fieldObj = this.form[columnName];
                    }
                    
                    if (!fieldObj) {
                        // ✅ Create minimal field object for missing columns (from subnested)
                        // ✅ Minimal properties only, karena form sudah memiliki properties masing-masing
                        fieldObj = {
                            name: columnName,
                            failed: columnName, // ✅ Use columnName as failed to access row[columnName]
                            placeholder: columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            type: 'text',
                            tabel: false // Mark as not from main tabel fields
                        };
                    } else {
                        // ✅ Use complete field object from variabels or form (sudah memiliki semua properties)
                        // ✅ Ensure name property exists for matching (if missing, use failed or columnName)
                        if (!fieldObj.name) {
                            fieldObj = { ...fieldObj, name: fieldObj.failed || fieldObj.fieldAlias || columnName };
                        }
                    }
                    newFieldOrder.push(fieldObj);
                }
            });
            
            // ✅ Add any remaining fields not in aliasNames (except id which is handled separately)
            fieldOrder.forEach(field => {
                if (field.name && field.name !== 'id' && !aliasNames.includes(field.name)) {
                    newFieldOrder.push(field);
                }
            });
            
            fieldOrder = newFieldOrder;
        }
        // Generate dynamic table rows
        const rows = dataArray.map(row => {
                const dynamicCells = fieldOrder.map(fieldObj => {
                const fieldName = fieldObj.name; // ✅ Ambil failed dari object
                const texttransform = fieldObj?.texttransform ?? ''; // ✅ Ambil texttransform dari object
                const textalign = fieldObj?.textalign ?? ''; // ✅ Ambil textalign dari object
                const fontWeight = fieldObj?.fontWeight ?? fieldObj?.fontweight ?? ''; // ✅ Ambil fontWeight dari object
                const fontStyle = fieldObj?.fontStyle ?? fieldObj?.fontstyle ?? ''; // ✅ Ambil fontStyle dari object
                const color = fieldObj?.color ?? ''; // ✅ Ambil color dari object
                const backgroundColor = fieldObj?.backgroundColor ?? fieldObj?.backgroundcolor ?? ''; // ✅ Ambil backgroundColor dari object
                const columnHide = fieldObj?.columnHide ?? fieldObj?.columnHide ?? false; // ✅ object column Hide th td  tabel 
                const typeHide = fieldObj?.hidden ?? fieldObj?.hidden ?? false; // ✅ object hidden untuk sembunyikan seluruh tabel
          
               if (typeHide === true || typeHide === 'true') {
                    return '';
                }
                // ✅ Jika columnHide bernilai true, jangan tampilkan kolom
                if (columnHide === true || columnHide === 'true') {
                    return '';
                }




                // ✅ Check jika field adalah ID field dan accessDataMenu tidak 0
                if (fieldName === 'id' && accessDataMenu !== 0) {
                    return `<td style="text-align: center; width: 30px; position: relative;">
                        <div class="nx-dropdown">
                            <div class="nx-dropdown-btn">
                                <span class="material-symbols-outlined">more_vert</span>
                            </div>
                            ${handleMenuDropdown(row.id, row.no,this.className,this.dropdown)}
                        </div>
                    </td>`;
                } else if (fieldName === 'id' && accessDataMenu === 0) {
                    // ✅ Skip rendering if accessDataMenu is 0
                    return '';
                } else {
                    // ✅ Field biasa
                    // ✅ Get field type for alignment
                    const fieldType = fieldObj.type || '';
                    // ✅ Gunakan textalign dari fieldObj jika ada, jika tidak gunakan default berdasarkan type
                    const defaultTextAlign = fieldType === 'currency' ? 'right' : fieldType === 'number' ? 'center' : 'left';
                    const textAlign = textalign || defaultTextAlign;
                    
                    // ✅ Fungsi helper untuk membuat style string
                    const getCellStyle = (additionalStyles = '') => {
                        let styles = [];
                        if (textAlign) styles.push(`text-align: ${textAlign}`);
                        if (texttransform && texttransform.trim() !== '') styles.push(`text-transform: ${texttransform}`);
                        if (fontWeight && fontWeight.trim() !== '') styles.push(`font-weight: ${fontWeight}`);
                        if (fontStyle && fontStyle.trim() !== '') styles.push(`font-style: ${fontStyle}`);
                        if (color && color.trim() !== '') styles.push(`color: ${color}`);
                        if (backgroundColor && backgroundColor.trim() !== '') styles.push(`background-color: ${backgroundColor}`);
                        if (additionalStyles) styles.push(additionalStyles);
                        return styles.length > 0 ? `style="${styles.join('; ')}"` : '';
                    };
                    
                    // ✅ Format value based on type
                    const formatValue = (value) => {
                        if (!value || value === '-') return '-';
                        
                        if (fieldType === 'currency') {
                            const numValue = parseFloat(value);
                            if (isNaN(numValue)) return value;
                            return 'Rp. ' + new Intl.NumberFormat('id-ID').format(numValue);
                        } else if (fieldType === 'number') {
                            const numValue = parseFloat(value);
                            if (isNaN(numValue)) return value;
                            return new Intl.NumberFormat('id-ID').format(numValue);
                        }
                        return value;
                    };
                    
                    const rawValue = row[fieldName];
                    const displayValue = formatValue(rawValue);

                    
                    // ✅ Check if modal field
                    if (fieldObj.modal) {
                        return `<td ${getCellStyle('cursor: pointer')}>
                               <a href="#" data-action="view" data-id="${row.id}" data-no="${row.no}">${displayValue}</a>
                       </td>`;
                    }

                   if (fieldObj.type =="file") {
                          setTimeout(async () => {
                           try {

                              const lodfile=NXUI.fileType(displayValue,`#${fieldName}_${row.id}`)
                           } catch (error) {
                             console.error("❌ Error initializing chart configuration:", error);
                           }
                         }, 110);
                       return `<td ${getCellStyle()}>
                         <span id="${fieldName}_${row.id}"></span>
                       </td>`;
                   }

                     if (fieldObj.avatar) {
               
                           setTimeout(async () => {
                            try {
                              const dataAvatar={
                                id:`${fieldName}_${row.id}`,
                                avaratid:Number(row?.userid) ?? null,
                                avatar:fieldObj?.avatarStatus ?? null,
                              }
                             await NXUI.uiAvatar(dataAvatar)
                            } catch (error) {
                              console.error("❌ Error initializing chart configuration:", error);
                            }
                          }, 100);
                       return `<td ${getCellStyle()}><span id="${fieldName}_${row.id}">Avatar</span></td>`;
                   }




                   if (fieldObj.approval) {
                          const cellApproval=NEXA?.controllers?.data?.approval[this.className] ?? 0;
                          const labelValue = row[fieldName] || "";
                          const setellValue = labelValue.split(":")[1] || "Pending";
               
                          if (cellApproval) {
                        const cek = labelValue.split(":")[0];
                         const checkedAttr = (cek && cek !== "false") ? "checked" : "";

                            return `
                           <td ${getCellStyle()}>

                            <div class="nx-switch-item">
                                <input type="checkbox" id="switchaproval${row.id}" onclick="checkedAproval(this,'${fieldName}','${row.id}','${this.token}')"  ${checkedAttr}/>
                                <label for="switchaproval${row.id}">
                                  <span class="nx-switch"></span>
                                </label>
                              </div>

                            </td>`;
                          } else {
                      
                            return `<td ${getCellStyle()}>${displayValue.split(':')[1] || 'Belum Diproses'}</td>`;
                          }
         
                    }



                    
         
                    return `<td ${getCellStyle()}>${displayValue}</td>`;
                }
            }).join('');
            return `
            <tr id="${row.no}">
                <td style="text-align: center; width: 60px;">${row.no}</td>
                ${dynamicCells}
            </tr>`;
        }).join('');
        
        // Generate dynamic table headers with header groups support
        let headersHTML = '';
        
        if (useHeaderGroups) {
            // Generate headers with groups (2-row structure)
            headersHTML = this.generateHeadersWithGroups(headerGroups, accessDataMenu);
        } else {
            
            // Generate standard single-row headers
            // ✅ Use fieldOrder yang sudah diperbaiki untuk konsistensi dengan body
            // ✅ Atau gunakan logika serupa untuk memastikan semua kolom dari aliasNames termasuk
            let headerFieldsOrdered = [];
            if (aliasNames.length > 0) {
                // ✅ Create a map of existing header fields by name
                const headerFieldMap = new Map();
                this.fieldHeaders.forEach(field => {
                    if (field.name) {
                        headerFieldMap.set(field.name, field);
                    }
                });
                
                // ✅ Build headerFieldsOrdered based on aliasNames order, including missing fields
                aliasNames.forEach(columnName => {
                    if (headerFieldMap.has(columnName)) {
                        // ✅ Field exists, add it
                        headerFieldsOrdered.push(headerFieldMap.get(columnName));
                    } else {
                        // ✅ Field doesn't exist in fieldHeaders (e.g., from subnested)
                        // ✅ Try to find it in variabels first
                        // ✅ Search by name, failed, fieldAlias, or name (to handle various field configurations)
                        let fieldObj = this.variabels.find(v => 
                            v.name === columnName || 
                            v.failed === columnName || 
                            v.fieldAlias === columnName ||
                            (v.name && v.name.toLowerCase() === columnName.toLowerCase()) ||
                            (v.failed && v.failed.toLowerCase() === columnName.toLowerCase())
                        );
                        
                        // ✅ If not found in variabels, try to find in form
                        if (!fieldObj && this.form && this.form[columnName]) {
                            fieldObj = this.form[columnName];
                        }
                        
                        if (!fieldObj) {
                            // ✅ Create minimal field object for missing columns
                            // ✅ Minimal properties only, karena form sudah memiliki properties masing-masing
                            fieldObj = {
                                name: columnName,
                                failed: columnName,
                                placeholder: columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                type: 'text',
                                tabel: false
                            };
                        } else {
                            // ✅ Use complete field object from variabels or form (sudah memiliki semua properties)
                            // ✅ Ensure name property exists for matching
                            if (!fieldObj.name) {
                                fieldObj = { ...fieldObj, name: fieldObj.failed || fieldObj.fieldAlias || columnName };
                            }
                        }
                        headerFieldsOrdered.push(fieldObj);
                    }
                });
                
                // ✅ Add any remaining fields not in aliasNames (except id which is handled separately)
                this.fieldHeaders.forEach(field => {
                    if (field.name && field.name !== 'id' && !aliasNames.includes(field.name)) {
                        headerFieldsOrdered.push(field);
                    }
                });
            } else {
                // ✅ No aliasNames, use fieldHeaders as is
                headerFieldsOrdered = this.fieldHeaders;
            }
            const dynamicHeaders = headerFieldsOrdered.map((headerField, index) => {
                // ✅ Check jika header untuk ID field
                const fieldName = headerField.name;
                const keyName = headerField.key;
                const keyType = headerField.type;
                
                // ✅ Check columnHide untuk header
                const columnHide = headerField?.columnHide ?? false;
                // ✅ Check hidden untuk sembunyikan seluruh kolom (selaras dengan render <td>)
                const typeHide = headerField?.hidden ?? false;
                
                // ✅ Jika kolom disembunyikan, jangan tampilkan header kolom
                if (typeHide === true || typeHide === 'true') {
                    return '';
                }
                
                // ✅ Jika columnHide bernilai true, jangan tampilkan header kolom
                if (columnHide === true || columnHide === 'true') {
                    return '';
                }
                
                // ✅ Ambil textalign dari fieldObj (hanya text align untuk header, tidak text transform)
                const textalign = headerField?.textalign ?? '';
                
                // ✅ Gunakan textalign dari fieldObj jika ada, jika tidak gunakan default berdasarkan type
                const defaultTextAlign = keyType === 'currency' ? 'right' : keyType === 'number' ? 'center' : 'left';
                const textAlign = textalign || defaultTextAlign;
                
                // ✅ Fungsi helper untuk membuat style string (hanya text-align, tanpa text-transform)
                const getHeaderStyle = (additionalStyles = '') => {
                    let styles = [`position: relative`];
                    if (textAlign) styles.push(`text-align: ${textAlign}`);
                    if (additionalStyles) styles.push(additionalStyles);
                    return styles.join('; ');
                };
    
                // ✅ Sekarang bisa akses semua konfigurasi field
                
                if (fieldName === 'id' && accessDataMenu !== 0) {
                    return `
                    <th class="resizable-column" data-column="${fieldName}" style="position: relative; min-width: 30px; width: 30px; text-align: center;">
                       Action
                        <div class="column-resizer" data-column="${fieldName}"></div>
                    </th>`;
                } else if (fieldName === 'id' && accessDataMenu === 0) {
                    // ✅ Skip header if accessDataMenu is 0
                    return '';
                } else {
                    const formattedPlaceholder = this.formatPlaceholder(headerField.placeholder);
                    if (headerField.filtering) {
                     return `
                     <th class="resizable-column" data-column="${fieldName}" style="${getHeaderStyle('min-width: 120px')}">
                        <div style="display: flex; align-items: center; gap: 5px;">
                          <span id="filtericon_${fieldName}" onclick="getfilteralt('${fieldName}')" style="cursor: pointer; flex-shrink: 0;" class="material-symbols-outlined nx-icon-sm" title="Click to filter">filter_alt</span>
                          <span id="filtertext_${fieldName}" class="editable" data-min-length="2" name="placeholder" style="flex: 1;">${formattedPlaceholder}</span>
                        </div>
                        <span id="filteralt_${fieldName}"></span>
                        <div class="column-resizer" data-column="${fieldName}"></div>
                     </th>`;
    
                    } else {
    
                    return `
                    <th class="resizable-column" data-column="${fieldName}" style="${getHeaderStyle('min-width: 100px')}">
                       <span id="${fieldName}" class="editable" data-min-length="2" name="placeholder">${formattedPlaceholder}</span>
                        <div class="column-resizer" data-column="${fieldName}"></div>
                    </th>`;
                    }
                }
            }).join('');
            
            headersHTML = dynamicHeaders;
        }
        
        // ✅ Create tfoot instance with all column information
        const tfootInstance = new Tabeltfoott();
        // ✅ Use headerFieldsOrdered yang sudah diperbaiki untuk konsistensi dengan header dan body
        let tfootFieldsOrdered = [];
        if (!useHeaderGroups && aliasNames.length > 0) {
            // ✅ Gunakan headerFieldsOrdered yang sudah dibuat sebelumnya (dari header generation)
            // ✅ Atau buat ulang dengan logika yang sama
            const tfootFieldMap = new Map();
            this.fieldHeaders.forEach(field => {
                if (field.name) {
                    tfootFieldMap.set(field.name, field);
                }
            });
            
            aliasNames.forEach(columnName => {
                if (tfootFieldMap.has(columnName)) {
                    tfootFieldsOrdered.push(tfootFieldMap.get(columnName));
                } else {
                    // ✅ Try to find it in variabels first
                    // ✅ Search by name, failed, fieldAlias, or name (to handle various field configurations)
                    let fieldObj = this.variabels.find(v => 
                        v.name === columnName || 
                        v.failed === columnName || 
                        v.fieldAlias === columnName ||
                        (v.name && v.name.toLowerCase() === columnName.toLowerCase()) ||
                        (v.failed && v.failed.toLowerCase() === columnName.toLowerCase())
                    );
                    
                    // ✅ If not found in variabels, try to find in form
                    if (!fieldObj && this.form && this.form[columnName]) {
                        fieldObj = this.form[columnName];
                    }
                    
                    if (!fieldObj) {
                        // ✅ Create minimal field object for missing columns
                        // ✅ Minimal properties only, karena form sudah memiliki properties masing-masing
                        fieldObj = {
                            name: columnName,
                            failed: columnName,
                            placeholder: columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            type: 'text',
                            tabel: false
                        };
                    } else {
                        // ✅ Use complete field object from variabels or form (sudah memiliki semua properties)
                        // ✅ Ensure name property exists for matching
                        if (!fieldObj.name) {
                            fieldObj = { ...fieldObj, name: fieldObj.failed || fieldObj.fieldAlias || columnName };
                        }
                    }
                    tfootFieldsOrdered.push(fieldObj);
                }
            });
            
            // ✅ Add any remaining fields not in aliasNames (except id)
            this.fieldHeaders.forEach(field => {
                if (field.name && field.name !== 'id' && !aliasNames.includes(field.name)) {
                    tfootFieldsOrdered.push(field);
                }
            });
        } else {
            tfootFieldsOrdered = this.fieldHeaders;
        }
        tfootFieldsOrdered.forEach(headerField => {
            const fieldName = headerField.name;
            const keyType = headerField.type;
            
            // ✅ Check columnHide untuk tfoot
            const columnHide = headerField?.columnHide ?? false;
            
            // ✅ Skip jika columnHide bernilai true
            if (columnHide === true || columnHide === 'true') {
                return; // Skip kolom tersembunyi
            }
            
            // ✅ Skip id column if accessDataMenu is 0
            if (fieldName === 'id' && accessDataMenu === 0) {
                return; // Skip this column
            }
            
            // Add column to tfoot configuration - use fieldName as key for data access
            tfootInstance.addColumn(fieldName, keyType, fieldName);
        });
        
        // Generate tfoot HTML using the current data
        const tfootHTML = tfootInstance.generateTfoot(dataArray);
        
        return `
        <div class="table-container-resizable ">
            <table class="${this.settings?.tableSize || 'table'} ${this.settings?.tableLayout || ''} resizable-table">
            <thead>
                ${useHeaderGroups 
                    ? `<tr>
                        <th class="resizable-column" data-column="no" style="position: relative; min-width: 60px; width: 60px; text-align: center;" rowspan="2">
                            No
                            <div class="column-resizer" data-column="no"></div>
                        </th>
                        ${headersHTML}
                    </tr>
                    <tr>
                        ${this.generateColumnHeaders(headerGroups, accessDataMenu)}
                    </tr>`
                    : `<tr>
                        <th class="resizable-column" data-column="no" style="position: relative; min-width: 60px; width: 60px; text-align: center;">
                            No
                            <div class="column-resizer" data-column="no"></div>
                        </th>
                        ${headersHTML}
                    </tr>`
                }
            </thead>
            <tbody>${rows}</tbody>
             ${tfootHTML}
            </table>
        </div>`;
    }





    /**
     * Generate items per page options with current value selected
     */
    generateItemsPerPageOptions() {
        const options = [5, 10, 15, 20, 25, 50, 100];
        const currentValue = this.options.itemsPerPage;
        
        // Add current value to options if it's not already there
        if (!options.includes(currentValue)) {
            options.push(currentValue);
            options.sort((a, b) => a - b);
        }
        
        return options.map(value => {
            const selected = value === currentValue ? 'selected' : '';
            return `<option value="${value}" ${selected}>${value}</option>`;
        }).join('');
    }

    /**
     * Generate HTML template untuk UI
     */
    generateHTML() {
     
        return `
        <div class="ekastic-package-container">
              <div class="nx-card">
                <div class="nx-card-header">
                 <h4 class="bold" style="display: flex; align-items: center; gap: 8px;">
                 <span  style="cursor:pointer;" class="material-symbols-outlined nx-icon-md" id="appIcon">${this.storage?.appIcon || 'table_view'} </span> 
                 

              <span id="appname" class="editable" data-min-length="2" name="label">${this.storage.label || 'Header Card'}</span>

                 </h4>
               <div class="nx-card-controls align-right">
              <div class="form-nexa-group form-nexa-icon">
                <input type="search"id="${this.options.searchSelector.replace('#', '')}"  class="form-nexa-control-sm" placeholder="Search..." />
                <i class="material-symbols-outlined">search</i>
              </div>

              <div class="form-nexa-group">
                  <select id="itemsPerPageSelect" class="form-nexa-control-sm" onchange="changeItemsPerPage(this.value)">
                      ${this.generateItemsPerPageOptions()}
                  </select>
              </div>
                
                 <button class="nx-btn-text" type="button"onclick="refreshTable(true)" title="Refresh Data dari Server">
                    <span class="material-symbols-outlined nx-icon-sm">refresh</span>
                  </button>


                  <button class="nx-btn-text" type="button" id="clearFiltersBtn" onclick="clearAllFilters()">
                    <span class="material-symbols-outlined nx-icon-sm">filter_alt</span>
                  </button>
          
                  <button class="nx-btn-text" type="button" id="${this.options.sortSelector.replace('#', '')}" title="Sort Data">
                    <span class="material-symbols-outlined nx-icon-sm">arrow_downward</span>
                  </button>
                       
                 <button class="nx-btn-text" type="button"onclick="addExport('${this.token}')" title="Refresh Data dari Server">
                    <span class="material-symbols-outlined nx-icon-sm">drive_export</span>
                  </button>

                  <button class="nx-btn-text" type="button"id="resetColumnsBtn" onclick="resetColumnWidths()" >
                    <span class="material-symbols-outlined nx-icon-sm">grid_view</span>
                  </button>

              
                
    </div>
  </div>
  <div class="nx-card-body"style="padding:0px; height:${this.height|| '300px'}">
    <div id="${this.options.containerSelector.replace('#', '')}">
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p>Loading...</p>
        </div>
    </div>
  </div>
  <div class="nx-card-footer">
    <div id="${this.options.infoSelector.replace('#', '')}" class="text-muted fs-9px" style="font-size:11px;"></div>
     <span id="${this.options.paginationSelector.replace('#', '')}"></span>
  </div>
</div>
        </div>`;
    }

    /**
     * Generate error HTML
     */
    generateErrorHTML(errorMessage) {
        return `
        <div class="alert alert-danger text-center">
            <h5>Gagal Inisialisasi</h5>
            <p>Gagal menginisialisasi EkasticTabel. Error: ${errorMessage}</p>
        </div>`;
    }

    /**
     * Get current tabel instance
     */
    getTabelInstance() {
        return this.tabelInstance;
    }

    /**
     * Update field configuration
     */
    updateFields(fieldNames, fieldHeaders) {
        this.fieldNames = fieldNames;
        this.fieldHeaders = fieldHeaders;
        
        if (this.tabelInstance) {
            // ✅ Extract failed jika fieldNames berisi object
            const searchFields = Array.isArray(fieldNames) && fieldNames[0]?.failed 
                ? fieldNames.map(field => field.failed) 
                : fieldNames;
            this.tabelInstance.config.searchFields = searchFields;
        }
        
        // ✅ Update inline editing configuration
        if (this.inlineFormInstance) {
            this.setupInlineTableConfig();
        }
    }

    /**
     * Refresh tabel data with enhanced UI feedback
     */
    async refresh() {
        if (this.tabelInstance) {
            // Clear filter cache before refresh
            this.filterCache = {};
            
            // Call enhanced refresh with UI feedback
            await this.tabelInstance.refresh(true);
            
            // Update button state after refresh
            this.updateRefreshButtonState(false);
        }
    }

    /**
     * Update refresh button state (loading/normal)
     */
    updateRefreshButtonState(isLoading) {
        const refreshBtn = document.getElementById('refreshTableBtn');
        if (!refreshBtn) return;

        if (isLoading) {
            refreshBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                Refreshing...
            `;
            refreshBtn.classList.add('disabled');
            refreshBtn.style.pointerEvents = 'none';
        } else {
            refreshBtn.innerHTML = `
                <span class="material-symbols-outlined nx-icon-sm">refresh</span>
                Refresh Table
            `;
            refreshBtn.classList.remove('disabled');
            refreshBtn.style.pointerEvents = '';
        }
    }

    /**
     * Enhanced refresh with loading state management
     */
    async refreshWithFeedback() {
        try {
            // Show loading state
            this.updateRefreshButtonState(true);
            
            // Clear all caches
            this.filterCache = {};
            
            // Refresh the table
            await this.refresh();
            
        } catch (error) {
            
            // Show error message
            if (this.tabelInstance && this.tabelInstance.showTemporaryMessage) {
                this.tabelInstance.showTemporaryMessage(
                    `Gagal refresh tabel: ${error.message}`, 
                    'danger',
                    3000,
                    'Refresh Tabel'
                );
            }
        } finally {
            // Reset button state
            this.updateRefreshButtonState(false);
        }
    }

    /**
     * Refresh UI only (without reloading data from server)
     * This re-applies visual elements like column widths, filter indicators, etc.
     */
    async refreshUI() {
        try {
            if (!this.tabelInstance) return;
            
            // ✅ Reload settings terlebih dahulu untuk mendapatkan perubahan (tableSize, dll)
            if (this.token) {
                try {
                    const Sdk = new NXUI.Buckets(this.token);
                    const updatedData = await Sdk.storage();
                    if (updatedData?.settings) {
                        this.settings = updatedData.settings;
                        this.storage = updatedData;
                    }
                } catch (error) {
                    console.warn('Error reloading settings:', error);
                }
            }
            
            // ✅ Load saved column widths
            this.loadColumnWidths();
            
            // ✅ Update filter visual indicators
            this.updateFilterIndicators();
            
            // ✅ Re-initialize column resize functionality
            this.initializeColumnResize();
            
            // ✅ Re-initialize inline editing if needed
            if (this.inlineFormInstance && this.tabelInstance?.state?.data) {
                this.updateInlineTableData(this.tabelInstance.state.data);
            }
            
            // ✅ Update data container to ensure everything is rendered correctly
            this.tabelInstance.updateDataContainer();
            
            // Show success message
            // if (this.tabelInstance.showTemporaryMessage) {
            //     this.tabelInstance.showTemporaryMessage(
            //         'Tampilan tabel diperbarui', 
            //         'success',
            //         2000,
            //         'Refresh UI'
            //     );
            // }
            
        } catch (error) {
            console.error('Error refreshing UI:', error);
            
            if (this.tabelInstance && this.tabelInstance.showTemporaryMessage) {
                this.tabelInstance.showTemporaryMessage(
                    `Gagal refresh UI: ${error.message}`, 
                    'danger',
                    3000,
                    'Refresh UI'
                );
            }
        }
    }

    /**
     * Change items per page and reload table
     */
    async changeItemsPerPage(newLimit) {
        try {
            const limit = parseInt(newLimit);
            if (isNaN(limit) || limit <= 0) {
                return;
            }

            // Update EkasticTabel configuration
            this.options.itemsPerPage = limit;
            
            // ✅ Save to localStorage for persistence
            this.saveItemsPerPage(limit);
            
            // Use NexaTabel's updateItemsPerPage method for proper handling
            if (this.tabelInstance && this.tabelInstance.updateItemsPerPage) {
                await this.tabelInstance.updateItemsPerPage(limit);
                
                // Show success message
                if (this.tabelInstance.showTemporaryMessage) {
                    this.tabelInstance.showTemporaryMessage(
                        `Item per halaman diubah menjadi ${limit}`, 
                        'success',
                        3000,
                        'Halaman Tabel'
                    );
                }
            } else {
                
                // Fallback method
                if (this.tabelInstance) {
                    this.tabelInstance.config.itemsPerPage = limit;
                    this.tabelInstance.state.currentPage = 1;
                    this.tabelInstance.savePageState(1);
                    
                    await this.tabelInstance.loadData();
                    this.tabelInstance.updateDataContainer();
                    this.tabelInstance.renderPaginationInfo();
                    this.tabelInstance.render();
                }
            }

        } catch (error) {
            
            // Show error message
            if (this.tabelInstance && this.tabelInstance.showTemporaryMessage) {
                this.tabelInstance.showTemporaryMessage(
                    `Gagal mengubah limit: ${error.message}`, 
                    'danger',
                    3000,
                    'Error Halaman Tabel'
                );
            }
        }
    }

    /**
     * Load saved items per page from localStorage
     */
    loadSavedItemsPerPage(containerSelector) {
        try {
            const storageKey = `ekastic_items_per_page_${containerSelector || 'default'}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const itemsPerPage = parseInt(saved);
                if (!isNaN(itemsPerPage) && itemsPerPage > 0) {
                    return itemsPerPage;
                }
            }
        } catch (error) {
        }
        return null;
    }

    /**
     * Save items per page to localStorage
     */
    saveItemsPerPage(itemsPerPage) {
        try {
            const storageKey = `ekastic_items_per_page_${this.options.containerSelector || 'default'}`;
            localStorage.setItem(storageKey, itemsPerPage.toString());
        } catch (error) {
        }
    }

    /**
     * Initialize items per page dropdown with current value
     */
    initializeItemsPerPageDropdown() {
        setTimeout(() => {
            const select = document.getElementById('itemsPerPageSelect');
            if (select) {
                // Verify the correct value is selected
                const currentValue = this.options.itemsPerPage.toString();
                if (select.value !== currentValue) {
                    select.value = currentValue;
                }
            }
        }, 100);
    }

    /**
     * Get unique values untuk field tertentu
     */
    async getUniqueValuesForField(fieldName) {
        // ✅ Check cache dulu
         if (this.filterCache[fieldName]) {
             return this.filterCache[fieldName];
         }
        
        try {
            // ✅ Buat config khusus untuk mengambil unique values
            const uniqueConfig = {
                ...this.appConfig,
                limit: 1000, // Ambil banyak data untuk unique values
                offset: 0,
                where: false // Reset where untuk ambil semua data
            };
            // ✅ Gunakan StorageData untuk ambil data
           const result = await StorageData(1000, 0, '', [], '', '', 'id', 'DESC', uniqueConfig);

           // ✅ Extract unique values dari response
           const uniqueValues = [...new Set(
               result.response
                   .map(item => item[fieldName])
                   .filter(value => value !== null && value !== undefined && value !== '')
           )].sort();
        
           // ✅ Cache hasil
           this.filterCache[fieldName] = uniqueValues;
        
           return uniqueValues;
        
         } catch (error) {
             console.error('Error mendapatkan unique values:', error);
             return [];
         }
    }

    /**
     * Tampilkan filter options di UI menggunakan Select2
     */
    showFilterOptions(fieldName, uniqueValues) {
        const targetSpan = document.getElementById(`filteralt_${fieldName}`);
        if (!targetSpan) {
            return;
        }

        // ✅ Buat unique ID untuk select element
        const selectId = `filter_select_${fieldName}_${Date.now()}`;
        
        // ✅ Buat dropdown filter dengan ID unik
        const currentFilter = this.activeFilters[fieldName] || '';
        
        let optionsHTML = '<option value="">All</option>';
        uniqueValues.forEach(value => {
            const selected = currentFilter === value ? 'selected' : '';
            optionsHTML += `<option value="${value}" ${selected}>${value}</option>`;
        });

        const filterHTML = `
            <select id="${selectId}" class="form-control form-control-sm" 
                    style="width: 220px; display: inline-block; margin-left: 3px;">
                ${optionsHTML}
            </select>
        `;

        targetSpan.innerHTML = filterHTML;
        
        // ✅ Sembunyikan filter icon dan text saat dropdown tampil
        const filterIcon = document.getElementById(`filtericon_${fieldName}`);
        const filterText = document.getElementById(`filtertext_${fieldName}`);
        if (filterIcon) {
            filterIcon.style.display = 'none';
        }
        if (filterText) {
            filterText.style.display = 'none';
        }
        
        // ✅ Initialize Select2 menggunakan NXUI
        setTimeout(() => {
            try {
                // ✅ Gunakan NXUI.initSelect2 dari nexa-ui.js dengan theme small
                const select2Instance = NXUI.initSelect2(`#${selectId}`, {
                    placeholder: `Filter...`,
                    allowClear: true,
                    width: '100%',
                    theme: 'default small', // ✅ Gunakan theme small
                    minimumResultsForSearch: uniqueValues.length > 5 ? 0 : Infinity // Hide search jika options sedikit
                });

                if (select2Instance) {
                    // ✅ Add small class untuk styling compact
                    const select2Container = document.querySelector(`#${selectId}`).nextElementSibling;
                    if (select2Container && select2Container.classList.contains('select2-container')) {
                        select2Container.classList.add('select2-container--small');
                    }
                    
                    // ✅ Add event listener untuk Select2
                    NXUI.onSelect2Change(`#${selectId}`, (e) => {
                        const selectedValue = e.target.value;
                        applyFilter(fieldName, selectedValue);
                    });
                    
                } else {
                    document.getElementById(selectId).addEventListener('change', (e) => {
                        applyFilter(fieldName, e.target.value);
                    });
                }
            } catch (error) {
                // ✅ Fallback ke event listener biasa
                document.getElementById(selectId).addEventListener('change', (e) => {
                    applyFilter(fieldName, e.target.value);
                });
            }
        }, 100); // Delay untuk memastikan DOM sudah ready
        
        // ✅ Update button visibility setelah dropdown ditampilkan
        this.updateClearFiltersButton();
    }

    /**
     * Sembunyikan filter dropdown
     */
    hideFilterDropdown(fieldName) {
        const targetSpan = document.getElementById(`filteralt_${fieldName}`);
        if (!targetSpan) return;

        // ✅ Destroy Select2 instance jika ada
        const select = targetSpan.querySelector('select');
        if (select && typeof $ !== 'undefined') {
            if ($(select).hasClass('select2-hidden-accessible')) {
                try {
                    $(select).select2('destroy');
                } catch (error) {
                }
            }
        }

        // ✅ Clear dropdown HTML
        targetSpan.innerHTML = '';

        // ✅ Tampilkan kembali filter icon dan text
        const filterIcon = document.getElementById(`filtericon_${fieldName}`);
        const filterText = document.getElementById(`filtertext_${fieldName}`);
        if (filterIcon) {
            filterIcon.style.display = '';
        }
        if (filterText) {
            filterText.style.display = '';
        }

        // ✅ Update button visibility
        this.updateClearFiltersButton();
    }

    /**
     * Apply filter ke tabel
     */
    async applyFilter(fieldName, filterValue) {
        
        // ✅ Update active filters
        if (filterValue) {
            this.activeFilters[fieldName] = filterValue;
        } else {
            delete this.activeFilters[fieldName];
        }
        
        // ✅ Apply filter menggunakan custom WHERE clause
        await this.applyMultipleFilters();
        
        // ✅ Update visual indicator
        this.updateFilterIndicators();
    }

    /**
     * Apply multiple filters dengan custom WHERE clause
     */
    async applyMultipleFilters() {
        const filterFields = Object.keys(this.activeFilters);
        
        if (filterFields.length === 0) {
            // ✅ Clear all filters
            await this.tabelInstance.updateFilter('', '');
            return;
        }
        
        // ✅ Build WHERE conditions untuk multiple filters
        const conditions = filterFields.map(fieldName => {
            const filterValue = this.activeFilters[fieldName];
            
            // ✅ Cari field di alias array untuk mendapatkan column name yang benar
            const aliasEntry = this.appConfig.alias.find(alias => alias.includes(`AS ${fieldName}`));
            let column = fieldName; // fallback
            
            if (aliasEntry) {
                const columnMatch = aliasEntry.match(/^(.+?)\s+AS\s+/i);
                if (columnMatch) {
                    column = columnMatch[1];
                }
            }
            
            return `${column} = '${filterValue}'`;
        });
        
        // ✅ Gabungkan conditions dengan AND
        const whereClause = conditions.join(' AND ');
        
        // ✅ Update config tabel dengan WHERE clause
        const originalConfig = { ...this.tabelInstance.config.queryConfig };
        
        // ✅ Gabungkan dengan existing WHERE jika ada
        let finalWhere = whereClause;
        if (originalConfig.where && originalConfig.where !== false) {
            finalWhere = `(${originalConfig.where}) AND (${whereClause})`;
        }
        
        // ✅ Update query config
        this.tabelInstance.config.queryConfig = {
            ...originalConfig,
            where: finalWhere
        };
        
        // ✅ Reload data dengan filter baru
        this.tabelInstance.state.currentPage = 1;
        this.tabelInstance.savePageState(1);
        await this.tabelInstance.loadData();
        
        // ✅ Update UI
        this.tabelInstance.updateDataContainer();
        this.tabelInstance.renderPaginationInfo();
        this.tabelInstance.render();
    }

    /**
     * Update visual indicators untuk active filters
     */
    updateFilterIndicators() {
        // ✅ Update semua filter spans untuk show active state
        this.fieldHeaders.forEach(headerField => {
            if (headerField.filtering) {
                const fieldName = headerField.failed;
                const targetSpan = document.getElementById(`filteralt_${fieldName}`);
                const filterIcon = document.querySelector(`span[onclick="getfilteralt('${fieldName}')"]`);
                
                if (this.activeFilters[fieldName]) {
                    // ✅ Add active class
                    if (filterIcon) {
                        filterIcon.style.color = '#007bff';
                        filterIcon.title = `Filtered by: ${this.activeFilters[fieldName]}`;
                    }
                } else {
                    // ✅ Remove active class
                    if (filterIcon) {
                        filterIcon.style.color = '';
                        filterIcon.title = 'Click to filter';
                    }
                }
            }
        });

        // ✅ Show/Hide Clear Filters button berdasarkan activeFilters
        this.updateClearFiltersButton();
    }

    /**
     * Update visibility tombol Clear Filters
     */
    updateClearFiltersButton() {
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (!clearBtn) return;

        const hasActiveFilters = Object.keys(this.activeFilters).length > 0;
        
        if (hasActiveFilters) {
            // ✅ Show button dengan smooth transition
            clearBtn.style.display = 'inline-block';
            clearBtn.style.opacity = '0';
            setTimeout(() => {
                clearBtn.style.transition = 'opacity 0.3s ease';
                clearBtn.style.opacity = '1';
            }, 10);
        } else {
            // ✅ Hide button dengan smooth transition
            clearBtn.style.transition = 'opacity 0.3s ease';
            clearBtn.style.opacity = '0';
            setTimeout(() => {
                clearBtn.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Clear all filters
     */
    async clearAllFilters() {
        this.activeFilters = {};
        
        // ✅ Reset query config ke original
        this.tabelInstance.config.queryConfig = { ...this.appConfig };
        
        // ✅ Reload data tanpa filter
        this.tabelInstance.state.currentPage = 1;
        this.tabelInstance.savePageState(1);
        await this.tabelInstance.loadData();
        
        // ✅ Update UI
        this.tabelInstance.updateDataContainer();
        this.tabelInstance.renderPaginationInfo();
        this.tabelInstance.render();
        
        // ✅ Reset semua dropdown ke "All" (termasuk Select2)
        this.fieldHeaders.forEach(headerField => {
            if (headerField.filtering) {
                const fieldName = headerField.failed;
                const targetSpan = document.getElementById(`filteralt_${fieldName}`);
                const select = targetSpan?.querySelector('select');
                if (select) {
                    // ✅ Reset untuk Select2
                    if (typeof $ !== 'undefined' && $(select).hasClass('select2-hidden-accessible')) {
                        $(select).val('').trigger('change');
                    } else {
                        // ✅ Reset untuk select biasa
                        select.value = '';
                    }
                }
            }
        });
        
        // ✅ Update indicators dan button visibility (harus setelah activeFilters di-clear)
        this.updateFilterIndicators();
    }

    /**
     * Setup dropdown event listeners for actions
     */
    setupDropdownEventListeners() {
        // Prevent duplicate initialization for THIS instance only
        if (this.listenersInitialized) {
            return;
        }

        // Setting up action listeners

        // Use global handler that checks current active instance
        // Only add ONE global listener, check instance on each click
        if (!window._ekasticGlobalActionHandler) {
            window._ekasticGlobalActionHandler = (e) => {
                // Get current active instance
                const currentInstance = window.currentEkasticTabel;
                if (!currentInstance) return;
                
                // Check if click is within current instance's container
                const clickedContainer = e.target.closest(currentInstance.options.containerSelector);
                if (!clickedContainer) return;

                // ✅ Check for dropdown link OR any link with data-action attribute
                const actionLink = e.target.closest('a[data-action]');
                if (actionLink) {
                    e.stopPropagation();
                    
                    // Extract action info from link
                    const action = actionLink.getAttribute('data-action');
                    const recordId = actionLink.getAttribute('data-id');
                    const recordNo = actionLink.getAttribute('data-no');
                    
                    // Call handler if action exists
                    if (action && recordId) {
                        e.preventDefault();
                        currentInstance.handleDropdownAction(action, recordId, recordNo);
                    }
                }
            };
            document.addEventListener('click', window._ekasticGlobalActionHandler);
        }
        
        this._dropdownActionHandler = window._ekasticGlobalActionHandler;

        this.listenersInitialized = true;
    }

    /**
     * Handle dropdown menu actions
     */
    async handleDropdownAction(action, recordId,recordNo) {
        
        switch (action) {
            case 'view':
                this.viewRecord(recordId);
                break;
            case 'edit':
                this.editRecord(recordId);
                break;
            case 'duplicate':
                this.duplicateRecord(recordId);
                break;
            case 'delete':
                await this.deleteRecord(recordId,recordNo);
                break;
            default:
                 this.setHandler(recordId,action);
             
        }
    }

    /**
     * View record details
     */
    async viewRecord(recordId) {
        // ✅ Try multiple possible data sources
        let recordData = null;
         // Try state.data if not found
         if (!recordData && this.tabelInstance?.state?.data) {
             recordData = this.tabelInstance.state.data.find(item => item.id == recordId);
         }
        await recordView(recordData,this.token);
    
    }

    /**
     * Edit record
     */
  async editRecord(recordId) {
        // ✅ Try multiple possible data sources
        let recordData = null;
         // Try state.data if not found
         if (!recordData && this.tabelInstance?.state?.data) {
             recordData = this.tabelInstance.state.data.find(item => item.id == recordId);
         }

        return recordData;
    }

  async setHandler(recordId,action) {
        // ✅ Try multiple possible data sources
        let recordData = null;
         // Try state.data if not found
         if (!recordData && this.tabelInstance?.state?.data) {
             recordData = this.tabelInstance.state.data.find(item => item.id == recordId);
         }

          return  await recordHandler(recordData,this.token,action)
  
    }





    /**
     * Duplicate record
     */
    async duplicateRecord(recordId) {
        // ✅ Get record data
        let recordData = null;
        if (this.tabelInstance?.state?.data) {
            recordData = this.tabelInstance.state.data.find(item => item.id == recordId);
        }
        
        if (!recordData) {
            console.error('Record not found for duplication');
            return;
        }
        
        // ✅ Remove id from data to create new record
        const { id, ...duplicateData } = recordData;
        
        // ✅ Insert duplicated record
        const federated = new NXUI.Federated(this.storage);
        const result = await federated.set(duplicateData);
        
        if (result) {
            // ✅ Refresh table to show new record
            await this.tabelInstance.refresh();
        }
    }

    /**
     * Delete record
     */
  async deleteRecord(recordId, recordNo) {
    // Dapatkan elemen tr berdasarkan ID
    const element = NXUI.id(recordNo).element; // Get the actual DOM element
    if (element) {
        const tr = element.closest('tr');
        if (tr) tr.remove(); // hapus elemen barisnya
    }
    const dastorger = new NXUI.Federated(this.storage);
    const result = await dastorger.del({id: recordId});
  }


    /**
     * Update inline editing table data when data changes
     */
    updateInlineTableData(newData) {
        try {
            const tableId = `ekastic_table_${this.appConfig?.id || 'default'}`;
            const config = window.nexaTableConfigs?.[tableId];
            
            if (config) {
                // ✅ Update both data and filteredData
                config.data = newData || [];
                config.filteredData = newData || [];
                
            }
        } catch (error) {
        }
    }

    /**
     * Initialize column resize functionality (setup event listeners only)
     * Note: loadColumnWidths() sudah dipanggil secara synchronous di updateDataContainer()
     */
    initializeColumnResize() {
        // ✅ Setup event listeners untuk resize (with small delay untuk ensure DOM ready)
        setTimeout(() => {
            this.setupColumnResize();
        }, 20); // Minimal delay hanya untuk setup event listeners
    }

    /**
     * Setup column resize event listeners
     */
    setupColumnResize() {
        // ✅ Find table within THIS instance's container to avoid conflicts with multiple tables
        const container = document.querySelector(this.options.containerSelector);
        if (!container) return;
        
        const table = container.querySelector('.resizable-table');
        if (!table) return;

        // ✅ Only select resizers from individual columns (not group headers)
        const resizers = table.querySelectorAll('.column-resizer');
        let isResizing = false;
        let currentResizer = null;
        let currentColumn = null;
        let startX = 0;
        let startWidth = 0;

        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isResizing = true;
                currentResizer = resizer;
                currentColumn = resizer.closest('th');
                const columnName = currentColumn.dataset.column;
                startX = e.clientX;
                startWidth = parseInt(window.getComputedStyle(currentColumn).width, 10);

                // Add visual feedback
                resizer.classList.add('resizing');
                document.body.classList.add('no-select');
            });
        });

        // Global mouse move handler
        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !currentColumn) return;

            const width = startWidth + e.clientX - startX;
            const minWidth = 60; // Minimum column width
            const maxWidth = 500; // Maximum column width

            if (width >= minWidth && width <= maxWidth) {
                currentColumn.style.width = width + 'px';
                
                // ✅ Find the correct column index
                const columnName = currentColumn.dataset.column;
                const table = currentColumn.closest('table');
                const thead = table.querySelector('thead');
                
                let columnIndex = null;
                
                // Check if multi-row thead (header groups mode)
                const rowCount = thead ? thead.querySelectorAll('tr').length : 0;
                
                if (rowCount > 1) {
                    // Header groups mode - calculate index based on all columns
                    const firstRow = thead.querySelector('tr:first-child');
                    const lastRow = thead.querySelector('tr:last-child');
                    
                    // Build complete column list from both rows
                    const allColumnHeaders = [];
                    
                    // Add rowspan columns from first row
                    Array.from(firstRow.children).forEach(cell => {
                        if (cell.hasAttribute('rowspan') && cell.dataset.column) {
                            allColumnHeaders.push(cell);
                        }
                    });
                    
                    // Add regular columns from last row
                    Array.from(lastRow.children).forEach(cell => {
                        if (cell.dataset.column) {
                            allColumnHeaders.push(cell);
                        }
                    });
                    
                    // Find the target column in complete list
                    const targetHeader = allColumnHeaders.find(th => th.dataset.column === columnName);
                    columnIndex = allColumnHeaders.indexOf(targetHeader);
                    
                } else {
                    // Standard mode - direct index
                    columnIndex = Array.from(currentColumn.parentNode.children).indexOf(currentColumn);
                }
                
                // Update all cells in this column
                if (columnIndex !== null) {
                    const rows = table.querySelectorAll('tbody tr');
                    let updatedCells = 0;
                    rows.forEach((row, rowIdx) => {
                        const cell = row.children[columnIndex];
                        if (cell) {
                            cell.style.width = width + 'px';
                            updatedCells++;
                        }
                    });
                    
                    // ✅ Note: Group header dengan colspan sudah otomatis mengikuti lebar total kolom
                    // Tidak perlu set width manual karena colspan handle otomatis
                }
            }
        });

        // Global mouse up handler
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                
                // Remove visual feedback
                if (currentResizer) {
                    currentResizer.classList.remove('resizing');
                }
                document.body.classList.remove('no-select');

                // Save column width
                if (currentColumn) {
                    this.saveColumnWidth(
                        currentResizer.dataset.column, 
                        currentColumn.style.width
                    );
                }

                currentResizer = null;
                currentColumn = null;
            }
        });
    }

    /**
     * Save column width to localStorage
     */
    saveColumnWidth(columnName, width) {
        const storageKey = `ekastic_column_widths_${this.appConfig?.id || 'default'}`;
        let columnWidths = {};
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                columnWidths = JSON.parse(stored);
            }
        } catch (error) {
        }

        columnWidths[columnName] = width;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(columnWidths));
        } catch (error) {
        }
    }

    /**
     * Load saved column widths from localStorage
     */
    loadColumnWidths() {
        const storageKey = `ekastic_column_widths_${this.appConfig?.id || 'default'}`;
        let columnWidths = {};
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                columnWidths = JSON.parse(stored);
            }
        } catch (error) {
            return;
        }

        // ✅ Scope to this instance's container to avoid conflicts
        const container = document.querySelector(this.options.containerSelector);
        if (!container) return;
        
        // Apply saved widths
        Object.entries(columnWidths).forEach(([columnName, width]) => {
            const header = container.querySelector(`th[data-column="${columnName}"]`);
            if (header) {
                header.style.width = width;
                
                // ✅ Find correct column index (works for both standard and header groups mode)
                const table = header.closest('table');
                const thead = table.querySelector('thead');
                let columnIndex = null;
                
                if (thead && thead.querySelectorAll('tr').length > 1) {
                    // Multi-row thead (header groups mode) - build complete column list
                    const firstRow = thead.querySelector('tr:first-child');
                    const lastRow = thead.querySelector('tr:last-child');
                    
                    const allColumnHeaders = [];
                    
                    // Add rowspan columns from first row
                    Array.from(firstRow.children).forEach(cell => {
                        if (cell.hasAttribute('rowspan') && cell.dataset.column) {
                            allColumnHeaders.push(cell);
                        }
                    });
                    
                    // Add regular columns from last row
                    Array.from(lastRow.children).forEach(cell => {
                        if (cell.dataset.column) {
                            allColumnHeaders.push(cell);
                        }
                    });
                    
                    // Find the target column in complete list
                    const targetHeader = allColumnHeaders.find(th => th.dataset.column === columnName);
                    if (targetHeader) {
                        columnIndex = allColumnHeaders.indexOf(targetHeader);
                    }
                } else {
                    // Standard single-row thead
                    columnIndex = Array.from(header.parentNode.children).indexOf(header);
                }
                
                // Update all cells in this column
                if (columnIndex !== null) {
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        const cell = row.children[columnIndex];
                        if (cell) {
                            cell.style.width = width;
                        }
                    });
                }
            }
        });
    }

    /**
     * Reset all column widths to default
     */
    resetColumnWidths() {
        const storageKey = `ekastic_column_widths_${this.appConfig?.id || 'default'}`;
        
        // Clear localStorage
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
        }

        // ✅ Scope to this instance's container to avoid conflicts
        const container = document.querySelector(this.options.containerSelector);
        if (!container) return;
        
        // Reset table widths
        const table = container.querySelector('.resizable-table');
        if (table) {
            const thead = table.querySelector('thead');
            const headers = table.querySelectorAll('th[data-column]');
            
            headers.forEach(header => {
                const columnName = header.dataset.column;
                let defaultWidth = '100px';
                
                // Set specific default widths
                if (columnName === 'no') {
                    defaultWidth = '60px';
                } else if (columnName === 'id') {
                    defaultWidth = '30px';
                } else {
                    defaultWidth = '120px';
                }
                
                header.style.width = defaultWidth;
                
                // ✅ Find correct column index (works for both standard and header groups mode)
                let columnIndex = null;
                
                if (thead && thead.querySelectorAll('tr').length > 1) {
                    // Multi-row thead (header groups mode) - build complete column list
                    const firstRow = thead.querySelector('tr:first-child');
                    const lastRow = thead.querySelector('tr:last-child');
                    
                    const allColumnHeaders = [];
                    
                    // Add rowspan columns from first row
                    Array.from(firstRow.children).forEach(cell => {
                        if (cell.hasAttribute('rowspan') && cell.dataset.column) {
                            allColumnHeaders.push(cell);
                        }
                    });
                    
                    // Add regular columns from last row
                    Array.from(lastRow.children).forEach(cell => {
                        if (cell.dataset.column) {
                            allColumnHeaders.push(cell);
                        }
                    });
                    
                    // Find the target column in complete list
                    const targetHeader = allColumnHeaders.find(th => th.dataset.column === columnName);
                    if (targetHeader) {
                        columnIndex = allColumnHeaders.indexOf(targetHeader);
                    }
                } else {
                    // Standard single-row thead
                    columnIndex = Array.from(header.parentNode.children).indexOf(header);
                }
                
                // Update all cells in this column
                if (columnIndex !== null) {
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        const cell = row.children[columnIndex];
                        if (cell) {
                            cell.style.width = defaultWidth;
                        }
                    });
                }
            });
        }
        
        // Show success message
        if (this.tabelInstance && this.tabelInstance.showTemporaryMessage) {
            this.tabelInstance.showTemporaryMessage('Lebar kolom berhasil direset', 'success', 3000, 'Kolom Tabel');
        }
    }

    /**
     * Destroy instance
     */
    destroy() {
        // ✅ Remove event listeners
        if (this._dropdownToggleHandler) {
            document.removeEventListener('click', this._dropdownToggleHandler);
            this._dropdownToggleHandler = null;
        }
        if (this._dropdownActionHandler) {
            document.removeEventListener('click', this._dropdownActionHandler);
            this._dropdownActionHandler = null;
        }
        if (this._keyboardHandler) {
            document.removeEventListener('keydown', this._keyboardHandler);
            this._keyboardHandler = null;
        }
        
        // ✅ Remove from instances array
        if (window.ekasticInstances && Array.isArray(window.ekasticInstances)) {
            window.ekasticInstances = window.ekasticInstances.filter(i => i !== this);
            
            // ✅ Remove global handlers if this is the last instance
            if (window.ekasticInstances.length === 0) {
                if (window._ekasticGlobalToggleHandler) {
                    document.removeEventListener('click', window._ekasticGlobalToggleHandler);
                    window._ekasticGlobalToggleHandler = null;
                }
                if (window._ekasticGlobalActionHandler) {
                    document.removeEventListener('click', window._ekasticGlobalActionHandler);
                    window._ekasticGlobalActionHandler = null;
                }
                if (window._ekasticGlobalKeyboardHandler) {
                    document.removeEventListener('keydown', window._ekasticGlobalKeyboardHandler);
                    window._ekasticGlobalKeyboardHandler = null;
                }
            }
        }
        
        // ✅ Destroy Select2 instances sebelum cleanup
        this.destroySelect2Instances();
        
        if (this.tabelInstance) {
            this.tabelInstance.destroy();
        }
        this.tabelInstance = null;
        this.appConfig = null;
        this.fieldNames = [];
        this.fieldHeaders = [];
        this.variabels = [];
        this.variable = {};
        this.activeFilters = {};
        this.filterCache = {};
        this.listenersInitialized = false; // ✅ Reset listeners flag
        this.featuresInitialized = false; // ✅ Reset features flag
        this.toggleListenersInitialized = false; // ✅ Reset toggle listeners flag
        
        // ✅ Clear refresh button state
        this.updateRefreshButtonState(false);
        
        // ✅ Cleanup inline editing
        if (this.inlineFormInstance) {
            this.inlineFormInstance.cleanup();
            this.inlineFormInstance = null;
        }
        
        // ✅ Clear inline editing table config
        const tableId = `ekastic_table_${this.appConfig?.id || 'default'}`;
        if (window.nexaTableConfigs && window.nexaTableConfigs[tableId]) {
            delete window.nexaTableConfigs[tableId];
        }
        
        // ✅ Clear global reference
        if (window.currentEkasticTabel === this) {
            window.currentEkasticTabel = null;
        }
    }

    /**
     * Destroy semua Select2 instances yang dibuat oleh filter
     */
    destroySelect2Instances() {
        this.fieldHeaders.forEach(headerField => {
            if (headerField.filtering) {
                const fieldName = headerField.failed;
                const targetSpan = document.getElementById(`filteralt_${fieldName}`);
                if (targetSpan) {
                    const select = targetSpan.querySelector('select');
                    if (select && typeof $ !== 'undefined') {
                        // ✅ Destroy Select2 jika ada
                        if ($(select).hasClass('select2-hidden-accessible')) {
                            try {
                                $(select).select2('destroy');
                            } catch (error) {
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Generate header row with groups (first row with colspan)
     */
    generateHeadersWithGroups(headerGroups, accessDataMenu) {
        let groupHeadersHTML = '';
        
        headerGroups.forEach(group => {
            // ✅ Filter kolom tersembunyi saat menghitung colspan
            const visibleColumns = group.columns.filter(columnName => {
                const headerField = this.fieldHeaders.find(f => f.name === columnName);
                const columnHide = headerField?.columnHide ?? false;
                return !(columnHide === true || columnHide === 'true');
            });
            const colspan = visibleColumns.length;
            
            // ✅ Hanya tampilkan group header jika ada kolom yang visible
            if (colspan > 0) {
                groupHeadersHTML += `
                    <th class="group-header" style="position: relative; text-align: center; background-color: #f5f5f5; font-weight: 600;" colspan="${colspan}">
                        ${group.groupName || 'Group'}
                    </th>`;
            }
        });
        
        // ✅ Add action column if needed
        if (accessDataMenu !== 0) {
            groupHeadersHTML += `
                <th class="resizable-column" data-column="id" style="position: relative; min-width: 30px; width: 30px; text-align: center;" rowspan="2">
                    Action
                    <div class="column-resizer" data-column="id"></div>
                </th>`;
        }
        
        return groupHeadersHTML;
    }

    /**
     * Generate individual column headers (second row)
     */
    generateColumnHeaders(headerGroups, accessDataMenu) {
        let columnHeadersHTML = '';
        
        // ✅ Find which fields are not in any group
        const usedColumns = headerGroups.flatMap(g => g.columns);
        
        const unusedFields = this.fieldHeaders.filter(f => 
            !usedColumns.includes(f.name) && f.name !== 'id'
        );
        
        // ✅ Generate headers for each group's columns
        headerGroups.forEach(group => {
            group.columns.forEach(columnName => {
                const headerField = this.fieldHeaders.find(f => f.name === columnName);
                
                if (headerField) {
                    columnHeadersHTML += this.generateSingleColumnHeader(headerField);
                }
            });
        });
        
        // ✅ Add unused fields (not in any group and not 'id')
        unusedFields.forEach(headerField => {
            columnHeadersHTML += this.generateSingleColumnHeader(headerField);
        });
        
        return columnHeadersHTML;
    }

    /**
     * Format placeholder text: replace underscore with space and capitalize first letter
     */
    formatPlaceholder(text) {
        if (!text) return text;
        // Replace underscore with space
        const withSpaces = text.replace(/_/g, ' ');
        // Capitalize first letter
        return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
    }

    /**
     * Generate single column header HTML
     */
    generateSingleColumnHeader(headerField) {
        const fieldName = headerField.name;
        const keyType = headerField.type;
        
        // ✅ Check columnHide untuk header
        const columnHide = headerField?.columnHide ?? false;
        
        // ✅ Jika columnHide bernilai true, jangan tampilkan header kolom
        if (columnHide === true || columnHide === 'true') {
            return '';
        }
        
        // ✅ Ambil textalign dari fieldObj (hanya text align untuk header, tidak text transform)
        const textalign = headerField?.textalign ?? '';
        
        // ✅ Gunakan textalign dari fieldObj jika ada, jika tidak gunakan default berdasarkan type
        const defaultTextAlign = keyType === 'currency' ? 'right' : keyType === 'number' ? 'center' : 'left';
        const textAlign = textalign || defaultTextAlign;
        
        // ✅ Fungsi helper untuk membuat style string (hanya text-align, tanpa text-transform)
        const getHeaderStyle = (additionalStyles = '') => {
            let styles = [`position: relative`];
            if (textAlign) styles.push(`text-align: ${textAlign}`);
            if (additionalStyles) styles.push(additionalStyles);
            return styles.join('; ');
        };
        
        const formattedPlaceholder = this.formatPlaceholder(headerField.placeholder);
        
        if (headerField.filtering) {
            return `
            <th class="resizable-column" data-column="${fieldName}" style="${getHeaderStyle('min-width: 120px')}">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span id="filtericon_${fieldName}" onclick="getfilteralt('${fieldName}')" style="cursor: pointer; flex-shrink: 0;" class="material-symbols-outlined nx-icon-sm" title="Click to filter">filter_alt</span>
                  <span id="filtertext_${fieldName}" class="editable" data-min-length="2" name="placeholder" style="flex: 1;">${formattedPlaceholder}</span>
                </div>
                <span id="filteralt_${fieldName}"></span>
                <div class="column-resizer" data-column="${fieldName}"></div>
            </th>`;
        } else {
            return `
            <th class="resizable-column" data-column="${fieldName}" style="${getHeaderStyle('min-width: 100px')}">
                ${formattedPlaceholder}
                <div class="column-resizer" data-column="${fieldName}"></div>
            </th>`;
        }
    }

}


/**
 * Global function untuk filter functionality
 * Made globally accessible for onclick handlers
 */
window.getfilteralt = async function(fieldName) {
    // Cari instance EkasticTabel yang aktif
    const packageInstance = window.currentEkasticTabel;
    if (!packageInstance) {
        return;
    }
    
    try {
        // Ambil unique values untuk field ini dari data yang ada
        const uniqueValues = await packageInstance.getUniqueValuesForField(fieldName);
        
        // Tampilkan filter UI
        packageInstance.showFilterOptions(fieldName, uniqueValues);
        
    } catch (error) {
    }
};

/**
 * Global function untuk apply filter
 * Made globally accessible for onchange handlers
 */
window.applyFilter = async function(fieldName, filterValue) {
    const packageInstance = window.currentEkasticTabel;
    if (packageInstance) {
        await packageInstance.applyFilter(fieldName, filterValue);
    }
};

/**
 * Global function untuk clear all filters
 */
window.clearAllFilters = async function() {
    const packageInstance = window.currentEkasticTabel;
    if (packageInstance) {
        await packageInstance.clearAllFilters();
    }
};

/**
 * Global function untuk refresh table
 * Made globally accessible for onclick handlers
 */
window.refreshTable = async function() {
    const packageInstance = window.currentEkasticTabel;
    if (packageInstance) {
        await packageInstance.refreshWithFeedback();
    }
};
/**
 * Global function untuk refresh UI tabel
 * Refresh tampilan visual tanpa reload data dari server
 */
window.refreshUITable = async function() {
    const packageInstance = window.currentEkasticTabel;
    if (packageInstance) {
        await packageInstance.refreshUI();
    }

};

/**
 * Global function untuk reset column widths
 * Made globally accessible for onclick handlers
 */
window.resetColumnWidths = function() {
    const packageInstance = window.currentEkasticTabel;
    if (packageInstance) {
        packageInstance.resetColumnWidths();
    }
};

/**
 * Global function untuk change items per page
 * Made globally accessible for onchange handlers
 */
window.changeItemsPerPage = async function(newLimit) {
    const packageInstance = window.currentEkasticTabel;
    if (packageInstance) {
        await packageInstance.changeItemsPerPage(newLimit);
    }
};
window.addRecordInsert = async function(token,label) {
  return await recordInsert(token,'label')
}
 
window.checkedAproval = async function (key,failed,id,cellID) {
  return await recordApproval(key,failed,id,cellID);
};

window.settingsTabel = async function (token) {
//   return await appSettings(token);
};


 window.styleClassModalUpdate = async function (modalid ,upmodalForm) {
  const dataform = await NXUI.ref.get("nexaStore", modalid);
  const classModal = "classModal" + modalid;
  NXUI.nexaModal.close(upmodalForm);
  NXUI.modalHTML({
    elementById: classModal,
    styleClass: "w-400px",
    minimize: true,
    label: `Style Modal`,
    getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
    getValidationBy: ["name"], // ✅ Standard validation approach
    setDataBy: modalid, // ✅ Standard validation approach
    onclick: {
      title: "Submit",
      cancel: "Cancel",
      send: "saveClassModalUpdate", // ✅ Use namespaced function name
    },

    content: `
        <div class="nx-row">
          <div class="nx-col-8">
            <div class="form-nexa-group">
              <label>Lebar</label>
              <input type="number" class="form-nexa-control"name="width"value="${
                dataform?.modal?.width || "500"
              }" />
            </div>
          </div>
          <div class="nx-col-4">
            <div class="form-nexa-group">
              <label>Type</label>
              <input type="text" class="form-nexa-control"value="px" />
            </div>
          </div>
        </div>
      `,
  });
  NXUI.nexaModal.open(classModal);
};
window.saveClassModalUpdate = async function (modalid, data, tabel) {
  // const dataform = await NXUI.ref.get("nexaStore", tabel);
  const makeDir = {
    modal: {
      swidth: "w-" + data.width + "px",
      width: data.width,
    },
  };
  await NXUI.ref.mergeData("nexaStore", tabel, makeDir);
  NXUI.nexaModal.close(modalid);
};



window.addExport = async function (token) {
  await recordExport(token) 
};


