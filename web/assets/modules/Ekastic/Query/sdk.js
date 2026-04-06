export async function NEXASDK(data) {
  // Kirim data lengkap ke server untuk diproses
  try {
    const Alias = data.buckets?.join.alias;
    const aggregateType = data.aggregateType;
    const arithmetic = data.arithmetic;
    console.log(data);
    const finalAlias = mergeAliasWithTransformations(
      Alias,
      arithmetic,
      aggregateType
    );
    const sqlview = {
      alias: finalAlias,
      aliasNames: data.buckets?.join.aliasNames,
      tabelName: data.buckets?.join.key,
      where: data.where?.alias || false,
      group: data.groupBy?.alias || false,
      order: data.orderBy?.alias || false,
      operasi: data.buckets?.join.operasi,
      limit: data.limit || 3,
      offset: data.offset || 0,
    };
    console.log("Final merged alias:", sqlview);
    // console.log(data)

    const server = await NXUI.Storage()
      .models("Office")
      .executeOperation(sqlview);

    console.log("Server Response:", server);
    // return server;
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message, data: data };
  }
}
export function mergeAliasWithTransformations(
  alias,
  arithmetic,
  aggregateType
) {
  if (!alias || !Array.isArray(alias)) {
    return [];
  }

  // Create a copy of the original alias array
  let mergedAlias = [...alias];

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
      mergedAlias[arithmeticIndex] = arithmetic.alias;
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
          mergedAlias[arithmeticIndex] = arith.alias;
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

  return mergedAlias;
}
