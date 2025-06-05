import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MyUserContext } from '../../contexts/UserContext';
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClassStudents = () => {
    const [students, setStudents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [className, setClassName] = useState('');

    const navigation = useNavigation();
    const route = useRoute();
    const { classId } = route.params;
    const currentUser = useContext(MyUserContext);

    useEffect(() => {
        loadClassStudents();
    }, [classId]);

    const loadClassStudents = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('access_token');

            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                navigation.navigate('Login');
                return;
            }

            const api = authApis(token);

            // Lấy thông tin lớp học
            const classResponse = await api.get(`/classes/${classId}/`);
            setClassName(classResponse.data.name);

            // Lấy danh sách học viên đã đăng ký
            const enrollmentsResponse = await api.get(`${API_ENDPOINTS.enrollments}?gym_class=${classId}`);
            const enrollments = enrollmentsResponse.data;

            // Lấy thông tin chi tiết của từng học viên
            const studentsData = await Promise.all(
                enrollments.map(async (enrollment) => {
                    const studentResponse = await api.get(`${API_ENDPOINTS.members}${enrollment.member}`);
                    return {
                        ...studentResponse.data,
                        enrollmentId: enrollment.id,
                        status: enrollment.status
                    };
                })
            );

            setStudents(studentsData);
        } catch (error) {
            console.error('Error loading class students:', error);
            if (error.response?.status === 401) {
                Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Lỗi', 'Không thể tải danh sách học viên. Vui lòng thử lại sau.');
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadClassStudents();
    };

    const handleUpdateStatus = async (enrollmentId, newStatus) => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                navigation.navigate('Login');
                return;
            }

            const api = authApis(token);
            await api.patch(`${API_ENDPOINTS.enrollments}${enrollmentId}`, {
                status: newStatus
            });

            // Cập nhật lại danh sách học viên
            loadClassStudents();
            Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
        } catch (error) {
            console.error('Error updating enrollment status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#FFA500';
            case 'approved':
                return '#4CAF50';
            case 'rejected':
                return '#F44336';
            default:
                return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ duyệt';
            case 'approved':
                return 'Đã duyệt';
            case 'rejected':
                return 'Từ chối';
            default:
                return status;
        }
    };

    const renderStudentItem = ({ item }) => (
        <TouchableOpacity
            style={styles.studentCard}
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
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>
            {item.status === 'pending' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleUpdateStatus(item.enrollmentId, 'approved')}
                    >
                        <Ionicons name="checkmark" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleUpdateStatus(item.enrollmentId, 'rejected')}
                    >
                        <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Đang tải danh sách học viên...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{className}</Text>
                <Text style={styles.headerSubtitle}>Danh sách học viên</Text>
            </View>
            <FlatList
                data={students}
                renderItem={renderStudentItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={50} color="#666" />
                        <Text style={styles.emptyText}>Chưa có học viên nào</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    listContent: {
        padding: 16,
    },
    studentCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    studentAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    studentUsername: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        marginLeft: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default ClassStudents; 