# Perbandingan: NexaStores vs NexaStorage vs NexaModels

## 📊 Ringkasan Eksekutif

| Aspek | NexaStores | NexaStorage | NexaModels |
|-------|------------|-------------|------------|
| **Tujuan Utama** | User endpoints API | Generic API Client | SQL Query Builder + API |
| **Auto User ID** | ✅ Yes (NexaDBLite) | ❌ No | ❌ No |
| **SQL Builder** | ❌ No | ❌ No | ✅ Yes |
| **Package Controllers** | ✅ Yes | ❌ No | ❌ No |
| **Encryption** | ✅ Auto (Package/Model/Event) | ❌ No | ✅ Auto (SQL & Table) |
| **RESTful Mapping** | ⚠️ Partial | ✅ Full | ✅ Full |
| **Error Handling** | ⚠️ Basic | ✅ Advanced | ⚠️ Basic |
| **Authorization** | ❌ No | ✅ Yes | ❌ No |
| **Complexity** | Medium | Low | High |
| **Use Case** | Business Logic | Generic API | Database Queries |

---

## 🏆 Keunggulan Masing-Masing

### 1. NexaStores.js - **Pemenang: Business Logic & User Endpoints**

#### ✅ Keunggulan:
1. **Auto User ID Injection** - Otomatis ambil `userid` dari session storage
2. **Package Controllers** - Call controller methods dengan mudah
3. **Models Integration** - Integrasi dengan backend models
4. **Events Communication** - Event-based communication
5. **Auto Encryption** - Otomatis encrypt sensitive data
6. **Method Chaining** - Fluent API dengan Proxy

#### ❌ Kekurangan:
1. Tidak ada SQL builder
2. Tidak ada authorization header support
3. Error handling basic
4. Hanya untuk user-specific endpoints

#### 🎯 **Kapan Menggunakan:**
- ✅ User-specific endpoints
- ✅ Package controller calls
- ✅ Business logic operations
- ✅ Event-based communication
- ✅ Ketika butuh auto userid injection

#### 📝 Contoh:
```javascript
// Auto userid injection
const store = NexaStores();
await store.package("Applications").accessUser({ data: "value" });
// userid otomatis ditambahkan dari session
```

---

### 2. NexaStorage.js - **Pemenang: Generic API Client & Authorization**

#### ✅ Keunggulan:
1. **RESTful Mapping** - Full RESTful method mapping (GET→index, POST→created, PUT→red, PATCH→updated, DELETE→deleted)
2. **Authorization Support** - Built-in Authorization header support
3. **Advanced Error Handling** - Timeout, CORS, network errors
4. **Response Formatting** - Standardized response format
5. **Flexible Endpoint** - Bisa digunakan untuk endpoint apapun
6. **Simple & Clean** - API yang simple dan mudah dipahami

#### ❌ Kekurangan:
1. Tidak ada auto userid injection
2. Tidak ada SQL builder
3. Tidak ada package controllers
4. Tidak ada auto encryption

#### 🎯 **Kapan Menggunakan:**
- ✅ Generic API calls
- ✅ SDK endpoints dengan Authorization
- ✅ RESTful API yang membutuhkan method mapping
- ✅ Ketika butuh error handling yang advanced
- ✅ Ketika butuh authorization token

#### 📝 Contoh:
```javascript
// Generic API dengan authorization
const api = new Storage({ 
  endpoint: 'sdk',
  credentials: 'NX_XXXXXXXXXXXXXXXXX'
});
await api.get(); // GET /api/sdk → index()
await api.post({ data: "value" }); // POST /api/sdk → created()
```

---

### 3. NexaModels.js - **Pemenang: SQL Query Builder & Database Operations**

#### ✅ Keunggulan:
1. **SQL Query Builder** - Build SQL queries programmatically
2. **Auto Encryption** - SQL & table name otomatis dienkripsi
3. **Standalone** - Tidak bergantung pada modul lain
4. **Method Chaining** - Fluent API untuk query building
5. **RESTful Compliance** - PUT→red, PATCH→updated, DELETE→deleted
6. **Built-in Pagination** - Pagination dengan count + data
7. **Query Reuse** - Clone query untuk reuse
8. **Complex Queries** - Support JOIN, GROUP BY, HAVING, UNION, dll

#### ❌ Kekurangan:
1. Tidak ada auto userid injection
2. Tidak ada package controllers
3. Tidak ada authorization support
4. Lebih kompleks untuk simple operations
5. Hanya untuk database queries

#### 🎯 **Kapan Menggunakan:**
- ✅ Database queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ Complex SQL queries dengan JOIN, GROUP BY, HAVING
- ✅ Data aggregation (COUNT, SUM, AVG, MAX, MIN)
- ✅ Pagination dengan count
- ✅ SQL generation only (tanpa API call)
- ✅ Ketika butuh query builder yang powerful

#### 📝 Contoh:
```javascript
// SQL Query Builder + API
const query = new NexaModels();
const users = await query
  .table('users')
  .select('id, name, email')
  .where('status', 'active')
  .whereIn('role', ['admin', 'user'])
  .groupBy('status')
  .having('count', '>', 5)
  .orderBy('created_at', 'DESC')
  .limit(20)
  .get(); // POST to /api/models
```

---

## 🎯 Rekomendasi Penggunaan

### Scenario 1: User-Specific Endpoints
**Gunakan: NexaStores**
```javascript
const store = NexaStores();
await store.package("Users").getProfile();
await store.package("Applications").accessUser({ feature: "dashboard" });
```

