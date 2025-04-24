import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, OAUTH2_CONFIG } from './apiConfig';

// Tạo một instance axios cho API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thêm timeout 10 giây
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
    
    // Map dữ liệu từ form đăng ký sang model API
    const userDataForApi = {
      username: userData.username,
      password: userData.password,
      password2: userData.password, // Backend yêu cầu xác nhận mật khẩu
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone || '',
    };

    console.log('Gửi yêu cầu đăng ký đến endpoint:', API_ENDPOINTS.register);
    
    // Sử dụng promise với timeout để tránh treo vô thời hạn
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Yêu cầu đã hết thời gian, vui lòng thử lại sau.')), 15000);
    });
    
    const requestPromise = apiClient.post(API_ENDPOINTS.register, userDataForApi);
    
    // Lấy kết quả từ promise nào hoàn thành hoặc reject trước
    const response = await Promise.race([requestPromise, timeoutPromise]);
    
    console.log('Đăng ký thành công, phản hồi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Đăng ký thất bại:', error);
    
    // Kiểm tra timeout
    if (error.message && error.message.includes('timeout')) {
      throw new Error('Yêu cầu đã hết thời gian, vui lòng thử lại sau.');
    }
    
    // Kiểm tra nếu lỗi là timeout từ Promise.race
    if (error.message === 'Yêu cầu đã hết thời gian, vui lòng thử lại sau.') {
      throw error;
    }
    
    if (error.response) {
      // Server trả về response với error status
      console.error('Dữ liệu lỗi:', error.response.data);
      console.error('Mã trạng thái:', error.response.status);
      
      // Xử lý các mã lỗi cụ thể
      if (error.response.status === 400) {
        // Kiểm tra lỗi trùng username hoặc email
        if (error.response.data.username) {
          throw new Error('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.');
        }
        if (error.response.data.email) {
          throw new Error('Email đã được sử dụng. Vui lòng dùng email khác.');
        }
      } else if (error.response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      }
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error('Không nhận được phản hồi từ server:', error.request);
      throw new Error('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    
    // Lỗi không xác định khác
    throw error.message ? new Error(error.message) : new Error('Đăng ký không thành công. Vui lòng thử lại sau.');
  }
};

// Đăng nhập và lấy token
export const login = async (username, password) => {
  try {
    const loginData = {
      username: username,
      password: password
    };

    const response = await apiClient.post(API_ENDPOINTS.login, loginData);

    console.log('Đăng nhập thành công, nhận được token:', response.data);

    // Lưu token vào AsyncStorage
    await AsyncStorage.setItem('access_token', response.data.access);
    await AsyncStorage.setItem('refresh_token', response.data.refresh);
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
    await AsyncStorage.setItem('userRole', response.data.role || 'member');
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