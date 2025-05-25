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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    alignItems: 'center',
    width: '20%', // 5 nút trên một hàng
    marginBottom: 16,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
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

export default CustomerDashboard;