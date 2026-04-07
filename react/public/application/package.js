import React, { useState, useEffect, useCallback } from "NexaUI";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  FontFamily,
  NexaDBLite,
  TouchableOpacity,
  properti,
} from "NexaUI";
import DataTab from "./tabs/Data";
import FormTab from "./tabs/Form";
import InformasiTab from "./tabs/Informasi";

const AssetApplication = ({ route, navigation }) => {
  const params = route.params || {};
  const { pkg, label, userData } = params;
  const [appDataFromStore, setAppDataFromStore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [formRefreshKey, setFormRefreshKey] = useState(0);
  const [assetColor, setAssetColor] = useState({
    backgroundColor: '#009688',
    buttonColor: '#009688',
    buttonTextColor: '#fff',
    color: '#009688'
  });

  // Load assetColor dari properti
  useEffect(() => {
    const loadAssetColor = async () => {
      try {
        const color = await properti.getAssetColor();
        setAssetColor(color);
      } catch (error) {
        console.error('Error loading assetColor:', error);
      }
    };
    loadAssetColor();
  }, []);

  const tabs = [
    { name: 'Data', label: 'Dataset' },
    { name: 'Form', label:  'Formulir' },
    { name: 'Informasi', label:  'Informasi' },
  ];

  const loadData = useCallback(async () => {
    try {
      // Ambil data dari nexaStore menggunakan id (pkg.token)
      if (pkg?.token) {
        setLoading(true);
        // Coba ambil langsung dengan token sebagai id
        let getData = await NexaDBLite.get("nexaStore", pkg.token);
        
        // Jika tidak ditemukan, ambil semua dan cari berdasarkan id
        if (!getData) {
          const allData = await NexaDBLite.getAll("nexaStore");
          
          // Cari data yang sesuai dengan token
          if (allData && allData.data && Array.isArray(allData.data)) {
            getData = allData.data.find(item => item && item.id === pkg.token);
          }
        }
        
        // Jika data ditemukan, simpan sebagai array
        if (getData) {
          setAppDataFromStore([getData]);
        } else {
          setAppDataFromStore([]);
        }
      } else {
        setAppDataFromStore([]);
      }
    } catch (error) {
      // Error handling
      setAppDataFromStore([]);
    } finally {
      setLoading(false);
    }
  }, [pkg?.token]);

  // Load data saat component mount dan refresh secara dinamis
  useEffect(() => {
    if (pkg?.token) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [pkg?.token, loadData]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.tabsContainer, { paddingTop: 0 }]}>
        <View style={styles.tabs}>
          {tabs.map((tab, index) => {
            const isActive = index === activeTab;
            const isLast = index === tabs.length - 1;
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => {
                  setActiveTab(index);
                }}
                style={[styles.tabsItemWrapper, isLast && styles.tabsItemWrapperLast]}>
                <View style={styles.tabsItem}>
                  <Text
                    style={[
                      styles.tabsItemText,
                      isActive && [
                        styles.tabsItemTextActive,
                        { color: assetColor.color || assetColor.buttonColor || "#009688" }
                      ],
                    ]}>
                    {tab.label}
                  </Text>
                </View>
                {isActive && (
                  <View 
                    style={[
                      styles.tabsItemLine,
                      { backgroundColor: assetColor.color || assetColor.buttonColor || "#009688" }
                    ]} 
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          {/* Render content berdasarkan active tab */}
          {activeTab === 0 && (
            <DataTab 
              appDataFromStore={appDataFromStore} 
              loading={loading}
              params={params}
              pkg={pkg}
              label={label}
              userData={userData}
              onSwitchToForm={(editData) => {
                console.log('onSwitchToForm called in package.js');
                console.log('editData:', editData);
                console.log('Current activeTab:', activeTab);
                
                // Simpan edit data ke route params jika navigation tersedia
                if (navigation && editData) {
                  navigation.setParams({
                    ...params,
                    editData: editData,
                    editMode: true
                  });
                }
                
                setFormRefreshKey(prev => {
                  console.log('Incrementing refreshKey from', prev, 'to', prev + 1);
                  return prev + 1;
                });
                console.log('Setting activeTab to 1');
                setActiveTab(1);
                console.log('activeTab set to 1');
              }}
            />
          )}
          {activeTab === 1 && (
            <FormTab 
              appDataFromStore={appDataFromStore} 
              loading={loading}
              params={params}
              pkg={pkg}
              label={label}
              userData={userData}
              refreshKey={formRefreshKey}
              route={route}
            />
          )}
          {activeTab === 2 && (
            <InformasiTab 
              appDataFromStore={appDataFromStore} 
              loading={loading} 
              params={params}
              userData={userData}
              pkg={pkg}
              label={label}
            />
          )}
    </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: '#666',
    marginBottom: 16,
  },
  /** Tabs */
  tabsContainer: {
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 4,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  tabsItemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsItemWrapperLast: {
    marginRight: 0,
  },
  tabsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 2,
  },
  tabsItemText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FontFamily.semiBold,
    color: '#7b7c7e',
  },
  tabsItemTextActive: {
    color: '#009688',
  },
  tabsItemLine: {
    width: 20,
    height: 3,
    backgroundColor: '#009688',
    borderRadius: 24,
  },
});

export default AssetApplication;
