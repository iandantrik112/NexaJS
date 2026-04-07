import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { RichTextEditor, Buttons, Colors, FontFamily, fs } from "NexaUI";

/**
 * Contoh Penggunaan RichTextEditor dari NexaUI
 * Rich Text Editor dengan toolbar lengkap untuk editing HTML
 */

export default function RichTextEditorExample() {
  const richTextRef = useRef(null);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

  // Fungsi untuk mendapatkan HTML content
  const getContent = () => {
    const htmlContent = richTextRef.current?.getContentHtml();
    setContent(htmlContent);
    console.log("HTML Content:", htmlContent);

    Alert.alert(
      "Content Retrieved",
      "HTML content has been logged to console",
      [{ text: "OK" }]
    );
  };

  // Fungsi untuk menyimpan content
  const saveContent = () => {
    const htmlContent = richTextRef.current?.getContentHtml();
    setSavedContent(htmlContent);

    Alert.alert("Content Saved", "Content has been saved successfully!", [
      { text: "OK" },
    ]);
  };

  // Fungsi untuk memuat content yang tersimpan
  const loadSavedContent = () => {
    if (savedContent) {
      Alert.alert(
        "Saved Content",
        `Content: ${savedContent.substring(0, 100)}...`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("No Content", "No saved content found");
    }
  };

  // Fungsi untuk clear content
  const clearContent = () => {
    Alert.alert(
      "Clear Content",
      "Are you sure you want to clear all content?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // Reset dengan content kosong
            setContent("");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: FontFamily.bold }]}>
            RichTextEditor Example
          </Text>
          <Text style={styles.subtitle}>
            Rich Text Editor dengan toolbar lengkap
          </Text>
        </View>

        {/* Editor Container */}
        <View style={styles.editorContainer}>
          <Text style={styles.sectionTitle}>Rich Text Editor:</Text>

          <RichTextEditor
            ref={richTextRef}
            value="<h1>Welcome to NexaUI!</h1><p>Start typing your content here...</p><ul><li>Feature 1</li><li>Feature 2</li></ul>"
            placeholder="Mulai menulis di sini..."
            onChangeText={(text) => {
              console.log("Content changed:", text);
            }}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Buttons
            label="Get Content"
            onPress={getContent}
            background={Colors.primary || "#007bff"}
            txColor="#FFFFFF"
            border={8}
            vertical={6}
          />

          <Buttons
            label="Save Content"
            onPress={saveContent}
            background={Colors.success || "#28a745"}
            txColor="#FFFFFF"
            border={8}
            vertical={6}
          />

          <Buttons
            label="Load Saved"
            onPress={loadSavedContent}
            background={Colors.info || "#17a2b8"}
            txColor="#FFFFFF"
            border={8}
            vertical={6}
          />

          <Buttons
            label="Clear Content"
            onPress={clearContent}
            background={Colors.danger || "#dc3545"}
            txColor="#FFFFFF"
            border={8}
            vertical={6}
          />
        </View>

        {/* Content Preview */}
        {content && (
          <View style={styles.previewContainer}>
            <Text style={styles.sectionTitle}>HTML Content Preview:</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{content}</Text>
            </View>
          </View>
        )}

        {/* Usage Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Cara Penggunaan:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Gunakan toolbar untuk memformat teks (Bold, Italic, Underline)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Pilih alignment (Left, Center, Right)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Tambahkan lists (Bullet/Numbered)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Gunakan Heading (H1, H2, H3) untuk struktur
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>5.</Text>
            <Text style={styles.instructionText}>
              Undo/Redo untuk mengembalikan perubahan
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Fitur RichTextEditor:</Text>
          <Text style={styles.featureItem}>
            ✅ Bold, Italic, Underline formatting
          </Text>
          <Text style={styles.featureItem}>
            ✅ Text alignment (Left, Center, Right)
          </Text>
          <Text style={styles.featureItem}>✅ Bullet dan Numbered lists</Text>
          <Text style={styles.featureItem}>✅ Heading styles (H1, H2, H3)</Text>
          <Text style={styles.featureItem}>✅ Blockquote support</Text>
          <Text style={styles.featureItem}>✅ Undo/Redo functionality</Text>
          <Text style={styles.featureItem}>✅ HTML content export</Text>
          <Text style={styles.featureItem}>
            ✅ Responsive height adjustment
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: Colors.primary || "#007bff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  editorContainer: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  previewContainer: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  codeContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary || "#007bff",
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
  },
  instructionsContainer: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  instructionNumber: {
    fontWeight: "bold",
    color: Colors.primary || "#007bff",
    marginRight: 10,
    width: 20,
  },
  instructionText: {
    flex: 1,
    color: "#333",
    lineHeight: 20,
  },
  featuresContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureItem: {
    color: "#333",
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
