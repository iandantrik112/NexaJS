import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontFamily, properti } from 'NexaUI';
import { PaginationHelper } from './pagination';

/**
 * PaginationComponent - Reusable pagination component
 * 
 * Komponen pagination yang siap pakai tanpa perlu konfigurasi banyak
 * 
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total pages
 * @param {number} totalCount - Total data count (optional)
 * @param {number} count - Current page data count (optional)
 * @param {Function} onPageChange - Callback when page changes
 * @param {boolean} isCompact - Compact mode (default: false)
 * @param {number} limit - Items per page (default: 5)
 */
const PaginationComponent = ({ 
  currentPage, 
  totalPages, 
  totalCount = 0,
  count = 0,
  onPageChange, 
  isCompact = false,
  limit = 5
}) => {
  const [assetColor, setAssetColor] = useState({
    color: '#009688',
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

  const paginationInfo = PaginationHelper.getPaginationInfo(currentPage, totalPages, limit);
  const pageNumbers = PaginationHelper.getPageNumbers(currentPage, totalPages, 3);
  
  const containerStyle = isCompact ? styles.paginationCompact : styles.pagination;
  const infoStyle = isCompact ? styles.paginationInfoCompact : styles.paginationInfo;
  const infoTextStyle = isCompact ? styles.paginationInfoTextCompact : styles.paginationInfoText;
  const buttonStyle = isCompact ? styles.paginationButtonCompact : styles.paginationButton;
  const buttonTextStyle = isCompact ? styles.paginationButtonTextCompact : styles.paginationButtonText;

  return (
    <View style={containerStyle}>
      <View style={infoStyle}>
        <Text style={infoTextStyle}>
          Halaman <Text style={[styles.paginationInfoBold, { color: assetColor.color || assetColor.buttonColor || '#009688' }]}>{currentPage}</Text> dari <Text style={[styles.paginationInfoBold, { color: assetColor.color || assetColor.buttonColor || '#009688' }]}>{totalPages}</Text>
          {!isCompact && totalCount > 0 && (
            <Text> ({count} dari {totalCount} data)</Text>
          )}
        </Text>
      </View>
      
      <View style={styles.paginationButtons}>
        {/* First Button */}
        <TouchableOpacity
          onPress={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={[
            buttonStyle,
            styles.paginationButtonNav,
            currentPage === 1 && styles.paginationButtonDisabled
          ]}>
          <Text style={[
            buttonTextStyle,
            currentPage === 1 && styles.paginationButtonTextDisabled
          ]}>
            First
          </Text>
        </TouchableOpacity>

        {/* Previous Button */}
        <TouchableOpacity
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!paginationInfo.hasPrev}
          style={[
            buttonStyle,
            styles.paginationButtonNav,
            !paginationInfo.hasPrev && styles.paginationButtonDisabled
          ]}>
          <Text style={[
            buttonTextStyle,
            !paginationInfo.hasPrev && styles.paginationButtonTextDisabled
          ]}>
            Prev
          </Text>
        </TouchableOpacity>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => {
          return (
            <TouchableOpacity
              key={pageNum}
              onPress={() => onPageChange(pageNum)}
              style={[
                buttonStyle,
                pageNum === currentPage && [
                  styles.paginationButtonActive,
                  { 
                    backgroundColor: assetColor.buttonColor || assetColor.color || '#009688',
                    borderColor: assetColor.buttonColor || assetColor.color || '#009688'
                  }
                ]
              ]}>
              <Text style={[
                buttonTextStyle,
                pageNum === currentPage && [
                  styles.paginationButtonTextActive,
                  { color: assetColor.buttonTextColor || '#fff' }
                ]
              ]}>
                {pageNum}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Next Button */}
        <TouchableOpacity
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!paginationInfo.hasNext}
          style={[
            buttonStyle,
            styles.paginationButtonNav,
            !paginationInfo.hasNext && styles.paginationButtonDisabled
          ]}>
          <Text style={[
            buttonTextStyle,
            !paginationInfo.hasNext && styles.paginationButtonTextDisabled
          ]}>
            Next
          </Text>
        </TouchableOpacity>

        {/* Last Button */}
        <TouchableOpacity
          onPress={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={[
            buttonStyle,
            styles.paginationButtonNav,
            currentPage === totalPages && styles.paginationButtonDisabled
          ]}>
          <Text style={[
            buttonTextStyle,
            currentPage === totalPages && styles.paginationButtonTextDisabled
          ]}>
            Last
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    alignItems: 'center',
  },
  paginationCompact: {
    alignItems: 'center',
  },
  paginationInfo: {
    marginBottom: 8,
  },
  paginationInfoCompact: {
    marginBottom: 6,
  },
  paginationInfoText: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    color: '#666',
    textAlign: 'center',
  },
  paginationInfoTextCompact: {
    fontSize: 10,
    fontFamily: FontFamily.regular,
    color: '#666',
    textAlign: 'center',
  },
  paginationInfoBold: {
    fontFamily: FontFamily.semiBold,
    // color akan di-set secara dinamis dengan assetColor
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  paginationButton: {
    minWidth: 28,
    height: 28,
    marginHorizontal: 2,
    marginVertical: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonCompact: {
    minWidth: 24,
    height: 24,
    marginHorizontal: 2,
    marginVertical: 2,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonNav: {
    minWidth: 40,
    paddingHorizontal: 8,
  },
  paginationButtonActive: {
    // backgroundColor dan borderColor akan di-set secara dinamis dengan assetColor
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    color: '#666',
    paddingHorizontal: 2,
  },
  paginationButtonTextCompact: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    color: '#666',
    paddingHorizontal: 2,
  },
  paginationButtonTextActive: {
    color: '#fff',
    fontFamily: FontFamily.semiBold,
  },
  paginationButtonTextDisabled: {
    color: '#ccc',
  },
});

export default PaginationComponent;

