import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons, FontAwesome5 } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../api/apiConfig';
import { theme } from '../../styles';

const ClassRegistrationScreen = ({ navigation, route }) => {
  // State
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories for filtering classes
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'gym', name: 'Gym' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'swimming', name: 'Bơi lội' },
    { id: 'dance', name: 'Khiêu vũ' }
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      filterClasses();
    }
  }, [searchQuery, selectedCategory, classes]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.classes}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setClasses(response.data);
        setFilteredClasses(response.data);
      } else {
        // Mock data if API is not available
        const mockClasses = generateMockClasses();
        setClasses(mockClasses);
        setFilteredClasses(mockClasses);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Mock data for development
      const mockClasses = generateMockClasses();
      setClasses(mockClasses);
      setFilteredClasses(mockClasses);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockClasses = () => {
    return [
      {
        id: 1,
        name: 'Yoga cho người mới bắt đầu',
        description: 'Khóa học yoga cơ bản dành cho người mới, tập trung vào kỹ thuật thở và tư thế đơn giản.',
        trainer: {
          id: 2,
          username: 'tranthib',
          full_name: 'Trần Thị B',
          specialization: 'yoga',
          experience_years: 5
        },
        schedule: '2023-07-20T10:00:00Z',
        max_members: 15,
        status: 'active',
        price: 250000,
        image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b'
      },
      {
        id: 2,
        name: 'Tập gym cường độ cao',
        description: 'Lớp tập gym với cường độ cao, phù hợp cho người đã có nền tảng thể lực tốt.',
        trainer: {
          id: 3,
          username: 'nguyenvanc',
          full_name: 'Nguyễn Văn C',
          specialization: 'gym',
          experience_years: 7
        },
        schedule: '2023-07-21T17:30:00Z',
        max_members: 10,
        status: 'active',
        price: 300000,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
      },
      {
        id: 3,
        name: 'Học bơi cơ bản',
        description: 'Khóa học bơi dành cho người mới bắt đầu, học các kỹ thuật bơi cơ bản và làm quen với nước.',
        trainer: {
          id: 4,
          username: 'lethid',
          full_name: 'Lê Thị D',
          specialization: 'swimming',
          experience_years: 4
        },
        schedule: '2023-07-22T08:00:00Z',
        max_members: 8,
        status: 'active',
        price: 400000,
        image: 'https://images.unsplash.com/photo-1560090995-01632a28895b'
      },
      {
        id: 4,
        name: 'Khiêu vũ hiện đại',
        description: 'Lớp học khiêu vũ hiện đại, kết hợp nhiều phong cách từ hip-hop đến contemporary.',
        trainer: {
          id: 5,
          username: 'phamvane',
          full_name: 'Phạm Văn E',
          specialization: 'dance',
          experience_years: 6
        },
        schedule: '2023-07-23T19:00:00Z',
        max_members: 12,
        status: 'active',
        price: 350000,
        image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4'
      }
    ];
  };

  const filterClasses = () => {
    let filtered = [...classes];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cls => 
        cls.trainer && cls.trainer.specialization === selectedCategory
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cls => 
        cls.name.toLowerCase().includes(query) ||
        cls.description.toLowerCase().includes(query) ||
        (cls.trainer && cls.trainer.full_name.toLowerCase().includes(query))
      );
    }
    
    setFilteredClasses(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const handleClassSelection = (classItem) => {
    navigation.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
  };

  const handleEnrollment = async (classItem) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');
      
      // Confirm enrollment
      Alert.alert(
        'Xác nhận đăng ký',
        `Bạn muốn đăng ký lớp "${classItem.name}" với giá ${formatCurrency(classItem.price)}?`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng ký',
            onPress: async () => {
              try {
                // API call to enroll in the class
                const response = await axios.post(
                  `${API_BASE_URL}${API_ENDPOINTS.enrollments}`,
                  {
                    member: userId,
                    gym_class: classItem.id,
                    status: 'pending'
                  },
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                if (response.status === 201) {
                  // Navigate to payment screen
                  navigation.navigate('PaymentScreen', {
                    classData: classItem,
                    enrollmentId: response.data.id
                  });
                }
              } catch (error) {
                console.error('Error enrolling in class:', error);
                Alert.alert(
                  'Lỗi',
                  'Không thể đăng ký lớp học. Vui lòng thử lại sau.'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in enrollment process:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng đăng nhập lại và thử lại.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderClassItem = ({ item }) => {
    const specialization = item.trainer?.specialization || 'other';
    
    const getCategoryColor = (category) => {
      switch (category) {
        case 'yoga':
          return '#8E44AD';
        case 'gym':
          return '#2980B9';
        case 'swimming':
          return '#16A085';
        case 'dance':
          return '#E74C3C';
        default:
          return '#7F8C8D';
      }
    };

    const categoryColor = getCategoryColor(specialization);

    return (
      <TouchableOpacity 
        style={styles.classCard}
        onPress={() => handleClassSelection(item)}
      >
        <Image 
          source={{ uri: item.image || `https://source.unsplash.com/800x600/?${specialization}` }} 
          style={styles.classImage}
          resizeMode="cover"
        />
        
        <View style={styles.classContent}>
          <View style={styles.classHeader}>
            <Text style={styles.className}>{item.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>
                {categories.find(cat => cat.id === specialization)?.name || 'Khác'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.classDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.classDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.detailText}>{item.trainer?.full_name || 'Chưa có huấn luyện viên'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>{formatDate(item.schedule)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={styles.detailText}>Tối đa {item.max_members} người</Text>
            </View>
          </View>
          
          <View style={styles.classFooter}>
            <Text style={styles.classPrice}>{formatCurrency(item.price)}</Text>
            
            <TouchableOpacity 
              style={styles.enrollButton}
              onPress={() => handleEnrollment(item)}
            >
              <Text style={styles.enrollButtonText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách lớp học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm lớp học..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.id && styles.selectedCategoryText
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {filteredClasses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="book" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Không tìm thấy lớp học nào</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          renderItem={renderClassItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 12,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  classImage: {
    height: 180,
    width: '100%',
  },
  classContent: {
    padding: 16,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  classDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  classDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  classPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  enrollButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ClassRegistrationScreen; 