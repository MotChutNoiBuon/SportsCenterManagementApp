import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { getStatistics } from '../../api/apiConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const DetailedStatsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [classStatsData, setClassStatsData] = useState([]);

  useEffect(() => {
    loadDetailedStats();
  }, [selectedPeriod]);

  const loadDetailedStats = async () => {
    try {
      setLoading(true);
      const classResponse = await getStatistics.getClassMembers(selectedPeriod);
      if (classResponse.success) {
        const sortedData = [...classResponse.data].sort((a, b) => {
          return new Date(b.period_start) - new Date(a.period_start);
        });
        setClassStatsData(sortedData);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê chi tiết:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê chi tiết');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetailedStats();
    setRefreshing(false);
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

  const renderClassPeriodItem = ({ item }) => (
    <View style={styles.periodCard}>
      <View style={styles.periodHeader}>
        <Text style={styles.periodTitle}>
          {new Date(item.period_start).toLocaleDateString('vi-VN')} - {' '}
          {new Date(item.period_end).toLocaleDateString('vi-VN')}
        </Text>
        <View style={styles.periodSummary}>
          <Text style={styles.summaryText}>
            <Icon name="class" size={16} color="#666" /> {item.total_classes} lớp • 
            <Icon name="person-add" size={16} color="#4CAF50" /> {item.total_new_enrollments} đăng ký mới
          </Text>
          <Text style={styles.summaryText}>
            <Icon name="trending-up" size={16} color="#2196F3" /> Tỷ lệ lấp đầy TB: {item.average_occupancy_rate}%
          </Text>
        </View>
      </View>
      
      <FlatList
        data={item.classes}
        keyExtractor={(classItem, index) => `${classItem.class_id}-${index}`}
        renderItem={({ item: classItem }) => (
          <View style={styles.classItem}>
            <View style={styles.classHeader}>
              <Text style={styles.className}>{classItem.class_name}</Text>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusText, { color: getStatusColor(classItem.status) }]}>
                  {getStatusText(classItem.status)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.trainerName}>
              <Icon name="person" size={16} color="#666" /> HLV: {classItem.trainer_name}
            </Text>
            
            <View style={styles.classStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{classItem.current_members}</Text>
                <Text style={styles.statLabel}>Hội viên hiện tại</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{classItem.max_capacity}</Text>
                <Text style={styles.statLabel}>Sức chứa tối đa</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{classItem.new_enrollments}</Text>
                <Text style={styles.statLabel}>Đăng ký mới</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: getOccupancyColor(classItem.occupancy_rate) }]}>
                  {classItem.occupancy_rate}%
                </Text>
                <Text style={styles.statLabel}>Tỷ lệ lấp đầy</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(classItem.occupancy_rate, 100)}%`,
                    backgroundColor: getOccupancyColor(classItem.occupancy_rate)
                  }
                ]} 
              />
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                <Icon name="attach-money" size={16} color="#4CAF50" />
                {classItem.price.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'completed': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Đã hoàn thành';
      default: return status;
    }
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 80) return '#4CAF50';
    if (rate >= 60) return '#FF9800';
    return '#F44336';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    if (classStatsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="info" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Không có dữ liệu thống kê</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={classStatsData}
        keyExtractor={(item, index) => `class-${index}`}
        renderItem={renderClassPeriodItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <PeriodSelector />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: '#E3F2FD',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  periodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodHeader: {
    marginBottom: 16,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  periodSummary: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  classItem: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trainerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  classStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
  },
});

export default DetailedStatsScreen;