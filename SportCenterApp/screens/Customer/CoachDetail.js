import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';

const CoachDetail = ({ route, navigation }) => {
  const { coach } = route.params;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    fetchCoachClasses();
  }, []);

  const fetchCoachClasses = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      
      console.log('Fetching classes for trainer:', coach.id);
      console.log('API URL:', `${API_ENDPOINTS.classes}?trainer_id=${coach.id}&status=active`);
      
      const response = await api.get(API_ENDPOINTS.classes, {
        params: {
          trainer_id: coach.id,
          status: 'active'
        }
      });
      
      console.log('API Response:', response.data);
      setClasses(response.data.results || response.data);
      setLoadingClasses(false);
    } catch (error) {
      console.error('Error fetching coach classes:', error.response?.data || error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setLoadingClasses(false);
    }
  };

  const getSpecializationText = (specialization) => {
    const specializations = {
      'gym': 'Gym',
      'yoga': 'Yoga',
      'swimming': 'Bơi lội',
      'dance': 'Nhảy',
    };
    return specializations[specialization] || specialization;
  };

  const handleContact = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      
      const response = await api.post(API_ENDPOINTS.appointments, {
        trainer: coach.id,
        date_time: new Date().toISOString(),
      });

      if (response.status === 201) {
        Alert.alert(
          'Thành công',
          'Yêu cầu tư vấn đã được gửi. Huấn luyện viên sẽ liên hệ với bạn sớm nhất.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error creating appointment:', error.response?.data || error);
      Alert.alert(
        'Lỗi',
        'Không thể gửi yêu cầu tư vấn. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: coach.avatar || 'https://via.placeholder.com/200' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{coach.full_name || coach.username}</Text>
        <View style={styles.specializationContainer}>
          <Ionicons name="fitness-outline" size={20} color="#666" />
          <Text style={styles.specialization}>{getSpecializationText(coach.specialization)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={24} color="#666" />
          <Text style={styles.infoText}>{coach.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={24} color="#666" />
          <Text style={styles.infoText}>{coach.phone || 'Chưa cập nhật'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={24} color="#666" />
          <Text style={styles.infoText}>{coach.experience_years || 0} năm kinh nghiệm</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lớp học đang dạy</Text>
        {loadingClasses ? (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />
        ) : classes.length > 0 ? (
          classes.map((classItem) => (
            <TouchableOpacity 
              key={classItem.id} 
              style={styles.classItem}
              onPress={() => navigation.navigate('ClassDetails', { classId: classItem.id })}
            >
              <Ionicons name="fitness-outline" size={24} color="#666" />
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classItem.name}</Text>
                <Text style={styles.classTime}>
                  {formatDateTime(classItem.start_time)} - {formatDateTime(classItem.end_time)}
                </Text>
                <Text style={styles.classPrice}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(classItem.price)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>Chưa có lớp học nào</Text>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.contactButton, loading && styles.contactButtonDisabled]}
        onPress={handleContact}
        disabled={loading}
      >
        <Text style={styles.contactButtonText}>
          {loading ? 'Đang gửi yêu cầu...' : 'Liên hệ tư vấn'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  specializationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialization: {
    marginLeft: 4,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  classInfo: {
    marginLeft: 12,
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  classPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  noData: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonDisabled: {
    backgroundColor: '#ccc',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CoachDetail; 