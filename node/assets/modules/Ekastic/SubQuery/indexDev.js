import { queAggregatecCustom } from "./Aggregate/index.js";
import { setWhereByCustom } from "./Where/index.js";
import { setArithmeticCustom } from "./Arithmetic/index.js";
import { queryOrderByCustom } from "./Order/index.js";
import { queryGroupByCustom } from "./Group/index.js";
import { Formula } from "./Formula/index.js";

// Utility function untuk mendeteksi dan menerapkan cursor pointer

export async function subQuery(data, custom) {
  try {
    const Sdk = new NXUI.Buckets(data.id);
    const storage = await Sdk.storage();

    // Initialize default data structure for single table operations
    if (!storage[custom].aggregateType) storage[custom].aggregateType = [];
    if (!storage[custom].arithmetic) storage.arithmetic = [];
    if (!storage[custom].where) storage[custom].where = { conditions: [] };
    if (!storage[custom].groupBy) storage[custom].groupBy = { fields: [] };
    if (!storage[custom].orderBy) storage[custom].orderBy = { fields: [] };

    NXUI.QUERY = {
      store: Sdk,
      storage: storage,
    };
    let itemHtml = "";
    let checked = "";
    storage.buckets.variablesAlias.forEach((row, index) => {
      const isValue = storage.buckets.allAlias[index];

      // Cek apakah isValue ada dalam array alias yang dipilih
      const aliasArray = storage[custom].alias || [];
      const isChecked = aliasArray.includes(isValue);
      checked = isChecked ? "checked" : "";
      itemHtml += `
        <div class="nx-switch-grid">
          <div class="nx-switch-item mb-10px pl-10px">
            <input class="condition" name="${custom}" type="checkbox" id="public_${custom}${index}" value="${isValue}" ${checked}/>
            <label for="public_${custom}${index}">
              <span class="nx-switch"></span>
              ${row}
            </label>
          </div>
        </div>
      `;
    });
    // Create badges for this function
    const aggregateType = storage[custom].aggregateType?.length || 0;
    const arithmetic = storage[custom].arithmetic?.length || 0;
    const where = storage[custom].where?.conditions?.length || 0;
    const groupBy = storage[custom].groupBy?.fields?.length || 0;
    const orderBy = storage[custom].orderBy?.fields?.length || 0;

    const badgeAggregate = aggregateType
      ? `<span class="nx-badge nx-primary nx-pill">${aggregateType}</span>`
      : ``;
    const badgeArithmetic = arithmetic
      ? `<span class="nx-badge nx-success nx-pill">${arithmetic}</span>`
      : ``;
    const badgeWhere = where
      ? `<span class="nx-badge nx-warning nx-pill">${where}</span>`
      : ``;
    const badgeGroupBy = groupBy
      ? `<span class="nx-badge nx-info nx-pill">${groupBy}</span>`
      : ``;
    const badgeOrderBy = orderBy
      ? `<span class="nx-badge nx-danger nx-pill">${orderBy}</span>`
      : ``;
    return {
      title: "Index Tabel " + storage.tableName,
      col: "nx-col-8",
      footer: `
    <small class="text-muted">${storage.app} Operation</small>

  <small class="text-muted align-right">
   <button onclick="subBucket('${data?.id}','${custom}');" class="nx-btn-primary custom-size-sm">Update Bucket</button>
  </small>

    `,
      html: `
     <div class="nx-row" style="margin-bottom:2px;margin-top: 16px;">
                 <div class="nx-col-4">
                  <button onclick="addAggregatecCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">functions</span>
                     &nbsp;Aggregatec ${badgeAggregate} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="addArithmeticCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">calculate</span>
                     &nbsp;Arithmetic ${badgeArithmetic} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getWhereByCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">filter_list</span>
                     &nbsp;Where ${badgeWhere} 
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getGroupCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">group_work</span>
                     &nbsp;Group ${badgeGroupBy}
                  </button>
                 </div>
                 <div class="nx-col-4">
                  <button onclick="getOrderByCustom('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">sort</span>
                   &nbsp;Order ${badgeOrderBy} 
                  </button>
                </div>
                 <div class="nx-col-4">
                  <button onclick="setAttrQuery('${data?.id}','${data?.store}','${custom}');" type="button" class="nx-btn-secondary-light full-width">
                    <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 8px;">total_dissolved_solids</span>
                   &nbsp;Formula 
                  </button>
                </div>
                 </div>
        <ul class="nx-list-group">
        <li class="nx-list-item d-flex justify-content-between align-items-center">
          <strong><span class="material-symbols-outlined nx-icon-md">database</span> ${storage.tableName}</strong>
        </li>
         </ul>

   <div class="nx-scroll-hidden" style="height:300px; padding-top:20px">
     ${itemHtml}
     </div>
 

         `,
    };
  } catch (error) {
    console.error("❌ Error in singleOperasi:", error);
    return {
      title: "Error",
      col: "nx-col-8",
      footer: `<small class="text-danger">Error: ${error.message}</small>`,
      html: `<div class="alert alert-danger">Failed to initialize single operation: ${error.message}</div>`,
    };
  }
}

