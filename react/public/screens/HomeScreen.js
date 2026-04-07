import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() =>
          navigation.navigate("Detail", {
            type: "profile",
            userId: 123,
            userName: "John Doe",
          })
        }
      >
        Lihat Profil
      </Button>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() =>
          navigation.navigate("Detail", {
            type: "settings",
            section: "notification",
            isEnabled: true,
          })
        }
      >
        Pengaturan Notifikasi
      </Button>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() =>
          navigation.navigate("Detail", {
            type: "notifications",
            count: 5,
            messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
          })
        }
      >
        Lihat Notifikasi
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    gap: 16,
  },
  button: {
    padding: 8,
  },
});
