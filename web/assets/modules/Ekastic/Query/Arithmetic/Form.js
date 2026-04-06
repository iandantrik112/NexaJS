// import { metaIndex, metaField, metaJoin } from "../../Metadata/Field.js";

import { setComplex } from "./complex.js";
import { saveComplex } from "./saveComplex.js";
import { nested } from "./nested.js";

// Function to get operation symbol for display
function getOperationSymbol(operation) {
  const symbols = {
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "×",
    DIVIDE: "÷",
    MODULO: "%",
    POWER: "^",
    SQRT: "√",
    ROUND: "ROUND",
    CEIL: "CEIL",
    FLOOR: "FLOOR",
    PERCENTAGE: "%",
    RATIO: ":",
    RANDOM: "RAND",
  };
  return symbols[operation] || operation;
}

// Function to generate dynamic description for COMPLEX operations
function generateComplexDescription(nested) {
  if (!nested || nested.length === 0) {
    return "Operasi aritmatika kompleks tanpa nested operations";
  }

  // Sort by priority to show correct order
  const sortedNested = [...nested].sort((a, b) => a.priority - b.priority);

  // Create description parts with operation symbols
  const operationParts = [];
  sortedNested.forEach((item, index) => {
    const symbol = getOperationSymbol(item.operation);
    const fieldName = item.field.split(".").pop(); // Get last part of field name

    if (index > 0) {
      // Add operation symbol before each field (except the first one)
      operationParts.push(symbol);
    }

    if (item.operation === "SQRT") {
      operationParts.push(`√${fieldName}`);
    } else if (["ROUND", "CEIL", "FLOOR"].includes(item.operation)) {
      operationParts.push(`${item.operation}(${fieldName})`);
    } else if (item.operation === "PERCENTAGE") {
      operationParts.push(`${fieldName} × 100`);
    } else {
      operationParts.push(`${fieldName}`);
    }
  });

  // Join operations with actual operation symbols
  const operationText = operationParts.join(" ");

  // Create detailed description
  const operationDetails = sortedNested.map((item, index) => {
    const fieldName = item.field.split(".").pop();
    switch (item.operation) {
      case "MULTIPLY":
        return `mengalikan ${fieldName}`;
      case "DIVIDE":
        return `membagi ${fieldName}`;
      case "ADD":
        return `menambahkan ${fieldName}`;
      case "SUBTRACT":
        return `mengurangi ${fieldName}`;
      case "SQRT":
        return `akar kuadrat ${fieldName}`;
      case "ROUND":
        return `membulatkan ${fieldName}`;
      case "CEIL":
        return `membulatkan ke atas ${fieldName}`;
      case "FLOOR":
        return `membulatkan ke bawah ${fieldName}`;
      case "PERCENTAGE":
        return `persentase ${fieldName}`;
      default:
        return `operasi ${item.operation} pada ${fieldName}`;
    }
  });

  return `Operasi kompleks: ${operationText}. Menggabungkan ${operationDetails.join(
    ", "
  )} sesuai prioritas.`;
}

// Function to get arithmetic operation descriptions
function getArithmeticDescription(operation, row = null) {
  // Handle COMPLEX operations dynamically
  if (operation === "COMPLEX" && row && row.nested) {
    return generateComplexDescription(row.nested);
  }

  const descriptions = {
    ADD: "Menambahkan nilai field dengan nilai atau field lain. Contoh: (harga + 1000) atau (harga + pajak)",
    SUBTRACT:
      "Mengurangi nilai field dengan nilai atau field lain. Contoh: (total - diskon) atau (stok - 5)",
    MULTIPLY:
      "Mengalikan nilai field dengan nilai atau field lain. Contoh: (harga × qty) atau (nilai × 1.1)",
    DIVIDE:
      "Membagi nilai field dengan nilai atau field lain. Contoh: (total ÷ jumlah) atau (nilai ÷ 2)",
    MODULO:
      "Mengambil sisa hasil bagi dari nilai field. Contoh: (nomor % 10) untuk mendapat digit terakhir",
    POWER:
      "Memangkatkan nilai field dengan nilai tertentu. Contoh: (radius^2) untuk menghitung luas",
    SQRT: "Mengambil akar kuadrat dari nilai field. Berguna untuk kalkulasi geometri dan statistik",
    ROUND:
      "Membulatkan nilai desimal ke bilangan bulat terdekat. Contoh: 3.7 → 4, 3.2 → 3",
    CEIL: "Membulatkan nilai desimal ke atas (ceiling). Contoh: 3.1 → 4, 3.9 → 4",
    FLOOR:
      "Membulatkan nilai desimal ke bawah (floor). Contoh: 3.1 → 3, 3.9 → 3",
    PERCENTAGE:
      "Mengkonversi nilai field menjadi persentase (×100). Contoh: 0.25 → 25%",
    RATIO:
      "Menghitung rasio/perbandingan antara field dengan nilai lain. Contoh: penjualan:target",
    RANDOM:
      "Menghasilkan nilai acak berdasarkan seed dari field. Untuk simulasi dan sampling data",
    COMPLEX:
      "Operasi aritmatika kompleks dengan multiple field dan operasi bertingkat sesuai prioritas",
  };

  return (
    descriptions[operation] ||
    "Operasi aritmatika kustom untuk memproses dan transformasi nilai pada field ini"
  );
}

