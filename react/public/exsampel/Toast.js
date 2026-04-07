import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useState,
  Buttons,
  Toast,
  ToastContainer,
  toastManager,
  Text,
  TouchableOpacity,
} from "NexaUI";

const ToastExample = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("info");
  const [toastPosition, setToastPosition] = useState("top");

  // Contoh menggunakan Toast Component (Standalone)
  const showStandaloneToast = (type, position) => {
    setToastType(type);
    setToastPosition(position);
    setShowToast(true);
  };

  // Contoh menggunakan Toast Manager (Global - Recommended)
  const showGlobalToast = (type, position = "top") => {
    const messages = {
      success: "Data berhasil disimpan!",
      error: "Terjadi kesalahan saat memproses data.",
      warning: "Perhatian! Pastikan semua data sudah benar.",
      info: "Ini adalah pesan informasi untuk pengguna.",
    };

    toastManager[type](messages[type], {
      position: position,
      duration: 3000,
    });
  };

  const showToastWithAction = () => {
    toastManager.show("Item berhasil dihapus", {
      type: "success",
      position: "bottom",
      duration: 5000,
      action: () => {
        toastManager.info("Aksi dibatalkan");
      },
      actionLabel: "Undo",
    });
  };

  const showCustomToast = () => {
    toastManager.show("Toast dengan custom style", {
      type: "info",
      position: "top",
      duration: 4000,
      style: {
        backgroundColor: "#9c27b0",
      },
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    });
  };

  const showLongMessageToast = () => {
    toastManager.warning(
      "Ini adalah pesan yang sangat panjang untuk menunjukkan bagaimana toast menangani teks yang panjang. Toast akan menampilkan maksimal 3 baris teks.",
      {
        position: "bottom",
        duration: 5000,
      }
    );
  };

  const showMultipleToasts = () => {
    toastManager.success("Toast pertama", { position: "top" });
    setTimeout(() => {
      toastManager.info("Toast kedua", { position: "top" });
    }, 500);
    setTimeout(() => {
      toastManager.warning("Toast ketiga", { position: "top" });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ToastContainer harus ada di root untuk global toast manager */}
      <ToastContainer />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.sectionTitle}>Toast Manager (Global - Recommended)</Text>
        <Text style={styles.sectionDescription}>
          Menggunakan toastManager untuk menampilkan toast dari mana saja tanpa perlu
          state management
        </Text>

        {/* Success Toast */}
        <Buttons
          label="Success Toast (Top)"
          background="#4caf50"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={() => showGlobalToast("success", "top")}
        />

        <Buttons
          label="Success Toast (Bottom)"
          background="#4caf50"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={() => showGlobalToast("success", "bottom")}
        />

        {/* Error Toast */}
        <Buttons
          label="Error Toast"
          background="#f44336"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={() => showGlobalToast("error", "top")}
        />

        {/* Warning Toast */}
        <Buttons
          label="Warning Toast"
          background="#ffeb3b"
          txColor="#000000"
          border={10}
          vertical={8}
          onPress={() => showGlobalToast("warning", "top")}
        />

        {/* Info Toast */}
        <Buttons
          label="Info Toast"
          background="#2196f3"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={() => showGlobalToast("info", "top")}
        />

        {/* Toast dengan Action Button */}
        <Buttons
          label="Toast dengan Action (Undo)"
          background="#9c27b0"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={showToastWithAction}
        />

        {/* Custom Style Toast */}
        <Buttons
          label="Custom Style Toast"
          background="#ff9800"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={showCustomToast}
        />

        {/* Long Message Toast */}
        <Buttons
          label="Long Message Toast"
          background="#009688"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={showLongMessageToast}
        />

        {/* Multiple Toasts */}
        <Buttons
          label="Multiple Toasts"
          background="#607d8b"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={showMultipleToasts}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Toast Component (Standalone)</Text>
        <Text style={styles.sectionDescription}>
          Menggunakan Toast component dengan state management manual
        </Text>

        {/* Standalone Toast Examples */}
        <Buttons
          label="Show Success Toast (Top)"
          background="#4caf50"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={() => showStandaloneToast("success", "top")}
        />

        <Buttons
          label="Show Error Toast (Bottom)"
          background="#f44336"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={() => showStandaloneToast("error", "bottom")}
        />

        <Buttons
          label="Show Warning Toast (Top)"
          background="#ffeb3b"
          txColor="#000000"
          border={10}
          vertical={8}
          onPress={() => showStandaloneToast("warning", "top")}
        />

        <Buttons
          label="Show Info Toast (Bottom)"
          background="#2196f3"
          txColor="#FFFFFF"
          border={10}
          vertical={8}
          onPress={() => showStandaloneToast("info", "bottom")}
        />

        {/* Standalone Toast Component */}
        <Toast
          visible={showToast}
          message={
            toastType === "success"
              ? "Operasi berhasil dilakukan!"
              : toastType === "error"
              ? "Terjadi kesalahan!"
              : toastType === "warning"
              ? "Perhatian diperlukan!"
              : "Ini adalah pesan informasi"
          }
          type={toastType}
          position={toastPosition}
          duration={3000}
          onClose={() => setShowToast(false)}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Kode Contoh</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>
            {`// Menggunakan Toast Manager (Recommended)
import { toastManager } from "NexaUI";

// Success toast
toastManager.success("Data berhasil disimpan!");

// Error toast
toastManager.error("Terjadi kesalahan!");

// Warning toast
toastManager.warning("Perhatian!");

// Info toast
toastManager.info("Informasi penting");

// Dengan options
toastManager.show("Pesan", {
  type: 'success',
  position: 'top', // atau 'bottom'
  duration: 3000,
  action: () => console.log('Action'),
  actionLabel: 'Undo'
});

// Menggunakan Toast Component
import { Toast } from "NexaUI";

<Toast
  visible={showToast}
  message="Pesan toast"
  type="success"
  position="top"
  duration={3000}
  onClose={() => setShowToast(false)}
/>

// Jangan lupa tambahkan ToastContainer di App.js
import { ToastContainer } from "NexaUI";

<ToastContainer />`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 12,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
  codeContainer: {
    backgroundColor: "#263238",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#aed581",
    lineHeight: 18,
  },
});

export default ToastExample;

