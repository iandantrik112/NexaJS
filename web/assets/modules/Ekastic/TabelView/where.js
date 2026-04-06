/**
 * WHERE Clause Builder
 * Membuat interface untuk mengatur WHERE clause pada view
 */

// Import renderTabelView dari index.js
import { renderTabelView } from './index.js';

nx.settingsWhere = async function (tabel) {
    const metadata = await NXUI.ref.get("tabelStore", tabel) || {};
    const modalID = "where_" + tabel;
    
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
                value: alias, // Gunakan alias untuk WHERE
                label: `${alias} (${fullField})`,
                fullField: fullField // Simpan full field untuk referensi
            });
        }
    });
    
    // Ambil where yang sudah ada
    const existingWhere = metadata?.where || [];
    
    let templateField = '';
    
    // Operator options
    const operators = [
        { value: '=', label: '=' },
        { value: '!=', label: '!=' },
        { value: '<>', label: '<>' },
        { value: '>', label: '>' },
        { value: '>=', label: '>=' },
        { value: '<', label: '<' },
        { value: '<=', label: '<=' },
        { value: 'LIKE', label: 'LIKE' },
        { value: 'NOT LIKE', label: 'NOT LIKE' },
        { value: 'IN', label: 'IN' },
        { value: 'NOT IN', label: 'NOT IN' },
        { value: 'BETWEEN', label: 'BETWEEN' },
        { value: 'IS NULL', label: 'IS NULL' },
        { value: 'IS NOT NULL', label: 'IS NOT NULL' }
    ];
    
    // Logical operators
    const logicalOperators = [
        { value: 'AND', label: 'AND' },
        { value: 'OR', label: 'OR' }
    ];
    
    // Jika sudah ada where, tampilkan yang sudah ada
    if (existingWhere.length > 0) {
        existingWhere.forEach((whereItem, index) => {
            // Ambil field - seharusnya sudah alias (dari save sebelumnya)
            // Tapi untuk backward compatibility, jika ada fullField, cari alias-nya
            let fieldValue = (whereItem.field || whereItem.fieldAlias || '').trim();
            let fieldAlias = fieldValue;
            
            // Jika fieldValue adalah fullField (ada titik), cari alias yang sesuai
            if (fieldValue.includes('.')) {
                // fieldValue adalah fullField seperti "demo.row", cari alias
                const foundOption = optionsArray.find(opt => opt.fullField === fieldValue);
                fieldAlias = foundOption ? foundOption.value : fieldValue;
            } else {
                // fieldValue sudah alias, pastikan trim dan match dengan options
                fieldAlias = fieldValue;
                // Validasi bahwa alias ada di options
                const foundOption = optionsArray.find(opt => opt.value === fieldAlias);
                if (!foundOption) {
                    // Jika tidak ditemukan, coba cari dengan case-insensitive atau partial match
                    const foundOption2 = optionsArray.find(opt => opt.value.toLowerCase() === fieldAlias.toLowerCase());
                    fieldAlias = foundOption2 ? foundOption2.value : fieldAlias;
                }
            }
            
            const operator = whereItem.operator || '=';
            const value = whereItem.value || '';
            const logicalOp = whereItem.logical || (index > 0 ? 'AND' : '');
            
            const fieldOptions = optionsArray.map(opt => {
                const selected = opt.value === fieldAlias ? 'selected' : '';
                return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
            }).join('');
            
            const operatorOptions = operators.map(op => {
                const selected = op.value === operator ? 'selected' : '';
                return `<option value="${op.value}" ${selected}>${op.label}</option>`;
            }).join('');
            
            const logicalOptions = logicalOperators.map(logOp => {
                const selected = logOp.value === logicalOp ? 'selected' : '';
                return `<option value="${logOp.value}" ${selected}>${logOp.label}</option>`;
            }).join('');
            
            // Tentukan apakah perlu input value
            const needsValue = !['IS NULL', 'IS NOT NULL'].includes(operator);
            const needsSecondValue = operator === 'BETWEEN';
            
            templateField += `
                <div class="nx-row mb-2" id="whereRow_${index}">
                    ${index > 0 ? `
                    <div class="nx-col-2">
                        <div class="form-nexa-group">
                            <label>Logic</label>
                            <select id="whereLogical_${index}" name="whereLogical_${index}" class="form-nexa-control">
                                ${logicalOptions}
                            </select>
                        </div>
                    </div>
                    ` : ''}
                    <div class="nx-col-${index > 0 ? '3' : '4'}">
                        <div class="form-nexa-group">
                            <label>Field ${index + 1}</label>
                            <select id="whereField_${index}" name="whereField_${index}" class="form-nexa-control select2-field" onchange="toggleWhereValue(${index})">
                                <option value="">Pilih field...</option>
                                ${fieldOptions}
                            </select>
                        </div>
                    </div>
                    <div class="nx-col-2">
                        <div class="form-nexa-group">
                            <label>Operator</label>
                            <select id="whereOperator_${index}" name="whereOperator_${index}" class="form-nexa-control" onchange="toggleWhereValue(${index})">
                                ${operatorOptions}
                            </select>
                        </div>
                    </div>
                    <div class="nx-col-${needsSecondValue ? '2' : (index > 0 ? '4' : '5')}" id="whereValueContainer_${index}">
                        ${needsValue ? `
                        <div class="form-nexa-group">
                            <label>Value</label>
                            ${['IN', 'NOT IN'].includes(operator) ? `
                            <textarea id="whereValue_${index}" name="whereValue_${index}" class="form-nexa-control" rows="3" placeholder="Contoh: 1,2,3 atau 'a','b','c' (satu per baris atau dipisahkan koma)" data-operator="${operator}">${value}</textarea>
                            ` : `
                            <input type="text" id="whereValue_${index}" name="whereValue_${index}" class="form-nexa-control" value="${value}" placeholder="${['LIKE', 'NOT LIKE'].includes(operator) ? 'Contoh: %test% atau test%' : 'Enter value...'}" data-operator="${operator}">
                            `}
                        </div>
                        ` : '<div class="form-nexa-group"><label>&nbsp;</label><div class="form-nexa-control" style="padding-top: 8px;">No value needed</div></div>'}
                    </div>
                    ${needsSecondValue ? `
                    <div class="nx-col-2" id="whereValue2Container_${index}">
                        <div class="form-nexa-group">
                            <label>Value 2</label>
                            <input type="text" id="whereValue2_${index}" name="whereValue2_${index}" class="form-nexa-control" value="${whereItem.value2 || ''}" placeholder="Enter value 2...">
                        </div>
                    </div>
                    ` : ''}
                    <div class="nx-col-1">
                        <div class="form-nexa-group">
                            <label style="display: block; height: 20px; margin-bottom: 8px;">&nbsp;</label>
                            <a href="javascript:void(0);" onclick="removeWhereRow('${index}', '${tabel}');" class="btn btn-sm btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center;">
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
        
        const operatorOptions = operators.map(op => {
            return `<option value="${op.value}">${op.label}</option>`;
        }).join('');
        
        templateField += `
            <div class="nx-row mb-2" id="whereRow_0">
                <div class="nx-col-4">
                    <div class="form-nexa-group">
                        <label>Field 1</label>
                        <select id="whereField_0" name="whereField_0" class="form-nexa-control select2-field" onchange="toggleWhereValue(0)">
                            <option value="">Pilih field...</option>
                            ${fieldOptions}
                        </select>
                    </div>
                </div>
                <div class="nx-col-2">
                    <div class="form-nexa-group">
                        <label>Operator</label>
                        <select id="whereOperator_0" name="whereOperator_0" class="form-nexa-control" onchange="toggleWhereValue(0)">
                            ${operatorOptions}
                        </select>
                    </div>
                </div>
                <div class="nx-col-4" id="whereValueContainer_0">
                    <div class="form-nexa-group">
                        <label>Value</label>
                        <input type="text" id="whereValue_0" name="whereValue_0" class="form-nexa-control" placeholder="Enter value..." data-operator="=" onchange="toggleWhereValue(0)">
                    </div>
                </div>
                <div class="nx-col-1">
                    <div class="form-nexa-group">
                        <label style="display: block; height: 20px; margin-bottom: 8px;">&nbsp;</label>
                        <a href="javascript:void(0);" onclick="removeWhereRow('0', '${tabel}');" class="btn btn-sm btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                            <span class="material-symbols-outlined nx-icon-sm">delete</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    NXUI.modalHTML({
        elementById: modalID,
        styleClass: "w-700px",
        minimize: true,
        label: `WHERE Clause Builder - ${tabel}`,
        getFormBy: ["name"],
        getValidationBy: ["name"],
        setDataBy: metadata,
        onclick: {
            title: "Save WHERE",
            cancel: "Cancel",
            send: "saveWhere",
        },
        content: `
            <div class="nx-row">
                <div class="nx-col-12 mb-2">
                    <p class="text-muted">Atur kondisi WHERE untuk view. Anda dapat menambahkan multiple conditions dengan AND/OR.</p>
                    <p class="text-muted"><small><strong>Tips:</strong> IS NULL dan IS NOT NULL tidak memerlukan value. BETWEEN memerlukan 2 value. IN dan NOT IN memerlukan multiple values dipisahkan koma (contoh: 1,2,3 atau 'a','b','c'). LIKE dan NOT LIKE mendukung wildcard % (contoh: %test% atau test%).</small></p>
                </div>
            </div>
            <div id="whereContainer">
                ${templateField}
            </div>
        `,
        footer:` <a href="javascript:void(0);" onclick="addWhereRow('${tabel}');" class="btn btn-secondary">
                        <span class="material-symbols-outlined nx-icon-sm">add</span> Tambah Condition
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

// Toggle visibility value input berdasarkan operator
nx.toggleWhereValue = function (index) {
    const operator = document.getElementById(`whereOperator_${index}`)?.value || '';
    const valueContainer = document.getElementById(`whereValueContainer_${index}`);
    const value2Container = document.getElementById(`whereValue2Container_${index}`);
    
    if (!valueContainer) return;
    
    const needsValue = !['IS NULL', 'IS NOT NULL'].includes(operator);
    const needsSecondValue = operator === 'BETWEEN';
    
    // Tentukan apakah row ini punya Logic column (index > 0)
    const hasLogic = index > 0;
    
    if (needsValue) {
        valueContainer.style.display = 'block';
        // Jika BETWEEN: 2, jika tidak: 3 (dengan Logic) atau 4 (tanpa Logic)
        valueContainer.className = `nx-col-${needsSecondValue ? '2' : (hasLogic ? '4' : '5')}`;
        
        // Pastikan input/textarea value ada
        const existingInput = document.getElementById(`whereValue_${index}`);
        const isTextarea = ['IN', 'NOT IN'].includes(operator);
        
        // Jika perlu textarea tapi sekarang input, atau sebaliknya, ganti elemennya
        if (existingInput && ((isTextarea && existingInput.tagName !== 'TEXTAREA') || (!isTextarea && existingInput.tagName === 'TEXTAREA'))) {
            // Simpan value dulu
            const savedValue = existingInput.value;
            const parentElement = existingInput.parentNode;
            
            // Buat elemen baru
            let newElement;
            if (isTextarea) {
                newElement = document.createElement('textarea');
                newElement.rows = 3;
                newElement.placeholder = 'Contoh: 1,2,3 atau \'a\',\'b\',\'c\' (satu per baris atau dipisahkan koma)';
            } else {
                newElement = document.createElement('input');
                newElement.type = 'text';
                if (['LIKE', 'NOT LIKE'].includes(operator)) {
                    newElement.placeholder = 'Contoh: %test% atau test%';
                } else {
                    newElement.placeholder = 'Enter value...';
                }
            }
            
            newElement.id = `whereValue_${index}`;
            newElement.name = `whereValue_${index}`;
            newElement.className = 'form-nexa-control';
            newElement.setAttribute('data-operator', operator);
            newElement.value = savedValue; // Restore value
            
            // Ganti elemen
            parentElement.replaceChild(newElement, existingInput);
        } else if (!existingInput) {
            // Buat elemen baru jika belum ada
            let newElement;
            if (isTextarea) {
                newElement = document.createElement('textarea');
                newElement.rows = 3;
                newElement.placeholder = 'Contoh: 1,2,3 atau \'a\',\'b\',\'c\' (satu per baris atau dipisahkan koma)';
            } else {
                newElement = document.createElement('input');
                newElement.type = 'text';
                if (['LIKE', 'NOT LIKE'].includes(operator)) {
                    newElement.placeholder = 'Contoh: %test% atau test%';
                } else {
                    newElement.placeholder = 'Enter value...';
                }
            }
            
            newElement.id = `whereValue_${index}`;
            newElement.name = `whereValue_${index}`;
            newElement.className = 'form-nexa-control';
            newElement.setAttribute('data-operator', operator);
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-nexa-group';
            formGroup.innerHTML = '<label>Value</label>';
            formGroup.appendChild(newElement);
            valueContainer.innerHTML = '';
            valueContainer.appendChild(formGroup);
        } else {
            // Update placeholder jika elemen sudah ada dan jenisnya sama
            existingInput.setAttribute('data-operator', operator);
            if (isTextarea) {
                existingInput.placeholder = 'Contoh: 1,2,3 atau \'a\',\'b\',\'c\' (satu per baris atau dipisahkan koma)';
            } else if (['LIKE', 'NOT LIKE'].includes(operator)) {
                existingInput.placeholder = 'Contoh: %test% atau test%';
            } else {
                existingInput.placeholder = 'Enter value...';
            }
        }
    } else {
        valueContainer.style.display = 'block';
        // No value needed: 4 (dengan Logic) atau 5 (tanpa Logic)
        valueContainer.className = hasLogic ? 'nx-col-4' : 'nx-col-5';
        valueContainer.innerHTML = '<div class="form-nexa-group"><label>&nbsp;</label><div class="form-nexa-control" style="padding-top: 8px;">No value needed</div></div>';
    }
    
    // Handle value2 untuk BETWEEN
    if (needsSecondValue) {
        if (!value2Container) {
            const row = document.getElementById(`whereRow_${index}`);
            if (row) {
                const value2Div = document.createElement('div');
                value2Div.className = 'nx-col-2';
                value2Div.id = `whereValue2Container_${index}`;
                value2Div.innerHTML = `
                    <div class="form-nexa-group">
                        <label>Value 2</label>
                        <input type="text" id="whereValue2_${index}" name="whereValue2_${index}" class="form-nexa-control" placeholder="Enter value 2...">
                    </div>
                `;
                
                // Insert sebelum tombol delete
                const deleteCol = row.querySelector('.nx-col-1');
                if (deleteCol) {
                    row.insertBefore(value2Div, deleteCol);
                }
            }
        } else {
            value2Container.style.display = 'block';
        }
    } else {
        if (value2Container) {
            value2Container.style.display = 'none';
        }
    }
}

// Tambah row baru untuk WHERE
nx.addWhereRow = function (tabel) {
    const modalID = "where_" + tabel;
    const container = document.getElementById('whereContainer');
    if (!container) return;
    
    // Hitung jumlah row yang sudah ada
    const existingRows = container.querySelectorAll('.nx-row[id^="whereRow_"]');
    const newIndex = existingRows.length;
    
    // Ambil options dari select pertama yang ada
    const firstFieldSelect = container.querySelector('select.select2-field');
    if (!firstFieldSelect) return;
    
    let fieldOptionsHTML = '<option value="">Pilih field...</option>';
    Array.from(firstFieldSelect.options).forEach(opt => {
        if (opt.value) {
            fieldOptionsHTML += `<option value="${opt.value}">${opt.text}</option>`;
        }
    });
    
    // Ambil operator options dari select pertama yang ada
    const firstOperatorSelect = container.querySelector('select[id^="whereOperator_"]');
    let operatorOptionsHTML = '';
    if (firstOperatorSelect) {
        Array.from(firstOperatorSelect.options).forEach(opt => {
            operatorOptionsHTML += `<option value="${opt.value}">${opt.text}</option>`;
        });
    } else {
        operatorOptionsHTML = `
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value="<>"><></option>
            <option value=">">></option>
            <option value=">=">>=</option>
            <option value="<"><</option>
            <option value="<="><=</option>
            <option value="LIKE">LIKE</option>
            <option value="NOT LIKE">NOT LIKE</option>
            <option value="IN">IN</option>
            <option value="NOT IN">NOT IN</option>
            <option value="BETWEEN">BETWEEN</option>
            <option value="IS NULL">IS NULL</option>
            <option value="IS NOT NULL">IS NOT NULL</option>
        `;
    }
    
    // Buat row baru
    const newRow = document.createElement('div');
    newRow.className = 'nx-row mb-2';
    newRow.id = `whereRow_${newIndex}`;
    newRow.innerHTML = `
        <div class="nx-col-3">
            <div class="form-nexa-group">
                <label>Logic</label>
                <select id="whereLogical_${newIndex}" name="whereLogical_${newIndex}" class="form-nexa-control">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                </select>
            </div>
        </div>
        <div class="nx-col-3">
            <div class="form-nexa-group">
                <label>Field ${newIndex + 1}</label>
                <select id="whereField_${newIndex}" name="whereField_${newIndex}" class="form-nexa-control select2-field" onchange="toggleWhereValue(${newIndex})">
                    ${fieldOptionsHTML}
                </select>
            </div>
        </div>
        <div class="nx-col-2">
            <div class="form-nexa-group">
                <label>Operator</label>
                <select id="whereOperator_${newIndex}" name="whereOperator_${newIndex}" class="form-nexa-control" onchange="toggleWhereValue(${newIndex})">
                    ${operatorOptionsHTML}
                </select>
            </div>
        </div>
        <div class="nx-col-3" id="whereValueContainer_${newIndex}">
            <div class="form-nexa-group">
                <label>Value</label>
                <input type="text" id="whereValue_${newIndex}" name="whereValue_${newIndex}" class="form-nexa-control" placeholder="Enter value..." data-operator="=" onchange="toggleWhereValue(${newIndex})">
            </div>
        </div>
        <div class="nx-col-1">
            <div class="form-nexa-group">
                <label style="display: block; height: 20px; margin-bottom: 8px;">&nbsp;</label>
                <a href="javascript:void(0);" onclick="removeWhereRow('${newIndex}', '${tabel}');" class="btn btn-sm btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined nx-icon-sm">delete</span>
                </a>
            </div>
        </div>
    `;
    
    container.appendChild(newRow);
    
    // Inisialisasi Select2 untuk select baru
    setTimeout(() => {
        NXUI.initSelect2(`#whereField_${newIndex}`, {
            placeholder: "Pilih field...",
            allowClear: true,
            width: "100%"
        });
    }, 100);
}

