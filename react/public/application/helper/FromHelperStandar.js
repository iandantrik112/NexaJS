/**
 * FromHelper - Helper class untuk build form dari processed data
 * Menggunakan komponen dari package/Form dan Grid untuk layout
 */
import React from 'react';
import { Text, Alert, TouchableOpacity } from 'react-native';
import {
  Input,
  SelectList,
  Switch,
  RichTextEditor,
  Grid,
  View,
  pickImage,
  pickCamera,
  pickDocument,
  formatFileSize,
} from "NexaUI";
import { FlagField } from "./NexaFlag";
import { SearchField } from "./NexaSearch";
import { getIconByType } from "./icon";

export class FromHelper {
  /**
   * Validasi form sebelum submit
   * @param {Object} processed - Processed data dari DataHelper.getProcessedFields
   * @param {Object} formValues - Object berisi nilai form
   * @returns {Object} - Object berisi error per field
   */
  static validateForm(processed, formValues) {
    const errors = {};
    
    if (!processed?.form) {
      return errors;
    }
    
    Object.keys(processed.form).forEach(key => {
      const field = processed.form[key];
      const fieldKey = field.failed || field.name;
      const value = formValues[fieldKey] || '';
      const validation = field.validation;
      const placeholder = field.placeholder || fieldKey;
      
      // Skip validasi untuk field id
      if (fieldKey === 'id') {
        return;
      }
      
      // Validasi required (jika value kosong)
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[fieldKey] = `${placeholder} tidak boleh kosong`;
        return; // Stop validasi selanjutnya jika kosong
      }
      
      // Validasi minimal karakter jika ada
      if (validation && !isNaN(validation)) {
        const minLength = parseInt(validation);
        if (value.length < minLength) {
          errors[fieldKey] = `${placeholder} minimal ${minLength} karakter`;
        }
      }
    });
    
