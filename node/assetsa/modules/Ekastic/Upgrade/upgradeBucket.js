
export async function upgradeBucket(data) {
const Sdk = new NXUI.Buckets(data.id);
const storage = await Sdk.storage();
const single = storage.buckets?.single || {};
const join = storage.buckets?.join || {};
console.log('label:', storage);
	
	// Check if applications.alias has null values that need to be fixed
	const currentApplicationsAlias = storage.applications?.alias;
	const hasNullAlias = Array.isArray(currentApplicationsAlias) && 
		currentApplicationsAlias.some(item => item === null || item === undefined);
	
	// Check if form is already reordered (id should be at the end)
	const formKeys = Object.keys(storage.form || {});
	const isFormReordered = formKeys.length === 0 || formKeys[formKeys.length - 1] === 'id';
	
	// Check if variables are already reordered (id should be at the end)
	const variablesArray = storage.variables || [];
	const isVariablesReordered = variablesArray.length === 0 || variablesArray[variablesArray.length - 1] === 'id';
	
	// If upgrade is already done, alias is valid, form is reordered, and variables are reordered, just return
	if (storage.buckets?.upgrade && !hasNullAlias && isFormReordered && isVariablesReordered) {
     return `<div class="upgrade-check"><i class="fas fa-info-circle"></i> Paket sudah dalam versi terbaru dan tidak perlu diupgrade</div>`;
  }
	
		    const transformedAlias = single.alias && Array.isArray(single.alias) 
		        ? single.alias.map(alias => 
		            typeof alias === 'string' 
		                ? alias.replace(/\./g, '-').replace(/\s+AS\s+/i, '-') 
		                : alias
		        )
		        : single.alias;
		    
	// Check if single.alias or applications.alias is null/undefined or an array with all null values
	let aliasValue;
	
	// First check applications.alias if it has all null values
	if (Array.isArray(currentApplicationsAlias)) {
		const hasValidAppAlias = currentApplicationsAlias.some(item => item !== null && item !== undefined);
		if (!hasValidAppAlias) {
			// applications.alias has all null, use allAlias
			aliasValue = storage.buckets?.allAlias;
		}
	}
	
	// If aliasValue not set yet, check single.alias
	if (!aliasValue) {
		if (!single.alias) {
			// If single.alias is null or undefined, use allAlias
			aliasValue = storage.buckets?.allAlias;
		} else if (Array.isArray(single.alias)) {
			// Check if array is empty or all values are null/undefined
			const hasValidValue = single.alias.some(item => item !== null && item !== undefined);
			if (!hasValidValue) {
				aliasValue = storage.buckets?.allAlias;
			} else {
				aliasValue = single.alias;
			}
		} else {
			// If single.alias exists and is not an array, use it
			aliasValue = single.alias;
		}
	}
	
	// Use aliasNames from single or variables, or extract from aliasValue
	let aliasNames = storage.buckets?.single?.aliasNames || 
		storage.buckets?.variables || 
		storage.applications?.aliasNames || [];
	
	// If aliasNames doesn't match aliasValue length, extract from aliasValue
	if (Array.isArray(aliasValue) && aliasNames.length !== aliasValue.length) {
		aliasNames = aliasValue.map(alias => {
			if (typeof alias === 'string') {
				// Extract name after "AS"
				const asMatch = alias.match(/\s+AS\s+(\w+)$/i);
				if (asMatch) return asMatch[1];
				// If no AS, use last part after dot
				const parts = alias.split('.');
				return parts[parts.length - 1].trim();
			}
			return alias;
		});
	}
	
	// Generate form and merge with existing form
	const newForm = generateExtract(storage.variables,storage.tableName,storage.key,storage.form || {});
	
	// First, remove 'id' from both forms to handle it separately
	const existingFormWithoutId = {};
	const existingFormId = {};
	if (storage.form) {
		for (const [key, value] of Object.entries(storage.form)) {
			if (key === 'id') {
				existingFormId[key] = value;
			} else {
				existingFormWithoutId[key] = value;
			}
		}
	}
	
	const newFormWithoutId = {};
	const newFormId = {};
	for (const [key, value] of Object.entries(newForm)) {
		if (key === 'id') {
			newFormId[key] = value;
		} else {
			newFormWithoutId[key] = value;
		}
	}
	
	// Merge forms without id first, then add id at the end
	const mergedForm = {
		...existingFormWithoutId,
		...newFormWithoutId,
		...(Object.keys(existingFormId).length > 0 ? existingFormId : newFormId)
	};
	
	// Reorder form to move 'id' field to the end (guaranteed to work)
	const reorderedForm = reorderFormFields(mergedForm);
	
	// Get the ordered field names from reordered form
	const orderedFieldNames = Object.keys(reorderedForm);
	
	// Reorder aliasNames to match form order
	const reorderedAliasNames = reorderArrayByFields(aliasNames, orderedFieldNames);
	
	// Merge with existing applications to preserve other fields
	const updatedApplications = {
		...(storage.applications || {}),
		alias: aliasValue,
		aliasNames: reorderedAliasNames
	};
	
	// Reorder variables arrays based on form order
	const reorderedVariables = reorderArrayByFields(storage.variables || [], orderedFieldNames);
	const reorderedVariablesOrigin = reorderArrayByFieldsPattern(
		storage.variablesOrigin || [], 
		orderedFieldNames, 
		storage.tableName || ''
	);
	const reorderedVariablesAlias = reorderArrayByFieldsPattern(
		storage.buckets?.variablesAlias || storage.variablesOrigin || [], 
		orderedFieldNames, 
		storage.tableName || ''
	);
	const reorderedFailed = reorderArrayByFieldsPattern(
		single.failed || storage.buckets?.failed || [], 
		orderedFieldNames, 
		storage.tableName || '',
		true // use hyphen format
	);
	const reorderedSingleAlias = reorderArrayByFieldsPattern(
		single.alias || [], 
		orderedFieldNames, 
		storage.tableName || '',
		false,
		true // is alias format with AS
	);
	
	// Reorder alias in applications too
	const reorderedApplicationsAlias = reorderArrayByFieldsPattern(
		aliasValue || [], 
		orderedFieldNames, 
		storage.tableName || '',
		false,
		true // is alias format with AS
	);
	
	// Update applications with reordered alias and aliasNames
	if (reorderedApplicationsAlias.length > 0) {
		updatedApplications.alias = reorderedApplicationsAlias;
		// Also update aliasNames to match the reordered alias
		updatedApplications.aliasNames = reorderedApplicationsAlias.map(alias => {
			if (typeof alias === 'string') {
				const asMatch = alias.match(/\s+AS\s+(\w+)$/i);
				if (asMatch) return asMatch[1];
				const parts = alias.split('.');
				return parts[parts.length - 1].trim();
			}
			return alias;
		});
	}
	
	// Reorder failedNames if exists (format: "table.field")
	const reorderedFailedNames = single.failedNames ? reorderArrayByFieldsPattern(
		single.failedNames || [], 
		orderedFieldNames, 
		storage.tableName || ''
	) : undefined;
	
	// Prepare single object with reordered data
	const reorderedSingle = {
		...(single || {}),
		alias: reorderedSingleAlias.length > 0 ? reorderedSingleAlias : (single.alias || []),
		aliasNames: reorderedAliasNames,
		failed: reorderedFailed,
		failedNames: reorderedFailedNames || single.failedNames,
		key: single.key,
		operasi: single.operasi
	};
	
	const updateData = {
		applications: updatedApplications,
		form: reorderedForm,
		variables: reorderedVariables,
		variablesOrigin: reorderedVariablesOrigin,
		      buckets: {
			upgrade: true,
		          key: single.key, 
		          operasi: single.operasi,
			allAlias: reorderedSingleAlias.length > 0 ? reorderedSingleAlias : (single.alias || storage.buckets?.allAlias),
			failedAlias: transformedAlias,
			failed: reorderedFailed,
			variables: reorderedVariables,
			variablesAlias: reorderedVariablesAlias,
			single: reorderedSingle,
		},
	};
	
	await Sdk.upIndex(updateData);
 
	return `<div class="upgrade-success"><i class="fas fa-check-circle"></i> <strong>Berhasil!</strong> Paket telah diupgrade ke versi terbaru</div>`;
}