// Hapus row WHERE
nx.removeWhereRow = function (index, tabel) {
    const row = document.getElementById(`whereRow_${index}`);
    if (row) {
        // Destroy Select2 jika ada
        const select = row.querySelector('.select2-field');
        if (select && $(select).hasClass('select2-hidden-accessible')) {
            $(select).select2('destroy');
        }
        row.remove();
    }
}

// Save WHERE
nx.saveWhere = async function (modalID, data, storage) {
    try {
        const tabel = storage.id;
        
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
        
        // Kumpulkan semua where dari form
        const where = [];
        let index = 0;
        
        while (data[`whereField_${index}`] !== undefined) {
            const fieldAlias = data[`whereField_${index}`]; // Ini adalah alias (misalnya "row")
            const operator = data[`whereOperator_${index}`] || '=';
            const value = data[`whereValue_${index}`] || '';
            const value2 = data[`whereValue2_${index}`] || '';
            const logical = index > 0 ? (data[`whereLogical_${index}`] || 'AND') : '';
            
            if (fieldAlias && fieldAlias.trim() !== '') {
                // Cari fullField dari mapping (misalnya "demo.row")
                const fullField = aliasToFullFieldMap[fieldAlias.trim()] || fieldAlias.trim();
                
                // Simpan fullField dengan prefix tabel karena ini JOIN (bukan alias)
                const whereItem = {
                    field: fullField, // Simpan fullField dengan prefix tabel (misalnya "demo.row")
                    fieldAlias: fieldAlias.trim(), // Simpan juga alias untuk referensi
                    operator: operator.trim(),
                    logical: logical
                };
                
                // Tambahkan value jika diperlukan
                if (!['IS NULL', 'IS NOT NULL'].includes(operator)) {
                    whereItem.value = value.trim();
                    
                    // Tambahkan value2 untuk BETWEEN
                    if (operator === 'BETWEEN' && value2.trim()) {
                        whereItem.value2 = value2.trim();
                    }
                }
                
                where.push(whereItem);
            }
            
            index++;
        }
        
        // Update metadata
        const updatedMetadata = {
            ...metadata,
            id: tabel,
            where: where,
            updatedAt: new Date().toISOString()
        };
        
        await NXUI.ref.mergeData("tabelStore", tabel, updatedMetadata, {
            deepMerge: true,
            createIfNotExists: true
        });
        
        NXUI.nexaModal.close(modalID);
        await renderTabelView();
        
    } catch (error) {
        console.error('❌ Error saving WHERE:', error);
        throw error;
    }
}

