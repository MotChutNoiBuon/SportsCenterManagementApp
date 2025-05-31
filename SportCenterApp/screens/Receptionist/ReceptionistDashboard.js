import React, { useState, useEffect, useContext } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MyUserContext } from '../../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReceptionistDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalClasses: 0,
    todayClasses: 0,
  });
  const [todayClasses, setTodayClasses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const navigation = useNavigation();
  const user = useContext(MyUserContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setStats({
        totalMembers: 156,
        activeMembers: 124,
        totalClasses: 45,
        todayClasses: 8,
      });
      
      setTodayClasses([
        {
          id: '1',
          title: 'Yoga cơ bản',
          time: '10:00 AM - 11:00 AM',
          instructor: 'Nguyễn Thị B',
          participants: 8,
          maxParticipants: 12,
        },
        {
          id: '2',
          title: 'Zumba',
          time: '5:30 PM - 6:30 PM',
          instructor: 'Trần Văn C',
          participants: 18,
          maxParticipants: 20,
        },
      ]);
      
      setNotifications([
        {
          id: '1',
          title: 'Đăng ký mới',
          message: 'Có 5 học viên mới đăng ký cần xác nhận',
          time: '10 phút trước',
          read: false,
        },
        {
          id: '2',
          title: 'Lớp học hôm nay',
          message: 'Có 8 lớp học cần kiểm tra điểm danh',
          time: '1 giờ trước',
          read: true,
        },
      ]);
      
      setRefreshing(false);
    }, 1500);
  };

  const onRefresh = () => {
    loadData();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetails', { classId: item.id })}
    >
      <View style={styles.classInfo}>
        <Text style={styles.classTitle}>{item.title}</Text>
        <View style={styles.classDetail}>
          <Ionicons name="time-outline" size={16} color="#666" style={styles.classInfoIcon} />
          <Text style={styles.classInfoText}>{item.time}</Text>
        </View>
        <View style={styles.classDetail}>
          <Ionicons name="person-outline" size={16} color="#666" style={styles.classInfoIcon} />
          <Text style={styles.classInfoText}>{item.instructor}</Text>
        </View>
        <View style={styles.participantsContainer}>
          <Text style={styles.participantsText}>
            {item.participants}/{item.maxParticipants} học viên
          </Text>
          <View style={styles.participantsBar}>
            <View 
              style={[
                styles.participantsFill,
                { width: `${(item.participants / item.maxParticipants) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.notificationRead : styles.notificationUnread]}
      onPress={() => {
        navigation.navigate('NotificationDetails', { notificationId: item.id });
      }}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
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
            <Text style={styles.userName}>{user?.full_name || 'Nhân viên lễ tân'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile', { userData: user })}
          >
            <Image
              source={{
                uri: user?.avatar?.trim()
                  ? user.avatar
                  : 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Thành viên</Text>
              <Ionicons name="people-outline" size={20} color="#4A90E2" />
            </View>
            <Text style={styles.statValue}>{stats.totalMembers}</Text>
            <Text style={styles.statSubtitle}>{stats.activeMembers} thành viên hoạt động</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Lớp học</Text>
              <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{stats.todayClasses}</Text>
            <Text style={styles.statSubtitle}>Lớp học hôm nay</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Members')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F3FF' }]}>
              <Ionicons name="people-outline" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.actionText}>Thành viên</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Classes')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF5E7' }]}>
              <Ionicons name="calendar-outline" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Lớp học</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Attendance')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F5FFE8' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#8BC34A" />
            </View>
            <Text style={styles.actionText}>Điểm danh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLogout}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFE8E8' }]}>
              <Ionicons name="log-out-outline" size={24} color="#FF5252" />
            </View>
            <Text style={styles.actionText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Classes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lớp học hôm nay</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
              <Text style={styles.viewAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={todayClasses}
            renderItem={renderClassItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>

        {/* Notifications */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông báo</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.viewAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
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
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  horizontalListContent: {
    paddingHorizontal: 12,
  },
  classCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  classDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classInfoIcon: {
    marginRight: 6,
  },
  classInfoText: {
    fontSize: 13,
    color: '#666',
  },
  participantsContainer: {
    marginTop: 10,
  },
  participantsText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  participantsBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
  },
  participantsFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  notificationRead: {
    opacity: 0.8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
});

export default ReceptionistDashboard; 