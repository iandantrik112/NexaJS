import { View, Text, StyleSheet, Network } from "NexaUI";
const Profile = ({ route }) => {
  const params = route.params;
  return (
    <View>
      <Text>{JSON.stringify(params, null, 2)}</Text>
      <Text>Halaman Profil </Text>
    </View>
  );
};
export default Profile;
