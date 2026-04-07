import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  Input,
  useFormValidation,
  pickImage,
  pickCamera,
  pickVideo,
  recordVideo,
  pickDocument,
  Buttons,
  formatFileSize,
} from "NexaUI";

const ValidasiExample = () => {

  // Inisialisasi form dengan useFormValidation
  const { values, errors, isValid, handleChange, handleBlur, resetForm } =
    useFormValidation(
      {
        // Initial values
        nama: "",
        email: "",
        telepon: "",
        foto: null,
        ktp: null,
        ijazah: null,
        video: null,
      },
      {
        // Validation rules dengan tipe yang spesifik
        nama: {
          type: "text",
          length: [3, 50], // min 3, max 50 karakter
          placeholder: "Nama",
        },
        email: {
          type: "email",
          length: [5, 100], // min 5, max 100 karakter
          placeholder: "Email",
        },
        telepon: {
          type: "tel",
          length: [8, 13], // min 8, max 13 digit
          placeholder: "Nomor Telepon",
        },
        foto: {
          type: "file",
          placeholder: "Foto",
          required: true,
        },
        ktp: {
          type: "document",
          placeholder: "KTP",
          required: true,
          allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
          maxSize: 2 * 1024 * 1024, // 2MB
        },
        ijazah: {
          type: "document",
          placeholder: "Ijazah",
          required: true,
          allowedTypes: ["application/pdf"],
          maxSize: 5 * 1024 * 1024, // 5MB
        },
        video: {
          type: "video",
          placeholder: "Video",
          required: true,
          maxDuration: 60, // 60 detik
          maxSize: 50 * 1024 * 1024, // 50MB
        },
      }
    );

  // Handle image picker
  const handleImagePick = async () => {
    try {
      const result = await pickImage();
      if (result) {
        // Validasi ukuran file (maksimal 5MB)
        if (result.size > 5 * 1024 * 1024) {
          Alert.alert("Error", "Ukuran file terlalu besar (maksimal 5MB)");
          return;
        }

        // Validasi tipe file
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(result.type)) {
          Alert.alert("Error", "Tipe file tidak didukung (hanya JPG dan PNG)");
          return;
        }

        handleChange("foto", result);
      }
    } catch (error) {
      console.error("Error in handleImagePick:", error);
      Alert.alert("Error", "Gagal memilih foto. Silakan coba lagi.");
    }
  };

  // Handle camera picker
  const handleCameraCapture = async () => {
    try {
      const result = await pickCamera();
      if (result) {
        // Validasi ukuran file (maksimal 5MB)
        if (result.size > 5 * 1024 * 1024) {
          Alert.alert("Error", "Ukuran file terlalu besar (maksimal 5MB)");
          return;
        }
        handleChange("foto", result);
      }
    } catch (error) {
      console.error("Error in handleCameraCapture:", error);
      Alert.alert("Error", "Gagal mengambil foto. Silakan coba lagi.");
    }
  };

  // Handle document picker untuk KTP
  const handleKtpPick = async () => {
    try {
      const result = await pickDocument({
        type: ["application/pdf", "image/jpeg", "image/png"],
      });
      if (result) {
        handleChange("ktp", result);
      }
    } catch (error) {
      console.error("Error in handleKtpPick:", error);
      Alert.alert("Error", "Gagal memilih dokumen KTP. Silakan coba lagi.");
    }
  };

  // Handle document picker untuk Ijazah
  const handleIjazahPick = async () => {
    try {
      const result = await pickDocument({
        type: ["application/pdf"],
      });
      if (result) {
        handleChange("ijazah", result);
      }
    } catch (error) {
      console.error("Error in handleIjazahPick:", error);
      Alert.alert("Error", "Gagal memilih dokumen Ijazah. Silakan coba lagi.");
    }
  };

  // Handle video picker
  const handleVideoPick = async () => {
    try {
      const result = await pickVideo({
        videoMaxDuration: 60,
      });
      if (result) {
        // Validasi ukuran file (maksimal 50MB)
        if (result.size > 50 * 1024 * 1024) {
          Alert.alert("Error", "Ukuran video terlalu besar (maksimal 50MB)");
          return;
        }

        // Validasi durasi
        if (result.duration > 60 * 1000) {
          // 60 detik dalam milidetik
          Alert.alert("Error", "Durasi video tidak boleh lebih dari 60 detik");
          return;
        }

        handleChange("video", result);
      }
    } catch (error) {
      console.error("Error in handleVideoPick:", error);
      Alert.alert("Error", "Gagal memilih video. Silakan coba lagi.");
    }
  };

  // Handle video recording
  const handleVideoRecord = async () => {
    try {
      const result = await recordVideo({
        videoMaxDuration: 60,
      });
      if (result) {
        handleChange("video", result);
      }
    } catch (error) {
      console.error("Error in handleVideoRecord:", error);
      Alert.alert("Error", "Gagal merekam video. Silakan coba lagi.");
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (isValid) {
      console.log("Form Data:", values);
      Alert.alert("Success", "Data berhasil dikirim!");
      resetForm();
    } else {
      console.log("Form tidak valid:", errors);
      Alert.alert("Error", "Mohon lengkapi semua field yang diperlukan");
    }
  };

  // Video component with proper status handling
  const VideoPreview = ({ uri }) => {
    const player = useVideoPlayer(uri, (player) => {
      player.loop = true;
      player.play();
    });

    return (
      <VideoView
        player={player}
        style={styles.videoPreview}
        allowsFullscreen
        contentFit="contain"
      />
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Input Nama */}
        <Input
          label="Nama"
          type="Text"
          Material="account"
          placeholder="Masukkan nama lengkap"
          value={values.nama}
          onChangeText={(text) => handleChange("nama", text)}
          onBlur={() => handleBlur("nama")}
          errors={errors.nama}
        />

        {/* Input Email */}
        <Input
          label="Email"
          type="Email"
          Material="email"
          placeholder="Masukkan email"
          value={values.email}
          onChangeText={(text) => handleChange("email", text)}
          onBlur={() => handleBlur("email")}
          errors={errors.email}
        />

        {/* Input Telepon */}
        <Input
          label="Telepon"
          type="tel"
          Material="phone"
          placeholder="Masukkan nomor telepon"
          value={values.telepon}
          onChangeText={(text) => {
            const cleanText = text.replace(/[^\d+]/g, "");
            handleChange("telepon", cleanText);
          }}
          onBlur={() => handleBlur("telepon")}
          errors={errors.telepon}
          keyboardType="phone-pad"
        />

        {/* Image Picker untuk Foto dengan Opsi Kamera */}
        <View style={styles.fileSection}>
          <Input
            label="Foto"
            type="document"
            Material="image"
            placeholder="Upload foto profil"
            selectedFile={values.foto}
            onSelectDocument={handleImagePick}
            errors={errors.foto}
          />
          <View style={styles.imagePickerButtons}>
            <Buttons
              label="Galeri"
              onPress={handleImagePick}
              background="#007AFF"
              txColor="#FFFFFF"
              border={8}
              Feather="image"
              style={styles.pickButton}
            />
            <Buttons
              label="Kamera"
              onPress={handleCameraCapture}
              background="#4CAF50"
              txColor="#FFFFFF"
              border={8}
              Feather="camera"
              style={styles.pickButton}
            />
          </View>
          {values.foto && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: values.foto.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <Text style={styles.fileInfo}>
                {formatFileSize(values.foto.size)}
              </Text>
            </View>
          )}
        </View>

        {/* Document Picker untuk KTP */}
        <View style={styles.fileSection}>
          <Input
            label="KTP"
            type="document"
            Material="file-document"
            placeholder="Upload KTP (PDF/JPG/PNG)"
            selectedFile={values.ktp}
            onSelectDocument={handleKtpPick}
            errors={errors.ktp}
          />
          {values.ktp && (
            <Text style={styles.fileInfo}>
              {values.ktp.name} ({formatFileSize(values.ktp.size)})
            </Text>
          )}
        </View>

        {/* Document Picker untuk Ijazah */}
        <View style={styles.fileSection}>
          <Input
            label="Ijazah"
            type="document"
            Material="file-document"
            placeholder="Upload Ijazah (PDF)"
            selectedFile={values.ijazah}
            onSelectDocument={handleIjazahPick}
            errors={errors.ijazah}
          />
          {values.ijazah && (
            <Text style={styles.fileInfo}>
              {values.ijazah.name} ({formatFileSize(values.ijazah.size)})
            </Text>
          )}
        </View>

        {/* Video Picker with Enhanced Preview */}
        <View style={styles.fileSection}>
          <Input
            label="Video"
            type="document"
            Material="video"
            placeholder="Upload video (max 60 detik)"
            selectedFile={values.video}
            onSelectDocument={handleVideoPick}
            errors={errors.video}
          />
          <View style={styles.imagePickerButtons}>
            <Buttons
              label="Pilih Video"
              onPress={handleVideoPick}
              background="#007AFF"
              txColor="#FFFFFF"
              border={8}
              Feather="video"
              style={styles.pickButton}
            />
            <Buttons
              label="Rekam Video"
              onPress={handleVideoRecord}
              background="#4CAF50"
              txColor="#FFFFFF"
              border={8}
              Feather="video-off"
              style={styles.pickButton}
            />
          </View>
          {values.video && (
            <View style={styles.videoContainer}>
              <VideoPreview uri={values.video.uri} />
              <Text style={styles.fileInfo}>
                Durasi: {Math.round(values.video.duration / 1000)} detik (
                {formatFileSize(values.video.size)})
              </Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Buttons
          label="Submit Form"
          onPress={handleSubmit}
          background="#4CAF50"
          txColor="#FFFFFF"
          border={8}
          disabled={!isValid}
          Feather="check-circle"
        />

        {/* Reset Button */}
        <Buttons
          label="Reset Form"
          onPress={resetForm}
          background="#f44336"
          txColor="#FFFFFF"
          border={8}
          Feather="refresh-ccw"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 10,
  },
  fileSection: {
    marginBottom: 10,
  },
  imagePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 10,
  },
  pickButton: {
    flex: 1,
  },
  previewContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  videoContainer: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  videoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
});

export default ValidasiExample;
