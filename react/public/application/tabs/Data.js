
import {
  useState, 
  useEffect, 
  useCallback,
  View,
  StyleSheet,
  Text,
  FontFamily,
  Storage,
  NexaDBLite,
  TouchableOpacity,
  Icon,
  FeatherIcon,
  Input,
  Alert,
  Spinner,
  properti,
} from "NexaUI";
import { Image, TextInput } from 'react-native';
import { DataHelper } from "../helper/DataHelper";
import { StorageData,withTerritory } from "../helper/NexaDom";
import Server from "../../../package/config";
import { FileTypeComponent } from "../helper/NexaType";
import { DataManager } from "../helper/DataManager";
import PaginationComponent from "../helper/PaginationComponent";
import { ApprovalField, getApprovalAccess } from "../helper/NexaApproval";

// Define getStyles function before DataTab component
const getStyles = (assetColor) => StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:1,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  itemsContainer: {
    marginTop:1,
  },
  itemsTitle: {
    fontSize: 18,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 12,
  },
  itemCard: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: '#000',
    marginBottom: 4,
  },
  itemId: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: '#666',
    marginBottom: 2,
  },
  itemKey: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  rawDataContainer: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  dataHeader: {
    marginBottom: 12,
  },
  rawDataTitle: {
    fontSize: 18,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 8,
  },
  dataInfoContainer: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 4,
  },
  dataInfoText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: '#666',
  },
  dataInfoBold: {
    fontFamily: FontFamily.semiBold,
    color: assetColor.color,
  },
  dataCard: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0,
  },
  dataTitle: {
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    color: assetColor.color,
    marginBottom: 0,
    marginTop: 0,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  dataDeskripsi: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#333',
    marginBottom: 8,
  },
  dataMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dataCategori: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: '#666',
  },
  dataId: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: '#999',
  },
  dataLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: '#666',
    marginBottom: 4,
  },
  mainFieldContainer: {
    marginBottom: 16,
    marginLeft: -10,
    marginRight: -10,
    paddingTop: 0,
    paddingBottom: 12,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    minHeight: 24, // Pastikan ada tinggi minimum untuk alignment
  },
  mainFieldLabel: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: '#999',
    marginTop: 4,
  },
  fieldsList: {
    marginTop: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: '#666',
    width: 120,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: '#000',
    flex: 1,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fileName: {
    flex: 1,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginLeft: -10,
    marginRight: -10,
    paddingTop: 12,
    paddingLeft: 10,
    paddingRight: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerButton: {
    flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: assetColor.color,
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: assetColor.deleteColor,
  },
  footerButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: assetColor.color,
  },
  deleteButtonText: {
    color: assetColor.deleteColor,
  },
  emptyFieldsContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFieldsText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#999',
    fontStyle: 'italic',
  },
  paginationContainerTop: {
    marginTop: 8,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nextButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical:10,
    paddingHorizontal: 0
  },
  nextButton: {
    backgroundColor: assetColor.color,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
  },
  /** Action */
  action: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: assetColor.btnColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  /** Search */
  search: {
    position: 'relative',
    marginBottom: 16,
  },
  searchInput: {
    height: 56,
    backgroundColor: '#f3f3f6',
    paddingHorizontal: 16,
    color: '#1a2525',
    fontSize: 18,
    borderRadius: 9999,
  },
  searchFloating: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  searchButton: {
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: assetColor.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySearchContainer: {
    padding: 40,
            alignItems: 'center',
            justifyContent: 'center',
    marginTop: 20,
  },
  emptySearchText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  emptySearchKeyword: {
    fontFamily: FontFamily.semiBold,
    color: assetColor.color,
  },
  emptySearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: assetColor.color,
    borderRadius: 6,
  },
  emptySearchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
});

