import { Network, Storage } from "NexaUI";

// ==========================================
// CONTOH SESUAI STRUKTUR BACKEND API
// ==========================================

// config.js sudah punya: API_URL: "http://localhost/dev/api"
// Jadi endpoint cukup relatif path saja

// 1. Akses InfoController endpoints
const exampleInfoApi = async () => {
  // GET /api/info - InfoController@index
  const api = Network("info");
  const infoData = await api.get("/");

  // GET /api/info/status - InfoController@status
  const statusData = await api.get("/status");

  // GET /api/info/version - InfoController@version
  const versionData = await api.get("/version");

  return { infoData, statusData, versionData };
};

// 2. POST/PUT/DELETE operations ke InfoController
const exampleInfoCrud = async () => {
  const api = Network("info");

  // POST - InfoController@created
  const createResponse = await api.post("/", {
    title: "New Info",
    description: "Test data",
  });

  // PUT - InfoController@updated
  const updateResponse = await api.put("/", {
    id: 123,
    title: "Updated Info",
  });

  // DELETE - InfoController@deleted
  const deleteResponse = await api.delete("/");

  return { createResponse, updateResponse, deleteResponse };
};

// 3. Custom endpoint untuk controller lain
const exampleOtherControllers = async () => {
  // Contoh akses ke controller lain di namespace Api/
  const testApi = Network("test");
  const userApi = Network("user");
  const authApi = Network("auth");

  const testData = await testApi.get("/");
  const userData = await userApi.get("/profile");
  const authData = await authApi.post("/login", {
    email: "user@example.com",
    password: "password",
  });

  return { testData, userData, authData };
};

// 4. Dengan credentials/headers
const exampleWithAuth = async () => {
  const api = Network("info", "your-token-here");

  // Akan mengirim header: Authorization: Bearer your-token-here
  const protectedData = await api.get("/");

  return protectedData;
};

// 5. Custom headers untuk API yang memerlukan key/secret
const exampleCustomHeaders = async () => {
  const api = Storage({
    endpoint: "info",
    key: "your-api-key",
    secret: "your-api-secret",
  });

  // Akan mengirim headers:
  // X-API-Key: your-api-key
  // X-API-Secret: your-api-secret
  const secureData = await api.get("/");

  return secureData;
};

export {
  exampleInfoApi,
  exampleInfoCrud,
  exampleOtherControllers,
  exampleWithAuth,
  exampleCustomHeaders,
};
