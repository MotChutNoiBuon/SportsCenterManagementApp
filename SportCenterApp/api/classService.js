import axios from 'axios';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';

// Lấy danh sách lớp học
export const getClasses = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await apiClient.get(`${API_ENDPOINTS.classes}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Lấy danh sách lớp học thất bại:', error.message);
    throw error;
  }
};

// Lấy chi tiết lớp học
export const getClassDetails = async (classId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.classes}${classId}/`);
    return response.data;
  } catch (error) {
    console.error('Lấy chi tiết lớp học thất bại:', error.message);
    throw error;
  }
};

// Đăng ký lớp học
export const enrollClass = async (classId) => {
  try {
    const response = await apiClient.post(`${API_ENDPOINTS.classes}${classId}/enroll/`);
    return response.data;
  } catch (error) {
    console.error('Đăng ký lớp học thất bại:', error.message);
    throw error;
  }
};

// Lấy danh sách lớp học đã đăng ký
export const getEnrollments = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.enrollments);
    return response.data;
  } catch (error) {
    console.error('Lấy danh sách đăng ký thất bại:', error.message);
    throw error;
  }
};

// Hủy đăng ký lớp học
export const cancelEnrollment = async (enrollmentId) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.enrollments}${enrollmentId}/`);
    return response.data;
  } catch (error) {
    console.error('Hủy đăng ký lớp học thất bại:', error.message);
    throw error;
  }
}; 