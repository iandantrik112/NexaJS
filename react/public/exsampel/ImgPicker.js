import {
  useState,
  useEffect,
  View,
  StyleSheet,
  Avatar,
  ImgPicker,
} from "NexaUI";

const AvatarExample = ({ route }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    // Load saved avatar when component mounts
    const loadImage = async () => {
      try {
        const savedImage = await ImgPicker.loadSavedImage();
        setSelectedImage(savedImage);
      } catch (error) {
        console.error("Error loading avatar:", error);
      }
    };
    loadImage();
  }, []);
  

  const handleImagePick = () => {
    ImgPicker.handleImageSelection(
      (imageUri) => setSelectedImage(imageUri),
      (error) => console.error("Failed to pick image:", error)
    );
  };

  return (
    <View style={styles.container}>
      <Avatar
        source={selectedImage}
        size={130}
        icon="camera"
        iconColor="#4CAF50"
        iconSize={12}
        iconPadding={8}
        onIconPress={handleImagePick}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  customAvatar: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AvatarExample;
