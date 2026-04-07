/**
 * DataManager Usage Example
 * 
 * Contoh penggunaan DataManager untuk membuat custom UI
 * User hanya perlu fokus pada pengembangan tampilan UI
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DataManager } from './DataManager';

/**
 * Contoh Custom Data Component
 * User bisa membuat UI sendiri dengan menggunakan DataManager
 */
const CustomDataComponent = ({ pkg, userData }) => {
  const [data, setData] = useState(null);
  const [fields, setFields] = useState([]);
  const [dataInfo, setDataInfo] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Initialize DataManager
  const dataManager = new DataManager({
    pkg: pkg,
    userData: userData,
    limit: 10, // Custom limit
    onDataChange: (result) => {
      // Update state ketika data berubah
      setData(result.data);
      setFields(result.fields);
      setDataInfo(result.dataInfo);
    },
    onFetchingChange: (isFetching) => {
      setFetching(isFetching);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  // Load data saat mount
  useEffect(() => {
    if (pkg?.token) {
      dataManager.fetchData(1);
    }
  }, [pkg?.token]);

  // Handle search
  const handleSearch = () => {
    dataManager.setSearchKeyword(searchKeyword);
    dataManager.search();
  };

  // Handle delete
  const handleDelete = async (itemId) => {
    try {
      const result = await dataManager.deleteItem(itemId);
      if (result.success) {
        console.log('Data deleted successfully');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Render custom UI
  return (
    <View style={styles.container}>
      {/* Custom Search UI */}
      <View style={styles.searchContainer}>
        <input
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search..."
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Data List UI */}
      {fetching ? (
        <Text>Loading...</Text>
      ) : (
        <View>
          {data && data.map((item, index) => (
            <View key={item.id || index} style={styles.itemCard}>
              {/* Custom item rendering */}
              {fields.map((field) => (
                <View key={field.failed}>
                  <Text>{field.label}: {item[field.failed]}</Text>
                </View>
              ))}
              
              {/* Custom actions */}
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Custom Pagination UI */}
      {dataInfo && (
        <View style={styles.pagination}>
          <TouchableOpacity 
            onPress={() => dataManager.setPage(dataInfo.currentPage - 1)}
            disabled={dataInfo.currentPage === 1}
          >
            <Text>Prev</Text>
          </TouchableOpacity>
          
          <Text>
            Page {dataInfo.currentPage} of {dataInfo.totalPages}
          </Text>
          
          <TouchableOpacity 
            onPress={() => dataManager.setPage(dataInfo.currentPage + 1)}
            disabled={dataInfo.currentPage === dataInfo.totalPages}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemCard: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default CustomDataComponent;

/**
 * API Reference:
 * 
 * DataManager Methods:
 * - fetchData(page, searchTerm) - Fetch data dari server
 * - setPage(page) - Set current page
 * - setSearchKeyword(keyword) - Set search keyword
 * - search(keyword) - Search data
 * - clearSearch() - Clear search dan refresh
 * - deleteItem(itemId) - Delete item
 * - refresh() - Refresh current page
 * 
 * DataManager Getters:
 * - getData() - Get raw data array
 * - getFields() - Get fields array
 * - getColumns() - Get columns array
 * - getProcessedForm() - Get processed form
 * - getDataInfo() - Get pagination info
 * - getAccess() - Get access control (update, delete)
 * - getCurrentPage() - Get current page
 * - getSearchKeyword() - Get search keyword
 * - isFetching() - Get fetching state
 * 
 * Callbacks:
 * - onDataChange(data) - Called when data changes
 *   - data.data - Raw data array
 *   - data.fields - Fields array
 *   - data.columns - Columns array
 *   - data.form - Processed form
 *   - data.dataInfo - Pagination info
 *   - data.access - Access control
 * 
 * - onFetchingChange(isFetching) - Called when fetching state changes
 * - onError(error) - Called when error occurs
 */