export async function ArithmeticForm(tabel) {
  try {
    let template = "";
    if (tabel.variablesOrigin && Array.isArray(tabel.variablesOrigin)) {
      tabel.variablesOrigin.forEach((row) => {
        template += `<option value="${row}">${row}</option>`;
      });
    }

    // Pastikan arithmetic selalu array
    const arithmeticList = Array.isArray(tabel?.arithmetic)
      ? tabel.arithmetic
      : [];

    // Fungsi untuk menampilkan operasi aritmatika
    const formatArithmeticOperation = (row) => {
      const field = row.field || "";
      const type = row.operation || "";
      const value = row.value || "";
      const field2 = row.field2 || "";

      // Tampilkan operasi berdasarkan type
      switch (type) {
        case "ADD":
          return field2 ? `${field} + ${field2}` : `${field} + ${value}`;
        case "SUBTRACT":
          return field2 ? `${field} - ${field2}` : `${field} - ${value}`;
        case "MULTIPLY":
          return field2 ? `${field} × ${field2}` : `${field} × ${value}`;
        case "DIVIDE":
          return field2 ? `${field} ÷ ${field2}` : `${field} ÷ ${value}`;
        case "MODULO":
          return field2 ? `${field} % ${field2}` : `${field} % ${value}`;
        case "POWER":
          return field2 ? `${field}^${field2}` : `${field}^${value}`;
        case "SQRT":
          return `√${field}`;
        case "ROUND":
          return `ROUND(${field})`;
        case "CEIL":
          return `CEIL(${field})`;
        case "FLOOR":
          return `FLOOR(${field})`;
        case "PERCENTAGE":
          return `${field}%`;
        case "RATIO":
          return field2 ? `${field}:${field2}` : `${field}:${value}`;
        case "RANDOM":
          return `RANDOM(${field})`;
        case "COMPLEX":
          return `${field} [COMPLEX]`;
        default:
          return `${field} ${type} ${value}`;
      }
    };

    // Render daftar arithmetic - hanya tampilkan item yang memiliki field
    let templateField = "";
    let validIndex = 0;
    arithmeticList.forEach((row, index) => {
      // Hanya tampilkan jika row.field ada dan tidak kosong
      if (row.field && row.field.trim() !== "") {
        const no = validIndex + 1; // mulai dari 1
        const operation = formatArithmeticOperation(row);
        templateField += `
          <li class="nx-list-item" id="orderkey${index}">
            ${no}. ${operation}
            <a class="pull-right" onclick="nx.eleteOrderID(${index});" href="javascript:void(0);">
              <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
            </a>
            <p class="nx-text-muted">${getArithmeticDescription(
              row.operation,
              row
            )}</p>
          </li>
        `;
        validIndex++;
      }
    });

    // Fungsi hapus item arithmetic
    nx.eleteOrderID = async function (id) {
      const index = parseInt(id, 10);
      const filtered = arithmeticList.filter((_, i) => i !== index);
      const makeDir = { arithmetic: filtered };
      await NXUI.ref.mergeData(tabel.store, tabel.id, makeDir);

      // Render ulang daftar biar nomor & tombol sinkron - hanya tampilkan item yang valid
      const listContainer = NXUI.id("arithmeticList");
      if (listContainer) {
        let newTemplate = "";
        let validIndex = 0;
        filtered.forEach((row, newIndex) => {
          console.log(row);
          // Hanya tampilkan jika row.field ada dan tidak kosong
          if (row.field && row.field.trim() !== "") {
            const operation = formatArithmeticOperation(row);
            newTemplate += `
              <li class="nx-list-item" id="orderkey${newIndex}">
                ${validIndex + 1}. ${operation}
                <a class="pull-right" onclick="nx.eleteOrderID(${newIndex});" href="javascript:void(0);">
                  <span class="material-symbols-outlined nx-icon-sm">delete_sweep</span>
                </a>
                <p class="nx-text-muted">${getArithmeticDescription(
                  row.operation,
                  row
                )}</p>
              </li>
            `;
            validIndex++;
          }
        });
        listContainer.innerHTML = newTemplate;
      }
    };

    // Ambil direction pertama dari arithmetic jika ada, default kosong
    const selectedDirection = arithmeticList?.[0]?.operation || "";

    return `
      <div class="nx-container">
        <div class="nx-row">
        <div class="nx-col-12">
          <div class="form-nexa-group">
            <button onclick="nx.setComplexJoinTabel('${tabel.id}','${
      tabel.store
    }');" type="button" class="nx-btn-white full-width">Add Complex Arithmetic</button>
          </div>
        </div>
         <div class="nx-col-12"id="ArithmeticOrder"></div>
          <div class="nx-col-6">
            <div class="form-nexa-group">
              <label>Field</label>
            <select class="form-nexa-control"name="field"id="field">
            <option value="">Select Field</option>
            ${template}
          </select>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-nexa-group">
              <label>Type</label>
              <select class="form-nexa-control" id="operation" name="operation">
                <option value="">Arithmetic Operation</option>
                <option value="ADD" ${
                  selectedDirection === "ADD" ? "selected" : ""
                }>ADD</option>
                <option value="SUBTRACT" ${
                  selectedDirection === "SUBTRACT" ? "selected" : ""
                }>SUBTRACT</option>
                <option value="MULTIPLY" ${
                  selectedDirection === "MULTIPLY" ? "selected" : ""
                }>MULTIPLY</option>
                <option value="DIVIDE" ${
                  selectedDirection === "DIVIDE" ? "selected" : ""
                }>DIVIDE</option>
                <option value="MODULO" ${
                  selectedDirection === "MODULO" ? "selected" : ""
                }>MODULO</option>
                <option value="POWER" ${
                  selectedDirection === "POWER" ? "selected" : ""
                }>POWER</option>
                <option value="SQRT" ${
                  selectedDirection === "SQRT" ? "selected" : ""
                }>SQRT</option>
                <option value="ROUND" ${
                  selectedDirection === "ROUND" ? "selected" : ""
                }>ROUND</option>
                <option value="CEIL" ${
                  selectedDirection === "CEIL" ? "selected" : ""
                }>CEIL</option>
                <option value="FLOOR" ${
                  selectedDirection === "FLOOR" ? "selected" : ""
                }>FLOOR</option>
                <option value="PERCENTAGE" ${
                  selectedDirection === "PERCENTAGE" ? "selected" : ""
                }>PERCENTAGE</option>
                <option value="RATIO" ${
                  selectedDirection === "RATIO" ? "selected" : ""
                }>RATIO</option>
                <option value="RANDOM" ${
                  selectedDirection === "RANDOM" ? "selected" : ""
                }>RANDOM</option>
                <option value="COMPLEX" ${
                  selectedDirection === "COMPLEX" ? "selected" : ""
                }>COMPLEX</option>
              </select>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-nexa-group">
              <label>Value</label>
              <input type="text" class="form-nexa-control" id="value" name="value"placeholder="Nilai" />
            </div>
         </div>
          <div class="nx-col-12">
            <ul class="nx-list-group" id="arithmeticList">
              ${templateField}
            </ul>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
    return `<div class="nx-row"><div class="nx-col-12">Error loading arithmetic form.</div></div>`;
  }
}

nx.setComplexJoinTabel = async function (id, tabel) {
  try {
    const dataform = await NXUI.ref.get(tabel, id);
    const modalID = "complex_" + id;
    const modalIDcheckbox = "complex_checkbox" + id;

    NXUI.modalHTML({
      elementById: modalID,
      styleClass: "w-500px",
      minimize: true,
      label: `Add Field Arithmetic`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      setDataBy: dataform, // ✅ Standard validation approach
      onclick: false,
      content: await setComplex(dataform),
    });
    NXUI.nexaModal.open(modalID);
    NXUI.nexaModal.close("arithmetic_" + id);
    NXUI.id("body_" + modalID).setStyle("padding", "5px");

    NXUI.modalHTML({
      elementById: modalIDcheckbox,
      styleClass: "w-500px",
      minimize: true,
      label: `Complex Arithmetic`,
      getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
      setDataBy: dataform, // ✅ Standard validation approach
      getValidationBy: ["name"], // ✅ Standard validation approach
      showMinimize: true,
      onclick: {
        title: "Save Nested",
        cancel: "Cancel",
        send: "saveArithmeticNested", // ✅ Use namespaced function name
      },
      content: await nested(dataform),
    });
    NXUI.nexaModal.open(modalIDcheckbox);
    NXUI.NexaOption({
      placeholder: "Search variables... (Ctrl+F)",
      elementById: "ComplexArithmeticOrder",
      select: "fieldComplex",
    });

    // NXUI.id("footer"+modalIDcheckbox).hide()
  } catch (error) {
    console.error("Failed to open form settings:", error);
  }
  // await Save(id,data,tabel)
};
// Function to convert flat object data to nested array format
export function convertToNestedArray(data) {
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
        fieldGroups[fieldName].field2 = data[key];
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

    // Convert grouped data to nested array
    Object.keys(fieldGroups).forEach((fieldName) => {
      const group = fieldGroups[fieldName];
      if (group.field2 && group.operation && group.priority !== undefined) {
        nested.push({
          operation: group.operation,
          field2: group.field2.replace("-", "."),
          priority: group.priority,
        });
      }
    });

    // Sort by priority (ascending)
    nested.sort((a, b) => a.priority - b.priority);

    return nested;
  } catch (error) {
    console.error("Conversion failed:", error);
    return [];
  }
}

nx.saveArithmeticNested = async function (modalid, data, tabel) {
  await saveComplex(modalid, data, tabel);
};
