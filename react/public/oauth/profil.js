import {
  useState,
  useEffect,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  Storage,
  FeatherIcon,
  Alert,
  useNavigation,
  fs,
  Avatar,
  ImgPicker,
} from "NexaUI";

export default function Example() {
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await Storage.getItem("userSession");
        setUserData(storedUserData);
        // console.log("User Data:", storedUserData);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      }
    };

    const loadImage = async () => {
      try {
        const savedImage = await ImgPicker.loadSavedImage();
        setSelectedImage(savedImage);
      } catch (error) {
        console.error("Error loading avatar:", error);
      }
    };

    getUserData();
    loadImage();
  }, []);

  const handleImagePick = () => {
    ImgPicker.handleImageSelection(
      (imageUri) => setSelectedImage(imageUri),
      (error) => console.error("Failed to pick image:", error)
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.sectionBody}>
            <View style={styles.profile}>
              <Avatar
                source={selectedImage}
                size={60}
                icon="camera"
                iconColor="#24bca9"
                iconSize={10}
                iconPadding={4}
                onIconPress={handleImagePick}
                style={styles.profileAvatar}
              />

              <View style={styles.profileBody}>
                <Text style={styles.profileName}>
                  {userData?.nama_lengkap || "Loading..."}
                </Text>

                <Text style={styles.profileHandle}>
                  {userData?.email || "Loading..."}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>ID</Text>

                <View style={styles.rowSpacer} />

                <Text style={styles.rowValue}>
                  {userData?.nik || "Loading..."}
                </Text>

                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <FeatherIcon
                  color="#000"
                  name="mail"
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.rowLabel}>Email Notifications</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  value={form.emailNotifications}
                  onValueChange={(emailNotifications) =>
                    setForm({ ...form, emailNotifications })
                  }
                  color="#24bca9"
                />
              </View>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <View style={styles.row}>
                <FeatherIcon
                  color="#000"
                  name="bell"
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  value={form.pushNotifications}
                  onValueChange={(pushNotifications) =>
                    setForm({ ...form, pushNotifications })
                  }
                  color="#F44336"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                onPress={() => navigation.navigate("setting", userData)}
                style={styles.row}
              >
                <FeatherIcon
                  color="#000"
                  name="settings"
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.rowLabel}>Setting Akun</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => navigation.navigate("asuransi", {})}
                style={styles.row}
              >
                <FeatherIcon
                  color="#000"
                  name="heart"
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.rowLabel}>Asuransi Penunjang</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("antrian", userData);
                  // antrian handle onPress
                }}
                style={styles.row}
              >
                <FeatherIcon
                  color="#000"
                  name="maximize"
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.rowLabel}>QR Antrin Poliklinik</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}
              >
                <FeatherIcon
                  color="#000"
                  name="shield"
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.rowLabel}>Terms and Privacy</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBody}>
            <View
              style={[
                styles.rowWrapper,
                styles.rowFirst,
                styles.rowLast,
                { alignItems: "center" },
              ]}
            >
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Storage.removeItem("userSession");
                    // User session cleared successfully
                    // You can add navigation here if needed
                    navigation.navigate("Home");
                  } catch (error) {
                    console.error("Error during logout:", error);
                    Alert.alert("Error", "Failed to logout. Please try again.");
                  }
                }}
                style={styles.row}
              >
                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.contentFooter}>App Version 2.24 #50491</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    ...fs.lg,
    ...fs.semibold,
    color: "#000",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: "left",
  },
  /** Content */
  content: {
    paddingHorizontal: 16,
  },
  contentFooter: {
    marginTop: 24,
    ...fs.xs,
    ...fs.medium,
    textAlign: "center",
    color: "#a69f9f",
  },
  /** Section */
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    margin: 8,
    marginLeft: 12,
    ...fs.xs,
    ...fs.medium,
    letterSpacing: 0.33,
    color: "#a69f9f",
    textTransform: "uppercase",
  },
  sectionBody: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  /** Profile */
  profile: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    marginRight: 12,
  },
  profileBody: {
    marginRight: "auto",
  },
  profileName: {
    ...fs.lg,
    ...fs.semibold,
    color: "#292929",
  },
  profileHandle: {
    marginTop: 2,
    ...fs.md,
    ...fs.normal,
    color: "#858585",
  },
  /** Row */
  row: {
    height: 44,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 12,
  },
  rowWrapper: {
    paddingLeft: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rowLabel: {
    ...fs.md,
    letterSpacing: 0.24,
    color: "#000",
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    ...fs.md,
    ...fs.medium,
    color: "#ababab",
    marginRight: 4,
  },
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rowLabelLogout: {
    width: "100%",
    textAlign: "center",
    ...fs.semibold,
    color: "#dc2626",
  },
});