/**
 * Reorder form fields to move 'id' field to the end
 * @param {Object} form - Form object with field definitions
 * @returns {Object} Reordered form object with 'id' at the end
 */
function reorderFormFields(form) {
	if (!form || typeof form !== 'object') return form;
	
	// Check if form has 'id' field
	if (!('id' in form)) {
		return form; // No id field, return as is
	}
	
	// Separate id field from other fields
	const idValue = form.id;
	const reordered = {};
	
	// Add all fields except 'id' first
	for (const [key, value] of Object.entries(form)) {
		if (key !== 'id') {
			reordered[key] = value;
		}
	}
	
	// Always add 'id' at the end
	reordered.id = idValue;
	
	return reordered;
}

/**
 * Reorder array based on field names order (for simple arrays like variables)
 * @param {Array} array - Array to reorder
 * @param {Array} orderedFieldNames - Ordered field names from form
 * @returns {Array} Reordered array
 */
function reorderArrayByFields(array, orderedFieldNames) {
	if (!Array.isArray(array) || !Array.isArray(orderedFieldNames)) return array;
	
	const result = [];
	const arrayMap = new Map(array.map(item => [item, item]));
	
	// Add items in order based on orderedFieldNames
	orderedFieldNames.forEach(fieldName => {
		if (arrayMap.has(fieldName)) {
			result.push(fieldName);
			arrayMap.delete(fieldName);
		}
	});
	
	// Add remaining items that weren't in orderedFieldNames
	arrayMap.forEach(value => result.push(value));
	
	return result;
}

