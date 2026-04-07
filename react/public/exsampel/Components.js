import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useNavigation,
  useState,
  Input,
  Buttons,
  Text,
} from "NexaUI";

const Components = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* ============================================ */}
        {/* 🎨 UI COMPONENTS */}
        {/* ============================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 UI Components</Text>
          
          <Buttons
            label="Form"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("From", {
                type: "From",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Buttons"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("Buttons", {
                type: "Buttons",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Color"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("Color", {
                type: "Color",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Icon"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("Icon", {
                type: "Icon",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Grid System"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("Grid")}
          />

          <Buttons
            label="Typography"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("Typography")}
          />

          <Buttons
            label="Html Dom"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("Html")}
          />

          <Buttons
            label="Avatar"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("Avatar")}
          />

          <Buttons
            label="Modal"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("Modal")}
          />

          <Buttons
            label="Toast"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("Toast")}
          />

          <Buttons
            label="Spinner"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("Spinner")}
          />

          <Buttons
            label="Carousel"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("Carousel", {
                type: "Carousel",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Rich Text Editor"
            background="#000"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("RichTextEditor", {
                type: "RichTextEditor",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />
        </View>

        {/* ============================================ */}
        {/* 🗄️ DATABASE & STORAGE */}
        {/* ============================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗄️ Database & Storage</Text>
          
          <Buttons
            label="NexaDb"
            background="#4CAF50"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("NexaDb")}
          />

          <Buttons
            label="NexaDBLite"
            background="#4CAF50"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("NexaDBLite")}
          />

          <Buttons
            label="NexaDbJson"
            background="#4CAF50"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("NexaDbJson")}
          />

          <Buttons
            label="NexaDbFirebase"
            background="#4CAF50"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("NexaDbFirebase")}
          />

          <Buttons
            label="Firebase"
            background="#4CAF50"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("NxFirebase", {
                type: "NxFirebase",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />
        </View>

        {/* ============================================ */}
        {/* 🔧 UTILITIES & TOOLS */}
        {/* ============================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Utilities & Tools</Text>
          
          <Buttons
            label="Scanner Qr"
            background="#2196F3"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("Scanner", {
                type: "Scanner",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="QRCode"
            background="#2196F3"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("NxQRCode", {
                type: "NxQRCode",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Speech"
            background="#2196F3"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("Speech", {
                type: "Speech",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Fonts Montserrat"
            background="#2196F3"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() =>
              navigation.navigate("Fonts", {
                type: "Fonts",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          />

          <Buttons
            label="Masuk"
            background="#2196F3"
            txColor="#FFFFFF"
            border={20}
            vertical={6}
            onPress={() => navigation.navigate("masuk")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Components;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
  },
});
