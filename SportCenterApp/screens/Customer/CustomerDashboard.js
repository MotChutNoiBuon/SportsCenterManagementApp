import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../contexts/UserContext';

// Trong component


const CustomerDashboard = () => {
  const navigation = useNavigation();
  const currentUser = useContext(MyUserContext);
  const userData = currentUser._j;
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };
  const getDisplayName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return userData?.username || 'Khách hàng';
  };

  const handleAvatarPress = () => {
    navigation.navigate('Profile', { userData }); // userData là current user
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{getDisplayName()}</Text>
        </View>
        <View style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{
                uri: userData?.avatar?.trim()
                  ? userData.avatar
                  : 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>


        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('RegisterClass')}>
          <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="calendar-outline" size={24} color="#2196f3" />
          </View>
          <Text style={styles.navText}>Lớp học</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CoachList')}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="fitness-outline" size={24} color="#9c27b0" />
          </View>
          <Text style={styles.navText}>Huấn luyện viên</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Schedule')}>
          <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="time-outline" size={24} color="#ff9800" />
          </View>
          <Text style={styles.navText}>Lịch của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
          <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
            <Ionicons name="trending-up-outline" size={24} color="#4caf50" />
          </View>
          <Text style={styles.navText}>Tiến độ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
            <Ionicons name="log-out-outline" size={24} color="#f44336" />
          </View>
          <Text style={styles.navText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Available Classes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lớp học sắp tới</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.emptySection}>
        <Ionicons name="calendar-outline" size={50} color="#ccc" />
        <Text style={styles.emptyText}>Bạn chưa đăng ký lớp học nào</Text>
        <TouchableOpacity style={styles.findClassButton} onPress={() => navigation.navigate('RegisterClass')}>
          <Text style={styles.findClassText}>Tìm lớp học</Text>
        </TouchableOpacity>
      </View>

      {/* Suggestions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gợi ý dành cho bạn</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Suggestions')}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.emptySection}>
        <Ionicons name="search-outline" size={50} color="#ccc" />
        <Text style={styles.emptyText}>Không tìm thấy lớp học phù hợp</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    color: '#2196f3',
    fontSize: 14,
  },
  emptySection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  findClassButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  findClassText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


export default CustomerDashboard;