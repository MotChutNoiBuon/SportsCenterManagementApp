import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons, FontAwesome5 } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../api/apiConfig';
import { theme } from '../../styles';

const StudentManagementScreen = ({ navigation }) => {
  // State
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  const [submittingProgress, setSubmittingProgress] = useState(false);
  
  // Refs to track component mount state
  const isMounted = useRef(true);

  useEffect(() => {
    // Set up the isMounted ref
    isMounted.current = true;
    
    fetchClasses();
    fetchStudents();
    
    // Clean up function to set isMounted to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      filterStudents();
    }
  }, [searchQuery, selectedClass, students]);

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.classes}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!isMounted.current) return;
      
      if (response.data) {
        const trainerClasses = response.data.filter(c => {
          // In a real app, you would filter by the logged-in trainer
          return c.trainer && c.trainer.id;
        });
        
        // Add "All Classes" option
        const allClassesOption = { id: 'all', name: 'Tất cả lớp học' };
        setClasses([allClassesOption, ...trainerClasses]);
      } else {
        // Mock data
        const mockClasses = generateMockClasses();
        setClasses([{ id: 'all', name: 'Tất cả lớp học' }, ...mockClasses]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      
      if (!isMounted.current) return;
      
      // Mock data
      const mockClasses = generateMockClasses();
      setClasses([{ id: 'all', name: 'Tất cả lớp học' }, ...mockClasses]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      // In a real app, this would fetch enrollments for the logged-in trainer's classes
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.enrollments}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!isMounted.current) return;
      
      if (response.data) {
        // Map enrollments to student data
        const studentData = response.data.map(enrollment => {
          // Ensure we have valid objects before accessing their properties
          const member = enrollment.member || {};
          const gymClass = enrollment.gym_class || {};
          
          return {
            id: member.id || 0,
            enrollment_id: enrollment.id || 0,
            full_name: member.full_name || 'Unknown',
            username: member.username || 'unknown',
            email: member.email || '',
            phone: member.phone || '',
            class_id: gymClass.id || 0,
            class_name: gymClass.name || 'Unknown Class',
            joined_date: enrollment.created_date || new Date().toISOString(),
            status: enrollment.status || 'pending',
            avatar: member.avatar || `https://i.pravatar.cc/150?img=${member.id || 0}`,
            progress: []
          };
        });
        
        setStudents(studentData);
        setFilteredStudents(studentData);
      } else {
        // Mock data
        const mockStudents = generateMockStudents();
        setStudents(mockStudents);
        setFilteredStudents(mockStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      
      if (!isMounted.current) return;
      
      // Mock data
      const mockStudents = generateMockStudents();
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const generateMockClasses = () => {
    return [
      {
        id: 1,
        name: 'Yoga cho người mới bắt đầu',
        description: 'Khóa học yoga cơ bản',
        trainer: {
          id: 2,
          username: 'tranthib',
          full_name: 'Trần Thị B'
        },
        schedule: '2023-07-20T10:00:00Z',
        status: 'active'
      },
      {
        id: 2,
        name: 'Tập gym cường độ cao',
        description: 'Lớp tập gym với cường độ cao',
        trainer: {
          id: 2,
          username: 'tranthib',
          full_name: 'Trần Thị B'
        },
        schedule: '2023-07-21T17:30:00Z',
        status: 'active'
      }
    ];
  };

  const generateMockStudents = () => {
    return [
      {
        id: 1,
        enrollment_id: 101,
        full_name: 'Nguyễn Văn A',
        username: 'nguyenvana',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        class_id: 1,
        class_name: 'Yoga cho người mới bắt đầu',
        joined_date: '2023-06-15T08:30:00Z',
        status: 'approved',
        avatar: 'https://i.pravatar.cc/150?img=1',
        progress: [
          {
            id: 1,
            date: '2023-06-20T10:30:00Z',
            note: 'Tập trung tốt, thực hiện đúng các tư thế cơ bản.'
          }
        ]
      },
      {
        id: 2,
        enrollment_id: 102,
        full_name: 'Trần Thị B',
        username: 'tranthib',
        email: 'tranthib@example.com',
        phone: '0912345678',
        class_id: 1,
        class_name: 'Yoga cho người mới bắt đầu',
        joined_date: '2023-06-10T09:15:00Z',
        status: 'approved',
        avatar: 'https://i.pravatar.cc/150?img=2',
        progress: []
      },
      {
        id: 3,
        enrollment_id: 103,
        full_name: 'Lê Văn C',
        username: 'levanc',
        email: 'levanc@example.com',
        phone: '0923456789',
        class_id: 2,
        class_name: 'Tập gym cường độ cao',
        joined_date: '2023-06-05T14:45:00Z',
        status: 'approved',
        avatar: 'https://i.pravatar.cc/150?img=3',
        progress: [
          {
            id: 2,
            date: '2023-06-12T16:30:00Z',
            note: 'Cần tập trung hơn vào kỹ thuật nâng tạ.'
          },
          {
            id: 3,
            date: '2023-06-19T16:30:00Z',
            note: 'Đã cải thiện kỹ thuật nâng tạ, cần tăng cường cardio.'
          }
        ]
      }
    ];
  };

  const filterStudents = () => {
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }
    
    let filtered = [...students];
    
    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => student && student.class_id === parseInt(selectedClass));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student && (
          (student.full_name && student.full_name.toLowerCase().includes(query)) ||
          (student.username && student.username.toLowerCase().includes(query)) ||
          (student.email && student.email.toLowerCase().includes(query)) ||
          (student.phone && student.phone.includes(query))
        )
      );
    }
    
    setFilteredStudents(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleAddProgress = (student) => {
    if (!student) return;
    
    setSelectedStudent(student);
    setProgressNote('');
    setIsProgressModalVisible(true);
  };

  const handleSubmitProgress = async () => {
    if (!progressNote.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ghi chú tiến độ.');
      return;
    }

    if (!selectedStudent) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin học viên.');
      setIsProgressModalVisible(false);
      return;
    }

    setSubmittingProgress(true);

    try {
      const token = await AsyncStorage.getItem('access_token');
      const trainerId = await AsyncStorage.getItem('user_id');
      
      // API call to add progress
      const progressData = {
        member: selectedStudent.id,
        trainer: trainerId,
        gym_class: selectedStudent.class_id,
        progress_note: progressNote,
      };
      
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.progress}`,
        progressData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!isMounted.current) return;
      
      // Update local state
      const updatedStudents = students.map(student => {
        if (student && student.id === selectedStudent.id) {
          const newProgress = {
            id: response.data ? response.data.id : Date.now(),
            date: new Date().toISOString(),
            note: progressNote
          };
          
          return {
            ...student,
            progress: [newProgress, ...(student.progress || [])]
          };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      setIsProgressModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật tiến độ thành công.');
      
    } catch (error) {
      console.error('Error adding progress:', error);
      
      if (!isMounted.current) return;
      
      // For the demo, update local state anyway
      const updatedStudents = students.map(student => {
        if (student && student.id === selectedStudent.id) {
          const newProgress = {
            id: Date.now(),
            date: new Date().toISOString(),
            note: progressNote
          };
          
          return {
            ...student,
            progress: [newProgress, ...(student.progress || [])]
          };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      setIsProgressModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật tiến độ thành công.');
    } finally {
      if (isMounted.current) {
        setSubmittingProgress(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const renderStudentItem = ({ item }) => {
    if (!item) return null;
    
    const hasProgress = item.progress && Array.isArray(item.progress) && item.progress.length > 0;
    
    return (
      <View style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <Image 
            source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} 
            style={styles.avatar}
            resizeMode="cover"
            defaultSource={require('../../assets/customer_icon.png')}
          />
          
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.full_name || 'Unknown'}</Text>
            <Text style={styles.studentDetail}>@{item.username || 'unknown'}</Text>
            <Text style={styles.studentDetail}>
              <Ionicons name="mail" size={14} color="#666" /> {item.email || 'N/A'}
            </Text>
            <Text style={styles.studentDetail}>
              <Ionicons name="call" size={14} color="#666" /> {item.phone || 'N/A'}
            </Text>
          </View>
        </View>
        
        <View style={styles.classInfo}>
          <Text style={styles.classLabel}>Lớp học:</Text>
          <Text style={styles.className}>{item.class_name || 'Không xác định'}</Text>
          <Text style={styles.joinDate}>Tham gia: {formatDate(item.joined_date)}</Text>
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tiến độ tập luyện</Text>
            <TouchableOpacity 
              style={styles.addProgressButton}
              onPress={() => handleAddProgress(item)}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addProgressText}>Thêm ghi chú</Text>
            </TouchableOpacity>
          </View>
          
          {hasProgress ? (
            item.progress.slice(0, 2).map(prog => 
              prog ? (
                <View key={prog.id} style={styles.progressItem}>
                  <Text style={styles.progressDate}>{formatDate(prog.date)}</Text>
                  <Text style={styles.progressNote}>{prog.note || ''}</Text>
                </View>
              ) : null
            )
          ) : (
            <Text style={styles.emptyProgressText}>Chưa có ghi chú tiến độ nào</Text>
          )}
          
          {hasProgress && item.progress.length > 2 && (
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate('ProgressDetail', { studentId: item.id, studentName: item.full_name })}
            >
              <Text style={styles.viewMoreText}>Xem tất cả ghi chú</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderProgressModal = () => {
    if (!selectedStudent) return null;
    
    return (
      <Modal
        visible={isProgressModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsProgressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật tiến độ</Text>
              <TouchableOpacity
                onPress={() => setIsProgressModalVisible(false)}
                disabled={submittingProgress}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedStudent && (
              <View style={styles.selectedStudentInfo}>
                <Image 
                  source={{ uri: selectedStudent.avatar || 'https://i.pravatar.cc/150' }} 
                  style={styles.modalAvatar}
                  defaultSource={require('../../assets/customer_icon.png')}
                />
                <View>
                  <Text style={styles.modalStudentName}>{selectedStudent.full_name || 'Unknown'}</Text>
                  <Text style={styles.modalClassName}>{selectedStudent.class_name || 'Unknown Class'}</Text>
                </View>
              </View>
            )}
            
            <Text style={styles.inputLabel}>Ghi chú tiến độ:</Text>
            <TextInput
              style={styles.progressInput}
              placeholder="Nhập ghi chú về tiến độ tập luyện của học viên..."
              value={progressNote}
              onChangeText={setProgressNote}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submittingProgress}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsProgressModalVisible(false)}
                disabled={submittingProgress}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.submitButton,
                  submittingProgress && styles.disabledButton
                ]}
                onPress={handleSubmitProgress}
                disabled={submittingProgress}
              >
                {submittingProgress ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Lưu ghi chú</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách học viên...</Text>
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
            placeholder="Tìm kiếm học viên..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classFilterContainer}
        >
          {Array.isArray(classes) && classes.map(cls => 
            cls ? (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.classFilterButton,
                  selectedClass === cls.id.toString() && styles.selectedClassButton
                ]}
                onPress={() => setSelectedClass(cls.id.toString())}
              >
                <Text 
                  style={[
                    styles.classFilterText,
                    selectedClass === cls.id.toString() && styles.selectedClassText
                  ]}
                >
                  {cls.name || 'Unknown'}
                </Text>
              </TouchableOpacity>
            ) : null
          )}
        </ScrollView>
      </View>
      
      {!Array.isArray(filteredStudents) || filteredStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="user-graduate" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Không tìm thấy học viên nào</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => (item && item.id ? item.id.toString() : Math.random().toString())}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
      
      {renderProgressModal()}
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
  classFilterContainer: {
    paddingVertical: 8,
  },
  classFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 12,
  },
  selectedClassButton: {
    backgroundColor: theme.colors.primary,
  },
  classFilterText: {
    fontSize: 14,
    color: '#555',
  },
  selectedClassText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  classInfo: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  classLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#666',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    paddingTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addProgressText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  progressItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  progressDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressNote: {
    fontSize: 14,
    color: '#333',
  },
  emptyProgressText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedStudentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalStudentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClassName: {
    fontSize: 14,
    color: '#666',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
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

export default StudentManagementScreen; 