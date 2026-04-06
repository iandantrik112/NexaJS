/**
 * Menghasilkan query SQL terpisah untuk main dan subnested
 * 
 * Subnested adalah query terpisah yang akan dieksekusi untuk SETIAP baris hasil query utama.
 * WHERE condition di subnested menggunakan pattern table.field (misalnya "demo.userid") 
 * yang akan diganti dengan nilai aktual dari setiap baris hasil utama saat eksekusi.
 * 
 * Contoh: 
 * - Main query: SELECT demo.userid, demo.title FROM demo
 * - Subnested query: SELECT user.nama FROM user WHERE user.id = demo.userid
 *   (pattern "demo.userid" akan diganti dengan nilai aktual dari hasil main query)
 * 
 * @param {Object} storage - Objek storage yang berisi struktur utama dan subnested
 * @returns {Object} Object dengan query utama (main) dan template query subnested
 */
export function generateSQLWithSubnested(storage) {
  if (!storage || typeof storage !== 'object') {
    throw new Error('Storage object is required');
  }

  // Generate query utama (main) - TANPA subnested
  let mainQuery = 'SELECT ';

  // Hanya alias dari main storage (TIDAK termasuk subnested)
  if (storage.alias && Array.isArray(storage.alias) && storage.alias.length > 0) {
    mainQuery += storage.alias.join(', ');
  } else {
    mainQuery += '*';
  }

  // Build FROM clause dari tabel utama
  if (storage.tabelName && Array.isArray(storage.tabelName) && storage.tabelName.length > 0) {
    const uniqueTables = [...new Set(storage.tabelName)];
    mainQuery += ' FROM ' + uniqueTables.join(', ');
  } else {
    throw new Error('Table name is required');
  }

  // Build WHERE clause dari main storage
  if (storage.where && storage.where !== false) {
    const whereClause = typeof storage.where === 'string' ? storage.where.trim() : String(storage.where).trim();
    if (whereClause.toUpperCase().startsWith('WHERE')) {
      mainQuery += ' ' + whereClause;
    } else {
      mainQuery += ' WHERE ' + whereClause;
    }
  }

  // Build GROUP BY clause dari main storage
  if (storage.group && storage.group !== false) {
    if (Array.isArray(storage.group)) {
      mainQuery += ' GROUP BY ' + storage.group.join(', ');
    } else {
      const groupClause = String(storage.group).trim();
      if (groupClause.toUpperCase().startsWith('GROUP BY')) {
        mainQuery += ' ' + groupClause;
      } else {
        mainQuery += ' GROUP BY ' + groupClause;
      }
    }
  }

  // Build ORDER BY clause dari main storage
  if (storage.order && storage.order !== false) {
    if (Array.isArray(storage.order)) {
      mainQuery += ' ORDER BY ' + storage.order.join(', ');
    } else {
      const orderClause = String(storage.order).trim();
      if (orderClause.toUpperCase().startsWith('ORDER BY')) {
        mainQuery += ' ' + orderClause;
      } else {
        mainQuery += ' ORDER BY ' + orderClause;
      }
    }
  }

  // Build LIMIT clause
  if (storage.limit !== undefined && storage.limit !== null && storage.limit !== false) {
    mainQuery += ' LIMIT ' + parseInt(storage.limit);
  }

  // Build OFFSET clause
  if (storage.offset !== undefined && storage.offset !== null && storage.offset !== false) {
    mainQuery += ' OFFSET ' + parseInt(storage.offset);
  }

  // Generate TEMPLATE query subnested (jika ada)
  // Template ini akan digunakan untuk dieksekusi untuk setiap baris hasil utama
  // WHERE condition masih menggunakan pattern table.field yang akan diganti dengan nilai aktual
  let subnestedQuery = null;
  if (storage.subnested) {
    subnestedQuery = 'SELECT ';

    // Alias dari subnested
    if (storage.subnested.alias && Array.isArray(storage.subnested.alias) && storage.subnested.alias.length > 0) {
      subnestedQuery += storage.subnested.alias.join(', ');
    } else {
      subnestedQuery += '*';
    }

    // Build FROM clause dari tabel subnested
    if (storage.subnested.tabelName && Array.isArray(storage.subnested.tabelName) && storage.subnested.tabelName.length > 0) {
      const uniqueTables = [...new Set(storage.subnested.tabelName)];
      subnestedQuery += ' FROM ' + uniqueTables.join(', ');
    } else {
      throw new Error('Subnested table name is required');
    }

    // NOTE: WHERE clause TIDAK ditambahkan ke query yang ditampilkan di editor
    // WHERE akan diganti secara dinamis di server berdasarkan nilai dari hasil main query
    // WHERE condition disimpan di storage.subnested.where untuk digunakan di server

    // Build GROUP BY clause dari subnested
    if (storage.subnested.group && storage.subnested.group !== false) {
      if (Array.isArray(storage.subnested.group)) {
        subnestedQuery += ' GROUP BY ' + storage.subnested.group.join(', ');
      } else {
        const groupClause = String(storage.subnested.group).trim();
        if (groupClause.toUpperCase().startsWith('GROUP BY')) {
          subnestedQuery += ' ' + groupClause;
        } else {
          subnestedQuery += ' GROUP BY ' + groupClause;
        }
      }
    }

    // Build ORDER BY clause dari subnested
    if (storage.subnested.order && storage.subnested.order !== false) {
      if (Array.isArray(storage.subnested.order)) {
        subnestedQuery += ' ORDER BY ' + storage.subnested.order.join(', ');
      } else {
        const orderClause = String(storage.subnested.order).trim();
        if (orderClause.toUpperCase().startsWith('ORDER BY')) {
          subnestedQuery += ' ' + orderClause;
        } else {
          subnestedQuery += ' ORDER BY ' + orderClause;
        }
      }
    }
    
    // Note: Subnested query TIDAK menggunakan LIMIT/OFFSET
    // Karena akan dieksekusi untuk setiap baris hasil utama dan hanya mengambil 1 baris pertama
  }

  return {
    main: mainQuery,
    subnested: subnestedQuery
  };
}