export async function renderingCustom(store) {
  // Ambil data storage terbaru
  // Refresh tampilan form menggunakan NexaRender dengan container selector
  // await NXUI.NexaRender.refresh(store, singleOperasi, {
  //   containerSelector: ["#sdksingleOperasi"],
  // });
}

export function aliasOrigin(data, tableName) {
  const result = data.map((item) => {
    const dotted = tableName + "." + item;
    return dotted;
  });

  return result;
}
export function failedOrigin(data, tableName) {
  const result = data.map((item) => {
    const dotted = tableName + "-" + item;
    return dotted;
  });

  return result;
}
export function variablesAS(tableName, data) {
  const aliasCount = {}; // Untuk tracking alias yang sudah digunakan
  const result = data.map((item) => {
    const dotted = item.replace("-", ".");
    let alias = item && item.includes("-") ? item.split("-")[1] : item; // Ambil bagian setelah "-"

    // Cek jika alias sudah ada, buat unik dengan menambah counter
    if (aliasCount[alias]) {
      aliasCount[alias]++;
      alias = `${alias}${aliasCount[alias]}`;
    } else {
      aliasCount[alias] = 1;
    }

    return `${tableName}.${alias}`;
  });

  return result;
}
export function alias(data) {
  const aliasCount = {}; // Untuk tracking alias yang sudah digunakan
  const result = data.map((item) => {
    // Extract the field name after the last dot (e.g., "Exsampel.nama" -> "nama")
    let alias = item.split(".").pop();

    // Cek jika alias sudah ada, buat unik dengan menambah counter
    if (aliasCount[alias]) {
      aliasCount[alias]++;
      alias = `${alias}${aliasCount[alias]}`;
    } else {
      aliasCount[alias] = 1;
    }

    return `${item} AS ${alias}`;
  });

  return result;
}
nx.subBucket = async function (id, castem) {
  const store = NXUI.QUERY.store;
  const storage = await store.storage();

  await cleanup(id, castem);
  // await renderingCustom(storage);
};

