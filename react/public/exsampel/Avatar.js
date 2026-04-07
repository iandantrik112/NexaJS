import { View, StyleSheet, Avatar } from "NexaUI";
const AvatarExample = () => {
  // Sample image URLs

  const userImage =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80";
  return (
    <View style={styles.container}>
      {/* Basic Avatar with URL */}
      <Avatar source={userImage} size={56} />

      {/* Avatar with edit icon */}
      <Avatar
        source={userImage}
        size={80}
        icon="edit-2"
        iconColor="#007AFF"
        onIconPress={() => console.log("Edit pressed")}
      />

      {/* Smaller Avatar with custom styling */}
      <Avatar
        source={userImage}
        size={40}
        style={styles.customAvatar}
        borderWidth={1}
        borderColor="#E0E0E0"
      />

      {/* Avatar with camera icon */}
      <Avatar
        source={userImage}
        size={100}
        icon="camera"
        iconColor="#4CAF50"
        iconSize={16}
        iconPadding={8}
        onIconPress={() => console.log("Camera pressed")}
      />

      {/* Avatar with custom icon position */}
      <Avatar
        source={userImage}
        size={70}
        icon="plus"
        iconColor="#FF6B6B"
        iconBottom={0}
        iconRight={0}
        onIconPress={() => console.log("Plus pressed")}
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
