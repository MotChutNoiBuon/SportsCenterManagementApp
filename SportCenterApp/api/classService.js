import { apiClient } from './apiClient';
import apiConfig, { API_ENDPOINTS } from './apiConfig';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lấy danh sách lớp học
export const getClasses = async () => {

  try {
    console.log('Gọi API lấy danh sách lớp học:', `${API_ENDPOINTS.classes}`);
    const response = await apiConfig.get(API_ENDPOINTS.classes);
    console.log('Kết quả API lớp học:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp học:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    throw error;
  }
};

// Lấy chi tiết lớp học
export const getClassDetails = async (classId) => {
  try {
    console.log('Gọi API lấy chi tiết lớp học:', `${API_ENDPOINTS.classes}${classId}/`);
    const response = await apiConfig.get(`${API_ENDPOINTS.classes}${classId}/`);
    console.log('Kết quả API chi tiết lớp học:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết lớp học:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    throw error;
  }
};

// Đăng ký lớp học
export const enrollClass = async (classId) => {
  try {
    console.log('Bắt đầu gọi API đăng ký lớp học');
    console.log('Class ID:', classId);
    
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    // Kiểm tra xem đã đăng ký chưa
    const enrollmentsResponse = await axios({
      method: 'get',
      url: `${apiConfig.defaults.baseURL}${API_ENDPOINTS.enrollments}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const enrollments = enrollmentsResponse.data.results || enrollmentsResponse.data || [];
    const isEnrolled = enrollments.some(enrollment => enrollment.gym_class === classId);

    if (isEnrolled) {
      return { status: 'already_enrolled', message: 'Bạn đã đăng ký lớp học này rồi' };
    }

    const requestData = { gym_class: classId };
    console.log('Request data:', requestData);

    const response = await axios({
      method: 'post',
      url: `${apiConfig.defaults.baseURL}${API_ENDPOINTS.enrollments}`,
      data: requestData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return { status: 'success', data: response.data };
  } catch (error) {
    console.error('Chi tiết lỗi:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    let errorMessage = 'Đã có lỗi xảy ra khi đăng ký lớp học';
    
    if (error.response) {
      const errorData = error.response.data;
      if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors[0];
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.gym_class) {
        errorMessage = errorData.gym_class[0];
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }
    
    throw new Error(errorMessage);
  }
};

// Lấy danh sách lớp học đã đăng ký
export const getEnrollments = async () => {
  try {
    console.log('Gọi API lấy danh sách đăng ký:', `${API_ENDPOINTS.enrollments}`);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await axios({
      method: 'get',
      url: `${apiConfig.defaults.baseURL}${API_ENDPOINTS.enrollments}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Kết quả API danh sách đăng ký:', response.data);

    // Lấy thông tin chi tiết cho từng lớp học
    const enrollments = response.data.results || response.data || [];
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        try {
          const classDetails = await getClassDetails(enrollment.gym_class);
          return {
            ...enrollment,
            gym_class: classDetails
          };
        } catch (error) {
          console.error('Lỗi khi lấy thông tin lớp học:', error);
          return enrollment;
        }
      })
    );

    return {
      ...response.data,
      results: enrollmentsWithDetails
    };
  } catch (error) {
    console.error('Lấy danh sách đăng ký thất bại:', error.message);
    throw error;
  }
};

// Hủy đăng ký lớp học
export const cancelEnrollment = async (enrollmentId) => {
  try {
    console.log('Gọi API hủy đăng ký:', `${API_ENDPOINTS.enrollments}${enrollmentId}/`);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await axios({
      method: 'delete',
      url: `${apiConfig.defaults.baseURL}${API_ENDPOINTS.enrollments}${enrollmentId}/`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Kết quả API hủy đăng ký:', response.data);
    return response.data;
  } catch (error) {
    console.error('Hủy đăng ký lớp học thất bại:', error.message);
    throw error;
  }
};

// Lấy danh sách lớp học sắp tới
export const getUpcomingClasses = async () => {
  try {
    console.log('Gọi API lấy lớp học sắp tới:', `${API_ENDPOINTS.classes}?status=upcoming`);
    const response = await apiClient.get(`${API_ENDPOINTS.classes}?status=upcoming`);
    console.log('Kết quả API lớp học sắp tới:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lớp học sắp tới:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    Alert.alert('Lỗi', 'Không thể lấy danh sách lớp học sắp tới');
    throw error;
  }
};

// Lấy danh sách lớp học đề xuất
export const getRecommendedClasses = async () => {
  try {
    console.log('Gọi API lấy lớp học đề xuất:', `${API_ENDPOINTS.classes}?recommended=true`);
    const response = await apiClient.get(`${API_ENDPOINTS.classes}?recommended=true`);
    console.log('Kết quả API lớp học đề xuất:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lớp học đề xuất:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    Alert.alert('Lỗi', 'Không thể lấy danh sách lớp học đề xuất');
    throw error;
  }
};