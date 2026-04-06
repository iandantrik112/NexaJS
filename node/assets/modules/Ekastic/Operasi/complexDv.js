

export async function opComplex(data) {
  try {
   const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();
const sqlQuery = convertApplicationsToSQL(storage.applications);
// Ekstrak metadata SQL untuk autocomplete
const sqlMetadata = extractSQLMetadata(storage);
  setTimeout(async () => {
       try {
      await NXUI.NexaCmirror.loadDependencies();
      
      // Siapkan config dengan variabel SQL
      const editorConfig = {
        mode: 'sql', // Mode: 'htmlmixed', 'javascript', 'css', 'sql', 'json', dll
        height: '100%',
        save: 'complexbtnSave',   // ID tombol save (akan di-setup otomatis)
        copy: 'complexbtnCopy',   // ID tombol copy (akan di-setup otomatis)
        format:true,   // merapikan kode otomatis
        notification:false,
        fontSize:"14px",
        status:true, // true = aktif editor tampil tombol save dan  copy false = hide tombol save dan copy
        // Variabel untuk SQL autocomplete
        sqlTables: sqlMetadata.tables,        // Daftar nama tabel
        sqlColumns: sqlMetadata.columns,      // Daftar nama kolom
        sqlTableColumnsMap: sqlMetadata.tableColumnsMap, // Map tabel ke kolom
        sqlFullAliases: sqlMetadata.fullAliases, // Format lengkap: "table.column AS alias"
        onSave:async function(Code) {  
          // Parse SQL query dan update struktur applications
          const updatedApplications = parseSQLToApplications(Code, storage.applications);
          
          // Deteksi field baru yang belum ada di storage
          const existingAliases = storage.buckets?.allAlias || [];
          const newAliases = updatedApplications.alias.filter(alias => 
            !existingAliases.includes(alias)
          );
          
          // Jika ada field baru, tambahkan ke semua variabel storage
          if (newAliases.length > 0) {
            addNewFieldsToStorage(newAliases, storage, updatedApplications);
          }
          
          // Update storage.applications dengan hasil parse
          storage.applications = updatedApplications;
          
          // Update tabel property di form berdasarkan field yang ada di SELECT clause
          updateTabelPropertyFromSelect(storage);
          
          // Set type storage
          storage.type = 'operasi';
          
          // Ambil nama tabel dari applications.tabelName (array)
          const tableName = storage.applications.tabelName && storage.applications.tabelName.length > 0 
            ? storage.applications.tabelName[0] 
            : null;
          
          // Hapus property storage.applications[namaTabel] jika ada (tidak diperlukan)
          if (tableName && storage.applications[tableName]) {
            delete storage.applications[tableName];
          }
          
          if (tableName) {
            // Ambil data operasi yang sudah ada (jika ada) untuk mempertahankan keyIndex dan aliasIndex
            const existingOperasi = storage.applications.operasi && storage.applications.operasi[tableName]
              ? storage.applications.operasi[tableName]
              : null;
            
            // Siapkan data operasi baru dengan query
            const operasiData = {
              "index": existingOperasi?.index || "",
              "aliasIndex": existingOperasi?.aliasIndex || tableName,
              "query": Code,
              "keyIndex": existingOperasi?.keyIndex || 279283707314106,
              "target": existingOperasi?.target || "",
              "condition": existingOperasi?.condition || "",
              "aliasTarget": existingOperasi?.aliasTarget || "",
              "keyTarget": existingOperasi?.keyTarget || ""
            };
            
            // Update storage.applications.operasi[namaTabel] dengan type "operasi"
            if (!storage.applications.operasi) {
              storage.applications.operasi = {};
            }
            storage.applications.operasi[tableName] = {
              ...operasiData,
              "type": "operasi" // Type untuk operasi.demo adalah "operasi"
            };
          }

          await NXUI.ref.set("nexaStore", storage);
          
        },
        onCopy: function(Code) {
        },
        // Semua konfigurasi lain (theme, lineNumbers, dll) sudah di-set default di class
      };
      
      // Inisialisasi CodeMirror dengan konfigurasi sederhana
      // Semua setup (theme, autocomplete, save, copy) sudah di-handle otomatis di dalam class
      const editor = new NXUI.NexaCmirror('codeEditor', editorConfig);
      
      // Export ke global scope jika diperlukan
         window.editor = editor;
       } catch (error) {
       }
     }, 100);

    return `
 <div class="nx-card NexaCmirror-editorContainer" style="opacity: 0; visibility: hidden;">
  <div class="nx-card-header">
    <h3 class="bold" id="titleEditor">
      <i class="fas fa-code" id="modeIcon"></i>
      <span id="modeText">Nexa Mirror</span>
    </h3>
    <div class="NexaCmirror-editorToolbar">
      <button id="btnFormat" class="NexaCmirror-btn-format" title="Format Code (Ctrl+Shift+F)">
        <span class="material-symbols-outlined">code</span>
      </button>
      <button id="complexbtnCopy" class="NexaCmirror-btn-copy" title="Copy">
        <span class="material-symbols-outlined">content_copy</span>
      </button>
      <button id="complexbtnSave" class="NexaCmirror-btn-save" title="Save">
        <span class="material-symbols-outlined">save</span>
      </button>
    </div>
  </div>
  <div class="nx-card-body" style="padding: 0px;">  
  <div>
<textarea id="codeEditor">${sqlQuery}</textarea>
  </div>
  </div>
  <div class="nx-card-footer">
    <div class="nx-alert nx-alert-primary">
      <h5 class="bold mb-2"><i class="fas fa-info-circle"></i> Panduan Sistem SQL Editor</h5>
      <div class="mb-2">
        <strong>Fungsi Utama:</strong>
        <ul class="mb-0 mt-1" style="padding-left: 20px;">
          <li><strong>Editor SQL Interaktif:</strong> Edit query SQL dengan autocomplete untuk tabel dan kolom</li>
          <li><strong>Konversi Otomatis:</strong> Mengkonversi struktur applications ke SQL dan sebaliknya</li>
          <li><strong>Manajemen Field:</strong> Otomatis menambahkan field baru ke storage saat query diubah</li>
          <li><strong>Sinkronisasi Form:</strong> Update properti tabel di form berdasarkan field di SELECT clause</li>
        </ul>
      </div>
      <div class="mb-2">
        <strong>Cara Penggunaan:</strong>
        <ul class="mb-0 mt-1" style="padding-left: 20px;">
          <li>Edit query SQL langsung di editor (format: <code>table.column AS alias</code>)</li>
          <li>Gunakan <kbd>Ctrl+Shift+F</kbd> atau tombol Format untuk merapikan kode</li>
          <li>Klik <strong>Save</strong> untuk menyimpan perubahan ke storage</li>
          <li>Field baru akan otomatis ditambahkan ke form dan storage</li>
        </ul>
      </div>
      <div class="mb-0">
        <strong>Fitur Autocomplete:</strong> Sistem menyediakan autocomplete untuk tabel, kolom, dan alias yang tersedia di storage. Mulai ketik untuk melihat saran.
      </div>
    </div>
  </div>
</div>
    `;
    
  } catch (error) {
    return `
        <div class="alert alert-danger text-center">
            <h5>❌ Initialization Failed</h5>
            <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
        </div>
    `;
  }
}

