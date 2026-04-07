import { View, StyleSheet, Text, ScrollView, Colors } from "NexaUI";

const ColorBox = ({ color, name }) => (
  <View style={styles.colorContainer}>
    <View style={[styles.colorBox, { backgroundColor: color }]} />
    <Text style={styles.colorName}>{name}</Text>
    <Text style={styles.colorValue}>{color}</Text>
  </View>
);

const ColorSection = ({ title, colors, isNested }) => (
  <View style={[styles.section, isNested && styles.nestedSection]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.colorGrid}>
      {Object.entries(colors).map(([name, value]) => {
        if (typeof value === "object" && !isNested) {
          return (
            <ColorSection
              key={name}
              title={`${title} - ${name}`}
              colors={value}
              isNested={true}
            />
          );
        }
        return <ColorBox key={name} color={value} name={name} />;
      })}
    </View>
  </View>
);

const ColorExample = () => {
  const colorSections = {
    "Base Colors": {
      white: Colors.white,
      black: Colors.black,
      transparent: Colors.transparent,
    },
    "Primary Colors": Object.fromEntries(
      Object.entries(Colors).filter(([key]) => key.startsWith("primary"))
    ),
    "Secondary Colors": {
      blue: Colors.blue,
      darkBlue: Colors.darkBlue,
      accent500: Colors.accent500,
    },
    "Gray Scale": Object.fromEntries(
      Object.entries(Colors).filter(
        ([key]) => key.startsWith("grey") && key !== "grey"
      )
    ),
    "Status Colors": {
      ...Object.fromEntries(
        Object.entries(Colors).filter(
          ([key]) =>
            key.startsWith("success") ||
            key.startsWith("warning") ||
            key.startsWith("error") ||
            key.startsWith("info")
        )
      ),
    },
    "Additional UI Colors": {
      light: Colors.light,
      grey: Colors.grey,
      red: Colors.red,
      green: Colors.green,
      yellow: Colors.yellow,
      orange: Colors.orange,
      purple: Colors.purple,
      teal: Colors.teal,
    },
    "Background Colors": Colors.background,
    "Text Colors": Colors.text,
    "Border Colors": Colors.border,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Color Palette</Text>
      {Object.entries(colorSections).map(([title, colors]) => (
        <ColorSection key={title} title={title} colors={colors} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background.light,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: "center",
    color: Colors.text.primary,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 30,
  },
  nestedSection: {
    marginLeft: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorContainer: {
    width: 150,
    marginBottom: 15,
  },
  colorBox: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  colorName: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  colorValue: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
});

export default ColorExample;
