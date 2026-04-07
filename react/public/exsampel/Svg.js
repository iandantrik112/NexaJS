import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Svg,
  assetsImage,
} from "NexaUI";
import { FontFamily } from "NexaUI";

const SvgExample = () => {
  const [svgSize, setSvgSize] = useState(120);
  const [svgColor, setSvgColor] = useState(null);

  // Contoh SVG XML langsung
  const simpleSvgXml = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="#24BCA9" />
      <text x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-weight="bold">SVG</text>
    </svg>
  `;

  // Contoh SVG dengan path
  const pathSvgXml = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#24BCA9" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  `;

  // Contoh SVG forgot (dari assets)
  const forgotSvgXml = `<svg xmlns="http://www.w3.org/2000/svg" width="800.314" height="644.708" viewBox="0 0 800.314 644.708" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/"><g transform="translate(-376.703 -155.001)"><g transform="translate(376.703 394.331)"><path d="M602.879,191.732a41.761,41.761,0,0,0,0,83.522H914.1a41.761,41.761,0,1,0,0-83.522Z" transform="translate(-561.118 -191.732)" fill="#e5e5e5"/><path d="M605.443,202.747a33.309,33.309,0,1,0,0,66.619H916.662a33.309,33.309,0,0,0,0-66.619Z" transform="translate(-563.682 -194.296)" fill="#fff"/><path d="M685.91,271.217H623.989a1.492,1.492,0,1,1,0-2.983H685.91a1.492,1.492,0,0,1,0,2.983Z" transform="translate(-575.405 -209.539)" fill="#24BCA9"/><path d="M788.292,271.865H726.371a1.491,1.491,0,0,1,0-2.983h61.921a1.491,1.491,0,0,1,0,2.983Z" transform="translate(-599.236 -209.69)" fill="#24BCA9"/><path d="M890.674,272.513H828.753a1.492,1.492,0,0,1,0-2.983h61.921a1.491,1.491,0,1,1,0,2.983Z" transform="translate(-623.067 -209.84)" fill="#24BCA9"/><path d="M993.055,273.161H931.134a1.491,1.491,0,0,1,0-2.983h61.921a1.492,1.492,0,0,1,0,2.983Z" transform="translate(-646.898 -209.991)" fill="#24BCA9"/><circle cx="11.509" cy="11.509" r="11.509" transform="translate(67.9 24.934)" fill="#24BCA9"/><circle cx="11.509" cy="11.509" r="11.509" transform="translate(146.926 24.934)" fill="#24BCA9"/><circle cx="11.509" cy="11.509" r="11.509" transform="translate(225.951 24.934)" fill="#24BCA9"/><circle cx="11.509" cy="11.509" r="11.509" transform="translate(304.976 24.934)" fill="#24BCA9"/></g><g transform="translate(650.718 262.182)"><path d="M371.108,645.409a10.02,10.02,0,0,1-3.437-.608l-74.652-27.132a10.075,10.075,0,0,1,1.506-19.357L500.7,557.949a10.1,10.1,0,0,1,5.011.292L563.317,576.7a10.077,10.077,0,0,1-.546,19.351L373.64,645.087a10.05,10.05,0,0,1-2.532.323Z" transform="translate(-286.383 -150.45)" fill="#090814"/><path d="M492.22,518.082l108.275,13.012-19.74,38.069-95.461-13.856c-7.86,5.575-18.784,8.056-30.142,5.944-19.871-3.7-33.5-20.025-30.439-36.474S446.364,498,466.235,501.7C477.592,503.807,486.891,510.054,492.22,518.082Z" transform="translate(-256.506 -118.027)" fill="#ed9da0"/><path d="M657.371,105.763a86.173,86.173,0,1,0-86.654,108.605l44.807,101.938,63.516-90.48s-23.808-17.772-40.181-40.642a86.079,86.079,0,0,0,18.512-79.421Z" transform="translate(-271.314 -11.219)" fill="#ed9da0"/><path d="M769.908,342.528a76.523,76.523,0,0,0-70.29-47.753c-39.017-.376-88.681,9.827-90.728,63.75-3.39,89.283,0,53.346,0,53.346s-26.935,67.068,0,99.417S659.311,607.4,659.311,607.4H822.986s-28.256-74.676-23.4-125.623c3.294-34.583-12.416-96.553-29.677-139.245Z" transform="translate(-296.688 -70.035)" fill="#d6d6e3"/><path d="M830.162,261.161c-4.484,8.084-17.433,7.626-23.823.945s-7.457-16.867-6.454-26.056,3.71-18.226,3.524-27.467c-.356-17.636,22.646,11.185,10.831-1.912s-25.325-25.128-33.4-40.811l-.975-1c3.449-11.392-4.916-23.029-14.332-30.306S744.828,121.719,738.4,111.7c-5.47-8.521-6.575-19-8.969-28.843-9.275-38.121-41.338-69.742-79.583-78.488s-80.866,5.8-105.787,36.1l.6-1.256a45.1,45.1,0,0,0-34,32.428c-1.169,4.639-1.558,9.627,0,14.152s5.348,8.476,10.074,9.225c5.068.8,10.139-2.178,13.262-6.251s4.68-9.1,6.179-14.005a60.626,60.626,0,0,0,44.177,42.3,15.805,15.805,0,0,0,22.527,16.275l1.2-1.144,17.7.8A59.313,59.313,0,0,0,640.95,217.6c10.688,7.046,23.311,10.434,35.714,13.6s16.066,25.373,32.379,44.66c-.864,21.916,15.4,43.3,36.756,48.311l-5.862,19.676c11.877-4.224,24.88-.377,37.42.9s27.745-1.765,32.564-13.412c5.124-12.385-4.659-25.516-13.76-35.355,18.528,1.848,36.29-16.342,34.006-34.819Z" transform="translate(-310.117 -1.856)" fill="#090814"/><path d="M442.587,595.936l105.437,27.851-24.812,34.974-92.63-26.92c-8.555,4.435-19.718,5.384-30.674,1.721-19.17-6.409-30.41-24.466-25.106-40.331s25.145-23.527,44.318-17.118c10.956,3.663,19.3,11.136,23.47,19.824Z" transform="translate(-244.682 -134.996)" fill="#ed9da0"/><path d="M687.82,439.676s-4.6,202.27-70.563,195.525-87.792-15.237-87.792-15.237-13.344-50.944,9.7-52.16,53.125-6.887,53.125-6.887v-146.7" transform="translate(-280.094 -97.839)" fill="#d6d6e3"/></g><path d="M287.66,221.286c-4.3,1.8-8.8-.172-10.68-4.684-1.913-4.58-.126-9.23,4.247-11.056s8.786.148,10.729,4.8C293.871,214.933,292.1,219.43,287.66,221.286Zm-8.246-24.756-3.423,1.429a3.692,3.692,0,0,1-4.69-1.72l-.169-.331c-3.683-6.642-4.1-14.714-1.247-23.98,2.647-8.312,3.747-14.158,1.536-19.454-2.557-6.123-8.016-8.041-14.979-5.263-2.7,1.128-3.56,1.11-5.685,3.218a4.879,4.879,0,0,1-3.532,1.435,4.716,4.716,0,0,1-3.375-1.48,4.817,4.817,0,0,1-.033-6.573,37.414,37.414,0,0,1,12.652-8.687c14.959-6.246,22.489,2.976,25.935,11.228,3.371,8.072,1.475,15.562-1.572,25.261-2.553,8.06-2.4,14.032.5,19.97a3.676,3.676,0,0,1-1.915,4.946Z" transform="translate(579.249 21.932)" fill="#24BCA9"/></g></svg>`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Contoh Penggunaan Komponen Svg</Text>
          <Text style={styles.subtitle}>
            Komponen Svg memudahkan penggunaan SVG di React Native
          </Text>
        </View>

        {/* Contoh 1: SVG Sederhana dengan XML langsung */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. SVG Sederhana (XML Langsung)</Text>
          <View style={styles.exampleContainer}>
            <Svg 
              xml={simpleSvgXml}
              width={100}
              height={100}
            />
            <Text style={styles.code}>
              {`<Svg 
  xml={simpleSvgXml}
  width={100}
  height={100}
/>`}
            </Text>
          </View>
        </View>

        {/* Contoh 2: SVG dengan Path */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. SVG dengan Path</Text>
          <View style={styles.exampleContainer}>
            <Svg 
              xml={pathSvgXml}
              width={100}
              height={100}
            />
            <Text style={styles.code}>
              {`<Svg 
  xml={pathSvgXml}
  width={100}
  height={100}
/>`}
            </Text>
          </View>
        </View>

        {/* Contoh 3: SVG dengan Ukuran Dinamis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. SVG dengan Ukuran Dinamis</Text>
          <View style={styles.exampleContainer}>
            <Svg 
              xml={simpleSvgXml}
              width={svgSize}
              height={svgSize}
            />
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => setSvgSize(Math.max(50, svgSize - 20))}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sizeText}>{svgSize}px</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => setSvgSize(Math.min(200, svgSize + 20))}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.code}>
              {`<Svg 
  xml={simpleSvgXml}
  width={svgSize}
  height={svgSize}
/>`}
            </Text>
          </View>
        </View>

        {/* Contoh 4: SVG dengan Custom Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. SVG dengan Custom Color</Text>
          <View style={styles.exampleContainer}>
            <Svg 
              xml={simpleSvgXml}
              width={100}
              height={100}
              color={svgColor || "#24BCA9"}
            />
            <View style={styles.colorControls}>
              <TouchableOpacity 
                style={[styles.colorButton, { backgroundColor: "#24BCA9" }]}
                onPress={() => setSvgColor("#24BCA9")}
              />
              <TouchableOpacity 
                style={[styles.colorButton, { backgroundColor: "#FF6B6B" }]}
                onPress={() => setSvgColor("#FF6B6B")}
              />
              <TouchableOpacity 
                style={[styles.colorButton, { backgroundColor: "#4ECDC4" }]}
                onPress={() => setSvgColor("#4ECDC4")}
              />
              <TouchableOpacity 
                style={[styles.colorButton, { backgroundColor: "#FFE66D" }]}
                onPress={() => setSvgColor("#FFE66D")}
              />
              <TouchableOpacity 
                style={[styles.colorButton, { backgroundColor: "#95E1D3" }]}
                onPress={() => setSvgColor("#95E1D3")}
              />
            </View>
            <Text style={styles.code}>
              {`<Svg 
  xml={simpleSvgXml}
  width={100}
  height={100}
  color="${svgColor || "#24BCA9"}"
/>`}
            </Text>
          </View>
        </View>

        {/* Contoh 5: SVG dengan Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. SVG dengan Custom Style</Text>
          <View style={styles.exampleContainer}>
            <Svg 
              xml={simpleSvgXml}
              width={100}
              height={100}
              style={styles.customSvgContainer}
              svgStyle={styles.customSvg}
            />
            <Text style={styles.code}>
              {`<Svg 
  xml={simpleSvgXml}
  width={100}
  height={100}
  style={styles.customSvgContainer}
  svgStyle={styles.customSvg}
/>`}
            </Text>
          </View>
        </View>

        {/* Contoh 6: SVG Forgot (Complex SVG) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. SVG Kompleks (Forgot Illustration)</Text>
          <View style={styles.exampleContainer}>
            <Svg 
              xml={forgotSvgXml}
              width={200}
              height={160}
            />
            <Text style={styles.code}>
              {`<Svg 
  xml={forgotSvgXml}
  width={200}
  height={160}
/>`}
            </Text>
          </View>
        </View>

        {/* Contoh 7: Multiple SVG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Multiple SVG dalam Row</Text>
          <View style={styles.rowContainer}>
            <Svg 
              xml={simpleSvgXml}
              width={60}
              height={60}
            />
            <Svg 
              xml={pathSvgXml}
              width={60}
              height={60}
            />
            <Svg 
              xml={simpleSvgXml}
              width={60}
              height={60}
              color="#FF6B6B"
            />
          </View>
          <Text style={styles.code}>
            {`<View style={styles.rowContainer}>
  <Svg xml={simpleSvgXml} width={60} height={60} />
  <Svg xml={pathSvgXml} width={60} height={60} />
  <Svg xml={simpleSvgXml} width={60} height={60} color="#FF6B6B" />
</View>`}
          </Text>
        </View>

        {/* Informasi Props */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Props yang Tersedia</Text>
          <View style={styles.propsContainer}>
            <Text style={styles.propsText}>
              • xml: string - Konten SVG dalam format XML{'\n'}
              • source: string - Key dari assetsImage untuk load SVG{'\n'}
              • width: number - Lebar SVG (default: 100){'\n'}
              • height: number - Tinggi SVG (default: 100){'\n'}
              • style: object - Style untuk container{'\n'}
              • svgStyle: object - Style untuk SVG{'\n'}
              • color: string - Warna untuk mengganti fill SVG{'\n'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.semiBold,
    color: '#333',
    marginBottom: 16,
  },
  exampleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#24BCA9',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  sizeText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: '#333',
    marginHorizontal: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  colorControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  customSvgContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  customSvg: {
    opacity: 0.9,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  propsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  propsText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#333',
    lineHeight: 24,
  },
});

export default SvgExample;