/**
 * Menghasilkan query SQL terpisah untuk main dan subnested (alternatif: subquery)
 * @param {Object} storage - Objek storage yang berisi struktur utama dan subnested
 * @param {boolean} useSubquery - Jika true, subnested akan menjadi subquery, jika false akan menjadi JOIN
 * @returns {string} Query SQL yang sudah diformat
 */
export function generateSQLWithSubnestedAsSubquery(storage, useSubquery = false) {
  if (!storage || typeof storage !== 'object') {
    throw new Error('Storage object is required');
  }

  if (!useSubquery || !storage.subnested) {
    // Jika tidak menggunakan subquery atau tidak ada subnested, gunakan fungsi JOIN biasa
    return generateSQLWithSubnested(storage);
  }

  let query = 'SELECT ';

  // Alias dari main storage
  const mainAliases = [];
  if (storage.alias && Array.isArray(storage.alias) && storage.alias.length > 0) {
    mainAliases.push(...storage.alias);
  }

  // Build SELECT dengan subquery untuk subnested
  if (mainAliases.length > 0) {
    query += mainAliases.join(', ');
  } else {
    query += '*';
  }

  // Tambahkan subquery untuk subnested sebagai kolom
  if (storage.subnested && storage.subnested.alias && Array.isArray(storage.subnested.alias)) {
    storage.subnested.alias.forEach(alias => {
      // Parse alias untuk mendapatkan alias name
      const aliasMatch = alias.match(/AS\s+(\w+)/i);
      if (aliasMatch) {
        const aliasName = aliasMatch[1];
        // Buat subquery untuk setiap alias
        const subquery = `(SELECT ${alias.split(' AS ')[0]} FROM ${storage.subnested.tabelName[0]} WHERE ${storage.subnested.where.replace('WHERE ', '')}) AS ${aliasName}`;
        query += ', ' + subquery;
      }
    });
  }

  // Build FROM clause
  if (storage.tabelName && Array.isArray(storage.tabelName) && storage.tabelName.length > 0) {
    const uniqueTables = [...new Set(storage.tabelName)];
    query += ' FROM ' + uniqueTables.join(', ');
  } else {
    throw new Error('Table name is required');
  }

  // Build WHERE clause
  if (storage.where && storage.where !== false) {
    const whereClause = typeof storage.where === 'string' ? storage.where.trim() : String(storage.where).trim();
    if (whereClause.toUpperCase().startsWith('WHERE')) {
      query += ' ' + whereClause;
    } else {
      query += ' WHERE ' + whereClause;
    }
  }

  // Build GROUP BY, ORDER BY, LIMIT, OFFSET
  if (storage.group && storage.group !== false) {
    if (Array.isArray(storage.group)) {
      query += ' GROUP BY ' + storage.group.join(', ');
    } else {
      const groupClause = String(storage.group).trim();
      if (groupClause.toUpperCase().startsWith('GROUP BY')) {
        query += ' ' + groupClause;
      } else {
        query += ' GROUP BY ' + groupClause;
      }
    }
  }

  if (storage.order && storage.order !== false) {
    if (Array.isArray(storage.order)) {
      query += ' ORDER BY ' + storage.order.join(', ');
    } else {
      const orderClause = String(storage.order).trim();
      if (orderClause.toUpperCase().startsWith('ORDER BY')) {
        query += ' ' + orderClause;
      } else {
        query += ' ORDER BY ' + orderClause;
      }
    }
  }

  if (storage.limit !== undefined && storage.limit !== null && storage.limit !== false) {
    query += ' LIMIT ' + parseInt(storage.limit);
  }

  if (storage.offset !== undefined && storage.offset !== null && storage.offset !== false) {
    query += ' OFFSET ' + parseInt(storage.offset);
  }

  return query;
}
/**
 * Menghasilkan query SQL gabungan dari main dan subnested (TANPA JOIN)
 * Menggabungkan semua alias dari main dan subnested menjadi satu query
 * Subnested TIDAK di-join, hanya alias-nya yang digabungkan untuk view
 * @param {Object} storage - Objek storage yang berisi struktur utama dan subnested
 * @returns {string} Query SQL lengkap dengan alias gabungan (tanpa JOIN subnested)
 */
