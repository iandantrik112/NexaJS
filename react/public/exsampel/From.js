import { View, StyleSheet, useState, Input, Buttons, Text, ScrollView, SafeAreaView } from "NexaUI";
export default function HomeScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* ============================================ */}
        {/* 📝 FORM INPUT FIELDS */}
        {/* ============================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Form Input Fields</Text>
          
          <Input
            label="Username"
            type="Text"
            Material="account"
            placeholder="Enter your username"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            errors={errors.username}
            backgroundColor="#f5f5f5"
          />

          <Input
            label="Email"
            type="Email"
            Material="email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            errors={errors.email}
            backgroundColor="#f5f5f5"
          />

          <Input
            label="Password"
            type="Password"
            Material="lock"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            errors={errors.password}
            backgroundColor="#f5f5f5"
            password
          />
        </View>

        {/* ============================================ */}
        {/* 🔘 FORM ACTIONS */}
        {/* ============================================ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔘 Form Actions</Text>
          
          <Buttons
            label="Button Dasar"
            background="#007AFF"
            txColor="#FFFFFF"
            border={10}
            vertical={8}
            onPress={() => console.log(formData)}
          />

          <Buttons
            label="Componen Validasi"
            background="#007AFF"
            txColor="#FFFFFF"
            border={10}
            vertical={8}
            onPress={() => navigation.navigate("Validasi")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  button: {
    padding: 8,
    marginTop: 16,
  },
});
