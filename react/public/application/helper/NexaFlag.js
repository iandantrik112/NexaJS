import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SelectList, Grid, NexaDBLite, Storage } from 'NexaUI';

/**
 * FlagField - Komponen React Native untuk menampilkan cascading dropdown
 * Kabupaten -> Kecamatan -> Desa
 * 
 * @param {Object} props
 * @param {Object} props.field - Field configuration dari processed form
 * @param {string|Object} props.value - Nilai yang dipilih (bisa string nama desa atau object lengkap)
 * @param {Function} props.onChange - Callback ketika nilai berubah
 * @param {string} props.error - Error message jika ada
 * @param {string} props.pkgToken - Token untuk mendapatkan API credentials dari nexaDb
 * @param {string} props.fieldName - Nama field (untuk menentukan apakah hanya Kabupaten+Kecamatan atau lengkap)
 */
export const FlagField = ({ field, value, onChange, error, pkgToken, fieldName }) => {
  const [wilayahData, setWilayahData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk dropdown values
  const [selectedKabupaten, setSelectedKabupaten] = useState(null);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);
  const [selectedDesa, setSelectedDesa] = useState(null);
  
  // State untuk dropdown options
  const [kabupatenList, setKabupatenList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [desaList, setDesaList] = useState([]);

  // Update kecamatan options berdasarkan kabupaten yang dipilih
  const updateKecamatanOptions = (kabupaten, data = null) => {
    // Gunakan data yang di-pass atau wilayahData state
    const dataSource = data || wilayahData;
    
    if (!kabupaten || !dataSource || dataSource.length === 0) {
      setKecamatanList([]);
      setDesaList([]);
      setSelectedKecamatan(null);
      setSelectedDesa(null);
      return;
    }
    
    const filteredKecamatan = [
      ...new Set(
        dataSource
          .filter(item => item.nm_kab === kabupaten)
          .map(item => item.nm_kec)
      )
    ].filter(Boolean);

    setKecamatanList(filteredKecamatan.map(kec => ({ key: kec, value: kec })));
    
    // Reset desa jika kecamatan berubah
    if (selectedKecamatan && !filteredKecamatan.includes(selectedKecamatan)) {
      setDesaList([]);
      setSelectedDesa(null);
    }
  };

  // Update desa options berdasarkan kecamatan yang dipilih
  const updateDesaOptions = (kecamatan, data = null) => {
    // Gunakan data yang di-pass atau wilayahData state
    const dataSource = data || wilayahData;
    
    if (!kecamatan || !dataSource || dataSource.length === 0) {
      setDesaList([]);
      setSelectedDesa(null);
      return;
    }
    
    const filteredDesa = [
      ...new Set(
        dataSource
          .filter(item => item.nm_kec === kecamatan)
          .map(item => item.nama)
      )
    ].filter(Boolean);

    setDesaList(filteredDesa.map(desa => ({ key: desa, value: desa })));
  };

  // Load flag data dari cache
  const loadFlagFromCache = async (pkgToken) => {
    try {
      const cacheStore = `flagCache_${pkgToken}`;
      const cacheKey = `flag_${pkgToken}`;
      
      const cachedData = await NexaDBLite.get(cacheStore, cacheKey);
      
      if (cachedData && cachedData.data && Array.isArray(cachedData.data)) {
        // Cek apakah cache masih valid (max 7 hari untuk data flag)
        const cacheAge = Date.now() - (cachedData.timestamp || 0);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 hari
        
        if (cacheAge < maxAge) {
          return cachedData.data;
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ [NexaFlag] Error loading from cache:', error);
      return null;
    }
  };

  // Save flag data ke cache
  const saveFlagToCache = async (pkgToken, data) => {
    try {
      const cacheStore = `flagCache_${pkgToken}`;
      const cacheKey = `flag_${pkgToken}`;
      
      const cacheData = {
        id: cacheKey,
        data: data,
        timestamp: Date.now(),
        cachedAt: new Date().toISOString()
      };
      
      await NexaDBLite.set(cacheStore, cacheData);
    } catch (error) {
      console.warn('⚠️ [NexaFlag] Error saving to cache:', error);
    }
  };

  // Fetch data wilayah dari API
  useEffect(() => {
    const fetchWilayahData = async () => {
      if (!pkgToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Coba load dari cache terlebih dahulu
        const cachedData = await loadFlagFromCache(pkgToken);
        if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
          setWilayahData(cachedData);
          
          // Generate unique kabupaten list
          const uniqueKabupaten = [...new Set(cachedData.map(item => item.nm_kab))].filter(Boolean);
          setKabupatenList(uniqueKabupaten.map(kab => ({ key: kab, value: kab })));

          // Set initial values jika ada value yang sudah dipilih
          if (value) {
            let selectedData = null;
            
            if (typeof value === 'string') {
              if (value !== 'Select Kabupaten' && value !== 'Select Kecamatan' && value !== 'Select Desa') {
                selectedData = cachedData.find(item => item.nama?.toLowerCase() === value.toLowerCase());
              }
            } else if (typeof value === 'object' && value !== null) {
              selectedData = value;
            }

            if (selectedData) {
              setSelectedKabupaten(selectedData.nm_kab);
              setSelectedKecamatan(selectedData.nm_kec);
              setSelectedDesa(selectedData.nama);
              
              updateKecamatanOptions(selectedData.nm_kab, cachedData);
              if (fieldName !== 'kecamatan') {
                updateDesaOptions(selectedData.nm_kec, cachedData);
              }
            }
          }
          
          setLoading(false);
          return; // Gunakan cache, tidak perlu fetch dari API
        }
        
        // Ambil API credentials dari NexaDBLite
        const getData = await NexaDBLite.get("nexaStore", pkgToken);
        
        if (!getData?.api?.authorization || !getData?.api?.endpoind) {
          Alert.alert('Error', 'API configuration not found');
          setLoading(false);
          return;
        }

        // Fetch data flag dari API
        const api = new Storage({
          credentials: getData.api.authorization
        });
        
        // Fetch data flag dari endpoint khusus
        const dataform = await api.get(getData.api.endpoind + '/flag');
        
        const data = dataform?.data || dataform || [];
        
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('Flag data is empty or not an array');
          setLoading(false);
          return;
        }
        
        setWilayahData(data);

        // Generate unique kabupaten list
        const uniqueKabupaten = [...new Set(data.map(item => item.nm_kab))].filter(Boolean);
        setKabupatenList(uniqueKabupaten.map(kab => ({ key: kab, value: kab })));

        // Set initial values jika ada value yang sudah dipilih
        if (value) {
          let selectedData = null;
          
          if (typeof value === 'string') {
            // Jika value adalah string (nama desa), cari data lengkapnya
            if (value !== 'Select Kabupaten' && value !== 'Select Kecamatan' && value !== 'Select Desa') {
              selectedData = data.find(item => item.nama?.toLowerCase() === value.toLowerCase());
            }
          } else if (typeof value === 'object' && value !== null) {
            // Jika value adalah object, gunakan langsung
            selectedData = value;
          }

          if (selectedData) {
            setSelectedKabupaten(selectedData.nm_kab);
            setSelectedKecamatan(selectedData.nm_kec);
            setSelectedDesa(selectedData.nama);
            
            // Update options berdasarkan selected values
            updateKecamatanOptions(selectedData.nm_kab, data);
            if (fieldName !== 'kecamatan') {
              updateDesaOptions(selectedData.nm_kec, data);
            }
          }
        }
        
        // Save ke cache setelah berhasil fetch
        await saveFlagToCache(pkgToken, data);
      } catch (error) {
        // Jika network error, coba load dari cache
        const errorMessage = error?.message || '';
        const isNetworkError = errorMessage.includes('network') || 
                              errorMessage.includes('timeout') || 
                              errorMessage.includes('CORS') ||
                              errorMessage.includes('Failed to fetch') ||
                              errorMessage.includes('Network request failed');
        
        if (isNetworkError) {
          // Coba load dari cache sebagai fallback
          try {
            const cachedData = await loadFlagFromCache(pkgToken);
            if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
              setWilayahData(cachedData);
              
              // Generate unique kabupaten list
              const uniqueKabupaten = [...new Set(cachedData.map(item => item.nm_kab))].filter(Boolean);
              setKabupatenList(uniqueKabupaten.map(kab => ({ key: kab, value: kab })));

              // Set initial values jika ada value yang sudah dipilih
              if (value) {
                let selectedData = null;
                
                if (typeof value === 'string') {
                  if (value !== 'Select Kabupaten' && value !== 'Select Kecamatan' && value !== 'Select Desa') {
                    selectedData = cachedData.find(item => item.nama?.toLowerCase() === value.toLowerCase());
                  }
                } else if (typeof value === 'object' && value !== null) {
                  selectedData = value;
                }

                if (selectedData) {
                  setSelectedKabupaten(selectedData.nm_kab);
                  setSelectedKecamatan(selectedData.nm_kec);
                  setSelectedDesa(selectedData.nama);
                  
                  updateKecamatanOptions(selectedData.nm_kab, cachedData);
                  if (fieldName !== 'kecamatan') {
                    updateDesaOptions(selectedData.nm_kec, cachedData);
                  }
                }
              }
              
              setLoading(false);
              return; // Gunakan cache
            }
          } catch (cacheError) {
            console.warn('⚠️ [NexaFlag] Error loading from cache on network error:', cacheError);
          }
        }
        
        console.error('Error fetching wilayah data:', error);
        Alert.alert('Error', 'Gagal memuat data wilayah');
      } finally {
        setLoading(false);
      }
    };

    fetchWilayahData();
  }, [pkgToken]);

  // Handle kabupaten change
  const handleKabupatenChange = (kabupaten) => {
    setSelectedKabupaten(kabupaten);
    setSelectedKecamatan(null);
    setSelectedDesa(null);
    updateKecamatanOptions(kabupaten);
    
    // Trigger onChange dengan null karena belum lengkap
    if (onChange) {
      onChange(null);
    }
  };

  // Handle kecamatan change
  const handleKecamatanChange = (kecamatan) => {
    setSelectedKecamatan(kecamatan);
    setSelectedDesa(null);
    updateDesaOptions(kecamatan);
    
    if (fieldName === 'kecamatan') {
      // Jika fieldName adalah 'kecamatan', hanya kirim nama kecamatan (string)
      if (onChange) {
        onChange(kecamatan);
      }
    } else {
      // Jika belum lengkap, kirim null
      if (onChange) {
        onChange(null);
      }
    }
  };

  // Handle desa change
  const handleDesaChange = (desa) => {
    setSelectedDesa(desa);
    
    // Hanya kirim nama desa (string), bukan object lengkap
    if (onChange) {
      onChange(desa);
    }
  };

  if (loading) {
    return (
      <View style={{ width: '100%', marginBottom: 16 }}>
        <Text>Loading data wilayah...</Text>
      </View>
    );
  }

  // Cek columnWidth untuk menentukan layout
  const columnWidth = field?.columnWidth || '';
  const isFullWidth = columnWidth === 'nx-col-12';

  // Render berdasarkan fieldName
  if (fieldName === 'kecamatan') {
    // Hanya tampilkan Kabupaten dan Kecamatan
    if (isFullWidth) {
      // Full width: setiap SelectList 100%
      return (
        <View style={styles.container}>
          <View>
            <SelectList
              placeholder="Select Kabupaten"
              data={kabupatenList}
              setSelected={(val) => handleKabupatenChange(val)}
              save="key"
              defaultOption={selectedKabupaten ? { key: selectedKabupaten, value: selectedKabupaten } : null}
              txColor="#999"
              placeholderColor="#999"
            />
          </View>
          <View style={{ marginTop: -8 }}>
            <SelectList
              placeholder="Select Kecamatan"
              data={kecamatanList}
              setSelected={(val) => handleKecamatanChange(val)}
              save="key"
              defaultOption={selectedKecamatan ? { key: selectedKecamatan, value: selectedKecamatan } : null}
              txColor="#999"
              placeholderColor="#999"
            />
          </View>
          {error ? (
            <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 16, paddingLeft: 2, fontWeight: 'normal' }}>
              {error}
            </Text>
          ) : null}
        </View>
      );
    } else {
      // Grid layout: 2 kolom
      return (
        <View style={styles.container}>
          <Grid columns={2} spacing={12}>
            <SelectList
              placeholder="Select Kabupaten"
              data={kabupatenList}
              setSelected={(val) => handleKabupatenChange(val)}
              save="key"
              defaultOption={selectedKabupaten ? { key: selectedKabupaten, value: selectedKabupaten } : null}
              txColor="#999"
              placeholderColor="#999"
            />
            <SelectList
              placeholder="Select Kecamatan"
              data={kecamatanList}
              setSelected={(val) => handleKecamatanChange(val)}
              save="key"
              defaultOption={selectedKecamatan ? { key: selectedKecamatan, value: selectedKecamatan } : null}
              txColor="#999"
              placeholderColor="#999"
            />
          </Grid>
          {error ? (
            <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 16, paddingLeft: 2, fontWeight: 'normal' }}>
              {error}
            </Text>
          ) : null}
        </View>
      );
    }
  } else {
    // Tampilkan Kabupaten, Kecamatan, dan Desa
    if (isFullWidth) {
      // Full width: setiap SelectList 100%
      return (
        <View style={styles.container}>
          <View>
            <SelectList
              placeholder="Select Kabupaten"
              data={kabupatenList}
              setSelected={(val) => handleKabupatenChange(val)}
              save="key"
              defaultOption={selectedKabupaten ? { key: selectedKabupaten, value: selectedKabupaten } : null}
              txColor="#999"
              placeholderColor="#999"
            />
          </View>
          <View style={{ marginTop: 8 }}>
            <SelectList
              placeholder="Select Kecamatan"
              data={kecamatanList}
              setSelected={(val) => handleKecamatanChange(val)}
              save="key"
              defaultOption={selectedKecamatan ? { key: selectedKecamatan, value: selectedKecamatan } : null}
              txColor="#999"
              placeholderColor="#999"
            />
          </View>
          <View style={{ marginTop: 8 }}>
            <SelectList
              placeholder="Select Desa"
              data={desaList}
              setSelected={(val) => handleDesaChange(val)}
              save="key"
              defaultOption={selectedDesa ? { key: selectedDesa, value: selectedDesa } : null}
              txColor="#999"
              placeholderColor="#999"
            />
          </View>
          {error ? (
            <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 16, paddingLeft: 2, fontWeight: 'normal' }}>
              {error}
            </Text>
          ) : null}
        </View>
      );
    } else {
      // Grid layout: 3 kolom
      return (
        <View style={styles.container}>
          <Grid columns={3} spacing={12}>
            <SelectList
              placeholder="Select Kabupaten"
              data={kabupatenList}
              setSelected={(val) => handleKabupatenChange(val)}
              save="key"
              defaultOption={selectedKabupaten ? { key: selectedKabupaten, value: selectedKabupaten } : null}
              txColor="#999"
              placeholderColor="#999"
            />
            <SelectList
              placeholder="Select Kecamatan"
              data={kecamatanList}
              setSelected={(val) => handleKecamatanChange(val)}
              save="key"
              defaultOption={selectedKecamatan ? { key: selectedKecamatan, value: selectedKecamatan } : null}
              txColor="#999"
              placeholderColor="#999"
            />
            <SelectList
              placeholder="Select Desa"
              data={desaList}
              setSelected={(val) => handleDesaChange(val)}
              save="key"
              defaultOption={selectedDesa ? { key: selectedDesa, value: selectedDesa } : null}
              txColor="#999"
              placeholderColor="#999"
            />
          </Grid>
          {error ? (
            <Text style={{ color: 'red', fontSize: 10, marginTop: 4, marginBottom: 10, paddingLeft: 2, fontWeight: 'normal' }}>
              {error}
            </Text>
          ) : null}
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
});

export default FlagField;
