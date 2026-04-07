// Update AndroidManifest.xml:
// Buat file android/app/src/main/res/xml/network_security_config.xml
// Tambahkan referensi ke network security config
// android:networkSecurityConfig="@xml/network_security_config"
// React Native imports
import { Platform } from "react-native";
import Server from "../config";

// ✅ FIX: Import FormData untuk React Native
// React Native memiliki FormData built-in yang berbeda dengan browser
const FormData = global.FormData || require('form-data');

// Default config menggunakan data dari config.js
const DEFAULT_CONFIG = {
  API_URL: Server.API_URL, // URL dari config.js
};

/**
 * Storage Class - API Client untuk React Native
 * 
 * Berdasarkan analisis backend:
 * - ApiController.php: Router utama yang menangani routing ke controller di namespace Api
 * - SdkController.php: Controller khusus yang menggunakan Authorization header
 * - NexaController.php: Mapping HTTP method ke RESTful method:
 *   - GET -> index
 *   - POST -> created
 *   - PUT -> red
 *   - PATCH -> updated
 *   - DELETE -> deleted
 *   - OPTIONS -> pagination
 * 
 * Response format: {status, code, message, data, timestamp}
 */
export class Storage {
  #config = {
    baseUrl: DEFAULT_CONFIG.API_URL,
    endpoint: null,
    credentials: null,
    authorization: null,
  };

  /**
   * Constructor
   * @param {Object} config - Konfigurasi Storage
   * @param {string} config.endpoint - Endpoint path (contoh: 'sdk', 'office')
   * @param {string} config.credentials - Authorization token/credentials
   * @param {string} config.baseUrl - Base URL API (optional, default dari config.js)
   * @param {string} config.authorization - Authorization header value (optional)
   */
  constructor(config = {}) {
    this.setConfig(config);
  }

  /**
   * Set konfigurasi Storage
   * @param {Object} config - Konfigurasi
   */
  setConfig(config) {
    if (typeof config !== "object") {
      throw new Error("Config harus berupa object");
    }

    // Update config
    this.#config = {
      baseUrl: config.baseUrl || DEFAULT_CONFIG.API_URL,
      endpoint: config.endpoint || config.path || null,
      credentials: config.credentials || config.credensial || config.token || config.key || null,
      authorization: config.authorization || config.credentials || null,
    };
  }

  /**
   * Get konfigurasi saat ini
   * @returns {Object} Konfigurasi
   */
  getConfig() {
    return { ...this.#config };
  }

  /**
   * Internal method untuk membuat request dengan format yang sesuai backend
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE, OPTIONS)
   * @param {string} endpoint - Endpoint path (optional, bisa di-override)
   * @param {Object} data - Request data (optional)
   * @returns {Promise<Object>} Response dari API
   */
  async #request(method, endpoint = null, data = null) {
    try {
      // Gunakan endpoint dari parameter atau dari config
      const targetEndpoint = endpoint || this.#config.endpoint || "";

      // Pastikan endpoint tidak kosong
      if (!targetEndpoint) {
        throw new Error("Endpoint harus disediakan (baik di config atau sebagai parameter)");
      }

      // Construct URL: baseUrl sudah mengandung /api
      // Contoh: http://192.168.1.5/dev/api
      let baseUrl = this.#config.baseUrl || DEFAULT_CONFIG.API_URL;
      baseUrl = baseUrl.replace(/\/$/, ""); // Hapus trailing slash
      
      // Tambahkan endpoint langsung
      // URL final: http://192.168.1.5/dev/api/exsampel
      const url = `${baseUrl}/${targetEndpoint}`;


      // ✅ FIX: Deteksi apakah ada file di data (skip fieldConfig)
      const hasFiles = data && typeof data === 'object' && Object.entries(data).some(([key, value]) => {
        // Skip fieldConfig - ini bukan file
        if (key === 'fieldConfig') return false;
        
        if (!value || typeof value !== 'object') return false;
        
        // ✅ FIX: Check for file object dengan uri (prioritas 1 - React Native)
        if (value.uri && typeof value.uri === 'string' && value.uri.startsWith('file://')) {
          return true;
        }
        
        // ✅ FIX: Check for file object dengan base64
        if (value.base64 && typeof value.base64 === 'string') {
          return true;
        }
        
        // ✅ FIX: Check for File/Blob instance (browser)
        if (value instanceof File || value instanceof Blob) {
          return true;
        }
        
        // ✅ FIX: Check for file object dengan content array (old format)
        if (value.content && Array.isArray(value.content) && value.name && value.size) {
          return true;
        }
        
        // ✅ FIX: Check nested objects (array of files)
        if (Array.isArray(value)) {
          return value.some(item => 
            item && typeof item === 'object' && 
            ((item.uri && typeof item.uri === 'string') || 
             (item.base64 && typeof item.base64 === 'string') || 
             (item.content && Array.isArray(item.content)))
          );
        }
        
        return false;
      });
      
      // ✅ FIX: Log untuk debugging
      if (hasFiles) {
        console.log('✅ [NexaStorage] File detected, using FormData');
      }

      // Prepare headers
      const headers = {
        Accept: "application/json",
      };

      // ✅ FIX: Jangan set Content-Type untuk FormData (browser akan set otomatis dengan boundary)
      if (!hasFiles) {
        headers["Content-Type"] = "application/json";
      }

      // Tambahkan Authorization header jika ada credentials
      const authToken = this.#config.credentials || this.#config.authorization;
      if (authToken) {
        headers["Authorization"] = authToken; // Format langsung: NX_XXXXXXXXXXXXXXXXX
      }

      // Prepare request options
      const options = {
        method: method.toUpperCase(),
        headers: headers,
        mode: "cors",
        credentials: "omit", // Jangan kirim cookies untuk menghindari CORS issues
      };

      // ✅ FIX: Tambahkan body untuk method yang memerlukan data
      if (data && ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
        if (hasFiles) {
          // ✅ FIX: Gunakan FormData untuk file upload
          const formData = new FormData();
          
          // Append semua field ke FormData
          for (const [key, value] of Object.entries(data)) {
            // ✅ FIX: Skip fieldConfig - ini akan dikirim sebagai JSON string
            if (key === 'fieldConfig') {
              formData.append(key, JSON.stringify(value));
              continue;
            }
            
            if (value && typeof value === 'object') {
              // Handle file objects
              if (value.uri || value.base64 || value instanceof File || value instanceof Blob) {
                // ✅ FIX: Untuk React Native, file bisa berupa object dengan uri atau base64
                if (value.uri) {
                  // ✅ FIX: File dari pickDocument - React Native FormData memerlukan format khusus
                  // Di React Native, FormData.append() untuk file dengan uri harus menggunakan object dengan property uri, type, name
                  // Pastikan uri menggunakan format yang benar (file:// untuk local file)
                  const fileObject = {
                    uri: value.uri,
                    type: value.type || 'application/octet-stream',
                    name: value.name || 'file'
                  };
                  // ✅ FIX: Untuk React Native, append file object langsung (bukan sebagai JSON string)
                  formData.append(key, fileObject);
                } else if (value.base64) {
                  // ✅ FIX: File dari pickImage/pickCamera - untuk React Native, kita perlu konversi base64 ke format yang bisa dikirim
                  // React Native FormData tidak support Blob, jadi kita kirim base64 sebagai string dan server akan handle
                  // Atau kita bisa konversi ke binary array dan kirim sebagai JSON (fallback)
                  // Untuk sekarang, kita kirim base64 langsung dan server akan handle
                  formData.append(key, value.base64);
                  // Tambahkan metadata
                  formData.append(`${key}_name`, value.name || 'file');
                  formData.append(`${key}_type`, value.type || 'image/jpeg');
                } else if (value instanceof File || value instanceof Blob) {
                  // Browser/Web - gunakan File/Blob langsung
                  formData.append(key, value, value.name || 'file');
                }
              } else if (value.content && Array.isArray(value.content)) {
                // ✅ FIX: Old format (binary array) - untuk React Native, kita perlu konversi ke base64 atau kirim sebagai JSON
                // Untuk kompatibilitas, kita tetap support format ini tapi konversi ke base64
                try {
                  const byteArray = new Uint8Array(value.content);
                  const binaryString = String.fromCharCode.apply(null, Array.from(byteArray));
                  const base64 = btoa(binaryString);
                  formData.append(key, base64);
                  formData.append(`${key}_name`, value.name || 'file');
                  formData.append(`${key}_type`, value.type || 'application/octet-stream');
                } catch (e) {
                  // Fallback: kirim sebagai JSON
                  formData.append(key, JSON.stringify(value));
                }
              } else if (Array.isArray(value)) {
                // Handle array of files
                value.forEach((item, index) => {
                  if (item && typeof item === 'object') {
                    if (item.uri) {
                      const fileObject = {
                        uri: item.uri,
                        type: item.type || 'application/octet-stream',
                        name: item.name || 'file'
                      };
                      formData.append(`${key}[]`, fileObject);
                    } else if (item.base64) {
                      formData.append(`${key}[]`, item.base64);
                      formData.append(`${key}_${index}_name`, item.name || 'file');
                      formData.append(`${key}_${index}_type`, item.type || 'image/jpeg');
                    } else if (item.content && Array.isArray(item.content)) {
                      try {
                        const byteArray = new Uint8Array(item.content);
                        const binaryString = String.fromCharCode.apply(null, Array.from(byteArray));
                        const base64 = btoa(binaryString);
                        formData.append(`${key}[]`, base64);
                        formData.append(`${key}_${index}_name`, item.name || 'file');
                        formData.append(`${key}_${index}_type`, item.type || 'application/octet-stream');
                      } catch (e) {
                        formData.append(`${key}[]`, JSON.stringify(item));
                      }
                    }
                  }
                });
              } else {
                // Regular object - stringify
                formData.append(key, JSON.stringify(value));
              }
            } else {
              // Primitive values
              formData.append(key, value);
            }
          }
          
          options.body = formData;
        } else {
          // ✅ FIX: Untuk data tanpa file, gunakan JSON
          options.body = JSON.stringify(data);
        }
      }

      // Add timeout (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);
      options.signal = controller.signal;

      // Make request
      console.log('label:', url, options);
      let response;
      try {
        response = await fetch(url, options);
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Handle AbortError (timeout) dengan pesan yang lebih jelas
        if (fetchError.name === "AbortError" || fetchError.message === "Aborted") {
          const timeoutError = new Error(
            `Request timeout: Server tidak merespons dalam 30 detik. URL: ${url}`
          );
          timeoutError.name = "TimeoutError";
          timeoutError.url = url;
          timeoutError.code = "TIMEOUT";
          throw timeoutError;
        }
        
        // Handle CORS error dengan pesan yang lebih jelas
        if (fetchError.name === "TypeError" && fetchError.message.includes("fetch")) {
          const origin = Platform.OS === 'web' && typeof window !== 'undefined' 
            ? window.location.origin 
            : 'React Native App';
          const corsError = new Error(
            `CORS Error: Request blocked. Backend perlu mengizinkan origin '${origin}'. ` +
            `Pastikan backend mengirim header: Access-Control-Allow-Origin: * atau Access-Control-Allow-Origin: ${origin}`
          );
          corsError.name = "CORSError";
          corsError.url = url;
          throw corsError;
        }
        throw fetchError;
      }

      // Check if response is ok
      if (!response.ok) {
        // Jika status 0, kemungkinan CORS error
        if (response.status === 0) {
          const origin = Platform.OS === 'web' && typeof window !== 'undefined' 
            ? window.location.origin 
            : 'React Native App';
          throw new Error(
            `CORS Error: Response status 0. Backend perlu mengizinkan origin '${origin}'. ` +
            `Pastikan backend mengirim header CORS yang benar.`
          );
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // Parse response
      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch (parseError) {
        parsedData = responseData;
      }

      // Format response sesuai backend format
      return this.#formatResponse(parsedData, method);
    } catch (error) {
      // Format error terlebih dahulu untuk cek type
      const formattedError = this.#formatError(error);
      
      // ✅ FIX: Log error dengan lebih detail untuk debugging
      console.error("❌ Storage API Error:", {
        message: error.message,
        name: error.name,
        code: error.code,
        url: error.url || url,
        type: formattedError.data?.type,
        formatted: formattedError
      });
      
      // Untuk timeout error, gunakan warn instead of error (tidak critical)
      if (formattedError.data?.type === 'TIMEOUT_ERROR' || error.name === 'TimeoutError') {
        console.warn("⏱️ Storage API Timeout:", formattedError.message);
      }
      
      // ✅ FIX: Untuk TypeError dengan "Network request failed", cek apakah ini benar-benar network error
      // atau error lain (misalnya format data yang salah)
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        // Cek apakah ini mungkin masalah dengan FormData atau format data
        console.warn("⚠️ [NexaStorage] Network request failed - mungkin masalah format data atau FormData");
        // Set type sebagai NETWORK_ERROR hanya jika benar-benar masalah koneksi
        // Jika tidak, biarkan error asli yang akan di-throw
        formattedError.data = {
          ...formattedError.data,
          type: "NETWORK_ERROR",
          originalError: error.message
        };
      }
      
      throw formattedError;
    }
  }

  /**
   * Map HTTP method ke RESTful method sesuai backend
   * @param {string} httpMethod - HTTP method
   * @returns {string} RESTful method name
   */
  #mapHttpMethodToRestful(httpMethod) {
    const mapping = {
      GET: "index",
      POST: "created",
      PUT: "red",
      PATCH: "updated",
      DELETE: "deleted",
      OPTIONS: "pagination",
    };
    return mapping[httpMethod.toUpperCase()] || "index";
  }

  /**
   * Format response sesuai backend format
   * @param {Object} response - Raw response dari API
   * @param {string} method - HTTP method
   * @returns {Object} Formatted response
   */
  #formatResponse(response, method) {
    // Jika response sudah dalam format yang benar, return langsung
    if (response && typeof response === "object") {
      // Jika response sudah memiliki struktur standar (status, code, message, data, timestamp)
      // dan data adalah object yang terpisah, gunakan langsung
      if (response.status && response.data && typeof response.data === "object") {
        // Response sudah dalam format yang benar, return tanpa duplikasi
        return {
          status: response.status,
          code: response.code || this.#getDefaultCode(method),
          message: response.message || this.#getDefaultMessage(method),
          data: response.data,
          timestamp: response.timestamp || Math.floor(Date.now() / 1000),
        };
      }
      
      // Jika response tidak memiliki struktur standar, wrap dalam format standar
      // Extract data: jika ada field 'data', gunakan itu, jika tidak gunakan seluruh response sebagai data
      const data = response.data !== undefined ? response.data : response;
      
      // Buat response object dengan format standar
      return {
        status: response.status || "success",
        code: response.code || this.#getDefaultCode(method),
        message: response.message || this.#getDefaultMessage(method),
        data: data,
        timestamp: response.timestamp || Math.floor(Date.now() / 1000),
      };
    }

    // Jika response bukan object, wrap dalam format standar
    return {
      status: "success",
      code: this.#getDefaultCode(method),
      message: this.#getDefaultMessage(method),
      data: response,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Get default HTTP code berdasarkan method
   * @param {string} method - HTTP method
   * @returns {number} HTTP status code
   */
  #getDefaultCode(method) {
    const codes = {
      GET: 200,
      POST: 201,
      PUT: 200,
      PATCH: 200,
      DELETE: 200,
      OPTIONS: 200,
    };
    return codes[method.toUpperCase()] || 200;
  }

  /**
   * Get default message berdasarkan method
   * @param {string} method - HTTP method
   * @returns {string} Default message
   */
  #getDefaultMessage(method) {
    const messages = {
      GET: "Data retrieved successfully",
      POST: "Data created successfully",
      PUT: "Data updated successfully",
      PATCH: "Data updated successfully",
      DELETE: "Data deleted successfully",
      OPTIONS: "Pagination data retrieved successfully",
    };
    return messages[method.toUpperCase()] || "Success";
  }

  /**
   * Format error response
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  #formatError(error) {
    // Handle Timeout error khusus
    if (error.name === "TimeoutError" || error.code === "TIMEOUT" || 
        (error.name === "AbortError" && error.message === "Aborted")) {
      return {
        status: "error",
        code: 408,
        message: error.message || "Request timeout: Server tidak merespons dalam waktu yang ditentukan",
        data: {
          type: "TIMEOUT_ERROR",
          name: "TimeoutError",
          url: error.url || "Unknown",
          message: "Server tidak merespons dalam 30 detik. Periksa koneksi jaringan atau coba lagi nanti.",
          suggestion: "Pastikan server aktif dan dapat diakses. Periksa koneksi jaringan Anda."
        },
        timestamp: Math.floor(Date.now() / 1000),
      };
    }

    // Handle CORS error khusus
    if (error.name === "CORSError" || (error.message && error.message.includes("CORS"))) {
      return {
        status: "error",
        code: 403,
        message: error.message || "CORS Error: Request blocked by browser",
        data: {
          type: "CORS_ERROR",
          url: error.url || "Unknown",
          origin: Platform.OS === 'web' && typeof window !== 'undefined' 
            ? window.location.origin 
            : 'React Native App',
          suggestion: "Pastikan backend mengirim header CORS yang benar: Access-Control-Allow-Origin"
        },
        timestamp: Math.floor(Date.now() / 1000),
      };
    }

    // Jika error sudah memiliki response, extract informasi
    if (error.response) {
      return {
        status: "error",
        code: error.status || 500,
        message: error.message || "Internal server error",
        data: error.response,
        timestamp: Math.floor(Date.now() / 1000),
      };
    }

    // Format error standar
    return {
      status: "error",
      code: error.status || 500,
      message: error.message || "Request failed",
      data: {
        type: "NETWORK_ERROR",
        name: error.name || "Error",
        message: error.message || "Unknown error"
      },
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  // ========== PUBLIC RESTful METHODS ==========

  /**
   * GET request - Map ke method 'index' di backend
   * @param {string} endpoint - Endpoint path (optional)
   * @param {Object} data - Query parameters (optional)
   * @returns {Promise<Object>} Response
   */
  async index(endpoint = null, data = null) {
    return this.#request("GET", endpoint, data);
  }

  /**
   * POST request - Map ke method 'created' di backend
   * @param {Object} data - Request data
   * @param {string} endpoint - Endpoint path (optional)
   * @returns {Promise<Object>} Response
   */
  async created(data = {}, endpoint = null) {
    return this.#request("POST", endpoint, data);
  }

  /**
   * PUT request - Map ke method 'red' di backend
   * @param {Object} data - Request data
   * @param {string} endpoint - Endpoint path (optional)
   * @returns {Promise<Object>} Response
   */
  async red(data = {}, endpoint = null) {
    return this.#request("PUT", endpoint, data);
  }

  /**
   * PATCH request - Map ke method 'updated' di backend
   * @param {Object} data - Request data
   * @param {string} endpoint - Endpoint path (optional)
   * @returns {Promise<Object>} Response
   */
  async updated(data = {}, endpoint = null) {
    return this.#request("PATCH", endpoint, data);
  }

  /**
   * DELETE request - Map ke method 'deleted' di backend
   * @param {string} endpoint - Endpoint path (optional)
   * @param {Object} data - Request data (optional)
   * @returns {Promise<Object>} Response
   */
  async deleted(endpoint = null, data = null) {
    return this.#request("DELETE", endpoint, data);
  }

  /**
   * OPTIONS request - Map ke method 'pagination' di backend
   * @param {Object} data - Pagination parameters
   * @param {string} endpoint - Endpoint path (optional)
   * @returns {Promise<Object>} Response
   */
  async pagination(data = {}, endpoint = null) {
    return this.#request("OPTIONS", endpoint, data);
  }

  // ========== DIRECT HTTP METHODS (Alternative) ==========

  /**
   * GET request langsung
   * @param {string} endpoint - Endpoint path (jika tidak ada, gunakan dari config)
   * @param {Object} data - Query parameters (optional)
   * @returns {Promise<Object>} Response
   * 
   * @example
   * // Dengan endpoint di config
   * const api = new Storage({ endpoint: 'sdk' });
   * await api.get(); // GET /api/sdk
   * 
   * // Dengan endpoint sebagai parameter
   * await api.get('sdk'); // GET /api/sdk
   * await api.get('sdk', { page: 1 }); // GET /api/sdk?page=1
   */
  async get(endpoint = null, data = null) {
    // Jika endpoint tidak diberikan, gunakan dari config
    const targetEndpoint = endpoint || this.#config.endpoint;
    return this.#request("GET", targetEndpoint, data);
  }

  /**
   * POST request langsung
   * @param {string|Object} endpointOrData - Endpoint path atau data (jika endpoint di config)
   * @param {Object} data - Request data (jika endpoint sebagai parameter pertama)
   * @returns {Promise<Object>} Response
   * 
   * @example
   * // Dengan endpoint di config
   * const api = new Storage({ endpoint: 'sdk' });
   * await api.post({ name: 'John' }); // POST /api/sdk
   * 
   * // Dengan endpoint sebagai parameter
   * await api.post('sdk', { name: 'John' }); // POST /api/sdk
   */
  async post(endpointOrData = null, data = null) {
    // Handle overloaded signature: post(data) atau post(endpoint, data)
    let targetEndpoint = null;
    let requestData = null;

    if (typeof endpointOrData === 'string') {
      // Signature: post(endpoint, data)
      targetEndpoint = endpointOrData;
      requestData = data || {};
    } else if (endpointOrData && typeof endpointOrData === 'object') {
      // Signature: post(data) - endpoint dari config
      targetEndpoint = this.#config.endpoint;
      requestData = endpointOrData;
    } else {
      // No parameters - use config endpoint
      targetEndpoint = this.#config.endpoint;
      requestData = {};
    }

    return this.#request("POST", targetEndpoint, requestData);
  }

  /**
   * PUT request langsung
   * @param {string|Object} endpointOrData - Endpoint path atau data (jika endpoint di config)
   * @param {Object} data - Request data (jika endpoint sebagai parameter pertama)
   * @returns {Promise<Object>} Response
   * 
   * @example
   * // Dengan endpoint di config
   * const api = new Storage({ endpoint: 'sdk' });
   * await api.put({ id: 1, name: 'John' }); // PUT /api/sdk
   * 
   * // Dengan endpoint sebagai parameter
   * await api.put('sdk', { id: 1, name: 'John' }); // PUT /api/sdk
   */
  async put(endpointOrData = null, data = null) {
    // Handle overloaded signature: put(data) atau put(endpoint, data)
    let targetEndpoint = null;
    let requestData = null;

    if (typeof endpointOrData === 'string') {
      // Signature: put(endpoint, data)
      targetEndpoint = endpointOrData;
      requestData = data || {};
    } else if (endpointOrData && typeof endpointOrData === 'object') {
      // Signature: put(data) - endpoint dari config
      targetEndpoint = this.#config.endpoint;
      requestData = endpointOrData;
    } else {
      // No parameters - use config endpoint
      targetEndpoint = this.#config.endpoint;
      requestData = {};
    }
 
    return this.#request("PUT", targetEndpoint, requestData);
  }

  /**
   * PATCH request langsung
   * @param {string|Object} endpointOrData - Endpoint path atau data (jika endpoint di config)
   * @param {Object} data - Request data (jika endpoint sebagai parameter pertama)
   * @returns {Promise<Object>} Response
   * 
   * @example
   * // Dengan endpoint di config
   * const api = new Storage({ endpoint: 'sdk' });
   * await api.patch({ id: 1, name: 'John' }); // PATCH /api/sdk
   * 
   * // Dengan endpoint sebagai parameter
   * await api.patch('sdk', { id: 1, name: 'John' }); // PATCH /api/sdk
   */
  async patch(endpointOrData = null, data = null) {
    // Handle overloaded signature: patch(data) atau patch(endpoint, data)
    let targetEndpoint = null;
    let requestData = null;

    if (typeof endpointOrData === 'string') {
      // Signature: patch(endpoint, data)
      targetEndpoint = endpointOrData;
      requestData = data || {};
    } else if (endpointOrData && typeof endpointOrData === 'object') {
      // Signature: patch(data) - endpoint dari config
      targetEndpoint = this.#config.endpoint;
      requestData = endpointOrData;
    } else {
      // No parameters - use config endpoint
      targetEndpoint = this.#config.endpoint;
      requestData = {};
    }

    return this.#request("PATCH", targetEndpoint, requestData);
  }

  /**
   * DELETE request langsung
   * @param {string} endpoint - Endpoint path (optional, gunakan dari config jika tidak ada)
   * @param {Object} data - Request data (optional)
   * @returns {Promise<Object>} Response
   * 
   * @example
   * // Dengan endpoint di config
   * const api = new Storage({ endpoint: 'sdk' });
   * await api.delete(); // DELETE /api/sdk
   * await api.delete(null, { id: 1 }); // DELETE /api/sdk dengan data
   * 
   * // Dengan endpoint sebagai parameter
   * await api.delete('sdk'); // DELETE /api/sdk
   * await api.delete('sdk', { id: 1 }); // DELETE /api/sdk dengan data
   */
  async delete(endpoint = null, data = null) {
    // Jika endpoint tidak diberikan, gunakan dari config
    const targetEndpoint = endpoint || this.#config.endpoint;
    return this.#request("DELETE", targetEndpoint, data);
  }

  /**
   * OPTIONS request langsung (untuk pagination)
   * @param {string|Object} endpointOrData - Endpoint path atau data (jika endpoint di config)
   * @param {Object} data - Request data (jika endpoint sebagai parameter pertama)
   * @returns {Promise<Object>} Response
   * 
   * @example
   * // Dengan endpoint di config
   * const api = new Storage({ endpoint: 'sdk' });
   * await api.options({ page: 1, perPage: 10 }); // OPTIONS /api/sdk
   * 
   * // Dengan endpoint sebagai parameter
   * await api.options('sdk', { page: 1, perPage: 10 }); // OPTIONS /api/sdk
   */
  async options(endpointOrData = null, data = null) {
    // Handle overloaded signature: options(data) atau options(endpoint, data)
    let targetEndpoint = null;
    let requestData = null;

    if (typeof endpointOrData === 'string') {
      // Signature: options(endpoint, data)
      targetEndpoint = endpointOrData;
      requestData = data || {};
    } else if (endpointOrData && typeof endpointOrData === 'object') {
      // Signature: options(data) - endpoint dari config
      targetEndpoint = this.#config.endpoint;
      requestData = endpointOrData;
    } else {
      // No parameters - use config endpoint
      targetEndpoint = this.#config.endpoint;
      requestData = {};
    }

    return this.#request("OPTIONS", targetEndpoint, requestData);
  }
}

// Export default instance factory (untuk backward compatibility)
export default function createStorage(config) {
  return new Storage(config);
}