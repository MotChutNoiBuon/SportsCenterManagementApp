import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { API_BASE_URL, OAUTH2_CONFIG } from './apiConfig';

const RegisterClass = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const API_BASE_URL = 'http://your-backend-url/api'; // Thay bằng URL backend của bạn

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem danh sách lớp học.');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/classes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClasses(response.data.results || response.data); // Xử lý dữ liệu phân trang
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lớp học:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRegisterClass = async (classId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để đăng ký lớp học.');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/enrollments/`,
        {
          gym_class: classId,
          status: 'pending',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Thành công', 'Đăng ký lớp học thành công! Đang chờ phê duyệt.');
    } catch (error) {
      console.error('Lỗi khi đăng ký lớp học:', error);
      Alert.alert('Lỗi', 'Không thể đăng ký lớp học. Vui lòng thử lại.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const renderClassItem = ({ item }) => (
    <View style={styles.classCard}>
      <View style={styles.classHeader}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={[styles.classStatus, item.status === 'active' ? styles.activeStatus : styles.inactiveStatus]}>
          {item.status === 'active' ? 'Đang mở' : item.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành'}
        </Text>
      </View>
      <Text style={styles.classDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.classDetails}>
        <View style={styles.detailRow}>
          <Icon name="schedule" size={20} color="#666" />
          <Text style={styles.detailText}>
            {format(new Date(item.schedule), 'dd/MM/yyyy HH:mm')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="person" size={20} color="#666" />
          <Text style={styles.detailText}>
            HLV: {item.trainer ? item.trainer.username : 'Chưa xác định'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="group" size={20} color="#666" />
          <Text style={styles.detailText}>Tối đa: {item.max_members} thành viên</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="attach-money" size={20} color="#666" />
          <Text style={styles.detailText}>{item.price} VND</Text>
        </View>
      </View>
      {item.status === 'active' && (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => handleRegisterClass(item.id)}
        >
          <Text style={styles.registerButtonText}>Đăng ký</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải danh sách lớp học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách lớp học</Text>
      </View>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy lớp học nào</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  classStatus: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#E6F9E8',
    color: '#4CAF50',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  classDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  classDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});

export default RegisterClass;