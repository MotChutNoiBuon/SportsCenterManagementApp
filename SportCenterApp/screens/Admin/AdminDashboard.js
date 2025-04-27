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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Polyline, Circle } from 'react-native-svg';

// Simple LineChart component
const LineChart = ({ data, labels, color = '#4A90E2', height = 150 }) => {
  if (!data || data.length < 2) return null;
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  const width = Dimensions.get('window').width - 32;
  const segmentWidth = width / (data.length - 1);
  
  const points = data.map((value, index) => {
    const x = index * segmentWidth;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <View style={{ height, marginVertical: 16 }}>
      {data.map((value, index) => (
        <Text
          key={`label-${index}`}
          style={{
            position: 'absolute',
            left: index * segmentWidth - 15,
            bottom: -20,
            fontSize: 10,
            color: '#999',
            width: 30,
            textAlign: 'center',
          }}
        >
          {labels[index]}
        </Text>
      ))}
      
      <View style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: '#eee',
      }} />
      
      <Svg height={height} width={width}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        {data.map((value, index) => {
          const x = index * segmentWidth;
          const y = height - ((value - minValue) / range) * height;
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
            />
          );
        })}
      </Svg>
    </View>
  );
};

const AdminDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalCoaches: 0,
    totalClasses: 0,
    revenue: 0,
  });
  const [revenueData, setRevenueData] = useState({
    data: [],
    labels: [],
  });
  const [activeClasses, setActiveClasses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Mock data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // In a real app, you would fetch this data from your API or Firebase
    setRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setStats({
        totalMembers: 156,
        activeMembers: 124,
        totalCoaches: 12,
        totalClasses: 45,
        revenue: 45600000,
      });
      
      setRevenueData({
        data: [10500000, 12300000, 9800000, 14200000, 15800000, 18700000, 19800000],
        labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7'],
      });
      
      setActiveClasses([
        {
          id: '1',
          title: 'Yoga cơ bản',
          date: 'Thứ 2, Thứ 4, Thứ 6',
          time: '10:00 AM - 11:00 AM',
          instructor: 'Nguyễn Thị B',
          participants: 8,
          maxParticipants: 12,
        },
        {
          id: '2',
          title: 'Zumba',
          date: 'Thứ 3, Thứ 5',
          time: '5:30 PM - 6:30 PM',
          instructor: 'Trần Văn C',
          participants: 18,
          maxParticipants: 20,
        },
        {
          id: '3',
          title: 'Pilates',
          date: 'Thứ 2, Thứ 5',
          time: '9:00 AM - 10:00 AM',
          instructor: 'Lê Thị D',
          participants: 6,
          maxParticipants: 10,
        },
      ]);
      
      setCoaches([
        {
          id: '1',
          name: 'Nguyễn Thị B',
          avatar: 'https://i.pravatar.cc/150?img=5',
          specialization: 'Yoga',
          classes: 12,
          rating: 4.8,
        },
        {
          id: '2',
          name: 'Trần Văn C',
          avatar: 'https://i.pravatar.cc/150?img=6',
          specialization: 'Zumba',
          classes: 8,
          rating: 4.5,
        },
        {
          id: '3',
          name: 'Lê Thị D',
          avatar: 'https://i.pravatar.cc/150?img=7',
          specialization: 'Pilates',
          classes: 10,
          rating: 4.7,
        },
        {
          id: '4',
          name: 'Phạm Văn E',
          avatar: 'https://i.pravatar.cc/150?img=8',
          specialization: 'Gym',
          classes: 15,
          rating: 4.9,
        },
      ]);
      
      setNotifications([
        {
          id: '1',
          title: 'Đơn đăng ký mới',
          message: 'Có 5 đơn đăng ký thành viên mới cần xác nhận',
          time: '10 phút trước',
          read: false,
        },
        {
          id: '2',
          title: 'Báo cáo doanh thu',
          message: 'Báo cáo doanh thu tháng 7 đã sẵn sàng',
          time: '1 giờ trước',
          read: true,
        },
        {
          id: '3',
          title: 'Đánh giá mới',
          message: 'Huấn luyện viên Trần Văn C vừa nhận được 3 đánh giá mới',
          time: '2 giờ trước',
          read: true,
        },
      ]);
      
      setRefreshing(false);
    }, 1500);
  };

  const onRefresh = () => {
    loadData();
  };

  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetails', { classId: item.id })}
    >
      <View>
        <Text style={styles.classTitle}>{item.title}</Text>
        
        <View style={styles.classInfo}>
          <Icon name="person" size={14} color="#666" style={styles.classInfoIcon} />
          <Text style={styles.classInfoText}>{item.instructor}</Text>
        </View>
        
        <View style={styles.classInfo}>
          <Icon name="event" size={14} color="#666" style={styles.classInfoIcon} />
          <Text style={styles.classInfoText}>{item.date}</Text>
        </View>
        
        <View style={styles.classInfo}>
          <Icon name="access-time" size={14} color="#666" style={styles.classInfoIcon} />
          <Text style={styles.classInfoText}>{item.time}</Text>
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

  const renderCoachItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.coachCard}
      onPress={() => navigation.navigate('CoachDetails', { coachId: item.id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.coachAvatar} />
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{item.name}</Text>
        <Text style={styles.coachSpecialization}>{item.specialization}</Text>
        
        <View style={styles.coachStats}>
          <View style={styles.coachStat}>
            <Text style={styles.coachStatValue}>{item.classes}</Text>
            <Text style={styles.coachStatLabel}>Lớp</Text>
          </View>
          
          <View style={styles.coachStat}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingValue}>{item.rating}</Text>
              <Icon name="star" size={12} color="#FFD700" />
            </View>
            <Text style={styles.coachStatLabel}>Đánh giá</Text>
          </View>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.notificationRead : styles.notificationUnread]}
      onPress={() => {
        // Mark as read logic would go here
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
            <Text style={styles.greeting}>Xin chào, Quản trị viên</Text>
            <Text style={styles.userName}>Hoàng Văn F</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?img=9' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Thành viên</Text>
              <Icon name="people" size={20} color="#4A90E2" />
            </View>
            <Text style={styles.statValue}>{stats.totalMembers}</Text>
            <Text style={styles.statSubtitle}>{stats.activeMembers} thành viên hoạt động</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Doanh thu</Text>
              <Icon name="attach-money" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.revenue)}</Text>
            <Text style={styles.statSubtitle}>Tháng 7/2023</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Doanh thu</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RevenueReports')}>
              <Text style={styles.viewAllButton}>Xem báo cáo</Text>
            </TouchableOpacity>
          </View>
          
          <LineChart 
            data={revenueData.data} 
            labels={revenueData.labels} 
            color="#4CAF50" 
            height={180}
          />
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Members')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F3FF' }]}>
              <Icon name="people" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.actionText}>Thành viên</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Classes')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF5E7' }]}>
              <Icon name="fitness-center" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Lớp học</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Coaches')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F5FFE8' }]}>
              <Icon name="school" size={24} color="#8BC34A" />
            </View>
            <Text style={styles.actionText}>Huấn luyện viên</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reports')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFE8E8' }]}>
              <Icon name="insert-chart" size={24} color="#FF5252" />
            </View>
            <Text style={styles.actionText}>Báo cáo</Text>
          </TouchableOpacity>
        </View>

        {/* Active Classes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lớp học đang hoạt động</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
              <Text style={styles.viewAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={activeClasses}
            renderItem={renderClassItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>

        {/* Coaches */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Huấn luyện viên</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Coaches')}>
              <Text style={styles.viewAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={coaches}
            renderItem={renderCoachItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Notifications */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông báo mới nhất</Text>
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
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  classInfo: {
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
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  coachInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  coachName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  coachSpecialization: {
    fontSize: 13,
    color: '#4A90E2',
    marginBottom: 8,
  },
  coachStats: {
    flexDirection: 'row',
  },
  coachStat: {
    marginRight: 16,
  },
  coachStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 2,
  },
  coachStatLabel: {
    fontSize: 12,
    color: '#999',
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

export default AdminDashboard; 