const DataTab = ({ appDataFromStore, loading, params, pkg, label, userData, onSwitchToForm }) => {
  // UI State (hanya untuk UI, tidak untuk logika bisnis)
  const [expandedItems, setExpandedItems] = useState({});
  const [showPagination, setShowPagination] = useState(false);
  const [showDataHeader, setShowDataHeader] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // Asset Color Configuration - load dari properti
  const [assetColor, setAssetColor] = useState({
    backgroundColor: '#24BCA9',
    color: '#009688',
    btnColor: '#e0f2f1',
    iconTextColor: '#000',
    deleteColor: '#f44336',
    deleteBtnColor: '#ffebee',
    buttonColor: '#009688',
    buttonTextColor: '#fff',
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

  // Get styles with assetColor
  const styles = getStyles(assetColor);

  // Data State (dikelola oleh DataManager)
  const [rawData, setrawData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [getFailed, setGetFailed] = useState([]);
  const [column, setColumn] = useState([]);
  const [processedForm, setProcessedForm] = useState(null);
  const [dataInfo, setDataInfo] = useState({ count: 0, totalCount: 0, totalPages: 0, currentPage: 1, success: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cellUpdate, setCellUpdate] = useState(null);
  const [cellDelete, setCellDelete] = useState(null);
  const [cellApproval, setCellApproval] = useState(null);
  const [className, setClassName] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);
  // Initialize DataManager
  const [dataManager] = useState(() => {
    return new DataManager({
      pkg: pkg,
      userData: userData,
      limit: 5,
      onDataChange: (data) => {
        setrawData(data.data);
        setGetFailed(data.fields);
        setColumn(data.columns);
        setProcessedForm(data.form);
        setDataInfo(data.dataInfo);
        setCellUpdate(data.access.update);
        setCellDelete(data.access.delete);
        setCellApproval(data.access.approval);
        setCurrentPage(data.dataInfo.currentPage);
      },
      onFetchingChange: (isFetching) => {
        setFetching(isFetching);
      },
      onError: (error) => {
        Alert.alert('Error', error?.message || 'Terjadi kesalahan');
      }
    });
  });

  // Load className dan apiConfig dari nexaStore
  useEffect(() => {
    const loadConfig = async () => {
      if (pkg?.token) {
        try {
          const getData = await NexaDBLite.get("nexaStore", pkg.token);
          if (getData?.className) {
            setClassName(getData.className);
          }
          // console.log('getData:', {
          //     authorization: getData.api.authorization,
          //     endpoind: getData.api.endpoind,
          //     appid: getData.api.appid
          //   });
          if (getData?.api) {
            setApiConfig({
              authorization: getData.api.authorization,
              endpoind: getData.api.endpoind,
              appid: getData.api.appid
            });
          }
        } catch (error) {
          // Error loading config - silent fail
        }
      }
    };
    loadConfig();
  }, [pkg?.token]);
// console.log('pkg?.token:', pkg);
  // Load data saat component mount
  useEffect(() => {
    if (pkg?.token) {
      dataManager.fetchData(1);
    }
  }, [pkg?.token]);


  // Toggle expanded state untuk item tertentu berdasarkan ID
  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    dataManager.setPage(newPage);
  };

  // Handle search input change - hanya update state, tidak auto-search
  const handleSearchChange = (text) => {
    setSearchKeyword(text);
    dataManager.setSearchKeyword(text);
  };

  // Handle search saat Enter atau tombol search diklik
  const handleSearch = () => {
    dataManager.search(searchKeyword);
  };

  // Handle Enter key press
  const handleSearchSubmit = () => {
    handleSearch();
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchKeyword('');
    dataManager.clearSearch();
  };



  return (
    <View style={styles.container}>
      {loading || fetching ? (
        <View style={styles.loadingContainer}>
          <Spinner 
            visible={true} 
            text="Memuat data..."
            textColor="#666"
            size="large"
            color={assetColor?.color || "#1aacf0"}
          />
        </View>
      ) : appDataFromStore.length > 0 ? (
        <View style={styles.itemsContainer}>
          {/* Action Buttons */}
          <View style={styles.actionWrapper}>
            <TouchableOpacity
              onPress={() => {
                setShowPagination(!showPagination);
              }}
              style={{ marginRight: 'auto' }}>
              <View style={styles.action}>
                <FeatherIcon
                  color={assetColor.iconTextColor || assetColor.color || '#000'}
                  name="layers"
                  size={14} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowSearch(!showSearch);
              }}>
              <View style={styles.action}>
                <FeatherIcon
                  color={assetColor.iconTextColor || assetColor.color || '#000'}
                  name="search"
                  size={14} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                // Refresh data dari server
                if (pkg?.token) {
                  await dataManager.fetchData(currentPage, searchKeyword, true);
                }
              }}>
              <View style={styles.action}>
                <FeatherIcon
                  color={assetColor.iconTextColor || assetColor.color || '#000'}
                  name="refresh-cw"
                  size={14} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowDataHeader(!showDataHeader);
              }}>
              <View style={styles.action}>
                <FeatherIcon
                  color={assetColor.iconTextColor || assetColor.color || '#000'}
                  name="info"
                  size={14} />
              </View>
            </TouchableOpacity>

          </View>
          {/* Search Input */}
          {showSearch && (
            <View style={styles.search}>
              <TextInput
                placeholder="Cari data..."
                placeholderTextColor="#999"
                  value={searchKeyword}
                  onChangeText={handleSearchChange}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                style={styles.searchInput}
                />
              <View style={styles.searchFloating}>
                {searchKeyword.length > 0 ? (
                    <TouchableOpacity
                      onPress={handleClearSearch}
                      activeOpacity={0.7}
                    >
                    <View style={styles.searchButton}>
                      <FeatherIcon name="x" size={20} color="white" />
                    </View>
                    </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleSearchSubmit}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchButton}>
                      <FeatherIcon name="search" size={20} color="white" />
                  </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
         
          {rawData && Array.isArray(rawData) && rawData.length > 0 ? (
            <View style={styles.rawDataContainer}>
              {showDataHeader && (
              <View style={styles.dataHeader}>
               
                <View style={styles.dataInfoContainer}>
                  <Text style={styles.dataInfoText}>
                    Menampilkan: <Text style={styles.dataInfoBold}>{dataInfo.count}</Text> dari <Text style={styles.dataInfoBold}>{dataInfo.totalCount}</Text> data
                    {searchKeyword && (
                      <Text> untuk "<Text style={styles.dataInfoBold}>{searchKeyword}</Text>"</Text>
                    )}
                  </Text>
                </View>
              </View>
              )}
              
              {/* Tampilkan pagination di bagian atas jika totalPages > 1 dan showPagination true */}
              {dataInfo.totalPages > 1 && showPagination && (
                <View style={styles.paginationContainerTop}>
                  <PaginationComponent
                    currentPage={dataInfo.currentPage}
                    totalPages={dataInfo.totalPages}
                    totalCount={dataInfo.totalCount}
                    count={dataInfo.count}
                    onPageChange={handlePageChange}
                    isCompact={true}
                    limit={5}
                  />
                </View>
              )}
              {rawData && Array.isArray(rawData) && rawData.map((item, index) => {
                const itemId = String(item.id !== undefined && item.id !== null ? item.id : `item-${index}`);
                const isExpanded = expandedItems[itemId] || false;
                
                // Cari field utama (nama/title/name) atau field pertama
                const mainField = getFailed.find(f => 
                  f.failed === 'nama' || f.failed === 'title' || f.failed === 'name'
                ) || getFailed[0];
                
                // Filter field yang bukan field utama
                const otherFields = getFailed.filter(f => f.failed !== mainField?.failed);
                
                // Tampilkan 2 field pertama jika tidak expanded, semua jika expanded
                const fieldsToShow = isExpanded ? otherFields : otherFields.slice(0, 2);
                const hasMoreFields = otherFields.length > 2;
                
                return (
                  <View key={itemId} style={styles.dataCard}>
                    {getFailed.length > 0 ? (
                      <>
                        {/* Tampilkan field utama (nama atau title) sebagai header yang bisa di-click */}
                        {(() => {
                          if (mainField) {
                            const mainValue = item[mainField.failed];
                            if (mainValue !== undefined && mainValue !== null && mainValue !== '') {
                              // Hanya tampilkan icon chevron jika ada lebih dari 2 field (ada field yang bisa di-expand)
                              const shouldShowChevron = otherFields.length > 2;
                              
                              return (
                                <TouchableOpacity 
                                  onPress={shouldShowChevron ? () => toggleExpand(itemId) : undefined}
                                  activeOpacity={shouldShowChevron ? 0.7 : 1}
                                  disabled={!shouldShowChevron}
                                  style={styles.mainFieldContainer}>
                                  <View style={styles.titleRow}>
                                    <Text 
                                      style={styles.dataTitle}
                                      numberOfLines={2}
                                      ellipsizeMode="tail"
                                    >
                                      {String(mainValue)}
                                    </Text>
                                    {shouldShowChevron && (
                                      <FeatherIcon 
                                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                                        size={20} 
                                        color={assetColor.color} 
                                      />
                                    )}
                                  </View>
                                </TouchableOpacity>
                              );
                            }
                          }
                          return null;
                        })()}
                        
                        {/* Tampilkan field dalam format list yang rapi */}
                        <View style={styles.fieldsList}>
                          {fieldsToShow.map((field, fieldIndex) => {
                            // Skip field dengan nama "id"
                            if (field?.failed === 'id' || field?.label === 'id') {
                              return null;
                            }
                            
                            const fieldValue = item[field?.failed];
                            const fieldType = processedForm?.[field?.failed]?.type; // Get field type dari processed form
                            
                            // Cek jika field memiliki approval: true
                            if (field?.approval === true) {
                              // Jika user memiliki akses approval (cellApproval === 1), tampilkan ApprovalField dengan switch
                              if (cellApproval === 1) {
                                // Get approval access
                                const approvalAccess = getApprovalAccess({ approval: { [className]: cellApproval } }, className);
                                
                                return (
                                  <View key={fieldIndex} style={styles.fieldRow}>
                                    <ApprovalField
                                      field={field}
                                      item={item}
                                      processedForm={processedForm}
                                      apiConfig={apiConfig}
                                      userData={userData}
                                      approvalAccess={approvalAccess}
                                      onApprovalChange={async (recordId, fieldKey, checked, status, label) => {
                                        // Update local state tanpa reload dari server
                                        // User bisa refresh manual jika diperlukan
                                        if (rawData && Array.isArray(rawData)) {
                                          const updatedData = rawData.map(dataItem => {
                                            if (dataItem.id === recordId) {
                                              return {
                                                ...dataItem,
                                                [fieldKey]: label
                                              };
                                            }
                                            return dataItem;
                                          });
                                          setrawData(updatedData);
                                        }
                                      }}
                                    />
                                  </View>
                                );
                              } else {
                                // Jika user TIDAK memiliki akses approval (cellApproval === 0), tampilkan ApprovalField dalam mode read-only
                                // ApprovalField akan menampilkan teks yang bisa diklik untuk melihat history
                                const approvalAccess = getApprovalAccess({ approval: { [className]: cellApproval } }, className);
                                
                                return (
                                  <View key={fieldIndex} style={styles.fieldRow}>
                                    <ApprovalField
                                      field={field}
                                      item={item}
                                      processedForm={processedForm}
                                      apiConfig={apiConfig}
                                      userData={userData}
                                      approvalAccess={approvalAccess}
                                      onApprovalChange={null} // Tidak ada callback karena tidak bisa approve
                                    />
                                  </View>
                                );
                              }
                            }
                            
                            // Render field biasa (non-approval) hanya jika ada value
                            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                              // Cek jika field type adalah file, camera, atau document
                              const isFileType = fieldType === 'file' || fieldType === 'camera' || fieldType === 'document' || fieldType === 'video';
                              
                              // Cek jika field type adalah textarea atau richtext (perlu strip HTML)
                              const isTextareaType = fieldType === 'textarea' || fieldType === 'richtext' || fieldType === 'editor';
                              
                              // Strip HTML untuk textarea/richtext
                              const displayValue = isTextareaType && typeof fieldValue === 'string' 
                                ? dataManager.stripHtmlTags(fieldValue) 
                                : fieldValue;
                              
                              return (
                                <View key={fieldIndex} style={styles.fieldRow}>
                                  <Text style={styles.fieldLabel}>{String(field?.label || field?.failed || '')}:</Text>
                                  {isFileType && typeof fieldValue === 'string' ? (
                                    // Render file type dengan icon/image menggunakan FileTypeComponent
                                    // Modal image viewer ditangani secara internal oleh FileTypeComponent
                                    <FileTypeComponent
                                      filePath={fieldValue}
                                      size={30}
                                      onFilePress={(fileName, fileUrl, isPDF) => {
                                        if (isPDF) {
                                          // TODO: Open PDF in modal/viewer
                                          Alert.alert('PDF', `Opening PDF: ${fileName}`);
                                        } else {
                                          Alert.alert('File', fileName);
                                        }
                                      }}
                                    />
                                  ) : (
                                    // Render text biasa (dengan HTML stripped untuk textarea)
                                    <Text style={styles.fieldValue}>{String(displayValue)}</Text>
                                  )}
                                </View>
                              );
                            }
                            return null;
                          })}
                        </View>
                        
                        {/* Footer dengan tombol Edit dan Delete */}
                        {item?.id && (cellUpdate === 1 || cellDelete === 1) && (
                          <View style={styles.cardFooter}>
                            {cellUpdate === 1 && (
                            <TouchableOpacity
                              style={styles.footerButton}
                              onPress={async () => {
                                try {
                                  // Langsung pass data ke Form tanpa menyimpan ke nexaDb
                                  if (pkg?.token && item?.id) {
                                    // Switch ke tab Form (index 1) dengan data langsung
                                    if (onSwitchToForm && typeof onSwitchToForm === 'function') {
                                      onSwitchToForm({
                                        id: item.id,
                                        data: item
                                      });
                                    } else {
                                      Alert.alert('Error', 'Navigation function not available');
                                    }
                                  } else {
                                    Alert.alert('Error', 'Missing required data');
                                  }
                                } catch (error) {
                                  Alert.alert('Error', error?.message || 'Failed to prepare edit');
                                }
                              }}
                            >
                              <Icon Material="pencil" size={18} color={assetColor.iconTextColor || assetColor.color || '#000'} />
                              <Text style={styles.footerButtonText}>Edit</Text>
                            </TouchableOpacity>
                            )}
                            
                            {cellDelete === 1 && (
                            <TouchableOpacity
                              style={[styles.footerButton, styles.deleteButton]}
                              onPress={async () => {
                                // Handle delete menggunakan DataManager
                                if (item?.id) {
                                  Alert.alert(
                                    'Konfirmasi',
                                    'Apakah Anda yakin ingin menghapus data ini?',
                                    [
                                      { text: 'Batal', style: 'cancel' },
                                      { 
                                        text: 'Hapus', 
                                        onPress: async () => {
                                          try {
                                            const result = await dataManager.deleteItem(item.id);
                                            if (result.success) {
                                              Alert.alert('Success', result.message);
                                              } else {
                                              Alert.alert('Error', result.message);
                                            }
                                          } catch (error) {
                                            Alert.alert('Error', error?.message || 'Terjadi kesalahan saat menghapus data');
                                          }
                                        }, 
                                        style: 'destructive' 
                                      }
                                    ]
                                  );
                                }
                              }}
                            >
                              <Icon Material="delete" size={18} color={assetColor.deleteColor} />
                              <Text style={[styles.footerButtonText, styles.deleteButtonText]}>Delete</Text>
                            </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </>
                    ) : (
                    // Fallback jika getFailed kosong - tampilkan pesan
                    <View style={styles.emptyFieldsContainer}>
                      <Text style={styles.emptyFieldsText}>No field configuration available</Text>
                    </View>
                  )}
                  </View>
                );
              })}
              
              {/* Tombol Lihat Berikutnya */}
              {dataInfo.currentPage < dataInfo.totalPages && (
                <View style={styles.nextButtonContainer}>
                  <TouchableOpacity
                    onPress={() => handlePageChange(dataInfo.currentPage + 1)}
                    style={styles.nextButton}
                  >
                    <Text style={styles.nextButtonText}>Lihat Berikutnya</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptySearchContainer}>
              <Icon name="search" size={48} color="#ccc" />
              <Text style={styles.emptySearchText}>
                {searchKeyword ? (
                  <>
                    Tidak ada data ditemukan untuk "<Text style={styles.emptySearchKeyword}>{searchKeyword}</Text>"
                  </>
                ) : (
                  'Tidak ada data tersedia'
                )}
              </Text>
              {searchKeyword && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={styles.emptySearchButton}
                >
                  <Text style={styles.emptySearchButtonText}>Hapus Pencarian</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.emptyText}>No items found</Text>
      )}
    </View>
  );
};

export default DataTab;
