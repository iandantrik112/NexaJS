import { NexaAction } from "./NexaAction.js";
import { SearchField } from "./SearchField.js";
export async function init(data = null) {
  try {
 
    // Check if data has the required form property
    if (!data || !data.form) {
      console.warn("❌ No form data available for NexaAction initialization");
      return;
    }
    const template = new NexaAction(data, {
      formById: data.modalid,
      footer: true,
      mode: "insert",
    });
    return template;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

export async function initSearchAction(data = null, id) {
  try {
    // Check if data has the required form property
    if (!data || !data.form) {
      console.warn("❌ No form data available for NexaAction initialization");
      return;
    }
    const template = new NexaAction(data, {
      formById: "search" + data.modalid,
      footer: false,
      type: "search", //search,all,false
      mode: "insert",
    });
    template.render("#" + id);
    await fromSearchField(data);
    // return template;
  } catch (error) {
    console.error("❌ Auto mode initialization failed:", error);
  }
}

export async function fromSearchField(data) {
  try {
    if (
      data.search &&
      typeof data.search === "object" &&
      Object.keys(data.search).length > 0
    ) {
      // Loop menggunakan Object.entries
      Object.entries(data.search).forEach(([key, value]) => {
        const inputId = key;
        const suggestionsId = "suggestions_" + key;
        // Buat instance SearchField
        const searchField = new SearchField("data", 1, value, "get", data);
        // Inisialisasi listener input
        searchField.init(inputId, suggestionsId);
      });
    }
  } catch (err) {
    console.error("Gagal ambil data dari NXUI:", err);
  }
}

export async function searchKeyword(data, callback) {
  try {
    console.log(data.search)
    if (
      data.search &&
      typeof data.search === "object" &&
      Object.keys(data.search).length > 0
    ) {
      const searchResults = {};

      // Loop menggunakan Object.entries
      for (const [key, value] of Object.entries(data.search)) {
        const inputId = key;
        const suggestionsId = "suggestions_" + key;
        // Buat instance SearchField
        const searchField = new SearchField("data", 1, value, "return", data);
        // Inisialisasi listener input
        const result = searchField.init(inputId, suggestionsId);

        // Set up callback untuk setiap search field
        if (result && result.onCallback) {
          result.onCallback((callbackData) => {
            // Merge callback data ke searchResults
            if (callbackData && typeof callbackData === "object") {
              Object.assign(searchResults, callbackData);

              // Call the main callback function with updated data
              if (callback) {
                callback({ ...searchResults });
              }
            }
          });
        }
      }

      return searchResults;
    }
  } catch (err) {
    console.error("Gagal ambil data dari NXUI:", err);
    return {};
  }
}

export async function send(data = null) {
  try {
    const config = {
      formid: "#" + data.id,
      submitid: `#sendContent_${data.id}`,
    };
    // Inisialisasi
    NXUI.Validation(config, async (result) => {
      const insetKey = {
        userid: NEXA.userId,
        ...result.response,
      };
      const modalForm = document.querySelector(`#${data.id}`);
      if (modalForm) {
        // Reset floating labels specifically
        modalForm
          .querySelectorAll(".form-nexa-floating label.active")
          .forEach((label) => {
            label.classList.remove("active");
          });
      }
    });
  } catch (error) {
    console.error("❌ Error processing configuration:", error);
  }
}
