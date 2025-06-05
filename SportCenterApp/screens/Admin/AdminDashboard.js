import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { authApis } from '../../api/apiConfig';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MyUserContext } from '../../contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // State cho các loại thống kê
  const [classStats, setClassStats] = useState([]);
  const [memberStats, setMemberStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'isLoggedIn', 'user']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);

      // Gọi các API thống kê song song
      const [classResponse, memberResponse, revenueResponse, summaryResponse] = await Promise.all([
        api.get('/stats/class-members/', {
          params: {
            period: selectedPeriod,
            start_date: dateRange.start_date,
            end_date: dateRange.end_date
          }
        }),
        api.get('/stats/members/', {
          params: {
            period: selectedPeriod,
            start_date: dateRange.start_date,
            end_date: dateRange.end_date
          }
        }),
        api.get('/stats/revenue/', {
          params: {
            period: selectedPeriod,
            start_date: dateRange.start_date,
            end_date: dateRange.end_date
          }
        }),
        api.get('/stats/class-summary/')
      ]);

      if (classResponse.data.success) {
        setClassStats(classResponse.data.data);
      }
      
      setMemberStats(memberResponse.data);
      setRevenueStats(revenueResponse.data);
      console.log('Top Classes Data:', JSON.stringify(summaryResponse.data.summary.top_classes_by_members, null, 2));
      setSummaryStats(summaryResponse.data.summary);

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['weekly', 'monthly', 'yearly'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriodButton
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.selectedPeriodButtonText
          ]}>
            {period === 'weekly' ? 'Tuần' : period === 'monthly' ? 'Tháng' : 'Năm'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const SummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.summaryNumber}>{summaryStats.total_active_classes || 0}</Text>
          <Text style={styles.summaryLabel}>Lớp học hoạt động</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.summaryNumber}>{summaryStats.total_enrollments || 0}</Text>
          <Text style={styles.summaryLabel}>Tổng đăng ký</Text>
        </View>
      </View>
    </View>
  );

  const MemberChart = () => {
    if (!memberStats.length) return null;

    const chartData = {
      labels: memberStats.slice(-6).map(item => {
        const date = new Date(item.period_start);
        return selectedPeriod === 'monthly' 
          ? `${date.getMonth() + 1}/${date.getFullYear()}`
          : selectedPeriod === 'weekly'
          ? `T${Math.ceil(date.getDate() / 7)}`
          : `${date.getFullYear()}`;
      }),
      datasets: [
        {
          data: memberStats.slice(-6).map(item => item.new_members),
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Hội viên mới theo {selectedPeriod === 'weekly' ? 'tuần' : selectedPeriod === 'monthly' ? 'tháng' : 'năm'}</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#2E7D32',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const RevenueChart = () => {
    if (!revenueStats.length) return null;

    const chartData = {
      labels: revenueStats.slice(-6).map(item => {
        const date = new Date(item.period_start);
        return selectedPeriod === 'monthly' 
          ? `${date.getMonth() + 1}/${date.getFullYear()}`
          : selectedPeriod === 'weekly'
          ? `T${Math.ceil(date.getDate() / 7)}`
          : `${date.getFullYear()}`;
      }),
      datasets: [
        {
          data: revenueStats.slice(-6).map(item => parseFloat(item.total_revenue) / 1000000),
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Doanh thu (triệu VNĐ)</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const TopClassesList = () => {
    if (!summaryStats.top_classes_by_members?.length) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top 5 lớp học phổ biến nhất</Text>
        {summaryStats.top_classes_by_members.map((classItem, index) => (
          <View key={classItem.class_id} style={styles.topClassItem}>
            <View style={styles.topClassRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.topClassInfo}>
              <Text style={styles.className}>{classItem.class_name}</Text>
              <Text style={styles.trainerName}>HLV: {classItem.trainer_name}</Text>
              <View style={styles.classStats}>
                <Text style={styles.memberCount}>{classItem.member_count}/{classItem.max_capacity} học viên</Text>
                <Text style={styles.occupancyRate}>{classItem.occupancy_rate}% đầy</Text>
              </View>
            </View>
            <View style={styles.occupancyBar}>
              <View 
                style={[
                  styles.occupancyFill, 
                  { width: `${classItem.occupancy_rate}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const ClassStatusPieChart = () => {
    if (!summaryStats.class_status_distribution?.length) return null;

    const pieData = summaryStats.class_status_distribution.map((item, index) => ({
      name: item.status === 'active' ? 'Hoạt động' : 
            item.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành',
      population: item.count,
      color: ['#4CAF50', '#F44336', '#FF9800'][index % 3],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Phân bổ trạng thái lớp học</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải dữ liệu thống kê...</Text>
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard Quản trị</Text>
          <Text style={styles.headerSubtitle}>Thống kê tổng quan hệ thống</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <PeriodSelector />
      <SummaryCards />
      <MemberChart />
      <RevenueChart />
      <ClassStatusPieChart />
      <TopClassesList />

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('DetailedStatsScreen')}
        >
          <Text style={styles.actionButtonText}>Xem thống kê chi tiết</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedPeriodButton: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedPeriodButtonText: {
    color: '#ffffff',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  topClassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topClassRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topClassInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  trainerName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  classStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#2196F3',
    marginRight: 12,
  },
  occupancyRate: {
    fontSize: 12,
    color: '#4CAF50',
  },
  occupancyBar: {
    width: 60,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginLeft: 8,
  },
  occupancyFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminDashboard;