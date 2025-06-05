import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
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
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentDetails = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState('');
  const [className, setClassName] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { studentId, studentData: initialStudentData, enrollmentId, status: initialStatus, gym_class: classId } = route.params;
  const currentUser = useContext(MyUserContext);

  useEffect(() => {
    if (initialStudentData) {
      setStudentData(initialStudentData);
      setEnrollmentStatus(initialStatus);
      if (classId) {
        loadClassName(classId);
      }
    } else {
      loadStudentData();
    }
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      const response = await api.get(`${API_ENDPOINTS.members}/${studentId}`);
      setStudentData(response.data);
    } catch (error) {
      console.error('Error loading student data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin học viên');
    } finally {
      setLoading(false);
    }
  };

  const loadClassName = async (classId) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const api = authApis(token);
      const response = await api.get(`${API_ENDPOINTS.classes}${classId}`);
      setClassName(response.data.name);
    } catch (error) {
      console.error('Error loading class name:', error);
      setClassName('Không tìm thấy tên lớp');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      await api.patch(`${API_ENDPOINTS.enrollments}/${enrollmentId}`, {
        status: newStatus
      });

      setEnrollmentStatus(newStatus);
      Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (initialStudentData) {
      setStudentData(initialStudentData);
      setEnrollmentStatus(initialStatus);
      if (classId) {
        await loadClassName(classId);
      }
    } else {
      await loadStudentData();
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!studentData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin học viên</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: studentData.avatar
                ? `https://res.cloudinary.com/dfgnoyf71/${studentData.avatar}`
                : `https://i.pravatar.cc/150?img=${studentData.id}`
            }}
            style={styles.studentAvatar}
          />
          <Text style={styles.name}>
            {studentData.first_name} {studentData.last_name}
          </Text>
          <Text style={styles.username}>@{studentData.username}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{studentData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{studentData.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {studentData.role === 'member' ? 'Học viên' : studentData.role}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Lớp học: {className}</Text>
          </View>
        </View>

        {enrollmentStatus && (
          <View style={styles.enrollmentSection}>
            <Text style={styles.sectionTitle}>Trạng thái đăng ký</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(enrollmentStatus) }]}>
              <Text style={styles.statusText}>{getStatusText(enrollmentStatus)}</Text>
            </View>

            {enrollmentStatus === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleUpdateStatus('approved')}
                >
                  <Text style={styles.actionButtonText}>Duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleUpdateStatus('rejected')}
                >
                  <Text style={styles.actionButtonText}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  studentAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  enrollmentSection: {
    backgroundColor: 'white',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default StudentDetails; 