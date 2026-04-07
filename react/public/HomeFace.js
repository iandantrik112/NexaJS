import {
  View,
  StyleSheet,
  useNavigation,
  Images,
  fs,
  Text,
  Buttons,
  Network,
  useState,
  useEffect,
} from "NexaUI";
const AvatarExample = () => {
  const navigation = useNavigation();
  const localImage = require("../assets/rsbp.png");
  const [apiInfo, setApiInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test API info endpoint
    const fetchApiInfo = async () => {
      try {
        const api = Network("info");
        const response = await api.get("/");
        setApiInfo(response);
        console.log("API Info Response:", response);
      } catch (error) {
        console.error("Error fetching API info:", error);
        setApiInfo({ error: "Failed to fetch API info" });
      } finally {
        setLoading(false);
      }
    };

    fetchApiInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Images borderRadius={1} source={localImage} size={132} />

      <Text style={[fs["4xl"], styles.customAvatar, fs.semibold]}>
        NexaUI <Text style={[fs["xs"]]}>V.0.5.1</Text>
      </Text>
      <Text style={[fs.semibold, fs.center]}>
        Selamat datang di NexaUI Framework! Kami menghadirkan solusi
        pengembangan Mobile yang benar-benar berbeda
      </Text>

      {/* API Info Display */}
      <View style={styles.apiInfo}>
        <Text style={[fs.lg, fs.semibold]}>API Info Test:</Text>
        {loading ? (
          <Text style={[fs.sm]}>Loading API info...</Text>
        ) : (
          <Text style={[fs.xs, styles.jsonText]}>
            {JSON.stringify(apiInfo, null, 2)}
          </Text>
        )}
      </View>
      <Buttons
        label="Masuk"
        background="#24BCA9"
        txColor="#FFFFFF"
        border={8}
        padding={100}
        vertical={6}
        onPress={() =>
          navigation.navigate("Components", {
            type: "Components",
            count: 5,
            messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 180,
    padding: 20,
    gap: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  customAvatar: {
    paddingTop: 10,
  },
  apiInfo: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    maxHeight: 150,
  },
  jsonText: {
    fontFamily: "monospace",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
});

export default AvatarExample;
