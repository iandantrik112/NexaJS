import {
  useState,
  useEffect,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  NexaScanqr,
  Network,
  AsyncStorage,
  useNavigation,
  properti,
  Svg,
} from "NexaUI";

const INQRCode = ({ route }) => {
  const params = route.params;
  const navigation = useNavigation();
  const [showScanner, setShowScanner] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [userData, setUserData] = useState(null);
  const [assetColor, setAssetColor] = useState({
    backgroundColor: '#24BCA9',
    buttonColor: '#007AFF',
    buttonTextColor: '#fff',
  });

  // Load assetColor dari properti
  useEffect(() => {
    const loadAssetColor = async () => {
      try {
        const color = await properti.getAssetColor();
        setAssetColor(color);
      } catch (error) {
        console.error('Error loading assetColor:', error);
      }
    };
    loadAssetColor();
  }, []);
  
  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userSession");
        if (storedData) {
          // Log removed for cleaner console output
          setUserData(storedData);
            // const saveLoginStatus2 = await AsyncStorage.setItem("userSession", false);
            // const saveLoginStatus = await AsyncStorage.setItem("isLoggedIn", false);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
  }, []);

  // Get email and password from params or userData
  const getUserEmail = () => {
    return params?.email || userData?.email || "";
  };

  const getUserPassword = () => {
    // Password biasanya tidak disimpan di session, jadi mungkin perlu dari params
    // atau menggunakan default password untuk QR login
    return params?.password || "";
  };

  const openScanner = () => {
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
  };
  const handleScanSuccess = async (result) => {
    setLastResult(result);
    setShowScanner(false);

    const email = getUserEmail();
    const password = getUserPassword();

    if (!email) {
      Alert.alert("Error", "Email tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      const api = Network("oauth");
      const response = await api.post("qrsignin", {
        email: email,
        password: password,
        token: result.data,
      });
 

      if (response.success) {
        // Save user session data to AsyncStorage
        try {
          const saveSession = await AsyncStorage.setItem("userSession", response);
          const saveLoginStatus = await AsyncStorage.setItem("isLoggedIn", true);
          
          if (saveSession && saveLoginStatus) {
            // Log removed for cleaner console output
            Alert.alert(
              "Berhasil",
              "QR Code berhasil di-scan dan login berhasil!",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Navigate to User screen (dashboard) seperti di web controller redirect
                    // Menggunakan user_name dari response untuk konsistensi dengan web
                    navigation.replace("User", { userData: response });
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              "Warning",
              "Login berhasil tapi gagal menyimpan session. Silakan login ulang."
            );
          }
        } catch (saveError) {
          console.error("Error saving session:", saveError);
          Alert.alert(
            "Warning",
            "Login berhasil tapi gagal menyimpan session. Silakan login ulang."
          );
        }
      } else {
        Alert.alert(
          response.title || "Error",
          response.message || "Gagal melakukan QR login"
        );
      }
    } catch (error) {
      console.error("QR Signin Error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat melakukan QR login.");
    }
  };

  const handleScanError = (error) => {
    // Log removed for cleaner console output
    Alert.alert("Error", error);
  };

  return (
    <SafeAreaView style={styles.container}>
     
           <Svg 
            name="qrsvg" 
            width={220} 
            height={220} 
            fill={assetColor.backgroundColor}
            style={styles.logo}
          />

      <TouchableOpacity 
        style={[
          styles.button,
          { 
            backgroundColor: assetColor.buttonColor || assetColor.backgroundColor || "#007AFF"
          }
        ]} 
        onPress={openScanner}>
        <Text style={[
          styles.buttonText,
          { color: assetColor.buttonTextColor || "#fff" }
        ]}>
          🔍 Buka Camera Scanner
        </Text>
      </TouchableOpacity>

      {lastResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>📄 Hasil Scan Terakhir:</Text>
          <Text style={styles.resultText}>Type: {lastResult.type}</Text>
          <Text style={styles.resultText}>Data: {lastResult.data}</Text>
          <Text style={styles.resultText}>Time: {lastResult.timestamp}</Text>
        </View>
      )}

      <Text style={styles.info}>
        {showScanner ? "🟢 Scanner Aktif" : "🔴 Scanner Tidak Aktif"}
      </Text>

      {/* QR Scanner Component */}
      <NexaScanqr
        isVisible={showScanner}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        onClose={closeScanner}
        scannerTitle="Scan QR Code"
        enableTorch={true}
        enableFlip={false}
        scanTypes={["qr"]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#333",
  },
  button: {
    // backgroundColor akan di-set secara dinamis dengan assetColor
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    // color akan di-set secara dinamis dengan assetColor
    fontSize: 18,
    fontWeight: "600",
  },
  resultBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
    minWidth: 300,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  info: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default INQRCode;
