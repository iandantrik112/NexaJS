/**
 * Merge alias with transformations for GROUP BY queries
 * Handles arithmetic expressions and aggregate functions properly
 */
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

  return result;
}
