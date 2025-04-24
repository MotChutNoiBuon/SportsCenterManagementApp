// api/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, OAUTH2_CONFIG } from './apiConfig';

// Tạo một instance axios cho API
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý refresh token khi token hết hạn
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // Không có refresh token, buộc đăng nhập lại
          await AsyncStorage.removeItem('isLoggedIn');
          await AsyncStorage.removeItem('userRole');
          // Chuyển hướng về màn hình đăng nhập sẽ được xử lý ở App.js
          return Promise.reject(error);
        }
        
        // Thực hiện refresh token
        const response = await axios.post(`${API_BASE_URL}/o/token/`, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: OAUTH2_CONFIG.client_id,
          client_secret: OAUTH2_CONFIG.client_secret,
        });
        
        // Lưu token mới
        await AsyncStorage.setItem('access_token', response.data.access_token);
        await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại, xóa thông tin đăng nhập
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('isLoggedIn');
        await AsyncStorage.removeItem('userRole');
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
); 