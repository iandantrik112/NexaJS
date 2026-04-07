import {
  View,
  StyleSheet,
  useState,
  useEffect,
  Input,
  Text,
  Buttons,
  assetsImage,
  Image,
  useFormValidation,
  Alert,
  Network,
  NexaDBLite,
  TouchableOpacity,
  ExpoSpeech,
  Spinner,
  properti,
} from "NexaUI";

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [assetColor, setAssetColor] = useState({
    buttonColor: "#24bca9",
    buttonTextColor: "#FFFFFF"
  });
  
  useEffect(() => {
    const fetchAssetColor = async () => {
      const color = await properti.getAssetColor();
      setAssetColor(color);
    };
    fetchAssetColor();
  }, []);
  
  const { values, errors, isValid, handleChange, handleBlur, resetForm } =
    useFormValidation(
      {
        email: "",
        password: "",
      },
      {
        email: {
          type: "email",
          length: [5, 100],
          placeholder: "Masukkan email anda",
        },
        password: {
          type: "password",
          length: [8, 32],
          placeholder: "Masukkan password anda",
        },
      }
    );

  const handleSubmit = async () => {
    if (isValid) {
      try {
        setLoading(true);
      
        const api = Network("oauth");
        const response = await api.post("signin", {
          email: values.email,
          password: values.password,
        });
        
        if (response && response.success) {
          // Save user session data to NexaDBLite - data.id digunakan sebagai key
          const userSessionData = {
            id: "userSession",
            ...response,
            isLoggedIn: true,
            timestamp: Date.now()
          };
          
          try {
            // Simpan data dengan retry mechanism
            await NexaDBLite.set("userSessions", userSessionData);
            
            // Verifikasi data tersimpan dengan benar (terutama penting di APK)
            const verifyData = await NexaDBLite.get("userSessions", "userSession");
            if (!verifyData) {
          
              // Retry sekali
              await new Promise(resolve => setTimeout(resolve, 300));
              await NexaDBLite.set("userSessions", userSessionData);
              
              // Verifikasi lagi
              const verifyData2 = await NexaDBLite.get("userSessions", "userSession");
              if (!verifyData2) {
                console.error('[masuk.js] Gagal menyimpan user session setelah retry');
                Alert.alert("Error", "Gagal menyimpan session. Silakan coba lagi.");
                setLoading(false);
                return;
              }
            }
            
            // Tambahkan delay kecil sebelum navigate untuk memastikan data tersimpan
            await new Promise(resolve => setTimeout(resolve, 200));
            
            resetForm();
            // Navigate to User screen with response data
            navigation.replace("User", { userData: response });
          } catch (saveError) {
            console.error('[masuk.js] Error saving user session:', saveError);
            Alert.alert("Error", "Gagal menyimpan session. Silakan coba lagi.");
            setLoading(false);
            return;
          }
        } else {
          Alert.alert(
            response?.title || "Konfirmasi", 
            response?.message || "Login gagal. Silakan coba lagi."
          );
        }
      } catch (error) {
        let errorMessage = "Gagal masuk. Silakan coba lagi.";
        
        if (error.message) {
          if (error.message.includes("timeout")) {
            errorMessage = "Koneksi timeout. Periksa koneksi internet atau server mungkin sedang down.";
          } else if (error.message.includes("network")) {
            errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
          } else {
            errorMessage = error.message;
          }
        }
        
        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Error", "Mohon lengkapi semua field yang diperlukan");
    }
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={loading}
        overlay={true}
        text="Memproses login..."
        textColor={assetColor.buttonTextColor}
        color={assetColor.buttonColor}
      />
      
      <Image source={assetsImage.get("nexaui")} style={styles.logo} />
      <Input
        label="Email"
        type="Email"
        Material="email"
        placeholder="Masukkan email anda"
        value={values.email}
        onChangeText={(text) => handleChange("email", text)}
        onBlur={() => handleBlur("email")}
        errors={errors.email}
        backgroundColor="#f5f5f5"
        keyboardType="email-address"
        editable={!loading}
      />

      <Input
        label="Password"
        type="Password"
        Material="lock"
        placeholder="Masukkan password anda"
        value={values.password}
        onChangeText={(text) => handleChange("password", text)}
        onBlur={() => handleBlur("password")}
        errors={errors.password}
        backgroundColor="#f5f5f5"
        password
        editable={!loading}
      />

      <Buttons
        label={loading ? "Memproses..." : "Masuk"}
        background={assetColor.buttonColor}
        txColor={assetColor.buttonTextColor}
        border={10}
        vertical={8}
        onPress={handleSubmit}
        disabled={!isValid || loading}
      />

      <TouchableOpacity 
        onPress={() => navigation.navigate("mendaftar")}
        disabled={loading}
      >
        <Text style={styles.formFooter}>
          Belum punya akun?{" "}
          <Text style={{ textDecorationLine: "underline" }}>Mendaftar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
    padding: 16,
    gap: 16,
  },
  logo: {
    width: 132,
    height: 132,
    alignSelf: "center",
    borderRadius: 1,
    marginBottom: 20,
  },
  button: {
    padding: 8,
    marginTop: 16,
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.15,
  },
});