/**
 * Reorder array based on field names pattern (for arrays like variablesOrigin, failed, alias)
 * @param {Array} array - Array to reorder
 * @param {Array} orderedFieldNames - Ordered field names from form
 * @param {String} tableName - Table name prefix
 * @param {Boolean} useHyphen - Use hyphen format (e.g., "table-field") instead of dot
 * @param {Boolean} isAliasFormat - Is alias format with AS clause
 * @returns {Array} Reordered array
 */
function reorderArrayByFieldsPattern(array, orderedFieldNames, tableName = '', useHyphen = false, isAliasFormat = false) {
	if (!Array.isArray(array) || !Array.isArray(orderedFieldNames)) return array;
	
	const result = [];
	const arrayMap = new Map();
	
	// Create a map of field name to array item
	array.forEach(item => {
		if (typeof item === 'string') {
			let fieldName = '';
			
			if (isAliasFormat) {
				// Extract field name from alias format: "table.field AS field" or "table.field"
				const asMatch = item.match(/\s+AS\s+(\w+)$/i);
				if (asMatch) {
					fieldName = asMatch[1];
				} else {
					const parts = item.split('.');
					fieldName = parts[parts.length - 1].trim();
				}
			} else if (useHyphen) {
				// Extract from hyphen format: "table-field"
				const parts = item.split('-');
				fieldName = parts[parts.length - 1];
			} else {
				// Extract from dot format: "table.field"
				const parts = item.split('.');
				fieldName = parts[parts.length - 1];
			}
			
			if (fieldName && !arrayMap.has(fieldName)) {
				arrayMap.set(fieldName, []);
			}
			if (fieldName) {
				arrayMap.get(fieldName).push(item);
			}
		}
	});
	
	// Add items in order based on orderedFieldNames
	orderedFieldNames.forEach(fieldName => {
		if (arrayMap.has(fieldName)) {
			result.push(...arrayMap.get(fieldName));
			arrayMap.delete(fieldName);
		}
	});
	
	// Add remaining items that weren't in orderedFieldNames
	arrayMap.forEach(values => result.push(...values));
	
	return result;
}

export function generateExtract(variables,tabel,setKeyTabel,existingForm = {}) {
  const timestamp = new Date().toISOString(); // waktu sekarang
  const extrak = {};
  variables.forEach(name => {
    // Hanya tambahkan field baru jika belum ada di form yang sudah ada
    if (!existingForm[name]) {
      extrak[name] = {
        type: "text",
        icons: "attach_file",
        columnWidth: "nx-col-12",
        name: name,
        key: Number(setKeyTabel),
        failedtabel:tabel+"."+name,
        failed: name,
        failedAs: `${tabel}.${name} AS ${name}`, // ✅ Add SQL alias format
        fieldAlias: name,
        placeholder: name,
        validation: "2",
        timestamp: timestamp,
        control:'',
        value: false,
        hidden: false,
        readonly: false,
        tabel: false,
        condition: false,
        modal: false,
        search: false,
        filtering: false,
        inline: false,
        select: false,
      };
    }
  });
  return extrak;
}