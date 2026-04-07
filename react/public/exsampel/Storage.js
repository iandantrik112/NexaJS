import { Storage } from "../package";

// Contoh penggunaan Storage untuk manajemen data user
export const UserStorage = {
  // Menyimpan data user
  saveUserData: async (userData) => {
    try {
      await Storage.setItem("userData", userData);
      console.log("Data user berhasil disimpan");
      return true;
    } catch (error) {
      console.error("Gagal menyimpan data user:", error);
      return false;
    }
  },

  // Mengambil data user
  getUserData: async () => {
    try {
      const userData = await Storage.getItem("userData");
      return userData;
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      return null;
    }
  },

  // Menghapus data user (logout)
  clearUserData: async () => {
    try {
      await Storage.removeItem("userData");
      console.log("Data user berhasil dihapus");
      return true;
    } catch (error) {
      console.error("Gagal menghapus data user:", error);
      return false;
    }
  },
};

// Contoh penggunaan Storage untuk pengaturan aplikasi
export const AppSettings = {
  // Menyimpan pengaturan tema
  saveTheme: async (isDarkMode) => {
    try {
      await Storage.setItem("theme", { isDarkMode });
      return true;
    } catch (error) {
      console.error("Gagal menyimpan tema:", error);
      return false;
    }
  },

  // Mengambil pengaturan tema
  getTheme: async () => {
    try {
      const theme = await Storage.getItem("theme");
      return theme?.isDarkMode ?? false;
    } catch (error) {
      console.error("Gagal mengambil tema:", error);
      return false;
    }
  },

  // Menyimpan bahasa aplikasi
  saveLanguage: async (language) => {
    try {
      await Storage.setItem("language", { language });
      return true;
    } catch (error) {
      console.error("Gagal menyimpan bahasa:", error);
      return false;
    }
  },

  // Mengambil bahasa aplikasi
  getLanguage: async () => {
    try {
      const languageData = await Storage.getItem("language");
      return languageData?.language ?? "id";
    } catch (error) {
      console.error("Gagal mengambil bahasa:", error);
      return "id";
    }
  },
};

// Contoh penggunaan untuk caching data
export const DataCache = {
  // Menyimpan data cache
  saveCache: async (key, data, expirationInMinutes = 60) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expirationInMinutes,
      };
      await Storage.setItem(`cache_${key}`, cacheData);
      return true;
    } catch (error) {
      console.error("Gagal menyimpan cache:", error);
      return false;
    }
  },

  // Mengambil data cache
  getCache: async (key) => {
    try {
      const cacheData = await Storage.getItem(`cache_${key}`);
      if (!cacheData) return null;

      const { data, timestamp, expirationInMinutes } = cacheData;
      const expirationTime = timestamp + expirationInMinutes * 60 * 1000;

      // Cek apakah cache sudah expired
      if (Date.now() > expirationTime) {
        await Storage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Gagal mengambil cache:", error);
      return null;
    }
  },

  // Menghapus semua cache
  clearAllCache: async () => {
    try {
      const keys = await Storage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("cache_"));

      for (const key of cacheKeys) {
        await Storage.removeItem(key);
      }

      return true;
    } catch (error) {
      console.error("Gagal menghapus cache:", error);
      return false;
    }
  },
};
