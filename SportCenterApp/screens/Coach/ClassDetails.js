import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MyUserContext } from '../../contexts/UserContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../api/apiConfig';

const ClassDetails = () => {
  const [classDetails, setClassDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { classId } = route.params;
  const currentUser = useContext(MyUserContext);

  useEffect(() => {
    loadClassDetails();
  }, []);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) return null;
  
      const response = await axios.post(`${BASE_URL}token/refresh/`, {
        refresh: refreshToken,
      });
  
      if (response.data.access) {
        await AsyncStorage.setItem('access_token', response.data.access);
        return response.data.access;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi refresh token:', error);
      return null;
    }
  };
  
  const loadClassDetails = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      console.log('Token:', token);
  
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }
  
      console.log('Gọi API lấy chi tiết lớp học:', `classes/${classId}/`);
      const response = await axios.get(`${BASE_URL}classes/${classId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
  
      console.log('Kết quả API:', response.data);
      setClassDetails(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết lớp học:', error);
      console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
  
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Gọi lại sau khi refresh thành công
          return loadClassDetails();
        } else {
          Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          navigation.navigate('Login');
        }
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadClassDetails();
    setRefreshing(false);
  };
  
  

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Đang tải thông tin lớp học...</Text>
      </View>
    );
  }

  if (!classDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin lớp học</Text>
      </View>
    );
  }

  const startDateTime = formatDateTime(classDetails.start_time);
  const endDateTime = formatDateTime(classDetails.end_time);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết lớp học</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.className}>{classDetails.name}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian bắt đầu:</Text>
              <Text style={styles.infoValue}>
                {startDateTime.date} - {startDateTime.time}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian kết thúc:</Text>
              <Text style={styles.infoValue}>
                {endDateTime.date} - {endDateTime.time}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số học viên:</Text>
              <Text style={styles.infoValue}>
                {classDetails.current_students || 0}/{classDetails.max_students || '∞'}
              </Text>
            </View>
          </View>

          {classDetails.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa điểm:</Text>
                <Text style={styles.infoValue}>{classDetails.location}</Text>
              </View>
            </View>
          )}

          {classDetails.description && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mô tả:</Text>
                <Text style={styles.infoValue}>{classDetails.description}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: classDetails.status === 'active' ? '#4CAF50' : '#F44336' },
                ]}
              >
                {classDetails.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.studentsButton}
          onPress={() => navigation.navigate('ClassStudents', { classId: classDetails.id })}
        >
          <Text style={styles.studentsButtonText}>Xem danh sách học viên</Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  section: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#666', textAlign: 'center' },
  studentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  studentsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default ClassDetails;
