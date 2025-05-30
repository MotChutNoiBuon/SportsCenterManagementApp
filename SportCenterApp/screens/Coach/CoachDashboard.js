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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getClasses, getUpcomingClasses } from '../../api/classService';
import { MyUserContext } from '../../contexts/UserContext';

const CoachDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useContext(MyUserContext);
  const userData = currentUser._j;
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesData, upcomingData] = await Promise.all([
        getClasses(),
        getUpcomingClasses()
      ]);

      // Lọc lớp học hôm nay
      const today = new Date();
      const filteredTodayClasses = classesData.results?.filter(item => {
        const classDate = new Date(item.start_time);
        return classDate.toDateString() === today.toDateString();
      }) || [];

      setTodayClasses(filteredTodayClasses);
      setUpcomingClasses(upcomingData.results || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleClassPress = (classItem) => {
    navigation.navigate('ClassDetails', { classId: classItem.id });
  };

  const renderTodayClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classCard} 
      onPress={() => handleClassPress(item)}
    >
      <View style={styles.classTimeContainer}>
        <Ionicons name="time-outline" size={16} color="#4A90E2" />
        <Text style={styles.classTime}>
          {new Date(item.start_time).toLocaleTimeString()}
        </Text>
      </View>
      
      <Text style={styles.classTitle}>{item.name}</Text>
      
      <View style={styles.classInfoRow}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.classInfoText}>{item.location || 'Phòng tập chính'}</Text>
      </View>
      
      <View style={styles.classFooter}>
        <View style={styles.participantsContainer}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.participantsText}>
            {item.current_participants || 0}/{item.max_participants || 20} học viên
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('ClassSession', { classId: item.id })}
        >
          <Text style={styles.startButtonText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderUpcomingClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.upcomingClassItem} 
      onPress={() => handleClassPress(item)}
    >
      <View style={styles.upcomingClassDate}>
        <Text style={styles.upcomingClassDateText}>
          {new Date(item.start_time).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.upcomingClassInfo}>
        <Text style={styles.upcomingClassTitle}>{item.name}</Text>
        
        <View style={styles.upcomingClassDetails}>
          <View style={styles.upcomingClassDetailItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.upcomingClassDetailText}>
              {new Date(item.start_time).toLocaleTimeString()}
            </Text>
          </View>
          
          <View style={styles.upcomingClassDetailItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.upcomingClassDetailText}>
              {item.location || 'Phòng tập chính'}
            </Text>
          </View>
          
          <View style={styles.upcomingClassDetailItem}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.upcomingClassDetailText}>
              {item.current_participants || 0}/{item.max_participants || 20} học viên
            </Text>
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Navigation Menu */}
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyClasses')}>
            <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="calendar-outline" size={24} color="#2196f3" />
            </View>
            <Text style={styles.navText}>Lớp học</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Students')}>
            <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
              <Ionicons name="people-outline" size={24} color="#9c27b0" />
            </View>
            <Text style={styles.navText}>Học viên</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Schedule')}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="time-outline" size={24} color="#ff9800" />
            </View>
            <Text style={styles.navText}>Lịch dạy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile', { userData })}>
            <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="person-outline" size={24} color="#4caf50" />
            </View>
            <Text style={styles.navText}>Cá nhân</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Classes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lớp học hôm nay</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyClasses')}>
              <Text style={styles.seeAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Đang tải...</Text>
            </View>
          ) : todayClasses.length > 0 ? (
            <FlatList
              data={todayClasses}
              renderItem={renderTodayClassItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Bạn không có lớp học nào vào hôm nay
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Classes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lớp học sắp tới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyClasses')}>
              <Text style={styles.seeAllButton}>Xem lịch</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Đang tải...</Text>
            </View>
          ) : upcomingClasses.length > 0 ? (
            <FlatList
              data={upcomingClasses}
              renderItem={renderUpcomingClassItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Không có lớp học sắp tới
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  navItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  classCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  classTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classTime: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 6,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  classInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  upcomingClassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  upcomingClassDate: {
    width: 60,
    alignItems: 'center',
  },
  upcomingClassDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
  },
  upcomingClassInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  upcomingClassTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  upcomingClassDetails: {
    flexDirection: 'column',
  },
  upcomingClassDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  upcomingClassDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
});

export default CoachDashboard; 