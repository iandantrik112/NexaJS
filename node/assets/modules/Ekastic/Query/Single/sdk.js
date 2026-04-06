export async function NEXASDK(id) {
  // Kirim data lengkap ke server untuk diproses
  try {
    const store = new NXUI.Buckets(id);
    const data = await store.storage();
    const Alias = data.buckets?.single.alias;
    const aggregateType = data.aggregateType;
    const arithmetic = data.arithmetic;

    const finalAlias = mergeAliasWithTransformations(
      Alias,
      arithmetic,
      aggregateType
    );
    const sqlview = {
      alias: finalAlias,
      aliasNames: data.buckets?.single.aliasNames,
      tabelName: data.buckets?.single.key,
      where: data.where?.alias || false,
      group: data.groupBy?.alias || false,
      order: data.orderBy?.alias || false,
      operasi: data.buckets?.single.operasi,
      limit: 5,
      offset: 0,
    };
    await store.upIndex({
      priority: 1,
      contentID: data.type + "_" + data.id,
      applications: data.applications || false,
      buckets: {
        applications: sqlview,
      },
    });

    // const server = await NXUI.Storage()
    //   .models("Office")
    //   .executeOperation(sqlview);

    // console.log("Server Response:", server);
    // return server;
    await store.upBucket();
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
