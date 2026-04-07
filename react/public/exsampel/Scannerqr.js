import {
  useState,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  NexaScanqr,
} from "NexaUI";

const Scannerqr = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const openScanner = () => {
    console.log("🔍 Membuka scanner kamera...");
    setShowScanner(true);
  };

  const closeScanner = () => {
    console.log("🚫 Menutup scanner...");
    setShowScanner(false);
  };

  const handleScanSuccess = (result) => {
    // Log removed for cleaner console output
    setLastResult(result);
    setShowScanner(false);
    Alert.alert("QR Code Berhasil Di-Scan!", `Data: ${result.data}`, [
      { text: "OK" },
    ]);
  };

  const handleScanError = (error) => {
    console.error("❌ Error scanning:", error);
    Alert.alert("Error", error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📱 Test Camera QR Scanner</Text>

      <TouchableOpacity style={styles.button} onPress={openScanner}>
        <Text style={styles.buttonText}>🔍 Buka Camera Scanner</Text>
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
    backgroundColor: "#007AFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
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

export default Scannerqr;
