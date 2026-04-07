import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import Icon from '../../../package/Icon';
import Server from '../../../package/config';
import ImageViewerModal from '../../../package/Modal/ImageViewer';

/**
 * React Native version of fileType function
 * Returns a React Native component based on file type
 * 
 * @param {string} filePath - Path to the file
 * @param {Object} options - Options object
 * @param {Function} options.onImagePress - Callback when image is pressed (optional, jika tidak ada akan menggunakan modal internal)
 * @param {Function} options.onFilePress - Callback when file is pressed
 * @param {number} options.size - Size of icon/image (default: 30)
 * @param {boolean} options.useInternalModal - Use internal modal for images (default: true if onImagePress not provided)
 * @returns {React.Component|null} - React Native component or null
 */
export function FileTypeComponent({ 
  filePath, 
  onImagePress,
  onFilePress,
  size = 30,
  useInternalModal = true
}) {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  // Safety checks for input parameters
  if (!filePath || typeof filePath !== "string") {
    return null;
  }

  try {
    // Extract filename and extension from path
    const fileName = filePath.split("/").pop();
    const hasExtension = fileName.includes(".");
    const extension = hasExtension
      ? fileName.split(".").pop().toLowerCase()
      : "";

    // File type to icon mapping (menggunakan MaterialCommunityIcons untuk dukungan yang lebih baik)
    // MaterialCommunityIcons memiliki icon file office yang lebih lengkap
    const fileIcons = {
      // Images
      jpg: { type: "Material", name: "file-image" },
      jpeg: { type: "Material", name: "file-image" },
      png: { type: "Material", name: "file-image" },
      gif: { type: "Material", name: "file-image" },
      webp: { type: "Material", name: "file-image" },
      bmp: { type: "Material", name: "file-image" },
      svg: { type: "Material", name: "file-image" },

      // Documents - menggunakan MaterialCommunityIcons yang memiliki icon office lengkap
      pdf: { type: "Material", name: "file-pdf-box" },
      doc: { type: "Material", name: "file-word-box" },
      docx: { type: "Material", name: "file-word-box" },
      xls: { type: "Material", name: "file-excel-box" },
      xlsx: { type: "Material", name: "file-excel-box" },
      ppt: { type: "Material", name: "file-powerpoint-box" },
      pptx: { type: "Material", name: "file-powerpoint-box" },
      txt: { type: "Material", name: "file-document" },
      rtf: { type: "Material", name: "file-document" },

      // Data & Config
      xml: { type: "Material", name: "file-code" },
      yaml: { type: "Material", name: "file-code" },
      yml: { type: "Material", name: "file-code" },
      json: { type: "Material", name: "file-code" },
      csv: { type: "Material", name: "file-delimited" },

      // Archives
      zip: { type: "Material", name: "folder-zip" },
      rar: { type: "Material", name: "folder-zip" },
      "7z": { type: "Material", name: "folder-zip" },
      tar: { type: "Material", name: "folder-zip" },
      gz: { type: "Material", name: "folder-zip" },

      // Audio
      mp3: { type: "Material", name: "file-music" },
      wav: { type: "Material", name: "file-music" },
      flac: { type: "Material", name: "file-music" },
      aac: { type: "Material", name: "file-music" },
      ogg: { type: "Material", name: "file-music" },

      // Video
      mp4: { type: "Material", name: "file-video" },
      avi: { type: "Material", name: "file-video" },
      mov: { type: "Material", name: "file-video" },
      wmv: { type: "Material", name: "file-video" },
      flv: { type: "Material", name: "file-video" },
      mkv: { type: "Material", name: "file-video" },
      webm: { type: "Material", name: "file-video" },
    };

    // Color mapping for file types
    const fileColors = {
      // Images
      jpg: "#4CAF50",
      jpeg: "#4CAF50",
      png: "#4CAF50",
      gif: "#4CAF50",
      webp: "#4CAF50",
      bmp: "#4CAF50",
      svg: "#4CAF50",

      // Documents
      pdf: "#F44336",
      doc: "#2196F3",
      docx: "#2196F3",
      xls: "#4CAF50",
      xlsx: "#4CAF50",
      ppt: "#FF9800",
      pptx: "#FF9800",
      txt: "#9E9E9E",
      rtf: "#9E9E9E",

      // Data & Config
      xml: "#FF5722",
      yaml: "#FF5722",
      yml: "#FF5722",
      json: "#FFC107",
      csv: "#4CAF50",

      // Archives
      zip: "#795548",
      rar: "#795548",
      "7z": "#795548",
      tar: "#795548",
      gz: "#795548",

      // Audio
      mp3: "#E91E63",
      wav: "#E91E63",
      flac: "#E91E63",
      aac: "#E91E63",
      ogg: "#E91E63",

      // Video
      mp4: "#9C27B0",
      avi: "#9C27B0",
      mov: "#9C27B0",
      wmv: "#9C27B0",
      flv: "#9C27B0",
      mkv: "#9C27B0",
      webm: "#9C27B0",
    };

    // Get icon and color for this file type
    const iconConfig = hasExtension
      ? (fileIcons[extension] || { type: "Material", name: "file" })
      : { type: "Material", name: "upload" };
    const iconColor = hasExtension
      ? fileColors[extension] || "#666"
      : "#2196F3";

    // Check if it's an image file
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const isImage = imageExtensions.includes(extension);
    const isPDF = extension === "pdf";

    // Build full URL menggunakan FILE_URL dari config
    const fullUrl = filePath.startsWith('http') 
      ? filePath 
      : `${Server.FILE_URL}/${filePath}`;

    // Render berdasarkan type
    if (!hasExtension) {
      // For text without extension, show upload icon (placeholder for file upload)
      return (
        <View style={[styles.container, { height: size, width: size }]}>
          <Icon
            Material="upload"
            size={size * 0.67}
            color={iconColor}
          />
        </View>
      );
    } else if (isImage) {
      // For images, show the actual image preview
      const handleImagePress = () => {
        if (onImagePress) {
          // Jika ada custom handler, gunakan itu
          onImagePress(fullUrl);
        } else if (useInternalModal) {
          // Jika tidak ada custom handler dan useInternalModal true, gunakan modal internal
          setSelectedImageUrl(fullUrl);
          setImageModalVisible(true);
        }
      };

      return (
        <>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleImagePress}
            style={[styles.imageContainer, { height: size, width: size }]}
          >
            <Image
              source={{ uri: fullUrl }}
              style={[styles.image, { height: size, width: size }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
          {/* Internal Image Viewer Modal */}
          {useInternalModal && !onImagePress && imageModalVisible && selectedImageUrl && (
            <ImageViewerModal
              visible={imageModalVisible}
              images={[selectedImageUrl]}
              initialIndex={0}
              onClose={() => {
                setImageModalVisible(false);
                setSelectedImageUrl('');
              }}
            />
          )}
        </>
      );
    } else {
      // For non-images, show icon
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (onFilePress) {
              onFilePress(fileName, fullUrl, isPDF);
            } else {
              if (isPDF) {
                Alert.alert('PDF', `Opening PDF: ${fileName}`);
              } else {
                Alert.alert('File', fileName);
              }
            }
          }}
          style={[styles.iconContainer, { height: size, width: size }]}
        >
          <Icon
            {...(iconConfig.type === "Material" 
              ? { Material: iconConfig.name }
              : { FontAwesome: iconConfig.name }
            )}
            size={size * 0.67}
            color={iconColor}
          />
        </TouchableOpacity>
      );
    }
  } catch (error) {
    // Fallback: show default file icon
    return (
      <View style={[styles.iconContainer, { height: size, width: size }]}>
        <Icon
          Material="file"
          size={size * 0.67}
          color="#2196F3"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 4,
  },
  iconContainer: {
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Export default untuk backward compatibility
export default FileTypeComponent;

// Export juga sebagai named export untuk kemudahan
export { FileTypeComponent as fileType };