### Scenario 2: Generic API dengan Authorization
**Gunakan: NexaStorage**
```javascript
const api = new Storage({ 
  endpoint: 'sdk',
  credentials: 'NX_XXXXXXXXXXXXXXXXX'
});
await api.get();
await api.post({ data: "value" });
```

### Scenario 3: Database Queries
**Gunakan: NexaModels**
```javascript
const query = new NexaModels();
await query.table('users').where('status', 'active').get();
await query.table('orders').insert({ user_id: 1, amount: 100 });
```

### Scenario 4: Complex Business Logic
**Gunakan: NexaStores + NexaModels**
```javascript
// Business logic dengan NexaStores
const store = NexaStores();
const result = await store.package("Orders").processOrder({ order_id: 1 });

// Database query dengan NexaModels
const query = new NexaModels();
const stats = await query
  .table('orders')
  .select('status, COUNT(*) as total, SUM(amount) as total_amount')
  .groupBy('status')
  .get();
```

---

## 📈 Perbandingan Detail

### 1. Auto User ID Injection

| Modul | Support | Sumber |
|-------|---------|--------|
| **NexaStores** | ✅ Yes | NexaDBLite session |
| **NexaStorage** | ❌ No | Manual |
| **NexaModels** | ❌ No | Manual |

**Pemenang: NexaStores** 🏆

### 2. SQL Query Builder

| Modul | Support | Features |
|-------|---------|----------|
| **NexaStores** | ❌ No | - |
| **NexaStorage** | ❌ No | - |
| **NexaModels** | ✅ Yes | SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, HAVING, UNION, dll |

**Pemenang: NexaModels** 🏆

### 3. RESTful Method Mapping

| Modul | GET | POST | PUT | PATCH | DELETE | OPTIONS |
|-------|-----|------|-----|-------|--------|---------|
| **NexaStores** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **NexaStorage** | ✅ (index) | ✅ (created) | ✅ (red) | ✅ (updated) | ✅ (deleted) | ✅ (pagination) |
| **NexaModels** | ❌ | ✅ (created) | ✅ (red) | ✅ (updated) | ✅ (deleted) | ❌ |

**Pemenang: NexaStorage** 🏆 (Full RESTful mapping)

### 4. Encryption

| Modul | Support | Scope |
|-------|---------|-------|
| **NexaStores** | ✅ Yes | Package/Model/Event params |
| **NexaStorage** | ❌ No | - |
| **NexaModels** | ✅ Yes | SQL & Table name |

**Pemenang: NexaStores & NexaModels** 🏆 (Tie)

### 5. Authorization Support

| Modul | Support | Method |
|-------|---------|--------|
| **NexaStores** | ❌ No | - |
| **NexaStorage** | ✅ Yes | Authorization header |
| **NexaModels** | ❌ No | - |

**Pemenang: NexaStorage** 🏆

### 6. Error Handling

| Modul | Timeout | CORS | Network | Format |
|-------|---------|------|---------|--------|
| **NexaStores** | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic |
| **NexaStorage** | ✅ Advanced | ✅ Advanced | ✅ Advanced | ✅ Standardized |
| **NexaModels** | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic |

**Pemenang: NexaStorage** 🏆

### 7. Package Controllers

| Modul | Support | Features |
|-------|---------|----------|
| **NexaStores** | ✅ Yes | Dynamic package controllers, Models, Events |
| **NexaStorage** | ❌ No | - |
| **NexaModels** | ❌ No | - |

**Pemenang: NexaStores** 🏆

### 8. Complexity & Learning Curve

| Modul | Complexity | Learning Curve | Documentation |
|-------|------------|----------------|---------------|
| **NexaStores** | Medium | Medium | ✅ Complete |
| **NexaStorage** | Low | Low | ⚠️ Basic |
| **NexaModels** | High | High | ✅ Complete |

**Pemenang: NexaStorage** 🏆 (Easiest to learn)

---

## 🎖️ Kesimpulan: Mana yang Lebih Unggul?

### **Tidak ada yang lebih unggul secara mutlak!** Setiap modul memiliki keunggulan di bidangnya masing-masing:

1. **NexaStores** → **Unggul untuk Business Logic & User Endpoints**
   - Auto userid injection
   - Package controllers
   - Events communication
   - Auto encryption untuk business data

2. **NexaStorage** → **Unggul untuk Generic API & Authorization**
   - RESTful method mapping
   - Authorization support
   - Advanced error handling
   - Simple & clean API

3. **NexaModels** → **Unggul untuk Database Queries**
   - SQL query builder
   - Complex queries support
   - Auto encryption untuk SQL
   - Built-in pagination

### 🎯 **Rekomendasi Final:**

**Gunakan kombinasi ketiganya sesuai kebutuhan:**

```javascript
// 1. NexaStores untuk user endpoints
const store = NexaStores();
await store.package("Users").getProfile();

// 2. NexaStorage untuk generic API dengan authorization
const api = new Storage({ endpoint: 'sdk', credentials: 'NX_XXX' });
await api.get();

// 3. NexaModels untuk database queries
const query = new NexaModels();
await query.table('users').where('status', 'active').get();
```

**Atau gunakan sesuai use case:**

- **User Management** → NexaStores
- **SDK/Third-party API** → NexaStorage
- **Database Operations** → NexaModels
- **Complex Business Logic** → NexaStores + NexaModels
- **Generic RESTful API** → NexaStorage

---

## 📚 Related Documentation

- [NexaStores Documentation](./NexaStores.md)
- [NexaModels Documentation](./NexaModels.md)
- [NexaStorage Documentation](./NexaStorage.md) *(to be created)*

---

**Made with ❤️ by Nexa Framework**








































