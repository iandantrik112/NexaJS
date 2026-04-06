// Function to generate SQL expression for individual operations (without AS clause)
function generateSQLExpression(field, operation) {
  // Map operations to SQL operators
  const operatorMap = {
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    MODULO: "%",
    POWER: "^",
  };

  // For operations that need special handling
  switch (operation) {
    case "SQRT":
      return `SQRT(${field})`;
    case "ROUND":
      return `ROUND(${field})`;
    case "CEIL":
      return `CEIL(${field})`;
    case "FLOOR":
      return `FLOOR(${field})`;
    case "PERCENTAGE":
      return `FORMAT(${field}, 2)`;
    case "RATIO":
      return `(${field} / 100)`;
    case "RANDOM":
      return `RAND(${field})`;
    case "ADD":
    case "SUBTRACT":
    case "MULTIPLY":
    case "DIVIDE":
    case "MODULO":
    case "POWER":
      // For basic arithmetic operations, return the field (operator will be handled in buildComplexExpression)
      return field;
    default:
      // For unknown operations, just return the field
      return field;
  }
}

// Function to build complex SQL expression from nested operations only
function buildComplexExpression(nested) {
  if (!nested || nested.length === 0) {
    return "";
  }

  // Map operations to SQL operators
  const operatorMap = {
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    MODULO: "%",
    POWER: "^",
  };

  // Build expression from nested operations only
  const expressions = nested.map((item) => {
    return generateSQLExpression(item.field, item.operation);
  });

  // Get the operator for the first operation (assuming all operations in complex are the same)
  const firstOperation = nested[0]?.operation;
  const operator = operatorMap[firstOperation] || "+";

  // Handle special operations that don't need complex joining
  if (nested.length === 1) {
    const singleOperation = nested[0];
    if (
      [
        "SQRT",
        "ROUND",
        "CEIL",
        "FLOOR",
        "PERCENTAGE",
        "RATIO",
        "RANDOM",
      ].includes(singleOperation.operation)
    ) {
      return generateSQLExpression(
        singleOperation.field,
        singleOperation.operation
      );
    }
  }

  // Join all expressions with the correct operator
  if (expressions.length === 1) {
    return expressions[0];
  } else {
    return `(${expressions.join(` ${operator} `)})`;
  }
}

// Function to convert flat complex data to nested array
function convertComplexToNestedArray(data, alias) {
  try {
    const nested = [];
    const fieldGroups = {};

    // Group data by field name
    Object.keys(data).forEach((key) => {
      if (key.startsWith("field_")) {
        const fieldName = key.replace("field_", "");
        if (!fieldGroups[fieldName]) {
          fieldGroups[fieldName] = {};
        }
        fieldGroups[fieldName].field = data[key];
      } else if (key.startsWith("type_")) {
        const fieldName = key.replace("type_", "");
        if (!fieldGroups[fieldName]) {
          fieldGroups[fieldName] = {};
        }
        fieldGroups[fieldName].operation = data[key];
      } else if (key.startsWith("priority_")) {
        const fieldName = key.replace("priority_", "");
        if (!fieldGroups[fieldName]) {
          fieldGroups[fieldName] = {};
        }
        fieldGroups[fieldName].priority = parseInt(data[key]) || 0;
      }
    });

    // Convert grouped data to nested array (no individual aliases for complex)
    Object.keys(fieldGroups).forEach((fieldName) => {
      const group = fieldGroups[fieldName];
      if (group.field && group.operation && group.priority !== undefined) {
        nested.push({
          field: group.field,
          operation: group.operation,
          priority: group.priority,
        });
      }
    });

    // Sort by priority (ascending)
    nested.sort((a, b) => a.priority - b.priority);

    return nested;
  } catch (error) {
    console.error("Complex conversion failed:", error);
    return [];
  }
}

export async function saveComplex(modalid, data, tabel) {
  try {
    console.log("saveComplex input:", data);

    // Get existing data from storage
    const dataform = await NXUI.ref.get(tabel.store, tabel.id);
    const oldArithmetic = dataform?.arithmetic || [];
    const alias = dataform.buckets?.join?.alias || [];

    console.log("Available aliases:", alias);

    // Convert flat complex data to nested array
    const nested = convertComplexToNestedArray(data, alias);
    console.log("Converted nested operations:", nested);

    // Ensure oldArithmetic is an array
    const mergedArithmetic = Array.isArray(oldArithmetic)
      ? [...oldArithmetic]
      : [];

    // Find existing alias for main field
    const mainField = data.field;
    const existingMainAlias = alias.find((aliasItem) => {
      const fieldPart = aliasItem.split(" AS ")[0].trim();
      return fieldPart === mainField;
    });

    let mainAliasName;
    if (existingMainAlias) {
      mainAliasName = existingMainAlias.split(" AS ")[1].trim();
    } else {
      const fieldParts = mainField.split(".");
      mainAliasName = fieldParts[fieldParts.length - 1];
    }

    // Build the complete complex SQL expression (only from nested operations)
    const complexExpression = buildComplexExpression(nested);
    console.log("Built complex expression:", complexExpression);

    // Create new complex arithmetic item with single alias
    const newComplexItem = {
      field: mainField,
      operation: "COMPLEX",
      nested: nested,
      alias: `${complexExpression} AS ${mainAliasName}`,
    };

    console.log("New complex item:", newComplexItem);

    // Check if field already exists
    const index = mergedArithmetic.findIndex(
      (item) => item.field === newComplexItem.field
    );

    if (index !== -1) {
      // If field exists → replace the item
      mergedArithmetic[index] = newComplexItem;
    } else {
      // If new field → push to array
      mergedArithmetic.push(newComplexItem);
    }

    // Filter out any remaining empty items before saving
    const validItems = mergedArithmetic.filter(
      (item) =>
        item.field &&
        item.field.trim() !== "" &&
        item.field !== null &&
        item.field !== undefined
    );

    // Save the arithmetic array to the database
    const makeDir = { arithmetic: validItems };
    await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

    // Close the modal
    NXUI.nexaModal.close(modalid);

    console.log("✅ Complex arithmetic saved successfully:", validItems);
  } catch (error) {
    console.error("❌ Failed to save complex arithmetic:", error);
  }
}
