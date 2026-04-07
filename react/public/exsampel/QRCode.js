import { View, Text, StyleSheet, QRCodeGenerator } from "NexaUI";

const NxQRCode = ({ route }) => {
  const params = route?.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Generator</Text>
      <QRCodeGenerator
        value="NexaUI Framework"
        size={200}
        color="black"
        backgroundColor="white"
      />
      <Text style={styles.description}>
        Generated QR Code for: "NexaUI Framework"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  description: {
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
});

export default NxQRCode;
