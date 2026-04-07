export async function keyHas(setmetadata) {
  const dataform =setmetadata;
  const metadata = await NXUI.Storage().models("Office").tablesMeta();
  // Check if metadata.data exists and is an array, or if it's in metadata.data.store
  let metadataArray = [];
  if (metadata && metadata.data) {
    if (Array.isArray(metadata.data)) {
      metadataArray = metadata.data;
    } else if (metadata.data.store && Array.isArray(metadata.data.store)) {
      metadataArray = metadata.data.store;
    }
  }
  const selectedMetadata = metadataArray.find(
    (item) => item.alis === dataform.tableName
  );

  // Replace all occurrences of dataform.key with selectedMetadata.index
  let updatedDataform = replaceValueInObject(
    dataform,
    dataform.key,
    selectedMetadata?.index || dataform.key
  );
  // Update all timestamp fields
 return updateTimestampFields(updatedDataform);
}



  // Function to update timestamp fields
  export function updateTimestampFields(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        return obj.map((item) => updateTimestampFields(item));
      } else {
        const newObj = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            // Check if key contains timestamp-related keywords
            if (
              key.toLowerCase().includes("timestamp") ||
              key.toLowerCase().includes("createdat") ||
              key.toLowerCase().includes("created_at") ||
              key.toLowerCase().includes("updatedat") ||
              key.toLowerCase().includes("updated_at") ||
              key.toLowerCase().includes("date") ||
              key.toLowerCase().includes("time")
            ) {
              // Update with current timestamp
              newObj[key] = new Date().toISOString();
            } else {
              newObj[key] = updateTimestampFields(obj[key]);
            }
          }
        }
        return newObj;
      }
    }

    return obj;
  }
 
  // Function to recursively replace all occurrences of 23 with selectedMetadata.index
  export function replaceValueInObject(obj, oldValue, newValue) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        return obj.map((item) =>
          replaceValueInObject(item, oldValue, newValue)
        );
      } else {
        const newObj = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            newObj[key] = replaceValueInObject(obj[key], oldValue, newValue);
          }
        }
        return newObj;
      }
    } else if (typeof obj === "string") {
      return obj.replace(
        new RegExp(oldValue.toString(), "g"),
        newValue.toString()
      );
    } else if (typeof obj === "number" && obj === oldValue) {
      return newValue;
    }

    return obj;
  }