/**
 * Mengekstrak informasi tabel dan kolom untuk SQL autocomplete
 * @param {Object} storage - Objek storage yang berisi applications dan buckets
 * @returns {Object} Objek berisi tables dan columns untuk SQL autocomplete
 */
export function extractSQLMetadata(storage) {
  const tables = [];
  const columns = [];
  const fullAliases = []; // Format lengkap: "table.column AS alias"
  const tableColumnsMap = {}; // Map table name ke array columns
  
  // Ekstrak tabel dari applications.tabelName
  if (storage.applications && storage.applications.tabelName) {
    storage.applications.tabelName.forEach(table => {
      if (!tables.includes(table)) {
        tables.push(table);
        tableColumnsMap[table] = [];
      }
    });
  }
  
  // Ekstrak kolom dari applications.alias dan applications.aliasNames
  if (storage.applications && storage.applications.alias) {
    storage.applications.alias.forEach(alias => {
      // Simpan format lengkap
      if (!fullAliases.includes(alias)) {
        fullAliases.push(alias);
      }
      
      // Format: "table.column AS alias" atau "table.column"
      const match = alias.match(/(\w+)\.(\w+)(?:\s+AS\s+(\w+))?/i);
      if (match) {
        const tableName = match[1];
        const columnName = match[2];
        const aliasName = match[3] || columnName;
        
        // Tambahkan ke daftar kolom
        if (!columns.includes(columnName)) {
          columns.push(columnName);
        }
        if (!columns.includes(aliasName)) {
          columns.push(aliasName);
        }
        
        // Tambahkan ke map tabel
        if (tableColumnsMap[tableName]) {
          if (!tableColumnsMap[tableName].includes(columnName)) {
            tableColumnsMap[tableName].push(columnName);
          }
        } else {
          tableColumnsMap[tableName] = [columnName];
          if (!tables.includes(tableName)) {
            tables.push(tableName);
          }
        }
      }
    });
  }
  
  // Ekstrak kolom tambahan dari buckets.allAlias jika ada
  if (storage.buckets && storage.buckets.allAlias) {
    storage.buckets.allAlias.forEach(alias => {
      // Simpan format lengkap dari allAlias
      if (!fullAliases.includes(alias)) {
        fullAliases.push(alias);
      }
      
      const match = alias.match(/(\w+)\.(\w+)(?:\s+AS\s+(\w+))?/i);
      if (match) {
        const tableName = match[1];
        const columnName = match[2];
        const aliasName = match[3] || columnName;
        
        if (!columns.includes(columnName)) {
          columns.push(columnName);
        }
        if (!columns.includes(aliasName)) {
          columns.push(aliasName);
        }
        
        if (tableColumnsMap[tableName]) {
          if (!tableColumnsMap[tableName].includes(columnName)) {
            tableColumnsMap[tableName].push(columnName);
          }
        } else {
          tableColumnsMap[tableName] = [columnName];
          if (!tables.includes(tableName)) {
            tables.push(tableName);
          }
        }
      }
    });
  }
  
  return {
    tables: tables,
    columns: columns,
    fullAliases: fullAliases, // Format lengkap untuk autocomplete
    tableColumnsMap: tableColumnsMap
  };
}

