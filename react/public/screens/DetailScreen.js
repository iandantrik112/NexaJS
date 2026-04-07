import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Title, Paragraph } from "react-native-paper";

export default function DetailScreen({ route }) {
  // Mengambil parameter dari route
  const params = route.params;

  const renderContent = () => {
    switch (params.type) {
      case "profile":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Profil Pengguna</Title>
              <Paragraph>ID: {params.userId}</Paragraph>
              <Paragraph>Nama: {params.userName}</Paragraph>
            </Card.Content>
          </Card>
        );

      case "settings":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Pengaturan</Title>
              <Paragraph>Bagian: {params.section}</Paragraph>
              <Paragraph>
                Status: {params.isEnabled ? "Aktif" : "Tidak Aktif"}
              </Paragraph>
            </Card.Content>
          </Card>
        );

      case "notifications":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Notifikasi</Title>
              <Paragraph>Jumlah: {params.count}</Paragraph>
              <Title style={styles.subtitle}>Daftar Pesan:</Title>
              {params.messages.map((message, index) => (
                <Paragraph key={index}>• {message}</Paragraph>
              ))}
            </Card.Content>
          </Card>
        );

      default:
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Informasi Tidak Tersedia</Title>
              <Paragraph>Tipe detail tidak dikenali</Paragraph>
            </Card.Content>
          </Card>
        );
    }
  };

  return <ScrollView style={styles.container}>{renderContent()}</ScrollView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
});