export function generateCombinedSQLWithJoin(storage) {
  if (!storage || typeof storage !== 'object') {
    throw new Error('Storage object is required');
  }

  let query = 'SELECT ';

  // Gabungkan alias dari main storage
  const allAliases = [];
  if (storage.alias && Array.isArray(storage.alias) && storage.alias.length > 0) {
    allAliases.push(...storage.alias);
  }

  // Tambahkan alias dari subnested jika ada (hanya yang belum ada di main)
  // Subnested tidak di-join, hanya alias-nya yang digabungkan untuk view
  if (storage.subnested && storage.subnested.alias && Array.isArray(storage.subnested.alias)) {
    storage.subnested.alias.forEach(subAlias => {
      // Extract alias name untuk cek duplikat
      const aliasMatch = subAlias.match(/AS\s+(\w+)/i);
      if (aliasMatch) {
        const aliasName = aliasMatch[1];
        // Cek apakah alias name sudah ada di main
        const existsInMain = storage.aliasNames && storage.aliasNames.includes(aliasName);
        if (!existsInMain) {
          // Hanya tambahkan jika belum ada di main
          allAliases.push(subAlias);
        }
      } else {
        // Jika tidak ada AS, tambahkan langsung
        allAliases.push(subAlias);
      }
    });
  }

  // Build SELECT clause
  if (allAliases.length > 0) {
    query += allAliases.join(',\n  ');
  } else {
    query += '*';
  }

  // Build FROM clause dari tabel utama saja (TIDAK ada JOIN ke subnested)
  if (storage.tabelName && Array.isArray(storage.tabelName) && storage.tabelName.length > 0) {
    const mainTable = storage.tabelName[0];
    query += '\nFROM ' + mainTable;
  } else {
    throw new Error('Table name is required');
  }

  // NOTE: Subnested TIDAK di-join karena akan dieksekusi terpisah untuk setiap baris hasil utama

  // Build WHERE clause dari main storage
  if (storage.where && storage.where !== false) {
    const whereClause = typeof storage.where === 'string' ? storage.where.trim() : String(storage.where).trim();
    if (whereClause.toUpperCase().startsWith('WHERE')) {
      query += '\n' + whereClause;
    } else {
      query += '\nWHERE ' + whereClause;
    }
  }

  // Build GROUP BY clause dari main storage
  if (storage.group && storage.group !== false) {
    if (Array.isArray(storage.group)) {
      query += '\nGROUP BY ' + storage.group.join(', ');
    } else {
      const groupClause = String(storage.group).trim();
      if (groupClause.toUpperCase().startsWith('GROUP BY')) {
        query += '\n' + groupClause;
      } else {
        query += '\nGROUP BY ' + groupClause;
      }
    }
  }

  // Build ORDER BY clause dari main storage
  if (storage.order && storage.order !== false) {
    if (Array.isArray(storage.order)) {
      query += '\nORDER BY ' + storage.order.join(', ');
    } else {
      const orderClause = String(storage.order).trim();
      if (orderClause.toUpperCase().startsWith('ORDER BY')) {
        query += '\n' + orderClause;
      } else {
        query += '\nORDER BY ' + orderClause;
      }
    }
  }

  // Build LIMIT clause
  if (storage.limit !== undefined && storage.limit !== null && storage.limit !== false) {
    query += '\nLIMIT ' + parseInt(storage.limit);
  }

  // Build OFFSET clause
  if (storage.offset !== undefined && storage.offset !== null && storage.offset !== false) {
    query += '\nOFFSET ' + parseInt(storage.offset);
  }

  return query;
}

