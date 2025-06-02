import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../contexts/UserContext';
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import InternalNews from '../Shared/InternalNews';

const Tab = createBottomTabNavigator();

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const currentUser = useContext(MyUserContext);
  const userData = currentUser.payload;

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      const response = await api.get(API_ENDPOINTS.classes, {
        params: {
          student_id: userData.id,
          status: 'active',
          ordering: 'start_time'
        }
      });
      setClasses(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
      if (error.response?.status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetail', { classId: item.id })}
    >
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classTime}>
          {new Date(item.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - 
          {new Date(item.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={styles.participantsContainer}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.participantsText}>
            {item.current_capacity || 0}/{item.max_members || 20}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách lớp học</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptySection}>
            <Ionicons name="calendar-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Bạn chưa đăng ký lớp học nào</Text>
          </View>
        }
      />
    </View>
  );
};

const DashboardContent = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();
  const currentUser = useContext(MyUserContext);
  const userData = currentUser.payload;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      // TODO: Add any necessary API calls here

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      if (error.response?.status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadData();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const getDisplayName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return userData?.username || 'Khách hàng';
  };

  const handleAvatarPress = () => {
    navigation.navigate('Profile', { userData });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{getDisplayName()}</Text>
        </View>
        <View style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{
                uri: userData?.avatar?.trim()
                  ? userData.avatar
                  : 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Classes')}>
          <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="calendar-outline" size={24} color="#2196f3" />
          </View>
          <Text style={styles.navText}>Lớp học</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CoachList')}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="fitness-outline" size={24} color="#9c27b0" />
          </View>
          <Text style={styles.navText}>Huấn luyện viên</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Schedule')}>
          <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="time-outline" size={24} color="#ff9800" />
          </View>
          <Text style={styles.navText}>Lịch của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
            <Ionicons name="log-out-outline" size={24} color="#f44336" />
          </View>
          <Text style={[styles.navText, { color: '#f44336' }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const CustomerDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196f3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardContent}
        options={{
          title: 'Trang chủ',
        }}
      />
      <Tab.Screen 
        name="News" 
        component={InternalNews}
        options={{
          title: 'Tin tức nội bộ',
        }}
      />
    </Tab.Navigator>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  emptySection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CustomerDashboard;