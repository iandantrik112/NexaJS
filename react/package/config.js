const hosts = "http://192.168.1.17:8000";
const Server = {
  API_URL: hosts + "/api",
  API_Models: hosts + "/api/models",
  FILE_URL: hosts,
};

// Firebase Configuration
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

// Export both configurations
export default Server;
export { FirebaseConfig };
