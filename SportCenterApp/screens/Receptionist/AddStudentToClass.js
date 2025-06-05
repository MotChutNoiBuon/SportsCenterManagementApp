import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../contexts/UserContext';
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import { debounce } from 'lodash';

const AddStudentToClass = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, className } = route.params;
  const currentUser = useContext(MyUserContext);

  useEffect(() => {
    loadStudents();
  }, []);

  const getTokenOrRedirect = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
      navigation.navigate('Login');
      return null;
    }
    return token;
  };

  const handleError = (error, fallbackMessage = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
    console.error(error);
    const status = error.response?.status;
    const message =
      status === 401
        ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        : fallbackMessage;

    Alert.alert('Lỗi', message);

    if (status === 401) {
      navigation.navigate('Login');
    }

    setFilteredStudents([]);
  };

  const loadStudents = async () => {
    setIsLoading(true);

    try {
      const token = await getTokenOrRedirect();
      if (!token) return;

      const api = authApis(token);
      const { data } = await api.get(API_ENDPOINTS.members, {
        params: {
          status: 'active',
          ordering: 'first_name',
          page: page,
          not_in_class: classId
        },
      });

      const newStudents = data.results || [];
      setStudents(prev => (page === 1 ? newStudents : [...prev, ...newStudents]));
      setFilteredStudents(page === 1 ? newStudents : [...filteredStudents, ...newStudents]);
      setNext(!!data.next);
    } catch (error) {
      handleError(error, 'Không thể tải danh sách học viên. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setPage(1);
      loadStudents();
      return;
    }

    setIsSearching(true);

    try {
      const token = await getTokenOrRedirect();
      if (!token) return;

      const api = authApis(token);
      const { data } = await api.get(API_ENDPOINTS.members, {
        params: {
          status: 'active',
          search: query.trim(),
          ordering: 'first_name',
          not_in_class: classId
        },
      });

      setFilteredStudents(data.results || []);
      setNext(!!data.next);
    } catch (error) {
      if (error.response?.status === 404) {
        setFilteredStudents([]);
      } else {
        handleError(error, 'Không thể tìm kiếm học viên. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim().length >= 2) {
        searchStudents(query);
      } else {
        setPage(2);
        loadStudents();
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadStudents();
  };

  const loadMore = () => {
    if (next && !isLoading && !isSearching) {
      setPage(prevPage => prevPage + 1);
      loadStudents();
    }
  };

  const toggleStudentSelection = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleAddStudents = async () => {
    if (selectedStudents.size === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một học viên');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);

      const promises = Array.from(selectedStudents).map(studentId =>
        api.post(API_ENDPOINTS.enrollments, {
          gym_class: classId,
          member: studentId
        })
      );

      await Promise.all(promises);
      Alert.alert('Thành công', 'Đã thêm học viên vào lớp học', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error adding students:', error);
      Alert.alert('Lỗi', 'Không thể thêm học viên vào lớp học. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }) => {
    const isSelected = selectedStudents.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.studentCard, isSelected && styles.selectedCard]}
        onPress={() => toggleStudentSelection(item.id)}
      >
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={20} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoading && !isSearching) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2196f3" />
      </View>
    );
  };

  if (isLoading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{className}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm học viên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isSearching ? 'Đang tìm kiếm...' : 'Không tìm thấy học viên nào'}
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>Đã chọn: {selectedStudents.size} học viên</Text>
        <TouchableOpacity
          style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
          onPress={handleAddStudents}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Thêm vào lớp</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196f3',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2196f3',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AddStudentToClass;
