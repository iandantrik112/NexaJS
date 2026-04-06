/** Hanya untuk Node (index.js). Browser: window.__NEXA_ENDPOINT__ dari HTML — GET /config.js diblokir. */
'use strict';

module.exports = {
  url: 'http://localhost:4007',
  electronInitialPath: '/beranda',
  urlApi: 'http://localhost/api',
  drive: 'http://localhost/assets/drive',
  Ollama:'http://localhost:11434/api/generate',
  typicode: 'https://jsonplaceholder.typicode.com/photos',
  firebaseConfig: {
    apiKey: 'AIzaSyA0XUCGzsK7hhg8NmxisslthTeOU93dORA',
    authDomain: 'nexaui-86863.firebaseapp.com',
    databaseURL: 'https://nexaui-86863-default-rtdb.firebaseio.com',
    projectId: 'nexaui-86863',
    storageBucket: 'nexaui-86863.firebasestorage.app',
    messagingSenderId: '1034885626532',
    appId: '1:1034885626532:web:64272a0e491f944dd04431',
  },
};
