
/**
 * Dynamic StorageData function - dapat digunakan sebagai dataLoader default
 */
export async function StorageData(
    limit=10, 
    offset=0, 
    searchKeyword='', 
    searchFields=[], 
    filterValue='', 
    filterField='', 
    sortBy='id', 
    sortOrder='DESC', 
    queryConfig={}
    ) {
    // Config harus disediakan dari caller
    if (!queryConfig.alias || !queryConfig.operasi) {
        throw new Error('StorageData requires complete queryConfig with alias and operasi');
    }
    // console.log('filterField:', filterField);
    // Clone config untuk tidak mengubah original
    const app = {
        "alias": [...queryConfig.alias],
        "aliasNames": [...queryConfig.aliasNames],
        "tabelName": [...queryConfig.tabelName],
        "where": queryConfig.where || false,
        "group": queryConfig.group || false,
        "order": queryConfig.order || false, // Will be overridden if sorting needed
        "userid": queryConfig.userid || false, // Will be overridden if sorting needed
        "operasi": { ...queryConfig.operasi },
        "limit": limit,
        "offset": offset,
        "access": queryConfig.access || "public",
        "subquery": queryConfig.subquery || "",
        "subnested": queryConfig.subnested || ""
    };
    
    // Set dynamic order jika diperlukan
    if (sortBy && sortOrder) {
        // Ambil table alias dari operasi pertama
        const firstTable = Object.keys(app.operasi)[0];
        app.order = `${firstTable}.${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Build WHERE conditions
    const conditions = [];
    
    // Tambahkan kondisi search jika ada keyword
    if (searchKeyword && searchFields.length > 0) {
        const searchConditions = searchFields.map(field => {
            // Cari field di alias array
            const aliasEntry = queryConfig.alias.find(alias => alias.includes(`AS ${field}`));
            let column = field; // fallback
            
            if (aliasEntry) {
                // Extract column name dari alias (contoh: "user.nama AS nama" -> "user.nama")
                const columnMatch = aliasEntry.match(/^(.+?)\s+AS\s+/i);
                if (columnMatch) {
                    column = columnMatch[1];
                }
            }
            
            return `${column} LIKE '%${searchKeyword}%'`;
        }).join(' OR ');
        
        conditions.push(`(${searchConditions})`);
    }
    
    // Tambahkan kondisi filter jika ada
    if (filterValue && filterField) {
        // Sama seperti search, gunakan alias array untuk mencari column name yang benar
        const aliasEntry = queryConfig.alias.find(alias => alias.includes(`AS ${filterField}`));
        let column = filterField; // fallback
        
        if (aliasEntry) {
            const columnMatch = aliasEntry.match(/^(.+?)\s+AS\s+/i);
            if (columnMatch) {
                column = columnMatch[1];
            }
        }
        
        const filterCondition = `${column} = '${filterValue}'`;
        conditions.push(filterCondition);
    }
    
    // Set WHERE clause - gabungkan dengan existing WHERE dari config
    let finalWhere = [];
    
    // Tambahkan existing WHERE dari config jika ada
    if (queryConfig.where && queryConfig.where !== false) {
        finalWhere.push(`(${queryConfig.where})`);
    }
    
    // Tambahkan search/filter conditions
    if (conditions.length > 0) {
        finalWhere.push(conditions.join(' AND '));
    }
    
    // Set final WHERE clause
    if (finalWhere.length > 0) {
        app.where = finalWhere.join(' AND ');
    }
   
     return app;
}

export  function withTerritory(appConfig, territoryData) {
    let whereClause = "";
    const aslis = appConfig.tabelName[0];
    // Check if original WHERE clause exists and is not false
    if (appConfig.where && appConfig.where !== false) {
        whereClause = appConfig.where; // Keep original WHERE clause
    }
    
    // Add territory conditions
    if (territoryData.kecamatan) {
        if (whereClause) {
            whereClause += ` AND ${aslis}.kecamatan = '${territoryData.kecamatan}'`;
        } else {
            whereClause = `${aslis}.kecamatan = '${territoryData.kecamatan}'`;
        }
    }
    
    if (territoryData.desa) {
        if (whereClause) {
            whereClause += ` AND ${aslis}.desa = '${territoryData.desa}'`;
        } else {
            whereClause = `${aslis}.desa = '${territoryData.desa}'`;
        }
    }
    
    // Update the app configuration
    appConfig.where = whereClause;
    appConfig.access = "public"; // Change access to public
    
    return appConfig;
}
