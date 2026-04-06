/** Hanya untuk Node (index.js). Browser dapat endpoint lewat window.__NEXA_ENDPOINT__ di HTML — GET /config.js diblokir. */
const config = { 
  url: "http://localhost:8003",
  urlApi: "http://localhost:/api",
  drive: "http://localhost/assets/drive",
  typicode: "https://jsonplaceholder.typicode.com/photos",
  firebaseConfig: {
    apiKey: "AIzaSyA0XUCGzsK7hhg8NmxisslthTeOU93dORA",
    authDomain: "nexaui-86863.firebaseapp.com",
    databaseURL: "https://nexaui-86863-default-rtdb.firebaseio.com",
    projectId: "nexaui-86863",
    storageBucket: "nexaui-86863.firebasestorage.app",
    messagingSenderId: "1034885626532",
    appId: "1:1034885626532:web:64272a0e491f944dd04431",
  },
};

export default config;
