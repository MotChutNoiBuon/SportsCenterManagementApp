// ProfileScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ProfileScreen = ({ route }) => {
  const { userData } = route.params;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: userData?.avatar || 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{userData?.first_name + ' ' + userData?.last_name || 'Không rõ tên'}</Text>
      <Text style={styles.email}>Email: {userData?.email || 'Không rõ email'}</Text>
      <Text style={styles.email}>Số điện thoại: {userData?.phone || 'Không rõ số điện thoại'}</Text>


    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: 'gray',
  },
});