export async function cleanup(id, castem) {
  const store = new NXUI.Buckets(id);
  const sanitized = await store.storage();
  const data = sanitized.applications;
  const dataCastem = sanitized[castem];
  const Alias = data.buckets?.single.alias;
  const aggregateType = dataCastem.aggregateType;
  console.log("aggregateType", aggregateType);
  const arithmetic = dataCastem.arithmetic;
  console.log("arithmetic", arithmetic);

  const finalAlias = mergeAliasWithTransformations(
    dataCastem.alias,
    arithmetic,
    aggregateType,
    dataCastem.groupBy?.alias || ""
  );
  console.log("Final Alias after transformation:", finalAlias);
  console.log("Original alias before transformation:", dataCastem.alias);
  const asNames = dataCastem.variablesAlias.map((item) => item.split(".")[1]);
  const sqlview = {
    alias: finalAlias,
    aliasNames: asNames,
    tabelName: data.tabelName,
    where: dataCastem.where?.alias || false,
    group: dataCastem.groupBy?.alias || false,
    order: dataCastem.orderBy?.alias || false,
    operasi: data.operasi,
    // Untuk analitik, tidak perlu LIMIT agar mendapat data lengkap
    analytical: true, // Mode analitik untuk data lengkap
    // limit: 13, // Dikomentari untuk analitik
    // offset: 0, // Dikomentari untuk analitik
  };
  console.log(sqlview);
  await store.upIndex({
    [castem]: {
      ...dataCastem,
      applications: sqlview,
    },
  });

  const server = await NXUI.Storage().models("Office").executeAnalysis(sqlview);
  console.log(server);

  // await NEXASDK(id);
}
export function mergeAliasWithTransformations(
  alias,
  arithmetic,
  aggregateType,
  groupByClause = ""
) {
  if (!alias || !Array.isArray(alias)) {
    return [];
  }

  // Create a copy of the original alias array
  let mergedAlias = [...alias];

  // Check if we have GROUP BY (indicated by aggregateType presence)
  const hasGroupBy =
    aggregateType && Array.isArray(aggregateType) && aggregateType.length > 0;

  // Handle arithmetic as object
  if (
    arithmetic &&
    !Array.isArray(arithmetic) &&
    arithmetic.field &&
    arithmetic.alias
  ) {
    const arithmeticField = arithmetic.field;

    // Find and replace the matching field in alias array
    const arithmeticIndex = mergedAlias.findIndex((item) => {
      // Extract field name from "field AS alias" format
      const fieldMatch = item.match(/^([^\s]+)/);
      return fieldMatch && fieldMatch[1] === arithmeticField;
    });

    if (arithmeticIndex !== -1) {
      // If we have GROUP BY, wrap arithmetic with SUM function
      if (hasGroupBy) {
        const arithmeticExpression = arithmetic.alias;

        // Special handling for COMPLEX arithmetic
        if (arithmetic.operation === "COMPLEX") {
          const wrappedArithmetic = wrapComplexArithmeticWithAggregate(
            arithmeticExpression,
            arithmeticField,
            aggregateType
          );
          mergedAlias[arithmeticIndex] = wrappedArithmetic;
        } else {
          // Extract the arithmetic expression and wrap it with appropriate aggregate function
          const wrappedArithmetic = wrapArithmeticWithAggregate(
            arithmeticExpression,
            arithmeticField,
            aggregateType
          );
          mergedAlias[arithmeticIndex] = wrappedArithmetic;
        }
      } else {
        mergedAlias[arithmeticIndex] = arithmetic.alias;
      }
    }
  }

  // Handle arithmetic as array (similar to aggregateType)
  if (arithmetic && Array.isArray(arithmetic)) {
    arithmetic.forEach((arith) => {
      if (arith.field && arith.alias) {
        const arithmeticField = arith.field;

        // Find and replace the matching field in alias array
        const arithmeticIndex = mergedAlias.findIndex((item) => {
          // Extract field name from "field AS alias" format
          const fieldMatch = item.match(/^([^\s]+)/);
          return fieldMatch && fieldMatch[1] === arithmeticField;
        });

        if (arithmeticIndex !== -1) {
          // If we have GROUP BY, wrap arithmetic with SUM function
          if (hasGroupBy) {
            const arithmeticExpression = arith.alias;

            // Special handling for COMPLEX arithmetic
            if (arith.operation === "COMPLEX") {
              const wrappedArithmetic = wrapComplexArithmeticWithAggregate(
                arithmeticExpression,
                arithmeticField,
                aggregateType
              );
              mergedAlias[arithmeticIndex] = wrappedArithmetic;
            } else {
              // Extract the arithmetic expression and wrap it with appropriate aggregate function
              const wrappedArithmetic = wrapArithmeticWithAggregate(
                arithmeticExpression,
                arithmeticField,
                aggregateType
              );
              mergedAlias[arithmeticIndex] = wrappedArithmetic;
            }
          } else {
            mergedAlias[arithmeticIndex] = arith.alias;
          }
        }
      }
    });
  }

  // Handle aggregateType transformations
  if (aggregateType && Array.isArray(aggregateType)) {
    aggregateType.forEach((agg) => {
      if (agg.field && agg.alias) {
        const aggField = agg.field;

        // Find and replace the matching field in alias array
        const aggIndex = mergedAlias.findIndex((item) => {
          // Extract field name from "field AS alias" format
          const fieldMatch = item.match(/^([^\s]+)/);
          return fieldMatch && fieldMatch[1] === aggField;
        });

        if (aggIndex !== -1) {
          mergedAlias[aggIndex] = agg.alias;
        }
      }
    });
  }

  // Auto-add SUM to fields that don't have aggregate functions when GROUP BY is present
  // But only if they are not already handled by arithmetic or aggregateType
  if (hasGroupBy) {
    mergedAlias = mergedAlias.map((aliasItem) => {
      // Check if the field already has an aggregate function
      const hasAggregateFunction =
        /^(SUM|COUNT|AVG|MIN|MAX|STDDEV|VARIANCE|FIRST|LAST|FORMAT|ROUND|CEIL|FLOOR|ABS|SQRT|POW|MOD|TRUNCATE|GREATEST|LEAST)\s*\(/i.test(
          aliasItem.trim()
        );

      if (!hasAggregateFunction) {
        // Extract field and alias parts
        const parts = aliasItem.split(" AS ");
        if (parts.length === 2) {
          const field = parts[0].trim();
          const alias = parts[1].trim();

          // Skip GROUP BY fields (they shouldn't have aggregate functions)
          const isGroupByField =
            groupByClause.includes(field) ||
            (aggregateType &&
              aggregateType.some(
                (agg) => agg.field === field || agg.alias.includes(field)
              ));

          // Skip fields that are already handled by arithmetic transformations
          const isArithmeticField =
            (arithmetic &&
              Array.isArray(arithmetic) &&
              arithmetic.some((arith) => arith.field === field)) ||
            (arithmetic &&
              !Array.isArray(arithmetic) &&
              arithmetic.field === field);

          // Skip fields that are used in any arithmetic expression (even if not directly handled)
          const isUsedInArithmetic =
            (arithmetic &&
              Array.isArray(arithmetic) &&
              arithmetic.some(
                (arith) =>
                  arith.alias &&
                  (arith.alias.includes(field) ||
                    arith.alias.includes(`SUM(${field})`) ||
                    arith.alias.includes(`COUNT(${field})`) ||
                    arith.alias.includes(`AVG(${field})`) ||
                    arith.alias.includes(`MAX(${field})`) ||
                    arith.alias.includes(`MIN(${field})`) ||
                    arith.alias.includes(`STDDEV(${field})`) ||
                    arith.alias.includes(`VARIANCE(${field})`) ||
                    arith.alias.includes(`FIRST(${field})`) ||
                    arith.alias.includes(`LAST(${field})`))
              )) ||
            (arithmetic &&
              !Array.isArray(arithmetic) &&
              arithmetic.alias &&
              (arithmetic.alias.includes(field) ||
                arithmetic.alias.includes(`SUM(${field})`) ||
                arithmetic.alias.includes(`COUNT(${field})`) ||
                arithmetic.alias.includes(`AVG(${field})`) ||
                arithmetic.alias.includes(`MAX(${field})`) ||
                arithmetic.alias.includes(`MIN(${field})`) ||
                arithmetic.alias.includes(`STDDEV(${field})`) ||
                arithmetic.alias.includes(`VARIANCE(${field})`) ||
                arithmetic.alias.includes(`FIRST(${field})`) ||
                arithmetic.alias.includes(`LAST(${field})`)));

          // Additional check: Skip fields that are used in any alias in the mergedAlias array
          const isUsedInAnyAlias = mergedAlias.some(
            (aliasItem) =>
              aliasItem.includes(field) && !aliasItem.startsWith(`${field} AS`) // Don't match the field itself
          );

          if (
            !isGroupByField &&
            !isArithmeticField &&
            !isUsedInArithmetic &&
            !isUsedInAnyAlias
          ) {
            // Only auto-add SUM for simple field references, not complex expressions
            if (
              !field.includes("(") &&
              !field.includes("*") &&
              !field.includes("/") &&
              !field.includes("+") &&
              !field.includes("-") &&
              !field.includes(" ")
            ) {
              return `SUM(${field}) AS ${alias}`;
            }
          }
        }
      }

      return aliasItem;
    });
  }

  return mergedAlias;
}

/**
 * Helper function to determine the appropriate aggregate function for arithmetic expressions
 * @param {string} fieldName - The field name to check
 * @param {Array} aggregateType - Array of aggregate configurations
 * @returns {string} - The appropriate aggregate function (default: SUM)
 */
function getAggregateFunctionForField(fieldName, aggregateType) {
  if (!aggregateType || !Array.isArray(aggregateType)) {
    return "SUM"; // Default to SUM
  }

  // Look for a matching aggregate function for this field
  const matchingAggregate = aggregateType.find(
    (agg) => agg.field === fieldName
  );

  if (matchingAggregate && matchingAggregate.type) {
    return matchingAggregate.type;
  }

  return "SUM"; // Default to SUM if no specific aggregate found
}

/**
 * Helper function to wrap arithmetic expressions with appropriate aggregate function for GROUP BY queries
 * @param {string} arithmeticExpression - The arithmetic expression (e.g., "(Exsampel.title * Exsampel.deskripsi) AS categori")
 * @param {string} fieldName - The field name for fallback alias
 * @param {Array} aggregateType - Array of aggregate configurations
 * @returns {string} - The wrapped expression with appropriate aggregate function
 */
function wrapArithmeticWithAggregate(
  arithmeticExpression,
  fieldName,
  aggregateType
) {
  console.log("wrapArithmeticWithAggregate input:", {
    arithmeticExpression,
    fieldName,
    aggregateType,
  });

  // Extract the expression part and alias part
  const parts = arithmeticExpression.split(" AS ");
  const expression = parts[0];
  const alias = parts[1] || fieldName;

  // Check if the expression already has aggregate functions
  const hasAggregateFunction =
    /^(SUM|COUNT|AVG|MIN|MAX|STDDEV|VARIANCE|FIRST|LAST|FORMAT|ROUND|CEIL|FLOOR|ABS|SQRT|POW|MOD|TRUNCATE|GREATEST|LEAST)\s*\(/i.test(
      expression.trim()
    );

  // If expression already has aggregate function, return as is
  if (hasAggregateFunction) {
    console.log(
      "wrapArithmeticWithAggregate: Expression already has aggregate function, returning as is"
    );
    return arithmeticExpression;
  }

  // Determine the appropriate aggregate function
  const aggregateFunction = getAggregateFunctionForField(
    fieldName,
    aggregateType
  );

  // If expression is already wrapped in parentheses, extract the inner expression
  let innerExpression = expression;
  if (expression.startsWith("(") && expression.endsWith(")")) {
    innerExpression = expression.slice(1, -1);
  }

  // Wrap the inner expression with the appropriate aggregate function
  const result = `${aggregateFunction}(${innerExpression}) AS ${alias}`;
  console.log("wrapArithmeticWithAggregate output:", result);

  return result;
}

/**
 * Helper function to wrap complex arithmetic expressions with appropriate aggregate function for GROUP BY queries
 * @param {string} complexExpression - The complex arithmetic expression
 * @param {string} fieldName - The field name for fallback alias
 * @param {Array} aggregateType - Array of aggregate configurations
 * @returns {string} - The wrapped expression with appropriate aggregate function
 */
function wrapComplexArithmeticWithAggregate(
  complexExpression,
  fieldName,
  aggregateType
) {
  console.log("wrapComplexArithmeticWithAggregate input:", {
    complexExpression,
    fieldName,
    aggregateType,
  });

  // Extract the expression part and alias part
  const parts = complexExpression.split(" AS ");
  const expression = parts[0];
  const alias = parts[1] || fieldName;

  // Check if the expression already has aggregate functions
  const hasAggregateFunction =
    /^(SUM|COUNT|AVG|MIN|MAX|STDDEV|VARIANCE|FIRST|LAST|FORMAT|ROUND|CEIL|FLOOR|ABS|SQRT|POW|MOD|TRUNCATE|GREATEST|LEAST)\s*\(/i.test(
      expression.trim()
    );

  // If expression already has aggregate function, return as is
  if (hasAggregateFunction) {
    console.log(
      "wrapComplexArithmeticWithAggregate: Expression already has aggregate function, returning as is"
    );
    return complexExpression;
  }

  // Determine the appropriate aggregate function
  const aggregateFunction = getAggregateFunctionForField(
    fieldName,
    aggregateType
  );

  // For complex expressions, we need to wrap the entire expression with the appropriate aggregate function
  // Complex expressions are already properly formatted with parentheses
  const result = `${aggregateFunction}(${expression}) AS ${alias}`;
  console.log("wrapComplexArithmeticWithAggregate output:", result);

  return result;
}

/**
 * Mengatur inline editing untuk tabel field dalam form SDK
 * Memungkinkan pengguna untuk mengedit field secara langsung di tabel dengan callback save
 *
 * @param {Object} store - Instance Buckets untuk mengakses dan update data form
 * @returns {Promise<void>}
 */
export async function tabelEdit() {
  try {
    // Inisialisasi NexaField untuk inline editing
    const nexaField = new NXUI.Field();
    const store = NXUI.QUERY.store;
    const storage = await store.storage();

    // Set callback untuk menangani perubahan data saat inline editing
    nexaField.onSaveCallback(
      async (variable, newValue, element, type, fieldName) => {
        console.log(variable, newValue);
        // For single table operations, we can handle field updates here
        await renderingCustom(storage);
      }
    );

    // Inisialisasi semua elemen yang dapat diedit inline
    nexaField.initElements();
  } catch (error) {
    console.error("❌ Error renderingCustom form:", error);
  }
}

nx.addAggregatecCustom = async function (id, store, castem) {
  try {
    // Inisialisasi dengan auto mode (tanpa parameter store)
    return await queAggregatecCustom(id, store, castem);
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
};

nx.addArithmeticCustom = function (id, storage, custom) {
  return setArithmeticCustom(id, storage, custom);
};

nx.getWhereByCustom = function (id, storage, custom) {
  return setWhereByCustom(id, storage, custom);
};
nx.getOrderByCustom = function (id, storage, custom) {
  return queryOrderByCustom(id, storage, custom);
};
nx.getGroupCustom = function (id, storage, custom) {
  return queryGroupByCustom(id, storage, custom);
};
nx.setAttrQuery = function (id, storage, custom) {
  return Formula(id, storage, custom);
};
