import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelEnrollment } from '../../api/classService';

const ITEMS_PER_PAGE = 10;

const EnrolledClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const navigation = useNavigation();


  
  const fetchEnrolledClasses = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }
  
      const api = authApis(token);
  
      // 🔐 Lấy ID của người dùng hiện tại
      const userRes = await api.get(API_ENDPOINTS['current-user']);
      const userId = userRes.data.id;
  
      console.log('🔍 Fetching enrollments for user:', userId);
      const response = await api.get(API_ENDPOINTS.enrollments, {
        params: {
          member: userId,
          page: pageNum,
          page_size: ITEMS_PER_PAGE
        }
      });
  
      const newEnrollments = response.data.results || response.data;
      console.log('📦 Raw API response:', response.data);
      console.log('📦 Enrollments data:', newEnrollments);
  
      if (shouldRefresh) {
        setClasses(newEnrollments);
      } else {
        setClasses(prev => [...prev, ...newEnrollments]);
      }
  
      setHasMore(newEnrollments.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('❌ Error fetching enrolled classes:', error);
      if (error.response?.status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách lớp học đã đăng ký. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
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
              fetchEnrolledClasses(1, true); // Reload danh sách
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
  

  useEffect(() => {
    fetchEnrolledClasses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchEnrolledClasses(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEnrolledClasses(nextPage);
    }
  };

  const renderClassItem = ({ item }) => {
    console.log('🔍 Rendering item:', item);
    
    // Kiểm tra nếu item hoặc class_detail là undefined
    if (!item || !item.class_detail) {
      console.log('❌ Invalid item data:', item);
      return null;
    }

    const gymClass = item.class_detail;
    
    return (
      <TouchableOpacity
        style={styles.classCard}
        onPress={() => navigation.navigate('ClassDetails', { classId: gymClass.id })}
      >
        <View style={styles.classInfo}>
          <Text style={styles.className}>{gymClass.name || 'Không có tên'}</Text>
          <Text style={styles.classTime}>
            {gymClass.start_time ? new Date(gymClass.start_time).toLocaleString('vi-VN') : 'N/A'} - 
            {gymClass.end_time ? new Date(gymClass.end_time).toLocaleString('vi-VN') : 'N/A'}
          </Text>
          <Text style={styles.classPrice}>
            {gymClass.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gymClass.price) : 'N/A'}
          </Text>
          <View style={styles.participantsContainer}>
            <Text style={styles.participantsText}>
              {gymClass.current_capacity || 0}/{gymClass.max_members || 20} học viên
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: gymClass.status === 'active' ? '#4CAF50' : '#FFA000' }]}>
              {gymClass.status === 'active' ? 'Đang diễn ra' : 'Sắp diễn ra'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => handleCancel(item.id)}
            disabled={cancelling}
          >
            <Text style={styles.buttonText}>
              {cancelling ? 'Đang xử lý...' : 'Hủy đăng ký'}
            </Text>
          </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn chưa đăng ký lớp học nào</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  classCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  classPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },

});

export default EnrolledClasses; 