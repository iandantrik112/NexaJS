// Export function untuk route 'contact/data' (menjadi 'contact_data.js')
export async function voice(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Contact Data | App",
    description: "Data kontak.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);
    console.log("📍 Navigating to:", NEXA);
    container.innerHTML = `
         <!-- Speech Controls -->
  <div style="margin-bottom: 15px">
    <button onclick="dengar('Halo! Selamat datang di NexaVoice! aku senang bisa membantu Anda!');">
      👋 Sapa
    </button>
    <button onclick="dengar('Saya sangat senang sekali!');">😊 Senang</button>
    <button onclick="dengar('Saya merasa sedih hari ini');">😢 Sedih</button>
    <button onclick="dengar('Wow, ini sangat menakjubkan!');">
      🎉 Excited
    </button>
    <button onclick="dengar('Mari kita tenang dan rileks');">😌 Tenang</button>
  </div>

  <!-- Voice Controls -->
  <div style="margin-bottom: 15px">
    <button onclick="voice.pause();">⏸️ Pause</button>
    <button onclick="voice.resume();">▶️ Resume</button>
    <button onclick="voice.stop();">⏹️ Stop</button>
  </div>

  <!-- Speech Recognition (Web Speech API — sering tidak jalan di Electron) -->
  <div style="margin-bottom: 15px">
    <button id="dengar">🎤 Dengar</button>
    <button onclick="showStatus();">📊 Status</button>
  </div>

  <!-- Vosk offline (Electron — proses utama) -->
  <div id="vosk-panel" style="margin-bottom: 15px; padding: 12px; border: 1px solid #0a7; border-radius: 8px; background: #f6fffa; display: none;">
    <div style="font-weight: bold; margin-bottom: 8px;">🎙️ Vosk (offline, Bahasa Indonesia)</div>
    <p id="vosk-status-line" style="margin: 0 0 8px 0; font-size: 13px; color: #333;"></p>
    <p id="vosk-partial-line" style="margin: 0 0 8px 0; font-size: 13px; color: #666; min-height: 1.2em;"></p>
    <div style="margin-bottom: 15px">
      <button type="button" id="vosk-start">▶️ Mulai dengar (Vosk)</button>
      <button type="button" id="vosk-stop">⏹️ Stop Vosk</button>
    </div>
  </div>

  <!-- Custom Text Input -->
  <div style="margin-bottom: 15px">
    <textarea
      id="custom-text"
      placeholder="Ketik teks panjang di sini... (mendukung teks panjang hingga ribuan kata)"
      style="
        padding: 8px;
        width: 400px;
        height: 100px;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: vertical;
      "
    ></textarea>
    <br />
    <button
      onclick="dengar(document.getElementById('custom-text').value || 'Silakan ketik teks terlebih dahulu');"
    >
      🗣️ Bicara Teks Panjang
    </button>
    <button onclick="testLongText();">📚 Test Teks Panjang</button>
  </div>
</div>
      `;
     
  // Pakai ResponsiveVoice untuk suara Indonesia (Electron jarang punya voice id-ID native — tanpa ini sering jatuh ke English)
  const voice = new NXUI.NexaVoice({
    useResponsiveVoice: true,
    responsiveVoiceKey: "16D1IGr5",
  });

  // Event handlers
  voice.onStart = () => console.log("🔊 Speech started");
  voice.onEnd = () => console.log("✅ Speech ended");
  voice.onError = (error) => {
    if (error.error === "interrupted") {
      console.log("🔄 Previous speech stopped for new speech");
    } else {
      console.error("❌ Speech error:", error.error);
    }
  };

  // Global dengar function
  window.dengar = (text) => {
    if (!voice.userInteracted) {
      voice.userInteracted = true;
    }
    voice.speak(text);
  };

  // Global showStatus function
  window.showStatus = () => {
    const status = voice.getStatus();
    console.log("📊 NexaVoice Status:", status);
    dengar(
      `Status: ${
        status.isPlaying ? "sedang bicara" : "diam"
      }, dukungan browser: ${status.isSupported ? "ya" : "tidak"}`
    );
  };

  // Make voice global for direct access
  window.voice = voice;

  // Test function for long text
  window.testLongText = () => {
    const longText = `
    Selamat datang di demonstrasi NexaVoice untuk teks panjang. 
    
    NexaVoice adalah sistem text-to-speech yang canggih dan dapat membacakan teks dalam berbagai panjang. 
    Sistem ini mendukung berbagai fitur seperti pengaturan kecepatan bicara, nada suara, dan volume.
    
    Dalam pengujian ini, kami akan mendemonstrasikan kemampuan NexaVoice untuk membacakan paragraf yang panjang
    tanpa terputus atau mengalami masalah teknis. 
    
    Text-to-speech modern seperti NexaVoice dapat menangani dokumen panjang, artikel berita, cerita pendek,
    bahkan buku digital secara keseluruhan. Teknologi ini sangat berguna untuk aksesibilitas,
    pembelajaran, dan multitasking.
    
    Dengan NexaVoice, Anda dapat mendengarkan konten sambil melakukan aktivitas lain,
    atau membantu orang dengan keterbatasan penglihatan untuk mengakses informasi tertulis.
    
    Sistem ini juga mendukung berbagai bahasa dan dapat disesuaikan dengan preferensi pengguna.
    Terima kasih telah menggunakan NexaVoice untuk kebutuhan text-to-speech Anda.
    `;

    document.getElementById("custom-text").value = longText.trim();
    dengar("Saya akan membacakan teks panjang. Silakan tunggu...");

    setTimeout(() => {
      dengar(longText.trim());
    }, 2000);
  };

  // Wait for user interaction, then speak welcome message
  document.addEventListener(
    "click",
    () => {
      if (!voice.userInteracted) {
        voice.userInteracted = true;
        voice.speak("Halo, selamat datang di Nexa Voice!");
      }
    },
    { once: true }
  );

  // Speech Recognition (Speech-to-Text)
  let recognition = null;
  let isListening = false;

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "id-ID";

    recognition.onstart = () => {
      isListening = true;
      document.getElementById("dengar").textContent = "🎤 Mendengarkan...";
      document.getElementById("dengar").style.backgroundColor = "#ff4444";
      console.log("🎤 Mulai mendengarkan...");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        console.log("📝 HASIL AKHIR:", finalTranscript);
        console.log("🔊 OUTPUT:", `Saya mendengar: ${finalTranscript}`);

        // Show result in alert for easy viewing
        alert(`🎤 Yang Anda katakan: "${finalTranscript}"`);

        // Echo back what was heard
        dengar(`Saya mendengar: ${finalTranscript}`);
      }

      if (interimTranscript) {
        console.log("⏳ Sedang mendengar:", interimTranscript);
      }
    };

    recognition.onend = () => {
      isListening = false;
      document.getElementById("dengar").textContent = "🎤 Dengar";
      document.getElementById("dengar").style.backgroundColor = "#007bff";
      console.log("🔇 Selesai mendengarkan");
    };

    recognition.onerror = (event) => {
      isListening = false;
      document.getElementById("dengar").textContent = "🎤 Dengar";
      document.getElementById("dengar").style.backgroundColor = "#007bff";
      console.error("❌ Error mendengarkan:", event.error);

      if (event.error === "not-allowed") {
        voice.speak("Izin mikrofon diperlukan untuk mendengarkan suara");
      }
    };
  }

  // Setup button dengar
  document.getElementById("dengar").textContent = "🎤 Dengar";
  document.getElementById("dengar").style.cssText = `
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
`;

  document.getElementById("dengar").addEventListener("click", () => {
    if (!recognition) {
      voice.speak("Maaf, browser ini tidak mendukung pengenalan suara");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  // Setup button styles
  const setupButtonStyle = () => {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      button.style.cssText = `
        padding: 8px 15px;
        margin: 5px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      `;
    });
  };

  setupButtonStyle();

  // —— Vosk offline (hanya di Electron bila preload + model siap) ——
  const voskPanel = document.getElementById("vosk-panel");
  const voskStatusLine = document.getElementById("vosk-status-line");
  const voskPartialLine = document.getElementById("vosk-partial-line");
  const voskStartBtn = document.getElementById("vosk-start");
  const voskStopBtn = document.getElementById("vosk-stop");
  const api = typeof window !== "undefined" ? window.electronAPI : null;

  if (api && typeof api.voskStatus === "function") {
    voskPanel.style.display = "block";

    const refreshVoskStatus = async () => {
      try {
        const s = await api.voskStatus();
        if (s.ready) {
          voskStatusLine.textContent =
            "Siap (model: " + (s.modelPath || "?") + "). Tanpa internet.";
        } else {
          voskStatusLine.textContent =
            (s.hint || "Pasang npm vosk + mic, model ID di models/vosk-model-small-id, lalu npm run rebuild:vosk.") +
            " — vosk:" +
            !!s.hasVosk +
            " mic:" +
            !!s.hasMic +
            " model:" +
            !!s.modelPath;
        }
      } catch (e) {
        voskStatusLine.textContent = "Status Vosk gagal: " + (e && e.message);
      }
    };

    api.voskSubscribe({
      onPartial: (d) => {
        if (d && d.text) voskPartialLine.textContent = "… " + d.text;
      },
      onFinal: (d) => {
        voskPartialLine.textContent = "";
        const t = (d && d.text) || "";
        if (t) {
          console.log("📝 Vosk final:", t);
          alert('Vosk: "' + t + '"');
          dengar("Saya mendengar: " + t);
        }
        if (voskStartBtn) voskStartBtn.disabled = false;
        if (voskStopBtn) voskStopBtn.disabled = true;
      },
      onError: (d) => {
        const msg = (d && d.message) || "unknown";
        console.error("Vosk error:", msg);
        voskPartialLine.textContent = "";
        voice.speak("Error Vosk: " + msg);
        if (voskStartBtn) voskStartBtn.disabled = false;
        if (voskStopBtn) voskStopBtn.disabled = true;
      },
    });

    voskStopBtn.disabled = true;
    voskStartBtn.addEventListener("click", async () => {
      const s = await api.voskStatus();
      if (!s.ready) {
        await refreshVoskStatus();
        alert(
          "Vosk belum siap. Pasang model vosk-model-small-id di folder models/, npm install, lalu npm run rebuild:vosk. Windows: SoX untuk mic."
        );
        return;
      }
      voskPartialLine.textContent = "Menyalakan mikrofon…";
      const r = await api.voskStart();
      if (r && r.ok) {
        voskStartBtn.disabled = true;
        voskStopBtn.disabled = false;
      } else {
        voskPartialLine.textContent = "";
        alert((r && r.error) || "Vosk tidak bisa mulai");
      }
    });

    voskStopBtn.addEventListener("click", async () => {
      await api.voskStop();
      voskPartialLine.textContent = "";
      voskStartBtn.disabled = false;
      voskStopBtn.disabled = true;
    });

    refreshVoskStatus();
  }

  // Only keep necessary event listeners
  // Allow Enter key in custom text input
  document.getElementById("custom-text")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const customText = document.getElementById("custom-text").value;
      dengar(customText || "Silakan ketik teks terlebih dahulu");
    }
  });

  // Simple instructions
  console.log(`
🎤 NexaVoice Ready - Settingan Normal/Default!

📖 FITUR UTAMA:
✅ Text-to-Speech dengan suara normal
✅ Speech Recognition (dengar suara)
✅ Mendukung teks panjang (ribuan kata)
✅ Control: Pause, Resume, Stop
✅ Tanpa settingan tambahan - simpel & mudah

🚀 CARA PAKAI:
• Klik "📚 Test Teks Panjang" - Demo otomatis
• Ketik/paste teks di textarea
• Gunakan: dengar('teks Anda...')
• Speech Recognition: "🎤 Dengar"
• Electron: panel Vosk (offline) — model ID di models/vosk-model-small-id, npm run rebuild:vosk

✨ SEMUA SETTINGAN SUARA NORMAL - SIAP PAKAI!
`);
  });
}
