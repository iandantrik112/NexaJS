import { FontFamily, fs, View, Text, StyleSheet } from "NexaUI";

// Main screen component for Typography examples
export default function Typography() {
  return (
    <View style={styles.container}>
      <Text style={[fs["2xl"], fs.bold, fs.center, styles.header]}>
        Typography Examples
      </Text>

      <View style={styles.section}>
        <Text style={[fs.lg, fs.semibold]}>Font Sizes</Text>
        <Text style={[fs.xs]}>Extra Small Text (12px)</Text>
        <Text style={[fs.sm]}>Small Text (14px)</Text>
        <Text style={[fs.md]}>Medium Text (16px)</Text>
        <Text style={[fs.lg]}>Large Text (18px)</Text>
        <Text style={[fs.xl]}>Extra Large Text (20px)</Text>
        <Text style={[fs["2xl"]]}>2XL Text (24px)</Text>
        <Text style={[fs["3xl"]]}>3XL Text (30px)</Text>
        <Text style={[fs["4xl"]]}>4XL Text (36px)</Text>
      </View>

      <View style={styles.section}>
        <Text style={[fs.lg, fs.semibold]}>Font Weights</Text>
        <Text style={[fs.md, fs.thin]}>Thin Text</Text>
        <Text style={[fs.md, fs.light]}>Light Text</Text>
        <Text style={[fs.md, fs.normal]}>Normal Text</Text>
        <Text style={[fs.md, fs.medium]}>Medium Text</Text>
        <Text style={[fs.md, fs.semibold]}>Semibold Text</Text>
        <Text style={[fs.md, fs.bold]}>Bold Text</Text>
        <Text style={[fs.md, fs.extrabold]}>Extra Bold Text</Text>
        <Text style={[fs.md, fs.black]}>Black Text</Text>
      </View>

      <View style={styles.section}>
        <Text style={[fs.lg, fs.semibold]}>Text Alignment</Text>
        <Text style={[fs.md, fs.left]}>Left Aligned</Text>
        <Text style={[fs.md, fs.center]}>Center Aligned</Text>
        <Text style={[fs.md, fs.right]}>Right Aligned</Text>
        <Text style={[fs.md, fs.justify]}>
          Justified text example with multiple lines. This text will be aligned
          to both the left and right margins.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[fs.lg, fs.semibold]}>Text Decorations</Text>
        <Text style={[fs.md, fs.italic]}>Italic Text</Text>
        <Text style={[fs.md, fs.underline]}>Underlined Text</Text>
        <Text style={[fs.md, fs["line-through"]]}>Strike Through Text</Text>
      </View>

      <View style={styles.section}>
        <Text style={[fs.lg, fs.semibold]}>Combined Styles</Text>
        <Text style={[fs["2xl"], fs.bold, fs.center]}>Big Bold Centered</Text>
        <Text style={[fs.sm, fs.italic, fs.light]}>
          Small Italic Light Text
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    gap: 8,
  },
});

// Usage example in other components:
/*
import { TextExample } from './typography';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <TextExample />
    </View>
  );
}
*/
