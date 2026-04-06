# NexaEvent - Event Handling System

Sistem penanganan event yang elegant dengan event delegation, handler registration, dan localStorage audit trail untuk melacak setiap user action.

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Cara Kerja](#cara-kerja)
3. [API Reference](#api-reference)
4. [Contoh Penggunaan](#contoh-penggunaan)
5. [Best Practices](#best-practices)
6. [Use Cases](#use-cases)

---

## Overview

**NexaEvent** adalah event handling system yang:

- ✅ Menggunakan **event delegation** (1 listener di document, bukan per-element)
- ✅ Otomatis register handler ke `window` object
- ✅ Simpan data event ke `localStorage` untuk audit trail
- ✅ Prevent duplikasi event listener dengan flag detection
- ✅ Terintegrasi dengan global `NXUI` object

### Fitur Utama

| Fitur                    | Deskripsi                                   |
| ------------------------ | ------------------------------------------- |
| **Event Delegation**     | Handle click events pada document level     |
| **Handler Registration** | Register function ke window secara otomatis |
| **Storage Caching**      | Simpan setiap action ke localStorage        |
| **Timestamp Tracking**   | Otomatis catat waktu setiap event           |
| **Duplicate Prevention** | Cegah setup event listener berulang         |

---

## Cara Kerja

### Alur Dasar

```
1. User klik element dengan id="buttonClick"
   ↓
2. handleClick event listener trigger di document
   ├─ Extract element ID & attributes
   └─ Cek apakah handler terdaftar di window
   ↓
3. Jika ada window.buttonClick → jalankan handler
   ├─ Simpan data event ke localStorage.handler_buttonClick
   └─ Eksekusi custom logic
   ↓
4. Data tersimpan untuk audit trail
```

### Alur Detail dengan Code

```javascript
// 1. HTML dengan id & key attribute
<button id="saveClick" key="user-123">
  Save
</button>;

// 2. Register handler
eventSystem.register({
  saveClick: (data) => console.log("Save:", data),
});

// 3. Aktifkan event delegation
eventSystem.Handler();

// 4. User klik → event trigger
// Event listener catch click → cari window.saveClick
// setHandler('saveClick', {id: 'saveClick', key: 'user-123', ...})
// handler dijalankan
// localStorage.handler_saveClick = {...}
```

---

## API Reference

### `NexaEvent()`

Factory function yang mengembalikan event system object.

```javascript
const eventSystem = NXUI.Event();
```

#### Methods

---

### `eventSystem.Handler()`

Setup event delegation pada `document` level. Hanya perlu dipanggil sekali.

```javascript
const eventSystem = NXUI.Event();
eventSystem.Handler(); // Aktifkan event delegation
```

**Fitur:**

- Cegah duplikasi dengan flag `isEventDelegationActive`
- Delegate click event ke document
- Automatic handler lookup dari `window[elementId]`

---

### `eventSystem.register(handlers)`

Register multiple handlers sekaligus ke window object.

```javascript
eventSystem.register({
  saveClick: (data) => {
    /* ... */
  },
  deleteClick: (data) => {
    /* ... */
  },
  editClick: (data) => {
    /* ... */
  },
});
```

**Parameter:**

- `handlers` _(object)_ - Key: handler name, Value: function
  - Handler function menerima parameter: `data`

**Data Object Structure:**

```javascript
{
  id: string,              // Element's key attribute
  type: string,            // Element's id (handler name)
  attributes: object,      // Element's NamedNodeMap
  element: HTMLElement     // Referensi ke element
}
```

---

### `eventSystem.Handler()`

Aktifkan event delegation pada document.

```javascript
eventSystem.Handler();
```

**Proses:**

1. Cek apakah sudah aktif (`isEventDelegationActive`)
2. Setup click listener di `document`
3. Set flag `isEventDelegationActive = true`

---

### `eventSystem.getHandler(name)`

Ambil data event yang tersimpan di localStorage.

```javascript
const lastClickData = eventSystem.getHandler("saveClick");
console.log(lastClickData);
// {
//   id: "user-123",
//   type: "saveClick",
//   timestamp: "2026-04-04T10:30:00Z",
//   attributes: {...}
// }
```

**Return:**

- Data object jika ada, `null` jika tidak ada

---

### `eventSystem.setHandler(name, data)`

Simpan event data ke localStorage.

```javascript
eventSystem.setHandler("customEvent", {
  userId: 1,
  action: "custom_action",
});
```

**Otomatis menambahkan:**

- `timestamp` (ISO string)
- `attributes` (jika input adalah NamedNodeMap)

---

### `eventSystem.reset()`

Reset semua state (clear listeners & registered elements).

```javascript
eventSystem.reset();
// isEventDelegationActive = false
// registeredElementHandlers.clear()
```

---

### `eventSystem.getStatus()`

Get current status dari event system.

```javascript
const status = eventSystem.getStatus();
console.log(status);
// {
//   delegationActive: true,
//   registeredElements: 5
// }
```

---

## Contoh Penggunaan

### Contoh 1: Contact Management

```html
<!-- HTML -->
<button id="addContactClick">Add Contact</button>
<button id="editClick" key="user-1">Edit</button>
<button id="deleteClick" key="user-1">Delete</button>
```

```javascript
// JavaScript
const eventSystem = NXUI.Event();

eventSystem.register({
  addContactClick: (data) => {
    console.log("Add contact clicked");
    openAddModal();
  },
  editClick: (data) => {
    const userId = data.id;
    console.log("Edit user:", userId);
    openEditModal(userId);
  },
  deleteClick: (data) => {
    const userId = data.id;
    if (confirm("Delete user " + userId + "?")) {
      deleteUser(userId);
    }
  },
});

eventSystem.Handler(); // Aktifkan
```

---

### Contoh 2: Table Actions

```html
<table>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>
        <button id="viewClick" key="1">View</button>
        <button id="editClick" key="1">Edit</button>
        <button id="deleteClick" key="1">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

```javascript
const eventSystem = NXUI.Event();

eventSystem.register({
  viewClick: (data) => viewRecord(data.id),
  editClick: (data) => editRecord(data.id),
  deleteClick: (data) => deleteRecord(data.id),
});

eventSystem.Handler();
```

---

### Contoh 3: Audit Trail & Logging

```javascript
const eventSystem = NXUI.Event();

eventSystem.register({
  submitClick: (data) => {
    // Simpan event ke localStorage
    eventSystem.setHandler("lastSubmit", {
      user: getCurrentUser(),
      timestamp: new Date().toISOString(),
      action: "form_submit",
    });

    // Atau ambil history
    const history = eventSystem.getHandler("lastSubmit");
    console.log("Last submit:", history);
  },
});

eventSystem.Handler();
```

---

### Contoh 4: Conditional Handling

```javascript
const eventSystem = NXUI.Event();

eventSystem.register({
  confirmClick: (data) => {
    const action = data.element.dataset.action;

    if (action === "delete") {
      if (confirm("Sure?")) {
        performDelete();
      }
    } else if (action === "save") {
      performSave();
    }
  },
});

eventSystem.Handler();
```

---

## Best Practices

### ✅ DO

1. **Gunakan semantic element IDs**

   ```html
   <!-- Good -->
   <button id="saveClick">Save</button>
   <button id="deleteClick" key="item-1">Delete</button>

   <!-- Bad -->
   <button id="btn1">Save</button>
   <button id="b2" key="item-1">Delete</button>
   ```

2. **Register semua handler di awal**

   ```javascript
   const eventSystem = NXUI.Event();

   // Register semua handler dulu
   eventSystem.register({...});

   // Baru aktifkan
   eventSystem.Handler();
   ```

3. **Gunakan key attribute untuk data identifiers**

   ```html
   <button id="editClick" key="user-123">Edit</button>
   ```

4. **Simpan sensitive data secara aman**
   ```javascript
   // Encrypt sebelum simpan
   const encrypted = NXUI.NexaCrypto.encode(sensitiveData);
   eventSystem.setHandler("secure_data", { encrypted });
   ```

---

### ❌ DON'T

1. **Jangan register handler multiple times**

   ```javascript
   // Bad - redundant
   eventSystem.Handler();
   eventSystem.Handler();
   eventSystem.Handler();
   ```

2. **Jangan hard-code data di handler**

   ```javascript
   // Bad
   const editClick = () => {
     editRecord("user-123"); // Hard-coded
   };

   // Good
   const editClick = (data) => {
     editRecord(data.id); // Dynamic dari data
   };
   ```

3. **Jangan store sensitive data di localStorage tanpa encrypt**

   ```javascript
   // Bad
   localStorage.setItem("userToken", token);

   // Good
   const encrypted = NXUI.NexaCrypto.encode(token);
   localStorage.setItem("userToken", encrypted);
   ```

---

## Use Cases

### 1. **CRUD Operations**

Manage Create, Read, Update, Delete dengan single event delegation.

```javascript
const eventSystem = NXUI.Event();

eventSystem.register({
  createClick: createRecord,
  readClick: readRecord,
  updateClick: updateRecord,
  deleteClick: deleteRecord,
});

eventSystem.Handler();
```

---

### 2. **Modal/Dialog Interactions**

Open, close, save modal dengan centralized handler.

```javascript
eventSystem.register({
  openModalClick: (data) => {
    const modalId = data.element.dataset.modal;
    NXUI.Modal(modalId).open();
  },
  closeModalClick: (data) => {
    NXUI.Modal(data.element.dataset.modal).close();
  },
  saveModalClick: (data) => {
    saveFormData(data.element.dataset.formId);
  },
});
```

---

### 3. **Form Validation & Submission**

Handle form actions dengan validation.

```javascript
eventSystem.register({
  submitClick: (data) => {
    if (validateForm()) {
      submitForm(data.element.form);
    } else {
      showValidationErrors();
    }
  },
});
```

---

### 4. **Audit & Compliance**

Log setiap user action untuk compliance.

```javascript
eventSystem.register({
  "*Click": (data) => {
    // Catch semua click
    logAuditTrail({
      action: data.type,
      user: getCurrentUser(),
      timestamp: new Date().toISOString(),
      details: data,
    });
  },
});
```

---

### 5. **Undo/Redo History**

Maintain action history untuk undo/redo functionality.

```javascript
const actionHistory = [];

eventSystem.register({
  saveClick: (data) => {
    actionHistory.push({
      action: "save",
      data: data,
      timestamp: Date.now(),
    });
    updateUndoRedoButtons();
  },
});
```

---

## localStorage Data Structure

Setiap event disimpan dengan format:

```javascript
// localStorage.handler_[handlerName]
{
  "id": "element-key",           // Data identifier
  "type": "handlerName",          // Handler function name
  "timestamp": "2026-04-04T...",  // ISO timestamp
  "attributes": {                 // Element attributes
    "id": "handlerName",
    "key": "element-key",
    "class": "btn btn-primary",
    // ... other attributes
  }
}
```

---

## Integration dengan NXUI

NexaEvent sudah terintegrasi dengan `NXUI` global object:

```javascript
// Akses dari mana saja
const eventSystem = NXUI.Event();

// Setelah register & Handler(), bisa akses handler data
const lastAction = eventSystem.getHandler("saveClick");
```

---

## Troubleshooting

### Handler tidak dipanggil

**Masalah:** Button diklik tapi handler tidak dijalankan.

**Solusi:**

1. Pastikan `eventSystem.Handler()` sudah dipanggil
2. Pastikan handler name match dengan button id
3. Periksa di DevTools apakah `window.handlerName` ada

```javascript
// Debug
console.log(window.saveClick); // Should be function
console.log(eventSystem.getStatus()); // Check delegation status
```

---

### Data tidak tersimpan di localStorage

**Masalah:** `eventSystem.getHandler()` return null.

**Solusi:**

1. Pastikan handler dijalankan (check console.log)
2. Periksa localStorage quota (mungkin penuh)
3. Cek apakah browser allow localStorage

```javascript
// Check localStorage
console.log(localStorage.handler_saveClick);

// Clear old data jika penuh
localStorage.clear();
```

---

## Performance Tips

1. **Batch register handlers**

   ```javascript
   // Good - 1 registration
   eventSystem.register({ a: fn1, b: fn2, c: fn3 });

   // Bad - multiple registrations
   registerHandler("a", fn1);
   registerHandler("b", fn2);
   registerHandler("c", fn3);
   ```

2. **Use event delegation (default)**
   - 1 listener di document = lebih cepat
   - Tidak perlu add listener ke setiap element

3. **Clean up unused handlers**
   ```javascript
   eventSystem.reset(); // Clear semua saat route berubah
   ```

---

## Lihat Juga

- [NexaDom.md](NexaDom.md) - DOM manipulation
- [NexaForm.md](form.md) - Form handling
- [NexaModal.md](modal.md) - Modal dialogs
- [NexaGlobal.md](NexaGlobal.md) - Global event handling

---

**Last Updated:** April 4, 2026  
**Version:** 1.0.0