/**
 * Update properti tabel di form berdasarkan field yang ada di SELECT clause
 * @param {Object} storage - Objek storage yang akan di-update
 */
function updateTabelPropertyFromSelect(storage) {
  if (!storage || !storage.form || !storage.applications) {
    return;
  }

  // Ambil semua aliasNames dari applications.aliasNames (field yang ada di SELECT)
  const selectedFields = storage.applications.aliasNames || [];
  
  // Loop semua form fields (termasuk yang sudah ada dan yang baru)
  Object.keys(storage.form).forEach(fieldName => {
    const isInSelect = selectedFields.includes(fieldName);
    
    // Update tabel property - selalu update untuk memastikan konsistensi
    storage.form[fieldName].tabel = isInSelect;
  });
}

/**
 * Menambahkan field baru ke semua variabel storage
 * @param {Array} newAliases - Array alias baru dari SQL query (format: "table.column AS alias")
 * @param {Object} storage - Objek storage yang akan di-update
 * @param {Object} updatedApplications - Objek applications yang sudah di-parse (untuk cek field di SELECT)
 */
function addNewFieldsToStorage(newAliases, storage, updatedApplications = null) {
  if (!newAliases || !Array.isArray(newAliases) || newAliases.length === 0) {
    return;
  }

  if (!storage || !storage.buckets) {
    return;
  }

  // Inisialisasi array jika belum ada
  if (!storage.buckets.allAlias) storage.buckets.allAlias = [];
  if (!storage.buckets.failed) storage.buckets.failed = [];
  if (!storage.buckets.variables) storage.buckets.variables = [];
  if (!storage.buckets.variablesAlias) storage.buckets.variablesAlias = [];
  if (!storage.variablesOrigin) storage.variablesOrigin = [];
  if (!storage.form) storage.form = {};

  // Ambil keyIndex dasar dari operasi atau tableKey
  const baseKeyIndex = storage.tableKey || (storage.buckets.operasi && Object.values(storage.buckets.operasi)[0]?.keyIndex) || 230351593630038;
  const timestamp = new Date().toISOString();

  // Cari ID/key terakhir dari semua form fields yang sudah ada
  let lastKeyIndex = baseKeyIndex;
  if (storage.form && Object.keys(storage.form).length > 0) {
    const allKeys = Object.values(storage.form)
      .map(field => field.key)
      .filter(key => key && typeof key === 'number')
      .sort((a, b) => b - a); // Sort descending untuk dapat yang terbesar
    
    if (allKeys.length > 0) {
      lastKeyIndex = allKeys[0]; // Ambil yang terbesar
    }
  }

  const changes = {
    allAlias: [],
    failed: [],
    bucketsVariables: [],
    variablesAlias: [],
    variablesOrigin: [],
    rootVariables: [],
    form: []
  };

  // Counter untuk increment ID untuk setiap field baru
  let currentKeyIndex = lastKeyIndex;

  newAliases.forEach((alias, index) => {
    // Parse format: "table.column AS alias" atau "table.column"
    const match = alias.match(/(\w+)\.(\w+)(?:\s+AS\s+(\w+))?/i);
    if (!match) return;

    const tableName = match[1];
    const columnName = match[2];
    const aliasName = match[3] || columnName;
    const fullAlias = alias.trim();
    const tableColumn = `${tableName}.${columnName}`;
    const failedKey = `${tableName}-${columnName}`;

    // 1. Tambahkan ke buckets.allAlias jika belum ada
    if (!storage.buckets.allAlias.includes(fullAlias)) {
      storage.buckets.allAlias.push(fullAlias);
      changes.allAlias.push(fullAlias);
    }

    // 2. Tambahkan ke buckets.failed jika belum ada
    if (!storage.buckets.failed.includes(failedKey)) {
      storage.buckets.failed.push(failedKey);
      changes.failed.push(failedKey);
    }

    // 3. Tambahkan ke buckets.variables (alias name) jika belum ada
    if (!storage.buckets.variables.includes(aliasName)) {
      storage.buckets.variables.push(aliasName);
      changes.bucketsVariables.push(aliasName);
    }

    // 4. Tambahkan ke buckets.variablesAlias (table.column) jika belum ada
    if (!storage.buckets.variablesAlias.includes(tableColumn)) {
      storage.buckets.variablesAlias.push(tableColumn);
      changes.variablesAlias.push(tableColumn);
    }

    // 5. Tambahkan ke variablesOrigin jika belum ada
    if (!storage.variablesOrigin || !Array.isArray(storage.variablesOrigin)) {
      storage.variablesOrigin = [];
    }
    if (!storage.variablesOrigin.includes(tableColumn)) {
      storage.variablesOrigin.push(tableColumn);
      changes.variablesOrigin.push(tableColumn);
    }

    // 6. Tambahkan ke variables (root level) jika belum ada
    if (!storage.variables || !Array.isArray(storage.variables)) {
      storage.variables = [];
    }
    if (!storage.variables.includes(aliasName)) {
      storage.variables.push(aliasName);
      changes.rootVariables.push(aliasName);
    }

    // 7. Buat form object untuk field baru jika belum ada
    if (!storage.form[aliasName]) {
      // Cek apakah field ada di SELECT clause
      const selectedFields = updatedApplications?.aliasNames || [];
      const isInSelect = selectedFields.includes(aliasName);
      
      // Increment keyIndex untuk setiap field baru
      currentKeyIndex++;
      const newKeyIndex = currentKeyIndex;
      
      storage.form[aliasName] = {
        type: "text",
        icons: "attach_file",
        columnWidth: "nx-col-12",
        name: aliasName,
        key: newKeyIndex,
        failedtabel: tableColumn,
        failed: columnName,
        failedAs: fullAlias,
        fieldAlias: aliasName,
        placeholder: aliasName,
        validation: "2",
        timestamp: timestamp,
        control: "",
        value: false,
        hidden: false,
        readonly: false,
        tabel: isInSelect, // true jika ada di SELECT, false jika tidak
        condition: false,
        modal: false,
        search: false,
        filtering: false,
        inline: false,
        select: false
      };
      changes.form.push(aliasName);
    }
  });
}

