import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MyUserContext } from '../../contexts/UserContext';
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = useContext(MyUserContext);
  const { classId } = route.params;

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      const response = await api.get('/trainer/students/');
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
      if (error.response?.status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách học viên. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity style={styles.studentCard}
      onPress={() => navigation.navigate('StudentDetails', {
        studentId: item.id,
        studentData: item,
        enrollmentId: item.enrollmentId,
        status: item.status,
        gym_class: classId

      })}
    >
      <Image
        source={{
          uri: item.avatar
            ? `https://res.cloudinary.com/dfgnoyf71/${item.avatar}`
            : `https://i.pravatar.cc/150?img=${item.id}`
        }}
        style={styles.studentAvatar}
      />
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.studentUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có học viên nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
  listContainer: {
    padding: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  studentPhone: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    color: '#666',
    marginTop: 16,
    fontSize: 16,
  },
});

export default Students; 