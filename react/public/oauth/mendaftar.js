import {
  View,
  StyleSheet,
  useState,
  useEffect,
  Input,
  Buttons,
  useFormValidation,
  Alert,
  SelectList,
  Network,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Spinner,
  properti,
} from "NexaUI";

function Mendaftar({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [assetColor, setAssetColor] = useState({
    buttonColor: "#24bca9",
    buttonTextColor: "#FFFFFF"
  });
  
  useEffect(() => {
    const fetchAssetColor = async () => {
      const color = await properti.getAssetColor();
      setAssetColor(color);
    };
    fetchAssetColor();
  }, []);
  
  const genderData = [
    { key: "male", value: "Laki-laki" },
    { key: "female", value: "Perempuan" },
  ];

  const { values, errors, isValid, handleChange, handleBlur, resetForm } =
    useFormValidation(
      {
        nama: "",
        telepon: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
      },
      {
        nama: {
          type: "text",
          length: [3, 50],
          placeholder: "Nama lengkap sesuai KTP",
        },
        telepon: {
          type: "tel",
          length: [10, 13],
          placeholder: "Contoh: 081234567890",
        },
        email: {
          type: "email",
          length: [5, 100],
          placeholder: "Masukkan email anda",
        },
        password: {
          type: "password",
          length: [8, 32],
          placeholder: "Masukkan password anda",
        },
        confirmPassword: {
          type: "password",
          length: [8, 32],
          placeholder: "Konfirmasi password anda",
          match: "password",
        },
        // gender: {
        //   type: "text",
        //   length: [10, 20],
        //   placeholder: "Pilih Jenis Kelamin",
        // },
      }
    );

  const handleSubmit = async () => {
    if (isValid) {
      try {
        setLoading(true);
        const api = Network("signup");
        const response = await api.post("created", {
          nama: values.nama,
          phone: values.telepon, // Fix: gunakan values.telepon bukan values.phone
          email: values.email,
          password: values.password,
          gender: values.gender, // Uncomment gender
        });
        if (response.status === "success" || response.status === "Success" || response.title === "Success") {
          resetForm();
          Alert.alert(response.title || "Success", response.message);
          // Navigate to login or home after successful registration
          // navigation.navigate('Login'); // Uncomment if needed
        } else {
          Alert.alert(response.title || "Error", response.message || "Terjadi kesalahan. Silakan coba lagi.");
        }
      } catch (error) {
        console.error("API Error:", error);
        Alert.alert("Error", "Gagal mengirim data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Error", "Mohon lengkapi semua field yang diperlukan");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Spinner
        visible={loading}
        overlay={true}
        text="Memproses pendaftaran..."
        textColor={assetColor.buttonTextColor}
        color={assetColor.buttonColor}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Input
          type="Text"
          Material="account"
          placeholder="Nama lengkap sesuai KTP"
          value={values.nama}
          onChangeText={(text) => handleChange("nama", text)}
          onBlur={() => handleBlur("nama")}
          errors={errors.nama}
          backgroundColor="#f5f5f5"
          editable={!loading}
        />

        <SelectList
          setSelected={(val) => handleChange("gender", val)}
          data={genderData}
          placeholder="Pilih Jenis Kelamin"
          searchPlaceholder="Cari..."
          save="key"
          onBlur={() => handleBlur("gender")}
          errors={errors.gender}
          backgroundColor="#f5f5f5"
          disabled={loading}
        />

        <Input
          type="tel"
          Material="phone"
          placeholder="Contoh: 081234567890"
          value={values.telepon}
          onChangeText={(text) => {
            const cleanText = text.replace(/[^\d+]/g, "");
            handleChange("telepon", cleanText);
          }}
          onBlur={() => handleBlur("telepon")}
          errors={errors.phone}
          backgroundColor="#f5f5f5"
          keyboardType="phone-pad"
          editable={!loading}
        />

        <Input
          type="Email"
          Material="email"
          placeholder="Masukkan email anda"
          value={values.email}
          onChangeText={(text) => handleChange("email", text)}
          onBlur={() => handleBlur("email")}
          errors={errors.email}
          backgroundColor="#f5f5f5"
          keyboardType="email-address"
          editable={!loading}
        />

        <Input
          type="Password"
          Material="lock"
          placeholder="Masukkan password anda"
          value={values.password}
          onChangeText={(text) => handleChange("password", text)}
          onBlur={() => handleBlur("password")}
          errors={errors.password}
          backgroundColor="#f5f5f5"
          password
          editable={!loading}
        />

        <Input
          type="Password"
          Material="lock"
          placeholder="Konfirmasi password anda"
          value={values.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          onBlur={() => handleBlur("confirmPassword")}
          errors={errors.confirmPassword}
          backgroundColor="#f5f5f5"
          password
          editable={!loading}
        />
        
        <Buttons
          label={loading ? "Memproses..." : "Mendaftar"}
          background={assetColor.buttonColor}
          txColor={assetColor.buttonTextColor}
          border={10}
          vertical={8}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  button: {
    padding: 8,
    marginTop: 16,
  },
});

export default Mendaftar;
