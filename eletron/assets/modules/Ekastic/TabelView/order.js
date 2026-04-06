/**
 * ORDER BY Builder
 * Membuat interface untuk mengatur ORDER BY clause pada view
 */

// Import renderTabelView dari index.js
import { renderTabelView } from './index.js';

nx.settingsOrderBy = async function (tabel) {
    const metadata = await NXUI.ref.get("tabelStore", tabel) || {};
    const modalID = "orderBy_" + tabel;
    
    // Ambil failedAS untuk options
    const failedAS = metadata?.failedAS || [];
    const optionsArray = [];
    
    // Buat array options dari failedAS
    failedAS.forEach((row) => {
        // Extract alias dari field (bagian setelah AS)
        const parts = row.split(' AS ');
        if (parts.length >= 2) {
            const alias = parts[1].trim();
            const fullField = parts[0].trim();
            optionsArray.push({ 
                value: alias, // Gunakan alias untuk ORDER BY
                label: `${alias} (${fullField})`,
                fullField: fullField // Simpan full field untuk referensi
            });
        }
    });
    
    // Ambil orderBy yang sudah ada
    const existingOrderBy = metadata?.orderBy || [];
    
    let templateField = '';
    
    // Jika sudah ada orderBy, tampilkan yang sudah ada
    if (existingOrderBy.length > 0) {
        existingOrderBy.forEach((orderItem, index) => {
            let fieldValue = (orderItem.field || orderItem.fieldAlias || '').trim();
            const direction = orderItem.direction || 'ASC';
            let selectedAlias = '';
            
            // fieldValue adalah fullField (misalnya "demo.row"), perlu cari alias yang sesuai
            if (fieldValue.includes('.')) {
                // Ini adalah fullField, cari alias yang sesuai dari optionsArray
                const foundOption = optionsArray.find(opt => opt.fullField === fieldValue);
                if (foundOption) {
                    selectedAlias = foundOption.value; // Gunakan alias untuk select
                } else {
                    // Jika tidak ditemukan, coba cari dengan case-insensitive
                    const foundOption2 = optionsArray.find(opt => opt.fullField.toLowerCase() === fieldValue.toLowerCase());
                    if (foundOption2) {
                        selectedAlias = foundOption2.value;
                    }
                }
            } else {
                // Jika bukan fullField (backward compatibility), anggap ini adalah alias
                selectedAlias = fieldValue;
                // Validasi bahwa alias ada di options
                const foundOption = optionsArray.find(opt => opt.value === fieldValue);
                if (!foundOption) {
                    // Jika tidak ditemukan, coba cari dengan case-insensitive
                    const foundOption2 = optionsArray.find(opt => opt.value.toLowerCase() === fieldValue.toLowerCase());
                    if (foundOption2) {
                        selectedAlias = foundOption2.value;
                    }
                }
            }
            
            const fieldOptions = optionsArray.map(opt => {
                const selected = opt.value === selectedAlias ? 'selected' : '';
                return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
            }).join('');
            
            templateField += `
                <div class="nx-row mb-2" id="orderRow_${index}">
                    <div class="nx-col-9">
                        <div class="form-nexa-group">
                            <label>Field ${index + 1}</label>
                            <select id="orderField_${index}" name="orderField_${index}" class="form-nexa-control select2-field">
                                <option value="">Pilih field...</option>
                                ${fieldOptions}
                            </select>
                        </div>
                    </div>
                    <div class="nx-col-2">
                        <div class="form-nexa-group">
                            <label>Direction</label>
                            <select id="orderDirection_${index}" name="orderDirection_${index}" class="form-nexa-control">
                                <option value="ASC" ${direction === 'ASC' ? 'selected' : ''}>ASC</option>
                                <option value="DESC" ${direction === 'DESC' ? 'selected' : ''}>DESC</option>
                            </select>
                        </div>
                    </div>
                    <div class="nx-col-1">
                        <div class="form-nexa-group">
                            <label style="display: block; height: 20px; margin-bottom: 8px;">&nbsp;</label>
                            <a href="javascript:void(0);" onclick="removeOrderByRow('${index}', '${tabel}');" class="btn btn-sm btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                                <span class="material-symbols-outlined nx-icon-sm">delete</span>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        // Jika belum ada, tampilkan satu row kosong
        const fieldOptions = optionsArray.map(opt => {
            return `<option value="${opt.value}">${opt.label}</option>`;
        }).join('');
        
        templateField += `
            <div class="nx-row mb-2" id="orderRow_0">
                <div class="nx-col-9">
                    <div class="form-nexa-group">
                        <label>Field 1</label>
                        <select id="orderField_0" name="orderField_0" class="form-nexa-control select2-field">
                            <option value="">Pilih field...</option>
                            ${fieldOptions}
                        </select>
                    </div>
                </div>
                <div class="nx-col-2">
                    <div class="form-nexa-group">
                        <label>Direction</label>
                        <select id="orderDirection_0" name="orderDirection_0" class="form-nexa-control">
                            <option value="ASC">ASC</option>
                            <option value="DESC">DESC</option>
                        </select>
                    </div>
                </div>
                <div class="nx-col-1">
                    <div class="form-nexa-group">
                        <label style="display: block; height: 20px; margin-bottom: 8px;">&nbsp;</label>
                        <a href="javascript:void(0);" onclick="removeOrderByRow('0', '${tabel}');" class="btn btn-sm btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                            <span class="material-symbols-outlined nx-icon-sm">delete</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    NXUI.modalHTML({
        elementById: modalID,
        styleClass: "w-600px",
        minimize: true,
        label: `ORDER BY Builder - ${tabel}`,
        getFormBy: ["name"],
        getValidationBy: ["name"],
        setDataBy: metadata,
        onclick: {
            title: "Save ORDER BY",
            cancel: "Cancel",
            send: "saveOrderBy",
        },
        content: `
            <div class="nx-row">
                <div class="nx-col-12 mb-2">
                    <p class="text-muted">Atur urutan sorting untuk view. Anda dapat menambahkan multiple fields untuk sorting bertingkat.</p>
                </div>
            </div>
            <div id="orderByContainer">
                ${templateField}
            </div>
        `,
              footer:` <a href="javascript:void(0);" onclick="addOrderByRow('${tabel}');" class="btn btn-secondary">
                        <span class="material-symbols-outlined nx-icon-sm">add</span> Tambah Field
                    </a>`
    });

    
    NXUI.nexaModal.open(modalID);
    
    // Inisialisasi Select2 setelah modal dibuka
    setTimeout(() => {
        const selectFields = document.querySelectorAll(`#${modalID} .select2-field`);
        selectFields.forEach(field => {
            NXUI.initSelect2(`#${field.id}`, {
                placeholder: "Pilih field...",
                allowClear: true,
                width: "100%"
            });
        });
    }, 300);
}

// Tambah row baru untuk ORDER BY
nx.addOrderByRow = function (tabel) {
    const modalID = "orderBy_" + tabel;
    const container = document.getElementById('orderByContainer');
    if (!container) return;
    
    // Hitung jumlah row yang sudah ada
    const existingRows = container.querySelectorAll('.nx-row[id^="orderRow_"]');
    const newIndex = existingRows.length;
    
    // Ambil options dari select pertama yang ada
    const firstSelect = container.querySelector('select.select2-field');
    if (!firstSelect) return;
    
    let optionsHTML = '<option value="">Pilih field...</option>';
    Array.from(firstSelect.options).forEach(opt => {
        if (opt.value) {
            optionsHTML += `<option value="${opt.value}">${opt.text}</option>`;
        }
    });
    
    // Buat row baru
    const newRow = document.createElement('div');
    newRow.className = 'nx-row mb-2';
    newRow.id = `orderRow_${newIndex}`;
    newRow.innerHTML = `
        <div class="nx-col-9">
            <div class="form-nexa-group">
                <label>Field ${newIndex + 1}</label>
                <select id="orderField_${newIndex}" name="orderField_${newIndex}" class="form-nexa-control select2-field">
                    ${optionsHTML}
                </select>
            </div>
        </div>
        <div class="nx-col-2">
            <div class="form-nexa-group">
                <label>Direction</label>
                <select id="orderDirection_${newIndex}" name="orderDirection_${newIndex}" class="form-nexa-control">
                    <option value="ASC">ASC</option>
                    <option value="DESC">DESC</option>
                </select>
            </div>
        </div>
        <div class="nx-col-1">
            <div class="form-nexa-group">
                <label style="display: block; height: 20px; margin-bottom: 8px;">&nbsp;</label>
                <a href="javascript:void(0);" onclick="removeOrderByRow('${newIndex}', '${tabel}');" class="btn btn-sm btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined nx-icon-sm">delete</span>
                </a>
            </div>
        </div>
    `;
    
    container.appendChild(newRow);
    
    // Inisialisasi Select2 untuk select baru
    setTimeout(() => {
        NXUI.initSelect2(`#orderField_${newIndex}`, {
            placeholder: "Pilih field...",
            allowClear: true,
            width: "100%"
        });
    }, 100);
}

// Hapus row ORDER BY
nx.removeOrderByRow = function (index, tabel) {
    const row = document.getElementById(`orderRow_${index}`);
    if (row) {
        // Destroy Select2 jika ada
        const select = row.querySelector('.select2-field');
        if (select && $(select).hasClass('select2-hidden-accessible')) {
            $(select).select2('destroy');
        }
        row.remove();
    }
}

// Save ORDER BY
nx.saveOrderBy = async function (modalID, data, storage) {
    try {
        const tabel = storage.id;
        
        // Kumpulkan semua orderBy dari form
        const orderBy = [];
        let index = 0;
        
        // Ambil metadata untuk mapping alias ke fullField
        const metadata = await NXUI.ref.get("tabelStore", tabel) || {};
        const failedAS = metadata?.failedAS || [];
        
        // Buat mapping dari alias ke fullField
        const aliasToFullFieldMap = {};
        failedAS.forEach((row) => {
            const parts = row.split(' AS ');
            if (parts.length >= 2) {
                const alias = parts[1].trim();
                const fullField = parts[0].trim(); // Contoh: "demo.row"
                aliasToFullFieldMap[alias] = fullField;
            }
        });
        
        while (data[`orderField_${index}`] !== undefined) {
            const fieldAlias = data[`orderField_${index}`];
            const direction = data[`orderDirection_${index}`] || 'ASC';
            
            if (fieldAlias && fieldAlias.trim() !== '') {
                // Cari fullField dari mapping (misalnya "demo.row")
                const fullField = aliasToFullFieldMap[fieldAlias.trim()] || fieldAlias.trim();
                
                orderBy.push({
                    field: fullField, // Simpan fullField dengan prefix tabel (misalnya "demo.row")
                    fieldAlias: fieldAlias.trim(), // Simpan juga alias untuk referensi
                    direction: direction.toUpperCase()
                });
            }
            
            index++;
        }
        
        // Update metadata (metadata sudah dideklarasikan di atas)
        const updatedMetadata = {
            ...metadata,
            id: tabel,
            orderBy: orderBy,
            updatedAt: new Date().toISOString()
        };
        
        await NXUI.ref.mergeData("tabelStore", tabel, updatedMetadata, {
            deepMerge: true,
            createIfNotExists: true
        });
        
        NXUI.nexaModal.close(modalID);
        await renderTabelView();
        
    } catch (error) {
        console.error('❌ Error saving ORDER BY:', error);
        throw error;
    }
}

