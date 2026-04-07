import {
  useState,
  useEffect,
  useCallback,
  useRef,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  FeatherIcon,
  Alert,
  useNavigation,
  fs,
  Avatar,
  ImgPicker,
  NexaDBLite,
  FontFamily,
  useFocusEffect,
  properti,
  NexaStores,
  NexaModels,
  Storage,
  Server
} from "NexaUI";

export default function Uid() {
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [dbInfo, setDbInfo] = useState(null);
  const [packages, setPackages] = useState([]);
  const [asset, setAsset] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assetColor, setAssetColor] = useState({
    btnColor: '#e0f2f1',
    buttonColor: '#009688',
  });
  const isRefreshingRef = useRef(false); // Track refreshing state tanpa trigger re-render
  const isFirstMountRef = useRef(true); // Track apakah ini pertama kali mount

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

  // Function untuk load data (dapat digunakan ulang)
  const loadData = useCallback(async () => {
    try {
      // Ambil dari NexaDBLite - gunakan id yang sudah ada, bukan membuat format baru
      // Coba ambil dengan id 'assets' terlebih dahulu (default)
      let appDataFromStore = await NexaDBLite.get("bucketsStore", 'assets');
      
      // Log removed for cleaner console output
      
      // Jika masih null, coba ambil dari getAll untuk melihat semua data
      if (!appDataFromStore) {
        console.warn('⚠️ [Uid.js] Data not found with key "assets", trying getAll...');
        const allData = await NexaDBLite.getAll("bucketsStore");
        if (allData?.data && Array.isArray(allData.data)) {
          // Cari data dengan id 'assets'
          appDataFromStore = allData.data.find(item => item?.id === 'assets');
          // Log removed for cleaner console output
        }
      }

      // Set asset data
      setAsset(appDataFromStore || null);

      // Process packages data - pastikan format konsisten
      if (appDataFromStore?.packages && Array.isArray(appDataFromStore.packages) && appDataFromStore.packages.length > 0) {
        const packagesData = appDataFromStore.packages
          .filter(item => item && item.id && item.label) // Filter hanya item yang valid
          .map(item => ({
            label: item.label,
            navigate: item.className,
            icon: item.icon,
            token: item.id
          }));
    
        // Log removed for cleaner console output
        setPackages(packagesData);
      } else {
        console.warn('⚠️ [Uid.js] No packages found or invalid format');
        setPackages([]); // Set empty array if no data
      }
    } catch (error) {
      console.error('❌ [Uid.js] Error loading data:', error);
      // Set default values on error
      setAsset(null);
      setPackages([]);
    }
  }, []);

  // Function untuk load user data dengan retry mechanism
  const getUserData = useCallback(async (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 500; // 500ms delay antara retry
    
    try {
      // Tambahkan delay kecil untuk memastikan database siap (terutama di APK)
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      const storedUserData = await NexaDBLite.get("userSessions", "userSession");
      
      // Debug logging untuk APK (dapat dihapus setelah fix)
      if (__DEV__ || retryCount > 0) {
        console.log(`[Uid.js] getUserData attempt ${retryCount + 1}:`, storedUserData ? 'Data found' : 'Data not found');
      }
      
      if (storedUserData) {
        // Data sudah dalam format object dari NexaDBLite
        setUserData(storedUserData);
        // Jika ada avatar dari server dan selectedImage belum di-set, gunakan avatar dari server
        if (storedUserData.avatar && !selectedImage) {
          setSelectedImage(storedUserData.avatar);
        }
        return storedUserData; // Return data untuk indikasi success
      } else {
        // Jika data tidak ditemukan dan masih ada retry, coba lagi
        if (retryCount < maxRetries) {
          console.warn(`[Uid.js] UserData not found, retrying... (${retryCount + 1}/${maxRetries})`);
          return await getUserData(retryCount + 1);
        } else {
          console.warn(`[Uid.js] UserData not found after ${maxRetries} attempts`);
          setUserData(null);
          return null;
        }
      }
    } catch (error) {
      console.error(`[Uid.js] Error getting userData (attempt ${retryCount + 1}):`, error);
      
      // Retry jika masih ada kesempatan
      if (retryCount < maxRetries) {
        console.warn(`[Uid.js] Retrying getUserData after error... (${retryCount + 1}/${maxRetries})`);
        return await getUserData(retryCount + 1);
      } else {
        console.error(`[Uid.js] Failed to get userData after ${maxRetries} attempts:`, error);
        setUserData(null);
        return null;
      }
    }
  }, [selectedImage]);
