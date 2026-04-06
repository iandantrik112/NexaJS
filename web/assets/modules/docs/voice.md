# NexaVoice Documentation

## Overview

**NexaVoice** adalah sistem text-to-speech dan speech recognition terintegrasi yang mendukung pengucapan teks dalam bahasa Indonesia dan bahasa lainnya. Sistem ini dirancang untuk aksesibilitas, pembelajaran interaktif, dan berbagai use case modern.

### Fitur Utama

- ✅ **Text-to-Speech (TTS)** - Mengubah teks menjadi ucapan dengan suara natural
- ✅ **Speech Recognition (STT)** - Mendengarkan dan mengubah suara menjadi teks
- ✅ **Long Text Support** - Mendukung teks panjang hingga ribuan kata
- ✅ **Offline Mode** - Vosk untuk speech recognition offline (Electron)
- ✅ **Volume & Speed Control** - Pengaturan kecepatan dan volume suara
- ✅ **Multi-Language** - Mendukung Bahasa Indonesia dan bahasa lainnya
- ✅ **Browser Compatible** - Bekerja di browser modern dengan Web Speech API
- ✅ **Responsive Design** - Button dan kontrol responsif

---

## Instalasi & Setup

### 1. Instalasi ResponsiveVoice (untuk TTS)

NexaVoice menggunakan **ResponsiveVoice** untuk text-to-speech berkualitas tinggi dengan suara Indonesia natural.

```javascript
const voice = new NXUI.NexaVoice({
  useResponsiveVoice: true,
  responsiveVoiceKey: "16D1IGr5", // API key
});
```

