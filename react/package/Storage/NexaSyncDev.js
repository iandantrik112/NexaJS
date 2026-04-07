// Update AndroidManifest.xml:
// Buat file android/app/src/main/res/xml/network_security_config.xml
// Tambahkan referensi ke network security config
// android:networkSecurityConfig="@xml/network_security_config"
// React Native imports
import { Platform } from "react-native";
import Server from "../config";

// Default config menggunakan data dari config.js
const DEFAULT_CONFIG = {
  API_URL: Server.API_URL, // URL dari config.js
};

export class NexaSync {
  #config = {
    key: null,
    secret: null,
    url: DEFAULT_CONFIG.API_URL,
    contentType: "application/json", // Default content type
    path: null, // Untuk path khusus v4
  };

  constructor(config) {
    this.setConfig(config);
  }

  setConfig(config) {
    if (typeof config !== "object") {
      throw new Error("Config harus berupa object");
    }

    // Check API version from type property
    const apiType = config.type || "";

    const requiredFields = ["key"];

    // Atur requirement berdasarkan versi
    if (apiType === "v3") {
      // v3 hanya memerlukan key (token)
      config.key = config.token || config.key;
    } else if (apiType === "v4") {
      config.contentType = "application/json";
    } else if (apiType === "v2") {
      // v2 memerlukan secret
      requiredFields.push("secret");
    }
    // v1 hanya memerlukan key

    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`${field} harus diisi dalam config`);
      }
    }

    // Use URL from config or default
    if (!config.url) {
      config.url = DEFAULT_CONFIG.API_URL;
    }

    this.#config = { ...this.#config, ...config };
  }

  getConfig() {
    return { ...this.#config }; // Return copy of config
  }

  // Method untuk mengubah content type
  setContentType(contentType) {
    const validTypes = [
      "application/json",
      "application/x-www-form-urlencoded",
      "multipart/form-data",
      "text/plain",
    ];

    if (!validTypes.includes(contentType)) {
      throw new Error("Content type tidak valid");
    }

    this.#config.contentType = contentType;
  }

  async get(endpoint, data = null) {
    return this.#request(endpoint, "GET", data);
  }

  async post(endpoint, data) {
    return this.#request(endpoint, "POST", data);
  }

  async put(endpoint, data) {
    return this.#request(endpoint, "PUT", data);
  }

  async delete(endpoint) {
    return this.#request(endpoint, "DELETE");
  }

  async #request(endpoint, method, data = null) {
    if (!this.#config.key) {
      throw new Error("key harus diisi dalam config");
    }

    try {
      // Construct URL based on version
      let url = this.#config.url.replace(/\/$/, ""); // Hapus trailing slash jika ada
      if (this.#config.type === "v3") {
        url = `${url}/v3/${this.#config.key}`;
      } else if (this.#config.type === "v4") {
        // Hapus semua v4 dari path jika ada
        url = url.replace(/\/v4$/, "");
        url = `${url}/v4/${this.#config.path}`;
      }

      const options = {
        method,
        headers: {
          "Content-Type": this.#config.contentType,
        },
        redirect: "follow",
      };

      if (data) {
        if (this.#config.contentType === "application/json") {
          options.body = JSON.stringify(data);
        } else if (this.#config.contentType === "multipart/form-data") {
          // For multipart/form-data, we expect FormData object
          options.body = data;
          // Remove Content-Type header as it will be set automatically with boundary
          delete options.headers["Content-Type"];
        } else {
          options.body = data;
        }
      }

      const response = await fetch(url, options);
      const responseData = await response.text();

      try {
        return JSON.parse(responseData);
      } catch {
        return responseData;
      }
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }
}

// Factory function for creating NexaSync instance
export const createNexaSync = (config) => {
  return new NexaSync(config);
};

// Network factory function for versioned API instances
export const Network = (config) => {
  if (!config || typeof config !== "object") {
    throw new Error("Config harus berupa object");
  }

  if (!config.type) {
    throw new Error("Tipe API (v1/v2/v3/v4) harus ditentukan");
  }

  // Gunakan URL dari config atau default
  const baseUrl = config.baseUrl || DEFAULT_CONFIG.API_URL;

  switch (config.type) {
    case "v4":
      return createNexaSync({
        key: config.credensial || "default-key",
        path: config.path,
        url: `${baseUrl}/v4`,
        type: "v4",
        contentType: "application/json",
      });

    case "v3":
      // For v3, we use the token directly in the URL
      return createNexaSync({
        key: config.credensial,
        url: baseUrl, // Base URL only
        type: "v3",
        contentType: "application/json",
      });

    case "v2":
      return createNexaSync({
        key: config.credensial,
        secret: config.secret,
        url: `${baseUrl}/v2`,
      });

    case "v1":
      return createNexaSync({
        key: config.credensial,
        url: `${baseUrl}/v1`,
      });

    default:
      throw new Error(
        'Tipe API tidak valid. Gunakan "v1", "v2", "v3", atau "v4"'
      );
  }
};