/**
 * Parse SQL query menjadi struktur applications
 * @param {string} sqlQuery - Query SQL yang akan di-parse
 * @param {Object} currentApplications - Objek applications saat ini (untuk mempertahankan struktur yang ada)
 * @returns {Object} Objek applications yang sudah di-update berdasarkan SQL query
 */
function parseSQLToApplications(sqlQuery, currentApplications = {}) {
  if (!sqlQuery || typeof sqlQuery !== 'string') {
    return currentApplications;
  }

  // Normalize query: hapus whitespace berlebihan dan newlines
  const normalizedQuery = sqlQuery.replace(/\s+/g, ' ').trim();
  
  // Clone currentApplications untuk mempertahankan struktur yang ada
  const updated = {
    access: currentApplications.access || 'public',
    alias: [],
    aliasNames: [],
    tabelName: [],
    where: currentApplications.where || false,
    group: currentApplications.group || false,
    order: currentApplications.order || false,
    operasi: currentApplications.operasi || {},
    limit: currentApplications.limit || 0,
    offset: currentApplications.offset || 0
  };

  // Parse SELECT clause
  const selectMatch = normalizedQuery.match(/^SELECT\s+(.+?)\s+FROM/i);
  if (selectMatch) {
    const selectClause = selectMatch[1].trim();
    
    // Split berdasarkan koma (handle multiline)
    const columns = selectClause.split(',').map(col => col.trim()).filter(col => col.length > 0);
    
    columns.forEach(column => {
      // Parse format: "table.column AS alias" atau "table.column"
      const aliasMatch = column.match(/(\w+)\.(\w+)(?:\s+AS\s+(\w+))?/i);
      if (aliasMatch) {
        const tableName = aliasMatch[1];
        const columnName = aliasMatch[2];
        const aliasName = aliasMatch[3] || columnName;
        
        // Format lengkap untuk alias
        const fullAlias = aliasMatch[3] ? `${tableName}.${columnName} AS ${aliasName}` : `${tableName}.${columnName} AS ${columnName}`;
        
        // Tambahkan ke alias jika belum ada
        if (!updated.alias.includes(fullAlias)) {
          updated.alias.push(fullAlias);
        }
        
        // Tambahkan ke aliasNames jika belum ada
        if (!updated.aliasNames.includes(aliasName)) {
          updated.aliasNames.push(aliasName);
        }
        
        // Tambahkan tabel jika belum ada
        if (!updated.tabelName.includes(tableName)) {
          updated.tabelName.push(tableName);
        }
      } else if (column === '*') {
        // Handle SELECT *
        updated.alias = ['*'];
        updated.aliasNames = [];
      }
    });
  }

  // Parse FROM clause
  const fromMatch = normalizedQuery.match(/FROM\s+([^\s]+(?:\s+[^\s]+)*?)(?:\s+WHERE|\s+GROUP\s+BY|\s+ORDER\s+BY|\s+HAVING|\s+LIMIT|\s+OFFSET|$)/i);
  if (fromMatch) {
    const fromClause = fromMatch[1].trim();
    const tables = fromClause.split(',').map(t => t.trim()).filter(t => t.length > 0);
    updated.tabelName = [...new Set([...updated.tabelName, ...tables])];
  }

  // Parse WHERE clause (lebih akurat dengan lookahead)
  const whereIndex = normalizedQuery.search(/\sWHERE\s/i);
  if (whereIndex !== -1) {
    const afterWhere = normalizedQuery.substring(whereIndex + 6); // 6 = length of " WHERE"
    // Cari akhir WHERE clause (sebelum GROUP BY, ORDER BY, HAVING, LIMIT, OFFSET)
    const whereEndMatch = afterWhere.match(/^(.+?)(?:\s+(?:GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET)|$)/i);
    if (whereEndMatch) {
      updated.where = whereEndMatch[1].trim();
    } else {
      updated.where = afterWhere.trim();
    }
  } else {
    updated.where = false;
  }

  // Parse GROUP BY clause
  const groupIndex = normalizedQuery.search(/\sGROUP\s+BY\s/i);
  if (groupIndex !== -1) {
    const afterGroup = normalizedQuery.substring(groupIndex + 10); // 10 = length of " GROUP BY"
    // Cari akhir GROUP BY clause
    const groupEndMatch = afterGroup.match(/^(.+?)(?:\s+(?:HAVING|ORDER\s+BY|LIMIT|OFFSET)|$)/i);
    if (groupEndMatch) {
      const groupClause = groupEndMatch[1].trim();
      const groupColumns = groupClause.split(',').map(col => col.trim()).filter(col => col.length > 0);
      updated.group = groupColumns.length === 1 ? groupColumns[0] : groupColumns;
    } else {
      const groupColumns = afterGroup.trim().split(',').map(col => col.trim()).filter(col => col.length > 0);
      updated.group = groupColumns.length === 1 ? groupColumns[0] : groupColumns;
    }
  } else {
    updated.group = false;
  }

  // Parse ORDER BY clause
  const orderIndex = normalizedQuery.search(/\sORDER\s+BY\s/i);
  if (orderIndex !== -1) {
    const afterOrder = normalizedQuery.substring(orderIndex + 10); // 10 = length of " ORDER BY"
    // Cari akhir ORDER BY clause
    const orderEndMatch = afterOrder.match(/^(.+?)(?:\s+(?:LIMIT|OFFSET)|$)/i);
    if (orderEndMatch) {
      const orderClause = orderEndMatch[1].trim();
      const orderColumns = orderClause.split(',').map(col => col.trim()).filter(col => col.length > 0);
      updated.order = orderColumns.length === 1 ? orderColumns[0] : orderColumns;
    } else {
      const orderColumns = afterOrder.trim().split(',').map(col => col.trim()).filter(col => col.length > 0);
      updated.order = orderColumns.length === 1 ? orderColumns[0] : orderColumns;
    }
  } else {
    updated.order = false;
  }

  // Parse LIMIT clause
  const limitMatch = normalizedQuery.match(/\sLIMIT\s+(\d+)/i);
  if (limitMatch) {
    updated.limit = parseInt(limitMatch[1]);
  } else {
    updated.limit = 0;
  }

  // Parse OFFSET clause
  const offsetMatch = normalizedQuery.match(/\sOFFSET\s+(\d+)/i);
  if (offsetMatch) {
    updated.offset = parseInt(offsetMatch[1]);
  } else {
    updated.offset = 0;
  }

  return updated;
}

