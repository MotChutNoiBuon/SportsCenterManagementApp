import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';
import { apiClient } from './apiClient';

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.profile);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.profile, userData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    throw error;
  }
};

export const getCoachStats = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.users}stats/coach/`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê huấn luyện viên:', error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.users}stats/admin/`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê admin:', error);
    throw error;
  }
}; 