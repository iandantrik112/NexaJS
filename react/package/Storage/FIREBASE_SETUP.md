# Firebase Setup untuk React Native

## 📦 Instalasi Dependencies

Untuk menggunakan `NexaFirebase.js` di React Native, Anda perlu menginstal dependencies berikut:

### 1. Install React Native Firebase

```bash
npm install @react-native-firebase/app @react-native-firebase/database @react-native-firebase/auth @react-native-firebase/storage
```

### 2. Install Pod Dependencies (iOS)

```bash
cd ios && pod install && cd ..
```

## 🔧 Konfigurasi Firebase

### Android Setup

1. Download `google-services.json` dari Firebase Console
2. Letakkan di `android/app/google-services.json`
3. Edit `android/build.gradle`:

```gradle
buildscript {
  dependencies {
    // ... other dependencies
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

4. Edit `android/app/build.gradle`:

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // <-- Add this line
```

### iOS Setup

1. Download `GoogleService-Info.plist` dari Firebase Console
2. Letakkan di `ios/[YourAppName]/GoogleService-Info.plist`
3. Edit `ios/Podfile`:

```ruby
platform :ios, '13.0'

target 'YourAppName' do
  # ... other pods
  
  # Firebase
  pod 'Firebase/Auth'
  pod 'Firebase/Database'
  pod 'Firebase/Storage'
end
```

4. Run `pod install` di folder `ios/`

## 📝 Konfigurasi di `config.js`

File `config.js` sudah berisi konfigurasi Firebase:

```javascript
const FirebaseConfig = {
  apiKey: "AIzaSyA0XUCGzsK7hhg8NmxisslthTeOU93dORA",
  authDomain: "nexaui-86863.firebaseapp.com",
  databaseURL: "https://nexaui-86863-default-rtdb.firebaseio.com",
  projectId: "nexaui-86863",
  storageBucket: "nexaui-86863.firebasestorage.app",
  messagingSenderId: "1034885626532",
  appId: "1:1034885626532:web:64272a0e491f944dd04431",
  measurementId: "G-REZVBSZ6KR",
};
```

## 🚀 Penggunaan

### Inisialisasi Firebase

```javascript
import FirebaseManager from './package/Storage/NexaFirebase';

// Initialize Firebase
const db = FirebaseManager.init();

// Atau dengan konfigurasi kustom
const db = FirebaseManager.init({
  apiKey: "your-api-key",
  // ... konfigurasi lainnya
});
```

### CRUD Operations

```javascript
// Create/Update data
await db.set('users', {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com'
});

// Read data
const user = await db.get('users', 'user1');

// Get all data
const allUsers = await db.getAll('users');

// Update specific fields
await db.updateField('users', 'user1', 'name', 'Jane Doe');

// Delete data
await db.delete('users', 'user1');
```

### Real-time Updates

```javascript
// Watch for changes
const unwatch = db.watch('users', (data) => {
  console.log('Users updated:', data);
});

// Stop watching
unwatch();
```

### Search & Filter

```javascript
// Search across all fields
const results = await db.search('users', 'john');

// Search specific fields
const results = await db.search('users', 'john', ['name', 'email']);

// Get latest records
const latest = await db.getLatest('users', 5);

// Get oldest records
const oldest = await db.getOldest('users', 5);
```

### Export/Import

```javascript
// Export all data
const exportData = await db.export();

// Export specific stores
const exportData = await db.export(['users', 'posts']);

// Import data
await db.import(exportData);
```

## 🔐 Authentication (Opsional)

```javascript
import auth from '@react-native-firebase/auth';

// Sign in
const userCredential = await auth().signInWithEmailAndPassword(
  'email@example.com',
  'password'
);

// Sign out
await auth().signOut();

// Auth state listener
auth().onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});
```

## 📊 Storage (Upload File)

```javascript
import storage from '@react-native-firebase/storage';

// Upload file
const reference = storage().ref('path/to/file.jpg');
await reference.putFile(localFilePath);

// Get download URL
const url = await reference.getDownloadURL();
```

## ⚠️ Perbedaan dengan Versi Web

| Fitur | Web | React Native |
|-------|-----|--------------|
| Import Module | CDN (`https://www.gstatic...`) | NPM Package (`@react-native-firebase/*`) |
| Database API | `ref()`, `set()`, `get()` dari firebase SDK | `database().ref()` dari RN Firebase |
| Cross-tab Sync | BroadcastChannel | Tidak tersedia (tidak diperlukan) |
| File Export | `exportToFile()` | Tidak didukung (gunakan sharing API) |
| Real-time | `onValue()` | `.on('value')` |

## 🐛 Troubleshooting

### Error: "Firebase not initialized"
- Pastikan Anda memanggil `FirebaseManager.init()` sebelum menggunakan database
- Periksa konfigurasi Firebase di `config.js`

### Error: "Module not found: @react-native-firebase/app"
- Jalankan `npm install @react-native-firebase/app`
- Untuk iOS, jalankan `cd ios && pod install`

### Android Build Error
- Pastikan `google-services.json` ada di `android/app/`
- Pastikan Google Services plugin sudah ditambahkan di `build.gradle`

### iOS Build Error
- Pastikan `GoogleService-Info.plist` ada di `ios/[AppName]/`
- Jalankan `pod install` di folder `ios/`
- Clean build: `cd ios && rm -rf Pods && pod install`

## 📚 Referensi

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)

## 🎯 Best Practices

1. **Cleanup**: Selalu panggil `db.cleanup()` saat component unmount
2. **Error Handling**: Gunakan `db.safe()` untuk error handling otomatis
3. **Real-time**: Gunakan `watch()` untuk data yang sering berubah
4. **Polling**: Gunakan `startPolling()` untuk data yang jarang berubah
5. **Batch Operations**: Gunakan `batchUpdate()` untuk operasi multiple data

---

✅ **NexaFirebase.js** siap digunakan di React Native!
