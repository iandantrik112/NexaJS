import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FontFamily,
  NexaDBLite,
  ScrollView,
  TouchableOpacity,
  Storage,
  Alert,
  assetsImage,
  Image,
  Svg,
  useNavigation,
  Spinner,
  properti
} from "NexaUI";
import { DataHelper } from "../helper/DataHelper";
import { FromHelper } from "../helper/FromHelper";

const FormTab = ({ appDataFromStore, loading, params, pkg, label, userData, refreshKey, route }) => {
  const [getData, setGetData] = useState(null);
  const [processed, setProcessed] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fromAccess, setFromAccess] = useState(null);
  const [wizardStep, setWizardStep] = useState(0); // State untuk wizard step
  const [isOffline, setIsOffline] = useState(false); // State untuk offline status
  const [pendingSubmissions, setPendingSubmissions] = useState([]); // State untuk pending submissions
  const [isRetrying, setIsRetrying] = useState(false); // State untuk retry status
  
  // Asset color configuration - load dari properti
  const [assetColor, setAssetColor] = useState({
    backgroundColor: '#24BCA9',
    color: '#009688',
    btnColor: '#e0f2f1',
    deleteColor: '#f44336',
    deleteBtnColor: '#ffebee',
    // Warna tombol dan text tombol
    buttonColor: '#009688',
    buttonTextColor: '#fff',
    buttonPrevColor: '#e0e0e0',
    buttonPrevTextColor: '#666',
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
  
  // Get styles with assetColor (harus dipanggil setelah assetColor didefinisikan)
  const styles = getStyles(assetColor);
  
  // Hitung jumlah field (exclude id dan approval) untuk menentukan apakah perlu wizard
  const getFieldCount = () => {
    if (!processed?.form) return 0;
    return Object.keys(processed.form).filter(key => {
      const field = processed.form[key];
      return field && 
             field.failed !== 'id' && 
             field.name !== 'id' && 
             field.type !== 'approval';
    }).length;
  };

  // Fungsi untuk mendapatkan field yang akan ditampilkan di step tertentu
  const getFieldsForStep = (step) => {
    if (!processed?.form || !processed?.column) return [];
    
    // Filter field yang bukan id dan bukan approval
    const validFields = processed.column.filter(colName => {
      const field = processed.form[colName];
      return field && 
             field.failed !== 'id' && 
             field.name !== 'id' && 
             field.type !== 'approval';
    });
    
    const fieldsPerStep = 5;
    const startIndex = step * fieldsPerStep;
    const endIndex = startIndex + fieldsPerStep;
    
    return validFields.slice(startIndex, endIndex);
  };
  
  // Fungsi untuk membuat processed data untuk step tertentu
  const getProcessedForStep = (step) => {
    if (!processed) return null;
    
    const fieldsForStep = getFieldsForStep(step);
    if (fieldsForStep.length === 0) return null;
    
    // Buat processed data baru dengan hanya field di step ini
    const stepForm = {};
    const stepColumn = [];
    
    fieldsForStep.forEach(colName => {
      const field = processed.form[colName];
      if (field) {
        // Pastikan columnWidth tetap sama untuk menjaga konsistensi
        stepForm[colName] = { ...field };
        stepColumn.push(colName);
      }
    });
    
    return {
      form: stepForm,
      column: stepColumn,
      fields: processed.fields?.filter(f => stepColumn.includes(f.failed))
    };
  };
  
  // Custom buildForm untuk render langsung tanpa Grid (full width)
  const buildFormFullWidth = (processedData, formValues, setFormValues, formErrors, isUpdate, pkgToken) => {
    if (!processedData || !processedData.form) {
      return null;
    }

    const { form, column } = processedData;
    const fields = [];

    // Iterate berdasarkan urutan column
    column.forEach(colName => {
      const field = form[colName];
      if (field) {
        // Filter berdasarkan mode
        if (!isUpdate) {
          // Insert mode: skip field id dan approval
          if (field.failed === 'id' || field.name === 'id' || field.type === 'approval') {
            return;
          }
        } else {
          // Update mode: skip field id, field yang hidden, dan approval
          if (field.failed === 'id' || field.name === 'id' || field.type === 'approval') {
            return;
          }
          if (field.hidden === true) {
            return;
          }
        }
        fields.push(field);
      }
    });

    if (fields.length === 0) {
      return null;
    }

    // Render fields tanpa Grid untuk full width
    return (
      <View style={{ width: '100%' }}>
        {fields.map(field => 
          FromHelper.renderField(field, formValues, setFormValues, formErrors, pkgToken, userData)
        )}
      </View>
    );
  };
  
  const fieldCount = getFieldCount();
  const isWizardMode = fieldCount > 5;
  const fieldsPerStep = 5;
  const totalSteps = isWizardMode ? Math.ceil(fieldCount / fieldsPerStep) : 1;
  
  // Reset wizard step ketika processed berubah
  useEffect(() => {
    if (processed) {
      setWizardStep(0);
    }
  }, [processed]);
  
  // Coba gunakan useNavigation jika tersedia (harus hook)
  let navigation = null;
  if (typeof useNavigation === 'function') {
    try {
      navigation = useNavigation();
    } catch (e) {
      // useNavigation tidak tersedia atau tidak dalam NavigationContainer
    }
  }


  useEffect(() => {
    const loadData = async () => {
      if (!pkg?.token) {
        return;
      }
      
      try {
        setFetching(true);
        const data = await NexaDBLite.get("nexaStore", pkg.token);
        setGetData(data);
        const processedData = DataHelper.getProcessedFields(data, "tabel");
        setProcessed(processedData);
      
          const appAssets = await NexaDBLite.get("bucketsStore", 'assets');

        const accessValue = appAssets?.assets.accessAdd?.[data.className];
        setFromAccess(accessValue);
        // Cek apakah ada data untuk diupdate dari route params
        const routeEditData = route?.params?.editData;
        
        // Ambil data langsung dari route params (tidak perlu nexaDb)
        const updateId = routeEditData?.id;
        const updateData = routeEditData?.data;
        
        // console.log('userData:', userData);
        // console.log('processedData?.form:', processedData);
        if (processedData?.form) {
          const initialValues = {};
          
          if (updateId && updateData) {
            // Update mode: isi form dengan data yang akan diupdate
            Object.keys(processedData.form).forEach(key => {
              const field = processedData.form[key];
              let value = updateData[key];
              
              // Jika field type file dan value adalah JSON string, parse dulu
              if (field?.type === 'file' && typeof value === 'string' && value.trim().startsWith('{')) {
                try {
                  value = JSON.parse(value);
                } catch (e) {
                  // Jika parse gagal, gunakan value as is
                }
              }
              
              // Jika value adalah object (termasuk file object), simpan sebagai object
              // Jika bukan, convert ke string
              initialValues[key] = value !== undefined && value !== null 
                ? (typeof value === 'object' ? value : String(value))
                : '';
            });
          } else {
            // Insert mode: initialize dengan empty string
            Object.keys(processedData.form).forEach(key => {
              initialValues[key] = '';
            });
          }
          
          // Set value instansi dari userData jika ada
          if (userData && userData.instansi) {
            initialValues['instansi'] = userData.instansi;
          }
          
          setFormValues(initialValues);
        }
      } catch (error) {
        // Error handling
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [pkg?.token, refreshKey]);

  // Retry pending submissions
  const retryPendingSubmissions = useCallback(async () => {
    if (!pkg?.token || isRetrying || isOffline) return;

    setIsRetrying(true);

    try {
      const queueStore = `formQueue_${pkg.token}`;
      const allPending = await NexaDBLite.getAll(queueStore);

      if (!allPending?.data || !Array.isArray(allPending.data)) {
        setIsRetrying(false);
        return;
      }

      // Filter hanya pending items (bukan failed)
      const pendingItems = allPending.data.filter(item => item.status !== 'failed');

      if (pendingItems.length === 0) {
        setIsRetrying(false);
        setPendingSubmissions([]);
        return;
      }

      const api = new Storage({
        credentials: getData?.api?.authorization
      });

      // Retry setiap pending item
      for (const item of pendingItems) {
        try {
          // Rebuild processedData dari data asli menggunakan FromHelper
          let processedDataToSend;
          if (processed && item.data) {
            const dataToProcess = { ...item.data };
            // Hapus id untuk insert
            if (item.action === 'insert') {
              delete dataToProcess.id;
            }
            // Process form data - ini akan mengkonversi file ke binary array
            processedDataToSend = await FromHelper.processFormData(dataToProcess, processed);
            
            // Tambahkan fieldConfig hanya jika ada file (HANYA untuk dikirim ke server)
            if (item.hasFiles && processed?.form) {
              processedDataToSend.fieldConfig = processed.form;
            }
          } else {
            // Fallback: gunakan data langsung jika processed tidak tersedia
            processedDataToSend = item.data;
          }

          let response;

          if (item.action === 'insert') {
            response = await api.post(getData.api.endpoind, processedDataToSend);
          } else if (item.action === 'update') {
            const updateData = {
              key: getData.api.appid,
              className: getData.api.endpoind,
              recordId: item.data.id,
              update: processedDataToSend
            };
            response = await api.patch(getData.api.endpoind, updateData);
          }

          // Hapus fieldConfig setelah dikirim
          if (processedDataToSend?.fieldConfig) {
            delete processedDataToSend.fieldConfig;
          }

          // Jika berhasil, hapus dari queue
          if (response?.status === 'success' || response?.data || response?.code === 200) {
            await NexaDBLite.delete(queueStore, item.id);
            setPendingSubmissions(prev => prev.filter(p => p.id !== item.id));
            console.log(`✅ [Form.js] Queue item ${item.id} berhasil dikirim dan dihapus dari queue`);
          } else {
            // Response tidak success - increment retry count
            const updatedItem = {
              ...item,
              retryCount: (item.retryCount || 0) + 1,
              lastError: response?.message || 'Server returned non-success response',
              lastRetryAt: new Date().toISOString()
            };

            if (updatedItem.retryCount >= updatedItem.maxRetries) {
              updatedItem.status = 'failed';
              updatedItem.failedAt = new Date().toISOString();
            }

            await NexaDBLite.set(queueStore, updatedItem);
            setPendingSubmissions(prev => prev.map(p => p.id === item.id ? updatedItem : p));
          }
        } catch (error) {
          // Error saat retry - increment retry count
          const errorMessage = error?.message || 'Unknown error';
          const updatedItem = {
            ...item,
            retryCount: (item.retryCount || 0) + 1,
            lastError: errorMessage,
            lastRetryAt: new Date().toISOString()
          };

          if (updatedItem.retryCount >= updatedItem.maxRetries) {
            updatedItem.status = 'failed';
            updatedItem.failedAt = new Date().toISOString();
          }

          await NexaDBLite.set(queueStore, updatedItem);
          setPendingSubmissions(prev => prev.map(p => p.id === item.id ? updatedItem : p));
        }
      }
    } catch (error) {
      console.error('❌ [Form.js] Error retrying submissions:', error);
    } finally {
      setIsRetrying(false);
      setIsOffline(false); // Set offline ke false setelah retry selesai
    }
  }, [pkg?.token, getData, isRetrying, isOffline, processed]);

  // Load pending submissions saat component mount
  useEffect(() => {
    const loadPendingSubmissions = async () => {
      if (!pkg?.token) return;
      
      try {
        const queueStore = `formQueue_${pkg.token}`;
        const allPending = await NexaDBLite.getAll(queueStore);
        
        if (allPending?.data && Array.isArray(allPending.data)) {
          // Filter hanya pending items (bukan failed)
          const pendingItems = allPending.data.filter(item => item.status !== 'failed');
          setPendingSubmissions(pendingItems);
          // Auto-retry akan dipanggil oleh useEffect terpisah jika kondisi terpenuhi
        }
      } catch (error) {
        console.warn('⚠️ [Form.js] Error loading pending submissions:', error);
      }
    };
    
    loadPendingSubmissions();
  }, [pkg?.token]);

  // Save pending submission ke queue (didefinisikan sebelum retryPendingSubmissions)
  const saveToQueue = async (action, data, hasFiles) => {
    if (!pkg?.token) return null;
    
    try {
      const queueStore = `formQueue_${pkg.token}`;
      const queueId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Sederhanakan data untuk menghindari "Property storage exceeds"
      // Jangan simpan processedData yang kompleks (akan di-rebuild saat retry)
      const simplifiedData = {};
      for (const key in data) {
        const value = data[key];
        // Skip file objects yang kompleks - hanya simpan reference
        if (value && typeof value === 'object' && !Array.isArray(value) && value.uri) {
          // File object - simpan hanya info penting
          simplifiedData[key] = {
            uri: value.uri,
            type: value.type,
            name: value.name
          };
        } else if (Array.isArray(value) && value.length > 0 && value[0]?.uri) {
          // Array of files - simpan hanya info penting
          simplifiedData[key] = value.map(file => ({
            uri: file.uri,
            type: file.type,
            name: file.name
          }));
        } else {
          simplifiedData[key] = value;
        }
      }

      const queueItem = {
        id: queueId,
        action: action, // 'insert' atau 'update'
        data: simplifiedData,
        hasFiles: hasFiles,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 5
      };

      await NexaDBLite.set(queueStore, queueItem);

      // Update state
      setPendingSubmissions(prev => [...prev, queueItem]);

      return queueId;
    } catch (error) {
      console.error('❌ [Form.js] Error saving to queue:', error);
      return null;
    }
  };

  // Auto-retry saat jaringan kembali (hanya jika ada pending submissions dan tidak sedang retry)
  // Note: retryPendingSubmissions tidak dimasukkan ke dependency untuk mencegah infinite loop
  useEffect(() => {
    if (!isOffline && pendingSubmissions.length > 0 && !isRetrying && getData?.api?.authorization) {
      // Debounce untuk mencegah multiple retry calls
      const timeoutId = setTimeout(() => {
        retryPendingSubmissions();
      }, 2000); // Wait 2 seconds before auto-retry
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffline, pendingSubmissions.length, isRetrying, getData?.api?.authorization]);

  // Handle insert data ke server
  const handleInsert = async () => {
    if (!getData?.api?.authorization || !getData?.api?.endpoind) {
      Alert.alert('Error', 'API configuration not found');
      return;
    }

    // Validasi client-side terlebih dahulu
    const validationErrors = FromHelper.validateForm(processed, formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return; // Stop jika ada error validasi
    }

    try {
      setSubmitting(true);
      setFormErrors({}); // Clear errors sebelum submit
      
      // Siapkan data untuk dikirim (exclude id untuk insert)
      // PASTIKAN semua field dari processed.form dikirim, bahkan jika nilainya kosong
      const dataToSend = {};
      
      // Iterate semua field dari processed.form untuk memastikan semua field dikirim
      if (processed?.form) {
        Object.keys(processed.form).forEach(key => {
          const field = processed.form[key];
          // Skip field id, field yang hidden, dan field approval
          if (field.failed === 'id' || field.name === 'id' || field.hidden === true || field.type === 'approval') {
            return;
          }
          // Ambil value dari formValues jika ada, atau gunakan empty string
          dataToSend[key] = formValues[key] !== undefined && formValues[key] !== null 
            ? formValues[key] 
            : '';
        });
      } else {
        // Fallback: gunakan formValues langsung jika processed.form tidak ada
        Object.assign(dataToSend, formValues);
      }
      
      // Hapus id jika ada (untuk insert)
      delete dataToSend.id;
      
      // Tambahkan userid jika ada
      if (userData?.user_id) {
        dataToSend.userid = userData.user_id;
      }

      // Cek apakah ada file yang perlu diupload menggunakan FromHelper
      const hasFiles = FromHelper.hasFiles(dataToSend, processed);

      // Buat API instance
      const api = new Storage({
        credentials: getData.api.authorization
      });

      // Process form data (untuk handle flag, switch, dll) menggunakan FromHelper
      const processedData = await FromHelper.processFormData(dataToSend, processed);
      
      // Tambahkan fieldConfig hanya jika ada file yang perlu diupload
      if (hasFiles) {
        processedData.fieldConfig = processed?.form || null;
      }
      
      let response;
      try {
        if (hasFiles) {
          // Jika ada file, kirim sebagai JSON (bukan FormData) - sama seperti NexaValidation.js
          response = await api.post(getData.api.endpoind, processedData);
        } else {
          // Jika tidak ada file, kirim JSON biasa dengan fieldConfig
          response = await api.post(getData.api.endpoind, processedData);
        }
        
        // Response berhasil (tidak perlu log detail)
        setIsOffline(false); // Set offline ke false jika berhasil
      } catch (apiError) {
        // Tangani network error - simpan ke queue untuk retry
        const errorMessage = apiError?.message || '';
        const errorCode = apiError?.code || '';
        const errorType = apiError?.data?.type || '';
        
        // ✅ FIX: Deteksi network error lebih spesifik (jangan terlalu luas)
        // Hanya anggap sebagai network error jika benar-benar masalah koneksi
        const isNetworkError = (
          errorType === 'NETWORK_ERROR' ||
          errorCode === 'TIMEOUT' ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('CORS Error') ||
          (errorMessage.includes('Network request failed') && 
           !errorMessage.includes('TypeError') && 
           !errorMessage.includes('JSON'))
        );
        
        if (isNetworkError) {
          // Network error - simpan ke queue
          setIsOffline(true);
          const queueId = await saveToQueue('insert', dataToSend, hasFiles);
          
          if (queueId) {
            setSuccessMessage('Data disimpan ke antrian. Akan dikirim otomatis ketika koneksi tersedia.');
            // Reset form setelah berhasil disimpan ke queue
            const initialValues = {};
            if (processed?.form) {
              Object.keys(processed.form).forEach(key => {
                initialValues[key] = '';
              });
            }
            setFormValues(initialValues);
            setFormErrors({});
            
            // Clear success message setelah 5 detik
            setTimeout(() => {
              setSuccessMessage('');
            }, 5000);
            
            return; // Exit early
          } else {
            Alert.alert('Error', 'Gagal menyimpan data ke antrian. Silakan coba lagi.');
            return;
          }
        } else {
          // Error lain (bukan network error) - throw untuk ditangani di catch block
          throw apiError;
        }
      }

      if (response?.status === 'success' || response?.data) {
        // Tampilkan success message di UI
        setSuccessMessage(response?.message || 'Data berhasil disimpan');
        // Reset form setelah berhasil
        const initialValues = {};
        if (processed?.form) {
          Object.keys(processed.form).forEach(key => {
            initialValues[key] = '';
          });
        }
        setFormValues(initialValues);
        setFormErrors({}); // Clear errors
        
        // Clear success message setelah 3 detik
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else if (response?.status === 'failed' && response?.data?.input) {
        // Handle validasi error - tampilkan error langsung di form
        const validationErrors = {};
        Object.keys(response.data.input).forEach(key => {
          if (key !== 'userid') { // Skip userid dari error display
            validationErrors[key] = response.data.input[key];
          }
        });
        setFormErrors(validationErrors);
        setSuccessMessage(''); // Clear success message jika ada error
        // Tidak perlu Alert, error sudah ditampilkan di form
      } else {
        Alert.alert('Error', response?.message || 'Gagal menyimpan data');
        setFormErrors({});
        setSuccessMessage(''); // Clear success message
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update data ke server
  const handleUpdate = async () => {
    if (!getData?.api?.authorization || !getData?.api?.endpoind) {
      Alert.alert('Error', 'API configuration not found');
      return;
    }

    if (!formValues.id || formValues.id === '') {
      Alert.alert('Error', 'ID tidak ditemukan untuk update');
      return;
    }

    // Validasi client-side terlebih dahulu
    const validationErrors = FromHelper.validateForm(processed, formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return; // Stop jika ada error validasi
    }

    try {
      setSubmitting(true);
      setFormErrors({}); // Clear errors sebelum submit
      
      // Siapkan data untuk dikirim (include id untuk update)
      // PASTIKAN semua field dari processed.form dikirim, bahkan jika nilainya kosong
      const dataToSend = {};
      
      // Iterate semua field dari processed.form untuk memastikan semua field dikirim
      if (processed?.form) {
        Object.keys(processed.form).forEach(key => {
          const field = processed.form[key];
          // Skip field id (akan diambil terpisah untuk recordId), field yang hidden, dan field approval
          if (field.failed === 'id' || field.name === 'id' || field.type === 'approval') {
            return; // Skip id dan approval, akan diambil terpisah
          }
          if (field.hidden === true) {
            return; // Skip hidden fields
          }
          // Ambil value dari formValues jika ada, atau gunakan empty string
          dataToSend[key] = formValues[key] !== undefined && formValues[key] !== null 
            ? formValues[key] 
            : '';
        });
      } else {
        // Fallback: gunakan formValues langsung jika processed.form tidak ada
        Object.assign(dataToSend, formValues);
      }
      
      // Simpan id untuk recordId (dari formValues, bukan dari dataToSend)
      const recordId = formValues.id;
      
      // Buat API instance
      const api = new Storage({
        credentials: getData.api.authorization
      });
      
      // Update payload (tidak perlu hapus id karena sudah tidak ada di dataToSend)
      const updatePayload = { ...dataToSend };
      
      // Cek apakah ada file yang perlu diupload menggunakan FromHelper
      const hasFiles = FromHelper.hasFiles(updatePayload, processed);

      // Process form data (untuk handle flag, switch, dll) menggunakan FromHelper
      const processedUpdate = await FromHelper.processFormData(updatePayload, processed);
      
      // Tambahkan fieldConfig ke processedUpdate hanya jika ada file yang perlu diupload
      if (hasFiles) {
        processedUpdate.fieldConfig = processed?.form || null;
      }

      // Buat update data dengan format yang sama seperti insert
      const updateData = {
        key: getData.api.appid,
        className: getData.api.endpoind,
        recordId: recordId,
        update: processedUpdate
      };

      let response;
      try {
        if (hasFiles) {
          // Jika ada file, kirim sebagai JSON
          response = await api.patch(getData.api.endpoind, updateData);
        } else {
          // Jika tidak ada file, kirim JSON biasa dengan fieldConfig
          response = await api.patch(getData.api.endpoind, updateData);
        }
        
        setIsOffline(false); // Set offline ke false jika berhasil
      } catch (apiError) {
        // Tangani network error - simpan ke queue untuk retry
        const errorMessage = apiError?.message || '';
        const errorCode = apiError?.code || '';
        const errorType = apiError?.data?.type || '';
        
        // ✅ FIX: Deteksi network error lebih spesifik (jangan terlalu luas)
        // Hanya anggap sebagai network error jika benar-benar masalah koneksi
        const isNetworkError = (
          errorType === 'NETWORK_ERROR' ||
          errorCode === 'TIMEOUT' ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('CORS Error') ||
          (errorMessage.includes('Network request failed') && 
           !errorMessage.includes('TypeError') && 
           !errorMessage.includes('JSON'))
        );
        
        if (isNetworkError) {
          // Network error - simpan ke queue
          setIsOffline(true);
          const queueId = await saveToQueue('update', dataToSend, hasFiles);
          
          if (queueId) {
            setSuccessMessage('Data disimpan ke antrian. Akan dikirim otomatis ketika koneksi tersedia.');
            // Reset form setelah berhasil disimpan ke queue
            const initialValues = {};
            if (processed?.form) {
              Object.keys(processed.form).forEach(key => {
                initialValues[key] = '';
              });
            }
            setFormValues(initialValues);
            setFormErrors({});
            
            // Clear success message setelah 5 detik
            setTimeout(() => {
              setSuccessMessage('');
            }, 5000);
            
            return; // Exit early
          } else {
            Alert.alert('Error', 'Gagal menyimpan data ke antrian. Silakan coba lagi.');
            return;
          }
        } else {
          // Error lain (bukan network error) - throw untuk ditangani di catch block
          throw apiError;
        }
      }

      if (response?.status === 'success' || response?.code === 200 || response?.data) {
        // Tampilkan success message di UI
        setSuccessMessage(response?.message || 'Data berhasil diupdate');
        // Reset form setelah berhasil
        const initialValues = {};
        if (processed?.form) {
          Object.keys(processed.form).forEach(key => {
            initialValues[key] = '';
          });
        }
        setFormValues(initialValues);
        setFormErrors({}); // Clear errors
        
        // Clear success message setelah 3 detik
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else if (response?.status === 'failed' && response?.data?.input) {
        // Handle validasi error - tampilkan error langsung di form
        const validationErrors = {};
        Object.keys(response.data.input).forEach(key => {
          if (key !== 'userid') { // Skip userid dari error display
            validationErrors[key] = response.data.input[key];
          }
        });
        setFormErrors(validationErrors);
        setSuccessMessage(''); // Clear success message jika ada error
        // Tidak perlu Alert, error sudah ditampilkan di form
      } else {
        Alert.alert('Error', response?.message || 'Gagal mengupdate data');
        setFormErrors({});
        setSuccessMessage(''); // Clear success message
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Terjadi kesalahan saat mengupdate data');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading || fetching || fromAccess === null ? (
        <View style={styles.loadingContainer}>
          <Spinner 
            visible={true} 
            text="Memuat formulir..."
            textColor="#666"
            size="large"
            color={assetColor?.color || "#1aacf0"}
          />
        </View>
      ) : fromAccess !== 1 ? (
        <View style={styles.emptyContainer}>
          <Svg 
            name="forgot" 
            width={220} 
            height={220} 
            fill={assetColor.backgroundColor}
            style={styles.logo}
          />
          <Text style={styles.emptyText}>Anda tidak memiliki akses untuk mengelola formulir ini</Text>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              // Coba berbagai cara navigasi
              if (navigation?.goBack) {
                navigation.goBack();
              } else if (route?.navigation?.goBack) {
                route.navigation.goBack();
              } else if (route?.goBack) {
                route.goBack();
              } else if (route?.params?.navigation?.goBack) {
                route.params.navigation.goBack();
              } else {
                // Fallback: show alert
                Alert.alert('Info', 'Silakan gunakan tombol kembali di browser atau aplikasi');
              }
            }}
          >
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      ) : processed && processed.form ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.formContainer}>
            {/* Form Title - hanya tampil jika form standar (bukan wizard) */}
            {!isWizardMode && (
              <Text style={styles.formTitle1}>Form</Text>
            )}
            
            {/* Offline Indicator */}
            {isOffline && (
              <View style={styles.offlineContainer}>
                <Text style={styles.offlineText}>
                  ⚠️ Mode Offline - Data akan dikirim otomatis ketika koneksi tersedia
                </Text>
                {pendingSubmissions.length > 0 && (
                  <Text style={styles.offlineSubtext}>
                    {pendingSubmissions.length} data menunggu untuk dikirim
                  </Text>
                )}
              </View>
            )}
            
            {/* Pending Submissions Indicator */}
            {!isOffline && pendingSubmissions.length > 0 && (
              <View style={styles.pendingContainer}>
                <Text style={styles.pendingText}>
                  📤 Mengirim {pendingSubmissions.length} data yang tertunda...
                </Text>
                <TouchableOpacity
                  onPress={retryPendingSubmissions}
                  disabled={isRetrying}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>
                    {isRetrying ? 'Mengirim...' : 'Kirim Sekarang'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Success Message */}
            {successMessage ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}
            
            {/* Wizard Progress Indicator */}
            {isWizardMode && (
              <View style={styles.wizardProgress}>
                <View style={styles.wizardProgressHeader}>
                  <Text style={styles.formTitle}>Form</Text>
                  <Text style={styles.wizardProgressText}>
                    Langkah {wizardStep + 1} dari {totalSteps}
                  </Text>
                </View>
                <View style={styles.wizardProgressBar}>
                  <View 
                    style={[
                      styles.wizardProgressFill, 
                      { width: `${((wizardStep + 1) / totalSteps) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
            
            {/* Render Form - Wizard Mode atau Normal Mode */}
            {isWizardMode ? (
              (() => {
                const stepProcessed = getProcessedForStep(wizardStep);
                if (!stepProcessed) return null;
                return (
                  <View style={styles.wizardFormContainer}>
                    {buildFormFullWidth(
                      stepProcessed, 
                      formValues, 
                      setFormValues, 
                      formErrors, 
                      !!(formValues.id && formValues.id !== ''),
                      pkg?.token || null
                    )}
                  </View>
                );
              })()
            ) : (
              <View style={styles.wizardFormContainer}>
                {buildFormFullWidth(
              processed, 
              formValues, 
              setFormValues, 
              formErrors, 
              !!(formValues.id && formValues.id !== ''),
              pkg?.token || null
                )}
              </View>
            )}
            
            {/* Tombol Navigation Wizard atau Submit */}
            <View style={styles.buttonContainer}>
              {isWizardMode ? (
                <View style={styles.wizardButtons}>
                  {/* Tombol Sebelumnya - selalu tampil jika bukan step pertama */}
                  {wizardStep > 0 && (
                    <TouchableOpacity
                      onPress={() => setWizardStep(wizardStep - 1)}
                      style={[styles.wizardButton, styles.wizardButtonPrev]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.wizardButtonText, { color: assetColor.buttonPrevTextColor }]}>Sebelumnya</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Tombol Selanjutnya atau Submit */}
                  {wizardStep < totalSteps - 1 ? (
                    <TouchableOpacity
                      onPress={() => setWizardStep(wizardStep + 1)}
                      style={[
                        styles.wizardButton, 
                        styles.wizardButtonNext,
                        wizardStep === 0 && { flex: 1 } // Full width jika tidak ada tombol sebelumnya
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.wizardButtonText}>Selanjutnya</Text>
                    </TouchableOpacity>
                  ) : (
                    formValues.id && formValues.id !== '' ? (
                      <TouchableOpacity
                        onPress={handleUpdate}
                        disabled={submitting}
                        style={[
                          styles.insertButton,
                          submitting && styles.insertButtonDisabled,
                          wizardStep > 0 && { flex: 1 } // Full width jika ada tombol sebelumnya
                        ]}
                      >
                        <Text style={styles.insertButtonText}>
                          {submitting ? 'Mengupdate...' : 'Update'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handleInsert}
                        disabled={submitting}
                        style={[
                          styles.insertButton,
                          submitting && styles.insertButtonDisabled,
                          wizardStep > 0 && { flex: 1 } // Full width jika ada tombol sebelumnya
                        ]}
                      >
                        <Text style={styles.insertButtonText}>
                          {submitting ? 'Menyimpan...' : 'Simpan'}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              ) : (
                formValues.id && formValues.id !== '' ? (
                <TouchableOpacity
                  onPress={handleUpdate}
                  disabled={submitting}
                  style={[
                    styles.insertButton,
                    submitting && styles.insertButtonDisabled
                  ]}
                >
                  <Text style={styles.insertButtonText}>
                    {submitting ? 'Mengupdate...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleInsert}
                  disabled={submitting}
                  style={[
                    styles.insertButton,
                    submitting && styles.insertButtonDisabled
                  ]}
                >
                  <Text style={styles.insertButtonText}>
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </Text>
                </TouchableOpacity>
                )
              )}
            </View>
        </View>
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>No form data found</Text>
      )}
    </View>
  );
};

// Define getStyles function dengan assetColor
const getStyles = (assetColor) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
    width: '100%',
    // Pastikan tidak ada pembatasan lebar
    maxWidth: '100%',
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
  formContainer: {
    padding: 10,
    paddingTop: 0,
    width: '100%',
  },
  formTitle: {
    fontSize: 20,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 0, // Hapus marginBottom untuk sejajar dengan progress text
    lineHeight: 24, // Pastikan lineHeight sama dengan progress text
  },
  formTitle1: {
    fontSize: 20,
    fontFamily: FontFamily.semiBold,
    color: '#000',
    marginBottom: 10, // Margin bottom untuk form standar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: assetColor.backgroundColor,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
  },
  insertButton: {
    backgroundColor: assetColor.buttonColor,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  insertButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  insertButtonText: {
    color: assetColor.buttonTextColor,
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
  },
  successContainer: {
    backgroundColor: assetColor.btnColor,
    borderColor: assetColor.color,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: assetColor.color,
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  wizardProgress: {
    marginBottom: 20,
  },
  wizardProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    // Pastikan kedua text sejajar vertikal
    alignContent: 'center',
  },
  wizardProgressText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: '#666',
    textAlign: 'right',
    lineHeight: 24, // Pastikan lineHeight sama dengan formTitle
  },
  wizardProgressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  wizardProgressFill: {
    height: '100%',
    backgroundColor: assetColor.backgroundColor,
    borderRadius: 3,
  },
  wizardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  wizardButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardButtonPrev: {
    backgroundColor: assetColor.buttonPrevColor,
  },
  wizardButtonNext: {
    backgroundColor: assetColor.buttonColor,
  },
  wizardButtonText: {
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    color: assetColor.buttonTextColor,
  },
  wizardFormContainer: {
    width: '100%',
  },
  offlineContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineText: {
    color: '#856404',
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
    marginBottom: 4,
  },
  offlineSubtext: {
    color: '#856404',
    fontSize: 12,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  pendingContainer: {
    backgroundColor: '#d1ecf1',
    borderColor: '#0c5460',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingText: {
    color: '#0c5460',
    fontSize: 14,
    fontFamily: FontFamily.medium,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#0c5460',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FontFamily.semiBold,
  },
});

export default FormTab;
