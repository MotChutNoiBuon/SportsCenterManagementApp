import { apiClient } from './apiClient';
import apiConfig, { API_ENDPOINTS } from './apiConfig';
import axios from 'axios';
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
    console.log('Gọi API đăng ký lớp học:', `${API_ENDPOINTS.enrollments}`);
    const response = await apiClient.post(API_ENDPOINTS.enrollments, { gym_class: classId });
    console.log('Kết quả API đăng ký lớp học:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký lớp học:', error.message);
    let errorMessage = 'Đã có lỗi xảy ra khi đăng ký lớp học';
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors[0]; // Lấy lỗi từ backend
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    }
    Alert.alert('Lỗi', errorMessage);
    throw new Error(errorMessage);
  }
};

// Lấy danh sách lớp học đã đăng ký
export const getEnrollments = async () => {
  try {
    console.log('Gọi API lấy danh sách đăng ký:', `${API_ENDPOINTS.enrollments}`);
    const response = await apiClient.get(API_ENDPOINTS.enrollments);
    console.log('Kết quả API danh sách đăng ký:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lấy danh sách đăng ký thất bại:', error.message);
    Alert.alert('Lỗi', 'Không thể lấy danh sách đăng ký');
    throw error;
  }
};

// Hủy đăng ký lớp học
export const cancelEnrollment = async (enrollmentId) => {
  try {
    console.log('Gọi API hủy đăng ký:', `${API_ENDPOINTS.enrollments}${enrollmentId}/`);
    const response = await apiClient.delete(`${API_ENDPOINTS.enrollments}${enrollmentId}/`);
    console.log('Kết quả API hủy đăng ký:', response.data);
    return response.data;
  } catch (error) {
    console.error('Hủy đăng ký lớp học thất bại:', error.message);
    Alert.alert('Lỗi', 'Không thể hủy đăng ký lớp học');
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