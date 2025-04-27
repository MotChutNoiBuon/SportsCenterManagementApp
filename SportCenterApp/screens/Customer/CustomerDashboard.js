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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClasses } from '../../api/classService';
import { logout } from '../../api/authService';
import LessonCard from '../../components/LessonCard';

const CustomerDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recommendedClasses, setRecommendedClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    loadUserData();
    loadClassData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserData(userData);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng:', error);
    }
  };

  const loadClassData = async () => {
    setRefreshing(true);
    try {
      // Gọi API lấy danh sách lớp học
      const classesResponse = await getClasses();
      
      // Trong thực tế, API sẽ trả về dữ liệu thực tế
      // Tạm thời dùng dữ liệu mẫu vì API có thể chưa hoàn thiện
      setUpcomingClasses([
        {
          id: '1',
          title: 'Yoga cơ bản',
          instructor: 'Nguyễn Thị B',
          date: '18/10/2023',
          time: '10:00 AM',
          duration: 60,
          level: 'beginner',
          location: 'Phòng Yoga 1',
          thumbnail: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b',
          status: 'upcoming',
          category: 'yoga',
          spotsAvailable: 5,
          totalSpots: 12,
        },
        {
          id: '2',
          title: 'Zumba nâng cao',
          instructor: 'Trần Văn C',
          date: '19/10/2023',
          time: '5:30 PM',
          duration: 45,
          level: 'advanced',
          location: 'Phòng Đa năng 2',
          thumbnail: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
          status: 'upcoming',
          category: 'zumba',
          spotsAvailable: 3,
          totalSpots: 20,
        },
      ]);
      
      setRecommendedClasses([
        {
          id: '3',
          title: 'Pilates cho người mới',
          instructor: 'Lê Thị D',
          date: '20/10/2023',
          time: '9:00 AM',
          duration: 50,
          level: 'beginner',
          location: 'Phòng Pilates',
          thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
          status: 'upcoming',
          category: 'pilates',
          spotsAvailable: 8,
          totalSpots: 10,
        },
        {
          id: '4',
          title: 'Gym với HLV cá nhân',
          instructor: 'Phạm Văn E',
          date: '21/10/2023',
          time: '2:00 PM',
          duration: 60,
          level: 'intermediate',
          location: 'Phòng Gym',
          thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
          status: 'upcoming',
          category: 'gym',
          spotsAvailable: 1,
          totalSpots: 1,
        },
        {
          id: '5',
          title: 'Boxing cơ bản',
          instructor: 'Hoàng Văn F',
          date: '22/10/2023',
          time: '7:30 PM',
          duration: 75,
          level: 'beginner',
          location: 'Phòng Boxing',
          thumbnail: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed',
          status: 'upcoming',
          category: 'boxing',
          spotsAvailable: 6,
          totalSpots: 12,
        },
      ]);
      
      setCategories([
        { id: 'all', name: 'Tất cả', icon: 'view-list' },
        { id: 'yoga', name: 'Yoga', icon: 'self-improvement' },
        { id: 'zumba', name: 'Zumba', icon: 'music-note' },
        { id: 'pilates', name: 'Pilates', icon: 'fitness-center' },
        { id: 'gym', name: 'Gym', icon: 'sports-handball' },
        { id: 'boxing', name: 'Boxing', icon: 'sports-mma' },
        { id: 'swimming', name: 'Bơi lội', icon: 'pool' },
      ]);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lớp học:', error);
      
      // Xử lý lỗi mạng và hiển thị thông báo phù hợp
      const errorMessage = error.message.includes('Network Error') 
        ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        : 'Không thể tải dữ liệu lớp học. Vui lòng thử lại sau.';
      
      Alert.alert('Lỗi', errorMessage);
      
      // Vẫn hiển thị dữ liệu mẫu trong trường hợp không thể kết nối API
      setUpcomingClasses([]);
      setRecommendedClasses([]);
      setCategories([
        { id: 'all', name: 'Tất cả', icon: 'view-list' },
        { id: 'yoga', name: 'Yoga', icon: 'self-improvement' },
        { id: 'zumba', name: 'Zumba', icon: 'music-note' },
        { id: 'pilates', name: 'Pilates', icon: 'fitness-center' },
        { id: 'gym', name: 'Gym', icon: 'sports-handball' },
        { id: 'boxing', name: 'Boxing', icon: 'sports-mma' },
        { id: 'swimming', name: 'Bơi lội', icon: 'pool' },
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadClassData();
  };

  const handleClassPress = (classItem) => {
    // Navigate to class details screen
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

  return (
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
            <Text style={styles.userName}>{userData ? userData.firstName + ' ' + userData.lastName : 'Khách hàng'}</Text>
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

          {recommendedClasses
            .filter(
              (item) => activeCategory === 'all' || item.category === activeCategory
            )
            .map((item) => (
              <LessonCard
                key={item.id}
                lesson={item}
                onPress={() => handleClassPress(item)}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
});

export default CustomerDashboard; 