/**
 * Mengkonversi objek applications menjadi query SQL SELECT
 * @param {Object} applications - Objek konfigurasi query
 * @returns {string} Query SQL yang sudah diformat
 */
export function convertApplicationsToSQL(applications) {
    if (!applications || typeof applications !== 'object') {
        throw new Error('Applications object is required');
    }

    let query = 'SELECT ';

    // Build SELECT clause dari alias array
    if (applications.alias && Array.isArray(applications.alias) && applications.alias.length > 0) {
        query += applications.alias.join(', ');
    } else {
        query += '*';
    }

    // Build FROM clause dari tabelName array
    if (applications.tabelName && Array.isArray(applications.tabelName) && applications.tabelName.length > 0) {
        query += ' FROM ' + applications.tabelName.join(', ');
    } else {
        throw new Error('Table name is required');
    }

    // Build WHERE clause
    if (applications.where && applications.where !== false) {
        const whereClause = typeof applications.where === 'string' ? applications.where.trim() : String(applications.where).trim();
        // Cek apakah sudah mengandung "WHERE" di awal
        if (whereClause.toUpperCase().startsWith('WHERE')) {
            query += ' ' + whereClause;
        } else {
            query += ' WHERE ' + whereClause;
        }
    }

    // Build GROUP BY clause
    if (applications.group && applications.group !== false) {
        if (Array.isArray(applications.group)) {
            query += ' GROUP BY ' + applications.group.join(', ');
        } else {
            const groupClause = String(applications.group).trim();
            // Cek apakah sudah mengandung "GROUP BY" di awal
            if (groupClause.toUpperCase().startsWith('GROUP BY')) {
                query += ' ' + groupClause;
            } else {
                query += ' GROUP BY ' + groupClause;
            }
        }
    }

    // Build ORDER BY clause
    if (applications.order && applications.order !== false) {
        if (Array.isArray(applications.order)) {
            query += ' ORDER BY ' + applications.order.join(', ');
        } else {
            const orderClause = String(applications.order).trim();
            // Cek apakah sudah mengandung "ORDER BY" di awal
            if (orderClause.toUpperCase().startsWith('ORDER BY')) {
                query += ' ' + orderClause;
            } else {
                query += ' ORDER BY ' + orderClause;
            }
        }
    }

    // Build LIMIT clause
    if (applications.limit !== undefined && applications.limit !== null && applications.limit !== false) {
        query += ' LIMIT ' + parseInt(applications.limit);
    }

    // Build OFFSET clause
    if (applications.offset !== undefined && applications.offset !== null && applications.offset !== false) {
        query += ' OFFSET ' + parseInt(applications.offset);
    }

    return query;
}
