import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClasses, getUpcomingClasses, getRecommendedClasses } from '../../api/classService';
import { getUserProfile } from '../../api/userService';
import { logout } from '../../api/authService';
import LessonCard from '../../components/LessonCard';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#F44336" />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Vui lòng thử lại sau'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Retry mechanism
const loadDataWithRetry = async (fetchFn, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fetchFn();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
};

const CustomerDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recommendedClasses, setRecommendedClasses] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'Tất cả', icon: 'view-list' },
  ]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUserData(),
        loadClassData()
      ]);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu ban đầu:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const profileData = await loadDataWithRetry(() => getUserProfile());
      setUserData(profileData);
      
      // Update categories based on available class types
      const classTypes = await loadDataWithRetry(() => getClasses());
      const uniqueCategories = [...new Set(classTypes.map(cls => cls.category))];
      const categoryIcons = {
        'yoga': 'self-improvement',
        'gym': 'sports-handball',
        'dance': 'sports-mma',
        'swimming': 'pool',
        'boxing': 'sports-kabaddi',
        'pilates': 'fitness-center',
        'zumba': 'music-note',
        'crossfit': 'fitness-center',
      };
      
      const newCategories = [
        { id: 'all', name: 'Tất cả', icon: 'view-list' },
        ...uniqueCategories.map(category => ({
          id: category.toLowerCase(),
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: categoryIcons[category.toLowerCase()] || 'fitness-center'
        }))
      ];
      
      setCategories(newCategories);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng:', error);
      throw error; // Let the error boundary handle it
    }
  };

  const loadClassData = async () => {
    setRefreshing(true);
    try {
      const [upcomingData, recommendedData] = await Promise.all([
        loadDataWithRetry(() => getUpcomingClasses()),
        loadDataWithRetry(() => getRecommendedClasses())
      ]);
      
      setUpcomingClasses(upcomingData);
      setRecommendedClasses(recommendedData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lớp học:', error);
      throw error; // Let the error boundary handle it
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadClassData();
  };

  const handleClassPress = (classItem) => {
    navigation.navigate('ClassDetails', { classId: classItem.id });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        activeCategory === item.id && styles.activeCategoryItem,
      ]}
      onPress={() => setActiveCategory(item.id)}
    >
      <Icon
        name={item.icon}
        size={24}
        color={activeCategory === item.id ? '#4A90E2' : '#666'}
      />
      <Text
        style={[
          styles.categoryText,
          activeCategory === item.id && styles.activeCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const filteredRecommendedClasses = recommendedClasses.filter(
    (item) => activeCategory === 'all' || item.category.toLowerCase() === activeCategory
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Xin chào,</Text>
              <Text style={styles.userName}>
                {userData ? `${userData.firstName} ${userData.lastName}` : 'Khách hàng'}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Icon name="notifications" size={24} color="#333" />
              </TouchableOpacity>
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
          </View>

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ClassList')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F3FF' }]}>
                <Icon name="event" size={24} color="#4A90E2" />
              </View>
              <Text style={styles.actionText}>Lớp học</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('MySchedule')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF2E3' }]}>
                <Icon name="schedule" size={24} color="#FF9500" />
              </View>
              <Text style={styles.actionText}>Lịch của tôi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Progress')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E6F9E8' }]}>
                <Icon name="trending-up" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Tiến độ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                <Icon name="logout" size={24} color="#F44336" />
              </View>
              <Text style={styles.actionText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          {/* Upcoming classes */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lớp học sắp tới</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyClasses')}>
                <Text style={styles.seeAllButton}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((item) => (
                <LessonCard
                  key={item.id}
                  lesson={item}
                  onPress={() => handleClassPress(item)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="event-busy" size={50} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Bạn chưa đăng ký lớp học nào
                </Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => navigation.navigate('ClassList')}
                >
                  <Text style={styles.bookButtonText}>Tìm lớp học</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Recommended classes */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gợi ý dành cho bạn</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClassList')}>
                <Text style={styles.seeAllButton}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {filteredRecommendedClasses.length > 0 ? (
              filteredRecommendedClasses.map((item) => (
                <LessonCard
                  key={item.id}
                  lesson={item}
                  onPress={() => handleClassPress(item)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={50} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Không tìm thấy lớp học phù hợp
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
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
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 12,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCategoryItem: {
    backgroundColor: '#EBF5FF',
    borderColor: '#4A90E2',
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  activeCategoryText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomerDashboard; 