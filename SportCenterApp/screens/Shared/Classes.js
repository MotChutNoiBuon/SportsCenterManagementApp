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

const ITEMS_PER_PAGE = 10;

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();

  const fetchClasses = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      const response = await api.get(API_ENDPOINTS.classes, {
        params: {
          page: pageNum,
          page_size: ITEMS_PER_PAGE,
          status: 'active'
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const newClasses = response.data.results || response.data;
      
      if (shouldRefresh) {
        setClasses(newClasses);
      } else {
        setClasses(prev => [...prev, ...newClasses]);
      }

      // Kiểm tra xem còn dữ liệu để load không
      setHasMore(newClasses.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching classes:', error);
      if (error.response?.status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchClasses(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchClasses(nextPage);
    }
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetails', { classId: item.id })}
    >
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classTime}>
          {new Date(item.start_time).toLocaleString('vi-VN')} - {new Date(item.end_time).toLocaleString('vi-VN')}
        </Text>
        <Text style={styles.classPrice}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
        </Text>
        <View style={styles.participantsContainer}>
          <Text style={styles.participantsText}>
            {item.current_capacity || 0}/{item.max_members || 20} học viên
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      <TouchableOpacity 
        style={styles.enrolledButton}
        onPress={() => navigation.navigate('EnrolledClasses')}
      >
        <Text style={styles.enrolledButtonText}>Lớp học đã đăng ký</Text>
      </TouchableOpacity>
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
              <Text style={styles.emptyText}>Không có lớp học nào</Text>
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
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
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
  enrolledButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrolledButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Classes; 