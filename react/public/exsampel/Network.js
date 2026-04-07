import { Network } from "NexaUI";

// ==========================================
// CONTOH PENGGUNAAN YANG BENAR - NEXASYNC
// ==========================================

/**
 * Network Function Signature:
 * Network(endpoint, credentials?, options?)
 *
 * Contoh sederhana:
 * const api = Network("info");
 * const response = await api.get("/");
 */

// Contoh penggunaan sederhana (tanpa credentials)
const exampleSimple = async () => {
  const api = Network("info");
  const response = await api.get("/");
  return response;
};

// Contoh penggunaan API v4
const exampleV4 = async () => {
  const api = Network("v4/exsampel/index");
  const response = await api.post("/", {
    id: "sa121212121sas",
    title: "ssssaaaaaaaaaaaaaaaaaassqqqqqqqso",
    deskripsi: "framework v4.0.212",
  });
  return response;
};

// Contoh penggunaan API v1 dengan credentials
const exampleV1 = async () => {
  const api = Network("v1", "your-api-key-here");
  const response = await api.post("/users", {
    username: "john_doe",
    email: "john@example.com",
  });
  return response;
};

// Contoh penggunaan API v2 (memerlukan secret)
const exampleV2 = async () => {
  const api = Network("v2", "your-api-key-here", {
    secret: "your-api-secret-here",
  });
  const response = await api.post("/data", {
    key: "value",
    timestamp: Date.now(),
  });
  return response;
};

// Contoh penggunaan method GET
const exampleGet = async () => {
  // Contoh sederhana seperti yang Anda tunjukkan
  const api = Network("info");
  const simpleResponse = await api.get("/");

  // V1 dengan credentials
  const v1Api = Network("v1", "your-api-key-here");
  const v1Data = await v1Api.get("/users/123");

  // V2 dengan secret
  const v2Api = Network("v2", "your-api-key-here", {
    secret: "your-api-secret-here",
  });
  const v2Data = await v2Api.get("/data", { filter: "active" });

  return { simpleResponse, v1Data, v2Data };
};

// Contoh penggunaan method PUT
const examplePut = async () => {
  // V1
  const v1Update = await Network("v1", "your-api-key-here").put("/users/123", {
    username: "updated_username",
  });

  // V2
  const v2Update = await Network("v2", "your-api-key-here", {
    secret: "your-api-secret-here",
  }).put("/data/456", {
    status: "updated",
  });

  return { v1Update, v2Update };
};

// Contoh penggunaan method DELETE
const exampleDelete = async () => {
  // V1
  const v1Delete = await Network("v1", "your-api-key-here").delete(
    "/users/123"
  );

  // V2
  const v2Delete = await Network("v2", "your-api-key-here", {
    secret: "your-api-secret-here",
  }).delete("/data/456");

  return { v1Delete, v2Delete };
};

export {
  exampleSimple,
  exampleV4,
  exampleV1,
  exampleV2,
  exampleGet,
  examplePut,
  exampleDelete,
};