    return errors;
  }

  /**
   * Parse file size string ke bytes
   * @param {string} sizeStr - Format seperti "5MB", "2MB", dll
   * @returns {number} - Size dalam bytes
   */
  static parseFileSize(sizeStr) {
    if (!sizeStr) return 5 * 1024 * 1024; // Default 5MB
    
    const match = sizeStr.match(/(\d+)(MB|KB|GB)/i);
    if (match) {
      const size = parseInt(match[1], 10);
      const unit = match[2].toUpperCase();
      
      if (unit === 'KB') return size * 1024;
      if (unit === 'MB') return size * 1024 * 1024;
      if (unit === 'GB') return size * 1024 * 1024 * 1024;
    }
    
    return 5 * 1024 * 1024; // Default 5MB
  }

  /**
   * Convert file URI ke binary array (untuk React Native)
   * @param {Object} fileObj - File object dengan uri, base64, atau name
   * @returns {Promise<Object>} - File object dengan content sebagai binary array
   */
  static async fileToBinaryArray(fileObj) {
    try {
      let byteArray;
      
      // Prioritas 1: Gunakan base64 jika tersedia (dari pickImage/pickCamera)
      if (fileObj.base64) {
        // Jika file sudah dalam format base64, konversi ke binary array
        const base64Data = fileObj.base64.replace(/^data:.*,/, ''); // Remove data URL prefix jika ada
        const binaryString = atob(base64Data);
        byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i);
        }
        byteArray = Array.from(byteArray);
      } else if (fileObj.uri) {
        // Prioritas 2: Jika hanya ada URI (dari pickDocument), coba baca menggunakan fetch
        try {
          const response = await fetch(fileObj.uri);
          
          // Coba gunakan response.arrayBuffer() jika tersedia
          if (typeof response.arrayBuffer === 'function') {
            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            byteArray = Array.from(uint8Array);
          } else {
            // Fallback: baca sebagai text dan konversi (tidak ideal untuk binary files)
            // Untuk file binary seperti PDF, sebaiknya gunakan pickImage jika memungkinkan
            Alert.alert(
              'Warning', 
              'File reading method limited. For better compatibility, please use image picker for image files.'
            );
            const text = await response.text();
            const encoder = new TextEncoder();
            const encoded = encoder.encode(text);
            byteArray = Array.from(encoded);
          }
        } catch (fetchError) {
          Alert.alert('Error', `Failed to read file from URI: ${fetchError.message}`);
          throw fetchError;
        }
      } else {
        Alert.alert('Error', 'File object must have either base64 or uri property');
        throw new Error('File object must have either base64 or uri property');
      }
      
      return {
        name: fileObj.name || 'file',
        size: fileObj.size || byteArray.length,
        type: fileObj.type || 'application/octet-stream',
        content: byteArray, // Binary array [255, 216, 255, ...]
      };
    } catch (error) {
      Alert.alert('Error', `Failed to read file: ${error.message}`);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Process form data sebelum dikirim ke server
   * Menangani berbagai type field termasuk file upload
   * @param {Object} formValues - Form values dari state
   * @param {Object} processed - Processed data dari DataHelper.getProcessedFields
   * @returns {Promise<Object>} - Processed data siap dikirim ke server
   */
  static async processFormData(formValues, processed) {
    const processedData = { ...formValues };
    
    if (!processed?.form) {
      return processedData;
    }
    
    // Process setiap field berdasarkan type
    for (const key of Object.keys(processedData)) {
      const value = processedData[key];
      const field = processed.form[key];
      
      if (!field) continue;
      
      // Handle file type
      if (field.type === 'file' && value) {
        // Handle file - bisa berupa object atau JSON string
        let fileObj = value;
        if (typeof value === 'string' && value.trim().startsWith('{')) {
          try {
            fileObj = JSON.parse(value);
          } catch (e) {
            // Jika parse gagal, skip file ini
            continue;
          }
        }
        
        // Pastikan fileObj adalah object dan memiliki uri, base64, atau name
        if (typeof fileObj === 'object' && (fileObj.uri || fileObj.base64 || fileObj.name)) {
          try {
            // Convert file ke binary array
            const fileData = await this.fileToBinaryArray(fileObj);
            processedData[key] = fileData;
          } catch (fileError) {
            Alert.alert('Error', `Failed to process file ${key}: ${fileError.message}`);
            // Skip file ini jika error
            continue;
          }
        }
      }
      // Handle camera type (sama seperti file, karena camera juga menghasilkan file object)
      else if (field.type === 'camera' && value) {
        // Handle camera - bisa berupa object atau JSON string
        let fileObj = value;
        if (typeof value === 'string' && value.trim().startsWith('{')) {
          try {
            fileObj = JSON.parse(value);
          } catch (e) {
            // Jika parse gagal, skip file ini
            continue;
          }
        }
        
        // Pastikan fileObj adalah object dan memiliki uri, base64, atau name
        if (typeof fileObj === 'object' && (fileObj.uri || fileObj.base64 || fileObj.name)) {
          try {
            // Convert camera capture ke binary array (sama seperti file)
            const fileData = await this.fileToBinaryArray(fileObj);
            processedData[key] = fileData;
          } catch (fileError) {
            Alert.alert('Error', `Failed to process camera ${key}: ${fileError.message}`);
            // Skip file ini jika error
            continue;
          }
        }
      }
      // Handle flag type - hanya kirim nama desa (string) bukan object lengkap
      else if (field.type === 'flag' && value) {
        // Jika value adalah object (dari FlagField), ambil nama desa
        if (typeof value === 'object' && value !== null) {
          // Ambil nama desa dari object
          processedData[key] = value.nama || value.value || value.label || '';
        }
        // Jika sudah string, biarkan seperti itu
      }
      // Handle select/dropdown - pastikan hanya value yang dikirim, bukan object atau array
      else if ((field.type === 'select' || field.type === 'dropdown') && value !== null && value !== undefined && value !== '') {
        // Jika value adalah object, ambil value atau key
        if (typeof value === 'object' && !Array.isArray(value)) {
          processedData[key] = value.value || value.key || value.label || '';
        }
        // Jika value adalah array (tidak seharusnya untuk select/dropdown), ambil value pertama
        else if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          processedData[key] = typeof firstItem === 'object' 
            ? (firstItem.value || firstItem.key || firstItem.label || '')
            : firstItem;
        }
        // Jika sudah string/number, biarkan seperti itu
        else if (typeof value === 'string' || typeof value === 'number') {
          processedData[key] = value;
        }
      }
      // Handle switch/radio/checkbox dengan data select - pastikan hanya value yang dikirim
      else if ((field.type === 'switch' || field.type === 'radio' || field.type === 'checkbox') && value !== null && value !== undefined && value !== '') {
        // Jika value adalah array (checkbox multiple), pastikan setiap item adalah value, bukan object
        if (Array.isArray(value)) {
          processedData[key] = value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return item.value || item.key || item.label || '';
            }
            return item;
          });
        }
        // Jika value adalah object, ambil value atau key
        else if (typeof value === 'object' && value !== null) {
          processedData[key] = value.value || value.key || value.label || '';
        }
        // Jika sudah string/number, biarkan seperti itu
        else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          processedData[key] = value;
        }
      }
      // TODO: Tambahkan handler untuk type lain di sini jika diperlukan
      // else if (field.type === 'video' && value) { ... }
      // else if (field.type === 'document' && value) { ... }
      // Field lain yang tidak masuk kondisi di atas akan tetap ada di processedData dengan nilai aslinya
    }
    
    return processedData;
  }

  /**
   * Cek apakah form memiliki file yang perlu diupload
   * @param {Object} formValues - Form values dari state
   * @param {Object} processed - Processed data dari DataHelper.getProcessedFields
   * @returns {boolean} - True jika ada file yang perlu diupload
   */
  static hasFiles(formValues, processed) {
    if (!processed?.form) return false;
    
    return Object.keys(processed.form).some(key => {
      const field = processed.form[key];
      const value = formValues[key];
      
      // Cek jika field type file atau camera dan value adalah object (file object)
      if ((field?.type === 'file' || field?.type === 'camera') && value) {
        // Bisa berupa object langsung atau string yang berisi JSON
        if (typeof value === 'object' && (value.uri || value.base64 || value.name)) {
          return true;
        }
        if (typeof value === 'string' && value.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(value);
            return parsed && (parsed.uri || parsed.base64 || parsed.name);
          } catch (e) {
            return false;
          }
        }
      }
      return false;
    });
  }

  /**
   * Parse columnWidth untuk mendapatkan jumlah kolom grid
   * @param {string} columnWidth - Format seperti "nx-col-12", "nx-col-6", dll
   * @returns {number} - Jumlah kolom (12 = 1 kolom, 6 = 2 kolom, 4 = 3 kolom, 3 = 4 kolom)
   */
  static parseColumnWidth(columnWidth) {
    if (!columnWidth) return 1; // Default 1 kolom
    
    const match = columnWidth.match(/nx-col-(\d+)/);
    if (match) {
      const colValue = parseInt(match[1], 10);
      // Convert: 12 = 1 col, 6 = 2 cols, 4 = 3 cols, 3 = 4 cols
      return Math.floor(12 / colValue);
    }
    
    return 1; // Default 1 kolom
  }

  /**
   * Render field berdasarkan type
   * @param {Object} field - Field object dari form
   * @param {Object} formValues - Object berisi nilai form
   * @param {Function} setFormValues - Function untuk update form values
   * @param {Object} formErrors - Object berisi error form
   * @param {string} pkgToken - Token untuk mendapatkan API credentials dari nexaDb (untuk flag field)
   * @returns {React.Component} - React component untuk field
   */
  static renderField(field, formValues, setFormValues, formErrors = {}, pkgToken = null, userData = null) {
    const fieldKey = field.failed || field.name;
    // Untuk field instansi, ambil value dari userData jika ada
    let value = formValues[fieldKey] || '';
    if (fieldKey === 'instansi' && userData && userData.instansi) {
      value = userData.instansi;
    }
    const error = formErrors[fieldKey] || '';
    const placeholder = field.placeholder || '';
    // Gunakan getIconByType untuk mendapatkan icon berdasarkan type
    const iconName = getIconByType(field.type, field.icons || field.iconName);
    
    // Jika hiddenForm = true, jangan render field sama sekali (return null)
    if (field.hiddenForm === true) {
      return null;
    }

    // Handle change
    const handleChange = (newValue) => {
      setFormValues(prev => ({
        ...prev,
        [fieldKey]: newValue
      }));
    };

    // Handle file selection untuk type file
    const handleFileSelect = async () => {
      try {
        let result = null;
        const fieldAccept = field.fieldAccept || '';
        const fileUploadSize = field.fileUploadSize || '5MB';
        const maxSizeBytes = this.parseFileSize(fileUploadSize);
        const isMedia = field.fieldMedia === true;

        // Tentukan picker berdasarkan fieldAccept dan fieldMedia
        if (isMedia && (fieldAccept.includes('.jpg') || fieldAccept.includes('.jpeg') || fieldAccept.includes('.png'))) {
          // Image picker untuk media/image files (mengembalikan base64)
          result = await pickImage();
        } else {
          // Document picker dengan accept types
          // Note: pickDocument tidak mengembalikan base64, hanya URI
          // Untuk file yang perlu base64, gunakan pickImage jika memungkinkan
          const acceptTypes = fieldAccept.split(',').map(ext => {
            const extClean = ext.trim().replace('.', '');
            if (extClean === 'jpg' || extClean === 'jpeg') return 'image/jpeg';
            if (extClean === 'png') return 'image/png';
            if (extClean === 'pdf') return 'application/pdf';
            return `application/${extClean}`;
          }).filter(Boolean);
          
          // Jika hanya image types, gunakan pickImage untuk mendapatkan base64
          const isImageOnly = acceptTypes.every(type => type.startsWith('image/'));
          if (isImageOnly && acceptTypes.length > 0) {
            result = await pickImage();
          } else {
            result = await pickDocument({
              type: acceptTypes.length > 0 ? acceptTypes : undefined
            });
          }
        }

        if (result) {
          // Validasi ukuran file
          if (result.size && result.size > maxSizeBytes) {
            Alert.alert('Error', `Ukuran file terlalu besar (maksimal ${fileUploadSize})`);
            return;
          }

          // Validasi tipe file berdasarkan fieldAccept
          if (fieldAccept) {
            const acceptedExts = fieldAccept.split(',').map(ext => ext.trim().toLowerCase());
            const fileExt = result.name ? result.name.split('.').pop().toLowerCase() : '';
            const fileType = result.type || '';
            
            let isValid = false;
            if (fileExt && acceptedExts.some(ext => ext.replace('.', '') === fileExt)) {
              isValid = true;
            } else if (fileType) {
              // Validasi berdasarkan MIME type
              const validTypes = [];
              if (acceptedExts.includes('.jpg') || acceptedExts.includes('.jpeg')) validTypes.push('image/jpeg');
              if (acceptedExts.includes('.png')) validTypes.push('image/png');
              if (acceptedExts.includes('.pdf')) validTypes.push('application/pdf');
              isValid = validTypes.includes(fileType);
            }

            if (!isValid) {
              Alert.alert('Error', `Tipe file tidak didukung. Hanya file ${fieldAccept} yang diizinkan`);
              return;
            }
          }

          handleChange(result);
        }
      } catch (error) {
        Alert.alert('Error', error?.message || 'Gagal memilih file. Silakan coba lagi.');
      }
    };

    // Render berdasarkan type
    switch (field.type?.toLowerCase()) {
      case 'select':
      case 'dropdown':
        // Data select bisa dari field.select.data atau field.options
        const selectData = field.select?.data || field.options || [];
        // Wrapper untuk handleChange agar hanya mengirim value, bukan object
        const handleSelectChange = (selectedKey) => {
          // Cari item dari data berdasarkan key
          const selectedItem = selectData.find(item => 
            (item.key || item.value || item.label) === selectedKey
          );
          // Kirim hanya value, bukan object
          const selectedValue = selectedItem?.value || selectedItem?.key || selectedKey || '';
          handleChange(selectedValue);
        };
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <SelectList
              placeholder={placeholder}
              data={selectData}
              setSelected={handleSelectChange}
              save="key"
              txColor="#999"
              placeholderColor="#999"
            />
            {error ? (
              <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 10, paddingLeft: 2, fontWeight: 'normal' }}>
                {error}
              </Text>
            ) : null}
          </View>
        );

      case 'switch':
      case 'boolean':
      case 'checkbox':
      case 'radio':
        // Jika ada data select, tampilkan sebagai opsi (radio/checkbox)
        const optionData = field.select?.data || field.options || [];
        
        if (optionData.length > 0) {
          // Render sebagai opsi radio atau checkbox
          const isRadio = field.type?.toLowerCase() === 'radio';
          const isCheckbox = field.type?.toLowerCase() === 'checkbox';
          // Switch dengan data = single select (radio behavior)
          // Checkbox dengan data = multiple select
          const isMultiple = isCheckbox || field.select?.type === 'checkbox';
          
          // Untuk checkbox, value bisa array atau string
          const currentValues = isMultiple 
            ? (Array.isArray(value) ? value : value ? [value] : [])
            : value;
          
          return (
            <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
              {optionData.map((option, index) => {
                const optionKey = option.key || option.value || option.label || String(index);
                const optionLabel = option.label || option.value || option.key || '';
                const optionValue = option.value || option.key || option.label || '';
                
                // Cek apakah opsi ini dipilih
                const isSelected = isMultiple
                  ? currentValues.includes(optionValue) || currentValues.includes(optionKey)
                  : currentValues === optionValue || currentValues === optionKey;
                
                return (
                  <TouchableOpacity
                    key={optionKey}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: index < optionData.length - 1 ? 12 : 0,
                      paddingVertical: 8,
                    }}
                    onPress={() => {
                      if (isMultiple) {
                        // Toggle selection untuk checkbox
                        const newValues = Array.isArray(currentValues) ? [...currentValues] : [];
                        const valueIndex = newValues.indexOf(optionValue);
                        const keyIndex = newValues.indexOf(optionKey);
                        
                        if (valueIndex > -1) {
                          newValues.splice(valueIndex, 1);
                        } else if (keyIndex > -1) {
                          newValues.splice(keyIndex, 1);
                        } else {
                          newValues.push(optionValue);
                        }
                        handleChange(newValues);
                      } else {
                        // Set selection untuk radio/switch
                        handleChange(optionValue);
                      }
                    }}
                  >
                    <View
                      style={{
                        width: isRadio ? 20 : 20,
                        height: isRadio ? 20 : 20,
                        borderRadius: isRadio ? 10 : 4,
                        borderWidth: 2,
                        borderColor: isSelected ? '#24bca9' : '#C9D3DB',
                        backgroundColor: isSelected ? (isRadio ? 'transparent' : '#24bca9') : 'transparent',
                        marginRight: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {isSelected && isRadio && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#24bca9',
                          }}
                        />
                      )}
                      {isSelected && !isRadio && (
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 14, color: '#333', flex: 1 }}>{optionLabel}</Text>
                  </TouchableOpacity>
                );
              })}
              {error ? (
                <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 10, paddingLeft: 2, fontWeight: 'normal' }}>
                  {error}
                </Text>
              ) : null}
            </View>
          );
        } else {
          // Jika tidak ada data, gunakan Switch biasa untuk boolean
          return (
            <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
              <Switch
                value={value === true || value === 'true' || value === 1}
                onValueChange={handleChange}
                color="#24bca9"
              />
              {error ? (
                <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 10, paddingLeft: 2, fontWeight: 'normal' }}>
                  {error}
                </Text>
              ) : null}
            </View>
          );
        }

      case 'richtext':
      case 'textarea':
      case 'editor':
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <RichTextEditor
              value={value}
              onChangeText={handleChange}
              placeholder={placeholder}
            />
            {error ? (
              <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 10, paddingLeft: 2, fontWeight: 'normal' }}>
                {error}
              </Text>
            ) : null}
          </View>
        );

      case 'date':
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              value={value}
              onChangeText={handleChange}
              type="Date"
              Material={iconName}
              errors={error}
              txColor="#999"
              colorIcon="#666"
            />
          </View>
        );

      case 'email':
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              value={value}
              onChangeText={handleChange}
              type="Email"
              Material={iconName}
              errors={error}
              txColor="#999"
              colorIcon="#666"
            />
          </View>
        );

      case 'password':
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              value={value}
              onChangeText={handleChange}
              type="Password"
              password={true}
              Material={iconName}
              errors={error}
              txColor="#999"
              colorIcon="#666"
            />
          </View>
        );

      case 'file':
        // File upload dengan validasi
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              type="document"
              Material={iconName}
              selectedFile={value}
              onSelectDocument={handleFileSelect}
              errors={error}
              txColor="#999"
              colorIcon="#666"
            />
            {value && value.name && (
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {value.name} {value.size ? `(${formatFileSize(value.size)})` : ''}
              </Text>
            )}
          </View>
        );

      case 'camera':
        // Camera capture dengan validasi (sama seperti file)
        // Handle camera selection - gunakan pickCamera
        const handleCameraSelect = async () => {
          try {
            let result = null;
            const fieldAccept = field.fieldAccept || '';
            const fileUploadSize = field.fileUploadSize || '5MB';
            const maxSizeBytes = this.parseFileSize(fileUploadSize);

            // Gunakan pickCamera untuk mengambil foto
            result = await pickCamera();

            if (result) {
              // Validasi ukuran file
              if (result.size && result.size > maxSizeBytes) {
                Alert.alert('Error', `Ukuran file terlalu besar (maksimal ${fileUploadSize})`);
                return;
              }

              // Validasi tipe file berdasarkan fieldAccept
              if (fieldAccept) {
                const acceptedExts = fieldAccept.split(',').map(ext => ext.trim().toLowerCase());
                const fileExt = result.name ? result.name.split('.').pop().toLowerCase() : '';
                const fileType = result.type || '';
                
                let isValid = false;
                if (fileExt && acceptedExts.some(ext => ext.replace('.', '') === fileExt)) {
                  isValid = true;
                } else if (fileType) {
                  // Validasi berdasarkan MIME type
                  const validTypes = [];
                  if (acceptedExts.includes('.jpg') || acceptedExts.includes('.jpeg')) validTypes.push('image/jpeg');
                  if (acceptedExts.includes('.png')) validTypes.push('image/png');
                  isValid = validTypes.includes(fileType);
                }

                if (!isValid) {
                  Alert.alert('Error', `Tipe file tidak didukung. Hanya file ${fieldAccept} yang diizinkan`);
                  return;
                }
              }

              handleChange(result);
            }
          } catch (error) {
            Alert.alert('Error', error?.message || 'Gagal mengambil foto. Silakan coba lagi.');
          }
        };

        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              type="document"
              Material={iconName}
              selectedFile={value}
              onSelectDocument={handleCameraSelect}
              errors={error}
              txColor="#999"
              colorIcon="#666"
            />
            {value && value.name && (
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {value.name} {value.size ? `(${formatFileSize(value.size)})` : ''}
              </Text>
            )}
          </View>
        );

      case 'search':
        // Search field menggunakan SearchField component untuk autocomplete search
        return (
          <SearchField
            key={fieldKey}
            field={field}
            value={value}
            onChange={handleChange}
            error={error}
            placeholder={placeholder}
            pkgToken={pkgToken}
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );

      case 'number':
      case 'tel':
      case 'url':
      case 'datetime-local':
      case 'time':
      case 'flag':
        // Flag field menggunakan FlagField component untuk cascading dropdown
        return (
          <FlagField
            key={fieldKey}
            field={field}
            value={value}
            onChange={handleChange}
            error={error}
            pkgToken={pkgToken}
            fieldName={fieldKey}
          />
        );

      case 'radio':
      case 'range':
      case 'color':
      case 'currency':
      case 'approval':
      case 'slug':
      case 'keyup':
      case 'tags':
      case 'maps':
      case 'document':
      case 'video':
      case 'hidden':
        // Semua type ini menggunakan Input component dengan type yang sesuai
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              value={value}
              onChangeText={handleChange}
              type={field.type === 'datetime-local' ? 'Date' : field.type.charAt(0).toUpperCase() + field.type.slice(1)}
              Material={iconName}
              errors={error}
              txColor="#999"
              colorIcon="#666"
            />
          </View>
        );

      case 'instansi':
        // Instansi field menggunakan Input component biasa (readonly)
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              value={value}
              onChangeText={handleChange}
              Material={iconName}
              errors={error}
              txColor="#999"
              colorIcon="#666"
              editable={false}
            />
          </View>
        );

      default:
        // Default: text input
        return (
          <View key={fieldKey} style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder={placeholder}
              value={value}
              onChangeText={handleChange}
              Material={iconName}
              errors={error}
              txColor="#999"
              colorIcon="#666"
            />
          </View>
        );
    }
  }

  /**
   * Build form dari processed data
   * @param {Object} processed - Processed data dari DataHelper.getProcessedFields
   * @param {Object} formValues - Object berisi nilai form
   * @param {Function} setFormValues - Function untuk update form values
   * @param {Object} formErrors - Object berisi error form (optional)
   * @param {boolean} isUpdate - Mode update (true) atau insert (false). Default: false
   * @param {string} pkgToken - Token untuk mendapatkan API credentials dari nexaDb (untuk flag field)
   * @returns {React.Component} - React component untuk form
   */
  static buildForm(processed, formValues, setFormValues, formErrors = {}, isUpdate = false, pkgToken = null) {
    if (!processed || !processed.form) {
      return null;
    }

    const { form, column } = processed;
    const fields = [];

    // Iterate berdasarkan urutan column
    column.forEach(colName => {
      const field = form[colName];
      if (field) {
        // Filter berdasarkan mode
        // Insert mode (isUpdate = false): jangan tampilkan field id
        // Update mode (isUpdate = true): jangan tampilkan field id dan field yang hidden
        if (!isUpdate) {
          // Insert mode: skip field id
          if (field.failed === 'id' || field.name === 'id') {
            return;
          }
        } else {
          // Update mode: skip field id dan field yang hidden
          if (field.failed === 'id' || field.name === 'id') {
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

    // Group fields berdasarkan columnWidth untuk Grid
    const groupedFields = [];
    let currentGroup = [];
    let currentColumns = 1;

    fields.forEach((field, index) => {
      const columns = this.parseColumnWidth(field.columnWidth);
      
      // Jika columnWidth berbeda, buat group baru
      if (columns !== currentColumns && currentGroup.length > 0) {
        groupedFields.push({
          columns: currentColumns,
          fields: [...currentGroup]
        });
        currentGroup = [field];
        currentColumns = columns;
      } else if (currentGroup.length >= currentColumns) {
        // Jika group sudah penuh, buat group baru dengan columnWidth yang sama
        groupedFields.push({
          columns: currentColumns,
          fields: [...currentGroup]
        });
        currentGroup = [field];
      } else {
        currentGroup.push(field);
        currentColumns = columns;
      }

      // Jika ini field terakhir, tambahkan group
      if (index === fields.length - 1) {
        groupedFields.push({
          columns: currentColumns,
          fields: currentGroup
        });
      }
    });

    // Render groups dengan Grid
    return (
      <View style={{ width: '100%' }}>
        {groupedFields.map((group, groupIndex) => (
          <View 
            key={groupIndex} 
            style={{ 
              width: '100%',
              marginBottom: groupIndex < groupedFields.length - 1 ? 0 : 0 
            }}
          >
            <Grid
              columns={group.columns}
              spacing={12}
            >
              {group.fields.map(field => 
                this.renderField(field, formValues, setFormValues, formErrors, pkgToken)
              )}
            </Grid>
          </View>
        ))}
      </View>
    );
  }
}

export default FromHelper;
