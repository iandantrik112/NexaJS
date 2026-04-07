/**
 * NexaApproval - Helper untuk menangani approval field di React Native
 * Berdasarkan implementasi approval di EkasticTabel.js (web version)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { Switch } from 'NexaUI';
import { Storage } from 'NexaUI';
import { FontFamily, properti } from 'NexaUI';

/**
 * ApprovalField Component - Menampilkan switch approval untuk field dengan type approval
 * @param {Object} props
 * @param {Object} props.field - Field object dengan approval: true
 * @param {Object} props.item - Data item/row
 * @param {Object} props.processedForm - Processed form data untuk mendapatkan field config
 * @param {Object} props.apiConfig - API configuration (authorization, endpoind, appid)
 * @param {Object} props.userData - User data (user_id, userSlug)
 * @param {number} props.approvalAccess - Access level untuk approval (0 = no access, 1 = has access)
 * @param {Function} props.onApprovalChange - Callback setelah approval berubah
 */
export const ApprovalField = ({
  field,
  item,
  processedForm,
  apiConfig,
  userData,
  approvalAccess = 0,
  onApprovalChange
}) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [assetColor, setAssetColor] = useState({
    backgroundColor: '#24BCA9',
    color: '#009688',
    buttonColor: '#24bca9',
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

  // Get field config dari processedForm
  const fieldConfig = processedForm?.[field.failed];
  const fieldValue = item?.[field.failed] || '';

  // Parse current approval status dari field value
  // Format: "true:Permohonan diterima Approved By userSlug" atau "false:Permohonan ditolak Approved By userSlug"
  React.useEffect(() => {
    if (fieldValue) {
      const parts = fieldValue.split(':');
      const checkedValue = parts[0];
      setIsApproved(checkedValue === 'true' || checkedValue === true);
    } else {
      setIsApproved(false);
    }
  }, [fieldValue]);

  // Fetch approval history (bisa digunakan baik untuk user dengan atau tanpa akses)
  const fetchApprovalHistory = async () => {
    if (!apiConfig?.authorization || !apiConfig?.endpoind || !item?.id) {
      Alert.alert('Error', 'API configuration atau ID tidak ditemukan');
      return;
    }

    setLoadingHistory(true);
    try {
      const api = new Storage({
        credentials: apiConfig.authorization
      });

      const response = await api.post(apiConfig.endpoind + '/approvalData', {
        record_id: Number(item.id)
      });

      const responseData = response?.data || response;
      if (responseData?.status === 'success' && Array.isArray(responseData.data)) {
        setApprovalHistory(responseData.data);
      } else if (Array.isArray(responseData)) {
        setApprovalHistory(responseData);
      } else {
        setApprovalHistory([]);
      }
      setShowHistoryModal(true);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Gagal memuat history approval');
      setApprovalHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle click pada teks status untuk membuka modal history
  const handleStatusClick = () => {
    if (fieldValue) {
      fetchApprovalHistory();
    }
  };

  // Jika tidak ada akses approval, tampilkan status approval saja (read-only) tapi bisa diklik untuk lihat history
  if (approvalAccess === 0) {
    // Tampilkan status approval saja (read-only) - format sama seperti fieldRow
    const displayValue = fieldValue ? fieldValue.split(':')[1]?.split(' Approved By')[0] || 'Pending' : 'Pending';
    return (
      <>
        <Text style={styles.approvalLabel}>{field.label || field.failed}:</Text>
        {fieldValue ? (
          <TouchableOpacity onPress={handleStatusClick} activeOpacity={0.7}>
            <Text style={[
              styles.approvalStatus, 
              { 
                textDecorationLine: 'underline',
                color: assetColor.color || assetColor.buttonColor || '#24bca9'
              }
            ]}>{displayValue}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.approvalStatus}>{displayValue}</Text>
        )}
        
        {/* Modal untuk menampilkan history approval (untuk user tanpa akses juga) */}
        <Modal
          visible={showHistoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowHistoryModal(false);
            setApprovalHistory([]);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>History Approval</Text>
              
              {loadingHistory ? (
                <View style={styles.historyLoadingContainer}>
                  <Text style={styles.historyLoadingText}>Memuat history...</Text>
                </View>
              ) : approvalHistory.length > 0 ? (
                <ScrollView style={styles.historyList} showsVerticalScrollIndicator={true}>
                  {approvalHistory.map((history, index) => (
                    <View key={index} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={[
                        styles.historyStatus,
                        { color: assetColor.color || assetColor.buttonColor || '#24bca9' }
                      ]}>
                        {history.status === 'disetujui' ? '✓ Disetujui' : '✗ Ditolak'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {history.created_at || history.updated_at || ''}
                      </Text>
                    </View>
                      {history.approved_by && (
                        <Text style={styles.historyApprovedBy}>
                          Oleh: {history.approved_by}
                        </Text>
                      )}
                      {history.catatan && (
                        <Text style={styles.historyCatatan}>
                          {history.catatan}
                        </Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.historyEmptyContainer}>
                  <Text style={styles.historyEmptyText}>Tidak ada history approval</Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowHistoryModal(false);
                    setApprovalHistory([]);
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>Tutup</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // Handle approval toggle
  const handleApprovalToggle = async (checked) => {
    if (!apiConfig?.authorization || !apiConfig?.endpoind || !item?.id) {
      Alert.alert('Error', 'API configuration atau ID tidak ditemukan');
      return;
    }

    setIsLoading(true);

    try {
      const fieldKey = field.failed;
      const receiveText = fieldConfig?.receive || 'Permohonan diterima';
      const rejectText = fieldConfig?.reject || 'Permohonan ditolak';
      const userSlug = userData?.userSlug || userData?.user_name || 'User';
      let label = '';
      let status = '';
      
      if (checked) {
        // Approved
        status = 'disetujui';
        label = `${checked}:${receiveText} Approved By ${userSlug}`;
      } else {
        // Rejected
        status = 'ditolak';
        
        // Jika approdialog true, tampilkan modal untuk input alasan penolakan
        if (fieldConfig?.approdialog) {
          setIsLoading(false);
          setShowRejectModal(true);
          return; // Exit early, akan dilanjutkan setelah user input alasan
        } else {
          label = `${checked}:${rejectText} Approved By ${userSlug}`;
        }
      }

      // Update field approval
      await updateApproval(fieldKey, label, status, checked);
      
      setIsApproved(checked);
      if (onApprovalChange) {
        onApprovalChange(item.id, fieldKey, checked, status, label);
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Gagal mengupdate approval');
      // Revert toggle jika error
      setIsApproved(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submit rejection dengan alasan
  const handleRejectSubmit = async () => {
    if (!rejectReason || rejectReason.trim().length < 5) {
      Alert.alert('Error', 'Alasan penolakan minimal 5 karakter');
      return;
    }

    setIsLoading(true);
    setShowRejectModal(false);
 
    try {
      const fieldKey = field.failed;
      const rejectText = fieldConfig?.reject || 'Permohonan ditolak';
      const userSlug = userData?.userSlug || userData?.user_name || 'User';
      const label = `false:${rejectReason.trim()} Approved By ${userSlug}`;
      const status = 'ditolak';

      await updateApproval(fieldKey, label, status, false);
      
      setIsApproved(false);
      setRejectReason('');
      
      if (onApprovalChange) {
        onApprovalChange(item.id, fieldKey, false, status, label);
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Gagal mengupdate approval');
      setIsApproved(true); // Revert jika error
    } finally {
      setIsLoading(false);
    }
  };

  // Update approval via API
  const updateApproval = async (fieldKey, label, status, checked) => {
    const api = new Storage({
      credentials: apiConfig.authorization
    });

    // Update field approval di record utama
    const updateData = {
      key: apiConfig.appid,
      className: apiConfig.endpoind,
      recordId: item.id,
      update: {
        [fieldKey]: label
      }
    };

    const response = await api.patch(apiConfig.endpoind, updateData);

    if (response?.status !== 'success' && response?.code !== 200 && !response?.data) {
      throw new Error(response?.message || 'Gagal mengupdate approval');
    }

    // Simpan history approval ke tabel Approval (key statik: 276136656376989)
    // Skip jika error - tidak block update record utama
    try {
      await saveApprovalHistory(item.id, fieldKey, status, label, fieldConfig);
    } catch (historyError) {
      // Error saving history - tidak block update record utama
    }
  };

  // Simpan history approval ke tabel Approval
  const saveApprovalHistory = async (recordId, fieldKey, status, label, fieldConfig) => {
    try {
      const api = new Storage({
        credentials: apiConfig.authorization
      });

      // Extract catatan dari label (format: "true:Permohonan diterima Approved By user" atau "false:Alasan Approved By user")
      const catatan = label.split(':').slice(1).join(':').split(' Approved By')[0].trim();
      const userId = userData?.user_id || userData?.userId || 0;
      const userSlug = userData?.nama || userData?.user_name || 'User';
      // table_name harus number (key dari fieldConfig), bukan string
      // Fallback: gunakan apiConfig.appid jika fieldConfig.key tidak ada
      let tableName = null;
      if (fieldConfig?.key) {
        tableName = Number(fieldConfig.key);
      } else if (fieldConfig?.name && !isNaN(Number(fieldConfig.name))) {
        tableName = Number(fieldConfig.name);
      } else if (apiConfig?.appid) {
        tableName = Number(apiConfig.appid);
      }

      // Insert approval history
      // Format sesuai dengan SdkController.approval() yang menerima $data langsung
      // Fungsi approval() akan cari dengan record_id dan userid, lalu insert atau update
      // Format harus sama persis dengan recordApproval.js (line 60-66)
      const insertHistoryData = {
        userid: Number(userId),
        record_id: Number(recordId),
        status: String(status), // 'disetujui' atau 'ditolak'
        table_name: tableName, // Number - key dari fieldConfig (sama seperti dataKey.key)
        approved_by: String(userSlug),
        catatan: String(catatan)
      };
      
      // Validasi data sebelum kirim - pastikan semua field required ada
      if (!insertHistoryData.userid || !insertHistoryData.record_id || !insertHistoryData.table_name) {
        return; // Skip jika data tidak valid
      }

      // Insert atau update approval history
      // Endpoint: {endpoind}/approval (contoh: "exsampel/approval")
      // SdkController.approval() akan handle insert/update logic berdasarkan record_id dan userid

      await api.post(apiConfig.endpoind + '/approval', insertHistoryData);
    } catch (error) {
      // Error saving approval history - tidak throw karena update record utama sudah berhasil
    }
  };

  // Get display value untuk ditampilkan
  const getDisplayValue = () => {
    if (!fieldValue) return 'Pending';
    const parts = fieldValue.split(':');
    if (parts.length > 1) {
      // Ambil text setelah ":" dan sebelum " Approved By"
      const text = parts[1].split(' Approved By')[0];
      return text || 'Pending';
    }
    return 'Pending';
  };

  return (
    <>
      {/* Label di kiri - format sama seperti fieldRow */}
      <Text style={styles.approvalLabel}>{field.label || field.failed}:</Text>
      
      {/* Switch di kanan - format sama seperti fieldValue */}
      <View style={styles.approvalSwitchContainer}>
        <Switch
          value={isApproved}
          onValueChange={handleApprovalToggle}
          disabled={isLoading}
          color={assetColor.color || assetColor.buttonColor || "#24bca9"}
        />
        {isLoading && (
          <Text style={styles.approvalLoadingText}>...</Text>
        )}
        {fieldValue && (
          <TouchableOpacity onPress={handleStatusClick} activeOpacity={0.7}>
            <Text style={styles.approvalStatusSubtext}>{getDisplayValue()}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal untuk input alasan penolakan */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setIsApproved(true); // Revert toggle
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Keterangan Approval</Text>
            <Text style={styles.modalSubtitle}>
              Beri alasan ditolak: dengan mengisi text {fieldConfig?.reject || 'Permohonan ditolak'}
            </Text>
            
            <TextInput
              style={styles.rejectInput}
              placeholder="Masukkan alasan penolakan (minimal 5 karakter)"
              placeholderTextColor="#999"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setIsApproved(true); // Revert toggle
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { backgroundColor: assetColor.buttonColor || assetColor.color || '#24bca9' }
                ]}
                onPress={handleRejectSubmit}
                disabled={isLoading || !rejectReason || rejectReason.trim().length < 5}
              >
                <Text style={[
                  styles.modalButtonTextSubmit,
                  { color: assetColor.buttonTextColor || '#fff' },
                  (!rejectReason || rejectReason.trim().length < 5) && styles.modalButtonTextDisabled
                ]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal untuk menampilkan history approval */}
      <Modal
        visible={showHistoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowHistoryModal(false);
          setApprovalHistory([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>History Approval</Text>
            
            {loadingHistory ? (
              <View style={styles.historyLoadingContainer}>
                <Text style={styles.historyLoadingText}>Memuat history...</Text>
              </View>
            ) : approvalHistory.length > 0 ? (
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={true}>
                {approvalHistory.map((history, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={[
                        styles.historyStatus,
                        { color: assetColor.color || assetColor.buttonColor || '#24bca9' }
                      ]}>
                        {history.status === 'disetujui' ? '✓ Disetujui' : '✗ Ditolak'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {history.created_at || history.updated_at || ''}
                      </Text>
                    </View>
                    {history.approved_by && (
                      <Text style={styles.historyApprovedBy}>
                        Oleh: {history.approved_by}
                      </Text>
                    )}
                    {history.catatan && (
                      <Text style={styles.historyCatatan}>
                        {history.catatan}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.historyEmptyContainer}>
                <Text style={styles.historyEmptyText}>Tidak ada history approval</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowHistoryModal(false);
                  setApprovalHistory([]);
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

/**
 * Helper function untuk mendapatkan approval access dari data access
 * @param {Object} accessData - Data access object
 * @param {string} className - Class name untuk lookup approval access
 * @returns {number} - Approval access level (0 = no access, 1 = has access)
 */
export const getApprovalAccess = (accessData, className) => {
  if (!accessData || !className) return 0;
  
  // Format: accessData.approval[className] atau accessData?.approval?.[className]
  return accessData?.approval?.[className] ?? 0;
};

const styles = StyleSheet.create({
  approvalLabel: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: '#666',
    width: 120,
    flexShrink: 0,
  },
  approvalSwitchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  approvalStatusSubtext: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  approvalStatus: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: '#666',
    flex: 1,
  },
  approvalStatusClickable: {
    textDecorationLine: 'underline',
    // color akan di-set secara dinamis dengan assetColor
  },
  approvalLoadingText: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: '#999',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#666',
    marginBottom: 16,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#333',
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#e0e0e0',
  },
  modalButtonSubmit: {
    // backgroundColor akan di-set secara dinamis dengan assetColor
  },
  modalButtonTextCancel: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    color: '#666',
  },
  modalButtonTextSubmit: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    color: '#fff',
  },
  modalButtonTextDisabled: {
    opacity: 0.5,
  },
  historyLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  historyLoadingText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#666',
  },
  historyList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  historyItem: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyStatus: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    // color akan di-set secara dinamis dengan assetColor
  },
  historyDate: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: '#999',
  },
  historyApprovedBy: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: '#666',
    marginBottom: 4,
  },
  historyCatatan: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: '#333',
    marginTop: 4,
  },
  historyEmptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  historyEmptyText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ApprovalField;

