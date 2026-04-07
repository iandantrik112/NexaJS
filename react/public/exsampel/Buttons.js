import { View, StyleSheet, useState, Buttons } from "NexaUI";
const ButtonExample = () => {
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Button Dasar */}
      <Buttons
        label="Button Dasar"
        background="#007AFF"
        txColor="#FFFFFF"
        vertical={6}
        border={10}
        onPress={() => console.log("Button dasar ditekan")}
      />

      {/* Button dengan Material Icon */}
      <Buttons
        label="Simpan"
        background="#4CAF50"
        txColor="#FFFFFF"
        border={8}
        vertical={6}
        fontSize={16}
        onPress={() => console.log("Menyimpan...")}
      />

      {/* Button dengan Loading State */}
      <Buttons
        label="Loading Button"
        loading={loading}
        background="#E91E63"
        txColor="#FFFFFF"
        border={8}
        vertical={6}
        onPress={handlePress}
      />

      {/* Button Grid Layout */}
      <View style={styles.gridContainer}>
        <Buttons
          label="Grid 1"
          grid={5}
          Feather="home"
          background="#9C27B0"
          txColor="#FFFFFF"
          border={8}
          onPress={() => console.log("Grid 1 clicked")}
        />
        <Buttons
          label="Grid 2"
          grid={5}
          Ion="settings"
          background="#FF9800"
          txColor="#FFFFFF"
          border={8}
          onPress={() => console.log("Grid 2 clicked")}
        />
      </View>

      {/* Button Navigasi */}
      <Buttons
        label="Ke Profile"
        navigasi={{
          name: "Profile",
          value: { userId: 123 },
        }}
        background="#2196F3"
        txColor="#FFFFFF"
        border={8}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
});

export default ButtonExample;
