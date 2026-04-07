import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useState,
  Buttons,
  Spinner,
  Text,
} from "NexaUI";

const SpinnerExample = () => {
  const [spinner1, setSpinner1] = useState(false);
  const [spinner2, setSpinner2] = useState(false);
  const [spinner3, setSpinner3] = useState(false);
  const [spinner4, setSpinner4] = useState(false);
  const [spinner5, setSpinner5] = useState(false);
  const [spinner6, setSpinner6] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.title}>Spinner Examples</Text>

        {/* Spinner Dasar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Spinner Dasar</Text>
          <View style={styles.exampleContainer}>
            <Spinner visible={spinner1} />
            <Buttons
              label={spinner1 ? "Hide Spinner" : "Show Spinner"}
              background="#007AFF"
              txColor="#FFFFFF"
              border={8}
              vertical={6}
              onPress={() => setSpinner1(!spinner1)}
            />
          </View>
        </View>

        {/* Spinner dengan Teks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Spinner dengan Teks</Text>
          <View style={styles.exampleContainer}>
            <Spinner
              visible={spinner2}
              text="Memuat data..."
              textColor="#666"
            />
            <Buttons
              label={spinner2 ? "Hide Spinner" : "Show Spinner"}
              background="#4CAF50"
              txColor="#FFFFFF"
              border={8}
              vertical={6}
              onPress={() => setSpinner2(!spinner2)}
            />
          </View>
        </View>

        {/* Spinner dengan Overlay */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Spinner dengan Overlay</Text>
          <View style={styles.exampleContainer}>
            <Spinner
              visible={spinner3}
              overlay={true}
              text="Loading..."
              textColor="#FFFFFF"
            />
            <Buttons
              label={spinner3 ? "Hide Overlay Spinner" : "Show Overlay Spinner"}
              background="#E91E63"
              txColor="#FFFFFF"
              border={8}
              vertical={6}
              onPress={() => setSpinner3(!spinner3)}
            />
          </View>
        </View>

        {/* Spinner Size Small */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Spinner Size Small</Text>
          <View style={styles.exampleContainer}>
            <Spinner
              visible={spinner4}
              size="small"
              color="#9C27B0"
              text="Small spinner"
            />
            <Buttons
              label={spinner4 ? "Hide" : "Show Small"}
              background="#9C27B0"
              txColor="#FFFFFF"
              border={8}
              vertical={6}
              onPress={() => setSpinner4(!spinner4)}
            />
          </View>
        </View>

        {/* Spinner dengan Custom Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Spinner Custom Color</Text>
          <View style={styles.exampleContainer}>
            <Spinner
              visible={spinner5}
              color="#FF9800"
              text="Orange spinner"
              textColor="#FF9800"
            />
            <Buttons
              label={spinner5 ? "Hide" : "Show Orange"}
              background="#FF9800"
              txColor="#FFFFFF"
              border={8}
              vertical={6}
              onPress={() => setSpinner5(!spinner5)}
            />
          </View>
        </View>

        {/* Spinner Overlay dengan Custom Background */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. Spinner Overlay Custom Background
          </Text>
          <View style={styles.exampleContainer}>
            <Spinner
              visible={spinner6}
              overlay={true}
              overlayColor="rgba(0, 0, 0, 0.7)"
              color="#00BCD4"
              text="Processing..."
              textColor="#FFFFFF"
            />
            <Buttons
              label={spinner6 ? "Hide" : "Show Custom Overlay"}
              background="#00BCD4"
              txColor="#FFFFFF"
              border={8}
              vertical={6}
              onPress={() => setSpinner6(!spinner6)}
            />
          </View>
        </View>

        {/* Multiple Spinners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Multiple Spinners</Text>
          <View style={styles.multipleContainer}>
            <View style={styles.spinnerItem}>
              <Spinner visible={true} size="small" color="#F44336" />
              <Text style={styles.spinnerLabel}>Red</Text>
            </View>
            <View style={styles.spinnerItem}>
              <Spinner visible={true} size="small" color="#4CAF50" />
              <Text style={styles.spinnerLabel}>Green</Text>
            </View>
            <View style={styles.spinnerItem}>
              <Spinner visible={true} size="small" color="#2196F3" />
              <Text style={styles.spinnerLabel}>Blue</Text>
            </View>
            <View style={styles.spinnerItem}>
              <Spinner visible={true} size="small" color="#FF9800" />
              <Text style={styles.spinnerLabel}>Orange</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#212121",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#212121",
  },
  exampleContainer: {
    alignItems: "center",
    paddingVertical: 20,
    minHeight: 100,
  },
  multipleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
  },
  spinnerItem: {
    alignItems: "center",
  },
  spinnerLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
});

export default SpinnerExample;

