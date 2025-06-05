// ProfileScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = ({ route }) => {
  const { userData } = route.params;
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              // Xóa token và thông tin đăng nhập
              await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'isLoggedIn']);
              // Chuyển về màn hình đăng nhập
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  const getFullName = () => {
    if (userData?.full_name) return userData.full_name;
    if (userData?.first_name || userData?.last_name) {
      return `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    }
    return userData?.username || 'Không rõ tên';
  };

  const renderInfoItem = (icon, label, value) => {
    if (!value) return null;
    return (
      <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
          <Ionicons name={icon} size={24} color="#4A90E2" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: userData?.avatar || 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{getFullName()}</Text>
        <Text style={styles.role}>
          {userData?.role === 'trainer' ? 'Huấn luyện viên' : 
           userData?.role === 'member' ? 'Học viên' : 
           userData?.role === 'receptionist' ? 'Lễ tân' : 
           userData?.role === 'admin' ? 'Quản trị viên' : 'Không rõ vai trò'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        {renderInfoItem('mail-outline', 'Email', userData?.email)}
        {renderInfoItem('call-outline', 'Số điện thoại', userData?.phone)}
        {renderInfoItem('calendar-outline', 'Ngày tham gia', userData?.date_joined ? new Date(userData.date_joined).toLocaleDateString() : null)}
        {renderInfoItem('location-outline', 'Địa chỉ', userData?.address)}
        {renderInfoItem('briefcase-outline', 'Chuyên môn', userData?.specialization)}
        {renderInfoItem('school-outline', 'Bằng cấp', userData?.qualification)}
        {renderInfoItem('person-outline', 'Vai trò', 
          userData?.role === 'trainer' ? 'Huấn luyện viên' : 
          userData?.role === 'member' ? 'Học viên' : 
          userData?.role === 'receptionist' ? 'Lễ tân' : 
          userData?.role === 'admin' ? 'Quản trị viên' : 'Không rõ vai trò'
        )}
      </View>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile', { userData })}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 10,
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});