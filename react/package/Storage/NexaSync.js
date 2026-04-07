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
    baseUrl: DEFAULT_CONFIG.API_URL,
    contentType: "application/json", // Default content type
    endpoint: "", // Direct endpoint path
    credentials: null, // Unified credentials
  };

  constructor(config) {
    this.setConfig(config);
  }

  setConfig(config) {
    if (typeof config !== "object") {
      throw new Error("Config harus berupa object");
    }

    // Simplified config - hanya memerlukan endpoint dan credentials
    const requiredFields = [];

    // Set credentials dari berbagai sumber
    if (config.credensial) {
      config.credentials = config.credensial;
    } else if (config.token) {
      config.credentials = config.token;
    } else if (config.key) {
      config.credentials = config.key;
    }

    // Set base URL
    if (config.baseUrl) {
      config.baseUrl = config.baseUrl;
    } else if (!config.baseUrl) {
      config.baseUrl = DEFAULT_CONFIG.API_URL;
    }

    // Set endpoint path
    if (config.path) {
      config.endpoint = config.path;
    } else if (config.endpoint) {
      config.endpoint = config.endpoint;
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
    // Log removed for cleaner console output
    // Email dan password tidak selalu diperlukan dalam request (tergantung endpoint)
    
    return this.#request(endpoint, "POST", data);
  }

  async put(endpoint, data) {
    return this.#request(endpoint, "PUT", data);
  }

  async delete(endpoint) {
    return this.#request(endpoint, "DELETE");
  }

  async #request(endpoint, method, data = null) {
    // Declare url di scope terluar untuk error handling
    let url = null;
    try {
      // Construct URL langsung
      let baseUrl = this.#config.baseUrl || DEFAULT_CONFIG.API_URL;
      baseUrl = baseUrl.replace(/\/$/, ""); // Hapus trailing slash

      url = baseUrl;

      // Jika ada endpoint yang dikonfigurasi, gunakan itu
      if (this.#config.endpoint) {
        url = `${url}/${this.#config.endpoint}`;
      }

      // Tambahkan endpoint dari parameter jika ada
      if (endpoint && endpoint !== "/") {
        // Pastikan tidak ada double slash
        if (endpoint.startsWith("/")) {
          url = `${url}${endpoint}`;
        } else {
          url = `${url}/${endpoint}`;
        }
      }

      // Log removed for cleaner console output

      const options = {
        method,
        headers: {
          "Content-Type": this.#config.contentType,
          Accept: "application/json",
        },
        mode: "cors", // Add CORS mode
      };

      // Tambahkan authorization header jika ada credentials
      if (this.#config.credentials) {
        options.headers["Authorization"] = `Bearer ${this.#config.credentials}`;
      }

      // Tambahkan API key sebagai header alternatif jika ada
      if (this.#config.key) {
        options.headers["X-API-Key"] = this.#config.key;
      }

      // Tambahkan secret sebagai header jika ada
      if (this.#config.secret) {
        options.headers["X-API-Secret"] = this.#config.secret;
      }

      // Handle request body
      if (data && method !== "GET") {
        if (this.#config.contentType === "application/json") {
          const bodyData = JSON.stringify(data);
          // Log removed for cleaner console output
          options.body = bodyData;
        } else if (this.#config.contentType === "multipart/form-data") {
          options.body = data;
          delete options.headers["Content-Type"]; // Let browser set boundary
        } else {
          options.body = data;
        }
      } else if (method !== "GET") {
        console.warn('⚠️ Request body kosong untuk method:', method);
      }

      // Add timeout (30 seconds untuk request yang lebih kompleks)
      const controller = new AbortController();
      const timeoutDuration = 30000; // 30 detik
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Request timeout setelah', timeoutDuration / 1000, 'detik');
        controller.abort();
      }, timeoutDuration);
      options.signal = controller.signal;

      // Log removed for cleaner console output

      let response;
      try {
        const fetchStartTime = Date.now();
        response = await fetch(url, options);
        const fetchDuration = Date.now() - fetchStartTime;
        clearTimeout(timeoutId);
        
        // Convert headers to object (compatible dengan semua environment)
        const headersObj = {};
        try {
          response.headers.forEach((value, key) => {
            headersObj[key] = value;
          });
        } catch (headerError) {
          console.warn('⚠️ Error reading headers:', headerError);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Handle AbortError (timeout) dengan lebih spesifik
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ Request timeout setelah 30 detik');
          console.error('❌ Fetch error details:', {
            name: fetchError.name,
            message: fetchError.message,
            url: url,
          });
          throw new Error('Request timeout - server tidak merespons. Periksa koneksi internet atau server mungkin sedang down.');
        }
        
        console.error('❌ Fetch error details:', {
          name: fetchError.name,
          message: fetchError.message,
          url: url,
        });
        throw fetchError;
      }

      // Check if response is ok
      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.text();

      // Try to parse as JSON, fallback to text
      try {
        return JSON.parse(responseData);
      } catch (parseError) {
        
        console.warn("Response is not valid JSON:", parseError);
        return responseData;
      }
    } catch (error) {
      // Pastikan url selalu terdefinisi untuk error logging
      const errorUrl = url || this.#config.baseUrl || DEFAULT_CONFIG.API_URL || 'Unknown URL';
      
      if (error.name === "AbortError") {
        console.error("⏱️ Request timeout - server tidak merespons dalam 30 detik");
        console.error("🔍 URL yang dipanggil:", errorUrl);
        throw new Error("Request timeout - server tidak merespons. Periksa koneksi internet atau server mungkin sedang down.");
      }
      console.error("❌ API Request Error:", {
        name: error.name,
        message: error.message,
        url: errorUrl,
        endpoint: endpoint || 'N/A',
        method: method || 'N/A',
        stack: error.stack,
      });
      throw error;
    }
  }
}

