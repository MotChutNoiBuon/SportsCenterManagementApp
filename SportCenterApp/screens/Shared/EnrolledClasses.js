import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEnrollments, cancelEnrollment } from '../../api/classService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EnrolledClasses = ({ navigation }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getEnrollments();
      setEnrollments(data.results || data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đăng ký:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học đã đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (enrollmentId) => {
    if (cancelling) return;
    
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy đăng ký lớp học này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đồng ý',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelEnrollment(enrollmentId);
              Alert.alert('Thành công', 'Hủy đăng ký thành công');
              loadEnrollments(); // Reload danh sách
            } catch (error) {
              console.error('Lỗi khi hủy đăng ký:', error);
              Alert.alert('Lỗi', 'Không thể hủy đăng ký. Vui lòng thử lại sau.');
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  const renderEnrollmentItem = ({ item }) => (
    <View style={styles.enrollmentItem}>
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.gym_class?.name || 'N/A'}</Text>
        <Text style={styles.classDetails}>
          Huấn luyện viên: {item.gym_class?.trainer?.full_name || 'N/A'}
        </Text>
        <Text style={styles.classDetails}>
          Thời gian: {new Date(item.gym_class?.start_time).toLocaleString()}
        </Text>
        <Text style={styles.classDetails}>
          Trạng thái: {item.gym_class?.status || 'N/A'}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.viewButton]}
          onPress={() => navigation.navigate('ClassDetails', { classId: item.gym_class?.id })}
        >
          <Text style={styles.buttonText}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => handleCancel(item.id)}
          disabled={cancelling}
        >
          <Text style={styles.buttonText}>
            {cancelling ? 'Đang xử lý...' : 'Hủy đăng ký'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lớp học đã đăng ký</Text>
        <TouchableOpacity onPress={loadEnrollments}>
          <Ionicons name="refresh-outline" size={24} color="#2196f3" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : enrollments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa đăng ký lớp học nào</Text>
        </View>
      ) : (
        <FlatList
          data={enrollments}
          renderItem={renderEnrollmentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  enrollmentItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  classInfo: {
    marginBottom: 10,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  classDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#2196f3',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default EnrolledClasses; 