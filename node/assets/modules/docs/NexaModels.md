# NexaModels.js - Query Builder SQL JavaScript

<a id="daftar-isi"></a>

## Daftar isi

- [Overview](#overview)
- [Fitur Utama](#fitur-utama)
- [Installation & Setup](#installation--setup)
- [Basic Usage](#basic-usage)
- [Query Building Methods](#query-building-methods)
- [Security Features](#security-features)
- [Aggregate Functions](#aggregate-functions)
- [API Integration](#api-integration)
- [Advanced Features](#advanced-features)
- [Practical Examples](#practical-examples)
- [Integration dengan NXUI Components](#integration-dengan-nxui-components)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

---

<a id="overview"></a>

## 📖 **Overview**

NexaModels adalah Query Builder SQL JavaScript yang terintegrasi dalam framework NXUI. Ini adalah sistem pembangun query SQL yang memungkinkan Anda membuat query database dengan cara yang mudah, aman, dan intuitif tanpa harus menulis SQL mentah.

<a id="fitur-utama"></a>

## 🚀 **Fitur Utama**

- ✅ **Method Chaining** - Syntax yang mudah dibaca dan dipahami
- ✅ **SQL Injection Protection** - Otomatis menggunakan prepared statements
- ✅ **Security Features** - Filtering sensitive fields otomatis
- ✅ **Promise Support** - Async/await dan .then()/.catch()
- ✅ **Type Safety** - Validasi input dan parameter
- ✅ **Flexible Query Building** - Mendukung semua operasi SQL standar
- ✅ **NXUI Integration** - Terintegrasi sempurna dengan framework NXUI

<a id="installation--setup"></a>

## 📦 **Installation & Setup**

### **1. Lewat `NXUI.Storage().model()` (cara di app)**

Query builder tabel SQL selalu dimulai dari **`NXUI.Storage().model(namaTabel)`**. Method chaining **`.select()` / `.where()` / `.get()`** sama seperti pada **`NexaModels`** — untuk hasil data dari server gunakan misalnya **`const rows = await NXUI.Storage()...`**.

**Penting — jangan tertukar:**

| Pemanggilan | Fungsi |
|-------------|--------|
| **`NXUI.Storage().model("news")`** | **Tabel SQL** `news` — query builder (`NexaModels`). |
| **`NXUI.Storage().models("News", { method, params })`** | **Class model PHP** `News` — bukan builder tabel. |

Contoh:

```javascript
const rows = await NXUI.Storage()
  .model("news")
  .select("*")
  .get();
```

Setelah `.model("…")` Anda dapat memakai seluruh method NexaModels (`where`, `join`, `orderBy`, `toSql`, dll.). Di bagian bawah dokumen, contoh yang memakai variabel **`query`** mengasumsikan **`const query = NXUI.Storage().model("users");`** (ganti `"users"` sesuai tabel).

<a id="basic-usage"></a>

## 🎯 **Basic Usage**

### **1. Simple SELECT Query**

```javascript
const sqlQuery = NXUI.Storage()
  .model("users")
  .select(["id", "name", "email"])
  .where("status", "=", "active")
  .toSql();

console.log(sqlQuery);
// Output: SELECT id, name, email FROM users WHERE status = ?
```

### **2. Complex Query dengan JOIN**

```javascript
const sqlQuery = NXUI.Storage()
  .model("users")
  .select(["users.name", "profiles.bio", "departments.name as dept_name"])
  .join("profiles", "users.id", "=", "profiles.user_id")
  .leftJoin("departments", "users.department_id", "=", "departments.id")
  .where("users.status", "=", "active")
  .orderBy("users.name", "ASC")
  .toSql();
```

### **3. Query dengan Subquery**

```javascript
const sqlQuery = NXUI.Storage()
  .model("users")
  .select(["*"])
  .whereIn("id", [1, 2, 3, 4, 5])
  .whereBetween("created_at", ["2024-01-01", "2024-12-31"])
  .whereNotNull("email")
  .groupBy("department_id")
  .having("COUNT(*)", ">", 5)
  .toSql();
```

<a id="query-building-methods"></a>

## 🔧 **Query Building Methods**

### **Table Selection**

```javascript
// Basic: tabel dari Storage (disarankan)
const query = NXUI.Storage().model("users");

// Alias untuk table
query.from("users as u");

// Tabel lain — builder baru
const products = NXUI.Storage().model("products");

// Eksekusi async
const rows = await NXUI.Storage().model("news").select("*").get();
```

### **Column Selection**

```javascript
// Select specific columns
query.select(["id", "name", "email"]);

// Select all columns
query.select("*");

// Select dengan alias
query.select(["id", "name as full_name", "email"]);

// Exclude columns
query.except(["password", "secret_key"]);
query.noSensitive(); // Exclude sensitive fields otomatis
query.noTimestamps(); // Exclude created_at, updated_at
```

### **WHERE Clauses**

```javascript
// Basic WHERE
query.where("status", "=", "active");
query.where("age", ">", 18);
query.where("name", "LIKE", "%john%");

// OR WHERE
query.orWhere("role", "=", "admin");
query.orWhere("role", "=", "moderator");

// WHERE IN
query.whereIn("id", [1, 2, 3, 4, 5]);
query.whereNotIn("status", ["banned", "suspended"]);

// WHERE BETWEEN
query.whereBetween("created_at", ["2024-01-01", "2024-12-31"]);
query.whereNotBetween("age", [18, 65]);

// WHERE NULL
query.whereNull("deleted_at");
query.whereNotNull("email");

// WHERE LIKE
query.whereLike("name", "%john%");
query.orWhereLike("email", "%gmail%");

// Date functions
query.whereDate("created_at", "=", "2024-01-01");
query.whereYear("created_at", "=", 2024);
query.whereMonth("created_at", "=", 12);
query.whereDay("created_at", "=", 25);
```

### **JOIN Operations**

```javascript
// INNER JOIN
query.join("profiles", "users.id", "=", "profiles.user_id");

// LEFT JOIN
query.leftJoin("departments", "users.department_id", "=", "departments.id");

// RIGHT JOIN
query.rightJoin("orders", "users.id", "=", "orders.user_id");

// Alias methods
query.innerJoin("profiles", "users.id", "=", "profiles.user_id");
```

### **ORDER BY & GROUP BY**

```javascript
// ORDER BY
query.orderBy("name", "ASC");
query.orderBy("created_at", "DESC");

// Latest/Oldest
query.latest("created_at");
query.oldest("updated_at");

// Random order
query.inRandomOrder();

// GROUP BY
query.groupBy("department_id");
query.groupBy(["department_id", "status"]);

// HAVING
query.having("COUNT(*)", ">", 5);
query.having("SUM(amount)", ">", 1000);
```

### **LIMIT & OFFSET**

```javascript
// LIMIT
query.limit(10);

// OFFSET
query.offset(20);

// Alias methods
query.take(10);
query.skip(20);

// Pagination
query.paginateQuery(1, 10); // page 1, 10 per page
```

### **UNION Operations**

```javascript
// UNION
query.union(otherQuery);

// UNION ALL
query.unionAll(otherQuery);
```

<a id="security-features"></a>

## 🔒 **Security Features**

### **1. Sensitive Data Filtering**

```javascript
// Exclude sensitive fields otomatis
query.noSensitive();

// Exclude fields tertentu
query.except(["password", "secret_key", "api_token"]);

// Exclude timestamps
query.noTimestamps();

// Exclude system fields
query.noSystem();

// Exclude ID fields
query.noId();
```

### **2. Input Validation**

```javascript
// Validasi table name
query.validateTableName("users"); // true
query.validateTableName("users; DROP TABLE users;"); // false

// Validasi column name
query.validateColumnName("name"); // true
query.validateColumnName("name; DROP TABLE users;"); // false
```

### **3. SQL Injection Protection**

```javascript
// Otomatis menggunakan prepared statements
const query = NXUI.Storage()
  .model("users")
  .where("name", "=", userInput); // Aman dari SQL injection

// Mendapatkan bindings untuk prepared statements
const { sql, bindings } = query.toSqlWithBindings();
```

<a id="aggregate-functions"></a>

## 📊 **Aggregate Functions**

### **1. Count Operations**

```javascript
// Basic count
query.countSql("id");
query.countSql("*");

// Count dengan kondisi
query.countByConditions("id", [
  { column: "status", operator: "=", value: "active" },
  { column: "age", operator: ">", value: 18 },
]);

// Count dengan persentase
query.countWithPercentage("id", [
  { column: "status", operator: "=", value: "active" },
]);

// Count by group
query.countByGroup("department_id", "id");
```

### **2. Sum, Average, Min, Max**

```javascript
// SUM
query.sumSql("amount");
query.sumColumns(["price", "tax", "shipping"]);

// AVERAGE
query.avgSql("rating");
query.avgColumns(["score1", "score2", "score3"]);

// MIN/MAX
query.minSql("created_at");
query.maxSql("updated_at");
```

### **3. Custom Aggregate**

```javascript
// Custom aggregate function
query.aggregateSql("COUNT", "id");
query.aggregateSql("AVG", "rating");
```

<a id="api-integration"></a>

## 🔄 **API Integration**

### **1. HTTP Methods**

```javascript
const query = NXUI.Storage()
  .model("users")
  .where("status", "=", "active");

// GET request
const rows = await query.get("Fetch");

// POST request
const newUser = await query.insert(
  {
    name: "John Doe",
    email: "john@example.com",
  },
  "Create"
);

// PUT request
const updated = await query.update(
  {
    name: "Jane Doe",
  },
  "Update"
);

// DELETE request
const deleted = await query.delete("Delete");
```

### **2. Promise Support**

```javascript
// Menggunakan .then() dan .catch()
query
  .get("Fetch")
  .then((rows) => {
    console.log("Data:", rows);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Atau menggunakan async/await
try {
  const rows = await query.get("Fetch");
  console.log("Data:", rows);
} catch (error) {
  console.error("Error:", error);
}
```

### **3. Pagination**

```javascript
// Pagination dengan API
const rows = await query.paginate(1, 10, "Fetch");

// Pagination info
const paginationInfo = query.paginateInfo(1, 10);
```

<a id="advanced-features"></a>

## 🎨 **Advanced Features**

### **1. Query Cloning**

```javascript
const baseQuery = NXUI.Storage()
  .model("users")
  .where("status", "=", "active");

// Clone query
const clonedQuery = baseQuery.clone();
const activeUsers = await clonedQuery.get("Fetch");

// Modify cloned query
const adminUsers = clonedQuery.where("role", "=", "admin").get("Fetch");
```

### **2. Query Debugging**

```javascript
// Debug query
query.dump(); // Print query info
query.dd(); // Dump and die

// Get query info
const queryInfo = query.inspect();
console.log(queryInfo);
```

### **3. Raw SQL**

```javascript
// Raw SQL dengan bindings
query.rawSql("SELECT * FROM users WHERE age > ?", [18]);

// Raw SQL tanpa bindings
query.rawSql("SELECT COUNT(*) FROM users");
```

### **4. Transaction Support**

```javascript
// Transaction SQL
const transactionQueries = [
  { sql: "INSERT INTO users (name) VALUES (?)", bindings: ["John"] },
  {
    sql: "INSERT INTO profiles (user_id, bio) VALUES (?, ?)",
    bindings: [1, "Bio"],
  },
];

query.transactionSql(transactionQueries);
```

<a id="practical-examples"></a>

## 📝 **Practical Examples**

### **1. User Management System**

```javascript
// Get active users with pagination
async function getActiveUsers(page = 1, perPage = 10) {
  const query = NXUI.Storage()
    .model("users")
    .select(["id", "name", "email", "created_at"])
    .where("status", "=", "active")
    .orderBy("created_at", "DESC");

  try {
    const rows = await query.paginate(page, perPage, "Fetch");
    return rows;
  } catch (error) {
    console.error("Error loading users:", error);
    return null;
  }
}

// Search users
async function searchUsers(searchTerm, filters = {}) {
  const query = NXUI.Storage()
    .model("users")
    .select(["id", "name", "email"]);

  if (searchTerm) {
    query
      .whereLike("name", `%${searchTerm}%`)
      .orWhereLike("email", `%${searchTerm}%`);
  }

  if (filters.department) {
    query.where("department_id", "=", filters.department);
  }

  if (filters.status) {
    query.where("status", "=", filters.status);
  }

  const rows = await query.get("Fetch");
  return rows;
}

// Create new user
async function createUser(userData) {
  try {
    const rows = await NXUI.Storage()
      .model("users")
      .insert(userData, "Create");
    return rows;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
```

### **2. Dashboard Statistics**

```javascript
async function getDashboardStats() {
  try {
    const [totalUsers, totalRevenue, totalProducts] = await Promise.all([
      NXUI.Storage().model("users").count("id", "Fetch"),
      NXUI.Storage().model("orders").sum("total", "Fetch"),
      NXUI.Storage().model("products").count("id", "Fetch"),
    ]);

    return {
      totalUsers,
      totalRevenue,
      totalProducts,
    };
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    return null;
  }
}
```

### **3. E-commerce Product Management**

```javascript
// Get products with categories
async function getProductsWithCategories(filters = {}) {
  const query = NXUI.Storage()
    .model("products")
    .select(["products.*", "categories.name as category_name"])
    .join("categories", "products.category_id", "=", "categories.id")
    .where("products.status", "=", "active");

  if (filters.category) {
    query.where("categories.id", "=", filters.category);
  }

  if (filters.priceMin) {
    query.where("products.price", ">=", filters.priceMin);
  }

  if (filters.priceMax) {
    query.where("products.price", "<=", filters.priceMax);
  }

  if (filters.search) {
    query.whereLike("products.name", `%${filters.search}%`);
  }

  query.orderBy("products.name", "ASC");

  const rows = await query.get("Fetch");
  return rows;
}

// Get product statistics
async function getProductStats() {
  try {
    const [totalProducts, avgPrice, maxPrice, minPrice] = await Promise.all([
      NXUI.Storage().model("products").count("id", "Fetch"),
      NXUI.Storage().model("products").avg("price", "Fetch"),
      NXUI.Storage().model("products").max("price", "Fetch"),
      NXUI.Storage().model("products").min("price", "Fetch"),
    ]);

    return {
      totalProducts,
      avgPrice,
      maxPrice,
      minPrice,
    };
  } catch (error) {
    console.error("Error loading product stats:", error);
    return null;
  }
}
```

<a id="integration-dengan-nxui-components"></a>

## 🔧 **Integration dengan NXUI Components**

### **1. NexaTabel Integration**

```javascript
// Load data untuk NexaTabel
async function loadTableData() {
  const query = NXUI.Storage()
    .model("users")
    .select(["id", "name", "email", "status"])
    .where("active", "=", 1)
    .orderBy("name", "ASC");

  try {
    const rows = await query.get("Fetch");

    // Render ke NexaTabel
    const table = new NXUI().NexaTabel();
    table.render("#users-table", rows);

    return rows;
  } catch (error) {
    console.error("Error loading table data:", error);
    return null;
  }
}
```

### **2. NexaModal Integration**

```javascript
// Load data untuk modal form
async function loadUserForm(userId) {
  const query = NXUI.Storage()
    .model("users")
    .select(["*"])
    .where("id", "=", userId);

  try {
    const row = await query.first("Fetch");

    if (row) {
      // Tampilkan modal dengan data
      NXUI().nexaModal.open("user-form", row);
    } else {
      console.error("User not found");
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}
```

### **3. NexaFilter Integration**

```javascript
// Setup filter untuk data
function setupDataFilter() {
  const query = NXUI.Storage()
    .model("users")
    .select(["id", "name", "email", "department_id"]);

  // Setup filter
  const filter = new NXUI().NexaFilter();
  filter.setup("#filter-container", {
    data: query,
    filters: [
      { field: "name", type: "text", placeholder: "Search by name" },
      { field: "department_id", type: "select", options: departmentOptions },
      { field: "status", type: "select", options: statusOptions },
    ],
    onFilter: (filteredData) => {
      // Update table dengan filtered data
      updateTable(filteredData);
    },
  });
}
```

<a id="best-practices"></a>

## 🛠️ **Best Practices**

### **1. Query Optimization**

```javascript
// ✅ Good: Select only needed columns
query.select(["id", "name", "email"]);

// ❌ Bad: Select all columns
query.select("*");

// ✅ Good: Use indexes
query.where("status", "=", "active").where("department_id", "=", 1);

// ❌ Bad: Use functions in WHERE
query.where("UPPER(name)", "=", "JOHN");
```

### **2. Error Handling**

```javascript
// ✅ Good: Proper error handling
try {
  const rows = await query.get("Fetch");
  return rows;
} catch (error) {
  console.error("Query failed:", error);
  return null;
}

// ❌ Bad: No error handling
const rows = await query.get("Fetch");
```

### **3. Security**

```javascript
// ✅ Good: Use prepared statements
query.where("name", "=", userInput);

// ❌ Bad: Direct string concatenation
query.rawSql(`SELECT * FROM users WHERE name = '${userInput}'`);
```

### **4. Performance**

```javascript
// ✅ Good: Use pagination for large datasets
query.paginate(1, 10, "Fetch");

// ❌ Bad: Load all data at once
query.get("Fetch");

// ✅ Good: Use appropriate indexes
query.where("status", "=", "active").where("created_at", ">", "2024-01-01");

// ❌ Bad: Use functions in WHERE clauses
query.where("YEAR(created_at)", "=", 2024);
```

<a id="api-reference"></a>

## 📚 **API Reference**

### **Constructor (internal / library)**

```javascript
new NexaModels((secretKey = "nexa-default-secret-key-2025"));
```

Di aplikasi, mulai query dari **`NXUI.Storage().model("nama_tabel")`**; jangan menginstansiasi `NexaModels` langsung kecuali untuk pengembangan inti library.

### **Table Methods**

- `table(tableName)` - Set table name
- `from(tableName)` - Alias untuk table
- `Storage(tableName)` - Alias untuk table

### **Selection Methods**

- `select(columns)` - Select columns
- `except(columns)` - Exclude columns
- `noSensitive()` - Exclude sensitive fields
- `noTimestamps()` - Exclude timestamp fields
- `noSystem()` - Exclude system fields

### **WHERE Methods**

- `where(column, operator, value, boolean)` - Basic WHERE
- `orWhere(column, operator, value)` - OR WHERE
- `whereIn(column, values, boolean)` - WHERE IN
- `whereNotIn(column, values, boolean)` - WHERE NOT IN
- `whereBetween(column, values, boolean)` - WHERE BETWEEN
- `whereNotBetween(column, values, boolean)` - WHERE NOT BETWEEN
- `whereNull(column, boolean)` - WHERE NULL
- `whereNotNull(column, boolean)` - WHERE NOT NULL
- `whereLike(column, value, boolean)` - WHERE LIKE
- `orWhereLike(column, value)` - OR WHERE LIKE

### **Date Methods**

- `whereDate(column, operator, value, boolean)` - WHERE DATE
- `whereYear(column, operator, value, boolean)` - WHERE YEAR
- `whereMonth(column, operator, value, boolean)` - WHERE MONTH
- `whereDay(column, operator, value, boolean)` - WHERE DAY

### **JOIN Methods**

- `join(table, first, operator, second, type)` - JOIN
- `leftJoin(table, first, operator, second)` - LEFT JOIN
- `rightJoin(table, first, operator, second)` - RIGHT JOIN
- `innerJoin(table, first, operator, second)` - INNER JOIN

### **Order & Group Methods**

- `orderBy(column, direction)` - ORDER BY
- `latest(column)` - ORDER BY DESC
- `oldest(column)` - ORDER BY ASC
- `inRandomOrder()` - Random order
- `groupBy(columns)` - GROUP BY
- `having(column, operator, value)` - HAVING

### **Limit Methods**

- `limit(limit)` - LIMIT
- `offset(offset)` - OFFSET
- `take(value)` - Alias untuk limit
- `skip(value)` - Alias untuk offset

### **SQL Generation Methods**

- `toSql()` - Generate SQL string
- `toSqlWithBindings()` - Generate SQL with bindings
- `toSqlWithParams()` - Generate SQL with parameters
- `getBindings()` - Get bindings array

### **API Methods**

- `get(endpoint, options)` - GET request
- `post(endpoint, options)` - POST request
- `insert(data, endpoint, options)` - INSERT data
- `update(data, endpoint, options)` - UPDATE data
- `delete(endpoint, options)` - DELETE request
- `paginate(page, perPage, endpoint, options)` - Paginated request

### **Utility Methods**

- `clone()` - Clone query
- `reset()` - Reset query
- `dump()` - Debug query
- `dd()` - Dump and die
- `inspect()` - Get query info

<a id="troubleshooting"></a>

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Query tidak menghasilkan hasil**

   - Pastikan table name benar
   - Cek WHERE conditions
   - Pastikan data ada di database

2. **Error SQL injection**

   - Gunakan prepared statements
   - Jangan concatenate string langsung

3. **Performance issues**

   - Gunakan pagination
   - Select hanya kolom yang diperlukan
   - Gunakan indexes yang tepat

4. **Memory issues**
   - Gunakan chunking untuk data besar
   - Clear query setelah digunakan

### **Debug Tips**

```javascript
// Debug query
console.log(query.toSql());
console.log(query.getBindings());

// Debug dengan dump
query.dump();

// Debug dengan inspect
console.log(query.inspect());
```

<a id="license"></a>

## 📄 **License**

NexaModels.js adalah bagian dari NexaUI Framework dan dilisensikan under MIT License.

<a id="contributing"></a>

## 🤝 **Contributing**

Untuk berkontribusi pada NexaModels, silakan:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

<a id="support"></a>

## 📞 **Support**

Untuk dukungan dan pertanyaan:

- GitHub Issues: [NexaUI Repository]
- Documentation: [NexaUI Docs]
- Community: [NexaUI Community]

---

**NexaModels.js** - Powerful, Secure, and Easy-to-Use SQL Query Builder for JavaScript
