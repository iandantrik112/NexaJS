import { View, StyleSheet,useNavigation,Images, fs, Text, Buttons } from "NexaUI";
const AvatarExample = () => {
  const navigation = useNavigation();
  const localImage = require("../assets/rsbp.png");
  return (
    <View style={styles.container}>
      <Images borderRadius={1} source={localImage} size={132} />

      <Text style={[fs["4xl"],styles.customAvatar, fs.semibold]}>NexaUI <Text style={[fs["xs"]]}>V.0.5.1</Text></Text>
      <Text style={[fs.semibold,fs.center]}>Selamat datang di NexaUI Framework! Kami menghadirkan solusi pengembangan Mobile yang benar-benar berbeda</Text>
      <Buttons
        label="Masuk"
        background="#24BCA9"
        txColor="#FFFFFF"
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
