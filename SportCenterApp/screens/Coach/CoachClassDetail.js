import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
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

const CoachClassDetail = () => {
    const [classDetails, setClassDetails] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [approvedCount, setApprovedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    const navigation = useNavigation();
    const route = useRoute();
    const { classId } = route.params;
    const currentUser = useContext(MyUserContext);
    const userData = currentUser.payload;

    useEffect(() => {
        loadClassDetails();
    }, [classId]);

    const loadClassDetails = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('access_token');

            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                navigation.navigate('Login');
                return;
            }

            console.log('Calling API with token:', token);
            const api = authApis(token);
            const response = await api.get(`/classes/${classId}/`);
            console.log('API Response:', response.data);

            if (response.data) {
                setClassDetails(response.data);

                const approvedResponse = await api.get(`${API_ENDPOINTS.enrollments}?gym_class=${classId}&status=approved`);
                setApprovedCount(approvedResponse.data.length);

            } else {
                throw new Error('No data received from API');
            }

        } catch (error) {
            console.error('Error loading class details:', error);
            if (error.response?.status === 401) {
                Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Lỗi', 'Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadClassDetails();
    };


    const handleViewStudents = () => {
        navigation.navigate('ClassStudents', { classId });
    };

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Đang tải thông tin lớp học...</Text>
            </View>
        );
    }

    if (!classDetails) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#ff3b30" />
                <Text style={styles.errorText}>Không tìm thấy thông tin lớp học</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Class Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.className}>{classDetails.name}</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>Bắt đầu: {new Date(classDetails.start_time).toLocaleString('vi-VN')} 
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>Kết thúc: {new Date(classDetails.end_time).toLocaleString('vi-VN')}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            {approvedCount}/{classDetails.max_members} học viên đã được duyệt
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            {classDetails.price} VNĐ
                        </Text>
                    </View>
                </View>

                {/* Class Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.description}>
                        {classDetails.description || 'Chưa có mô tả'}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={styles.viewStudentsButton}
                    onPress={handleViewStudents}
                >
                    <Ionicons name="people" size={24} color="white" />
                    <Text style={styles.viewStudentsButtonText}>Xem danh sách học viên</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: '#ff3b30',
        textAlign: 'center',
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
    },
    className: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    scheduleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    scheduleItem: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    scheduleDay: {
        fontSize: 14,
        color: '#666',
    },
    actionButtons: {
        padding: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    startButton: {
        backgroundColor: '#2196f3',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    viewStudentsButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    viewStudentsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default CoachClassDetail; 