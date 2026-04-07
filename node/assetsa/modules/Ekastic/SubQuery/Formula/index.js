export async function Formula(id, tabel, custom) {
  try {
    const Sdk = new NXUI.Buckets(id);
    const dataform = await Sdk.storage();
    const modalID = "group_" + id;
    const addcustom = dataform[custom];
    console.log(addcustom?.arithmetic);

    let template = "";
    if (addcustom?.arithmetic && Array.isArray(addcustom?.arithmetic)) {
      addcustom?.arithmetic.forEach((row, index) => {
        template += `
        
        <li class="nx-list-item mb-10px">
          <span id="${row.field}"class="editable"name="${row.field}" value="${index}">${row.alias}</span>
        </li>
        `;
      });
    }

    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-600px",
      minimize: true,
      label: `Formula`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      // Select: ["#groupbySelect"],
      getValidationBy: ["name"], // ✅ Standard validation approach
      setDataBy: dataform, // ✅ Standard validation approach
      onclick: false,
      content: `<ul class="nx-list-group">
       ${template}
     </ul>`,
    });
    NXUI.nexaModal.open(modalID);
    await tabelEdit(Sdk, custom, addcustom?.arithmetic);
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
}

export function fixSQLSpacing(sqlString) {
  if (!sqlString || typeof sqlString !== "string") {
    return sqlString;
  }

  // Fix SELECTSUM -> SELECT SUM
  return sqlString.replace(/SELECTSUM/gi, "SELECT SUM");
}

export async function tabelEdit(store, custom, data) {
  const storage = await store.storage();
  const nexaField = new NXUI.Field();
  nexaField.onSaveCallback(
    async (variable, newValue, element, type, fieldName) => {
      console.log(variable, newValue, fieldName);

      // Dapatkan index dari element yang diedit
      const index = parseInt(element.getAttribute("value"));

      // Fix spacing in the newValue before saving
      const fixedValue = fixSQLSpacing(newValue);

      // Update arithmetic array dengan alias baru
      const updatedArithmetic = [...storage[custom].arithmetic];
      updatedArithmetic[index] = {
        ...updatedArithmetic[index],
        alias: fixedValue,
      };

      const makeDir = {
        [custom]: {
          ...storage[custom],
          arithmetic: updatedArithmetic,
        },
      };

      console.log(makeDir);
      await NXUI.ref.mergeData(storage.store, storage.id, makeDir);
    }
  );
  // Aktifkan editing
  nexaField.initElements();
}
