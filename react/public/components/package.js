import React from 'react';
import {
  View,
  StyleSheet,
  useState,
  useEffect,
  useMemo,
  useCallback,
  Input,
  Text,
  Buttons,
  assetsImage,
  Image,
  useFormValidation,
  Alert,
  Network,
  AsyncStorage,
  TouchableOpacity,
  ExpoSpeech,
  SafeAreaView,
  ScrollView,
  NexaDBLite,
  Storage,
  useNavigation,
  Icon,
  FontFamily,
  properti,
} from "NexaUI";

const AssetPackage = ({ route }) => {
  // Validasi route dan params
  const params = route?.params || {};
  const navigation = useNavigation();
  const [dbInfo, setDbInfo] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [addPckge, setAddPckge] = useState([]);
  const [supportData, setSupportData] = useState(null);
  const [appData, setAppData] = useState(null);
  const [progress, setProgress] = useState(0);
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

  // Fetch support data from API
  const fetchSupportData = async () => {
    try {
      // Validasi params sebelum menggunakan
      if (!params || !params.userid) {
        console.warn('⚠️ [AssetPackage] params or params.userid is missing');
        throw new Error('User ID is required');
      }
      
      const api = new Storage();
      
      // Gunakan method HTTP dengan endpoint sebagai parameter
      const response = await api.put('support', {
        id: params.userid
      });
      setSupportData(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Load app data from bucketsStore
  const loadAppData = useCallback(async () => {
    try {
      // Ambil dari NexaDBLite - gunakan id yang sudah ada, bukan membuat format baru
      // Coba ambil dengan id 'assets' terlebih dahulu (default)
      let appDataFromStore = await NexaDBLite.get("bucketsStore", 'assets');
      
      // Log untuk debugging
      // console.log('📖 [package.js] loadAppData:', {
      //   found: !!appDataFromStore,
      //   hasId: appDataFromStore?.id === 'assets',
      //   hasPackages: !!appDataFromStore?.packages,
      //   packagesCount: Array.isArray(appDataFromStore?.packages) ? appDataFromStore.packages.length : 0
      // });
      
      // Jika masih null, coba ambil dari getAll
      if (!appDataFromStore) {
        console.warn('⚠️ [package.js] Data not found with key "assets", trying getAll...');
        const allData = await NexaDBLite.getAll("bucketsStore");
        if (allData?.data && Array.isArray(allData.data)) {
          appDataFromStore = allData.data.find(item => item?.id === 'assets');
          console.log('📖 [package.js] Found in getAll:', {
            found: !!appDataFromStore,
            totalItems: allData.data.length,
            allIds: allData.data.map(item => item?.id)
          });
        }
      }
      
      setAppData(appDataFromStore);
      return appDataFromStore;
    } catch (error) {
      console.error('❌ [package.js] Error in loadAppData:', error);
      setAppData(null);
      return null;
    }
  }, []);

  // Load packages from nexaStore
  const loadPackagesFromStore = async () => {
    try {
      const packagesData = await NexaDBLite.getAll("nexaStore");

      setAddPckge(packagesData?.data);
    } catch (error) {
      setAddPckge([]);
    }
  };

    // Async function untuk handle API calls
  const fetchData = useCallback(async (showProgress = false) => {
      try {
      if (showProgress) {
        setInstalling(true);
        setProgress(0);
      } else {
        setLoading(true);
      }
      
      // Validate params before making request
      if (!params?.userid) {
        if (showProgress) {
          setInstalling(false);
          setProgress(0);
        } else {
          setLoading(false);
        }
        return;
      }

      if (showProgress) setProgress(10);
      // Fetch support data from API
      const response = await fetchSupportData();
      if (showProgress) setProgress(30);
      
      // Check if response indicates an error
      if (response?.status === 'error') {
        if (showProgress) {
          setInstalling(false);
          setProgress(0);
        } else {
          setLoading(false);
        }
        return;
      }

      if (showProgress) setProgress(50);
      // Save packages to nexaStore
      if (response?.data?.packages) {
        // Convert packages to array if it's an object with numeric keys
        let packagesArray = [];
        if (Array.isArray(response.data.packages)) {
          packagesArray = response.data.packages;
        } else if (typeof response.data.packages === 'object') {
          // Convert object with numeric keys to array
          packagesArray = Object.values(response.data.packages);
        }
        
        // Save each package individually with its id
        if (packagesArray.length > 0) {
          for (const pkg of packagesArray) {
            // Pastikan pkg memiliki id yang valid
            if (pkg && pkg.id) {
              // Hapus dan Isi Ulang baru
              await NexaDBLite.delete("nexaStore", pkg.id);
              // Pastikan id digunakan sebagai key
              const packageToSave = {
                ...pkg,
                id: pkg.id // Pastikan id ada
              };
              await NexaDBLite.set("nexaStore", packageToSave);
            }
          }
        }
        
        if (showProgress) setProgress(70);
        // GUNAKAN id yang sudah ada dari response.data - JANGAN membuat format baru
        // Key adalah ID, jadi gunakan id yang sudah ada
        const responseId = response?.data?.id || appData?.id || "assets";
        const versiApp = response?.data?.version?.updated || appData?.versiApp || '1.0.1';
        
        // Simpan data dengan id yang sudah ada - JANGAN membuat format baru
        const assetsData = {
          ...response?.data, // Copy semua data dari response (termasuk id yang sudah ada)
          id: responseId, // Pastikan id menggunakan yang sudah ada
          versiApp: versiApp // Tambahkan versiApp jika belum ada
        };
        
        // Log untuk debugging
        console.log('💾 [package.js] Saving assetsData to bucketsStore:', {
          id: assetsData.id, // ID yang digunakan sebagai key
          hasPackages: !!assetsData.packages,
          packagesCount: Array.isArray(assetsData.packages) ? assetsData.packages.length : 0,
          versiApp: assetsData.versiApp
        });
        
        // Set menggunakan id yang sudah ada sebagai key
        await NexaDBLite.set("bucketsStore", assetsData);
        if (showProgress) setProgress(80);
        
        // Load app data from bucketsStore after saving
        await loadAppData();
      }
      
      // Load packages from nexaStore after saving
      await loadPackagesFromStore();
      if (showProgress) setProgress(90);
      
      // Convert packages object to array for display
      const packagesData = response?.data?.packages;
      let packagesArray = [];
      
      if (packagesData) {
        if (Array.isArray(packagesData)) {
          packagesArray = packagesData;
        } else if (typeof packagesData === 'object') {
          packagesArray = Object.keys(packagesData).map(key => ({
            key: key,
            ...packagesData[key]
          }));
        }
      }
      
      setPackages(packagesArray);
      
        // Get database info
        const info = NexaDBLite.getInfo();
        setDbInfo(info);
      
      if (showProgress) setProgress(100);
      
      // Reset progress setelah 1 detik jika berhasil
      if (showProgress) {
        setTimeout(() => {
          setProgress(0);
          setInstalling(false);
        }, 1000);
      }
      } catch (error) {
      if (showProgress) {
        setProgress(0);
        setInstalling(false);
      }
    } finally {
      if (!showProgress) {
        setLoading(false);
      }
      }
  }, [params]);

  useEffect(() => {
    // Load app data yang sudah ada di store saat component mount
    loadAppData();

    // Panggil async function saat component mount
    fetchData();
  }, [fetchData, loadAppData]);

  // Check if version is the same (already installed)
  const isUpgrade = useMemo(() => {
    const appVersion = appData?.version?.updated;
    const supportVersion = supportData?.data?.version?.updated;
    
    if (!appVersion || !supportVersion) return false;
    
    return appVersion === supportVersion;
  }, [appData?.version?.updated, supportData?.data?.version?.updated]);
  
  // Process packages data
  const resultPackages = useMemo(() => {
    if (!supportData?.data?.packages) return [];

    
    return supportData.data.packages.map(item => ({
      label: item.label,
      updatedAt: item.updatedAt,
      version: item.version,
      icon: item.icon,
      
    }));
  }, [supportData]);


  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <View style={styles.container}>
          <View style={styles.header}>
            <View
              style={[styles.headerAction, { alignItems: 'flex-end' }]} />
          </View>

          <ScrollView
            contentContainerStyle={styles.receipt}
            showsVerticalScrollIndicator={false}>
            <View style={styles.receiptLogo}>
              <Image source={assetsImage.get("nexaui")} style={styles.logo} />
            </View>

            <Text style={styles.receiptTitle}>
        NexaUI
      </Text>
     
            <Text style={styles.receiptDescription}>
             Package Version {supportData?.data?.version?.updated}
            </Text>
            
            <Text style={styles.receiptSubtitle}>
             Menginstall package yang tersedia untuk akun user Anda. 
              atau upgrade untuk meningkatkan 
              fitur dan fungsionalitas aplikasi.
            </Text>
       
             <View style={styles.progressContainer}>
               {installing && (
                 <View style={styles.progressBarContainer}>
                   <Text style={styles.receiptDescription}>
                     {isUpgrade ? 'MENGUPGRADE PACKAGE...' : 'MENGINSTALL PACKAGE...'}
                   </Text>
                   <View style={styles.progressBarBackground}>
                     <View 
                       style={[
                         styles.progressBarFill, 
                         { 
                           width: `${progress}%`,
                           backgroundColor: assetColor.buttonColor || assetColor.color || "#009688"
                         }
                       ]} 
                     />
                   </View>
                   <Text style={[styles.progressText, { color: assetColor.buttonColor || assetColor.color || "#009688" }]}>{progress}%</Text>
                 </View>
               )}
            </View>
    

            <View style={styles.divider}>
              <View style={styles.dividerInset} />
            </View>

            <View style={styles.details}>
              <Text style={styles.detailsTitle}>Components</Text>

              {resultPackages.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Tidak ada package tersedia</Text>
                </View>
              ) : (
                resultPackages.map((pkg, index) => {
                  // Skip items with label "Musik" or "Postingan"
                  if (pkg.label === 'Musik' || pkg.label === 'Postingan') {
                    return null;
                  }

                  const formattedDate = pkg.updatedAt 
                    ? new Date(pkg.updatedAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-';

                  return (
                    <View key={index} style={styles.detailsRow}>
                      <View style={styles.packageInfo}>
                        <View style={styles.packageHeader}>
                          {pkg.icon && (
                            <Icon 
                              Feather={pkg.icon} 
                              size={20} 
                              color={assetColor.color || assetColor.buttonColor || "#009688"} 
                              style={styles.packageIcon}
                            />
                          )}
                          <Text style={styles.detailsField}>{pkg.label || 'Unknown Package'}</Text>
                        </View>
                        <Text style={styles.packageVersion}>Update: {formattedDate} </Text>
                      </View>
                      <Text style={styles.detailsValue}>v.{pkg.version || '1.0.0'}</Text>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <View style={styles.overlay}>
        <TouchableOpacity
          onPress={() => {
            fetchData(true); // Pass true to show progress bar
          }}>
          <View style={[
            styles.btn, 
            { 
              backgroundColor: assetColor.buttonColor || "#009688",
              borderColor: assetColor.buttonColor || "#009688"
            },
            isUpgrade && { 
              backgroundColor: assetColor.color || assetColor.buttonColor || "#00796b",
              borderColor: assetColor.color || assetColor.buttonColor || "#00796b"
            }
          ]}>
            <Text style={[styles.btnText, { color: assetColor.buttonTextColor || "#fff" }]}>
              {isUpgrade ? 'UPGRADE PACKAGE' : 'INSTALL PACKAGE'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    paddingHorizontal: 16,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingTop:12,
    paddingHorizontal: 16,
    paddingBottom: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  /** Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: 'center',
  },
  /** Receipt */
  receipt: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 140,
  },
  receiptLogo: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    marginBottom: 12,
    backgroundColor: '#0e0e0e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  receiptTitle: {
    fontSize: 21,
    fontFamily: FontFamily.semiBold,
    color: '#151515',
    marginBottom: 2,
  },
  receiptSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#818181',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  receiptPrice: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  receiptPriceText: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.35,
    // color akan di-set secara dinamis dengan assetColor
  },
  receiptDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#818181',
    textAlign: 'center',
    marginBottom: 12,
  },
  /** Avatar */
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  /** Divider */
  divider: {
    overflow: 'hidden',
    width: '100%',
    marginVertical: 24,
  },
  dividerInset: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    marginTop: -2,
  },
  /** Details */
  details: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  detailsTitle: {
    fontSize: 17,
    fontFamily: FontFamily.semiBold,
    color: '#222',
    marginBottom: 16,
  },
  detailsRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  detailsField: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FontFamily.medium,
    color: '#8c8c8c',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  detailsValue: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: FontFamily.semiBold,
    color: '#444',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: 'right',
  },
  packageInfo: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageIcon: {
    marginRight: 8,
  },
  packageVersion: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.regular,
    color: '#8c8c8c',
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8c8c8c',
  },
  /** Progress Bar */
  progressContainer: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
  },
  progressBarContainer: {
    marginTop: 12,
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    // backgroundColor akan di-set secara dinamis dengan assetColor
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: 12,
    // color akan di-set secara dinamis dengan assetColor
    marginTop: 6,
    textAlign: 'center',
    fontFamily: FontFamily.semiBold,
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    // backgroundColor dan borderColor akan di-set secara dinamis dengan assetColor
    marginBottom: 12,
  },
  btnUpgrade: {
    // backgroundColor dan borderColor akan di-set secara dinamis dengan assetColor
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: FontFamily.semiBold,
    // color akan di-set secara dinamis dengan assetColor
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
    // borderColor akan di-set secara dinamis dengan assetColor
  },
  btnSecondaryText: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: FontFamily.semiBold,
    // color akan di-set secara dinamis dengan assetColor
  },
});

export default AssetPackage;