/**
 * Update struktur column dengan semua aliasNames dari main dan subnested
 * @param {Object} storage - Objek storage yang akan di-update
 * @returns {Object} Storage yang sudah di-update dengan column
 */
export function updateColumnFromAliasNames(storage) {
  if (!storage || !storage.applications) {
    return storage;
  }

  const allColumns = [];
  let hasUserId = false;
  let hasId = false;

  // Tambahkan aliasNames dari main applications
  if (storage.applications.aliasNames && Array.isArray(storage.applications.aliasNames)) {
    storage.applications.aliasNames.forEach(aliasName => {
      if (aliasName === 'userid') {
        hasUserId = true; // Tandai jika ada "userid", tapi jangan tambahkan dulu
      } else if (aliasName === 'id') {
        hasId = true; // Tandai jika ada "id", tapi jangan tambahkan dulu
      } else if (!allColumns.includes(aliasName)) {
        allColumns.push(aliasName);
      }
    });
  }

  // Tambahkan aliasNames dari subnested
  if (storage.applications.subnested && storage.applications.subnested.aliasNames && Array.isArray(storage.applications.subnested.aliasNames)) {
    storage.applications.subnested.aliasNames.forEach(aliasName => {
      if (aliasName === 'userid') {
        hasUserId = true; // Tandai jika ada "userid", tapi jangan tambahkan dulu
      } else if (aliasName === 'id') {
        hasId = true; // Tandai jika ada "id", tapi jangan tambahkan dulu
      } else if (!allColumns.includes(aliasName)) {
        allColumns.push(aliasName);
      }
    });
  }

  // Tambahkan "userid" di akhir (sebelum "id") jika ada
  if (hasUserId) {
    allColumns.push('userid');
  }

  // Tambahkan "id" di akhir jika ada
  if (hasId) {
    allColumns.push('id');
  }

  // Update storage.column
  storage.column = allColumns;

  return storage;
}

/**
 * Parse SQL query dan update struktur subnested
 * @param {string} sqlQuery - Query SQL dari editor
 * @param {Object} storage - Objek storage yang akan di-update
 * @returns {Object} Storage yang sudah di-update
 */
export function parseSQLToSubnested(sqlQuery, storage) {
  if (!sqlQuery || typeof sqlQuery !== 'string') {
    return storage;
  }

  // Pastikan subnested ada, jika tidak buat struktur baru
  if (!storage.subnested) {
    storage.subnested = {
      alias: [],
      aliasNames: [],
      tabelName: [],
      where: false,
      group: false,
      order: false,
      operasi: {}
    };
  } else {
    // Pertahankan struktur yang sudah ada (where, operasi, group, order)
    // Hanya alias dan aliasNames yang akan di-update
  }

  // Normalize query: hapus whitespace berlebihan dan newlines
  const normalizedQuery = sqlQuery.replace(/\s+/g, ' ').trim();
  
  // Parse SELECT clause
  const selectMatch = normalizedQuery.match(/^SELECT\s+(.+?)\s+FROM/i);
  if (selectMatch) {
    const selectClause = selectMatch[1].trim();
    
    // Split berdasarkan koma (handle multiline)
    const columns = selectClause.split(',').map(col => col.trim()).filter(col => col.length > 0);
    
    const newAliases = [];
    const newAliasNames = [];
    
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
        if (!newAliases.includes(fullAlias)) {
          newAliases.push(fullAlias);
        }
        
        // Tambahkan ke aliasNames jika belum ada
        if (!newAliasNames.includes(aliasName)) {
          newAliasNames.push(aliasName);
        }
      }
    });
    
    // Update storage.subnested
    storage.subnested.alias = newAliases;
    storage.subnested.aliasNames = newAliasNames;
  }

  // Parse FROM clause untuk mendapatkan tabel
  const fromMatch = normalizedQuery.match(/\s+FROM\s+(\w+)/i);
  if (fromMatch) {
    const tableName = fromMatch[1].trim();
    if (!storage.subnested.tabelName.includes(tableName)) {
      storage.subnested.tabelName = [tableName];
    }
  }

  return storage;
}

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