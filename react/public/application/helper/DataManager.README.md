# DataManager Class

Class untuk menangani semua logika bisnis data management. User hanya perlu fokus pada pengembangan UI.

## Instalasi

```javascript
import { DataManager } from "../helper/DataManager";
```

## Penggunaan Dasar

```javascript
// Initialize DataManager
const dataManager = new DataManager({
  pkg: { token: 'your-token' },
  userData: { user_id: 1 },
  limit: 5,
  onDataChange: (data) => {
    // Handle data change
    console.log('Data updated:', data);
  },
  onFetchingChange: (isFetching) => {
    // Handle loading state
    setLoading(isFetching);
  },
  onError: (error) => {
    // Handle error
    console.error('Error:', error);
  }
});

// Fetch data
await dataManager.fetchData(1, 'search term');
```

## API Methods

### Data Operations

#### `fetchData(page, searchTerm)`
Fetch data dari server.

```javascript
await dataManager.fetchData(1); // Fetch page 1
await dataManager.fetchData(2, 'keyword'); // Fetch page 2 dengan search
```

#### `search(keyword)`
Search data dan reset ke page 1.

```javascript
await dataManager.search('keyword');
```

#### `clearSearch()`
Clear search dan refresh data.

```javascript
await dataManager.clearSearch();
```

#### `deleteItem(itemId)`
Delete item dari server.

```javascript
const result = await dataManager.deleteItem(123);
if (result.success) {
  console.log('Deleted successfully');
}
```

#### `refresh()`
Refresh data di halaman saat ini.

```javascript
await dataManager.refresh();
```

### Navigation

#### `setPage(page)`
Set current page dan fetch data.

```javascript
dataManager.setPage(2);
```

#### `setSearchKeyword(keyword)`
Set search keyword (tidak auto-fetch).

```javascript
dataManager.setSearchKeyword('keyword');
```

### Getters

#### `getData()`
Get raw data array.

```javascript
const data = dataManager.getData();
```

#### `getFields()`
Get fields array.

```javascript
const fields = dataManager.getFields();
```

#### `getColumns()`
Get columns array.

```javascript
const columns = dataManager.getColumns();
```

#### `getProcessedForm()`
Get processed form object.

```javascript
const form = dataManager.getProcessedForm();
```

#### `getDataInfo()`
Get pagination info.

```javascript
const info = dataManager.getDataInfo();
// { count, totalCount, totalPages, currentPage, success }
```

#### `getAccess()`
Get access control.

```javascript
const access = dataManager.getAccess();
// { update: 1, delete: 1 }
```

#### `getCurrentPage()`
Get current page number.

```javascript
const page = dataManager.getCurrentPage();
```

#### `getSearchKeyword()`
Get current search keyword.

```javascript
const keyword = dataManager.getSearchKeyword();
```

#### `isFetching()`
Get fetching state.

```javascript
const loading = dataManager.isFetching();
```

## Callbacks

### `onDataChange(data)`
Dipanggil ketika data berubah.

```javascript
onDataChange: (data) => {
  setData(data.data);           // Raw data array
  setFields(data.fields);       // Fields array
  setColumns(data.columns);     // Columns array
  setForm(data.form);           // Processed form
  setDataInfo(data.dataInfo);  // Pagination info
  setUpdateAccess(data.access.update);  // Update access
  setDeleteAccess(data.access.delete);  // Delete access
}
```

### `onFetchingChange(isFetching)`
Dipanggil ketika fetching state berubah.

```javascript
onFetchingChange: (isFetching) => {
  setLoading(isFetching);
}
```

### `onError(error)`
Dipanggil ketika terjadi error.

```javascript
onError: (error) => {
  Alert.alert('Error', error.message);
}
```

## Contoh Penggunaan dengan React Hook

```javascript
import { useState, useEffect } from 'react';
import { DataManager } from './DataManager';

const MyCustomDataComponent = ({ pkg, userData }) => {
  const [data, setData] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataInfo, setDataInfo] = useState(null);

  const [dataManager] = useState(() => {
    return new DataManager({
      pkg: pkg,
      userData: userData,
      limit: 10,
      onDataChange: (result) => {
        setData(result.data);
        setFields(result.fields);
        setDataInfo(result.dataInfo);
      },
      onFetchingChange: (isFetching) => {
        setLoading(isFetching);
      },
      onError: (error) => {
        console.error('Error:', error);
      }
    });
  });

  useEffect(() => {
    if (pkg?.token) {
      dataManager.fetchData(1);
    }
  }, [pkg?.token]);

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        data?.map((item) => (
          <View key={item.id}>
            {/* Custom UI untuk setiap item */}
          </View>
        ))
      )}
    </View>
  );
};
```

## Keuntungan

1. **Separation of Concerns**: Logika bisnis terpisah dari UI
2. **Reusable**: Bisa digunakan di berbagai komponen dengan UI berbeda
3. **Maintainable**: Perubahan logika hanya di satu tempat
4. **Testable**: Class bisa di-test secara terpisah
5. **Flexible**: User bebas membuat UI sesuai kebutuhan

