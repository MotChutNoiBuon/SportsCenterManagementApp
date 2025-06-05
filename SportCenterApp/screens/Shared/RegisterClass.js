
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { getClasses, enrollClass } from '../../api/classService';

const RegisterClass = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      const data = await getClasses(pageNum);
      
      if (pageNum === 1) {
        setClasses(data.results || []);
      } else {
        setClasses(prev => [...prev, ...(data.results || [])]);
      }
      
      setHasMore(!!data.next);
      setPage(pageNum);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadClasses(1);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadClasses(page + 1);
    }
  };

  const handleEnroll = async (classId) => {
    if (enrolling) return;
    setEnrolling(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để đăng ký lớp học');
        return;
      }

      console.log('Bắt đầu đăng ký lớp học với ID:', classId);
      const result = await enrollClass(classId);
      console.log('Kết quả đăng ký:', result);

      if (result.status === 'already_enrolled') {
        Alert.alert('Thông báo', result.message);
      } else if (result.status === 'success') {
        Alert.alert('Thành công', 'Đăng ký lớp học thành công!');
        onRefresh(); // Reload danh sách lớp học
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra khi đăng ký lớp học');
    } finally {
      setEnrolling(false);
    }
  };

  const renderClassItem = ({ item }) => (
    <View style={styles.classItem}>
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classDetails}>
          Huấn luyện viên: {item.trainer?.full_name || 'N/A'}
        </Text>
        <Text style={styles.classDetails}>
          Thời gian: {new Date(item.start_time).toLocaleString()}
        </Text>
        <Text style={styles.classDetails}>
          Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
        </Text>
        <Text style={styles.classDetails}>
          Trạng thái: {item.status || 'N/A'}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.viewButton]}
          onPress={() => navigation.navigate('ClassDetails', { classId: item.id })}
        >
          <Text style={styles.buttonText}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.registerButton]}
          onPress={() => handleEnroll(item.id)}
          disabled={enrolling || !item || item.status !== 'active'}
        >
          <Text style={styles.buttonText}>
            {enrolling ? 'Đang đăng ký...' : 'Đăng ký'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2196f3" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.enrolledButton}
            onPress={() => navigation.navigate('EnrolledClasses')}
          >
            <Ionicons name="list" size={24} color="#2196f3" />
            <Text style={styles.enrolledButtonText}>Lớp đã đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={24} color="#2196f3" />
          </TouchableOpacity>
        </View>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Không có lớp học nào</Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          renderItem={renderClassItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196f3']}
            />
          }
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  enrolledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  enrolledButtonText: {
    color: '#2196f3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  classItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  registerButton: {
    backgroundColor: '#4caf50',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
    marginLeft: 10,
  },
});

export default RegisterClass;