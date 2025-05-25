<<<<<<< HEAD
// src/screens/Customer/CustomerDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from './apiConfig';

const CustomerDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/current-user/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const actions = [
    {
      name: 'Lớp học',
      icon: 'event',
      color: '#4A90E2',
      backgroundColor: '#E8F3FF',
      navigateTo: 'RegisterClass',
    },
    {
      name: 'Lịch',
      icon: 'schedule',
      color: '#FF9500',
      backgroundColor: '#FFF2E3',
      navigateTo: 'MySchedule',
    },
    {
      name: 'Tiến độ',
      icon: 'trending-up',
      color: '#4CAF50',
      backgroundColor: '#E6F9E8',
      navigateTo: 'Progress',
    },
    {
      name: 'Current Profile',
      icon: 'person',
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
      navigateTo: 'Profile',
    },
    {
      name: 'Đăng xuất',
      icon: 'logout',
      color: '#F44336',
      backgroundColor: '#FFEBEE',
      onPress: handleLogout,
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>
            {userData ? `${userData.first_name} ${userData.last_name}` : 'Khách hàng'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image
            source={{ uri: userData?.avatar || 'https://i.pravatar.cc/300' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={action.onPress || (() => navigation.navigate(action.navigateTo))}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.backgroundColor }]}>
              <Icon name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.actionText}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
=======
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
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Classes')}>
          <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="calendar-outline" size={24} color="#2196f3" />
          </View>
          <Text style={styles.navText}>Lớp học</Text>
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
        <TouchableOpacity style={styles.findClassButton} onPress={() => navigation.navigate('Classes')}>
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
>>>>>>> 2adc9d57c2ca1d23c3a175553d4da9a833ca7ec1
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
<<<<<<< HEAD
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
=======
    marginBottom: 20,
>>>>>>> 2adc9d57c2ca1d23c3a175553d4da9a833ca7ec1
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
<<<<<<< HEAD
  actionsContainer: {
=======
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nav: {
>>>>>>> 2adc9d57c2ca1d23c3a175553d4da9a833ca7ec1
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
<<<<<<< HEAD
    padding: 16,
=======
    marginBottom: 20,
>>>>>>> 2adc9d57c2ca1d23c3a175553d4da9a833ca7ec1
  },
  navItem: {
    alignItems: 'center',
    width: '20%', // 5 nút trên một hàng
    marginBottom: 16,
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
<<<<<<< HEAD
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

=======
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


>>>>>>> 2adc9d57c2ca1d23c3a175553d4da9a833ca7ec1
export default CustomerDashboard;