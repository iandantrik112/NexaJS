import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Storage, NexaDBLite } from 'NexaUI';
import { Input } from 'NexaUI';

/**
 * SearchField - Komponen React Native untuk search input dengan autocomplete
 * 
 * @param {Object} props
 * @param {Object} props.field - Field configuration dari processed form
 * @param {string} props.value - Nilai yang dipilih
 * @param {Function} props.onChange - Callback ketika nilai berubah
 * @param {string} props.error - Error message jika ada
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.pkgToken - Token untuk mendapatkan API credentials dari nexaDb
 * @param {Object} props.formValues - Form values untuk target mapping
 * @param {Function} props.setFormValues - Function untuk update form values
 */
export const SearchField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  placeholder, 
  pkgToken,
  formValues = {},
  setFormValues = () => {}
}) => {
  const [searchText, setSearchText] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const searchTimeoutRef = useRef(null);
  const [hiddenValue, setHiddenValue] = useState(null);

  // Update searchText ketika value berubah dari luar
  useEffect(() => {
    if (value !== searchText) {
      setSearchText(value || '');
    }
  }, [value]);

  // Generate cache key untuk search results (berdasarkan query dan searchParams, bukan timestamp)
  const getCacheKey = (query, searchParams) => {
    const searchKey = JSON.stringify({
      query: query.trim().toLowerCase(),
      ...searchParams
    });
    // Hash sederhana untuk key (menggunakan panjang string dan beberapa karakter pertama)
    const hash = searchKey.length.toString(36) + searchKey.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '');
    return `search_${pkgToken}_${hash}`;
  };

  // Load dari cache
  const loadFromCache = async (query, searchParams) => {
    try {
      const cacheStore = `searchCache_${pkgToken}`;
      const cacheKey = getCacheKey(query, searchParams);
      
      // Cari di cache berdasarkan query dan searchParams
      const allCache = await NexaDBLite.getAll(cacheStore);
      if (allCache?.data && Array.isArray(allCache.data)) {
        // Cari cache yang cocok dengan query dan searchParams
        const matchedCache = allCache.data.find(item => {
          try {
            const cachedQuery = item.query?.toLowerCase() === query.trim().toLowerCase();
            const cachedParams = JSON.stringify(item.searchParams) === JSON.stringify(searchParams);
            return cachedQuery && cachedParams;
          } catch (e) {
            return false;
          }
        });
        
        if (matchedCache && matchedCache.data && Array.isArray(matchedCache.data)) {
          // Cek apakah cache masih valid (max 24 jam)
          const cacheAge = Date.now() - (matchedCache.timestamp || 0);
          const maxAge = 24 * 60 * 60 * 1000; // 24 jam
          
          if (cacheAge < maxAge) {
            return matchedCache.data;
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ [NexaSearch] Error loading from cache:', error);
      return null;
    }
  };

  // Save ke cache
  const saveToCache = async (query, searchParams, data) => {
    try {
      const cacheStore = `searchCache_${pkgToken}`;
      const cacheKey = getCacheKey(query, searchParams);
      
      const cacheData = {
        id: cacheKey,
        query: query.trim(),
        searchParams: searchParams,
        data: data,
        timestamp: Date.now(),
        cachedAt: new Date().toISOString()
      };
      
      await NexaDBLite.set(cacheStore, cacheData);
    } catch (error) {
      console.warn('⚠️ [NexaSearch] Error saving to cache:', error);
    }
  };

  // Fetch search results dari API
  const fetchSearchResults = async (query) => {
    if (!pkgToken || !query || query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      
      // Ambil API credentials dari NexaDBLite
      const getData = await NexaDBLite.get("nexaStore", pkgToken);
      
      if (!getData?.api?.authorization || !getData?.api?.endpoind) {
        setLoading(false);
        return;
      }

      // Build search params dari field.search config
      const searchConfig = field.search || {};
      const searchParams = {
        access: searchConfig.access,
        metadata: Number(searchConfig.tabelName),
        field: searchConfig.tabeltext,
        label: searchConfig.tabeltext,
        title: searchConfig.labelvalue || searchConfig.tabeltext,
        value: searchConfig.tabelvalue,
        where: {
          field: searchConfig.wheretext,
          value: searchConfig.wherevalue,
        },
      };

      // Coba load dari cache terlebih dahulu
      const cachedData = await loadFromCache(query, searchParams);
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        setSuggestions(cachedData);
        setShowSuggestions(true);
        setLoading(false);
        return; // Gunakan cache, tidak perlu fetch dari API
      }

      // Fetch data dari endpoint /search
      const api = new Storage({
        credentials: getData.api.authorization
      });
      
      // POST ke /search endpoint dengan searchParams dan query
      const dataform = await api.post(getData.api.endpoind + '/search', {
        ...searchParams,
        query: query.trim()
      });
      const data = dataform?.data || dataform || [];

      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
        
        // Save ke cache setelah berhasil fetch
        await saveToCache(query, searchParams, data);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
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
          const searchConfig = field.search || {};
          const searchParams = {
            access: searchConfig.access,
            metadata: Number(searchConfig.tabelName),
            field: searchConfig.tabeltext,
            label: searchConfig.tabeltext,
            title: searchConfig.labelvalue || searchConfig.tabeltext,
            value: searchConfig.tabelvalue,
            where: {
              field: searchConfig.wheretext,
              value: searchConfig.wherevalue,
            },
          };
          
          const cachedData = await loadFromCache(query, searchParams);
          if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
            setSuggestions(cachedData);
            setShowSuggestions(true);
            setLoading(false);
            return; // Gunakan cache
          }
        } catch (cacheError) {
          console.warn('⚠️ [NexaSearch] Error loading from cache on network error:', cacheError);
        }
      }
      
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle text change dengan debounce
  const handleTextChange = (text) => {
    setSearchText(text);
    setShowSuggestions(false);
    setSuggestions([]);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (text && text.trim() !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSearchResults(text);
      }, 300); // 300ms debounce
    } else {
      // Clear value jika input kosong
      if (onChange) {
        onChange('');
      }
      if (field.search?.hiddenvalue && setFormValues) {
        setFormValues(prev => ({
          ...prev,
          [field.search.hiddenvalue]: null
        }));
      }
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (item) => {
    const displayValue = item.label || item.value || item.data || '';
    const actualValue = item.value || item.key || item.label || '';
    const itemId = item.id;

    setSearchText(displayValue);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedData(item);

    // Update main field value
    if (onChange) {
      onChange(actualValue);
    }

    // Set hidden value jika ada
    if (field.search?.hiddenvalue && itemId) {
      setHiddenValue(itemId);
      if (setFormValues) {
        setFormValues(prev => ({
          ...prev,
          [field.search.hiddenvalue]: itemId
        }));
      }
    }

    // Handle target mapping jika ada
    if (field.target && formValues) {
      const targetMapping = field.target?.add || {};
      
      if (Object.keys(targetMapping).length > 0 && setFormValues) {
        const updates = {};
        Object.keys(targetMapping).forEach(fieldCondition => {
          const variableName = targetMapping[fieldCondition];
          if (item[variableName] !== undefined) {
            updates[fieldCondition] = item[variableName];
          }
        });

        if (Object.keys(updates).length > 0) {
          setFormValues(prev => ({
            ...prev,
            ...updates
          }));
        }
      }
    }
  };

  // Render suggestion item (tidak menggunakan FlatList untuk avoid nested VirtualizedList)
  const renderSuggestionItem = (item, index) => (
    <TouchableOpacity
      key={`suggestion-${item.id || item.value || index}`}
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.suggestionLabel}>
        {item.label || item.value || item.data || ''}
      </Text>
      {item.title && (
        <Text style={styles.suggestionTitle}>{item.title}</Text>
      )}
    </TouchableOpacity>
  );

  // Get icon berdasarkan type
  const iconName = "magnify"; // Icon untuk search

  return (
    <View style={styles.container}>
      <Input
        placeholder={placeholder}
        value={searchText}
        onChangeText={handleTextChange}
        Material={iconName}
        errors={error}
        txColor="#999"
        colorIcon="#666"
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#24bca9" />
        </View>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {suggestions.map((item, index) => renderSuggestionItem(item, index))}
          </ScrollView>
        </View>
      )}

      {showSuggestions && suggestions.length === 0 && !loading && searchText.trim() !== '' && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada hasil ditemukan</Text>
        </View>
      )}

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 50,
    right: 15,
    zIndex: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 10,
    color: '#666',
  },
  emptyContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 10,
    marginTop: 4,
    marginBottom: 10,
    paddingLeft: 2,
    fontWeight: 'normal',
  },
});

export default SearchField;

