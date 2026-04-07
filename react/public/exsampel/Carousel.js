import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Carousel, Buttons, Colors, FontFamily, assetsImage } from "NexaUI";

/**
 * Contoh Penggunaan Carousel dari NexaUI
 * Carousel dengan autoplay, pagination dots, dan kontrol manual
 */

export default function CarouselExample() {
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentHeight, setCurrentHeight] = useState(200);

  // Data sample untuk carousel dengan Picsum Photos
  const carouselData = [
    {
      image: { uri: "https://picsum.photos/id/1043/400/200" },
      title: "Welcome to NexaUI",
    },
    {
      image: { uri: "https://picsum.photos/id/1044/400/200" },
      title: "Beautiful Components",
    },
    {
      image: { uri: "https://picsum.photos/id/1045/400/200" },
      title: "Easy to Use",
    },
    {
      image: { uri: "https://picsum.photos/id/1047/400/200" },
      title: "Powerful Features",
    },
  ];

  // Data untuk carousel dengan Picsum Photos (Lorem Ipsum for photos)
  const picsumImageData = [
    {
      image: { uri: "https://picsum.photos/id/1018/400/200" },
      title: "Mountain Landscape",
    },
    {
      image: { uri: "https://picsum.photos/id/1015/400/200" },
      title: "River & Forest",
    },
    {
      image: { uri: "https://picsum.photos/id/1016/400/200" },
      title: "Ocean View",
    },
    {
      image: { uri: "https://picsum.photos/id/1019/400/200" },
      title: "Desert Scene",
    },
    {
      image: { uri: "https://picsum.photos/id/1025/400/200" },
      title: "City Architecture",
    },
  ];

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  const changeHeight = (height) => {
    setCurrentHeight(height);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: FontFamily.bold }]}>
            Carousel Example
          </Text>
          <Text style={styles.subtitle}>
            Carousel dengan autoplay dan pagination
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <Text style={styles.sectionTitle}>Controls:</Text>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Auto Play:</Text>
            <Switch
              value={autoPlay}
              onValueChange={toggleAutoPlay}
              trackColor={{
                false: "#767577",
                true: Colors.primary || "#007bff",
              }}
              thumbColor={autoPlay ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.heightControls}>
            <Text style={styles.controlLabel}>Height:</Text>
            <View style={styles.heightButtons}>
              <TouchableOpacity
                style={[
                  styles.heightButton,
                  currentHeight === 150 && styles.activeHeightButton,
                ]}
                onPress={() => changeHeight(150)}
              >
                <Text style={styles.heightButtonText}>150px</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.heightButton,
                  currentHeight === 200 && styles.activeHeightButton,
                ]}
                onPress={() => changeHeight(200)}
              >
                <Text style={styles.heightButtonText}>200px</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.heightButton,
                  currentHeight === 300 && styles.activeHeightButton,
                ]}
                onPress={() => changeHeight(300)}
              >
                <Text style={styles.heightButtonText}>300px</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Carousel dengan Picsum Photos */}
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>
            Carousel dengan Picsum Photos:
          </Text>
          <Carousel
            data={carouselData}
            height={currentHeight}
            auto={autoPlay}
            interval={3000}
            indicatorColor={Colors.primary || "#007bff"}
            style={{ borderRadius: 10 }}
          />
        </View>

        {/* Carousel dengan Picsum Photos */}
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>
            Carousel dengan Picsum Photos:
          </Text>
          <Carousel
            data={picsumImageData}
            height={currentHeight}
            auto={autoPlay}
            interval={4000}
            indicatorColor="#FF6B6B"
            style={{ borderRadius: 15 }}
          />
        </View>

        {/* Carousel dengan Efek Picsum Photos */}
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>
            Carousel dengan Efek (Grayscale & Blur):
          </Text>
          <Carousel
            data={[
              {
                image: {
                  uri: "https://picsum.photos/id/237/400/200?grayscale",
                },
                title: "Grayscale Effect",
              },
              {
                image: { uri: "https://picsum.photos/id/239/400/200?blur=2" },
                title: "Blur Effect",
              },
              {
                image: {
                  uri: "https://picsum.photos/id/240/400/200?grayscale&blur=1",
                },
                title: "Grayscale + Blur",
              },
              {
                image: { uri: "https://picsum.photos/seed/nexaui/400/200" },
                title: "Seeded Random",
              },
            ]}
            height={180}
            auto={autoPlay}
            interval={5000}
            indicatorColor="#9C27B0"
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Carousel Static (No Auto Play) */}
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>Carousel Manual (No Auto):</Text>
          <Carousel
            data={carouselData}
            height={180}
            auto={false}
            indicatorColor="#4ECDC4"
            style={{ borderRadius: 8 }}
          />
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Fitur Carousel:</Text>
          <Text style={styles.featureItem}>
            ✅ AutoPlay dengan interval yang dapat disesuaikan
          </Text>
          <Text style={styles.featureItem}>
            ✅ Pagination dots dengan warna custom
          </Text>
          <Text style={styles.featureItem}>✅ Swipe manual untuk navigasi</Text>
          <Text style={styles.featureItem}>
            ✅ Height yang dapat disesuaikan
          </Text>
          <Text style={styles.featureItem}>✅ Border radius custom</Text>
          <Text style={styles.featureItem}>✅ Overlay text pada gambar</Text>
          <Text style={styles.featureItem}>✅ Auto stop saat user touch</Text>
          <Text style={styles.featureItem}>✅ Responsive width</Text>
        </View>

        {/* Usage Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Cara Penggunaan:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Import Carousel dari NexaUI
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Siapkan data array dengan struktur: {"{ image, title }"}
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Gunakan Picsum Photos untuk placeholder: picsum.photos/400/200
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Set props: data, height, auto, interval, indicatorColor
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>5.</Text>
            <Text style={styles.instructionText}>
              Customize styling dengan prop style
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>6.</Text>
            <Text style={styles.instructionText}>
              Swipe left/right untuk navigasi manual
            </Text>
          </View>
        </View>

        {/* Code Example */}
        <View style={styles.codeContainer}>
          <Text style={styles.sectionTitle}>Contoh Kode:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{`import { Carousel } from "NexaUI";

// Data dengan Picsum Photos
const data = [
  {
    image: { uri: 'https://picsum.photos/id/1018/400/200' },
    title: 'Mountain View'
  },
  {
    image: { uri: 'https://picsum.photos/id/237/400/200?grayscale' },
    title: 'Grayscale Effect'
  },
  {
    image: { uri: 'https://picsum.photos/seed/nexaui/400/200' },
    title: 'Seeded Random'
  },
  {
    image: { uri: 'https://picsum.photos/id/239/400/200?blur=2' },
    title: 'Blur Effect'
  }
];

<Carousel
  data={data}
  height={200}
  auto={true}
  interval={3000}
  indicatorColor="#007bff"
  style={{ borderRadius: 10 }}
/>`}</Text>
          </View>
        </View>

        {/* Picsum Photos Info */}
        <View style={styles.picsumContainer}>
          <Text style={styles.sectionTitle}>Tentang Picsum Photos:</Text>
          <Text style={styles.picsumText}>
            Picsum Photos adalah "Lorem Ipsum for photos" - service placeholder
            gambar yang mudah digunakan.
          </Text>
          <Text style={styles.picsumFeature}>
            📷 Specific Image: picsum.photos/id/237/200/300
          </Text>
          <Text style={styles.picsumFeature}>
            🎲 Random: picsum.photos/200/300
          </Text>
          <Text style={styles.picsumFeature}>
            🌱 Seeded: picsum.photos/seed/nexaui/200/300
          </Text>
          <Text style={styles.picsumFeature}>
            ⚫ Grayscale: picsum.photos/200/300?grayscale
          </Text>
          <Text style={styles.picsumFeature}>
            🌀 Blur: picsum.photos/200/300?blur=2
          </Text>
          <Text style={styles.picsumFeature}>
            🔗 Combined: picsum.photos/200/300?grayscale&blur=1
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
  controlsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  heightControls: {
    marginTop: 10,
  },
  heightButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  heightButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeHeightButton: {
    backgroundColor: Colors.primary || "#007bff",
    borderColor: Colors.primary || "#007bff",
  },
  heightButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  carouselContainer: {
    marginBottom: 30,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  featuresContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  instructionsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  codeContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  codeBlock: {
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary || "#007bff",
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },
  picsumContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  picsumText: {
    color: "#333",
    marginBottom: 15,
    lineHeight: 20,
    fontStyle: "italic",
  },
  picsumFeature: {
    color: "#333",
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