// console.log('userData:', userData);
  // Function untuk load image
  const loadImage = useCallback(async () => {
    try {
      const savedImage = await ImgPicker.loadSavedImage();
      // Jika tidak ada saved image, gunakan avatar dari server sebagai fallback
      if (!savedImage) {
        const storedUserData = await NexaDBLite.get("userSessions", "userSession");
        if (storedUserData?.avatar) {
          setSelectedImage(storedUserData.avatar);
          return;
        }
      }
      setSelectedImage(savedImage);
    } catch (error) {
      // Error handling - coba gunakan avatar dari server jika ada
      try {
        const storedUserData = await NexaDBLite.get("userSessions", "userSession");
        if (storedUserData?.avatar) {
          setSelectedImage(storedUserData.avatar);
        }
      } catch (fallbackError) {
        // Ignore fallback error
      }
    }
  }, []);

  // Function untuk refresh semua data
  const refreshAllData = useCallback(async () => {
    // Gunakan ref untuk check tanpa trigger re-render
    if (isRefreshingRef.current) return; // Prevent multiple simultaneous refreshes
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadData(),
        getUserData(),
        loadImage(),
        properti.refresh() // Refresh properti dari server jika ada perubahan
      ]);
    } catch (error) {
      // Error handling
      console.error('Error refreshing data:', error);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [loadData, getUserData, loadImage]); // Hapus isRefreshing dari dependency untuk mencegah loop

  // Load data saat pertama kali mount
  useEffect(() => {
    // Tambahkan delay kecil untuk memastikan database siap (terutama di APK)
    const loadInitialData = async () => {
      try {
        // Delay untuk memastikan database sudah initialized
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load data secara parallel
        await Promise.all([
          loadData(),
          getUserData(), // getUserData sudah punya retry mechanism sendiri
          loadImage()
        ]);
      } catch (error) {
        console.error('[Uid.js] Error loading initial data:', error);
      }
    };
    
    loadInitialData();
    
    // Set flag setelah mount selesai
    setTimeout(() => {
      isFirstMountRef.current = false;
    }, 1000); // Setelah 1 detik, anggap mount selesai
  }, []); // Empty dependency - hanya sekali saat mount

  // Auto-refresh ketika kembali ke halaman ini (menggunakan useFocusEffect)
  // OPTIMASI: Debounce untuk mencegah refresh terlalu sering
  useFocusEffect(
    useCallback(() => {
      // Skip refresh saat pertama kali mount (sudah ada useEffect yang handle)
      if (isFirstMountRef.current) {
        return;
      }

      let timeoutId;
      const debouncedRefresh = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          // Pastikan getUserData dipanggil dengan retry mechanism
          try {
            await getUserData(0); // Mulai dari retry 0
            // Juga refresh data lainnya
            await Promise.all([
              loadData(),
              loadImage()
            ]);
          } catch (error) {
            console.error('[Uid.js] Error refreshing data on focus:', error);
          }
        }, 300); // Debounce 300ms
      };
      debouncedRefresh();
      return () => clearTimeout(timeoutId);
    }, [getUserData, loadData, loadImage])
  );

  const handleImagePick = () => {
    ImgPicker.handleImageSelection(
      async (imageUri) => {
        // Update selectedImage dengan avatar baru
        setSelectedImage(imageUri);
        
        // Refresh userData untuk mendapatkan avatar terbaru dari server
        const updatedUserData = await NexaDBLite.get("userSessions", "userSession");
        if (updatedUserData) {
          setUserData(updatedUserData);
        }
      },
      (error) => {
        // Error handling
        console.error("Error uploading avatar:", error);
      }
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} style={{ flex: 1 }}>
          <View style={[styles.section, { paddingTop: 0, marginTop: 0, paddingBottom: 0 }]}>
            <Text style={[styles.sectionTitle, { marginTop: 4, marginBottom: 4 }]}>Account  </Text>

            <View style={styles.sectionBody}>
              <View style={[styles.profile, { paddingTop: 8, paddingBottom: 8 }]}>
                <Avatar
                  source={ userData?.avatar  || selectedImage || null}
                  size={60}
                  icon="camera"
                  iconColor={assetColor.btnColor || assetColor.buttonColor || "#24bca9"}
                  iconSize={10}
                  iconPadding={4}
                  onIconPress={handleImagePick}
                  style={styles.profileAvatar}
                />

                <View style={styles.profileBody}>
                  <Text style={styles.profileName}>
                    {userData?.user_real_name ||
                      userData?.user_name ||
                      "Loading..."}
                  </Text>

                  <Text style={styles.profileHandle}>
                    {userData?.email || "Loading..."}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.sectionBody}>
              <View style={[styles.rowWrapper, styles.rowFirst]}>
                <TouchableOpacity
                  onPress={() => {
                    // handle onPress
                  }}
                  style={styles.row}
                >
                  <Text style={styles.rowLabel}>ID</Text>

                  <View style={styles.rowSpacer} />

                  <Text style={styles.rowValue}>
                    Account
                  </Text>
                </TouchableOpacity>
              </View>
        
          <View style={[styles.rowWrapper]}>
                <TouchableOpacity
                     onPress={() => navigation.navigate("setting", userData)}
                  style={styles.row}
                >
                  <FeatherIcon
                    color="#566476"
                    name="settings"
                    size={20}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.rowLabel}>Pengaturan Akun</Text>
                  <View style={styles.rowSpacer} />
                  <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
                </TouchableOpacity>
              </View>

              <View style={[styles.rowWrapper]}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("assetPackage", userData)}
                  style={styles.row}>
                  <FeatherIcon
                    color="#566476"
                    name="package"
                    size={20}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.rowLabel}>Package</Text>
                  <View style={styles.rowSpacer} />
                  <Text style={styles.rowValue}>{asset?.versiApp || '1.0.1'}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.rowWrapper]}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("INQRCode", userData)}
                  style={styles.row}
                >
                  <FeatherIcon
                    color="#566476"
                    name="shield"
                    size={20}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.rowLabel}>QR Login dashboard</Text>
                  <View style={styles.rowSpacer} />
                  <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
                </TouchableOpacity>
              </View>
              <View style={[styles.rowWrapper, styles.rowLast]}>
                <TouchableOpacity
                  onPress={refreshAllData}
                  disabled={isRefreshing}
                  style={[styles.row, isRefreshing && styles.rowDisabled]}>
                  <FeatherIcon
                    color={isRefreshing ? "#bcbcbc" : (assetColor.btnColor || assetColor.buttonColor || "#24bca9")}
                    name="refresh-cw"
                    size={20}
                    style={{ 
                      marginRight: 12,
                      opacity: isRefreshing ? 0.6 : 1
                    }}
                  />
                  <Text style={[styles.rowLabel, isRefreshing && styles.rowLabelDisabled]}>
                    {isRefreshing ? "Memperbarui..." : "Refresh Halaman"}
                  </Text>
                  <View style={styles.rowSpacer} />
                  {!isRefreshing && (
                    <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
                  )}
                </TouchableOpacity>
              </View>
              </View>
              </View>

          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Components</Text>

           <View style={styles.sectionBody}>
              {/* Package menu items */}
              {packages && packages.length > 0 ? (() => {
                const accessData = asset?.assets?.access || {};
                const filteredPackages = packages.filter((pkg) => {
                  // Hanya tampilkan package yang memiliki access === 1
                  return accessData[pkg.label] === 1;
                });
                return filteredPackages.map((pkg, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.rowWrapper, 
                      index === 0 && styles.rowFirst,
                      index === filteredPackages.length - 1 && styles.rowLast
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (pkg.navigate) {
                          navigation.navigate("AssetApplication" ,{
                             pkg: pkg,
                             label: pkg.label,
                             userData: userData,
                            });
                        }
                      }}
                      style={styles.row}
                    >
                      <FeatherIcon
                        color="#566476"
                        name={pkg.icon || "package"}
                        size={20}
                        style={{ marginRight: 12 }}
                      />
                      <Text style={styles.rowLabel}>{pkg.label}</Text>
                      <View style={styles.rowSpacer} />
                      <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
                    </TouchableOpacity>
                  </View>
                ));
              })() : null}
            </View>
          </View>
        </ScrollView>

        {/* Log Out Section - Fixed at Bottom */}
        <View style={styles.bottomSection}>
          <View style={styles.section}>
            <View style={styles.sectionBody}>
              <View
                style={[
                  styles.rowWrapper,
                  styles.rowFirst,
                  styles.rowLast,
                  { alignItems: "center" },
                ]}
              >
                <TouchableOpacity
                  onPress={async () => {
                    Alert.alert(
                      "Konfirmasi Logout",
                      "Apakah Anda yakin ingin keluar dari aplikasi?",
                      [
                        {
                          text: "Batal",
                          style: "cancel",
                        },
                        {
                          text: "Ya, Keluar",
                          style: "destructive",
                          onPress: async () => {
                            setIsLoggingOut(true);
                            try {
                              // Delete user session dari NexaDBLite
                              await NexaDBLite.delete("userSessions", "userSession");
                              // User session cleared successfully
                              navigation.navigate("Home");
                            } catch (error) {
                              // Error handling
                              Alert.alert(
                                "Error",
                                "Gagal logout. Silakan coba lagi."
                              );
                            } finally {
                              setIsLoggingOut(false);
                            }
                          },
                        },
                      ]
                    );
                  }}
                  disabled={isLoggingOut}
                  style={[styles.rowLogout, isLoggingOut && styles.rowDisabled]}
                >
                  <View style={styles.logoutContent}>
                    <FeatherIcon
                      color={isLoggingOut ? "#ccc" : "#dc2626"}
                      name="log-out"
                      size={20}
                    />
                    <Text
                      style={[
                        styles.rowLabelLogout,
                        isLoggingOut && styles.rowLabelDisabled,
                      ]}
                    >
                      {isLoggingOut ? "Sedang Keluar..." : "Keluar"}
                    </Text>
                    {isLoggingOut && (
                      <View style={styles.logoutLoader}>
                        <Text style={styles.loadingDot}>●</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    ...fs.lg,
    fontFamily: FontFamily.semiBold,
    color: "#000",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: "left",
  },
  /** Content */
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  /** Bottom Section */
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#f8f9fa",
  },
  contentFooter: {
    marginTop: 24,
    ...fs.xs,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    color: "#a69f9f",
  },
  /** Section */
  section: {
    paddingVertical: 3,
  },
  sectionTitle: {
    margin: 8,
    marginLeft: 12,
    ...fs.xs,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.33,
    color: "#a69f9f",
    textTransform: "uppercase",
  },
  sectionBody: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  /** Profile */
  profile: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    marginRight: 12,
  },
  profileBody: {
    marginRight: "auto",
  },
  profileName: {
    ...fs.lg,
    fontFamily: FontFamily.semiBold,
    color: "#292929",
  },
  profileHandle: {
    marginTop: 2,
    ...fs.md,
    fontFamily: FontFamily.regular,
    color: "#858585",
  },
  /** Row */
  row: {
    height: 44,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 12,
  },
  rowWrapper: {
    paddingLeft: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rowLabel: {
    ...fs.md,
    letterSpacing: 0.24,
    color: "#000",
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    ...fs.md,
    fontFamily: FontFamily.medium,
    color: "#ababab",
    marginRight: 4,
  },
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rowLogout: {
    height: 44,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 12,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rowLabelLogout: {
    textAlign: "center",
    fontFamily: FontFamily.semiBold,
    color: "#dc2626",
    marginLeft: 8,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  rowLabelDisabled: {
    color: "#ccc",
  },
  logoutLoader: {
    position: "absolute",
    right: -24,
  },
  loadingDot: {
    color: "#dc2626",
    fontSize: 16,
    opacity: 0.7,
  },
});
