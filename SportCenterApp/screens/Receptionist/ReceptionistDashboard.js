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

const DashboardContent = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    todayClasses: 0,
    pendingRegistrations: 0,
  });

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
      // TODO: Add API calls to fetch receptionist-specific data
      // For now using mock data
      setStats({
        totalMembers: 150,
        activeMembers: 120,
        todayClasses: 8,
        pendingRegistrations: 5,
      });

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
    return userData?.username || 'Lễ tân';
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

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={24} color="#2196f3" />
          <Text style={styles.statValue}>{stats.totalMembers}</Text>
          <Text style={styles.statLabel}>Tổng thành viên</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="person-outline" size={24} color="#4caf50" />
          <Text style={styles.statValue}>{stats.activeMembers}</Text>
          <Text style={styles.statLabel}>Thành viên hoạt động</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color="#ff9800" />
          <Text style={styles.statValue}>{stats.todayClasses}</Text>
          <Text style={styles.statLabel}>Lớp học hôm nay</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text-outline" size={24} color="#f44336" />
          <Text style={styles.statValue}>{stats.pendingRegistrations}</Text>
          <Text style={styles.statLabel}>Đăng ký chờ duyệt</Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.nav}>
       
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('EditClasses')}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="calendar-outline" size={24} color="#9c27b0" />
          </View>
          <Text style={styles.navText}>Quản lý lớp học</Text>
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

const ReceptionistDashboard = () => {
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  },
  navItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
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
});

export default ReceptionistDashboard;
