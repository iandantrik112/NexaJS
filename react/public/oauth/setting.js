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
  useNavigation,
  NexaDBLite,
  properti,
} from "NexaUI";

export default function Setting({ route }) {
  const params = route.params;
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assetColor, setAssetColor] = useState({
    buttonColor: "#24bca9",
    buttonTextColor: "#FFFFFF"
  });
  
  const genderData = [
    { key: "male", value: "Laki-laki" },
    { key: "female", value: "Perempuan" },
  ];

  // Helper function untuk memastikan format gender konsisten (male/female)
  const convertGenderFormat = (gender) => {
    if (!gender) return "";
    // Hanya terima format male/female
    if (gender === "male" || gender === "female") return gender;
    // Jika format tidak valid, return empty string
    return "";
  };

  // Fetch asset color from properti
  useEffect(() => {
    const fetchAssetColor = async () => {
      const color = await properti.getAssetColor();
      setAssetColor(color);
    };
    fetchAssetColor();
  }, []);

  // Load user data from NexaDBLite if params is incomplete
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get data from NexaDBLite
        const storedData = await NexaDBLite.get("userSessions", "userSession");
        if (storedData) {
          setUserData(storedData);
          
          // If params doesn't have complete data, use storedData
          if (!params || !params.nama_lengkap) {
            // Update form with stored data
            const initialValues = {
              fullName: storedData?.nama_lengkap || storedData?.user_real_name || storedData?.user_name || "",
              nik: storedData?.nik || "",
              phone: storedData?.no_hp || storedData?.phone || "",
              email: storedData?.email || "",
              password: "",
              confirmPassword: "",
              gender: convertGenderFormat(storedData?.jenis_kelamin || storedData?.gender || ""),
              address: storedData?.alamat || storedData?.address || "",
            };
            setValues(initialValues);
          }
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Map data from params or userData to form values
  const getFormInitialValues = () => {
    const data = params || userData || {};
    
    return {
      fullName: data?.nama_lengkap || data?.user_real_name || data?.user_name || "",
      nik: data?.nik || "",
      phone: data?.no_hp || data?.phone || "",
      email: data?.email || "",
      password: "",
      confirmPassword: "",
      gender: convertGenderFormat(data?.jenis_kelamin || data?.gender || ""),
      address: data?.alamat || data?.address || "",
    };
  };

  const { values, errors, isValid, handleChange, handleBlur, resetForm, setValues } =
    useFormValidation(
      getFormInitialValues(),
      {
        fullName: {
          type: "text",
          length: [3, 50],
          required: true,
        },
        nik: {
          type: "text",
          length: [16],
          required: true,
        },
        phone: {
          type: "tel",
          length: [10, 13],
          required: true,
        },
        email: {
          type: "email",
          required: true,
        },
        password: {
          type: "password",
          length: [8, 32],
          required: false,
        },
        gender: {
          type: "text",
          required: true,
        },
        address: {
          type: "text",
          length: [10, 255],
          required: true,
        },
      }
    );

  // Update form values when params or userData changes
  useEffect(() => {
    if (!isLoading) {
      const data = params || userData || {};
      const initialValues = {
        fullName: data?.nama_lengkap || data?.user_real_name || data?.user_name || "",
        nik: data?.nik || "",
        phone: data?.no_hp || data?.phone || "",
        email: data?.email || "",
        password: "",
        confirmPassword: "",
        gender: convertGenderFormat(data?.jenis_kelamin || data?.gender || ""),
        address: data?.alamat || data?.address || "",
      };
      // Only update if we have actual data (not just empty strings)
      const hasData = Object.values(initialValues).some(val => val && val !== "");
      if (hasData) {
        setValues(initialValues);
      }
    }
  }, [params, userData, isLoading, setValues]);

  const handleSubmit = async () => {
    // Ambil data terbaru dari NexaDBLite untuk memastikan userId tersedia
    let currentData = null;
    
    try {
      // Selalu ambil data terbaru dari NexaDBLite
      const storedData = await NexaDBLite.get("userSessions", "userSession");
      if (storedData) {
        currentData = storedData;
      } else {
        // Fallback ke params atau userData jika NexaDBLite tidak ada
        currentData = params || userData || {};
      }
    } catch (error) {
      // Fallback ke params atau userData jika error
      currentData = params || userData || {};
    }
    
    // Validasi minimal: ID harus ada
    // Jangan gunakan currentData.id karena itu adalah key "userSession"
    // Gunakan user_id atau userid dari response server
    const userId = currentData?.user_id || currentData?.userid;
    
    // Debug: log data untuk troubleshooting (hanya jika userId tidak ditemukan)
    if (!userId || userId === "userSession" || userId === 0) {
      console.log("Debug - currentData:", currentData);
      console.log("Debug - userId:", userId);
      console.log("Debug - user_id:", currentData?.user_id);
      console.log("Debug - userid:", currentData?.userid);
      Alert.alert("Error", "ID user tidak ditemukan. Silakan login ulang.");
      return;
    }

    // Data lama dari database/session
    const oldData = {
      fullName: currentData?.nama_lengkap || currentData?.user_real_name || currentData?.user_name || "",
      nik: currentData?.nik || "",
      phone: currentData?.no_hp || currentData?.phone || "",
      email: currentData?.email || "",
      gender: convertGenderFormat(currentData?.jenis_kelamin || currentData?.gender || ""),
      address: currentData?.alamat || currentData?.address || "",
    };

    // Data baru dari form
    const newData = {
      fullName: values.fullName.trim(),
      nik: values.nik.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      gender: values.gender,
      address: values.address.trim(),
    };

    // Validasi alamat hanya jika alamat berubah
    if (newData.address !== oldData.address) {
      if (!newData.address || newData.address.length < 10) {
        Alert.alert("Error", "Alamat harus diisi minimal 10 karakter");
        return;
      }
    }

    // Bandingkan dan hanya kirim field yang berubah
    const formData = {
      id: userId,
    };

    // Hanya tambahkan field yang berubah
    if (newData.fullName !== oldData.fullName) {
      formData.fullName = newData.fullName;
    }
    if (newData.nik !== oldData.nik) {
      formData.nik = newData.nik;
    }
    if (newData.phone !== oldData.phone) {
      formData.phone = newData.phone;
    }
    if (newData.email !== oldData.email) {
      formData.email = newData.email;
    }
    if (newData.gender !== oldData.gender) {
      formData.gender = newData.gender;
    }
    if (newData.address !== oldData.address) {
      formData.address = newData.address;
    }

        // Hanya tambahkan password jika diisi (dianggap berubah)
        if (values.password && values.password.trim().length > 0) {
          formData.password = values.password.trim();
        }

        // Jika tidak ada data yang berubah, beri tahu user
        const hasChanges = Object.keys(formData).length > 1; // Lebih dari 1 karena ada 'id'
        if (!hasChanges) {
          Alert.alert("Info", "Tidak ada perubahan data yang perlu disimpan.");
          return;
        }

        try {
          const api = Network("signup");
          const response = await api.post("updated", formData);
          
          if (response.status === "success" || response.status === "Success" || response.title === "Success") {
            const currentSession = await NexaDBLite.get("userSessions", "userSession");
            if (currentSession) {
              const updatedSession = {
                ...currentSession,
                // Update semua field yang mungkin digunakan untuk menampilkan data
                nama_lengkap: values.fullName.trim(),
                user_real_name: values.fullName.trim(), // Field yang digunakan di Uid.js
                user_name: values.fullName.trim(), // Field alternatif yang digunakan di Uid.js
                nik: values.nik.trim(),
                no_hp: values.phone.trim(),
                phone: values.phone.trim(), // Field alternatif
                email: values.email.trim(),
                jenis_kelamin: values.gender,
                gender: values.gender, // Field alternatif
                alamat: values.address.trim(),
                address: values.address.trim(), // Field alternatif
              };
              await NexaDBLite.set("userSessions", {
                id: "userSession",
                ...updatedSession
              });
              
              // Tampilkan alert dulu, lalu navigate
              Alert.alert(response.title || "Success", response.message, [
                {
                  text: "OK",
                  onPress: () => {
                    // Gunakan goBack atau navigate untuk trigger useFocusEffect di Uid.js
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.navigate("User", { userData: updatedSession });
                    }
                  }
                }
              ]);
              return; // Return untuk mencegah eksekusi kode di bawah
            }
          } else {
            Alert.alert(
              response.title || "Error",
              response.message || "Gagal menyimpan data"
            );
          }
        } catch (error) {
          Alert.alert("Error", "Gagal mengirim data. Silakan coba lagi.");
        }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          <Input
            label="Nama Lengkap"
            type="Text"
            Material="account"
            placeholder="Nama lengkap sesuai KTP"
            value={values.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
            onBlur={() => handleBlur("fullName")}
            errors={errors.fullName}
            backgroundColor="#f5f5f5"
          />

          <SelectList
            setSelected={(val) => handleChange("gender", val)}
            data={genderData}
            placeholder="Pilih Jenis Kelamin"
            label="Jenis Kelamin"
            searchPlaceholder="Cari..."
            save="key"
            defaultOption={
              (params?.jenis_kelamin || userData?.jenis_kelamin || userData?.gender)
                ? {
                    key: convertGenderFormat(params?.jenis_kelamin || userData?.jenis_kelamin || userData?.gender),
                    value: convertGenderFormat(params?.jenis_kelamin || userData?.jenis_kelamin || userData?.gender) === "male" ? "Laki-laki" : "Perempuan",
                  }
                : null
            }
            onBlur={() => handleBlur("gender")}
            errors={errors.gender}
            backgroundColor="#f5f5f5"
          />

          <Input
            label="Alamat Lengkap"
            type="TextArea"
            Material="home"
            placeholder="Masukkan alamat lengkap"
            value={values.address}
            onChangeText={(text) => handleChange("address", text)}
            onBlur={() => handleBlur("address")}
            errors={errors.address}
            backgroundColor="#f5f5f5"
            multiline={true}
            numberOfLines={3}
          />

          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Input
                label="Nomor NIK"
                type="Text"
                Material="barcode"
                placeholder="NIK"
                value={values.nik}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^\d]/g, "");
                  handleChange("nik", cleanText);
                }}
                onBlur={() => handleBlur("nik")}
                errors={errors.nik}
                backgroundColor="#f5f5f5"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Nomor Telpon"
                type="tel"
                Material="phone"
                placeholder="No. HP"
                value={values.phone}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^\d+]/g, "");
                  handleChange("phone", cleanText);
                }}
                onBlur={() => handleBlur("phone")}
                errors={errors.phone}
                backgroundColor="#f5f5f5"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Input
            label="Email"
            type="Email"
            Material="email"
            placeholder="Masukkan email anda"
            value={values.email}
            onChangeText={(text) => handleChange("email", text)}
            onBlur={() => handleBlur("email")}
            errors={errors.email}
            backgroundColor="#f5f5f5"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            type="Password"
            Material="lock"
            placeholder="Masukkan password anda"
            value={values.password}
            onChangeText={(text) => handleChange("password", text)}
            onBlur={() => handleBlur("password")}
            errors={errors.password}
            backgroundColor="#f5f5f5"
            password
          />

          <Input
            label="Konfirmasi Password"
            type="Password"
            Material="lock"
            placeholder="Konfirmasi password anda"
            value={values.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            onBlur={() => handleBlur("confirmPassword")}
            errors={errors.confirmPassword}
            backgroundColor="#f5f5f5"
            password
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Buttons
          label="Simpan Perubahan"
          background={assetColor.buttonColor}
          txColor={assetColor.buttonTextColor}
          border={10}
          vertical={8}
          onPress={handleSubmit}
          disabled={!isValid}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Memberikan ruang untuk button
  },
  formContainer: {
    gap: 12,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    // backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 16,
    // borderTopWidth: 1,
    // borderTopColor: "#f0f0f0",
    // zIndex: 1000,
    // elevation: 8, // For Android shadow
    // shadowColor: "#000", // For iOS shadow
    // shadowOffset: {
    //   width: 0,
    //   height: -2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
});
