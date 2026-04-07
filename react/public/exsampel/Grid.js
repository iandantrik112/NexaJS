/**
 * GridExample Component
 *
 * Komponen ini menunjukkan berbagai cara penggunaan Grid layout dengan beberapa variasi:
 * 1. Grid 2 Kolom - Untuk menu navigasi
 * 2. Grid 3 Kolom - Untuk menampilkan statistik
 * 3. Grid 4 Kolom - Untuk info ringkas
 * 4. Grid 2 Kolom - Untuk content cards
 */

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Grid,
} from "NexaUI";

// Mendapatkan lebar layar device
const windowWidth = Dimensions.get("window").width;

/**
 * Contoh Penggunaan Grid Layout
 * @returns {React.Component}
 */
const GridExample = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Grid 2 Kolom - Menu Items</Text>
      <Grid columns={2} spacing={0.5}>
        <View style={styles.gridCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <Text style={styles.cardContent}>Last updated 2 hours ago</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <Text style={styles.cardContent}>You have 3 new messages</Text>
        </View>
      </Grid>

      <Text style={styles.sectionTitle}>Grid 3 Kolom - Statistics</Text>
      <Grid columns={3} spacing={0.5}>
        <View style={styles.gridCard}>
          <Text style={[styles.cardTitle, styles.statNumber]}>150</Text>
          <Text style={styles.cardContent}>Orders</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={[styles.cardTitle, styles.statNumber]}>45k</Text>
          <Text style={styles.cardContent}>Sales</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={[styles.cardTitle, styles.statNumber]}>289</Text>
          <Text style={styles.cardContent}>Users</Text>
        </View>
      </Grid>

      <Text style={styles.sectionTitle}>Grid 4 Kolom - Quick Info</Text>
      <Grid columns={4} spacing={0.5}>
        <View style={styles.gridCard}>
          <Text style={[styles.cardTitle, styles.infoNumber]}>24</Text>
          <Text style={styles.cardContent}>New</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={[styles.cardTitle, styles.infoNumber]}>12</Text>
          <Text style={styles.cardContent}>Pending</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={[styles.cardTitle, styles.infoNumber]}>48</Text>
          <Text style={styles.cardContent}>Active</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={[styles.cardTitle, styles.infoNumber]}>8</Text>
          <Text style={styles.cardContent}>Closed</Text>
        </View>
      </Grid>

      <Text style={styles.sectionTitle}>Grid 2 Kolom - Content Cards</Text>
      <Grid columns={2} spacing={0.5}>
        <View style={styles.gridCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <Text style={styles.cardContent}>Last updated 2 hours ago</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <Text style={styles.cardContent}>You have 3 new messages</Text>
        </View>
      </Grid>
    </ScrollView>
  );
};

// Styles dengan dokumentasi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 4,
    color: "#333",
  },
  gridCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 1,
  },
  cardContent: {
    fontSize: 11,
    color: "#666666",
  },
  statNumber: {
    fontSize: 14,
    color: "#333",
  },
  infoNumber: {
    fontSize: 13,
    color: "#333",
  },
});

export default GridExample;

/**
 * Cara Penggunaan Grid:
 *
 * 1. Import komponen:
 *    import { Grid } from 'NexaUI';
 *
 * 2. Penggunaan dasar:
 *    <Grid columns={2} spacing={8}>
 *      <View style={styles.item}>
 *        <Text>Item 1</Text>
 *      </View>
 *      <View style={styles.item}>
 *        <Text>Item 2</Text>
 *      </View>
 *    </Grid>
 *
 * 3. Props yang tersedia:
 *    - columns: Jumlah kolom (number)
 *    - spacing: Jarak antar item (number)
 *    - style: Style tambahan untuk grid (object)
 *
 * 4. Contoh style yang direkomendasikan:
 *    - Gunakan borderRadius untuk sudut yang lembut
 *    - Tambahkan elevation untuk efek bayangan
 *    - Gunakan padding yang konsisten (16 untuk konten)
 *    - Gunakan warna yang kontras untuk teks
 */
