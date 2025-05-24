import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, OAUTH2_CONFIG } from './apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = async (userData) => {
  try {
    console.log('Bắt đầu đăng ký với dữ liệu:', userData);

    const userDataForApi = {
      username: userData.username,
      password: userData.password,
      password2: userData.password, // Backend yêu cầu xác nhận mật khẩu
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone || '',
      role: 'member', // Đảm bảo luôn tạo tài khoản member
      avatar: userData.avatar // Thêm trường avatar
    };

    console.log('Gửi yêu cầu đăng ký đến endpoint:', API_ENDPOINTS.register);
    const response = await apiClient.post(API_ENDPOINTS.register, userDataForApi);

    console.log('Đăng ký thành công, phản hồi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Đăng ký thất bại:', error);

    if (error.response) {
      if (error.response.status === 400 && error.response.data.username) {
        console.error('Tên đăng nhập đã tồn tại:', error.response.data.username);
        throw new Error('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      }

      console.error('Dữ liệu lỗi:', error.response.data);
      console.error('Mã trạng thái:', error.response.status);
    } else if (error.request) {
      console.error('Không nhận được phản hồi từ server:', error.request);
    } else {
      console.error('Lỗi thiết lập request:', error.message);
    }

    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
    const response = await apiClient.get(API_ENDPOINTS.profile);
    return response.data;
  } catch (error) {
    console.error('Lấy thông tin người dùng thất bại:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy endpoint hồ sơ người dùng.');
    }
    throw new Error('Lấy thông tin người dùng thất bại. Vui lòng thử lại.');
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'access_token',
      'userData',
      'isLoggedIn',
      'userRole',
      'auth_type',
    ]);
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    throw new Error('Đăng xuất thất bại. Vui lòng thử lại.');  
  }
};