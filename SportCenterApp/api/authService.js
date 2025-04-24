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
    console.log('Bắt đầu đăng ký với dữ liệu:', userData);
    
    // Đặt vai trò mặc định là 'member' cho khách hàng
    const userDataWithRole = {
      ...userData,
      role: 'member',
      // Map dữ liệu từ form đăng ký sang model API
      username: userData.username,
      password: userData.password,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      full_name: `${userData.firstName} ${userData.lastName}`,
    };

    // Thêm delay giả lập để dễ debug
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Gửi yêu cầu đăng ký đến endpoint:', API_ENDPOINTS.register);
    const response = await apiClient.post(API_ENDPOINTS.register, userDataWithRole);
    
    console.log('Đăng ký thành công, phản hồi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Đăng ký thất bại:', error);
    
    if (error.response) {
      // Server trả về response với error status
      console.error('Dữ liệu lỗi:', error.response.data);
      console.error('Mã trạng thái:', error.response.status);
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error('Không nhận được phản hồi từ server:', error.request);
    } else {
      // Lỗi thiết lập request
      console.error('Lỗi thiết lập request:', error.message);
    }
    
    // Xử lý đặc biệt cho trường hợp không kết nối được với server
    if (!error.response) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
    }
    
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