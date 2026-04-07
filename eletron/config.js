/** Hanya untuk Node (index.js). Browser: window.__NEXA_ENDPOINT__ dari HTML — GET /config.js diblokir. */
'use strict';

module.exports = {
  url: "http://127.0.0.1:3100",
  urlApi: "http://localhost:/api",        //  url jika menggunakan drive backend Nexa Dom Framework
  drive: "http://localhost/assets/drive", // url jika menggunakan drive backend Nexa Dom Framework
  typicode: "https://jsonplaceholder.typicode.com/photos",// url typicode backend umum baca dokuentasi NXUI.Storage().api(row, body)
  firebaseConfig:false, // jika tidak menggunakan firebase backend maka isi dengan false
  // Baca dokumentasi NXUI.Inisiasi: App.js
  // sesuaikan dengan backend yang digunakan degan nama yan kamu butuhkan dan cek di NEXA.apikamu
  // variabel apikamu:'http://localhost:/api_kamu';
  // variabel apidrive_kamu:'http://localhost/assets/drive_kamu';

};

