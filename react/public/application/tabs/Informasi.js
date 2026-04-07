import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  FontFamily,
  Icon,
  Spinner,
} from "NexaUI";

const InformasiTab = ({ appDataFromStore, loading, params, userData, pkg, label }) => {
  // Asset color configuration (konsisten dengan Data.js dan Form.js)
  const assetColor = {
    color: '#009688',
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Spinner 
            visible={true} 
            text="Memuat informasi..."
            textColor="#666"
            size="large"
            color={assetColor?.color || "#1aacf0"}
          />
        </View>
      ) : (
        <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Package Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.labelContainer}>
            <Icon Material="package-variant" size={16} color="#666" />
            <Text style={styles.infoLabel}>Package Name:</Text>
          </View>
          <Text style={styles.infoValue}>{label || 'Package'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.labelContainer}>
            <Icon Material="navigation" size={16} color="#666" />
            <Text style={styles.infoLabel}>Navigate:</Text>
          </View>
          <Text style={styles.infoValue}>{pkg?.navigate || pkg || 'N/A'}</Text>
        </View>

        {appDataFromStore.length > 0 && appDataFromStore[0] && (
          <>
            {appDataFromStore[0].version && (
              <View style={styles.infoCard}>
                <View style={styles.labelContainer}>
                  <Icon Material="tag" size={16} color="#666" />
                  <Text style={styles.infoLabel}>Version:</Text>
                </View>
                <Text style={styles.infoValue}>{appDataFromStore[0].version}</Text>
              </View>
            )}

            {appDataFromStore[0].className && (
              <View style={styles.infoCard}>
                <View style={styles.labelContainer}>
                  <Icon Material="code-tags" size={16} color="#666" />
                  <Text style={styles.infoLabel}>Class Name:</Text>
                </View>
                <Text style={styles.infoValue}>{appDataFromStore[0].className}</Text>
              </View>
            )}

            {appDataFromStore[0].tableName && (
              <View style={styles.infoCard}>
                <View style={styles.labelContainer}>
                  <Icon Material="table" size={16} color="#666" />
                  <Text style={styles.infoLabel}>Table Name:</Text>
                </View>
                <Text style={styles.infoValue}>{appDataFromStore[0].tableName}</Text>
              </View>
            )}

            {appDataFromStore[0].access && (
              <View style={styles.infoCard}>
                <View style={styles.labelContainer}>
                  <Icon Material="lock" size={16} color="#666" />
                  <Text style={styles.infoLabel}>Access:</Text>
                </View>
                <Text style={styles.infoValue}>{appDataFromStore[0].access}</Text>
              </View>
            )}

            {appDataFromStore[0].createdAt && (
              <View style={styles.infoCard}>
                <View style={styles.labelContainer}>
                  <Icon Material="calendar-plus" size={16} color="#666" />
                  <Text style={styles.infoLabel}>Created At:</Text>
                </View>
                <Text style={styles.infoValue}>
                  {new Date(appDataFromStore[0].createdAt).toLocaleString()}
                </Text>
              </View>
            )}

            {appDataFromStore[0].updatedAt && (
              <View style={styles.infoCard}>
                <View style={styles.labelContainer}>
                  <Icon Material="calendar-edit" size={16} color="#666" />
                  <Text style={styles.infoLabel}>Updated At:</Text>
                </View>
                <Text style={styles.infoValue}>
                  {new Date(appDataFromStore[0].updatedAt).toLocaleString()}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 16,
  },
  infoCard: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: '#000',
  },
  userInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  userTitle: {
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 12,
  },
});

export default InformasiTab;

