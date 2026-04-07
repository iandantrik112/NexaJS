import { useState, View, Text, StyleSheet, SelectList,useFormValidation } from "NexaUI";

const ExampleSelectList = () => {
  // Definisi aturan validasi
  const validationRules = {
    gender: {
      type: "text",
      placeholder: "Jenis Kelamin",
      length: [1, 1], // Harus dipilih (panjang 1 karakter)
    },
    province: {
      type: "text",
      placeholder: "Provinsi",
      length: [2, 2], // Harus dipilih (panjang 2 karakter)
    },
    education: {
      type: "text",
      placeholder: "Pendidikan",
      length: [1, 1], // Harus dipilih (panjang 1 karakter)
    },
  };

  // Inisialisasi form validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    resetForm,
  } = useFormValidation(
    {
      gender: "",
      province: "",
      education: "",
    },
    validationRules
  );

  // Data untuk jenis kelamin
  const genderData = [
    { key: "L", value: "Laki-laki" },
    { key: "P", value: "Perempuan" },
  ];

  // Data untuk provinsi
  const provinceData = [
    { key: "11", value: "Aceh" },
    { key: "12", value: "Sumatera Utara" },
    { key: "13", value: "Sumatera Barat" },
    { key: "14", value: "Riau" },
    { key: "15", value: "Jambi" },
    { key: "16", value: "Sumatera Selatan" },
  ];

  // Data untuk pendidikan
  const educationData = [
    { key: "1", value: "SD" },
    { key: "2", value: "SMP" },
    { key: "3", value: "SMA/SMK" },
    { key: "4", value: "D3" },
    { key: "5", value: "S1" },
    { key: "6", value: "S2" },
    { key: "7", value: "S3" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Contoh Penggunaan SelectList dengan Validasi
      </Text>

      {/* Contoh SelectList untuk Jenis Kelamin */}
      <SelectList
        setSelected={(val) => handleChange("gender", val)}
        data={genderData}
        placeholder="Pilih Jenis Kelamin"
        label="Jenis Kelamin"
        searchPlaceholder="Cari jenis kelamin..."
        save="key"
        onBlur={() => handleBlur("gender")}
      />
      {touched.gender && errors.gender && (
        <Text style={styles.errorText}>{errors.gender}</Text>
      )}

      {/* Contoh SelectList untuk Provinsi */}
      <SelectList
        setSelected={(val) => handleChange("province", val)}
        data={provinceData}
        placeholder="Pilih Provinsi"
        label="Provinsi"
        searchPlaceholder="Cari provinsi..."
        save="key"
        onBlur={() => handleBlur("province")}
      />
      {touched.province && errors.province && (
        <Text style={styles.errorText}>{errors.province}</Text>
      )}

      {/* Contoh SelectList untuk Pendidikan */}
      <SelectList
        setSelected={(val) => handleChange("education", val)}
        data={educationData}
        placeholder="Pilih Pendidikan"
        label="Pendidikan Terakhir"
        searchPlaceholder="Cari pendidikan..."
        save="key"
        txColor="#333"
        onBlur={() => handleBlur("education")}
      />
      {touched.education && errors.education && (
        <Text style={styles.errorText}>{errors.education}</Text>
      )}

      {/* Menampilkan nilai yang dipilih */}
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>Nilai yang dipilih:</Text>
        <Text>Jenis Kelamin: {values.gender}</Text>
        <Text>Provinsi: {values.province}</Text>
        <Text>Pendidikan: {values.education}</Text>
        <Text style={styles.validStatus}>
          Status Form: {isValid ? "Valid ✅" : "Belum Valid ❌"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  selectedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    paddingLeft: 5,
  },
  validStatus: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#333",
  },
});

export default ExampleSelectList;