// Factory function for creating NexaSync instance
export const createNexaSync = (config) => {
  return new NexaSync(config);
};

// Storage factory function untuk advanced configuration
export const Storage = (config) => {
  if (!config || typeof config !== "object") {
    throw new Error("Config harus berupa object");
  }

  // Gunakan URL dari config atau default
  const baseUrl = config.baseUrl || DEFAULT_CONFIG.API_URL;

  // Konfigurasi yang disederhanakan
  const nexaSyncConfig = {
    baseUrl: baseUrl,
    contentType: "application/json",
    credentials: config.credentials || config.credensial || config.token || config.key,
    key: config.key,
    secret: config.secret,
  };

  // Direct endpoint configuration only
  if (config.endpoint) {
    nexaSyncConfig.endpoint = config.endpoint;
  } else if (config.path) {
    nexaSyncConfig.endpoint = config.path;
  }

  // Jika ada endpoint langsung, gunakan itu
  if (config.endpoint) {
    nexaSyncConfig.endpoint = config.endpoint;
  }

  // console.log('📦 Storage creating NexaSync with config:', {
  //   endpoint: nexaSyncConfig.endpoint,
  //   baseUrl: nexaSyncConfig.baseUrl,
  //   hasCredentials: !!nexaSyncConfig.credentials,
  // });

  const instance = createNexaSync(nexaSyncConfig);
  
  if (!instance) {
    console.error('❌ createNexaSync returned undefined!');
    throw new Error('createNexaSync returned undefined');
  }
  
  // console.log('✅ Storage instance created:', {
  //   hasPost: typeof instance.post === 'function',
  //   hasGet: typeof instance.get === 'function',
  // });
  
  return instance;
};

// Deprecated: ApiV1, ApiV2, ApiV3, ApiV4 helper functions removed
// Use Network() or Storage() directly with endpoint parameter

// Network factory - Direct endpoint access (simple and clean)
export const Network = (endpoint, credentials = null, options = {}) => {
  try {
    // Log removed for cleaner console output
    
    const config = {
      endpoint: endpoint,
      credentials: credentials,
      ...options,
    };
    
    // Log removed for cleaner console output
    
    const instance = Storage(config);
    
    if (!instance) {
      console.error('❌ Storage returned undefined!');
      throw new Error('Storage factory returned undefined');
    }
    
    if (typeof instance.post !== 'function') {
      console.error('❌ Instance does not have post method!', instance);
      throw new Error('NexaSync instance does not have post method');
    }
    
    // Log removed for cleaner console output
    return instance;
  } catch (error) {
    console.error('❌ Error in Network function:', error);
    throw error;
  }
};
