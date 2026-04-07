import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  FontFamily,
  useMontserratFonts,
} from "NexaUI";

const FontExample = () => {
  const fontsLoaded = useMontserratFonts();

  if (!fontsLoaded) {
    return <Text>Loading fonts...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { fontFamily: FontFamily.bold }]}>
        Montserrat Font Examples
      </Text>

      {/* Regular Weights */}
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { fontFamily: FontFamily.semiBold }]}
        >
          Regular Weights
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.thin }]}>
          Thin (100) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.extraLight }]}>
          Extra Light (200) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.light }]}>
          Light (300) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.regular }]}>
          Regular (400) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.medium }]}>
          Medium (500) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.semiBold }]}>
          Semi Bold (600) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.bold }]}>
          Bold (700) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.extraBold }]}>
          Extra Bold (800) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.black }]}>
          Black (900) - The quick brown fox jumps over the lazy dog
        </Text>
      </View>

      {/* Italic Weights */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { fontFamily: FontFamily.semiBoldItalic },
          ]}
        >
          Italic Weights
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.thinItalic }]}>
          Thin Italic (100) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text
          style={[styles.text, { fontFamily: FontFamily.extraLightItalic }]}
        >
          Extra Light Italic (200) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.lightItalic }]}>
          Light Italic (300) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.regularItalic }]}>
          Regular Italic (400) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.mediumItalic }]}>
          Medium Italic (500) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.semiBoldItalic }]}>
          Semi Bold Italic (600) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.boldItalic }]}>
          Bold Italic (700) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.extraBoldItalic }]}>
          Extra Bold Italic (800) - The quick brown fox jumps over the lazy dog
        </Text>

        <Text style={[styles.text, { fontFamily: FontFamily.blackItalic }]}>
          Black Italic (900) - The quick brown fox jumps over the lazy dog
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: "#666",
  },
  text: {
    fontSize: 14,
    marginBottom: 10,
    color: "#333",
  },
});

export default FontExample;
