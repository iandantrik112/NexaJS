# 📱 Cara Menggunakan Storage Class di React Native

## 🚀 Instalasi & Import

```javascript
import { Storage } from './package/Storage/NexaStorage';
// atau
import Storage from './package/Storage/NexaStorage';
```

## 📖 Cara Penggunaan

### 1. Inisialisasi Storage

```javascript
// Dengan endpoint dan credentials
const api = new Storage({
  endpoint: 'sdk',  // Endpoint path (contoh: 'sdk', 'office')
  credentials: 'NX_XXXXXXXXXXXXXXXXX',  // Authorization token
  baseUrl: 'http://192.168.1.5/dev/api'  // Optional, default dari config.js
});

// Atau hanya dengan credentials (endpoint bisa di-set per request)
const api = new Storage({
  credentials: 'NX_XXXXXXXXXXXXXXXXX'
});
```

## 🔄 Mapping HTTP Method ke RESTful Method

Backend otomatis mapping HTTP method ke RESTful method:

| HTTP Method | RESTful Method | Deskripsi |
|------------|---------------|-----------|
| `GET` | `index` | Mengambil data |
| `POST` | `created` | Membuat data baru |
| `PUT` | `red` | Update data (full) |
| `PATCH` | `updated` | Update data (partial) |
| `DELETE` | `deleted` | Hapus data |
| `OPTIONS` | `pagination` | Pagination data |

## 📝 Contoh Penggunaan

### Menggunakan HTTP Methods Langsung

```javascript
const api = new Storage({ credentials: 'NX_XXX' });

// GET - Ambil data
await api.get('sdk');                    // GET /api/sdk

// POST - Buat data baru
await api.post('sdk', { name: 'John' }); // POST /api/sdk

// PUT - Update data (full)
await api.put('sdk', { id: 1, name: 'Updated' }); // PUT /api/sdk

// PATCH - Update data (partial)
await api.patch('sdk', { id: 1, name: 'Updated' }); // PATCH /api/sdk

// DELETE - Hapus data
await api.delete('sdk');                 // DELETE /api/sdk

// OPTIONS - Pagination
await api.options('sdk', { page: 1 });  // OPTIONS /api/sdk
```

### Menggunakan Endpoint di Config

```javascript
// Set endpoint di config
const api = new Storage({ 
  endpoint: 'sdk',
  credentials: 'NX_XXX' 
});

// Tidak perlu specify endpoint lagi
await api.get();                    // GET /api/sdk
await api.post({ name: 'John' });   // POST /api/sdk
await api.put({ id: 1, name: 'Updated' }); // PUT /api/sdk
await api.patch({ id: 1, name: 'Updated' }); // PATCH /api/sdk
await api.delete();                 // DELETE /api/sdk
await api.options({ page: 1 });     // OPTIONS /api/sdk
```

### Menggunakan RESTful Methods (Alternative)

```javascript
const api = new Storage({ 
  endpoint: 'sdk',
  credentials: 'NX_XXX' 
});

await api.index();                    // GET -> index
await api.created({ name: 'John' });  // POST -> created
await api.red({ id: 1, name: 'Updated' }); // PUT -> red
await api.updated({ id: 1, name: 'Updated' }); // PATCH -> updated
await api.deleted();                  // DELETE -> deleted
await api.pagination({ page: 1 });   // OPTIONS -> pagination
```

## 📦 Response Format

Semua response mengikuti format standar:

```javascript
{
  status: 'success' | 'error',
  code: 200 | 201 | 400 | 401 | 403 | 404 | 500,
  message: 'Data retrieved successfully',
  data: {...},  // Data dari API
  timestamp: 1234567890
}
```

## 🎯 Contoh Lengkap React Native Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { Storage } from './package/Storage/NexaStorage';