**Daftar API Key**: Kunjungi [ResponsiveVoice](https://responsivevoice.org/) untuk mendapatkan API key gratis.

### 2. Setup untuk Electron (Vosk Offline)

Untuk speech recognition offline di Electron, pasang Vosk model:

```bash
npm install vosk mic
npm run rebuild:vosk
```

**Struktur folder model**:

```
project/
  models/
    vosk-model-small-id/  # Bahasa Indonesia
      model
      conf
      ...
```

**Setup di Electron Preload**:

```javascript
// preload.js
const { contextBridge, ipcMain } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  voskStatus: () => ipcRenderer.invoke("vosk:status"),
  voskStart: () => ipcRenderer.invoke("vosk:start"),
  voskStop: () => ipcRenderer.invoke("vosk:stop"),
  voskSubscribe: (callbacks) => {
    ipcRenderer.on("vosk:partial", (e, d) => callbacks.onPartial(d));
    ipcRenderer.on("vosk:final", (e, d) => callbacks.onFinal(d));
    ipcRenderer.on("vosk:error", (e, d) => callbacks.onError(d));
  },
});
```

---

## Usage / Penggunaan

### Basic Text-to-Speech

```javascript
// Inisialisasi NexaVoice
const voice = new NXUI.NexaVoice({
  useResponsiveVoice: true,
  responsiveVoiceKey: "YOUR_API_KEY",
});

// Bicara teks sederhana
voice.speak("Halo, selamat datang di NexaVoice!");

// Bicara teks panjang (otomatis chunked)
const longText = `
  Selamat datang di demonstrasi NexaVoice...
  [teks panjang...]
`;
voice.speak(longText);
```

### Event Handling

```javascript
// Saat TTS mulai
voice.onStart = () => {
  console.log("🔊 Speech started");
};

// Saat TTS selesai
voice.onEnd = () => {
  console.log("✅ Speech ended");
};

// Saat ada error (misal: interrupted)
voice.onError = (error) => {
  if (error.error === "interrupted") {
    console.log("🔄 Previous speech stopped for new speech");
  } else {
    console.error("❌ Speech error:", error.error);
  }
};
```

### Voice Control

```javascript
// Pause (jeda) suara saat bicara
voice.pause();

// Resume (lanjutkan) suara yang dijeda
voice.resume();

// Stop (hentikan) suara sepenuhnya
voice.stop();

// Cek status
const status = voice.getStatus();
console.log("Is Playing:", status.isPlaying);
console.log("Is Supported:", status.isSupported);
```

### Speech Recognition (Web Speech API)

```javascript
// Tombol untuk mulai/stop listening
document.getElementById("dengar").addEventListener("click", () => {
  if (!isListening) {
    recognition.start(); // Mulai dengarkan
  } else {
    recognition.stop(); // Berhenti dengarkan
  }
});

// Saat hasil pengenalan suara diterima
recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      console.log("✅ Hasil Akhir:", transcript);
      voice.speak(`Saya mendengar: ${transcript}`);
    }
  }
};
```

---

## API Reference

### NexaVoice Constructor Options

```javascript
const voice = new NXUI.NexaVoice({
  // Gunakan ResponsiveVoice untuk TTS
  useResponsiveVoice: true,

  // API key dari ResponsiveVoice
  responsiveVoiceKey: "YOUR_API_KEY",

  // (Optional) Bahasa default
  language: "id",

  // (Optional) Rate (kecepatan) - default 1
  rate: 1.0,

  // (Optional) Pitch (nada) - default 1
  pitch: 1.0,

  // (Optional) Volume - default 1
  volume: 1.0,
});
```

### Voice Methods

| Method        | Description                                    |
| ------------- | ---------------------------------------------- |
| `speak(text)` | Bicara teks (mendukung teks panjang)           |
| `pause()`     | Jeda suara yang sedang diucapkan               |
| `resume()`    | Lanjutkan suara yang dijeda                    |
| `stop()`      | Hentikan suara sepenuhnya                      |
| `getStatus()` | Dapatkan status voice (isPlaying, isSupported) |

### Voice Properties

| Property         | Type     | Description                           |
| ---------------- | -------- | ------------------------------------- |
| `onStart`        | Function | Callback saat speech dimulai          |
| `onEnd`          | Function | Callback saat speech berakhir         |
| `onError`        | Function | Callback saat ada error               |
| `userInteracted` | Boolean  | Flag interaksi user (untuk auto-play) |

---

## UI Components

### Speech Control Buttons

Aplikasi menyediakan berbagai tombol untuk berbagai ekspresi:

| Tombol  | Aksi                     | Emoji |
| ------- | ------------------------ | ----- |
| Sapa    | Mengucapkan sapaan ramah | 👋    |
| Senang  | Ekspresi kesenangan      | 😊    |
| Sedih   | Ekspresi kesedihan       | 😢    |
| Excited | Ekspresi kegembiran      | 🎉    |
| Tenang  | Ajakan untuk rileks      | 😌    |

**Implementasi**:

```html
<button onclick="dengar('Halo! Selamat datang di NexaVoice!');">👋 Sapa</button>
```

### Voice Control Panel

```html
<!-- Kontrol playback -->
<button onclick="voice.pause();">⏸️ Pause</button>
<button onclick="voice.resume();">▶️ Resume</button>
<button onclick="voice.stop();">⏹️ Stop</button>

<!-- Speech recognition -->
<button id="dengar">🎤 Dengar</button>
<button onclick="showStatus();">📊 Status</button>

<!-- Custom text input -->
<textarea
  id="custom-text"
  placeholder="Ketik teks panjang di sini..."
></textarea>
<button onclick="dengar(document.getElementById('custom-text').value);">
  🗣️ Bicara Teks Panjang
</button>
<button onclick="testLongText();">📚 Test Teks Panjang</button>
```

---

## Advanced Features

### Long Text Support

NexaVoice automatically memecah teks panjang menjadi chunks untuk membaca natural:

```javascript
// Teks super panjang (ribuan kata) akan diucapkan secara kontinyu
const veryLongText = `
  Paragraph 1...
  Paragraph 2...
  [..ribuan kata..]
`;

voice.speak(veryLongText);
// NexaVoice secara otomatis:
// 1. Memecah teks menjadi kalimat/paragraf
// 2. Mengucapkan satu per satu
// 3. menghapus pause antar kalimat
```

### Offline Speech Recognition (Vosk)

Untuk Electron dengan Vosk (tanpa perlu internet):

```javascript
// Check Vosk ready status
const status = await window.electronAPI.voskStatus();

if (status.ready) {
  console.log("✅ Vosk siap untuk offline speech recognition");

  // Mulai dengarkan
  await window.electronAPI.voskStart();

  // Subscribe ke events
  window.electronAPI.voskSubscribe({
    onPartial: (data) => {
      console.log("Sedang mendengar:', data.text);
    },
    onFinal: (data) => {
      console.log("Hasil akhir:", data.text);
      voice.speak(`Saya mendengar: ${data.text}`);
    },
    onError: (error) => {
      console.error("Error Vosk:", error.message);
    }
  });

  // Stop listening
  await window.electronAPI.voskStop();
}
```

### Multi-Language Support

```javascript
// Set bahasa untuk speech recognition
recognition.lang = "id-ID"; // Bahasa Indonesia
recognition.lang = "en-US"; // English
recognition.lang = "ja-JP"; // Japanese

// ResponsiveVoice mendukung berbagai bahasa
// Lihat: https://responsivevoice.org/
```

---

## Browser Compatibility

### Web Speech API (Speech Recognition)

| Browser | Support    | Notes          |
| ------- | ---------- | -------------- |
| Chrome  | ✅ Full    | Recommended    |
| Edge    | ✅ Full    | Chromium-based |
| Safari  | ✅ Partial | iOS 14.5+      |
| Firefox | ❌ Limited | Requires flag  |
| Opera   | ✅ Full    | Chromium-based |

### Text-to-Speech

| Browser | Method            | Notes            |
| ------- | ----------------- | ---------------- |
| All     | ResponsiveVoice   | Requires API key |
| Chrome  | Native Web Speech | Fallback option  |
| Safari  | Native Speech     | Limited voices   |

---

## Troubleshooting

### "Audio permission denied"

**Error**: `Speech error: not-allowed`

**Solusi**:

```javascript
voice.onError = (error) => {
  if (error.error === "not-allowed") {
    alert("Izin akses mikrofon diperlukan untuk fungsi speech recognition");
    // Arahkan user ke settings browser
  }
};
```

### Vosk tidak siap (Offline mode)

**Error**: `Vosk belum siap`

**Solusi**:

```bash
# 1. Install dependencies
npm install vosk mic

# 2. Download model Bahasa Indonesia
cd models/
# Download: vosk-model-small-id dari https://alphacephei.com/vosk/models

# 3. Rebuild native modules
npm run rebuild:vosk

# 4. Windows: Install SoX untuk mic access
# Download: https://sox.sourceforge.net/
```

### Speech Recognition tidak akurat

**Penyebab**: Kebisingan background, mic buruk, bahasa salah

**Solusi**:

```javascript
// Gunakan interim results untuk feedback real-time
recognition.interimResults = true;

// Set continuous untuk recording panjang
recognition.continuous = false; // atau true untuk voice command

// Ubah language jika perlu
recognition.lang = "id-ID";

// Pastikan mic noise minimal
```

### ResponsiveVoice tidak berbicara

**Penyebab**: API key invalid, browser block audio autoplay, CDN error

**Solusi**:

```javascript
// 1. Verifikasi API key
const voice = new NXUI.NexaVoice({
  useResponsiveVoice: true,
  responsiveVoiceKey: "YOUR_VALID_API_KEY",
});

// 2. Require user interaction (click) sebelum speak
document.addEventListener(
  "click",
  () => {
    if (!voice.userInteracted) {
      voice.userInteracted = true;
      voice.speak("Halo!");
    }
  },
  { once: true },
);

// 3. Check browser console untuk error
```

---

## Examples

### Example 1: Interactive Chat Bot

```javascript
const voice = new NXUI.NexaVoice({
  useResponsiveVoice: true,
  responsiveVoiceKey: "16D1IGr5",
});

// Chat dengan voice
function chatWithVoice(userInput) {
  // 1. Echo back what user said
  voice.speak(`Anda mengatakan: ${userInput}`);

  // 2. Process input (API call, etc)
  const response = processInput(userInput);

  // 3. Speak response
  setTimeout(() => {
    voice.speak(response);
  }, 1000);
}

document.getElementById("dengar").addEventListener("click", () => {
  recognition.start();
});

recognition.onresult = (event) => {
  const finalTranscript = event.results[event.results.length - 1][0].transcript;
  chatWithVoice(finalTranscript);
};
```

### Example 2: Document Reader

```javascript
function readDocument(documentText) {
  const voice = new NXUI.NexaVoice({
    useResponsiveVoice: true,
    responsiveVoiceKey: "16D1IGr5",
  });

  // UI untuk kontrol
  const controls = `
    <div>
      <button onclick="window.voice.pause();">⏸️ Pause</button>
      <button onclick="window.voice.resume();">▶️ Resume</button>
      <button onclick="window.voice.stop();">⏹️ Stop</button>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", controls);
  window.voice = voice;

  // Baca dokumen
  voice.speak(documentText);

  // Event tracking
  voice.onStart = () => console.log("Mulai membaca...");
  voice.onEnd = () => console.log("Selesai membaca");
}
```

### Example 3: Accessibility Mode

```javascript
function enableAccessibilityMode() {
  const voice = new NXUI.NexaVoice({
    useResponsiveVoice: true,
    responsiveVoiceKey: "16D1IGr5",
  });

  // Baca heading saat fokus
  document.querySelectorAll("h1, h2, h3").forEach((el) => {
    el.addEventListener("focus", () => {
      voice.speak(el.textContent);
    });
  });

  // Baca button labels
  document.querySelectorAll("button").forEach((el) => {
    el.addEventListener("focus", () => {
      voice.speak(`Button: ${el.textContent}`);
    });
  });

  // Global hotkey untuk membaca halaman
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "r") {
      const pageText = document.body.innerText;
      voice.speak(pageText);
    }
  });
}
```

---

## Testing Checklist

- [ ] Text-to-Speech works dengan teks singkat
- [ ] Text-to-Speech works dengan teks panjang (1000+ kata)
- [ ] Pause/Resume berfungsi normal
- [ ] Stop menghentikan audio sepenuhnya
- [ ] Speech Recognition mendeteksi suara dengan akurat
- [ ] Error handling saat permission denied
- [ ] Multi-language support berfungsi
- [ ] Vosk offline mode (Electron)
- [ ] Responsive design di mobile
- [ ] Performance testing dengan teks sangat panjang

---

## Performance Tips

1. **Chunk Long Text**: Bagi teks panjang menjadi paragraf untuk pembacaan natural
2. **Cache Responses**: Cache hasil TTS untuk menghindari API calls berulang
3. **Lazy Load**: Load NexaVoice hanya saat dibutuhkan
4. **WebWorker**: Gunakan Web Worker untuk processing berat
5. **Battery**: Monitor battery usage di mobile device

---

## References

- [ResponsiveVoice API](https://responsivevoice.org/)
- [Web Speech API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Vosk Offline STT](https://alphacephei.com/vosk/)
- [Electron IPC Communication](https://www.electronjs.org/docs/api/ipc-main)

---

## License & Attribution

NexaVoice menggunakan:

- **ResponsiveVoice** untuk Text-to-Speech
- **Web Speech API** untuk Speech Recognition
- **Vosk** untuk offline voice recognition di Electron

---

## Support & Feedback

Untuk bug reports, feature requests, atau pertanyaan:

- 📧 Email: support@nexa.local
- 💬 Discord: [NexaUI Community](https://discord.gg/nexa)
- 🐛 Issues: GitHub Issues

---

**Last Updated**: April 4, 2026  
**Version**: 1.0.0
