import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../components/CustomButton';
import { getClassDetails, enrollClass } from '../../api/classService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClassDetails = ({ route, navigation }) => {
  const { classId } = route.params;
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const data = await getClassDetails(classId);
      setClassData(data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin lớp học:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!classData || enrolling) return;
    setEnrolling(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để đăng ký lớp học');
        return;
      }

      const result = await enrollClass(classData.id);
      console.log('Kết quả đăng ký:', result);

      if (result.status === 'already_enrolled') {
        Alert.alert('Thông báo', result.message);
      } else if (result.status === 'success') {
        Alert.alert('Thành công', 'Đăng ký lớp học thành công!');
        loadClassData(); // Reload thông tin lớp học
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải thông tin lớp học...</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin lớp học</Text>
      </View>
    );
  }

  // Lấy tên huấn luyện viên
  let trainerName = '';
  if (classData.trainer) {
    trainerName = classData.trainer.full_name || classData.trainer.username || '';
  }

  // Định dạng ngày giờ
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{classData.name}</Text>
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Huấn luyện viên: {trainerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="event" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Bắt đầu: {formatDateTime(classData.start_time)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="event-available" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Kết thúc: {formatDateTime(classData.end_time)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="people" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Số thành viên tối đa: {classData.max_members}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="info" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Trạng thái: {classData.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="attach-money" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Giá: {Number(classData.price).toLocaleString()} đ</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{classData.description}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <CustomButton
          title={enrolling ? 'Đang đăng ký...' : 'Đăng ký'}
          onPress={handleEnroll}
          loading={enrolling}
          disabled={enrolling || classData.status !== 'active'}
          type="primary"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    color: '#666',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: 'white',
  },
});

export default ClassDetails;