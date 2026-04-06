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

    // Build FROM clause dari tabelName array (hilangkan duplikat)
    if (applications.tabelName && Array.isArray(applications.tabelName) && applications.tabelName.length > 0) {
        // Hilangkan duplikat dengan Set
        const uniqueTables = [...new Set(applications.tabelName)];
        query += ' FROM ' + uniqueTables.join(', ');
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
 * Parse SQL query untuk layar dan update alias serta aliasNames
 * @param {string} sqlQuery - Query SQL yang akan di-parse
 * @param {Object} currentApplications - Objek applications saat ini
 * @returns {Object} Objek applications yang sudah di-update dengan alias dan aliasNames baru
 */
export function parseSQLToLayarApplications(sqlQuery, currentApplications = {}) {
  if (!sqlQuery || typeof sqlQuery !== 'string') {
    return currentApplications;
  }

  // Normalize query: hapus whitespace berlebihan dan newlines
  const normalizedQuery = sqlQuery.replace(/\s+/g, ' ').trim();
  
  // Clone currentApplications untuk mempertahankan struktur yang ada
  const updated = {
    ...currentApplications,
    alias: [],
    aliasNames: []
  };

  // Parse SELECT clause untuk ekstrak alias
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
        
        // Format lengkap untuk alias: "table.column AS alias"
        const fullAlias = `${tableName}.${columnName} AS ${aliasName}`;
        
        // Tambahkan ke alias jika belum ada
        if (!updated.alias.includes(fullAlias)) {
          updated.alias.push(fullAlias);
        }
        
        // Tambahkan ke aliasNames jika belum ada
        if (!updated.aliasNames.includes(aliasName)) {
          updated.aliasNames.push(aliasName);
        }
      }
    });
  }

  return updated;
}