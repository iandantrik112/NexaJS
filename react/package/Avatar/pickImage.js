import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import { NexaDBLite } from "../Storage/NexaDBLite";
import { Network } from "../Storage/NexaSync";
import { Platform } from "react-native";
import { Alert } from "react-native";
import assetsImage from "../utils/localImage";

const AVATAR_STORAGE_KEY = "userAvatar";
const TOKEN_STORAGE_KEY = "userToken";

const useImageID = () => {
  const [imgID, setImgID] = useState("L");

  useEffect(() => {
    const loadUserGender = async () => {
      try {
        const storedUserData = await NexaDBLite.get("userSessions", "userSession");
        if (storedUserData?.jenis_kelamin || storedUserData?.gender) {
          setImgID(storedUserData.jenis_kelamin || storedUserData.gender);
        }
      } catch (error) {
        console.error("Error loading user gender:", error);
      }
    };
    loadUserGender();
  }, []);

  return { imgID, setImgID };
};

const getDefaultImage = (imageId) => assetsImage.get(imageId);

const ImgPicker = {
  useImageID,

  requestPermission: async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  },

  loadSavedImage: async () => {
    try {
      const storedUserData = await NexaDBLite.get("userSessions", "userSession");
      // Cek avatar dari server terlebih dahulu
      if (storedUserData?.avatar) {
        return storedUserData.avatar;
      }
      // Jika tidak ada, cek avatar yang sudah di-save
      const savedImage = await NexaDBLite.get("userSessions", AVATAR_STORAGE_KEY);
      if (savedImage) {
        return savedImage;
      }
      // Fallback ke default image berdasarkan gender
      const defaultImageId = storedUserData?.jenis_kelamin || storedUserData?.gender || "L";
      return getDefaultImage(defaultImageId);
    } catch (error) {
      console.error("Error loading saved image:", error);
      return getDefaultImage("L");
    }
  },

  pickImage: async () => {
    try {
      const hasPermission = await ImgPicker.requestPermission();

      if (!hasPermission) {
        throw new Error("Gallery permission not granted");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled) {
        const currentImage = await ImgPicker.loadSavedImage();
        return currentImage;
      }

      const imageUri = result.assets[0].uri;
      await NexaDBLite.set("userSessions", {
        id: AVATAR_STORAGE_KEY,
        avatar: imageUri
      });
      return imageUri;
    } catch (error) {
      console.error("Error in pickImage:", error);
      throw error;
    }
  },

  uploadAvatar: async (imageUri, customToken = null) => {
    try {
      const storedUserData = await NexaDBLite.get("userSessions", "userSession");
      // Ambil ID dari berbagai kemungkinan field
      // Jangan gunakan storedUserData?.id karena itu adalah key "userSession"
      const userId = storedUserData?.user_id || storedUserData?.userid || storedUserData?.id;
      
      // Validasi userId harus ada dan bukan "userSession"
      if (!userId || userId === "userSession") {
        throw new Error("User ID tidak ditemukan. Silakan login ulang.");
      }
      
      const api = Network("setting");
      // Set content type ke multipart/form-data untuk file upload
      api.setContentType("multipart/form-data");
      
      const formData = new FormData();
      let extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      if (!["jpg", "jpeg", "png"].includes(extension)) {
        extension = "jpg";
      }

      // Pastikan ID dikirim sebagai string/number (bukan "userSession")
      const userIdToSend = String(userId);
      if (userIdToSend === "userSession") {
        throw new Error("User ID tidak valid. Silakan login ulang.");
      }
      
      // Format file object untuk React Native FormData
      const fileObject = {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        type: `image/${extension === "jpg" ? "jpeg" : extension}`,
        name: `avatar_${userIdToSend}.${extension}`,
      };

      // Append ID dan file ke FormData
      formData.append("id", userIdToSend);
      formData.append("avatar", fileObject);

      const response = await api.post("avatar", formData);

      // Langsung gunakan response jika bukan string
      let parsedResponse = response;

      // Parse jika response adalah string
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (e) {
          // Using raw response
        }
      }

      // Jika upload berhasil
      if (parsedResponse?.status === "success" && parsedResponse?.data?.fileUrl) {
        // Update userSession dengan avatar baru dari server
        const currentSession = await NexaDBLite.get("userSessions", "userSession");
        if (currentSession) {
          await NexaDBLite.set("userSessions", {
            id: "userSession",
            ...currentSession,
            avatar: parsedResponse.data.fileUrl
          });
        }
        
        // Simpan juga ke AVATAR_STORAGE_KEY untuk kompatibilitas
        await NexaDBLite.set("userSessions", {
          id: AVATAR_STORAGE_KEY,
          avatar: parsedResponse.data.fileUrl
        });
        
        return {
          status: "success",
          data: {
            fileUrl: parsedResponse.data.fileUrl,
            fileName: parsedResponse.data.fileName || parsedResponse.data.avatarPath,
            isLocal: false,
          },
        };
      }

      // Fallback ke local storage
      return {
        status: "success",
        data: {
          fileUrl: imageUri,
          isLocal: true,
        },
      };
    } catch (error) {
      // Upload failed, return local image
      return {
        status: "success",
        data: {
          fileUrl: imageUri,
          isLocal: true,
        },
      };
    }
  },

  handleImageSelection: async (onSuccess, onError, customToken = null) => {
    let imageUri = null;
    try {
      // Validasi user ID sebelum memulai proses
      const storedUserData = await NexaDBLite.get("userSessions", "userSession");
      const userId = storedUserData?.id || storedUserData?.user_id || storedUserData?.userid;
      
      if (!userId) {
        Alert.alert("Error", "User ID tidak ditemukan. Silakan login ulang.", [{ text: "OK" }]);
        onError(new Error("User ID tidak ditemukan"));
        return;
      }
      
      imageUri = await ImgPicker.pickImage();
      if (imageUri && imageUri !== getDefaultImage("L")) {
        const uploadResponse = await ImgPicker.uploadAvatar(
          imageUri,
          customToken
        );

        const finalImageUrl = uploadResponse.data.fileUrl;
        const isLocal = uploadResponse.data.isLocal;

        // Simpan URL ke storage (sudah dilakukan di uploadAvatar, tapi untuk memastikan)
        await NexaDBLite.set("userSessions", {
          id: AVATAR_STORAGE_KEY,
          avatar: finalImageUrl
        });
        // Update UI
        onSuccess(finalImageUrl);
      } else {
        onSuccess(imageUri);
      }
    } catch (error) {
      console.error("Image selection process failed:", error);
      if (imageUri && imageUri !== getDefaultImage("L")) {
        await NexaDBLite.set("userSessions", {
          id: AVATAR_STORAGE_KEY,
          avatar: imageUri
        });
        onSuccess(imageUri);
        // Alert.alert("Info", "Foto profil tersimpan secara lokal", [
        //   { text: "OK" },
        // ]);
      } else {
        onError(error);
        Alert.alert("Error", error.message || "Gagal memproses foto profil", [{ text: "OK" }]);
      }
    }
  },

  // Tambah method untuk set token
  setToken: async (token) => {
    try {
      await NexaDBLite.set("userSessions", {
        id: TOKEN_STORAGE_KEY,
        token: token
      });
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  },

  // Tambah method untuk get token
  getToken: async () => {
    try {
      const tokenData = await NexaDBLite.get("userSessions", TOKEN_STORAGE_KEY);
      return tokenData?.token || null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },
};

export default ImgPicker;
