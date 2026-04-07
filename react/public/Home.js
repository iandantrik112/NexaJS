import {
  View,
  StyleSheet,
  useNavigation,
  Images,
  fs,
  Text,
  Buttons,
  properti,
  useState,
  useEffect,
  Svg
} from "NexaUI";

const AvatarExample = () => {
  const navigation = useNavigation();
  const [propertiData, setpropertiData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Coba ambil dari cache dulu untuk UI yang lebih cepat
        const cachedData = await properti.getCache();
        if (cachedData) {
          setpropertiData(cachedData);
        }
        
        // Kemudian fetch dari API untuk update (non-blocking)
        const data = await properti.get();
        if (data) {
          setpropertiData(data);
        }
      } catch (error) {
        // Error sudah di-handle di properti.get(), hanya log jika bukan timeout
        if (error.data?.type !== 'TIMEOUT_ERROR' && error.code !== 408) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);
  
  // Menggunakan assetColor dari properti, dengan fallback ke default
  const assetColor = propertiData?.assetColor || {
    buttonColor: "#24BCA9",
    buttonTextColor: "#FFFFFF"
  };

  const localImage = require("../assets/nexaui.png");
  return (
    <View style={styles.container}>
    
           <Svg 
            name="nexaSvg" 
            width={220} 
            height={220} 
            fill={assetColor.backgroundColor}
            style={styles.logo}
          />
      <Text style={[fs["4xl"], styles.customAvatar, fs.semibold]}>
        {propertiData?.appname || "NexaUI"} <Text style={[fs["xs"]]}>V.{propertiData?.version || "1.0.0"}</Text>
      </Text>
      <Text style={[fs.semibold, fs.center]}>
        {propertiData?.description || "Selamat datang di NexaUI Framework! Kami menghadirkan solusi pengembangan Mobile yang benar-benar berbeda"}
      </Text>
      <Buttons
        label="Masuk"
        background={assetColor.buttonColor}
        txColor={assetColor.buttonTextColor}
        border={8}
        padding={100}
        vertical={6}
        onPress={() =>
          navigation.navigate("masuk", {
            type: "masuk",
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
    paddingTop: 210,
    padding: 20,
    gap: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  customAvatar: {
    paddingTop: 10,
  },
});

export default AvatarExample;
