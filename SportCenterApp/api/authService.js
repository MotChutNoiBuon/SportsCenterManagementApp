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

// Hàm tạo instance API với token để gọi các endpoint yêu cầu xác thực
export const authApis = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

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
      role: 'member', // Đảm bảo luôn tạo tài khoản member
    };

    console.log('Gửi yêu cầu đăng ký đến endpoint:', API_ENDPOINTS.register);
    const response = await apiClient.post(API_ENDPOINTS.register, userDataForApi);
    
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
    // Sử dụng OAuth2 client credentials flow
    const loginData = {
      username: username,
      password: password,
      client_id: OAUTH2_CONFIG.client_id,
      client_secret: OAUTH2_CONFIG.client_secret,
      grant_type: OAUTH2_CONFIG.grant_type
    };

    console.log('Thực hiện đăng nhập với:', { username, client_id: OAUTH2_CONFIG.client_id });
    
    // Đổi content type thành form-data cho OAuth2
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.login}`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Đăng nhập thành công, nhận được token:', response.data);

    // Lấy thông tin người dùng 
    const userProfile = await getUserProfile(response.data.access);
    
    // Trả về thông tin người dùng kèm token
    return {
      ...userProfile,
      access: response.data.access,
      refresh: response.data.refresh
    };
  } catch (error) {
    console.error('Đăng nhập thất bại:', error.response?.data || error.message);
    throw error;
  }
};

// Lấy thông tin người dùng đã đăng nhập
export const getUserProfile = async (token = null) => {
  try {
    let api = apiClient;
    if (token) {
      api = authApis(token);
    }
    
    const response = await api.get(API_ENDPOINTS.profile);
    return response.data;
  } catch (error) {
    console.error('Lấy thông tin người dùng thất bại:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng xuất - Không cần thay đổi vì xử lý đăng xuất đã chuyển qua UserContext
export const logout = async () => {
  try {
    // Chỉ thực hiện xóa token, không cần thao tác với AsyncStorage vì UserContext sẽ xử lý
    return true;
  } catch (error) {
    console.error('Đăng xuất thất bại:', error.message);
    throw error;
  }
}; 