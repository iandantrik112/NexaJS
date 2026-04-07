import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Network,
  ExpoSpeech,
} from "NexaUI";

const Speech = ({ route }) => {
  const params = route.params;

  const exampleV4 = async () => {
    const response = await Network({
      endpoint: "v4/voice/speech",
    }).post("/", {
      email: "matthalid@gmail.com",
      password: "Baron123",
    });
    console.log(response);
    return response;
  };

  // Fungsi untuk text to speech
  const speakWelcome = async () => {
    try {
      await ExpoSpeech.speak("Selamat datang di halaman profil Anda", {
        onDone: () => {
          console.log("Selesai mengucapkan sambutan");
        },
      });
    } catch (error) {
      console.error("Error saat berbicara:", error);
    }
  };

  // Fungsi untuk membaca data profil
  const speakProfileData = async () => {
    try {
      const profilText = `Email Anda  ${
        params?.email || "tidak tersedia"
      }`;
      await ExpoSpeech.speak(profilText, {
        rate: 0.8,
        pitch: 1.1,
        onDone: () => {
          console.log("Selesai membaca data profil");
        },
      });
    } catch (error) {
      console.error("Error saat membaca profil:", error);
    }
  };

  // Fungsi untuk menghentikan suara
  const stopSpeaking = async () => {
    try {
      await ExpoSpeech.stop();
      console.log("Suara dihentikan");
    } catch (error) {
      console.error("Error menghentikan suara:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halaman Profil</Text>
      <Text style={styles.data}>{JSON.stringify(params, null, 2)}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={speakWelcome} style={styles.button}>
          <Text style={styles.buttonText}>Ucapkan Sambutan</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={speakProfileData} style={styles.button}>
          <Text style={styles.buttonText}>Baca Data Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={stopSpeaking}
          style={[styles.button, styles.stopButton]}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  data: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
});

export default Speech;
