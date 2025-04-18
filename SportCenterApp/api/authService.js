import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, OAUTH2_CONFIG } from './apiConfig';

// Tạo một instance axios cho API
const apiClient = axios.create({
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

// Đăng ký tài khoản mới
export const register = async (userData) => {
  try {
    // Đặt vai trò mặc định là 'member' cho khách hàng
    const userDataWithRole = {
      ...userData,
      role: 'member',
      // Map dữ liệu từ form đăng ký sang model Django
      username: userData.username,
      password: userData.password,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      full_name: `${userData.firstName} ${userData.lastName}`,
    };

    const response = await apiClient.post(API_ENDPOINTS.register, userDataWithRole);
    return response.data;
  } catch (error) {
    console.error('Đăng ký thất bại:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng nhập và lấy token
export const login = async (username, password) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('client_id', OAUTH2_CONFIG.client_id);
    formData.append('client_secret', OAUTH2_CONFIG.client_secret);
    formData.append('grant_type', OAUTH2_CONFIG.grant_type);

    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.login}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Lưu token vào AsyncStorage
    await AsyncStorage.setItem('access_token', response.data.access_token);
    await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
    await AsyncStorage.setItem('isLoggedIn', 'true');
    
    // Lấy thông tin người dùng và lưu vào AsyncStorage
    const userProfile = await getUserProfile();
    
    return userProfile;
  } catch (error) {
    console.error('Đăng nhập thất bại:', error.response?.data || error.message);
    throw error;
  }
};

// Lấy thông tin người dùng đã đăng nhập
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.profile);
    
    // Lưu thông tin người dùng vào AsyncStorage
    await AsyncStorage.setItem('userRole', response.data.role);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Lấy thông tin người dùng thất bại:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    // Xóa token và thông tin người dùng khỏi AsyncStorage
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userData');
    
    return true;
  } catch (error) {
    console.error('Đăng xuất thất bại:', error.message);
    throw error;
  }
}; 