import { Network } from "NexaUI";

// ==========================================
// DOKUMENTASI NETWORK API - NEXASYNC v2024
// ==========================================

/**
 * Network Function Signature:
 * Network(endpoint, credentials?, options?)
 *
 * CONTOH PENGGUNAAN YANG BENAR:
 * const api = Network("info");
 * const response = await api.get("/");
 *
 * Parameters:
 * - endpoint (string): Direct endpoint path (e.g., "info", "v4/klien/masuk")
 * - credentials (string): API token/key (optional)
 * - options (object): Additional options (optional)
 *   - secret: API secret
 *   - key: Alternative API key (akan menjadi X-API-Key header)
 *   - contentType: Content type override
 *   - baseUrl: Custom base URL
 *
 * Returns: NexaSync instance dengan methods: get(), post(), put(), delete()
 */

// ==========================================
// CONTOH PENGGUNAAN BARU - DIRECT ENDPOINT
// ==========================================

// 1. Contoh sederhana seperti yang benar
const exampleSimple = async () => {
  const api = Network("info");
  const response = await api.get("/");
  return response;
};

// 2. Direct Endpoint Usage (Recommended)
const exampleDirectEndpoint = async () => {
  const api = Network("v4/klien/masuk", "your-token");
  const response = await api.post("/", {
    email: "user@example.com",
    password: "password123",
  });
  return response;
};

// 3. Menggunakan Network dengan endpoint langsung
const exampleNetworkDirect = async () => {
  const api = Network("v4/klien/masuk", "your-token");

  const response = await api.post("/", {
    email: "user@example.com",
    password: "password123",
  });
  return response;
};

// 4. Multiple API Versions Example
const exampleMultipleVersions = async () => {
  // V4 API
  const v4Api = Network("v4/klien/masuk", "your-token");
  const v4Response = await v4Api.post("/", {
    email: "user@example.com",
    password: "password123",
  });

  // V3 API
  const v3Api = Network("v3/auth/login", "your-token");
  const v3Response = await v3Api.get("/status");

  // V2 API (dengan secret)
  const v2Api = Network("v2/data", "your-key", {
    secret: "your-secret",
  });
  const v2Response = await v2Api.get("/users");

  // V1 API
  const v1Api = Network("v1/users", "your-key");
  const v1Response = await v1Api.get("/profile");

  return { v4Response, v3Response, v2Response, v1Response };
};

// ==========================================
// SYNTAX TERBARU - PARAMETER TERPISAH
// ==========================================

// Syntax terbaru menggunakan parameter terpisah (lebih clean)
const exampleBackwardCompatible = async () => {
  // Syntax baru yang lebih clean
  const response = await Network("v4/klien/masuk", "your-token").post("/", {
    email: "user@example.com",
    password: "password123",
  });
  return response;
};

// ==========================================
// CUSTOM ENDPOINT EXAMPLES
// ==========================================

// Custom API endpoints
const exampleCustomEndpoints = async () => {
  // Custom endpoint tanpa versi
  const customApi = Network("api/custom/data", "token");
  const customResponse = await customApi.get("/list");

  // Multiple endpoints dengan satu instance
  const multiApi = Network("admin/dashboard", "admin-token");

  const stats = await multiApi.get("/stats");
  const users = await multiApi.get("/users");
  const reports = await multiApi.get("/reports");

  return { customResponse, stats, users, reports };
};

// ==========================================
// ADVANCED CONFIGURATION
// ==========================================

// Custom headers dan options
const exampleAdvanced = async () => {
  const api = Network("secure/api", "token", {
    key: "api-key", // Akan menjadi X-API-Key header
    secret: "secret", // Akan menjadi X-API-Secret header
    contentType: "application/x-www-form-urlencoded",
  });

  const response = await api.post("/submit", "key=value&foo=bar");
  return response;
};

// File upload dengan multipart/form-data
const exampleFileUpload = async () => {
  const api = Network("v4/upload/image", "token");
  api.setContentType("multipart/form-data");

  const formData = new FormData();
  formData.append("file", fileObject);
  formData.append("description", "Profile image");

  const response = await api.post("/", formData);
  return response;
};

export {
  exampleSimple,
  exampleDirectEndpoint,
  exampleNetworkDirect,
  exampleMultipleVersions,
  exampleBackwardCompatible,
  exampleCustomEndpoints,
  exampleAdvanced,
  exampleFileUpload,
};