export default function App() {
  const [api, setApi] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inisialisasi API
    const apiInstance = new Storage({
      endpoint: 'sdk',
      credentials: 'NX_XXXXXXXXXXXXXXXXX'
    });
    setApi(apiInstance);
  }, []);

  // GET - Ambil data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get();
      
      if (response.status === 'success') {
        setData(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // POST - Buat data baru
  const createData = async () => {
    try {
      const newData = {
        name: 'New Item',
        description: 'This is a new item'
      };
      
      const response = await api.post(newData);
      
      if (response.status === 'success') {
        console.log('Data created:', response.data);
        await fetchData();
      }
    } catch (error) {
      console.error('Error creating data:', error);
    }
  };

  // PUT - Update data
  const updateData = async (id) => {
    try {
      const updateData = {
        id: id,
        name: 'Updated Item'
      };
      
      const response = await api.put(updateData);
      
      if (response.status === 'success') {
        console.log('Data updated:', response.data);
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  // DELETE - Hapus data
  const deleteData = async (id) => {
    try {
      const response = await api.delete(null, { id });
      
      if (response.status === 'success') {
        console.log('Data deleted');
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Fetch Data" onPress={fetchData} />
      <Button title="Create Data" onPress={createData} />
      
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item.name}</Text>
              <Button title="Update" onPress={() => updateData(item.id)} />
              <Button title="Delete" onPress={() => deleteData(item.id)} />
            </View>
          )}
        />
      )}
    </View>
  );
}
```

## 🔐 Authorization & SdkController

Backend menggunakan Authorization header untuk menentukan apakah request menggunakan `SdkController` atau controller biasa:

- **Dengan Authorization header**: Backend akan mencari kredensial di database dan menggunakan `SdkController` jika ditemukan
- **Tanpa Authorization header**: Backend akan menggunakan controller biasa berdasarkan endpoint

Format Authorization header:
```
Authorization: NX_XXXXXXXXXXXXXXXXX
```

## ⚙️ Konfigurasi

### Mengubah Konfigurasi

```javascript
// Set config baru
api.setConfig({
  endpoint: 'office',
  credentials: 'NX_NEW_TOKEN_XXXXX'
});

// Get config saat ini
const config = api.getConfig();
console.log(config);
```

## 📚 API Reference

### HTTP Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `get(endpoint?, data?)` | GET request |
| `post` | `post(endpointOrData, data?)` | POST request |
| `put` | `put(endpointOrData, data?)` | PUT request |
| `patch` | `patch(endpointOrData, data?)` | PATCH request |
| `delete` | `delete(endpoint?, data?)` | DELETE request |
| `options` | `options(endpointOrData, data?)` | OPTIONS request (pagination) |

### RESTful Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `index` | `index(endpoint?, data?)` | GET -> index |
| `created` | `created(data, endpoint?)` | POST -> created |
| `red` | `red(data, endpoint?)` | PUT -> red |
| `updated` | `updated(data, endpoint?)` | PATCH -> updated |
| `deleted` | `deleted(endpoint?, data?)` | DELETE -> deleted |
| `pagination` | `pagination(data, endpoint?)` | OPTIONS -> pagination |

## ⚠️ Catatan Penting

1. **URL Construction**: Backend routing menggunakan format `/api/{endpoint}`. HTTP method akan otomatis di-map ke RESTful method.

2. **Response Format**: Semua response di-format menjadi struktur standar dengan `status`, `code`, `message`, `data`, dan `timestamp`.

3. **Error Handling**: Selalu gunakan try-catch untuk menangani error, dan cek `response.status` untuk memastikan request berhasil.

4. **Credentials**: Pastikan credentials yang digunakan valid dan belum expired (jika menggunakan SdkController).

5. **Base URL**: Default base URL diambil dari `config.js`. Bisa di-override dengan parameter `baseUrl` saat inisialisasi.

## 🔧 Troubleshooting CORS Error

Jika Anda mendapatkan error CORS seperti:
```
CORS Error: Request blocked. Backend perlu mengizinkan origin 'http://localhost:8001'
```

**Penyebab**: Backend tidak menangani preflight OPTIONS request dengan benar.

**Solusi**: Pastikan backend menangani OPTIONS request sebelum request sebenarnya. Tambahkan kode berikut di `ApiController.php`:

```php
public function index($params = []): void
{
    // Handle preflight OPTIONS request untuk CORS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400'); // 24 hours
        http_response_code(200);
        exit;
    }

    // Set CORS headers untuk semua request
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    // ... rest of your code
}
```

**Alternatif untuk Development**: Gunakan browser extension untuk disable CORS (hanya untuk development, tidak untuk production).

## 🔗 Koneksi dengan Backend

Storage class dirancang untuk bekerja dengan:
- `ApiController.php`: Router utama
- `SdkController.php`: Controller khusus dengan Authorization
- `NexaController.php`: Handler untuk mapping HTTP method ke RESTful method

Semua request akan otomatis di-format sesuai dengan yang diharapkan backend.

