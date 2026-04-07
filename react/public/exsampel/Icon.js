import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  useState,
  Icon,
  Colors,
} from "NexaUI";

const IconSection = ({ title, icons }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.iconGrid}>
      {icons.map((icon, index) => (
        <View key={index} style={styles.iconContainer}>
          <Icon {...icon} />
          <Text style={styles.iconName}>{icon.name}</Text>
        </View>
      ))}
    </View>
  </View>
);

const IconExample = () => {
  const materialIcons = [
    { Material: "home", size: 24, color: Colors.primary500, name: "home" },
    {
      Material: "account",
      size: 24,
      color: Colors.primary700,
      name: "account",
    },
    { Material: "bell", size: 24, color: Colors.info500, name: "bell" },
    {
      Material: "calendar",
      size: 24,
      color: Colors.success500,
      name: "calendar",
    },
    { Material: "cog", size: 24, color: Colors.grey700, name: "cog" },
    { Material: "email", size: 24, color: Colors.warning500, name: "email" },
    { Material: "heart", size: 24, color: Colors.error500, name: "heart" },
    { Material: "star", size: 24, color: Colors.accent500, name: "star" },
    { Material: "magnify", size: 24, color: Colors.blue, name: "magnify" },
    { Material: "bookmark", size: 24, color: Colors.teal, name: "bookmark" },
  ];

  const featherIcons = [
    { Feather: "user", size: 24, color: Colors.primary500, name: "user" },
    {
      Feather: "settings",
      size: 24,
      color: Colors.primary700,
      name: "settings",
    },
    { Feather: "mail", size: 24, color: Colors.info500, name: "mail" },
    { Feather: "phone", size: 24, color: Colors.success500, name: "phone" },
    { Feather: "lock", size: 24, color: Colors.grey700, name: "lock" },
    { Feather: "camera", size: 24, color: Colors.warning500, name: "camera" },
    {
      Feather: "alert-circle",
      size: 24,
      color: Colors.error500,
      name: "alert-circle",
    },
    { Feather: "check", size: 24, color: Colors.accent500, name: "check" },
    { Feather: "search", size: 24, color: Colors.blue, name: "search" },
    { Feather: "map-pin", size: 24, color: Colors.teal, name: "map-pin" },
  ];

  const ionIcons = [
    { Ion: "home", size: 24, color: Colors.primary500, name: "home" },
    { Ion: "person", size: 24, color: Colors.primary700, name: "person" },
    {
      Ion: "notifications",
      size: 24,
      color: Colors.info500,
      name: "notifications",
    },
    { Ion: "call", size: 24, color: Colors.success500, name: "call" },
    { Ion: "settings", size: 24, color: Colors.grey700, name: "settings" },
    { Ion: "camera", size: 24, color: Colors.warning500, name: "camera" },
    { Ion: "warning", size: 24, color: Colors.error500, name: "warning" },
    { Ion: "star", size: 24, color: Colors.accent500, name: "star" },
    { Ion: "search", size: 24, color: Colors.blue, name: "search" },
    { Ion: "location", size: 24, color: Colors.teal, name: "location" },
  ];

  // Size variations example
  const sizeVariations = [
    { Material: "home", size: 16, color: Colors.primary500, name: "size 16" },
    { Material: "home", size: 24, color: Colors.primary500, name: "size 24" },
    { Material: "home", size: 32, color: Colors.primary500, name: "size 32" },
    { Material: "home", size: 48, color: Colors.primary500, name: "size 48" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Icon Examples</Text>

      <IconSection title="Material Icons" icons={materialIcons} />
      <IconSection title="Feather Icons" icons={featherIcons} />
      <IconSection title="Ionicons" icons={ionIcons} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size Variations</Text>
        <View style={styles.iconGrid}>
          {sizeVariations.map((icon, index) => (
            <View key={index} style={styles.iconContainer}>
              <Icon {...icon} />
              <Text style={styles.iconName}>{icon.name}</Text>
            </View>
          ))}
        </View>
      </View>
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
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  iconContainer: {
    alignItems: "center",
    width: 80,
    marginBottom: 15,
  },
  iconName: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 5,
    textAlign: "center",
  },
});

export default IconExample;
